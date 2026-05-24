# Next session

**Written:** 2026-05-25 (`session_2026-05-25_p46-workstream-4-session-2-internal-hyperlink-tiptap-extension` — end-of-session handoff after **W#2 polish P-46 Workstream 4 (Comprehensive Competitor Analysis page) Session 2 ✅ DONE-AT-CODE-LEVEL 2026-05-25 on `workflow-2-competition-scraping`** via build commit `5854eff` — 8 files +786/-1 landing the full §C.4 Session 2 scope end-to-end at code level — the internal-hyperlink TipTap extension that lets the director write `#url/<urlId>` shorthand inline and have it render as a clickable hyperlink to the corresponding URL detail page — NEW `url-reference-helpers.ts` (~115 LOC pure helpers) + 19 new node:test cases bringing src/lib to 783 + NEW `UrlReferenceExtension.ts` (~105 LOC TipTap Extension via `addProseMirrorPlugins`) + NEW `LinkToUrlPicker.tsx` (~304 LOC toolbar dropdown lazy-loading URL list via `authFetch` with case-insensitive search filter) + MODIFIED `RichTextEditor.tsx` (+90/-1 LOC; accepts optional `projectId` prop; registers `UrlReferenceExtension`; extends `Link.configure`'s `isAllowedUri` to accept `#url/` hrefs; surfaces `LinkToUrlPicker` in 'full' toolbar when `projectId` provided; inline `<style>` with `InternalLinkStyles` for distinct styling — 🔗 emoji glyph prefix + same blue underlined per session-start picker outcome) + MODIFIED `AnalysisEditor.tsx` + `AnalysisReadView.tsx` + `comprehensive-analysis/page.tsx` all pass `projectId` through. **Headline outcome:** the per-Project Comprehensive Competitor Analysis page now supports inline internal hyperlinks — director can write `#url/<urlId>` shorthand inline OR use the new "Link to URL" toolbar dropdown to pick a URL from the current Project's competitor URL list + insert a hyperlink without typing shorthand manually; clicking the rendered hyperlink in either edit or read mode navigates to the matching URL detail page. **TWO Rule 14f forced-pickers fired at session start** — Session 2 scope (Extension + Link-to-URL picker recommended) + Visual styling of internal hyperlinks (Distinct — small URL icon prefix + same blue recommended). **ONE new reusable Pattern memorialized** — "Custom TipTap extension via `addProseMirrorPlugins` for click interception of shorthand hrefs without a custom Mark type" (pairs with W4 S1's Pattern A + Pattern B as the third W4-arc Pattern). **Schema-change-in-flight flag STAYS NO** entire session — no `prisma db push`. **Closes (a.82) RECOMMENDED-NEXT = P-46 Workstream 4 Session 2.** **Opens (a.83) RECOMMENDED-NEXT = P-46 Workstream 4 deploy session** on `workflow-2-competition-scraping` per §C.4 Session 3 spec — Phase-4 deploy ff-merging `workflow-2-competition-scraping` → `main` carrying W4 Sessions 1+2 build commits + doc-batch commits → Vercel auto-redeploy → ping-pong sync → Phase-4 director real-Chrome cross-platform verify across the new Comprehensive Analysis page surface.

---

## What we did this session (in plain terms)

Today was the **Workstream 4 Session 2 build session for P-46** — building the second half of the new Comprehensive Competitor Analysis page that shipped yesterday at code level. Yesterday's session built the page itself (edit mode + read mode + per-Project rich-text doc + last-edited timestamp). Today's session added the internal-hyperlink feature that lets the director link from anywhere inside the rich-text doc to a specific competitor URL's detail page.

What happened, in plain terms:

- **Two pickers at session start, both decided by director.** The first picker asked "how much of the internal-hyperlink feature should land in Session 2?" — director picked the recommended option: bundle the TipTap extension + the "Link to URL" toolbar picker affordance together this session (over deferring the picker to a polish-detour or shipping only the picker). Rationale captured in the picker label — the picker is the user-facing affordance that makes the shorthand discoverable + ergonomic; without it, only users who already know the `#url/<urlId>` syntax can use the feature. The second picker asked "what visual styling should distinguish internal hyperlinks from external links?" — director picked the recommended option: same blue underlined treatment as external links, BUT with a small 🔗 emoji glyph prefix signaling "internal URL navigation" (over identical styling or a different color).
- **The full Session 2 scope landed end-to-end at code level.** A new pure-helpers module `url-reference-helpers.ts` lives in `src/lib/rich-text/` with five small testable functions covering href parsing + path building + URL filtering + label derivation. 19 new node:test cases cover the helpers.
- **A new TipTap extension `UrlReferenceExtension.ts` landed** in `components/`. It uses TipTap's `addProseMirrorPlugins` hook to add a ProseMirror plugin that intercepts clicks on `<a href="#url/<urlId>">` shapes (in both edit + read modes) and calls a consumer-supplied callback with the extracted `<urlId>`. The trick: it reads the raw href via `getAttribute('href')` rather than the browser-resolved `link.href` property — the latter would have included the current page path and made the prefix match harder.
- **A new toolbar dropdown component `LinkToUrlPicker.tsx` landed.** Clicking the dropdown opens a list of all URLs in the current Project's competitor URL list (lazy-loaded via `authFetch` on first open + cached). A search box filters case-insensitively. Picking a URL inserts text at the cursor + applies the Link mark with the matching `#url/<urlId>` href.
- **The shared `RichTextEditor.tsx` wrapper picked up an optional `projectId` prop.** When provided, it (a) registers the new `UrlReferenceExtension` with a click handler that calls `router.push(/projects/<projectId>/competition-scraping/url/<urlId>/)`; (b) extends the existing Link mark's `isAllowedUri` to accept `#url/` hrefs (otherwise the Link extension's default would silently strip the mark on paste); (c) surfaces the new `LinkToUrlPicker` in the 'full' toolbar variant only. The `projectId` + `router` are stored in refs so the click handler (registered ONCE at editor mount) always sees the current values without stale-closure bugs.
- **A small CSS attribute selector emits the 🔗 emoji prefix** via `.plos-rt-editor a[href^="#url/"]::before { content: "🔗 "; }`. The selector reuses the Extension's recognition criterion (the `#url/` prefix), so the styling + the click interception share their criterion + can't drift apart.
- **The three page-side components** (`AnalysisEditor.tsx` + `AnalysisReadView.tsx` + `comprehensive-analysis/page.tsx`) got tiny pass-through edits to thread the `projectId` (already in scope via `useParams()`) through to the editor wrapper.
- **One new reusable Pattern memorialized** — "Custom TipTap extension via `addProseMirrorPlugins` for click interception of shorthand hrefs without a custom Mark type." Captures the design choice to reuse the Link mark + add an Extension (not a new Mark) + key off the raw href via `getAttribute` + delegate resolution to a consumer callback + handle visual distinctness via a CSS attribute selector rather than a Mark-level type discriminator. Pairs with W4 S1's Pattern A + Pattern B as the third W4-arc Pattern.
- **All 6 /scoreboard checks GREEN at new baselines** — root tsc clean / extension tsc clean / 558 ext UNCHANGED / **783 src/lib +19 from baseline 764** (exact match with 19 new url-reference-helpers.test.ts cases) / **62 routes UNCHANGED** (no new route paths). Check 6 Playwright SKIPPED per non-deploy-session convention.
- **Schema-change-in-flight flag STAYS NO** the entire session. No `prisma db push`. Pure client-side TipTap extension on top of W4 S1's editor wrapper + page route + components.

**Session 2 of 2-3 estimated landed cleanly within bundled scope** — ~150-180 min total duration; no overrun; no fix-forward; all 7 in-session TaskCreate tasks completed cleanly. **W4 implementation arc is now COMPLETE at code level across Sessions 1-2 of ~2-3 estimated** — landed at the low end of the estimate, leaving budget for the single deploy session as the third W4 session.

## What we'll do next session (in plain terms)

Next session is the **P-46 Workstream 4 deploy session** — Phase-4 deploy of W4 Sessions 1+2 to vklf.com.

What the deploy session covers:

- **Pre-deploy /scoreboard verification** on `workflow-2-competition-scraping` — all 5 checks GREEN at the new W4 S2 baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 783 src/lib / 62 routes UNCHANGED). Check 6 Playwright probably SKIPPED per Rule 27 (no `extensions/` source files in the ff-merge bundle).
- **ff-merge** `workflow-2-competition-scraping` → `main` — fast-forward carrying 4 commits (`283d4d1` W4 S1 build + `8b30ab3` W4 S1 doc-batch + `5854eff` W4 S2 build + today's W4 S2 doc-batch). One Rule 9 gate fires for `git push origin main` (director-Yes required per Rule 9).
- **Vercel auto-redeploy** kicks in after the main push. ~2-3 minute build + cache invalidation. Site refreshes at vklf.com.
- **Ping-pong sync** — `git push origin workflow-2-competition-scraping` to bring the feature branch up to match main.
- **Post-merge /scoreboard verification** on main — confirm all 5 checks still GREEN at the same baselines.
- **Phase-4 director real-Chrome cross-platform verification** across the new Comprehensive Analysis page surfaces — director navigates from the Competition Data page via the standalone "→ Comprehensive Competitor Analysis" button, lands on the new page, toggles edit mode, types some content + an internal `#url/<urlId>` shorthand reference + uses the new "Link to URL" toolbar dropdown to insert a hyperlink, clicks Done, then clicks one of the rendered hyperlinks in read mode + confirms it navigates to the URL detail page. Cross-platform = Amazon + Ebay + Walmart + Etsy + Aliexpress + Macys + Bestbuy (or single-platform pick per director).
- **Fix-forward in-session if any Phase-4 issues surface** — per the "Phase-4 verification fix-forward cascade in a single deploy session" Pattern memorialized 2026-05-24 (W3 deploy session set the high-water mark at 5 fix-forwards in one deploy session). Each fix-forward is its own build commit + own Rule 9 gate + own Phase-4 reverify cycle.

**Schema-change-in-flight flag** STAYS **NO** at the W4 deploy session start (no schema work in W4 at all; the `ComprehensiveCompetitorAnalysis` Prisma model has been live since W1's 2026-05-24 schema + deployed since W2's 2026-05-23-c).

**After Workstream 4 ships,** Workstream 5 (Extension form additions + manual Reviews entry) is the last remaining workstream of P-46 — ~1-2 sessions adding Type / Description-1 / Description-2 / Price fields to the extension URL save form so director can capture these fields at extension time + manual Reviews entry tweaks on vklf.com based on real-Chrome usage. Then a Workstream 5 deploy closes the P-46 arc end-to-end.

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-25 (Workstream 4 Session 2 ✅ DONE-AT-CODE-LEVEL; W4 implementation arc COMPLETE at code level):

- **P-46 Workstream 4 deploy session** (NEXT). 1 session. Phase-4 deploy of W4 Sessions 1+2 to vklf.com via ff-merge `workflow-2-competition-scraping` → `main`. Vercel auto-redeploy + ping-pong sync + Phase-4 director real-Chrome cross-platform verify across the new Comprehensive Analysis page surfaces. Schema-change-in-flight flag stays NO (no schema work in W4 at all).
- **P-46 Workstream 5 (Extension form additions + manual Reviews entry).** ~1-2 sessions per §C.5. Adds Type / Description-1 / Description-2 / Price fields to the extension URL save form. One deploy session ends this workstream + closes the P-46 arc.
- **P-47 Shadow DOM refactor (LOW; AFTER P-46).** ~2-3 sessions. Replaces the 80-event-listener band-aid from P-45 Build #2's Issue 2 fix with proper Shadow DOM isolation. LOW priority since band-aid works empirically.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions. Current two-captures workaround works fine. May be reduced in urgency now that W#2 + W#3 surfaces are deployed.
- **P-27 Bug #9 (Amazon hover-preview deeper-walk) + Bug #15 (Ebay native-controls quirk) — DEFERRED LOW.** May be obsolete now that P-46 redesigned the URL detail page + Competition Data table surfaces they live in.
- **W#2 graduation** after P-46 + P-47 + P-26 ship. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent; can happen any time.

---

**For:** the next Claude Code session — **P-46 Workstream 4 deploy session** (estimated ~60-180 min depending on whether Phase-4 verify surfaces any fix-forwards: pre-build doc reads ~10-15 min + pre-deploy /scoreboard ~5-10 min + ff-merge + Rule 9 gate + main push + Vercel build wait ~5-10 min + ping-pong sync ~2 min + post-merge /scoreboard ~5-10 min + Phase-4 director real-Chrome verification ~15-30 min + 0-N fix-forwards ~10-30 min each + end-of-session doc-batch ~20-30 min). Per Rule 23 Change Impact Audit: **SCHEMA-AWARE CODE DEPLOY** (W4 Sessions 1+2's pure-UI + route-handler code consuming the already-live `ComprehensiveCompetitorAnalysis` Prisma model). **Schema-change-in-flight flag stays NO** (no transition; no schema work in W4 at all). **Rule 9 triggers planned this session: ONE (minimum) — `git push origin main` for the initial deploy ff-merge.** Additional Rule 9 gates fire for any fix-forward pushes. **Pushes planned per `feedback_approval_scope_per_decision_unit.md`:** ~3 minimum (one main deploy push + one ping-pong sync push + one end-of-session doc-batch push), more if fix-forwards land in-session.

---

## Status of today's session

**W#2 polish P-46 Workstream 4 (Comprehensive Competitor Analysis page) Session 2 ✅ DONE-AT-CODE-LEVEL 2026-05-25 on `workflow-2-competition-scraping`** via build commit `5854eff` — 8 files +786/-1. Second build session of the P-46 Workstream 4 implementation arc (Session 2 of ~2-3 estimated per §C.4). Landed the full §C.4 Session 2 scope end-to-end at code level — the internal-hyperlink TipTap extension + the "Link to URL" toolbar picker affordance.

**Session shape (PURE CODE — single-branch; no deploy events; ONE push planned at end-of-session):**

- Pre-build reads at session start (read `docs/COMPETITION_DATA_V2_DESIGN.md` §C.4 + §A.4 + §A.5 + §B 2026-05-24-b for the binding inputs).
- Rule 14f session-start pickers — TWO fired (Session 2 scope + Visual styling of internal hyperlinks); both decided by director per `feedback_recommendation_style.md`.
- Phase — implementation of `url-reference-helpers.ts` pure helpers + 19 new node:test cases + `UrlReferenceExtension.ts` TipTap Extension + `LinkToUrlPicker.tsx` toolbar dropdown + `RichTextEditor.tsx` extension registration + `Link.configure` `isAllowedUri` widening + inline `<style>` for the 🔗 prefix + projectId pass-through on three page-side components.
- /scoreboard verification: all 6 checks GREEN at new baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / **783 src/lib +19 from baseline 764** — exact match with 19 new tests / 62 routes UNCHANGED — no new route paths); Check 6 Playwright SKIPPED per non-deploy-session convention.
- End-of-session doc-batch covers the 8-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG with new §Entry 2026-05-25 + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION + the new §B 2026-05-25 entry on COMPETITION_DATA_V2_DESIGN.md).
- ONE push at end-of-session to `origin/workflow-2-competition-scraping` per the canonical pattern in `feedback_approval_scope_per_decision_unit.md` (NO main push since not a deploy session).

**§4 Step 1c forced-picker NOT FIRED** — next-session task unambiguous per §C.4 Session 3 spec (deploy session) + the "Multi-session workstream deploy gate timing" reusable Pattern memorialized 2026-05-23-c.

**ZERO new DEFERRED items at session end (Rule 26)** — all 7 in-session TaskCreate tasks completed cleanly.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry this session — the P-46 Workstream 4 Session 2 closing §Entry 2026-05-25** capturing (a) Session 2 closed at code level for W#4; W4 implementation arc COMPLETE at code level across Sessions 1-2 of ~2-3 estimated; (b) NEW reusable Pattern "Custom TipTap extension via `addProseMirrorPlugins` for click interception of shorthand hrefs without a custom Mark type" memorialization; (c) TWO Rule 14f forced-pickers fired at session start — Session 2 scope + visual styling — both decided by director per `feedback_recommendation_style.md`; (d) calibration data point — Session 2 of 2-3 estimated landed cleanly within bundled scope.

**TWENTY-SEVENTH end-of-session run under the Rule 30 + §4 Step 4b template** (sequence prior to today: 2026-05-21-b → 2026-05-21-c → 2026-05-21-d → 2026-05-22 → 2026-05-22-b → 2026-05-21 → 2026-05-22-c → 2026-05-22-d → 2026-05-22-e → 2026-05-22-f → 2026-05-22-g → 2026-05-22-h → 2026-05-22-i → 2026-05-23 → 2026-05-24 → 2026-05-25 → 2026-05-26 → 2026-05-27 → 2026-05-28 → 2026-05-23-b → 2026-05-23-c → 2026-05-23-d → 2026-05-23-e → 2026-05-23-f → 2026-05-24 → 2026-05-24-b → today 2026-05-25). The 3 plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; the P-46 Workstream 4 deploy session begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at today's end-of-session doc-batch commit. `main` should be at `ac45737` (the 2026-05-24 W3 fix-forward #5 SHA — unchanged since W3 deploy). Verify with `git log main..HEAD --oneline` — should show FOUR commits ahead (`283d4d1` W4 S1 build + `8b30ab3` W4 S1 doc-batch + `5854eff` W4 S2 build + today's W4 S2 doc-batch). These four commits are what the deploy ff-merge will carry to main.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-46 Workstream 4 deploy session, on `workflow-2-competition-scraping` → `main`.** Closes **(a.83) RECOMMENDED-NEXT**. This is the deploy session of Workstream 4's ~2-3 estimated session arc per §C.4 — ff-merging the W4 S1 + W4 S2 build commits + their doc-batch commits to main, triggering Vercel auto-redeploy to vklf.com, ping-ponging the sync back to the feature branch, and Phase-4 director real-Chrome cross-platform verifying the new Comprehensive Analysis page surfaces.

DEPLOY session — ONE Rule 9 gate fires for the initial deploy ff-merge `git push origin main`. Additional Rule 9 gates fire for any fix-forward pushes. No new schema (no schema work in W4 at all). No new npm dependencies (TipTap landed in W2 S1; `@tiptap/extension-underline` promoted in W4 S1; no new deps in W4 S2).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify both branches' SHA relationships with `git log main..HEAD --oneline` — should show FOUR commits ahead.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or implementation).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-46 polish-backlog entry (the Workstream sub-status grid showing WS#1+2+3 ✅ DONE-AND-VERIFIED + WS#4 Sessions 1+2 ✅ DONE-AT-CODE-LEVEL + WS#4 deploy session NEXT per (a.83) — the binding input for today's deploy mechanics).
- **`docs/COMPETITION_DATA_V2_DESIGN.md`** with focus on **§C.4 Workstream 4 implementation outline — Session 3 sub-section (deploy session)** + **§A.4 + §A.5 (the design decisions Sessions 1-2 consumed)** + **§B 2026-05-24-b (W4 S1's closing entry — captures Pattern A + Pattern B + the Rule 14a tightening first-application)** + **§B 2026-05-25 (today's W4 S2 closing entry — captures the third W4-arc Pattern + file map of everything Sessions 1+2 built)**.
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (deploy gate fires this session for `git push origin main`) + Rule 14f (will fire at most ONCE at session-start to confirm deploy-now vs. defer if any pre-deploy concern surfaces) + Rule 18 (§A frozen; §B new entry for the deploy session) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit — SCHEMA-AWARE CODE DEPLOY) + Rule 25 (Multi-Workflow — main push expected today; ping-pong sync also expected) + Rule 26 (DEFERRED items registry) + Rule 27 (Playwright SKIP condition — no `extensions/` source files in ff-merge bundle) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `feedback_approval_scope_per_decision_unit.md` (deploy push count + ping-pong + doc-batch push pattern).

**Task shape (P-46 Workstream 4 deploy session):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or implementation. Cover: what we'll do in the session (Workstream 4 deploy — ff-merge to main → Vercel auto-redeploy → ping-pong sync → Phase-4 verify), the schema-change-in-flight flag stays NO (no transition; no schema work in W4), ONE Rule 9 gate planned minimum (initial deploy push), additional Rule 9 gates for any fix-forwards.

2. **Pre-build reads** — execute the pre-build read list above. ~10-15 minutes.

3. **Rule 14f session-start confirmation (if needed)** — confirm deploy-now is the right call (no pre-deploy concerns). Director picks; recommended path per `feedback_recommendation_style.md` is deploy-now.

4. **Pre-deploy /scoreboard verification** on `workflow-2-competition-scraping` — all 5 checks GREEN at the W4 S2 baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 783 src/lib / 62 routes UNCHANGED). Check 6 Playwright SKIPPED per Rule 27 (no `extensions/` source files in ff-merge bundle).

5. **ff-merge + main push** — `git checkout main && git merge --ff-only workflow-2-competition-scraping && git push origin main` (Rule 9 gate fires here — director-Yes required). Vercel auto-redeploy kicks in.

6. **Ping-pong sync** — `git push origin workflow-2-competition-scraping` to bring the feature branch up to match main.

7. **Post-merge /scoreboard verification** on main — confirm all 5 checks still GREEN at the same baselines.

8. **Phase-4 director real-Chrome cross-platform verification** across the new Comprehensive Analysis page surfaces — director navigates from Competition Data → new standalone button → Comprehensive Analysis page → edit mode → types content + uses internal-hyperlink syntax + uses Link-to-URL picker → Done → click rendered hyperlink → confirms navigation. Cross-platform = Amazon + Ebay + Walmart + Etsy + Aliexpress + Macys + Bestbuy.

9. **Fix-forward in-session if any Phase-4 issues surface** — per the "Phase-4 verification fix-forward cascade in a single deploy session" Pattern memorialized 2026-05-24. Each fix-forward is its own build commit + own Rule 9 gate + own Phase-4 reverify cycle.

10. **End-of-session doc-batch** covers ROADMAP (header bump + P-46 entry annotated with Workstream 4 ✅ DONE-AND-VERIFIED 2026-05-XX on vklf.com via ff-merge `<SHA range>` + (a.83) closed + new (a.84) opened for Workstream 5 first build session) + CHAT_REGISTRY (header bump — 150th Claude Code session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header bump + new §Entry IF any fix-forward / process slip / new reusable Pattern surfaces) + NEXT_SESSION.md (rewritten for P-46 Workstream 5 first build session) + HANDOFF_PROTOCOL (header bump only — no new rules expected) + CLAUDE_CODE_STARTER (header bump only) + `docs/COMPETITION_DATA_V2_DESIGN.md` (NEW §B entry capturing deploy outcome + any fix-forwards + Phase-4 verification narrative). **Multi-push pattern** per the W3 deploy session 2026-05-24 precedent (1 main deploy push + 1 ping-pong sync + 0-N fix-forward pushes + 1 end-of-session doc-batch push + 1 final ping-pong).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** any picker that fires (Rule 14f session-start confirmation + any sub-pickers during deploy) — surface the recommended path + default to it if director defers.

**Per Rule 14a tightening from 2026-05-24:** before deploying, scan §C.4 Session 3 spec + the most-recent §B entries for any deploy-time sequencing/ordering/positioning language that might have been implicit-but-not-explicit; if anything feels under-specified, fire a Rule 14f picker on the canonical spec BEFORE deploying.

**Schema-change-in-flight flag:** STAYS **NO** (no `prisma db push` planned; no schema work in W4 at all; pure deploy of W4 S1 + S2's UI + route-handler code consuming the already-live `ComprehensiveCompetitorAnalysis` Prisma model).

---

## Pre-session notes (offline steps for director between sessions)

**Required offline step BEFORE the next P-46 Workstream 4 deploy session:** none. Vercel auto-redeploy will kick in after the main push; director's involvement is the Rule 9 gate Yes + the Phase-4 real-Chrome verification at the end.

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking the P-46 Workstream 4 deploy session at all — can happen any time. Director-independent.

**Optional offline reading for director:** `docs/COMPETITION_DATA_V2_DESIGN.md` §C.4 Workstream 4 outline — specifically the Session 3 (deploy) sub-section + the §B 2026-05-25 entry captured today (~3-minute skim of the file map + the new Pattern + the visual-styling sub-decision). Worth scanning if director wants context for the Phase-4 verification surfaces.

**Pre-session setup (informational — Claude will handle in-session):** the Workstream 4 deploy session begins on `workflow-2-competition-scraping`; director's involvement is the standard go-ahead after Step 7b plain-terms summary + the Rule 9 gate Yes at the initial deploy push + the Phase-4 real-Chrome verification.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (no rebases, no force pushes, no `git reset --hard`, no `git branch -D`). The ff-merge is fast-forward only — no rebase, no merge commit.

**Rule 9 triggers planned this session: ONE MINIMUM** — the initial deploy `git push origin main`. Additional Rule 9 gates fire for any in-session fix-forward `git push origin main` pushes (per the "Phase-4 verification fix-forward cascade" Pattern, this could be 0-5 additional gates).

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits a 🚨 alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any deploy work.

---

## Why this pointer was written this way (debug aid)

Today's session was the **W4 Session 2 build session** for the new Comprehensive Competitor Analysis page. The session ran cleanly through the full §C.4 Session 2 scope end-to-end at code level — the internal-hyperlink TipTap extension + the "Link to URL" toolbar picker affordance + the visual-distinctness signal via a CSS attribute selector. Director picked the bundled-scope Recommended option at the Rule 14f session-start picker (Extension + Link-to-URL picker together); director picked the Distinct-with-URL-icon-prefix option for the visual styling. The W4 implementation arc is now COMPLETE at code level across Sessions 1-2 of ~2-3 estimated.

The natural next-session task per §C.4 Session 3 spec is **Workstream 4 deploy session** — ff-merging W4 Sessions 1+2's build commits + their doc-batch commits to main (4 commits total) + Vercel auto-redeploy + ping-pong sync + Phase-4 director real-Chrome cross-platform verification across the new Comprehensive Analysis page surfaces.

- **(Recommended)** Workstream 4 deploy session — ff-merge → Vercel → Phase-4 verify. Recommended because (a) the W4 implementation arc is now complete at code level across Sessions 1-2; (b) the "Multi-session workstream deploy gate timing" Pattern memorialized 2026-05-23-c says the deploy session lands after the LAST build session that contains user-visible UI — today's W4 S2 is that last build session; (c) deploying now keeps the implementation arc tight + lets director see the feature in production before context drifts to W#5.

The shape of the deploy session is **deploy + verify + 0-N fix-forwards + ONE end-of-session doc-batch + multiple pushes** — pre-build doc reads → Rule 14f session-start confirmation → pre-deploy /scoreboard → ff-merge → Rule 9 gate → main push → Vercel build wait → ping-pong sync → post-merge /scoreboard → Phase-4 director real-Chrome verify → 0-N fix-forwards → end-of-session doc-batch → final push to workflow-2.

**After Workstream 4 ships ✅ DONE-AND-VERIFIED on vklf.com, Workstream 5 (Extension form additions + manual Reviews entry) is the LAST remaining workstream of P-46** — ~1-2 sessions. Then P-46 closes ✅ end-to-end. Then P-47 + P-26 + DEFERRED P-27 bugs (or absorbed obsolete) before W#2 graduation. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).

**Alternate next-session candidates if director shifts priorities at session start (after W4 Session 2 + before W4 deploy):**

- **Defer Workstream 4 deploy + start a Workstream 4 Session 3 BUILD session (third build session within the estimated 2-3 range).** NOT recommended — the §C.4 spec sized W4 at ~2-3 estimated sessions with Sessions 1+2 covering all the build scope; today's session landed at the low end of the estimate, meaning W4's code-level work is complete. Adding a third build session without a director-named build target would dilute the implementation arc.
- **Defer Workstream 4 deploy + start P-47 Shadow DOM refactor.** NOT recommended — P-47 is LOW priority (band-aid works empirically) AND deploying W4 first lets director see the new feature in production before context drifts.
- **Defer Workstream 4 deploy + start Workstream 5 (Extension form additions) build session.** NOT recommended — W4 is sequenced BEFORE W5 per Q10's locked sequencing; deploying W4 first keeps the implementation arc tight + reduces cross-workstream context-switching.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time. Director-independent.

Check `ROADMAP.md` for the canonical state. Check `docs/COMPETITION_DATA_V2_DESIGN.md` §C.4 + §A.4 + §A.5 + §B 2026-05-24-b + §B 2026-05-25 for the W4 deploy session's binding context.
