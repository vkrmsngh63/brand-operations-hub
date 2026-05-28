# Next session

**Written:** 2026-05-28 (`session_2026-05-28_p49-w5-session-4-scope-misread-rollback-and-corrective-planning` — W#2 polish P-49 W5 Session 4 — **SCOPE-MISREAD ROLLBACK + CORRECTIVE-PLANNING SESSION** on `workflow-2-competition-scraping` — wrong-spec build commit `5fa1f53` (8 files +2705/-54 — single combined "By Category-Type" page + card-style grouping + browser-side execution + 1 AI flow + NEW P-51 ROADMAP skeleton) shipped to vklf.com via `workflow-2-competition-scraping` → `main` and was HARD-REVERTED mid-Phase-4 via revert commit `958ccf8` (8 files +54/-2705); net live-site change = ZERO since the revert returned the site to the W5 Session 3 deploy state. Director established NEW Rule 31 mid-session (HANDOFF_PROTOCOL.md line 936 — Polish-item spec capture: verbatim director instructions checked into `docs/polish-item-specs/<item-id>-<slug>.md` per the standardized 5-section structure) + Claude backfilled THREE new spec docs (P-49 Category page 25 KB + P-49 Type page 15 KB + P-51 comprehensive-analysis AI summary 7 KB SKELETON PLACEHOLDER). Director approved 5-session corrective rebuild plan; planning conversation paused MID-WAY through Block 1 (Category page table column-by-column spec confirmation) with 6 open questions awaiting director answers at next session start). **Closes (a.105) RECOMMENDED-NEXT** = P-49 W5 Session 4 wrong-spec build SHIPPED + HARD-REVERTED; **opens (a.106) RECOMMENDED-NEXT = P-49 W5 corrective rebuild — Block 1 planning resume (answer the 6 open questions) + (likely) Session 1 Category page scaffold per `docs/polish-item-specs/P-49-W5-S4-category-page.md` §3** on `workflow-2-competition-scraping`.

---

## What we did this session (in plain terms)

Today's session started with a clean launch prompt from yesterday's W5 Session 3 (the Per-Competitor flow shipped + verified end-to-end). The prompt directed Claude to build a "Per-Category Comprehensive (bulleted)" flow plus a new "By Category-Type" page on the live site. Claude framed a high-level shape proposal to director ("one row per category with rows collapsing competitors that share the category; browser-side execution like W#1; one bulleted flow first; deploy after Phase 4 PASSES") + director approved "all good as proposed". Claude built it + scoreboard-verified + shipped to vklf.com under a Rule 9 deploy gate. Then, during the live Phase 4 walkthrough on vklf.com, director surfaced a **MAJOR scope misread**.

**What director's actual spec required vs. what Claude built:**

- **TWO separate pages** (one Category page + one Type page) — Claude built ONE combined "By Category-Type" page with a sub-toggle.
- **Flat 13-column tables** (Category / Platform / Type / Product Name / Results Rank / Competition Score / URL / Stars / Reviews Summary / Competitor Comprehensive Reviews Analysis bulleted / non-bulleted / Category Comprehensive Reviews Analysis bulleted / non-bulleted) — Claude built card-style grouping with each category as a collapsible card.
- **First-row-carries-label grouping** (first row of each category group has the category name in Column 1; subsequent rows in the same group leave Column 1 EMPTY as a visual signal) — Claude had explicit grouping containers, not first-row-carries-label tables.
- **Server-side per-batch endpoint architecture** (browser orchestrates queue + pause/resume/cancel; server fires ONE Anthropic call per batch; same pattern as the existing W5 Sessions 2-3 flows) — Claude built browser-side execution.
- **FOUR AI flows** (Category bulleted + Category non-bulleted + Type bulleted + Type non-bulleted) — Claude built ONE combined per-category-type bulleted flow.
- **Click-to-edit on populated cells + drag-to-reorder (two-level — main category rows + competitor rows within a category) + Excel export + write-back to URL detail's "Overall Analysis — Captured Reviews" box (merge, never overwrite) + real-time UI updates as each Anthropic call returns** — none of these surfaces were present.

**What we did about it (3 things):**

1. **Hard revert.** Director picked the rollback picker option (a) "Hard revert now" over (b) "Leave wrong tab live + patch later" or (c) "Quick patch — hide tab only". Revert commit `958ccf8` deleted all 8 files from the wrong-spec build commit; ff-merged to main + workflow-2 ping-ponged; live site returned to the W5 Session 3 deploy state. No data lost since no `prisma db push` fired this session.

2. **NEW Rule 31 (Polish-item spec capture).** Director established a new operational mandate: whenever director introduces a new polish item with detailed instructions — OR adds substantial new scope to an existing one — Claude MUST immediately create or extend a spec doc at `docs/polish-item-specs/<item-id>-<slug>.md` capturing director's verbatim instructions, organized in a standardized 5-section structure (§1 verbatim append-only / §2 joint-discussion append-only / §3 consolidated source-of-truth / §4 open questions / §5 cross-references). Code reads from §3 at session start. Claude added Rule 31 inline to HANDOFF_PROTOCOL.md line 936 + backfilled THREE NEW spec docs: P-49 Category page (25 KB) + P-49 Type page (15 KB) + P-51 comprehensive-analysis AI summary (7 KB, skeleton placeholder since director wants Q&A at the start of the P-51 build session). Director's verbatim 2026-05-28 standing directive that triggered Rule 31: *"I want us to make a note of this huge disparity in what I had instructed and what you developed and put something in the documentation that will prevent such a thing from happening in the future in such a way that whenever I add new items in any workflow and provide instructions, you should put my original instructions in some part of the repo so that when working on the programming at any later point, you can and will access those instructions again as well. Any adjustments we make as part of our discussions should be added to that document as well."*

3. **5-session corrective rebuild plan locked.** Per director's "play the expert, safe + thorough" directive: Session 1 = Category page scaffold (route + 13-column flat table + first-row-carries-label grouping + column show/hide + click-to-edit; NO drag, NO AI, NO Excel — smallest verifiable unit) / Session 2 = Category page two AI flows (bulleted dedup + non-bulleted prose) + real-time per-cell painting + write-back to URL detail / Session 3 = Category page two-level drag + Excel export / Session 4 = Type page scaffold + drag + Excel together (compressed since the Category-page pattern is proven by then) / Session 5 = Type page two AI flows (mirror Session 2).

**Planning conversation paused MID-WAY through Block 1** (Category page table column-by-column spec confirmation) with 6 open questions awaiting director answers at next session start (see "What's pending from prior session" below).

**Numbers:**

- **THREE Rule 14f forced-pickers fired this session — 3/3 = 100% Yes-to-Recommended** (session-start scope picker + Rule 9 deploy gate picker + post-Phase-4-discovery rollback picker). Running cumulative across recent 9 sessions = 82/85 = 96.5% Yes-to-Recommended (rare clean sweep this session).
- **TWO Rule 9 deploy gates fired** (build deploy of `5fa1f53` + hard-revert deploy of `958ccf8`).
- **8 pushes total** (1 pre-deploy + 1 deploy + 1 ping-pong + 1 revert + 1 ping-pong + 3 doc-batch).
- **Schema-change-in-flight = NO entire session.**
- **Scoreboards at session end:** UNCHANGED from W5 Session 3 exit baselines (since the build was hard-reverted): root tsc clean + extension tsc clean + extension `npm test` = 910/910 + src/lib `node:test` = 950/950 + `npm run build` = 67 routes.

## What's pending from prior session — 6 OPEN BLOCK 1 QUESTIONS

These 6 questions are the resume point for next session. They are captured verbatim in `docs/polish-item-specs/P-49-W5-S4-category-page.md` §4. The next session should ask director these in order before proceeding to Block 2 (drag persistence schema) and Block 3-4 (AI prompt drafting) and Block 5 (Type page spec mirror).

- **Q-A — Column 8 "Stars" semantics:** is this the per-review breakdown (the star rating of each individual review) or the URL-level rating (`productStarRating` on `CompetitorUrl`)? Director's spec says "shows the star count of the review to its right" — ambiguous whether "the review to its right" is a single review or the per-URL aggregate.
- **Q-B — Column 9 "Reviews Summary" data source + rendering:** which data does this surface — the per-review summarization output (cached `ReviewAnalysis` rows with `level=PER_REVIEW`) stacked as a list? A count + click-to-expand pattern? Or something else?
- **Q-C — Column 11 "Competitor Comprehensive Reviews Analysis (non-bulleted)":** currently NOT a shipped flow at the per-competitor level (only Per-Competitor bulleted shipped via W5 Session 3). Three options: (i) drop column from the table; (ii) keep column with placeholder "(not yet generated)" + per-row Generate button firing a NEW per-competitor non-bulleted flow; (iii) piggyback on Session 2's non-bulleted AI flow (currently scoped to the category-level only).
- **1b-i — Visual treatment of first-row-carries-label grouping:** literal empty cell (visually identical to a blank cell — risk of director-or-user confusion) OR a subtle visual signal (e.g., a thin top-border on the first row + indent on subsequent rows + a soft "↑ same as above" hint)?
- **1b-ii — Drag handle placement:** drag-handle icon in a dedicated leftmost column, OR on hover-anywhere-in-row (no dedicated column), OR on hover-on-first-column-cell?
- **1b-iii — Uncategorized bucket placement + Auto-create button disabled state:** the `(Uncategorized)` bucket always sorts last per the §3 spec — but should the Auto-create Category Comprehensive bulleted button apply to it (treating it as one cluster) OR skip it (disabled button or filtered out of the AI run)?

## What we'll do next session (in plain terms)

Next session is **P-49 W5 corrective rebuild** on the `workflow-2-competition-scraping` branch per (a.106). The session ID is TBD (depends on whether director comes in with answers to the 6 open questions, wants more planning, or wants immediate code).

**Recommended session shape (subject to director's pickers at session start):**

- **Phase 1 (planning resume — likely 30-60 min):** answer the 6 open Block 1 questions above. Update `docs/polish-item-specs/P-49-W5-S4-category-page.md` §2 with each answer (append + dated) + update §3 (consolidated spec) accordingly. Move into Block 2 (drag persistence schema — new schema columns `sortOrder` on a Category-level table + `sortOrderInCategory` on `CompetitorUrl`) + Block 3-4 (AI prompt drafting for Session 2's bulleted dedup + non-bulleted prose flows) + Block 5 (Type page spec mirror — populate `docs/polish-item-specs/P-49-W5-S5-type-page.md` §2/§3 with director's answers).
- **Phase 2 (Session 1 of corrective rebuild — Category page scaffold; likely 60-120 min):** build the route + 13-column flat table + first-row-carries-label grouping + column show/hide checkboxes + click-to-edit cells. NO drag, NO AI, NO Excel. Smallest verifiable unit to lock the table primitive against director's spec before stacking interactions atop it.
- **Phase 3 (deploy decision):** if Phase 2 lands + scoreboard-verifies, fire a Rule 14f deploy-now-vs-exit picker. If director picks deploy, ff-merge to main + Vercel auto-redeploy + Phase 4 director real-Chrome verification.

**Director's pre-session homework (optional):**

- Answers to the 6 Block 1 open questions above (Q-A through 1b-iii).
- Confirmation on the corrective-rebuild slug: current proposal is `/competition-scraping/reviews-analysis-by-category` for the Category page + `/competition-scraping/reviews-analysis-by-type` for the Type page. The previously-shipped-then-reverted `/competition-scraping/by-category-type` slug is RETIRED.
- Preference on the nav-toggle expansion: the existing 4-option `CompetitionScrapingSurfaceNav` (Competitor URLs / Comprehensive Analysis / Competitor Reviews Analysis / By Category-Type [previously disabled]) expands to 5 options (Competitor URLs / Comprehensive Analysis / Competitor Reviews Analysis / Reviews Analysis By Competitor Category Table / Reviews Analysis By Competitor Type Table); does director want the two new options enabled from Session 1 (with empty tables until data populates) OR disabled until Session 1 ships the table primitive?

**Session shape estimate:** ~2-3 hours in-Claude depending on Phase 2 scope. BUILD session by default after Phase 1 closes. Phase 2's deploy decision is a Rule 14f picker. Schema-change-in-flight STAYS NO at session entry (no schema changes planned for Phase 2; possible NEW schema columns `sortOrder` + `sortOrderInCategory` for Session 3 drag persistence — but Session 3 is later, not this session). Pre-build joint-confirmation per `feedback_plan_output_shape_before_building.md` STILL FIRES on top of §3 of the spec doc, but the bar is now: confirm §3 is correct + complete for Phase 2's scope, NOT re-derive the spec from scratch.

## What's still left in the total roadmap (in plain terms)

- **P-49 W#2 Reviews Phase 2 (IN-FLIGHT — CORRECTIVE REBUILD)** — remaining work: 5-session corrective rebuild per the locked plan above (Sessions 1-3 Category page + Sessions 4-5 Type page) + Phase 4 verification per session + opportunistic polish. Estimate ~5-7 more sessions until P-49 W5 closes (5 corrective rebuild sessions + Phase 4 cycles).
- **P-50 NEW Condition Pathology card** — small single-session UI addition (one card insertion in two card-array files); director already approved scope; slot in any future session or do standalone on `main`.
- **P-51 NEW per-Project competitive landscape AI summary on `/comprehensive-analysis` page** — slot AFTER P-49 closes (per director directive: P-51 is BETWEEN P-49 and P-50 in next-priority order); spec doc skeleton already in place; build session opens with Q&A per director's directive.
- **P-48 Session 3 (Diagnostic #2 for screen-recording stutter)** — empirical instrumentation to determine why every SCREEN_RECORDING webm is captured at ~6-7 fps actual rate; deferred from earlier sessions.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md` to permanently prevent the cwd-leak Pattern Class; reproduction running tally now **~27+** across recent sessions (was ~26+ at end of W5 Session 3; +1 today). Strong empirical signal continues mounting; the single-session fix would mechanically prevent this entire bug class going forward.
- **P-26 below-fold scroll capture bugs** + **P-27 capture bugs #9 + #15** — LOW priority; re-evaluate after P-49 closes.
- **W#2 graduation** — deferred until P-49 closes at the workstream-by-workstream level.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started.
- **Infrastructure TODOs** — Supabase file-size offline check (separate operational concern; not blocking workflows).

---

## Status of last session

**P-49 W5 Session 4 — SCOPE-MISREAD ROLLBACK + CORRECTIVE-PLANNING SESSION** on `workflow-2-competition-scraping`. Wrong-spec build commit `5fa1f53` SHIPPED to vklf.com via ff-merge to main + Vercel auto-redeploy and was HARD-REVERTED mid-Phase-4 via revert commit `958ccf8`; net live-site change = ZERO since the revert returned the site to the W5 Session 3 deploy state.

**Session shape (DEPLOY-AND-REVERT + CORRECTIVE-PLANNING — 2 work commits + 1 doc-batch commit + 8 pushes):**

- Build commit `5fa1f53` (8 files +2705/-54) — wrong-spec single-page "By Category-Type" surface + card-style grouping + browser-side execution + 1 AI flow + NEW P-51 ROADMAP skeleton entry. **DEPLOYED then REVERTED** (wrong-spec). Lives in git history on `main` + `workflow-2-competition-scraping` for forensic audit trail.
- Revert commit `958ccf8` (8 files +54/-2705) — hard revert per director's picker selection (a). **CURRENT HEAD** on both `main` and `workflow-2-competition-scraping`.
- PENDING: end-of-session doc-batch commit (this doc-batch agent's output) — will be next on workflow-2 + ff-merged to main.

**THREE Rule 14f forced-pickers fired this session — 3/3 = 100% Yes-to-Recommended:** (1) Session-start scope picker (Per-Category only this session Recommended); (2) Rule 9 deploy gate picker (Deploy build `5fa1f53` to main Recommended); (3) Post-Phase-4-discovery rollback picker (Hard revert now Option (a) Recommended). Running cumulative across recent 9 sessions = **82/85 = 96.5% Yes-to-Recommended**.

**TWO Rule 9 deploy gates fired this session** (build deploy of `5fa1f53` + hard-revert deploy of `958ccf8`).

**Schema-change-in-flight flag STAYS NO entire session** — entry NO (PER_PROJECT enum value already in production from W5 Session 1.5 schema push 2026-05-27) + STAYS NO through build (no `prisma db push` fired) + STAYS NO through revert + exit NO.

**ZERO DEFERRED items at session end (Rule 26)** — 7 in-session tasks; all 7 completed cleanly.

**Baselines locked from this session:** UNCHANGED from W5 Session 3 exit (since the build was hard-reverted): src/lib `node:test` = **950/950** + `npm run build` = **67 routes** + extension `npm test` = **910/910 UNCHANGED**.

**ONE NEW HIGH-importance CORRECTIONS_LOG §Entry 2026-05-28** capturing the scope-misread incident (with the divergence-table reproduced verbatim) + root cause (RE-VIOLATION of `feedback_plan_output_shape_before_building.md` — pre-build joint-confirmation pinned high-level shape but NOT concrete column lists / button labels / AI-flow counts / execution-model semantics; director's "all good as proposed" approved an abstract proposal that diverged from the concrete spec in director's mind) + wrong-spec shipped + reverted artifacts + NEW Rule 31 + 3 backfilled spec docs + 5-session corrective rebuild plan + 6 open Block 1 questions paused mid-way + 3 sub-observations.

**NEW Rule 31 added inline to `docs/HANDOFF_PROTOCOL.md` at line 936** — Polish-item spec capture mechanism. **3 NEW spec docs backfilled** in NEW `docs/polish-item-specs/` directory.

**NEW §B 2026-05-28 entry appended to `docs/REVIEWS_PHASE_2_DESIGN.md`** (TWELFTH build/deploy-session §B entry per Rule 18; FOURTH W5 entry; FIRST W5 entry covering a revert).

**P-43 cwd-leak Pattern Class reproduced ~1 more time during today's `/scoreboard` runs.** Running tally now **~27+** across recent sessions; strong empirical signal continues mounting for the P-43 mechanical prevention small fix.

**FORTY-NINTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-49 W5 corrective rebuild begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping` and pre-load context. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry** (after this session's end-of-session doc-batch lands + the standard 3-push ping-pong sync fires): `workflow-2-competition-scraping` **even with `origin/main`** — both branches at the same SHA = the post-revert-and-doc-batch SHA after ff-merge. Verify with `git log main..HEAD --oneline` showing **0 commits ahead** at session entry. If shown as N>0 commits ahead, the doc-batch may not have ff-merged — surface to director.

**Pre-build read list for next session:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (NEW this session, line 936) — mandates reading §3 of the spec doc at session start for every session that touches a polish item with a spec doc.
- **`docs/polish-item-specs/P-49-W5-S4-category-page.md` §3 end-to-end** (the consolidated source-of-truth for Sessions 1-3 of the corrective rebuild). Read §1 (verbatim director instructions) + §2 (joint-discussion adjustments) as needed to verify §3 hasn't drifted from director's intent. **Read §4 (open questions) BEFORE any code lands** — these 6 questions are the resume point for Block 1 planning.
- **`docs/polish-item-specs/P-49-W5-S5-type-page.md` §3** (the consolidated source-of-truth for Sessions 4-5; structurally mirrors Category page). Not immediately needed at Phase 2 (Category page scaffold) but useful context for Block 5 planning.
- `docs/ROADMAP.md` lines 1-30 (header + recent session sequence) + the **P-49 polish-backlog entry** (Status: "🟢 IN-FLIGHT — CORRECTIVE REBUILD post-2026-05-28-rollback" with cross-reference to the two new P-49 spec docs).
- **`docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-28** (THE canonical entry capturing the scope-misread + 5-session corrective rebuild plan + cross-references to the spec docs + the architecture preserved across the rebuild) + **§B 2026-05-27-c** (W5 Session 3 Per-Competitor bulleted — the v3 critique-only theme-emergent prompt shape PRESERVED in the rebuild for the per-competitor input column [Column 10]) + **§B 2026-05-27-b** (W5 Session 2 per-batch endpoint architecture — PRESERVED in the rebuild) + **§B 2026-05-27** (W5 Session 1.5 design lock — partially superseded by the 5-session corrective rebuild plan on the surface architecture dimensions).
- **`docs/CORRECTIONS_LOG.md` §Entry 2026-05-28** (THE meta-pattern entry from this session — divergence table reproduced verbatim + root cause analysis + NEW Rule 31 + 6 open Block 1 questions).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - `feedback_plan_output_shape_before_building.md` — the related procedural memory; today's incident was a RE-VIOLATION of this rule; Rule 31 + the spec-doc mechanism are the structural backstop. STILL FIRES at session start on top of §3 of the spec doc.
  - `feedback_browser_first_ai_with_server_migration.md` — the default-to-browser-first AI directive; PARTIALLY SUPERSEDED for the Category + Type aggregation flows per director's verbatim server-side spec (the rule's default-to-browser-first guidance still applies for NEW AI batch flows outside the corrective-rebuild scope; the corrective-rebuild Category + Type pages explicitly use server-side per-batch endpoint per director's verbatim spec).
  - `feedback_recommendation_style.md` + `feedback_default_to_recommendation.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_deferred_items_registry.md` + `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md`.
- **W5 Session 3 shipped reference files** (the canonical reference implementation for the per-batch endpoint architecture preserved in the corrective rebuild):
  - `src/lib/competition-scraping/review-analysis/prompts.ts` (current shape carries `PER_REVIEW_SUMMARIZE_*` + `PER_COMPETITOR_BULLETED_*` builders; corrective rebuild Session 2 adds `PER_CATEGORY_BULLETED_*` + `PER_CATEGORY_NON_BULLETED_*` + Type variants in Session 5).
  - `src/lib/competition-scraping/handlers/review-analysis-run-batch.ts` (per-batch handler with flow-dispatch branches — corrective rebuild Session 2 extends with new flow values).
  - `src/lib/competition-scraping/handlers/review-analysis-update.ts` (PATCH handler — corrective rebuild Sessions 2 + 5 reuse this same handler for the Category-level + Type-level Edit affordance).
  - `src/app/projects/[projectId]/competition-scraping/competitor-reviews-analysis/page.tsx` (Table 2 — corrective rebuild Session 1 builds the new Category page at `src/app/projects/[projectId]/competition-scraping/reviews-analysis-by-category/page.tsx` mirroring its general shape but with the 13-column flat table + first-row-carries-label grouping per `docs/polish-item-specs/P-49-W5-S4-category-page.md` §3).
  - `src/app/projects/[projectId]/competition-scraping/components/CompetitionScrapingSurfaceNav.tsx` (4-option toggle; corrective rebuild Session 1 expands to 5 options enabling the two new pages).
  - `src/app/projects/[projectId]/competition-scraping/components/ColumnVisibilityBar.tsx` + `InlineCells.tsx` (canonical Patterns for column show/hide + click-to-edit; corrective rebuild Session 1 mirrors these).
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (2 gates planned by default if Phase 2 lands + Phase 3 deploy-decision picker fires Yes) + Rule 14f (forced-picker mechanics — expect ~6-10 to fire this session: 6 Block 1 question answers as forced-pickers + 1 Phase 2 build-scope picker + 1 Phase 3 deploy-now-vs-exit picker + 1 §4 Step 1c next-task picker at session-end) + Rule 18 (§A frozen + §B append-only; today's §B 2026-05-28 is the latest entry to anchor cross-references against) + Rule 21 + Rule 22 + Rule 23 (Change Impact Audit — PLOS-side handlers + src/lib + schema-change-in-flight STAYS NO at session entry) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + Rule 31 (NEW this session — Polish-item spec capture; reads §3 of the spec doc at session start) + §4 Step 4b extended template.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per NEW Rule 31, read `docs/polish-item-specs/P-49-W5-S4-category-page.md` §3 end-to-end + §4 (open questions) at session start as part of your pre-build read sequence.**

**Session goal:** P-49 W5 corrective rebuild — Block 1 planning resume (answer the 6 open questions captured in §4 of the Category page spec doc) + (if time + director approval) Session 1 of the corrective rebuild (Category page scaffold per the Category spec doc §3 — route + 13-column flat table + first-row-carries-label grouping + column show/hide + click-to-edit; NO drag, NO AI, NO Excel). BUILD session by default; 0-1 Rule 9 deploy gates planned by default (1 if Phase 2 scaffold lands + Phase 3 deploy-decision picker fires Yes).

**Branch verify (do this immediately after the resume script lands):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping

git log main..HEAD --oneline | wc -l
# Expected: 0 (workflow branch even with main after the standard 3-push ping-pong sync)

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)
```

If `git branch --show-current` shows `main`, STOP and surface to director. If `git log main..HEAD --oneline | wc -l` shows N>0, surface — the doc-batch ff-merge may not have completed.

**Phase 1 (planning resume — Block 1 + Blocks 2-5):**

Ask director the 6 open Block 1 questions (Q-A through 1b-iii — verbatim in `docs/polish-item-specs/P-49-W5-S4-category-page.md` §4). For each answer:

- Append the answer to `docs/polish-item-specs/P-49-W5-S4-category-page.md` §2 with date + session tag.
- Update §3 (consolidated spec) to reflect the agreed answer.
- Remove the resolved question from §4.

After Block 1 closes, proceed to Block 2 (drag persistence schema — NEW schema columns; surfaces a likely `prisma db push` candidate for Session 3, NOT this session) + Block 3-4 (AI prompt drafting for Session 2's bulleted dedup + non-bulleted prose flows — captures v1 prompts in `docs/polish-item-specs/P-49-W5-S4-category-page.md` §3 sub-section "AI flow") + Block 5 (Type page spec mirror — populate `docs/polish-item-specs/P-49-W5-S5-type-page.md` §2/§3 with director's answers). Estimate 30-90 minutes total for Phase 1.

**Phase 2 (Session 1 of corrective rebuild — Category page scaffold; fires a Rule 14f scope picker first):**

Fire a Rule 14f forced-picker after Phase 1 closes:

- **Option A (Recommended):** Proceed to Phase 2 (build Category page scaffold per §3 — route + 13-column flat table + first-row-carries-label grouping + column show/hide + click-to-edit; NO drag, NO AI, NO Excel; first live run NOT required because no AI is involved at this scaffold-only level).
- **Option B:** Pause + end session after Phase 1 closes; defer Phase 2 to next session (gives director time to review the Phase 1 planning outcomes before code lands).
- **Option C (escape-hatch):** Director writes free-text directive shaping the scope differently.

If director picks Option A, build the Category page scaffold per the consolidated §3 spec (route slug TBD between `reviews-analysis-by-category` and another — confirm at Phase 1; canonical Pattern reference = `src/app/projects/[projectId]/competition-scraping/competitor-reviews-analysis/page.tsx` for general shape + `src/app/projects/[projectId]/competition-scraping/components/ColumnVisibilityBar.tsx` for column show/hide + `src/app/projects/[projectId]/competition-scraping/components/InlineCells.tsx` for click-to-edit). Test coverage: ship the same Pattern as W5 Sessions 2-3 (positive test pinning the route + per-column data source + negative test asserting deleted-W5-Session-4-wrong-spec surfaces absent).

**Phase 3 (deploy decision):**

If Phase 2 lands + scoreboard-verifies, fire a Rule 14f deploy-now-vs-exit picker. If director picks deploy, ff-merge to main + Vercel auto-redeploy + Phase 4 director real-Chrome verification on the new Category page (verify columns + grouping + show/hide + click-to-edit; AI flows + drag + Excel + write-back are NOT yet expected since Sessions 2 + 3 ship those). If Phase 4 surfaces redirects, bundle multi-redirect Phase 4 issues into single FFs per the canonical "Same-day Phase 4 multi-redirect bundling Pattern" from CORRECTIONS_LOG §Entry 2026-05-27-c.

**Scoreboard targets** (entry baselines = today's W5 Session 4 post-revert baselines = W5 Session 3 exit baselines):

- Root tsc clean (UNCHANGED)
- Extension tsc clean (UNCHANGED)
- Extension `npm test` = 910/910 (UNCHANGED — corrective rebuild is PLOS-side; no extension changes planned)
- src/lib `node:test` ≥ 950 (entry 950; expect +N for new Category page Server Components test surface + handler tests if any; rough estimate +5-15 for Phase 2 scaffold; +0 if scaffold is pure UI with no new src/lib code)
- `npm run build` = 67 routes + N for new Category page (entry 67; +1 expected for Category page = 68 routes; +0 if also enabling Type page route without populating it; +1 if both routes ship live at session end = 69 routes)
- Check 6 Playwright SKIPPED per Rule 27 standing precedent (BUILD session)

**Deploy mechanics:** 0-1 Rule 9 deploy gates planned by default for this session (1 if Phase 2 + Phase 3 deploy fires; 0 if session pauses after Phase 1 per Phase 2 Option B). If deploy fires, expect the standard 3-push pattern (workflow-2 push + ff-merge to main + push main + ping-pong workflow-2) per `feedback_approval_scope_per_decision_unit.md`; if fix-forwards needed, bundle multi-redirect Phase 4 issues into single FFs.

**Group A docs to update at session end** (8-doc bundle assuming no new rules or memory files): ROADMAP header bump + P-49 polish-backlog entry status update (corrective rebuild Session 1 outcome) + CHAT_REGISTRY header bump (172nd session) + DOCUMENT_MANIFEST header bump + CORRECTIONS_LOG header + 1 NEW §Entry capturing this session's outcome + HANDOFF_PROTOCOL header bump only + CLAUDE_CODE_STARTER header bump only + NEXT_SESSION full rewrite for next session.

**Group B docs to update at session end:** NEW §B entry appended to `docs/REVIEWS_PHASE_2_DESIGN.md` (THIRTEENTH build/deploy-session §B entry per Rule 18; FIFTH W5 entry; FIRST corrective-rebuild Session entry; captures the Phase 1 planning outcomes + the Phase 2 Category page scaffold + Phase 3 deploy decision + Phase 4 verification outcome + any new Patterns or §A supersedences). `docs/COMPETITION_SCRAPING_DESIGN.md` UNCHANGED (W5 is PLOS-side; no extension-side files in the planned commit set). `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` UNCHANGED (W5 verification happens in-session via Phase 4 not via the verification backlog). **Update `docs/polish-item-specs/P-49-W5-S4-category-page.md` §2 + §3 + §4 in real-time during Phase 1 planning** (every Block 1 answer appends to §2 + updates §3 + removes the question from §4).

**Schema-change-in-flight flag** at session entry: NO (the 5 enum values in `ReviewAnalysisLevel` already cover all remaining flows; no schema work planned for Phase 2). Expected at session end: NO (the corrective rebuild Session 1 is pure scaffold — no schema work; Block 2 surfaces a likely `prisma db push` candidate for Session 3 only).

---

## Pre-session notes (offline; optional)

Director may want to think ahead about:

- **Answers to the 6 Block 1 open questions above** (Q-A through 1b-iii). If director comes in with all 6 answers, Phase 1 closes in ~15 minutes + Phase 2 starts immediately. If director wants to think through them during the session, Phase 1 takes 30-60 minutes.
- **Phase 2 deploy decision shape preference:** does director want Session 1 of the corrective rebuild to deploy at session-end (visible scaffold on vklf.com even with empty data), OR stay on workflow branch until Session 2 (when AI flows ship) so vklf.com only sees the new pages once they have data-rendering surfaces? Recommended path = deploy Session 1 at session-end (empty-data scaffold is fine; gives director early visual feedback on the table primitive before stacking interactions atop it).
- **Column 11 "Competitor Comprehensive Reviews Analysis (non-bulleted)" disposition** (Q-C above) — the most consequential of the 6 open questions because it determines whether a NEW per-competitor non-bulleted AI flow is needed (Option ii) vs piggybacking on Session 2 (Option iii) vs dropping the column entirely (Option i). Option (iii) is RECOMMENDED because it preserves the spec column count at 13 + uses the already-planned Session 2 non-bulleted flow without spawning a new per-competitor flow.

If director comes in with answers, Phase 1's pickers are mostly re-confirmations. If director wants to think through it during the session, the pickers are genuine.

---

## Why this pointer was written this way (debug aid for next session)

The session that wrote this pointer (W5 Session 4 — 2026-05-28) hard-reverted a wrong-spec build commit + established NEW Rule 31 + backfilled 3 spec docs + locked a 5-session corrective rebuild plan, but paused MID-WAY through Block 1 planning with 6 open questions. The pointer is structured to enable resumption at the planning conversation rather than at code, with the 6 open questions captured verbatim in a "What's pending from prior session" section AT THE TOP so future-me (or future-Claude) can pick up the planning thread without re-reading the spec doc end-to-end.

**The Phase 1/Phase 2/Phase 3 structure mirrors the actual session-shape recommendation:** Phase 1 (planning resume) before Phase 2 (code mechanics) before Phase 3 (deploy decision) — explicit because the failure mode of W5 Session 4 was Phase 2 starting before Phase 1 closed (the pre-build joint-confirmation pinned high-level shape but not concrete details; Rule 31 + the spec-doc mechanism are the structural backstop; this pointer's Phase 1/Phase 2 split is the procedural manifestation).

The session-start Rule 31 §3 read mandate is explicit because Rule 31 is brand-new (line 936 of HANDOFF_PROTOCOL.md as of this session); future Claude needs the explicit reminder until the rule becomes muscle memory.

---

## Alternate next-session candidates (if director shifts priorities at session start)

If director surfaces a different priority at session start, alternative paths off (a.106):

- **P-43 mechanical prevention small fix** — one-session fix; adds absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md` to mechanically prevent the cwd-leak Pattern Class; reproduction running tally now **~27+** across recent sessions; small standalone session done on `main` between W#2 sessions.
- **P-50 Condition Pathology card** — ~10-minute UI addition; one card insertion in two card-array files (`src/app/projects/[projectId]/page.tsx` + `src/app/projects/page.tsx`); standalone session on `main`.
- **P-48 Session 3 Diagnostic #2** — empirical instrumentation to determine why every SCREEN_RECORDING webm is captured at ~6-7 fps actual rate; deferred from earlier sessions; can interleave between corrective-rebuild sessions.
- **Pure planning extension** — if director wants the 5-session corrective rebuild plan re-confirmed at higher fidelity before any code lands, this session can stay pure-planning (Phase 1 only, no Phase 2/3) + add Block 6 (cross-session verification + Phase 4 PASS-criteria for each of the 5 sessions).

The Recommended path stays the corrective-rebuild Block 1 planning resume + (likely) Session 1 Category page scaffold because the 6 open questions block any concrete code mechanics on the corrective rebuild + the smallest verifiable unit (Category page scaffold) is the natural next code-step after Block 1 closes.
