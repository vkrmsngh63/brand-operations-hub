# Next session

**Written:** 2026-06-02-h (`session_2026-06-02-h_p60-open-detail-icon-analysis-tables` — W#2 polish P-60 — the open-detail ↗ icon is now on the Product Name column of all THREE reviews-analysis tables (the per-competitor `competitor-reviews-analysis` page, the `reviews-analysis-by-category` page, and the `reviews-analysis-by-type` page), mirroring the ↗ open-detail link on the main Competitor URLs table ✅ DEPLOYED-AND-VERIFIED end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` (director verbatim "PASS") — **P-60 is now CLOSED.** PLOS-side UI-only change; NO extension SOURCE change; NO schema change; NO new route. `main` went `2e9c0c5 → e08684a`. **Closes (a.129) = P-60 ✅ DEPLOYED-AND-VERIFIED → P-60 CLOSED. Opens (a.130) RECOMMENDED-NEXT = P-59** (update the existing `DetailedUserGuide.tsx` so the in-app user guide matches recently-shipped features; LOW/MEDIUM) on `workflow-2-competition-scraping` — this was the director's §4 Step 1c forced-picker choice. **FIRST action next session = read `docs/polish-item-specs/P-59-*.md` if it exists; CREATE the spec per Rule 31 if it does not exist yet (it may NOT — P-59 was a 2026-06-02-d ROADMAP capture, and a per-item spec was confirmed-created only for P-56 / P-57 / P-58 / P-60 / P-61 / P-62, so confirm spec presence FIRST, exactly like P-57 / P-58 / P-60 needed).**)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This was the EIGHTH session of 2026-06-02 (suffix `-h`); the prior REAL sessions today are `session_2026-06-02` (no suffix) + `session_2026-06-02-b` (P-55 Phase 2b-ii) + `session_2026-06-02-c` (the three trimmed export variants) + `session_2026-06-02-d` (P-55 Phase 3 primer wiring + graduation methodology) + `session_2026-06-02-e` (the P-56 Amazon flicker fix) + `session_2026-06-02-f` (P-58 download-extension-zip latest build) + `session_2026-06-02-g` (P-57 delete-coverage gaps). The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session. Keep trusting the harness `currentDate`; do NOT regress or invent a suffix ahead of it.

> ⚠️ **BRANCH: next session stays on `workflow-2-competition-scraping`.** P-59 (the `DetailedUserGuide.tsx` content update) is W#2-only. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically.

> ⚠️ **BRANCH STATE — NOTHING HELD BACK.** This session's one build deploy (`e08684a`) is on main. After this session's end-of-session doc-batch ff-merge, `main` and `workflow-2-competition-scraping` are both at `e08684a` + the doc-batch SHA. Expect `git log origin/main..HEAD --oneline` to show 0 at next session entry.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry next session.** This session stayed NO the entire time (a client-side navigation anchor; no `prisma db push`). **P-59 is a content update to an existing in-app guide component — NO schema change is anticipated.** Confirm at the session's start. If a field/migration is unexpectedly needed, run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod).

> ⚠️ **NO OWED VERIFICATION.** P-60 was director-verified on vklf.com this session ("PASS"). There is NO owed verification carried into next session. P-59 is a NEW unit.

> ⚠️ **P-59 SPEC MAY NOT EXIST YET — FLAG.** The P-59 spec doc (`docs/polish-item-specs/P-59-*.md`) may NOT have been created yet — P-59 was captured as a ROADMAP entry in the 2026-06-02-d capture batch, but a per-item spec doc was confirmed-created only for P-56 / P-57 / P-58 / P-60 / P-61 / P-62. **First action: check for the P-59 spec; if missing, CREATE it per Rule 31** (capture the verbatim director directive from the ROADMAP P-59 entry + the joint design decisions BEFORE coding). (This is exactly what happened for P-57 / P-58 / P-60 — the spec did not exist and was created as the first artifact.)

---

## What we did this session (in plain terms)

This session added a small "open" shortcut to three tables.

**On the main Competitor URLs table, each product name already has a little ↗ arrow** you can click to jump straight to that competitor's full detail page. The three reviews-analysis tables (the per-competitor one, the by-category one, and the by-type one) did not have it — so you had to go back to the main table to open a competitor.

**First we double-checked what was already there** (rather than trusting the note). It turned out the by-category and by-type tables already had a different little ↗ — but that one jumps to a specific review inside the AI summary box, not to the competitor's detail page. So none of the three tables actually had the "open this competitor" arrow on the product name.

**Then we added the arrow to all three.** Each product name now has the same ↗ next to it; clicking it opens that competitor's detail page. You verified it on vklf.com on all three pages. **"PASS."**

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (the P-60 entry now ✅ CLOSED + the P-59 / P-61 / P-62 entries) + `docs/polish-item-specs/` (the per-item specs).

- **(a.130) = P-59** — update the existing `DetailedUserGuide.tsx` so the in-app user guide matches recently-shipped features — LOW/MEDIUM. **NEXT SESSION (see below).**
- **(P-61)** extension server-side default categories per platform per content-type (spec doc exists) — MEDIUM.
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card rename + hub page + "Continued Competitive Surveillance" page with the verbatim 5-question checklist (spec doc exists) — future-workflow.
- **(P-56 Option-2 follow-up)** the optional "kill the idle flash too" (redraw only changed text) for the residual reading-time flicker on Amazon Highlight Terms; raise only if the director wants it.
- **(P-53)** Excel "Export Table" for the Category + Type pages — effectively ABSORBED by P-55's grouped spreadsheets; LOW residue only.
- **(P-43 mechanical prevention small fix)** — add an absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; single-session fix.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — now schedulable (P-54 closed + P-55 essentially closed + P-56 closed + P-57 closed + P-58 closed + P-60 closed); director's discretion.

## What we'll do next session (in plain terms)

1. **We update the in-app "Detailed User Guide"** so it describes everything the Competition Scraping area (and the extension that goes with it) can now do — the main table enhancements, the comprehensive-analysis Files box + editable primer, the deletes, the new ↗ navigation icons, the reviews capture + AI analysis, etc.
2. **We agree the audience/sections/tone with you if there's any real choice to make** — per the "plan the output shape before building" rule, since this is user-facing copy.
3. **As always:** once it's updated, we scoreboard-verify, and (since it's a live-site piece) verify together on vklf.com.

## What's still left in the total roadmap (in plain terms)

- **P-60 (open-detail ↗ icon on the 3 analysis tables) — ✅ CLOSED 2026-06-02-h.** Each product name on all three reviews-analysis tables now jumps to that competitor's detail page; verified live.
- **P-59 (update the Detailed User Guide) — NEXT, LOW/MEDIUM.** The next pick.
- **P-61 / P-62 (NEW captures)** — extension default categories / the Workflow-11 surveillance card+page. MEDIUM / future-workflow.
- **P-57 (fill the delete-coverage gaps — videos + category labels) — ✅ CLOSED 2026-06-02-g.** Captured videos are deletable per-row; category labels are deletable project-wide with a count-bearing confirm; verified live.
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
- **W#2 graduation** — now schedulable (P-54 + P-55 + P-56 + P-57 + P-58 + P-60 done); director's discretion. The NEW continuity primer + `./catch-up-workflow 2` mechanism support it.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started (P-62 seeds part of W#11).
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**W#2 polish P-60 — the open-detail ↗ icon is now on the Product Name column of all THREE reviews-analysis tables — ✅ DEPLOYED-AND-VERIFIED 2026-06-02-h** on vklf.com via `workflow-2-competition-scraping` → `main`; director verdict "PASS". `main` went `2e9c0c5 → e08684a` (one clean ff-merge of the exact verified commit). **An AUDIT-then-BUILD-then-DEPLOY session: ONE build (`e08684a`), ONE deploy, ONE Rule 9 deploy gate (director "Deploy to main"), TWO Rule 14f pickers total (the deploy gate + the §4 Step 1c next-pick → P-59); NO design picker fired (verbatim unambiguous directive — the default-to-recommendation exception applied). PLOS-side UI-only change; NO extension SOURCE change; NO schema change; NO new route.**

**Session shape (code-truth audit → Rule 31 spec creation → build → scoreboard → deploy → real-Chrome verify → end-of-session doc-batch):**

- **The code-truth audit (FIRST action):** an Explore agent mapped the four table surfaces and confirmed the premise with one clarification — the by-category/by-type pages DID already have a ↗, but it is the `data-testid="*-source-review-jump"` anchor in the AI comprehensive-summary BANNER cell (jumps to a specific review), NOT on the Product Name cell; the `competitor-reviews-analysis` page had no ↗ at all. So all three Product Name cells genuinely lacked an open-detail ↗ (scope unchanged: add it to all three). All three rows have `urlId` available (`url.id` / `u.id`); no shared Product-Name component → three independent edits.
- **The P-60 spec (FIRST artifact):** `docs/polish-item-specs/P-60-open-detail-icon-analysis-tables.md` did NOT exist before this session — it was CREATED per Rule 31 (the verbatim director directive in §1, the audit findings in §2, the as-built in §3, the verification in §5).
- **The build (`e08684a`):** each Product Name cell wraps its existing click-to-edit `InlineTextCell` in a `display:flex` container with a trailing `<a>` ↗ anchor → `/projects/[projectId]/competition-scraping/url/[urlId]`, styled `color:#58a6ff fontSize:13px`. Rendered as an `<a>` anchor (NOT a button+router) to MATCH the LOCAL source-review-jump anchor convention already on those pages (zero new imports). `projectId` threaded into `renderUrlRowCell` (competitor-reviews-analysis, via the `projectId`-bearing `UrlsTable`) + into `SortableCategoryRow`/`SortableTypeRow` → `renderDataCell` (by-category/by-type). `main` went `2e9c0c5 → e08684a`.
- **1 PENDING:** the end-of-session doc-batch commit (this doc-batch agent's output) — the Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY [unchanged]) + HANDOFF_PROTOCOL header bump + the NEW P-60 Group B polish-item-spec + a NEW §B 2026-06-02-h note in `docs/COMPETITION_SCRAPING_DESIGN.md` + the VERIFICATION_BACKLOG Deploy session #41 + the PRIMER §5 update. **This doc-batch commit ff-merges to main per the standard 3-push pattern.**

**Schema-change-in-flight flag NO at entry → STAYED NO entire session → NO at exit. NEXT session (P-59) = NO at entry anticipated.**

**ZERO open DEFERRED items at exit (Rule 26):** TaskList returned EMPTY at entry AND exit; in-session tasks #1 (create spec) + #2 (wire icon) + #3 (scoreboard+deploy+verify+end-of-session) completed. P-59 / P-61 / P-62 are the documented roadmap continuation (P-59 = the (a.130) pick), NOT TaskList DEFERRED items.

**Baselines locked from this session:** root tsc clean (UNCHANGED) + extension tsc clean (UNCHANGED — no extension files touched) + extension `npm test` = **915/915 UNCHANGED** (not re-run — no extension source touched) + src/lib `node:test` = **1363/1363 UNCHANGED** (no new helper) + `npm run build` = **73 routes UNCHANGED** (client-side anchor, no new route); Check 6 Playwright SKIPPED per Rule 27 (table-render + navigation = director real-Chrome verification).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-02-h** (no top-tier slip — the deploy passed; the director verified PASS on first try) capturing: (a) the Rule 3 audit clarified a ROADMAP premise — the existing by-category/by-type ↗ was the source-review-jump in the BANNER cell, NOT a Product-Name open-detail link, so all three Product Name cells genuinely lacked the ↗; (b) NEW reusable PATTERN — "mirror an existing cross-page navigation affordance by matching the LOCAL anchor convention of the target pages (an `<a href>` already used for source-jump) rather than importing the source page's button+router mechanism — fewer new imports, consistent behavior"; (c) the default-to-recommendation exception correctly skipped a design picker because the directive ("same icon, same column") was verbatim and unambiguous. **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NO new memory file this session.**

**1 NEW Group B polish-item-spec** — `docs/polish-item-specs/P-60-open-detail-icon-analysis-tables.md` (CREATED this session; Status → ✅ DEPLOYED-AND-VERIFIED 2026-06-02-h; §2 the Rule 3 audit; §3 AS-BUILT; §5 verification PASS) + a NEW §B 2026-06-02-h note in `docs/COMPETITION_SCRAPING_DESIGN.md` + `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (Deploy session #41 — all three analysis pages PASS) + `docs/COMPETITION_SCRAPING_PRIMER.md` (§5 open-items — P-60 now CLOSED; P-59 the next pick). `docs/REVIEWS_PHASE_2_DESIGN.md` UNCHANGED. `docs/COMPETITION_DATA_V2_DESIGN.md` UNCHANGED. `docs/AI_MODEL_REGISTRY.md` UNCHANGED.

**ROADMAP P-60 polish-backlog entry flipped** to ✅ SHIPPED-AT-DEPLOY-LEVEL + DEPLOYED-AND-VERIFIED + CLOSED (with the as-shipped narrative + the audit premise-clarification + the local-anchor-convention pattern + the original capture preserved) + (a.129) CLOSED / (a.130) opens = P-59.

**SEVENTY-THIRD end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ZERO destructive-class DEV/infra ops — no `prisma db push`, no `migrate reset`, no drop, no dev-data deletes. P-60 is a read-side UI navigation link (a client-side `<a href>` to an existing detail route). NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (P-59):** **NO schema change anticipated** — P-59 is a content update to an existing in-app guide component (`DetailedUserGuide.tsx`). No destructive ops anticipated. If a field/migration is unexpectedly needed, run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod). No other Rule 8/9/29 triggers anticipated.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the P-60 spec (created this session) + the P-59 spec (may need creating) + the memory directory.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. P-59 (the `DetailedUserGuide.tsx` content update) is W#2-only. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch ff-merges to main): `main` and `workflow-2-competition-scraping` BOTH at `e08684a` (the P-60 deploy) + the end-of-session doc-batch SHA. **Verify with `git log origin/main..HEAD --oneline` showing 0** (everything is on main after the doc-batch ff-merge); `git status` clean apart from historical untracked .zip + .html artifacts at repo root.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files; since this NEXT_SESSION.md references P-43 + P-49 + P-50 + P-51 + P-52 + P-53 + P-54 + P-55 + P-56 + P-57 + P-58 + P-59 + P-60 + P-61 + P-62, read §2 + §3 of each at session start — ESPECIALLY P-59):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate; **also the "CREATE the spec if missing" guarantee — applies to P-59**) + Rule 14f (forced-picker mechanics) + Rule 9 (deploy gate) + Rule 18 + Rule 23 (Change Impact Audit) + Rule 24 (pre-capture search) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + Rule 33 (workflow graduation continuity) + §4 Step 4b extended template.
- **`docs/polish-item-specs/P-59-*.md`** — the SOURCE-OF-TRUTH for P-59 IF IT EXISTS. **If it does NOT exist, CREATE it per Rule 31** (capture the verbatim director directive from the ROADMAP P-59 entry + the joint design decisions BEFORE coding). The ROADMAP P-59 entry (search "P-59" in `docs/ROADMAP.md`) is the captured directive to start from. (This session's P-60 spec — and P-57's, and P-58's — were created exactly this way as the first artifact; follow the same pattern.)
- **`src/app/projects/[projectId]/competition-scraping/components/DetailedUserGuide.tsx`** — the EXISTING guide component this item UPDATES, per Rule 3. Read what it currently documents + audit it against every shipped surface (the four tables, the comprehensive-analysis Files box + editable primer, reviews capture + AI analysis, grouping/columns, the deletes, the ↗ nav icons, and the extension capture flows) so the update brings it current.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-02-h (this session — the audit premise-clarification + the local-anchor-convention PATTERN) + §Entry 2026-06-02-g (the audit-shipped-state placement correction) + §Entry 2026-06-02-f (the dead-placeholder audit-shipped-state correction) + §Entry 2026-05-31 (the TOP-TIER SLIP — never act on an instruction that is not verbatim in a director message; honor explicit picker choices; restart on degraded tooling).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - **`feedback_plan_output_shape_before_building.md`** — P-59 is USER-FACING COPY; plan the audience / sections / depth / tone / placement WITH the director BEFORE writing the guide content (this is exactly the kind of output-shape decision the rule covers).
  - **`feedback_no_fabricated_instructions.md`** — act only on verbatim directives; capture the P-59 ask verbatim into the spec.
  - **`feedback_default_to_recommendation.md`** + **`feedback_recommendation_style.md`** — recommend the most-thorough/reliable shape; skip the forced-picker only when re-confirming a default-approved recommendation.
  - **`feedback_destructive_ops_confirmation.md`** — P-59 is content-only, but keep the destructive-ops audit at handoff.
  - `feedback_approval_scope_per_decision_unit.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_browser_first_ai_with_server_migration.md` + `feedback_exports_include_all_table_data.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; read §2 + §3 of each listed spec at session start — especially `docs/polish-item-specs/P-59-*.md` (the source-of-truth, IF it exists — CREATE it per Rule 31 if missing).** **This session is on `workflow-2-competition-scraping` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.130) = P-59 — update the existing Detailed User Guide):** bring the in-app "Detailed User Guide" component (`DetailedUserGuide.tsx`) current with every Competition Scraping surface that has shipped — the main Competitor URLs table enhancements (P-54: grouping/columns/drag), the comprehensive-analysis Files box + editable teaching primer (P-55), the deletes (P-57: reviews/text/images/videos + category labels), the new open-detail ↗ navigation icons (P-60), reviews capture + the three levels of AI review analysis (P-49), and the matching Chrome-extension capture flows. This is LOW/MEDIUM priority and was your §4 Step 1c forced-picker choice. **P-60 is CLOSED — do NOT reopen it.**

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: 0 — main and workflow-2 are both at e08684a + the 2026-06-02-h doc-batch SHA; nothing is held back
```

If `git branch --show-current` shows `main`, run `./resume-workflow 2`.

**FIRST step (the P-59 spec — BEFORE any build):** check for `docs/polish-item-specs/P-59-*.md`. **If it exists,** read §2 + §3 fully. **If it does NOT exist,** CREATE it per Rule 31 — capture the verbatim director directive (from the ROADMAP P-59 entry) in §1, the joint design decisions in §2, the consolidated spec in §3, the open questions in §4, and the cross-refs in §5 — BEFORE writing any code. (This session created the P-60 spec exactly this way as the first artifact; mirror it.)

**Output-shape (plan WITH the director per `feedback_plan_output_shape_before_building`):** P-59 is USER-FACING COPY, so this rule applies directly. Before writing guide content, agree WITH me: the audience (non-technical director / end-user), the section list (which shipped features get a section), the depth + tone, and where each section sits in the guide. Audit `DetailedUserGuide.tsx` against the actual shipped surfaces per Rule 3 first, then propose the section plan. Do NOT "ship v1 and iterate" unilaterally on copy — plan the shape, then write.

**Forced-picker shape (before coding):** fire a Rule 14f AskUserQuestion if there is a real fork in the guide's structure/scope (e.g. one long guide vs. per-feature sections; how much extension detail to include). If the recommended shape is obvious + default-approved, describe it plainly and proceed per `feedback_default_to_recommendation`.

**Test coverage decision:** P-59 is content/presentational. Add unit coverage only for any new pure helper (unlikely for a content update); the live result is verified by the director on vklf.com (the guide reads correctly + covers every shipped surface). Check 6 Playwright per Rule 27 (likely SKIPPED — content + visual judgment).

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (expect UNCHANGED)
- Extension tsc clean (expect UNCHANGED — P-59 is PLOS-only)
- Extension `npm test` = 915 (expect UNCHANGED)
- src/lib `node:test` ≥ 1363 (entry 1363; +N only if a new pure helper is added)
- `npm run build` = 73 routes (expect UNCHANGED — a content update, no new route)
- Check 6 Playwright SKIPPED per Rule 27 (content + visual judgment)
- **Run `npm run build` with an explicit absolute `cd /workspaces/brand-operations-hub` prefix** — the P-43 cwd-leak recurred recently; treat a route count of 0 as the cwd-leak tell-tale.

**Deploy mechanics:** P-59 has a PLOS-side serving piece (the updated guide on the live page) — it ships via the standard Rule 9 gate + 3-push pattern to vklf.com, director-verified. Expect 1 Rule 9 deploy gate. P-59 is PLOS-only — no extension build / sideload zip expected.

**Schema-change-in-flight flag:** **NO at entry**; no schema change anticipated for P-59 (a content update). If a field/migration is unexpectedly needed, audit + authorize WITH me first before any `prisma db push`.

**Group A docs to update at session end:** ROADMAP header bump + the P-59 entry status update + (a.130) status + CHAT_REGISTRY header bump (196th session) + DOCUMENT_MANIFEST header + flags + the schema-change-in-flight transition + CORRECTIONS_LOG header (+ 1 NEW §Entry if anything notable) + HANDOFF_PROTOCOL header bump + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite.

**Group B docs to update at session end:** the P-59 spec (create if missing; mark the feature shipped/verified) + `docs/COMPETITION_SCRAPING_DESIGN.md` (a §B note if the guide design materially changes) + `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (the P-59 verification) + `docs/COMPETITION_SCRAPING_PRIMER.md` (§5 — P-59 status).

**Standing carry-overs into this session:**

- **(a.130) = P-59** — update the existing `DetailedUserGuide.tsx`. Read/CREATE the P-59 spec FIRST; plan the output shape WITH me; PLOS-only.
- **P-61 / P-62** — the other NEW captures (extension default categories / the Workflow-11 surveillance card+page). Behind P-59.
- **P-56 Option-2 follow-up** — the optional "kill the idle flash too" (redraw only changed text) for the residual reading-time flicker; raise only if you want it.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; single-session fix / palate-cleanser.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — now schedulable (P-54 + P-55 + P-56 + P-57 + P-58 + P-60 done); the NEW continuity primer + `./catch-up-workflow 2` mechanism support it; director's discretion.

---

## Why this pointer was written this way (debug aid)

- **(a.130) = P-59 is the PICK because it was the director's §4 Step 1c forced-picker choice this session.** With P-60 closed, the director picked P-59 (the Detailed User Guide update) over the other MEDIUM/future-workflow captures — bringing the in-app guide current with everything shipped since it was last touched.
- **The FIRST action is the P-59 spec, not code.** P-59 was captured as a ROADMAP entry but a per-item spec was confirmed-created only for P-56 / P-57 / P-58 / P-60 / P-61 / P-62 — so the P-59 spec may not exist yet. Rule 31 requires the spec as the source-of-truth before building; create it if missing (this session's P-60 spec was created exactly that way).
- **Plan the output shape WITH the director.** P-59 is user-facing COPY — `feedback_plan_output_shape_before_building` applies directly. Agree the audience / sections / depth / tone / placement before writing, then write.
- **This is PLOS-only work** — the guide lives in the PLOS app; it deploys to vklf.com under the standard Rule 9 gate. No extension build expected.
- **Schema-change-in-flight = NO at entry** — this session stayed NO throughout (a client-side anchor); P-59 is a content update with no anticipated schema change.
- **Nothing is held back** — the P-60 deploy is on main, and the doc-batch ff-merges this session. Expect `git log origin/main..HEAD` = 0 at entry.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.130.alt1) P-59** (current PICK — pre-loaded above). Update the existing `DetailedUserGuide.tsx`; read/CREATE the P-59 spec first; plan the output shape WITH the director; PLOS-only; on `workflow-2-competition-scraping`.
- **(a.130.alt2) P-61 extension server-side default categories per platform per content-type** (MEDIUM; spec exists; design schema + overlay UX WITH the director; on `workflow-2-competition-scraping`).
- **(a.130.alt3) W#2 graduation** (now schedulable — P-54 + P-55 + P-56 + P-57 + P-58 + P-60 done; the continuity primer + `./catch-up-workflow 2` mechanism support it; director's discretion).
- **(a.130.alt4) P-56 Option-2 follow-up** (the optional "kill the idle flash too" / redraw only changed text for the residual reading-time flicker; on `workflow-2-competition-scraping`).
- **(a.130.alt5) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; quick palate-cleanser).
- **(a.130.alt6) P-50 NEW Condition Pathology card** (small single-session UI addition; director already approved scope; on `workflow-2-competition-scraping`).
