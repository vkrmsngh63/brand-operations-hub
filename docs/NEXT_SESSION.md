# Next session

**Written:** 2026-05-23-c (`session_2026-05-23-c_p46-workstream-2-deploy-session` — end-of-session handoff after **W#2 polish P-46 Workstream 2 (URL detail page redesign) SHIPPED + DEPLOYED + REAL-CHROME-VERIFIED across all 6 surfaces on vklf.com 2026-05-23-c via `workflow-2-competition-scraping` → `main` ff-merge `783abf4..9969427` (49 files +7504/-477 — 13 commits ff'd as one fast-forward carrying Workstream 1's 2026-05-24 schema commits + Sessions 1-5's UI/route commits from 2026-05-25 through 2026-05-23-b)**. Pure orchestration deploy session — no new code. **Headline outcome: Workstream 2 ✅ DONE-AND-VERIFIED 2026-05-23-c end-to-end on vklf.com after Phase-4 director real-Chrome cross-platform verification ALL 6 SURFACES PASS clean with zero caveats — Workstream 1 also closes ✅ DONE-AND-VERIFIED 2026-05-23-c in the same ff-merge.** Schema-change-in-flight flag FLIPPED YES → NO at deploy completion. **Closes (a.76) RECOMMENDED-NEXT = P-46 Workstream 2 deploy session.** **Opens (a.77) RECOMMENDED-NEXT = P-46 Workstream 3 (Competition Data table redesign) first build session** on `workflow-2-competition-scraping` per Q10's locked sequencing — ~3-4 sessions covering ~12 new columns + click-to-edit on every cell + resizable widths + drag-reorder rows + show/hide toggles + adjustable font + cross-device-synced UserTablePreferences.

---

## What we did this session (in plain terms)

Today was the **Workstream 2 deploy session** — the one session that ships the entire Workstream 1 + 2 implementation arc (the schema database changes + 5 sessions of user-interface and route-handler work) live to the production website at vklf.com. There was no new code today; this session was pure orchestration: pre-deploy verification → director approval gate → fast-forward merge to main → Vercel auto-redeploy → real-Chrome cross-platform walkthrough of all 6 surfaces director cares about.

What happened, in plain terms:

- **Pre-deploy verification ran clean** — the standard 5-check scoreboard (root code-typecheck / extension code-typecheck / 558 extension tests / 692 server tests / 61 routes) all GREEN at the exact baselines set by yesterday's Session 5; the optional Playwright run was skipped because the deploy doesn't touch the extension runtime.
- **Director approved the deploy push.** A single yes-or-no picker fired before `git push origin main`; director picked "Deploy now".
- **The fast-forward merge to main carried 13 commits as one bundle** — Workstream 1's schema build commit + 5 UI build commits (Sessions 1-5) + 6 doc-batch commits + 1 design-session doc-batch. 49 files changed; +7504 lines added; -477 lines removed. Vercel auto-redeploy fired the moment main moved.
- **Ping-pong sync was a no-op** — the workflow-2-competition-scraping branch was already at the same point as main because yesterday's Session 5 doc-batch push had left both branches even. So `git push origin workflow-2-competition-scraping` returned "Everything up-to-date" with no work to do.
- **Phase-4 director real-Chrome cross-platform verification: ALL 6 SURFACES PASS clean with zero caveats.** Director walked through all six surfaces on vklf.com in a non-cached browser session: (1) Captured Text section with per-item Analysis editor — PASS; (2) Captured Image section same shape — PASS; (3) Captured Video section same shape — PASS; (4) Captured Reviews section with manual-add modal and 1-5 star picker — PASS; (5) URL-level affordances (the 4 new structural text fields Type+Description-1+Description-2+Price + Scraping Status toggle + Overall Competitor Analysis box + Sizes/Options UI gone) — PASS; (6) Competition Data table Status pill column bidirectional mirror — PASS. Director reported "all surfaces pass" with zero caveats — the cleanest end-of-workstream verification in any P-46 session.
- **The schema-change-in-flight flag flipped back to NO.** Workstream 1's schema (3 new tables + 8 new columns on the existing `CompetitorUrl` table + 1 new JSON column on each of the 3 capture tables + 1 new `ScrapingStatus` enum) has been live on the Supabase database since 2026-05-24, but only the production code that reads + writes those columns went live today. The flag stays NO until the next schema migration arrives (which may not be for several sessions — Workstream 3 may or may not need additional schema columns; TBD).
- **One new informational corrections-log entry landed** — the P-46 Workstream 2 DEPLOY CLOSING §Entry, which captures the deploy outcome + a new reusable pattern called "Multi-session workstream deploy gate timing" (which says: when a workstream spans multiple build sessions, the deploy should land AFTER the last UI build session, not after the schema build session, for three concrete reasons captured in the §Entry body) + two low-severity informational observations (the P-43 cwd-leak class re-reproduced twice during scoreboard runs, caught + recovered both times; and the pointer-file written yesterday had an off-by-one on the main-tip SHA — it said `ee8c79d` but actual main was `783abf4` from yesterday's doc-batch SHA — the 13-commit ff-merge count was still correct; deploy proceeded cleanly). No top-level corrections-tier slip occurred.
- **Calibration data point worth surfacing:** Workstream 2 came in at the top end of the 3-5 sessions estimate (5 build sessions). Combined with Workstream 1's UNDER-estimate (1 session vs. 2-3 planned), the total Workstream 1+2 spend is 7 sessions across 6 build + 1 deploy vs. 4-8 estimated. Right on plan. Useful data point for sizing Workstream 3 next session — if §C.3 is similarly well-specced, expect 3-4 build sessions + 1 deploy session = 4-5 total.

**Workstream 2 is complete end-to-end on vklf.com.** Sessions 1-5 built; today's deploy shipped. Schema-change-in-flight flag NO. The next session begins Workstream 3 — Competition Data table redesign.

## What we'll do next session (in plain terms)

Next session is the **P-46 Workstream 3 first build session** — the Competition Data table redesign. This is a NEW build arc — not a continuation of Workstream 2.

What Workstream 3 covers (per §C.3 of the design doc):

- **~12 new columns** added to the Competition Data table (the table at the top of the Competition Scraping page that lists all the competitor URLs in a project).
- **Click-to-edit on every cell** — director can edit any cell value by clicking it (spreadsheet-style feel; Tab/Enter saves; Escape cancels). The Session 5 `EditableEnumField<T>` segmented-control component plus the `EditableTextField` shell are the foundation here.
- **Resizable column widths** — director can drag column edges to resize; preferences persist across devices via the `UserTablePreferences` Prisma model already shipped in Workstream 1.
- **Drag-to-reorder rows** — director can reorder rows (useful for arranging competitors by priority or grouping); row order persists across devices.
- **Per-column show/hide toggles** — director can hide columns they don't need; visibility preferences persist across devices.
- **Adjustable font size** — director can scale the table font size for visual ergonomics; font-size preference persists across devices.
- **Horizontal checkbox bar at the top** — combines platform filters (Amazon / Ebay / Walmart / Etsy) with per-column show/hide controls in one streamlined header bar (replaces the current left-side platform navigation).
- **Cross-device-synced user preferences** — all of the above persist via the `UserTablePreferences` Prisma model from Workstream 1 (the model is in place but the user-facing settings UI hasn't been built; Workstream 3 builds it).

The first Workstream 3 build session will likely tackle the foundational structure changes — the 12 new columns + the click-to-edit foundation reusing Session 5's `EditableEnumField<T>` segmented-control component + the four memorialized extraction-shape Patterns from Workstream 2 (PerItemAnalysisBox extraction / OverallAnalysisBox extraction / Per-record handler DI-seam precedent extension / Field-allowlist subset extraction). Subsequent sessions add resizable widths + drag-reorder + show/hide toggles + adjustable font + cross-device sync.

A Rule 14f forced-picker may fire at the session start if multiple §C.3 sub-scopes are reasonable first-session candidates; director picks. Per `feedback_default_to_recommendation.md` if there's only one obvious recommendation, the sub-picker is skipped.

**Schema-change-in-flight flag** enters NO; may flip back to YES during Workstream 3 if new schema columns surface beyond what Workstream 1 already shipped. TBD — the `UserTablePreferences` table is already created in Workstream 1; whether new columns are needed depends on the column shape changes Workstream 3 introduces. Default expectation: stays NO (Workstream 3 is primarily UI/route work consuming existing schema).

No deploy in the first Workstream 3 build session — Workstream 3 follows the same multi-session shape as Workstream 2: ~3-4 build sessions then one deploy session at the end (per the new "Multi-session workstream deploy gate timing" Pattern memorialized today).

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-23-c (Workstream 2 deploy ✅ DONE-AND-VERIFIED):

- **P-46 Workstream 3 (Competition Data table redesign).** ~3-4 sessions. Just enumerated above.
- **P-46 Workstream 4 (Comprehensive Competitor Analysis page).** ~2-3 sessions. NEW page hosting per-Project TipTap rich-text doc with hyperlinks back to URL detail pages + edit-mode toggle + back-button. Consumes the same `RichTextEditor` wrapper Session 1 built (using the `variant='full'` branch).
- **P-46 Workstream 5 (Extension form additions + manual Reviews entry).** ~1-2 sessions. Adds Type / Description-1 / Description-2 / Price fields to the extension URL save form so they get captured at extension time + sent to PLOS server on save. Includes the vklf.com-side manual Reviews entry form (Workstream 2 already shipped the entry modal — this workstream may add tweaks based on real-Chrome usage). One deploy session ends this workstream + closes the P-46 arc.
- **P-47 Shadow DOM refactor (LOW; AFTER P-46).** ~2-3 sessions. Replaces the 80-event-listener band-aid from P-45 Build #2's Issue 2 fix with proper Shadow DOM isolation. LOW priority since band-aid works empirically.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions. Current two-captures workaround works fine. May be reduced in urgency now that Workstream 2's vklf.com-side image upload affordances are deployed (director can now upload images directly without below-fold capture).
- **P-27 Bug #9 (Amazon hover-preview deeper-walk) + Bug #15 (Ebay native-controls quirk) — DEFERRED LOW.** May obsolete now that P-46 redesigned the URL detail page surface they live in (Workstream 2 deployed today).
- **W#2 graduation** after P-46 + P-47 + P-26 ship. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent; can happen any time.

---

**For:** the next Claude Code session — **P-46 Workstream 3 first build session** (estimated ~2.5-3 hours: pre-build doc reads ~30 min + Rule 14f session-start scope-pick if multiple §C.3 sub-scopes are candidates ~10 min + implementation ~90-120 min + /scoreboard verification ~10 min + end-of-session doc-batch ~30 min). Per Rule 23 Change Impact Audit: **UI-only build session** (no schema changes expected; consumes existing Workstream 1 schema columns + the `UserTablePreferences` Prisma model already shipped). **Schema-change-in-flight flag enters NO** (just flipped YES → NO at today's deploy completion); **expected to stay NO** through Workstream 3 (revisit if a new schema column surfaces during planning). **Rule 9 triggers planned this session: ZERO** (Workstream 3 first build is a build session, not a deploy; the deploy happens at the end of Workstream 3 after all build sessions land). **ONE push planned per `feedback_approval_scope_per_decision_unit.md`:** end-of-session push of the Workstream 3 first build commit + the doc-batch commit together to `origin/workflow-2-competition-scraping` (operationally adjacent; NO Rule 9 gate fires since this is a feature-branch push not `git push origin main`).

---

## Status of today's session

**W#2 polish P-46 Workstream 2 (URL detail page redesign) ✅ DONE-AND-VERIFIED 2026-05-23-c end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` ff-merge `783abf4..9969427`** (49 files +7504/-477 — 13 commits ff'd as one fast-forward carrying Workstream 1's 2026-05-24 schema commits + Sessions 1-5's UI/route commits from 2026-05-25 through 2026-05-23-b). Pure orchestration deploy session — no new code, no new schema, no new dependencies, no fresh extension zip.

**Session shape (deploy session — canonical 4-phase /deploy orchestration):**

- Pre-build reads at session start (read `docs/COMPETITION_DATA_V2_DESIGN.md` §C.2 + §B 2026-05-24 through 2026-05-23-b for the binding inputs).
- **Phase 1 — Pre-deploy /scoreboard:** All 5 checks GREEN at exact Session 5 baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 692 src/lib UNCHANGED / 61 routes UNCHANGED); Check 6 Playwright SKIPPED via Rule 27 picker (recommended; test-only extension file in the bundle).
- **Phase 2 — Rule 9 director-Yes gate:** AskUserQuestion picker fired ONCE for `git push origin main`; director picked "Deploy now (recommended)".
- **Phase 3 — ff-merge + push + Vercel auto-redeploy + ping-pong sync:** `git checkout main && git merge --ff-only workflow-2-competition-scraping` succeeded clean; post-merge /scoreboard all 5 checks GREEN; `git push origin main 783abf4..9969427` succeeded; Vercel auto-redeploy fired; ping-pong sync was a NO-OP (workflow-2 already at `9969427` from the prior session's doc-batch push).
- **Phase 4 — Director real-Chrome cross-platform verify on vklf.com:** ALL 6 SURFACES PASS clean with zero caveats — Captured Text + Image + Video + Reviews card-list sections all PASS / URL-level affordances Type+Description-1+Description-2+Price+Scraping Status toggle+Overall Competitor Analysis box PASS / Competition Data table Status pill column bidirectional mirror PASS. Director reported "all surfaces pass" — the cleanest end-of-workstream verification in any P-46 session.
- **Schema-change-in-flight flag FLIPPED YES → NO at deploy completion.**
- End-of-session doc-batch covers the 8-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG with new §Entry 2026-05-23-c + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION + the new §B 2026-05-23-c entry on COMPETITION_DATA_V2_DESIGN.md).
- TWO actual pushes + ONE no-op (deploy push + end-of-session doc-batch push + ping-pong no-op) per the canonical 3-push pattern in `feedback_approval_scope_per_decision_unit.md`.

**§4 Step 1c forced-picker NOT FIRED** — next-session task unambiguous (Workstream 3 is the only remaining workstream of P-46 that hasn't started; Workstreams 4 + 5 come after per Q10's locked sequencing).

**ZERO new DEFERRED items at session end (Rule 26)** — all 9 deploy-session tasks completed cleanly.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry this session — the P-46 Workstream 2 DEPLOY CLOSING §Entry 2026-05-23-c** capturing Workstream 2 done end-to-end + the new reusable Pattern "Multi-session workstream deploy gate timing" + two LOW informational sub-observations (P-43 cwd-leak class re-reproduced twice during /scoreboard Check 5 — caught + recovered both times; pointer-file off-by-one on main-tip SHA — NEXT_SESSION.md said `ee8c79d` but actual main was `783abf4`; ff-merge count of 13 still correct) + calibration data point (Workstream 2 came in at top end of estimate; combined W1+W2 right on plan).

**TWENTY-FIRST end-of-session run under the Rule 30 + §4 Step 4b template** (sequence prior to today: 2026-05-21-b → 2026-05-21-c → 2026-05-21-d → 2026-05-22 → 2026-05-22-b → 2026-05-21 → 2026-05-22-c → 2026-05-22-d → 2026-05-22-e → 2026-05-22-f → 2026-05-22-g → 2026-05-22-h → 2026-05-22-i → 2026-05-23 → 2026-05-24 → 2026-05-25 → 2026-05-26 → 2026-05-27 → 2026-05-28 → 2026-05-23-b → today). The 3 plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; the P-46 Workstream 3 first build session begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at today's end-of-session doc-batch commit (the commit that lands when the parent pushes this NEXT_SESSION.md). Both `workflow-2-competition-scraping` AND `main` will be at the same SHA — today's doc-batch commit — because the canonical 3-push pattern leaves both branches even at end-of-deploy-session. **There is no commit gap between `workflow-2-competition-scraping` and `main`** at the start of the next session (different from prior W#2 build sessions where workflow-2 was ahead of main by N build commits). **The Workstream 3 first build session will start fresh from this even state**, with all of Workstream 1 + 2 already shipped + live on vklf.com.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-46 Workstream 3 first build session, on `workflow-2-competition-scraping`.** Closes **(a.77) RECOMMENDED-NEXT**. This is the first of an estimated 3-4 build sessions covering the Competition Data table redesign per §C.3 of `docs/COMPETITION_DATA_V2_DESIGN.md`.

BUILD session — no deploy this session. Workstream 1 + 2 already shipped + live on vklf.com (deployed 2026-05-23-c). Workstream 3 begins a new build arc — ~3-4 sessions covering ~12 new columns + click-to-edit on every cell + resizable column widths + drag-to-reorder rows + per-column show/hide toggles + adjustable font size + horizontal checkbox bar at top + cross-device-synced user preferences via the Workstream 1 `UserTablePreferences` model already in place.

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Also verify both branches are at the same SHA (today's doc-batch commit) — workflow-2 and main should both be at today's doc-batch.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or implementation).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-46 polish-backlog entry (the Workstream sub-status grid showing WS#1 + WS#2 ✅ DONE-AND-VERIFIED 2026-05-23-c + WS#3 NEXT per (a.77) — the binding input for today's scope).
- **`docs/COMPETITION_DATA_V2_DESIGN.md`** with focus on **§C.3 Workstream 3 implementation outline** (the binding spec for the next 3-4 sessions) + **§A.2 (click-to-edit on every cell — binding decision Q2)** + **§A.3 (server-side per-user `UserTablePreferences` Prisma model keyed by (userId, projectId) — binding decision Q3)** + **§A.8 (Status column bidirectional mirror — already shipped in Session 5; this session may add per-column filtering for Status which Session 5 deferred to Workstream 3)** + **§B 2026-05-24 through §B 2026-05-23-c (Workstream 1 + Sessions 1-5 closing entries + today's deploy-closing entry — the binding inputs for what Workstream 2 shipped + what Workstream 3 inherits)**. This doc is the canonical source of truth.
- `prisma/schema.prisma` — confirm `UserTablePreferences` model is in place from Workstream 1 (fields: userId / projectId / columnVisibility Json / columnWidths Json / fontSize Int / rowOrder Json / lastUsedSortColumn).
- `src/app/projects/[projectId]/competition-scraping/components/UrlTable.tsx` — the existing Competition Data table component that Workstream 3 redesigns.
- `src/app/projects/[projectId]/competition-scraping/page.tsx` — the Competition Data page that hosts the table.
- `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/EditableField.tsx` — Session 5's `EditableEnumField<T>` segmented-control component + `EditableTextField` (both reusable in Workstream 3 for click-to-edit cells).
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (zero gates planned this session — build session, not a deploy) + Rule 14f (may fire at session start if multiple §C.3 sub-scopes are reasonable first-session candidates) + Rule 18 (§A of `docs/COMPETITION_DATA_V2_DESIGN.md` stays frozen; §B 2026-05-XX is the new append for next session) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit — UI-only build session expected; revisit if a new schema column surfaces) + Rule 25 (Multi-Workflow — single-branch session; no main push since not a deploy) + Rule 26 (DEFERRED items registry) + Rule 27 (Playwright forced-picker; SKIPPED per non-deploy-session convention) + Rule 30 (Session bookends) + §4 Step 4b extended template.

**Task shape (P-46 Workstream 3 first build session — Competition Data table redesign):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or implementation. Cover: what we'll do in the session (Workstream 3 first build session per §C.3 — likely first slice is the foundational column shape changes + click-to-edit foundation), the schema-change-in-flight flag stays NO (default expectation), the ZERO Rule 9 gates planned (build session, not a deploy), the ONE push planned (end-of-session doc-batch push).

2. **Pre-build reads** — execute the pre-build read list above. ~30 minutes. Verify §C.3 sub-scopes + the `UserTablePreferences` schema state + the existing `UrlTable.tsx` shape.

3. **Rule 14f session-start scope-pick (may or may not fire)** — if §C.3 has multiple reasonable first-session sub-scopes (e.g., column shape changes vs. click-to-edit foundation vs. UserTablePreferences settings UI), surface as a forced-picker. Per `feedback_default_to_recommendation.md`: surface the recommended path + default to it if director defers. If there's only one obvious recommendation (likely the foundational column shape changes + click-to-edit foundation as the natural first slice), skip the picker per Default-to-recommendation.

4. **Implementation** — landing the chosen first slice. Reuse Session 5's `EditableEnumField<T>` segmented-control component + `EditableTextField` shell + the four memorialized extraction-shape Patterns from Workstream 2 (PerItemAnalysisBox extraction / OverallAnalysisBox extraction / Per-record handler DI-seam precedent extension / Field-allowlist subset extraction) where they apply.

5. **/scoreboard verification** — all 5 checks must GREEN at new baselines reflecting any test count changes. Check 6 Playwright SKIPPED per non-deploy-session convention.

6. **End-of-session doc-batch** covers ROADMAP (header bump + P-46 entry annotated with Workstream 3 Session 1 ✅ DONE-AT-CODE-LEVEL + Workstream sub-status grid updated with WS#3 Session 1 of 3-4 ✅ DONE-AT-CODE-LEVEL + (a.77) closed + new (a.78) opened for Workstream 3 Session 2) + CHAT_REGISTRY (header bump — 144th Claude Code session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header bump only or new §Entry depending on whether new reusable Pattern surfaces) + NEXT_SESSION.md (rewritten for Workstream 3 Session 2) + HANDOFF_PROTOCOL (header bump only — no new rules expected) + CLAUDE_CODE_STARTER (header bump only) + `docs/COMPETITION_DATA_V2_DESIGN.md` (NEW §B entry capturing Workstream 3 Session 1's landing). **ONE push** at end-of-session to `origin/workflow-2-competition-scraping` per the canonical pattern.

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** any picker that fires (Rule 14f session-start scope-pick / sub-scope choice during implementation) — surface the recommended path + default to it if director defers.

**Schema-change-in-flight flag:** enters **NO** (just flipped YES → NO at today's Workstream 2 deploy completion). **Default expectation: stays NO** through Workstream 3 (UI-only build session expected; consumes existing Workstream 1 schema + `UserTablePreferences` model). **Re-evaluate if a new schema column surfaces during planning** (unlikely but possible — Workstream 3 may add columns to `UserTablePreferences` if the original §A.11 schema design didn't enumerate every preference slot; the design doc allowed for §B refinements per Rule 18).

---

## Pre-session notes (offline steps for director between sessions)

**Required offline step BEFORE the next P-46 Workstream 3 first build session:** none. All infrastructure landed in prior sessions; Workstream 3 begins purely with code work on `workflow-2-competition-scraping`.

**Standing optional offline step (NOT blocking P-46 Workstream 3 — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking P-46 Workstream 3 at all — can happen any time. Director-independent.

**Optional offline reading for director:** `docs/COMPETITION_DATA_V2_DESIGN.md` §C.3 Workstream 3 implementation outline (~2-minute skim) + §B 2026-05-23-c (today's deploy-closing entry; captures the new "Multi-session workstream deploy gate timing" Pattern + the calibration data point that gave us "Workstream 2 came in at the top end of the 3-5 estimate; combined W1+W2 right on plan; Workstream 3 estimated 3-4 sessions"). Worth scanning before the next session if director wants context.

**Pre-build setup (informational — Claude will handle in-session):** the Workstream 3 first build session begins on `workflow-2-competition-scraping`; director's involvement is minimal — just the standard go-ahead after Step 7b plain-terms summary + any Rule 14f forced-picker if multiple sub-scopes surface. No pre-session terminal commands needed.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (no rebases, no force pushes, no `git reset --hard`, no `git branch -D`).

**Rule 9 triggers planned this session: ZERO** — Workstream 3 first build is a build session, not a deploy. No `git push origin main`; no `prisma db push` (default expectation — UI-only consuming existing schema); no `git reset --hard`; no `git push --force`; no `git branch -D`; no `rm -rf`; no SQL DELETE/DROP/TRUNCATE planned. ALL standard build-session conventions apply.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits a 🚨 alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any implementation work.

---

## Why this pointer was written this way (debug aid)

Today's session was the **Workstream 2 deploy session** — the canonical 4-phase /deploy orchestration that ships Workstream 1's schema-aware code + Sessions 1-5's UI/route work to vklf.com end-to-end. The session ran cleanly: Phase 1 pre-deploy /scoreboard 5/5 GREEN at exact Session 5 baselines + Rule 27 Playwright SKIP picker (recommended); Phase 2 Rule 9 director-Yes gate fired once for the deploy push (director picked Deploy now); Phase 3 ff-merge `783abf4..9969427` clean — 49 files +7504/-477 — 13 commits ff'd as one fast-forward — post-merge /scoreboard 5/5 GREEN on main — push succeeded — Vercel auto-redeploy fired — ping-pong sync was a NO-OP (workflow-2 already at the doc-batch SHA); Phase 4 director real-Chrome cross-platform verify ALL 6 SURFACES PASS clean with zero caveats. **Workstream 2 closes ✅ DONE-AND-VERIFIED end-to-end on vklf.com.** Workstream 1 ✅ DONE-AND-VERIFIED in the same ff-merge. Schema-change-in-flight flag flipped YES → NO at deploy completion.

The natural next-session task per Q10's locked sequencing is the **Workstream 3 first build session** — Competition Data table redesign per §C.3:

- **(Recommended)** Workstream 3 first build session — Competition Data table redesign. First slice tackles the foundational structure changes (12 new columns + click-to-edit foundation reusing Session 5's `EditableEnumField<T>` + the four extraction Patterns from Workstream 2). ~3-4 sessions total estimated for Workstream 3 per §C.3. Recommended because Workstream 3 is the only remaining workstream of P-46 that hasn't started + Workstreams 4 + 5 come after per Q10 sequencing + the §C.3 outline is well-specced + the foundational Workstream 1 + 2 work is now deployed + verified.

The Rule 14f forced-picker at the Workstream 3 first build session may or may not fire depending on whether §C.3 has multiple reasonable first-session sub-scopes; if it fires, default-to-recommendation guides the pick. The shape of the Workstream 3 first build session is **pure code session with ZERO Rule 9 gates** — no schema changes expected (consumes existing Workstream 1 schema + `UserTablePreferences` model already in place); pre-build reads → Rule 14f scope-pick (if applicable) → implementation → /scoreboard verification → end-of-session doc-batch (8-doc bundle) → ONE push at end-of-session to `origin/workflow-2-competition-scraping`.

**After the Workstream 3 implementation arc lands clean + the Workstream 3 deploy session follows, Workstream 4 (Comprehensive Competitor Analysis page) begins next.** ~2-3 sessions for Workstream 4 covering the rich-text editor integration on a new page + hyperlink-to-URL-detail-page wiring + edit/view-mode toggle + back-button. Then Workstream 5 (Extension form additions + manual Reviews entry). Then P-46 closes ✅ end-to-end. Then P-47 + P-26 + DEFERRED P-27 bugs (or absorbed obsolete) before W#2 graduation.

**Alternate next-session candidates if director shifts priorities at session start (after Workstream 2 deploy + before Workstream 3 first build):**

- **Defer Workstream 3 + start P-47 Shadow DOM refactor.** ~2-3 sessions. NOT recommended — P-47 is LOW priority (band-aid works empirically) AND sequencing-wise the design doc explicitly noted Shadow DOM should wait until P-46 implementation fully lands. Could happen after P-46 closes (Workstream 5 deploy).
- **Defer Workstream 3 + start P-26 below-fold scroll capture.** ~1-2 sessions. NOT recommended — P-26's urgency may be reduced now that Workstream 2's vklf.com-side image upload affordances are deployed; the deploy is the higher-value next step.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time. Director-independent.
- **A polish-detour ahead of Workstream 3 if director wants pre-build infrastructure work.** No obvious candidate this time — the operational substrate is hardened across 3 layers (P-42 backup-memory hook + P-43 absolute-paths discipline + P-44 wxt build/zip wrappers); Workstream 2's deploy landed clean so there's no new substrate work surfaced. If director picks this path, surface the open polish landscape as a Rule 14f forced-picker.

Check `ROADMAP.md` for the canonical state. Check `docs/COMPETITION_DATA_V2_DESIGN.md` §C.3 + §A.2 + §A.3 + §A.8 + §B 2026-05-24 through 2026-05-23-c for Workstream 3's binding scope + the 7 prior closing entries spanning Workstream 1 + Sessions 1-5 + today's deploy.
