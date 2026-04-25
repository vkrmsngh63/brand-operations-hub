# CORRECTIONS LOG
## Append-only record of mistakes made during chats and lessons learned

**Started:** April 16, 2026
**Last updated:** April 25, 2026 (Phase 1g-test follow-up Part 3 — Pivot Session D — 1 new entry: medium-severity consolidated entry covering 5 mid-session bugs surfaced by live testing of the new V3 wiring layer (root-topic relationship validation drift; Prisma-6 P2025 on loose upsert where shape; global-PK collision band-aided via global autoheal; missing-CanvasState synthesis; BATCH_REVIEW newTopics not populated). All 5 caught + fixed in-session via flag-then-fix-then-test cycles; live-site never showed user-visible symptoms beyond the test runs; structural keyword-preservation property of the V3 design held throughout. Two architectural lessons named (interface-drift between applier and prompt; global-PK design needs schema migration for proper fix))
**Last updated in session:** session_2026-04-25_phase1g-test-followup-part3-pivot-session-D (Claude Code)
**Previously updated in session:** session_2026-04-25_phase1g-test-followup-part3-pivot-session-B (Claude Code)
**Previously updated in session:** session_2026-04-25_phase1g-test-followup-part3-pivot-session-A (Claude Code)
**Previously updated in session (earlier):** session_2026-04-25_phase1g-test-followup-part3-session3b-verify (Claude Code)
**Previously updated in session (earlier):** session_2026-04-25_phase1g-test-followup-part3-session3b (Claude Code)
**Previously updated in session (earlier):** session_2026-04-24_phase1g-test-followup-part3-session3a (Claude Code)
**Previously updated in session (earlier):** session_2026-04-24_phase1g-test-followup-part3-session2b (Claude Code)
**Previously updated in session (earlier):** session_2026-04-24_phase1g-test-followup-part3-session2 (Claude Code)
**Previously updated in session (earlier):** session_2026-04-20_phase1g-test-followup-part3 (Claude Code)
**Previously updated in session (earlier):** session_2026-04-19_phase1g-test-followup-part2 (Claude Code)
**Previously updated (claude.ai era):** https://claude.ai/chat/75cc8985-b70a-49f4-8b64-444c34ef541f

**Purpose:** Every mistake made in any chat — whether Claude or user catches it — gets appended. Future Claudes read this to avoid repeating. This is how institutional memory survives Claude's lack of memory.

**Rules:**
- APPEND-ONLY. Never edit or delete past entries.
- Every mistake gets an entry regardless of severity.
- Each entry identifies root cause, not just symptom.
- Each entry includes Prevention describing what was added to prevent recurrence.

---

## Entry format

```
### [YYYY-MM-DD] — [Short mistake description]
**Chat URL:** https://claude.ai/chat/[uuid]
**Tool/Phase affected:** [Name]
**Severity:** Low / Medium / High / Critical

**What happened:** [Description]
**Root cause:** [Why it happened]
**How caught:** [User / Claude / Downstream problem]
**Correction:** [What was changed to fix]
**Prevention:** [What was added to prevent recurrence]
```

---

## Entries

### 2026-04-25 — Five mid-session V3 wiring bugs surfaced by live testing (medium severity consolidated; all caught + fixed in-session via flag-then-fix-then-test cycles)
**Session:** session_2026-04-25_phase1g-test-followup-part3-pivot-session-D (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Pivot Session D / V3 wiring layer + production routes
**Severity:** Medium (live testing surfaced real production bugs in code we had just shipped; all 5 corrected in-session before any user-facing failure beyond the test runs themselves; ~$1.20 in API spend lost to test runs that hit each bug; structural keyword-preservation property of the V3 design held throughout)

**What happened:** Pivot Session D's main wiring commit (`ac4de31`) shipped a new `src/lib/auto-analyze-v3.ts` module + integrated it into `AutoAnalyze.tsx` with a V3/V2 toggle. Build passed; 71 unit tests passed. Director then ran live tests on Bursitis. Five distinct bugs surfaced in succession; each was caught from the Activity Log, diagnosed, fixed, re-tested, and the fix shipped. All 5 fit a single pattern: the new code was correct in isolation but exposed pre-existing latent issues OR drifted from contract assumptions made elsewhere.

The five bugs in order (with the fix commit hash):

1. **Applier rejected ADD_TOPIC root topics with `relationship: null`** (`c3d2a80`). Test 1 first batch failed atomically with `op #0 ADD_TOPIC: relationship must be "linear" or "nested"`. PIVOT_DESIGN.md §1.1 + AUTO_ANALYZE_PROMPT_V3.md said relationship is "ignored for root" but `applyAddTopic` validated unconditionally before checking parent. The applier already nulled the field for root topics at apply time; the upfront validation was just wrong. Fix: skip validation when `parent === null`; widened `AddTopicOp.relationship` type to `Relationship | null`; parser passes through whatever the model emitted. Three regression tests added.

2. **Prisma 6 P2025 "Record not found" on every `prisma.canvasNode.upsert`** (`6b70913`). Test 2 hit this on every batch's atomic rebuild. The route used `where: { id, projectWorkflowId }` — a loose shape Prisma 6 no longer accepts as a `WhereUniqueInput` because `(id, projectWorkflowId)` is not a registered unique key. CanvasNode's only registered uniques are `id @id` (global) and `@@unique([projectWorkflowId, stableId])` (per-project, added by Pivot Session B). Switched the upsert's where to `projectWorkflowId_stableId`. Backward-compatible — V2 callers don't send stableId; route falls back to `t-${n.id}` convention.

3. **Global-PK collision: `CanvasNode.id` is `Int @id` (one integer space across all projects) but app treats it as project-scoped via per-project `nextNodeId` counter** (`43f773f`). The previous fix surfaced the deeper issue: "Unique constraint failed on the fields: (`id`)". Test project's stored `nextNodeId=1` → V3 issued ids 1–8 → collision with Bursitis's id 1–104. The `/canvas` GET autoheal previously consulted only the per-project max id, unaware that other projects had taken those ids. Switched the autoheal aggregates from per-project to global so the returned counter is past every existing id in the DB. Latent bug remains in `/canvas/nodes` POST (reads `nextNodeId` from DB directly, bypassing GET autoheal); deferred to ROADMAP — proper fix is schema migration to composite PK or autoincrement.

4. **Synthesized-CanvasState defaults missing for projects with no `CanvasState` row** (`d485cf9`). The previous fix only kicked in when the row existed. Test project never had Auto-Analyze run on it before → no row → autoheal returned `canvasState: null` → client fell back to `nextNodeId=1` → re-collision. Synthesize a minimal CanvasState with global-max-aware counters when the row doesn't exist (in-memory only; no DB write added).

5. **BATCH_REVIEW screen always showed "Topics: None" for V3** (`d624556`). Cosmetic but real — when reviewMode is on, the user can't make an informed apply/skip decision without seeing what's about to land. `processBatchV3` returned `newTopics: []` regardless. Populate from parsed ADD_TOPIC operations after validation succeeds.

**Root cause (general):** New code shipping into a complex system surfaces pre-existing latent issues. The unit tests for `auto-analyze-v3.ts` covered the wiring layer in isolation (TSV serialization, JSONL parsing, applier-state translation, materializer integer-id assignment) and 71 tests passed before the first commit. But three classes of real-world failure were invisible to the unit suite:

- **Contract drift between layers** (bug #1) — the applier and the V3 prompt both came from PIVOT_DESIGN.md but were written in different sessions; the relationship-validation discrepancy was not caught because the applier's tests always supplied a non-null relationship and the prompt says one thing while the applier expected another.
- **Prisma 6 behavior change** (bug #2) — pre-existing route code worked under earlier Prisma versions but P2025s under 6's stricter WhereUniqueInput handling. This was invisible until the rebuild route was actually called by V3 against a real project (the V2 path on Bursitis happened to not trigger this code path frequently because most V2 batches updated existing-by-title nodes whose ids already existed, so the upsert behaved like a pure update).
- **Pre-existing schema design issue** (bugs #3 + #4) — `CanvasNode.id` being `Int @id` (global) was a long-standing bug that didn't bite until a project with no canvas history tried to issue new ids that collided with another project's range. V2 worked on Bursitis because Bursitis itself owns the highest existing id range, so its `nextNodeId` is always past every other project's ids by accident.

**How caught:** All 5 caught from the Activity Log during live director testing on Bursitis. The diagnostic enrichment commit (`1c44238`) — adding the underlying Prisma error message to the rebuild route's 500 response as a `detail` field — was critical for catching #2/#3/#4 since the director can't read Vercel server logs.

**Correction:** Five sequential commits over the session, each fixing one bug + adding regression tests where applicable; combined with the diagnostic enrichment commit, total 6 fix commits + the main wiring commit = 7 commits pushed in-session. Build clean throughout. Tests grew from 71 to 74 (3 regression tests added for bug #1).

**Prevention:**

1. **Audit cross-layer contracts before shipping new wiring**, not just within a single layer's unit tests. When two layers share a contract (the applier's vocabulary + the V3 prompt's vocabulary, both from PIVOT_DESIGN.md), build at least one E2E test that goes prompt → parse → apply, exercising every operation type with realistic AI-emitted shapes (including the edge case where the model emits a field as null because the prompt says it's "ignored").

2. **For new code that calls into pre-existing routes that haven't been exercised by the new code path before**, add a diagnostic enrichment to those routes BEFORE shipping, not after the first failure. The diagnostic enrichment commit (`1c44238`) saved hours of guessing on bugs #3 + #4. Generalizing: any new caller of an existing route that does work in production should bring an "if 500, return the underlying error in `detail`" patch with it as a one-line safety net.

3. **For pre-existing latent design issues like global-PK collisions**, surfacing them via a band-aid (the global autoheal) is appropriate to unblock the immediate session, but the proper fix (schema migration) must be captured as a TODO with an explicit destination. Captured in ROADMAP Infrastructure TODOs as part of this session's Rule-14e sweep.

**Architectural pattern named (procedural, generalizable):** "new code surfaces old bugs — diagnostic enrichment is cheap insurance." Whenever new code wires into pre-existing routes that the new code path will exercise differently, ship the diagnostic enrichment alongside the new code, not after the first failure. The cost of a 500-response detail field is one extra commit and zero runtime impact; the benefit is converting hours of remote-debugging guessing into minutes of "here's the actual error."

**Rule compliance during the surfacing:**
- Rule 7 (acknowledge slips openly, don't minimize) — all 5 framed as "real bugs we shipped, here's what's wrong, here's the fix" rather than minimized as edge cases.
- Rule 8 (destructive op gate) — N/A; no DB schema changes were involved in the fixes (the global autoheal is a read-only behaviour change).
- Rule 9 (deploy gate) — observed for every push (7 explicit Rule-9 approvals in-session).
- Rule 14a/14b (plain language + per-option context + recommendation) on every option presented.
- Rule 14e (deferred items captured) — 3 cosmetic/architectural follow-up items captured in ROADMAP Infrastructure TODOs (label drift, global-PK design, cancel-state cleanup).
- Rule 16 (context degradation) — Claude proactively flagged at ~2.5 hours into session and recommended end-of-session over more batches; director picked end-of-session.

### 2026-04-25 — Shipped a NOT NULL DB constraint to production before checking existing callers (medium severity, Rule-16 zoom-out miss; corrected mid-session via in-session patch)
**Session:** session_2026-04-25_phase1g-test-followup-part3-pivot-session-B (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Pivot Session B / live database schema
**Severity:** Medium (live production exposure introduced and held for under 5 minutes; corrected in the same session before any user-facing failure)

**What happened:** Pivot Session B's 3-step migration plan called for Step 3 to tighten `stableId` from nullable to NOT NULL + add a unique index. Claude proposed the Step 3 push to the director with a Rule-8 STOP gate as designed. Director approved. After the push succeeded, Claude ran `npx tsc --noEmit` and discovered that two pre-existing production routes (`src/app/api/projects/[projectId]/canvas/nodes/route.ts` POST + `src/app/api/projects/[projectId]/canvas/rebuild/route.ts` upsert's create branch) call `prisma.canvasNode.create({ data: {...} })` without supplying `stableId`. With the NOT NULL constraint live, the next manual canvas-node creation OR the next Auto-Analyze run would fail at runtime with `null value in column "stableId" violates not-null constraint`. Production exposure was real even though no user-facing failure was triggered (no one happened to be using the site between the push and the patch).

**Root cause:** Claude treated Step 3's "tighten the constraint" plan as a self-contained step whose risk model was "is the data clean enough to add the constraint?" The pre-flight verification (104 rows / 0 nulls / 0 duplicates) answered that question correctly, and Step 3 shipped. But the migration plan's blast radius wasn't just the *current* data — it was *every future write*. Existing production callers that didn't supply `stableId` would hit the constraint, and Pivot Session D's design assumed those callers would be updated alongside the wiring. Claude failed to ask, before Step 3, *"who else writes to this column today and will they all keep working with this constraint?"* That's a Rule-16 zoom-out question — not a Rule-8 destructive-op question.

**How caught:** Claude itself, immediately after the Step 3 push, when running `npx tsc --noEmit` to verify the new operation-applier file. TypeScript flagged the missing-stableId errors on the two existing production routes. Claude surfaced the issue to the director within the same response that ran the type-check, including: (a) the explicit acknowledgment that "this is on me — I shipped the Step 3 NOT NULL constraint before the production code was wired," (b) the concrete two-route patch proposal (Option A — add `stableId: \`t-${id}\`` to each create call, ~3 lines per file), (c) the alternative rollback option (Option B — restore the constraint to nullable until Pivot Session D wires properly), (d) plain-language framing of the runtime exposure ("the live site is currently fine — but the next time anyone creates a node OR Auto-Analyze runs, the database will reject it"). Director picked Option A; patch shipped in the same session before the end-of-session push approval gate; production safety restored.

**Correction:** Two route patches landed in the same commit:
- `src/app/api/projects/[projectId]/canvas/nodes/route.ts` line 60 area: added `stableId: \`t-${nodeId}\`` adjacent to the existing `id: nodeId` field.
- `src/app/api/projects/[projectId]/canvas/rebuild/route.ts` line 113 area: added `stableId: \`t-${n.id}\`` adjacent to the existing `id: n.id` field.

Both patches use the exact same convention as the backfill script — `stableId = "t-" + id` — so all rows (existing + future) follow one rule. `npm run build` clean post-patch (17/17 pages, zero TypeScript errors).

**Prevention:** When proposing any DB constraint change that *narrows* what's accepted (NOT NULL, unique, foreign key, check), run the explicit Rule-16 zoom-out before the push gate: *"Who else writes to this column today and will they all keep working under the narrower constraint? List the call sites; verify each one supplies a value compatible with the constraint."* If any caller doesn't, the choice is (a) patch the callers in the same session before tightening, OR (b) defer tightening until those callers are wired by their respective sessions, OR (c) explicitly accept the in-session-patch path as a planned scope-expansion. The mistake to avoid is shipping the constraint *first* and discovering caller breakage *after*.

This is a generalization of the existing Rule 8 (STOP before destructive ops) — adding one row to its mental checklist: **"a constraint-narrowing migration is destructive in the future tense — it doesn't lose existing data but it can break future writes from any pre-existing caller. Audit the writers before pushing."**

**Architectural pattern named (procedural, generalizable):** "schema constraints have callers, not just data — audit both before tightening." Applies to any future DB migration that narrows what writes are accepted. The current data passing pre-flight verification is *necessary* but not *sufficient* for safety; existing call sites must also be checked.

**Rule compliance during the surfacing:**
- Rule 7 (acknowledge slips openly, don't minimize) — Claude's text opened with *"I need to flag a Rule 13/16 zoom-out concern"* and *"This is on me. I shipped the Step 3 NOT NULL constraint before the production code was wired to supply stableId. I considered this an in-scope risk but didn't proactively flag it before the push. That's a Rule 16 zoom-out miss."* No deflection.
- Rule 8 (destructive-op confirmation) — observed for both Step-1 and Step-3 pushes via explicit "what this command will do / reversibility / your options" framing.
- Rule 14a + 14b (plain language + per-option context + recommendation) — the issue framing distinguished "currently fine" from "next time anyone creates a node would fail," and presented two options (A patch / B rollback) with reasoning and reversibility for each, plus the escape-hatch option.
- Rule 16 (zoom in / zoom out) — the *miss* is the whole entry; the *correction path* honored the rule by proactively flagging before the next destructive step (would have been the end-of-session push).

### 2026-04-25 — Jumped into pivot vocabulary mechanics without anchoring to root-cause failures (low severity, communication slip)
**Session:** session_2026-04-25_phase1g-test-followup-part3-pivot-session-A (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Pivot Session A
**Severity:** Low (process / communication; corrected mid-session; no production impact)

**What happened:** Pivot Session A's purpose is to lock the design that fixes four named root-cause failures (keywords drop during batch application; keywords correctly placed in earlier batches get silently removed; cost per batch has skyrocketed; time per batch has gone up significantly). When Claude presented Q1-Q4 design choices for the operation vocabulary (vocabulary completeness; atomic batch apply; ARCHIVE_KEYWORD vs Irrelevant Keywords floating topic; JUSTIFY_RESTRUCTURE timing), Claude framed each as a mechanics-with-recommendation question — explained the trade-offs and gave a recommendation — but did NOT anchor each choice back to which specific failure mode it prevents. Director correctly pushed back: *"Also, you didn't even address the reasons for the pivot... The goal now is to address the fundamental flaws in our approach and fix them."*

**Root cause:** Treated the design questions as discrete mechanics decisions rather than as the answers-to-the-failure-modes that the entire pivot exists to deliver. The result was that the director's product judgment was invited at the level of "do you prefer this or that" rather than at the level of "does this design choice actually fix the failure mode it claims to address." Lower-resolution decision input.

**How caught:** Director, mid-session, after seeing Q1-Q4 framing land without failure-mode anchoring.

**Correction:** Claude redid the analysis with explicit failure-mode mapping: Q1 vocabulary completeness → keyword drop class + silent overwrite class; Q2 atomic apply → ghost-state-from-half-applied-batches class; Q3 ARCHIVE_KEYWORD → homograph-keyword-drop class (Turkish-Bursa); Q4 JUSTIFY_RESTRUCTURE → silent-overwrite-of-correctly-placed-work class. Cost/time impact made concrete: $1.89 / 26 minutes for the Bursitis verification batch → expected $0.03–0.10 / under 1 minute under the operations-only output contract; cost stops scaling with canvas size. Director then accepted Q1-Q4 (with Q4 sharper than Claude's recommendation — Q4 carries from day one, not deferred). Subsequent question clusters (Q5-Q11 on stable-ID format and DB migration) were less load-bearing on root-cause framing, so the same correction was carried forward implicitly without re-stating.

**Prevention:** When locking architectural decisions, lead with the failure-mode-to-design-mechanism mapping, not bury it after-the-fact. For every design choice in an architectural-pivot session, the question to the director should be shaped as *"Failure F is one of the things this pivot exists to fix. Design choice X addresses F by mechanism M. Does mechanism M look right to you?"* — not as *"here's a design choice; here are options A/B/C; my recommendation is A; what do you pick?"* The latter framing is correct for low-stakes implementation choices where mechanics genuinely is the question; the former is correct for architectural-decision sessions where the WHY of every design choice is load-bearing.

**Architectural pattern named (procedural, generalisable):** "Lead with the failure-mode-to-mechanism mapping in architectural-decision sessions." Distinguish architectural-decision sessions (where every choice should map to the named failure modes) from implementation-decision sessions (where mechanics framing is fine). The marker for an architectural-decision session is a high-severity insight in `CORRECTIONS_LOG.md` that motivates the session, plus an explicit list of failure modes the work is supposed to address. When those exist, framing matters more than usual.

**Rule compliance during the surfacing:**
- Rule 7 (acknowledge slips openly, don't minimize) — Claude opened the next response with *"You're right — that was a slip and I'll own it."* and then re-did the analysis. No deflection.
- Rule 16 (zoom in / zoom out on every significant decision) — director's pushback was the zoom-out signal. Going forward: in architectural-decision sessions, the failure-mode-to-mechanism mapping IS the zoom-out — it's not optional decoration.

### 2026-04-25 — Architectural insight (high severity): AI being used as state-rebuilder when it should be state-mutator; recent fixes are band-aids not root-cause work; recommended pivot supersedes Sessions 4-6
**Session:** session_2026-04-25_phase1g-test-followup-part3-session3b-verify (Claude Code) — surfaced post-verification during wrap-up
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze — full Phase 1g-test follow-up trajectory
**Severity:** High (architectural; affects roadmap planning across multiple sessions)

**What happened:** During end-of-session wrap-up, after completing the Session 3b verification with its $1.890-per-batch cost data point and 26-minute wall-clock for a 4-keyword batch, the director pushed back on the trajectory: *"Something doesn't make sense. Why did the cost and time sky rocket like this compared to how the system was setup previously. We have been progressively fixing things and they are getting worse. I want you to think about what is fundamentally wrong here. Why are keywords being removed from topics that they belong in? Why are responses using so many tokens and increasing cost? Why is it taking so long to process a small batch?"* This forced an honest re-examination of the architecture that prior sessions had been progressively patching without naming the root cause.

**Root cause (single architectural mismatch — surfaced this session, not introduced this session):** The Auto-Analyze prompts ask the AI to **rebuild and re-emit the entire topics layout table** on every batch, not to issue change operations against an existing table. Specifically: the Initial Prompt instructs the AI to *"provide the complete updated Integrated Topics Layout Table as your final output for this batch"* with all existing rows preserved plus any new rows. The Primer Prompt's RULES AND CONSTRAINTS rule 3 reinforces this: *"Never delete existing topics or keywords — only add new ones or add keywords to existing topics."* The AI is being used as a **state-rebuilder** (input: full state; output: complete new state) rather than a **state-mutator** (input: full state; output: list of operations to apply to the state).

**The mismatch is the root cause of all three observed symptoms:**

1. **Keywords get removed from topics they belong in.** The AI isn't actively "removing" keywords. It's failing to *re-emit* them as it rewrites the table from scratch. When asked to type out a 100+-row TSV with rich descriptions while also analyzing 4 new keywords AND running the reevaluation pass, attention dilutes. Pre-existing rows get omitted; keyword strings get slightly altered (whitespace, case, smart quotes) and fail post-hoc text matching; topics get renamed in ways the diff detector reads as "new topic + missing old topic." The 74 Reshuffled keywords on the Session 3b verification batch are exactly this failure mode. Bursitis P3-F7's 58/74 split is the observable shadow of this single root cause.

2. **Output tokens (and therefore cost) scale with the canvas size, not with the batch size.** Verification batch numbers: 110,245 output tokens for 4 new keywords = ~27,500 output tokens per new keyword. The bulk of those tokens is redundant re-emission of the existing 95-node table (rich descriptions + alternate titles + keyword lists + topic descriptions). The 4 actually-new keywords contribute only ~3-5k tokens of genuinely new content; the other ~105k tokens are restated context that the AI has been re-typing every batch since the canvas was small. **Cost-per-batch grows linearly with canvas size, not with batch size.** A 4-keyword batch on a fresh canvas would cost cents. A 4-keyword batch on a 95-node canvas costs $1.89. A 4-keyword batch on a 200-node canvas would cost ~$4. A batch on a 500-node canvas eventually hits the model's max output token limit and the run breaks entirely.

3. **Wall-clock time is bottlenecked by output token generation rate.** Sonnet 4.6 generates output at ~50-80 tokens/sec. 110,245 tokens / 60 tokens/sec ≈ 30 minutes (verified: 26 min for the verification batch). The API isn't slow; we're asking for a huge output. If the output were 1,000 tokens (operations only), the same batch would finish in 20-30 seconds. Same model, same input.

**Why this wasn't visible earlier in the project's life:** Smaller canvases (early Bursitis batches, the original HTML-tool runs) had small re-emitted tables, so the per-batch cost/time was tolerable and the keyword-loss rate was low enough that ghosts weren't conspicuous. The architecture has had this scaling property since the beginning — it's now visible because (a) the canvas has grown over 51+ batches across multiple sessions to 95+ nodes; (b) Session 3a's cost-tracker fix made cost numbers honest by including failed-attempt costs; (c) Session 3b's reconciliation pass made keyword loss visible by surfacing ghosts as "Reshuffled" status instead of leaving them silently broken. **The fixes weren't regressions — they were x-rays. The scaling problem was there all along.**

**Why recent fixes are band-aids on this root cause, not solutions:**

- **Reconciliation pass + Reshuffled status (Session 3b)** — exists because the AI's full-table-rewrite output contract permits keyword loss. The pass surfaces losses for review; it does not prevent them.
- **Salvage-ignored-keywords mechanism (Session 3b)** — exists because validation can detect missing batch keywords post-response and we want to retry without redoing the whole batch. It's a recovery path; the underlying loss is the architecture's fault.
- **Mode A → Mode B reactive switch (Phase 1g-test follow-up)** — exists because Mode A's full-table re-emission becomes unstable at scale. It's a fallback to a less-comprehensive mode that introduces its own quality regressions.
- **HC4 / HC5 / proposed HC6 validation checks** — exist to detect output corruption. They detect; they don't prevent.
- **Stable topic IDs (Session 5 as currently planned)** — exists because rename detection in a full-table-rewrite is a string-matching mess. Operation-based output makes RENAME explicit; the string-matching layer becomes unnecessary.
- **Changes Ledger (Session 4 as currently planned)** — exists because it's hard to audit what the AI changed when the output is a full table rewrite. Operation-based output IS a Changes Ledger; the AI's response is the audit log.

Each band-aid adds maintenance burden and code complexity without addressing the root cause. The complexity stack is itself a signal of architectural mismatch.

**Recommended architectural pivot — the actual fix:** Change the AI's output contract from "complete updated TSV table" to "list of operations against the existing table." Operation vocabulary (initial draft, expandable):

- `ADD_TOPIC id=<new-stable-id> title=... parent=<id> relationship=linear|nested depth=<N> description=...`
- `RENAME_TOPIC id=<id> from=<old-title> to=<new-title>`
- `MOVE_TOPIC id=<id> new_parent=<id> new_relationship=...`
- `MERGE_TOPICS source_id=<id> target_id=<id> reconciled_description=...`
- `SPLIT_TOPIC source_id=<id> into=[<new-id-1>, <new-id-2>] keyword_assignments={...}`
- `DELETE_TOPIC id=<id> reason=... reassign_keywords_to=<id>`
- `ADD_KEYWORD topic=<id> keyword=<exact-text> placement=primary|secondary`
- `MOVE_KEYWORD keyword=<exact-text> from=<id> to=<id> placement=primary|secondary`
- `REMOVE_KEYWORD keyword=<exact-text> from=<id>` *(only valid if keyword has another placement; otherwise must use DELETE_TOPIC reassign_keywords_to)*
- `ADD_SISTER_LINK topic_a=<id> topic_b=<id>` / `REMOVE_SISTER_LINK ...`

The tool — deterministic code, not the AI — applies these operations to the existing canvas. Validation runs on the **applied result**, not on the AI's output (since the output is just a list of intentions).

**Direct consequences of the pivot:**

- Output drops from 100,000+ tokens to under 1,000 for a small batch. Cost drops 99%+. Wall-clock drops to well under a minute. (The big input — the existing canvas as context — stays similar; prompt caching can amortize that further.)
- Keywords cannot silently disappear. The AI literally cannot drop a keyword without explicit `MOVE_KEYWORD`, `DELETE_TOPIC`, or `REMOVE_KEYWORD` operations. Anything not mentioned in the operation list stays exactly where it was.
- Reconciliation pass / Reshuffled status / salvage mechanism become vestigial. They keep working but their failure-mode-coverage drops near zero in normal operation. Long-term they can be deprecated.
- Stable topic IDs become a hard prerequisite (operations need to refer to topics by stable identifier, not title-string match). Session 5's stable-ID work is promoted into the pivot, not deferred behind it.
- Changes Ledger (Session 4) becomes ~80% subsumed — the operation list IS a Changes Ledger entry. Session 4 narrows to "Changes Ledger UI: filter, sort, admin actions on operations the AI already structured for us."
- Validation rewrites: instead of "diff the AI's emitted table against the existing one," it becomes "validate the operation set is internally consistent (no orphan moves, no duplicate adds, all referenced IDs exist) and the post-application state passes invariants (no unlinked keywords, all topics have valid parents, etc.)."
- Reevaluation pass becomes the AI's prerogative to issue MERGE / SPLIT / RENAME / MOVE_TOPIC operations — same architectural primitives as additions, just for restructuring.
- Mode A / Mode B distinction simplifies — the input still differs but the output contract is now uniformly "operations only." Mode B's delta-format becomes Mode A's format.
- The Initial Prompt and Primer Prompt both need substantial rewrites. The reevaluation triggers and topic-naming guidance survive; the table-emission instructions and the never-delete rule get replaced with operation-emission instructions and explicit deletion-via-DELETE_TOPIC rules.

**Estimated cost of the pivot:** Multi-session work — design (~1 session) + stable-ID migration (~1 session) + applier code + prompt rewrite + validation rewrite + Changes Ledger UI rescope. Net duration probably 4-6 sessions across 2-3 weeks of effort, vs. Sessions 4-6 + Phase-1 polish items as currently scoped which would be ~6-9 sessions of patching.

**Decision direction:** Director chose Option 2 — capture the insight AND restructure the ROADMAP — at end of Session 3b verification. ROADMAP gets a new top-priority "Architectural pivot" section; Sessions 4-6 get re-scoped with notes that they're contingent on the pivot. Decision on whether to actually start the pivot vs. continue with the existing roadmap is reserved for next session — the director may want to think on it overnight.

**How caught:** Director, at end of session, comparing Session 3b verification's cost/time numbers against memory of how the system performed earlier and observing that progressive "fixes" hadn't yielded better results. Direct quote: *"We have been progressively fixing things and they are getting worse."* This is exactly the kind of zoom-out check that Rule 16 demands.

**What was previously surfaced but not connected to this root cause:**

- Session 1 (Phase 1g-test follow-up Part 3, 2026-04-20) noted "Mode B can modify topics Mode A created, masking Mode A's quality" (P3-F1) and "Mode A quietly reshuffling topics under the hood" (P3-F2). Both are downstream symptoms of the AI re-emitting the full table.
- Session 2 (2026-04-24) diagnosed P3-F7 as TWO-WAY sync drift between `Keyword.sortingStatus` and `CanvasNode.linkedKwIds`. The drift is real, but the deeper question — "why is the AI dropping prior placements at all?" — wasn't traced back to the architecture.
- Session 3b end-of-session captured a new ROADMAP item "P3-F7 root-cause audit" listing four sub-items (HC5 audit, canvas-rebuild text-match audit, HC6 no-keyword-unlinks check, Bursitis 49-ghost spot-audit). Each of those sub-items would be partial mitigation; none of them address the architectural mismatch. With the pivot, three of the four become unnecessary (the spot-audit retains historical value as forensic data on what the legacy ghost set contained).

**Architectural pattern named:** "AI as state-mutator (operations) vs. AI as state-rebuilder (full re-emission)." Generalizable. Any LLM-driven workflow where the LLM is asked to maintain state across iterations should default to operation-based output. Re-emission scales O(state) not O(change); operations scale O(change). The latter is correct for long-lived state. This pattern applies to any future PLOS workflow where AI maintains a structured artifact across batches (Workflow 2 Competition Scraping likely; Workflow 3 Therapeutic Strategy probably; many others).

**Correction:** ROADMAP restructured with new top-priority "Architectural pivot" section ahead of Sessions 4-6. Sessions 4-6 re-scoped with contingency notes. KEYWORD_CLUSTERING_ACTIVE.md POST-VERIFICATION block extended with the architectural-insight subsection. Decision to actually execute the pivot is reserved for next session.

**Prevention:** Going forward, when adding any new mitigation/safety-net/recovery code to a tool, run a Rule-16 zoom-out check explicitly: *"Is this code making symptoms visible OR preventing the failure mode? If only making visible, what is the architectural change that would prevent the failure mode? Have we considered the architectural change?"* If the answer to the third question is "no" or "we keep deferring it," that's a flag to surface it to the director rather than ship the next band-aid. The reflex *"let me just add one more safety net"* is a warning sign about accumulated architectural debt.

**Rule compliance during the surfacing:**
- Rule 7 (acknowledge slips openly) — Claude acknowledged that recent docs hadn't named this root cause despite the symptoms being clear.
- Rule 14 (expert-consultant persona, plain-language recommendations with reasoning + reversibility) — analysis was framed in plain language, with concrete operation vocabulary, with the trade-offs (multi-session pivot vs. continued patching).
- Rule 16 (zoom in / zoom out on every significant decision) — director's pushback was the zoom-out signal that triggered the entire re-examination. Going forward: treat the director's "this doesn't make sense, what's fundamentally wrong" as the highest-priority zoom-out trigger to honor immediately, not after the band-aid ships.
- Rule 13 (proactive context-degradation warning) — wrap-up was already in progress when the question landed; Claude proposed two options (just capture vs. capture + restructure) rather than unilaterally pushing into restructure work at end-of-session. Director chose restructure; Claude is honoring lucidity by writing carefully but not over-engineering.

### 2026-04-25 — Session 3b verification: code deployed + reconciliation pass reproduced exact P3-F7 ghost set on first live batch (informational, MAJOR finding) + planning miss on visual-verification-on-populated-canvas (low severity)
**Session:** session_2026-04-25_phase1g-test-followup-part3-session3b-verify (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Phase 1g-test follow-up Part 3 verification
**Severity:** Informational (verification finding) + Low (planning miss)

**What happened — verification finding:** Director approved Rule-9 deploy gate; pushed three commits (`8afcb9f` Session-3a doc updates + `6c09e50` Session-3b code + `aa7eb4b` Session-3b doc updates) to origin/main; Vercel redeployed; vklf.com confirmed live. Tier-1 verification (5 quick UI checks) all passed: Opus 4.7 in dropdown, "Unsorted + Reshuffled" scope label, settings persistence across panel close/reopen and hard refresh, Removed Terms "Source" column, manual remove → soft-archive with "Manual" badge. Tier-2 engine verification: ran one Sonnet 4.6 classic-mode batch on Bursitis (95 existing nodes, batch size 4, ~67k input tokens, ~110k output tokens, 26 minutes wall-clock, $1.890 cost). On apply, the activity log confirmed: `Layout pass complete (104 nodes positioned)`, `Canvas rebuilt atomically (104 nodes, 0 removed)`, then 74 individual `↻ Reconcile: "<keyword>" was AI-Sorted, no longer on canvas → Reshuffled` lines, then `↻ Reconciliation: 58 on-canvas → AI-Sorted, 74 off-canvas → Reshuffled`. **The 58/74 split is identical to Session 2's direct-DB-query diagnosis** of Bursitis P3-F7 (58 silent placements + 74 ghost AI-Sorted). The reconciliation pass surfaced the entire pre-existing ghost set on its very first run.

**Why this finding matters:**
- Validates Session 3b code is working correctly (not a coincidence — exact-match numbers).
- Validates the Session 2 architectural diagnosis was correct (those ghosts genuinely existed in the DB before Session 3b shipped).
- Provides forensic data for the Session 3b–captured "P3-F7 root-cause audit" ROADMAP item: the 74 keyword texts + UUIDs in the activity log are the exact set the audit will work through. Many are foundational ("hip bursitis", "bursitis pain", "what is hip bursitis", "trochanteric bursitis", "is bursitis curable", "hip pain bursitis", "tendonitis vs bursitis", etc.) — confirming P3-F1/P3-F2 fingerprint that classic mode silently reshuffles significant prior work.

**What happened — planning miss (low severity):** Recommended classic-mode batch on Bursitis's 95-node canvas as the primary engine-verification path WITHOUT preemptively flagging that visual verification of canvas-layout output would be ambiguous on a heavily-populated canvas. Director caught it post-cancel: *"The canvas already had a lot of information before and I can't tell if anything is broken. Maybe we should have or should do a test on a blank canvas next time."*

**Root cause of planning miss:** Optimized for "test the engine on real data" without zooming out to ask "what would the test result look like, and how would I tell pass-from-fail visually?" Pass-fail criteria for the canvas-layout engine include "nodes don't overlap," "descriptions fit inside boxes," "child nodes type-aware-positioned" — all of which require a clean baseline to measure against. A populated 95-node canvas already has visual artifacts from prior runs that would mask any new engine output, good or bad.

**Correction:** Captured the missed verification as a new Phase-1 polish ROADMAP item: **"Blank-canvas visual verification of canvas-layout engine"** — create a small test Project, paste 8-12 keywords in, run one Direct-mode batch, look at the result with eyes. Schedules with Session 4 or as standalone. Not blocking.

**How caught:** Director, post-cancel, after seeing the canvas wasn't visually distinguishable from the pre-batch state.

**Prevention:** Going forward, before recommending any visual verification of a layout/rendering change, mentally pre-execute the test and ask: "Could I distinguish a working engine from a broken engine in the result I'd see?" If no, choose a setup (blank canvas, known small case) where pass-fail would be visible. Zoom-out check (Rule 16) extended: not only "does this work for the immediate task" but also "would the verification result actually demonstrate the property I'm checking?"

**Architectural pattern named (informational, generalizable):** "verification-baseline matters as much as verification-target." A deployed feature can be verified two ways: (a) by observing it produces the expected diff from a known baseline (clean canvas → run batch → see what new state engine produces), OR (b) by observing structured logs/metrics that prove the feature *fired* (activity log shows `Layout pass complete` + `Canvas rebuilt atomically`). Path (a) is stronger for visual/UX features; path (b) is stronger for invariant-checking features (like the reconciliation pass, where the structured aaLog output IS the verification — it's machine-checkable and the 58/74 numbers can be cross-referenced against DB ground truth). When recommending a verification path, pick consciously based on what evidence would be diagnostic for the specific feature.

**Cost data point (informational):** Sonnet 4.6 classic mode on Bursitis-sized projects (95 nodes, batch size 4) is **$1.89 per batch** with attempt-1 success. At the original 523-batch run scope, projected total was ~$985 (or ~$1,100-1,250 with typical retry rates). Reinforces Mode A→B safety net design rationale + stable topic IDs / Changes Ledger / stability scoring as cost-amortization mechanisms.

**Rule compliance:**
- Rule 9 deploy gate honored — described what would go live in plain English with reversibility notes; got explicit "Yes - Push" before running `git push`.
- Rule 10 visual verification handed to director — Claude described what to check; director reported pass/fail at each step.
- Rule 13 pause-and-resume warning surfaced when wrap-up approached; director confirmed wrap-up.
- Rule 14e deferred items captured — blank-canvas visual verification, salvage live verification, 74-Reshuffled forensic audit, test-keyword restore housekeeping, handoff-write-to-doc improvement.
- Rule 14f question framing — push approval used the standard yes/no/clarify/free-text pattern.

### 2026-04-25 — Session 3b code shipped (3 of 3 deferred Session 3 items; informational; reconciliation-as-visible-alarm framing locked in by director; two new Phase-1 polish items added to ROADMAP)
**Session:** session_2026-04-25_phase1g-test-followup-part3-session3b (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / ASTTable / CanvasPanel / Phase 1g-test follow-up Part 3 — Session 3b
**Severity:** Informational (clean code session, zero mistakes; logging design decisions + new architectural pattern + ROADMAP additions for future reference)

**What happened:** Session 3b shipped the three items deferred from Session 3a — P3-F7 post-batch reconciliation pass (#1), salvage-ignored-keywords mechanism (#2), and the four-function P3-F8 canvas-layout port (#4). Single commit `6c09e50`. Build clean (22.5s, 17/17 pages, zero TypeScript errors). NOT YET PUSHED — awaiting director approval per Rule 9 deploy gate.

**Director-locked design decisions during drift-check (per Rule 14b/14f question framing — every multi-option question included per-option context + recommendation + escape-hatch + free-text invitation):**

1. **Reconciliation off-canvas-AI-Sorted flip target = `'Reshuffled'` (Option B), NOT `'Unsorted'` (Option A).** Director's framing: any reconciliation flip means EITHER (a) HC5 leaked, (b) the rebuild silently dropped a keyword, or (c) legacy data — all three deserve admin visibility, not silent healing. Option B introduces a yellow `.ast-pill-r` badge in the AST table so admin can spot the alarm at a glance. AutoAnalyze's default scope picks them up automatically so no admin action is required for re-placement.
2. **Salvage trigger = HC3-only validation failure (Option A), NOT post-doApply unplaced > 0 (Option B).** The reconciliation pass already heals post-doApply text-mismatch leftovers by flipping their status to Reshuffled (picked up next run, zero extra API cost). Adding salvage at Moment 2 would risk paying for retries that fail the same way (text mismatch keeps failing the same way regardless of how many times the AI is asked).

**Director-raised root-cause concern (NEW Phase-1 polish ROADMAP item):** During drift-check, director correctly raised the meta-question: *"Why would AI bump a keyword off the canvas when that is strictly forbidden by our prompts? ... If it is our tool triggering this, then shouldn't we be preventing this from happening rather than trying to figure out what the status of the bumped keyword should be?"* Honest answer: yes — the reconciliation pass is the BACKUP per Session-2 framing; the root-cause work is separate. Captured as new ROADMAP item "P3-F7 root-cause audit" with four sub-items (HC5 text-matching audit; canvas-rebuild text-match audit; new HC6 "no keyword unlinks" check; one-time spot-audit of Bursitis's 49 ghosts to determine legacy-vs-active-bug breakdown). Schedules with Session 4 or 5.

**Director-raised NEW feature (NEW Phase-1 polish ROADMAP item):** Defense-in-depth "Keyword accounting + ghost detection panel." System maintains a permanent record of every keyword ever added to a project's AST; reconciliation check compares against (AST ∪ RemovedTerms); anything in history not in either is a "ghost" surfaced in a new admin Ghost Keywords panel with Restore + Archive bulk actions. Captured to ROADMAP. Schedules with Session 4 or as its own session.

**One architectural pattern named (fourth in this Part-3 series):**

5. **"Reconciliation-as-visible-alarm vs reconciliation-as-silent-heal."** When a reconciliation pass detects state drift, the choice is between (a) silently healing the drift (cheap; preserves UI ergonomics; hides the existence of the bug from the admin) and (b) surfacing the drift via a distinct user-visible status/badge (slightly more code; admin can monitor whether drift is rare-and-shrinking or persistent-and-hiding-a-bug). Option (b) is the right default whenever the underlying drift is a symptom of an unsolved root-cause bug — the alarm IS the diagnostic signal. If after a few sessions the alarm-badge is consistently empty, downgrading to silent-heal becomes a cheap follow-up. If the alarm badge keeps filling up, that's evidence to schedule the root-cause work. Recorded for future tools that build similar reconciliation passes.

**How caught:** Planned Session-3b scope. No mistake.

**Prevention:** Not applicable.

**Lessons captured for future sessions:**
1. The reconciliation-as-visible-alarm pattern (above) generalizes — any tool building a state-reconciliation pass should default to surfacing detected drift in the UI, not silently healing it.
2. Drift-check is the right moment to surface root-cause concerns. Director's "why does this happen at all" question during drift-check produced two new high-value ROADMAP items that wouldn't have been captured otherwise. Future Claudes: when the user pushes back on a "patch the symptom" framing, treat that as a roadmap-input opportunity.
3. The Q1/Q2 forced-pick framing per Rule 14f gave the director clean letter answers AND a follow-on root-cause concern that wouldn't fit either option. The escape-hatch worked — director didn't pick A or B mechanically, asked the meta-question first, then made an informed pick.

**Meta-procedural note (positive):** No Rule 13 fatigue triggers fired. Single session ~75 min of active work. No Rule 14 plain-language slips. Rule 9 deploy gate honored — code committed but not pushed; awaiting director approval. Rule 11 Option A clean-split honored — only today's 9 files in the commit, no leftover untracked or .bak files swept in.

---

### 2026-04-24c — Session 3a code shipped (5 of 9 Session 3 items, informational, autonomous design calls noted for director review)
**Session:** session_2026-04-24_phase1g-test-followup-part3-session3a (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / ASTTable / Canvas / Phase 1g-test follow-up Part 3 — Session 3a
**Severity:** Informational (clean code session, zero mistakes; logging design calls + patterns for future reference)

**What happened:** Director approved a Session 3a / Session 3b split at session start. Session 3a shipped 5 smaller items — model dropdown (#6), nextNodeId stale-counter fix (#5), cost-tracker failed-attempt fix (#7), B1 settings persistence (#8), RemovedKeyword soft-archive flow (#3). Session 3b deferred for fresh-mind focus on the bigger items: P3-F7 reconciliation pass (#1), salvage mechanism (#2), and the four-function P3-F8 canvas-layout port (#4). Single commit `25811c3`; pushed and deployed to vklf.com.

**DB migration applied to production Supabase:** added one new table `RemovedKeyword` (FK to `ProjectWorkflow`, indexed on `projectWorkflowId`). Pure additive — no existing data touched. Director gave explicit approval before `npx prisma db push` per Rule 8.

**Two autonomous design calls (per Rule 15) flagged here for director review:**

1. **Self-heal-on-read for `CanvasState.nextNodeId`.** Rather than diagnosing the exact write path that left Bursitis at `nextNodeId=5` vs `max(CanvasNode.id)=104`, the canvas GET endpoint now returns `max(stored_nextNodeId, max(CanvasNode.id) + 1)` and the same for pathways. Single source of truth at read time, immune to future stale writes, no migration required. **Why this design over hunt-the-bug:** the bug surfaces at most as ID collisions during new-node create, which only fires manually or during Auto-Analyze rebuild — both consume the GET output. Healing on read covers all callers in one place. Director can override by asking for a write-side fix later if a collision still surfaces.

2. **`apiKey` stays in browser localStorage; all other Auto-Analyze settings sync via UserPreference DB.** Director asked for "settings persist across refresh." Two ways to do that: store everything in DB (simpler, syncs cross-device, exposes Anthropic API key in plain-text Postgres) OR split (apiKey local-only, others DB-synced). Picked the split because the cross-device benefit is small for a Phase-1 admin-solo project and the security exposure of a long-lived API key in plain-text DB is real. Director can override by asking for the merge-everything version — adding apiKey to the DB blob is one extra line. Documented at Director's review surface in handoff so override stays cheap.

**One architectural pattern named (third in this Part-3 series):**

3. **"Self-heal on read" for stale persistent counters.** When a counter value is written from many code paths and any one of them might leave it stale, fixing all the writers is fragile and incomplete. Computing the effective value at read time from the underlying data (`max(stored, observed_max + 1)`) is one place to fix and immune to future regressions. Generalizable to any monotonic counter the system has independent ground truth for. Recorded for future tools that build similar "next-id" counters.

4. **"Split-secret-from-shared-prefs" for sensitive UserPreference fields.** When a user-preference key holds a long-lived secret (API key, OAuth refresh token), keeping it browser-local-only while other prefs sync to DB gives refresh-survival without DB-plaintext exposure. The pattern: one DB key for the structural prefs JSON; one localStorage key for the secret; same load-on-mount and debounced-save flow for both. Recorded for future AI-using tools that need user-supplied API keys.

**How caught:** Planned Session-3a scope. No mistake.

**Prevention:** Not applicable.

**Lessons captured for future sessions:**
1. The self-heal-on-read pattern (above) generalizes — should be the default approach when adding any counter that multiple code paths write to.
2. The split-secret-from-shared-prefs pattern (above) becomes more important as more AI-using tools land — every new tool that takes a user API key should follow this.
3. Session 3a / Session 3b split worked well. Both halves stayed within Rule 16 fatigue budgets. Recommend continuing the "split when in doubt" heuristic for any session with both DB schema work AND substantial code rewrites.

**Meta-procedural note (positive):** Director approved the proposed split + the autonomous design calls without escalation, suggesting the pre-work framing (option-with-recommendation per Rule 14b, then "make recommendations comprehensive" override) worked as intended.

---

### 2026-04-24b — P3-F8 canvas-layout diagnosed + Task 5 prompt-review refinements locked in (informational, Session 2b findings)
**Session:** session_2026-04-24_phase1g-test-followup-part3-session2b (Claude Code)
**Tool/Phase affected:** Keyword Clustering / CanvasPanel / Auto-Analyze prompts / Phase 1g-test follow-up Part 3 — Session 2b
**Severity:** Informational (diagnostic findings + prompt-engineering review outcomes, not a mistake)

**What happened:** Session 2b finished the two items Session 2 rolled forward — P3-F8 canvas-layout regression diagnostic and Task 5 proposed-prompt-changes review. Docs-only commit, no code.

**P3-F8 findings — single architectural root, three user-visible regressions.** Compared `keyword_sorting_tool_v18.html` (17,725 lines — director's upload to repo root, previously untracked, committed this session per Option A clean-split timing) to React `CanvasPanel.tsx` layout surface. Grepped for layout-related function names in both. **Root cause:** the React port migrated canvas *rendering* (SVG node cards, connectors, drag, zoom, single-node overlap nudge via `resolveOverlap` at line 397) but did NOT port the HTML tool's four-job *layout engine*. The four missing jobs:

1. **`cvsNodeH(node)` (HTML line 11965)** — content-driven node height using canvas `CanvasRenderingContext2D.measureText` for accurate text wrapping of title + altTitles + description at the node's current width, plus kw-row accounting and detail-view state. Called from 20+ callsites on content edit, resize, detail toggle, load. **React equivalent: NONE.** `NODE_H = 160` hardcoded constant; `h` loaded from DB and never recomputed. Direct cause of regression 2 (descriptions overflowing node boxes).

2. **`cvsPushDownOverlaps()` (HTML line 14152)** — holistic 4-step pass: reset disconnected roots to baseY → tree-walk from roots via `layoutChildren` (type-aware nested vs linear placement) → 60-pass overlap resolution across all nodes sorted by y → pathway separation. Called after every structural change (node add/delete, parent-child link, content edit, resize, detail-view toggle). **React equivalent: NONE** — only the single-node `resolveOverlap(nodeId)` exists, fires on drag/resize only, does NOT fire after Auto-Analyze canvas rebuild. Direct cause of regression 1 (overlapping nodes after Auto-Analyze adds 80+ nodes per batch).

3. **`cvsAutoLayoutChild(childNode, parentNode, relType)` (HTML line 14321)** — type-aware auto-positioning when a parent-child relationship is formed: linear = align child-left with parent-left, place below all peer descendants; nested = align child-left with parent-center-plus-indent, place below nested siblings only. **React equivalent: NONE.** Direct cause of regression 3 (wrong linear-vs-nested placement, wrong order).

4. **`cvsSeparatePathways()` (HTML line 14251)** — horizontal push-apart for overlapping pathway borders. **React equivalent: NONE.**

Bonus gap #5: **`baseY`/`y` separation** — HTML tracks user-set baseY distinct from current pushed y, so collapse/expand restores user-arranged positions cleanly. React has only `y`.

**Director's Q1/Q2/Q3 resolutions for Session 3 P3-F8 port:**
- Q1 (layout-pass frequency after Auto-Analyze) → **after every batch** (not just run-end). Keeps canvas clean during live human-in-loop review.
- Q2 (include pathway separation in Session 3 scope, or defer) → **don't defer** (include). Bursitis is single-pathway but multi-pathway Projects will need it.
- Q3 (one-shot port of all four functions together vs incremental) → **one-shot**. The four functions are interdependent (height feeds layout-pass; auto-layout-child feeds layout-pass); testing isolated would require shim code.

Item #5 (`baseY`/`y`) defers to a follow-up session — Q2 was narrowly about pathway separation.

**Task 5 findings — all 7 proposed changes' line references verified zero-drift against current `AUTO_ANALYZE_PROMPT_V2.md`** (last committed 2026-04-18 at `27eb180`). Every insertion point still accurate. Refinements applied to the proposed-changes doc:

- **Change 3 — meaningful fix.** Original Step 4b Comprehensiveness Verification text had a math/definition bug: question (i) asked "how many facets" without disambiguating whether the core intent counts as a facet; the worked example then self-caught the confusion mid-logic with literal "Wait — 3 < 4, one facet skipped. Adjust:". Redrafted with (i) "qualifying facets = demographic/situational/temporal/severity/contextual modifiers ONLY, NOT the core intent"; (iii) correct total = 1 + N(facets) stated explicitly; COMPREHENSIVENESS CHECK BLOCK adds a dedicated "Core intent (primary placement topic title)" row separate from "Qualifying facets identified"; worked example rewritten to arithmetic-match.
- **Change 2 Location 2 — grammar fix.** "within the same facet that their combined volume meets or exceeds" → "within the same facet, where their combined volume meets or exceeds".
- **Change 4 — JUSTIFY_RESTRUCTURE payload expanded.** Original proposed 4 fields (prior state, new state, reason, expected improvement) → full 6 fields per `MODEL_QUALITY_SCORING.md §4` (Topic affected, Prior state, New state, Score, Reason, Expected quality improvement).
- **Change 5 — example labels polished.** "(symptom focus)"/"(demographic focus)"/"(age-demographic focus)" had two overlapping demographic labels → "(symptom focus)"/"(gender facet)"/"(age-group facet)".
- **Changes 1, 6, 7 — no changes needed.**

**Three design questions resolved:**
- **Q4 — Change 2 × Change 4 interaction.** When Step 6(b) cross-canvas cluster promotion or Trigger (7) reassigns a keyword out of a prior-canvas topic whose `stability_score >= 7.0`, the reassignment requires a JUSTIFY_RESTRUCTURE payload in the Reevaluation Report. Prevents high-confidence topics being silently gutted of keywords. Captured as sentence additions to both Change 2 Location 1 and Location 2.
- **Q5 — What does the tool do with IRRELEVANT_KEYWORDS flags from Change 6's salvage template?** Tool code writes flagged keywords to the Session-3 `RemovedKeyword` table with `removedSource='auto-ai-detected-irrelevant'` and `aiReasoning` populated from the model's reason. Admin can review or restore any time. **This is distinct from the deferred "Auto-Remove Irrelevant Terms button"** (proactive full-canvas scan UI — director's "don't program without specifics" instruction still applies to THAT button). Salvage's per-batch model-initiated auto-archive is NOT blocked. Change 6 template text updated: "Admin will review and decide whether to move it to the Removed Terms table" → "The tool will auto-archive these keywords to the Removed Terms table with source tag 'auto-ai-detected-irrelevant' and your reasoning preserved; admin can review or restore at any time."
- **Q6 — How does `stability_score` metadata reach the model?** Add `Stability Score` as 10th column to the Topics Layout Table TSV schema. Primer Section 2 updated with: column definition, parsing rule 12 (float default 0.0 clamped [0.0, 10.0]), constraint rule 16 (preserve existing verbatim, emit 0.0 for new, structural changes to ≥7.0 require JUSTIFY_RESTRUCTURE), OUTPUT FORMAT header updated to 10 columns, output rule for one-decimal-place float. Ships in Session 5 (scoring implementation) + Session 6 (prompt merge) together.

**How caught:** Planned investigation + review. No mistake involved.

**Prevention:** Not applicable (not a mistake).

**Lessons captured for future sessions:**

1. **Architectural pattern named: "React migrations can port rendering without porting the layout/interaction engine."** The HTML tool's layout engine (20+ call-sites of `cvsNodeH` + `cvsPushDownOverlaps` triggered from every structural change) is not drawing code — it's geometry code triggered from many places. Mechanical component-by-component React ports preserve drawing faithfully (node card, connector) but silently omit this kind of cross-cutting behavioral logic because it doesn't live in any single component. Design guidance for future port work: before starting, grep the source for all callsites of each layout/interaction function; enumerate the triggering events; confirm each has a React equivalent. Don't assume "rendering parity" = "behavioral parity." Recorded in ROADMAP P3-F8 UPDATE block for reference.

2. **Line-reference drift in prompt-change docs is a real risk + cheap to verify.** The proposed-changes doc was drafted 2026-04-20 against commit `27eb180`; Session 2b verified all 7 references still match the current canonical doc in seconds via `Read` + grep. Cheap insurance. Future prompt-change docs should include the base commit hash in their header so verification is deterministic.

3. **Math bugs in model-prompts are high-leverage to catch pre-merge.** The original Change 3 text had a self-contradictory worked example ("3 < 4, one facet skipped. Wait — adjust:") that the model would replicate live in every batch. Catching it pre-merge is cheap; catching it post-merge requires debugging why the model self-corrects mid-response. Reviewer's job in prompt-change merges is arithmetic-level proofreading, not just wording polish.

**Meta-procedural note (positive):** Session 2b's Q1/Q2/Q3 framing for P3-F8 + Q4/Q5/Q6 framing for Task 5 — every multi-option question included per-option context + "I have a question first that I need clarified" escape hatch + free-text invitation close, per Rule 20. No Pattern 14 recurrence. Director's responses were crisp letter/answer picks ("a" / "A. However..." / "Accept the diagnosis. However, here are my answers") suggesting the forced-pick UX with escape-hatch worked as intended.

---

### 2026-04-24 — P3-F7 + Removed Terms root causes diagnosed via hybrid DB-query + code-read analysis (informational, Session 2 findings)
**Session:** session_2026-04-24_phase1g-test-followup-part3-session2 (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / ASTTable / Phase 1g-test follow-up Part 3 — Session 2
**Severity:** Informational (diagnostic findings, not a mistake)

**What happened:** First Claude Code session to engage direct DB queries as standard practice. Ran 4 read-only Prisma-client queries against live Bursitis data in Supabase: project list → baseline counts → full canvas tree walk → P3-F7 diagnostic (sum linked keywords vs AI-Sorted DB count + cross-reference). Then read `AutoAnalyze.tsx` (batching + `doApply` steps 3/9/11 + `buildQueue`), `ASTTable.tsx` (state init + `handleRemove`/`handleRestore`), `api/.../keywords/route.ts` (DELETE endpoint behavior), `api/.../canvas/rebuild/route.ts` (atomic rebuild transaction) in detail.

**P3-F7 findings:** Two distinct bugs share a shared architectural root — two independent sources of truth for "keyword is placed" (`Keyword.sortingStatus` updated by `doApply` step 11; `CanvasNode.linkedKwIds`/`kwPlacements` updated by step 3) with unidirectional updates (status only gets ADDED as AI-Sorted, never REMOVED). No reconciliation pass. Drift accumulates batch-by-batch.
- **Bug 1 — 58 "silent placements":** all on canvas as [p] primary but `sortingStatus='Unsorted'`. Root cause: `doApply` step 11 at line 1179 iterates only `batch.keywordIds` when marking AI-Sorted. Step 9 at lines 1147–1165 updates `Keyword.topic` for every keyword matching any text in the AI's response regardless of batch. Mode A's full-table view regularly places prior-batch keywords as [p] primary in later batches' responses → step 9 fires → step 11 doesn't (cross-batch keyword not in `batch.keywordIds`) → silent placement.
- **Bug 2 — 74 "ghost AI-Sorted":** `sortingStatus='AI-Sorted'` but not on canvas. Two sub-groups:
  - **Sub-group 1 (49 kw, non-empty topic + canvasLoc):** reshuffle casualties. Correctly placed in earlier batch (step 11 marked AI-Sorted). Later batch's canvas rebuild removed keyword from canvas. Step 11 only ADDS to AI-Sorted, never REMOVES. Stale status persists. Topic/canvasLoc strings survive because step 9 only appends.
  - **Sub-group 2 (25 kw, empty topic + empty canvasLoc):** linkedKwIds carryover via the `existing?.linkedKwIds || []` fallback at `doApply` line 1003. When AI response has empty `kwRaw` for a node, the node inherits linkedKwIds from pre-existing state. Inherited kws flow into `allLinkedIds` at step 11 → marked AI-Sorted if in `batch.keywordIds` → step 9 never touched them (not in parsed response text).

**Removed Terms findings:** `ASTTable.tsx` line 116 initializes `removedTerms` as `useState<RemovedKeyword[]>([])` — no localStorage load, no DB fetch. `handleRemove` (line 252) calls `onBulkDelete` / `onDeleteKeyword` which HARD-DELETE Keyword rows via `prisma.keyword.deleteMany` at `/api/projects/[projectId]/keywords` DELETE endpoint. Archive entry written only to in-memory state → lost on page refresh; hard-deleted Keyword row gone forever. Director's prior-session remove action did NOT actually delete anything (DB shows 2,328 kw = original import count; zero orphan canvas refs) — action evidently didn't fire. But the wiring IS capable of permanent deletion, so future remove clicks would silently lose data.

**Sub-finding (additional):** `CanvasState.nextNodeId = 5` despite max `CanvasNode.id = 104`. Stale counter. New-node creation via this counter would collide. Flagged for Session 3 investigation.

**Director's fix directions (2026-04-24):**
- **P3-F7 — two-part fix.** Primary = root-cause stack via Sessions 3-6 plan already in place (salvage-ignored-keywords mechanism + prompt changes [tie-breaker, comprehensiveness verification, multi-placement reinforcement] + stable topic IDs + stability scoring friction gradient + Changes Ledger admin visibility). Backup = post-batch reconciliation pass (new Session 3 item) that walks canvas after every batch and reconciles `Keyword.sortingStatus` against canvas reality. Per director: *"Whatever fix we apply here should be a backup to that primary fix."*
- **Removed Terms — Option B.** New `RemovedKeyword` table scoped to `ProjectWorkflow`. Remove = transaction copying Keyword row to `RemovedKeyword` + deleting Keyword. Restore = reverse. `removedSource` field distinguishes manual vs future auto-AI removal; `aiReasoning` holds model rationale when auto.

**How caught:** Planned investigation + code reading. No mistake involved.

**Prevention:** Not applicable (not a mistake).

**Lessons captured for future sessions:**
1. **Direct DB queries surface drift that code-reading alone can't.** The P3-F7 two-sub-group split of ghosts was only visible from the DB cross-reference (49 with topic + 25 without) — pointed directly to two distinct mechanisms. Hybrid analysis (DB + code) is more powerful than either alone. Validates the 2026-04-20 decision to make direct-DB-querying standard practice.
2. **Architectural pattern named: "multi-mode write paths to a single logical concept always drift without reconciliation."** `Keyword.sortingStatus` vs `CanvasNode.linkedKwIds` is one instance. This pattern will recur in: (a) Phase 2 worker-concurrency work on shared canvas state; (b) any future multi-mode AI tool (e.g., Mode A + Mode B + Human-in-Loop mode all writing to the same canvas — the Session 1 2026-04-20 "Mode B can silently overwrite Mode A" finding is exactly this pattern). Design guidance: either single source of truth, or explicit reconciliation pass, or per-action provenance that makes drift visible + recoverable. Recorded in `KEYWORD_CLUSTERING_ACTIVE.md` POST-SESSION-2 STATE block for future reference.
3. **Director's root-cause-first + reconciliation-as-backup philosophy** is now standing guidance for multi-source-of-truth bugs. Don't patch the symptom alone — fix the root cause (the WHY) AND add reconciliation as a safety net for anything that slips through.

**Meta-procedural note:** Claude's first framing of the follow-up questions (asking director to "react to" diagnoses without concrete pickable options) was too vague — director asked "What are you asking me?" Claude reframed with proper Rule 20 per-option context + escape hatch + free-text invitation. Correction was inline + conversational, not escalated — noting here for future sessions to apply Rule 20 to reaction-solicitation moments, not just decision points.

---

### 2026-04-20 — 51-batch Bursitis run narration + analysis: reactive switch fired at batch 40, Mode B carried batches 40-51 cleanly, batch 52 Mode B "Lost 6" core keywords including "bursa" (informational)
**Session:** session_2026-04-20_phase1g-test-followup-part3 (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Phase 1g-test
**Severity:** Informational (run analysis + qualitative findings)

**What happened:** The Bursitis Auto-Analyze run left processing in browser tab at end of 2026-04-19 session was cancelled by director at 11:40:22 PM after batch 52 failed validation. Run duration ~10h 37min. Outcome was variant (a) from prior session's prediction set: reactive Mode A→B switch fired at **batch 40 (10:27:02 PM, canvas of 95 nodes)** on a narrow trigger ("Deleted 1 topics: Wrist bursitis; Lost 1 keywords: wrist bursitis"). Mode A never hit the projected 200k context wall — input peaked at ~53k billed + ~66k output ≈ 119k at batch 17. 39 Mode A batches: canvas 22→95 nodes, "0 removed" every batch, all keywords verified every batch; "Unusually high: N new topics" warnings grew from 27 (batch 6) to 82 (batches 34-39). 12 Mode B batches (40-51): canvas 95→105, delta rows 7-12, cost dropped ~2× ($0.36-$0.47 vs. $0.80 avg), batch time dropped ~2.5× (5-6 min vs. 14 min). Batch 52 attempt 1 failed validation: "Missing 2 batch keywords: bursa city, bursa iş ilanları; Lost 6 keywords: bursa, bursa sac, what is a bursa, what is bursa, omental bursa." Director cancelled during retry 2. Total keywords placed: 408 of 2,304 = 17.7%. Estimated final cost if completed at Mode B pace: ~$90-100 over ~33 hours.

**Key qualitative findings (from director + log + code review):**
- **Mode A was qualitatively SUPERIOR to Mode B structurally** (director's direct assessment) — but there's no current way to quantify the difference. See also: Mode-B-can-silently-overwrite-Mode-A entry below.
- **Silent topic reshuffling in Mode A:** canvas oscillated 80→81→80→82→81→80... while "0 removed" fired every batch. Validation only catches by-name-disappearance; renames/merges/splits look like "no topics removed" even when structure changes substantially.
- **"N new topics" count is misleading:** the code compares response-row names to pre-existing names; renames count as "new." With 80+ row responses, this produces alarming noise (e.g. 82 "new topics" when net canvas growth is +3).
- **Director's bursa/Turkey-city homograph insight:** "bursa" = fluid sac AND Turkish city. "bursa iş ilanları" = "Bursa job listings." Forcing the model to place every batch keyword creates pressure to invent awkward topics, drop keywords, or silently mis-place. This is probably contributing to topic-structure corruption across runs.
- **Model not comprehensive in topic-chain creation:** for keyword like "bursitis pain in older women" (3 facets: pain, gender, age), model should produce 1 primary + 2 secondary with full upstream chains. Currently producing partial coverage under output-length pressure.
- **Keywords being left out of batches (director's AST Table observation):** some keywords show "Unsorted" status interspersed with "AI Sorted" after runs, and are absent from Topics/Analysis tables. Investigation deferred to Session 2.
- **Canvas layout regressions** from the HTML tool (node overlap, description overflow, wrong ordering) observed by director. `resolveOverlap` exists in React code (per `PLATFORM_ARCHITECTURE.md §388`) but appears insufficient. Diagnostic deferred to Session 2 after director uploads `keyword_sorting_tool_v18.html` to repo root.

**Correction (to prior session's roadmap):** The 2026-04-19 roadmap entry framing the proactive Mode A→B switch as a "functional prerequisite" was based on a projection that this run did not fully validate (context wall never hit). Downgraded to "cost-optimization option, pending qualitative comparison." See separate entry below on Claude's Q4 framing error.

**Prevention:** Future run-narration sessions must explicitly incorporate the director's qualitative observations, not just the log-based quantitative data. Log analysis alone is insufficient — the model's output quality (topic hierarchy structural integrity, searcher-centric language quality, conversion-funnel stage placement, comprehensive facet extraction) can only be assessed by eye on the canvas. Added to Session 2's scope: direct DB query on the Bursitis canvas for joint qualitative analysis.

**Lesson:** Safety checks that look clean are not evidence of quality. Batch-level "all keywords verified" + "0 removed" + "no errors" can co-exist with silent structural degradation. Qualitative review is not optional.

---

### 2026-04-20 — Claude's Q4 quantitative-framing error: treated Mode A time/money as "wasted" relative to Mode B without justifying quality parity
**Session:** session_2026-04-20_phase1g-test-followup-part3 (Claude Code)
**Tool/Phase affected:** Methodology / analysis-framing / roadmap-prioritization
**Severity:** High (would have driven wrong-direction roadmap decisions; caught by director)

**What happened:** During the Q4 portion of analyzing the 51-batch Bursitis run, Claude stated Mode A's 9 hours and ~$31 was "wasted" relative to Mode B, and recommended a proactive Mode A→B switch to eliminate the "waste." This framing assumed quality parity between Mode A and Mode B — an assumption Claude never justified. Director correctly pushed back: "But why do you consider Mode A time and money wasted relative to Mode B if the quality of Mode A could have been far superior to Mode B — something we have yet to discuss? ... The goal is to create an accurate topics hierarchy that serves our overall purposes of successfully launching a product... simply looking at the output in a quantitative manner devoid of a qualitative analysis will lead us down the wrong path with poor overall outcomes."

**Root cause:** Claude defaulted to a quantitative analysis lens (tokens, dollars, batch time) because those are the log-extractable metrics. The qualitative lens (tree structure, narrative flow, searcher-centric language quality, conversion-funnel integrity) requires canvas inspection and product-domain judgment — both of which Claude didn't have access to in that turn. Instead of flagging the gap ("I don't know Mode A quality vs. Mode B quality from the log alone"), Claude assumed parity and built a "wasted cost" argument on top. This is a Pattern-7-adjacent failure mode: defaulting to available evidence without flagging missing evidence.

**How caught:** Director directly, immediately, with a clear prescriptive explanation of why qualitative matters more than quantitative for this platform's purposes.

**Correction (applied this session):**
- Claude openly acknowledged the error mid-session, no minimizing (per Rule 7 in CLAUDE_CODE_STARTER).
- Revised recommendation: DON'T implement proactive Mode A→B switch as a default; instead, do qualitative A/B comparison FIRST. If Mode A wins on quality (as director later confirmed), keep Mode A as default with multi-trigger safety nets, accept higher cost as quality tax.
- Downgraded ROADMAP entry for "Proactive Mode A→B switch" from "functional prerequisite" to "cost-optimization option, pending qualitative comparison."
- Added Mode-B-can-silently-overwrite-Mode-A problem (next entry) as a first-order concern that the purely-quantitative framing completely missed.

**Prevention:**
- **New meta-rule for future run-narration sessions:** when log-extractable metrics point in one direction, explicitly flag the metrics Claude does NOT have access to and what conclusion they might support differently. "Based on the log alone, Mode A costs more; from the canvas alone, the quality comparison might be opposite. To decide, we need the canvas."
- **Apply Rule 16 (zoom in AND zoom out) more rigorously when analysis involves tradeoffs:** cost/time is the zoom-in; product-launch effectiveness is the zoom-out. Both must be named before any recommendation.
- **Default assumption to flip:** when two modes produce different cost/time profiles, ASSUME the lower-cost one may have lower quality and require the director to confirm quality parity before recommending it as the default.

**Lesson:** For a non-programmer director building a product-launch platform, "faster + cheaper" is NEVER automatically better than "slower + more expensive" — the qualitative product outcome dominates. Quantitative analysis without qualitative grounding is worse than no analysis, because it produces confident-sounding wrong answers.

---

### 2026-04-20 — "Double-classification" terminology clarification (informational)
**Session:** session_2026-04-20_phase1g-test-followup-part3 (Claude Code)
**Tool/Phase affected:** Methodology / communication / Keyword Clustering semantics
**Severity:** Low (terminology clarification, no user-facing impact)

**What happened:** Claude used the phrase "double-classification" in a negative context during Q1 analysis (listing it as one of the "messy workarounds" the model engages in when it can't delete topics). Director correctly flagged that many keywords SHOULD appear in multiple topics because their intent genuinely spans multiple facets — example: "bursitis pain in older women" legitimately belongs under "bursitis pain", "bursitis in women", and "bursitis in older people" simultaneously.

**Root cause:** Claude conflated two distinct concepts:
- **Intentional multi-placement** (GOOD, platform feature) — keyword genuinely spans topics; primary [p] + one or more secondary [s] placements represent the full intent.
- **Workaround duplication** (BAD, failure mode) — model can't decide between two topics and places in both out of indecision, not intent.

Using "double-classification" without qualifier made it sound like all multi-placement is problematic, which contradicts the prompt's explicit secondary-placement design.

**How caught:** Director directly.

**Correction:**
- Claude clarified the distinction in-session.
- Added the distinction to `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` Change 5 (multi-placement reinforcement) with explicit "MULTI-PLACEMENT IS A FEATURE, NOT A COMPROMISE" framing + "IS / IS NOT" contrast.
- Recorded here for future sessions.

**Prevention:** Future sessions should use precise terminology: "intentional multi-placement" for the feature, "workaround duplication" only for the specific failure where the model hedges without justification. Flag any appearance of ambiguous terms like "double-classification" or "redundant placement" and ask for clarification before recommending fixes.

**Director's guidance to preserve:** "many keywords should be put into multiple topic nodes because the focus of those individual topics could be equally applicable to that keyword." This is the intended behavior.

---

### 2026-04-20 — "Lost" vs "Missing" keyword-validation error messages: code-verified distinct semantics (informational)
**Session:** session_2026-04-20_phase1g-test-followup-part3 (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / batch validation
**Severity:** Informational (factual clarification, directly referenced by prompt/code-design decisions this session)

**What happened:** Director asked whether the "Lost N keywords" vs "Missing N batch keywords" error messages represent different failure modes. Claude verified in `AutoAnalyze.tsx`:
- **Line 822:** `const missing = batch.keywords.filter(kw => !allKwsInTable.has(kw.toLowerCase()));` — "Missing N batch keywords" = this batch's keywords that didn't make it into the AI's output.
- **Line 865:** `errors.push('Lost ' + lost.length + ' keywords: ' + lost.slice(0, 5).join(', '));` — "Lost N keywords" = previously-placed keywords that disappeared from the AI's response.

Confirmed semantics: **"Missing" = same-batch non-placements (this batch's work wasn't finished). "Lost" = previously-applied work erased (prior work destroyed).** "Lost" is the more serious failure mode because it represents data destruction, not just incomplete work.

**Relevance to batch 52 failure in the 51-batch run:** Batch 52 error was BOTH: "Missing 2 batch keywords: bursa city, bursa iş ilanları" (consistent with the Turkey-city homograph insight — model couldn't place these unrelated keywords) AND "Lost 6 keywords: bursa, bursa sac, what is a bursa, what is bursa, omental bursa" (six previously-placed foundational keywords erased — structural failure). The "Lost 6" is the larger concern.

**Design implication (captured in `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` Change 6):** The salvage-ignored-keywords mechanism applies to "Missing" (can do a targeted follow-up placement). For "Lost", targeted follow-up is insufficient — structurally broken response; use full-batch retry instead.

**Prevention:** Terminology in future discussions should clearly distinguish "Missing" vs "Lost" per the code's actual semantics. Documentation and prompt copy should use the same terms consistently.

---

### 2026-04-20 — Mode B can silently overwrite Mode A's higher-quality work — identified as a first-order problem not addressed in prior design
**Session:** session_2026-04-20_phase1g-test-followup-part3 (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Mode A vs Mode B architecture
**Severity:** High (identified this session; design fix proposed; not yet implemented)

**What happened:** Director raised this critical issue during Q3 discussion: "Since Mode B can overwrite the work done by Mode A, when admin finally reviews the Auto-Analysis's final output, the results could be drastically skewed by Mode B with Mode B masking the better results of Mode A." In the 51-batch Bursitis run, Mode A produced qualitatively superior structural work over 39 batches (director's direct assessment). Then Mode B took over at batch 40 and modified topics Mode A had created, producing 12 more batches of work in its own style. Admin's final-review canvas is a blend of Mode A work and Mode B modifications, with no way to distinguish which mode produced which part — so Mode A's quality can be diluted or lost without admin knowing.

**Root cause:** The current architecture treats Mode A and Mode B as interchangeable fallback modes. The reactive switch assumes Mode B can continue Mode A's work. No per-action provenance tracking. No mechanism to protect Mode A's admin-approved work from Mode B modifications. No quality scoring per mode. No side-by-side comparison view. All of these are first-order design gaps the previous sessions missed because they were optimizing for "does the run finish?" rather than "does the run produce quality output?"

**How caught:** Director directly during Q3 discussion.

**Correction (design captured this session, implementation pending across multi-session plan):**
- **Changes Ledger with per-action provenance** (mode/model/batch/settings/stability-score-at-time-of-action) — admin can filter to "show only Mode A actions" to see Mode A's contribution isolated. Session 4 scope.
- **Admin quality scoring per action (1-5 scale)** rolled up per-mode — after a run admin sees "Mode A avg 4.3 / Mode B avg 2.8" and the quality difference becomes measurable. Session 7-9 (Human-in-Loop) scope.
- **Mode A "protected" status on admin-approved actions** — Mode B cannot modify a Mode A topic that admin has marked as good. Uses the stability-scoring friction gradient (score ≥ 7.0 requires JUSTIFY_RESTRUCTURE). Session 5 scope.
- **Final review "mode difference" view** — diff of what each mode changed, with ability to revert Mode B changes that damaged Mode A quality. Session 7-9 scope.

**Prevention:**
- **New architectural principle:** when two (or more) AI processing modes operate on shared state, there MUST be per-action provenance tracking from the start. Admin must always be able to answer "which mode produced this result?" without guesswork.
- **Applies platform-wide:** any future tool with multi-mode AI processing must build this in from day one. Added as a requirement to `AI_TOOL_FEEDBACK_PROTOCOL.md` §2.
- **This entry also exposes a gap in Claude's Q4 framing error (entry above):** not only was quality comparison missing, but the interaction between modes (Mode B's ability to silently erode Mode A's quality) was invisible in the quantitative framing. Qualitative analysis must consider cross-mode interactions, not just per-mode outputs.

**Lesson:** When architecting multi-mode AI systems, the single most important question is not "how does each mode perform?" but "how do the modes interact, and does their interaction preserve or degrade quality?"

---

### 2026-04-19 — Stale-closure fix validated live across 7 clean batches on Bursitis run (informational, not a mistake)
**Session:** session_2026-04-19_phase1g-test-followup-part2 (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Phase 1g-test
**Severity:** Informational (success record)

**What happened:** Commit `a6b3b19` shipped the two fixes from yesterday's stale-closure entry: (A) `buildCurrentTsv` now reads from `nodesRef.current` / `keywordsRef.current` / a new `sisterLinksRef.current` instead of the render-time closure; (B) `handleApplyBatch` is now async and `await`s `doApply(...)` before running the next `runLoop()` iteration. `handleSkipBatch` was audited — no change needed (it doesn't call `doApply`). Build clean in 36s; pushed to origin/main; Vercel deployed in ~2 min.

User then launched a fresh Bursitis Auto-Analyze run (288 batches, 2,304 keywords, API Mode=Direct, Thinking=Enabled, Budget=12000, Review-each-batch=ON) leaving the 22 pre-existing canvas nodes from the prior aborted run in place. Over the first 7 completed batches:

- **"0 removed" on every single batch** (HC4 validation: no topics ever deleted)
- **"All N keywords verified on canvas" on every batch** (HC5 validation: no keywords ever lost)
- Canvas grew monotonically: 22 → 27 → 33 → 36 → 39 → 41 → 49 → 53 nodes
- Input token count grew batch-over-batch in proportion to canvas size (21,347 → 23,246 → 26,331 → 28,020 → 29,870 → 31,586 → 36,839 → 39,781) — this is the live fingerprint that `buildCurrentTsv` is reading post-apply state via the refs, not the frozen closure. If the stale-closure bug were still present, this number would be flat.

One stream stall on batch 2 (Anthropic API went quiet mid-generation for ~90s) triggered the tool's built-in stall-retry correctly — stall retry counter used separately from the 3-attempt API retry budget, as designed. Not related to the fix.

Batch 6 and 7 emitted "⚠ Unusually high: N new topics" soft warnings (27 and 31 respectively, threshold 25) — the AI is producing more new-topic *signals* than net canvas growth, consistent with Mode A doing speculative topic restructuring. Not a correctness failure (validation always passed), but a signal Mode A is starting to think-out-loud as the table grows.

**Prevention:** Not applicable (not a mistake). But worth noting as evidence that the stale-closure fix is robust: 7 consecutive clean batches, validated across two different processing patterns (normal 2–6-new-topic batches AND batch-6's 8-new-topic spike with the warning). Also worth noting: the comment added near the refs block (`"runLoop-reachable code must read nodes/allKeywords/sisterLinks via *Ref.current, not raw props"`) now documents the invariant so future developers don't re-introduce the bug.

---

### 2026-04-19 — Mode-A-alone cannot complete a 2,304-keyword Bursitis run before the 200k context wall
**Session:** session_2026-04-19_phase1g-test-followup-part2 (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Phase 1-polish
**Severity:** Informational (new quantitative finding that reframes the roadmap)

**What happened:** After 7 clean Bursitis batches validated the stale-closure fix, I produced a trajectory projection based on the observed data (input ~750 tokens per canvas node; output ~600–700 tokens per node in Mode A, spiking to ~950 in reshuffle batches). Projection: at the current ~3–4 net-new-topics-per-batch pace, Mode A in pure form hits the **200k context-window wall at roughly 120–140 canvas nodes**, which equals only **240–600 of the 2,304 keywords placed (10–26% of the dataset)**, depending on whether adaptive batch tiering kicks in to grow batch size from 8 → 12 → 18. Either way: Mode A alone cannot finish this dataset.

**The implication:** completing a full Bursitis (or similarly-sized) clustering run **requires** the Mode A → Mode B switch to fire at some point. Two paths exist:
- **Reactive switch (shipped)** — fires on HC4/HC5 validation failure or output truncation. Relies on Mode A starting to drop topics *before* the context wall hits. Race condition.
- **Proactive switch (roadmap item, NOT shipped)** — would fire after batch 1 (or at a node-count threshold) regardless of Mode A quality. Removes the race.

The reactive switch by itself is insufficient for full-dataset runs because Mode A may stay "clean" past the point where switching is still safe (once input + output tokens exceed ~180k, Mode B's smaller delta output can't rescue it either — the input alone is the problem).

**Why this wasn't obvious before this session:** prior Bursitis attempts never got past ~batch 3, so the trajectory data didn't exist. The stale-closure fix was the prerequisite to generating this data.

**Correction:** Not a fix — a re-prioritization of existing roadmap item. The "Proactive Mode A → Mode B switch after batch 1" Phase 1-polish item is promoted from "nice-to-have" to **functional prerequisite for any full-dataset clustering run**. Captured in `ROADMAP.md` Phase 1-polish section and `KEYWORD_CLUSTERING_ACTIVE.md` §6.5.

**Prevention — for future LLM projections:** when making trajectory estimates from limited batch data, explicitly project the context-window math out to dataset completion, not just the next few batches. The gap between "this batch works" and "the full run can complete" needs to be stated, not assumed. Adding this as a checklist item for future Auto-Analyze run narration.

**Lesson — useful pattern for run-narration more generally:** once 5–7 batches of data exist, do the full-dataset projection arithmetic explicitly. The arithmetic is cheap; the insights it surfaces (context wall, cost ceiling, time-to-completion) change the decision space (continue vs. pause to implement a missing feature). Per `HANDOFF_PROTOCOL.md` Rule 16 zoom-out requirement.

---

### 2026-04-18 — Stale-closure bug in buildCurrentTsv contaminates Mode A diagnosis; exposed during live Phase 1g-test follow-up run
**Session:** session_2026-04-18_phase1g-test-followup (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Phase 1g-test
**Severity:** High (load-bearing bug blocking all Auto-Analyze runs past batch 2; also reshapes the prior session's diagnosis of the Mode A "dropped topics" failure mode)

**What happened:** During the Bursitis Auto-Analyze run attempted this session (2,320 keywords, Direct mode, Enabled-12k thinking, model claude-sonnet-4-6, Review each batch ON), Task 2's new Mode A → Mode B auto-switch fired correctly on batch 2 when Mode A's response dropped 1 topic ("Pes anserine bursitis") and 8 keywords. Batch 2 Mode B succeeded and applied 22 nodes to the canvas. But then batch 3 Mode B failed validation with "Deleted 11 topics; Lost 8 keywords." Investigation revealed the merge function had operated on 10 rows, not 22:

- Pre-batch-3 canvas had **22 nodes**
- Batch 3 delta response: **8 ADD + 2 UPDATE rows**
- Expected merged total: 22 + 8 = **30 rows**
- Actual merged total reported by the tool: **"18 total rows"**
- Math: 18 − 8 adds = **10 rows baseline** — exactly the canvas state after batch 1's apply, not batch 2's

**Root cause:** Two compounding bugs:

**Bug A — Stale-closure on `nodes` in `buildCurrentTsv`** (`src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` lines 359–408). The function reads `nodes`, `allKeywords`, and `sisterLinks` directly from the component's render-time closure. The `runLoop` async function persists across renders and invokes `buildCurrentTsv` (via `mergeDelta` at line 629 and `assemblePrompt` at line 421) using the closure from when `runLoop` was defined. The correct pattern — already in use by `validateResult` (line 823, 841) and `doApply` (line 895) — is `nodesRef.current` / `keywordsRef.current`, which are always-fresh refs updated via `useEffect` at lines 214–215. Someone added the refs but missed `buildCurrentTsv`.

**Bug B — Missing `await` on `doApply` in `handleApplyBatch`** (line 1387). `doApply` is `async` and contains `await onRefreshCanvas()` + `await onRefreshKeywords()` at lines 1160–1161 that update parent state. But `handleApplyBatch` fires `doApply` without awaiting, then immediately calls `runLoop()`. The new runLoop captures its closure before the refresh completes, so even fresh-closure-aware code would see pre-apply state. Bug A is the load-bearing one; Bug B compounds it.

**How caught:** Arithmetic on the batch 3 log output revealed the inconsistency (18 merged rows from a 22-row starting state). Code inspection confirmed the stale-closure pattern. Canvas state was not corrupted because validation caught the mismatch and rejected the merged TSV before `doApply` ran.

**Meta-reframing — this contaminates the prior session's Mode A diagnosis.** The prior session (2026-04-18 Phase 1g-test partial) observed Mode A dropping 4-6 topics across 3 retries of batch 2 and attributed this to "LLM attention dilution over long outputs." That theory isn't wrong in general — attention dilution IS real in LLMs emitting 30k+ token structured responses — but the specific failures observed there were at least partially due to Bug A: the AI was being given a stale (smaller) view of the current table via `buildCurrentTsv`, so "dropped" topics may have been topics the AI never saw in its input. Future LLM-behavior theorizing about Auto-Analyze runs should verify the input the AI actually received before diagnosing model behavior.

**Task 2's fix (commit `84062f5`, this session) still works as a safety net.** It correctly catches HC4/HC5 failures in Mode A and flips to Mode B. What it catches is a symptom of Bug A + B, not the original "LLM attention dilution" root cause I thought existed. It remains valuable — the switch to Mode B reduces output size and is structurally safer regardless of the input-freshness question — but isn't a complete fix.

**Correction:** Deferred to next session — two focused code edits:
- (A) Rewrite `buildCurrentTsv` (lines 359–408) to use `nodesRef.current`, `keywordsRef.current`, and a new `sisterLinksRef.current`. Add the sister-links ref + useEffect alongside existing refs at lines 205–215.
- (B) Make `handleApplyBatch` (lines 1384–1398) `async` and `await doApply(batch, pendingResult)` before the subsequent `batch.status = 'complete'` / `runLoop()` calls. Also audit `handleSkipBatch` (lines 1400–1413) for the same pattern — it calls `runLoop()` but doesn't invoke `doApply`, so it may not need the same fix; verify during the next session.
- After (A) + (B) are pushed and deployed, restart the Bursitis Auto-Analyze run to validate end-to-end completion.

**Prevention:** New procedural rule for future Auto-Analyze code additions: any function called inside `runLoop` (directly or transitively through `processBatch`, `mergeDelta`, etc.) that needs to read `nodes`, `allKeywords`, `sisterLinks`, or other props must use the `*Ref.current` pattern. Treat the render-time closure as frozen for the runLoop's lifetime. Adding a code comment near the refs' `useEffect` block saying "All `runLoop`-reachable reads of these must use the refs, not the raw props" would make the invariant discoverable by future sessions.

**Lesson — observations during long runs need math-verification, not just "looks right."** Batch 2 Mode B appeared to succeed (delta merged to 22 rows, validation passed). But the 22-row result was coincidental given a 10-row baseline + 12 adds + 4 updates (and a stale `nodes` that happened to match the real state's first 10 rows). If Claude had done the arithmetic check after every batch — "pre-batch row count + deltas = post-batch row count?" — Bug A would have surfaced earlier. Adding to the "how to review Auto-Analyze runs" mental checklist.

**Meta-lesson — Pattern 7 adjacent.** Docs claimed something existed/worked and reality diverged; in this case, the "docs" were my Mode A diagnosis in the prior session. Cheap verifications (arithmetic on log output) catch it; expensive ones (full code read) confirm. This is a recurring class of issue — when a diagnosis feels "clean," spending 30 seconds checking the numbers can save hours of accumulated-wrong-theory.

---

### 2026-04-18 — Task 2 and Task 3 fixes validated in production (informational, not a mistake)
**Session:** session_2026-04-18_phase1g-test-followup (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Phase 1g-test
**Severity:** Informational (success record — this is NOT a mistake; entry exists to document live-production validation of both fixes)

**What happened (Task 2 validation):** The Mode A → Mode B auto-switch expansion committed in this session (`84062f5`) fired correctly during batch 2 of the live Bursitis run. When the AI's Mode A response at 1:44:46 dropped "Pes anserine bursitis" (HC4) and 8 keywords (HC5), the `isLostDataError` check at the new validation-failure branch matched, `⚡ AUTO-SWITCH: … — switching to DELTA mode (Mode B)` logged, `setDeltaMode(true)` fired, `batch.attempts--` decremented the retry counter so the Mode B retry started as "attempt 1" preserving the full 3-attempt budget. Mode B retry succeeded. Behavior exactly as designed.

**What happened (Task 3 validation):** The Budget input UX fix committed in this session (`b9dc8b9`) was verified live by the user during pre-launch smoke-test on vklf.com after Vercel rolled the deploy. User confirmed: field can be cleared to blank mid-edit without snapping back to 10000, typing a new value works naturally, tabbing away from an empty field snaps to the default. Same pattern applied to Batch size / Stall / Vol threshold inputs also holds by construction (identical code pattern).

**Significance:** First production validation of a Claude-Code-authored code fix for the PLOS platform. Both Tasks 2 and 3 went from "code committed" to "live-verified" within a single session. Contrast with prior claude.ai sessions where fixes often deployed without immediate live verification and surfaced as later-session bug discoveries (e.g., the missing `/projects/[projectId]/page.tsx` that slipped through Ckpts 6–8).

**Prevention:** Not applicable (not a mistake). But worth noting as evidence that the Claude-Code-direct-execution methodology shortens the verification loop substantially.

---

### 2026-04-18 — IMMEDIATE same-session Pattern 14 violation: Claude violated the newly-written rule in the next major decision
**Session:** session_2026-04-18_phase1g-test-kickoff (Claude Code) — caught by user after Pattern 14 had been committed as `b782a53`
**Tool/Phase affected:** Methodology / decision-framing / Pattern 14 enforcement
**Severity:** High (proof that documentation alone does not prevent Pattern 14 slips — even the Claude that authored the rule failed it in the next major decision)

**What happened:** During end-of-session wrap-up, Claude presented a push-to-GitHub decision with three options:
- "push" — I run git push origin main
- "don't push yet" — I produce the handoff noting the commit is local-only, and you can push later yourself when ready
- "show me what changed first" — I show you a summary of the diff before you decide

Each option had a one-line label but lacked:
- Per-option consequence context (what does "local-only" mean in practice for the user? How would they push later — what exact command?)
- Per-option reversibility framing ("pause is fully reversible" / "this is one-way" etc.)
- The required free-text invitation ("Or ask me a question about any option first")

This was committed and pushed as part of the ordinary session flow. The user accepted "push" without complaint. Only AFTER Claude committed Pattern 14 itself (`b782a53`) did the user reread the session and flag: *"you did it again. You gave me a multiple choice to pick from and provided no context for the choices. For example, what did you mean by don't ask for git - again."*

**Root cause:** This is Pattern 14 itself, committed just moments before. The Claude that authored Rule 20 / Rule 14f / Pattern 14 did not have the newly-written rule in sufficient foreground attention during the NEXT major decision it made (push vs. don't push). The rule was written and committed, but the Claude's own behavior didn't yet reflect it. This is the exact visibility-under-load failure mode Pattern 11 describes, recurring for Pattern 14.

**How caught:** User directly, reading back through the session after the commit.

**Correction (applied this entry):**
- Claude acknowledged the slip openly in-session (no minimizing, per Rule 7 in CLAUDE_CODE_STARTER)
- Provided the per-option context retroactively in plain language
- Added this entry to CORRECTIONS_LOG.md as proof that Pattern 14 requires more than documentation

**Prevention (strengthens Pattern 14):**
- Future sessions reading CLAUDE_CODE_STARTER.md at start will see Rule 20, but this entry's existence in CORRECTIONS_LOG — flagged for 2026-04-18 same-session violation — should reinforce that the mechanical test (scan each option for context; confirm free-text invitation) must be run on EVERY multi-option question, not just the important-feeling ones.
- The scan-each-option test from Rule 20 / Rule 14f must become reflexive before sending any response that includes bulleted letter-options or "reply with one of" framing.
- **Related: the "reply with one of: A / B / C" phrasing pattern itself is a red flag.** It implies forced choice without escape. Claude should avoid that phrasing in favor of "A does X (consequence), B does Y (consequence), C does Z (consequence). What sounds right? — or ask me anything about any of these first."

**Lesson:** Pattern 11's recurrence across chats taught us that "rules in docs" aren't sufficient to prevent LLM attention drift. Pattern 14 is an immediate case study in the same failure mode — the rule was authored and immediately not followed. This confirms that mechanical tests must be internalized as habits, not just read-at-start of session.

**Meta-lesson for future sessions reading this entry:** if Claude ever catches itself writing "reply with one of" or a similar forced-choice closer on an options question, STOP and rewrite. The rewrite template: context per option + explicit free-text invitation. Every time.

---

### 2026-04-18 — Multi-option questions without context or free-text escape hatch trapped user into picking letters
**Session:** session_2026-04-18_phase1g-test-kickoff (Claude Code) — feedback raised at end-of-session, post-handoff
**Tool/Phase affected:** Methodology / decision-framing
**Severity:** High (usability pattern that impacts every future session's interaction model)

**What happened:** Throughout the session, Claude presented several multi-option decisions (Option A/B/C for things like: how to handle the leftover script, keyword data starting point, test-plan tuning picks, etc.). In several cases the options had enough context for an informed pick; in others Claude gave terse labels and expected the user to pick by letter. The user raised this directly at end-of-session:

> *"At several points during our session, you posed options to me where rather than type my response, I could only pick from 1,2,3 etc. The problem is, in many instances, I had questions about an option and couldn't type it in. So I want you to do the following next time. Either provide context for my choices so that I know what I'm choosing or let me type my responses so that I can include questions, clarifications about my choices."*

The user is explicitly saying they felt the format was forced: "pick a letter" rather than "pick a letter OR ask me anything first." This is a structural interaction pattern, not a one-off slip.

**Root cause:** Claude's option-framing habit leans toward "make a clean multiple choice" which is good for clarity but bad for a non-programmer who may need to poke at an option before committing. The existing rules (14a–14e in HANDOFF_PROTOCOL) covered "plain language" and "required structure of decision questions" but did NOT explicitly require (a) per-option consequence context OR (b) an explicit free-text invitation. So Claude followed the letter of the rules while missing the spirit of the user's non-programmer needs.

**How caught:** User directly, at end-of-session, with a clear prescriptive ask: "integrate the solutions into our documents so that this issue doesn't happen again."

**Correction (applied this session, second commit):**
- Added Rule 20 to `CLAUDE_CODE_STARTER.md` — "Option questions must include per-option context AND always invite free-text responses" — with mandatory free-text invitation wording and a mechanical test.
- Added Rule 14f to `HANDOFF_PROTOCOL.md` — same requirement, integrated with the existing Rules 14a–14e family.
- This new entry + new Pattern 14 (below) in `CORRECTIONS_LOG.md`.

**Prevention:** Pattern 14 below formalizes the mechanical rule for future Claude sessions.

**Meta-lesson:** "Options + recommendation + reversibility" (Rule 3 in CLAUDE_CODE_STARTER) is insufficient on its own because it doesn't explicitly require per-option consequence context or an escape hatch. The user needs BOTH the information to decide AND the freedom to ask questions. A well-framed multiple-choice should feel like a menu with descriptions, not a fill-in-the-circle form.

---

### 2026-04-18 — Pattern 11 recurrence #5: session-boundary step-by-step instructions needed by non-programmer user (now a standing protocol requirement)
**Session:** session_2026-04-18_phase1g-test-kickoff (Claude Code)
**Tool/Phase affected:** Methodology / end-of-session protocol
**Severity:** High (5th recurrence of a class of issue that documentation alone has not solved)

**What happened:** At the end-of-session doc update phase, the user stated: *"please also tell me exactly what to do to end this session, how to begin the next session, exactly what to type, etc. Please also make sure the next session and every subsequent session is provided this information as well so that I am given step by step instructions on what to do next when I am at the end of sessions and in-between sessions about to start a new session."*

This is a direct reinforcement of the non-programmer rule, applied specifically to **session-boundary moments** — which the existing Pattern 11 / Rule 14a / Rule 9 framework had not sufficiently covered. The prior rules covered mid-session imperatives ("paste this file") but not end-of-session handholding (how to close, how to resume).

**Root cause:** The existing end-of-chat Personalized Handoff template in `HANDOFF_PROTOCOL.md §4 Step 4` was written for the claude.ai era (upload/download workflow). When the project migrated to Claude Code, the template wasn't updated to reflect the new workflow — and the non-programmer handholding requirement wasn't made explicit for Claude Code's session-boundary moments (close + reopen with exact terminal commands).

**How caught:** User directly, at end-of-session.

**Correction (applied this session):**
- Added a new **Step 4b — Claude Code variant of the handoff** to `HANDOFF_PROTOCOL.md §4`, with a mandatory template requiring 🚪 END-OF-SESSION INSTRUCTIONS and 🚪 NEXT-SESSION INSTRUCTIONS sections. The sections must contain exact terminal commands and exact copy-paste-ready first-message text.
- Extended Rule 15 in `CLAUDE_CODE_STARTER.md` with explicit sub-bullets requiring: "what we did," "files changed," "deferred items," "🚪 END-OF-SESSION INSTRUCTIONS," "🚪 NEXT-SESSION INSTRUCTIONS," "open questions."
- Every future Claude Code session reads `CLAUDE_CODE_STARTER.md` at start — so the requirement propagates automatically.

**Prevention — new Pattern 13 below.**

**Lesson:** Session bookends (end + next start) are exactly when a non-programmer user is at highest risk of being lost. The same mechanical rigor demanded mid-session applies at the boundaries, and the protocol must enforce this template-ly, not as a case-by-case courtesy.

**Meta-lesson (reinforces Pattern 11):** When the user has to restate a class of rule for the Nth time, document containment has failed and **mechanical enforcement at the protocol level** is required. A textual rule that Claude "should follow" is insufficient — the rule must be embedded in a REQUIRED TEMPLATE that Claude cannot produce an end-of-session handoff without filling in.

---

### 2026-04-18 — Phase 1g-test bugs: Adaptive Thinking runaway, Mode A omission failure, Vercel 5-min timeout risk
**Session:** session_2026-04-18_phase1g-test-kickoff (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Phase 1g-test
**Severity:** Medium (bugs in the tool, surfaced by the test exactly as designed; not mistakes by Claude or user)

**What happened:** First live test of Auto-Analyze against a real dataset (Bursitis Project, 2,328 keywords, model `claude-sonnet-4-6`, Server mode). Surfaced:

1. **Adaptive Thinking → 0 output tokens.** With Thinking=Adaptive and a 51k-character combined prompt, the model consumed its entire `max_tokens=128000` allocation during the silent thinking phase on all 3 attempts, emitting zero output text. Same signature each time: "Stream complete. Input: 183, Output: 0 tokens" after ~5 min wall time. Workaround: switch to Thinking=Enabled with Budget=12000; confirmed working on batch 1.

2. **Mode A (full-table) drops pre-existing topics as the table grows.** Batch 2 attempts 1 and 3 produced valid-looking responses but omitted 4–6 topics from the prior state and lost 2–8 keywords. HC5 validation caught the omissions correctly. The tool's Mode A → Mode B auto-switch did NOT trigger because that condition only fires on truncation, not on omission failures. Tool's 3-attempt retry with correction context exhausted without success; batch 2 marked FAILED, tool moved on to batch 3.

3. **Vercel 5-min timeout ceiling is close.** Batch 2 attempt 2 took 4:59 wall time and returned 0 output tokens — within 1 second of Vercel's serverless function timeout. May have been Vercel killing the stream, not the model misbehaving.

**Root cause (per-bug):**
- Bug 1: Adaptive Thinking is unbounded by design; large prompts make the model "want to think a lot"; combined with `max_tokens=128000` cap, thinking can fill the whole allocation.
- Bug 2: Full-table Mode A asks the model to re-transcribe the entire current state. As state grows, model attention degrades and rows get dropped. Known long-context generation pattern.
- Bug 3: Server-mode requests are Vercel serverless functions with a 5-min hard kill. Each batch's thinking + output needs to fit under that ceiling, and batches get slower as prompts grow.

**How caught:** Live narration by user during the test. Exactly what Phase 1g-test was designed to surface.

**Corrections applied (this session):**
- Full findings captured in `KEYWORD_CLUSTERING_ACTIVE.md` §6.5 with fix recommendations per bug
- Phase 1g-test follow-up added as top priority for next session in `ROADMAP.md`
- Phase 1-polish list expanded with: overlay resize/move, Budget input UX fix, persist AA settings to UserPreference, UI warning for Adaptive+large-prompt combo

**Prevention:** These are product bugs, not process mistakes. They're prevented in future runs by tuning defaults (Thinking=Enabled-12k as default), broadening the Mode A→B trigger, and surfacing UI hints. All logged.

---

### 2026-04-18 — Documentation drift: `kst_aa_*` localStorage keys claimed to exist, actually don't
**Session:** session_2026-04-18_phase1g-test-kickoff (Claude Code)
**Tool/Phase affected:** Documentation accuracy / Auto-Analyze
**Severity:** Medium (mid-session time loss; user blocker on what was assumed to be a recoverable prompt)

**What happened:** At start of Phase 1g-test, the user opened the Auto-Analyze panel and the Initial Prompt textarea was empty. Prior docs (`DATA_CATALOG.md` §5.8 + `KEYWORD_CLUSTERING_ACTIVE.md` §4) claimed the prompts persist in localStorage under keys `kst_aa_initial_prompt` and `kst_aa_primer_prompt`. Claude grepped the codebase and confirmed those keys **do not exist anywhere in `/src/`** (zero matches). The only AA-related localStorage key is `aa_checkpoint_{Project.id}` (and note: uses `Project.id`, not `ProjectWorkflow.id` as the docs also claimed). Settings (including prompts) live only in React component state before a run starts, and are bundled into the checkpoint only after `saveCheckpoint()` fires.

**Root cause:** Likely origin — the original legacy KST HTML (pre-Phase 0) may have used those key names. When the tool was ported to the Next.js app, the localStorage logic was simplified to only checkpoint-based persistence. The handoff docs were written with the original key names in mind and never got a Pattern-3 (code is source of truth) verification pass.

**How caught:** Claude's start-of-session grep when the empty prompt was encountered. User had assumed (based on docs) that the prompts would be auto-loaded. They had to paste both prompts manually from their own saved text files.

**Correction (applied this session):**
- `DATA_CATALOG.md` §5.8 rewritten to reflect actual behavior + explicit note that the old key names don't exist
- `DATA_CATALOG.md` §5.9 corrected to `Project.id` (was `projectWorkflowId`)
- `KEYWORD_CLUSTERING_ACTIVE.md` §4 rewritten with correction + practical UX implication
- New follow-up task: commit canonical `docs/AUTO_ANALYZE_PROMPT_V2.md` so the prompts live in the repo (not scattered across user's laptop)

**Prevention:** Pattern 3 (code is source of truth) applies. When docs assert "localStorage key X exists" or "data persists at location Y," any session that depends on that claim should verify with a grep before acting. Adding a general corollary to Pattern 7: **claims about runtime state and persistence are doc-drift risks; verify against code.**

**Meta-lesson:** Prompts (and similar artifacts required for tool operation) should live in the **repo**, not in browser localStorage that "might persist." Commit-it-or-it-didn't-happen applies to required operational content just as it does to code.

---

### 2026-04-17 — Pattern 7 recurrence: `/projects/[projectId]/page.tsx` claimed built in Ckpt 6 but never existed — discovered post-production-deploy
**Chat URL:** https://claude.ai/chat/75cc8985-b70a-49f4-8b64-444c34ef541f
**Tool/Phase affected:** Phase M / Ckpts 6, 7, 8, 9 (all silently complicit)
**Severity:** High (shipped a broken happy-path route to production; recovered same-chat with Ckpt 9.5)

**What happened:** During Ckpt 9's visual verification on vklf.com post-deploy, clicking a Project's title on `/projects` went to a 404. Diagnostic `ls` confirmed `src/app/projects/[projectId]/page.tsx` did not exist on disk. **No one had ever built it.** Despite Ckpt 6's `CHAT_REGISTRY.md` entry claiming "Two new files created: `src/app/projects/page.tsx` (~1,493 lines) and `src/app/projects/[projectId]/page.tsx` (~372 lines)" — and despite `ROADMAP.md`, `PLATFORM_ARCHITECTURE.md` §3, and `NAVIGATION_MAP.md` all asserting the file existed as a live route — the file was not in the repo at any point from Ckpt 6 onward.

This chat's Task 0 build output gave an explicit warning: `/projects/[projectId]` did NOT appear as a standalone route in the build table, only `/projects/[projectId]/keyword-clustering` did. **Claude flagged this anomaly during Task 0** and wrote: *"If you want me to verify right now that `/projects/[projectId]/page.tsx` exists on disk, I can — but it's not necessary to proceed."* The decision to defer that verification to Task 6 (post-deploy visual check) was a direct failure of Rule 3 (code is source of truth) and Pattern 7 (plan drift verification). The one-line `ls` check would have cost ~5 seconds and caught the bug pre-deploy.

**Root cause (a chain of compounding failures):**
1. **Ckpt 6 chat** (chat `7a745b12-...`) most likely wrote this file to its sandbox `/mnt/user-data/outputs/` and either (a) never told the user to place it in the repo, or (b) wrote a command referencing a sandbox-only path, or (c) the `present_files` link was missed. Whatever happened, the file never landed in the user's Codespaces.
2. **End-of-Ckpt-6 handoff docs** confidently reported the file as built — Claude couldn't verify because of the Codespaces PORTS glitch (no local visual testing possible) and didn't run `ls` to verify file existence.
3. **Ckpts 7 and 8** didn't notice — neither chat had reason to touch the detail page, and its absence was silent (Next.js routing tolerates missing `page.tsx` in a folder that has subfolder routes — it just doesn't produce a route at that level).
4. **Ckpt 9's Task 0** had the diagnostic signal (`/projects/[projectId]` missing from route table) but Claude treated it as "implicit in the nested route" and deferred investigation.
5. **Visual verification post-deploy** finally caught it, but only because the user hit the 404 directly.

**How caught:** User's visual verification on vklf.com — specifically the "clicking project title → 404" and "KC page's Back to Project → 404" reports in Task 6.

**Correction:** Fix 3 of Ckpt 9.5 — built `src/app/projects/[projectId]/page.tsx` (487 lines) from scratch this chat. Matches the pattern of the existing `keyword-clustering/page.tsx` for URL-param reading + auth + fetch + error states. Pulls Project info via `GET /api/projects/[projectId]` and workflow statuses via `GET /api/project-workflows/[projectId]` in parallel. Renders 15-card workflow grid; clicking Keyword Analysis navigates into KC; clicking others shows a coming-soon toast. Error handling: 404 = "This Project no longer exists", 403 = "You do not have access to this Project", other errors = "Could not load this Project." Committed as `fcf2373`; deployed; verified working.

**Prevention — Pattern 7 mitigation strengthened (see below).**

**Key lesson:** When build output contradicts docs, investigate immediately. Do not defer "that's interesting but probably fine" observations about build output — treat them as Pattern 3 (silent fallback to tool knowledge) triggers. The cost of a 5-second `ls` is trivial; the cost of shipping a broken happy-path to production is substantial (requires visual verification to catch, requires follow-up fix deploy, erodes user trust in doc claims).

**Meta-lesson:** The handoff doc system's greatest weakness is that it trusts what prior chats reported. When four consecutive chats all say "it's built," it feels pedantic to doubt them. But "built" has to mean "verifiable on disk," not "was written to sandbox and claimed to be installed." Any chat working on files that originated in a prior chat's `/mnt/user-data/outputs/` should verify existence with `find` or `ls` as a first step. This is a corollary to Rule 3 and Pattern 7 that deserves its own naming — perhaps a future refinement to Pattern 7's wording in a subsequent chat.

---

### 2026-04-17 — `sed | tr` quoting pattern failed on first `git rm` batch; switched to `xargs -d '\n'`
**Chat URL:** https://claude.ai/chat/75cc8985-b70a-49f4-8b64-444c34ef541f
**Tool/Phase affected:** Methodology / Ckpt 9 cleanup
**Severity:** Low (caught immediately via error output; trivial retry)

**What happened:** During Ckpt 9 Task 3A (deleting 40 committed `.bak` files via `git rm`), Claude's command wrapped file paths in literal double-quotes via `sed 's/.*/"&"/'` and joined with `tr '\n' ' '`, then fed them to `git rm` through `$(...)`. The intent was to safely escape paths containing `[projectId]` brackets. But bash's word-splitting passed each quoted string as an argument WITH the quote characters still present as literals. git saw `"src/app/api/admin-notes/[noteId]/route.ts.bak"` (quote-as-character) as a pathspec, which doesn't match any file. Error: `fatal: pathspec '"src/app/...route.ts.bak"' did not match any files`.

**Root cause:** Overthought the quoting. `git rm` doesn't need brackets quoted — git's pathspec parser handles `[` and `]` as literals. The `sed` wrap added poisonous literal quotes. Should have tested the pattern in Claude's sandbox before giving it to the user.

**How caught:** Claude's own shell chain `&&` stopped execution after the error; user saw the error immediately in the output and reported it without damage.

**Correction:** Retried with `git ls-files | grep '\.bak' | xargs -d '\n' git rm`. The `xargs -d '\n'` reads one path per line and passes each as a clean argument — no quoting needed. Worked first try. All 40 files removed cleanly.

**Prevention — rule update:**
- **For passing file lists to git commands (or any command), default to `xargs -d '\n'`** rather than inventing shell-quoting schemes.
- **Test complex shell one-liners in Claude's sandbox before giving them to the user.** Claude has `bash_tool` access in the sandbox — use it for dry-runs of quoting-heavy patterns before shipping the command to the user's terminal.

**Meta-lesson:** The "clever one-liner" reflex in shell scripting is the enemy. Boring, well-trodden idioms (`xargs -d '\n'`, `read` loops) are more reliable than bespoke `sed` pipelines, even when they look more verbose.

---

### 2026-04-17 — /docs/ folder had 3 empty subfolders from April 6 that weren't in any Group A doc
**Chat URL:** https://claude.ai/chat/75cc8985-b70a-49f4-8b64-444c34ef541f
**Tool/Phase affected:** Repo state / Ckpt 9 `/docs/` setup
**Severity:** Low (inspection caught it, handled cleanly, no damage)

**What happened:** When Ckpt 9's Task 2 ran its initial repo-state inspection, `ls docs/` returned three empty subfolders: `docs/legacy/`, `docs/primers/`, `docs/workflows/` — existing since April 6 (before Phase D documentation overhaul), never populated, never tracked in git (git doesn't track empty folders). No Group A doc mentioned their existence. Ckpt 9's briefing assumed `/docs/` didn't exist and would be created fresh.

**How caught:** Claude's `ls docs/` during the drift check. Immediately flagged as a discrepancy, investigated via follow-up inspection command, confirmed empty, proposed clean deletion, user approved.

**Correction:** All three subfolders deleted by Ckpt 9's setup script. `/docs/` is now cleanly populated with 15 handoff docs, zero stale subfolders.

**Prevention:** Start-of-chat drift check in HANDOFF_PROTOCOL §2 already covers "verify code/repo state against doc claims" — this is a specific instance. No rule change needed, but worth logging as a reminder that **repo state can contain silent leftovers that aren't in any doc** — empty folders, dangling configs, old CI files, etc. The reflex to ignore "empty" things is wrong; empty is still state.

**Meta-lesson:** When the drift check surfaces an unexplained repo artifact, chase it to a known answer rather than defaulting to "probably nothing." The cost is a single `find` or `ls` command.

---

**Chat URL:** https://claude.ai/chat/fc8025bf-551a-4b3c-8483-ec6d8ed9e33c
**Tool/Phase affected:** Methodology / Entire project execution going forward
**Severity:** Informational (not a mistake — a strategic decision captured in the log so future Claudes understand the lineage)

**What happened:** After Phase M Ckpt 8 complete, the user asked whether the claude.ai copy-paste round-trip cost could be automated. Claude explained Claude Code (Anthropic's CLI tool that runs inside Codespaces, reads files directly, executes commands itself) as the answer. User confirmed cost is not a constraint and asked for the best methodology. Claude recommended migration to Claude Code for Phase 1g-test and all subsequent work.

User decided:
- **Timing:** Finish Phase M Ckpt 9 in claude.ai (safer — the highest-stakes deploy step stays in the known-good tool), THEN migrate to Claude Code for Phase 1g-test kickoff.
- **Scope:** TOP PRIORITY post-Ckpt-9 roadmap item.
- **Docs location:** `/docs/` at repo root (Option X) — gives Ckpt 9's legacy-location cleanup a proper home AND sets up Claude Code's filesystem access.

**Root cause (why the switch is happening):** Two drivers:
1. **Round-trip cost.** Every command in claude.ai requires user paste-in → output paste-back. Ckpt 8 had 20+ such round-trips. This fatigues the user and multiplies the chance of transcription errors.
2. **Pattern 11 recurrence.** The non-programmer rule has had to be re-stated by the user manually in 4 consecutive chats despite documentation escalation. The architectural cause — Claude in claude.ai cannot run commands itself, so is constantly asking the user to do things — partially disappears in Claude Code where Claude has direct execution.

**How caught:** Not a "catch" — proactive question from the user during end-of-chat wrap-up.

**Correction:** New Group A doc `CLAUDE_CODE_MIGRATION.md` (#13) produced this chat. New starter-prompt file `CLAUDE_CODE_STARTER.md` produced this chat. Updates made to: `ROADMAP.md` (Ckpt 9 scope expanded to include `/docs/` setup; migration added as top-priority post-Ckpt-9 item), `HANDOFF_PROTOCOL.md` (new §9 on Claude Code vs. claude.ai applicability), `DOCUMENTATION_ARCHITECTURE.md` (new §15 on doc system evolution), `NEW_CHAT_PROMPT.md` (Ckpt 9 objective includes /docs/ setup; post-Ckpt-9 section flags migration readiness), `DOCUMENT_MANIFEST.md` (Group A count → 13).

**Prevention:** N/A — this isn't a failure pattern. But the decision is logged here so:
- Future Claude Code sessions can reference this entry to understand WHY the project switched tools
- If the switch causes unforeseen issues, the rollback criteria are captured (see `CLAUDE_CODE_MIGRATION.md` §8)
- If the switch succeeds (expected), this entry becomes historical context

**Lesson for future methodology changes:** Don't switch tools and take on high-stakes work simultaneously. Phase M Ckpt 9 (deploy) stays in the known-good tool; the switch happens at a natural boundary (start of Phase 1g-test). Low-risk transition.

**Meta-lesson:** User's proactive question about automation was GOOD — exactly the kind of zoom-out the doc system has been encouraging. Rewarded with a strategic improvement.

---

### 2026-04-17 — Asked user to "paste the file" without a concrete command — Pattern 11 recurrence mid-chat (FOURTH consecutive chat)
**Chat URL:** https://claude.ai/chat/fc8025bf-551a-4b3c-8483-ec6d8ed9e33c
**Tool/Phase affected:** Methodology / Phase M Checkpoint 8 execution
**Severity:** High (Pattern 11 recurrence — now FOURTH consecutive chat where user had to manually enforce the non-programmer rule despite heavy documentation)

**What happened:** After the user answered the card-click design question and Option A was locked in, Claude needed to read two files from the user's repo (`src/app/dashboard/page.tsx` and `src/app/plos/page.tsx`) to draft the edit plan. Claude asked: *"Could you paste the contents of each, or if they're long, just paste them and I'll read through carefully?"* and *"You don't need to upload them as files — just paste the contents in your next message."*

The user (correctly) called this out: *"Please note that I am a complete novice and will need you to either give me terminal commands or walk me step by step through everything you want me to do. This problem seems to keep lingering despite having not only instructed you so in every chat we've had but also asking you to make increasingly stringent rules..."*

The mistake: "paste the file" treats "opening a file and copying its contents" as a trivial action — which for a programmer, it is (Cmd-click, select-all, copy, paste). For a non-programmer it's ambiguous: which editor? How do I select all? What if it's a huge file? Claude's mental model silently assumed the user would know the mechanics, even though Pattern 11 explicitly calls out this class of slip as a structural problem with LLM attention.

**Root cause:** This is the Pattern 11 meta-pattern in action AGAIN. The rules exist (HANDOFF_PROTOCOL Rules 14a–14e, the big NEW_CHAT_PROMPT banner, this log's Pattern 11 entry). Claude read them at start-of-chat, ran the Read-It-Back test on the decision question about card-click behavior (that one passed), then let the test slip for a subsequent "paste the file" request because it felt too banal to run the test on. The Read-It-Back test was being applied to **questions framed as decisions**, not to **instructions framed as tasks**. That's the gap.

Every instruction Claude gives — whether a decision question or a "please do X" request — must pass the same non-programmer-readable test. "Paste the file" fails. "Paste this command into your terminal and send me the output" passes.

**How caught:** User directly, at turn ~8 in the chat, with explicit reference to the recurring nature of the problem.

**Correction:**
- Acknowledged the recurrence openly, including acknowledging that Pattern 11 was already logged and documentation had been amped up in the prior chat — the slip happened anyway
- Gave the user a concrete terminal command (`cat src/app/pms/notes/page.tsx && head -60 src/components/AdminNotes.tsx`) that solved the original need
- Explicitly committed in-chat: *"Going forward in this chat, I'll hold myself to that. If I slip again, call it out."*
- No further slips occurred in the remaining steps (heredoc-based Python edit scripts were all delivered as ready-to-paste commands with verification output blocks)

**Prevention:**
- **Extended Rule 14a scope.** The Read-It-Back test isn't just for "decision questions" — it's for **every instruction Claude gives the user, including data-gathering requests, build commands, and "please share X" requests**. Any ask that would require the user to do something with a file, a keyboard, a browser, or a mouse must come with an exact terminal command or a numbered click-path. "Paste the contents" / "share the file" / "upload your code" / "show me your config" are all forms of the same slip.
- **New rule in spirit:** the phrase "paste it in" is a forbidden instruction unless it's followed immediately by "by running this command" or "by doing these clicks in this order."
- **Mechanical test addition:** Before sending any message that asks the user to do something, Claude scans the message for any imperative verb ("paste," "share," "upload," "show me," "send me," "give me," "look up") and confirms each one is paired with a concrete method (a terminal command, a click-sequence, an ask_user_input_v0 tool call). If any imperative verb is orphaned, rewrite.
- **Pattern 11 update:** The recurrence count is now FOUR chats. The fact that documentation was substantially escalated between Ckpt 7 and this chat — and the slip happened anyway — confirms the Pattern 11 diagnosis that this is a visibility-under-load issue that documentation alone cannot fully solve. The fix is mechanical habit reinforcement every single instruction, not just "more emphasis in docs." See updated Pattern 11 below.

**Lesson:** The Read-It-Back test is easy to run on obvious questions and easy to skip on banal requests. The slip happens in the small requests, not the big ones. Mechanical tests must cover the whole surface, not just the decision questions.

**Meta-lesson for future Claudes:** When the user's cognitive cost of completing your request exceeds the cognitive cost of you figuring out the command to pre-empt their work, you've failed the non-programmer rule. Always pre-empt.

---

### 2026-04-17 — Pre-existing .bak/untracked files in git status handled via Option A clean split (procedural pattern — NOT a mistake, but a pattern future chats need to apply)
**Chat URL:** https://claude.ai/chat/fc8025bf-551a-4b3c-8483-ec6d8ed9e33c
**Tool/Phase affected:** Methodology / Phase M commit hygiene
**Severity:** Informational (not a mistake — a procedural pattern being formalized)

**What happened:** During Ckpt 8's commit step, Claude ran `git add -A` expecting to stage only the 7 files from this chat's work. Instead, `git status` showed 20 staged files — the 7 from this chat plus 13 pre-existing files from prior Phase M chats (Ckpts 1–5):
- `prisma/schema.prisma.bak` (from Ckpts 1–4 schema refactor)
- Nine `.bak` files in `src/app/api/projects/[projectId]/` (from Ckpt 5 API route rewrite)
- `src/lib/auth.ts.bak` (from Ckpt 5)
- `src/app/HANDOFF.md` and `src/app/ROADMAP.md` (legacy in-repo docs, modified at some point but never committed; slated for relocation/deletion in Ckpt 9)

These 13 files had been sitting untracked/unstaged in the user's repo across Ckpts 5, 6, and 7 — each prior chat had correctly committed only its own work and left them. Claude's `git add -A` swept them in accidentally.

**Root cause:** `git add -A` is a broad brush. It correctly stages everything in the working tree, including pre-existing untracked/modified files the current chat did not touch. A more surgical approach — `git add <specific paths>` — would have avoided the issue but adds per-chat ceremony.

**How caught:** Claude noticed the mismatch on its own before committing (the staged file list did not match the expected 7-file list from the plan) and surfaced the issue to the user. User chose **Option A (clean split)** from 3 offered options, unstaged the 13 leftovers, and committed only the 7 chat-specific files.

**Correction:** Unstaged 13 files via `git reset HEAD <paths>`. Committed only the 7 chat-specific files as `ac62a3a "Phase M Ckpt 8: ..."`. Branch is now 4 commits ahead of origin/main (was 3 before).

**Prevention — PROCEDURAL PATTERN (read this, future chats):**

**Every Phase M chat until Ckpt 9 MUST follow this procedure when committing work:**

1. After making its own file changes, Claude runs `git status` and explicitly lists which files the current chat touched vs. which are pre-existing leftovers.
2. The staged set (`git add`) MUST contain ONLY the current chat's files. Use specific paths, not `git add -A`.
3. If `git add -A` is used by mistake (or the user suggests it), Claude must run `git status` afterwards, identify leftovers, and unstage them with `git reset HEAD <paths>` before committing.
4. Leftovers are **not deleted** — they stay in the working tree for Ckpt 9 to handle properly.

**The canonical inventory of pre-existing leftovers (as of end of Ckpt 8):**

```
prisma/schema.prisma.bak
src/app/HANDOFF.md                                                    (modified, not committed)
src/app/ROADMAP.md                                                    (modified, not committed)
src/app/api/projects/route.ts.bak
src/app/api/projects/[projectId]/route.ts.bak
src/app/api/projects/[projectId]/canvas/route.ts.bak
src/app/api/projects/[projectId]/canvas/nodes/route.ts.bak
src/app/api/projects/[projectId]/canvas/pathways/route.ts.bak
src/app/api/projects/[projectId]/canvas/rebuild/route.ts.bak
src/app/api/projects/[projectId]/canvas/sister-links/route.ts.bak
src/app/api/projects/[projectId]/keywords/route.ts.bak
src/app/api/projects/[projectId]/keywords/[keywordId]/route.ts.bak
src/lib/auth.ts.bak
```

**13 total. Plus whatever `.bak` files arise from subsequent chats (e.g., `src/app/dashboard/page.tsx.bak` and `src/app/plos/page.tsx.bak` are now committed as of Ckpt 8; future chats may add more alongside their own edits).**

**Ckpt 9's cleanup scope includes all of the above** — per ROADMAP.md Ckpt 9 section and PLATFORM_ARCHITECTURE.md §10 Known Technical Debt.

**Lesson:** A clean commit stack is load-bearing for future legibility. `git log` must read as "Ckpt 5 did X, Ckpt 6 did Y, Ckpt 7 did Z, Ckpt 8 did W" — not "Ckpt 8 did W and also swept up a bunch of leftovers from three chats ago." The one-time cost of the Option A unstaging dance is worth the clarity.

---


**Chat URL:** https://claude.ai/chat/7e0b8456-b925-4460-a583-d348d1c965bf
**Tool/Phase affected:** Methodology / Phase M Checkpoint 7 execution
**Severity:** Low (caught immediately, no damage)

**What happened:** During Step 4 of the Checkpoint 7 execution, Claude told the user to run the command `mv /mnt/user-data/outputs/page.tsx "src/app/projects/[projectId]/keyword-clustering/page.tsx"` to install the new page file. The path `/mnt/user-data/outputs/` only exists inside Claude's own sandbox environment — not in the user's GitHub Codespaces. The `mv` command failed with "cannot stat: No such file or directory."

The user responded constructively with "Please tell me where exactly I need to add this file..." rather than trying to debug the broken command. Claude immediately pivoted to two clear alternatives (Codespaces file-explorer vs. terminal heredoc) and the problem was resolved in the next turn.

**Root cause:** Claude used the `create_file` tool to write the file to `/home/claude/page.tsx`, then used `present_files` to copy it to `/mnt/user-data/outputs/page.tsx` (Claude's output directory). Claude then constructed a `mv` command using the `/mnt/user-data/outputs/` path — which is Claude's environment's download origin, NOT a path visible to the user's terminal. Classic "sandbox path leak" — confusing Claude's environment paths with the user's environment paths.

The user's Codespaces terminal has no knowledge of `/mnt/user-data/outputs/`. It only sees the repo at `/workspaces/brand-operations-hub/`. For the user, a file created on Claude's side needs to be either (a) pasted into Codespaces' file explorer, or (b) created in the user's terminal via heredoc (`cat > ... << EOF`), or (c) downloaded by the user from the chat interface and then manually moved.

**How caught:** User — immediately, within one turn, without debugging time wasted.

**Correction:**
- Acknowledged the mistake openly in the next message
- Offered two clear alternatives: Codespaces file-explorer (Option A) and terminal heredoc (Option B)
- When Option A's shortcut (`../page.tsx` trick) didn't work in the user's version of Codespaces, pivoted smoothly to Option B
- File was installed successfully via `cat > ... << 'CLAUDE_EOF_MARKER'` heredoc pattern
- Line count verification (164 lines) confirmed nothing was lost in the copy-paste

**Prevention:**
- **Mental rule for future Claudes:** When generating a terminal command for the user, NEVER reference any path starting with `/mnt/`, `/home/claude/`, or any other Claude-sandbox path. The user's terminal operates only inside `/workspaces/brand-operations-hub/`.
- **Default method for delivering file content to the user's repo:** For small-to-medium files (under ~200 lines), use the heredoc `cat > "path" << 'MARKER' ... MARKER` pattern — the file content is embedded directly in the command, so no cross-environment path issue. For larger files, paste the content into a code block and have the user paste it into Codespaces' file-explorer New File flow.
- **If Claude has used `present_files` to produce a downloadable file:** That file is for the user's download button in the chat UI, not for terminal `mv`. Claude should not mention the `/mnt/user-data/outputs/` path to the user.
- **Pattern 12 added below** to capture the general rule.

**Lesson:** Claude has two environments (its own sandbox + the user's Codespaces) with different filesystems. Every command Claude gives the user must use ONLY paths that exist in the user's environment. Claude's own paths are internal plumbing and must not appear in user-facing commands.

---

### 2026-04-17 — Gave user a terminal command with a sandbox-only path
**Chat URL:** https://claude.ai/chat/7e0b8456-b925-4460-a583-d348d1c965bf
**Tool/Phase affected:** Methodology / Phase M Checkpoint 7 execution
**Severity:** Low (caught immediately, no damage)

**What happened:** During Step 4 of the Checkpoint 7 execution, Claude told the user to run the command `mv /mnt/user-data/outputs/page.tsx "src/app/projects/[projectId]/keyword-clustering/page.tsx"` to install the new page file. The path `/mnt/user-data/outputs/` only exists inside Claude's own sandbox environment — not in the user's GitHub Codespaces. The `mv` command failed with "cannot stat: No such file or directory."

The user responded constructively with "Please tell me where exactly I need to add this file..." rather than trying to debug the broken command. Claude immediately pivoted to two clear alternatives (Codespaces file-explorer vs. terminal heredoc) and the problem was resolved in the next turn.

**Root cause:** Claude used the `create_file` tool to write the file to `/home/claude/page.tsx`, then used `present_files` to copy it to `/mnt/user-data/outputs/page.tsx` (Claude's output directory). Claude then constructed a `mv` command using the `/mnt/user-data/outputs/` path — which is Claude's environment's download origin, NOT a path visible to the user's terminal. Classic "sandbox path leak" — confusing Claude's environment paths with the user's environment paths.

The user's Codespaces terminal has no knowledge of `/mnt/user-data/outputs/`. It only sees the repo at `/workspaces/brand-operations-hub/`. For the user, a file created on Claude's side needs to be either (a) pasted into Codespaces' file explorer, or (b) created in the user's terminal via heredoc (`cat > ... << EOF`), or (c) downloaded by the user from the chat interface and then manually moved.

**How caught:** User — immediately, within one turn, without debugging time wasted.

**Correction:**
- Acknowledged the mistake openly in the next message
- Offered two clear alternatives: Codespaces file-explorer (Option A) and terminal heredoc (Option B)
- When Option A's shortcut (`../page.tsx` trick) didn't work in the user's version of Codespaces, pivoted smoothly to Option B
- File was installed successfully via `cat > ... << 'CLAUDE_EOF_MARKER'` heredoc pattern
- Line count verification (164 lines) confirmed nothing was lost in the copy-paste

**Prevention:**
- **Mental rule for future Claudes:** When generating a terminal command for the user, NEVER reference any path starting with `/mnt/`, `/home/claude/`, or any other Claude-sandbox path. The user's terminal operates only inside `/workspaces/brand-operations-hub/`.
- **Default method for delivering file content to the user's repo:** For small-to-medium files (under ~200 lines), use the heredoc `cat > "path" << 'MARKER' ... MARKER` pattern — the file content is embedded directly in the command, so no cross-environment path issue. For larger files, paste the content into a code block and have the user paste it into Codespaces' file-explorer New File flow.
- **If Claude has used `present_files` to produce a downloadable file:** That file is for the user's download button in the chat UI, not for terminal `mv`. Claude should not mention the `/mnt/user-data/outputs/` path to the user.
- **Pattern 12 added below** to capture the general rule.

**Lesson:** Claude has two environments (its own sandbox + the user's Codespaces) with different filesystems. Every command Claude gives the user must use ONLY paths that exist in the user's environment. Claude's own paths are internal plumbing and must not appear in user-facing commands.

---

### 2026-04-17 — User had to repeat "I'm a non-programmer, use plain language" — THIRD consecutive chat
**Chat URL:** https://claude.ai/chat/7a745b12-efdf-4adf-a2b4-bf11716f971b
**Tool/Phase affected:** Methodology / Start-of-chat protocol
**Severity:** High (recurring — same class of issue repeatedly caught by user)

**What happened:** On the user's second message of the chat, the user had to explicitly state: "I am a complete novice and not a programmer so you will have to refrain from using technical language. [...] this was explicitly mentioned to you in many past chats but I've had to repeat this in every chat despite asking you to include a note to this effect in the handoff instructions you provide at the end of the chat so that this issue does not reappear in any future chats."

The user was not reacting to a specific jargon incident in this chat — they were pre-empting, because experience across multiple prior chats had taught them that future Claudes would need this reminder regardless of what was in the docs. The reminder itself has been documented in: `HANDOFF_PROTOCOL.md` Rules 14–14e, `PROJECT_CONTEXT.md` §13, `NEW_CHAT_PROMPT.md` opening paragraphs, and `CORRECTIONS_LOG.md` Pattern 8.

**Root cause:** This is a META-pattern — the rules exist, they're prominent, but Claudes still slip mid-chat under cognitive load. The rules live in documents that Claude reads at start-of-chat, but by turn 15+, the most recent turns dominate attention and the plain-language discipline slowly degrades. The "Read It Back" mechanical test (Rule 14a) only helps if Claude runs it on every question; under load, it gets skipped.

Additionally: past end-of-chat handoffs have presumably included some version of "please be careful about technical language" in the next-chat instructions, but clearly not prominently enough, because the user has had to repeat the instruction by hand in each new chat.

**How caught:** User caught directly at turn 2 — pre-emptively.

**Correction:**
- Acknowledged the recurrence openly to the user rather than minimizing or promising to "try harder"
- Explained honestly WHY the slip keeps happening (recent-turn dominance, mechanical test skipping under load)
- Committed to three concrete fixes for the next chat: (1) add a prominent top-of-file communication banner to `NEW_CHAT_PROMPT.md` so it's the FIRST thing Claude reads, not buried in paragraph 4; (2) log this recurrence as a meta-pattern in CORRECTIONS_LOG (this entry); (3) add a mandatory bullet to the Personalized Handoff Message template flagging the recurrence

**Prevention:**
- **New: Top-of-`NEW_CHAT_PROMPT.md` banner** with loud, visual formatting stating the user has had to repeat this instruction in multiple chats and that mechanical discipline (Rules 14a–14e) is non-negotiable. See the updated `NEW_CHAT_PROMPT.md` for the exact wording.
- **Pattern 11 (below)** formalizes this as a meta-pattern: when an instruction has to be repeated by the user for ≥3 chats, the documentation containment is insufficient and the instruction needs to be escalated in visibility (moved higher in the docs, repeated in more places, given mechanical enforcement).
- **Claude's internal discipline check:** before sending any question to the user, read it back looking for any word that would require domain/programming knowledge. If found, rewrite. This has been Rule 14a since mid-April; compliance has been uneven.

**Lesson:** Documentation is necessary but insufficient for preventing communication-discipline slips. The slip is partially a product of how LLMs work (recent attention > distant attention), which means no amount of rule-writing fully solves it. What helps: (1) putting the reminder in the MOST attention-grabbing position in the most-read doc, (2) making the reminder visually impossible to miss, (3) repeating it in more than one doc, (4) having the user call it out early so mid-chat attention weighting keeps it fresh.

**Meta-lesson:** When the same instruction has been necessary in multiple chats AND was already in the docs — the problem is not that Claude doesn't know it. The problem is visibility-under-load. Fix that, not the knowledge.

---

### 2026-04-17 — Buried the search-box feature in a one-liner at the bottom of the recap
**Chat URL:** https://claude.ai/chat/7a745b12-efdf-4adf-a2b4-bf11716f971b
**Tool/Phase affected:** `/projects` page design (Phase M Ckpt 6)
**Severity:** Low (caught immediately by user asking for the already-planned feature)

**What happened:** After the 4 product decisions were locked in, Claude produced a "Recap — the full `/projects` page design" section. The 4 decisions + the 2 previously-locked decisions from the prior chat were in a clear numbered table. The 3 scale-aware features (search bar, filter controls, sort controls) were appended below the table as a 3-bullet list with no framing.

The user responded by submitting a feature request: "can you add a search box at the top." The search box was already in the plan — literally one of the three bullets — but the user hadn't seen it because it was positioned as supporting info rather than part of the design.

**Root cause:** When summarizing design decisions, Claude gave prominent visual weight to the things the user had just decided (the 4 decisions + 2 prior ones) and less weight to things that Claude had already incorporated autonomously (search, filter, sort). From Claude's perspective these were "obvious" additions to a scale-aware list page. From the user's perspective, everything in the design needed equal visibility since they couldn't be expected to remember what Claude planned to build automatically.

**How caught:** User directly, via the feature request (which Claude correctly identified as already-in-scope).

**Correction:** Pointed user to the bullet, confirmed search was already included, proceeded with build.

**Prevention:** Added new bullet to `NEW_CHAT_PROMPT.md` critical-communication-rules: "Equal visual weight in design recaps — when summarizing a design, features Claude added autonomously get the SAME prominent framing as features the user explicitly decided." Future design recaps should treat all features equally in visual weight — no demotion of autonomous additions to "supporting info" status.

**Lesson:** The user can't distinguish between "things I decided" and "things Claude added automatically" unless Claude structures the recap to show them with equal weight. Recaps are for the user, not for Claude's own bookkeeping.

---

### 2026-04-17 — Did not proactively flag the local-storage-vs-database distinction for Dashboard card edits
**Chat URL:** https://claude.ai/chat/7a745b12-efdf-4adf-a2b4-bf11716f971b
**Tool/Phase affected:** Dashboard card edit pencils / data persistence design
**Severity:** Medium (missed an important product-decision moment)

**What happened:** User asked how to remove the edit pencils from the Dashboard system cards. Claude answered literally and gave instructions for removing them. The user had to re-engage with a follow-up asking why the edits needed to be removed — which forced Claude to surface the real underlying problem: edits were saving only to the user's own browser (localStorage), not to the database. In a multi-user future (Phase 2+), this means every worker would see a different name for the "PLOS" card depending on which browser they happened to be using, and would never see admin's edits.

**Root cause:** Claude treated the "remove edit pencils" request as a UI decision when it was actually a data-persistence decision. Claude should have recognized that the user's concern about "do I even want to edit these" was downstream of a concern that wasn't yet explicit: the edits don't actually do what they appear to do in a multi-user setting.

**How caught:** User, by asking "why are we removing them?" when Claude proposed removal.

**Correction:** Surfaced the real issue, presented three options (keep as-is, remove, migrate to DB), user chose to defer to Phase 2 rather than band-aid now. Added roadmap item: "Migrate card-label edits (3 system cards + 14 workflow cards) from local storage to database."

**Prevention:** Added to `NEW_CHAT_PROMPT.md` critical-communication-rules: "Persistence decisions need explicit framing — when data will save to local storage vs. database, explain in plain terms what that means for the user (syncs across devices? visible to workers? survives cache clears?). Never bury this as a parenthetical."

**Lesson:** Data persistence is a product decision, not an implementation detail. The difference between localStorage and database is user-visible (per-device vs. shared, transient vs. durable). Every persistence choice should be surfaced to the user at design time, not assumed.

---

### 2026-04-17 — Initially acted as if Claude had direct repo access when it didn't
**Chat URL:** https://claude.ai/chat/7a745b12-efdf-4adf-a2b4-bf11716f971b
**Tool/Phase affected:** `/projects` page build (Phase M Ckpt 6) — step "read existing pages to understand visual vocabulary"
**Severity:** Low (caught immediately)

**What happened:** When Claude wanted to examine `/dashboard` and `/plos` to match visual style, it initially spoke as if it could look at the files directly — "let me pull up the Dashboard file..." — instead of asking the user to share the relevant code.

**Root cause:** Conflation between Claude's own file-viewing tools (which access Claude's sandbox, not the user's repo) and the user's repo (which Claude cannot access without user mediation).

**How caught:** Claude self-corrected within one message.

**Correction:** Asked user to paste the relevant sections. (Same class of mistake as the sandbox-path leak 2026-04-17 above.)

**Prevention:** **Pattern 12 below** formalizes this as a general rule.

---

### 2026-04-17 — Platform architectural reveal forced mid-chat pivot (Ckpt 6 → PLATFORM_REQUIREMENTS creation)
**Chat URL:** https://claude.ai/chat/cc15409c-5000-4f4f-a5ce-a42784b5a94f
**Tool/Phase affected:** Platform / Entire handoff system
**Severity:** High (prevented rework; would have been Critical if caught later)

**What happened:** During Ckpt 6's Decision 2 (card at-rest content), Claude asked a scale-context question — "thinking ahead, roughly how many Projects do you imagine being in-flight simultaneously once this is fully in use?" The user's answer — "500 Projects per week, ramping to 5,000 — with 50 concurrent workers" — revealed that Claude had been designing the platform for a fundamentally different scale (one-admin-one-dashboard) than the actual target (multi-worker production floor). Ckpt 6 design was mid-flight and would have shipped as small-scale UX. Chat pivoted: paused Ckpt 6, conducted platform-wide interview, created `PLATFORM_REQUIREMENTS.md`, updated multiple Group A docs.

**Root cause:** Claude never asked about operational scale until mid-build. The existing handoff docs did not capture scale targets, user model, concurrency, review cycle, or audit — all of which are platform-level facts that shape every workflow design. The Ckpt 6 design was proceeding on an implicit assumption (small-Project-count admin UI) that was never validated.

**How caught:** Claude's own scale-context question during decision-framing (a Rule 16 zoom-out instinct, deployed too late to be fully preventive but early enough to avoid rework).

**Correction:** Paused Ckpt 6. Conducted 5-cluster platform interview. Created PLATFORM_REQUIREMENTS.md. Updated PROJECT_CONTEXT, PLATFORM_ARCHITECTURE, DATA_CATALOG, ROADMAP, DOCUMENTATION_ARCHITECTURE, HANDOFF_PROTOCOL.

**Prevention:**
- **New Rule 18 in HANDOFF_PROTOCOL** — mandatory Workflow Requirements Interview before any new workflow build
- **New Rule 19 in HANDOFF_PROTOCOL** — Platform-Truths Audit at end of every interview
- **Pattern 9 below** — platform-level requirements need their own dedicated doc
- Going forward, Phase 1 work happens under known scale context. Phase 2 scaffold design happens with the interview pattern locked in.

**Meta-lesson:** Scale context is a platform-level truth that should be asked about in chat #1 of every new phase. It's not a workflow-specific detail.

---

### 2026-04-17 — Generalized from N=1 when discussing workflow architecture
**Chat URL:** https://claude.ai/chat/cc15409c-5000-4f4f-a5ce-a42784b5a94f
**Tool/Phase affected:** Methodology / Workflow Requirements Interview design
**Severity:** Medium (caught by user, would have led to over-engineering)

**What happened:** During the interview, Claude began speculating about what "most of the 13 upcoming workflows" would need based on patterns inferred from Keyword Clustering's complexity. User gently corrected: Keyword Clustering is an outlier, not a template — most of the other 13 workflows are closer to "structured form + file upload + review" than to a canvas application.

**Root cause:** Claude had one reference point (Keyword Clustering) and extrapolated from it. Classic N=1 generalization.

**How caught:** User directly.

**Correction:** Rethought the Shared Workflow-Tool Scaffold concept from scratch — not "what KC needs minus its canvas" but "what a simple form-and-review workflow needs, with KC being a special case that gets grandfathered in."

**Prevention:**
- **Pattern 10 below** — when designing shared infrastructure from one reference point, actively search for the inverse case rather than extrapolating
- Workflow Requirements Interview's Question 14 (scaffold fit) asks directly whether the workflow is a standard case or a special case
- The scaffold will be designed BEFORE workflow #2, not during it, so it's not biased by whichever workflow happens to be built second

---

### 2026-04-17 — Initial read of uploaded docs was too shallow
**Chat URL:** https://claude.ai/chat/cc15409c-5000-4f4f-a5ce-a42784b5a94f
**Tool/Phase affected:** Start-of-chat protocol
**Severity:** Low (caught before any work based on the skim)

**What happened:** When the chat started, the Pre-Flight Drift Check summary was based on header/section scanning of several long docs (particularly PROJECT_CONTEXT, PLATFORM_ARCHITECTURE) rather than end-to-end reading. Claude would have started design work with an incomplete picture if the scale reveal hadn't happened.

**Root cause:** Skipping parts of long docs ("I've got the gist") is tempting when the doc appears well-organized. It's false economy — the details missed often contain the constraints that shape the whole design.

**How caught:** Unclear if Claude self-corrected or user prompted more thorough reading.

**Correction:** Fully re-read all Group A docs before proceeding with platform interview.

**Prevention:** Added to `NEW_CHAT_PROMPT.md` MANDATORY START-OF-CHAT SEQUENCE Step 1: "End-to-end, not by section samples. Any doc with `< truncated lines N-M >` markers must be fully viewed with explicit range calls." Future chats: when a doc has truncation markers, explicitly view the truncated range.

---

_[Earlier entries preserved from prior chats — see file history for entries from 2026-04-16, etc.]_

---

## Patterns (meta-level rules extracted from multiple entries)

### Pattern 1 — Documentation gaps at shared state
Described in 2026-04-16 entries: when data crosses tool boundaries, the sharing contract must be documented in both places.

### Pattern 2 — Navigation assumptions
Described in 2026-04-16 entry: never invent a click path; always verify with code or user.

### Pattern 3 — Silent fallback to tool knowledge
Described in 2026-04-16 entry: when Claude's docs knowledge conflicts with code, trust the code.

### Pattern 4 — Incomplete verification before claiming done
Described in prior entries: "tests pass" means running tests, not inferring their outcome.

### Pattern 5 — Deploy without visual check
Described in prior entries: deploys are not confirmed until the user sees the live site.

### Pattern 6 — Schema drift across docs
Described in 2026-04-16 entry: when schema changes, every doc that references the old shape must be updated in the same chat.

### Pattern 7 — Plan drift between chats (UPDATED 2026-04-17 — serious recurrence in Ckpt 9)
Described originally in 2026-04-17 (Ckpt 5) entry and reinforced in 2026-04-17 (Ckpt 9) entry "Pattern 7 recurrence: `/projects/[projectId]/page.tsx` claimed built in Ckpt 6 but never existed — discovered post-production-deploy."

Plans are a snapshot; actual file listings may differ by the time the next chat runs the plan. **Originally-stated mitigation:** "Always verify file lists with `find`/`ls` before executing multi-file plans."

**Post-Ckpt-9 update (critical):** The original mitigation is insufficient. In Ckpt 9, a file that 4 consecutive prior chats claimed to have built (`/projects/[projectId]/page.tsx`) was never actually on disk. The file was probably written to a prior Claude's sandbox and claimed-as-installed but never landed in the user's Codespaces. Four chats' worth of handoff docs confidently asserted its existence. Only production-deploy visual verification caught it.

**Strengthened mitigation (applies to every future chat):**

1. **Any file that originated in a prior chat's `/mnt/user-data/outputs/` must be verified-present in the user's repo at the start of any chat that depends on it.** A single `ls` or `find` command is sufficient. This is NOT optional — it's the corollary to Rule 3 (code is source of truth) that catches the "was-written-to-sandbox-but-never-installed" class of failure.

2. **Build-output anomalies must be investigated immediately, not deferred.** If `npm run build` output shows something unexpected (missing route, unexpected warning, route-count mismatch), do `ls`/`find`/`grep` investigation BEFORE proceeding to any next step. "We'll confirm during visual verification" is the wrong response — visual verification may only happen post-deploy, and some anomalies only become bugs visible in specific user paths.

3. **When the doc system says "X was built in Ckpt N," treat that as a claim to verify, not a fact.** The phrase-pattern to look for: any doc sentence asserting file existence or route existence written by a prior chat. If a current task depends on the asserted fact, verify.

**Trigger condition:** Build output anomaly OR doc claim of "X exists" that's material to current work → immediate verification via `ls`/`find`/`grep`.

**Recurrence count as of Ckpt 9:** 2 (first Ckpt 5, then Ckpt 9). Each recurrence has been substantially more expensive (Ckpt 5's was caught in-chat; Ckpt 9's shipped to production before being caught).

### Pattern 8 — Communication level slips under complexity
Described in 2026-04-16 entry: technical jargon creeps back in when Claude is mid-explanation of a complex technical decision. Mitigation: before asking any question that invokes a technical decision, mentally read the question back as if one were a non-programmer, and rewrite if any word requires domain knowledge.

### Pattern 9 — Non-functional / platform-level requirements need a dedicated doc (NEW 2026-04-17)
Described in the 2026-04-17 "Platform architectural reveal" entry. When a platform has scale, user-model, concurrency, review-cycle, audit, and infrastructure requirements that cut across all tools — those live in their own doc (`PLATFORM_REQUIREMENTS.md`), not embedded in tool-specific or project-context docs. Embedding them in the wrong place leads to them being forgotten during workflow-specific design work, which leads to workflows shipping at the wrong scale.

### Pattern 10 — Don't generalize from N=1 (NEW 2026-04-17)
Described in the 2026-04-17 "Generalized from N=1" entry. When designing shared infrastructure (like the Shared Workflow-Tool Scaffold), avoid projecting from one instance. Actively seek the inverse case: "What would this look like for the SIMPLEST workflow? What would it look like for the MOST COMPLEX?" Build the shared infrastructure for the typical case, accommodate the outliers as special cases.

### Pattern 11 — When an instruction needs to be repeated for ≥3 chats, visibility containment has failed (UPDATED 2026-04-17 — now FOUR consecutive chats)
Described originally in the 2026-04-17 "User had to repeat non-programmer" entry (third-chat recurrence) and reinforced in the 2026-04-17 "Asked user to paste the file" entry (fourth-chat recurrence — after documentation had been substantially escalated between chats).

If the user has to restate the same instruction at the start of multiple successive chats DESPITE it being in the docs, the documentation containment is insufficient. The fix is not "reiterate more forcefully in docs" (that's more of the same) — the fix is to (a) move the instruction to the MOST attention-grabbing position in the MOST-read doc, (b) make it visually impossible to miss, (c) repeat it in multiple docs, (d) give it mechanical enforcement (read-it-back test on every message), (e) record the recurrence as a meta-pattern so future Claudes understand this is a structural issue with how LLM attention works, not a simple oversight.

**Post-Ckpt-8 update (critical):** Steps (a)–(e) above are necessary but not sufficient. The Ckpt 7 → Ckpt 8 transition added a loud NEW_CHAT_PROMPT banner; the slip happened anyway in Ckpt 8 (on a "paste the file" ask). The diagnosis: the Read-It-Back test (Rule 14a) was only being applied to **decision questions**, not to **instructions framed as tasks or data-gathering requests**. "Paste the file" felt too banal to test.

**Revised Pattern 11 mitigation (applies to every future chat):**

The Read-It-Back test extends to **every imperative instruction Claude gives the user, including:**
- "Paste / share / upload / show me / send me / give me X"
- "Look up / check / find X"
- Any "can you do Y" request
- Build/run/test commands
- Navigation or UI click requests

For each such instruction, Claude must pair it with a concrete method (terminal command OR numbered click-path OR `ask_user_input_v0` tool call). Instructions lacking a concrete method fail Rule 14a and must be rewritten.

**Trigger condition:** When a user says (or implies) "I've told you this before in other chats" — Pattern 11 is engaged. Claude acknowledges openly, escalates documentation visibility, and logs the recurrence. Count is tracked — every recurrence strengthens the diagnosis that documentation alone is insufficient and mechanical habit is the binding constraint.

**Recurrence count as of Ckpt 8:** 4. Each recurrence has been caught by the user, not by Claude's own mechanical test.

### Pattern 12 — Sandbox-path leak in user-facing commands (NEW 2026-04-17)
Described in the 2026-04-17 "Gave user a sandbox-only path" entry. Claude operates in a sandbox environment with filesystem paths like `/home/claude/`, `/mnt/user-data/uploads/`, `/mnt/user-data/outputs/`, `/mnt/skills/`. The user's terminal operates in `/workspaces/brand-operations-hub/` (or wherever their repo is) and has NO access to Claude's sandbox. Any command Claude gives the user to run must reference only paths in the user's environment.

**Rule:** Before sending a terminal command to the user, scan it for these path prefixes: `/home/claude/`, `/mnt/user-data/`, `/mnt/skills/`. If any appear, rewrite.

**Default approach for delivering new file content to the user's repo:**
- **Small-to-medium files (< 200 lines):** Heredoc pattern — `cat > "path/in/user/repo" << 'MARKER' ... MARKER`. The content is embedded in the command. Reliable.
- **Large files (> 200 lines):** Paste content in a code block, have user right-click in Codespaces file-explorer → New File → name it → paste → save.
- **`present_files` produces a download link in the chat UI** — that's for the user to manually download if they want a copy, NOT for `mv` from a path in Claude's sandbox.

### Pattern 14 — Multi-option questions must include per-option context, an escape-hatch "question first" option, AND a free-text invitation (NEW 2026-04-18; refined same-session with the escape-hatch requirement)
Described in the 2026-04-18 "Multi-option questions without context or free-text escape hatch trapped user into picking letters" entry, and further refined in the same session after the user observed that Claude Code's forced-picker UI physically hides the input box, making a text-level free-text invitation inaccessible mid-picker. User's refinement: *"Let's add a new rule. Always give me an additional choice to all the choices you're offering that says 'I have a question first that I need clarified'. This way, I select from a forced options list and still get to type my response."*

**The rule (three-part — all three required on every multi-option question):**

1. **Per-option content:**
   - Plain-language description of what the option actually does — not just a label
   - Consequence / reversibility note — "if you pick A, X happens; reversible by Y" vs. "if you pick B, it's one-way"
   - Enough context that a non-programmer can evaluate without further questions — OR explicit acknowledgment that there's a subtlety worth asking about

2. **An explicit escape-hatch option as the LAST option**, worded:
   > *"I have a question first that I need clarified"*
   (or near-equivalent phrasing the user will recognize). Non-negotiable regardless of how clear the other options seem. This option works INSIDE Claude Code's forced-picker UI — when the input box is hidden and the user can only arrow-key/number-select, the escape-hatch is selectable. Picking it returns the user to normal chat mode where they can type their question.

3. **A closing free-text invitation** in the prose after the option list, e.g.:
   > *"Or if you have a question about any option before picking, just ask — a clarification-first response is always valid."*
   Covers the case where Claude's message renders as plain text (input box already visible).

**Mechanical test — scan every multi-option question before sending:**
1. For each option: "can a non-programmer evaluate this without further questions?" If no, add context.
2. Is the "I have a question first that I need clarified" escape-hatch option present as the final option?
3. Is the free-text invitation present at the close?

If any check fails, rewrite.

**Scope exception:** simple yes/no/not-sure don't need elaborate per-option context, but STILL must include the escape-hatch option and free-text invitation. "Yes / No / I have a question first / Not sure" is the right shape for a simple binary — never just "yes / no."

**Why this pattern exists (both halves):**
- The first version of Pattern 14 ("Options + recommendation + reversibility" as in Rule 3, plus a free-text invitation) was insufficient because the invitation lives in prose, and Claude Code's forced-picker UI hides the input box — so the user couldn't act on the invitation mid-picker.
- Adding the "question first" option WITHIN the picker gives the user a selectable escape hatch that works regardless of whether Claude's message is rendered as plain text OR as an interactive picker.
- Both halves are needed: the free-text invitation for plain-text rendering, the escape-hatch option for picker rendering. Rule 14f captures this defensively — always include both.

**Enforcement:** Baked into `CLAUDE_CODE_STARTER.md` Rule 20 (read at start of every Claude Code session) and `HANDOFF_PROTOCOL.md` Rule 14f. Propagates automatically.

**Related patterns:** Pattern 11 (non-programmer visibility under load), Pattern 13 (session-boundary step-by-step), Rule 14a (Read-It-Back test for questions). Pattern 14 sits alongside these as a family of "mechanical discipline for non-programmer communication."

**Trigger condition:** Every multi-option question Claude presents. Not conditional.

---

### Pattern 13 — Session-boundary instructions must be step-by-step concrete (NEW 2026-04-18)
Described in the 2026-04-18 "Pattern 11 recurrence #5" entry.

**The rule:** Every Claude Code session's end-of-session handoff MUST include two explicit sections with copy-paste-ready commands — not general guidance:

1. **🚪 END-OF-SESSION INSTRUCTIONS** — what the user types/clicks RIGHT NOW to close the current session (e.g., `exit`, close tab behavior, whether to leave terminal open). Concrete. No "when you're ready, end the session" — that's not a method.

2. **🚪 NEXT-SESSION INSTRUCTIONS** — what the user types when they return:
   - Exact terminal command to launch (`cd /workspaces/brand-operations-hub && claude`)
   - Exact first-message text (copy-paste-ready)
   - Any offline-between-sessions steps

**Why this pattern exists:** The user is a non-programmer. Session bookends are high-confusion moments ("what do I type? which terminal? what message do I paste?"). Without explicit copy-paste-ready instructions, the user has to guess. Pattern 11 rules apply to mid-session imperatives; Pattern 13 extends the same discipline to session bookends.

**Enforcement:** Baked into `HANDOFF_PROTOCOL.md §4 Step 4b` (the Claude Code variant of the handoff template) and `CLAUDE_CODE_STARTER.md` Rule 15's mandatory content list. Every session reads `CLAUDE_CODE_STARTER.md` at start, so the requirement propagates.

**Trigger condition:** Pattern 13 is engaged every end-of-session in Claude Code. Not conditional.

**Related patterns:** Pattern 11 (visibility-under-load for non-programmer users), Rule 14a / Rule 9 (Read-It-Back test for imperatives), Pattern 12 (sandbox-path leaks).

---

END OF DOCUMENT
