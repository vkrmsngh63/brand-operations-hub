# Next session

**Written:** 2026-06-02-f (`session_2026-06-02-f_p58-download-extension-zip-latest-build` — W#2 polish P-58 — the in-app "Download Extension (zip)" button on the Competition Scraping workflow page now serves the LATEST built extension ✅ DEPLOYED-AND-VERIFIED end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` (director verbatim "pass") — **P-58 is now CLOSED.** PLOS-side change (a static `public/` artifact + a deploy-step wiring); NO extension SOURCE change; NO schema change; NO new PLOS route. `main` went `ca45eae → 3dc47fb`. **Closes (a.127) = P-58 ✅ DEPLOYED-AND-VERIFIED → P-58 CLOSED. Opens (a.128) RECOMMENDED-NEXT = P-57** (fill the delete-coverage gaps — reviews / videos / category-labels; MEDIUM) on `workflow-2-competition-scraping` — this was the director's §4 Step 1c forced-picker choice. **FIRST action next session = read `docs/polish-item-specs/P-57-*.md` if it exists; CREATE the spec per Rule 31 if it does not exist yet (it may not); design WITH the director if the scope is non-trivial.**)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This was the SIXTH session of 2026-06-02 (suffix `-f`); the prior REAL sessions today are `session_2026-06-02` (no suffix) + `session_2026-06-02-b` (P-55 Phase 2b-ii) + `session_2026-06-02-c` (the three trimmed export variants) + `session_2026-06-02-d` (P-55 Phase 3 primer wiring + graduation methodology) + `session_2026-06-02-e` (the P-56 Amazon flicker fix). The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session. Keep trusting the harness `currentDate`; do NOT regress or invent a suffix ahead of it.

> ⚠️ **BRANCH: next session stays on `workflow-2-competition-scraping`.** P-57 (the delete-coverage gaps for reviews / videos / category-labels) is W#2-only. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically.

> ⚠️ **BRANCH STATE — NOTHING HELD BACK.** This session's build deploy (`3dc47fb`) is on main. After this session's end-of-session doc-batch ff-merge, `main` and `workflow-2-competition-scraping` are both at `3dc47fb` + the doc-batch SHA. Expect `git log origin/main..HEAD --oneline` to show 0 at next session entry.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry next session.** This session stayed NO the entire time (PLOS-side wiring + a static committed `public/` asset; no `prisma db push`). **P-57 is a delete-coverage feature — it may touch existing delete endpoints but NO new schema is anticipated.** Confirm at the session's start. If a field/migration is unexpectedly needed, run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod).

> ⚠️ **NO OWED VERIFICATION.** P-58 was director-verified on vklf.com this session ("pass"). There is NO owed verification carried into next session. P-57 is a NEW unit.

> ⚠️ **P-57 SPEC MAY NOT EXIST YET — FLAG.** The P-57 spec doc (`docs/polish-item-specs/P-57-*.md`) may NOT have been created yet — P-57 was captured as a ROADMAP entry in the 2026-06-02-d capture batch, but a per-item spec doc was confirmed-created only for P-56 / P-58 / P-61 / P-62. **First action: check for the P-57 spec; if missing, CREATE it per Rule 31 (capture the verbatim director directive from the ROADMAP P-57 entry + the joint design decisions BEFORE coding).** (This is exactly what happened this session for P-58 — the spec did not exist and was created as the first artifact.)

---

## What we did this session (in plain terms)

This session fixed the "Download Extension (zip)" button inside the app.

**First we looked at what the button actually did today** (rather than trusting the note we'd written about it earlier). It turned out the button was wired to a dead link — clicking it downloaded **nothing at all**. (Our earlier note had guessed it was downloading an *old* version of the extension; the real story was it had never been hooked up.)

**Then, with your go-ahead on the approach, we made the button serve the newest extension automatically.** We picked the simplest reliable option together: each time we deploy a new extension, the freshly-built file is saved to a fixed spot on the website and the download button points at it. So the button always hands you the newest build, and it stays current on its own every time we deploy — no more hand-building a file. **You clicked it on the live site and the latest zip downloaded: "pass."**

**Why we didn't make the website build the extension itself:** the extension uses a completely separate set of build tools that the website's hosting (Vercel) can't run. Saving the freshly-built file to the site at deploy time is the dependable way to keep the download current.

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (the P-58 entry now ✅ CLOSED + the P-57 / P-59 / P-60 / P-61 / P-62 entries) + `docs/polish-item-specs/` (the per-item specs).

- **(a.128) = P-57** — fill the delete-coverage gaps (reviews / videos / category-labels) — MEDIUM. **NEXT SESSION (see below).**
- **(P-59)** update the existing `DetailedUserGuide.tsx` — LOW/MEDIUM.
- **(P-60)** add the open-detail ↗ icon to the 3 analysis tables' Product Name column — LOW.
- **(P-61)** extension server-side default categories per platform per content-type (spec doc exists) — MEDIUM.
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card rename + hub page + "Continued Competitive Surveillance" page with the verbatim 5-question checklist (spec doc exists) — future-workflow.
- **(P-56 Option-2 follow-up)** the optional "kill the idle flash too" (redraw only changed text) for the residual reading-time flicker on Amazon Highlight Terms; raise only if the director wants it.
- **(P-53)** Excel "Export Table" for the Category + Type pages — effectively ABSORBED by P-55's grouped spreadsheets; LOW residue only.
- **(P-43 mechanical prevention small fix)** — add an absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; single-session fix.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — now schedulable (P-54 closed + P-55 essentially closed + P-56 closed + P-58 closed); director's discretion.

## What we'll do next session (in plain terms)

1. **We fill in the missing "delete" buttons** so you can remove the things you can't easily remove today — individual captured reviews, captured videos, and category labels — the same way you can already delete other captured items.
2. **We agree the exact list + behavior with you BEFORE writing code** — which items are missing a delete, what should happen to anything attached to them, and whether a delete needs a confirm step.
3. **As always:** once it's wired, we scoreboard-verify, and (if there's any live-site piece) verify together on vklf.com.

## What's still left in the total roadmap (in plain terms)

- **P-58 (Download-Extension-zip serves the latest build) — ✅ CLOSED 2026-06-02-f.** The in-app download now always serves the newest build, refreshed at every deploy; verified live.
- **P-57 (fill the delete-coverage gaps — reviews / videos / category-labels) — NEXT, MEDIUM.** The next pick.
- **P-59 / P-60 / P-61 / P-62 (NEW captures)** — DetailedUserGuide update / open-detail ↗ icon on the 3 analysis tables / extension default categories / the Workflow-11 surveillance card+page. Mostly MEDIUM/LOW or future-workflow.
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
- **W#2 graduation** — now schedulable (P-54 + P-55 + P-56 + P-58 done); director's discretion. The NEW continuity primer + `./catch-up-workflow 2` mechanism support it.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started (P-62 seeds part of W#11).
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**W#2 polish P-58 — the in-app "Download Extension (zip)" button now serves the LATEST built extension — ✅ DEPLOYED-AND-VERIFIED 2026-06-02-f** on vklf.com via `workflow-2-competition-scraping` → `main`; director verbatim verdict "pass". `main` went `ca45eae → 3dc47fb` (one clean ff-merge of the exact verified commit; range `ca45eae..3dc47fb`). **An AUDIT-then-BUILD-then-DEPLOY session: ONE build (`3dc47fb`), ONE deploy, ONE Rule 9 deploy gate (director "Deploy to main"), THREE Rule 14f pickers (the Q1 design-fork picker, the deploy gate, the §4 Step 1c next-pick), all Recommended/Yes. PLOS-side change; NO extension SOURCE change; NO schema change; NO new route.**

**Session shape (Rule 31 spec creation → code-truth audit → fix design picker → build → deploy → real-Chrome verify → end-of-session doc-batch):**

- **The P-58 spec (FIRST artifact):** the spec `docs/polish-item-specs/P-58-download-extension-zip-latest-build.md` did NOT exist before this session — it was CREATED as the first artifact per Rule 31 (the verbatim director directive in §1, the audit findings + joint decisions in §2, the consolidated spec in §3, the open questions in §4, the cross-refs in §5).
- **The code-truth audit (the materially-new fact):** the Rule 3 audit found the in-app "Download Extension (zip)" button was a DEAD PLACEHOLDER — `<CompanionDownload … url="#download-extension-pending" />` in `src/app/projects/[projectId]/competition-scraping/page.tsx` — so it downloaded NOTHING. The original capture (2026-06-02-d) had assumed a "stale committed artifact"; the truth was it had never been wired at all (an audit-shipped-state correction per Rule 31).
- **The fix (`3dc47fb`, director-picked Option A "Deploy-time committed file"):** the freshly-built extension zip is committed at a STABLE web path `public/competition-scraping/plos-extension-latest.zip` (218 KB); the `CompanionDownload url` now points at `/competition-scraping/plos-extension-latest.zip` (a real download — `.zip` is non-renderable so `target="_blank"` triggers a download); `.claude/commands/deploy.md` Step 8 was updated to overwrite + commit that served artifact at every extension deploy so the in-app download always matches the deployed build. Options B (build the extension inside Vercel's web build) + C (a dynamic download route) were rejected — Vercel cannot run the separate wxt/Vite/Rolldown toolchain. Trade-off (director-accepted): ~218 KB binary per extension deploy in git history.
- **The deploy:** ONE Rule 9 deploy gate (director "Deploy to main"); `main` went `ca45eae → 3dc47fb` (clean ff-merge of the exact verified commit). PURE PLOS-side change — NO extension SOURCE changed, so NO new repo-root sideload zip this session; the committed `public/` artifact IS the served file.
- **1 PENDING:** the end-of-session doc-batch commit (this doc-batch agent's output) — the Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY [unchanged]) + HANDOFF_PROTOCOL header bump + 1 Group B polish-item-spec (the NEW P-58) + a NEW §B 2026-06-02-f note in `docs/COMPETITION_SCRAPING_DESIGN.md` + the VERIFICATION_BACKLOG + PRIMER updates. **This doc-batch commit ff-merges to main per the standard 3-push pattern.**

**Schema-change-in-flight flag NO at entry → STAYED NO entire session → NO at exit. NEXT session (P-57) = NO at entry anticipated.**

**ZERO open DEFERRED items at exit (Rule 26):** TaskList returned EMPTY at entry AND exit; all in-session work completed. P-57 / P-59 / P-60 / P-61 / P-62 are the documented roadmap continuation (P-57 = the (a.128) pick), NOT TaskList DEFERRED items.

**Baselines locked from this session (all UNCHANGED):** root tsc clean (UNCHANGED) + extension tsc clean (UNCHANGED) + extension `npm test` = **915/915 UNCHANGED** (no extension source change; no new helper) + src/lib `node:test` = **1353/1353 UNCHANGED** + `npm run build` = **72 routes UNCHANGED** (static `public/` asset; no new route); Check 6 Playwright SKIPPED per Rule 27 (file-download / URL wiring = director real-Chrome visual judgment).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-02-f** (no top-tier slip — the deploy passed; the director verified on vklf.com) capturing: (a) **an audit-shipped-state correction (Rule 31)** — the capture assumed a "stale committed artifact" but the code-truth was a DEAD PLACEHOLDER (`#download-extension-pending`) that downloaded nothing; always verify the actual shipped state before designing the fix; (b) NEW reusable PATTERN — "serve a companion/external-client artifact's latest build via a STABLE committed `public/` path refreshed at deploy-time, rather than running the companion's separate build toolchain inside the web (Vercel) build" (trade-off = ~218 KB binary per extension deploy, director-accepted). **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NO new memory file this session.**

**1 NEW Group B polish-item-spec** — `docs/polish-item-specs/P-58-download-extension-zip-latest-build.md` (CREATED this session; Status → ✅ DEPLOYED-AND-VERIFIED 2026-06-02-f; §2 the audit-shipped-state finding; §3 AS-SHIPPED Option A; §4 Q1 RESOLVED [Option A] + Q2 [keep the dated repo-root sideload zip short-term] + Q3 [build-version surfacing deferred]) + a NEW §B 2026-06-02-f note in `docs/COMPETITION_SCRAPING_DESIGN.md` + `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (the P-58 in-app-download verification PASS) + `docs/COMPETITION_SCRAPING_PRIMER.md` (§5 open-items — P-58 now CLOSED). `docs/REVIEWS_PHASE_2_DESIGN.md` UNCHANGED. `docs/COMPETITION_DATA_V2_DESIGN.md` UNCHANGED. `docs/AI_MODEL_REGISTRY.md` UNCHANGED.

**ROADMAP P-58 polish-backlog entry flipped** to ✅ SHIPPED-AT-DEPLOY-LEVEL + DEPLOYED-AND-VERIFIED + CLOSED (with the Option-A as-shipped narrative + the dead-placeholder finding + the original capture preserved) + (a.127) CLOSED / (a.128) opens = P-57.

**SEVENTY-FIRST end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ZERO destructive-class ops — no `prisma db push`, no `migrate reset`, no drop, no deletes. The only NEW artifact committed was a static `public/competition-scraping/plos-extension-latest.zip` (a served extension build, a normal artifact). NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (P-57):** **NO schema change anticipated** — P-57 is a delete-coverage feature; it may touch existing delete endpoints (reviews / videos / category-labels) but no new schema is anticipated. **Deletes ARE a destructive class** — design the cascade behavior + any confirm step WITH the director; ensure deletes are scoped to the intended records only. If a field/migration is unexpectedly needed, run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod). No other Rule 8/9/29 triggers anticipated.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the P-58 spec (created this session) + the P-57 spec (may need creating) + the memory directory.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. P-57 (the delete-coverage gaps for reviews / videos / category-labels) is W#2-only. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch ff-merges to main): `main` and `workflow-2-competition-scraping` BOTH at `3dc47fb` (the P-58 deploy) + the end-of-session doc-batch SHA. **Verify with `git log origin/main..HEAD --oneline` showing 0** (everything is on main after the doc-batch ff-merge); `git status` clean apart from historical untracked .zip + .html artifacts at repo root.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files; since this NEXT_SESSION.md references P-43 + P-49 + P-50 + P-51 + P-52 + P-53 + P-54 + P-55 + P-56 + P-57 + P-58, read §2 + §3 of each at session start — ESPECIALLY P-57):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate; **also the "CREATE the spec if missing" guarantee — applies to P-57**) + Rule 14f (forced-picker mechanics) + Rule 9 (deploy gate) + Rule 18 + Rule 23 (Change Impact Audit — relevant since deletes are destructive) + Rule 24 (pre-capture search) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + Rule 33 (workflow graduation continuity) + §4 Step 4b extended template.
- **`docs/polish-item-specs/P-57-*.md`** — the SOURCE-OF-TRUTH for P-57 IF IT EXISTS. **If it does NOT exist, CREATE it per Rule 31** (capture the verbatim director directive from the ROADMAP P-57 entry + the joint design decisions BEFORE coding). The ROADMAP P-57 entry (search "P-57" in `docs/ROADMAP.md`) is the captured directive to start from. (This session's P-58 spec was created exactly this way as the first artifact — follow the same pattern.)
- **The existing delete surfaces in W#2** — read how reviews / videos / category-labels are captured + how the EXISTING delete buttons/endpoints work elsewhere (text captures, URLs, etc.) per Rule 3, so the new deletes mirror the proven pattern (confirm step, cascade behavior, the per-item DELETE routes).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-02-f (this session — the audit-shipped-state correction + the served-`public/`-artifact PATTERN) + §Entry 2026-06-02-c (the P-43 cwd-leak recurrence) + §Entry 2026-05-31 (the TOP-TIER SLIP — never act on an instruction that is not verbatim in a director message; honor explicit picker choices; restart on degraded tooling).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - **`feedback_plan_output_shape_before_building.md`** + **`feedback_no_fabricated_instructions.md`** — design the delete coverage WITH the director BEFORE coding (which items, cascade behavior, confirm step); act only on verbatim directives.
  - **`feedback_default_to_recommendation.md`** + **`feedback_recommendation_style.md`** — recommend the most-reliable option; skip the forced-picker when only re-confirming a default-approved recommendation.
  - **`feedback_destructive_ops_confirmation.md`** — deletes are a destructive class; audit cascade + scope before shipping.
  - `feedback_approval_scope_per_decision_unit.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_browser_first_ai_with_server_migration.md` + `feedback_exports_include_all_table_data.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; read §2 + §3 of each listed spec at session start — especially `docs/polish-item-specs/P-57-*.md` (the source-of-truth, IF it exists — CREATE it per Rule 31 if missing).** **This session is on `workflow-2-competition-scraping` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.128) = P-57 — fill the delete-coverage gaps):** some captured items can't be deleted today the way other captured items can — specifically individual captured reviews, captured videos, and category labels. Add the missing delete affordances so they match the existing delete pattern. This is MEDIUM priority and was your §4 Step 1c forced-picker choice. **P-58 is CLOSED — do NOT reopen it.**

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: 0 — main and workflow-2 are both at 3dc47fb + the 2026-06-02-f doc-batch SHA; nothing is held back
```

If `git branch --show-current` shows `main`, run `./resume-workflow 2`.

**FIRST step (the P-57 spec — BEFORE any build):** check for `docs/polish-item-specs/P-57-*.md`. **If it exists,** read §2 + §3 fully. **If it does NOT exist,** CREATE it per Rule 31 — capture the verbatim director directive (from the ROADMAP P-57 entry) in §1, the joint design decisions in §2, the consolidated spec in §3, the open questions in §4, and the cross-refs in §5 — BEFORE writing any code. (This session created the P-58 spec exactly this way as the first artifact; mirror it.)

**Fix/feature shape (design WITH the director BEFORE coding):** P-57 has real design decisions — exactly which items lack a delete (reviews / videos / category-labels — confirm the full list against the code per Rule 3), what happens to anything attached to a deleted item (cascade behavior), and whether each delete needs a confirm step. Plan the shape WITH me per `feedback_plan_output_shape_before_building`. **Deletes are a destructive class** — per `feedback_destructive_ops_confirmation`, audit the cascade + scope before shipping; reuse the proven existing delete pattern (the per-item DELETE routes used for text captures / URLs) rather than inventing a new one.

**Forced-picker shape (before coding):** fire a Rule 14f AskUserQuestion if there is a real design fork (e.g. hard-delete vs. soft-delete; confirm-step style; cascade scope). If the recommended path is obvious + default-approved (mirror the existing delete pattern), describe it plainly and proceed per `feedback_default_to_recommendation`.

**Test coverage decision:** add unit coverage for any new pure helper + handler-level node:test coverage for any new/extended DELETE handler (the standard W#2 DI-handler pattern). The live delete behavior is verified via the director on vklf.com (delete an item → confirm it's gone + nothing else broke). Check 6 Playwright per Rule 27 (likely SKIPPED — destructive UI action + visual judgment).

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (expect UNCHANGED)
- Extension tsc clean (expect UNCHANGED unless P-57 touches the extension — likely PLOS-only)
- Extension `npm test` = 915 (likely UNCHANGED — confirm)
- src/lib `node:test` ≥ 1353 (entry 1353; +N for new helper/handler tests)
- `npm run build` = 72 routes (UNCHANGED unless P-57 adds a DELETE route — confirm; +1 per new route)
- Check 6 Playwright SKIPPED per Rule 27 (destructive UI action = visual judgment)
- **Run `npm run build` with an explicit absolute `cd /workspaces/brand-operations-hub` prefix** — the P-43 cwd-leak recurred recently; treat a route count of 0 as the cwd-leak tell-tale.

**Deploy mechanics:** P-57 has a PLOS-side serving piece (the new delete endpoints/buttons) — it ships via the standard Rule 9 gate + 3-push pattern to vklf.com, director-verified. Expect 1+ Rule 9 deploy gates. If P-57 unexpectedly touches the extension, produce a fresh sideload zip + (now) refresh `public/competition-scraping/plos-extension-latest.zip` per the P-58 deploy Step 8.

**Schema-change-in-flight flag:** **NO at entry**; no schema change anticipated for P-57 (it reuses existing delete semantics). If a field/migration is unexpectedly needed, audit + authorize WITH me first before any `prisma db push`.

**Group A docs to update at session end:** ROADMAP header bump + the P-57 entry status update + (a.128) status + CHAT_REGISTRY header bump (194th session) + DOCUMENT_MANIFEST header + flags + the schema-change-in-flight transition + CORRECTIONS_LOG header (+ 1 NEW §Entry if anything notable) + HANDOFF_PROTOCOL header bump + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite.

**Group B docs to update at session end:** the P-57 spec (create if missing; mark the feature shipped/verified) + `docs/COMPETITION_SCRAPING_DESIGN.md` (a §B note if the delete-coverage design materially changes) + `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (the P-57 verification) + `docs/REVIEWS_PHASE_2_DESIGN.md` (a §B note if review-delete touches the Reviews flow) + `docs/COMPETITION_SCRAPING_PRIMER.md` (§5 — P-57 status).

**Standing carry-overs into this session:**

- **(a.128) = P-57** — fill the delete-coverage gaps (reviews / videos / category-labels). Read/CREATE the P-57 spec FIRST; design WITH me; reuse the proven delete pattern; deletes are destructive — audit cascade + scope.
- **P-59 / P-60 / P-61 / P-62** — the other NEW captures (DetailedUserGuide update / open-detail ↗ icon / extension default categories / the Workflow-11 surveillance card+page). Behind P-57.
- **P-56 Option-2 follow-up** — the optional "kill the idle flash too" (redraw only changed text) for the residual reading-time flicker; raise only if you want it.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; single-session fix / palate-cleanser.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — now schedulable (P-54 + P-55 + P-56 + P-58 done); the NEW continuity primer + `./catch-up-workflow 2` mechanism support it; director's discretion.

---

## Why this pointer was written this way (debug aid)

- **(a.128) = P-57 is the PICK because it was the director's §4 Step 1c forced-picker choice this session.** With P-58 closed, the director picked P-57 (the delete-coverage gaps) over the other MEDIUM/LOW captures — it rounds out the capture-management UX so workers can remove individual reviews / videos / category-labels the way they already remove other captured items.
- **The FIRST action is the P-57 spec, not code.** P-57 was captured as a ROADMAP entry but a per-item spec was confirmed-created only for P-56 / P-58 / P-61 / P-62 — so the P-57 spec may not exist yet. Rule 31 requires the spec as the source-of-truth before building; create it if missing (this session's P-58 spec was created exactly that way).
- **Design the shape WITH the director.** Delete coverage has real forks — the exact item list, cascade behavior, confirm-step style — worth a Rule 14f picker if non-obvious. Deletes are a destructive class; audit scope + cascade per `feedback_destructive_ops_confirmation`.
- **This is likely PLOS-only work** — reviews / videos / category-labels delete surfaces live in the PLOS app; it deploys to vklf.com under the standard Rule 9 gate. Only if it somehow touches the extension do you re-run extension tsc + extension `npm test` + refresh the P-58 `public/` zip.
- **Schema-change-in-flight = NO at entry** — this session stayed NO throughout (PLOS-side wiring + a static `public/` asset); P-57 reuses existing delete semantics with no anticipated schema change.
- **Nothing is held back** — the P-58 deploy is on main, and the doc-batch ff-merges this session. Expect `git log origin/main..HEAD` = 0 at entry.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.128.alt1) P-57** (current PICK — pre-loaded above). Fill the delete-coverage gaps (reviews / videos / category-labels); read/CREATE the P-57 spec first; design WITH the director; on `workflow-2-competition-scraping`.
- **(a.128.alt2) P-61 extension server-side default categories per platform per content-type** (MEDIUM; spec exists; design schema + overlay UX WITH the director; on `workflow-2-competition-scraping`).
- **(a.128.alt3) P-60 add the open-detail ↗ icon to the 3 analysis tables' Product Name column** (LOW; quick UI follow-up; on `workflow-2-competition-scraping`).
- **(a.128.alt4) P-59 update the existing `DetailedUserGuide.tsx`** (LOW/MEDIUM; on `workflow-2-competition-scraping`).
- **(a.128.alt5) P-56 Option-2 follow-up** (the optional "kill the idle flash too" / redraw only changed text for the residual reading-time flicker; on `workflow-2-competition-scraping`).
- **(a.128.alt6) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; quick palate-cleanser).
- **(a.128.alt7) W#2 graduation** (now schedulable — P-54 + P-55 + P-56 + P-58 done; the continuity primer + `./catch-up-workflow 2` mechanism support it; director's discretion).
