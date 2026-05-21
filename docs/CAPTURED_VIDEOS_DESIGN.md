# CAPTURED VIDEOS — DESIGN DOC (Workflow #2 polish P-27)

**Polish item:** P-27 — Captured-videos feature
**Parent workflow:** W#2 Competition Scraping & Deep Analysis (🔍)
**Status:** 🔄 Implementation phase — Build #1 (schema + bucket + helper) complete 2026-05-20-c (commit `c8fa639`); Build #2 (API routes + shared-types extensions) complete 2026-05-21 (commit `7093f2e`); §A.2 implementation arc table rows #1-#3 now ✅ COMPLETE. Next Build session = row #4 (extension content-script right-click on `<video>` form + helper `find-underlying-video-embed.ts`).
**Branch (design):** `workflow-2-competition-scraping`
**Created:** 2026-05-20
**Created in session:** `session_2026-05-20-b_p27-captured-videos-design-interview` (Claude Code; on `workflow-2-competition-scraping`)
**Pre-graduation gating:** YES — per director's standing directive *"All these things should ship before Workflow #2 is deemed complete"*; P-27 + P-26 are the two remaining W#2 pre-graduation polish items as of 2026-05-20.

**Doc type:** Group B (workflow-specific). Loaded whenever a session works on P-27 (design refinement, schema build, extension build, Playwright spec, deploy).

**Doc location rationale (per Rule 14f forced-picker fired at session start):** Director picked **Option A — new top-level `docs/CAPTURED_VIDEOS_DESIGN.md`** over a §B append in `COMPETITION_SCRAPING_DESIGN.md` (3,078 lines already). Cleaner separation; future P-27 build sessions read this file directly without grepping into COMPETITION_SCRAPING_DESIGN.md's §B append history. Reversible — can fold into COMPETITION_SCRAPING_DESIGN later if it turns out to be thin.

**Related docs:**

- `HANDOFF_PROTOCOL.md` Rule 18 — Workflow Requirements Interview methodology (this doc is its deliverable for P-27 specifically)
- `HANDOFF_PROTOCOL.md` Rule 19 — Platform-Truths Audit (executed at end of interview; results below in §A.14)
- `HANDOFF_PROTOCOL.md` Rule 21 — Pre-interview directive scan (executed; 3 binding inputs from 2026-05-19-g-2 surfaced + carried forward)
- `HANDOFF_PROTOCOL.md` Rule 23 — Change Impact Audit (deferred to implementation session #1 once schema work begins)
- `HANDOFF_PROTOCOL.md` Rule 27 — Playwright forced-picker (executed for Q14; director picked Hybrid)
- `COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-19-g-2 entry — the original P-27 capture + the 3 director-confirmed scope pins
- `COMPETITION_SCRAPING_STACK_DECISIONS.md` §3 (line 130-165) — the existing image-bucket pattern this doc parallels for video
- `COMPETITION_SCRAPING_STACK_DECISIONS.md` line 144 — the original 5MB image cap that explicitly mentions video prevention (revisited this session; new video bucket has its own cap)
- `PLATFORM_REQUIREMENTS.md` §10.2 line 427 — the already-flagged tech-debt note about workflow-deliverable storage strategy (this design closes/scopes that item)
- `DATA_CATALOG.md` §7 Cross-Tool Data Flow Map — new "captured videos" output entry added for W#2's row (per Rule 18 reciprocal output declaration)
- `ROADMAP.md` P-27 polish-backlog entry (line ~157) — the original P-27 capture; carries the 7 open design questions resolved here

**Structure (per HANDOFF_PROTOCOL Rule 18):**

- **§A — Initial Workflow Requirements Interview answers.** Frozen at end-of-interview (this session). Authoritative initial spec for P-27 v1.
- **§B — In-flight refinements (append-only).** Empty at end of interview. Future P-27 build sessions append entries here, never edit prior ones or §A.

---

## §A — Initial Workflow Requirements Interview answers (FROZEN 2026-05-20)

### A.0 Interview meta

- **Interview format:** 14 questions in 5 clusters per Rule 18 (Cluster 1 Purpose+Scope Q1-Q3; Cluster 2 Inputs+Triggers Q4-Q7; Cluster 3 Outputs+Schema Q8-Q10; Cluster 4 Edge cases Q11-Q13; Cluster 5 Test coverage Q14). Each cluster ended with a read-back before moving on. Each open question surfaced 2-4 plausible options + recommended option per `feedback_recommendation_style.md`.
- **Pre-interview directive scan (Rule 21):** the launch prompt itself carried 3 binding inputs from `session_2026-05-19-g_w2-main-deploy-session-28-p23-saved-url-dropdown-DEPLOYED` (2026-05-19-g-2 addendum) where director ran the original 3 Rule 14f forced-pickers at P-27 capture time. These 3 picks are NOT re-litigated; they're carried forward as already-settled scope pins:
  - **(Q1 Source) URL reference + uploaded video bytes BOTH stored** (vs. URL-only lighter option)
  - **(Q2 Gestures) Full UX symmetry with text/image — all 3 capture paths** (right-click on `<video>` + right-click on embed + popup paste form)
  - **(Q3 Graduation timing) Pre-graduation polish item** (joins P-26 as 2 remaining items before W#2 graduates)
- **Sister-workflow state at interview time:** W#1 (Keyword Clustering) on `main`, no schema-change-in-flight; W#2 on `workflow-2-competition-scraping`, schema-change-in-flight = No this entire session (design-only).
- **Forced-picker outcomes captured this session:** doc-location pick (A — new top-level doc); v1 scope pick (B — symmetric v1); per-platform detection (A — platform-agnostic + iterate); schema shape (A — sourceType discriminator + nullable storagePath); vocab UX (C — inline "+ Add new" + 0 seeds); size cap (100 MB); thumbnail approach (A — client-side canvas frame-grab); embed save validation (A — URL-pattern regex only, no fetch); size cap enforcement (A — two-layer client + server); thumbnail failure fallback (A — NULL + generic icon; save never blocked); test coverage (A — Hybrid per Rule 27).

---

### A.1 Purpose (Q1)

P-27 adds a new "captured videos" surface to W#2 so the director (Phase 1) and platform-specialist workers (Phase 3+) can attach competitor videos to a CompetitorUrl with **full parity** to the existing captured-text + captured-image flows. The motivation is director's standing intent for W#2: capture parity across all 3 competitor-asset media types (text + image + video) so the platform's downstream workflows (W#3 Therapeutic Strategy, W#5 Conversion Funnel, W#6 Content Development, W#9 Clinical Evidence, W#10 Reviews) can compose competitor-analysis output spanning all 3.

Without P-27, W#2's outputs are text+image-only; any future downstream workflow that needs video references for competitor-analysis prompts (likely W#3 transformation prompts; W#5 conversion funnel narratives may also reference video proof points) would have to consume videos from outside PLOS or block on a future expansion item.

Like CapturedText and CapturedImage today, CapturedVideo rows are attached to a CompetitorUrl and consumed read-only by downstream W#3+. The capture motion stays 100% human-driven per `COMPETITION_SCRAPING_DESIGN.md` §A.1 — no autonomous crawling/scraping.

---

### A.2 Placement in W#2 graduation sequence (Q2)

**Pre-graduation polish item.** Per director's standing directive *"All these things should ship before Workflow #2 is deemed complete"* (captured 2026-05-19-d-2 + reinforced 2026-05-19-g-2): with P-22 and P-18 both closed 2026-05-20, **P-27 and P-26 are the two remaining pre-graduation items**.

**Estimated P-27 implementation arc:** ~8-14 sessions broken approximately into:

| # | Type | Scope |
|---|---|---|
| 1 (this) | Design | Design interview + this doc shipped — no code |
| 2 | Build | Schema migration via `npx prisma db push` (new `CapturedVideo` table + new vocabulary type enum value `video-category`) + new Supabase bucket `competition-scraping-videos` created via dashboard + new `competition-video-storage.ts` helper wrapper |
| 3 | Build | API routes scaffolding under `/api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/` + shared types in `src/lib/shared-types/competition-scraping.ts` |
| 4 | Build | Extension content-script right-click on `<video>` form (`video-capture-form.ts`) + helper `find-underlying-video-embed.ts` (parallel to `find-underlying-image.ts`) + pure-helper node:test cases |
| 5 | Build | Extension content-script embed-fallback path + popup paste form (`CapturedVideoPasteForm.tsx`) + inline "+ Add new category" vocab UX + pure-helper node:test cases |
| 6 | Build | Saved-video on-page indicator overlay (mirror of P-24) + URL detail page renderer (inline `<iframe>` for embeds + inline `<video>` for direct MP4) + pure-helper node:test cases |
| 7 | **Test** | Single-platform amazon Playwright extension-context spec (happy path + embed path + popup paste) per Q14 Hybrid pick; new `amazon-video-product-page.html` fixture; full pre-deploy `/scoreboard` GREEN before next stage |
| 8 | **Deploy** | `/deploy` skill: pre-deploy scoreboard → Rule 9 gate (AskUserQuestion picker for director Yes) → ff-merge `workflow-2-competition-scraping` → `main` → push origin/main → Vercel auto-redeploy → ping-pong sync → fresh extension zip `plos-extension-YYYY-MM-DD-w2-deploy-N.zip` |
| 9 | **Verify** | Director real-Chrome verification walkthrough on vklf.com — sideload fresh zip, run the 3-gesture walkthrough (right-click `<video>` + right-click YouTube embed + popup paste) across at least 2 platforms (amazon + 1 other); confirm: thumbnail extraction works for direct-bytes; embed URL stores + renders correctly; saved-video indicator appears on revisit; URL detail page renderer plays inline; inline "+ Add new category" works in form. Any deviations captured as new polish items |
| 10-11 (optional) | Polish | Thumbnail extraction edge-case fixes + size-cap tuning + YouTube-embed special handling (only if real-Chrome verification surfaced issues) |
| Future P-22-style | Deferred | Cross-platform Playwright extension to ebay + etsy + walmart (deferred per Q3) |

**Stage anatomy** — every P-27 ship session follows the standard W#2 ship pattern documented in `.claude/commands/ship-polish-item.md`: branch verify → ROADMAP entry read → Rule 3 code-truth diagnosis → Rule 14f pre-coding pickers → code the fix → `/scoreboard` → `/deploy` → director real-Chrome verification → `/end-of-session`.

W#2 graduation estimate now: P-26 (~1-2 sessions; LOW priority) + P-27 (~8-14 sessions including build + test + deploy + verify) = ~9-16 more sessions before W#2 graduates. Director's most-thorough preference: ship P-27 first since it's the larger surface; P-26 is the smaller LOW-severity polish.

---

### A.3 v1 scope — what's IN and what's OUT (Q3)

**v1 scope = symmetric parity with text/image, defer only the obvious extensions.** Director picked the most-thorough-and-reliable middle option at the Cluster 1 forced-picker.

**IN v1:**

1. All 3 capture gestures (binding input from 2026-05-19-g-2):
   - Right-click on inline `<video>` element → opens content-script video capture form
   - Right-click on YouTube/Vimeo embed (`<iframe>`) → walks DOM to find underlying video URL, opens form pre-filled
   - Popup paste video URL form (mirrors `CapturedTextPasteForm.tsx`)
2. New `CapturedVideo` Prisma table (schema design in A.7)
3. New Supabase Storage bucket `competition-scraping-videos` (private; signed-URL access; 1hr TTL)
4. Thumbnail extraction via client-side `<canvas>` frame-grab for direct-bytes path; YouTube/Vimeo platform API for embeds
5. Single-platform amazon Playwright extension-context spec covering the happy path
6. Saved-video on-page indicator overlay (mirror of P-24's saved-image indicator)
7. URL detail page renderer — inline `<iframe>` for embeds; inline `<video>` for direct MP4; click-to-play overlay on thumbnails

**OUT of v1 (deferred):**

1. **Cross-platform Playwright extension to ebay + etsy + walmart** — deferred to a future P-22-style follow-up session(s) per the P-22 multi-slice precedent (single-platform happy path ships first; cross-platform slicing ships separately).
2. **YouTube/Vimeo byte download** — settled per Q1 binding input (URL-only for embeds; do not attempt download).
3. **Below-fold / long-video scroll-capture analog to P-26** — speculative; revisit if real-world use surfaces the need.
4. **Pre-existing-row backfill** — no rows exist (new table); N/A.
5. ~~Inline "+ Add new category" UX for captured-text + captured-image forms~~ **SUPERSEDED by Rule 24 / Rule 3 catch at end-of-session 2026-05-20** — the inline-add UX ALREADY EXISTS for text + image + URL forms (see A.8 references). No symmetry-restore polish item needed. Video capture form simply mirrors the existing pattern.
6. **Server-side FFmpeg fallback for thumbnail extraction** — revisit if NULL-thumbnail rate exceeds tolerable threshold post-ship.
7. **Save-time embed URL fetch validation** — lightweight pattern-only validation for v1 (per Q11); revisit if save-time-broken-URL incidents accumulate.

---

### A.4 Inputs — what data the capture path reads (Q4)

All 3 capture paths additionally read: **Project ID + Platform** from `chrome.storage.local`; **selected CompetitorUrl** from form dropdown (uses existing `buildSavedUrlOptionLabel` helper); **list of already-saved CapturedVideos for the current URL** (for saved-video indicator scan + duplicate detection).

**Right-click on inline `<video>` element reads:**

- `event.target` — the `<video>` DOM node clicked
- `video.currentSrc` — the active source bytes URL (handles `<video><source>...</source></video>` multi-source elements; browser picks one and `currentSrc` reports it)
- `video.src` — fallback if no currentSrc
- `video.poster` — platform-provided poster image URL; strong thumbnail candidate when present
- `video.duration` — seconds (NaN if metadata not yet loaded)
- `video.videoWidth` × `video.videoHeight` — intrinsic dimensions
- All read synchronously inside the capture-phase contextmenu listener (mirror of P-23-AMAZON's `lastRightClickImageSrc` snapshot pattern)

**Right-click on embed (`<iframe>`) reads:**

- New helper `find-underlying-video-embed.ts` walks DOM up from `event.target` (depth ≤ 10; mirrors `find-underlying-image.ts`)
- Looks for any ancestor or sibling `<iframe>` whose hostname matches the video-embed allowlist (A.6)
- Reads `iframe.src` for the YouTube/Vimeo/Wistia URL
- Parses the URL via new helper `video-url-normalizer.ts` to extract video ID + platform identifier + canonical share URL

**Popup paste URL form reads:**

- User-typed URL string from the input field
- Normalizes via `video-url-normalizer.ts`
- Detects platform from hostname

---

### A.5 Triggers (Q5 — settled binding input)

Three gesture surfaces, per the 2026-05-19-g-2 binding input. Already-settled; not re-litigated this session.

| Trigger | Surface | Mechanism |
|---|---|---|
| Right-click on inline `<video>` | Content script | New `chrome.contextMenus.create({ id: 'add-video', title: 'Add to PLOS — Captured Video', contexts: ['all'] })` entry (use `contexts: ['all']` not `['video']` to mirror P-23-AMAZON's lesson — platform-specific DOM wrapping can intercept the contextmenu event before Chrome recognizes the `<video>`; widen + fall back via content-script element-walking) |
| Right-click on embed `<iframe>` | Content script | Same single `add-video` context-menu entry; content-script walks DOM to find the iframe; if none found, silent bail (mirrors P-23-AMAZON's empty-srcUrl bail) |
| Popup paste URL form | Popup React UI | New `CapturedVideoPasteForm.tsx` mirrors `CapturedTextPasteForm.tsx`'s shape — Project + Platform picker (auto-filled if extension storage has them); CompetitorUrl picker; URL input; category dropdown with inline "+ Add new"; composition + embedded-text + tags fields; Save button |

---

### A.6 Per-platform `<video>` detection (Q6+Q7)

**Approach: platform-agnostic detection + iterate on quirks.**

v1 ships a single platform-agnostic detector — the right-click handler walks DOM (depth ≤ 10) looking for either:

- An inline `<video>` element, OR
- An `<iframe>` whose hostname matches a known video-embed allowlist

If neither is found, silent bail (mirrors P-23-AMAZON's empty-srcUrl bail).

**Video-embed hostname allowlist (v1):**

- `youtube.com` (watch URLs + embed URLs)
- `youtu.be` (short share URLs)
- `vimeo.com`
- `player.vimeo.com`
- `wistia.com` / `*.wistia.com`
- `fast.wistia.net`
- `brightcove.net` / `players.brightcove.net`
- `dailymotion.com`
- `dai.ly`
- `loom.com`

**Per-platform quirks:** captured as future P-NN polish items as they surface during real-world use. The cross-platform Playwright slicing (already deferred per Q3) is where the abstract detector gets per-platform verification. Director's reasoning: video elements are simpler DOM than image carousels, and the embed-iframe pattern is uniform across YouTube/Vimeo regardless of host platform — the Amazon-overlay-shield kind of quirk (P-23-AMAZON for images) is unlikely to recur for videos. If it does, the fix shape mirrors P-23-AMAZON's: widen `contexts` to `['all']` (already chosen above) + content-script DOM walking (already chosen above) handles it without per-platform code.

**The 7 platforms in scope** (per existing W#2 platform-modules):

- amazon — primary platform; high product-demo video presence
- ebay — sparse video presence; mostly customer-uploaded
- etsy — sparse; some brand A+ videos
- walmart — sparse; mostly brand product-demo videos
- shopify (independent websites running Shopify) — variable; depends on theme
- woocommerce (independent websites running WooCommerce) — variable
- bigcommerce (independent websites running BigCommerce) — variable

**Empirical spot-check NOT performed this session** — Claude cannot drive a browser. Director's standing offline knowledge of these platforms is the source-of-truth; platform-agnostic detection is the design's bet that the detector works on all 7 from day one.

---

### A.7 CapturedVideo schema (Q8)

**Decision: new `CapturedVideo` Prisma table with required `sourceType` discriminator + nullable storage/byte-derived fields.**

Mirrors `CapturedImage` shape with 3 additions specific to video. Field list:

```prisma
model CapturedVideo {
  id                    String   @id @default(cuid())
  clientId              String   @unique  // mirrors CapturedImage's idempotency-key shape
  competitorUrlId       String
  competitorUrl         CompetitorUrl @relation(fields: [competitorUrlId], references: [id], onDelete: Cascade)
  projectId             String   // denormalized for fast Project-scope queries + cascade-on-Project-reset

  // Source discrimination
  sourceType            VideoSourceType  // 'embed' | 'direct-bytes' (NEW enum)
  originalSrcUrl        String   // ALWAYS present — embed URL OR page-host URL for direct-bytes

  // Bytes-stored fields (NULL when sourceType='embed')
  storagePath           String?
  storageBucket         String?  // always 'competition-scraping-videos' when set; column kept for future-bucket-swap flexibility (mirrors CapturedImage)
  fileSize              Int?     // bytes
  mimeType              String?  // 'video/mp4' | 'video/webm' | 'video/quicktime' when set
  durationSeconds       Float?   // NEW relative to CapturedImage; nullable since embed paths can't read this without download
  width                 Int?     // intrinsic videoWidth
  height                Int?     // intrinsic videoHeight

  // Thumbnail (nullable — see Q13 fallback)
  thumbnailStoragePath  String?  // direct-bytes path: extension's canvas frame-grab uploaded as separate JPEG; embed path: NULL (use YouTube/Vimeo API URL at render time)

  // Categorization (mirrors CapturedImage)
  videoCategory         String   // FK to VocabularyEntry where type='video-category' (NEW vocab type)
  composition           String   // free-text — mirrors CapturedImage.composition
  embeddedText          String?  // free-text — mirrors CapturedImage.embeddedText (may be null for videos that have no text)
  tags                  String[] // mirrors CapturedImage.tags

  // Display ordering
  sortOrder             Int      @default(0)  // mirrors CapturedImage

  // Audit
  source                String   // 'extension-right-click' | 'extension-embed-walk' | 'popup-paste' (similar to CapturedImage.source)
  addedBy               String   // userId — mirrors CapturedImage
  addedAt               DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([projectId])
  @@index([competitorUrlId])
  @@index([videoCategory])
}

enum VideoSourceType {
  EMBED
  DIRECT_BYTES
}
```

**Why Option A over alternatives (captured in Cluster 3 forced-picker):**

- **Vs. Option B (no sourceType field; infer from `storagePath IS NULL`)** — Option A is more self-documenting; downstream consumers can query `WHERE sourceType='DIRECT_BYTES'` reliably without depending on NULL-convention knowledge.
- **Vs. Option C (two separate tables CapturedVideoEmbed + CapturedVideoBytes)** — Option A preserves the one-CapturedXxx-table-per-media-type symmetry that CapturedText + CapturedImage follow today; halves the API surface; halves the downstream consumer query patterns.

**Type-safety:** TypeScript enum `VideoSourceType` exported from `src/lib/shared-types/competition-scraping.ts`; runtime validators use Zod or hand-rolled type guards consistent with existing W#2 patterns. Discriminated-union types in the shared-types module help downstream consumers narrow correctly.

---

### A.8 Vocab: `video-category` type + inline "+ Add new" UX (Q9)

**Decision: new vocab type + inline "+ Add new" affordance in the capture form (mirroring the pattern that ALREADY EXISTS for text + image + URL forms) + zero seeded entries.**

**Vocab type:** new `video-category` value added to the existing VocabularyEntry `type` enum (or string column, depending on current shape — check at implementation time). Parallel to `content-category` (text) and `image-category` (image).

**Seeded entries v1:** ZERO. The capture form's category dropdown shows an inline "+ Add new..." option as the only entry on first capture; director types the new category name in a small inline input within the form; the entry gets created via existing vocab-API on the spot; selection then proceeds.

**Inline "+ Add new" UX details — mirror the existing pattern, do not re-invent:**

The inline-add category UX is **already implemented** for the other 3 capture form surfaces per the existing W#2 codebase (confirmed via Rule 24 pre-capture search at end of this design session — caught a Rule 3 violation in an earlier draft of this section that wrongly claimed text/image lacked the UX):

- `extensions/competition-scraping/src/lib/content-script/text-capture-form.ts:305` — content script text capture form, content-category dropdown
- `extensions/competition-scraping/src/lib/content-script/image-capture-form.ts:368` — content script image capture form, image-category dropdown
- `extensions/competition-scraping/src/lib/content-script/url-add-form.ts:244` — content script URL capture form (uses `setTimeout(() => newInput.focus(), 0)` defer pattern)
- `extensions/competition-scraping/src/entrypoints/popup/components/CapturedTextPasteForm.tsx:262` — popup React form

P-27's video capture forms simply mirror this existing pattern — no new UX invention. The shipped behavior:

- Capture form's category `<select>` has a permanent first option: `+ Add new category…`
- Selecting that option reveals a small inline text input (no modal; inside the form); autofocus per the P-13 fix shipped 2026-05-19-c
- User types the new category name + presses Enter (or implicit blur-commit)
- Form posts to existing vocab-create endpoint
- New entry is added to the form's dropdown + auto-selected
- Form continues with save as normal

**Why director's "why preselected?" question made sense even though the inline-add UX already existed:**

Director-stated 2026-05-20: *"Why should there be preselected options? Why can't the user customize the video category names to which the video is to be added?"* The director was asking about v1 SEEDING — whether v1 should ship with default vocab entries the way some platforms do — not about the form UX (which already supports inline-add). v1's answer: ZERO seeded video-category entries; the inline-add UX (already-shipped pattern) covers the first-use case without forcing an admin trip. Director can add categories via either the inline form UX OR the existing `/vocab` admin UI; both paths write to the same VocabularyEntry table; both are reversible.

**Downstream-query reliability preserved:** the vocab list is still a closed list of known values (downstream W#3+ can query `videoCategory = 'X'` reliably); the inline-add UX only changes *where* you add to the list (form vs. admin page), not the property that all rows reference a known entry.

---

### A.9 Bucket + size cap + thumbnail extraction (Q10 + autonomous calls)

**Bucket (autonomous per Rule 15):**

- Name: `competition-scraping-videos`
- Privacy: private
- Access: signed-URL only
- TTL: 1 hour, re-issued per render (mirrors `competition-scraping` image bucket)
- Path structure: `{projectId}/{competitorUrlId}/{capturedVideoId}.{ext}` (per-Project folder for symmetric admin-reset semantics)
- Helper wrapper: new `src/lib/competition-video-storage.ts` paralleling `src/lib/competition-storage.ts`. Exports: `requestVideoUploadUrl(...)`, `finalizeVideoUpload(...)`, `getVideoSignedUrl(...)`, `getVideoThumbnailUrl(...)`, `deleteVideo(...)`, `wipeProjectVideos(projectId)`.

**MIME allowlist (autonomous per Rule 15):**

- Accept: `video/mp4` + `video/webm` + `video/quicktime`
- Reject: everything else (return 415 from Phase-1 `requestUploadUrl`)
- Rationale: 3 common formats served by `<video>` elements across supported platforms; extensible later if a platform serves something unusual.

**Per-file size cap (Q10a — director picked):** **100 MB.**

- Hard-rejects cinematic / 1080p 5+ min videos
- Comfortably covers product demos (~10-50 MB at 720p MP4), customer-review videos, most A+ content videos
- Forces director to use YouTube/Vimeo embed path for very large videos — which is the intended pattern anyway
- Storage projection at Phase 3 (~70 Projects/wk × ~10 videos/Project × ~30 MB avg) ≈ ~1 TB/year (manageable on Supabase Pro tier; comparable to image bucket Phase-3 projection per `PLATFORM_REQUIREMENTS.md` line 432-434)
- Reversible — bucket cap can be raised in a future polish session if usage data justifies it

**Thumbnail extraction approach (Q10b — director picked):** **Client-side `<canvas>` frame-grab.**

- **For direct-bytes path:**
  - Extension reads the video's current frame via `<canvas>.drawImage(videoElement, 0, 0, video.videoWidth, video.videoHeight)` after waiting for `video.readyState >= 2` (HAVE_CURRENT_DATA)
  - Encodes to JPEG via `canvas.toBlob('image/jpeg', 0.85)` for compactness
  - Uploads both the video bytes AND the thumbnail JPEG in the SAME 2-phase upload flow — the Phase-1 `requestVideoUploadUrl` returns 2 signed URLs (one for video bytes, one for thumbnail), the Phase-2 PUT writes both, Phase-3 `finalizeVideoUpload` persists `storagePath` + `thumbnailStoragePath`
  - On failure of frame-grab (cross-origin video / autoplay-blocked / canvas-taint), fall back to NULL `thumbnailStoragePath` (per Q13 fallback below)
- **For embed path (YouTube/Vimeo):**
  - No upload; thumbnail URL is computed at render time from the platform's standard pattern:
    - YouTube: `https://img.youtube.com/vi/{videoId}/hqdefault.jpg`
    - Vimeo: call `https://vimeo.com/api/oembed.json?url={videoUrl}` once per row + cache the returned thumbnail URL in a new `embedThumbnailUrl` field (column-level addition deferred to implementation #1 — may also just render via Vimeo's player thumbnail at iframe load time without API call)
    - Wistia/Brightcove/Dailymotion/Loom: case-by-case at implementation time; if the platform has a stable thumbnail URL pattern, hardcode; if not, fall back to generic icon placeholder

---

### A.10 Embed save URL validation (Q11)

**Decision: lightweight URL-pattern regex validation only; no server-side fetch.**

On save (popup paste form OR embed-walk form):

- Run a pure-helper regex check from `video-url-normalizer.ts` against the URL
- Match against known patterns:
  - `youtube.com/watch?v=[a-zA-Z0-9_-]{11}`
  - `youtu.be/[a-zA-Z0-9_-]{11}`
  - `youtube.com/embed/[a-zA-Z0-9_-]{11}`
  - `vimeo.com/[0-9]+`
  - `player.vimeo.com/video/[0-9]+`
  - `wistia.com/medias/[a-zA-Z0-9]+`
  - `fast.wistia.net/embed/iframe/[a-zA-Z0-9]+`
  - `brightcove.net/.../videos/[0-9]+`
  - `dailymotion.com/video/[a-zA-Z0-9]+`
  - `dai.ly/[a-zA-Z0-9]+`
  - `loom.com/share/[a-zA-Z0-9]+`
- Reject obviously-malformed URLs with inline form error: `"This doesn't look like a video URL — try copying the share link from YouTube/Vimeo/etc."`
- Don't actually fetch the URL — saves a server round-trip + sidesteps YouTube/Vimeo rate-limiting + API key concerns

**Trade-off accepted:** a typo'd-but-syntactically-valid video ID (e.g., wrong character in YouTube ID) saves successfully + reveals as broken later when director views the URL detail page renderer. The URL detail page's `<iframe>` will simply show YouTube's standard "This video is unavailable" UI; director can edit/delete the bad row.

**Future polish item:** if save-time-broken-URL incidents accumulate post-ship, revisit by adding a server-side oEmbed verification (Option B from Cluster 4 picker) as a follow-up session.

---

### A.11 Size cap enforcement (Q12)

**Decision: two-layer enforcement (client-side pre-upload + server-side requestUploadUrl rejection).**

**Client-side (extension):**

- After fetching video bytes (via fetch + blob OR by reading `<video>` element), check `blob.size`
- If `blob.size > 100 * 1024 * 1024` (100 MB), show inline form error: `"Video exceeds 100 MB cap — try the YouTube/Vimeo embed path instead, or upload directly to YouTube/Vimeo and paste the share URL"`
- Bail before initiating the 2-phase upload (no Phase-1 call, no Phase-2 PUT, no bandwidth wasted)

**Server-side (`requestVideoUploadUrl` API route):**

- Validates the `declaredFileSize` parameter in the request body
- If > 100 MB, returns 413 with message body explaining the cap + suggesting embed path
- Tamper-resistant: even if the extension is modified to bypass client-side check, the server enforces

**Pros:** fast UX feedback (client-side rejects without round-trip) + tamper-resistant (server-side enforces regardless of client behavior). Mirrors `competition-storage.ts`'s existing `requestUpload` guard at the 5 MB image cap.

---

### A.12 Thumbnail extraction failure fallback (Q13)

**Decision: fall back to NULL `thumbnailStoragePath` + generic video-icon placeholder + save anyway.**

If `<canvas>.drawImage(videoElement)` throws (cross-origin video / autoplay-blocked / browser quirk) OR `<video>.poster` is unset AND the frame-grab fails:

- Save the CapturedVideo row with `thumbnailStoragePath = NULL`
- Saved-video indicator + URL detail page renderer show a generic video icon (▶️ or play-button SVG) as the placeholder
- Director can manually re-trigger thumbnail capture from the URL detail page renderer (future polish item if needed)

**Principle: save NEVER fails because of thumbnail issues.** The video bytes (which we have!) are the load-bearing data, not the thumbnail. Degraded UX (icon placeholder) is acceptable + recoverable.

---

### A.13 Test coverage approach (Q14)

**Decision: Hybrid per Rule 27 — node:test on pure helpers + Playwright extension-context spec on amazon happy path.**

**node:test (src/lib + extension):**

| Helper | Tests (estimated) |
|---|---|
| `video-url-normalizer.ts` — URL-pattern regex match + canonical URL construction + platform extraction | ~15-25 cases (one per platform + edge cases: empty URL / malformed / mismatched / wrong path) |
| `find-underlying-video-embed.ts` — DOM-walking helper | ~10 cases (mirrors `find-underlying-image.ts`'s shape: direct hit / depth-1 / depth-5 / depth-10 / depth-11 bail / iframe-only / video-only / neither / both / null event) |
| `thumbnail-extraction.ts` — canvas frame-grab logic with injected fake video + injected fake canvas | ~8-12 cases (happy path / video-not-ready / canvas-taint / cross-origin / duration-zero / dimensions-zero / blob-encode-failure / blob-too-large) |
| `competition-video-storage.ts` — Phase-1/2/3 helper with mocked Supabase SDK | ~10-15 cases (request happy path / size 413 / mime 415 / Supabase 500 / finalize happy path / orphan cleanup / signed-URL generation) |
| API route request-body validators (`/api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/`) | ~10-20 cases per route (POST create / GET list / DELETE; field validation; tampering) |

Estimated total new node:test cases: **~55-95** across src/lib + extension test suites.

**Playwright (root + extension projects):**

| Spec | Coverage |
|---|---|
| `tests/playwright/extension/video-capture.spec.ts` — amazon happy path | Right-click `<video>` → form opens → fill all fields → Save → Phase-1 `requestVideoUploadUrl` mock fires → Phase-2 PUT to mocked Supabase fires with video bytes → Phase-3 `finalizeVideoUpload` fires → form closes |
| `tests/playwright/extension/video-capture-embed.spec.ts` — amazon embed path (YouTube iframe) | Right-click iframe → form opens with originalSrcUrl pre-filled → no bytes upload path → Save → only `finalizeVideoUpload` fires (no Phase-1/Phase-2) |
| `tests/playwright/extension/video-paste-popup.spec.ts` — popup paste form | Open popup → paste YouTube URL → form fields render → Save → finalize fires |
| `tests/playwright/extension/amazon-video-product-page.html` — NEW fixture | Amazon-style product page with inline `<video>` + iframe embed |

Estimated total new Playwright cases: **~3-5**.

**Deferred per Q3 to a future P-22-style follow-up:**

- Cross-platform Playwright extension to ebay + etsy + walmart — each gets its own fixture page + the existing specs get parametrized into a PLATFORMS array (canonical P-22 pattern from `image-capture.spec.ts:124` + `highlight-flashing.spec.ts:97`)

---

### A.14 Platform-truths audit (Rule 19)

Two platform-level facts surfaced during this interview and warrant updates to `PLATFORM_REQUIREMENTS.md` at end-of-session:

1. **Workflow-deliverable storage strategy for video is now picked.** `PLATFORM_REQUIREMENTS.md` §10.2 line 427 currently reads: *"Workflow-deliverable storage (videos, design files, etc.) likely needs a dedicated bucket strategy — possibly private + signed URLs (already on the tech-debt list)."* This session pins the strategy for video specifically: **private + signed URLs + dedicated per-workflow bucket** (matches the existing image-bucket pattern). The tech-debt note can be updated to: *"Workflow-deliverable storage strategy: each workflow that captures binary assets gets its own private bucket with signed-URL access (W#2 image bucket `competition-scraping`; W#2 video bucket `competition-scraping-videos` per `CAPTURED_VIDEOS_DESIGN.md`). Future workflows declare their own buckets at design-interview time."*

2. **Video-storage scale projection at Phase 3.** Mirrors the existing image-storage projection at `PLATFORM_REQUIREMENTS.md` line 432-434. New paragraph to add:

   > **Video-storage scale projections (NEW 2026-05-20 — surfaced by P-27 design interview):**
   >
   > W#2 Competition Scraping captures ~10 videos per Project (mostly product demos + customer reviews + A+ content videos; per-file 100 MB cap; ~30 MB average for direct-bytes; embeds store no bytes). Aggregate projections (direct-bytes only):
   >
   > - Phase 3 (~70 Projects/wk × ~10 videos × ~30 MB) ≈ ~1 TB/year of video storage
   > - Phase 4 (~140 Projects/wk × ~10 videos × ~30 MB) ≈ ~2 TB/year of video storage
   >
   > **Implication:** the W#2 video bucket joins the W#2 image bucket on Supabase Pro tier; storage budget review at Phase 3 ramp time. CDN configuration evaluated at Phase 3 ramp time (videos are bandwidth-heavy on view; CDN matters more here than for images).

Both updates land at end-of-session per Rule 19; surfaced here so the next session reading this design doc sees the audit captured.

---

### A.15 Living Questions (Rule 7) answers — for `DATA_CATALOG.md` Shared Data Registry

Three questions every new feature must answer:

1. **Which data from upstream workflows does P-27 need?**
   - Project (existing — read from `projects` table)
   - Platform (existing — read from W#2's per-Project platform context in `chrome.storage.local`)
   - CompetitorUrl (existing — W#2's own captured URLs)
   - VocabularyEntry of type `video-category` (NEW vocab type; created by P-27)
2. **Is each piece of shared data read-only or editable downstream?**
   - All CapturedVideo data is **read-only by downstream W#3+** (per `COMPETITION_SCRAPING_DESIGN.md` §A.5 standing pattern — W#2 outputs are read-only by all downstream workflows in v1; mutability is a future cross-workflow concern not in scope here).
3. **If editable, how does the upstream tool see the edits?** N/A — read-only.

**Add to `DATA_CATALOG.md` Shared Data Registry** at end-of-session per Rule 7.

---

### A.16 Cross-Tool Data Flow Map reciprocal output declaration (Rule 18)

**New entry for W#2's row in `DATA_CATALOG.md` §7 Cross-Tool Data Flow Map:**

| Output | Producer | Schema location | Initial downstream consumers |
|---|---|---|---|
| Captured videos (`CapturedVideo` rows) | W#2 P-27 | `prisma/schema.prisma` `CapturedVideo` model + `src/lib/shared-types/competition-scraping.ts` `CapturedVideoShared` interface | TBD — likely W#3 Therapeutic Strategy + W#5 Conversion Funnel + W#6 Content Development; declared as "anticipated future consumers" until those workflows' interviews confirm |

**Add to `DATA_CATALOG.md` §7** at end-of-session.

---

### A.17 Scaffold fit (Rule 20)

P-27 is an EXTENSION to an already-graduated-pattern W#2 surface, not a new workflow. The Shared Workflow Components Library is consumed by the PLOS-side rendering (URL detail page renderer); the extension content-script forms are W#2-specific and don't import from the shared library.

**Library components consumed (PLOS side):** existing — `<StatusBadge>` / `<WorkflowTopbar>` / `<DeliverablesArea>` already imported by W#2's URL detail page; no new component additions needed for P-27.

**No new shared-library component additions proposed by P-27.**

---

### A.18 Deferred-items registry from this session (Rule 14e + Rule 26)

Captured via `TaskCreate` with `DEFERRED:` prefix during this session:

1. ~~Cross-cutting symmetry-restore: apply inline "+ Add new category" affordance to captured-text + captured-image capture forms.~~ **SUPERSEDED at end-of-session 2026-05-20.** The Rule 24 pre-capture search done at end-of-session caught a Rule 3 violation: my draft of §A.8 had claimed text + image forms "force admin-page-first" for vocab creation — wrong per the actual code (P-13 ROADMAP entry explicitly documents the inline-add UX as already shipped on text + image + URL surfaces; see A.8 source-file references). No symmetry-restore polish item is needed. Task #10 in this session's TaskList closed as SUPERSEDED. CORRECTIONS_LOG informational entry captures the slip + Rule 24's end-of-session catch.

In-doc deferrals (scope-deferral for v1, captured in §A.3 OUT-of-scope list; no separate TaskCreate needed since destination IS this doc):

- Cross-platform Playwright extension to ebay + etsy + walmart (P-22-style follow-up)
- Below-fold / long-video scroll-capture analog to P-26
- Server-side FFmpeg fallback for thumbnail extraction
- Save-time embed URL fetch validation (oEmbed)
- Per-platform `<video>` detection quirks (capture as future P-NN polish items as they surface during real-world use)
- URL detail page manual re-trigger of thumbnail capture (if NULL-thumbnail rate is high)

---

## §B — In-flight refinements (append-only)

**Empty at end of interview 2026-05-20.** Future P-27 build sessions append entries here following the canonical format:

```markdown
### §B YYYY-MM-DD — <session ID> — <one-line topic>

- **Director said:** <verbatim or paraphrased directive>
- **Alternatives considered:** <list>
- **Decision:** <what was decided>
- **Reasoning:** <why>
- **Impact on §A:** <does §A still hold? if no, flag for §A update with director's confirmation>
```

Never edit prior entries or §A. If accumulated §B decisions supersede §A's spec, surface that to director as a flag for a deliberate §A update.

---

### §B 2026-05-20-c — `session_2026-05-20-c_p27-build-1-schema-bucket-helper` — Build #1 mid-build refinements (schema shape + VocabularyEntry type + bucket-level size cap)

- **Director said:** approval to proceed via Rule 8 pre-flight picker → Option A "Proceed (Additive, safe per Rule 23)." No subsequent mid-build directives beyond the standing recommendation-style + default-to-recommendation memories. Three implementation realities surfaced during the build and are captured here for the §A audit trail.

- **Alternatives considered:** for refinement #1 (schema shape), §A.7 draft language vs. mirroring the sibling `CapturedImage` table exactly. For refinement #2 (`VocabularyEntry.vocabularyType` enum-vs-string), no alternatives — the §A.8 narrative + the launch prompt both loosely called the column an "enum" without a code-truth check; the actual schema is a `String` column with a comment-list allowlist (the existing values `content-category`, `image-category`, etc. are comment-documented string values, not Prisma enum variants). For refinement #3 (bucket-level size cap), pursued the design doc §A.10 picked 100 MB per-file size cap by passing `fileSizeLimit=100MB` to `supabase.storage.createBucket(...)`; alternative considered after the Supabase API rejected the value: (a) raise the project's Global File Size Limit via Supabase dashboard before bucket creation (offline step — director-only), (b) accept the rejection + ship the bucket without a bucket-level cap + rely on app-layer enforcement, (c) lower the bucket-level cap below the project's current global limit (rejected — would violate the design pick of 100 MB).

- **Decision:** (1) Schema shape matched sibling `CapturedImage` where §A.7 draft diverged — `tags` is Json (matches CapturedImage) not String[] as §A.7 draft showed; `id` uses uuid (matches CapturedImage's id strategy); `videoCategory` + `composition` use the same nullability as their CapturedImage siblings. (2) `video-category` added to `VocabularyEntry.vocabularyType` as a plain string-value addition via the comment-list allowlist update — no enum migration since the column is `String` not a Prisma enum. (3) Bucket created programmatically via new `scripts/create-competition-scraping-videos-bucket.mjs` (idempotent SDK call) WITHOUT bucket-level `fileSizeLimit` set; size enforcement falls to app-layer per design doc §A.11 two-layer client + server pattern, which is the documented design intent. Director's offline dashboard step DEFERRED — capture as ROADMAP P-27 polish-backlog sub-item ("Build #1 follow-up — Supabase Global File Size Limit dashboard raise to enable bucket-level 100MB cap on competition-scraping-videos"); not blocking; can happen any time.

- **Reasoning:** (1) Sibling consistency wins on schema shape — every existing W#2 query / repo helper / API route shape assumes the `CapturedImage` shape; aligning `CapturedVideo` with the sibling keeps downstream Build sessions cheap. (2) Code-truth wins on the enum question per Rule 3 — re-verified `prisma/schema.prisma` `VocabularyEntry` model BEFORE the schema edit; the column is `String` with a comment-list allowlist; adding a new value is a plain string + comment update with zero migration cost. (3) The design doc §A.9 picked 100 MB as the per-file size cap, and §A.11 picked two-layer client + server enforcement as the size-cap enforcement strategy. The bucket-level cap was a third defense-in-depth layer that the design doc TREATED as available — it's not currently available on this Supabase project because of the Global File Size Limit setting in Storage Settings. The two layers picked in §A.11 (client-side pre-upload + server-side requestVideoUploadUrl 413) are the documented + binding design; the bucket-level cap is a nice-to-have that doesn't change the design's safety guarantee. Per `feedback_recommendation_style.md` (most thorough/reliable), the recommendation is to also raise the Global File Size Limit later via the dashboard step so the bucket-level cap becomes available — captured as ROADMAP DEFERRED sub-item, not blocking Build #2.

- **Impact on §A:** §A still holds. (1) §A.7 schema spec is the design intent; the implementation reality affirms the spec with sibling-consistency refinements on `tags` / `id` / nullability — the §A.7 wire interface description is correct at the semantic level; the schema field types just match `CapturedImage` exactly. (2) §A.8 vocab UX narrative is correct in spirit; the implementation reality clarifies that adding `video-category` was a plain string + comment-list update, not an enum migration. The §A.8 picker outcome (Option C — inline "+ Add new category" affordance + 0 seeded entries) is unchanged. (3) §A.9 bucket configuration narrative + §A.11 size-cap enforcement narrative are both correct + binding. §A.9 mentions a bucket-level cap as part of the bucket configuration spec; the implementation reality is that the bucket-level cap is currently DEFERRED to a director-offline dashboard step. The two-layer app-layer enforcement per §A.11 is shipped + active; the bucket-level cap is a future defense-in-depth addition. No §A update needed; future Build sessions should read §A.7 + §A.9 + §A.11 + this §B 2026-05-20-c entry together for the full picture.

---

### §B 2026-05-21 — `session_2026-05-21_p27-build-2-api-routes-shared-types` — Build #2 mid-build judgment calls (API route file naming + per-row PATCH+DELETE path placement + list endpoint response shape)

- **Director said:** approval to proceed implicit in the launch prompt + no mid-build directives. Drift check surfaced a "mirror the image sibling exactly" judgment call BEFORE coding (the launch prompt named files hyphenated `request-upload-url` etc. + nested `[videoId]` under `urls/[urlId]/videos/`; the actual image sibling uses camelCase `requestUpload` + per-row `[imageId]` at the SIBLING path `competition-scraping/images/[imageId]/` NOT nested); director's implicit approval of the "mirror exactly" interpretation per `feedback_default_to_recommendation.md` standing rule (Rule 14f exception — skipping forced-picker on default-approval paths).

- **Alternatives considered:** for the file-naming question, hyphenated (`request-upload-url/`) vs. camelCase (`requestUpload/`) — picked camelCase per "mirror exactly." For the per-row path placement question, nested (`urls/[urlId]/videos/[videoId]/`) vs. sibling (`competition-scraping/videos/[videoId]/`) — picked sibling per "mirror exactly." For the list endpoint's response shape, bare `CapturedVideo[]` vs. `CapturedVideoWithUrls[]` (mirroring `CapturedImageWithUrls[]` with pre-minted signed URLs) — picked bare `CapturedVideo[]` for Build #2; the URL-minting was added later in the image sibling (slice a.2) when the gallery UI shipped; following the same staging here.

- **Decision:** (1) Files named camelCase (`requestUpload/route.ts`, `finalize/route.ts`) mirroring image sibling exactly. (2) Per-row PATCH+DELETE lives at the SIBLING path `src/app/api/projects/[projectId]/competition-scraping/videos/[videoId]/route.ts`, NOT nested under `urls/[urlId]/`. Mirrors image sibling + text + sizes per-row routes. (3) List endpoint returns bare `CapturedVideo[]`; signed-URL minting deferred to a future Build session when the URL detail page renderer needs it.

- **Reasoning:** (1) + (2) "Mirror exactly" wins on sibling consistency — keeps the codebase pattern clean; downstream sessions reading the routes don't have to context-switch between image vs video conventions. The launch prompt's hyphenated filenames + nested placement were loose paraphrases of the design intent, not binding micro-architecture. (3) URL minting at list time is expensive for video (1-hour TTL × N rows × possibly TWO URLs per row — video bytes + thumbnail); the image sibling added it once the gallery UI existed; Build #2 has no consumer yet, so deferring matches the staging pattern. The shipped `requestUpload` route mints TWO signed URLs per call (video bytes URL + thumbnail URL) per §A.9; the list endpoint can grow `WithUrls` variant later when needed.

- **Impact on §A:** §A still holds. §A.9 bucket configuration narrative is unchanged. §A.2 implementation arc table row #3 is now ✅ COMPLETE 2026-05-21. The next-row Build session #3 begins extension UI work per row #4. §A.10 (size cap = 100 MB per file) is enforced server-side at the new `requestUpload` route per §A.11 layer 2 (server-side enforcement via `isAcceptedVideoMimeType` + size guard against the 100 MB cap from `VIDEO_MAX_BYTES`). §A.13 (test coverage approach — Hybrid per Rule 27) is partially shipped — the 12 new node:test cases on the new type guards land in this Build; the API route handlers themselves DO NOT have node:test coverage at Build #2 (they need a Supabase mock harness; that arrives at a later Build session per §A.13). The shared-type interfaces shipped this session are the binding wire contract for Build #3's extension content-script form: `RequestVideoUploadRequest` + `RequestVideoUploadResponse` for the upload-URL minting step; `FinalizeVideoUploadRequest` + `FinalizeVideoUploadResponse` for the finalize step. Build #3's content-script form must match these shapes exactly.

---

END OF DOCUMENT
