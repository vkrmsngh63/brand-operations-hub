# Next session

**Written:** 2026-05-15 — session_2026-05-15-b_w2-p29-slice-1-build-session (Claude Code, on `workflow-2-competition-scraping`).

**For:** the next Claude Code session.

**Status of P-29 Slice #1:** ✅ **SHIPPED AT CODE LEVEL on `workflow-2-competition-scraping` commit `070820a` + end-of-session doc batch.** Schema migration `prisma db push` already applied to the live DB; all 25 + 8 + 10 = 43 existing rows backfill to `source='extension'` via the column default; counts unchanged post-migration. UI `UrlAddModal.tsx` mounted top-right of `UrlTable.tsx` toolbar (your pick). Wire shape `source` field flows on every read path through 6 W#2 toWireShape serializers. 10/10 node:test type-guard tests pass; 6/6 Playwright spec cases skipped pending the React-bundle stub-page rig (captured as **P-30** in the polish backlog). Route-handler DI refactor for API-layer regression coverage captured as **P-31**. Director manual walkthrough on real-independent-website end-to-end smoke is **deferred to a future W#2 → main deploy session** (workflow branch isn't live on vklf.com yet).

**The natural next pick:** Slice #2 = manual-add captured-text modal on the URL-detail page. Same shape as Slice #1 (modal popup pattern Q5; symmetric permission Q4 — already covered server-side; source field already plumbed end-to-end so no schema work this slice). Smaller than Slice #1.

---

## Branch
workflow-2-competition-scraping

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**W#2 P-29 Slice #2 build session — manual-add captured-text modal on the URL-detail page (`src/app/projects/[projectId]/competition-scraping/url/[urlId]/page.tsx`).** Closes (a.31) RECOMMENDED-NEXT.

This is a **BUILD session** — the design pass settled all 5 design decisions in `COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-15 entry; Slice #1 already shipped the schema migration + shared types + POST-route `source` acceptance + the URL-modal pattern. This slice mirrors the URL-modal shape onto the captured-text form. **No schema change** (Slice #1 covered it). **No new server route** — reuse existing `POST urls/[urlId]/text/route.ts`.

**Schema-change-in-flight flag stays "No"** at session start (Slice #1 already shipped the migration and flag was flipped back at its end-of-session doc batch). Per MULTI_WORKFLOW_PROTOCOL Rule 4: no schema handshake this slice.

**Slice #2 scope:**

1. **API route update** (`src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/text/route.ts`):
   - POST handler accepts optional `source` field in request body; defaults to `'extension'` if absent.
   - Validate via `isSource` from `shared-types/competition-scraping.ts` (already exported; see `src/lib/shared-types/competition-scraping.ts:isSource`).
   - **Note:** the GET/PATCH read-path serializer for `CapturedText` already includes `source` (Slice #1 update). Only the POST handler needs the new write-path field.

2. **UI: `CapturedTextAddModal.tsx`** (new component):
   - Location: `src/app/projects/[projectId]/competition-scraping/components/CapturedTextAddModal.tsx`.
   - Triggered by a new "+ Manually add captured text" button on the URL-detail page's text-tab toolbar.
   - Form fields matching the extension's right-click text-capture form shape:
     - Text (required, multi-line textarea — typical paste target)
     - Content Category (optional; existing vocabulary picker — design hint: defer vocabulary autocomplete to a polish item; simple text input is enough for Slice #2)
     - Tags (optional; comma-separated input that parses to `string[]`)
   - On submit: generate a `clientId` (UUIDv4 via `crypto.randomUUID()`) so the POST is idempotent; POST `/api/projects/[projectId]/competition-scraping/urls/[urlId]/text` with `source: 'manual'`.
   - Modal closes on success; new captured-text row appears in the URL detail page's text section.
   - Cancel/dismiss UX: X button + Escape + click-outside + Cancel button (mirror `UrlAddModal.tsx` exactly).

3. **Mount point in URL-detail page:** add the "+ Manually add captured text" button to the text-tab/section header. Pattern mirrors Slice #1's UrlTable toolbar mount. Modal state owned by the page component; on success, prepend the new row to the text-list state with `clientId`-dedup (mirroring CompetitionScrapingViewer's URL dedup).

4. **Playwright spec** (Rule 27 Hybrid — mechanical parts):
   - Extend `tests/playwright/p29-manual-add-url-modal.spec.ts` with parallel test.skip()-annotated cases for the text modal, OR create a new spec file `tests/playwright/p29-manual-add-captured-text-modal.spec.ts`. Defer the actual rig build to P-30.

5. **Director manual walkthrough** (Rule 27 Hybrid — judgment parts):
   - **Defer to W#2 → main deploy session** that brings Slice #1 + Slice #2 to vklf.com. Workflow branch isn't deployed; can't run end-to-end smoke there.

**Pre-build checklist at session start:**
- `git branch --show-current` confirms `workflow-2-competition-scraping`.
- `git log origin/main..workflow-2-competition-scraping` expects 2 commits (Slice #1 code `070820a` + Slice #1 doc batch).
- `git log workflow-2-competition-scraping..origin/main` expects 0 commits.
- Read `COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-15 + §B 2026-05-15-b entries (Slice #1 ship outcome + the original 5 design decisions).
- Read `src/app/projects/[projectId]/competition-scraping/components/UrlAddModal.tsx` to mirror the pattern.
- Read `src/app/projects/[projectId]/competition-scraping/url/[urlId]/page.tsx` to find the text-tab mount point.

**Rule 23 Change Impact Audit (no schema change this slice; no audit needed beyond confirming `source` field's downstream-consumer story is still TBD per DATA_CATALOG §7).**

## Pre-session notes (optional, offline steps to do between sessions)

Nothing required. If you want to look at Slice #1's shape before the build: open `src/app/projects/[projectId]/competition-scraping/components/UrlAddModal.tsx` — the captured-text modal will be a smaller version of it (3 fields instead of 9, no platform picker, no number validators).

## Why this pointer was written this way (debug aid)

Slice #1 shipped cleanly today at code level. The natural next step is Slice #2 — same modal pattern, smaller scope, no schema work, no new route. Slice #3 (image modal with three input modalities + SSRF-guarded URL-fetch endpoint) is the biggest of the three and waits for last.

The director picked the standing build-sequence order (#1 → #2 → #3) at design-session end; nothing in Slice #1's outcome surfaced a reason to reorder. If the director wants to interleave instead — for example, deploy Slice #1 to main between Slice #1 and Slice #2 so the new manual-add URL flow is verifiable end-to-end before Slice #2 builds on top — that's a Rule 14f-pick-at-session-start option to surface to me.

If the director's priorities have shifted: alternate candidates at this point are Slice #3 (manual-add image modal, biggest), P-28 (delete URLs with cascade), P-27 (delete captured texts/images), P-30 (Playwright React-bundle rig — unblocks Slice #1+#2+#3 modal regression coverage in one place), P-31 (route-handler DI refactor — unblocks API-layer regression coverage), P-21 / P-19 / P-13 (older polish items). Check `ROADMAP.md` W#2 row Current Active Tools for the canonical state.
