# Next session

**Written:** 2026-05-23-b (`session_2026-05-23-b_p46-workstream-2-session-5-url-level-structural-fields` — end-of-session handoff after **W#2 polish P-46 Workstream 2 (URL detail page redesign) Session 5 ✅ DONE-AT-CODE-LEVEL 2026-05-23-b on `workflow-2-competition-scraping`** — fifth + final build session of the P-46 Workstream 2 implementation arc (Session 5 of 3-5 estimated per §C.2); landed the last §C.2 sub-scope for Workstream 2 — URL-level structural fields (Type / Description-1 / Description-2 / Price as 4 new free-text fields at the top of the URL box) + Scraping Status toggle (Incomplete/Complete enum write via the NEW `EditableEnumField<T>` segmented-control component) + remove Sizes/Options UI (full delete; underlying `CompetitorSize` table data stays per Q6 hide-UI-keep-data; Git history preserves reversibility) + add read-only Status pill column (green Complete / gray Incomplete) second-from-left after URL in the Competition Data table bidirectionally mirroring the URL detail page toggle per Q8 §A.8. Build commit `374f1a3` — 6 files +669/-109 on `workflow-2-competition-scraping`; NOT pushed to main since Session 5 is a build session. **Headline outcome: Workstream 2 is now COMPLETE at code level — Sessions 1-5 of 3-5 estimated all DONE.** **Closes (a.75) RECOMMENDED-NEXT = P-46 Workstream 2 Session 5.** **Opens (a.76) RECOMMENDED-NEXT = P-46 Workstream 2 deploy session** on `workflow-2-competition-scraping` — Phase-4 deploy ff-merging `workflow-2-competition-scraping` → `main` (carries Workstream 1's schema commits + Sessions 1-5's UI/route commits as one fast-forward) → Vercel auto-redeploy → ping-pong sync → Phase-4 director real-Chrome cross-platform verify across 5 surfaces; schema-change-in-flight flag flips YES → NO at deploy completion.

---

## What we did this session (in plain terms)

This was the **fifth and final build session of Workstream 2** — the URL detail page redesign. Workstream 2 is now COMPLETE at code level. The arc looked like this: Session 1 (2026-05-25) shipped the TipTap shared rich-text editor wrapper + the first per-item Analysis text box on Captured Text + the route-handler half for the simplest capture type, and locked the card-list layout precedent via a Rule 14f forced-picker. Session 2 (2026-05-26) applied that locked precedent to Captured Image + Captured Video. Session 3 (2026-05-27) completed the "Analysis surface" arc with new URL-level + per-category Overall Analysis boxes. Session 4 (2026-05-28) landed Captured Reviews as a first-class capture type. Today's Session 5 closed Workstream 2 with the URL-level structural fields + Scraping Status toggle + Sizes/Options removal + Status column mirror.

What landed today, in plain terms:

- **The URL detail page now carries 4 new structural text fields at the top of the URL box** — Type / Description-1 / Description-2 / Price. Type and Price slot into the existing compact grid alongside Product Name / Brand Name / Category etc.; the two Description fields render as full-width multiline textareas below the grid (with `rows=3` each — they are `db.Text` columns and deserve room to breathe). All 4 use the existing click-to-edit `EditableTextField` shell, now extended with optional `multiline` + `rows` props.
- **A Scraping Status toggle sits as a prominent full-width strip above the field grid.** Single-click flips between Incomplete and Complete. The toggle uses a new generic component — `EditableEnumField<T extends string>` — built today as a segmented-control widget reusable by any future enum-cell affordance (Workstream 3 will use it for its click-to-edit table cells). Aria-correct with role=radiogroup + role=radio + aria-checked. Optimistic write with error rollback.
- **The old Sizes/Options UI is gone.** Per Q6's locked decision the UI is hidden but the underlying data stays — today's session implements that as a clean full delete of the `SizesSubsection` function + render call + now-unused helper styles. The `CompetitorSize` table data is untouched; Git history preserves reversibility if anyone later wants the UI back. The parallel-fetches block on the URL detail page drops from 6 reads to 5 with a comment annotating the §A.6 hide-UI-keep-data reasoning.
- **The Competition Data table gains a Status pill column second-from-left after URL.** Reads from the same `CompetitorUrl.scrapingStatus` enum the URL detail page toggle writes to — so the two views are bidirectionally mirrored at the column level (per Q8 §A.8). Color-coded pill: green Complete / gray Incomplete. Per-column filtering for Status defers to Workstream 3 with the rest of the table redesign.
- **The route-handler extension uses a new pure trust-boundary helper.** `extractUrlStructuralFieldsPatch(body)` returns `{ ok: true, patch } | { ok: false, error }` — trim-or-null normalization for the 4 text fields, strict enum-acceptance for `scrapingStatus`. Extracted into `src/lib/competition-scraping/url-structural-fields-validation.ts` so 22 new node:test cases exercise the production code path without needing Next.js or Prisma.
- **No Rule 14f sub-pickers fired during execution.** Director picked Proceed at the session-start operational scope picker (the only §C.2 sub-scope remaining). Inside the chosen scope, every sub-decision was a default-to-recommendation skip per `feedback_default_to_recommendation.md` (helper extraction over inline route normalization; Descriptions as full-width multiline below grid; Scraping Status as full-width strip above grid; Status column second-from-left in UrlTable; `EditableEnumField` as generic segmented control; Sizes/Options dead-code full deletion over commented-out per project rules).

No schema changes today (Workstream 1 already added the `type` / `description1` / `description2` / `price` text columns + `scrapingStatus` enum + the `ScrapingStatus` Prisma enum). No new npm dependencies (TipTap landed in Session 1; not needed today). No deploy this session — Workstream 2 Session 5 is a build session.

**Schema-change-in-flight flag STAYS YES** — carrying from Workstream 1's `prisma db push` 2026-05-24. Stays YES through the future Workstream 2 deploy session (the next session per (a.76)) — flips back to NO at that deploy completion.

**Workstream 2 came in at the top end of the 3-5 sessions estimate (5 sessions; no overrun).** Five consecutive in-scope sessions confirm the §C.2 plan was well-specced. A new reusable Pattern was memorialized in the design doc — **"Field-allowlist subset extraction"** — pairs with Sessions 1/3/4's three prior extraction Patterns (PerItemAnalysisBox / OverallAnalysisBox / Per-record handler DI-seam) to give Workstream 2 four memorialized extraction-shape Patterns covering the spectrum from UI component extraction to whole-handler DI-seam to field-subset pure helper to single-field type guard.

A small informational note worth surfacing: today's date per director confirmation is **2026-05-23** but the doc-history's recent session stamps run 2026-05-24 → 2026-05-28 (the prior 5 sessions). Session suffix `-b` per Rule 14 disambiguates today against the original 2026-05-23 design session. Captured as informational in both CORRECTIONS_LOG §Entry 2026-05-23-b and design doc §B 2026-05-23-b; not corrections-tier.

**Workstream 2 is now 100% complete at code level.** The next session can be the Workstream 2 deploy session — ff-merge to main bringing Workstream 1's schema commits + Sessions 1-5's UI/route commits as one fast-forward, Vercel auto-redeploy, ping-pong sync, and Phase-4 director real-Chrome cross-platform verification of all the schema-aware code finally landing live on vklf.com.

## What we'll do next session (in plain terms)

Next session is **P-46 Workstream 2 deploy session.** This is the deploy session that ships Workstream 1's schema-aware code + Sessions 1-5's UI/route work to vklf.com. It's a Phase-4 deploy under Rule 9 director-Yes gate:

- **Phase 1 — Pre-deploy /scoreboard.** All 5 checks at their new baselines: root tsc clean / extension tsc clean / 558 extension tests / 692 server tests / 61 routes. Check 6 Playwright SKIPPED (no extension changes this deploy — pure server + web UI).
- **Phase 2 — Rule 9 director-Yes gate.** AskUserQuestion picker fires before `git push origin main`. Director confirms.
- **Phase 3 — ff-merge + push + Vercel auto-redeploy + ping-pong sync.** Fast-forward merge `workflow-2-competition-scraping` → `main` carrying 13 commits as one fast-forward (Workstream 1's schema + 4 sessions' UI/route + 1 session's structural fields + the design-session doc-batch + 5 build-session doc-batches). Push to `origin/main`. Vercel auto-redeploys. Ping-pong sync back to `workflow-2-competition-scraping`.
- **Phase 4 — Director real-Chrome cross-platform verify across 5 surfaces** that all landed during Workstream 2:
  1. **Captured Text section** — vertical card list with per-item Analysis editor below each card (Session 1).
  2. **Captured Image section** — vertical card list with per-item Analysis editor below each card (Session 2).
  3. **Captured Video section** — vertical card list with per-item Analysis editor below each card (Session 2).
  4. **Captured Reviews section** — vertical card list with per-item Analysis below each card + manual-add modal with 1-5 star-rating picker + Overall Reviews Analysis box at the bottom (Session 4).
  5. **URL-level affordances** — Overall Competitor Analysis box at the page bottom + per-category Overall Analysis boxes on each capture subsection (Session 3) + 4 new URL-level structural text fields (Type / Description-1 / Description-2 / Price) at the top + Scraping Status toggle as a prominent strip + Sizes/Options UI gone (Session 5).
  6. **Competition Data table** — Status pill column second-from-left after URL bidirectionally mirroring the URL detail page toggle (Session 5).

**Schema-change-in-flight flag flips YES → NO at deploy completion.**

No new code work in the deploy session itself — purely orchestration. If any verification surfaces a real-Chrome bug, the deploy session pivots into a fix-forward (likely a same-day follow-up build session) before declaring Workstream 2 ✅ DONE-AND-VERIFIED.

## What's still left on the total roadmap (in plain terms)

Major W#2 items as of session-end 2026-05-23-b:

- **P-46 Workstream 1 SCHEMA ✅ DONE-AT-CODE-LEVEL 2026-05-24.** Deploys with Workstream 2 next session.
- **P-46 Workstream 2 (URL detail page redesign) ✅ COMPLETE AT CODE LEVEL 2026-05-23-b.** Sessions 1-5 all DONE-AT-CODE-LEVEL. Deploys to vklf.com next session.
- **P-46 Workstream 3 (Competition Data table redesign).** ~3-4 sessions. ~12 new columns + click-to-edit on every cell + resizable column widths + drag-to-reorder rows + per-column show/hide toggles + adjustable font size + horizontal checkbox bar at top + cross-device-synced user preferences via `UserTablePreferences` model from Workstream 1. Will reuse today's new `EditableEnumField<T>` segmented-control component + the field-allowlist subset extraction pattern.
- **P-46 Workstream 4 (Comprehensive Competitor Analysis page).** ~2-3 sessions. NEW page hosting per-Project TipTap rich-text doc with hyperlinks back to URL detail pages + edit-mode toggle + back-button. Consumes the same `RichTextEditor` wrapper Session 1 built (using the `variant='full'` branch).
- **P-46 Workstream 5 (Extension form additions + manual Reviews entry).** ~1-2 sessions. Add Type / Description-1 / Description-2 / Price fields to the extension URL save form + vklf.com-side manual Reviews entry form. Deploy session ends this workstream + closes the P-46 arc.
- **P-47 Shadow DOM refactor (LOW; AFTER P-46).** ~2-3 sessions. Replaces the 80-event-listener band-aid from P-45 Build #2's Issue 2 fix with proper Shadow DOM isolation. LOW priority since band-aid works empirically.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions. Current two-captures workaround works fine. May be reduced in urgency by Workstream 2's vklf.com-side image upload affordances (deployed today).
- **P-27 Bug #9 (Amazon hover-preview deeper-walk) + Bug #15 (Ebay native-controls quirk) — DEFERRED LOW.** May obsolete with P-46 redesign which restructures the URL detail page surface they live in.
- **W#2 graduation** after P-46 + P-47 + P-26 ship. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking P-46):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`.

---

**For:** the next Claude Code session — **P-46 Workstream 2 deploy session** (estimated ~2 hours: pre-build doc reads ~30 min + pre-deploy /scoreboard ~10 min + Rule 9 gate + ff-merge + push + Vercel wait ~10 min + ping-pong sync ~5 min + Phase-4 director real-Chrome verification ~45-60 min + end-of-session doc-batch ~30 min). Per Rule 23 Change Impact Audit: **schema-aware code DEPLOY to production** (Workstream 1's schema is already live on Supabase since 2026-05-24; today's deploy ships the code that READS from that schema; existing production rows render with empty new-field values per §A.11 "no data backfill needed"; the Sizes/Options data stays in the database per Q6 "hide-UI-keep-data"; the new Captured Reviews / Overall Analysis / URL-level structural fields all begin populated on first user write post-deploy). No new dependencies in the deploy itself (TipTap landed in Session 1; already in the bundle). **Schema-change-in-flight flag enters YES** (carrying from Workstream 1's `prisma db push`); **flips YES → NO at deploy completion** (the code reading the schema is now live on vklf.com). **Rule 9 triggers planned this session: ONE** — `git push origin main` for the deploy. Standard ff-merge + push (no rebases, no force pushes). **THREE pushes planned per the canonical 3-push pattern in `feedback_approval_scope_per_decision_unit.md`:** (1) Phase-2 push of `origin/main` after ff-merge (the deploy push under Rule 9 gate); (2) Phase-3 ping-pong sync push of `origin/workflow-2-competition-scraping` (workflow-2 fast-forwarded to match main; no code change); (3) end-of-session doc-batch push to `origin/workflow-2-competition-scraping` (this session's doc updates capturing the deploy outcome + Phase-4 verification results).

---

## Status of today's session

**W#2 polish P-46 Workstream 2 (URL detail page redesign) Session 5 ✅ DONE-AT-CODE-LEVEL 2026-05-23-b on `workflow-2-competition-scraping`** — fifth + final build session of the P-46 Workstream 2 implementation arc; landed the last §C.2 sub-scope for Workstream 2 — URL-level structural fields (Type / Description-1 / Description-2 / Price) + Scraping Status toggle + remove Sizes/Options UI + add Status column to Competition Data table bidirectionally mirroring the URL detail page toggle. Build commit `374f1a3` — 6 files +669/-109 on `workflow-2-competition-scraping`; NOT pushed to main since Session 5 is a build session. **Workstream 2 is now COMPLETE at code level — Sessions 1-5 of 3-5 estimated all DONE.**

**Session shape (build session — URL-level structural fields + Scraping Status toggle + Sizes/Options UI deletion + Status column mirror):**

- Pre-build reads at session start (read `docs/COMPETITION_DATA_V2_DESIGN.md` §C.2 + §A.6 + §A.7 + §A.8 + §A.11 + §B 2026-05-24 through 2026-05-28 + `prisma/schema.prisma` empirical state for `CompetitorUrl.type` + `description1` + `description2` + `price` + `scrapingStatus` enum + existing `urls/[urlId]/route.ts` PATCH allowlist + existing `EditableField.tsx` shape).
- **Rule 14f session-start operational scope-pick** — director picked Proceed (only §C.2 sub-scope remaining); per `feedback_default_to_recommendation.md` the sub-picker was skipped.
- NEW `src/lib/competition-scraping/url-structural-fields-validation.ts` (~105 LOC pure trust-boundary helper `extractUrlStructuralFieldsPatch(body)` returning `{ ok, patch } | { ok, error }`; trim-or-null normalization for the 4 text fields; strict enum-acceptance for `scrapingStatus` via `isScrapingStatus`).
- NEW `src/lib/competition-scraping/url-structural-fields-validation.test.ts` (~218 LOC; 22 new node:test cases).
- MODIFIED `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/route.ts` (+15 net — imports + calls `extractUrlStructuralFieldsPatch`; spreads `structuralResult.patch` onto Prisma data; forwards `structuralResult.error` as 400).
- MODIFIED `EditableField.tsx` (+210/-22; `EditableTextField` multiline support + NEW generic `EditableEnumField<T extends string>` segmented-control + style constants).
- MODIFIED `UrlDetailContent.tsx` (+168 net; removes Sizes/Options imports + state + render + function + helpers; adds Scraping Status toggle as full-width strip above grid; adds Type + Price into grid; adds Description-1 + Description-2 as full-width multiline rows below grid).
- MODIFIED `UrlTable.tsx` (+51 net; adds `scrapingStatus` to SortKey + COLUMNS + matching `<td>` with color-coded pill via new `scrapingStatusBadgeStyle(status)` helper second-from-left after URL).
- /scoreboard verification: all 5 checks GREEN at new baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / **692 src/lib +22 from baseline 670** / **61 routes UNCHANGED**); Check 6 Playwright SKIPPED per non-deploy-session convention.
- End-of-session doc-batch covers the 8-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG with new §Entry 2026-05-23-b + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION + the new §B 2026-05-23-b entry on COMPETITION_DATA_V2_DESIGN.md).
- ONE push at end-of-session to `origin/workflow-2-competition-scraping` (no main push since this is a build session; no Rule 9 trigger).

**§4 Step 1c forced-picker NOT FIRED** — next-session task unambiguous (Workstream 2 deploy is the only remaining step before Workstream 3 begins).

**ZERO new DEFERRED items at session end (Rule 26)** — all 8 in-session tasks completed.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry this session — the P-46 Workstream 2 Session 5 closing §Entry** capturing Workstream 2 completion + the new "Field-allowlist subset extraction" reusable Pattern + the date-stamping anomaly informational observation + P-43 cwd-leak re-reproduction informational (caught + recovered immediately; LOW informational; captured in §B 2026-05-23-b NOT promoted to a separate §Entry).

**TWENTIETH end-of-session run under the Rule 30 + §4 Step 4b template** (sequence prior to today: 2026-05-21-b → 2026-05-21-c → 2026-05-21-d → 2026-05-22 → 2026-05-22-b → 2026-05-21 → 2026-05-22-c → 2026-05-22-d → 2026-05-22-e → 2026-05-22-f → 2026-05-22-g → 2026-05-22-h → 2026-05-22-i → 2026-05-23 → 2026-05-24 → 2026-05-25 → 2026-05-26 → 2026-05-27 → 2026-05-28 → today). The 3 plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; the P-46 Workstream 2 deploy session orchestrates the ff-merge to `main` from here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at the doc-batch commit landing after this NEXT_SESSION.md is written. `workflow-2-competition-scraping` will be **13 commits ahead of `main` at `ee8c79d`**: the 2026-05-23 design-session doc-batch `d364063` + the 2026-05-24 Workstream 1 build commit `caad82a` + the 2026-05-24 doc-batch `fb19314` + the 2026-05-25 Workstream 2 Session 1 build commit `b6e43fe` + the 2026-05-25 doc-batch `9f555d0` + the 2026-05-26 Workstream 2 Session 2 build commit `9747f63` + the 2026-05-26 doc-batch `070a7ee` + the 2026-05-27 Workstream 2 Session 3 build commit `4773b62` + the 2026-05-27 doc-batch `64084ae` + the 2026-05-28 Workstream 2 Session 4 build commit `82d390a` + the 2026-05-28 doc-batch `a8aa37b` + today's Workstream 2 Session 5 build commit `374f1a3` + today's end-of-session doc-batch (the commit that lands when the parent pushes the bundle); main doesn't move between this session and the next. **The Workstream 2 deploy session ff-merges all 13 commits to `main` as one fast-forward**, takes main from `ee8c79d` to today's doc-batch SHA (whatever the parent ends up with after this NEXT_SESSION.md is committed + pushed).

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-46 Workstream 2 deploy session, on `workflow-2-competition-scraping`.** Closes **(a.76) RECOMMENDED-NEXT**. This is the deploy session that ships Workstream 1's schema-aware code + Sessions 1-5's UI/route work to vklf.com — the canonical /deploy 4-phase orchestration.

DEPLOY session — no new code; pure orchestration. Schema migration already shipped via Workstream 1's `prisma db push` on 2026-05-24 + present on Supabase since then; today's deploy is the code-side of that schema (Sessions 1-5's UI + route handlers reading the new columns). Schema-change-in-flight flag flips YES → NO at the moment `git push origin main` completes + Vercel finishes redeploying.

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or orchestration).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-46 polish-backlog entry (the Workstream sub-status grid showing WS#2 Sessions 1-5 ✅ DONE-AT-CODE-LEVEL + Workstream 2 deploy session NEXT per (a.76) — the binding input for today's scope).
- **`docs/COMPETITION_DATA_V2_DESIGN.md`** with focus on **§C.2 Workstream 2 implementation outline** (now 100% complete at code level; the binding spec for what the deploy ships) + **§A.11 (schema additions including the new `CompetitorUrl` structural fields + new tables `CapturedReview` + `ComprehensiveCompetitorAnalysis` + `UserTablePreferences` + new `analysis` JSON column on each of CapturedText/Image/Video + new `overallAnalyses` JSON column + new `ScrapingStatus` enum — all already deployed at schema level via Workstream 1; today's deploy ships the code reading them)** + **§B 2026-05-24 through §B 2026-05-23-b (Workstream 1 + Sessions 1-5 closing entries — the binding inputs for what Phase 4 verification should cover)**. This doc is the canonical source of truth.
- `.claude/commands/deploy.md` (the canonical 4-phase orchestration template).
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (the deploy gate that fires once for `git push origin main`) + Rule 14f (forced-picker may fire mid-session if any unexpected scope surfaces; should not fire for a clean deploy) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit — schema-aware code DEPLOY; safe; no destructive ops) + Rule 25 (Multi-Workflow — single-branch deploy; ff-merge takes main from `ee8c79d` to today's doc-batch SHA) + Rule 26 (DEFERRED items registry) + Rule 27 (Playwright forced-picker; relevant if director wants Playwright in Phase 1 pre-deploy /scoreboard — for this deploy it's likely SKIPPED since there are no extension changes; the deploy is purely server-side + web UI) + Rule 30 (Session bookends) + §4 Step 4b extended template.

**Task shape (P-46 Workstream 2 deploy session — canonical /deploy 4-phase orchestration):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or orchestration. Cover: what we'll do in the session (Phase 1 pre-deploy /scoreboard verification → Phase 2 Rule 9 director-Yes gate via AskUserQuestion → Phase 3 ff-merge `workflow-2-competition-scraping` → `main` + push `origin/main` + Vercel auto-redeploy + ping-pong sync → Phase 4 director real-Chrome cross-platform verify across 5 surfaces + end-of-session doc-batch), the ONE Rule 9 gate planned (`git push origin main`), the schema-change-in-flight flag transition (YES → NO at deploy completion), the THREE pushes planned per the canonical 3-push pattern.

2. **Pre-build reads** — execute the pre-build read list above. ~30 minutes. Verify no drift between §C.2's Sessions 1-5 closing entries + the actual main + workflow-2 branch state. Surface any unexpected state (e.g., main has moved since last session — should not have, but verify) BEFORE proceeding to Phase 1.

3. **Phase 1 — Pre-deploy /scoreboard.** Run all 5 checks. Expected GREEN at baselines: root tsc clean / extension tsc clean / 558 extension tests / **692 src/lib node:test** / **61 routes**. Check 6 Playwright — per Rule 27, the forced-picker fires here. For this deploy the recommendation is SKIPPED since there are no extension changes (purely server + web UI); director picks at the picker. If picker picks RUN, 94 Playwright tests in ~2.7m. ALL 5 (or 6 if picker = RUN) checks MUST be GREEN before Phase 2.

4. **Phase 2 — Rule 9 director-Yes gate.** AskUserQuestion picker fires before any `git push origin main`. Director confirms.

5. **Phase 3 — ff-merge + push + Vercel auto-redeploy + ping-pong sync.**
   - `git checkout main && git pull origin main` (verify main hasn't moved since the prior session; expected at `ee8c79d`).
   - `git merge --ff-only workflow-2-competition-scraping` (fast-forward 13 commits; non-ff merge should NOT happen since workflow-2 is descended from `ee8c79d`).
   - `git push origin main` (this is the Rule 9 push; Vercel auto-redeploys from main on push).
   - Wait for Vercel to finish (typically 60-120 seconds; watch the dashboard or `vercel inspect` if needed).
   - `git checkout workflow-2-competition-scraping && git merge --ff-only main` (ping-pong; workflow-2 fast-forwards to match main; no code change).
   - `git push origin workflow-2-competition-scraping` (the ping-pong push; second of the canonical 3 pushes).

6. **Phase 4 — Director real-Chrome cross-platform verify across 5 surfaces** on vklf.com (use a non-cached browser session or Cmd+Shift+R hard refresh to defeat any Vercel CDN caching):
   - **Surface 1 — Captured Text section.** Vertical card list. Per-item Analysis editor below each card (debounced 500ms on-change save + onBlur flush + Saving… / ✓ Saved / Save failed indicator). Edit one analysis on a real card; observe save indicator. Refresh page; verify the edit persisted.
   - **Surface 2 — Captured Image section.** Same shape as Text. Edit one image's analysis; verify save + persistence.
   - **Surface 3 — Captured Video section.** Same shape. Edit one video's analysis; verify save + persistence.
   - **Surface 4 — Captured Reviews section.** New section between Captured Videos and the page-bottom URL-level Overall Competitor Analysis box. Click the "Add review" button; manual-add modal opens with 1-5 star-rating picker + body textarea + reviewer name + native date input + tags. Add one test review; verify it appears in the card list. Edit the per-item Analysis below the new card; verify save + persistence. Edit the Overall Reviews Analysis box at the bottom of the section; verify save + persistence.
   - **Surface 5 — URL-level affordances.** Top of URL box: 4 new structural text fields (Type / Description-1 / Description-2 / Price) editable + a Scraping Status toggle (Incomplete / Complete) as a prominent full-width strip. Edit each field; verify save + persistence. Flip the Scraping Status toggle Complete → Incomplete → Complete; verify each toggle's optimistic write + persistence. Confirm the OLD Sizes/Options section is GONE from the URL box. Confirm the URL-level Overall Competitor Analysis box at the page bottom is editable + saves.
   - **Surface 6 — Competition Data table.** New Status pill column second-from-left after URL. Pill color: green for Complete / gray for Incomplete. Verify the pill matches the URL detail page Scraping Status toggle state for at least 2 URLs (one Complete, one Incomplete; flip the toggle on the detail page; come back to the table page; verify the pill updates).

   If any surface fails, fix-forward in-session (likely a same-day follow-up build session lands the fix; deploy session pivots from "ship + verify" to "ship + verify + fix-forward"). If all 6 surfaces pass clean, declare **Workstream 2 ✅ DONE-AND-VERIFIED 2026-05-XX on vklf.com** + advance the ROADMAP P-46 status accordingly.

7. **End-of-session doc-batch** covers ROADMAP (header bump + P-46 entry annotated with Workstream 2 deploy session ✅ DONE-AND-VERIFIED + Workstream 2 ✅ DONE-AND-VERIFIED + (a.76) closed + new (a.77) opened for Workstream 3 first build session) + CHAT_REGISTRY (header bump — 143rd Claude Code session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header bump only — likely zero new §Entries unless a Phase-4 fix-forward fires) + NEXT_SESSION.md (rewritten for Workstream 3 first build session — Competition Data table redesign) + HANDOFF_PROTOCOL (header bump only — no new rules expected) + CLAUDE_CODE_STARTER (header bump only) + `docs/COMPETITION_DATA_V2_DESIGN.md` (NEW §B entry capturing the deploy session's empirical landing + Phase-4 verification outcome — closes the Workstream 1 + Workstream 2 deploy arc). **THREE pushes** per the canonical 3-push pattern in `feedback_approval_scope_per_decision_unit.md`: (1) `origin/main` after ff-merge (the deploy push under Rule 9 gate); (2) `origin/workflow-2-competition-scraping` ping-pong sync; (3) end-of-session doc-batch to `origin/workflow-2-competition-scraping`.

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** any picker that fires (Phase 1 Playwright RUN/SKIP / Phase 2 Rule 9 deploy gate / Phase 4 verification scope) — surface the recommended path + default to it if director defers.

**Schema-change-in-flight flag:** enters **YES** (carrying from Workstream 1's `prisma db push` 2026-05-24). **Flips YES → NO at deploy completion** — the moment `git push origin main` succeeds + Vercel redeploys + the new code is live on vklf.com. Captured in the end-of-session doc-batch + the new §B entry on `docs/COMPETITION_DATA_V2_DESIGN.md`.

---

## Pre-session notes (offline steps for director between sessions)

**Required offline step BEFORE the next P-46 Workstream 2 deploy session:** none. All infrastructure landed in prior sessions (schema in Workstream 1; UI + route handlers in Sessions 1-5). Director needs to be available for Phase 2 Rule 9 gate (AskUserQuestion picker fires; director Yes approves) + Phase 4 real-Chrome verification (~45-60 min total walkthrough across the 5 surfaces on vklf.com).

**Standing optional offline step (NOT blocking P-46 Workstream 2 deploy — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking P-46 Workstream 2 deploy at all — can happen any time. Director-independent.

**Optional offline reading for director:** `docs/COMPETITION_DATA_V2_DESIGN.md` §C.2 Workstream 2 implementation outline (~2-minute skim) + §B 2026-05-24 through §B 2026-05-23-b (the 6 closing entries spanning Workstream 1 + Sessions 1-5; together they walk through the complete Workstream 2 arc; ~10-minute skim) + the four memorialized extraction-shape Patterns ("Workstream Foundation Build Bundle" / "PerItemAnalysisBox extraction" / "OverallAnalysisBox extraction" / "Per-record handler DI-seam precedent extension" / "Field-allowlist subset extraction"). Worth scanning before the next session if director wants context for what's deploying.

**Pre-deploy setup (informational — Claude will handle in-session):** the Workstream 2 deploy session orchestrates the ff-merge + push + Vercel wait + ping-pong + Phase-4 verification; director's involvement is the AskUserQuestion Yes at Phase 2 + the real-Chrome walkthrough at Phase 4. No pre-session terminal commands needed.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (no rebases, no force pushes, no `git reset --hard`, no `git branch -D`).

**Rule 9 triggers planned this session: ONE** — `git push origin main` for the Phase-3 deploy push. AskUserQuestion picker fires at Phase 2; director Yes approves; standard ff-merge + push proceeds. NO schema changes this session (schema already shipped via Workstream 1 on 2026-05-24); NO `prisma db push`; NO `git reset --hard`; NO `git push --force`; NO `git branch -D`; NO `rm -rf`; NO SQL DELETE/DROP/TRUNCATE planned.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits a 🚨 alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any deploy orchestration.

---

## Why this pointer was written this way (debug aid)

Today's session was P-46 Workstream 2 Session 5 — the last build session of Workstream 2 — landing the URL-level structural fields + Scraping Status toggle + Sizes/Options UI deletion + Status column mirror. The session ran cleanly: ONE Rule 14f operational scope picker fired at session start (director picked Proceed — only §C.2 sub-scope remaining) + ZERO Rule 14f sub-pickers fired during execution (every sub-decision was a default-to-recommendation skip per `feedback_default_to_recommendation.md`) + 6 files changed in build commit `374f1a3` + 22 new node:test cases + /scoreboard 5/5 GREEN at new baselines. The session closed Workstream 2 at code level — Sessions 1-5 of 3-5 estimated all DONE; came in at the top end of the range but no overrun. Four memorialized extraction-shape Patterns across Sessions 1/3/4/5 give the project a small but useful planning lens for future workstreams.

The natural next-session task per §C.2 Workstream 2 implementation outline is the **Workstream 2 deploy session** — the only remaining step before Workstream 3 begins:

- **(Recommended)** Workstream 2 deploy session. Phase-4 deploy under Rule 9 gate. Ff-merge `workflow-2-competition-scraping` → `main` carrying 13 commits as one fast-forward (Workstream 1's schema + Sessions 1-5's UI/route + the design-session doc-batch + 5 build-session doc-batches). Vercel auto-redeploys. Ping-pong sync. Phase-4 director real-Chrome cross-platform verify across 5 surfaces. Schema-change-in-flight flag flips YES → NO. Recommended because Workstream 2 is 100% complete at code level + Workstream 1's schema has been undeployed on vklf.com since 2026-05-24 + every additional session that doesn't deploy widens the gap between live + working-tree state.

The Rule 14f forced-picker at the deploy session start is operational courtesy rather than a real choice; the recommendation is locked + the only candidate; the picker is there so director can confirm or shift scope.

The shape of the Workstream 2 deploy session is **pure orchestration session with ONE Rule 9 gate** — no new code (Workstream 2 is complete at code level); no new schema (Workstream 1 already shipped); pre-deploy /scoreboard → Phase 2 Rule 9 director-Yes gate → Phase 3 ff-merge + push + Vercel + ping-pong → Phase 4 director real-Chrome verify across 5 surfaces → doc-batch + 3 pushes (origin/main deploy + ping-pong sync + doc-batch) at end. **Schema-change-in-flight flag flips YES → NO at deploy completion.**

**After the Workstream 2 deploy session lands clean, Workstream 3 (Competition Data table redesign) begins next.** ~3-4 sessions for Workstream 3 covering ~12 new columns + click-to-edit on every cell + resizable column widths + drag-to-reorder rows + per-column show/hide toggles + adjustable font size + horizontal checkbox bar at top + cross-device-synced user preferences via `UserTablePreferences` model. Will reuse today's new `EditableEnumField<T>` segmented-control component + the field-allowlist subset extraction pattern + Sessions 1-4's three other extraction Patterns where they apply.

**Alternate next-session candidates if director shifts priorities at session start (after Workstream 2 Session 5 + before Workstream 2 deploy):**

- **Add a 6th Workstream 2 polish session before the deploy (e.g., per-row trash on Captured Videos, deferred per the renderer-only scope of Build #5).** NOT recommended — §C.2 is 100% complete; per-row video trash is a separate polish item (could be a new P-NN entry), not a §C.2 sub-scope. Better to deploy what Sessions 1-5 shipped + capture per-row video trash as a separate polish item if/when director wants it.
- **Defer the Workstream 2 deploy + skip ahead to Workstream 3 build sessions on `workflow-2-competition-scraping`.** STRONGLY NOT recommended — would widen the gap between live + working-tree state; would require deploying both Workstream 2 + Workstream 3 together later (larger blast radius + more Phase-4 surfaces to verify). Better to deploy Workstream 2 first.
- **Defer the Workstream 2 deploy + start P-47 Shadow DOM refactor.** ~2-3 sessions. NOT recommended — P-47 is LOW priority (band-aid works empirically) AND sequencing-wise the design doc explicitly noted Shadow DOM should wait until P-46 implementation lands. Could happen after Workstream 2 deploy lands.
- **Defer the Workstream 2 deploy + start P-26 below-fold scroll capture.** ~1-2 sessions. NOT recommended — P-26's urgency may be reduced by Workstream 2's vklf.com-side affordances; the deploy is the higher-value next step.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time. Director-independent.
- **A polish-detour ahead of Workstream 2 deploy if director wants pre-deploy infrastructure work.** No obvious candidate this time — the operational substrate is hardened across 3 layers (P-42 backup-memory hook + P-43 absolute-paths discipline + P-44 wxt build/zip wrappers); Sessions 1-5's landings were all clean so there's no new substrate work surfaced. If director picks this path, surface the open polish landscape as a Rule 14f forced-picker.

Check `ROADMAP.md` for the canonical state. Check `docs/COMPETITION_DATA_V2_DESIGN.md` §C.2 + §A.6 + §A.7 + §A.8 + §A.11 + §B 2026-05-24 through 2026-05-23-b for Workstream 2's binding scope + the 6 prior closing entries.
