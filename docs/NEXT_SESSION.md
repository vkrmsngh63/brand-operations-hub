# Next session

**Written:** 2026-06-03-g (`session_2026-06-03-g_p63-phase-2-self-serve-ai-registry-and-p64-model-reorder` — **P-63 Phase 2 — the SELF-SERVE central AI-model registry is now BUILT + DEPLOYED-AND-VERIFIED end-to-end across FOUR staged deploys, PLUS a Rule-32 registry-doc drift fix, PLUS a NEW roadmap item P-64 (drag-reorder models) captured AND built+shipped+verified the SAME session.** SIX deploys total, ALL director PASS on real Chrome (vklf.com). The director designed BOTH features WITH me via Rule 14f pickers before any coding. **Phase 2a (`759cfa3`, main `77d0f2c→759cfa3`):** the additive Prisma model `AiModelRegistryEntry` + seed-on-read + a CRUD API (`/api/ai-models` GET/POST, `/api/ai-models/[id]` PUT/DELETE) via a new DI-seam handler `src/lib/ai-models/handlers/ai-model-registry.ts` + a clean additive `prisma db push`; ZERO visible change. **Phase 2b (`5283cce`, main `759cfa3→5283cce`):** a NEW top-level `/ai-models` admin screen (dense table + a 4-step Add-a-model wizard company→model→where+thinking→pricing + edit/delete + the integration-pending popover [D2]) linked from the dashboard top bar; logic in `src/lib/ai-models/admin-ui.ts`. **Phase 2c (`e0f42d3`, main `5283cce→e0f42d3`):** repointed all 8 pickers (7 W#2 modals + W#1 `AutoAnalyze.tsx`) to a live client hook `useModelsForMenu` that fetches the DB registry (seed fallback) via the pure `selectMenuModels` — admin edits propagate to every dropdown with NO deploy. **Phase 2d (`d793179`, main `e0f42d3→d793179`):** made the W#2 RUN path registry-driven — the run-batch validator accepts any runnable+review-analysis model (static Opus fallback) AND cost math resolves registry pricing (polymorphic `calculateCostUsd`/`estimateCostUsd` accept `string | ModelPricing`); NEW `server-registry.ts`. **Rule-32 drift fix (`b4c3ab1`):** gave `models.ts`+`pricing.ts` their own `AI_MODEL_REGISTRY.md` §1 rows #5/#6 + reworded a Phase-2d comment whose `MODEL_PRICING` token false-tripped the hook. **P-64 (`835543d`, main `d793179→835543d`):** drag-reorder models on `/ai-models` (one global order; @dnd-kit ⠿ handle) + a NEW `PATCH /api/ai-models` reorder endpoint (writes `sortOrder` via the pure `resolveReorder`); dropdowns follow via the 2c hook; NO schema change. **Closes (a.137)** (P-63 Phase 2 ✅ DEPLOYED-AND-VERIFIED — Phase 2 CLOSED) **+ NEW P-64 CLOSED same session. Opens (a.138) RECOMMENDED-NEXT = W#2 residue (P-53 / P-26 / P-27)** on `workflow-2-competition-scraping`. **The next session RUNS ON `workflow-2-competition-scraping`; the start command is `./catch-up-workflow 2`.** **FIRST action next session = read `docs/COMPETITION_SCRAPING_PRIMER.md` §5 residue table, present P-53 / P-26 / P-27 to the director, and let the director pick which to do first (Rule 14f).** §4 Step 1c forced-picker FIRED this session → the director chose W#2 residue as next AND directed a NEW FUTURE roadmap task **P-63 Phase 3 (build the OpenAI/ChatGPT + Google Gemini provider adapters)** — NOT next session, captured verbatim in P-63 spec §1.)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session is `session_2026-06-03-g` — the SEVENTH session of 2026-06-03 (suffix `-g`); the FIRST was `session_2026-06-03` (no suffix) = P-61, `-b` = W#2 graduation, `-c` = W#1 Rule-33 backfill, `-d` = P-43 subshell cwd fix, `-e` = P-50 + P-63 Phase 0, `-f` = P-63 Phase 1. The harness `currentDate` = 2026-06-03. **Next session: keep trusting the harness `currentDate`; do NOT regress or invent a suffix ahead of it.** The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session.

> ⚠️ **BRANCH: next session runs on `workflow-2-competition-scraping`.** The (a.138) pick is W#2 residue (P-53 / P-26 / P-27) — genuine W#2 work, so it continues on `workflow-2-competition-scraping`. **Start command: `./catch-up-workflow 2`** (the dedicated Rule 33 graduated-W#2 re-entry — switches to `workflow-2-competition-scraping` + prints `docs/COMPETITION_SCRAPING_PRIMER.md`). This session ALSO ran on `workflow-2-competition-scraping`, so this is NOT a branch change — confirm `git branch --show-current` shows `workflow-2-competition-scraping` immediately after entry.

> ⚠️ **BRANCH STATE — NOTHING IS HELD. BOTH BRANCHES ARE AT `835543d`.** All six P-63 Phase 2 / P-64 deploys ff-merged to `main` in-session, each ping-pong-synced back. So at next-session entry, **`main` and `workflow-2-competition-scraping` are BOTH at `835543d`** (after this end-of-session doc-batch ff-merges to main, both will be at the doc-batch SHA). **Expect `git log origin/main..HEAD --oneline` to be EMPTY at entry** (the normal graduated-workflow steady state). If it is NOT empty, something did not ff-merge as expected — investigate before coding.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry.** This session: NO → flipped YES (the additive `AiModelRegistryEntry`, Phase 2a) → flipped YES→NO at the Phase-2a deploy `prisma db push` (additive, zero data loss) → NO at exit. **The W#2 residue items (P-53 / P-26 / P-27) are NOT expected to touch the schema** (P-53 = on-page Export buttons; P-26/P-27 = below-fold scroll-capture/extension bugs). The flag should STAY NO. If any residue work turns out to need a schema change, run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push`; never `migrate reset` against prod; additive only.

> ⚠️ **NO OWED DEPLOY, NO OWED VERIFICATION carried in.** P-63 Phase 2 (4 deploys) + the drift fix + P-64 were each director-verified PASS on real Chrome. Nothing is held back; there is no stranded commit and no unverified surface carried into next session.

> ⚠️ **W#2 IS GRADUATED — the residue items are documented low-priority continuation, NOT a reopening.** W#2 (Competition Scraping) is ✅ GRADUATED 2026-06-03 (continuity-first). P-53 / P-26 / P-27 ride along as the post-graduation residue (all LOW / non-blocking). Doing them does NOT un-graduate W#2. The deferred W#2 Archive/Data-Contract split + the finalized-HRL Data Capture Interview stay intentionally held until W#3 needs to read W#2 data — do NOT author them now.

> ⚠️ **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) is a FUTURE task, NOT next session.** The director directed it at the §4 Step 1c picker and it is captured verbatim in `docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md` §1 (2026-06-03-g) + §7 + the COMPETITION_SCRAPING_PRIMER §5 P-63 row. Fire it ONLY when the director wants a non-Anthropic model live AND supplies that provider's API/SDK docs — the in-UI integration-pending popover on `/ai-models` already hands over the exact kickoff instruction. Do NOT start it unprompted.

---

## What we did this session (in plain terms)

This session built the "AI Models" control panel you asked for — a real page on the live site where you manage every AI model yourself — and shipped it live in careful steps, with you checking each one on the real site.

**The big picture.** Last session we connected every model picker on the platform to one hidden central list, but that list still lived in code (only Claude could change it). This session we made it self-serve: there is now a page at **vklf.com/ai-models** where you can **add, edit, remove, and drag-to-reorder** AI models yourself. Whatever you change there flows to every model dropdown across the whole platform automatically — no code deploy needed.

**We did it in four careful steps, plus two extras.** Step 1 moved the model list into the database (invisibly — nothing changed for you yet). Step 2 added the actual "AI Models" admin page with an add-a-model wizard. Step 3 pointed all the model dropdowns at the database so your edits show up everywhere live. Step 4 made the "run" path fully self-serve too — so a model you add yourself doesn't just appear in the menu, it actually runs end-to-end without crashing (we caught and fixed a gap where it would have crashed at the cost-estimate step). Then we cleaned up an internal warning, and finally — because you asked for it this session — we added drag-to-reorder so you can set the order models appear in the dropdowns.

**You verified all six on real Chrome and said PASS each time.**

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` + `docs/COMPETITION_SCRAPING_PRIMER.md` §5 (the W#2 residue table) + `docs/polish-item-specs/P-63-*.md` + `docs/polish-item-specs/P-64-*.md` + `docs/AI_MODEL_REGISTRY.md` + `docs/AI_MODEL_REGISTRY_PRIMER.md` + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (the W#1 live backlog) + `docs/DATA_CATALOG.md` §6.1 (the deferred W#2 Data Contract).

- **(a.138) = W#2 residue (P-53 / P-26 / P-27)** — **NEXT SESSION (see below).** All LOW / non-blocking; the director picks the order. On `workflow-2-competition-scraping`.
- **P-63 Phase 2 — ✅ DONE 2026-06-03-g** (self-serve admin screen + DB storage + integration-pending popover, all live) + **P-64 — ✅ DONE 2026-06-03-g** (drag-reorder).
- **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) — FUTURE.** Fired when the director wants a non-Anthropic model live + supplies that provider's API docs. NOT a near-term item.
- **P-63 Phase 1 — ✅ DONE 2026-06-03-f** + **P-50 — ✅ DONE 2026-06-03-e** + **P-56 Option-2 — ✅ CLOSED (won't-do) 2026-06-03-e** + **P-43 — ✅ RESOLVED 2026-06-03-d.**
- **The deferred W#2 Archive/Data-Contract split + finalized-HRL Data Capture Interview** — held until W#3 starts and needs to read W#2 data. NOT a blocker.
- **W#1's live polish backlog** — HIGH H-1 (action history + per-action undo) is the queued-next W#1 item; plus M-1/M-2/M-3 medium, L-1..L-5 low, C-1..C-7 carry-overs, Z-1 explicitly-last, P-1 passive prereq. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`. On `main`.
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card + page — future-workflow, NOT a W#2 residue item.

## What we'll do next session (in plain terms)

1. **We pick one of the leftover small Competition Scraping items** — P-53 (an "Export Table" button on two more analysis pages — mostly already covered by the spreadsheet exports), or P-26 / P-27 (capture bugs where the extension misses content that's below the visible part of the page). First we'll look at the short list together and you'll pick which to do.
2. **We follow the normal routine** — plan-with-you, build, run the test scoreboard, deploy to vklf.com, you verify on real Chrome.
3. **These are all small / low-priority** — none of them block anything; they're polish.

## What's still left in the total roadmap (in plain terms)

- **W#2 residue — NEXT, the (a.138) pick.** P-53 + P-26 / P-27. Low-priority polish. On `workflow-2-competition-scraping`.
- **P-63 (central AI-model registry) — Phase 2 ✅ DONE + live; Phase 3 (add ChatGPT + Gemini) is a future task** fired when you want a non-Anthropic model and give us its docs. **P-64 (drag-reorder) ✅ DONE.**
- **P-50 (Condition Pathology card) — ✅ DONE 2026-06-03-e.** **P-56 Option-2 — ✅ CLOSED (won't-do).** **P-43 — ✅ DONE 2026-06-03-d.**
- **W#2 graduation — ✅ DONE 2026-06-03 (continuity-first).** Re-entry via the primer + `./catch-up-workflow 2`.
- **W#1 (Keyword Clustering) — graduated; live polish backlog (HIGH H-1 action-history + undo queued).** On `main`; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`.
- **The deferred W#2 Data Contract** — held until W#3 needs to read W#2 data; NOT a blocker.
- **P-62 (NEW capture)** — the Workflow-11 surveillance card + page. Future-workflow.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started. W#3 kickoff is also the trigger to author the deferred W#2 Data Contract.
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**P-63 Phase 2 ✅ DEPLOYED-AND-VERIFIED + NEW P-64 ✅ DEPLOYED-AND-VERIFIED — 2026-06-03-g.** SIX deploys, each director-verified PASS on real Chrome (vklf.com). The self-serve central AI-model registry is now live end-to-end (admin screen + DB storage + live-fetch dropdowns + registry-driven run path + drag-reorder). Both branches now at `835543d`.

**Session shape (a six-deploy, staged-migration build session):**

- **Phase 2a (`759cfa3`, main `77d0f2c→759cfa3`):** additive Prisma model `AiModelRegistryEntry` + seed-on-read + CRUD API (`/api/ai-models` GET/POST, `/api/ai-models/[id]` PUT/DELETE) via the new DI-seam handler `src/lib/ai-models/handlers/ai-model-registry.ts`; clean additive `prisma db push`; ZERO visible change. Director PASS.
- **Phase 2b (`5283cce`, main `759cfa3→5283cce`):** the `/ai-models` admin screen (dense table + 4-step Add-a-model wizard company→model→where+thinking→pricing + edit/delete + the integration-pending popover [D2]) linked from the dashboard top bar; pure logic in `src/lib/ai-models/admin-ui.ts`. Director PASS.
- **Phase 2c (`e0f42d3`, main `5283cce→e0f42d3`):** all 8 pickers (7 W#2 modals + W#1 AutoAnalyze) repointed to the live client hook `useModelsForMenu` (fetches the DB registry, seed fallback) via the pure `selectMenuModels` (enabled+runnable+menu gate); admin edits propagate everywhere with NO deploy. Director PASS.
- **Phase 2d (`d793179`, main `e0f42d3→d793179`):** the W#2 run path is now registry-driven for BOTH validation (run-batch accepts any runnable+review-analysis model; static Opus fallback) AND cost math (polymorphic `calculateCostUsd`/`estimateCostUsd` accept `string | ModelPricing`); NEW server-only `src/lib/ai-models/server-registry.ts`. Closed a gap where a self-serve model would pass validation then crash at cost estimation. Director PASS.
- **Rule-32 drift fix (`b4c3ab1`, branch → carried to main with P-64):** split `models.ts`/`pricing.ts` into their own `AI_MODEL_REGISTRY.md` §1 rows #5/#6 + reworded a Phase-2d route comment whose literal `MODEL_PRICING` token false-tripped the SessionStart drift hook; verified clean by simulation.
- **P-64 (`835543d`, main `d793179→835543d`):** drag-reorder models on `/ai-models` (one global order [D-A]; @dnd-kit vertical drag with a ⠿ handle [D-B]; reordering does NOT change the picker default [D-C]) + a NEW `PATCH /api/ai-models` reorder endpoint (writes `sortOrder` by position via the pure `resolveReorder`); the dropdowns follow via the 2c live hook; NO schema change. Director PASS.

**Schema-change-in-flight flag NO at entry → flipped YES (the additive `AiModelRegistryEntry`, Phase 2a) → flipped YES→NO at the Phase-2a deploy `prisma db push` (additive, zero data loss) → NO at exit. NEXT session (W#2 residue) = NO at entry; expected to STAY NO.**

**Rule 14f pickers fired this session:** the two design pickers (P-63 Phase 2 admin-screen shape incl. D1 [DB storage] + D4 [global `/ai-models` page] + D2; P-64 reorder shape incl. D-A/D-B/D-C), the SIX Rule 9 deploy gates (all "Yes"), and the §4 Step 1c next-pick (W#2 residue + add ChatGPT/Gemini to the roadmap as a future task).

**ZERO open DEFERRED items at exit (Rule 26):** TaskList empty at entry; 6 in-session build tasks all completed; ZERO open DEFERRED at exit. The W#2 residue items + the deferred W#2 Data Contract + P-62 + the W#1 live backlog are documented roadmap continuation, NOT TaskList DEFERRED items.

**EXIT baselines locked (verified post-deploy):** root tsc clean (UNCHANGED) + extension tsc clean (UNCHANGED) + extension `npm test` = **915/915 UNCHANGED** + src/lib `node:test` = **1427** (+40 over 1387 — 2a +20, 2b +7, 2c +3, 2d +5, P-64 +5) + `npm run build` = **77 routes** (+3 over 74 — the new `/ai-models` page + `/api/ai-models` + `/api/ai-models/[id]`); Check 6 Playwright SKIPPED per Rule 27 for all 6 deploys (verified by tsc + node:test + director real-Chrome).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-03-g** (NO top-tier slip — a clean six-deploy build session) capturing: (1) the staged read-path migration (in-code seed → DB-backed seed-on-read → live client fetch); (2) "issue-free self-serve requires the WHOLE run path to be registry-driven, not just the dropdown"; (3) the polymorphic-helper back-compat refactor; (4) the drift-hook literal-substring false-positive. **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NO new memory file this session.**

**Group B docs updated** — `docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md` (§1 Phase-3 directive append + §7 Phase 2 → as-built/DEPLOYED + §7 Phase 3) + `docs/polish-item-specs/P-64-ai-models-reorder.md` (Status → ✅ SHIPPED-AND-VERIFIED + as-built) + `docs/COMPETITION_SCRAPING_PRIMER.md` §5 (P-63 → Phase 2 DEPLOYED + Phase 3 future; P-64 added; residue P-53/P-26/P-27 = next pick) + `docs/AI_MODEL_REGISTRY.md` (the DB table is now the live runtime source; the admin screen + `useModelsForMenu` hook + reorder; the run-batch route is now a validation+pricing consumer) + `docs/AI_MODEL_REGISTRY_PRIMER.md` (Phase 2 SHIPPED; Phase 3 = future). `docs/COMPETITION_SCRAPING_DESIGN.md` UNCHANGED (NO §B entry — P-63/P-64 are a platform-wide registry, not a W#2 product-design choice; their design record is the specs).

**EIGHTY-FIRST end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ONE additive `prisma db push` (the `AiModelRegistryEntry` model, Phase 2a — additive only, no column drops, zero data loss), gated by an explicit director Rule 9 deploy authorization. NO `migrate reset`, NO drop, NO dev-data deletes. SIX in-session deploys, each ff-merged to `main` under its own Rule 9 deploy gate. NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (W#2 residue):** P-53 / P-26 / P-27 are NOT expected to touch the schema. The schema-change-in-flight flag stays NO. If any residue work unexpectedly needs a schema change, run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod). No other Rule 8/9/29 triggers anticipated.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the W#2 continuity primer `docs/COMPETITION_SCRAPING_PRIMER.md` + the W#1 continuity primer `docs/KEYWORD_CLUSTERING_PRIMER.md` + the `src/lib/ai-models/` module (now incl. the DB-backed registry runtime: the handler + `server-registry.ts` + `admin-ui.ts` + the hook) + the P-63 + P-64 specs + `docs/AI_MODEL_REGISTRY.md` + `docs/AI_MODEL_REGISTRY_PRIMER.md` + the memory directory + the `./catch-up-workflow` + `./resume-workflow` scripts.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. The (a.138) pick is W#2 residue (P-53 / P-26 / P-27) — genuine W#2 work. **Start command: `./catch-up-workflow 2`** (the dedicated Rule 33 graduated-W#2 re-entry — switches to `workflow-2-competition-scraping` + prints `docs/COMPETITION_SCRAPING_PRIMER.md`). This session ALSO ran on `workflow-2-competition-scraping`, so this is NOT a branch change. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch ff-merges to `main`): **`main` and `workflow-2-competition-scraping` are BOTH at the doc-batch SHA (both were at `835543d` after P-64; the doc-batch ff-merges normally — nothing is held back).** **Verify with `git log origin/main..HEAD --oneline` showing EMPTY** (the normal graduated-workflow steady state). `git status` clean apart from historical untracked .zip + .html artifacts at repo root. If `git log origin/main..HEAD` is NOT empty at entry, something did not ff-merge as expected — investigate before coding.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block; the picked residue item may have a spec — read it if so):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- **`docs/COMPETITION_SCRAPING_PRIMER.md` §5 — the FIRST read** (the W#2 residue table; present P-53 / P-26 / P-27 to the director and let them pick).
- `docs/polish-item-specs/P-53-*.md` (read IF it exists / IF the director picks P-53; CREATE per Rule 31 if missing) + the P-26 / P-27 entries in `docs/ROADMAP.md` (search "P-26" / "P-27").
- `docs/HANDOFF_PROTOCOL.md` Rule 3 (code wins over docs) + Rule 9 (deploy gate) + Rule 14f (forced-picker) + Rule 23 (Change Impact Audit) + Rule 25 (multi-workflow) + Rule 26 + Rule 27 (verification) + Rule 30 (Session bookends) + Rule 31 (read-guarantee + audit-shipped-state) + §4 Step 4b extended template.
- `docs/ROADMAP.md` — the P-53 / P-26 / P-27 entries + the P-63 polish-backlog entry (Phase 2 ✅ + Phase 3 future) + P-64 (✅) + the W#2 graduation record + the total-roadmap summary.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-03-g (this session — the staged-migration + whole-run-path-registry-driven + polymorphic-helper + drift-hook patterns) + §Entry 2026-06-03-f (the `menus`-tag / shim / adapter-faithful-refactor patterns) + §Entry 2026-05-31 (the TOP-TIER SLIP).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` — esp. `feedback_plan_output_shape_before_building.md` (plan any user-facing residue surface WITH the director before coding), `feedback_no_fabricated_instructions.md` (P-53/P-26/P-27 are the confirmed (a.138) pick; do not invent scope; P-63 Phase 3 is a FUTURE task — do not start it unprompted), `feedback_default_to_recommendation.md` / `feedback_recommendation_style.md`, `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md`, `feedback_session_bookends_plain_summary.md`, `feedback_destructive_ops_confirmation.md`, `feedback_exports_include_all_table_data.md` (directly relevant if the director picks P-53 — the Export-Table residue item).

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; the FIRST read is `docs/COMPETITION_SCRAPING_PRIMER.md` §5 (the W#2 residue table).** **This session runs on `workflow-2-competition-scraping` — verify the branch first (it is the SAME branch as last session; not a change).** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.138) = W#2 residue):** pick and ship one (or more) of the LOW-priority W#2 residue items — **P-53** (on-page "Export Table" button on the Category + Type analysis pages — largely ABSORBED by P-55's grouped spreadsheets) / **P-26** / **P-27** (below-fold scroll-capture bugs + capture bugs #9 / #15 — extension-side). **FIRST action: read the primer §5 residue table, present P-53 / P-26 / P-27 to me in plain terms, and let me pick which to do first via a Rule 14f picker.** Do NOT start coding until I pick.

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping   (SAME branch as last session — not a change)

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: EMPTY — main and workflow-2 are BOTH at the 2026-06-03-g doc-batch SHA.
#   Nothing is held back. If NOT empty, something did not ff-merge as expected — investigate before coding.
```

If `git branch --show-current` shows anything other than `workflow-2-competition-scraping`, run `./catch-up-workflow 2`.

**FIRST step (present the residue list + let me pick — BEFORE any coding):** read `docs/COMPETITION_SCRAPING_PRIMER.md` §5; present P-53 / P-26 / P-27 in plain terms with their priority + scope; fire a Rule 14f picker to let me choose which to do first; only after I pick (and we plan the output shape if it is a user-facing surface) do you start coding.

**Schema-change-in-flight flag:** **NO at entry; expected to STAY NO** (P-53 = on-page Export buttons; P-26 / P-27 = capture bugs — none expected to touch the schema). If a picked item unexpectedly needs a schema change, run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push`; additive only; never `migrate reset` against prod.

**Output-shape (plan WITH the director per `feedback_plan_output_shape_before_building` + `feedback_session_bookends_plain_summary`):** if the picked item is a user-facing surface (P-53's Export buttons are), plan the shape WITH me before coding. **If the director picks P-53, honor `feedback_exports_include_all_table_data`** — the export must mirror the on-screen table's columns + order and include all click-to-reveal/expand-only data, split sub-rows across columns, generated fresh on click.

**Forced-picker shape (before coding):** fire a Rule 14f AskUserQuestion to let me pick the residue item; the deploy gate is itself a Rule 14f picker; the §4 Step 1c next-pick at end-of-session is a Rule 14f picker.

**Test coverage decision:** add node:test coverage for any new pure logic; for an extension-side capture bug (P-26 / P-27) add extension tests; a real user-facing UI surface may warrant a Playwright spec per Rule 27 (decide WITH the director per the surface complexity).

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (expect green; catch any type issue per change)
- Extension tsc clean (UNCHANGED unless the pick is extension-side — P-26 / P-27 are)
- Extension `npm test` = 915 (entry 915; +N if an extension bug fix adds tests)
- src/lib `node:test` = 1427 (entry 1427; +N for new pure logic)
- `npm run build` = 77 routes (entry 77; +1 only if a residue item adds a route — unlikely)
- Check 6 Playwright per Rule 27 (decide WITH the director)

**Deploy mechanics:** the picked residue item follows the standard Rule 9 deploy gate + 3-push pattern (ff-merge to `main` → ping-pong sync back → end-of-session doc-batch). If extension-side (P-26 / P-27), build a fresh sideload zip + director real-Chrome verify per the extension deploy flow.

**Group A docs to update at session end:** ROADMAP header bump + the (a.138) close / (a.139) open + the picked item's polish-backlog status flip + CHAT_REGISTRY header bump (204th session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header (+ a NEW §Entry only if notable) + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite. (HANDOFF_PROTOCOL header bump only if a rule changes.)

**Group B docs to update at session end:** `docs/COMPETITION_SCRAPING_PRIMER.md` §5 (flip the picked residue row) + the picked item's polish-item-spec (as-built) + `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (a new "Deploy session #N" section if a user-facing W#2 surface deployed).

**Standing carry-overs into this session:**

- **(a.138) = W#2 residue (P-53 / P-26 / P-27)** — read the primer §5, present the items, let me pick, then build. On `workflow-2-competition-scraping`.
- **P-63 Phase 2 — ✅ DONE 2026-06-03-g** + **P-64 — ✅ DONE 2026-06-03-g** + **P-63 Phase 1 — ✅ DONE 2026-06-03-f** + **P-50 — ✅ DONE 2026-06-03-e** + **P-56 Option-2 — ✅ CLOSED (won't-do) 2026-06-03-e** + **P-43 — ✅ RESOLVED 2026-06-03-d.**
- **P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini adapters) — FUTURE; do NOT start unprompted** (fire only when the director wants a non-Anthropic model live + supplies its API docs).
- **The deferred W#2 Archive/Data-Contract split** — held until W#3 needs to read W#2 data; do NOT author now.
- **W#1's live polish backlog** (HIGH H-1 action-history+undo queued; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`) — W#1 is graduated + lives on `main`; do NOT touch unless the director picks a W#1 backlog item explicitly.
- **P-62** — the Workflow-11 surveillance card+page (future-workflow; NOT a W#2 residue item).

---

## Why this pointer was written this way (debug aid)

- **(a.138) = W#2 residue is the PICK because the director chose it at the §4 Step 1c forced-picker** (P-63 Phase 2 + P-64 are now done + live, so the queue returns to the low-priority W#2 residue the director deferred earlier).
- **The branch STAYS `workflow-2-competition-scraping`** — the residue items are genuine W#2 work. This is the SAME branch this session ran on (not a change). Use `./catch-up-workflow 2`; verify the branch immediately.
- **NOTHING is held ahead of main.** All six P-63 Phase 2 / P-64 deploys were ff-merged in-session; the end-of-session doc-batch ff-merges normally. So `git log origin/main..HEAD` is EMPTY at entry.
- **The FIRST action is to PRESENT the residue list + let the director pick — BEFORE any coding.** There are three candidate items of similar low priority; the director chooses the order.
- **The Schema-change-in-flight flag is NO at entry and expected to STAY NO** — the residue items are UI / extension-capture work, not schema work.
- **P-63 Phase 3 is a FUTURE task, captured but NOT queued** — do not start it unprompted; it fires when the director wants a non-Anthropic model + supplies its API docs.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.138.alt1) W#2 residue P-53** (Excel "Export Table" for the Category + Type pages — largely ABSORBED by P-55's grouped spreadsheets; LOW residue — honor `feedback_exports_include_all_table_data` if picked). On `workflow-2-competition-scraping`.
- **(a.138.alt2) W#2 residue P-26 / P-27** (below-fold scroll-capture + capture bugs #9 / #15 — LOW; extension-side; a fresh sideload zip + real-Chrome verify needed).
- **(a.138.alt3) P-63 Phase 3** (build the OpenAI/ChatGPT + Google Gemini provider adapters — a FUTURE task; ONLY if the director explicitly wants a non-Anthropic model live this session AND supplies that provider's API/SDK docs).
- **(a.138.alt4) W#1 HIGH item H-1** (action history + per-action undo — the queued-next W#1 polish item; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`; on `main` via `./catch-up-workflow 1` or `./resume-workflow 1`). A deliberate W#1 pick if the director wants to advance W#1 instead.
- **(a.138.alt5) P-62 Workflow-11 surveillance card + page** (future-workflow seed; the spec exists; design WITH the director when W#11 kicks off — NOT a W#2 residue item).
