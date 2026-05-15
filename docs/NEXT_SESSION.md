# Next session

**Written:** 2026-05-15-e — session_2026-05-15-e_w2-p29-slice-3-build-session (Claude Code, on `workflow-2-competition-scraping`).

**For:** the next Claude Code session.

**Status of P-29 Slice #3 BUILD session:** ✅ **SHIPPED at code level on `workflow-2-competition-scraping`.** Manual-add captured-image modal with all three input modalities (drag-drop + clipboard paste + URL-of-image text field) + NEW server-side SSRF-guarded `fetch-by-url` endpoint + NEW pure-function `ssrf-guard.ts` security boundary + 37 security-class node:test cases all GREEN. Director manual walkthrough DEFERRED to W#2 → main deploy session #15. Closes (a.33) RECOMMENDED-NEXT.

**The recommended next pick:** **W#2 → main deploy session #15** = bring P-29 Slice #3 to vklf.com + director manual walkthrough on a real Independent Website with all three input modalities exercised end-to-end. This completes the P-29 three-slice arc (manual-add URL + captured text + captured image). Closes (a.34) RECOMMENDED-NEXT.

---

## Branch
workflow-2-competition-scraping (start here; one Slice #3 code commit + this doc batch ahead of `origin/main` — the deploy session will rebase/ff-merge as usual)

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**W#2 → main deploy session #15 — bring P-29 Slice #3 (manual-add captured-image modal + SSRF-guarded fetch-by-url endpoint) to vklf.com + director manual walkthrough end-to-end on a real Independent Website with all three input modalities (drag-drop + clipboard paste + URL-of-image).** Closes (a.34) RECOMMENDED-NEXT.

Verify branch state with `git branch --show-current` before any doc reads — should be on `workflow-2-competition-scraping` (`./resume` switched you; verify). Start by running the mandatory start-of-session sequence.

**Schema-change-in-flight flag stays "No"** at session start. Slice #1 already added `source` to all 3 W#2 tables; Slice #3 was code-only.

**Deploy session #15 scope:**

1. **Pre-deploy verification on `workflow-2-competition-scraping` — the scoreboard ran end of session 2026-05-15-e and was all GREEN:**
   - `npx tsc --noEmit` clean
   - `cd extensions/competition-scraping && npm run compile` clean
   - `npm run build` clean (50 routes — new `fetch-by-url` registered)
   - `node --test` on all 18 src/lib test files: 447/447 pass
   - `cd extensions/competition-scraping && npm test`: 334/334 pass
   - `npx playwright test tests/playwright/p29-manual-add-captured-image-modal.spec.ts`: 17/17 skipped as designed (pending P-30)

   **Re-run all of these at session start before any rebase/merge** — workflow-2 may have moved while the deploy session was being scheduled.

2. **Standard W#2 → main deploy execution per `MULTI_WORKFLOW_PROTOCOL.md`:**
   - `git checkout main && git pull --rebase origin main` to land at main's HEAD.
   - `git merge --ff-only workflow-2-competition-scraping` (expected clean fast-forward — no main commits since the workflow-2 branch last fast-forwarded at end of 2026-05-15-d's third ping-pong cycle).
   - **Rule 9 deploy-gate ask BEFORE pushing main** — describe what commits will go live, what user-visible changes result, and ask for explicit confirmation. The user-visible changes are summarized in the launch prompt.
   - `git push origin main <prior-main-sha>..<new-main-sha>` after approval.
   - Vercel auto-redeploys; watch vklf.com for build completion.
   - After deploy confirmation, `git push origin workflow-2-competition-scraping` to keep workflow-2 in lockstep with main for Slice-#3 walkthrough cycles.

3. **Director manual walkthrough on vklf.com — Hybrid Rule 27 verification (Playwright handles the mechanical/regression-prone parts when P-30 rig lands; director's eye on visual-judgment + real-website coverage):**

   **Director-batched checklist** (director's preferred style from deploy #14: all parts at once, then "all green" or 🔴 + which step failed):

   **Part A — Drag-and-drop modality:**
   - Open any URL detail page on vklf.com for a real Independent Website URL.
   - Click "+ Manually add captured image" at the right end of the Captured Images section h2 row.
   - Drag a small (1-2 MB) image file from the desktop into the drop zone. The dropzone should highlight while dragging over, accept the drop, show a preview thumbnail + mime + size text.
   - Fill optional metadata (Image Category via VocabularyPicker, Composition, Embedded Text, Tags).
   - Click "Save captured image." Modal should close; the new image should appear in the gallery.

   **Part B — Clipboard-paste modality:**
   - Open the modal again. While modal is open (and no image yet loaded), copy any image to clipboard from another browser tab (right-click any web image → Copy image) or take a screenshot to clipboard. Press Ctrl/Cmd+V while the modal has focus.
   - Preview should appear. Save. New row in gallery.

   **Part C — URL-of-image modality:**
   - Open the modal again. Paste a real public image URL (e.g., a competitor's product image from any platform). Click "Fetch image" (or press Enter in the URL input). Spinner during fetch (~1-3s). Preview should appear with the fetched image.
   - Save. New row in gallery.

   **Part D — SSRF guardrail spot-check (DEFENSIVE — confirm the security boundary fires correctly):**
   - Try pasting `http://localhost/test.png` or `http://192.168.1.1/img.png` into the URL field. Click Fetch image.
   - Should see an inline error like "imageUrl resolves to a private network address, which is not allowed" — NOT a successful fetch.

   **Part E — Extension regression spot-check (defense in depth — Slice #3 wired `source` through finalize; extension shouldn't have noticed):**
   - With the Chrome extension active on any supported platform (Amazon / eBay / Etsy / Walmart / Google Shopping / Google Ads / Independent Website), capture an image via the existing right-click "Save to PLOS" or region-screenshot gesture. The new row should still appear in the gallery; in the DB the `source` column should default to `'extension'` (not visible in the UI; spot-check optional via Supabase Studio if needed).

4. **If any walkthrough step fails:**
   - Same shape as deploy session #14: fix → push → workflow-2 ff-forward → re-walkthrough. Each polish item gets its own commit on `main` so the diff is reviewable.

5. **End-of-session doc batch:**
   - ROADMAP W#2 row Last Session + (a.34) flipped DONE; next pick set by Step 1c forced-picker if no obvious continuation, OR (likely) the next polish item if Slice #3 walkthrough surfaces any.
   - CHAT_REGISTRY new top row.
   - DOCUMENT_MANIFEST header + per-doc flags.
   - COMPETITION_SCRAPING_DESIGN §B new entry for the deploy outcome.
   - COMPETITION_SCRAPING_VERIFICATION_BACKLOG: new "Deploy session #15 — P-29 Slice #3 DEPLOYED + FULL VERIFY 2026-05-15-?" section.
   - NEXT_SESSION.md rewrite.

**Verification scoreboard for deploy session #15:**

- All pre-deploy scoreboard items still GREEN (run before rebase + ff-merge).
- Post-merge scoreboard re-run on `main` before push.
- Director walkthrough on vklf.com Parts A through E all GREEN (or fix any that fail same-session per the deploy #14 pattern).

**Pre-deploy checklist at session start:**

- `git branch --show-current` confirms `workflow-2-competition-scraping`.
- `git log origin/main..workflow-2-competition-scraping --oneline` — expects the Slice #3 code commit + this doc-batch commit (2 commits ahead).
- `git log workflow-2-competition-scraping..origin/main --oneline` — expects 0 commits.
- Read `COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-15-e (Slice #3 BUILD outcome + ssrf-guard module + fetch-by-url route + modal architecture).
- Read `ROADMAP.md` W#2 row Current Active Tools + (a.33) ✅ SHIPPED + (a.34) RECOMMENDED-NEXT entries.
- Per Rule 23, run Change Impact Audit before any walkthrough-driven fixes — Slice #3 is additive (new endpoint, new modal, additive `source` wire-in to finalize). Any walkthrough-found polish fix follows the same additive shape unless surprised.

**Rule 23 expected outcome for the deploy itself:** Additive deploy — bringing already-built Slice #3 code to vklf.com. No new schema. No new shared-types. No backward-incompatible changes.

## Pre-session notes (optional, offline steps to do between sessions)

To make the walkthrough efficient, pre-stage the three input modalities:

- **Drag-drop:** Have a small image file (~1-2 MB JPEG or PNG) on hand on your desktop.
- **Clipboard-paste:** Pick any web page with a product image; right-click + Copy image (or use macOS screenshot-to-clipboard / Windows Snipping Tool).
- **URL-of-image:** Find a real public image URL — a competitor's product image from any platform you've been scraping. Just the direct image URL (right-click + Copy image address). The endpoint refuses redirects so make sure the URL is a direct image URL (ends with .jpg / .png / .webp typically).

## Why this pointer was written this way (debug aid)

Slice #3 is the largest of the three P-29 slices and the last one before the manual-add P-29 feature is complete end-to-end. Built clean in one session: ~720 LOC `ssrf-guard.ts` + 37 security-class tests + ~280 LOC fetch-by-url route + ~640 LOC modal + plumbing. Now deploy session #15 brings it to vklf.com; after that, the three-slice manual-add P-29 feature is complete end-to-end across URLs + captured texts + captured images.

The director's preferred deploy shape this W#2 cycle (per 2026-05-15-d): single deploy session takes the slice from workflow-2 → main → vklf.com → director walkthrough → any same-session fixes for walkthrough-found polish items → final verify.

**Alternate next-session candidates if director shifts priorities:**

- P-30 (Playwright React-bundle rig — unblocks UI regression coverage for all three modals' specs)
- P-31 (route-handler DI refactor — unblocks API-layer regression coverage)
- P-28 (delete URLs cascade)
- P-27 (delete captured texts/images)
- Older polish items P-21 / P-19 / P-13

Check `ROADMAP.md` W#2 row for the canonical state.

**After deploy session #15:** P-29 three-slice feature is fully complete and live. Next W#2 work likely picks up from the polish backlog (P-27 / P-28 / P-30 / P-31 / etc.) per director priority.
