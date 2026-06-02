# Next session

**Written:** 2026-06-02-i (`session_2026-06-02-i_p59-detailed-user-guide-update` — W#2 polish P-59 — the in-app "Detailed User Guide" is now brought CURRENT with ALL Competition Scraping functionality (PLOS-side + extension) ✅ DEPLOYED-AND-VERIFIED end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` (director verbatim "PASS") — **P-59 is now CLOSED.** PLOS-side content-only change to ONE existing component (`DetailedUserGuide.tsx`); NO extension SOURCE change; NO schema change; NO new route. `main` went `ba31ec3 → 3741078`. **Closes (a.130) = P-59 ✅ DEPLOYED-AND-VERIFIED → P-59 CLOSED. Opens (a.131) RECOMMENDED-NEXT = P-61** (extension server-side default categories per platform per content-type so workers start from sensible category lists; MEDIUM) on `workflow-2-competition-scraping` — this was the director's §4 Step 1c forced-picker choice. **FIRST action next session = read the EXISTING spec `docs/polish-item-specs/P-61-extension-default-categories.md` (it ALREADY EXISTS — created in the 2026-06-02-d capture batch) §2 + §3 fully, THEN confirm the Schema-change-in-flight flag (it MAY flip YES — a defaults table/seed may be needed) BEFORE any prisma work.** P-61 is the LAST substantive W#2 polish item — after it, W#2 graduation is fully clear.)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This was the NINTH session of 2026-06-02 (suffix `-i`); the prior REAL sessions today are `session_2026-06-02` (no suffix) + `session_2026-06-02-b` (P-55 Phase 2b-ii) + `session_2026-06-02-c` (the three trimmed export variants) + `session_2026-06-02-d` (P-55 Phase 3 primer wiring + graduation methodology) + `session_2026-06-02-e` (the P-56 Amazon flicker fix) + `session_2026-06-02-f` (P-58 download-extension-zip latest build) + `session_2026-06-02-g` (P-57 delete-coverage gaps) + `session_2026-06-02-h` (P-60 open-detail ↗ icon). The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session. Keep trusting the harness `currentDate`; do NOT regress or invent a suffix ahead of it.

> ⚠️ **BRANCH: next session stays on `workflow-2-competition-scraping`.** P-61 (extension server-side default categories) is W#2-only. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically.

> ⚠️ **BRANCH STATE — NOTHING HELD BACK.** This session's one build deploy (`3741078`) is on main. After this session's end-of-session doc-batch ff-merge, `main` and `workflow-2-competition-scraping` are both at `3741078` + the doc-batch SHA. Expect `git log origin/main..HEAD --oneline` to show 0 at next session entry.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry next session — BUT P-61 MAY FLIP IT YES.** This (P-59) session stayed NO the entire time (a content-only edit; no `prisma db push`). **P-61 is extension server-side default categories per platform per content-type — a server-side feature that MAY add a defaults table/seed, so the flag MAY need to flip YES during the session.** Confirm at the session's start by reading the existing P-61 spec. If a field/migration/seed IS needed, run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod).

> ⚠️ **NO OWED VERIFICATION.** P-59 was director-verified on vklf.com this session ("PASS"). There is NO owed verification carried into next session. P-61 is a NEW unit.

> ⚠️ **P-61 SPEC ALREADY EXISTS — READ IT FIRST, do NOT re-create it.** Unlike P-57 / P-58 / P-60 (whose specs had to be created as the first artifact), the P-61 spec `docs/polish-item-specs/P-61-extension-default-categories.md` was confirmed-created in the 2026-06-02-d capture batch. **First action: READ §2 + §3 of the existing P-61 spec fully** — do NOT create a new one. (P-59's spec, by contrast, did NOT exist and was created this session as the first artifact.)

---

## What we did this session (in plain terms)

This session updated the in-app "how-to" guide.

**The Competition Scraping area has an in-app "Detailed User Guide"** — a help page that explains how to use the extension and the website. But it had fallen behind: it only explained how to install the extension and do basic capturing, and it was silent on most of what the website side can now do.

**First we made a complete list of everything the area can actually do** (by checking the real code, not the old guide), and compared it to what the guide covered. The guide turned out to be missing about 70% of the website-side features — and one of the button names it mentioned was wrong (the menu actually says "Add to PLOS — Image", not the old wording).

**Then we agreed with you exactly how thorough to make it** (cover everything; explain the AI features in plain "what you get + how to run it" terms; use gray placeholder boxes where screenshots will go) — before writing a word.

**Then we wrote it.** We added a whole new "Part 3 — On the PLOS website" covering the tables and all their controls (show/hide columns, sort, filter, search, drag, grouping, add/delete), the competitor detail page, capturing and analyzing reviews, and the Comprehensive Analysis page with its editable primer. We also filled the two missing extension how-tos (capturing a video, capturing a competitor's reviews) and fixed the wrong button name. You read through it on vklf.com and confirmed it. **"PASS."**

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (the P-59 entry now ✅ CLOSED + the P-61 / P-62 entries) + `docs/polish-item-specs/` (the per-item specs).

- **(a.131) = P-61** — extension server-side default categories per platform per content-type — MEDIUM. **NEXT SESSION (see below). The LAST substantive W#2 polish item.**
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card rename + hub page + "Continued Competitive Surveillance" page with the verbatim 5-question checklist (spec doc exists) — future-workflow.
- **(P-56 Option-2 follow-up)** the optional "kill the idle flash too" (redraw only changed text) for the residual reading-time flicker on Amazon Highlight Terms; raise only if the director wants it.
- **(P-53)** Excel "Export Table" for the Category + Type pages — effectively ABSORBED by P-55's grouped spreadsheets; LOW residue only.
- **(P-43 mechanical prevention small fix)** — add an absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; single-session fix.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — now schedulable (P-54 + P-55 + P-56 + P-57 + P-58 + P-59 + P-60 closed); **fully clear once P-61 ships.** Director's discretion.

## What we'll do next session (in plain terms)

1. **We give the extension a sensible starting set of category labels** for each platform and each type of thing it captures (text / image / video / reviews), so when you start working on a new competitor you already have useful categories to tag with instead of a blank list.
2. **We read the plan we already wrote for this** (the P-61 spec already exists), confirm whether it needs a small database change to store the defaults, and — if it does — get your explicit OK before making that change.
3. **As always:** once it's built we scoreboard-verify, and (since the extension is involved) you sideload + verify the new extension build before we deploy.

## What's still left in the total roadmap (in plain terms)

- **P-59 (update the Detailed User Guide) — ✅ CLOSED 2026-06-02-i.** The in-app guide now covers everything the Competition Scraping area + extension can do; verified live.
- **P-61 (extension default categories) — NEXT, MEDIUM.** The next pick, and the LAST substantive W#2 polish item.
- **P-62 (NEW capture)** — the Workflow-11 surveillance card + page. Future-workflow.
- **P-60 (open-detail ↗ icon on the 3 analysis tables) — ✅ CLOSED 2026-06-02-h.** Each product name jumps to that competitor's detail page; verified live.
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
- **W#2 graduation** — schedulable now; **fully clear after P-61**. The continuity primer + `./catch-up-workflow 2` mechanism support it; director's discretion.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started (P-62 seeds part of W#11).
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**W#2 polish P-59 — the in-app "Detailed User Guide" brought current with all Competition Scraping functionality (PLOS-side + extension) — ✅ DEPLOYED-AND-VERIFIED 2026-06-02-i** on vklf.com via `workflow-2-competition-scraping` → `main`; director verdict "PASS". `main` went `ba31ec3 → 3741078` (one clean ff-merge of the exact verified commit). **An AUDIT-then-PLAN-then-BUILD-then-DEPLOY session: ONE build (`3741078`), ONE deploy, ONE Rule 9 deploy gate (director "Deploy to main"), FIVE Rule 14f pickers total (THREE plan-shape — Q1 scope = Comprehensive / Q2 AI-flow depth = Plain / Q3 = gray screenshot placeholders, all the recommended option — + the deploy gate + the §4 Step 1c next-pick → P-61). PLOS-side content-only change to ONE existing component; NO extension SOURCE change; NO schema change; NO new route.**

**Session shape (code-truth feature-inventory → Rule 31 spec creation → plan-shape WITH the director → build → scoreboard → deploy → real-Chrome read-through verify → end-of-session doc-batch):**

- **The code-truth feature-inventory (FIRST action):** an Explore agent inventoried every shipped Competition Scraping surface (PLOS-side + the extension) and diffed it against the existing `DetailedUserGuide.tsx` — the guide covered only extension install + basic capture and was silent on ~70% of the shipped PLOS-side surface, AND a stale extension label was caught (the image context-menu copy "Save image to PLOS — Competition Scraping" no longer matched the code-true "Add to PLOS — Image").
- **The P-59 spec (FIRST artifact):** `docs/polish-item-specs/P-59-detailed-user-guide-update.md` did NOT exist before this session — it was CREATED per Rule 31 (the verbatim director directive in §1, the feature-inventory in §2, the plan-shape decision + Rule 23 Additive classification in §3, the 3 pickers in §4, Rule 27 in §5, the verification in §6; Status → ✅ DEPLOYED-AND-VERIFIED 2026-06-02-i).
- **The plan-shape (WITH the director per `feedback_plan_output_shape_before_building`):** because this is user-facing COPY, THREE plan-shape pickers fired BEFORE writing any copy — Q1 scope = Comprehensive, Q2 AI-flow depth = Plain, Q3 = gray screenshot placeholders (all the recommended option).
- **The build (`3741078`):** a comprehensive NEW "Part 3 — On the PLOS website (vklf.com)" + the Part 2 extension gaps filled (NEW "Capture a video" + "Capture a competitor's reviews") + the stale image-context-menu label corrected + the intro rewritten to the 3-part shape; gray screenshot placeholders. Content-only edit of ONE component; route count UNCHANGED. `main` went `ba31ec3 → 3741078`.
- **1 PENDING:** the end-of-session doc-batch commit (this doc-batch agent's output) — the Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY [unchanged]) + HANDOFF_PROTOCOL header bump + the NEW P-59 Group B polish-item-spec + a NEW §B 2026-06-02-i note in `docs/COMPETITION_SCRAPING_DESIGN.md` + the VERIFICATION_BACKLOG Deploy session #42 + the PRIMER §5 update. **This doc-batch commit ff-merges to main per the standard 3-push pattern.**

**Schema-change-in-flight flag NO at entry → STAYED NO entire session → NO at exit. NEXT session (P-61) MAY be YES at entry** (a defaults table/seed may be added — confirm at that session's start by reading the existing P-61 spec).

**ZERO open DEFERRED items at exit (Rule 26):** TaskList returned EMPTY at entry AND exit; in-session tasks (create spec / plan-shape pickers / write the guide content / scoreboard+deploy+verify+end-of-session) completed. P-61 / P-62 are the documented roadmap continuation (P-61 = the (a.131) pick), NOT TaskList DEFERRED items.

**Baselines locked from this session:** root tsc clean (UNCHANGED) + extension tsc clean (UNCHANGED — no extension files touched) + extension `npm test` = **915/915 UNCHANGED** (not re-run — no extension source touched) + src/lib `node:test` = **1363/1363 UNCHANGED** (no lib touched) + `npm run build` = **73 routes UNCHANGED** (content-only edit; no new route); Check 6 Playwright SKIPPED per Rule 27 (prose content = director read-through).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-02-i** (no top-tier slip — the deploy passed; the director verified PASS on first try) capturing: (a) the Rule 3 feature-inventory found the guide was silent on ~70% of the shipped PLOS-side surface AND caught a stale extension label — in-app docs drift silently as features ship (the doc is not exercised by tsc or tests); (b) NEW reusable PATTERN — "for a docs/content surface, run a code-truth feature-inventory (Explore) and diff it against the current doc to enumerate gaps + stale labels before writing — then plan the output shape WITH the director per `feedback_plan_output_shape_before_building`". **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NO new memory file this session.**

**1 NEW Group B polish-item-spec** — `docs/polish-item-specs/P-59-detailed-user-guide-update.md` (CREATED this session; Status → ✅ DEPLOYED-AND-VERIFIED 2026-06-02-i; §2 the feature-inventory; §3 plan-shape; §4 the 3 pickers; §6 verification PASS) + a NEW §B 2026-06-02-i note in `docs/COMPETITION_SCRAPING_DESIGN.md` + `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (Deploy session #42 — the guide read-through PASS) + `docs/COMPETITION_SCRAPING_PRIMER.md` (§5 open-items — P-59 now CLOSED; P-61 the next pick; W#2 polish nearly drained / graduation clear after P-61). `docs/REVIEWS_PHASE_2_DESIGN.md` UNCHANGED. `docs/COMPETITION_DATA_V2_DESIGN.md` UNCHANGED. `docs/AI_MODEL_REGISTRY.md` UNCHANGED.

**ROADMAP P-59 polish-backlog entry flipped** to ✅ SHIPPED-AT-DEPLOY-LEVEL + DEPLOYED-AND-VERIFIED + CLOSED (with the as-shipped narrative + the feature-inventory finding + the inventory-diff-then-plan-shape pattern + the original capture preserved) + (a.130) CLOSED / (a.131) opens = P-61.

**SEVENTY-FOURTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ZERO destructive-class DEV/infra ops — no `prisma db push`, no `migrate reset`, no drop, no dev-data deletes. P-59 is a content-only edit of one presentational component (`DetailedUserGuide.tsx`). NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (P-61):** **SCHEMA CHANGE POSSIBLE** — P-61 (extension server-side default categories per platform per content-type) MAY need a defaults table/seed; if so it is ADDITIVE only. Read the existing P-61 spec at session start; if a field/migration/seed is needed, run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod). A fresh extension sideload zip + director sideload-verification is likely (the extension is in scope). No other Rule 8/9/29 triggers anticipated.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the P-59 spec (created this session) + the EXISTING P-61 spec + the memory directory.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. P-61 (extension server-side default categories) is W#2-only. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch ff-merges to main): `main` and `workflow-2-competition-scraping` BOTH at `3741078` (the P-59 deploy) + the end-of-session doc-batch SHA. **Verify with `git log origin/main..HEAD --oneline` showing 0** (everything is on main after the doc-batch ff-merge); `git status` clean apart from historical untracked .zip + .html artifacts at repo root.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files; read §2 + §3 of each at session start — ESPECIALLY the EXISTING P-61 spec):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate — for P-61 the spec ALREADY EXISTS, so READ it, do NOT re-create) + Rule 14f (forced-picker mechanics) + Rule 9 (deploy gate) + Rule 18 + Rule 23 (Change Impact Audit — **applies if P-61 adds a defaults table/seed**) + Rule 24 (pre-capture search) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + Rule 33 (workflow graduation continuity) + §4 Step 4b extended template.
- **`docs/polish-item-specs/P-61-extension-default-categories.md`** — the EXISTING SOURCE-OF-TRUTH for P-61. **READ §2 + §3 fully — do NOT create a new spec** (unlike P-57 / P-58 / P-59 / P-60, this one already exists). It documents the design intent; confirm whether it implies a schema/seed change.
- **The extension category-vocabulary code** — `extensions/competition-scraping/` (the capture/category flows) + the PLOS-side `src/lib/competition-scraping/category-vocabulary.ts` (the P-57 helper) + the `VocabularyEntry` model — read what currently exists per Rule 3 before designing the server-side defaults.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-02-i (this session — the docs-drift finding + the inventory-diff-then-plan-shape PATTERN) + §Entry 2026-06-02-h (the audit premise-clarification) + §Entry 2026-06-02-g (the audit-shipped-state placement correction) + §Entry 2026-05-31 (the TOP-TIER SLIP — never act on an instruction that is not verbatim in a director message; honor explicit picker choices; restart on degraded tooling).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - **`feedback_plan_output_shape_before_building.md`** — if P-61 introduces an overlay/UX surface for the defaults, plan the shape WITH the director BEFORE coding.
  - **`feedback_no_fabricated_instructions.md`** — act only on verbatim directives; the P-61 spec already captures the ask.
  - **`feedback_default_to_recommendation.md`** + **`feedback_recommendation_style.md`** — recommend the most-thorough/reliable shape; skip the forced-picker only when re-confirming a default-approved recommendation.
  - **`feedback_destructive_ops_confirmation.md`** — P-61 MAY touch the schema; keep the destructive-ops audit at handoff + authorize any `prisma db push` WITH the director first.
  - `feedback_approval_scope_per_decision_unit.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_browser_first_ai_with_server_migration.md` + `feedback_exports_include_all_table_data.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; read §2 + §3 of each listed spec at session start — especially `docs/polish-item-specs/P-61-extension-default-categories.md` (the source-of-truth, which ALREADY EXISTS — READ it, do NOT re-create).** **This session is on `workflow-2-competition-scraping` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.131) = P-61 — extension server-side default categories):** give the extension a sensible starting set of default category labels per platform (Amazon / eBay / Etsy / Walmart) per content-type (text / image / video / reviews) so workers begin from useful category lists instead of a blank slate. This is MEDIUM priority, was your §4 Step 1c forced-picker choice, and is the LAST substantive W#2 polish item — after it, W#2 graduation is fully clear. **P-59 is CLOSED — do NOT reopen it.**

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: 0 — main and workflow-2 are both at 3741078 + the 2026-06-02-i doc-batch SHA; nothing is held back
```

If `git branch --show-current` shows `main`, run `./resume-workflow 2`.

**FIRST step (read the EXISTING P-61 spec — BEFORE any build):** read `docs/polish-item-specs/P-61-extension-default-categories.md` §2 + §3 fully. **It ALREADY EXISTS — do NOT create a new one** (unlike P-57 / P-58 / P-59 / P-60, whose specs had to be created as the first artifact). Confirm from the spec whether the defaults are stored server-side in a new table/seed (a schema change) or assembled from existing data; this determines the Schema-change-in-flight flag.

**Schema-change-in-flight flag:** **NO at entry; MAY flip YES** if P-61 adds a defaults table/seed. Confirm from the spec at session start. If a field/migration/seed IS needed, run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod).

**Output-shape (plan WITH the director per `feedback_plan_output_shape_before_building`):** if P-61 introduces any UX surface (e.g. how the defaults appear / are overridden in the category picker), plan the shape WITH me before coding. If the recommended shape is fully determined by the existing spec + default-approved, describe it plainly and proceed per `feedback_default_to_recommendation`.

**Forced-picker shape (before coding):** fire a Rule 14f AskUserQuestion if there is a real design fork (e.g. where the defaults live, how a worker overrides them, whether they seed per-project or global). If the recommended shape is obvious + default-approved, describe it plainly and proceed.

**Test coverage decision:** add node:test unit coverage for any new pure helper (e.g. a platform×content-type → default-category-list mapping). The live result is verified by the director (the extension shows sensible defaults on a fresh competitor). Check 6 Playwright per Rule 27 (likely SKIPPED — visual judgment in the extension).

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (expect UNCHANGED)
- Extension tsc clean (P-61 is extension-in-scope — expect clean; may change if extension code is touched)
- Extension `npm test` ≥ 915 (entry 915; +N only if new extension tests are added)
- src/lib `node:test` ≥ 1363 (entry 1363; +N if a new pure helper is added)
- `npm run build` = 73 routes (+1 only if P-61 adds a new endpoint)
- Check 6 Playwright SKIPPED per Rule 27 (extension visual judgment)
- **Run `npm run build` with an explicit absolute `cd /workspaces/brand-operations-hub` prefix** — the P-43 cwd-leak recurred recently; treat a route count of 0 as the cwd-leak tell-tale.

**Deploy mechanics:** P-61 is extension-in-scope. If extension SOURCE changes, build a fresh sideload zip + have the director sideload + verify BEFORE the Rule 9 deploy gate + 3-push pattern. If there's a PLOS-side serving piece (a defaults endpoint), it ships to vklf.com under the standard Rule 9 gate. Expect ≥ 1 Rule 9 deploy gate.

**Group A docs to update at session end:** ROADMAP header bump + the P-61 entry status update + (a.131) status + CHAT_REGISTRY header bump (197th session) + DOCUMENT_MANIFEST header + flags + the schema-change-in-flight transition + CORRECTIONS_LOG header (+ 1 NEW §Entry if anything notable) + HANDOFF_PROTOCOL header bump + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite.

**Group B docs to update at session end:** the EXISTING P-61 spec (mark the feature shipped/verified; record the as-built) + `docs/COMPETITION_SCRAPING_DESIGN.md` (a §B note for the defaults model) + `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (the P-61 verification) + `docs/COMPETITION_SCRAPING_PRIMER.md` (§5 — P-61 status; if P-61 closes, note W#2 graduation is fully clear).

**Standing carry-overs into this session:**

- **(a.131) = P-61** — extension server-side default categories. Read the EXISTING P-61 spec FIRST; confirm the schema flag; plan any UX shape WITH me.
- **P-62** — the Workflow-11 surveillance card+page (future-workflow). Behind P-61.
- **P-56 Option-2 follow-up** — the optional "kill the idle flash too" (redraw only changed text) for the residual reading-time flicker; raise only if you want it.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; single-session fix / palate-cleanser.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — schedulable now; **fully clear after P-61.** The continuity primer + `./catch-up-workflow 2` mechanism support it; director's discretion.

---

## Why this pointer was written this way (debug aid)

- **(a.131) = P-61 is the PICK because it was the director's §4 Step 1c forced-picker choice this session.** With P-59 closed, the director picked P-61 (extension default categories) over the future-workflow P-62 — it is the LAST substantive W#2 polish item, so closing it clears W#2 graduation entirely.
- **The FIRST action is to READ the existing P-61 spec, not to create one.** Unlike the last several sessions (P-57 / P-58 / P-59 / P-60, whose specs had to be created as the first artifact), the P-61 spec was already created in the 2026-06-02-d capture batch — so Rule 31 here means READ the source-of-truth, not re-create it.
- **The Schema-change-in-flight flag MAY flip YES** — P-61 is a server-side feature that may add a defaults table/seed; this is the first session in a while where the flag is genuinely in play. Confirm from the spec, audit per Rule 23, authorize WITH the director before any `prisma db push`.
- **Plan the output shape WITH the director if there's a UX surface** — `feedback_plan_output_shape_before_building` applies if the defaults surface in the picker.
- **This is extension-in-scope work** — expect a fresh sideload zip + director sideload-verification if extension SOURCE changes.
- **Nothing is held back** — the P-59 deploy is on main, and the doc-batch ff-merges this session. Expect `git log origin/main..HEAD` = 0 at entry.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.131.alt1) P-61** (current PICK — pre-loaded above). Extension server-side default categories per platform per content-type; read the EXISTING spec first; confirm the schema flag; on `workflow-2-competition-scraping`.
- **(a.131.alt2) W#2 graduation** (schedulable now — P-54 + P-55 + P-56 + P-57 + P-58 + P-59 + P-60 done; fully clear once P-61 ships; the continuity primer + `./catch-up-workflow 2` mechanism support it; director's discretion).
- **(a.131.alt3) P-56 Option-2 follow-up** (the optional "kill the idle flash too" / redraw only changed text for the residual reading-time flicker; on `workflow-2-competition-scraping`).
- **(a.131.alt4) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; quick palate-cleanser).
- **(a.131.alt5) P-50 NEW Condition Pathology card** (small single-session UI addition; director already approved scope; on `workflow-2-competition-scraping`).
- **(a.131.alt6) P-62 Workflow-11 surveillance card + page** (future-workflow seed; the spec exists; design WITH the director when W#11 kicks off).
