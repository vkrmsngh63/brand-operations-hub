# Next session

**Written:** 2026-05-15-c — session_2026-05-15-c_w2-p29-slice-2-build-session (Claude Code, on `workflow-2-competition-scraping`).

**For:** the next Claude Code session.

**Status of P-29 Slice #2:** ✅ **SHIPPED AT CODE LEVEL on `workflow-2-competition-scraping` in commit `a9e2bf5` + end-of-session doc batch.** Pushed origin mid-session with Rule 9 approval. 4 files +682/-21: POST `urls/[urlId]/text/route.ts` accepts optional `source` validated via `isSource` (defaults `'extension'` server-side when omitted — Chrome extension's POST traffic byte-for-byte unchanged); NEW `CapturedTextAddModal.tsx` (~370 LOC); `UrlDetailContent.tsx` wire-in with `+ Manually add captured text` button at right end of section h2 row + `handleTextAdded` `clientId`-dedup callback; NEW `tests/playwright/p29-manual-add-captured-text-modal.spec.ts` with 8 test.skip() cases. Verification: tsc clean + `npm run build` clean (49 routes) + 10/10 node:test cases pass (no test change — Slice #1's `isSource` guard also covers Slice #2's new POST validation branch) + 8/8 Playwright cases skipped as designed. **Director manual walkthrough DEFERRED twice now** (Slice #1 + Slice #2) — combined verification target for deploy session #14.

**The recommended next pick (director picked via §4 Step 1c forced-picker at end of Slice #2):** W#2 → main deploy session #14 for Slices #1+#2 + director manual walkthrough end-to-end smoke on a real Independent Website URL on vklf.com. Most thorough per `feedback_recommendation_style.md`: exercises BOTH new modals on real-website data BEFORE Slice #3 piles more code on top; catches deploy-time / live-DB integration issues earlier; releases the twice-deferred walkthrough debt. Slice #3 (image modal — biggest of the three; drag-drop + paste-from-clipboard + URL-of-image text field + new SSRF-guarded URL-fetch endpoint with content-type + size guardrails) picks up the build sequence on a clean branch state after this deploy lands.

---

## Branch
workflow-2-competition-scraping (start here; switch to `main` during the deploy per the cheat-sheet)

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**W#2 → main deploy session #14 — bring P-29 Slices #1 + #2 to vklf.com + director manual walkthrough end-to-end smoke on a real Independent Website URL.** Closes (a.32) RECOMMENDED-NEXT.

This is a **DEPLOY session** — no new code changes; the work is the standard W#2 → main cheat-sheet flow (rebase + ff-merge + push to main + Vercel auto-redeploy) plus the long-deferred director manual walkthrough that exercises BOTH new modals on a real Independent Website URL.

**Schema-change-in-flight flag stays "No"** at session start. Slice #1's `prisma db push` already applied the `source` column to all 3 W#2 tables in the live DB (2026-05-15-b); no schema work this session.

**Deploy session #14 scope:**

1. **Pre-deploy verification on `workflow-2-competition-scraping`:**
   - `git branch --show-current` confirms `workflow-2-competition-scraping`.
   - `git log origin/main..workflow-2-competition-scraping --oneline` expects 4 commits ready to merge: `948a1a9` (2026-05-15 design doc batch) + `070820a` (Slice #1 code) + `b5711e1` (Slice #1 doc batch) + `a9e2bf5` (Slice #2 code) + plus today's Slice #2 doc-batch commit landing as a fifth commit at end-of-session — so by Slice #2's end-of-session the branch is 5 commits ahead of `origin/main`.
   - `git log workflow-2-competition-scraping..origin/main --oneline` expects 0 commits.
   - Re-run verification scoreboard on this branch's HEAD before the merge (mostly a sanity check — these all passed at Slice #2 ship time): `npx tsc --noEmit` clean; `npm run build` clean (49 routes); `node --test src/lib/shared-types/competition-scraping.test.ts` 10/10 pass; `npx playwright test --project=chromium tests/playwright/p29-manual-add-url-modal.spec.ts tests/playwright/p29-manual-add-captured-text-modal.spec.ts` 14/14 skipped as designed.

2. **W#2 → main deploy cheat-sheet flow (standard pattern; see prior deploy sessions #11, #12, #13 for canonical refs):**
   - `git fetch origin && git checkout workflow-2-competition-scraping && git pull --rebase origin workflow-2-competition-scraping` (sanity, no-op expected).
   - `git checkout main && git pull --rebase origin main`.
   - `git merge --ff-only workflow-2-competition-scraping` — should be a clean ff-merge (no parallel main activity since Slice #1; this is the standard "workflow branch ff onto main" shape).
   - Re-run verification scoreboard on `main` post-merge before pushing — confirms what's about to land on vklf.com matches what was verified on the workflow branch.
   - **Rule 9 STOP + describe-before-push:** describe what's deploying (Slices #1+#2 code, schema migration already applied to live DB during Slice #1's session, doc batches, Playwright spec scaffolding) + ask for explicit deploy approval before `git push origin main`. Push triggers Vercel auto-redeploy.
   - Post-push: confirm Vercel redeploy completes green (`vercel ls` or director-side check of vklf.com); fresh URL-add modal + manual-add captured-text button visible on the deployed site.

3. **Director manual walkthrough on a real Independent Website URL (Rule 27 Hybrid — judgment parts; long-deferred TWICE so today's the integration target):**

   This is the long-deferred verification. Recommended walkthrough shape — director navigates a real Project on vklf.com and exercises BOTH new modals end-to-end:

   **A. Manual-add URL modal (Slice #1):**
   1. Sign into vklf.com → pick a real Project → land on `/projects/[id]/competition-scraping`.
   2. Click "+ Manually add URL" button (top-right of UrlTable toolbar per Slice #1's director pick).
   3. Modal opens with autofocus on URL field. Fill: URL = a real Independent Website URL (e.g., a competitor's product page on their own domain, not Amazon/eBay/Etsy/Walmart). Platform = "Independent Website". Optional fields: Brand / Product / Category / etc.
   4. Submit. Modal closes; new row appears in the URL list with platform "Independent Website" + `source='manual'` flag distinguishable from extension-captured rows.
   5. Exercise dismiss paths on at least one re-open: Escape / Cancel / X / backdrop click — each should close the modal cleanly.

   **B. Manual-add captured-text modal (Slice #2):**
   1. From the URL list, click into the URL you just created (or any existing URL row) to navigate to `/projects/[id]/competition-scraping/url/[urlId]`.
   2. Scroll to the "Captured Text" section.
   3. Click "+ Manually add captured text" button at the right end of the section's h2 row.
   4. Modal opens with autofocus on Text textarea. Fill: Text = some real captured copy (a paste of a competitor's product description or marketing claim). Optional: Content Category + Tags (comma-separated).
   5. Submit. Modal closes; new row appears in the captured-text table.
   6. (Optional) Re-submit the same text by re-opening the modal + re-pasting — should create a new row (different `clientId` each time).

   **C. Lightweight spot-check on the existing extension-side flow** to confirm no regression: open the Chrome extension popup on a real Amazon/Walmart/eBay/Etsy URL + use the existing right-click captured-text gesture once + confirm it still writes a row to the URL-detail page's text section (extension's POST goes through the same route as Slice #2's modal but without `source`, so it should default to `'extension'`).

4. **Post-walkthrough doc batch (standard W#2 → main deploy doc batch shape):**
   - ROADMAP W#2 row: (a.32) flipped ✅ DONE; new (a.33) RECOMMENDED-NEXT = Slice #3 (image modal — biggest of the three).
   - CHAT_REGISTRY new top entry; DOCUMENT_MANIFEST header + per-doc flags.
   - VERIFICATION_BACKLOG: new "Deploy session #14 — P-29 Slices #1+#2 DEPLOYED + FULL VERIFY" section appended.
   - COMPETITION_SCRAPING_DESIGN §B 2026-05-15-d (or later date suffix) entry for the deploy outcome.
   - CORRECTIONS_LOG: header bump only if no slips; one + INFORMATIONAL §Entry per slip if any surfaced during the walkthrough.
   - NEXT_SESSION.md rewritten for Slice #3 build session.

**Pre-build checklist at session start:**
- `git branch --show-current` confirms `workflow-2-competition-scraping`.
- `git log origin/main..workflow-2-competition-scraping --oneline` expects 5 commits (Slice #1+Slice #2 code + 3 doc batches incl. design + Slice #1 + Slice #2 doc batches).
- Read `COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-15 + §B 2026-05-15-b + §B 2026-05-15-c entries (design pass + Slice #1 ship + Slice #2 ship — the full P-29 narrative through deploy time).
- Read `ROADMAP.md` W#2 row Current Active Tools + (a.30) ✅ SHIPPED + (a.31) ✅ SHIPPED + (a.32) RECOMMENDED-NEXT entries.

**Rule 23 Change Impact Audit (no schema change this slice; no audit needed beyond confirming the `source` field's downstream-consumer story per DATA_CATALOG §7 — still TBD per Slice #1's design-session note).**

## Pre-session notes (optional, offline steps to do between sessions)

Nothing required. If the director wants to pre-stage the walkthrough:
- Pick a real Independent Website competitor URL ahead of time (a product page on a competitor's own e-commerce domain). Having the URL ready means the manual-add walkthrough flows without context-switching mid-session.
- (Optional) Have a paste-ready snippet of real captured text on hand — a marketing claim, headline, or product description from a real competitor — to use in Slice #2's manual-add captured-text walkthrough.

## Why this pointer was written this way (debug aid)

Slice #2 shipped cleanly at code level today. The recommended next step is W#2 → main deploy session #14 for Slices #1+#2 because the director manual walkthrough has been deferred TWICE now (once at Slice #1's end-of-session, once at Slice #2's). Letting that debt accumulate is risk — Slice #3 piles more new code on top of two unverified-in-production modals; deploying #1+#2 first catches deploy-time / live-DB integration issues before they compound with Slice #3.

The director picked this path via Rule 14f forced-picker at the end of Slice #2, choosing it over the alternative "continue to Slice #3 without deploying" path. The picker rationale: most thorough per `feedback_recommendation_style.md` (always pick the most-thorough-and-reliable option, not the fastest/cheapest); fits the standard W#2 → main deploy pattern that prior deploy sessions #11–#13 have proven reliable.

If the director's priorities shift before the next session: alternate candidates are Slice #3 build directly (skips deploy; Slice #3 is the biggest of the three and the largest unverified-state surface to add) / P-28 (delete URLs with cascade) / P-27 (delete captured texts/images) / P-30 (Playwright React-bundle rig — unblocks Slice #1+#2+#3 UI regression coverage in one place — would convert the 14 currently-skipped UI-mechanical cases into running cases) / P-31 (route-handler DI refactor — unblocks API-layer regression coverage for both `urls/route.ts` and `urls/[urlId]/text/route.ts`) / older polish items P-21 / P-19 / P-13. Check `ROADMAP.md` W#2 row Current Active Tools for the canonical state.
