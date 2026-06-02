# Next session

**Written:** 2026-06-02-g (`session_2026-06-02-g_p57-delete-coverage-gaps` — W#2 polish P-57 — the delete-coverage gaps on the competitor URL detail page are FILLED: (A) a per-row delete control for captured VIDEOS + (B) category-label deletion (content / image / video categories) with a project-wide "delete items too" cascade fired from a ✕-on-the-category-pill control ✅ DEPLOYED-AND-VERIFIED end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` (director: deploy 1 "I was able to delete videos" + deploy 2/FF1 "pass") — **P-57 is now CLOSED.** PLOS-side change; NO extension SOURCE change; NO schema change; ONE NEW PLOS route (`competition-scraping/categories`). `main` went `a6081da → 9c4b548 → 418e6ca`. **Closes (a.128) = P-57 ✅ DEPLOYED-AND-VERIFIED → P-57 CLOSED. Opens (a.129) RECOMMENDED-NEXT = P-60** (add the open-detail ↗ icon to the 3 analysis tables' Product Name column; LOW) on `workflow-2-competition-scraping` — this was the director's §4 Step 1c forced-picker choice. **FIRST action next session = read `docs/polish-item-specs/P-60-*.md` if it exists; CREATE the spec per Rule 31 if it does not exist yet (it may not); the 3 analysis tables are reviews-analysis [per-competitor] + by-category + by-type.**)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This was the SEVENTH session of 2026-06-02 (suffix `-g`); the prior REAL sessions today are `session_2026-06-02` (no suffix) + `session_2026-06-02-b` (P-55 Phase 2b-ii) + `session_2026-06-02-c` (the three trimmed export variants) + `session_2026-06-02-d` (P-55 Phase 3 primer wiring + graduation methodology) + `session_2026-06-02-e` (the P-56 Amazon flicker fix) + `session_2026-06-02-f` (P-58 download-extension-zip latest build). The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session. Keep trusting the harness `currentDate`; do NOT regress or invent a suffix ahead of it.

> ⚠️ **BRANCH: next session stays on `workflow-2-competition-scraping`.** P-60 (the open-detail ↗ icon on the 3 analysis tables) is W#2-only. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically.

> ⚠️ **BRANCH STATE — NOTHING HELD BACK.** This session's two build deploys (`9c4b548` + `418e6ca`) are on main. After this session's end-of-session doc-batch ff-merge, `main` and `workflow-2-competition-scraping` are both at `418e6ca` + the doc-batch SHA. Expect `git log origin/main..HEAD --oneline` to show 0 at next session entry.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry next session.** This session stayed NO the entire time (deletes used existing models + rows; no `prisma db push`). **P-60 is a UI icon on three existing tables — NO schema change is anticipated.** Confirm at the session's start. If a field/migration is unexpectedly needed, run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod).

> ⚠️ **NO OWED VERIFICATION.** P-57 was director-verified on vklf.com this session (both deploys). There is NO owed verification carried into next session. P-60 is a NEW unit.

> ⚠️ **P-60 SPEC MAY NOT EXIST YET — FLAG.** The P-60 spec doc (`docs/polish-item-specs/P-60-*.md`) may NOT have been created yet — P-60 was captured as a ROADMAP entry in the 2026-06-02-d capture batch, but a per-item spec doc was confirmed-created only for P-56 / P-57 / P-58 / P-61 / P-62. **First action: check for the P-60 spec; if missing, CREATE it per Rule 31 (capture the verbatim director directive from the ROADMAP P-60 entry + the joint design decisions BEFORE coding).** (This is exactly what happened this session for P-57 — the spec did not exist and was created as the first artifact.)

---

## What we did this session (in plain terms)

This session filled in the "delete" gaps on a competitor's detail page.

**First we checked what could and couldn't already be deleted** (rather than trusting the original note). It turned out you could already delete individual reviews, captured text, and captured images. The two things you couldn't delete were captured **videos** and **category labels** — so those were the real gaps.

**Then we added the missing delete buttons.** Captured videos now have a trash button on each one, exactly like images and text. And every category label now has a small ✕ on its pill — clicking it deletes that label across the whole project. Because that's a big, permanent action, the app first tells you exactly how many tagged items will be deleted along with the label, and asks you to confirm.

**We shipped this in two deploys.** The first deploy added the video deletes and put the category ✕ in the wrong place (a dropdown that doesn't actually show on that page, so you couldn't find it). You spotted that — "I can't see any 🗑 next to any category" — and we moved the ✕ straight onto each category pill, where it's now visible. You verified both: videos deleted fine, and the category ✕ with the count confirmation worked. **"Pass."**

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (the P-57 entry now ✅ CLOSED + the P-59 / P-60 / P-61 / P-62 entries) + `docs/polish-item-specs/` (the per-item specs).

- **(a.129) = P-60** — add the open-detail ↗ icon to the 3 analysis tables' Product Name column — LOW. **NEXT SESSION (see below).**
- **(P-59)** update the existing `DetailedUserGuide.tsx` — LOW/MEDIUM.
- **(P-61)** extension server-side default categories per platform per content-type (spec doc exists) — MEDIUM.
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card rename + hub page + "Continued Competitive Surveillance" page with the verbatim 5-question checklist (spec doc exists) — future-workflow.
- **(P-56 Option-2 follow-up)** the optional "kill the idle flash too" (redraw only changed text) for the residual reading-time flicker on Amazon Highlight Terms; raise only if the director wants it.
- **(P-53)** Excel "Export Table" for the Category + Type pages — effectively ABSORBED by P-55's grouped spreadsheets; LOW residue only.
- **(P-43 mechanical prevention small fix)** — add an absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; single-session fix.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — now schedulable (P-54 closed + P-55 essentially closed + P-56 closed + P-57 closed + P-58 closed); director's discretion.

## What we'll do next session (in plain terms)

1. **We add a little "open" icon (↗) next to each Product Name** in the three reviews-analysis tables (the per-competitor one, the by-category one, and the by-type one), so you can jump straight from a table row to that competitor's full detail page.
2. **We agree the exact spot + behavior with you if there's any choice to make** — but this is a small, well-understood UI follow-up.
3. **As always:** once it's wired, we scoreboard-verify, and (since it's a live-site piece) verify together on vklf.com.

## What's still left in the total roadmap (in plain terms)

- **P-57 (fill the delete-coverage gaps — videos + category labels) — ✅ CLOSED 2026-06-02-g.** Captured videos are deletable per-row; category labels are deletable project-wide with a count-bearing confirm; verified live.
- **P-60 (open-detail ↗ icon on the 3 analysis tables) — NEXT, LOW.** The next pick.
- **P-59 / P-61 / P-62 (NEW captures)** — DetailedUserGuide update / extension default categories / the Workflow-11 surveillance card+page. Mostly MEDIUM/LOW or future-workflow.
- **P-58 (Download-Extension-zip serves the latest build) — ✅ CLOSED 2026-06-02-f.** The in-app download now always serves the newest build, refreshed at every deploy; verified live.
- **P-56 (Amazon Highlight Terms flicker blocks text selection) — ✅ CLOSED 2026-06-02-e.** Fixed + verified on real Amazon; the only residue is the optional "kill the idle flash too" Option-2 follow-up.
- **P-55 (Comprehensive Analysis downloadable materials + primer + main-table additions) — ✅ ESSENTIALLY COMPLETE 2026-06-02-d.** Only the absorbed P-53 on-page button could remain.
- **P-54 (main Competitor URLs table enhancements) — ✅ CLOSED 2026-06-01-d.** All 5 phases shipped + verified.
- **P-49 W#2 Reviews Phase 2 — ✅ CLOSED 2026-06-01.** All three analysis pages shipped + verified.
- **P-52 (AI model registry + Rule 32 + Opus 4.8 rollout)** — ✅ DEPLOYED-AND-VERIFIED. TWO carry-overs OPEN: official Opus 4.8 pricing numbers + the deferred W#1 shared-list migration.
- **P-51 per-Project competitive landscape AI summary** — SUPERSEDED for its UI dimension by P-55; the `ReviewAnalysis.PER_PROJECT` slot stays unused.
- **P-50 NEW Condition Pathology card** — small single-session UI addition; director already approved scope.
- **P-48 Session 3 (Diagnostic #2 for screen-recording stutter)** — empirical instrumentation; deferred.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`. Single-session fix.
- **P-26 below-fold scroll capture bugs** + **P-27 capture bugs #9 + #15** — LOW priority.
- **W#2 graduation** — now schedulable (P-54 + P-55 + P-56 + P-57 + P-58 done); director's discretion. The NEW continuity primer + `./catch-up-workflow 2` mechanism support it.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started (P-62 seeds part of W#11).
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**W#2 polish P-57 — the delete-coverage gaps on the competitor URL detail page are FILLED — ✅ DEPLOYED-AND-VERIFIED 2026-06-02-g** on vklf.com via `workflow-2-competition-scraping` → `main`; director verdicts deploy 1 "I was able to delete videos" + deploy 2/FF1 "pass". `main` went `a6081da → 9c4b548 → 418e6ca` (two clean ff-merges of the exact verified commits). **An AUDIT-then-DESIGN-then-BUILD-then-DEPLOY session: TWO builds (`9c4b548` deploy 1 + `418e6ca` deploy 2/FF1), TWO deploys, TWO Rule 9 deploy gates (both director "Deploy to main"), FIVE Rule 14f pickers (Q1 category-delete behavior [director OVERRIDE → Option C "delete items too"] + Q2 placement [first "picker trash" Recommended, then re-picked "✕ on pill" OVERRIDE] + the deploy gate ×2 + the §4 Step 1c next-pick). PLOS-side change; NO extension SOURCE change; NO schema change; ONE NEW route.**

**Session shape (code-truth audit → Rule 31 spec creation → design pickers → build → deploy 1 → real-Chrome verify → audit-shipped-state correction → FF1 → real-Chrome verify → end-of-session doc-batch):**

- **The code-truth audit (FIRST action):** an Explore agent mapped all SEVEN item types' delete coverage and found reviews / captured text / captured images ALREADY deletable, captured videos had a backend DELETE since P-27 Build #5 but a deferred UI, and the three category types had neither backend nor UI — narrowing the work to TWO real gaps.
- **The P-57 spec (FIRST artifact):** `docs/polish-item-specs/P-57-delete-coverage-gaps.md` did NOT exist before this session — it was CREATED per Rule 31 (the verbatim director directive + the audit findings in §2, the consolidated spec in §3, the Q1/Q2 design questions in §4).
- **Deploy 1 (`9c4b548`):** Part A captured-video delete UI (a per-video trash + `ConfirmDeleteDialog` + `handleVideoDeleted` mirroring the image card) + Part B backend — a NEW pure helper `src/lib/competition-scraping/category-vocabulary.ts` (+10 node:test) + a NEW route `competition-scraping/categories` (GET usage count + DELETE cascade; routes 72 → 73) + a deploy-1 trash inside the `VocabularyPicker` for the three category types. `main` went `a6081da → 9c4b548`.
- **Deploy 2 / FF1 (`418e6ca`) — an audit-shipped-state correction (Rule 31):** the director found no 🗑 anywhere — the `VocabularyPicker` is NOT shown inline on the detail page (only inside the "+ Manually add" modals; video-category has no picker). Director re-picked "✕ on each category pill"; a reusable `CategoryPill` component (the pill + inline ✕ → count-bearing confirm → cascade → reload) was wired into all three captured-item cards, and the deploy-1 picker-trash was REVERTED (UI-only; routes UNCHANGED at 73). `main` went `9c4b548 → 418e6ca`.
- **1 PENDING:** the end-of-session doc-batch commit (this doc-batch agent's output) — the Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY [unchanged]) + HANDOFF_PROTOCOL header bump + the NEW P-57 Group B polish-item-spec + a NEW §B 2026-06-02-g note in `docs/COMPETITION_SCRAPING_DESIGN.md` + the VERIFICATION_BACKLOG Deploy session #40 + the PRIMER §5 update. **This doc-batch commit ff-merges to main per the standard 3-push pattern.**

**Schema-change-in-flight flag NO at entry → STAYED NO entire session → NO at exit. NEXT session (P-60) = NO at entry anticipated.**

**ZERO open DEFERRED items at exit (Rule 26):** TaskList returned EMPTY at entry AND exit; all in-session work completed. P-59 / P-60 / P-61 / P-62 are the documented roadmap continuation (P-60 = the (a.129) pick), NOT TaskList DEFERRED items.

**Baselines locked from this session:** root tsc clean (UNCHANGED) + extension tsc clean (UNCHANGED — no extension files touched) + extension `npm test` = **915/915 UNCHANGED** + src/lib `node:test` = **1363/1363** (+10 — the new `category-vocabulary` helper tests) + `npm run build` = **73 routes** (+1 — the new `competition-scraping/categories` endpoint); Check 6 Playwright SKIPPED per Rule 27 (destructive-delete + visual judgment = director real-Chrome verification).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-02-g** (no top-tier slip — both deploys passed; the director verified both) capturing: (a) **an audit-shipped-state correction (Rule 31), the SECOND in two sessions** — a UI placement recommendation rested on a wrong assumption about where the `VocabularyPicker` renders; LESSON — verify WHERE the host component actually renders for the specific data types in scope before recommending a placement; (b) NEW reusable PATTERN — "a destructive project-wide cascade fired from an inline control must pre-fetch + display the exact affected-item count in the confirm before allowing it"; (c) the director deliberately chose the destructive Q1 'delete items too' option. **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NO new memory file this session.**

**1 NEW Group B polish-item-spec** — `docs/polish-item-specs/P-57-delete-coverage-gaps.md` (CREATED this session; Status → ✅ DEPLOYED-AND-VERIFIED 2026-06-02-g; §2 the Rule 3 audit table; §3 AS-SHIPPED Parts A + B; §4 Q1 RESOLVED [Option C "delete items too"] + Q2 RESOLVED [picker-trash → ✕-on-pill correction]) + a NEW §B 2026-06-02-g note in `docs/COMPETITION_SCRAPING_DESIGN.md` + `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (Deploy session #40 — videos PASS + category ✕-on-pill PASS) + `docs/COMPETITION_SCRAPING_PRIMER.md` (§5 open-items — P-57 now CLOSED; P-60 the next pick). `docs/REVIEWS_PHASE_2_DESIGN.md` UNCHANGED. `docs/COMPETITION_DATA_V2_DESIGN.md` UNCHANGED. `docs/AI_MODEL_REGISTRY.md` UNCHANGED.

**ROADMAP P-57 polish-backlog entry flipped** to ✅ SHIPPED-AT-DEPLOY-LEVEL + DEPLOYED-AND-VERIFIED + CLOSED (with the as-shipped Parts A + B narrative + the audit finding + the picker→pill correction + the original capture preserved) + (a.128) CLOSED / (a.129) opens = P-60.

**SEVENTY-SECOND end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ZERO destructive-class DEV/infra ops — no `prisma db push`, no `migrate reset`, no drop, no dev-data deletes. **NOTE: this session SHIPPED a user-facing destructive FEATURE** — the category-label cascade delete (deleting a `VocabularyEntry` AND every tagged CapturedText / Image / Video across the project, with best-effort storage cleanup). That is a deliberate, director-chosen product feature (Q1 Option C "delete items too"), guarded by a count-bearing project-wide confirm; it is NOT a destructive DEV/infra op. NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (P-60):** **NO schema change anticipated** — P-60 is a UI icon on three existing analysis tables (a read-side ↗ link to the detail page). No destructive ops anticipated. If a field/migration is unexpectedly needed, run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod). No other Rule 8/9/29 triggers anticipated.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the P-57 spec (created this session) + the P-60 spec (may need creating) + the memory directory.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. P-60 (the open-detail ↗ icon on the 3 analysis tables) is W#2-only. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch ff-merges to main): `main` and `workflow-2-competition-scraping` BOTH at `418e6ca` (the P-57 FF1 deploy) + the end-of-session doc-batch SHA. **Verify with `git log origin/main..HEAD --oneline` showing 0** (everything is on main after the doc-batch ff-merge); `git status` clean apart from historical untracked .zip + .html artifacts at repo root.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files; since this NEXT_SESSION.md references P-43 + P-49 + P-50 + P-51 + P-52 + P-53 + P-54 + P-55 + P-56 + P-57 + P-58 + P-59 + P-60 + P-61 + P-62, read §2 + §3 of each at session start — ESPECIALLY P-60):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate; **also the "CREATE the spec if missing" guarantee — applies to P-60**) + Rule 14f (forced-picker mechanics) + Rule 9 (deploy gate) + Rule 18 + Rule 23 (Change Impact Audit) + Rule 24 (pre-capture search) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + Rule 33 (workflow graduation continuity) + §4 Step 4b extended template.
- **`docs/polish-item-specs/P-60-*.md`** — the SOURCE-OF-TRUTH for P-60 IF IT EXISTS. **If it does NOT exist, CREATE it per Rule 31** (capture the verbatim director directive from the ROADMAP P-60 entry + the joint design decisions BEFORE coding). The ROADMAP P-60 entry (search "P-60" in `docs/ROADMAP.md`) is the captured directive to start from. (This session's P-57 spec was created exactly this way as the first artifact — follow the same pattern.)
- **The 3 analysis tables in W#2** — read how the reviews-analysis (per-competitor), by-category, and by-type pages render the Product Name column + how each row already knows its competitor URL / urlId, per Rule 3, so the new ↗ link points at the correct detail page (`url/[urlId]`) and mirrors any existing open-detail pattern.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-02-g (this session — the audit-shipped-state placement correction + the count-bearing-confirm PATTERN) + §Entry 2026-06-02-f (the dead-placeholder audit-shipped-state correction) + §Entry 2026-06-02-c (the P-43 cwd-leak recurrence) + §Entry 2026-05-31 (the TOP-TIER SLIP — never act on an instruction that is not verbatim in a director message; honor explicit picker choices; restart on degraded tooling).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - **`feedback_plan_output_shape_before_building.md`** + **`feedback_no_fabricated_instructions.md`** — design the ↗ icon placement WITH the director if there is any real fork; act only on verbatim directives.
  - **`feedback_default_to_recommendation.md`** + **`feedback_recommendation_style.md`** — recommend the most-reliable option; skip the forced-picker when only re-confirming a default-approved recommendation.
  - **`feedback_destructive_ops_confirmation.md`** — P-60 is read-only UI, but keep the destructive-ops audit at handoff.
  - `feedback_approval_scope_per_decision_unit.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_browser_first_ai_with_server_migration.md` + `feedback_exports_include_all_table_data.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; read §2 + §3 of each listed spec at session start — especially `docs/polish-item-specs/P-60-*.md` (the source-of-truth, IF it exists — CREATE it per Rule 31 if missing).** **This session is on `workflow-2-competition-scraping` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.129) = P-60 — the open-detail ↗ icon on the 3 analysis tables):** add a small open-detail ↗ icon to the Product Name column of the three reviews-analysis tables — the per-competitor reviews-analysis page, the by-category page, and the by-type page — so a row links straight to that competitor's detail page (`url/[urlId]`). This is LOW priority and was your §4 Step 1c forced-picker choice. **P-57 is CLOSED — do NOT reopen it.**

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: 0 — main and workflow-2 are both at 418e6ca + the 2026-06-02-g doc-batch SHA; nothing is held back
```

If `git branch --show-current` shows `main`, run `./resume-workflow 2`.

**FIRST step (the P-60 spec — BEFORE any build):** check for `docs/polish-item-specs/P-60-*.md`. **If it exists,** read §2 + §3 fully. **If it does NOT exist,** CREATE it per Rule 31 — capture the verbatim director directive (from the ROADMAP P-60 entry) in §1, the joint design decisions in §2, the consolidated spec in §3, the open questions in §4, and the cross-refs in §5 — BEFORE writing any code. (This session created the P-57 spec exactly this way as the first artifact; mirror it.)

**Feature shape (design WITH the director if there is a real fork):** P-60 is a small, well-understood UI follow-up — an ↗ icon next to each Product Name that opens that competitor's detail page in a new tab (or per the director's choice). The likely forks are minor (icon placement next to vs. on the name; new-tab vs. same-tab; whether all three tables get it). Plan the shape WITH me per `feedback_plan_output_shape_before_building` if anything is non-obvious; otherwise describe it plainly and proceed per `feedback_default_to_recommendation`. Read how the three pages already render Product Name + how each row knows its urlId per Rule 3, and mirror any existing open-detail affordance elsewhere in W#2.

**Forced-picker shape (before coding):** fire a Rule 14f AskUserQuestion only if there is a real design fork (e.g. new-tab vs. same-tab; icon vs. linked name). If the recommended path is obvious + default-approved, describe it plainly and proceed.

**Test coverage decision:** P-60 is mostly presentational. Add unit coverage for any new pure helper (e.g. a URL/href builder) per the standard W#2 pattern; the live behavior is verified by the director on vklf.com (click the ↗ → lands on the right detail page). Check 6 Playwright per Rule 27 (likely SKIPPED — small UI link + visual judgment).

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (expect UNCHANGED)
- Extension tsc clean (expect UNCHANGED — P-60 is PLOS-only)
- Extension `npm test` = 915 (expect UNCHANGED)
- src/lib `node:test` ≥ 1363 (entry 1363; +N for any new helper tests)
- `npm run build` = 73 routes (expect UNCHANGED — a UI link, no new route)
- Check 6 Playwright SKIPPED per Rule 27 (small UI link = visual judgment)
- **Run `npm run build` with an explicit absolute `cd /workspaces/brand-operations-hub` prefix** — the P-43 cwd-leak recurred recently; treat a route count of 0 as the cwd-leak tell-tale.

**Deploy mechanics:** P-60 has a PLOS-side serving piece (the ↗ icon on the live pages) — it ships via the standard Rule 9 gate + 3-push pattern to vklf.com, director-verified. Expect 1 Rule 9 deploy gate. P-60 is PLOS-only — no extension build / sideload zip expected.

**Schema-change-in-flight flag:** **NO at entry**; no schema change anticipated for P-60 (a read-side UI link). If a field/migration is unexpectedly needed, audit + authorize WITH me first before any `prisma db push`.

**Group A docs to update at session end:** ROADMAP header bump + the P-60 entry status update + (a.129) status + CHAT_REGISTRY header bump (195th session) + DOCUMENT_MANIFEST header + flags + the schema-change-in-flight transition + CORRECTIONS_LOG header (+ 1 NEW §Entry if anything notable) + HANDOFF_PROTOCOL header bump + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite.

**Group B docs to update at session end:** the P-60 spec (create if missing; mark the feature shipped/verified) + `docs/COMPETITION_SCRAPING_DESIGN.md` (a §B note if the navigation design materially changes) + `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (the P-60 verification) + `docs/COMPETITION_SCRAPING_PRIMER.md` (§5 — P-60 status).

**Standing carry-overs into this session:**

- **(a.129) = P-60** — add the open-detail ↗ icon to the 3 analysis tables' Product Name column. Read/CREATE the P-60 spec FIRST; mirror any existing open-detail pattern; PLOS-only.
- **P-59 / P-61 / P-62** — the other NEW captures (DetailedUserGuide update / extension default categories / the Workflow-11 surveillance card+page). Behind P-60.
- **P-56 Option-2 follow-up** — the optional "kill the idle flash too" (redraw only changed text) for the residual reading-time flicker; raise only if you want it.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; single-session fix / palate-cleanser.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — now schedulable (P-54 + P-55 + P-56 + P-57 + P-58 done); the NEW continuity primer + `./catch-up-workflow 2` mechanism support it; director's discretion.

---

## Why this pointer was written this way (debug aid)

- **(a.129) = P-60 is the PICK because it was the director's §4 Step 1c forced-picker choice this session.** With P-57 closed, the director picked P-60 (the open-detail ↗ icon) over the other MEDIUM/LOW captures — a quick, well-understood UI follow-up that improves navigation from the analysis tables to the detail pages.
- **The FIRST action is the P-60 spec, not code.** P-60 was captured as a ROADMAP entry but a per-item spec was confirmed-created only for P-56 / P-57 / P-58 / P-61 / P-62 — so the P-60 spec may not exist yet. Rule 31 requires the spec as the source-of-truth before building; create it if missing (this session's P-57 spec was created exactly that way).
- **Design the shape WITH the director only if there is a real fork.** P-60's forks are minor (new-tab vs. same-tab; icon placement; whether all three tables get it) — fire a Rule 14f picker only if non-obvious, else proceed on the recommended path.
- **This is PLOS-only work** — the three analysis tables live in the PLOS app; it deploys to vklf.com under the standard Rule 9 gate. No extension build expected.
- **Schema-change-in-flight = NO at entry** — this session stayed NO throughout (deletes used existing models + rows); P-60 is a read-side UI link with no anticipated schema change.
- **Nothing is held back** — both P-57 deploys are on main, and the doc-batch ff-merges this session. Expect `git log origin/main..HEAD` = 0 at entry.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.129.alt1) P-60** (current PICK — pre-loaded above). Add the open-detail ↗ icon to the 3 analysis tables' Product Name column; read/CREATE the P-60 spec first; PLOS-only; on `workflow-2-competition-scraping`.
- **(a.129.alt2) P-59 update the existing `DetailedUserGuide.tsx`** (LOW/MEDIUM; on `workflow-2-competition-scraping`).
- **(a.129.alt3) P-61 extension server-side default categories per platform per content-type** (MEDIUM; spec exists; design schema + overlay UX WITH the director; on `workflow-2-competition-scraping`).
- **(a.129.alt4) W#2 graduation** (now schedulable — P-54 + P-55 + P-56 + P-57 + P-58 done; the continuity primer + `./catch-up-workflow 2` mechanism support it; director's discretion).
- **(a.129.alt5) P-56 Option-2 follow-up** (the optional "kill the idle flash too" / redraw only changed text for the residual reading-time flicker; on `workflow-2-competition-scraping`).
- **(a.129.alt6) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; quick palate-cleanser).
- **(a.129.alt7) P-50 NEW Condition Pathology card** (small single-session UI addition; director already approved scope; on `workflow-2-competition-scraping`).
