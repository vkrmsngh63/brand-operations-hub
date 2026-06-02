# P-57 — Fill the delete-coverage gaps on the competitor detail pages (videos + category labels)

**Status:** 🟡 IN-PROGRESS 2026-06-02-g (`session_2026-06-02-g_p57-delete-coverage-gaps`) — spec created as the session's first artifact per Rule 31. W#2 Competition Scraping; competitor URL detail page (`url/[urlId]`). Schema change: TBD (depends on the §4 Q1/Q2 category-deletion design decision). _(Captured 2026-06-02-d as ROADMAP entry P-57; this spec doc created 2026-06-02-g — it did not exist before.)_

**Severity:** MEDIUM-HIGH — data-management completeness: users cannot remove captured videos or any category label from the detail page today.

---

## §1 — Original director instructions (VERBATIM, append-only)

> **2026-06-02-d:** "In workflow #2, user should be able to delete reviews from the competitor details pages. Also make sure user is able to delete text, content categories, images, image categories, videos, video categories from the product details pages."

### Plain restatement (for traceability — NOT a substitute for §1)

On the competitor URL detail page, the user should be able to delete each of: reviews, captured text, content-category labels, captured images, image-category labels, captured videos, and video-category labels.

---

## §2 — Joint-discussion adjustments (append-only, chronological)

- **2026-06-02-g — Rule 3 code-truth audit (FIRST action; before any design):** mapped the existing delete coverage for all 7 item types. Findings:

  | Item type | Backend DELETE | UI control | Gap |
  |---|---|---|---|
  | Captured **reviews** | ✅ `reviews/[reviewId]` (L74) + `reviews/batch-delete` | ✅ per-row trash + bulk toolbar (`UrlDetailContent.tsx` L2598 / L2412) | **NONE — already shipped** |
  | Captured **text** | ✅ `text/[textId]` (L190) | ✅ per-row trash (L1267 → `handleTextDeleted` L240) | **NONE** |
  | Captured **images** | ✅ `images/[imageId]` (L228) | ✅ per-row trash (L1574 → `handleImageDeleted` L283) | **NONE** |
  | Captured **videos** | ✅ `videos/[videoId]` (L238) — fully implemented (deletes DB row + storage video/thumbnail) | ❌ **deferred** — explicit code comment at `UrlDetailContent.tsx` ~L1637 "no per-video delete in v1" | **UI delete control MISSING** (backend ready) |
  | **Content categories** (text labels) | ❌ — `/vocabulary` route has only GET + POST, no DELETE | ❌ no delete affordance | **category-label delete unsupported (backend + UI)** |
  | **Image categories** | ❌ same | ❌ | same |
  | **Video categories** | ❌ same | ❌ | same |

- **Category storage model (decisive for the design):** categories are NOT separate per-item entities. They are a **project-level shared vocabulary pool** — `VocabularyEntry` rows `(projectId, vocabularyType, value)` where `vocabularyType ∈ {content-category, image-category, video-category, …}`. Each capture row stores the string VALUE in `CapturedText.contentCategory` / `CapturedImage.imageCategory` / `CapturedVideo.videoCategory` (a semantic FK to the value, NOT a UUID; no DB constraint). Picked via `VocabularyPicker.tsx` (typeahead + "+ Create"). So "delete a category" = delete a `VocabularyEntry` **project-wide**, which leaves any capture rows still carrying that string orphaned unless explicitly cleared. The same picker also serves non-category vocab (Competition Category / Product Name / Brand Name) — the directive only asks for the three category types.

**Net: two real gaps to fill** — (1) per-video delete UI (backend already there; straightforward mirror of the image card), and (2) category-label deletion for the three category vocabulary types (needs a NEW backend DELETE + a UI affordance + a decision on what happens to items using a deleted category — §4).

---

## §3 — Current consolidated spec (rolled-up source-of-truth)

**Part A — Captured-video delete UI (no design fork; default-to-recommendation):**
- Add a per-video delete (trash) control to `CapturedVideosGallery` / the video card in `UrlDetailContent.tsx`, mirroring the captured-image card exactly: trash button → confirm → `DELETE /videos/[videoId]` → optimistic removal from the loaded slot. Reuse the existing image delete handler shape (`handleImageDeleted` → `handleVideoDeleted`). Backend route already exists and deletes the DB row + storage files.

**Part B — Category-label deletion (pending §4 design decisions):**
- NEW backend DELETE for a `VocabularyEntry` (likely `DELETE /api/projects/[projectId]/vocabulary` with `{ vocabularyType, value }`, or a new `/vocabulary/[id]` route), scoped to the project + the three category vocab types.
- On delete, handle capture rows still using that category per the §4 Q1 decision (block / clear-label-keep-items / delete-items-too).
- UI affordance reachable from the detail page per the §4 Q2 decision (trash row in the `VocabularyPicker` dropdown for category types / a dedicated manage-categories surface).
- A confirm dialog that makes the **project-wide** scope + affected-item count explicit (deleting a category is not a per-URL action).

**No AI-model code. Likely NO new PLOS page route** (Part A reuses an existing route; Part B adds a DELETE method to an existing route or one `[id]` route — confirm route-count impact at build).

**Verification:** director real-Chrome on vklf.com — delete a video from a detail page (confirm it disappears + stays gone on refresh); delete a category label (confirm it's gone from the picker + items behave per the chosen Q1 semantics). Check 6 Playwright per Rule 27 (likely SKIPPED — visual/data judgment).

---

## §4 — Open questions — ✅ RESOLVED 2026-06-02-g (Rule 14f AskUserQuestion)

- **Q1 — when a category label is deleted, what happens to capture items currently assigned it (project-wide)? → RESOLVED: Option C "Delete items too."** The director explicitly chose (from a clearly-labeled destructive option warning of data loss) to delete the category label AND permanently delete every CapturedText / CapturedImage / CapturedVideo in the project tagged with it (with storage cleanup for images/videos). **Mitigation (Claude-added, not a re-litigation of the pick):** because this is a destructive project-wide op fired from an inline dropdown, the confirm dialog MUST show the exact count of items that will be deleted + an explicit "this is project-wide and permanent" warning before the delete runs, to prevent a misclick mass-deletion.
- **Q2 — where does the control live + which vocab types? → RESOLVED: Option A "trash affordance in the `VocabularyPicker` dropdown."** A trash icon on each existing suggestion row, shown ONLY for the three category vocab types (content-category / image-category / video-category). Non-category vocab (Product Name / Brand Name / Competition Category) is OUT of scope.
- **Q3 — scope: project-wide.** Confirmed implicitly by Q1 (the directive + the chosen option are project-wide); the confirm dialog states it.
- **Q4 — schema: NO change.** Deleting a `VocabularyEntry` row + deleting capture rows = no new field. If a field/migration turns out to be needed, Rule 23 audit + Rule 9 authorization before any `prisma db push`.

---

## §5 — Cross-references

- `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx` — all per-item cards + delete handlers (text L240/L1267, image L283/L1574, review L323/L2598, video card ~L1637 no-delete).
- `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/VocabularyPicker.tsx` — the category typeahead (GET/POST `/vocabulary`; no delete today).
- `src/app/api/projects/[projectId]/competition-scraping/{videos,images,text,reviews}/[*Id]/route.ts` — the per-item DELETE routes (video DELETE exists, unused by UI).
- `src/app/api/projects/[projectId]/vocabulary/route.ts` — GET + POST only; needs a DELETE for Part B.
- `prisma/schema.prisma` — `VocabularyEntry` (L625) + `CapturedText.contentCategory` (L326) / `CapturedImage.imageCategory` (L356) / `CapturedVideo.videoCategory` (L413).
- **P-27 / P-28** — prior delete work (URLs + text + images); the video delete UI was deferred from P-27 Build #5.
- `docs/ROADMAP.md` P-57 — the captured directive.
