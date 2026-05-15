# Next session

**Written:** 2026-05-15-d — session_2026-05-15-d_w2-main-deploy-session-14-p29-slices-1-and-2-plus-six-walkthrough-polish-fixes (Claude Code, dual-branch — main for deploy + fixes; workflow-2 fast-forwarded each cycle).

**For:** the next Claude Code session.

**Status of P-29 deploy session #14:** ✅ **DEPLOYED + FULLY VERIFIED on vklf.com.** P-29 Slices #1+#2 + six director-found walkthrough polish items P-32/P-33/P-34/P-35/P-36/P-37 all live on `vklf.com` (and the extension Fix #5 sideloaded by director). All 4 director walkthrough checkpoints across three deploy cycles came back green. Closes (a.32) RECOMMENDED-NEXT.

**The recommended next pick:** **W#2 P-29 Slice #3 BUILD session** = manual-add captured-image modal with three input modalities (drag-drop + clipboard paste + URL-of-image text field) + new server-side URL-fetch endpoint with SSRF allowlist + content-type + size guardrails. Largest of the three slices. Per the 2026-05-15 design pass's Q1 outcome (frozen in `COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-15). Closes (a.33) RECOMMENDED-NEXT.

---

## Branch
workflow-2-competition-scraping (start here; already in lockstep with `main` after deploy session #14's three ping-pong sync cycles)

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**W#2 P-29 Slice #3 BUILD session — manual-add captured-image modal with three input modalities (drag-drop + clipboard paste + URL-of-image text field) + new server-side URL-fetch endpoint with SSRF allowlist + content-type + size guardrails.** Closes (a.33) RECOMMENDED-NEXT.

Verify branch state with `git branch --show-current` before any doc reads — should be on `workflow-2-competition-scraping` (`./resume` switched you; verify). Start by running the mandatory start-of-session sequence.

**Schema-change-in-flight flag stays "No"** at session start. Slice #1 already added the `source` column to the `CapturedImage` table; no schema work this slice.

**Slice #3 scope:**

1. **NEW `<CapturedImageAddModal />` component** (~500-700 LOC) mounted on the URL detail page's Captured Images section. Mirror the existing `<UrlAddModal>` / `<CapturedTextAddModal>` modal shape (autofocus / Escape / Cancel / X / backdrop dismiss / submit-in-flight lock / `crypto.randomUUID()` clientId / POSTs `source: 'manual'` explicitly).

2. **Three input modalities in the modal:**
   - **(a) Drag-and-drop area** — a clearly-bordered drop zone; on `dragover` shows a highlighted state; on `drop` accepts a single image file (multiple files = drop the rest with a warning). Validate `file.type` matches the accepted MIME types; validate `file.size` is ≤10 MB.
   - **(b) Paste-from-clipboard listener** — `document.addEventListener('paste', ...)` while the modal is open; reads `clipboardData.items` for image MIME types; extracts the blob; same validation as (a).
   - **(c) "or paste an image URL" text field** — POSTs to the NEW server-side fetch endpoint (described below) which downloads the image bytes server-side under SSRF guards, then proceeds as if the user had drag-dropped the resulting bytes.

   Show a preview thumbnail once an image is acquired via any modality.

3. **NEW server-side URL-fetch endpoint** — likely `POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/images/fetch-by-url` (or similar). Body: `{ imageUrl: string }`. Server-side:
   - **SSRF allowlist**: only allow public web hostnames. Reject IPs in private ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16), loopback (127.0.0.0/8, ::1), link-local (169.254.0.0/16), and cloud-metadata endpoints (169.254.169.254 for AWS / 169.254.169.253 / `metadata.google.internal` / Azure equivalents). Do DNS resolution + post-resolution IP check (not just hostname pattern check) to catch DNS rebinding.
   - **Content-type check** — reject if not `image/png` / `image/jpeg` / `image/gif` / `image/webp` (whichever set we settle on; verify against existing shared-types `ACCEPTED_IMAGE_MIME_TYPES`).
   - **Size cap** — read up to 10 MB; abort + reject if more.
   - **Timeout** — 10s hard cap on the fetch.
   - On success, returns the bytes (likely as a presigned-upload URL handshake to match Slices #1+#2's existing image upload finalization pattern at `images/finalize/route.ts`).

4. **Existing image-upload flow integration** — the existing 2-step Phase 1/2/3 image upload pattern at `urls/[urlId]/images/route.ts` (requestUpload → signed-URL PUT → finalize) is the canonical pattern. Slice #3's drag-drop and clipboard-paste paths should use the same Phase 1/2/3 flow. The URL-of-image path uses the new fetch-by-url endpoint as a Phase 0 that bridges into the Phase 1 handshake.

5. **POST `source: 'manual'`** explicitly on the finalize call (Slice #1 already added the column + plumbed the field through the request DTO; just need to send it).

6. **Tests:**
   - Extend `src/lib/shared-types/competition-scraping.test.ts` if any new type guards are added.
   - NEW Playwright spec `tests/playwright/p29-manual-add-captured-image-modal.spec.ts` mirroring the existing P-29 specs' shape (UI-mechanical cases all `test.skip()` pending P-30 React-bundle rig — same as Slice #1+#2 specs).
   - NEW node:test coverage for the SSRF-guard logic (pure-function tests around the allowlist + IP-classification + DNS-rebind catches). This is the FIRST piece of server-side route logic in P-29 that has hard correctness requirements (security-class) — push hard for thorough unit coverage here even if the rest of the slice's regression coverage is structurally placeholder'd.

**Verification scoreboard for Slice #3 ship:**
- `npx tsc --noEmit` clean
- `cd extensions/competition-scraping && npm run compile` clean (per the 2026-05-15-d operational lesson — shared-types-touching slices must include extension tsc going forward)
- `npm run build` clean
- `node --test src/lib/shared-types/competition-scraping.test.ts` 10/10 still pass (or more if guards added)
- NEW node:test pass for SSRF-guard logic
- NEW Playwright spec skipped as designed
- Director manual walkthrough DEFERRED to W#2 → main deploy session #15

**Pre-build checklist at session start:**
- `git branch --show-current` confirms `workflow-2-competition-scraping`.
- `git log origin/main..workflow-2-competition-scraping --oneline` expects 0 commits (workflow-2 was fully synced to main at end of deploy session #14).
- `git log workflow-2-competition-scraping..origin/main --oneline` expects 0 commits.
- Read `COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-15 (P-29 design pass — Q1 outcome on image input modalities + SSRF guidance) + §B 2026-05-15-b + §B 2026-05-15-c + §B 2026-05-15-d (deploy outcome + Slice #2.5 polish-batch + Fix #5 extension).
- Read `ROADMAP.md` W#2 row Current Active Tools + (a.30)/(a.31) ✅ SHIPPED + (a.32) ✅ DONE + (a.33) RECOMMENDED-NEXT entries.
- Read `COMPETITION_SCRAPING_STACK_DECISIONS.md` §3 if it covers image-handling specifically (it has guidance on the server-side fetch path per the 2026-05-08 captures).
- Per Rule 23, run Change Impact Audit before coding — the new SSRF-guarded endpoint is the most consequential new piece (security-class) so audit thoroughly.

**Rule 23 expected outcome:** Additive for the modal + the new endpoint (new optional input shape; no existing endpoint changes). The image upload finalize call gains `source: 'manual'` write — additive (Slice #1's plumbing already accepts it).

## Pre-session notes (optional, offline steps to do between sessions)

Nothing required. If director wants to pre-stage the future walkthrough (for the deploy session AFTER Slice #3):
- Pick a real Independent Website (or any platform) product page with a clearly identifiable competitor image to test the URL-of-image input modality.
- Have a clipboard-paste-ready image (a screenshot, copied from any source) on hand to test the paste modality.
- Have a small image file (~1-2 MB, well under the 10 MB cap) for the drag-drop modality.

## Why this pointer was written this way (debug aid)

Slice #3 is the largest of the three P-29 slices and the last one before the manual-add P-29 feature is complete end-to-end. The 2026-05-15 design pass already settled the input modalities (all three) and SSRF guardrails (allowlist + content-type + size cap). The session's main work is implementing all of it cleanly.

The director picked Slice #3 next via §4 Step 1c interview at the end of deploy session #14 — most thorough per `feedback_recommendation_style.md` (finish the P-29 three-slice arc before starting any other workstream).

**Alternate next-session candidates if director shifts priorities:**
- P-30 (Playwright React-bundle rig — unblocks UI regression coverage for all three modals + Slice #3's future spec)
- P-31 (route-handler DI refactor — unblocks API-layer regression coverage for `urls/route.ts` + `urls/[urlId]/text/route.ts` + the upcoming `images/finalize/route.ts`)
- P-28 (delete URLs cascade)
- P-27 (delete captured texts/images)
- Older polish items P-21 / P-19 / P-13

Check `ROADMAP.md` W#2 row for the canonical state.

**After Slice #3:** W#2 → main deploy session #15 to bring Slice #3 to vklf.com — by then the three-slice manual-add P-29 feature is complete.
