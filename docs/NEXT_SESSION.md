# Next session

**Written:** 2026-05-23-f (`session_2026-05-23-f_p46-workstream-3-session-3-column-resize-drag-reorder-font-size` — end-of-session handoff after **W#2 polish P-46 Workstream 3 (Competition Data table redesign) Session 3 ✅ DONE-AT-CODE-LEVEL 2026-05-23-f on `workflow-2-competition-scraping`** via build commit `7ad7eff` — 6 files +781/-178. Third + final build session of the P-46 Workstream 3 implementation arc (Session 3 of 3-4 estimated per §C.3 — landed inside the estimated window). **Headline outcome:** the Competition Data table now carries the full §C.3 personalization affordance set — column visibility (Session 1) + click-to-edit cells + 17 columns (Session 2) + column resize + drag-to-reorder rows + table-wide font-size stepper (today). Workstream 3 implementation arc COMPLETE at code level across Sessions 1-3. All three new controls (column resize / row reorder / font-size change) route through Session 1's `prefsTimerRef` 500 ms debounced PUT lifecycle. Three new npm dependencies landed (`@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` — first runtime drag-and-drop library on this layer; ~30 KB gzipped one-time cost). NEW reusable Pattern memorialized **"Shared debounced-mutation lifecycle reused across an N-control surface"** (pairs with W2 S5's "Field-allowlist subset extraction" Pattern as another example of foundation-session primitive becoming Pattern when reused by N=2+ subsequent sessions). Schema-change-in-flight flag STAYS NO (consumes existing W1 schema; all 3 fields `columnWidths` / `rowOrder` / `fontSize` are already in `UserTablePreferences`). **Closes (a.79) RECOMMENDED-NEXT = P-46 Workstream 3 Session 3.** **Opens (a.80) RECOMMENDED-NEXT = P-46 Workstream 3 deploy session** on `workflow-2-competition-scraping` — Phase-4 deploy ff-merging `workflow-2-competition-scraping` → `main` (carries Sessions 1+2+3's build commits + the three doc-batch commits as one fast-forward, 6 commits total) → Vercel auto-redeploy → ping-pong sync → Phase-4 director real-Chrome cross-platform verify across the Competition Data table surfaces.

---

## What we did this session (in plain terms)

Today was the **third + final build session of Workstream 3** — the Competition Data table redesign. Session 1 (2026-05-23-d) landed the foundation (per-user preferences plumbing + horizontal `ColumnVisibilityBar` + removed the left-side sidebar). Session 2 (2026-05-23-e) added click-to-edit cells + 8 new data columns + the per-row "↗" Open button. Today's session bundled the last three §C.3 controls on top of that foundation.

What happened, in plain terms:

- **Column resize landed.** Drag the right edge of any column header to widen or narrow it. Widths are clamped between 60px and 600px and persist per-user-per-project via the same `UserTablePreferences` row Sessions 1-2 wired. Per-pointermove updates make the table re-render width live during the drag (no waiting for pointer-up to see the new width).
- **Drag-to-reorder rows landed.** A new ⋮⋮ handle appears on the left edge of every row. Grab it + drag a row up or down to reorder. The new order persists per-user-per-project via `UserTablePreferences.rowOrder`. When a custom order is in effect, the table sort-mode flips to 'manual'; clicking any column header still works to re-sort by that column (which abandons the manual order). One subtlety: if a row is currently filtered out by the search box, its position in the saved rowOrder is preserved when you reorder visible rows — so the filtered-out row reappears in its original saved position when the filter clears.
- **Table-wide font size stepper landed.** A new − / Npt / + stepper appears at the right of the horizontal bar. Click − to shrink one point; click + to grow one point. Bounds clamped 10pt-24pt. Every cell in the table scales together. Persists per-user-per-project via `UserTablePreferences.fontSize`.
- **All three controls share one network write.** A burst of drag events from any control — say resizing one column and dragging a row to reorder in quick succession — coalesces into ONE network write on idle, via the 500 ms debounced PUT lifecycle Session 1 wired. The latest mutation always wins. This is the "Shared debounced-mutation lifecycle reused across an N-control surface" Pattern memorialized today.
- **A reusable Pattern was memorialized.** When a foundation session wires a debounced PUT lifecycle for ONE field of a shared per-user prefs row, the next session can land N additional controls without re-deriving the batching logic by routing every new control through the SAME timer ref + the SAME flush callback. Today's session validated this Pattern by routing 3 new controls through Session 1's `prefsTimerRef` + `flushPrefsPut`, producing zero additional debounce code beyond a one-line handler per control. Pairs with W2 S5's "Field-allowlist subset extraction" Pattern as another example of "foundation-session primitive becomes Pattern when reused by N=2+ subsequent sessions."
- **Three new npm dependencies landed.** `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` — first time the Competition Data table layer takes a runtime drag-and-drop library. Bundle size +~30 KB gzipped one-time cost. The @dnd-kit family chosen as the "most thorough/reliable" default — modern React-first API, pointer-event based, accessibility built-in, MIT license, actively maintained.
- **All 5 /scoreboard checks GREEN at unchanged baselines.** Root tsc clean / extension tsc clean / 558 ext tests UNCHANGED / 744 src/lib tests UNCHANGED (no new server-side code; UI-only session per pointer expectation) / 61 routes UNCHANGED (no new routes; the 3 fields all hit the existing table-preferences PUT route Session 1 shipped).
- **One LOW informational re-reproduction.** The P-43 cwd-leak class re-reproduced ONCE during /scoreboard Check 5 (sixth reproduction overall; same Pattern as five prior; caught + recovered in ~30 seconds with the absolute-path template form). Reinforces that template hardening protects verbatim-template-read pathways but NOT Claude's parallel-Bash inline shortcuts.
- **Calibration data point:** Session 3 of 3-4 landed cleanly within the bundled scope. Workstream 3 came in at the LOWER end of the 3-4 estimate (3 sessions). All three Session 1-3 bundles fit cleanly thanks to good upstream specccing (W1's schema covered everything; Session 2 had EditableField primitives to parallel; Session 3 had Session 1's debounced PUT to reuse).

**Workstream 3's implementation arc lands complete at code level.** Next session deploys it to vklf.com.

## What we'll do next session (in plain terms)

Next session is the **P-46 Workstream 3 deploy session** — Phase-4 deploy to vklf.com via ff-merge to main + Vercel auto-redeploy + director real-Chrome cross-platform verify across the Competition Data table surfaces.

What the Workstream 3 deploy session covers:

- **Pre-deploy /scoreboard** (5 checks GREEN at the unchanged baselines today established: root tsc clean / ext tsc clean / 558 ext / 744 src/lib / 61 routes; Check 6 Playwright SKIPPED via Rule 27 picker since there's no test-only `extensions/` file in the bundle this time — it's all `src/app/projects/` UI changes).
- **Rule 9 director-Yes gate** via AskUserQuestion for `git push origin main` — director picks "Deploy now (recommended)" per the canonical Phase-4 shape.
- **ff-merge** `workflow-2-competition-scraping` → `main` — carries 6 commits as one fast-forward: Session 1 build `d846a97` + Session 1 doc-batch `3d6c97b` + Session 2 build `899afd4` + Session 2 doc-batch `b35bbff` + Session 3 build `7ad7eff` + Session 3 doc-batch (the SHA after today's push).
- **Post-merge /scoreboard** to verify tree-identity preserved through ff (5/5 GREEN on main).
- **Push to origin/main** — triggers Vercel auto-redeploy.
- **Ping-pong sync** — push `workflow-2-competition-scraping` to its origin so both branches end up at the same SHA per the canonical 3-push pattern.
- **Phase-4 director real-Chrome cross-platform verify** across the Competition Data table surfaces — column resize works on column headers; drag-to-reorder works on row drag handles; font size stepper adjusts text; all three persist across page reloads + across devices (sign in on a second browser/device to confirm the saved prefs round-trip). Director may verify on one platform (Amazon) or all 7 — director's call.

After this deploy lands clean, Workstream 3 graduates ✅ DONE-AND-VERIFIED on vklf.com and the next session (a.81) opens for **P-46 Workstream 4 (Comprehensive Competitor Analysis page) first build session** per Q10's locked sequencing — ~2-3 sessions covering rich-text editor integration on a new page + hyperlinks back to URL detail pages + edit/view-mode toggle + "Competition Data" back-button.

**Schema-change-in-flight flag** enters NO at deploy session start; the deploy doesn't change the flag (all 3 fields already shipped in W1's 2026-05-24 schema + already deployed via the 2026-05-23-c W2 deploy; today's deploy just adds UI that reads + writes the existing columns).

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-23-f (Workstream 3 Session 3 ✅ DONE-AT-CODE-LEVEL; Workstream 3 implementation arc COMPLETE at code level across Sessions 1-3):

- **P-46 Workstream 3 deploy session.** ff-merge 6 commits to main + Vercel auto-redeploy + Phase-4 director real-Chrome verify across the Competition Data table surfaces. Closes Workstream 3 ✅ DONE-AND-VERIFIED on vklf.com.
- **P-46 Workstream 4 (Comprehensive Competitor Analysis page).** ~2-3 sessions. NEW page hosting per-Project TipTap rich-text doc with hyperlinks back to URL detail pages + edit-mode toggle + back-button. Consumes the same `RichTextEditor` wrapper Workstream 2 Session 1 built (using the `variant='full'` branch).
- **P-46 Workstream 5 (Extension form additions + manual Reviews entry).** ~1-2 sessions. Adds Type / Description-1 / Description-2 / Price fields to the extension URL save form so they get captured at extension time + sent to PLOS server on save. Includes vklf.com-side manual Reviews entry tweaks based on real-Chrome usage. One deploy session ends this workstream + closes the P-46 arc.
- **P-47 Shadow DOM refactor (LOW; AFTER P-46).** ~2-3 sessions. Replaces the 80-event-listener band-aid from P-45 Build #2's Issue 2 fix with proper Shadow DOM isolation. LOW priority since band-aid works empirically.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions. Current two-captures workaround works fine. May be reduced in urgency now that Workstream 2's vklf.com-side image upload affordances are deployed.
- **P-27 Bug #9 (Amazon hover-preview deeper-walk) + Bug #15 (Ebay native-controls quirk) — DEFERRED LOW.** May obsolete now that P-46 redesigned the URL detail page surface they live in.
- **W#2 graduation** after P-46 + P-47 + P-26 ship. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent; can happen any time.

---

**For:** the next Claude Code session — **P-46 Workstream 3 deploy session** (estimated ~1.5-2 hours: pre-build doc reads ~20 min + pre-deploy /scoreboard ~10 min + Rule 9 director gate ~5 min + ff-merge + post-merge /scoreboard + push + ping-pong sync ~15 min + Vercel auto-redeploy wait ~3-5 min + Phase-4 director real-Chrome verify ~20-40 min + end-of-session doc-batch ~30 min). Per Rule 23 Change Impact Audit: **SCHEMA-AWARE CODE DEPLOY** — schema already shipped (W1 + already-deployed via 2026-05-23-c W2 deploy); today's deploy ships the UI that consumes existing schema columns (`columnWidths` / `rowOrder` / `fontSize` on `UserTablePreferences`). **Schema-change-in-flight flag enters NO** (carrying from Session 3 — STAYS NO at deploy completion; no transition). **Rule 9 triggers planned this session: ONE** (`git push origin main` for the deploy — director-Yes gate via AskUserQuestion picker). **Pushes planned per `feedback_approval_scope_per_decision_unit.md`:** TWO actual pushes + likely ONE no-op — (1) `git push origin main <range>` (deploy push under Rule 9 gate); (2) ping-pong sync attempt to `origin/workflow-2-competition-scraping` (likely NO-OP since workflow-2 will already be at the doc-batch SHA from today's push); (3) end-of-session doc-batch push to `origin/workflow-2-competition-scraping` (does NOT re-invoke Rule 9 — operationally adjacent to the deploy push per `feedback_approval_scope_per_decision_unit.md`).

---

## Status of today's session

**W#2 polish P-46 Workstream 3 (Competition Data table redesign) Session 3 ✅ DONE-AT-CODE-LEVEL 2026-05-23-f on `workflow-2-competition-scraping`** via build commit `7ad7eff` (6 files +781/-178). Third + final build session of the P-46 Workstream 3 implementation arc (Session 3 of 3-4 estimated per §C.3 — landed inside the estimated window). Pure UI-only build session — no deploy, no schema change, no new server-side code, no fresh extension zip; three new npm runtime dependencies brought in.

**Session shape (build session — single-branch; no main push):**

- Pre-build reads at session start (read `docs/COMPETITION_DATA_V2_DESIGN.md` §C.3 + §A.3 + §B 2026-05-23-d + §B 2026-05-23-e for the binding inputs).
- Rule 14f session-start scope-pick: director picked "Bundle all 3 controls (recommended)" over partial-bundle alternatives.
- Implementation: MODIFIED `url-table-columns.ts` (+defaults + constants + `resolveColumnWidth`) + MODIFIED `CompetitionScrapingViewer.tsx` (+3 state slices + 3 handlers all sharing `prefsTimerRef`) + MODIFIED `ColumnVisibilityBar.tsx` (+ font-size stepper group) + MODIFIED `UrlTable.tsx` (major rewrite +629/-178 — DndContext + SortableContext + SortableUrlRow + ColumnResizeHandle + colgroup + tableLayout:'fixed' + effectiveFontSize) + MODIFIED `package.json` (+3 @dnd-kit deps) + MODIFIED `package-lock.json` (auto-updated).
- /scoreboard verification: all 5 checks GREEN at baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 744 src/lib UNCHANGED / 61 routes UNCHANGED); Check 6 Playwright SKIPPED per non-deploy-session convention.
- End-of-session doc-batch covers the 8-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG with new §Entry 2026-05-23-f + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION + the new §B 2026-05-23-f entry on COMPETITION_DATA_V2_DESIGN.md).
- ONE push at end-of-session per the canonical pattern in `feedback_approval_scope_per_decision_unit.md` (build commit + doc-batch commit pushed together to `origin/workflow-2-competition-scraping`).

**§4 Step 1c forced-picker NOT FIRED** — next-session task unambiguous per §C.3 Workstream 3 completion + the "Multi-session workstream deploy gate timing" reusable Pattern memorialized 2026-05-23-c (deploy session lands after the LAST build session that contains user-visible UI).

**ZERO new DEFERRED items at session end (Rule 26)** — all 5 in-session TaskCreate tasks completed cleanly.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry this session — the P-46 Workstream 3 Session 3 closing §Entry 2026-05-23-f** capturing (a) successful application of W1's prefs plumbing pattern at N=3 controls (validates the new Pattern); (b) the NEW "Shared debounced-mutation lifecycle reused across an N-control surface" reusable Pattern memorialization; (c) P-43 cwd-leak class SIXTH re-reproduction (LOW informational); (d) calibration data point.

**TWENTY-FOURTH end-of-session run under the Rule 30 + §4 Step 4b template** (sequence prior to today: 2026-05-21-b → 2026-05-21-c → 2026-05-21-d → 2026-05-22 → 2026-05-22-b → 2026-05-21 → 2026-05-22-c → 2026-05-22-d → 2026-05-22-e → 2026-05-22-f → 2026-05-22-g → 2026-05-22-h → 2026-05-22-i → 2026-05-23 → 2026-05-24 → 2026-05-25 → 2026-05-26 → 2026-05-27 → 2026-05-28 → 2026-05-23-b → 2026-05-23-c → 2026-05-23-d → 2026-05-23-e → today). The 3 plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; the P-46 Workstream 3 deploy begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at today's end-of-session doc-batch commit (the commit that lands when the parent pushes this NEXT_SESSION.md after build commit `7ad7eff`). `main` remains at `9969427` (the 2026-05-23-c Workstream 2 deploy SHA — unchanged since then). So at the start of the deploy session, `workflow-2-competition-scraping` is AHEAD of `main` by **6 commits** — Session 1 build `d846a97` + Session 1 doc-batch `3d6c97b` + Session 2 build `899afd4` + Session 2 doc-batch `b35bbff` + Session 3 build `7ad7eff` + Session 3 doc-batch (today's SHA after push). Verify with `git log main..HEAD --oneline` — should show exactly those 6 commits.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-46 Workstream 3 deploy session, on `workflow-2-competition-scraping` then ff-merged to `main` then ping-ponged back.** Closes **(a.80) RECOMMENDED-NEXT**. This is the deploy session that ships Workstream 3's three sessions (foundation prefs plumbing + click-to-edit + 17 columns + column resize + drag-reorder + font-size stepper) to vklf.com as one ff-merge.

DEPLOY session — Rule 9 director-Yes gate fires ONCE for `git push origin main`. No new code expected. No new schema (the 3 fields `columnWidths` / `rowOrder` / `fontSize` on `UserTablePreferences` have been live on Supabase since W1's 2026-05-24 `prisma db push` + already deployed via the 2026-05-23-c W2 deploy; today's deploy adds the UI that consumes them).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify both branches' SHA relationships with `git log main..HEAD --oneline` — should show exactly 6 commits (Session 1 build `d846a97` + Session 1 doc-batch `3d6c97b` + Session 2 build `899afd4` + Session 2 doc-batch `b35bbff` + Session 3 build `7ad7eff` + Session 3 doc-batch).

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-deploy read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or implementation).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-46 polish-backlog entry (the Workstream sub-status grid showing WS#3 Sessions 1-3 of 3-4 ✅ DONE-AT-CODE-LEVEL + WORKSTREAM 3 DEPLOY SESSION NEXT per (a.80) — the binding input for today's scope).
- **`docs/COMPETITION_DATA_V2_DESIGN.md`** with focus on **§C.3 Workstream 3 implementation outline (all 3 sessions complete at code level + deploy NEXT)** + **§B 2026-05-23-f (today's Session 3 closing entry capturing the column resize + drag-reorder + font-size stepper architecture being deployed)** + **§B 2026-05-23-e (Session 2 closing entry)** + **§B 2026-05-23-d (Session 1 closing entry)** + **§B 2026-05-23-c (the W2 deploy closing entry capturing the "Multi-session workstream deploy gate timing" reusable Pattern this deploy follows)**.
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (the deploy gate + AskUserQuestion picker shape) + Rule 14f (will NOT fire in deploy session unless director shifts priorities at session start) + Rule 18 (§A of `docs/COMPETITION_DATA_V2_DESIGN.md` stays frozen; §B 2026-05-XX is the new append for this deploy session) + Rule 21 + Rule 22 (pre-deploy read list) + Rule 23 (Change Impact Audit — SCHEMA-AWARE CODE DEPLOY — schema already shipped + already deployed; today ships the UI that consumes it) + Rule 25 (Multi-Workflow — `workflow-2-competition-scraping` + `main` both move; ping-pong sync at end) + Rule 26 (DEFERRED items registry) + Rule 27 (Playwright forced-picker — SKIPPED per Rule 27 since no `extensions/` source file is in the ff-merge bundle this time) + Rule 30 (Session bookends) + §4 Step 4b extended template.

**Task shape (P-46 Workstream 3 deploy session):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or implementation. Cover: what we'll do in the session (Workstream 3 deploy — Phase-4 ff-merge `workflow-2-competition-scraping` → `main` carrying 6 commits as one fast-forward + Vercel auto-redeploy + Phase-4 director real-Chrome verify across the Competition Data table surfaces), the schema-change-in-flight flag stays NO (no transition; schema already live), the ONE Rule 9 gate planned for `git push origin main`, the TWO pushes + ONE likely no-op planned.

2. **Pre-deploy reads** — execute the pre-deploy read list above. ~20 minutes.

3. **Phase 1 — pre-deploy /scoreboard** — all 5 checks must GREEN at the exact baselines today established (root tsc clean / ext tsc clean / 558 ext / 744 src/lib / 61 routes); Check 6 Playwright SKIPPED via Rule 27 picker since no `extensions/` source file is in the ff-merge bundle.

4. **Phase 2 — Rule 9 director-Yes gate** via AskUserQuestion picker for `git push origin main`. Recommended: "Deploy now (recommended)." Director picks.

5. **Phase 3 — ff-merge + post-merge /scoreboard + push** — `git checkout main && git merge --ff-only workflow-2-competition-scraping` (carries 6 commits as one fast-forward); re-run /scoreboard on main to verify tree-identity preserved through ff (all 5 GREEN expected); `git push origin main`; Vercel auto-redeploy fires (wait ~3-5 min for it to land); ping-pong sync `git checkout workflow-2-competition-scraping && git push origin workflow-2-competition-scraping` (likely NO-OP since workflow-2 is already at the doc-batch SHA from today's push).

6. **Phase 4 — director real-Chrome cross-platform verify** — director loads the live Competition Data page on vklf.com in real Chrome + verifies (1) column resize works (drag right edge of any column header; widths persist on page reload; widths persist across devices when director signs in elsewhere); (2) drag-to-reorder works (grab the ⋮⋮ handle on the left edge of any row; reorder; persist across reload + devices); (3) font-size stepper works (− / Npt / + at right of horizontal bar; bounds clamped 10pt-24pt; persist across reload + devices). Director may verify on one platform (Amazon) or all 7 — director's call.

7. **End-of-session doc-batch** covers ROADMAP (header bump + P-46 entry annotated with Workstream 3 ✅ DONE-AND-VERIFIED 2026-05-23-X on vklf.com via ff-merge + (a.80) closed + new (a.81) opened for P-46 Workstream 4 first build session) + CHAT_REGISTRY (header bump — 147th Claude Code session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header bump + new §Entry capturing Workstream 3 deploy outcome + any Phase-4 sub-observations) + NEXT_SESSION.md (rewritten for P-46 Workstream 4 first build session) + HANDOFF_PROTOCOL (header bump only — no new rules expected) + CLAUDE_CODE_STARTER (header bump only) + `docs/COMPETITION_DATA_V2_DESIGN.md` (NEW §B entry capturing Workstream 3 deploy outcome + Phase-4 verification narrative + Pattern continuation). **TWO actual pushes + ONE likely no-op** per the canonical 3-push pattern.

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** any picker that fires (Rule 9 deploy gate + Rule 27 Playwright picker) — surface the recommended path + default to it if director defers.

**Schema-change-in-flight flag:** STAYS **NO** (carrying from Session 3 — the deploy doesn't change the flag; schema columns already shipped + already deployed; today's deploy just adds UI that consumes them).

---

## Pre-session notes (offline steps for director between sessions)

**Required offline step BEFORE the next P-46 Workstream 3 deploy session:** none. All infrastructure landed in prior sessions; the deploy is pure orchestration.

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking the P-46 Workstream 3 deploy at all — can happen any time. Director-independent.

**Optional offline reading for director:** `docs/COMPETITION_DATA_V2_DESIGN.md` §C.3 Workstream 3 outline (~2-minute skim) + §B 2026-05-23-f (today's Session 3 closing entry; captures the column resize + drag-reorder + font-size stepper architecture + the new "Shared debounced-mutation lifecycle" Pattern). Worth scanning before the deploy session if director wants context for Phase-4 verification.

**Pre-session setup (informational — Claude will handle in-session):** the Workstream 3 deploy begins on `workflow-2-competition-scraping`; director's involvement is the standard go-ahead after Step 7b plain-terms summary + the Rule 9 director-Yes gate via AskUserQuestion + Phase-4 real-Chrome verification.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (no rebases, no force pushes, no `git reset --hard`, no `git branch -D`).

**Rule 9 triggers planned this session: ONE** — `git push origin main` for the deploy (director-Yes gate via AskUserQuestion picker; recommended path "Deploy now"). NO `prisma db push` (schema already shipped + already deployed); NO `git reset --hard`; NO `git push --force`; NO `git branch -D`; NO `rm -rf`; NO SQL DELETE/DROP/TRUNCATE planned.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits a 🚨 alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any implementation work.

---

## Why this pointer was written this way (debug aid)

Today's session was the **third + final build session of P-46 Workstream 3** — the Competition Data table redesign. The session ran cleanly: pre-build reads (~30 min) → Rule 14f session-start scope-pick (bundle-all-3 recommended; director picked) → implementation (~120-150 min including the @dnd-kit integration + the SortableUrlRow + ColumnResizeHandle sub-components + the rowOrder preservation semantics for filtered-out rows) → /scoreboard 5/5 GREEN at baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 744 src/lib UNCHANGED / 61 routes UNCHANGED) → end-of-session doc-batch (~30 min covering the 8-doc bundle). The bundled scope landed without scope creep; the @dnd-kit family integrated cleanly without surprises. The new "Shared debounced-mutation lifecycle" Pattern memorialization makes Sessions 1-3's foundation→reuse cycle explicit and reusable beyond P-46.

The natural next-session task per the "Multi-session workstream deploy gate timing" Pattern (memorialized 2026-05-23-c) is the **Workstream 3 deploy session** — deploy lands after the LAST build session that contains user-visible UI, which today's Session 3 is:

- **(Recommended)** Workstream 3 deploy session — Phase-4 ff-merge `workflow-2-competition-scraping` → `main` carrying 6 commits as one fast-forward (Session 1 build + Session 1 doc-batch + Session 2 build + Session 2 doc-batch + Session 3 build + Session 3 doc-batch) + Vercel auto-redeploy + ping-pong sync + Phase-4 director real-Chrome cross-platform verify across the Competition Data table surfaces. Recommended because (a) Sessions 1-3 are now COMPLETE at code level; (b) the "Multi-session workstream deploy gate timing" Pattern says deploy after the LAST build session, not after each build session; (c) all UI surfaces are in place for Phase-4 verification.

The shape of the Workstream 3 deploy is **pure orchestration with ONE Rule 9 gate** — no new code; pre-deploy /scoreboard → Rule 9 director-Yes gate via AskUserQuestion → ff-merge → post-merge /scoreboard → push origin main → Vercel auto-redeploy → ping-pong sync → Phase-4 director real-Chrome verify → end-of-session doc-batch → TWO actual pushes + ONE likely no-op.

**After the Workstream 3 deploy lands clean + Phase-4 6/6 surfaces PASS, Workstream 4 (Comprehensive Competitor Analysis page) begins next.** ~2-3 sessions covering the rich-text editor integration on a new page + hyperlink-to-URL-detail-page wiring + edit/view-mode toggle + back-button. Then Workstream 5 (Extension form additions + manual Reviews entry). Then P-46 closes ✅ end-to-end. Then P-47 + P-26 + DEFERRED P-27 bugs (or absorbed obsolete) before W#2 graduation.

**Alternate next-session candidates if director shifts priorities at session start (after Workstream 3 Session 3 + before deploy):**

- **Defer the Workstream 3 deploy + add a Workstream 3 Session 4 to land a polish item or additional control.** NOT recommended — Sessions 1-3 cover all §C.3 deliverables; no spec'd Session 4 work remaining; the 3-4 estimate range was for "if Sessions 1-3 underdeliver"; they didn't.
- **Defer the Workstream 3 deploy + start P-47 Shadow DOM refactor.** NOT recommended — P-47 is LOW priority (band-aid works empirically) AND sequencing-wise the design doc explicitly noted Shadow DOM should wait until P-46 implementation fully lands; deploying W3 first means W3's three sessions become user-visible value sooner.
- **Defer the Workstream 3 deploy + start Workstream 4 (Comprehensive Competitor Analysis page).** NOT recommended — the "Multi-session workstream deploy gate timing" Pattern argues for deploying W3 first so director can verify the W3 UI on vklf.com before W4 building begins (W4's hyperlinks back to URL detail pages depend on the W3 Competition Data table being in its deployed shape).
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time. Director-independent.
- **A polish-detour ahead of the Workstream 3 deploy if director wants pre-deploy infrastructure work.** No obvious candidate this time — the operational substrate is hardened across 3 layers (P-42 backup-memory hook + P-43 absolute-paths discipline + P-44 wxt build/zip wrappers); Workstream 3 Sessions 1-3 landed clean so there's no new substrate work surfaced. If director picks this path, surface the open polish landscape as a Rule 14f forced-picker.

Check `ROADMAP.md` for the canonical state. Check `docs/COMPETITION_DATA_V2_DESIGN.md` §C.3 + §A.2 + §A.3 + §A.7 + §A.8 + §B 2026-05-24 through 2026-05-23-f for Workstream 3's binding scope + the 10 prior closing entries spanning Workstream 1 + W2 Sessions 1-5 + the W2 deploy + W3 Sessions 1-3.
