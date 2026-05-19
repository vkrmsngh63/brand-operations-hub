# Next session

**Written:** 2026-05-19-d (REVISED post-handoff after director correction — `session_2026-05-19-d_w2-main-deploy-session-25-p16-sw-mv3-crash-diagnostics-DEPLOYED`).

**For:** the next Claude Code session.

**Status of today's W#2 → main deploy session #25:** P-16 service worker MV3 crash diagnostics SHIPPED + DEPLOYED + REAL-CHROME WIRING-VERIFIED on vklf.com (commit `07416d3`). Pre-deploy + post-merge scoreboards both GREEN: tsc / ext tsc / `npm run build` 53 routes / src/lib node:test 527/527 / extension `npm test` **358/358** (was 352; +6 new sw-error-logging cases) / Playwright 75/75. Fresh zip `plos-extension-2026-05-19-w2-deploy-25.zip` at repo root.

**Closes (a.46) RECOMMENDED-NEXT.** P-16 was the last open W#2 polish item with concrete CODE-LEVEL CRASH-DIAGNOSTIC work — but **6 W#2 polish items remain open** that the director has explicitly stated must ship before W#2 is deemed complete: P-24 (saved-image indicator) + P-25 (captured-text haze indicator) + P-23 (saved-URL dropdown side-by-side) + P-22 (Playwright cross-platform slices 2-4) + P-18 (devcontainer Chromium libs) + P-26 (below-fold full-page-scroll capture). Estimated ~7-12 more W#2 polish sessions before graduation.

**Picker-correction note:** The original §4 Step 1c forced-picker at end-of-session 2026-05-19-d offered (A) W#2 Tool Graduation [recommended] + (B) W#3 first session + (C) W#1 re-entry — but omitted the actually-correct option (D) ship remaining W#2 polish items before graduating. Director flagged the omission post-handoff: *"All these things should ship before Workflow #2 is deemed complete."* New §4 Step 1c picker fired with the correct option set. Director picked **(a.47) RECOMMENDED-NEXT = W#2 polish P-24 saved-image indicator on `workflow-2-competition-scraping`**. Slip captured in CORRECTIONS_LOG 2026-05-19-d §Entry. See `feedback_recommendation_style.md` for the standing rule (always recommend most-thorough-and-reliable; in this case "ship the open polish items before graduating" was more thorough than "graduate now with items moving to sidecar").

---

## Branch

**`workflow-2-competition-scraping`** — W#2 polish work, NOT platform-wide. The `./resume` script will switch you from `main` (where today's 2026-05-19-d session ended after the corrective doc-batch push) → `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`, not `main`. If you're still on `main` after `./resume`, STOP and surface to director.

Expected branch state on entry: `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` AND exactly even with `origin/main`. Both branches at the same SHA after today's deploy-#25 main push + ping-pong sync + initial end-of-session doc-batch + this corrective doc-batch.

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**Ship P-24 — saved-image indicator on the page (green ✓ icon overlay on `<img>` elements that are already saved to PLOS for the current CompetitorUrl)** on `workflow-2-competition-scraping` (ROADMAP W#2 polish backlog P-24 entry; ROADMAP Active Tools (a.47) RECOMMENDED-NEXT). Goal: close the UX gap where users can save the same image multiple times without realizing — symmetric with the existing URL ✓ indicator that ships on saved competitor URLs since session 3. Closes (a.47) RECOMMENDED-NEXT.

Branch is `workflow-2-competition-scraping`. Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Fix shape (per ROADMAP W#2 polish backlog P-24 entry; ~300-500 LOC + new Playwright spec slice):**

1. NEW `extensions/competition-scraping/src/lib/content-script/already-saved-image-icon.ts` (~80 LOC mirror of `already-saved-icon.ts`) — exports `attachAlreadySavedImageIcon(imgEl, opts)` + `detachAlreadySavedImageIcon(imgEl)`; attaches a small green ✓ icon overlay positioned at image's top-right corner (z-index above page content) using same color/size/halo treatment as the URL icon (28×28 vibrant emerald with 3px white border + green halo ring + drop shadow per the visibility-boost shipped at f4226ca during Waypoint #1 polish).

2. `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` — extend MutationObserver scan logic to walk image elements (in addition to anchor elements). For each `<img>` discovered, mark with `data-plos-cs-image-handled` flag (mirror of `ATTR_LINK_HANDLED`). Match logic per image: consider both `currentSrc`/`src` exact match AND saved CapturedImage's `original_src_url` field (W#2 sessions 5-6 stored both). Attach helper on match; detach on URL change / cleanup.

3. **API question to resolve at session start:** does `/api/projects/[projectId]/competition-scraping/urls/[urlId]/images` already return all saved CapturedImage rows including `original_src_url`? Read the route handler at `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/images/route.ts` first. If yes, reuse via the existing `listCapturedImages` API client call (or add it if not yet exported in `extensions/competition-scraping/src/lib/api-client.ts`). If no, surface to director — either add `original_src_url` to the existing response shape (additive — no breaking change) or add a new endpoint `/images/listByUrl` (less preferred — duplicates).

4. **Per Rule 23 Change Impact Audit (pre-classify before code):** ADDITIVE — new content-script helper + orchestrator extension; possibly additive API response field if `original_src_url` not already included. ZERO schema change (CapturedImage table already has both `src_url` + `original_src_url`); ZERO breaking change to existing API consumers; ZERO behavior change for users without saved images on the page.

**Diagnosis steps before coding (these may change the fix shape):**

1. Read `extensions/competition-scraping/src/lib/content-script/already-saved-icon.ts` end-to-end — that's the reference shape for the new image-icon module.
2. Read `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` — find the existing anchor-scanning + icon-attaching logic; the image-side flow mirrors it.
3. Read `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/images/route.ts` — confirm `original_src_url` is returned in the response payload. If not, add it (additive change).
4. Read `extensions/competition-scraping/src/lib/api-client.ts` — confirm there's a `listCapturedImages(projectId, urlId)` function (or similar) already exported. If not, add it.
5. Surface any API-shape question to director BEFORE coding the helper.

**Test coverage decision (Rule 27 forced-picker at session start):**

- (A) Hybrid — unit tests on `already-saved-image-icon` attach/detach logic + Playwright extension-context spec slice covering the icon-renders-on-saved-image path (parallel to existing P-14 highlight-flashing.spec.ts).
- (B) Node:test only — extract the match logic to a pure helper and unit-test it; defer Playwright to a follow-up polish session (P-22 slice).
- (C) Director manual walkthrough only after sideload + deploy — no automated regression coverage; relies on natural-use to surface regressions.
- (D) Escape hatch.

Per `feedback_recommendation_style.md` (most thorough/reliable): **Option (A) Hybrid is the right pick** — code-level regression coverage on the attach/detach mechanics + Playwright regression spec catches future content-script DOM-walk regressions; pairs with director real-website verification at deploy time.

**Pre-deploy verification scoreboard targets (expected baselines from today's deploy session #25 post-state):**

- `npx tsc --noEmit` clean
- `cd extensions/competition-scraping && npx tsc --noEmit` clean
- `npm run build` clean — **53 routes** (unchanged if no new route; +1 if new endpoint added)
- `src/lib` node:test: **527/527** unchanged (or +N if API-route tests added)
- Extension `npm test`: **358/358** baseline + new already-saved-image-icon cases (~+5-10 expected → ~363-368)
- Playwright: **75/75** baseline + new image-saved-icon spec slice (~+2-5 expected → ~77-80)

**Deploy mechanics (cheat-sheet b — standard W#2 → main deploy):** unchanged. Pre-deploy scoreboard → rebase if main moved → ff-merge → post-merge scoreboard → Rule 9 gate → push main → ping-pong sync → fresh extension build → director sideload + manual verification on real competitor URL with multiple saved images.

**Director real-website verification at deploy time (Rule 27 scope exception — visual judgment + real-platform DOM):** open a competitor URL (Amazon/Walmart/eBay/Etsy) that has 2+ saved images on its URL detail page in PLOS; sideload fresh extension build; confirm green ✓ icon overlay appears on the page's `<img>` elements that match saved images, and does NOT appear on other images on the page. Cross-platform smoke (1 image per platform) confirms zero regression on platforms without saved images.

**Group A docs to update at end-of-session:** ROADMAP (header + (a.47) → flip ✅ DONE + new (a.48) RECOMMENDED-NEXT — likely P-25 captured-text haze indicator as the next-highest-severity polish item, OR director picks one of P-23 / P-22 / P-18 / P-26); CHAT_REGISTRY (new top entry); DOCUMENT_MANIFEST (header); CORRECTIONS_LOG (header bump + any new entries); NEXT_SESSION (rewritten for the next polish item).

**Group B docs to update at end-of-session:** COMPETITION_SCRAPING_VERIFICATION_BACKLOG (new Deploy session #26 entry + P-24 flipped ✅ DONE); COMPETITION_SCRAPING_DESIGN may need a §B entry capturing the orchestrator extension + image-icon helper design choices.

**Schema-change-in-flight flag:** stays "No" for this entire session (CapturedImage table already has the `original_src_url` column needed; no migration required).

Start by running the mandatory start-of-session sequence.

**Pre-build read list (in addition to mandatory start-of-session sequence):**

- `extensions/competition-scraping/src/lib/content-script/already-saved-icon.ts` — reference shape for the new image-icon module.
- `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` — find existing anchor-scan + icon-attach logic; mirror for images.
- `extensions/competition-scraping/src/lib/api-client.ts` — check for existing `listCapturedImages` (or similar) function; add if missing.
- `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/images/route.ts` — verify `original_src_url` returned in response.
- `extensions/competition-scraping/src/lib/shared-types/competition-scraping.ts` (or wherever CapturedImage type lives) — confirm `original_src_url` field on the DTO.
- ROADMAP W#2 polish backlog P-24 entry — full fix shape narrative + alternatives evaluated.

## Pre-session notes (optional, offline steps to do between sessions)

If you can: before the next session, identify 2-3 competitor URLs on real Amazon/Walmart/eBay/Etsy pages that have multiple images saved to PLOS — those will be your test cases at deploy-time verification. Open the URL detail page in PLOS and confirm 2+ saved images are visible. If you don't have any URLs with multiple saved images, capture 2-3 images during natural use this week so there's something to verify against. No big deal if not — Claude can also create test data via the manual-add image modal (P-29 Slice #3) at session-start.

## Why this pointer was written this way (debug aid)

Today's session shipped P-16 successfully + then I (Claude) made a §4 Step 1c picker-omission slip at end-of-session: my initial picker offered Tool Graduation as the recommended next step on the premise that P-16 was the last open W#2 polish item. Director caught the slip post-handoff: there are 6 OPEN W#2 polish items in the backlog (P-18 / P-22 / P-23 / P-24 / P-25 / P-26) and the director wants ALL of them shipped before W#2 is deemed complete. Re-fired the §4 Step 1c picker with the correct option set; director picked P-24 (saved-image indicator) as the next polish item — MEDIUM severity, no schema change, symmetric UX with the existing URL ✓ icon, lowest-risk-per-impact of the open items per `feedback_recommendation_style.md`. After P-24 ships, ~6-11 more polish sessions remain before W#2 graduation; the natural next pick after P-24 is P-25 (captured-text haze indicator) which is the symmetric UX for text, but director picks per §4 Step 1c forced-picker at each end-of-session.

**Alternate next-session candidates if director shifts priorities at session start:**

- P-25 captured-text haze indicator (MEDIUM, parallel to P-24 — schema change required so `schema-change-in-flight` flips to Yes).
- P-23 saved-URL dropdown side-by-side (LOW-MEDIUM, smaller UX clarity fix — short single-session ship; good pick for a quick win between heavier P-24/P-25).
- P-22 Playwright cross-platform slices 2-4 (MEDIUM coverage extension — defensive but not user-visible; could fold into another session).
- P-18 devcontainer Chromium libs (LOW dev ergonomic — small fold-in to any session).
- P-26 below-fold full-page-scroll capture (LOW deferred large lift — last in the queue; current workaround works).

Check `ROADMAP.md` for the canonical state.
