# Next session

**Written:** 2026-06-03 (`session_2026-06-03_p61-extension-default-categories` — W#2 polish P-61 — server-side DEFAULT categories per platform per content-type ✅ DEPLOYED-AND-VERIFIED end-to-end on real Chrome via `workflow-2-competition-scraping` → `main` (director verbatim "Pass") — **P-61 is now CLOSED — it was the LAST substantive W#2 polish item, so W#2 graduation is now fully clear (P-54 / P-55 / P-56 / P-57 / P-58 / P-59 / P-60 / P-61 all closed).** EXTENSION + PLOS-server change; NEW additive Prisma model `CategoryDefault`; ONE NEW PLOS route (`competition-scraping/category-defaults`). `main` went `8e71cda → fdedaa5 → 60f9455`. **Closes (a.131) = P-61 ✅ DEPLOYED-AND-VERIFIED → P-61 CLOSED. Opens (a.132) RECOMMENDED-NEXT = Begin W#2 graduation (Rule 33)** — start the workflow-graduation continuity process for Competition Scraping: write the graduation/handoff materials, run `./catch-up-workflow 2`, and formally mark W#2 essentially complete now that the polish queue is drained. On `workflow-2-competition-scraping` — this was the director's §4 Step 1c forced-picker choice. **FIRST action next session = read `docs/HANDOFF_PROTOCOL.md` Rule 33 (workflow-graduation continuity) + the graduation methodology BEFORE doing anything else.**)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session OPENED on 2026-06-02 (it was the 10th session of that day, in-flight stamped `-j`) and the harness `currentDate` rolled to **2026-06-03 MID-DEPLOY**. Per the trust-the-harness convention (precedent: `session_2026-06-01` + `session_2026-06-02` both crossed midnight and stamped to the new day), this session is STAMPED **2026-06-03** — the FIRST session of 2026-06-03 (NO suffix). The IN-FLIGHT artifacts (the P-61 spec §2 text + the build commit `fdedaa5` message) carry the earlier `2026-06-02-j` stamp — that is EXPECTED and harmless (work done late 2026-06-02, finalized after midnight). **Next session: keep trusting the harness `currentDate`; do NOT regress or invent a suffix ahead of it.** The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session.

> ⚠️ **BRANCH: next session stays on `workflow-2-competition-scraping`.** W#2 graduation is W#2-only. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically.

> ⚠️ **BRANCH STATE — NOTHING HELD BACK.** This session's deploy (the 2 build commits `fdedaa5` + `60f9455`) is on main. After this session's end-of-session doc-batch ff-merge, `main` and `workflow-2-competition-scraping` are both at `60f9455` + the doc-batch SHA. Expect `git log origin/main..HEAD --oneline` to show 0 at next session entry.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry next session.** This (P-61) session went NO → YES (the new `CategoryDefault` model) → YES→NO at the deploy `prisma db push` (1.29s, additive, zero data loss) → NO at exit. **W#2 graduation is a DOCS/METHODOLOGY unit — NO schema change anticipated.** If graduation surfaces any residual code cleanup that touches the schema, run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod).

> ⚠️ **NO OWED VERIFICATION.** P-61 was director-verified on real Chrome this session ("Pass"). There is NO owed verification carried into next session. W#2 graduation is a NEW unit.

> ⚠️ **W#2 POLISH QUEUE IS DRAINED.** P-54 + P-55 + P-56 + P-57 + P-58 + P-59 + P-60 + P-61 are ALL closed. The only residue is the lower-priority backlog (P-53 absorbed-export-button, P-43 scoreboard `cd` prefix, P-50 Condition Pathology card, P-26/P-27 low-priority capture bugs, the two P-52 carry-overs, the optional P-56 Option-2 idle-flicker follow-up) + the future-workflow P-62 (W#11 surveillance card). **W#2 graduation does NOT require any of these to ship first** — they ride along as documented residue.

---

## What we did this session (in plain terms)

This session gave the extension a sensible starting set of category labels.

**Until now, when you started tagging a competitor's captured content (text, an image, or a video) in the extension, the category list was whatever you had typed before — there was no way to "pin" a category as a go-to default for a particular shopping site.** So you re-picked or re-typed the same categories over and over.

**Now you can pin any category as a default for a specific platform and a specific type of content.** When you create a new category (or pick an existing one) you get a one-click "★ Make default for [platform] · [type]" checkbox right below the dropdown. The next time you capture that type of content on that platform, your pinned defaults show up in a "★ Defaults" group right at the top of the category dropdown, so you start from useful choices instead of a blank list. The defaults are saved on the server and shared with your team (everyone on the project sees the same defaults), and you can un-pin a default any time with the same checkbox.

**You sideloaded the new extension build and verified it live on real Chrome.** Verdict: **"Pass."**

**This was the last substantive polish item for Workflow #2 (Competition Scraping).** With it closed, the whole W#2 polish queue is drained — so the next session begins the formal "graduation" of W#2 (writing the continuity/handoff materials so the workflow is considered essentially complete).

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (the P-61 entry now ✅ CLOSED + the P-62 + the lower-priority residue) + `docs/polish-item-specs/` (the per-item specs) + `docs/COMPETITION_SCRAPING_PRIMER.md` (the W#2 continuity primer).

- **(a.132) = Begin W#2 graduation (Rule 33)** — **NEXT SESSION (see below).**
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card rename + hub page + "Continued Competitive Surveillance" page with the verbatim 5-question checklist (spec doc exists) — future-workflow.
- **(P-56 Option-2 follow-up)** the optional "kill the idle flash too" (redraw only changed text) for the residual reading-time flicker on Amazon Highlight Terms; raise only if the director wants it.
- **(P-53)** Excel "Export Table" for the Category + Type pages — effectively ABSORBED by P-55's grouped spreadsheets; LOW residue only.
- **(P-43 mechanical prevention small fix)** — add an absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; single-session fix.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — now FULLY CLEAR (the entire polish queue is drained); **the (a.132) next pick.**

## What we'll do next session (in plain terms)

1. **We formally "graduate" Workflow #2 (Competition Scraping).** Now that every substantive polish item is shipped and verified, we write the continuity/handoff materials so anyone (or any future session) can pick W#2 back up with full context — what it does, how it's built, what's still open as low-priority residue.
2. **We run the graduation tooling** (`./catch-up-workflow 2`) and follow the Rule 33 methodology so the handoff is consistent with how the other workflows are documented.
3. **We mark W#2 essentially complete** in the roadmap + the primer, leaving the low-priority residue clearly listed but not blocking.

## What's still left in the total roadmap (in plain terms)

- **P-61 (extension default categories) — ✅ CLOSED 2026-06-03.** You can now pin categories as defaults per platform per content-type; verified live on real Chrome. **The LAST substantive W#2 polish item.**
- **W#2 graduation — NEXT, the (a.132) pick.** Now FULLY CLEAR (the polish queue is drained).
- **P-59 (update the Detailed User Guide) — ✅ CLOSED 2026-06-02-i.** The in-app guide now covers everything; verified live.
- **P-60 (open-detail ↗ icon on the 3 analysis tables) — ✅ CLOSED 2026-06-02-h.** Verified live.
- **P-57 (fill the delete-coverage gaps — videos + category labels) — ✅ CLOSED 2026-06-02-g.** Verified live.
- **P-58 (Download-Extension-zip serves the latest build) — ✅ CLOSED 2026-06-02-f.** Verified live.
- **P-56 (Amazon Highlight Terms flicker blocks text selection) — ✅ CLOSED 2026-06-02-e.** Verified on real Amazon; only residue is the optional Option-2 idle-flicker follow-up.
- **P-55 (Comprehensive Analysis downloadable materials + primer + main-table additions) — ✅ ESSENTIALLY COMPLETE 2026-06-02-d.** Only the absorbed P-53 on-page button could remain.
- **P-54 (main Competitor URLs table enhancements) — ✅ CLOSED 2026-06-01-d.** All 5 phases shipped + verified.
- **P-49 W#2 Reviews Phase 2 — ✅ CLOSED 2026-06-01.** All three analysis pages shipped + verified.
- **P-52 (AI model registry + Rule 32 + Opus 4.8 rollout)** — ✅ DEPLOYED-AND-VERIFIED. TWO carry-overs OPEN: official Opus 4.8 pricing numbers + the deferred W#1 shared-list migration.
- **P-62 (NEW capture)** — the Workflow-11 surveillance card + page. Future-workflow.
- **P-50 NEW Condition Pathology card** — small single-session UI addition; director already approved scope.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`. Single-session fix.
- **P-26 below-fold scroll capture bugs** + **P-27 capture bugs #9 + #15** — LOW priority.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started (P-62 seeds part of W#11).
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**W#2 polish P-61 — server-side DEFAULT categories per platform per content-type — ✅ DEPLOYED-AND-VERIFIED 2026-06-03** on real Chrome via `workflow-2-competition-scraping` → `main`; director verdict "Pass". `main` went `8e71cda → fdedaa5 → 60f9455` (one clean ff-merge of the two verified build commits). **An AUDIT-then-DESIGN-then-BUILD-then-DEPLOY session: TWO build commits (`fdedaa5` the P-61 feature + `60f9455` the P-58 served-artifact refresh), ONE deploy, ONE Rule 9 deploy gate (director "Deploy + run db push" — authorized BOTH the deploy AND the additive `prisma db push`), SIX Rule 14f pickers total (FOUR design — Q1 sharing = per-Project / Q2 show-defaults = "★ Defaults" optgroup [director OVERRIDE of my recommended quick-pick chips] / Q3 inline ★ + checkbox-on-add / Q4 contextual "★ Make default" checkbox — + the deploy gate + the §4 Step 1c next-pick → W#2 graduation). EXTENSION + PLOS-server change; NEW additive Prisma model `CategoryDefault`; ONE NEW PLOS route.**

**Session shape (Rule 3 code-truth audit → read the EXISTING P-61 spec [Rule 31] → 4 design pickers → build → scoreboard → deploy + db push → real-Chrome verify → end-of-session doc-batch):**

- **The Rule 3 code-truth audit (FIRST action):** an Explore agent confirmed categories live in ONE project-scoped `VocabularyEntry` table (keyed `@@unique([projectId, vocabularyType, value])` — no platform, no default flag); the three capture forms (`{text,image,video}-capture-form.ts`) each fetch the full vocab list for their type and render a native `<select>` with a "+ Add new…" sentinel; `UserExtensionState` (P-3) is user-scoped (not a fit). Per-(platform, content-type) defaults are genuinely NEW (Rule 24 confirmed).
- **The P-61 spec (READ, not re-created):** `docs/polish-item-specs/P-61-extension-default-categories.md` ALREADY EXISTED (the 2026-06-02-d capture batch) — per Rule 31 it was READ, and §2 was UPDATED this session with the audit findings + the 4-picker design + the Rule 23 Additive classification; Status → ✅ DEPLOYED-AND-VERIFIED 2026-06-03.
- **The 4 design pickers (WITH the director per `feedback_plan_output_shape_before_building`):** Q1 sharing = per-Project (recommended); Q2 show-defaults = a "★ Defaults" optgroup pinned at the top of the existing native dropdown (a director OVERRIDE); Q3 make/remove = inline ★ + checkbox-on-add (recommended); Q4 reconciliation (native `<option>` rows can't host a tappable star) = a contextual "★ Make default for [platform] · [type]" checkbox BELOW the dropdown (recommended). The Q2↔Q3 conflict was surfaced + reconciled via the focused Q4 picker (the NEW reusable PATTERN).
- **The build (`fdedaa5`):** NEW additive Prisma model `CategoryDefault` (keyed `projectId + platform + vocabularyType + value`) shipped to prod via `prisma db push` (1.29s, zero data loss); NEW route `competition-scraping/category-defaults` (GET/POST/DELETE; route 73 → 74); NEW shared types; NEW pure helper `src/lib/competition-scraping/category-defaults.ts` (`buildCategoryPickerOptions` + `isDefaultCategory`, +6 node:test); extension api-client + api-bridge + 3 background handlers + messaging union/validation; NEW shared content-script DOM helper `category-defaults-picker.ts` wired into the text / image / video capture forms. `60f9455` = the P-58 in-app Download-Extension served-artifact refresh. `main` went `8e71cda → fdedaa5 → 60f9455`.
- **The fresh sideload zip:** `plos-extension-2026-06-02-w2-p61-default-categories.zip` (219 KB) at repo root — the director sideloaded + real-Chrome verified this exact artifact (untracked; NOT committed per Rule 11).
- **1 PENDING:** the end-of-session doc-batch commit (this doc-batch agent's output) — the Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY [unchanged]) + HANDOFF_PROTOCOL header bump + the EXISTING P-61 Group B polish-item-spec update + a NEW §B 2026-06-03 note in `docs/COMPETITION_SCRAPING_DESIGN.md` + the VERIFICATION_BACKLOG Deploy session #43 + the PRIMER §5 update. **This doc-batch commit ff-merges to main per the standard 3-push pattern.**

**Schema-change-in-flight flag NO at entry → flipped YES (the new `CategoryDefault` model) → flipped YES→NO at the deploy `prisma db push` → NO at exit. NEXT session (W#2 graduation) = NO at entry anticipated** (a docs/methodology unit).

**ZERO open DEFERRED items at exit (Rule 26):** TaskList returned EMPTY at entry AND exit; the 5 in-session build tasks (#4–#8) all completed. P-62 + the small carry-overs (P-43, the P-52 carry-overs, the P-56 Option-2 follow-up) are documented roadmap continuation, NOT TaskList DEFERRED items.

**Baselines locked from this session:** root tsc clean (UNCHANGED) + extension tsc clean (UNCHANGED) + extension `npm test` = **915/915 UNCHANGED** (plumbing covered by tsc; no new extension test — no messaging.test exists to extend) + src/lib `node:test` = **1369/1369** (+6 — the `category-defaults` helper tests) + `npm run build` = **74 routes** (+1 — the new `category-defaults` endpoint); Check 6 Playwright SKIPPED per Rule 27 (overlay + server-state = director real-Chrome verification).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-03** (no top-tier slip — the deploy passed; the director verified "Pass") capturing: (a) the DATE-BOUNDARY crossing (opened 2026-06-02 as in-flight `-j`; harness rolled to 2026-06-03 mid-deploy; stamped 2026-06-03 per trust-the-harness; in-flight artifacts carry `-j` — expected/harmless); (b) NEW reusable PATTERN — "when two design picks conflict against a platform constraint (a '★ Defaults' optgroup in a NATIVE `<select>` + a requested per-row star toggle, which native `<option>` rows can't host), surface the tension and reconcile WITH the director via one focused follow-up picker rather than silently choosing — the resolution was a contextual checkbox tied to the selection"; (c) the additive-schema-via-`prisma db push` flow ran clean (flag NO→YES→NO; the Rule 9 gate authorized the push). **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NO new memory file this session.**

**Group B docs updated** — `docs/polish-item-specs/P-61-extension-default-categories.md` (the EXISTING spec; Status → ✅ DEPLOYED-AND-VERIFIED 2026-06-03; §2 the audit + the 4-picker design; the as-shipped note — the `CategoryDefault` model + the `category-defaults` route + the `category-defaults-picker` helper + the director "Pass") + a NEW §B 2026-06-03 note in `docs/COMPETITION_SCRAPING_DESIGN.md` + `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (Deploy session #43 — default-categories real-Chrome PASS) + `docs/COMPETITION_SCRAPING_PRIMER.md` (§5 open-items — P-61 now CLOSED; ALL W#2 polish drained; W#2 graduation the next pick). `docs/REVIEWS_PHASE_2_DESIGN.md` UNCHANGED. `docs/COMPETITION_DATA_V2_DESIGN.md` UNCHANGED. `docs/AI_MODEL_REGISTRY.md` UNCHANGED.

**ROADMAP P-61 polish-backlog entry flipped** to ✅ SHIPPED-AT-DEPLOY-LEVEL + DEPLOYED-AND-VERIFIED + CLOSED (with the as-shipped narrative + the 4-picker design + the last-substantive-W#2-polish-item note + the original capture preserved) + (a.131) CLOSED / (a.132) opens = Begin W#2 graduation.

**SEVENTY-FIFTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ONE additive-schema DEV op — the `CategoryDefault` `prisma db push` (additive, 1.29s, zero data loss), authorized by the single Rule 9 deploy gate (director "Deploy + run db push"). NO `migrate reset`, NO drop, NO dev-data deletes. NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (W#2 graduation):** **NO schema change anticipated** — graduation is a docs/methodology unit. If a residual code cleanup touches the schema, it is ADDITIVE only; run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (never `migrate reset` against prod). No other Rule 8/9/29 triggers anticipated.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the P-61 spec (updated this session) + the W#2 continuity primer + the memory directory.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. W#2 graduation is W#2-only. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch ff-merges to main): `main` and `workflow-2-competition-scraping` BOTH at `60f9455` (the P-61 + P-58-refresh deploy) + the end-of-session doc-batch SHA. **Verify with `git log origin/main..HEAD --oneline` showing 0** (everything is on main after the doc-batch ff-merge); `git status` clean apart from historical untracked .zip + .html artifacts at repo root (now incl. `plos-extension-2026-06-02-w2-p61-default-categories.zip`).

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block; W#2 graduation has no polish-item-spec — the canonical reads are Rule 33 + the graduation methodology):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- **`docs/HANDOFF_PROTOCOL.md` Rule 33 (workflow-graduation continuity) — the FIRST read this session** + the graduation methodology + Rule 25 (multi-workflow) + Rule 26 + Rule 30 (Session bookends) + §4 Step 4b extended template. (If any residual code cleanup is in scope: Rule 14f + Rule 9 + Rule 23 + Rule 31 as well.)
- **`docs/COMPETITION_SCRAPING_PRIMER.md`** — the W#2 continuity primer (§5 open-items now reflects P-61 CLOSED + the drained polish queue); the graduation materials build on this.
- **`./catch-up-workflow 2`** — the graduation tooling per Rule 33 (added 2026-06-02-d).
- `docs/ROADMAP.md` — the W#2 polish backlog (all P-IDs now CLOSED except the lower-priority residue + P-62) for the graduation summary.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-03 (this session — the DATE-BOUNDARY crossing + the reconcile-conflicting-picks PATTERN) + §Entry 2026-05-31 (the TOP-TIER SLIP — never act on an instruction that is not verbatim in a director message; honor explicit picker choices; restart on degraded tooling).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - **`feedback_no_fabricated_instructions.md`** — act only on verbatim directives; graduation is a process, not a new feature ask.
  - **`feedback_remaining_roadmap_summary.md`** + **`feedback_handoff_carryovers_to_roadmap.md`** — the graduation handoff must summarize the total remaining roadmap + capture every carry-over as a ROADMAP entry.
  - **`feedback_session_bookends_plain_summary.md`** — bookend with plain-terms summaries (graduation is a director-facing milestone).
  - `feedback_default_to_recommendation.md` + `feedback_recommendation_style.md` + `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_plan_output_shape_before_building.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_browser_first_ai_with_server_migration.md` + `feedback_exports_include_all_table_data.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; for W#2 graduation there is no polish-item-spec — instead the FIRST read is `docs/HANDOFF_PROTOCOL.md` Rule 33 (workflow-graduation continuity) + the graduation methodology + `docs/COMPETITION_SCRAPING_PRIMER.md`.** **This session is on `workflow-2-competition-scraping` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.132) = Begin W#2 graduation, Rule 33):** now that every substantive W#2 (Competition Scraping) polish item is shipped and verified (P-54 / P-55 / P-56 / P-57 / P-58 / P-59 / P-60 / P-61 all closed), begin the formal workflow-graduation continuity process — write the graduation/handoff materials, run `./catch-up-workflow 2`, and formally mark W#2 essentially complete in the roadmap + the primer, listing the low-priority residue clearly but not as blockers. This was your §4 Step 1c forced-picker choice. **P-61 is CLOSED — do NOT reopen it.**

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root, incl. plos-extension-2026-06-02-w2-p61-default-categories.zip)

git log origin/main..HEAD --oneline
# Expected: 0 — main and workflow-2 are both at 60f9455 + the 2026-06-03 doc-batch SHA; nothing is held back
```

If `git branch --show-current` shows `main`, run `./resume-workflow 2`.

**FIRST step (read Rule 33 + the graduation methodology — BEFORE any work):** read `docs/HANDOFF_PROTOCOL.md` Rule 33 (workflow-graduation continuity, added 2026-06-02-d) and the graduation methodology fully, then read `docs/COMPETITION_SCRAPING_PRIMER.md` (the W#2 continuity primer the graduation materials build on). Confirm what `./catch-up-workflow 2` does before running it.

**Schema-change-in-flight flag:** **NO at entry.** W#2 graduation is a docs/methodology unit — NO schema change anticipated. If any residual code cleanup is in scope and touches the schema, it is ADDITIVE only; run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (never `migrate reset` against prod).

**Output-shape (plan WITH the director per `feedback_plan_output_shape_before_building` + `feedback_session_bookends_plain_summary`):** graduation is a director-facing milestone — bookend with plain-terms summaries (what graduation means, what's complete, what residue remains). If the graduation materials have a real shape fork (e.g. how detailed the continuity primer is, whether to fold the residue into a single "W#2 residue" section), plan the shape WITH me; otherwise describe the recommended shape plainly and proceed per `feedback_default_to_recommendation`.

**Forced-picker shape (before coding/writing):** fire a Rule 14f AskUserQuestion only if there is a real fork (e.g. graduate-now vs. clear the lower-priority residue first; how much of the residue to fold into graduation). If the recommended shape is obvious + default-approved, describe it plainly and proceed.

**Test coverage decision:** graduation is docs/methodology — likely NO new tests. If any residual code cleanup adds a pure helper, add node:test coverage. Check 6 Playwright per Rule 27 (likely SKIPPED — no new UI surface).

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (expect UNCHANGED)
- Extension tsc clean (expect UNCHANGED unless extension code is touched)
- Extension `npm test` = 915 (entry 915; +N only if new extension tests)
- src/lib `node:test` = 1369 (entry 1369; +N only if a new pure helper)
- `npm run build` = 74 routes (+1 only if a new endpoint is added — unlikely for a docs unit)
- Check 6 Playwright SKIPPED per Rule 27
- **Run `npm run build` with an explicit absolute `cd /workspaces/brand-operations-hub` prefix** — the P-43 cwd-leak recurred recently; treat a route count of 0 as the cwd-leak tell-tale.

**Deploy mechanics:** graduation is primarily a docs/methodology unit — likely NO deploy. If any residual code cleanup ships, it follows the standard Rule 9 gate + 3-push pattern (and a fresh sideload zip + director sideload-verification if extension SOURCE changes).

**Group A docs to update at session end:** ROADMAP header bump + the W#2-graduation status + (a.132) status + CHAT_REGISTRY header bump (198th session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header (+ 1 NEW §Entry if anything notable) + HANDOFF_PROTOCOL header bump + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite.

**Group B docs to update at session end:** `docs/COMPETITION_SCRAPING_PRIMER.md` (the graduation status) + `docs/COMPETITION_SCRAPING_DESIGN.md` (a §B graduation note if warranted) + whatever new graduation/continuity materials Rule 33 + `./catch-up-workflow 2` prescribe.

**Standing carry-overs into this session:**

- **(a.132) = Begin W#2 graduation (Rule 33)** — read Rule 33 + the graduation methodology FIRST; run `./catch-up-workflow 2`; plan the materials' shape WITH me if there's a fork.
- **P-62** — the Workflow-11 surveillance card+page (future-workflow). Behind graduation.
- **P-56 Option-2 follow-up** — the optional "kill the idle flash too" (redraw only changed text); raise only if you want it.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; single-session fix / palate-cleanser.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **P-50 NEW Condition Pathology card** — small single-session UI addition; director already approved scope.

---

## Why this pointer was written this way (debug aid)

- **(a.132) = Begin W#2 graduation is the PICK because it was the director's §4 Step 1c forced-picker choice this session.** With P-61 closed — the LAST substantive W#2 polish item — the entire polish queue is drained, so graduating W#2 is the natural next unit; the director picked it over the future-workflow P-62 and the lower-priority residue.
- **The FIRST action is to READ Rule 33 + the graduation methodology, not to write materials blind.** Rule 33 (workflow-graduation continuity) + `./catch-up-workflow 2` were added 2026-06-02-d precisely for this moment; follow the prescribed methodology so the W#2 handoff matches how the other workflows are documented.
- **The Schema-change-in-flight flag is NO at entry and expected to stay NO** — graduation is a docs/methodology unit. The flag last flipped YES→NO this session for the `CategoryDefault` additive push.
- **Plan the shape WITH the director** — graduation is a director-facing milestone; `feedback_session_bookends_plain_summary` + `feedback_plan_output_shape_before_building` apply (what "graduated" means + what residue remains, in plain terms).
- **Nothing is held back** — the P-61 deploy is on main, and the doc-batch ff-merges this session. Expect `git log origin/main..HEAD` = 0 at entry.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.132.alt1) Begin W#2 graduation** (current PICK — pre-loaded above). Read Rule 33 + the graduation methodology first; run `./catch-up-workflow 2`; on `workflow-2-competition-scraping`.
- **(a.132.alt2) P-56 Option-2 follow-up** (the optional "kill the idle flash too" / redraw only changed text for the residual reading-time flicker; on `workflow-2-competition-scraping`).
- **(a.132.alt3) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; quick palate-cleanser).
- **(a.132.alt4) P-50 NEW Condition Pathology card** (small single-session UI addition; director already approved scope; on `workflow-2-competition-scraping`).
- **(a.132.alt5) The two P-52 carry-overs** (official Opus 4.8 pricing numbers + the deferred W#1 `AutoAnalyze.tsx` shared-list migration — note the W#1 piece is W#1-owned per Rule 3).
- **(a.132.alt6) P-62 Workflow-11 surveillance card + page** (future-workflow seed; the spec exists; design WITH the director when W#11 kicks off).
