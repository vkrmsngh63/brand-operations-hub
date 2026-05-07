# COMPETITION SCRAPING — VISUAL-VERIFICATION BACKLOG

**Group:** B (tool-specific; loaded when W#2 work is in scope).
**Workflow:** W#2 Competition Scraping & Deep Analysis.
**Branch:** `workflow-2-competition-scraping`.
**Created:** 2026-05-07 in `session_2026-05-07_w2-plos-side-viewer-detail-page-slice` (Claude Code).
**Last updated:** 2026-05-07.

---

## Why this doc exists

W#2 PLOS-side slices ship UI faster than the data needed to populate it. The Chrome extension (slice (c) on the W#2 ROADMAP next-session list) is the canonical data-entry path; until it lands, every PLOS-side viewer slice is structurally untestable against real captured data because there is no manual-URL-add affordance on the PLOS side yet (deliberately deferred per the director's 2026-05-07 call — the alternative seed paths were declared not worth the friction vs. just waiting).

Rather than hold each slice's commit on a verification step that can't run, the director chose 2026-05-07: **defer all visual verification of W#2 PLOS-side UI until the extension build provides a data path; maintain a per-slice running tally of pending visual checks here; walk through each slice's checks together when the extension is up.**

This doc is the running tally.

---

## Format

Each slice that ships PLOS UI but defers visual verification appends one section here. Each section is append-only at slice-shipped time. When a slice's verifications all complete (post-extension-build walkthrough), the section's heading flips from "PENDING" to "✅ DONE YYYY-MM-DD" with a one-line note on outcome — the body stays unchanged for historical reference.

```
## Slice (a.x) — <one-line slice description> — PENDING <date shipped>
- [ ] Step 1: <click-by-click test>
- [ ] Step 2: <…>
...
- Notes: any edge cases to watch for; any seed-data prerequisites once extension exists
```

---

## Slice (a.1) — `/url/[urlId]` detail page (chrome + sizes + captured-text rows + image-count placeholder) — PENDING 2026-05-07

Shipped commit: (pending end-of-session commit on `workflow-2-competition-scraping`).

Walked-through tests once the extension can populate test data:

- [ ] **Step 1 — Click-row navigation change.** From the workflow root page (`/projects/<projectId>/competition-scraping`), click any row in the URL table. Expected: navigates IN-APP to `/projects/<projectId>/competition-scraping/url/<urlId>` instead of opening the competitor's website in a new tab.
- [ ] **Step 2 — Topbar.** Detail page renders the standard `<WorkflowTopbar>`: "Competition Scraping & Deep Analysis" title with the 🔍 icon + back-to-Project link.
- [ ] **Step 3 — Sub-breadcrumb.** "Competition Scraping › [Platform Name] › [shortened URL]". First segment links back to the URL list (no platform filter); second segment links back to the URL list scoped to that platform (URL bar shows `?platform=<name>`); third segment is the current URL, not a link.
- [ ] **Step 4 — URL metadata card.** URL text in blue + "Open original URL ↗" button (preserves the prior open-in-new-tab affordance). Read-only grid of fields: Platform, Product Name, Brand Name, Category, Product Stars, Seller Stars, # Product Reviews, # Seller Reviews, Results Page Rank, Added On, Last Updated. Empty fields show a gray italic "—". If `customFields` is non-empty, sub-grid at the bottom.
- [ ] **Step 5 — Sizes / Options sub-section.** Read-only table with Size/Option, Price, Shipping Cost, Added On. Empty state: "No sizes captured for this URL yet." Loading state: "Loading sizes…". Error state: red.
- [ ] **Step 6 — Captured Text sub-section.** Sortable table with Content Category, Text (wraps), Tags, Added On. Header includes `(N)` count. Default sort: Added On descending. Sort works on all columns except Tags. Empty state names the extension's gestures.
- [ ] **Step 7 — Image-count placeholder.** "N images captured for this URL — full-size viewer ships in slice (a.2)" or "No images captured for this URL yet." or red error message when the read fails. Image rendering itself is slice (a.2).
- [ ] **Step 8 — Stale URL ID (404).** Edit URL bar to a urlId that doesn't exist. Expected: "Couldn't load this URL — Competitor URL not found." Sub-sections do NOT render (page short-circuits on URL-row 404).
- [ ] **Step 9 — Forged URL ID (403-ish).** Edit URL bar to a urlId that belongs to a different Project. Expected: same 404 path because `verifyProjectWorkflowAuth` + projectWorkflowId scoping returns 404 (not the row's data) for cross-Project access attempts.
- [ ] **Step 10 — Refresh.** Hard-refresh (Ctrl+Shift+R) the detail page. Re-fetches all four reads cleanly.
- [ ] **Step 11 — Back button preserves URL list state.** From detail page, click breadcrumb's "[Platform Name]" link. URL list lands with that platform pre-selected in the sidebar (URL bar shows `?platform=<name>`).
- [ ] **Step 12 — Section independence.** If one of the sub-fetches errors but URL row + others succeed, the failing section shows its own red error message in-place; the rest of the page renders normally.

**Seed-data prerequisites** (before walking through these tests):

- At least one CompetitorUrl row owned by the verifying user, with non-empty Product Name + Brand Name + Category + ratings + customFields so Step 4 exercises non-null cells.
- At least one CompetitorUrl that's "minimum-fields-only" (just URL + platform; everything else null) so Step 4's "—" rendering is exercised too.
- At least 2 CompetitorSize rows under one URL so Step 5's table-with-rows path is exercised.
- At least 1 CompetitorUrl with zero sizes so Step 5's empty state is exercised.
- At least 3 CapturedText rows (different categories, with and without tags) under one URL so Step 6's sort + tag display is exercised.
- At least 1 CapturedImage row (any category) under one URL so Step 7's "N images captured" path is exercised + at least one URL with zero images for the empty path.

**API-side already verified (no extension needed):**

- The four GET read paths returning 200 with sane JSON, and 404 for stale + cross-Project urlIds, can be confirmed via `curl` with a Bearer JWT or DevTools console fetch even before extension data lands. Today's TypeScript build + lint already exercise the type contracts. A separate quick-check session could exercise the 404 + 200-with-empty paths via curl-with-known-Project before the full visual walkthrough.

---
END OF DOCUMENT
