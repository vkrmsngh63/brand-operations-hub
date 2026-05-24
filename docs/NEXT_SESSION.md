# Next session

**Written:** 2026-05-24-b (`session_2026-05-24-b_p46-workstream-4-session-1-comprehensive-analysis-page` — end-of-session handoff after **W#2 polish P-46 Workstream 4 (Comprehensive Competitor Analysis page) Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-24-b on `workflow-2-competition-scraping`** via build commit `283d4d1` — 9 files +1258/-32 landing the full §C.4 Session 1 scope end-to-end at code level — NEW `comprehensive-analysis.ts` DI-seam handler factory (~225 LOC mirroring `user-table-preferences.ts` precedent) + 20 new node:test cases bringing src/lib to 764 + W1's 501-stub at `comprehensive-analysis/route.ts` filled in via thin DI-seam shim + NEW page route `comprehensive-analysis/page.tsx` (~269 LOC) + NEW `AnalysisEditor.tsx` (~151 LOC parallel-component to W2 S1's PerItemAnalysisBox but PUT method + `{ contentJson }` body + variant='full' toolbar) + NEW `AnalysisReadView.tsx` (~76 LOC; renders via `RichTextEditor readOnly=true` to keep typography identical across read/edit modes) + extended `RichTextEditor.tsx` variant='full' toolbar per §A.5 (H1/H2/H3 + Bold + Italic + Underline + bullet/numbered lists + Link + Code block) + standalone navigation button row above `ColumnVisibilityBar` in `CompetitionScrapingViewer.tsx` (+31 LOC) + `@tiptap/extension-underline@3.23.6` promoted to top-level dep. **Headline outcome:** the per-Project Comprehensive Competitor Analysis page enters its W#4 first build — director can navigate from the Competition Data page via a new standalone button, lands on a per-Project rich-text doc that reads + writes against the W1 `ComprehensiveCompetitorAnalysis` Prisma model. **TWO Rule 14f forced-pickers fired at session start** — Session 1 scope (Full §C.4 scope recommended) + Navigation surface placement (Standalone button above the bar recommended). **FIRST APPLICATION of the 2026-05-24 Rule 14a tightening** — the §C.4 vs. NEXT_SESSION.md pointer divergence on Session 1 scope was surfaced via Rule 14f picker rather than silently picking the pointer's recommendation; director picked the §C.4 binding spec. **TWO new reusable Patterns memorialized** — Pattern A "Per-Project edit-affordance parallel to per-row edit-affordance" + Pattern B "Editor-as-readonly substitutes for a separate static renderer". **Schema-change-in-flight flag STAYS NO** entire session — no `prisma db push`; consumes existing `ComprehensiveCompetitorAnalysis` model. **Closes (a.81) RECOMMENDED-NEXT = P-46 Workstream 4 Session 1.** **Opens (a.82) RECOMMENDED-NEXT = P-46 Workstream 4 Session 2** on `workflow-2-competition-scraping` per §C.4 Session 2 spec — internal-hyperlink TipTap extension (custom extension recognizing `#url/<urlId>` shorthand + resolving to URL detail page navigation; may also polish hyperlink-insertion affordance UI on the editor via a "Link to URL" button helper).

---

## What we did this session (in plain terms)

Today was the **Workstream 4 first build session for P-46** — building the new Comprehensive Competitor Analysis page that hosts a rich-text document per Project where the director can write their holistic synthesis of competitive analysis. This is a brand new page that lives alongside the Competition Data table (the W3 surface that shipped yesterday).

What happened, in plain terms:

- **Two pickers at session start, both decided by director per the new Rule 14a tightening.** The first picker asked "how much of the Comprehensive Analysis page should land in Session 1?" — director picked the recommended option: the full §C.4 Session 1 scope (route handlers + page route + edit + read-view + navigation surface) over a more conservative pointer-suggested scope. This was the **first application of the Rule 14a tightening** shipped yesterday — when the binding design spec (§C.4) and the pointer file (NEXT_SESSION.md) disagree on session scope, the binding spec wins; Claude surfaces the divergence rather than silently picking the pointer's recommendation. The second picker asked "where does the navigation surface go?" — director picked the recommended standalone button row above the `ColumnVisibilityBar` (over a tab strip or a button inside the bar).
- **The full Session 1 scope landed end-to-end at code level.** A new DI-seam handler module `comprehensive-analysis.ts` lives in `src/lib/competition-scraping/handlers/` and exports a strict trust-boundary validator + a Prisma-JSON-to-wire-shape coercer + a factory returning the GET + PUT handlers. The PUT populates `lastEditedBy` from the authenticated user's id on every upsert; `lastEditedAt` is managed by Prisma's `@updatedAt` annotation on update + passed explicitly on create. 20 new node:test cases cover the handler's contract.
- **W1's 501-stub at `/api/projects/[projectId]/competition-scraping/comprehensive-analysis` got filled in** via a thin DI-seam shim wrapping the new handler module via the `verifyProjectAuthAdapter` pattern from `table-preferences/route.ts`. The W1 stub had been waiting for a Workstream 4 session to land real handlers behind it.
- **A new client page route landed** at `comprehensive-analysis/page.tsx` (~269 LOC). Uses `useWorkflowContext` + `useParams` + `useRouter`. GET on mount via `authFetch` with 404-tolerant empty-state. Edit/Done toggle switches between read-mode + edit-mode. Back-button "← Competition Data" at top takes the director back to the Competition Data page. Last-edited timestamp footer shows when the doc was last saved.
- **Two new components landed** — `AnalysisEditor.tsx` (~151 LOC; a parallel-component to W2 S1's `PerItemAnalysisBox` but with PUT method + `{ contentJson }` body + variant='full' toolbar) and `AnalysisReadView.tsx` (~76 LOC; renders the TipTap doc via the shared `RichTextEditor` wrapper with `readOnly=true` rather than a separate static `generateHTML` render path — chosen to keep typography identical between read + edit modes without risk of style drift).
- **The shared `RichTextEditor.tsx` wrapper got its `variant='full'` toolbar extended per §A.5** — H1/H2/H3 headings + Bold + Italic + Underline + bullet/numbered lists + Link + Code block. The StarterKit's `heading: false` was flipped to `heading: { levels: [1, 2, 3] }` when variant is 'full'. `@tiptap/extension-underline` got imported + registered for both variants (toolbar surfaces it only for 'full'). The minimal variant used by W2's Analysis boxes is unchanged.
- **A standalone navigation button row landed above `ColumnVisibilityBar`** on the Competition Data page — "→ Comprehensive Competitor Analysis" button that uses the existing `router.push` already imported in `CompetitionScrapingViewer.tsx`.
- **One npm dependency promoted to top-level** — `@tiptap/extension-underline@3.23.6` was already available as a transitive of `@tiptap/extensions` (which W2 S1 added); promoted to a top-level dep so the version is locked.
- **Two new reusable Patterns memorialized.** Pattern A — "Per-Project edit-affordance parallel to per-row edit-affordance" — when an edit affordance needs the same save-lifecycle shape at TWO scope levels (per-row vs. per-Project), extract parallel components that share structure but differ on the per-scope wire details. Pairs with W2 S1's "PerItemAnalysisBox extraction" + W2 S3's "OverallAnalysisBox parallel component" Patterns. Pattern B — "Editor-as-readonly substitutes for a separate static renderer" — §A.5 mentions `generateHTML` for non-editor read views; AnalysisReadView instead uses `RichTextEditor readOnly=true` to keep typography identical between read + edit modes.
- **All 5 /scoreboard checks GREEN at new baselines** — root tsc clean / extension tsc clean / 558 ext UNCHANGED / **764 src/lib +20 from baseline 744** (exact match with 20 new comprehensive-analysis.test.ts cases) / 61 routes UNCHANGED (W1 501-stub at existing path filled in; no new route paths). Check 6 Playwright SKIPPED per non-deploy-session convention.
- **Schema-change-in-flight flag STAYS NO** the entire session. No `prisma db push`. The `ComprehensiveCompetitorAnalysis` Prisma model is already in W1's schema (since 2026-05-24) and already deployed (since 2026-05-23-c W2 deploy).

**Session 1 of ~2-3 estimated landed cleanly within scope** — ~150-180 min duration (top end of recommended-scope estimate); no overrun; no fix-forward; all 17 in-session TaskCreate tasks completed cleanly.

## What we'll do next session (in plain terms)

Next session is the **P-46 Workstream 4 Session 2 build session** — implementing the internal-hyperlink TipTap extension per §C.4 Session 2 spec.

What Session 2 covers per §C.4:

- **A custom TipTap extension** that recognizes `#url/<urlId>` shorthand syntax inline in the rich-text doc and converts it into a navigable hyperlink that opens the corresponding URL detail page when clicked.
- **Possibly a "Link to URL" helper button** in the editor toolbar that lets the director pick a URL from the current Project's competitor URL list + insert a hyperlink to its URL detail page without typing the shorthand syntax manually.
- **End-to-end navigation** — clicking a `#url/<urlId>` link in read mode navigates to `/projects/[projectId]/competition-scraping/url/[urlId]/`; the URL detail page already has a back-button from Workstream 2 + 3 work; chaining works naturally.

**Session 2 likely scope (~90-120 min):** implement the TipTap extension as a new component file extending TipTap's `Extension` API; wire it into the `RichTextEditor` wrapper as an opt-in extension for `variant='full'`; add a "Link to URL" picker affordance in the toolbar (most-thorough-and-reliable per `feedback_recommendation_style.md`) — probably a dropdown showing all URLs in the current Project's competitor URL list with a search filter; add resolver logic that recognizes `#url/<urlId>` patterns at parse time and renders them as styled clickable elements.

**Session 3 (conditional — DEPLOY):** if Sessions 1-2 land clean, the next session deploys the Workstream 4 work to vklf.com. Phase-4 deploy pattern — ff-merge `workflow-2-competition-scraping` → `main` carrying Sessions 1 + 2's build commits + two doc-batch commits as one fast-forward → Vercel auto-redeploy → ping-pong sync → Phase-4 director real-Chrome cross-platform verify across the new Comprehensive Analysis page surface.

After Workstream 4 ships, **Workstream 5 (Extension form additions + manual Reviews entry) is the last remaining workstream of P-46** — ~1-2 sessions adding Type / Description-1 / Description-2 / Price fields to the extension URL save form so director can capture these fields at extension time + manual Reviews entry tweaks on vklf.com based on real-Chrome usage. Then a Workstream 5 deploy closes the P-46 arc end-to-end.

**Schema-change-in-flight flag** STAYS NO at Workstream 4 Session 2 start (the TipTap extension is pure client-side code; no new schema; no `prisma db push` planned).

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-24-b (Workstream 4 Session 1 ✅ DONE-AT-CODE-LEVEL):

- **P-46 Workstream 4 Session 2 (internal-hyperlink TipTap extension).** ~1 session per §C.4. Custom TipTap extension recognizing `#url/<urlId>` shorthand + resolving to URL detail page navigation + optional "Link to URL" picker affordance in the toolbar.
- **P-46 Workstream 4 deploy session (conditional).** ~1 session. Phase-4 deploy of Sessions 1+2 to vklf.com. Schema-change-in-flight flag stays NO (no schema change in W4 at all).
- **P-46 Workstream 5 (Extension form additions + manual Reviews entry).** ~1-2 sessions per §C.5. Adds Type / Description-1 / Description-2 / Price fields to the extension URL save form. One deploy session ends this workstream + closes the P-46 arc.
- **P-47 Shadow DOM refactor (LOW; AFTER P-46).** ~2-3 sessions. Replaces the 80-event-listener band-aid from P-45 Build #2's Issue 2 fix with proper Shadow DOM isolation. LOW priority since band-aid works empirically.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions. Current two-captures workaround works fine. May be reduced in urgency now that Workstreams 2+3's vklf.com-side image upload + table redesign are deployed.
- **P-27 Bug #9 (Amazon hover-preview deeper-walk) + Bug #15 (Ebay native-controls quirk) — DEFERRED LOW.** May obsolete now that P-46 redesigned the URL detail page + Competition Data table surfaces they live in.
- **W#2 graduation** after P-46 + P-47 + P-26 ship. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent; can happen any time.

---

**For:** the next Claude Code session — **P-46 Workstream 4 Session 2 build session** (estimated ~90-150 min: pre-build doc reads ~15-20 min + session-start scope-pick if needed ~5-10 min + implementation ~60-90 min for the TipTap extension + optional "Link to URL" picker + tests + scoreboard verification ~10 min + end-of-session doc-batch ~20-30 min). Per Rule 23 Change Impact Audit: **ADDITIVE + UI-only + TIPTAP-EXTENSION** (new custom TipTap extension + optional toolbar helper; no new dependencies — TipTap landed in W2 S1; no new routes; no new schema). **Schema-change-in-flight flag enters NO** (carrying from today's W4 Session 1 — STAYS NO at Session 2 end since no `prisma db push` planned). **Rule 9 triggers planned this session: ZERO** (pure build session; no deploy; no schema change; no destructive ops). **Pushes planned per `feedback_approval_scope_per_decision_unit.md`:** ONE — end-of-session push of build commit + doc-batch commit together to `origin/workflow-2-competition-scraping` (operationally adjacent; no Rule 9 gate fires).

---

## Status of today's session

**W#2 polish P-46 Workstream 4 (Comprehensive Competitor Analysis page) Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-24-b on `workflow-2-competition-scraping`** via build commit `283d4d1` — 9 files +1258/-32. First build session of the P-46 Workstream 4 implementation arc (Session 1 of ~2-3 estimated per §C.4). Landed the full §C.4 Session 1 scope end-to-end at code level.

**Session shape (PURE CODE — single-branch; no deploy events; ONE push planned at end-of-session):**

- Pre-build reads at session start (read `docs/COMPETITION_DATA_V2_DESIGN.md` §C.4 + §A.4 + §A.5 + §B 2026-05-24 + §B 2026-05-25 + §B 2026-05-24 W1 entry for the binding inputs).
- Rule 14f session-start pickers — TWO fired (Session 1 scope + Navigation surface placement); both decided by director per `feedback_recommendation_style.md`.
- Phase — implementation of `comprehensive-analysis.ts` DI-seam handler factory + 20 new node:test cases + thin DI-seam shim replacing W1 501-stub + new page route + AnalysisEditor + AnalysisReadView + `RichTextEditor` full-variant toolbar extension + standalone navigation button row + npm dep promotion.
- /scoreboard verification: all 5 checks GREEN at new baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / **764 src/lib +20 from baseline 744** — exact match with 20 new tests / 61 routes UNCHANGED — W1 501-stub at existing path filled in); Check 6 Playwright SKIPPED per non-deploy-session convention.
- End-of-session doc-batch covers the 8-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG with new §Entry 2026-05-24-b + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION + the new §B 2026-05-24-b entry on COMPETITION_DATA_V2_DESIGN.md).
- ONE push at end-of-session to `origin/workflow-2-competition-scraping` per the canonical pattern in `feedback_approval_scope_per_decision_unit.md` (NO main push since not a deploy session).

**§4 Step 1c forced-picker NOT FIRED** — next-session task unambiguous per §C.4 Session 2 spec (internal-hyperlink TipTap extension).

**ZERO new DEFERRED items at session end (Rule 26)** — all 17 in-session TaskCreate tasks completed cleanly.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry this session — the P-46 Workstream 4 Session 1 closing §Entry 2026-05-24-b** capturing (a) Session 1 closed at code level for W#4; (b) NEW reusable Pattern A "Per-Project edit-affordance parallel to per-row edit-affordance" memorialization; (c) NEW reusable Pattern B "Editor-as-readonly substitutes for a separate static renderer" memorialization; (d) FIRST APPLICATION of the 2026-05-24 Rule 14a tightening — the §C.4 vs. NEXT_SESSION.md pointer divergence on Session 1 scope was surfaced via Rule 14f picker rather than silently picking the pointer's recommendation; director picked the §C.4 binding spec; (e) calibration data point — Session 1 of 2-3 estimated landed in ~150-180 min (top end of recommended-scope estimate); no overrun; no fix-forward.

**TWENTY-SIXTH end-of-session run under the Rule 30 + §4 Step 4b template** (sequence prior to today: 2026-05-21-b → 2026-05-21-c → 2026-05-21-d → 2026-05-22 → 2026-05-22-b → 2026-05-21 → 2026-05-22-c → 2026-05-22-d → 2026-05-22-e → 2026-05-22-f → 2026-05-22-g → 2026-05-22-h → 2026-05-22-i → 2026-05-23 → 2026-05-24 → 2026-05-25 → 2026-05-26 → 2026-05-27 → 2026-05-28 → 2026-05-23-b → 2026-05-23-c → 2026-05-23-d → 2026-05-23-e → 2026-05-23-f → 2026-05-24 → today). The 3 plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; the P-46 Workstream 4 Session 2 build session begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at today's end-of-session doc-batch commit (the commit that lands when the parent pushes this NEXT_SESSION.md after build commit `283d4d1`). `main` should be at `ac45737` (the 2026-05-24 W3 fix-forward #5 SHA — unchanged since W3 deploy). Verify with `git log main..HEAD --oneline` — should show TWO commits ahead (build commit `283d4d1` + today's end-of-session doc-batch commit) since the build session does not deploy to main.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-46 Workstream 4 Session 2 build session, on `workflow-2-competition-scraping`.** Closes **(a.82) RECOMMENDED-NEXT**. This is the second build session of Workstream 4's ~2-3 estimated session arc per §C.4. Implement the custom TipTap extension that recognizes `#url/<urlId>` shorthand + resolves to URL detail page navigation. May also polish hyperlink-insertion affordance UI on the editor via a "Link to URL" button helper (a toolbar dropdown that lets director pick a URL from the current Project's competitor URL list + insert a hyperlink to its URL detail page without typing the shorthand syntax manually).

BUILD session — NO Rule 9 gates expected. No new schema (no schema work in W4 at all). No new npm dependencies (TipTap already landed in W2 S1; `@tiptap/extension-underline` promoted yesterday).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify both branches' SHA relationships with `git log main..HEAD --oneline` — should show TWO commits ahead (yesterday's build commit `283d4d1` + yesterday's end-of-session doc-batch commit).

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or implementation).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-46 polish-backlog entry (the Workstream sub-status grid showing WS#1+2+3 ✅ DONE-AND-VERIFIED + WS#4 Session 1 ✅ DONE-AT-CODE-LEVEL + WS#4 Session 2 NEXT per (a.82) — the binding input for today's scope).
- **`docs/COMPETITION_DATA_V2_DESIGN.md`** with focus on **§C.4 Workstream 4 implementation outline (the binding spec for the Comprehensive Analysis page) — Session 2 sub-section especially** + **§A.4 (the design decision around one Comprehensive Analysis page per Project synthesizing all platforms + competitors)** + **§A.5 (the TipTap rich-text editor library decision; the wrapper W2 S1 built supports `variant='full'` which today's session uses)** + **§B 2026-05-24-b (yesterday's Session 1 closing entry — captures Pattern A + Pattern B + the Rule 14a tightening first-application narrative + the file map of what's already built; today's Session 2 builds the internal-hyperlink TipTap extension ON TOP of yesterday's editor wrapper + page route + components)** + **§B 2026-05-25 (the W2 Session 1 entry capturing the `RichTextEditor` wrapper that today's session extends with a new custom extension)**.
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (no deploy planned this session; gate will NOT fire) + Rule 14a (the 2026-05-24 tightening — any UI-shape spec given mid-build OR pointer-vs-binding-spec divergence must be echoed into binding docs + read back BEFORE implementation lands; yesterday's Session 1 was the FIRST APPLICATION of this tightening — pattern continues today) + Rule 14f (will fire at most ONCE at session-start to confirm scope: internal-hyperlink TipTap extension + optional "Link to URL" picker, OR just the extension alone per `feedback_recommendation_style.md` if scope feels small enough to bundle) + Rule 18 (§A of `docs/COMPETITION_DATA_V2_DESIGN.md` stays frozen; §B 2026-05-XX is the new append for this build session) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit — ADDITIVE + UI-only + TIPTAP-EXTENSION) + Rule 25 (Multi-Workflow — single-branch session; workflow-2 only; no main push expected) + Rule 26 (DEFERRED items registry) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- The existing `src/app/projects/[projectId]/competition-scraping/components/RichTextEditor.tsx` (the wrapper yesterday's session extended with the full-variant toolbar — today's session adds the new custom extension to its extension list).
- The existing `src/app/projects/[projectId]/competition-scraping/comprehensive-analysis/components/AnalysisEditor.tsx` + `AnalysisReadView.tsx` (yesterday's components — today's session ensures the new TipTap extension flows through both edit + read modes).
- TipTap documentation for custom extensions — `node_modules/@tiptap/core/dist/index.d.ts` for the `Extension` + `Node` + `Mark` types; `@tiptap/extension-link` source as a reference for an extension that recognizes a pattern + renders it as a clickable element.

**Task shape (P-46 Workstream 4 Session 2 build session):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or implementation. Cover: what we'll do in the session (Workstream 4 Session 2 build — internal-hyperlink TipTap extension + optional "Link to URL" picker), the schema-change-in-flight flag stays NO (no transition; no schema work in W4), ZERO Rule 9 gates planned, ONE push planned at end-of-session.

2. **Pre-build reads** — execute the pre-build read list above. ~15-20 minutes.

3. **Rule 14f session-start scope-pick (if needed)** — confirm Session 2 scope between: (a) recommended — internal-hyperlink TipTap extension + "Link to URL" toolbar picker affordance (~90-120 min implementation; comprehensive Session 2 scope); (b) alt — just the TipTap extension this session, toolbar picker deferred to a polish-detour (~60-80 min implementation); (c) alt — just the toolbar picker this session, TipTap extension deferred (NOT recommended — picker needs the extension to render the hyperlinks correctly). Director picks; recommended path per `feedback_recommendation_style.md` is (a).

4. **Implementation** — write the new TipTap extension as a new component file (probably `src/app/projects/[projectId]/competition-scraping/comprehensive-analysis/components/UrlReferenceExtension.ts` ~100-150 LOC) extending TipTap's `Extension` API; recognizes `#url/<urlId>` patterns at parse time; renders matched patterns as styled clickable elements that open `/projects/[projectId]/competition-scraping/url/[urlId]/` when clicked. Wire the extension into the `RichTextEditor` wrapper as an opt-in extension for `variant='full'` only. If scope picks (a), also add a "Link to URL" picker affordance in the editor toolbar — probably a dropdown showing all URLs in the current Project's competitor URL list with a search filter; inserts `#url/<urlId>` shorthand at cursor position on pick. Use the same `authFetch` helper from yesterday's components to load the competitor URL list for the picker.

5. **Tests** — 5-15 new node:test cases for any pure-function pieces of the TipTap extension (the pattern-recognition logic; the URL-list filter logic if a picker affordance is included); 0-N new tests for the TipTap extension's React rendering if applicable. Most TipTap extension logic is integration-tested via the editor wrapper; pure functions get unit tests.

6. **/scoreboard verification** — all 5 checks GREEN at new baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 764-780 src/lib +0-15 from baseline 764 / 61 routes UNCHANGED — no new routes); Check 6 Playwright SKIPPED per non-deploy-session convention.

7. **End-of-session doc-batch** covers ROADMAP (header bump + P-46 entry annotated with Workstream 4 Session 2 ✅ DONE-AT-CODE-LEVEL 2026-05-XX in the Workstream sub-status grid + (a.82) closed + new (a.83) opened for Workstream 4 deploy session) + CHAT_REGISTRY (header bump — 149th Claude Code session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header bump + new §Entry IF a fix-shape ambiguity / process slip / new reusable Pattern surfaces — otherwise header bump only) + NEXT_SESSION.md (rewritten for P-46 Workstream 4 deploy session — conditional) + HANDOFF_PROTOCOL (header bump only — no new rules expected) + CLAUDE_CODE_STARTER (header bump only) + `docs/COMPETITION_DATA_V2_DESIGN.md` (NEW §B entry capturing Session 2 outcome + scope choices + any new Pattern). **ONE push** per the canonical pattern.

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** any picker that fires (Rule 14f session-start scope-pick + any sub-pickers for "Link to URL" picker shape) — surface the recommended path + default to it if director defers.

**Per Rule 14a tightening from 2026-05-24 (FIRST APPLIED yesterday in Session 1):** before writing code for any UI surface, scan the §C.4 Session 2 spec + most-recent §B entries for any sequencing/ordering/positioning language; if any feels implicit-but-not-explicit (e.g., "the TipTap extension should render hyperlinks as ... what styling? blue underlined? a custom color? icon-prefixed?"), fire a Rule 14f picker on the canonical spec BEFORE writing code. This continues the spec-capture-gap prevention from yesterday's first-application.

**Schema-change-in-flight flag:** STAYS **NO** (no `prisma db push` planned; no schema work in W4 at all; pure client-side TipTap extension).

---

## Pre-session notes (offline steps for director between sessions)

**Required offline step BEFORE the next P-46 Workstream 4 Session 2 build session:** none. All infrastructure landed in prior sessions; the build is pure client-side TipTap extension code on top of yesterday's editor wrapper + page route + components.

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking the P-46 Workstream 4 Session 2 build session at all — can happen any time. Director-independent.

**Optional offline reading for director:** `docs/COMPETITION_DATA_V2_DESIGN.md` §C.4 Workstream 4 outline — specifically the Session 2 sub-section (~2-minute skim) + the §B 2026-05-24-b entry captured yesterday (~2-minute skim of the file map + the two new Patterns + the Rule 14a tightening first-application narrative). Worth scanning before the Session 2 if director wants context for the Rule 14f session-start scope-pick.

**Pre-session setup (informational — Claude will handle in-session):** the Workstream 4 Session 2 build session begins on `workflow-2-competition-scraping`; director's involvement is the standard go-ahead after Step 7b plain-terms summary + the Rule 14f session-start scope-pick + maybe one or two sub-pickers on UI hyperlink styling decisions.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (no rebases, no force pushes, no `git reset --hard`, no `git branch -D`).

**Rule 9 triggers planned this session: ZERO** — pure build session; no deploy; no `prisma db push` (no schema work at all); no `git push origin main`; no destructive SQL.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits a 🚨 alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any implementation work.

---

## Why this pointer was written this way (debug aid)

Today's session was the **W4 Session 1 first build session** for the new Comprehensive Competitor Analysis page. The session ran cleanly through the full §C.4 Session 1 scope end-to-end at code level, exercising the FIRST APPLICATION of the 2026-05-24 Rule 14a tightening to resolve a divergence between yesterday's pointer (which had defaulted to a more conservative scope) and the binding §C.4 spec (which named the full scope). Director picked the §C.4 binding spec at the Rule 14f session-start picker; the full Session 1 scope landed in ~150-180 min within recommended-scope estimate.

The natural next-session task per §C.4 Session 2 spec is **Workstream 4 Session 2 — internal-hyperlink TipTap extension** — the next §C.4 sub-scope after Session 1's foundation (route handlers + page route + edit + read-view + navigation surface). Session 2 builds the custom TipTap extension that lets director write `#url/<urlId>` shorthand inline + have it render as a clickable hyperlink to the corresponding URL detail page; optionally also adds a "Link to URL" toolbar picker affordance for hyperlink insertion without typing shorthand manually.

- **(Recommended)** Workstream 4 Session 2 — internal-hyperlink TipTap extension + optional "Link to URL" toolbar picker. Recommended because (a) the TipTap extension is the next §C.4 sub-scope; (b) the foundation laid yesterday (the editor wrapper with `variant='full'` + the page route + the two components) is precisely the surface the new extension extends; (c) bundling the picker with the extension this session keeps related code together — the picker uses the extension's shorthand syntax to insert links.

The shape of Session 2 is **pure code + ZERO Rule 9 gates + ONE end-of-session push** — pre-build doc reads → Rule 14f session-start scope-pick (if needed) → implementation of the TipTap extension + optional toolbar picker + tests → /scoreboard verification → end-of-session doc-batch → push to workflow-2.

**After Workstream 4 Sessions 1-2 land clean + Workstream 4 deploys, Workstream 5 (Extension form additions + manual Reviews entry) is the LAST remaining workstream of P-46** — ~1-2 sessions. Then P-46 closes ✅ end-to-end. Then P-47 + P-26 + DEFERRED P-27 bugs (or absorbed obsolete) before W#2 graduation. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).

**Alternate next-session candidates if director shifts priorities at session start (after W4 Session 1 + before W4 Session 2):**

- **Defer Workstream 4 Session 2 + start P-47 Shadow DOM refactor.** NOT recommended — P-47 is LOW priority (band-aid works empirically) AND the P-46 implementation arc benefits from finishing W4 in sequence; pausing mid-W4 fragments the arc.
- **Defer Workstream 4 Session 2 + start Workstream 4 deploy session now (skip the TipTap extension).** NOT recommended — the §C.4 spec sequences the TipTap extension as Session 2 before the deploy session; deploying without the internal-hyperlink affordance would land the page in production without one of its key features (the "hyperlinks back to URL detail pages" wording in §A.4).
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time. Director-independent.
- **A polish-detour ahead of Workstream 4 Session 2 if director wants pre-build infrastructure work.** No obvious candidate this time — the operational substrate is hardened across 3 layers (P-42 backup-memory hook + P-43 absolute-paths discipline + P-44 wxt build/zip wrappers); yesterday's session ran cleanly through Session 1. If director picks this path, surface the open polish landscape as a Rule 14f forced-picker.

Check `ROADMAP.md` for the canonical state. Check `docs/COMPETITION_DATA_V2_DESIGN.md` §C.4 + §A.4 + §A.5 + §B 2026-05-24-b for Session 2's binding scope + yesterday's Session 1 closing entry.
