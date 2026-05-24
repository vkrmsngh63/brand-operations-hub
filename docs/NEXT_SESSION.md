# Next session

**Written:** 2026-05-26 (`session_2026-05-26_p46-workstream-4-deploy-session-phase-4-verification-deferred` — end-of-session handoff after **W#2 polish P-46 Workstream 4 (Comprehensive Competitor Analysis page) ✅ DEPLOYED-PHASE-4-PENDING 2026-05-26 on vklf.com via `workflow-2-competition-scraping` → `main` ff-merge `cafd3ed..096a2ac` carrying 4 commits** (W4 S1 build `283d4d1` + W4 S1 doc-batch `8b30ab3` + W4 S2 build `5854eff` + W4 S2 doc-batch `096a2ac`). Pure deploy session of the W4 build sessions that landed cleanly at code level 2026-05-24-b + 2026-05-25; ff-merge fired against `origin/main` under ONE Rule 9 gate; Vercel auto-redeploy fired. **Phase-4 director real-Chrome verification DEFERRED to next session at director request** — full 10-step verification walkthrough drafted in-session + preserved verbatim below in the ## Launch prompt section so the next session can copy + execute it. **W4 status is now `✅ DEPLOYED-PHASE-4-PENDING` on vklf.com** — not yet ✅ DONE-AND-VERIFIED until Phase-4 PASS next session. **TWO additional pickers fired beyond the Rule 9 gate** — (1) Truncated-picker-response handling NEW informational Pattern; (2) Rule 27 Check 6 Playwright SKIP. **Schema-change-in-flight flag STAYS NO** — no schema work in W4 at all. Pre-deploy + post-merge /scoreboard both 5/5 GREEN at expected W4 S2 baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 783 src/lib UNCHANGED / 62 routes UNCHANGED; Check 6 SKIPPED per Rule 27). **Closes (a.83) RECOMMENDED-NEXT = P-46 Workstream 4 deploy session ✅ DEPLOYED-PHASE-4-PENDING 2026-05-26 on vklf.com**; **opens (a.84) RECOMMENDED-NEXT = P-46 Workstream 4 Phase-4 verification session** on `workflow-2-competition-scraping`.

---

## What we did this session (in plain terms)

Today was the **P-46 Workstream 4 deploy session** — a pure deploy session of the two W4 build sessions that landed cleanly at code level 2026-05-24-b (Session 1 — comprehensive-analysis page route + handler + editor + read view + navigation button) and 2026-05-25 (Session 2 — internal-hyperlink TipTap extension + Link-to-URL toolbar picker + url-reference-helpers). No new code was written this session — everything that just went live had already been written in the prior two sessions; today was about shipping it to vklf.com.

What happened, in plain terms:

- **Pre-deploy /scoreboard verification PASSED 5/5 GREEN** on `workflow-2-competition-scraping`. Same baselines as yesterday's W4 S2 close (root tsc clean / extension tsc clean / 558 ext tests / 783 src/lib tests / 62 routes). Check 6 Playwright was skipped per Rule 27 picker — director picked SKIP since the ff-merge bundle had zero `extensions/` source files (no extension dist changes to test) and the new W4 page surface has no existing Playwright spec coverage.
- **A truncated-picker-response moment.** At the Rule 9 deploy gate moment, director's first AskUserQuestion answer rendered as a truncated string "deploy now but defer any real wor" (no trailing "k" — most likely a UI rendering truncation, not a director typo). Claude did NOT silently interpret what "real wor[k]" meant; instead Claude fired a clarifying AskUserQuestion picker offering 4 disambiguation options. Director picked "Deploy now — but pause BEFORE the push to main" which is effectively identical to default Rule 9 behavior (the standard Rule 9 disposition is: pause + ask director + then push on Yes). **This validated a new informational Pattern: "Truncated picker response → fire clarifying picker, don't silently interpret"** — could become a feedback memory if it recurs.
- **The deploy push fired cleanly.** `git push origin main` fast-forwarded main from `ac45737` (the 2026-05-24 W3 fix-forward #5 SHA — unchanged since W3 deploy) to `096a2ac` (the W4 S2 doc-batch SHA from yesterday). The 4-commit fast-forward carried: `283d4d1` (W4 S1 build) + `8b30ab3` (W4 S1 doc-batch) + `5854eff` (W4 S2 build) + `096a2ac` (W4 S2 doc-batch).
- **Vercel auto-redeploy fired** after the main push. ~2-3 minute build + cache invalidation. The new Comprehensive Competitor Analysis page surface is now live on vklf.com.
- **Post-merge /scoreboard PASSED 5/5 GREEN** on `main` at the exact same baselines (no new tests, no new routes, no new dependencies — the ff-merge is a clean fast-forward of build commits that already had their tests in their build sessions).
- **Phase-4 director real-Chrome verification was DEFERRED to next session at director request.** Director's directive was: deploy + defer the Phase-4 verify. The 10-step verification walkthrough was drafted in-session (Claude wrote out the full Phase-4 sequence the next session must follow); director's request was to preserve the walkthrough verbatim in `docs/NEXT_SESSION.md` so the next session can copy + execute it without re-deriving the sequence.
- **TWO P-43 cwd-leak reproductions on Check 5** during /scoreboard execution — once on pre-deploy + once on post-merge. Both were caught immediately from the output content (the extension build output is structurally different from the Next.js build output — no `Route (app)` table) + recovered with the absolute `cd /workspaces/brand-operations-hub && npm run build` retry. This is the 5th+ reproduction of the P-43 cwd-leak Pattern class; a mechanical prevention candidate was flagged in CORRECTIONS_LOG §Entry 2026-05-26 (add absolute cd prefix to ALL Bash commands in `.claude/commands/scoreboard.md`, not just the extension-rooted Checks 2-3). NOT a top-tier slip — recovery was immediate + result was correct.
- **Schema-change-in-flight flag STAYS NO** the entire session. No `prisma db push`. The W4 deploy ships UI + route-handler code consuming the already-live `ComprehensiveCompetitorAnalysis` Prisma model from W1's 2026-05-24 schema (already deployed via 2026-05-23-c W2 deploy).

**The deploy session landed cleanly + decoupled cleanly from the Phase-4 verify session at director's request.** The "Phase-4 verification fix-forward cascade in a single deploy session" Pattern (memorialized 2026-05-24 W3 deploy) describes what happens IF Phase-4 surfaces issues in-session; today validated the alternate branch — when director defers Phase-4 to next session, the deploy session is a single-deploy with zero fix-forwards; the Phase-4 verification becomes its own next session (with its own potential fix-forward cascade if issues surface there).

## What we'll do next session (in plain terms)

Next session is the **P-46 Workstream 4 Phase-4 verification session** — director performs the 10-step real-Chrome verification walkthrough drafted today on the live vklf.com site.

What the Phase-4 verification session covers:

- **10-step verification walkthrough** (PRESERVED VERBATIM in the ## Launch prompt section below — Claude must copy + execute this verbatim, not re-derive it). The walkthrough covers: navigate from the Competition Data page → click the standalone "→ Comprehensive Competitor Analysis" button → page loads + shows empty-state OR existing content → toggle edit mode → type body content into the rich-text editor → insert a `#url/<urlId>` shorthand via the "Link to URL" toolbar dropdown → toggle Done (read mode) → click the rendered hyperlink → confirm navigation to the URL detail page → use the URL detail page's back-button to return → toggle edit mode one more time + confirm last-edited timestamp updated. Cross-platform exception applies — the new page is per-Project not per-platform, so director picks any one platform.
- **Director real-Chrome execution** — director runs the 10-step walkthrough live on vklf.com in real Chrome on Mac while Claude observes director's narration + screenshots OR pasted observations of each step's outcome.
- **PASS or fix-forward branch.** If all 10 steps PASS clean → W4 closes ✅ DONE-AND-VERIFIED 2026-05-XX on vklf.com; new (a.85) opens for P-46 Workstream 5 (Extension URL save form additions + manual Reviews entry) first build session. If any step surfaces an issue → fix-forward cascade per the 2026-05-24 W3 deploy Pattern (each fix-forward = its own build commit + its own Rule 9 gate + its own Phase-4 reverify cycle).
- **End-of-session doc-batch** — header bumps across the standard 7 Group A docs + 1 Group B doc (`COMPETITION_DATA_V2_DESIGN.md` new §B entry capturing Phase-4 outcome). If W4 closes ✅ DONE-AND-VERIFIED, ROADMAP P-46 entry flips WS#4 to ✅ DONE-AND-VERIFIED + (a.84) closed + new (a.85) opened for WS#5 build session #1.

**Schema-change-in-flight flag** STAYS **NO** at the Phase-4 session start (no schema work in W4 Phase-4 verify at all; potential fix-forwards may also stay schema-clean since the W4 surface is UI-only).

**After W4 closes ✅ DONE-AND-VERIFIED,** P-46 Workstream 5 (Extension form additions + manual Reviews entry) is the LAST remaining workstream of P-46 — ~1-2 sessions per §C.5 adding Type / Description-1 / Description-2 / Price fields to the extension URL save form + manual Reviews entry tweaks on vklf.com based on real-Chrome usage. Then a Workstream 5 deploy closes the P-46 arc end-to-end.

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-26 (W4 ✅ DEPLOYED-PHASE-4-PENDING; Phase-4 verify NEXT):

- **P-46 Workstream 4 Phase-4 verification session** (NEXT). 1 session. Director runs the 10-step real-Chrome verification walkthrough (preserved verbatim below) on vklf.com. If PASS → W4 closes ✅ DONE-AND-VERIFIED. If issues surface → fix-forward cascade per the W3-deploy Pattern.
- **P-46 Workstream 5 (Extension form additions + manual Reviews entry).** ~1-2 sessions per §C.5. Adds Type / Description-1 / Description-2 / Price fields to the extension URL save form. One deploy session ends this workstream + closes the P-46 arc.
- **P-47 Shadow DOM refactor (LOW; AFTER P-46).** ~2-3 sessions. Replaces the 80-event-listener band-aid from P-45 Build #2's Issue 2 fix with proper Shadow DOM isolation. LOW priority since band-aid works empirically.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions. Current two-captures workaround works fine. May be reduced in urgency now that W#2 + W#3 + W#4 surfaces are deployed.
- **P-27 Bug #9 (Amazon hover-preview deeper-walk) + Bug #15 (Ebay native-controls quirk) — DEFERRED LOW.** May be obsolete now that P-46 redesigned the URL detail page + Competition Data table surfaces they live in.
- **P-43 mechanical prevention candidate (LOW informational).** Add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md` (specifically Check 5's `npm run build` + route-count grep), not just the extension-rooted Checks 2-3. Not blocking any workstream; can happen any time as a polish-detour.
- **W#2 graduation** after P-46 + P-47 + P-26 ship. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent; can happen any time.

---

**For:** the next Claude Code session — **P-46 Workstream 4 Phase-4 verification session** (estimated ~30-90 min depending on whether Phase-4 surfaces any fix-forwards: pre-build doc reads ~5-10 min + branch state verify ~2 min + director runs 10-step verification walkthrough live on vklf.com ~15-30 min + 0-N fix-forwards ~10-30 min each + end-of-session doc-batch ~15-20 min). Per Rule 23 Change Impact Audit: **VERIFICATION SESSION** (no new code unless fix-forwards land; pure director-driven verification of the W4 deploy + zero-or-N fix-forward cycles). **Schema-change-in-flight flag stays NO** (no transition; no schema work in W4 Phase-4 verify at all). **Rule 9 triggers planned this session: ZERO MINIMUM + 0-N for any fix-forward pushes.** **Pushes planned per `feedback_approval_scope_per_decision_unit.md`:** 1 minimum (end-of-session doc-batch push to `origin/workflow-2-competition-scraping`) + 0-N fix-forward pushes if Phase-4 issues surface + 1 end-of-session ff-merge push to `origin/main` for doc-batch if W4 closes ✅ DONE-AND-VERIFIED.

---

## Status of today's session

**W#2 polish P-46 Workstream 4 (Comprehensive Competitor Analysis page) ✅ DEPLOYED-PHASE-4-PENDING 2026-05-26 on vklf.com** via ff-merge `cafd3ed..096a2ac` carrying 4 commits (W4 S1 build `283d4d1` + W4 S1 doc-batch `8b30ab3` + W4 S2 build `5854eff` + W4 S2 doc-batch `096a2ac`). Pure deploy session of the W4 build sessions that landed cleanly at code level 2026-05-24-b + 2026-05-25. Phase-4 director real-Chrome verification DEFERRED to next session at director request — 10-step walkthrough drafted + preserved verbatim below.

**Session shape (DEPLOY SESSION — single-branch entry then ff-merge to main; ONE Rule 9 gate fired; THREE pushes planned):**

- Pre-build reads at session start (read `docs/COMPETITION_DATA_V2_DESIGN.md` §C.4 + §B 2026-05-24-b + §B 2026-05-25 + ROADMAP P-46 entry).
- Rule 14f session-start confirmation NOT FIRED (next-session task unambiguous + director gave clear deploy-now directive).
- Pre-deploy /scoreboard on `workflow-2-competition-scraping` — 5/5 GREEN at W4 S2 baselines.
- Rule 27 Check 6 Playwright SKIP picker — director picked SKIP.
- Rule 9 gate moment — truncated-picker-response disambiguated via clarifying picker; director picked "Deploy now — but pause BEFORE the push to main" (effectively default Rule 9 Yes).
- `git push origin main` executed cleanly; main fast-forwarded `ac45737..096a2ac` (4 commits).
- Vercel auto-redeploy fired.
- Post-merge /scoreboard on main — 5/5 GREEN at same baselines.
- Phase-4 director real-Chrome verification DEFERRED to next session at director request.
- 10-step verification walkthrough drafted in-session + preserved verbatim below.
- End-of-session doc-batch covers the 8-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG with new §Entry 2026-05-26 + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION + the new §B 2026-05-26 entry on COMPETITION_DATA_V2_DESIGN.md).
- THREE pushes this session: 1 deploy push to `origin/main` (DONE under Rule 9 Yes at `096a2ac`) + 1 end-of-session doc-batch push to `origin/workflow-2-competition-scraping` + 1 end-of-session ff-merge + push to `origin/main` for doc-batch (operationally adjacent to deploy push per `feedback_approval_scope_per_decision_unit.md` — does NOT re-invoke Rule 9).

**§4 Step 1c forced-picker NOT FIRED** — next-session task unambiguous (Phase-4 verification of W4 deploy; the 10-step walkthrough is verbatim-preserved below).

**ZERO new DEFERRED items at session end (Rule 26)** — Tasks #1-#7 + #9 completed in-session + Task #8 (Fix-forward Phase-4 issues) deleted when director deferred Phase-4 + Task #10 `DEFERRED: P-46 W4 Phase-4 real-Chrome verification` created + closed in this same end-of-session pass after NEXT_SESSION.md + ROADMAP P-46 entry both received the destination capture.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry this session — the P-46 Workstream 4 DEPLOY §Entry 2026-05-26** capturing (a) W4 ✅ DEPLOYED-PHASE-4-PENDING outcome; (b) NEW informational Pattern "Truncated picker response → fire clarifying picker, don't silently interpret"; (c) LOW informational dual P-43 cwd-leak reproductions on Check 5 + mechanical prevention candidate identified; (d) calibration data point — W4 deploy landed without fix-forwards (Phase-4 deferred so no fix-forward cascade possible this session).

**TWENTY-EIGHTH end-of-session run under the Rule 30 + §4 Step 4b template** (sequence prior to today: 2026-05-21-b → 2026-05-21-c → 2026-05-21-d → 2026-05-22 → 2026-05-22-b → 2026-05-21 → 2026-05-22-c → 2026-05-22-d → 2026-05-22-e → 2026-05-22-f → 2026-05-22-g → 2026-05-22-h → 2026-05-22-i → 2026-05-23 → 2026-05-24 → 2026-05-25 → 2026-05-26 → 2026-05-27 → 2026-05-28 → 2026-05-23-b → 2026-05-23-c → 2026-05-23-d → 2026-05-23-e → 2026-05-23-f → 2026-05-24 → 2026-05-24-b → 2026-05-25 → today 2026-05-26). The 3 plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; the P-46 Workstream 4 Phase-4 verification session begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at today's end-of-session doc-batch commit. `main` should be at the same commit as `workflow-2-competition-scraping` (both branches even at the doc-batch SHA, since today's deploy ff-merged the W4 commits to main + the end-of-session ff-merge ships the doc-batch to main as well). Verify with `git log main..HEAD --oneline` — should show ZERO commits ahead (both branches even). The W4 deploy has ALREADY happened — next session does NOT deploy again unless fix-forwards land.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-46 Workstream 4 Phase-4 verification session, on `workflow-2-competition-scraping`.** Closes **(a.84) RECOMMENDED-NEXT**. This is the Phase-4 verification session of Workstream 4 — director performs the 10-step real-Chrome verification walkthrough drafted in the prior session (preserved verbatim below) on the live vklf.com Comprehensive Competitor Analysis page. If all 10 steps PASS → W4 closes ✅ DONE-AND-VERIFIED + new (a.85) opens for P-46 Workstream 5 first build session. If any issue surfaces → fix-forward cascade per the 2026-05-24 W3 deploy Pattern (each fix-forward = own build commit + own Rule 9 gate + own Phase-4 reverify cycle).

VERIFICATION session — ZERO Rule 9 gates planned minimum + 0-N for any fix-forward pushes. No new schema work. No new npm dependencies. Phase-4 verifies that the W4 deploy from 2026-05-26 (the 4 W4 commits now live on vklf.com) works end-to-end in real Chrome.

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify both branches' SHA relationships with `git log main..HEAD --oneline` — should show ZERO commits ahead (both branches even at today's end-of-session doc-batch SHA after the ff-merge that ships this doc-batch to main).

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or Phase-4 verification).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-46 polish-backlog entry (the Workstream sub-status grid showing WS#4 ✅ DEPLOYED-PHASE-4-PENDING 2026-05-26 on vklf.com via ff-merge `cafd3ed..096a2ac` + (a.84) RECOMMENDED-NEXT = Phase-4 verify — the binding input for today's verification mechanics).
- **`docs/COMPETITION_DATA_V2_DESIGN.md`** with focus on **§C.4 Workstream 4 implementation outline** + **§A.4 + §A.5 (the design decisions Sessions 1-2 consumed)** + **§B 2026-05-24-b (W4 S1's closing entry)** + **§B 2026-05-25 (W4 S2's closing entry)** + **§B 2026-05-26 (today's deploy session closing entry)**.
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (only fires this session for any fix-forward push) + Rule 14f (will fire at most ONCE at session-start to confirm Phase-4 verify is the right scope) + Rule 18 (§A frozen; §B new entry for the Phase-4 verify session if there are findings or fix-forwards) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit — VERIFICATION SESSION) + Rule 25 (Multi-Workflow — main push only for fix-forwards) + Rule 26 (DEFERRED items registry) + Rule 27 (Playwright SKIP condition continues to apply) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `feedback_approval_scope_per_decision_unit.md` (push count + ping-pong + doc-batch push pattern).
- The "Phase-4 verification fix-forward cascade in a single deploy session" Pattern from CORRECTIONS_LOG §Entry 2026-05-24 (in case fix-forwards land today).

**Task shape (P-46 Workstream 4 Phase-4 verification session):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or verification. Cover: what we'll do in the session (Phase-4 director real-Chrome verification of the W4 deploy from 2026-05-26 via the 10-step walkthrough preserved below), schema-change-in-flight flag stays NO, ZERO Rule 9 gates planned minimum + 0-N for fix-forwards.

2. **Pre-build reads** — execute the pre-build read list above. ~5-10 minutes.

3. **Branch state verify** — `git branch --show-current` (should be `workflow-2-competition-scraping`) + `git log main..HEAD --oneline` (should show 0 commits — both branches even at the doc-batch SHA).

4. **Rule 14f session-start confirmation (if needed)** — confirm Phase-4 verification is the right scope this session (no pre-verification concerns). Director picks; recommended path per `feedback_recommendation_style.md` is proceed-to-verification.

5. **Phase-4 director real-Chrome verification — execute the 10-step walkthrough VERBATIM** (preserved below; do NOT re-derive or paraphrase).

---

### 10-step Phase-4 verification walkthrough (PRESERVED VERBATIM from 2026-05-26 deploy session — director must follow each step in order; Claude observes director's narration + screenshots OR pasted observations of each step's outcome)

**Pre-flight setup:**

- Open Chrome on Mac.
- Open vklf.com.
- Sign in if needed.
- Pick any one Project in your Project list — the W4 page is per-Project not per-platform, so cross-platform exception applies (pick any single Project rather than walking all 7 platforms).

**Step 1 — Navigate from Competition Data to the new Comprehensive Competitor Analysis page.**

Click into the chosen Project. Navigate to Competition Data (`/projects/<projectId>/competition-scraping`). Confirm you see the redesigned Competition Data page from the W3 deploy 2026-05-24 — horizontal `ColumnVisibilityBar` at the top combining platform filters + per-column show/hide toggles + click-to-edit cells + 17 columns + sticky table header + per-row "↗" Open button + drag-to-reorder rows + font-size stepper in the table toolbar. **Above the ColumnVisibilityBar at the top of the page**, look for a standalone "→ Comprehensive Competitor Analysis" navigation button row. **Click that button.** Expected: navigation to `/projects/<projectId>/competition-scraping/comprehensive-analysis/`. **Verify:** the URL bar shows the new path + the page loads without 404 or 501 error.

**Step 2 — Confirm initial page state (empty or existing content).**

The new Comprehensive Competitor Analysis page should load. If you've never written anything for this Project, you'll see an empty-state placeholder (something like "No analysis yet — click Edit to begin"). If you have written content before (which is unlikely for a fresh deploy but possible if any earlier session test-saved content), the existing rich-text content will render in read mode. **Verify:** the page renders cleanly, with a "← Competition Data" back-button visible at the top + an "Edit" toggle button somewhere on the page (likely top-right or top of the editor surface) + a last-edited timestamp footer at the bottom (the timestamp will be blank or show "Never" if the page is empty; otherwise it shows the last write time).

**Step 3 — Toggle into edit mode.**

Click the "Edit" button. Expected: the page transitions from read-mode to edit-mode. The static rendered content is replaced by an editable TipTap rich-text editor with a toolbar at the top. The toolbar should show (per §A.5 + W4 S1's variant='full' toolbar): H1 / H2 / H3 heading buttons + Bold + Italic + Underline + bullet-list + numbered-list + Link + Code block + the new **"Link to URL"** dropdown picker (added in W4 S2). The "Edit" button should now be a "Done" button. **Verify:** the editor mounts without errors + the toolbar shows all expected affordances + cursor lands in the editor surface ready for typing.

**Step 4 — Type body content.**

Click into the editor body. Type a short test paragraph: e.g., **"This is a test comprehensive analysis. Key competitors include the following:"** + press Enter. Now apply some formatting: select the word "Key" + click the Bold button + select "competitors" + click the Italic button. Make a heading: press Enter to start a new line + click the H2 button + type **"Key competitor URLs"** + press Enter. **Verify:** the typed text appears in real-time + Bold + Italic styling applies as expected + H2 heading renders larger than body text.

**Step 5 — Insert an internal hyperlink via the "Link to URL" toolbar dropdown.**

On a fresh line, click the **"Link to URL"** dropdown button in the toolbar. Expected: a dropdown panel opens showing a list of URLs from the current Project's competitor URL list (the same URLs that appear as rows in the Competition Data table). A search box at the top of the dropdown lets you filter case-insensitively. **Type a few characters** of a URL's product name OR seller name OR raw URL — the list filters live as you type. **Click any URL row** in the filtered list. Expected: the dropdown closes + a hyperlink is inserted at your cursor position. The hyperlink's visible text is a sensible default (product name OR seller name OR raw URL, depending on what's available). The hyperlink is styled in **blue underlined text** + has a small **🔗 emoji prefix** in front of it. **Verify:** all of the above + the cursor lands just after the inserted hyperlink ready for more typing.

**Step 6 — Toggle Done (transition to read mode).**

Click the "Done" button (the same button that was "Edit" before). Expected: the page transitions back from edit-mode to read-mode. The editor is replaced by a static rich-text rendering of the same content + the last-edited timestamp at the bottom of the page updates to the current time. **Verify:** the content you just typed renders cleanly in read mode (Bold + Italic + H2 all visually distinct + the 🔗 prefix is still in front of the hyperlink + the hyperlink is still blue underlined).

**Step 7 — Click the rendered hyperlink.**

In read mode, click the rendered hyperlink (the one with the 🔗 prefix). Expected: navigation to the matching URL detail page at `/projects/<projectId>/competition-scraping/url/<urlId>/`. The URL detail page shows the per-URL detail surface from the W2 deploy 2026-05-23-c (with the W2 Session 5 structural fields + Scraping Status toggle + bidirectional mirror with the Competition Data table's Status column). **Verify:** navigation works + the URL detail page loads + the URL detail surface shows the correct URL (the one you clicked).

**Step 8 — Navigate back via the back-button.**

On the URL detail page, click the "← Competition Data" back-button at the top of the page (this is the existing W2 affordance). Expected: navigation back to the Competition Data page (`/projects/<projectId>/competition-scraping`). Now click the standalone "→ Comprehensive Competitor Analysis" button again. Expected: you land back on the new W4 page (`/projects/<projectId>/competition-scraping/comprehensive-analysis/`) + your test content from Steps 4-5 is still there in read mode (because it was saved automatically when you clicked Done in Step 6).

**Step 9 — Toggle into edit mode one more time + verify the editor mounts.**

Click "Edit" again. Expected: editor mounts cleanly + your existing test content is loaded into the editor as editable rich-text + the hyperlink with the 🔗 prefix is still styled correctly + clicking inside the hyperlink shows the standard TipTap Link mark interaction (edit/remove the link). Now click "Done" again without making any changes. Expected: page returns to read mode + the last-edited timestamp at the bottom of the page should update to the current time (since clicking Done triggers a save lifecycle even if no content changed — confirm this updates on every Done click OR document if it doesn't).

**Step 10 — Test the in-line `#url/<urlId>` shorthand syntax (advanced; optional).**

This step tests the "manual shorthand entry" path (the alternative to using the toolbar Link-to-URL picker). Click "Edit" one more time. On a fresh line in the editor, type literally: **the hash character followed by the word url followed by a slash followed by any valid urlId from the URL list, then press space**. Expected: the editor should recognize the shorthand pattern + the typed text should auto-convert to a hyperlink (via the same UrlReferenceExtension that handles the click interception). The result should look identical to the hyperlink you inserted via the picker in Step 5 (blue underlined + 🔗 prefix). **Verify:** this auto-conversion works AND clicking the auto-created hyperlink (after toggling Done) navigates correctly per Step 7. If auto-conversion does NOT happen, that's a known limitation per §C.4's specification — the click interception works on `#url/<urlId>` hrefs regardless of HOW the href was inserted; the toolbar picker is the primary insertion affordance. Document the outcome either way.

**How to report back:**

For each step (1-10), tell Claude in plain language: PASS / FAIL / PARTIAL. If FAIL or PARTIAL, describe what you saw vs. what was expected. Screenshots or pasted observations are welcome. Claude will collate the report + either close W4 as ✅ DONE-AND-VERIFIED (if all 10 PASS) or initiate a fix-forward cascade (if any FAIL or PARTIAL).

**Cross-platform note:** the new Comprehensive Competitor Analysis page is per-Project, not per-platform. Pick any single platform (Amazon OR Ebay OR Walmart OR Etsy OR Aliexpress OR Macys OR Bestbuy) for the verification — there's no need to walk all 7 platforms since the page does not vary by platform.

---

6. **If all 10 steps PASS:** close W4 as ✅ DONE-AND-VERIFIED 2026-05-XX on vklf.com. End-of-session doc-batch flips ROADMAP P-46 entry WS#4 to ✅ DONE-AND-VERIFIED + closes (a.84) + opens (a.85) for P-46 Workstream 5 first build session. New §B 2026-05-XX entry on `docs/COMPETITION_DATA_V2_DESIGN.md` captures the Phase-4 PASS narrative.

7. **If any step FAILs or PARTIALs:** initiate fix-forward cascade per the "Phase-4 verification fix-forward cascade in a single deploy session" Pattern memorialized 2026-05-24 (W3 deploy). Each fix-forward = own build commit + own Rule 9 gate + own Phase-4 reverify cycle. End-of-session doc-batch captures all fix-forwards + the final outcome.

8. **End-of-session doc-batch** covers ROADMAP (header bump + P-46 entry WS#4 status update based on outcome) + CHAT_REGISTRY (header bump — 151st Claude Code session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header bump + new §Entry if fix-forwards landed OR informational observation if Phase-4 PASS clean) + NEXT_SESSION.md (rewritten for P-46 Workstream 5 first build session if W4 closes, OR P-46 Workstream 4 next fix-forward session if fix-forwards are still landing) + HANDOFF_PROTOCOL (header bump only — no new rules expected) + CLAUDE_CODE_STARTER (header bump only) + `docs/COMPETITION_DATA_V2_DESIGN.md` (NEW §B entry capturing Phase-4 outcome). Multi-push pattern depends on outcome (1 push minimum if PASS clean; 1-5+ if fix-forwards land).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** any picker that fires — surface the recommended path + default to it if director defers.

**Per Rule 14a tightening from 2026-05-24:** if any step's expected behavior feels under-specified in the walkthrough above, surface the gap to director via Rule 14f picker BEFORE running the step.

**Schema-change-in-flight flag:** STAYS **NO** (no schema work in Phase-4 verify at all; any fix-forwards likely stay schema-clean since W4 surface is UI-only).

---

## Pre-session notes (offline steps for director between sessions)

**Required offline step BEFORE the next P-46 Workstream 4 Phase-4 verification session:** none. The W4 deploy has already happened; Vercel auto-redeploy has already fired; director's involvement is just the 10-step real-Chrome verification walkthrough above.

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking the P-46 Workstream 4 Phase-4 verification session at all — can happen any time. Director-independent.

**Optional offline reading for director:** the 10-step Phase-4 verification walkthrough above in the ## Launch prompt section (~5-minute skim) — gives director a preview of what the verification session will cover step-by-step. Worth scanning before the session starts so director knows the sequence + can have Chrome + vklf.com open ready.

**Pre-session setup (informational — Claude will handle in-session):** the Workstream 4 Phase-4 verification session begins on `workflow-2-competition-scraping`; director's involvement is the standard go-ahead after Step 7b plain-terms summary + the live 10-step real-Chrome verification walkthrough.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (no rebases, no force pushes, no `git reset --hard`, no `git branch -D`). Any fix-forwards would be additive build commits + ff-merge pushes, not destructive ops.

**Rule 9 triggers planned this session: ZERO MINIMUM** — no `git push origin main` planned at session start since the deploy already happened in the prior session. Rule 9 gates fire ONLY if Phase-4 surfaces issues + fix-forward pushes to main are needed (per the "Phase-4 verification fix-forward cascade" Pattern, this could be 0-N additional gates).

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits a 🚨 alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any verification work.

---

## Why this pointer was written this way (debug aid)

Today's session was the **W4 deploy session** for the new Comprehensive Competitor Analysis page. The session ran cleanly through the deploy: pre-deploy /scoreboard PASSED → truncated-picker-response disambiguated → Rule 9 gate Yes → `git push origin main` → main fast-forwarded `ac45737..096a2ac` (4 commits) → Vercel auto-redeploy → post-merge /scoreboard PASSED. **At that point director directed deferring the Phase-4 director real-Chrome verification to next session.** Director's request was to preserve the 10-step verification walkthrough verbatim in `docs/NEXT_SESSION.md` so the next session can copy + execute it without re-deriving the sequence — this pointer file is the result of that directive.

The natural next-session task per (a.84) RECOMMENDED-NEXT is **Workstream 4 Phase-4 verification session** — director performs the 10-step real-Chrome verification walkthrough on the live vklf.com Comprehensive Competitor Analysis page. The 10-step walkthrough is preserved verbatim in the ## Launch prompt section above.

- **(Recommended)** Workstream 4 Phase-4 verification session — director runs the 10-step walkthrough. Recommended because (a) the W4 deploy has already happened + is awaiting verification; (b) deferring further would let the W4 surface drift out of director's attention before being closed; (c) the walkthrough is already drafted + ready to execute.

The shape of the Phase-4 verification session is **director executes 10 steps + reports PASS/FAIL/PARTIAL + 0-N fix-forwards + ONE end-of-session doc-batch + 1-N pushes**.

**After Workstream 4 closes ✅ DONE-AND-VERIFIED on vklf.com, Workstream 5 (Extension form additions + manual Reviews entry) is the LAST remaining workstream of P-46** — ~1-2 sessions. Then P-46 closes ✅ end-to-end. Then P-47 + P-26 + DEFERRED P-27 bugs (or absorbed obsolete) before W#2 graduation. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).

**Alternate next-session candidates if director shifts priorities at session start (after W4 deploy + before W4 Phase-4 verify):**

- **Defer Workstream 4 Phase-4 verify + start P-46 Workstream 5 (Extension form additions) build session.** NOT recommended — W4 is deployed-but-not-yet-verified; closing W4's Phase-4 first keeps the implementation arc tight + ensures the deployed surface is verified before director context shifts to W#5.
- **Defer Workstream 4 Phase-4 verify + start P-47 Shadow DOM refactor.** NOT recommended — P-47 is LOW priority (band-aid works empirically) AND Phase-4-verifying W4 first closes the implementation arc tight.
- **Defer Workstream 4 Phase-4 verify + work on the P-43 mechanical prevention candidate (add absolute cd prefix to ALL scoreboard.md Bash commands).** NOT recommended — P-43 mechanical prevention is LOW informational (5th+ reproduction stable; each one recovers in ~30 seconds); Phase-4-verifying W4 first is higher value.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time. Director-independent.

Check `ROADMAP.md` for the canonical state. Check `docs/COMPETITION_DATA_V2_DESIGN.md` §C.4 + §A.4 + §A.5 + §B 2026-05-24-b + §B 2026-05-25 + §B 2026-05-26 for the W4 Phase-4 verification session's binding context.
