# Next session

**Written:** 2026-06-02-d (`session_2026-06-02-d_p55-phase-3-primer-wiring-editable-primer-and-graduation-methodology` — W#2 polish P-55 Phase 3 — the teaching primer WIRED into `/comprehensive-analysis` (a "Competitive Analysis Primer" Word `.docx` download in the Files box + in the "Download all (.zip)" bundle + an "↡ Insert primer" editor button) AND made EDITABLE + SAVABLE (an "✎ Edit" rich-text modal with Save + Reset-to-default; the saved version drives the download + the insert) ✅ DEPLOYED-AND-VERIFIED end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` (director real-Chrome: "pass all five" + "pass") — **P-55 is now ESSENTIALLY COMPLETE.** `main` went `7ead4dc → 894563b → ef4a47c`. PLUS the Workflow Graduation Continuity methodology shipped (NEW HANDOFF_PROTOCOL Rule 33 + a per-workflow continuity primer + a one-paste `./catch-up-workflow <N>` script; W#2 first instance) + a roadmap-capture batch (NEW P-56 HIGH + P-57..P-62). **Closes (a.125) = P-55 Phase 3 (parts 2 + 3) DONE → P-55 essentially CLOSED. Opens (a.126) RECOMMENDED-NEXT = P-56** (HIGH — Amazon Highlight Terms still flicker on the real site, blocking text selection for capture; resumes the deferred P-20 real-Amazon verification) on `workflow-2-competition-scraping`. **FIRST action next session = re-run the `docs/p-20-trace-script.js` MutationObserver trace on a real Amazon PDP to confirm whether the P-20 fingerprint short-circuit engages; design the fix WITH the director before coding; needs a fresh extension sideload zip + real-Amazon verification.**)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This was the FOURTH session of 2026-06-02 (suffix `-d`); the prior REAL sessions today are `session_2026-06-02` (no suffix) + `session_2026-06-02-b` (P-55 Phase 2b-ii) + `session_2026-06-02-c` (the three trimmed export variants). The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session. Keep trusting the harness `currentDate`; do NOT regress or invent a suffix ahead of it.

> ⚠️ **BRANCH: next session stays on `workflow-2-competition-scraping`.** P-56 (the Amazon Highlight-Terms flicker / the extension capture flow) is W#2-only. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically.

> ⚠️ **BRANCH STATE — NOTHING HELD BACK.** Both build deploys this session (`894563b` + `ef4a47c`) are on main. The three docs/tooling commits (`a0339e8` graduation methodology + `e167952` P-56 capture + `59edc2d` P-57..P-62 capture) were on `workflow-2-competition-scraping` and ride this session's end-of-session doc-batch ff-merge onto main. After the doc-batch ff-merge, `main` and `workflow-2-competition-scraping` are both at `ef4a47c` + the three docs/tooling commits + the doc-batch SHA. Expect `git log origin/main..HEAD --oneline` to show 0 at next session entry.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry next session.** This session flipped YES briefly during P-55 Phase 3 part 3 (the additive nullable `ComprehensiveCompetitorAnalysis.primerJson Json?` column) and flipped back YES→NO at the pt3 deploy push (`prisma db push` completed, column live, zero data loss). NO at exit. **P-56 is an extension-side capture/DOM-timing fix — NO schema change anticipated.** If a build unexpectedly needs a field, run the Rule 23 Change Impact Audit + get explicit director authorization BEFORE any `prisma db push`.

> ⚠️ **NO OWED PLOS-SIDE VERIFICATION.** Both P-55 Phase 3 deploys were director-verified this session ("pass all five" + "pass"). There is NO owed verification carried into next session. P-56 is a NEW unit — its first action is a diagnostic trace, not a verification of prior work.

---

## What we did this session (in plain terms)

This session finished your "Comprehensive Analysis" downloadable-materials project and set up some housekeeping.

**First, we wired up the teaching "primer" you approved a couple sessions ago.** It is now a proper Word document you can download from the Files box on your "Comprehensive Analysis" page, it is included in the "Download all" zip, and there is an "↡ Insert primer" button that drops it straight into your editor with one click. We also updated the primer's wording so it correctly describes all SEVEN files in the box (it had been written before you added the three "without individual reviews" files last session, so it was out of date — you caught that, and we fixed it before shipping). **You verified it: "pass all five."**

**Then you asked for the primer to be editable and savable** — so we added an "✎ Edit" button that opens the primer in a built-in editor. You can reword it however you like, click **Save**, and from then on YOUR edited version is what downloads and inserts. There is also a **Reset to default** button to go back to the standard wording. **You verified it: "pass."** With that, your whole "Comprehensive Analysis" materials project (spreadsheets + primer) is essentially finished.

**We also shipped some housekeeping you directed:** a "workflow graduation continuity" method (so that when a workflow graduates, there is a short primer doc + a one-command catch-up so a future session can get up to speed fast) and a batch of newly-captured polish items (P-56 through P-62) for the roadmap — including the one that's queued next.

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (the P-55 entry now ✅ essentially COMPLETE + the NEW P-56..P-62 entries) + `docs/polish-item-specs/` (the per-item specs).

- **(a.126) = P-56** — Amazon Highlight Terms still flicker on the real site, blocking text selection for capture (HIGH). Resumes the deferred P-20 real-Amazon verification. **NEXT SESSION (see below).**
- **(P-57)** fill the delete-coverage gaps (reviews / videos / category-labels) — MEDIUM.
- **(P-58)** Download-Extension-zip serves the LATEST build — MEDIUM.
- **(P-59)** update the existing `DetailedUserGuide.tsx` — LOW/MEDIUM.
- **(P-60)** add the open-detail ↗ icon to the 3 analysis tables' Product Name column — LOW.
- **(P-61)** extension server-side default categories per platform per content-type (spec doc) — MEDIUM.
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card rename + hub page + "Continued Competitive Surveillance" page with the verbatim 5-question checklist (spec doc) — future-workflow.
- **(P-53)** Excel "Export Table" for the Category + Type pages — effectively ABSORBED by P-55's grouped spreadsheets; LOW residue only.
- **(P-43 mechanical prevention small fix)** — add an absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; single-session fix.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — now schedulable (P-54 closed + P-55 essentially closed); director's discretion.

## What we'll do next session (in plain terms)

1. **We look into why the Amazon "Highlight Terms" keep flickering** on the real Amazon site — that flicker makes it hard to select text to capture. The very first thing we do is run a small diagnostic trace on a real Amazon product page to see exactly what's happening (whether an earlier fix we made is or isn't kicking in).
2. **We agree the fix with you BEFORE writing any code** — this is a real-site timing problem, so we want to confirm the approach together first.
3. **As always:** once we have a fix, we package a fresh extension file for you to load, scoreboard-verify, and verify together on a real Amazon page on vklf.com.

## What's still left in the total roadmap (in plain terms)

- **P-55 (Comprehensive Analysis downloadable materials + primer + main-table additions) — ✅ ESSENTIALLY COMPLETE 2026-06-02-d.** The "Overall Competitor Analysis" column, the Files box, all FOUR full competition spreadsheets, the three "without individual reviews" summary-only variants (SEVEN files total), and the teaching primer (downloadable Word doc + Insert button + editable/savable) are all shipped + verified. Only the absorbed P-53 on-page button could remain.
- **P-56 (Amazon Highlight Terms flicker blocks text selection) — NEW, HIGH.** The next pick. Resumes the deferred P-20 real-Amazon verification.
- **P-57..P-62 (NEW captures)** — delete-coverage gaps / Download-Extension-zip latest / DetailedUserGuide update / open-detail ↗ icon on the 3 analysis tables / extension default categories / the Workflow-11 surveillance card+page. Mostly MEDIUM/LOW or future-workflow.
- **P-54 (main Competitor URLs table enhancements) — ✅ CLOSED 2026-06-01-d.** All 5 phases shipped + verified.
- **P-49 W#2 Reviews Phase 2 — ✅ CLOSED 2026-06-01.** All three analysis pages shipped + verified.
- **P-52 (AI model registry + Rule 32 + Opus 4.8 rollout)** — ✅ DEPLOYED-AND-VERIFIED. TWO carry-overs OPEN: official Opus 4.8 pricing numbers + the deferred W#1 shared-list migration.
- **P-51 per-Project competitive landscape AI summary** — SUPERSEDED for its UI dimension by P-55; the `ReviewAnalysis.PER_PROJECT` slot stays unused.
- **P-50 NEW Condition Pathology card** — small single-session UI addition; director already approved scope.
- **P-48 Session 3 (Diagnostic #2 for screen-recording stutter)** — empirical instrumentation; deferred.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`. Single-session fix.
- **P-26 below-fold scroll capture bugs** + **P-27 capture bugs #9 + #15** — LOW priority.
- **W#2 graduation** — now schedulable (P-54 + P-55 done); director's discretion. The NEW continuity primer + `./catch-up-workflow 2` mechanism support this.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started (P-62 seeds part of W#11).
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**W#2 polish P-55 Phase 3 — the teaching primer WIRED + made EDITABLE/SAVABLE — TWO deploys ✅ DEPLOYED-AND-VERIFIED 2026-06-02-d** end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`; director real-Chrome verdicts "pass all five" (Phase 3 part 2) + "pass" (Phase 3 part 3). `main` went `7ead4dc → 894563b → ef4a47c` (two clean ff-merges). **PLUS** the Workflow Graduation Continuity methodology + the P-56..P-62 roadmap-capture batch (three docs/tooling pushes to workflow-2). **A BUILD + DEPLOY + METHODOLOGY + CAPTURE session: TWO deploys, TWO Rule 9 deploy gates (both Yes; the pt3 deploy included a `prisma db push`), plus three docs/tooling pushes (NO Rule 9).**

**Session shape (primer wiring → editable primer → methodology → captures → end-of-session doc-batch):**

- **Phase 3 part 2 (`894563b`) — director "pass all five":** the primer rendered to a "Competitive Analysis Primer" Word `.docx` download in the Files box + added to the "Download all (.zip)" bundle + an "↡ Insert primer" editor button. NEW client dependency **`docx ^9.7.1`**. NEW pure helpers `renderPrimerToTipTapDoc` + `buildPrimerDynamicColumnLabels`; page-side `primer-render.ts` (`buildPrimerFromUrls` + `renderPrimerToDocxBlob`); `buildExportFilename` optional ext param; `RichTextEditor` `onEditorReady`. The primer TEXT was refreshed to cover all SEVEN Files-box files (the director flagged it stale vs 2026-06-02-c's three trimmed variants).
- **Phase 3 part 3 (`ef4a47c`) — director "pass":** an EDITABLE + SAVABLE primer — an "✎ Edit" rich-text modal (`PrimerEditorModal.tsx`) with **Save** + **Reset to default**; the saved version drives the .docx download AND the Insert button. NEW additive nullable `ComprehensiveCompetitorAnalysis.primerJson Json?` (`prisma db push` to prod succeeded, "already in sync", zero data loss) + a NEW endpoint `.../comprehensive-analysis/primer` (GET/PUT, null=reset) via a node:tested DI handler `handlers/comprehensive-analysis-primer-doc.ts` (owns ONLY `primerJson`; never clobbers `contentJson`; node:test-safe `Prisma.DbNull`); page-side `primer-render.ts` gained `tipTapToDocxBlob` + `resolveCurrentPrimer` (saved override → else generated) so download/insert/edit share ONE source.
- **Methodology (`a0339e8`):** HANDOFF_PROTOCOL Rule 33 (continuity primer + a one-paste `./catch-up-workflow <N>` per graduation) + DOCUMENTATION_ARCHITECTURE §5 Steps 7–8 + `docs/templates/WORKFLOW_PRIMER_TEMPLATE.md` + `docs/COMPETITION_SCRAPING_PRIMER.md` (W#2 first instance) + the `./catch-up-workflow` script (W#2 registered → `./catch-up-workflow 2`).
- **Captures (`e167952` P-56 + `59edc2d` P-57..P-62):** the NEW polish-backlog entries + the P-56 / P-61 / P-62 spec docs.
- **1 PENDING:** the end-of-session doc-batch commit (this doc-batch agent's output) — the Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY [unchanged]) + HANDOFF_PROTOCOL header bump (Rule 33 was committed in-session) + 1 Group B polish-item-spec (P-55) + a NEW §B 2026-06-02-d note in `docs/COMPETITION_SCRAPING_DESIGN.md`. **This doc-batch commit ff-merges to main (with the three docs/tooling commits) per the standard 3-push pattern.**

**TWO Rule 9 deploy gates — both director "Yes" (the pt3 gate authorized the `prisma db push`). The session repeatedly advanced via deploy-gate / question answers** (primer-text fix → editable primer → graduation methodology → the P-56..P-62 batch) — a smooth multi-pivot session; each new directive captured before acting per `feedback_no_fabricated_instructions`.

**Schema-change-in-flight flag NO at entry → flipped YES during Phase 3 part 3 (the `primerJson` column) → flipped YES→NO at the pt3 deploy push → NO at exit. NEXT session (P-56) = NO at entry.**

**ZERO open DEFERRED items at exit (Rule 26):** TaskList returned empty; all in-session tasks completed. P-56..P-62 are the documented roadmap continuation (P-56 = the (a.126) pick), NOT TaskList DEFERRED items.

**Baselines locked from this session:** root tsc clean (UNCHANGED) + extension tsc clean (UNCHANGED) + extension `npm test` = **910/910 UNCHANGED** (zero extension change this session) + src/lib `node:test` = **1353/1353** (+18 from 1335 — +3 primer pt2 [`renderPrimerToTipTapDoc` ×2 + `buildPrimerDynamicColumnLabels` ×1], +1 primer-text "without individual reviews" assertion, +14 primer-doc handler cases) + `npm run build` = **72 routes** (+1 from 71 — the NEW `comprehensive-analysis/primer` endpoint); Check 6 Playwright SKIPPED per Rule 27 (file-download + rich-text editor insert + .docx + modal = director real-Chrome verification — consistent with all prior P-55 sessions).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-02-d** (no top-tier slip — both deploys passed; the director verified both) capturing two observations: (a) **generated/templated content must be re-checked after related changes** — the primer wording (written 2026-06-02-b) was stale relative to 2026-06-02-c's three trimmed export variants; the director caught it; fixed before deploy + pinned with a test assertion; (b) **the session repeatedly advanced via deploy-gate / question answers** — the director used the gate/question answers to introduce NEW directives mid-flow; a healthy multi-pivot session. **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NO new memory file this session.**

**1 MODIFIED Group B polish-item-spec** — `docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md` (Phase 3 part 2 + part 3 ✅ DEPLOYED-AND-VERIFIED 2026-06-02-d; P-55 essentially CLOSED; the editable-primer + `primerJson` column + `/primer` endpoint + `resolveCurrentPrimer` recorded; §4 `.docx`-library open question RESOLVED — added `docx ^9.7.1`) + a NEW §B 2026-06-02-d note in `docs/COMPETITION_SCRAPING_DESIGN.md`. NEW (committed in-session): `docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` + `docs/templates/WORKFLOW_PRIMER_TEMPLATE.md` + `docs/COMPETITION_SCRAPING_PRIMER.md` + the P-56 / P-61 / P-62 specs. `docs/REVIEWS_PHASE_2_DESIGN.md` UNCHANGED.

**ROADMAP P-55 polish-backlog entry updated** (✅ ESSENTIALLY COMPLETE — Phase 3 shipped + verified) + the NEW P-56..P-62 entries + (a.125) CLOSED / (a.126) opens. **HANDOFF_PROTOCOL Rule 33 ADDED.** **DOCUMENTATION_ARCHITECTURE §5 Steps 7–8 added.**

**SIXTY-NINTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ONE additive destructive-class op — `prisma db push` for the additive nullable `ComprehensiveCompetitorAnalysis.primerJson Json?` column (authorized via the Phase 3 part 3 Rule 9 deploy gate; succeeded, "already in sync" on re-check, zero data loss; no `migrate reset`, no drop, no deletes outside normal build output). NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (P-56):** **NO schema change anticipated** — P-56 is an extension-side capture/DOM-timing fix (the Amazon Highlight-Terms flicker). The first action is a READ-ONLY diagnostic trace (`docs/p-20-trace-script.js` on a real Amazon PDP), not a write. If a build unexpectedly needs a field, run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod). A fresh extension sideload zip will be produced for real-Amazon verification — that is a normal build artifact, not a destructive op. No other Rule 8/9/29 triggers anticipated.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the P-55 + P-56 specs + the memory directory.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. P-56 (the Amazon Highlight-Terms flicker / the extension capture flow) is W#2-only. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch ff-merges to main): `main` and `workflow-2-competition-scraping` BOTH at `ef4a47c` (the editable-primer deploy) + the three docs/tooling commits (`a0339e8` + `e167952` + `59edc2d`) + the end-of-session doc-batch SHA. **Verify with `git log origin/main..HEAD --oneline` showing 0** (everything is on main after the doc-batch ff-merge); `git status` clean apart from historical untracked .zip + .html artifacts at repo root.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files; since this NEXT_SESSION.md references P-20 + P-43 + P-49 + P-50 + P-51 + P-52 + P-53 + P-54 + P-55 + P-56, read §2 + §3 of each at session start — ESPECIALLY P-56):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate) + Rule 14f (forced-picker mechanics) + Rule 9 (deploy gate) + Rule 18 + Rule 23 (Change Impact Audit) + Rule 24 (pre-capture search) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + **Rule 33 (workflow graduation continuity — NEW this session)** + §4 Step 4b extended template.
- **`docs/polish-item-specs/P-56-*.md`** — the SOURCE-OF-TRUTH for P-56. Read it fully: the symptom (Amazon Highlight Terms flicker blocking text selection for capture), the Rule 24 finding (prior P-14 + P-20 treatment whose real-Amazon verification was deferred), and the fix approach.
- **`docs/p-20-trace-script.js`** — the MutationObserver trace to re-run on a real Amazon PDP FIRST, to confirm whether the P-20 fingerprint short-circuit engages.
- **The prior P-20 + P-14 treatment** — read the as-shipped Amazon Highlight-Terms code in the extension (the fingerprint short-circuit that P-20 added) so you can interpret the trace output.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-02-d (this session — generated/templated content must be re-checked after related changes; the session advanced via deploy-gate answers) + §Entry 2026-06-02-c (the P-43 cwd-leak recurrence) + §Entry 2026-05-31 (the TOP-TIER SLIP — never act on an instruction that is not verbatim in a director message; honor explicit picker choices; restart on degraded tooling).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - **`feedback_plan_output_shape_before_building.md`** + **`feedback_no_fabricated_instructions.md`** — P-56 is a real-site timing fix; design it WITH the director BEFORE coding; act only on verbatim directives.
  - **`feedback_playwright_for_repeatable_walkthroughs.md`** — fire a Rule 14f picker before any 5+ step manual walkthrough or browser-context verification.
  - `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_default_to_recommendation.md` + `feedback_recommendation_style.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md` + `feedback_browser_first_ai_with_server_migration.md` + `feedback_exports_include_all_table_data.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; read §2 + §3 of each listed spec at session start — especially `docs/polish-item-specs/P-56-*.md` (the source-of-truth).** **This session is on `workflow-2-competition-scraping` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.126) = P-56 — fix the Amazon Highlight-Terms flicker that blocks text selection for capture):** On the real Amazon site, the "Highlight Terms" still flicker, which makes it hard to select text to capture. This is HIGH priority and resumes the P-20 real-Amazon verification that was deferred. **P-55 is essentially COMPLETE — do NOT continue P-55 unless I raise the absorbed P-53 on-page button.**

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: 0 — main and workflow-2 are both at ef4a47c + the three docs/tooling commits (a0339e8 + e167952 + 59edc2d) + the 2026-06-02-d doc-batch SHA; nothing is held back
```

If `git branch --show-current` shows `main`, run `./resume-workflow 2`.

**FIRST step (the diagnostic trace — BEFORE any fix design):** re-run the `docs/p-20-trace-script.js` MutationObserver trace on a REAL Amazon product page to confirm whether the P-20 fingerprint short-circuit actually engages on the live site (it was added to stop the highlight re-render churn, but its real-Amazon verification was deferred). Read the trace output WITH me. This tells us whether the flicker is the short-circuit failing to engage, a new mutation source the fingerprint doesn't cover, or something else. **Per `feedback_playwright_for_repeatable_walkthroughs`, fire a Rule 14f picker if the trace/verification becomes a 5+ step manual browser walkthrough.**

**Fix shape (design WITH the director BEFORE coding — do NOT code first):** once the trace tells us the mechanism, plan the fix WITH me per `feedback_plan_output_shape_before_building`. This is a real-site DOM-timing problem (MutationObserver / re-render churn), so the approach is a joint decision — likely options span (a) widening/strengthening the P-20 fingerprint short-circuit so it engages, (b) debouncing or gating the highlight re-apply against Amazon's own DOM churn, or (c) suppressing the highlight during an active text selection. Confirm the chosen shape before building.

**Test coverage decision:** the extension has its own `npm test` suite (910/910 at entry). Add extension unit coverage for any new pure helper (e.g. a fingerprint/debounce helper); the live DOM-timing behavior itself is verified via the director real-Amazon walkthrough (Check 6 Playwright stays SKIPPED per Rule 27 — extension/real-site visual judgment).

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (expect UNCHANGED)
- Extension tsc clean (expect UNCHANGED — but this IS extension work, so re-run after edits)
- Extension `npm test` ≥ 910 (entry 910; +N for any new fingerprint/debounce helper tests)
- src/lib `node:test` = 1353 (likely UNCHANGED — extension-side work; confirm)
- `npm run build` = 72 routes (likely UNCHANGED — no new PLOS route; confirm)
- Check 6 Playwright SKIPPED per Rule 27 (real-Amazon DOM-timing = director real-Chrome verification)
- **Run `npm run build` with an explicit absolute `cd /workspaces/brand-operations-hub` prefix** — the P-43 cwd-leak recurred recently; treat a route count of 0 as the cwd-leak tell-tale; this is especially important THIS session since you'll be `cd`-ing into the extension directory for the extension build + zip.

**Deploy mechanics:** P-56 is an EXTENSION change — it ships as a fresh sideload zip the director loads in Chrome, then real-Amazon verifies. Build the extension (`cd extensions/competition-scraping` for the extension build, then `cd /workspaces/brand-operations-hub` before the Next.js build) + produce a fresh `plos-extension-2026-06-0X-w2-...zip` at repo root. The PLOS-side deploy (if any) follows the standard Rule 9 gate + 3-push pattern; the extension zip itself is sideloaded, not deployed to vklf.com. Expect 1+ Rule 9 deploy gates if any PLOS-side change rides along; the extension zip + real-Amazon verification is the primary deliverable.

**Schema-change-in-flight flag:** **NO at entry**; no schema change anticipated for P-56 (extension-side DOM-timing fix). If a field is unexpectedly needed, audit + authorize WITH me first before any `prisma db push`.

**Group A docs to update at session end:** ROADMAP header bump + the P-56 entry status update + (a.126) status + CHAT_REGISTRY header bump (192nd session) + DOCUMENT_MANIFEST header + flags + the schema-change-in-flight transition + CORRECTIONS_LOG header (+ 1 NEW §Entry if anything notable) + HANDOFF_PROTOCOL header bump + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite.

**Group B docs to update at session end:** the P-56 spec (mark the fix shipped/verified + record the P-20 trace findings) + `docs/COMPETITION_SCRAPING_DESIGN.md` (a §B note if the capture-flow design materially changes) + `docs/REVIEWS_PHASE_2_DESIGN.md` (a §B note if the change touches the Reviews-extension capture path — likely not).

**Standing carry-overs into this session:**

- **(a.126) = P-56** — Amazon Highlight-Terms flicker blocks text selection for capture; resumes the deferred P-20 real-Amazon verification. **Run the p-20-trace FIRST; design the fix WITH me before coding; fresh extension zip + real-Amazon verification.**
- **P-57..P-62** — the NEW captures (delete-coverage gaps / Download-Extension-zip latest / DetailedUserGuide update / open-detail ↗ icon / extension default categories / the Workflow-11 surveillance card+page). Behind P-56.
- **P-53 Excel "Export Table"** — effectively absorbed by P-55; only an on-page button would remain (LOW).
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; single-session fix / palate-cleanser.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — now schedulable (P-54 + P-55 done); the NEW continuity primer + `./catch-up-workflow 2` mechanism support it; director's discretion.

---

## Why this pointer was written this way (debug aid)

- **(a.126) = P-56 is the PICK because P-55 is essentially complete and P-56 is the highest-priority open item.** P-55 Phases 1 + 2a + 2b-i + 2b-ii + the three trimmed variants + Phase 3 (primer .docx + Insert + editable/savable) are all shipped AND director-verified. P-56 is the only HIGH-severity open item (a real-Amazon bug blocking capture); P-57..P-62 are MEDIUM/LOW or future-workflow. No §4 Step 1c forced-picker was needed — P-56 is the obvious next unit.
- **The FIRST action is a diagnostic trace, NOT a fix.** P-20 already added a fingerprint short-circuit for this exact churn, but its real-Amazon verification was deferred — so before designing a new fix, confirm on a real Amazon PDP whether that short-circuit engages. The trace (`docs/p-20-trace-script.js`) is read-only and tells us the mechanism.
- **Design the fix WITH the director before coding.** Real-site DOM-timing fixes are easy to get wrong speculatively; this is a joint decision per `feedback_plan_output_shape_before_building` + the standing preference for the most-reliable approach.
- **This IS extension work** — re-run extension tsc + extension `npm test` after edits, and the deliverable is a fresh sideload zip + a real-Amazon verification, not a vklf.com deploy. Watch the P-43 cwd-leak when switching between the extension build and the Next.js build.
- **Schema-change-in-flight = NO at entry** — last session flipped YES briefly for the `primerJson` column and back to NO at the deploy push; P-56 is extension-side with no anticipated schema change.
- **Nothing is held back** — both P-55 deploys are on main, and the three docs/tooling commits ride this session's doc-batch ff-merge. Expect `git log origin/main..HEAD` = 0 at entry.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.126.alt1) P-56** (current PICK — pre-loaded above). Fix the Amazon Highlight-Terms flicker; run the p-20-trace first; design WITH the director; fresh extension zip + real-Amazon verification; on `workflow-2-competition-scraping`.
- **(a.126.alt2) P-58 Download-Extension-zip serves latest** (MEDIUM; ensures the in-app extension download always serves the newest build; on `workflow-2-competition-scraping`).
- **(a.126.alt3) P-57 fill the delete-coverage gaps** (reviews / videos / category-labels; MEDIUM; on `workflow-2-competition-scraping`).
- **(a.126.alt4) P-60 add the open-detail ↗ icon to the 3 analysis tables' Product Name column** (LOW; quick UI follow-up; on `workflow-2-competition-scraping`).
- **(a.126.alt5) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; quick palate-cleanser).
- **(a.126.alt6) W#2 graduation** (now schedulable; the continuity primer + `./catch-up-workflow 2` mechanism support it; director's discretion).
- **(a.126.alt7) P-50 Condition Pathology card** (single-session — add a NEW card to two card-array files; director already approved scope; quick palate-cleanser on `main`).
