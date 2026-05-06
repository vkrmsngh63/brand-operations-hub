# COMPETITION SCRAPING & DEEP ANALYSIS — STACK + ARCHITECTURE DECISIONS (Workflow #2)

**Workflow number:** W#2
**Workflow name:** Competition Scraping & Deep Analysis (🔍)
**Doc type:** Group B (workflow-specific). Loaded whenever a session works on W#2.
**Status:** 🔄 Design phase — stack decisions FROZEN at end of W#2 Stack-and-Architecture session.
**Branch:** `workflow-2-competition-scraping`
**Created:** May 4, 2026
**Created in session:** session_2026-05-04_w2-stack-and-architecture (Claude Code; second W#2 session, follow-up to 2026-05-04 Workflow Requirements Interview)
**Last updated:** May 7, 2026 (W#2 API-routes session-2 build — §11.1 doc-update batch: (1) image RPC paths reshaped from colon-suffix `images:requestUpload` / `images:finalize` to slash-based `images/requestUpload` / `images/finalize` for Next.js folder convention alignment, repo precedent (`canvas/sister-links` etc.), and URL-encoding cleanliness — Next.js App Router has no documented support for `:` in folder names and the existing repo uses slash-based sub-resources throughout. Pivoted at code-write time; flagged via deferred task; doc updated end-of-session per Rule 14e. The extension is not yet built so route-rename cost is still cheap per §11.3. (2) `images/finalize` body shape extended from `{ clientId, capturedImageId, composition?, embeddedText?, tags? }` to additionally include `mimeType` (required), `sourceType` (required), `fileSize` (optional), `imageCategory` (optional). Reason: server needs `mimeType` + `sourceType` to (a) re-derive the storagePath at finalize without keeping intermediate state between requestUpload and finalize, and (b) populate the corresponding required schema columns. `fileSize` + `imageCategory` are recorded on the row at finalize so PATCH isn't required for the standard happy path. All four values are echoed from the extension's WAL — no new client knowledge required. The shared types at `src/lib/shared-types/competition-scraping.ts` are the single source of truth and were updated in lockstep with the routes this session.)
**Last updated in session:** session_2026-05-07_w2-api-routes-session-2 (Claude Code, on `workflow-2-competition-scraping` branch)
**Previously updated:** May 4, 2026 (creation)

**Companion docs:**
- `COMPETITION_SCRAPING_DESIGN.md` — Workflow Requirements Interview answers (§A frozen) + in-flight refinements (§B append-only). This stack-decisions doc is referenced from §B.
- `HANDOFF_PROTOCOL.md` Rule 18 — Workflow Requirements Interview methodology + §B mid-build read-back + reciprocal output declarations
- `HANDOFF_PROTOCOL.md` Rule 25 + `MULTI_WORKFLOW_PROTOCOL.md` — Multi-workflow coordination (W#2 lives on `workflow-2-competition-scraping` branch; schema-change-in-flight flag set "Yes" 2026-05-04 covering this session + the next implementation session)
- `PLATFORM_REQUIREMENTS.md` §10.1 — Non-web-app clients pattern (W#2 is the first; auth + API + distribution patterns established here apply to all future non-web clients)
- `PLATFORM_REQUIREMENTS.md` §10.4 — Coding portability requirement (storage helper wrapper)
- `PLATFORM_REQUIREMENTS.md` §12.6 — Three shared component patterns surfaced by W#2 design (reframed 2026-05-05 from "scaffold extension-points" per the components-library architectural pivot — see `WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md`)

**Doc purpose:** captures the FROZEN architectural decisions for W#2's two halves (Chrome extension + PLOS web section). Subsequent build sessions read this doc rather than re-deriving choices. Treated as the authoritative pre-implementation spec — like §A in the design doc, this doc's §1–§13 are FROZEN at end-of-session 2026-05-04. Any in-flight refinements during build go into the design doc's §B (not this doc), keeping this doc stable as a long-lived reference.

**Decision-making methodology:** every section below was presented to the director as a multi-option pick (per `HANDOFF_PROTOCOL.md` Rule 14f) or a proposal-with-defaults (where there was no user-visible difference between options per Rule 15). Per-option recommendations followed the director's standing preference for the most-thorough-and-reliable path (memory: `feedback_recommendation_style.md`). Where the director overrode a recommendation, that's noted explicitly so future sessions know which decisions were the director's product call vs. Claude's technical pick.

---

## Table of contents

- §1 — Extension framework: WXT (TypeScript-first Manifest V3 wrapper)
- §2 — Auth pattern: direct email + password via Supabase `signInWithPassword`
- §3 — Image storage flow: signed-URL direct upload to Supabase Storage
- §4 — Region-screenshot mechanism: `chrome.tabs.captureVisibleTab` + canvas crop
- §5 — URL-add gesture: floating "+ Add" button on link hover (director override of recommendation)
- §6 — Highlight Terms color palette: 20 swatches (10 light + 10 dark, auto-flip), WCAG AA contrast
- §7 — Add-text gesture: click "Add Text" in extension popover after highlighting (director override of recommendation)
- §8 — Sync cadence + redundancies: 10s polling Phase 1; Realtime Phase 2; full safety-net spec
- §9 — Schema design: 7 W#2-scoped tables + 2 cross-workflow tables
- §10 — PLOS-side route structure
- §11 — API route structure
- §12 — Build pipeline + repo layout: monorepo at `extensions/competition-scraping/`
- §13 — Distribution: Phase 1 unpacked + zip; Phase 2 Chrome Web Store Unlisted; **detailed user guide always-visible in PLOS**
- §14 — Cross-doc updates required at end of this session
- §15 — Open implementation questions deferred to build sessions

---

## §1 — Extension framework: WXT

**Decision:** Use **WXT** (https://wxt.dev) as the Chrome extension framework.

**What WXT is:** a modern Manifest V3 framework, TypeScript-first, batteries-included. Wraps Vite for the build pipeline; auto-generates the `manifest.json` from file conventions; handles content-script bundling, message routing, and hot reload during development.

**Why WXT over the alternatives:**

| Option | Why not |
|---|---|
| Plain Manifest V3 + vanilla JavaScript (no framework) | Lightest weight, but the multi-table viewer + color picker + URL-overlay UI in §A.7 would need ~30-40% more hand-rolled code (no React, no shared component primitives, no build tooling). High recurring maintenance tax. |
| Manifest V3 + React with hand-rolled Vite tooling | Same React as the rest of PLOS, but we'd hand-set-up the build (Vite config, manifest packaging, content-script bundling, hot reload) and maintain it. Significant non-trivial recurring tax. |
| Plasmo | Mature batteries-included framework; opinionated. More "magic" file conventions than WXT, slightly larger dependency surface, less inspectable when something breaks. |
| **WXT (chosen)** | Same batteries-included DX as Plasmo, but TypeScript-first, smaller dependency surface, less "magic" — closer to standard Manifest V3 file shapes, which means easier debugging when something breaks. Active maintenance through 2024-2025. Used by a growing list of production extensions. **Reasoning per director's standing preference (most-thorough-and-reliable):** lowest risk of framework-specific debugging time when production issues emerge; thinnest abstraction layer over Manifest V3 (escape hatch always available). |

**Reversibility:** medium. Easy to switch in the first ~few hundred LOC of UI; expensive after ~1,000 LOC. **The decision is effectively a one-way door after the first few build sessions.**

**Implementation notes for build sessions:**
- WXT install: `pnpm dlx wxt@latest init` inside `extensions/competition-scraping/`.
- Project config: `wxt.config.ts` defines manifest sections; folder convention defines content scripts + popup + options page.
- Hot reload during dev: `wxt dev` reloads on file save.
- Production build: `wxt build` → `extensions/competition-scraping/.output/chrome-mv3-prod/`.
- Chrome Web Store package: `wxt zip` → `extensions/competition-scraping/.output/chrome-mv3-prod.zip`.
- TypeScript strict mode ON (matches the rest of PLOS).
- React: WXT supports React via its Vite plugin. UI components are built with the same patterns as the PLOS web app (functional components + hooks).

**Cross-doc impact:**
- New top-level folder `extensions/` in repo root. Captured in `PLATFORM_ARCHITECTURE.md` §1 file structure at end-of-session.
- New `package.json` inside `extensions/competition-scraping/` (separate from the root `package.json`); managed via the monorepo pattern in §12.

---

## §2 — Auth pattern: direct email + password via Supabase `signInWithPassword`

**Decision:** the extension uses Supabase Auth's `signInWithPassword` directly (the same method the PLOS web app uses internally). User signs in with their PLOS email + password from a "Sign in" screen inside the extension; Supabase returns a JWT + refresh token; both are stored in `chrome.storage.local`; JWT is sent in the `Authorization: Bearer <token>` header on every PLOS API call; refresh token auto-renews the JWT before expiry.

**Why this pattern over the §A.17 framings (long-lived API token vs OAuth device flow):**

The §A.17 question framing missed this option. Re-reading the director's free-form brief (`COMPETITION_SCRAPING_DESIGN.md` §A.15) made it explicit: *"there should be a way for the user to enter their credentials to log into the extension."* Direct credentials match the brief literally + the same auth boundary as the web app + leverages a battle-tested Supabase library + zero new server-side code (every existing `verifyAuth` route accepts the JWT identically).

| Option | Why not |
|---|---|
| Long-lived API token (PAT-style — user generates token in PLOS settings, copies into extension) | The generate-copy-paste flow is friction for non-programmers. Better suited to headless clients (CI scripts, automation) than human-driven UI. |
| OAuth 2.0 device flow (extension shows a code; user enters code on `vklf.com/connect-extension`; PLOS approves; extension polls + gets tokens) | More implementation work on the PLOS side (new `/connect-extension` page + device-code endpoint + polling endpoint). Better security boundary in theory (extension never sees the password), but Supabase's library handles password input cleanly inside the chosen pattern; no marginal benefit for our case. |
| **Direct `signInWithPassword` (chosen)** | Matches the brief literally; same auth as web app (uniform pattern, less code); lowest UX friction; Supabase library handles JWT + refresh token lifecycle automatically. |

**Token storage:**
- JWT + refresh token live in `chrome.storage.local` (extension-scoped, per-Chrome-profile, persists across reloads).
- NOT in `chrome.storage.sync` — sync would cross devices via Google account, which is a wider trust boundary than we want for tokens.

**Token refresh:**
- Supabase JS client handles refresh automatically when the access token nears expiry (default ~1 hour TTL).
- If the refresh token itself expires (~30 days idle), the extension prompts the user to sign in again.

**Sign-out:**
- Extension settings include a "Sign out" button. Calls `supabase.auth.signOut()` + clears `chrome.storage.local` token entries + redirects to the sign-in screen.

**Reversibility:** high. We can ADD long-lived API tokens or OAuth device flow in a future session if a use case emerges (e.g., Phase 3 worker bulk-onboarding via QR codes or admin-issued API tokens). The pick today locks in the FIRST pattern, not the only one.

**Implication for `verifyAuth` server-side:** zero changes needed. The existing `Authorization: Bearer <JWT>` flow in `src/lib/auth.ts:50-83` validates Supabase JWTs identically regardless of which client produced them.

**Implication for non-web-app clients pattern (PLATFORM_REQUIREMENTS.md §10.1):** the chosen pattern is now the platform's first non-web-app client auth choice. Future non-web clients (mobile app, desktop tool) inherit this choice as the default unless their use case specifically argues otherwise.

**Cross-doc impact:** `PLATFORM_REQUIREMENTS.md §10.1` updated end-of-session to record direct-credentials as the chosen non-web-client auth pattern (resolves the §10.1 deferred decision).

---

## §3 — Image storage flow: signed-URL direct upload

**Decision:** images uploaded via a **two-phase signed-URL flow**:

1. **Phase 1 — request upload URL.** Extension POSTs metadata (filename, MIME type, file size, target competitorUrlId, target imageCategory, sourceType, clientId UUID) to `POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/images:requestUpload`. Server responds with a short-lived (5-minute TTL) signed Supabase Storage URL pointing to `competition-scraping/{projectId}/{competitorUrlId}/{capturedImageId}.{ext}`.

2. **Phase 2 — direct upload.** Extension uploads the image bytes directly to Supabase Storage using the signed URL (HTTPS PUT; bytes never transit through Vercel).

3. **Phase 3 — finalize.** Extension POSTs to `POST .../images:finalize` with the same clientId. Server creates the `CapturedImage` DB row referencing the storage path. If the row already exists for the clientId (retry case), server returns the existing row.

**Why direct upload over server-relay:**

| Option | Why not / Why |
|---|---|
| Server-relay (extension → Vercel → Supabase) | Every byte transits through a Vercel function. Vercel functions cap body size around 4.5 MB (varies by runtime); a single A+ Content screenshot near the 5 MB cap may fail. Bandwidth doubles (egress from Vercel + ingress to Supabase). Vercel function timeout (5 min) becomes a ceiling for large uploads. |
| **Direct upload via signed URL (chosen)** | Bytes never pass through Vercel — bypasses size + timeout cliffs entirely. Bandwidth on Supabase only (not doubled). Faster perceived upload speed for the user. Most-thorough-and-reliable: zero risk of the Vercel-function-size-cliff failure mode. |

**Storage configuration:**
- **Bucket:** `competition-scraping` (private; signed-URL-only access). Created once at deploy time via Supabase CLI or dashboard.
- **Path structure:** `{projectId}/{competitorUrlId}/{capturedImageId}.{ext}` — per-Project folder so admin-reset-this-Project can wipe in a single storage call (`storage.from('competition-scraping').remove({ prefix: '{projectId}/' })`).
- **Existing `admin-notes` bucket:** unaffected. Distinct buckets per workflow per `PLATFORM_REQUIREMENTS.md §10.2`.

**Accepted MIME types:**
- `image/jpeg`
- `image/png`
- `image/webp`
- **Reject** `image/svg+xml` (XSS risk — SVG can contain JavaScript)
- **Reject** `image/heic` / `image/heif` (browser compatibility — PLOS web view can't render these)

**Size cap per upload:** **5 MB**. Enforced at Phase 1 (`requestUpload` rejects if `file_size > 5_242_880`). Reasoning: A+ Content screenshots at 1080p webp average ~1-2 MB; product shots ~200 KB; 5 MB cap covers the heavy tail without permitting accidental video uploads or oversized PNGs.

**Thumbnails:**
- Use Supabase Storage's on-the-fly image transformation feature (Pro tier already paid for via W#1).
- Render: `supabase.storage.from('competition-scraping').createSignedUrl(path, 3600, { transform: { width: 200, height: 200, resize: 'contain' } })`.
- No pre-generated thumbnail files — single original; transform on demand.
- Fallback if transform fails: render the full-size image scaled down by CSS (acceptable degradation).

**Signed URL TTL for viewing:** 1 hour. Re-issued on every PLOS web page render (inexpensive — single Supabase API call per render).

**Janitor for orphans:**
- Daily Vercel cron job (scheduled via `vercel.json` `crons` field).
- Logic: list all files in `competition-scraping/`; cross-reference against `CapturedImage.storagePath` rows; delete any storage file with no matching DB row OR with a matching row but `addedAt > 24h ago` and the row is missing (idempotency-failed orphan).
- Runs at 03:00 UTC.

**Storage helper wrapper (per `PLATFORM_REQUIREMENTS.md §10.4`):**
- New file: `src/lib/competition-storage.ts`.
- Exports: `requestUploadUrl(...)`, `finalizeUpload(...)`, `getThumbnailUrl(...)`, `getFullSizeUrl(...)`, `deleteImage(...)`, `wipeProjectImages(projectId)`.
- All Supabase Storage SDK calls wrapped here. Future swap to S3 only requires replacing this helper.

**Reversibility:** medium. We can switch upload approaches in a future session; in-flight uploads break for users until they reload the extension; saved images stay safe. Switching path structure is harder (requires bulk file moves or path-rewriting logic).

---

## §4 — Region-screenshot mechanism: `chrome.tabs.captureVisibleTab` + canvas crop

**Decision:** when the user invokes region-screenshot mode, the extension uses Chrome's built-in `chrome.tabs.captureVisibleTab` API to capture the visible viewport as a PNG, then crops to the user's drawn rectangle using the JavaScript canvas API.

**Why over the alternatives:**

| Option | Why not / Why |
|---|---|
| `html2canvas` (third-party DOM-walking renderer) | Known issues with Amazon's exact patterns: cross-origin product images often render as blanks; CSS transforms break; sticky-positioned elements get duplicated. The library author flags A+-Module-style image+text-overlay as a hard case. ~1-3 sec render time. |
| Auto-scroll-stitch (capture multiple visible-tab screenshots while scrolling, stitch together) | Solves the below-fold problem but noticeably more complex (timing jitter while page reflows during scroll, some sites detect rapid scroll and de-render). 1-2 future sessions of build work just for this. Defer until needed. |
| **`chrome.tabs.captureVisibleTab` + canvas crop (chosen)** | Pixel-perfect (matches what the user sees); fast (~50-200ms); no third-party library; no DOM-walking quirks. **Limitation:** captures only what's currently visible. UX hint shown when the user's rectangle hits the viewport edge: *"This module looks taller than your screen — scroll to fit it in view, then drag the rectangle. For very tall modules, capture in two halves."* |

**UX flow:**
1. User clicks the region-screenshot button in the extension popover.
2. Content script overlays the page with a transparent layer + crosshair cursor.
3. User drags a rectangle over the A+ module. Rectangle is highlighted with a thin contrasting border + dim outside.
4. On mouse-up, content script calls `chrome.tabs.captureVisibleTab(null, { format: 'png' })` → gets a base64-encoded PNG of the full viewport.
5. Content script crops to the user's rectangle in a hidden canvas (`drawImage` + `getImageData`).
6. Cropped image flows into the standard Module 2 image-save flow (Composition + Embedded-text fields + image category picker).

**Permission required in Manifest V3:** `"activeTab"` + `"<all_urls>"` host permissions. Captured at extension install time; users see this in the install prompt.

**Reversibility:** medium-high. We can swap mechanisms in a future session; saved screenshots stay safe. New uploads use the new mechanism. Auto-scroll-stitch (Option C above) is a clean future-additive enhancement if users frequently need below-fold capture.

**Defer to ROADMAP for future polish:** auto-scroll-stitch upgrade (1-2 sessions; promote when usage data shows users routinely fighting the viewport limit).

---

## §5 — URL-add gesture: floating "+ Add" button on link hover (director override)

**Decision:** the URL-add gesture is a **floating "+ Add" button** that appears next to a competitor product link when the user hovers over it. Clicking the button opens the URL-capture overlay with the product fields.

**Director's product call (overrode Claude's recommendation of `right-click + Alt+Click`):** the floating button is the most visible and most discoverable gesture for non-technical workers in Phase 3. Workers are platform specialists, not power users; they need an obvious affordance, not a chord. The brief says the director wants this to feel intuitive for any worker who installs the extension on day 1.

**Implementation guardrails (proposed by Claude during the cluster, accepted by director by absence of pushback):**

1. **Hover delay:** the button appears 300ms after the cursor enters the link's bounding box. Prevents flicker on quick mouse-over events (e.g., user scrolling past with cursor still over the page).
2. **Scope filter:** the button appears only on URLs that match the **product-detail-page pattern for the currently-selected platform**. Per-platform URL-pattern modules:
   - Amazon: `/dp/{ASIN}` and `/gp/product/{ASIN}` only
   - Ebay: `/itm/{listing-id}` only
   - Etsy: `/listing/{id}` only
   - Walmart: `/ip/{slug}/{id}` only
   - Google Shopping: results-page items (links to `/shopping/product/...`)
   - Google Ads: ad-click destination links (detected via the `data-ad-id` attribute or DOM ancestry)
   - Independent Websites: applied to every link the user explicitly opts in to (since there's no canonical product-page pattern); fallback to the right-click context-menu gesture documented as redundant secondary path.
3. **Per-session dismiss:** the button has an "×" sub-button. Clicking it hides the button for the rest of the current page-load; reload restores. Useful for power users who find the button intrusive.
4. **Visual style:** small (~24×24px), pinned to the upper-right corner of the link's bounding box, semi-transparent until hovered, fully opaque on hover. Branded with a small PLOS logomark + "+" so the user recognizes the action.
5. **Z-index:** `2147483647` (highest legal z-index) so the button always appears above any overlay or modal the source platform's page renders.
6. **Backup secondary gesture:** right-click context-menu item *"Add to PLOS — Competition Scraping"* always available regardless of the floating button. Provides a fallback for any case where the button doesn't appear (network slow, content script slow to inject, user is in a search-result list with so many product links the buttons would clutter).

**Reversibility:** high. We can adjust the gesture, add additional shortcuts, or remove the floating button entirely in any future session via an extension update.

**Implication for content-script architecture:**
- A per-platform DOM-pattern module (e.g., `src/content-scripts/platforms/amazon.ts`) handles link detection + button injection + URL extraction for that platform.
- A common module (e.g., `src/content-scripts/floating-button.tsx`) handles the button render, hover delay, dismiss, and click → message-port-to-background → opens the URL-capture overlay.
- This per-platform separation means a site redesign on (say) Amazon only requires updating `amazon.ts`, not all platforms. Captured as a §A.13 edge-case mitigation already.

---

## §6 — Highlight Terms color palette: 20 swatches, WCAG AA contrast

**Decision:** **20 colors** in the swatch grid (4×5 layout), split into 10 light + 10 dark for the auto-flip text contrast. **WCAG AA** (4.5:1) is the contrast bar for the auto-flipped text/background pair (NOT WCAG AAA — see reasoning below).

**Palette:**

**10 light swatches (auto-text = black `#000000`):**

| # | Name | Hex |
|---|---|---|
| 1 | Banana yellow | `#FFEB3B` |
| 2 | Rose pink | `#F8BBD0` |
| 3 | Sky cyan | `#B2EBF2` |
| 4 | Mint green | `#C8E6C9` |
| 5 | Lilac | `#E1BEE7` |
| 6 | Peach | `#FFCCBC` |
| 7 | Lime | `#DCEDC8` |
| 8 | Coral | `#FFAB91` |
| 9 | Sage | `#B2DFDB` |
| 10 | Periwinkle | `#C5CAE9` |

**10 dark swatches (auto-text = white `#FFFFFF`):**

| # | Name | Hex |
|---|---|---|
| 11 | Royal blue | `#1976D2` |
| 12 | Forest green | `#388E3C` |
| 13 | Crimson | `#C2185B` |
| 14 | Navy | `#303F9F` |
| 15 | Burnt orange | `#E64A19` |
| 16 | Teal | `#00796B` |
| 17 | Indigo | `#512DA8` |
| 18 | Magenta | `#AD1457` |
| 19 | Burgundy | `#7B1FA2` |
| 20 | Slate | `#455A64` |

**Why WCAG AA (4.5:1) and not WCAG AAA (7:1):**
- AAA (7:1) would force us to drop swatches OR pick darker/lighter extremes that visually blur together (e.g., several near-black or several near-white swatches that the user struggles to distinguish in the picker).
- AA (4.5:1) is the bar for body text; for highlight-on-page use the term remains plainly readable while preserving 20 well-distinguishable swatch options.
- §A.17 had said "AAA"; reconsidered + revised to AA at this session.

**Color-blind consideration:** the palette includes red+green pairings (Forest green #12, Crimson #13) that protan/deutan users may struggle to distinguish. **Mitigation:** each highlighted term in the panel renders WITH its term label next to the color swatch, so color is always supplementary identification, never the only identifier. Future polish: optional color-blind-safe sub-palette (deferred to W#2 polish backlog post-build).

**UI for the picker:**
- 4×5 grid of swatches (rows of 5, 4 rows tall). Light row 1 + 2; dark row 3 + 4.
- Each swatch ~32×32px with a 2px gap.
- Selected swatch shows a thin black border (or white border if the swatch itself is dark).
- Each swatch has the color name as a tooltip on hover.

**Storage in DB:**
- The hex string is what's stored (`HighlightTerm.color = '#FFEB3B'`).
- HighlightTerms themselves are extension-local (`chrome.storage.local`) for Phase 1 — they're a per-(user, project) working tool, not captured data. Future session can promote to PLOS DB if cross-device sync is requested.

**Default colors for the first 5 added terms (so user doesn't have to pick):** banana, royal blue, mint, crimson, peach (rotates through palette in this order).

**Reversibility:** very high. Palette is a small constant array in the extension code; changing colors or contrast bar is trivial in any future session. No data migration risk.

---

## §7 — Add-text gesture: click "Add Text" in extension popover (director override)

**Decision:** the user highlights a span of text on the competitor's page; the **extension's popover** (visible while the extension is active on the current platform) displays an **"Add Text" button** that's enabled only when there's an active text selection on the page. Clicking the button opens the content-category picker + Composition+Tags fields in the same dialog (single motion: highlight → click Add Text → pick category → save).

**Director's product call (overrode Claude's recommendation of `right-click context-menu + Ctrl+Shift+S`):** same reasoning as Q5 — most visible and most discoverable for non-technical workers in Phase 3. The popover button is always-on-screen while the extension is open; users learn it on day 1 without keyboard chord training.

**Implementation guardrails:**

1. **Selection capture:** the popover reads `window.getSelection()` IMMEDIATELY when the user clicks the Add Text button — before the popover gets focus. Browsers normally clear the selection when focus moves to a different element, so the read order is critical: click handler → capture selection → THEN open the category-picker dialog.
2. **Selection mirror:** the captured text is shown verbatim at the top of the category-picker dialog ("You're saving: '<first 200 chars>...'") so the user can confirm they selected what they meant to. Editable (user can trim or extend before saving).
3. **Same-dialog category pick:** the "Add Text" dialog includes the content-category dropdown (typeahead with create-new option), Composition (auto-empty for text rows; only on images per §9 schema), Tags (free-form), Save button. Single-motion completion.
4. **Backup secondary gesture:** right-click context-menu item *"Save text to PLOS"* always available as a fallback. Provides redundancy if the popover is closed (user clicked outside) or if the selection-capture timing fails on a particularly slow page.
5. **Empty-selection state:** when no text is selected on the page, the Add Text button is disabled with a tooltip *"Highlight some text on the page first."*
6. **Selection persistence on iframes:** Amazon and others use iframes for some content blocks. The content script injects into all iframes (per Manifest V3 `all_frames: true`); selection-capture works across iframe boundaries provided each iframe shares the same origin or has the proper permissions.

**Reversibility:** very high. UI gestures are extension-side; changes are extension updates with no data migration.

---

## §8 — Sync cadence + redundancies: 10s polling Phase 1; Realtime Phase 2; full safety-net spec

**Decision:** Phase 1 uses **10-second polling** with foreground/background/typing rules; Phase 2 upgrades to Supabase Realtime when platform-wide realtime infrastructure ships (per `PLATFORM_REQUIREMENTS.md §3.4`). A comprehensive sync-failure safety net is required so missed syncs are caught early and recoverable.

### §8.1 Polling cadence (Phase 1)

| Condition | Polling rate |
|---|---|
| Tab foregrounded + extension popover open + no input field has focus | **10 seconds** |
| Tab backgrounded > 60 seconds | **60 seconds** (slows to once-per-minute to save bandwidth + battery) |
| Any input field in the extension has focus (user typing) | **paused** — resumes 2 seconds after the last keystroke |
| User explicitly clicks "Refresh" | **immediate** (one-shot) |

**What's polled:**
- The captured-data list for the **currently-loaded Project** (URL list + counts).
- The captured-data list for the **currently-active URL detail** (text + images + sizes), if the user is viewing one.
- **NOT polled:** entire PLOS state, vocabularies (rarely change; fetched on-demand), other Projects.

**Server response:**
- Includes `Last-Modified` HTTP header.
- Extension sends `If-Modified-Since` header on subsequent polls.
- Server returns `304 Not Modified` when nothing has changed (saves bandwidth on the no-op majority of polls).

### §8.2 Realtime upgrade (Phase 2)

- When platform-wide realtime infrastructure ships per `PLATFORM_REQUIREMENTS.md §3.4`, W#2 swaps polling for Supabase Realtime subscriptions on the W#2 tables (`CompetitorUrl`, `CapturedText`, `CapturedImage`, `CompetitorSize`).
- **NOT W#2-specific work — wait for the shared infrastructure.** W#1 (Keyword Clustering) will use the same realtime layer (Pattern D OT/CRDT per `PLATFORM_REQUIREMENTS.md §3.2`); building a one-off realtime path for W#2 alone would be wasted effort.
- The polling code stays as a fallback path for users on bad networks where the WebSocket gets dropped.

### §8.3 Sync-failure safety net (director's add-on requirement)

This is a director-mandated expansion of scope, captured during Cluster 4 review. The director's framing: *"plan for contingencies and have redundancies so that if any data gets missed being synced, this error is quickly caught and fixed."*

#### §8.3.1 Extension-side safety net

**Write-ahead log (WAL):**
- Before every write attempt, the extension logs its intent to `chrome.storage.local` under key `wal:{clientId}`. Entry includes: clientId UUID, intent shape (CREATE | UPDATE | DELETE), target endpoint, request body, attempt count, last attempt timestamp, status (`pending` | `confirmed` | `failed`).
- On extension reload (popup re-open, browser restart, profile load), the WAL is walked and any `pending` entries older than 5 seconds are re-replayed against the server.
- WAL entry is set to `confirmed` when the server response includes the same clientId echo (server-side echo described below).
- WAL entry is set to `failed` after 5 failed attempts; user-visible failure mode kicks in (see §8.3.4).

**Failed-write queue:**
- Any write that fails (network error, 5xx, timeout) auto-queues. (This is the same data structure as the WAL, just filtered by `status === 'pending' && attempts > 0`.)
- Background flush: every 30 seconds, while online, the extension attempts to flush the queue (one entry at a time, in chronological order).
- Immediate flush: when `navigator.onLine` transitions false → true (network reconnected), the queue flushes immediately.

**Tab-close guard:**
- Modal blocks tab close while the queue is non-empty (per §A.12 already).
- Modal text: *"You have N unsaved captures. Close the tab anyway? (Your captures will be lost if PLOS is unreachable.)"* Cancel default; "Close anyway" requires explicit click.
- Also blocks if the WAL has any `pending` entries with `attempts < 5` (still retrying).

**Always-visible sync indicator:**
- The extension's persistent UI (popover header) shows a small badge:
  - **Green dot + "Synced just now"** — queue empty + last successful poll < 30s ago.
  - **Yellow dot + "Syncing N items…"** — queue non-empty; flush in progress.
  - **Red dot + "Sync failed — N items unsaved"** — queue non-empty AND last flush failed AND it's been > 2 minutes since the last successful write.
  - **Click the badge** to expand a full sync-status panel: list of unsynced items, "Retry now" button, "Export unsynced data as JSON" button (for worst-case admin recovery).

#### §8.3.2 Server-side safety net

**Idempotency-key echo:**
- Every write response includes the `clientId` echo in the response body: `{ ...row, clientId: '<echoed>' }`.
- The extension matches the echoed clientId against the WAL entry to confirm.
- If the response is a 5xx but the row was actually written (idempotency-after-partial-commit case), the next retry returns the existing row + the same clientId — extension treats as confirmed.

**Periodic reconciliation:**
- Every 5 minutes, the extension calls `GET /api/projects/[projectId]/competition-scraping/reconcile` with the platform filter.
- Server responds with a state hash — JSON like `{ urlCount: 47, textCount: 213, imageCount: 89, lastModified: '2026-05-04T12:34:56Z' }`.
- Extension compares against its local cache. If divergent, full re-fetch + reconcile. Logs the divergence to `chrome.storage.local` under key `reconcile-events` (rolling buffer of the last 50; surfaced if the user opens the diagnostic panel).

**Worker-completion verification (Phase 2):**
- When a worker hits the *"I'm done with [platform] for this Project"* button, the worker UI displays the **server-reported** counts: *"You've captured 47 URLs, 213 text rows, 89 images. Confirm to mark complete."*
- The counts come from the server (a fresh `GET .../reconcile` call), NOT from the extension's local view.
- If the server's counts don't match the extension's local cache, the worker UI shows a yellow warning: *"Note: your local view shows different totals. Re-syncing now."* — auto-fetches; user confirms after.
- This catches divergences at the moment of completion, not days later when admin reviews.

**Vercel logging:**
- Every write logs the `clientId`, `(projectId, platform)`, and outcome (`200` | `409 duplicate-clientId` | `5xx error`).
- Admin can grep Vercel logs by clientId to trace any reported "I captured X but it's not there" claim.
- Audit log (Phase 3) extends this with structured forensics per `PLATFORM_REQUIREMENTS.md §5.5`.

#### §8.3.3 Daily janitor (server-side cron)

**Two checks (in addition to the orphaned-image cleanup from §3):**

1. **Count-consistency check.** The extension sends a heartbeat ping every 5 minutes (during `reconcile` calls) that includes its **claimed local counts** for `(projectId, platform)`. Janitor stores the most-recent claimed count + timestamp per (user, projectId, platform). Daily comparison: if the extension's claimed count is > server's actual count by ≥ 1, log a warning: *"User <id> claims N captures for (project, platform) but server has M (M < N). Possible silent data loss."* Surfaces in a daily admin email + the admin diagnostic panel.

2. **Stale-WAL check.** If a clientId has been in `pending` state on the server-side reconciliation table for > 24 hours without confirmation (i.e., extension never circled back to confirm receipt), log warning. Likely indicates an extension-side WAL corruption or a user who uninstalled mid-write.

#### §8.3.4 Worker-visible failure mode

- The extension never silently swallows a write failure.
- After 5 retry exhaustions on the same clientId, the WAL entry transitions to `failed`. UI shows a red banner across the top of the popover: *"We couldn't sync N items — please email admin: <admin-email-link> with the diagnostic export below."*
- Diagnostic export = JSON dump of all `failed` WAL entries (clientId, intent, target endpoint, request body, error timestamps, error messages, last server response). User clicks "Copy to clipboard" or "Email diagnostic"; admin can manually reconstruct in worst case.
- Failed WAL entries are NOT auto-deleted — they stay in `chrome.storage.local` until the user explicitly clicks "Mark recovered" (after admin manual intervention) or "Discard" (after explicit confirmation).

### §8.4 Cross-doc impact

This sync-reliability pattern is broader than W#2 — every future non-web-app client (mobile app, desktop tool) will need similar safety. **TaskCreate'd as a deferred Rule 19 candidate** during Cluster 4 review (registered as "DEFERRED: Evaluate non-web-app client sync-reliability pattern as candidate PLATFORM_REQUIREMENTS §10.1 addition"). End-of-session Platform-Truths Audit decides: promote to platform-wide requirement, or stay W#2-specific for now.

**Reversibility:** very high overall. The polling cadence is configurable via a single constant. The WAL + reconciliation logic is straightforward extension code. Realtime upgrade happens at the platform-infra session, not as W#2-specific work.

---

## §9 — Schema design: 7 W#2-scoped tables + 2 cross-workflow tables

**Decision:** the W#2 schema spans **7 W#2-scoped tables** (created on the W#2 build session that lands the migration) + **2 platform-wide tables** (designed now, built in their respective phase sessions). All W#2-scoped tables cascade on Project deletion via the `ProjectWorkflow` linkage; vocabulary tables cascade directly on Project deletion (since vocabularies are project-scoped, not workflow-scoped per `PLATFORM_REQUIREMENTS.md §8.4`).

### §9.1 Tables and fields (Prisma DSL — pre-implementation spec)

**`CompetitorUrl`** — one row per (Project, platform, URL).

```prisma
model CompetitorUrl {
  id                    String   @id @default(uuid())
  projectWorkflowId     String   // FK to ProjectWorkflow where workflow="competition-scraping"
  platform              String   // "amazon" | "ebay" | "etsy" | "walmart" | "google-shopping" | "google-ads" | "independent-website"
  url                   String   @db.Text
  competitionCategory   String?  // value from VocabularyEntry; null until user fills
  productName           String?  // value from VocabularyEntry; null until user fills
  brandName             String?  // value from VocabularyEntry; null until user fills
  resultsPageRank       Int?
  productStarRating     Float?   // 0.0–5.0
  sellerStarRating      Float?   // 0.0–5.0 (Etsy primarily)
  numProductReviews     Int?
  numSellerReviews      Int?
  customFields          Json     @default("{}")  // { fieldName: value } for user-defined product-scoped fields
  addedBy               String   // userId (Phase 1: always admin's userId)
  addedAt               DateTime @default(now())
  updatedAt             DateTime @updatedAt

  projectWorkflow ProjectWorkflow @relation(fields: [projectWorkflowId], references: [id], onDelete: Cascade)
  sizes           CompetitorSize[]
  capturedTexts   CapturedText[]
  capturedImages  CapturedImage[]

  @@unique([projectWorkflowId, platform, url])  // dedup per (project, platform, url)
  @@index([projectWorkflowId, platform])
}
```

**`CompetitorSize`** — one row per Size/Option under a CompetitorUrl.

```prisma
model CompetitorSize {
  id              String   @id @default(uuid())
  competitorUrlId String
  sizeOption      String   // free-text per §A.7 — director didn't request a vocab here
  price           Decimal? @db.Decimal(10, 2)
  shippingCost    Decimal? @db.Decimal(10, 2)
  customFields    Json     @default("{}")  // size-scoped user-defined fields
  sortOrder       Int      @default(0)
  addedAt         DateTime @default(now())
  updatedAt       DateTime @updatedAt

  competitorUrl CompetitorUrl @relation(fields: [competitorUrlId], references: [id], onDelete: Cascade)

  @@index([competitorUrlId])
}
```

**`CapturedText`** — one row per highlighted-and-saved text snippet.

```prisma
model CapturedText {
  id              String   @id @default(uuid())
  clientId        String   @unique  // UUIDv4 from extension; idempotency key
  competitorUrlId String
  contentCategory String?  // value from VocabularyEntry
  text            String   @db.Text
  tags            Json     @default("[]")  // string[]
  sortOrder       Int      @default(0)
  addedBy         String   // userId
  addedAt         DateTime @default(now())
  updatedAt       DateTime @updatedAt

  competitorUrl CompetitorUrl @relation(fields: [competitorUrlId], references: [id], onDelete: Cascade)

  @@index([competitorUrlId])
  @@index([competitorUrlId, contentCategory])
}
```

**`CapturedImage`** — one row per saved image (regular product shot OR region-screenshot).

```prisma
model CapturedImage {
  id              String   @id @default(uuid())
  clientId        String   @unique
  competitorUrlId String
  imageCategory   String?  // value from VocabularyEntry
  storagePath     String   // e.g., "{projectId}/{competitorUrlId}/{capturedImageId}.png"
  storageBucket   String   @default("competition-scraping")
  composition     String?  @db.Text  // describes what's IN the image (image-only field per §A.15 brief)
  embeddedText    String?  @db.Text  // text that appears INSIDE the image (image-only field)
  tags            Json     @default("[]")
  sourceType      String   // "regular" | "region-screenshot"
  fileSize        Int?     // bytes
  mimeType        String?
  width           Int?     // pixels
  height          Int?
  sortOrder       Int      @default(0)
  addedBy         String
  addedAt         DateTime @default(now())
  updatedAt       DateTime @updatedAt

  competitorUrl CompetitorUrl @relation(fields: [competitorUrlId], references: [id], onDelete: Cascade)

  @@index([competitorUrlId])
  @@index([competitorUrlId, imageCategory])
}
```

**`VocabularyEntry`** — platform-shared vocabularies per `PLATFORM_REQUIREMENTS.md §8.4`. Project-scoped, NOT workflow-scoped.

```prisma
model VocabularyEntry {
  id              String   @id @default(uuid())
  projectId       String   // FK to Project (NOT ProjectWorkflow — vocabs are project-scoped)
  vocabularyType  String   // "competition-category" | "product-name" | "brand-name" | "content-category" | "image-category" | "custom-field-name-product" | "custom-field-name-size"
  value           String
  addedByWorkflow String   // which workflow originated this entry (for forensic clarity)
  addedBy         String   // userId
  addedAt         DateTime @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, vocabularyType, value])  // case-sensitive dedup
  @@index([projectId, vocabularyType])
}
```

**Required `Project` model update** (W#2 build session adds the back-relation):

```prisma
model Project {
  // ...existing fields...
  vocabularyEntries VocabularyEntry[]
}
```

**Cross-workflow tables (designed now, built in their respective phase sessions):**

**`WorkerAssignment`** (Phase 2 — platform-wide table per `PLATFORM_REQUIREMENTS.md §2.2.1`):

```prisma
model WorkerAssignment {
  id          String    @id @default(uuid())
  userId      String
  projectId   String
  workflow    String    // "competition-scraping" | "keyword-clustering" | etc.
  subScope    String?   // for W#2: platform name; for other workflows: null or workflow-specific
  status      String    @default("active")  // "active" | "completed" | "revoked"
  assignedAt  DateTime  @default(now())
  assignedBy  String    // admin userId
  completedAt DateTime?

  // Hard rule per §A.2: exactly one assignment per (project, workflow, subScope)
  @@unique([projectId, workflow, subScope])
  @@index([userId, status])
  @@index([projectId, workflow])
}
```

**`AuditEvent`** (Phase 3 — platform-wide table per `PLATFORM_REQUIREMENTS.md §5.5`):

```prisma
model AuditEvent {
  id           String   @id @default(uuid())
  workflowType String   // "competition-scraping" | "keyword-clustering" | etc.
  projectId    String
  userId       String
  eventType    String   // "capture" | "edit" | "delete" | "vocabulary-add" | etc.
  payload      Json     // event-specific structured data
  timestamp    DateTime @default(now())

  @@index([projectId, workflowType])
  @@index([userId, timestamp])
  // Phase 4: partition by month or by (projectId hash bucket) per §5.4
}
```

### §9.2 Idempotency

- `CapturedText.clientId` and `CapturedImage.clientId`: unique indexes; UUIDv4 generated on the extension; preserved across retries.
- `CompetitorUrl`: relies on `(projectWorkflowId, platform, url)` natural uniqueness; no separate clientId needed.
- `CompetitorSize`: no idempotency needed (sizes are explicit user actions; rare to retry without realizing).
- `VocabularyEntry`: `(projectId, vocabularyType, value)` unique constraint catches dupes; server-side upsert pattern.

### §9.3 Cascade behavior

| Parent | Children that cascade on parent delete |
|---|---|
| `Project` | `ProjectWorkflow[]` (existing), `VocabularyEntry[]` (new) |
| `ProjectWorkflow` (workflow="competition-scraping") | `CompetitorUrl[]` |
| `CompetitorUrl` | `CompetitorSize[]`, `CapturedText[]`, `CapturedImage[]` |

**Admin reset of W#2 data for a Project (per §A.11):**
- Delete the `ProjectWorkflow` row where `(projectId, workflow="competition-scraping")` — cascades to all `CompetitorUrl` + downstream.
- Delete `VocabularyEntry` rows where `(projectId, addedByWorkflow="competition-scraping")` — only entries CREATED BY W#2 are wiped; entries created by other workflows on the same Project are preserved (per §A.11 / `PLATFORM_REQUIREMENTS.md §8.4`).
- Delete all storage files in `competition-scraping/{projectId}/` — single Supabase Storage `remove({ prefix })` call.

### §9.4 Custom fields — Phase 1 JSON; revisit at Phase 3

- `CompetitorUrl.customFields` and `CompetitorSize.customFields` are JSON columns (`Json` type in Prisma).
- Shape: `{ fieldName: value }`, e.g., `{ "Country of Manufacturing": "USA", "Customizations for extra-large bottles": "Glass+plastic" }`.
- Field NAMES (e.g., "Country of Manufacturing") are stored in `VocabularyEntry` with type `custom-field-name-product` or `custom-field-name-size` so the picker can suggest existing names.
- **Reversibility:** Phase 3 may normalize into a dedicated `CustomFieldValue` table if downstream workflows need to query specific custom fields (e.g., "find all Projects where any competitor has Country of Manufacturing = 'USA'"). Migration: read JSON values into the new table; drop JSON column. No data loss. **Captured as ROADMAP polish item at end-of-session per Rule 14e.**

### §9.5 Reversibility of the schema as a whole

- All these tables are NEW — zero existing data to migrate.
- Adding fields later: cheap forever (`prisma db push` adds optional columns trivially).
- Renaming fields: expensive once captures land — requires migration script + downstream-consumer coordination.
- Removing fields: expensive once captures land — same as renaming.

**Schema-change-in-flight flag** (`MULTI_WORKFLOW_PROTOCOL.md` Rule 4): set to "Yes" 2026-05-04 at start of this Stack-and-Architecture session (covers design + next implementation session). Flips back to "No" only after the W#2 PLOS-side build session that lands the actual `prisma/schema.prisma` edits + `prisma db push`. While "Yes," any other workflow's session must avoid schema work — capture as deferred per Rule 14e + Rule 26 if it surfaces.

---

## §10 — PLOS-side route structure

**Decision:** three routes inside the PLOS Next.js app at `vklf.com`, plus the standard auth + project-context wiring inherited from the existing `/projects/[projectId]/` shell.

| Route | Purpose | Phase |
|---|---|---|
| `/projects/[projectId]/competition-scraping` | Main view — multi-table viewer (platforms → URLs → captured rows) + always-visible deliverables block (Detailed User Guide + Download Extension button per §13) + admin reset button (admin-gated). Composes Shared Workflow Components Library imports per `COMPETITION_SCRAPING_DESIGN.md §A.14` (`<WorkflowTopbar>`, `<StatusBadge>`, `<DeliverablesArea>` with Resources sub-section, `<CompanionDownload>`, `<ResetWorkflowButton>` + `<ResetConfirmDialog>`, `<WorkerCompletionButton>` Phase 1 path) alongside W#2's own custom React content component for the multi-table viewer; per `PLATFORM_REQUIREMENTS.md §12.6` shared component pattern #2, the content area is the workflow's own concern, not imposed by the library. | Phase 1 |
| `/projects/[projectId]/competition-scraping/url/[urlId]` | Per-URL detail view — full-size image viewer, all captured text + images for that URL, edit affordances. **Deep-linkable** (admin can paste a URL into Slack/email and it lands directly on the right URL detail page). | Phase 1 |
| `/projects/[projectId]/competition-scraping/admin/assignments` | Admin-only — assign workers per (Project × platform) per the §A.2 4-way model. Hidden in Phase 1 (admin-solo). | Phase 2 |

**Cross-cutting items (autonomous Claude decisions per Rule 15):**
- All three routes wrapped by the standard PLOS auth + project-context wiring (matches the W#1 pattern at `/projects/[projectId]/keyword-clustering`).
- The main view's custom React component is the FIRST exercise of `PLATFORM_REQUIREMENTS.md §12.6` shared component pattern #2 (content area is the workflow's own concern, not imposed by the library). The Shared Workflow Components Library Phase-1 build is a separate session — called out in `COMPETITION_SCRAPING_DESIGN.md §A.18` next-session list and at `WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md §A` for the full library design.
- Admin reset button uses the library's `<ResetWorkflowButton>` + `<ResetConfirmDialog>` components (per `WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md §3.6`) wired to W#2's own `resetWorkflowData(projectId)` function — guarded by "type the project name to confirm — this will permanently delete all W#2 data for Project X." (per `PLATFORM_REQUIREMENTS.md §7`).

**Reversibility:** route addresses become sticky once the extension caller is in production (renaming requires extension update). For the PLOS web routes, less sticky since the user can be sent the new address. Plan for stability anyway.

---

## §11 — API route structure

**Decision:** REST conventions matching the W#1 pattern at `/api/projects/[projectId]/<resource>/...`. The extension and the PLOS web page both call these routes with a `Authorization: Bearer <Supabase JWT>` header per §2.

### §11.1 Route table

| Route | Body / Query | Used by |
|---|---|---|
| `POST /api/projects/[projectId]/competition-scraping/urls` | `{ platform, url, [optional fields] }` → returns `CompetitorUrl` | Extension (URL-add) |
| `GET /api/projects/[projectId]/competition-scraping/urls?platform=...` | Filter by platform → returns `CompetitorUrl[]` | Both |
| `PATCH /api/projects/[projectId]/competition-scraping/urls/[urlId]` | Partial update of any field → returns `CompetitorUrl` | Both |
| `DELETE /api/projects/[projectId]/competition-scraping/urls/[urlId]` | (no body) → cascade-deletes Sizes/Text/Images | Both |
| `POST .../urls/[urlId]/sizes` | `{ sizeOption, price?, shippingCost?, customFields? }` → returns `CompetitorSize` | Both |
| `PATCH .../sizes/[sizeId]` | Partial update | Both |
| `DELETE .../sizes/[sizeId]` | | Both |
| `POST .../urls/[urlId]/text` | `{ clientId, contentCategory?, text, tags? }` → returns `CapturedText` | Both |
| `PATCH .../text/[textId]` | Partial update | Both |
| `DELETE .../text/[textId]` | | Both |
| `POST .../urls/[urlId]/images/requestUpload` | `{ clientId, mimeType, fileSize, sourceType, imageCategory? }` → returns `{ uploadUrl, capturedImageId, storagePath, expiresAt }` | Extension only |
| `POST .../urls/[urlId]/images/finalize` | `{ clientId, capturedImageId, mimeType, sourceType, fileSize?, imageCategory?, composition?, embeddedText?, tags?, width?, height?, sortOrder? }` → returns `CapturedImage` | Extension only |
| `PATCH .../images/[imageId]` | Partial update | Both |
| `DELETE .../images/[imageId]` | | Both |
| `GET /api/projects/[projectId]/vocabulary?type=...` | → `VocabularyEntry[]` for type | Both |
| `POST /api/projects/[projectId]/vocabulary` | `{ vocabularyType, value }` → upsert (no error on duplicate); returns `VocabularyEntry` | Both |
| `POST /api/projects/[projectId]/competition-scraping/reset` | Admin-only; body `{ confirmProjectName }` → wipes all W#2 data + storage files for Project | PLOS web only |
| `GET /api/projects/[projectId]/competition-scraping/reconcile?platform=...` | → `{ urlCount, textCount, imageCount, lastModified }` | Extension only (per §8.3.2) |

### §11.2 Cross-cutting items (Rule 15 autonomous)

- **CORS:** routes used by the extension have OPTIONS preflight handlers that allow the `chrome-extension://*` origin. The PLOS web app continues to work via same-origin (no CORS preflight needed for it).
- **Auth:** every route runs the existing `verifyProjectAuth` chain from `src/lib/auth.ts:88-127`. Extension JWTs are accepted identically to web JWTs.
- **Idempotency:** `POST .../text` and `POST .../images/finalize` accept the client-generated `clientId` UUID and return the existing record if one already exists for that clientId (so a network retry never creates duplicates).
- **Image upload retries on requestUpload:** `POST .../images/requestUpload` does NOT dedupe by clientId. Each call generates a fresh `capturedImageId` + signed upload URL. If the extension retries `requestUpload` after a network blip on the response, the prior signed URL's storage path becomes an orphan that the daily janitor (session-3) cleans up if no DB row references it. Idempotency lives at `finalize` (the DB write).
- **Storage-path derivation at finalize:** server re-derives `storagePath` from `(projectId, urlId, capturedImageId, mimeType)` rather than trusting a client-supplied path — keeps the server as the single source of truth on path layout. Extension echoes `mimeType` + `sourceType` (immutable across the two-phase flow) so the derivation matches the path the upload landed at; server then verifies the file actually exists at that path before creating the DB row (defense against buggy/compromised clients calling finalize without uploading).
- **Idempotency response shape:** every write response includes the `clientId` echo per §8.3.2.
- **withRetry:** every Prisma call wrapped with `withRetry()` per the 2026-05-04-b/05 platform-wide pattern.
- **Connection-pool care:** writes use the same atomic-batch-into-rebuild pattern as W#1's apply-pipeline (per `KEYWORD_CLUSTERING_ACTIVE.md` POST-2026-05-05 STATE block) when applicable. For W#2 specifically, the writes are mostly single-row inserts (one URL, one text row, one image row at a time), so connection-pool burst patterns are NOT a concern at Phase 1 scale; revisit at Phase 3 if bulk-import features get added.

### §11.3 Reversibility

- Adding routes: cheap forever.
- Renaming routes: expensive (requires extension update + version coordination — old extension copies hit the old address until users update). Plan to get the address shape right at first ship.

---

## §12 — Build pipeline + repo layout: monorepo at `extensions/competition-scraping/`

**Decision:** the extension lives in the **same git repo** as the PLOS web app, at `extensions/competition-scraping/`. Has its own `package.json`, its own WXT config, its own build output. Shares a `src/lib/shared-types/competition-scraping.ts` folder with the PLOS app for request/response shapes (so when an API contract changes on the server, the extension TypeScript build flags any caller it broke).

**Why monorepo over separate repo:**

| Option | Why not / Why |
|---|---|
| Separate repo (`brand-operations-hub-extension`) | Cleaner isolation, but shared types have to be published as an npm package (or duplicated by hand). API-contract changes require lockstep PRs across two repos. |
| **Monorepo (chosen)** | Extension and PLOS routes change in lockstep early on — being able to commit a route change + extension caller change in one commit prevents drift. Shared types are a simple folder, not a published package. One git history; one CI pipeline. Most-thorough-and-reliable: API contract breakage caught at compile time during CI on every commit. |

### §12.1 Repo structure

```
brand-operations-hub/
├── src/                                    # PLOS Next.js app (existing)
│   ├── app/
│   ├── lib/
│   │   ├── auth.ts                         # existing
│   │   ├── competition-storage.ts          # NEW — Supabase Storage helper wrapper (§3)
│   │   └── shared-types/
│   │       └── competition-scraping.ts     # NEW — shared types between PLOS + extension
│   └── ...
├── extensions/                             # NEW top-level folder
│   └── competition-scraping/
│       ├── package.json                    # extension's own deps + scripts
│       ├── wxt.config.ts                   # WXT config (manifest, content scripts, popup)
│       ├── src/
│       │   ├── popup/                      # extension popover UI
│       │   ├── content-scripts/            # per-platform scripts (amazon.ts, ebay.ts, etc.)
│       │   ├── background.ts               # service worker
│       │   ├── lib/
│       │   │   ├── api-client.ts           # imports shared-types from src/lib/shared-types/
│       │   │   ├── auth.ts                 # signInWithPassword + token storage
│       │   │   ├── wal.ts                  # write-ahead log (§8.3.1)
│       │   │   ├── reconciler.ts           # periodic reconciliation (§8.3.2)
│       │   │   └── ...
│       │   └── styles/
│       └── public/                         # icons, etc.
├── prisma/
│   └── schema.prisma                       # gets W#2 tables added in build session
├── package.json                            # PLOS app's package.json (existing)
└── ...
```

### §12.2 Build commands

| Command | What it does |
|---|---|
| `cd extensions/competition-scraping && pnpm install` | Installs extension's deps |
| `cd extensions/competition-scraping && pnpm dev` | Hot-reload dev mode (via `wxt dev`) |
| `cd extensions/competition-scraping && pnpm build` | Production build → `.output/chrome-mv3-prod/` |
| `cd extensions/competition-scraping && pnpm zip` | Production zip → `.output/chrome-mv3-prod.zip` |
| `pnpm --filter <root> dev` | PLOS app dev (existing pattern unchanged) |

### §12.3 Shared types

- File: `src/lib/shared-types/competition-scraping.ts`.
- Exports: TypeScript types for every API route's request body + response body. E.g., `CreateCompetitorUrlRequest`, `CreateCompetitorUrlResponse`, `RequestImageUploadRequest`, etc.
- Imported by:
  - PLOS API routes (`src/app/api/projects/[projectId]/competition-scraping/urls/route.ts` etc.) — type-checks the request body parsing + response building.
  - Extension API client (`extensions/competition-scraping/src/lib/api-client.ts`) — type-checks the request building + response parsing.
- **Both sides import from the SAME file** — when an API contract changes on the server, the extension build fails at compile time on the broken caller. No silent drift.
- Imports from extension side use a relative path: `import type { CreateCompetitorUrlRequest } from '../../../src/lib/shared-types/competition-scraping';` (or with a `tsconfig.json paths` alias for cleanliness — TBD at first build session).

### §12.4 CI/CD

- **GitHub Actions workflow** (new file `.github/workflows/extension-build.yml`) that runs on push to `main`:
  1. `cd extensions/competition-scraping && pnpm install`
  2. `pnpm build` (verify production build succeeds)
  3. `pnpm zip` (produce the Chrome Web Store package)
  4. Archive `.output/chrome-mv3-prod.zip` as a build artifact (downloadable from GitHub Actions UI).
  5. (Phase 2 future) Upload the zip to Chrome Web Store via the Chrome Web Store Publish API + bump the manifest version automatically.

### §12.5 Versioning

- `manifest.json` `version` field: SemVer (e.g., `0.1.0` → `0.2.0` → `1.0.0`).
- First public release: `1.0.0`.
- The zip filename always includes the version: `competition-scraping-0.1.0.zip` etc.
- The "always latest" symlink for the PLOS deliverables block: regenerated on every CI build (`competition-scraping-LATEST.zip`).

### §12.6 TypeScript config

- Extension's `tsconfig.json` extends from a new shared base (e.g., `tsconfig.shared.json` at repo root) so type-strictness rules match between PLOS and extension.
- Both sides are TypeScript strict mode.

### §12.7 Reversibility

- Splitting into separate repos later: mechanical (move folder, set up new repo, copy CI). Disturbs git history of the extension side.
- Merging back from separate repo: same mechanical effort.

---

## §13 — Distribution: Phase 1 unpacked + zip; Phase 2 Chrome Web Store Unlisted; Detailed User Guide always-visible in PLOS

**Decision:** two-phase distribution with a comprehensive user guide always visible in the PLOS web app.

### §13.1 Phase 1 — admin-solo

- The PLOS web page at `/projects/[projectId]/competition-scraping` shows a **Detailed User Guide block** (always visible per §A.14 + `PLATFORM_REQUIREMENTS.md §12.6` extension-point #1, **expanded scope per director's Cluster 4 add-on**).
- The block includes BOTH **install instructions** AND **use instructions** (full walkthrough of every flow).

#### §13.1.1 Install instructions (Phase 1 unpacked dev folder)

Plain-language step-by-step + screenshots:

1. Click **Download Extension** to get `competition-scraping-LATEST.zip`.
2. Unzip the file on your computer (right-click → "Extract All" on Windows; double-click on Mac).
3. Open Chrome and go to `chrome://extensions` (paste it into the address bar).
4. In the top-right of that page, toggle **Developer Mode** on. *(screenshot: highlighted toggle position)*
5. Click **Load unpacked** in the top-left. *(screenshot: button location)*
6. Pick the unzipped folder you just extracted.
7. The Competition Scraping extension appears in your extensions list. Pin it to your toolbar by clicking the puzzle-piece icon → pin icon next to the extension. *(screenshot)*

**When a new version is released:** repeat the same steps with the new zip. Chrome will replace the old version automatically when you point Load Unpacked at the new folder.

#### §13.1.2 Use instructions (Phase 1 — full workflow walkthrough)

Sectioned walkthrough with screenshots. Topics:

- **Sign in.** Click the extension icon in your toolbar; sign in with your PLOS email + password.
- **Pick a Project + platform.** Pick the Project you're working on; pick the source platform (Amazon, Ebay, Etsy, Walmart, Google Shopping, Google Ads, Independent Website).
- **Set up Highlight Terms.** Type the terms you're looking for; pick a color for each from the swatch grid.
- **Capture a competitor URL.** Navigate to the source platform; search for relevant products; hover over a product link; click the floating **+ Add** button that appears; review the auto-filled URL; fill in (or skip-and-fill-later) the Competition Category, Product Name, Brand Name; click Save.
- **Add Sizes/Options + prices** (later, after the URL is saved).
- **Capture text from a competitor page.** Highlight the text on the page; click **Add Text** in the extension popover; pick the content category; click Save.
- **Capture a regular product image.** Right-click the image; pick **Save image to PLOS — Competition Scraping**; pick the image category.
- **Capture an A+ Content Module.** Click the **Region screenshot** button in the extension popover; drag a rectangle around the entire module (image + overlay text); pick the image category.
- **Browse what you've captured.** From the extension popover, click **Browse Captured** to see a mini-table; on PLOS web at `/projects/[projectId]/competition-scraping`, see the full sortable/filterable view.
- **Edit any captured row.** Click the row in PLOS or in the extension; change any field; save.
- **Sign out / reset extension.** Settings tab in the extension; sign out OR reset extension state (extension-local; PLOS data is unaffected).

#### §13.1.3 Detailed User Guide implementation

- Renders inline at the top of `/projects/[projectId]/competition-scraping`, collapsible (default expanded for Phase 1; user can collapse).
- Structured as Markdown rendered to HTML, with embedded screenshots (PNG files in `public/competition-scraping/guide-screenshots/`).
- Screenshots produced ONCE during the build session (admin captures + uploads via the existing admin-notes upload flow OR via direct file commit to `public/`); refreshed when the extension UI changes meaningfully.
- A printable/PDF version of the guide is generated at build time so the user can share with workers offline (Phase 3+).
- All copy passes the Plain Language test per `CLAUDE_CODE_STARTER.md` Rule 1 — no jargon, no programming terms.

### §13.2 Phase 2+ — multi-worker

- **Distribution:** Chrome Web Store **Unlisted** (not searchable; only accessible via the direct install URL we share with workers; standard pattern for org-internal extensions without paying for Google Workspace).
- **Auto-update:** kicks in via the Chrome Web Store's built-in `update_url` mechanism. Workers get new versions automatically within ~24 hours of publish.
- **PLOS deliverables block update:** the "Download Extension (zip)" block becomes a single "Install from Chrome Web Store" button.
- **The Detailed User Guide stays present** — both for new workers learning the workflow and as a reference for experienced workers when a new platform module is added.

### §13.3 Skipped: Chrome Web Store organization-private

- Requires Google Workspace + admin domain policy push to enrolled devices.
- Tight control but expensive and overkill for the worker model.
- **If you ever move to Workspace + managed devices, we can flip to org-private later** — reversible per worker rollout cohort.

### §13.4 Reversibility

- Phase 1 → Phase 2 distribution change: mechanical (replace deliverables block UI; update install instructions; same extension code).
- Adding org-private as a third path later: clean cohort-based switch.

---

## §14 — Cross-doc updates required at end of this session

The end-of-session checklist (per `HANDOFF_PROTOCOL.md` §4 Step 1) must update the following docs:

| Doc | Update |
|---|---|
| `COMPETITION_SCRAPING_DESIGN.md` | §B append: 2026-05-04 Stack-and-Architecture entry pointing to this doc as the resolution of all 13 §A.17 questions; brief summary of the 13 decisions; cross-reference to the override notes on Q5 + Q7. |
| `ROADMAP.md` Active Tools row (W#2) | Status, Last Session, Next Session updated. Schema-change-in-flight stays "Yes" (covers the next implementation session). |
| `ROADMAP.md` Workflow #2 section | Updated to reflect stack-decisions completion + recommended next-session sequence. |
| `PLATFORM_REQUIREMENTS.md` §10.1 | Update non-web-app clients section to record direct-credentials (`signInWithPassword`) as the chosen auth pattern (resolves the §10.1 deferred decision). |
| `PLATFORM_REQUIREMENTS.md` §10.2 | (Optional — director decides at end-of-session Platform-Truths Audit.) Append non-web-app-client sync-reliability requirements as platform-wide pattern, OR keep W#2-specific in this doc only. |
| `DATA_CATALOG.md` §6.1 | Update the 7 provisional W#2 entries from prior session with finalized table + field names per §9. |
| `PLATFORM_ARCHITECTURE.md` §1 | Add `extensions/` top-level folder to the file structure (when build session lands the actual files). NOT done this session — the folder is empty/non-existent at end of this session. Captured as a build-session task. |
| `PLATFORM_ARCHITECTURE.md` §10 | Append entry for the W#2 stack decisions if any platform-level tech-debt surfaced. |
| `CHAT_REGISTRY.md` | New top row for this session. |
| `CORRECTIONS_LOG.md` | One entry: §A.17 Q2 framing missed the direct-credentials option (`signInWithPassword`); session surfaced + corrected. Process lesson: future Workflow Requirements Interview's "deferred implementation questions" section should include all reasonable options, not just the two highest-profile ones. |
| `DOCUMENT_MANIFEST.md` | New Group B doc registered (`COMPETITION_SCRAPING_STACK_DECISIONS.md`); timestamps + per-doc modified flags. |

---

## §15 — Open implementation questions deferred to build sessions

These are NOT decisions to revisit (the §1–§13 decisions are FROZEN). These are smaller implementation details that emerge during build and don't need design-session attention:

1. **`tsconfig.json` paths alias for shared types** — clean import path from extension side (e.g., `@plos/shared-types`) vs. relative path. Decide at first build session.
2. **Extension settings page (UI for sign-out, reset, future preferences)** — exact layout + fields. Decide at first build session.
3. **Color-blind-safe sub-palette** — supplement to §6's main palette for color-blind workers. Polish backlog post-build.
4. **Auto-scroll-stitch for region-screenshot** — additive enhancement to §4 if usage data shows users routinely fighting the viewport limit. ROADMAP polish item.
5. **`CustomFieldValue` normalization** — per §9.4, JSON-on-parent is Phase 1; revisit at Phase 3 if downstream workflows need to query custom fields. ROADMAP polish item.
6. **Vercel cron schedule for janitor jobs** — exact UTC time + retry behavior. Decide at janitor-build session.
7. **Per-platform DOM-pattern modules** — exact selectors for product-link detection per platform. Build session per platform.
8. **PDF generation for the Detailed User Guide** — library choice (Puppeteer? React-PDF? html-to-pdf?) + trigger (CI build? on-demand?). Decide at user-guide build session.
9. **Diagnostic export format for the §8.3.4 worker-visible failure mode** — exact JSON shape + redaction rules (don't include sensitive auth tokens in the export). Decide at WAL-build session.
10. **Chrome Web Store listing copy** — name, description, screenshots, privacy policy. Phase 2 work; defer.

---

END OF DOCUMENT
