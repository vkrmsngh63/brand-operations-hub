# Next session

**Written:** 2026-05-19-e (`session_2026-05-19-e_w2-main-deploy-session-26-p24-saved-image-indicator-DEPLOYED`).

**For:** the next Claude Code session.

**Status of today's W#2 → main deploy session #26:** P-24 saved-image indicator on the page SHIPPED + DEPLOYED + REAL-CHROME-VERIFIED on vklf.com (build commit `6e7ffa5`). Pre-deploy + post-merge scoreboards both GREEN: tsc / ext tsc / `npm run build` 53 routes / src/lib node:test **531/531** (was 527; +4 new originalSrcUrl persistence cases) / extension `npm test` **368/368** (was 358; +10 new already-saved-image-icon cases) / Playwright **76/76** (was 75; +1 new P-24 extension-context spec). Fresh zip `plos-extension-2026-05-19-w2-deploy-26.zip` at repo root.

**Closes (a.47) RECOMMENDED-NEXT.** 1 of 6 W#2 polish items remaining before graduation shipped today; **5 remain** that the director has stated must ship before W#2 is deemed complete: P-25 (captured-text haze indicator) + P-23 (saved-URL dropdown side-by-side) + P-22 (Playwright cross-platform slices 2-4) + P-18 (devcontainer Chromium libs) + P-26 (below-fold full-page-scroll capture). Estimated ~5-10 more W#2 polish sessions before graduation.

---

## Branch

**`workflow-2-competition-scraping`** — W#2 polish work, NOT platform-wide. The `./resume` script will switch you from `main` (where today's 2026-05-19-e session ended after the doc-batch push) → `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`, not `main`. If you're still on `main` after `./resume`, STOP and surface to director.

Expected branch state on entry: `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` AND exactly even with `origin/main`. Both branches at the same SHA after today's deploy-#26 main push + ping-pong sync + end-of-session doc-batch push + ping-pong.

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**Ship P-25 — captured-text haze indicator on the page (light yellow haze overlay on text selections that are already saved to PLOS as CapturedText for the current CompetitorUrl)** on `workflow-2-competition-scraping` (ROADMAP W#2 polish backlog P-25 entry; ROADMAP Active Tools (a.48) RECOMMENDED-NEXT). Goal: symmetric pair to P-24 — close the second of the three recognition-cue gaps (URL ✓ shipped session 3 + image ✓ shipped 2026-05-19-e + text haze remaining). Closes (a.48) RECOMMENDED-NEXT.

Branch is `workflow-2-competition-scraping`. Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Fix shape (per ROADMAP W#2 polish backlog P-25 entry; ~400-600 LOC + new Playwright spec slice):**

1. **Schema change (Rule 8 — ASK director before `prisma db push`):** add nullable `selector` column to `CapturedText` model in `prisma/schema.prisma`. Stores a serialized selector (CSS Custom Highlight API range OR XPath OR `Range`-based offset selector) that lets the content-script re-locate the saved text in the live DOM on later page loads.

2. **Shared types:** add `selector: string | null` to `CapturedText` interface in `src/lib/shared-types/competition-scraping.ts`. Add optional `selector?: string` to `CreateCapturedTextRequest`.

3. **API routes:**
   - `urls/[urlId]/text` POST handler (text creation): accept + persist optional `selector`.
   - `urls/[urlId]/text` GET handler (text list): return `selector` in wire shape.
   - Per-text PATCH route (if it exists; check `src/app/api/projects/.../competition-scraping/text/[textId]/route.ts`): include `selector` in toWireShape.

4. **Extension:**
   - `text-capture-form.ts`: on save success, compute serializer for the user's selection Range (or pass-through whatever the form already captured) + pass into the createCapturedText call. Note: the form has the user's selection — check whether it's stored or already converted to text-only.
   - new `saved-text-highlight.ts` helper (~150 LOC mirror of P-24's `already-saved-image-icon.ts`): exports `attachSavedTextHaze(range, savedTextId)` + `detachSavedTextHaze(savedTextId)` + `detachAllSavedTextHazes()`. Uses CSS Custom Highlight API (`CSS.highlights`) if available (Chrome 105+ — manifest already requires) OR falls back to `<span class="plos-cs-saved-text-haze">` wrap.
   - `orchestrator.ts`: when on a saved-URL page (existing recognitionSet hit), fetch `listCapturedTexts(projectId, urlId)` for that URL (new API client function — mirror of `listCapturedImages` shipped 2026-05-19-e). For each row with a non-null `selector`, deserialize + attempt to re-locate the range in the current DOM + attach the haze. Best-effort match (DOM-walker tolerant of mismatch); silent fail if not findable.

5. **Coordinate with `highlight-terms.ts`:** the existing highlight-terms.ts handles user-defined HIGHLIGHT TERMS (keyword search-and-highlight) which is an UNRELATED feature. Do NOT collide with its CSS class or data-attributes or lifecycle. Use a distinct CSS class (`plos-cs-saved-text-haze` per the polish-backlog entry) + a distinct CSS Custom Highlight registry name.

6. **Per Rule 23 Change Impact Audit (pre-classify before code):** ADDITIVE schema change — new nullable column on existing CapturedText table. Pre-existing rows have NULL selector → no haze visible until re-captured. Server-side API consumers: this is W#2-internal data; no W#1 / W#3 cross-tool reads. Classification: Additive (safe).

**Diagnosis steps before coding (these may change the fix shape — same play as today's P-24 session):**

1. Read `prisma/schema.prisma` lines 301-320 (CapturedText model) — confirm there's NO existing `selector`-like column. Per Rule 3 code-wins, if there IS one already, the fix shape simplifies dramatically.
2. Read `src/lib/shared-types/competition-scraping.ts` for the `CapturedText` interface — confirm absence of selector field.
3. Read `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/text/route.ts` — confirm the POST + GET routes don't accept or return selector today.
4. Read `extensions/competition-scraping/src/lib/content-script/text-capture-form.ts` — find where the user's selection Range is captured. If it's already converted to a plain string before the API call, you may need to extend the form's state to preserve the Range.
5. Surface any drift to director BEFORE coding (via AskUserQuestion picker if material).

**Test coverage decision (Rule 27 forced-picker at session start):**

- (A) Hybrid — unit tests on `saved-text-highlight` attach/detach logic + selector serialize/deserialize + Playwright extension-context spec slice covering the haze-renders-on-saved-text path (parallel to today's `p24-saved-image-indicator.spec.ts`).
- (B) Node:test only — extract selector logic to a pure helper and unit-test it; defer Playwright to a follow-up polish session (P-22 slice).
- (C) Director manual walkthrough only after sideload + deploy — no automated regression coverage; relies on natural-use to surface regressions.
- (D) Escape hatch.

Per `feedback_recommendation_style.md` (most thorough/reliable): **Option (A) Hybrid is the right pick** — same reasoning as today's P-24 session. Hybrid matched today's risk profile and shipped cleanly.

**Pre-deploy verification scoreboard targets (expected baselines from today's deploy session #26 post-state):**

- `npx tsc --noEmit` clean
- `cd extensions/competition-scraping && npx tsc --noEmit` clean
- `npm run build` clean — **53 routes** (unchanged if no new route)
- `src/lib` node:test: **531/531** + ~+5-10 new CapturedText selector cases → ~536-541
- Extension `npm test`: **368/368** + ~+8-12 new saved-text-haze cases → ~376-380
- Playwright: **76/76** + ~+1-2 new saved-text-haze spec slice → ~77-78

**Deploy mechanics (cheat-sheet b — standard W#2 → main deploy):** unchanged. Pre-deploy scoreboard → rebase if main moved → ff-merge → post-merge scoreboard → Rule 9 gate → push main → ping-pong sync → fresh extension build → director sideload + manual verification on real competitor URL with multiple saved text snippets.

**Director real-website verification at deploy time (Rule 27 scope exception — visual judgment + real-platform DOM):** open a competitor URL that has 2+ saved text snippets on its URL detail page in PLOS; sideload fresh extension build; confirm light yellow haze appears on the page's text spans that correspond to saved CapturedText rows. Per the P-24 v1 limitation pattern: existing saved-text rows have NULL `selector` and won't show haze until re-captured. Director's verification flow: save a fresh text snippet → reload page → confirm haze.

**Group A docs to update at end-of-session:** ROADMAP (header + (a.48) → flip ✅ DONE + new (a.49) RECOMMENDED-NEXT — likely P-23 or P-22 via §4 Step 1c forced-picker); CHAT_REGISTRY (new top entry); DOCUMENT_MANIFEST (header); CORRECTIONS_LOG (header bump + any new entries); NEXT_SESSION (rewritten for the next polish item).

**Group B docs to update at end-of-session:** COMPETITION_SCRAPING_VERIFICATION_BACKLOG (new Deploy session #27 entry + P-25 flipped ✅ DONE); COMPETITION_SCRAPING_DESIGN §B entry capturing the selector-serialization design choice + the highlight-terms collision-avoidance discipline.

**Schema-change-in-flight flag:** flips to "Yes" for this entire session (adding nullable `selector` column to CapturedText); back to "No" after `prisma db push` lands.

Start by running the mandatory start-of-session sequence.

**Pre-build read list (in addition to mandatory start-of-session sequence):**

- `prisma/schema.prisma` CapturedText model (lines 301-320) — verify no existing `selector` field.
- `src/lib/shared-types/competition-scraping.ts` — find CapturedText interface; verify absence of selector.
- `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/text/route.ts` — POST + GET handlers.
- `extensions/competition-scraping/src/lib/content-script/text-capture-form.ts` — selection-capture flow.
- `extensions/competition-scraping/src/lib/content-script/highlight-terms.ts` — collision-avoidance reference (this is the existing keyword-highlight feature; do NOT collide CSS classes / data-attributes / lifecycle).
- `extensions/competition-scraping/src/lib/content-script/already-saved-image-icon.ts` (NEW from 2026-05-19-e) — reference shape for the new saved-text-highlight helper.
- `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` — find the P-24 image-scan wiring shipped today; mirror for text.
- ROADMAP W#2 polish backlog P-25 entry (around line 145) — full fix shape narrative.

## Pre-session notes (optional, offline steps to do between sessions)

If you can: before the next session, identify 2-3 competitor URLs on real Amazon/Walmart/eBay/Etsy pages that have multiple text snippets saved to PLOS — those will be your test cases at deploy-time verification. Open the URL detail page in PLOS and confirm 2+ saved texts are visible. If you don't have any URLs with multiple saved texts, capture 2-3 text snippets during natural use this week so there's something to verify against. (Note: existing snippets won't show haze post-deploy because they have NULL `selector` — but the verification flow is "save a NEW text snippet → reload page → confirm haze" which is also fine.)

## Why this pointer was written this way (debug aid)

Today's session shipped P-24 cleanly + verified live. The §4 Step 1c forced-picker at end-of-session offered 4 options: (A) P-25 [recommended — symmetric pair to P-24, matches today's risk profile], (B) P-23 saved-URL dropdown side-by-side [LOW-MEDIUM quick win], (C) P-22 Playwright cross-platform slices [defensive], (D) escape hatch. Director picked **(A) P-25** — same standing preference as 2026-05-19-d-2 corrective doc-batch: ship the remaining polish items before W#2 graduation, in symmetric-pairs-first order. After P-25 ships, 4 polish items remain (P-23 + P-22 + P-18 + P-26); next §4 Step 1c picker at end of P-25 session will likely surface P-23 as the new recommended-next quick-win.

**Alternate next-session candidates if director shifts priorities at session start:**

- P-23 saved-URL dropdown side-by-side (LOW-MEDIUM, smaller UX clarity fix — short single-session ship; good pick for a quick win between heavier P-24/P-25-style sessions).
- P-22 Playwright cross-platform slices 2-4 (MEDIUM coverage extension — defensive but not user-visible; could fold into another session).
- P-18 devcontainer Chromium libs (LOW dev ergonomic — small fold-in to any session).
- P-26 below-fold full-page-scroll capture (LOW deferred large lift — last in the queue; current workaround works).
- Manual-add modal originalSrcUrl tack-on (the DEFERRED item captured this session — trivial 1-line addition to `CapturedImageAddModal.tsx` URL-paste path for symmetric persistence with the extension flow; could fold into any session).

Check `ROADMAP.md` for the canonical state.
