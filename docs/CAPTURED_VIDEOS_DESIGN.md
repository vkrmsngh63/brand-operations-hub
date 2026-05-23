# CAPTURED VIDEOS — DESIGN DOC (Workflow #2 polish P-27)

**Polish item:** P-27 — Captured-videos feature
**Parent workflow:** W#2 Competition Scraping & Deep Analysis (🔍)
**Status:** 🔄 Implementation phase — Build #1 (schema + bucket + helper) complete 2026-05-20-c (commit `c8fa639`); Build #2 (API routes + shared-types extensions) complete 2026-05-21 (commit `7093f2e`); Build #3 (extension content-script form + helper + validator + 41 new node:test cases) complete 2026-05-21-b (commit `02709c4`); Build #4 (popup paste form + saved-video indicator overlay + 13 new node:test cases) complete 2026-05-21-c (commit `ea32fa5`); Build #5 (URL detail page renderer + signed-URL list endpoint) complete 2026-05-21-d (commit `467af4c`); Build #6 (single-platform amazon Playwright extension-context specs + new Amazon-style fixture page) complete 2026-05-22 (commit `af0ed00`; Playwright 91 → 94 — 3 new cases all GREEN); Build #7 (DEPLOY session) complete 2026-05-22-b — ff-merge `cf4e233..bd7cedd` (13 commits +7890/-83 across 40 files; fresh extension zip `plos-extension-2026-05-22-w2-deploy-31.zip` 196,849 bytes); in-session director real-Chrome verification surfaced Etsy PASS + 6 failures across Amazon + Ebay + Walmart captured as TaskList DEFERRED #9-#14; Build #8 (FIX-FORWARD POLISH + DEPLOY) complete 2026-05-21 — commit `a47a95f` lands 5 code-level fixes; ff-merge `bd7cedd..a47a95f` (2 commits +645/-19 across 7 files); fresh extension zip `plos-extension-2026-05-21-w2-deploy-32.zip` 198,508 bytes; Build #9 (DEVTOOLS-COOPERATIVE DIAGNOSIS + P-45 DESIGN PIVOT) complete 2026-05-22-c — no code commits; pure design + diagnostic; Bug #12 root cause diagnosed (blob: URLs from Media Source Extensions unreachable from background SW); director's escape-hatch question surfaced screen recording as universal solution; 12 P-45 design decisions locked through Rule 14f pickers; new §C section added; **P-45 Build #1a (FOUNDATION slice) complete 2026-05-22-d — commit `7e2eb2c` lands schema migration adding `SCREEN_RECORDING` to `VideoSourceType` enum via `npx prisma db push` (Rule 9 director-Yes gate fired; live on Supabase since 14:09 UTC) + NEW `extensions/competition-scraping/src/lib/screen-recording/record-controller.ts` (~280 LOC state machine + DI surface) + 29 NEW node:test cases mirroring §C.18 enumeration + correctness updates to `isFinalizeVideoUploadRequest` validator + finalize-route bytes-required gate + list-route signed-URL minting gate; pre-end-of-session scoreboard 57 routes / 590 src/lib (+1) / 524 ext (+29) / Playwright skipped (non-deploy) all GREEN; original "single Build #1" framing was split at session start via Rule 14f scope-pacing forced-picker into 1a [foundation, this session] + 1b [wiring + dev verify, next session]; schema-change-in-flight flag flipped to YES this session and stays YES until P-45 Build #2 deploys the new enum live on vklf.com**. §A.2 implementation arc table row #9 stays at **PARTIAL+ with diagnosed unblock path** (closes when P-45 ships + cross-platform re-verification confirms Amazon + Ebay captures work via recording). **P-45 Build #1b (WIRING slice) complete 2026-05-22-e — commit `80713ff` lands 3 NEW screen-recording helpers (`recording-bytes-upload.ts` smart-client Phase 1+2+3 orchestrator + `thumbnail-extraction.ts` first-frame canvas grab that NEVER throws per §A.12 + canvas-crop region constraint extension to `record-controller.ts` via optional `cropStreamToRegion` DI dep preserving 1a backward-compatibility) + 2 NEW content-script overlays (`video-region-record-overlay.ts` forked from `region-screenshot-overlay.ts` + `recording-indicator-overlay.ts` with red dashed border + REC ● pulsing badge + M:SS countdown + Stop + Cancel toolbar + PREPARING state) + 9 wiring file edits (`messaging.ts` new types + `api-bridge.ts` new helpers + `background.ts` `CONTEXT_MENU_RECORD_VIDEO` registration with locked label **"Record video for PLOS"** + `orchestrator.ts` new `enter-video-region-record-mode` handler + `video-capture-form.ts` new `kind:'screen-recording'` branch with `<video controls>` preview from Blob createObjectURL + `styles.ts` new CSS + `captured-video-validation.ts` bytes-required gate broadened symmetrically + `record-controller.ts` extended with optional canvas-crop DI dep + `record-controller.test.ts` +5 canvas-crop cases) + 3 NEW test files (thumbnail-extraction.test.ts 8 cases + video-region-record-overlay.test.ts 8 cases + recording-indicator-overlay.test.ts 12 cases). Total +34 extension tests (524 → 558). 16 files changed +2418/-15. Pre-end-of-session scoreboard GREEN at exact baselines except expected ext delta — 57 routes / 590 src/lib / 558 ext / Playwright SKIPPED. Dev-time happy-path verify on Amazon DEFERRED to Build #2's Phase 1 per director directive late-session. Schema-change-in-flight flag stays YES until Build #2 deploys the new enum live on vklf.com. Next Build session = P-45 Build #2 (DEPLOY session — 4-phase: Phase 1 dev-time verify on Amazon → Phase 2 `/scoreboard` GREEN → Phase 3 `/deploy` orchestration with Rule 9 director-Yes gate + ff-merge → main + push + Vercel auto-redeploy + ping-pong sync + fresh extension zip → Phase 4 director real-Chrome cross-platform verify across Amazon + Ebay + Walmart + Etsy). **P-45 Build #2 ✅ COMPLETE 2026-05-22-i — DEPLOYED + CROSS-PLATFORM REAL-CHROME-VERIFIED on vklf.com via ff-merge `d4a2940..ee8c79d` (11 commits 39 files +5067/-200; fresh extension zip `plos-extension-2026-05-22-w2-deploy-33.zip` 202.75 KB). Phase 1 surfaced 3 fixable issues shipped in `ee8c79d` (3 files +78/-30): Issue 1 selfBrowserSurface include in record-controller.ts; Issue 2 aggressive 20-event stopPropagation band-aid + click-handler force-focus on all 4 text inputs in video-capture-form.ts; Issue 3 PUT Content-Type normalization in recording-bytes-upload.ts. Phase 4 director real-Chrome cross-platform verify PASSED CLEAN on all 4 platforms (Amazon + Ebay + Walmart + Etsy) with zero caveats — the cleanest cross-platform PASS in any W#2 cooperation session to date. Schema-change-in-flight flag FLIPPED YES → NO at deploy completion. P-45 ✅ DONE-AND-VERIFIED 2026-05-22-i. P-27 Bug #11 ✅ DONE-AND-VERIFIED 2026-05-22-i via Issue 2 band-aid empirically verified on Amazon during Phase 4. NEW polish item P-47 captured for Shadow DOM refactor as proper long-term replacement for Issue 2 band-aid (LOW priority).** §A.2 implementation arc table row #9 now ✅ CLOSED (P-45 ships + cross-platform verifies; Amazon + Ebay captures work via recording).
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
| 1 ✅ | Design | Design interview + this doc shipped — no code — **✅ COMPLETE 2026-05-20-b** |
| 2 ✅ | Build | Schema migration via `npx prisma db push` (new `CapturedVideo` table + new vocabulary type enum value `video-category`) + new Supabase bucket `competition-scraping-videos` created via dashboard + new `competition-video-storage.ts` helper wrapper — **✅ COMPLETE 2026-05-20-c** (commit `c8fa639`) |
| 3 ✅ | Build | API routes scaffolding under `/api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/` + shared types in `src/lib/shared-types/competition-scraping.ts` — **✅ COMPLETE 2026-05-21** (commit `7093f2e`) |
| 4 ✅ | Build | Extension content-script right-click on `<video>` form (`video-capture-form.ts`) + helper `find-underlying-video-embed.ts` (parallel to `find-underlying-image.ts`) + pure-helper node:test cases — **✅ COMPLETE 2026-05-21-b** (commit `02709c4`; 5 NEW files + 5 MODIFIED files + 41 new node:test cases; ext `npm test` 428 → 469) |
| 5 ✅ | Build | Extension content-script embed-fallback path + popup paste form (`CapturedVideoPasteForm.tsx`) + inline "+ Add new category" vocab UX + pure-helper node:test cases — **✅ COMPLETE 2026-05-21-c** (commit `ea32fa5`; popup paste form ships in this row; saved-video indicator overlay shipped same Build per §B 2026-05-21-c) |
| 6 ✅ | Build | Saved-video on-page indicator overlay (mirror of P-24) + URL detail page renderer (inline `<iframe>` for embeds + inline `<video>` for direct MP4) + pure-helper node:test cases — **✅ COMPLETE 2026-05-21-d** (saved-video indicator overlay shipped 2026-05-21-c via Build #4; URL detail page renderer + signed-URL list endpoint shipped 2026-05-21-d via Build #5 commit `467af4c`) |
| 7 ✅ | **Test** | Single-platform amazon Playwright extension-context spec (happy path + embed path + popup paste) per Q14 Hybrid pick; new `amazon-video-product-page.html` fixture; full pre-deploy `/scoreboard` GREEN before next stage — **✅ COMPLETE 2026-05-22** (commit `af0ed00`; 4 NEW files; +1297 LOC; Playwright 91 → 94 — 3 new cases all GREEN at first run; new fixture has inline `<video src="https://m.media-amazon.com/videos/fake-product-demo.mp4">` + `<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ">`) |
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

### §B 2026-05-21-b — `session_2026-05-21-b_p27-build-3-extension-content-script-form` — Build #3 mid-build judgment calls (helper composition / single form for both branches / embed-platform field rename)

- **Director said:** approval to proceed implicit in the launch prompt + drift-check approval at session start (responded "go") confirmed the single-form approach for both EMBED + DIRECT_BYTES branches per `feedback_default_to_recommendation.md` standing rule. No mid-build directives needed — the 3 judgment calls below were all default-to-recommendation paths.

- **Alternatives considered:**
  - **(1) Helper composition** — Build #3's `find-underlying-video-embed.ts` could (a) IMPORT + compose with Build #1's `detectEmbedPlatform` helper from `src/lib/competition-video-storage-helpers.ts` (cross-package import; single source of truth for the 6-platform hostname allowlist + 13 URL-pattern regexes) OR (b) re-encode the allowlist inline in the extension helper (self-contained; no cross-package coupling).
  - **(2) EMBED vs. DIRECT_BYTES form shape** — could (a) ship a SINGLE form with internal branching on Save (UX symmetric; same saved-URL picker + category + composition + embedded-text + tags + Save button; only the preview area + the network calls on Save differ) OR (b) ship TWO SEPARATE forms (one for direct `<video>` capture + one for embed `<iframe>` capture; different entry points + different visual treatments).
  - **(3) Embed-platform name field** — initial draft had `platform: string` on the embed branch (the YouTube/Vimeo platform name) which collided with the existing `platform: Platform` (W#2 site platform name = amazon/ebay/etc.) at the top level of the form's props. Could (a) rename the embed-branch field to `embedPlatform: string` so both branches share `platform: Platform` at the top level cleanly OR (b) push the W#2 `platform` field down into the DIRECT branch only OR (c) accept the type-narrowing escape hatch via an `as` cast.

- **Decision:** (1) Compose with Build #1's `detectEmbedPlatform` — single source of truth. (2) Single form with internal branching on Save. (3) Rename embed-branch field to `embedPlatform: string`.

- **Reasoning:**
  - **(1)** Single source of truth wins on maintainability — if a new embed platform is added later (TikTok / Twitch / etc.), the allowlist updates in one place + both the server-side validation in Build #2's API routes and the extension-side detection in Build #3 inherit the change. The extension package already cross-imports `src/lib/shared-types/competition-scraping.ts` for wire types, so the cross-package import isn't a new pattern. Reversible — the import can be inlined later if cross-package coupling proves awkward.
  - **(2)** Form UX is symmetric across both branches (same saved-URL picker + category + composition + embedded-text + tags + Save button); only the preview area + the network calls on Save differ. One entry-point for the user; the branch is invisible to them. Matches §A.7 single-table-per-media-type principle (CapturedVideo holds both source-types — sourceType discriminator on the row, not on the table). Director's drift-check approval at session start confirmed this default-to-recommendation pick.
  - **(3)** Rename keeps both branches sharing `platform: Platform` at the top level cleanly + lets TypeScript's discriminated-union narrowing work without an `as` cast or runtime check. Caught mid-build via TypeScript discriminated-union narrowing failure at first compile; fixed before any tests ran. The renamed field name `embedPlatform` is semantically clearer than `platform` for the embed case (avoids ambiguity with the W#2 site platform).

- **Impact on §A:** §A still holds. §A.2 implementation arc table row #4 is now ✅ COMPLETE 2026-05-21-b — Build #3 lands the extension content-script form + helper + validator + tests. The next-row Build session #4 begins popup paste form + saved-video indicator overlay per rows #5+#6 (the next-session forced-picker will decide whether to bundle rows #5+#6 into a single Build #4 vs. split). §A.7 schema spec is unchanged (Build #3 is extension-only — no schema edit). §A.9 bucket configuration + thumbnail extraction narrative is unchanged but is now LIVE in code — the canvas frame-grab thumbnail + §A.12 NULL-thumbnail fallback on canvas-taint SecurityError both ship in `video-capture-form.ts`. §A.10 size cap (100 MB) + §A.11 two-layer client + server enforcement are now LIVE on the client side too — the new `captured-video-validation.ts` validator enforces the DIRECT_BYTES MIME accept-list + 100 MB cap pre-upload, mirroring §A.11 layer 1 (the server-side layer 2 was shipped in Build #2's `requestUpload` route). §A.13 (test coverage approach — Hybrid per Rule 27) is further-along — the 41 new node:test cases on the new pure helpers (20 for `find-underlying-video-embed.ts` + 21 for `captured-video-validation.ts`) land in this Build; the content-script form itself + the orchestrator integration depend on DOM + browser APIs, so Playwright extension-context coverage arrives at Build #7 per §A.13. The shared-type interfaces + API routes shipped in Build #2 are LIVE consumers of Build #3's form — the form's Save flow fires `requestUpload` → PUT video + PUT thumbnail → `finalize`, matching `RequestVideoUploadRequest` + `FinalizeVideoUploadRequest` shapes exactly. The Build #1 `detectEmbedPlatform` helper is also a LIVE consumer of Build #3's `find-underlying-video-embed.ts` (composed import). Build #4 (next session) inherits these constraints: popup paste form is EMBED-only (pasted URLs are never DIRECT_BYTES); popup paste form reuses `captured-video-validation.ts` EMBED branch; saved-video indicator overlay scans via the GET .../videos route shipped in Build #2.

---

### §B 2026-05-21-c — `session_2026-05-21-c_p27-build-4-popup-paste-saved-video-indicator` — Build #4 mid-build judgment calls (single-form-mirrors-saved-text-shape / saved-video-icon-anchors-to-both-element-types / URL-equality-match-for-v1)

- **Director said:** approval to proceed implicit in the launch prompt + drift-check approval at session start (after the Rule 3 code-truth catch on the two mis-paraphrased sibling-reference-shape paths from the launch prompt — `CapturedUrlPasteForm.tsx` does NOT exist; `saved-image-indicator.ts` is actually `already-saved-image-icon.ts`). No mid-build directives — the 3 judgment calls below were all default-to-recommendation paths per `feedback_default_to_recommendation.md`.

- **Alternatives considered:**
  - **(1) Popup paste form shape — single-form-mirrors-saved-text vs. divergent shape.** Could (a) mirror `CapturedTextPasteForm.tsx` exactly (same input fields + same Save flow + same inline "+ Add new" vocab affordance; reuse `captured-video-validation.ts` EMBED branch; call `finalizeVideoUpload` API helper directly) OR (b) diverge from the sibling shape (custom field order; custom Save flow; bespoke validator) OR (c) combine the popup paste form with the content-script form into a single shared React component.
  - **(2) Saved-video-icon target-element shape.** The `already-saved-image-icon.ts` sibling anchors its overlay to `<img>` elements. Captured videos have TWO source-types (DIRECT_BYTES rows produce a real `<video>` element on the competitor page; EMBED rows produce an `<iframe>` element on the competitor page). Could (a) handle BOTH target element types in a single helper via a `SavedVideoTargetElement = HTMLVideoElement | HTMLIFrameElement` tagged union (one helper file; one icon class; one visual treatment) OR (b) ship two separate helpers (`already-saved-direct-video-icon.ts` for `<video>` + `already-saved-embed-video-icon.ts` for `<iframe>`; mirrors the sourceType split at the row level all the way down to the overlay helper) OR (c) handle only `<video>` in Build #4 + defer `<iframe>` overlay to a later Build.
  - **(3) Saved-video matching strategy — URL equality vs. canonicalized match.** The orchestrator scan needs to know which on-page `<video>` / `<iframe>` elements correspond to which saved CapturedVideo rows. Could (a) match by exact string equality of saved row's `originalSrcUrl` against `<video>.currentSrc` / `<video>.src` / `<iframe>.src` OR (b) canonicalize both sides (strip query params; normalize protocol; handle YouTube's `youtube.com/watch?v=ID` vs. `youtu.be/ID` vs. `youtube.com/embed/ID` variants; match on the canonical form) OR (c) ship a hybrid (try exact match first; fall back to canonicalized match for known multi-form platforms).

- **Decision:** (1) Single form mirrors `CapturedTextPasteForm.tsx` exactly. (2) Single helper handles BOTH target element types via tagged union. (3) Exact string equality for v1.

- **Reasoning:**
  - **(1)** Sibling consistency wins on maintainability — every existing W#2 popup form (`CapturedTextPasteForm.tsx`, the URL inline-add affordance) follows the same field order + Save flow + inline-add UX. The director already uses the text-paste form; a video-paste form that mirrors the shape exactly minimizes the mental switch when capturing video URLs (e.g., a copied YouTube URL from clipboard). Downstream sessions reading the new form's shape don't have to context-switch between text vs. video conventions. The combine-with-content-script-form option (c) was rejected — the content-script form runs in a different context (competitor page DOM) with different surface area (it has a right-click target + can capture DIRECT_BYTES); combining would muddle two distinct entry-point shapes.
  - **(2)** One helper for both branches matches the §A.7 single-table-per-media-type principle (CapturedVideo holds both source-types — sourceType discriminator on the row, not on the target element type). The icon class + visual treatment + anchor logic (position the badge at top-right corner of the bounding rect) is identical for both `<video>` and `<iframe>` targets; the only difference is which element type to scan for. Splitting into two helpers would duplicate the visual treatment + the positioning math + the cleanup logic. The "defer iframe overlay" option (c) was rejected — both source-types ship in Build #1's schema + Build #3's capture form, so the overlay must cover both at the same shipping milestone to keep the user-visible parity intact.
  - **(3)** On the same competitor page, the `<iframe>.src` is the SAME string the user right-clicked at capture time (the extension snapshots that string into `originalSrcUrl` at capture time per Build #3's `find-underlying-video-embed.ts`). Exact match is correct by construction for the same-page revisit case. If real-world use surfaces normalization mismatches (e.g., YouTube embed iframes that drift query params between visits, or canonical-URL variations), a future polish item adds a canonicalizer; the surface this would affect is small (the saved-video badge appearing or not appearing on a revisit) and reversible. Per `feedback_default_to_recommendation.md`, shipping the simplest correct-by-construction match for v1 wins; the canonicalizer can ride on a future polish item if real use surfaces a failure case.

- **Impact on §A:** §A still holds. §A.2 implementation arc table row #5 is now ✅ COMPLETE 2026-05-21-c — Build #4 lands the popup paste form. §A.2 implementation arc table row #6 is now ✅ HALF-COMPLETE 2026-05-21-c — Build #4 lands the saved-video indicator overlay (the FIRST half of row #6); the URL detail page renderer (the SECOND half of row #6) remains for Build #5. §A.7 schema spec is unchanged (Build #4 is extension-only — no schema edit). §A.9 bucket configuration + thumbnail extraction narrative is unchanged. §A.10 size cap + §A.11 two-layer client + server enforcement are unchanged (Build #4's popup paste form is EMBED-only — no size-cap enforcement needed since EMBED rows have no uploaded bytes). §A.13 (test coverage approach — Hybrid per Rule 27) is further-along — the 13 new node:test cases on the new `already-saved-video-icon.ts` helper land in this Build; the popup paste form + orchestrator overlay rendering depend on DOM + React + browser APIs, so Playwright extension-context coverage arrives at Build #7 per §A.13. The shared-type interfaces + API routes shipped in Build #2 are LIVE consumers of Build #4's popup form — the popup paste form's Save flow fires `finalizeVideoUpload` directly with EMBED branch (no `requestUpload` or `putVideo` PUTs since EMBED rows have no uploaded bytes), matching `FinalizeVideoUploadRequest` (EMBED variant) shape exactly. The GET .../videos route shipped in Build #2 is the LIVE consumer of Build #4's saved-video indicator scan — the orchestrator's `maybePopulateVideoCache` calls `listCapturedVideos(projectId, urlId)` once per URL change + caches the result for the duration of that URL view. Build #5 (next session) inherits these constraints: URL detail page renderer reads from the SAME GET .../videos route + extends it to a `WithUrls` variant that pre-mints signed URLs for DIRECT_BYTES rows (mirroring `CapturedImageWithUrls` slice a.2 staging pattern from the image sibling per §B 2026-05-21 entry's reasoning).

---

### §B 2026-05-21-d — `session_2026-05-21-d_p27-build-5-url-detail-page-renderer` — Build #5 mid-build judgment calls (API shape corrected at drift-check / renderer scope = minimal-viable / extension-side type-tightening matches new wire contract end-to-end)

- **Director said:** approval to proceed implicit in the launch prompt + drift-check approval at session start (responded "go") confirmed the corrected API shape after Claude flagged that the launch prompt's framing of the Rule 14f forced-picker was based on a misread of the image sibling's actual shape. Per `feedback_default_to_recommendation.md` standing rule (Rule 14f Default-to-recommendation exception), the picker was skipped and Claude proceeded with the corrected recommendation. No other mid-build directives — the 3 judgment calls below were all default-to-recommendation paths.

- **Alternatives considered:**
  - **(1) API shape for the new "list captured videos WITH signed URLs" endpoint.** The launch prompt framed this as a Rule 14f forced-picker between (A) `?withUrls=1` query param on the existing GET .../videos route (one route, two response shapes branching on the query param) vs. (B) sibling route at `.../videos/withUrls/` (two distinct routes, two distinct shapes; matches what the launch prompt asserted the image sibling does). Drift check caught that the actual image sibling chose NEITHER — `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/images/route.ts` (line 109) simply returns `CapturedImageWithUrls[]` from the existing GET endpoint; `ListCapturedImagesResponse = CapturedImageWithUrls[]` at `src/lib/shared-types/competition-scraping.ts:513`. The truest "mirror exactly" option is a third one: (C) upgrade the existing GET .../videos route's response shape from `CapturedVideo[]` to `CapturedVideoWithUrls[]` — no param, no sibling route. Build #2's §B 2026-05-21 entry already anticipated this: *"the list endpoint can grow `WithUrls` variant later when needed."*
  - **(2) Renderer scope.** The design doc §A.2 row #6 remainder names "URL detail page renderer for captured videos — inline `<iframe>` for embeds + inline `<video>` for direct MP4 + click-to-play overlay on thumbnails." Could (a) ship the renderer ONLY — no manual-add modal (like CapturedImagesGallery has via CapturedImageAddModal), no per-row delete dialog, no inline metadata editor (minimal-viable URL detail page section; mirrors §A.2 row #6 exactly + nothing more); OR (b) ship the renderer + the manual-add modal + the per-row delete dialog + the inline metadata editor at the same Build (full parity with the image gallery's current shipped surface); OR (c) ship the renderer + a subset of the add/delete/edit affordances based on a separate sub-picker.
  - **(3) Extension-side type-tightening.** The wire-shape upgrade from `CapturedVideo[]` to `CapturedVideoWithUrls[]` is structurally a superset; the extension's content-script saved-video indicator scan only reads `originalSrcUrl`, so the type tightening was optional at the runtime level. Could (a) keep extension return types as `CapturedVideo[]` (extension stays narrowly typed for its narrow consumer) OR (b) tighten to `CapturedVideoWithUrls[]` (matches the wire shape end-to-end; future extension code can use the new fields).

- **Decision:** (1) Upgrade the existing GET .../videos route's response shape directly from `CapturedVideo[]` to `CapturedVideoWithUrls[]` (option C — mirrors image sibling exactly). (2) Renderer only (option a — minimal-viable). (3) Tighten extension return types end-to-end (option b — match wire contract end-to-end).

- **Reasoning:**
  - **(1)** "Mirror exactly" wins on sibling consistency — keeps the codebase pattern clean; downstream sessions reading the routes don't have to context-switch between image vs video conventions. The launch prompt's A-vs-B picker shape was based on a misread of the image sibling; the actual pattern is the C option. Build #2's §B 2026-05-21 entry explicitly anticipated this staging — list endpoint grows the `WithUrls` shape when the consumer ships, which is exactly the current moment. The new shape is additive (strict superset of the prior shape) so existing consumers read the same fields they always read; new signed-URL fields are extra payload. Reversible — a future split could re-introduce a separate sibling endpoint if needed.
  - **(2)** Minimal-viable matches §A.2 row #6 exactly. The image gallery shipped its renderer first + then layered add/delete/edit affordances as separate polish slices over weeks of real-world use; following the same staging here matches the §A.2 implementation arc's intent. Click-to-play is provided natively by HTML5 `<video controls>` (browser shows poster + play button + standard transport controls) and by `<iframe>` (YouTube/Vimeo serve their own thumbnail + play affordance) — no custom click-to-play overlay component was needed. The add/delete/edit affordances are NOT load-bearing for Build #6 (the Playwright spec doesn't depend on them) or Build #7 (deploy ships the renderer as-is) or Build #8 (director real-Chrome verification walks through the renderer — add/delete/edit can land as polish items if the walkthrough surfaces the need). Reversible — the affordances can ride on follow-up polish sessions.
  - **(3)** Code is the ultimate source of truth (Rule 3) — the truth is that the wire returns `CapturedVideoWithUrls[]`, and the most honest type signature matches it. Future extension code can use the new fields without re-engineering the type chain. Runtime behavior is unchanged because the saved-video indicator scan reads only `originalSrcUrl`; the additional signed-URL fields are extra payload the scan ignores. The type-tightening cost was 4 small edits (one return-type annotation per file across `api-client.ts`, `content-script/api-bridge.ts`, `content-script/messaging.ts`, `content-script/orchestrator.ts`); the alternative would have created a wire-vs-extension type mismatch that would surface as a Rule 3 catch later.

- **Impact on §A:** §A still holds. §A.2 implementation arc table row #6 is now ✅ COMPLETE 2026-05-21-d — Build #5 lands the URL detail page renderer (the second half of row #6 that Build #4 left half-done) + signed-URL minting via the upgraded list endpoint. §A.7 schema spec is unchanged (Build #5 is pure code — no schema edit; the new `CapturedVideoWithUrls` interface is an additive shared-type that extends `CapturedVideo` with the two signed-URL fields). §A.9 bucket configuration + thumbnail extraction narrative is unchanged but now LIVE end-to-end on the consumption side — the URL detail page renderer reads the signed URLs minted by the upgraded list endpoint. §A.10 size cap + §A.11 two-layer client + server enforcement are unchanged. §A.12 NULL-thumbnail fallback is now LIVE on the renderer side too — the `<video controls poster={thumbnailUrl}>` renders without a poster when `thumbnailUrl` is null (default HTML5 behavior; the browser shows a black frame until playback starts). §A.13 (test coverage approach — Hybrid per Rule 27) is further-along on the consumption side but with ZERO new test files in this Build — the renderer is straight JSX with no extracted pure helpers worth testing; node:test coverage on the API route handler (which has a small amount of business logic: per-row signed-URL minting branching on `sourceType`) needs a Supabase mock harness that arrives at a later Build session per §A.13. The shared-type `CapturedVideoWithUrls` interface + the upgraded GET .../videos route are LIVE consumers of Build #1's `getVideoSignedUrl` + `getVideoThumbnailUrl` helpers (composed import). Build #6 (next session) inherits these constraints: single-platform amazon Playwright extension-context spec covering the right-click capture happy path + embed path + popup paste path per §A.2 row #7; specs land at `tests/playwright/extension/video-capture.spec.ts` + `tests/playwright/extension/video-capture-embed.spec.ts` + `tests/playwright/extension/video-paste-popup.spec.ts` + NEW fixture `tests/playwright/extension/amazon-video-product-page.html`.

---

### §B 2026-05-22 — `session_2026-05-22_p27-build-6-playwright-specs` — Build #6 mid-build judgment calls (DIRECT_BYTES thumbnail assertion strictness / embed-platform name capitalization / right-click capture-phase listener dispatch via Playwright `page.dispatchEvent`)

- **Director said:** approval to proceed implicit in the launch prompt; no mid-build directives. The 3 judgment calls below were all default-to-recommendation paths per `feedback_default_to_recommendation.md` standing rule (Rule 14f Default-to-recommendation exception). All decisions were within the §A.13 Hybrid test-coverage approach already frozen at design time (Q14 picker pick = Option A — Hybrid; node:test on pure helpers + Playwright extension-context spec on amazon happy path; cross-platform Playwright deferred to a P-22-style follow-up).

- **Alternatives considered:**
  - **(1) DIRECT_BYTES thumbnail assertion strictness.** The Phase 2b thumbnail PUT in the DIRECT_BYTES path depends on the canvas frame-grab in `video-capture-form.ts` reaching `readyState>=2` against the mocked video bytes in the headless Playwright environment. Could (a) strictly assert that Phase-2b thumbnail PUT fires + finalize includes `thumbnailStoragePath` (treats the headless environment as deterministic; spec hard-fails if Phase-2b doesn't fire) OR (b) treat Phase-2b as informational-only per §A.12 NULL-thumbnail fallback (the design doc already says save never fails because of thumbnail issues — `<video>` element may not reach readyState>=2 against mocked bytes; canvas frame-grab may legitimately return null; the spec must tolerate both paths) OR (c) ship two separate specs — one strict-assert + one lenient-assert — to cover both branches deterministically.
  - **(2) Embed-platform name capitalization assertion.** The form's source-kind banner reads `"Recognized as ${capitalize(embedPlatform)}"` per `video-capture-form.ts:182-184` — the `capitalize` helper uppercases just the first letter, so the helper's lowercase 'youtube' becomes 'Youtube' (single-capital, NOT 'YouTube' camel-case). Could (a) assert `toContainText('Recognized as Youtube')` matching the form's exact rendering (code-truth wins per Rule 3) OR (b) assert `toContainText('Recognized as YouTube')` matching branding convention (and ALSO fix the form's `capitalize` to be platform-specific so 'youtube' → 'YouTube' — pulling the form code update INTO Build #6's scope) OR (c) skip the banner assertion entirely (under-specifies the test surface).
  - **(3) Right-click capture-phase listener dispatch via Playwright `page.dispatchEvent`.** The image spec (`image-capture.spec.ts`) dispatches `open-image-capture-form` directly via SW→tab `chrome.tabs.sendMessage` with `srcUrl` in the message body — the image orchestrator at `orchestrator.ts:896` reads `msg.srcUrl || lastRightClickImageSrc || ''` so the SW→tab message can carry the src URL directly without requiring a real contextmenu event. The video orchestrator at line 927 ONLY reads `lastRightClickVideoResult` (no `msg.srcUrl` fallback), so the video spec MUST populate that snapshot via a real `contextmenu` event on the target BEFORE the SW→tab open message reads it. Could (a) dispatch a real `contextmenu` event via Playwright `page.dispatchEvent('#hero-video', 'contextmenu')` BEFORE the `serviceWorker.evaluate` chrome.tabs.sendMessage retry loop (mirrors the production right-click flow exactly; populates the capture-phase listener snapshot first; SW→tab open message reads the snapshot) OR (b) extend the video orchestrator's open-form message handler to accept a `videoResult` field in the message body paralleling the image orchestrator's `msg.srcUrl` fallback (extends production code to match the image spec's simpler pattern — but that's scope-add that this Build's task shape excludes) OR (c) inject `lastRightClickVideoResult` directly via `page.evaluate` (bypasses the production capture-phase listener — less faithful to the real right-click flow).

- **Decision:** (1) Option (b) — tolerate both paths per §A.12 NULL-thumbnail fallback; spec tracks `phase2ThumbnailFired` boolean; conditional Phase-2b assertion only when fired; conditional `thumbnailStoragePath` assertion on finalize (present iff Phase 2b fired). (2) Option (a) — code-truth wins; spec uses `toContainText('Recognized as Youtube')` matching the form's exact rendering. (3) Option (a) — `await page.dispatchEvent('#hero-video', 'contextmenu')` BEFORE the `serviceWorker.evaluate` chrome.tabs.sendMessage retry loop.

- **Reasoning:**
  - **(1)** §A.12 NULL-thumbnail fallback is the binding design — "save never fails because of thumbnail issues" — so the spec must tolerate both paths. Option (a) over-strict-asserts a behavior the design says is allowed to vary; if a future Chromium upgrade changes when `<video>` reaches `readyState>=2` against mocked bytes, the spec breaks for the wrong reason. Option (c) doubles the spec surface for a single behavior; the conditional pattern in option (b) is cleaner. Empirically Phase-2b DID fire in headless mode on this run (so the assertion path that runs is the "with thumbnail" path), but the spec stays correct if a future Chromium upgrade flips that behavior. Reversible — if real-world experience shows Phase-2b reliably fires, the spec can tighten in a future polish; if it shows Phase-2b reliably DOES NOT fire, the spec can flip the conditional to assert NULL.
  - **(2)** Rule 3 says code is the ultimate source of truth. The form code at `video-capture-form.ts:182-184` calls `capitalize(embedPlatform)` which is a first-letter-upper helper, not a platform-specific lookup. The form's rendering is "Recognized as Youtube" (single-capital). If the spec asserts 'YouTube' (camel-case) to match branding convention, the spec fails the very first run; that drives scope-add to fix the form's capitalize logic into Build #6, which violates the task shape (Build #6 is pure test code). The right scope-split is: ship the spec asserting the code's actual rendering ('Youtube') NOW; capture this as a future polish item if real-Chrome verification at Build #8 surfaces the branding concern; the form code + the spec assertion update in lockstep at that future polish. Captured for awareness in this entry; no in-Build scope-add. Reversible.
  - **(3)** Mirroring the production right-click flow exactly is the most-faithful path. Option (b) extends production code to match the image spec's simpler shape — but Build #6's task shape is "test code only" so that's out-of-scope; the test-code-side workaround (a real contextmenu dispatch) is cleaner than extending production code to match the test's preferred shape. Option (c) bypasses the production capture-phase listener entirely, which means the spec wouldn't catch a regression in that listener; option (a) exercises the production path end-to-end. Implementation: `await page.dispatchEvent('#hero-video', 'contextmenu')` populates `lastRightClickVideoResult` via the orchestrator's capture-phase listener (which is wired into `orchestrator.ts` as the contextmenu listener that snapshots `lastRightClickImageSrc` + `lastRightClickVideoResult` + `lastRightClickSelectorJson`); then the `serviceWorker.evaluate` retry loop sends `open-video-capture-form` which reads the populated snapshot. Documented in the spec file header comment so future maintainers don't try to "simplify" by removing the dispatch.

- **Impact on §A:** §A still holds. §A.2 implementation arc table row #7 is now ✅ COMPLETE 2026-05-22 — Build #6 lands the single-platform amazon Playwright extension-context specs covering all 3 capture gestures + the new Amazon-style fixture page. §A.7 schema spec is unchanged (Build #6 is pure test code — no schema edit). §A.9 bucket configuration + thumbnail extraction narrative is unchanged but is now COVERED by automated test on the DIRECT_BYTES path — the spec mocks Phase 1 requestUpload + Phase 2 PUT video bytes + Phase 2b PUT thumbnail JPEG (informational) + Phase 3 finalize and asserts each phase fires in the expected order with the expected payload shape. §A.10 size cap + §A.11 two-layer client + server enforcement are unchanged; not directly under test in Build #6's spec set (size-cap edge cases would land in a future spec slice if real-Chrome verification at Build #8 surfaces the need). §A.12 NULL-thumbnail fallback is now COVERED by the `phase2ThumbnailFired` conditional in the DIRECT_BYTES spec — the spec stays GREEN whether Phase 2b fires or not, matching the design's "save never blocked by thumbnail issues" intent. §A.13 (test coverage approach — Hybrid per Rule 27) is now ✅ COMPLETE on the Playwright side for single-platform amazon — all 3 capture gestures (right-click `<video>`, right-click `<iframe>`, popup paste) have extension-context spec coverage; cross-platform extension (ebay + etsy + walmart) remains deferred per §A.3 as a future P-22-style polish item; the Hybrid approach's node:test side was already complete after Builds #1 + #3 + #4 (helper-level pure-logic coverage). The shipped Build #1-#5 surface is now under automated test from the capture side; the consumption side (URL detail page renderer in `UrlDetailContent.tsx` from Build #5) is exercised only indirectly via the API route mocks in Build #6's specs (no separate spec slice for the renderer — the renderer is straight JSX with no extracted pure helpers worth testing; node:test coverage on the GET .../videos route handler — which has a small amount of business logic for per-row signed-URL minting branching on `sourceType` — needs a Supabase mock harness that arrives at a later polish session if surface complexity grows). Build #7 (next session) is the deploy session — `/deploy` orchestration per `.claude/commands/deploy.md` ships Builds #1-#6 to vklf.com; Build #8 is director's real-Chrome verification walkthrough on the live site.

---

### §B 2026-05-22-b — `session_2026-05-22-b_p27-build-7-deploy-and-verification-with-deferred-fixes` — Build #7 deploy + in-session director real-Chrome verification results + 6 verification failures captured for Build #8 fix-forward

- **Director said:** approval to proceed at Rule 9 deploy gate (option A "Proceed with deploy"); approval at post-deploy Rule 14f close-out picker (option B "Sideload + verify in this session first") which ran the verification walkthrough live in this session. Mid-walkthrough director surfaced 6 distinct bug observations across Amazon + Ebay + Walmart (Etsy passed all 4 surfaces perfectly). Director's framing at the fix-forward-vs-revert close-out picker: choice was fix-forward (Etsy surface stays shipped + visible; Build #8 attacks the bugs + redeploys). Per `feedback_default_to_recommendation.md` standing rule, no other forced-pickers needed during the deploy + verification walkthrough — all 3 judgment calls below were default-to-recommendation paths within the in-session verification arc.

- **Alternatives considered:**
  - **(1) Verification-in-session vs. defer-to-next-session.** At the Rule 14f close-out picker after `npm run zip` succeeded + the fresh zip landed at repo root, director could (a) sideload the new zip + walk verification live in this session window (gives Claude direct access to the bug observations in the same diagnostic window; tradeoff is the session runs long), OR (b) defer to next session (director sideloads + walks verification offline between sessions; next session collects the PASS/FAIL results as its first task; tradeoff is bug observations have to be captured in director's own words rather than at maximum-fidelity in-session). The 2026-05-21 Build #30 P-18 verification was deferred per the Codespaces-rebuild coupling discovery (rebuild kills the running session); Build #7 has no such coupling so option (a) is open.
  - **(2) Fix-forward vs. revert (post-verification-failure decision).** Once the 6 bugs surfaced on Amazon + Ebay + Walmart, the close-out picker became (a) fix-forward (Etsy surface stays shipped + visible to director on vklf.com; Build #8 attacks the 6 bugs + redeploys + re-walks verification) OR (b) revert (ff-revert main back to `a754aee` to remove the new captured-videos surface from vklf.com entirely; lose director-visible work on Etsy; create wasteful revert-then-re-deploy churn cycle when fixes ship). The bugs are platform-specific (no cross-platform corruption risk); the data side is clean (no bad rows accumulating); the user-visible side on Etsy works perfectly; revert would be an over-reaction.
  - **(3) Diagnostic order for Build #8.** Could attack the 6 bugs in (a) priority order (worst-impact first — e.g., Ebay no-form-opens since Ebay is fully broken on the right-click path), (b) shared-root-cause-first order (start with the SHARED hover-preview bug since fixing #9 likely fixes #14a in lockstep — maximum leverage per fix), (c) easiest-first order (start with the narrowest fix paths to build momentum), (d) random order (no shared planning).

- **Decision:** (1) Option (a) — verification-in-session. (2) Option (a) — fix-forward. (3) Option (b) — shared-root-cause-first order.

- **Reasoning:**
  - **(1)** Direct access to bug observations in the same diagnostic window is the most-thorough path per `feedback_recommendation_style.md`. The session window gives Claude live access to the bug-observation context (which platform was open + what surface was clicked + what error string appeared + what the browser DevTools showed), versus relying on a between-session director-written bug report that would have to be reconstructed in the next session. Reversible — if mid-verification it had become clear the bugs were catastrophic + a fast revert was needed, the picker could have been re-fired to flip to defer.
  - **(2)** Etsy passes all 4 surfaces. The captured-videos feature works correctly for Etsy users on vklf.com today. The 6 failures are platform-specific (Amazon + Ebay + Walmart) and surface-specific (specific gesture / specific category-input affordance / specific Save flow); no data corruption risk; no schema delta to roll back. Reverting would be over-engineered for "some platforms have bugs"; the canonical pattern in deploy-and-verification arcs (P-15 + P-22 + P-24 + many others) is fix-forward when the bugs are scoped + non-corruption. Build #8 attacks the 6 bugs + redeploys; the lifecycle is unchanged.
  - **(3)** Shared-root-cause-first order maximizes leverage per fix. Bugs #9 (Amazon-A hover-preview) + #14a (Walmart-A hover-preview) share the SAME symptom (hover-preview right-click does NOTHING); strong evidence of shared root cause in `orchestrator.ts:927` (`lastRightClickVideoResult` snapshot path) OR `find-underlying-video-embed.ts` (DOM walker recognition). Fixing the shared root cause likely fixes 2 bugs at once. If after the fix lands the Walmart-A bug persists, the shared-cause hypothesis is falsified + #14a needs separate diagnosis — but the cheap test is to do it in this order. Next-priority fixes (Ebay no-form-opens #13 since it's the simplest "no surface at all" failure with clear isolation paths in DevTools; Amazon-B3 cross-platform Save #12 since the error string already points to the exact line of `mapFetchTransportError`; in-form thumbnail #10 + #14b shared; "Add new category" input dead #11 since it's the most isolated) follow naturally.

- **Verification walkthrough results (per surface × per platform):**

  | Surface | Etsy | Amazon | Ebay | Walmart |
  |---|---|---|---|---|
  | Right-click hover-preview video capture | ✅ PASS | ❌ #9 — does NOTHING | (no hover-preview tested) | ❌ #14a — does NOTHING (SHARED with #9) |
  | Right-click playing-video capture | ✅ PASS | ❌ #10 — form opens but thumbnail does NOT render | (deferred to Build #8) | ❌ #14b — Save SUCCEEDS but thumbnail does NOT render (SHARED partial with #10) |
  | Right-click → "Add new video category" dropdown input | ✅ PASS | ❌ #11 — input does NOT accept typed chars | (deferred to Build #8) | (deferred to Build #8) |
  | Right-click → existing-category-created-on-another-platform Save | ✅ PASS | ❌ #12 — "Network unreachable" exact error string | (deferred to Build #8) | (deferred to Build #8) |
  | Right-click on a `<video>` or `<iframe>` (no form opens at all) | ✅ PASS | (covered by #9 / #10 above) | ❌ #13 — no form overlay opens at all | (no separate test — covered by #14a + #14b) |
  | Popup paste flow | ✅ PASS | (not tested this session) | (not tested this session) | (not tested this session) |
  | URL detail page Captured Videos gallery render | ✅ PASS | (not tested this session — blocked by capture-side bugs) | (not tested this session) | ✅ PASS |
  | Saved-video green ✓ overlay on revisit | ✅ PASS | (not tested this session — blocked by capture-side bugs) | (not tested this session) | ✅ PASS |

- **Six bug observations with diagnostic next-steps:**

  - **#9 Amazon-A hover-preview class (SHARED with #14a Walmart-A).** Symptom: mouse hover on a product-image video shows the preview; right-click on the preview + "Add to PLOS — Captured Video" → NOTHING (no form, no toast, no error). Hypothesis: Amazon's hover-preview renders into a transient/overlay DOM the orchestrator's `lastRightClickVideoResult` snapshot doesn't catch (the capture-phase contextmenu listener may not fire on the preview overlay element), OR catches but `find-underlying-video-embed.ts` walker doesn't recognize the preview element shape. **Starting point for Build #8:** `extensions/competition-scraping/src/lib/content-script/orchestrator.ts:927` (the `lastRightClickVideoResult` snapshot path) + `extensions/competition-scraping/src/lib/content-script/find-underlying-video-embed.ts` (the DOM walker — verify it recognizes Amazon's preview-overlay video element). Strong shared-cause hypothesis with #14a.

  - **#10 Amazon-B1 in-form thumbnail render (SHARED partial with #14b Walmart-B).** Symptom: click preview → video plays → right-click → "Capture Video" → form opens but the in-form video preview thumbnail does NOT render (empty area or broken-image placeholder). Hypothesis: canvas frame-grab against playing `<video>` fails — either `readyState<2` at the moment of capture, OR the `<video>` element's bytes are CORS-tainted from Amazon's CDN so `getImageData` throws SecurityError per §A.12. **Starting point for Build #8:** `extensions/competition-scraping/src/lib/content-script/video-capture-form.ts` (the canvas frame-grab block — confirm §A.12 NULL-thumbnail fallback is firing for SecurityError; if so, the form should still render with a black thumbnail placeholder OR the empty area; if the form area is silent, the fallback may not be firing OR the rendering may not be handling the NULL case correctly). Walmart-B shares the partial-thumbnail symptom (#14b) but Walmart's Save path SUCCEEDS (unlike Amazon-B3 #12); the thumbnail issue is shared, the Save side is not.

  - **#11 Amazon-B2 "Add new video category" input dead.** Symptom: dropdown choice 'Add new video category' opens the inline text input but typed characters do NOT appear (no chars visible in the input). Hypothesis: input event handler not wired up, OR a keydown stopPropagation upstream is blocking type events, OR the input is rendered with `disabled`/`readonly` accidentally. **Starting point for Build #8:** `extensions/competition-scraping/src/lib/content-script/video-capture-form.ts` (the inline "+ Add new category" affordance — find the dynamic input element + verify its event wiring; cross-check against the working sibling pattern in `image-capture-form.ts` since that one works fine for image categories — the video form was authored to mirror the image form's pattern per Build #3's §B 2026-05-21-b judgment call #1, so the divergence is likely an event-wiring oversight).

  - **#12 Amazon-B3 cross-platform category Save fails with exact error string.** Symptom: existing video category CREATED ON ANOTHER PLATFORM (e.g., a category created during Etsy testing) is chosen + Save is clicked → request fails with the exact error string `Couldn't save (network): Network unreachable — check your connection.` Hypothesis: this exact string comes from `extensions/competition-scraping/src/lib/api-client.ts:100` `mapFetchTransportError` which converts a `TypeError` from native `fetch()` into `PlosApiError(0, 'Network unreachable — check your connection.')`. So the underlying fetch threw a TypeError — likely a CORS preflight failure OR a body-serialization issue OR a malformed URL specific to the cross-platform category path. **Etsy works for the same flow** which proves the CORS host_permissions in `wxt.config.ts` cover the basic API path; this is Amazon-specific. **Starting point for Build #8:** `extensions/competition-scraping/src/lib/api-client.ts:100` (`mapFetchTransportError` — the error origin) + the call sites (`finalizeVideoUpload` for the EMBED branch on the form) + the `fetch` URL construction for the call. DevTools Network tab on a reproduction reveals whether the preflight or the actual POST failed; that diagnosis is the first 30 seconds of Build #8.

  - **#13 Ebay no form opens.** Symptom: right-click on a video → "Capture Video" → NO form overlay opens at all. `extensions/competition-scraping/src/entrypoints/content.ts:17` confirms `https://*.ebay.com/*` IS in `defineContentScript.matches` so the content script DOES load. The failure is somewhere deeper. Hypotheses (test in order): (a) orchestrator's right-click capture-phase listener doesn't register on Ebay-platform pages (the `init` path may bail early on Ebay because of a platform-detection gate — verify in `orchestrator.ts`); (b) `find-underlying-video-embed.ts` returns `kind='none'` for Ebay's video DOM patterns (the walker may not recognize Ebay's `<video>` or `<iframe>` shapes — test by right-clicking + inspecting `lastRightClickVideoResult` in DevTools); (c) the SW→tab message bridge `open-video-capture-form` doesn't route on Ebay tabs (background.ts dispatcher — test by adding a console.log + reproducing). **Starting point for Build #8:** open DevTools on an Ebay video page + reproduce the right-click + check console for any errors or absences. The systematic way to isolate is to set a breakpoint in `orchestrator.ts`'s contextmenu listener + see whether it even fires on Ebay. **This is the most "no surface at all" bug of the 6** and likely the cleanest fix once the root layer is identified.

  - **#14 Walmart partial: hover-preview class (SHARED with #9) + playing-video thumbnail (SHARED partial with #10).** Two issues, captured AFTER director walked Walmart in-session as a courtesy after Amazon + Ebay verification surfaced their failures. **(a)** Same hover-preview class as Amazon-A (#9) — right-clicking the hover-preview video does NOTHING. Strong evidence of shared root cause with Amazon-A; fixing #9 likely fixes #14a. **(b)** Walmart's playing-video right-click DOES save successfully (the Save path works — unlike Amazon-B3 #12), BUT the in-form thumbnail does NOT render properly (similar to Amazon-B1 #10 but Save still succeeds whereas Amazon-B1 doesn't reach Save). Other Walmart tests passed: URL detail page Captured Videos gallery renders correctly + saved-video green ✓ overlay appears on saved videos. **So Walmart is partially working** — the fix-forward needs to address the hover-preview class + the thumbnail rendering, but Walmart's network + Save path are fine. Walmart's full re-walkthrough (including new captures + saved-video badges + gallery on a separate Walmart competitor URL) is deferred to Build #8's post-fix verification.

- **Impact on §A:** §A still holds. §A.2 implementation arc table row #8 is now ✅ COMPLETE 2026-05-22-b — Build #7 ships Builds #1-#6 to vklf.com via ff-merge to main. §A.2 implementation arc table row #9 (director real-Chrome verification walkthrough) is now PARTIAL — Etsy verified PASS; Amazon + Ebay + Walmart 6 failures captured for Build #8 fix-forward + re-verify. §A.7 schema spec is unchanged (Build #7 is pure deploy of pre-classified-additive Builds #1-#6 changes; no schema delta at deploy time). §A.9 bucket configuration + thumbnail extraction narrative is unchanged; the §A.12 NULL-thumbnail fallback may need to be cross-checked at Build #8 for the Amazon-B1 + Walmart-B in-form thumbnail render failures (the fallback should fire but the rendering may not handle NULL correctly). §A.10 size cap + §A.11 two-layer client + server enforcement are unchanged (no size-cap-related failures observed). §A.12 NULL-thumbnail fallback is the load-bearing design behind Bug #10 + #14b diagnosis. §A.13 (test coverage approach — Hybrid per Rule 27) is validated by this verification arc — the automated layer (94 Playwright + 482 ext + 589 src/lib) caught zero of the 6 platform-specific DOM-quirk bugs; the director-walkthrough layer caught all 6. This is exactly the design intent: automated covers contract-shape + happy-path; director-walkthrough covers platform-DOM-quirks-that-fixtures-can't-model. The fix-forward order picked in this entry (shared-root-cause-first) is the next-session task. Build #8 inherits these constraints: no schema delta expected; fixes are extension-side runtime + content-script DOM behavior + fetch-transport-error edge cases; Build #8 re-deploys after fixes + director re-walks verification including Walmart's full walkthrough.

---

### §B 2026-05-21 — `session_2026-05-21_p27-build-8-fix-forward-polish-with-deferred-bugs-11-12` — Build #8 fix-forward polish + in-session re-verification + 2 unfixed bugs deferred to Build #9 + 1 new Ebay-quirk bug captured

- **Director said:**
  - Approval to proceed at Rule 9 deploy gate (option 1 "Yes — proceed with deploy (recommended)").
  - 4 specific real-Chrome re-verification findings:
    - *"On Amazon, none of the issues were fixed"* — clarified during the walkthrough to mean Bug #11 + Bug #12 specifically still fail while Bug #9 surfaces the defensive toast (so the toast IS the surface improvement, but the underlying capture still fails).
    - *"On ebay, when a video preview is right clicked and save is attempted, I get the error 'Couldn't save (network): Network unreachable (Failed to fetch) — check your connection.'"* — confirms Bug #12 has spread from Amazon-only to Amazon + Ebay; the new diagnostic parens text from `mapFetchTransportError` is surfacing the underlying browser-level "Failed to fetch" string.
    - *"Also on ebay, when the actual video is right clicked, no options appear. It only says 'mute' which gives the option to mute the video."* — captured as NEW Bug #15 (Ebay native-controls quirk; known Chrome behavior where the native HTML5 video controls menu suppresses extension context-menu entries).
    - *"Walmart video save works fine."* — confirms Bug #14a + #14b both cleared by Build #8's walker improvements + thumbnail render path.
  - At the §4 Step 1c close-out picker, no forced picker fired — natural-continuation pattern; next session is Build #9 DevTools-cooperative debugging session by default-to-recommendation per `feedback_default_to_recommendation.md`.

- **Alternatives considered:**
  - **(1) Ship the 5 fixes vs. revert vs. defer.** Pre-deploy, the picker shape was (a) ship — Build #8's 5 fixes target 5 of the 6 Build #7 bugs (Bug #14a + #14b + #13 + #12 + the defensive UX for #9) and the build was clean; (b) revert — undo Build #7's deploy + reset main back to `a754aee` and ship no P-27 surface to users until Build #8 fixes are surer; (c) defer — leave Build #7's deploy live + defer Build #8's fixes to a longer Build #9 once we have DevTools-cooperative diagnosis for the harder bugs (#11 + #12). Per §4 Step 1c default-to-recommendation, ship won — director chose ship at the Rule 9 picker. Reversible: if the re-verification surfaced catastrophic regressions, a fast revert was still available.
  - **(2) Pure-fix vs. hardening-with-fallback for the bugs where the root cause was unclear from code reading alone.** For Bug #9 (Amazon hover-preview walker fails) + Bug #10 (in-form thumbnail render fail) + Bug #11 ("Add new" input dead), reading the code alone couldn't tell us WHY the symptoms occurred — the orchestrator + walker + form code all looked correct in isolation. Options: (a) pure-fix attempt based on best-guess hypotheses (risk: ship code that misses the actual root cause + adds dead-code surface); (b) hardening-with-fallback (ship defensive UX layers that catch surface-level user impact even when root cause isn't exact-fixed — visible toast for #9 instead of silent fail; placeholder block for #10 instead of broken-image; robust focus retry + key-event stopPropagation for #11 in case it was a focus or event-bubble issue); (c) defer entirely until DevTools-cooperative diagnosis. Picked (b) — hardening-with-fallback. For Bug #13 (Ebay no form opens), code reading DID identify the root cause (Ebay's `<video>` has empty currentSrc/src but populated `<source src>` children that the walker wasn't reading) — chose pure-fix for #13.
  - **(3) Retry-on-TypeError for Bug #12 — safe vs. unsafe.** Wrapping `makeAuthedFetch`'s initial fetch in a one-shot retry-on-TypeError helper would retry once when the underlying browser-level fetch throws "Failed to fetch" (the TypeError that surfaces as Bug #12). Options: (a) safe retry — verify that all retry-eligible routes dedupe on the server side so a duplicate request is harmless (videos/finalize dedupes on clientId per Build #2 schema; images/finalize dedupes on clientId; texts dedupes on clientId — all confirmed safe); ship the retry helper covering all routes through `makeAuthedFetch`; (b) unsafe retry — ship the retry without confirming idempotency (risk: a duplicate POST that creates 2 rows on a route that doesn't dedupe); (c) don't retry — fall through to the existing error path. Picked (a) — safe retry, after confirming the dedupe pattern. **Outcome:** retry-on-TypeError did NOT clear Bug #12 in practice (both retries hit the same TypeError); the helper still ships as a safety net for future transient transport errors that might arise on Vercel cold-starts or brief CORS hiccups; not dead code.

- **Decision:**
  1. Ship all 5 fixes in commit `a47a95f`.
  2. Deploy to vklf.com via ff-merge to main + Vercel auto-redeploy + fresh extension zip + ping-pong sync.
  3. Director re-walks verification in-session (option B per Rule 14f close-out picker, mirroring Build #7's pattern).
  4. Capture the 2 unfixed bugs (#11 + #12) + the 1 new bug (#15) + the 1 deeper-diagnosis (#9 hover-preview walker still fails despite improvements) as DEFERRED items for Build #9 DevTools-cooperative debugging session.

- **Reasoning:**
  - **(1) Hardening-with-fallback caught the surface-level user impact** for 3 of the 4 hardening targets — Walmart's hover-preview (#14a SHARED with #9) cleared via the stacked-elements walker fallback; Ebay's no-form-opens (#13) cleared via the `<source src>` fallback path; Amazon's silent-fail (#9) replaced by a visible toast users can act on. The remaining hardening target (#11 input dead) didn't clear, which is the kind of partial-result hardening is supposed to handle gracefully — we still ship the harder defensive paths (focus retry + key-event stopPropagation) which may help future symptoms, AND we have a clear DevTools-cooperative diagnosis path for Build #9 instead of guessing.
  - **(2) The defensive UX layer ships its first user benefit** — `capture-failure-toast.ts` provides visible feedback for any future capture failure across any platform, not just Amazon hover-preview. It's a 70-line file + a single call site in the orchestrator that pays dividends every time a walker bails. Reversible (the toast can be tuned or removed later) + zero data risk (pure UX).
  - **(3) The 5-second `<video>` loadedmetadata/error timeout + the styled placeholder block** in `video-capture-form.ts` (`showPreviewUnavailable()`) makes the form behave gracefully when the preview video can't render — instead of a broken player area, the user sees "▶ Video preview unavailable — Save will still try to capture the file." which sets expectations correctly. The `crossOrigin='anonymous'` on the preview video may also surface CORS-clean bytes for the canvas frame-grab on platforms where the bytes are servable that way.
  - **(4) The improved `mapFetchTransportError` diagnostic message** — surfacing the underlying TypeError.message in parens (e.g., "Network unreachable (Failed to fetch) — check your connection.") — gave director enough information to confirm Bug #12 is a "Failed to fetch" browser-level error, which narrows the DevTools investigation in Build #9 (it's CORS preflight or generic network, not a malformed URL or body-serialization issue at the JavaScript layer).
  - **(5) The DevTools-cooperative diagnostic order for Build #9** (Bug #12 first since it affects 2 platforms; #11 second since it's the most isolated; #9 third since the new toast surfaces clear feedback; #15 fourth as UX recovery since it's a known Chrome quirk) maximizes information leverage per diagnostic step. Each diagnostic yields concrete fix paths or a clear "this is the limitation; design around it" conclusion.

- **Build #8 verification results table (re-verification by surface × platform):**

  | Surface | Etsy | Amazon | Ebay | Walmart |
  |---|---|---|---|---|
  | Right-click hover-preview video capture | ✅ PASS | ⚠️ Toast appears, no form (Bug #9 defensive UX shipped) | (not tested separately) | ✅ PASS (Bug #14a cleared) |
  | Right-click playing-video capture (click-into-overlay) | ✅ PASS | ✅ PASS (no regression) | ✅ Form NOW OPENS (Bug #13 cleared by `<source src>` fallback) | ✅ PASS |
  | Right-click → "Add new video category" dropdown input | ✅ PASS | ❌ Still dead (Bug #11 unfixed) | (deferred to Build #9) | (deferred to Build #9) |
  | Save flow on existing/new category | ✅ PASS | ❌ "Network unreachable (Failed to fetch)" (Bug #12 unfixed) | ❌ "Network unreachable (Failed to fetch)" (Bug #12 SPREAD to Ebay) | ✅ PASS (Bug #14b thumbnail render path cleared) |
  | Right-click on video controls strip | (not tested) | (not tested) | ⚠️ NEW Bug #15 — Chrome's "Mute" menu only | (not tested) |
  | Popup paste flow | ✅ PASS | (not tested this session) | (not tested this session) | (not tested this session) |
  | URL detail page Captured Videos gallery render | ✅ PASS | (not tested this session) | (not tested this session) | ✅ PASS |
  | Saved-video green ✓ overlay on revisit | ✅ PASS | (not tested this session) | (not tested this session) | ✅ PASS |

- **Six original bug observations updated with Build #8 outcome + NEW Bug #15 captured:**

  - **#9 Amazon-A hover-preview class.** Build #7 status: silent fail. Build #8 status: ⚠️ **toast appears but no form** — the new `capture-failure-toast.ts` defensive UX shipped surface-level feedback; the underlying walker improvements (stacked-elements fallback via `document.elementsFromPoint` + `<source src>` fallback) helped on Walmart (#14a cleared) but did NOT help on Amazon. Hypothesis carried forward to Build #9: Amazon's hover-preview video lives inside a cross-origin iframe whose contents can't be traversed from the main frame's content script. DevTools-cooperative diagnostic starting point: right-click the Amazon hover preview → DevTools Elements tab → check whether the target element is inside an `<iframe>` + whether the iframe's `src` is cross-origin to the main page. If cross-origin iframe confirmed, the fix requires either in-iframe content-script injection (manifest + permissions changes) or accepting the limitation + improving the toast copy.

  - **#10 Amazon-B1 in-form thumbnail render.** Build #7 status: empty thumbnail. Build #8 status: ⚠️ **the click-into-overlay path now opens the form correctly** with the new `showPreviewUnavailable()` placeholder block when the preview video can't render. Bug #10's symptom in Build #7 was a broken/empty thumbnail; in Build #8 the placeholder shows "▶ Video preview unavailable — Save will still try to capture the file." which sets correct user expectations. This is NOT a "cleared" bug but a transformed bug — the underlying canvas frame-grab against Amazon's hero player may still fail for the same reasons (CORS-tainted bytes / `readyState<2` at capture); the user-facing surface is improved but the bytes-side problem persists. The §A.12 NULL-thumbnail fallback IS firing as designed (Save still works) so this bug is partially closed at the user-impact level.

  - **#11 Amazon-B2 "Add new video category" input dead.** Build #7 status: input dead. Build #8 status: ❌ **STILL DEAD** despite the new `focusNewCategoryInput()` retry path + key-event stopPropagation guards on the input. The defensive hardening did NOT clear the symptom; needs DevTools-cooperative diagnosis. DEFERRED to Build #9 as TaskList #10.

  - **#12 Amazon-B3 cross-platform Save fails with "Network unreachable".** Build #7 status: Amazon only. Build #8 status: ❌ **NOW REPRODUCES ON AMAZON AND EBAY** + the new `retryOnTransportError(op, delayMs=250)` helper did NOT clear it (both retries hit the same TypeError). The improved error message surfaces the underlying browser-level "Failed to fetch" string in parens — confirming the failure is a generic CORS / network error, not a JavaScript-layer error. The spread to Ebay suggests this is NOT a platform-specific issue but a CORS-related failure mode that surfaces on whatever pages Ebay + Amazon happen to serve from. Etsy works for the same flow, which still proves CORS host_permissions cover the basic path. DEFERRED to Build #9 as TaskList #11.

  - **#13 Ebay no form opens.** Build #7 status: no form opens at all. Build #8 status: ✅ **CLEARED** by the `<source src>` fallback in `find-underlying-video-embed.ts` — Ebay's `<video>` elements have empty `currentSrc`/`src` but populated `<source>` children; the walker now reads from `<source src>` when both video.currentSrc + src are empty + accepts such `<video>` elements as usable. Form now opens correctly on Ebay video preview right-click.

  - **#14a Walmart hover-preview (SHARED with #9).** Build #7 status: silent fail. Build #8 status: ✅ **CLEARED** by the stacked-elements walker fallback — `document.elementsFromPoint(clickX, clickY)` returns Walmart's hover-preview overlay video element which the original ancestor-walk missed; the walker now finds it via the fallback path.

  - **#14b Walmart playing-video thumbnail (SHARED partial with #10).** Build #7 status: thumbnail does not render properly. Build #8 status: ✅ **CLEARED** by the new `showPreviewUnavailable()` placeholder block + the `crossOrigin='anonymous'` preview video + the 5-second timeout-or-error fallback — Walmart's form now renders correctly + Save still succeeds (which it did in Build #7 too).

  - **#15 NEW Bug — Ebay native-controls quirk.** Symptom: right-click directly on Ebay's video controls strip (the bottom progress-bar area) shows ONLY Chrome's native "Mute" / "Show controls" menu instead of our extension's "Add to PLOS" entries. Hypothesis: known Chrome quirk where the native HTML5 video element's built-in controls overlay suppresses extension context-menu entries when the right-click target is the controls. The user CAN right-click above the controls strip on the video frame itself + the form opens correctly (Bug #13's clearance covers that path). The controls-strip case is a UX edge that needs a different recovery approach. DEFERRED to Build #9 as TaskList #12.

- **Impact on §A:**
  - **§A still holds.** §A.2 implementation arc table row #9 (director real-Chrome verification walkthrough) PROGRESSES from "PARTIAL" (Build #7 baseline — Etsy PASS only) to **PARTIAL+** (Build #8 — Etsy + Walmart now full pass; Ebay form-opens clean; Amazon click-into-overlay form-opens clean; Bug #11 + #12 unfixed; new Bug #15 captured; Bug #9 deeper-diagnosis needed). The row will close fully when Build #9's diagnoses ship + the 2 stubborn bugs + the 1 new bug are addressed.
  - **§A.7 schema spec is unchanged** (Build #8 is pure extension-side runtime + content-script DOM + fetch transport-error edge-case fixes; no schema delta).
  - **§A.9 bucket configuration + thumbnail extraction narrative is unchanged.** The §A.12 NULL-thumbnail fallback is now further-validated — Build #8's `showPreviewUnavailable()` ships the user-facing fallback (the placeholder block) which matches §A.12's "save never fails because of thumbnail issues" intent at the UX layer.
  - **§A.10 size cap + §A.11 two-layer client + server enforcement are unchanged.**
  - **§A.13 (test coverage approach — Hybrid per Rule 27) is further-validated** by this re-verification arc — the automated layer (94 Playwright + 495 ext + 589 src/lib all GREEN) caught zero of the 4 remaining bugs in Build #8 (just like it caught zero of the 6 in Build #7); the director-walkthrough layer is the canonical surface for these platform-DOM-quirk + native-Chrome-menu + cross-origin-iframe bugs. This is exactly the design intent; the Hybrid model continues working as designed. Build #9 EXTENDS the Hybrid model to include DevTools-cooperative debugging as a third coverage layer (Claude narrates one diagnostic step + director reports live + the captured findings inform the fix design) — this is not a rule change, just an explicit acknowledgment that for bugs the automated + walkthrough layers can't fix, DevTools cooperation is the natural next step.
  - **Build #9 inherits these constraints:** no schema delta expected; 4 DEFERRED targets (Bug #11 input dead + Bug #12 Save fails Network unreachable on Amazon + Ebay + Bug #9 Amazon hover-preview walker deeper-walk + Bug #15 Ebay native-controls quirk); DevTools-cooperative diagnosis shape (Claude narrates + director reports); Rule 9 trigger CONDITIONAL (only if Build #9 ships fixes); if Build #9 is purely diagnostic, fixes ship in Build #10.

---

### §B 2026-05-22 — `session_2026-05-22-c_p27-build-9-devtools-diagnosis-and-p45-screen-recording-pivot` — Build #9 DevTools-cooperative diagnosis session SHIPPED Bug #12 ROOT-CAUSE DIAGNOSIS + DESIGN PIVOT to NEW polish item P-45 screen-recording video capture

- **Director said:**
  - Approved the Rule 27 picker recommendation (manual DevTools walkthrough only — Playwright cannot reproduce blob-URL behavior on real Amazon/Ebay pages).
  - Reported the failing-Save service-worker DevTools evidence verbatim: *"⚙ blob:https://www.amazon.com/2d3c9be4-4b14-42bb-aebc-5361f7ef2b5b (failed) net::ERR_FILE_NOT_FOUND fetch background.js:24"* — the decisive diagnostic captured live in-session.
  - At the fix-direction picker, used the escape hatch with a question: *"Is there a way to do a screen recording of the video by first selecting the part of the screen that the recording should focus on and then play the video and then record the screen video and audio and then save that recorded part?"* — surfaced a new architectural direction that obsoletes the 3 short-term-fix options for the blob: URL class.
  - At the sequencing picker, chose **"Skip the short-term fix — design screen recording properly NOW"** — accepting that Amazon/Ebay saves remain broken on the live site for the next 2-3 implementation sessions in exchange for not throwing away short-term-fix work.
  - At each of the 7 P-45 design questions, chose the recommended option (region = draw rectangle; audio = always-on; duration cap = ~2-3 min with countdown; API = getDisplayMedia; trigger = right-click menu adds "Record video" item; existing fast-fetch path = kept alongside recording; flow order = record then form).
  - At the lower-priority design batch, chose "default to your recommendations and proceed" — Claude defaults locked for codec/quality, cancel-dialog UX, in-progress indicator, tab-close handling, schema enum delta.

- **Alternatives considered:**

  **(1) Bug #12 fix direction — 3 short-term options + 1 architectural pivot.** The Bug #12 DevTools diagnosis revealed the root cause: Amazon (+ Ebay + Walmart + every MSE-player site) serves videos via Media Source Extensions where `<video>.currentSrc` is a `blob:` URL scoped to the page's document context. The background service worker's `fetchVideoBytes(blob:...)` always fails with `net::ERR_FILE_NOT_FOUND` because blob URLs don't resolve outside their creating context. Build #8's `retryOnTransportError` helper couldn't have cleared this in principle — both retries hit the same context-boundary failure. Options surfaced:
    - (a) **Snapshot save** — detect `blob:` in walker → force EMBED with thumbnail + page URL + metadata; no video bytes saved but user sees something useful. Scope: ~50-100 LOC. Trade-off: not a playable video, but a save success.
    - (b) **Real bytes via content-script fetch** — fetch bytes in content script (where blob URLs are valid) → transfer ArrayBuffer to background. Scope: ~200-300 LOC. Trade-off: works for SOME blob videos; many MSE players use chunked loading where there's no single fetchable blob; chrome.runtime message size cap ~64 MB vs our 100 MB video cap.
    - (c) **Block with clear error** — detect blob: → short-circuit before form opens → show capture-failure-toast with explanation. Scope: ~20-30 LOC. Trade-off: cleanest code; Amazon/Ebay captures become impossible.
    - (d) **Architectural pivot to screen recording** — director's question surfaced this as a 4th direction not in Claude's original picker. Records the visible tab region via `getDisplayMedia` + `MediaRecorder` regardless of how the source page serves video bytes. Universal solution. Scope: 2-3 implementation sessions (significantly reduced from the initial 3-5 estimate after Rule 24 search revealed existing region-screenshot infrastructure for re-use). Trade-off: bigger lift than (a)/(b)/(c) but addresses the entire blob-URL class of bugs + future MSE-player evolution.

  **(2) Sequencing — ship short-term fix + design screen recording vs. design only.** With (d) on the table, the short-term fixes (a)/(b)/(c) become potentially disposable work. Options:
    - **Ship snapshot save NOW + design screen recording as separate polish item** (recommended by Claude based on "live-site UX continuity" framing) — Amazon/Ebay saves stop showing as broken within hours; snapshot fallback may stay as a fast-capture option even after screen recording ships.
    - **Skip the short-term fix — design screen recording properly NOW** (director-chosen) — Amazon/Ebay saves stay broken on the live site for 2-3 more implementation sessions; no disposable work; design quality not diluted by short-term fix complexity.
    - **Hybrid — ship snapshot save + draft screen-recording design same session** — longer session, more context-switching, both progress + plan. Not chosen.

  **(3) P-45 design — 7 high-priority questions + 5 lower-priority defaults.** Questions covered region selection, audio capture, duration cap, capture API, trigger gesture, existing-path coexistence, and save-flow ordering. Defaults covered codec/quality (webm VP9 720p ~2.5 Mbps), Chrome-dialog-cancel UX, in-progress visual indicator, tab-close handling, and the new SCREEN_RECORDING sourceType schema enum value. All 12 decisions locked this session.

- **Decision:**
  1. **Bug #12 → DIAGNOSED + DEFERRED.** Root cause documented; fix re-routed to NEW polish item P-45 (screen-recording video capture). The `retryOnTransportError` helper from Build #8 ships unchanged as a transient-error safety net.
  2. **Bugs #11, #9, #15 → DEFERRED to future sessions or potentially OBSOLETED by P-45.** Bug #11 (Add new category input) is platform-agnostic and remains valid for ALL paths (fast-fetch + recording) — should be diagnosed in a future session. Bugs #9 + #15 are specific to right-click-on-video gestures and may become moot if users prefer the recording path on Amazon/Ebay.
  3. **NEW polish item P-45** added to `ROADMAP.md` polish backlog. Status: OPEN. Severity: HIGH-MEDIUM (unblocks Amazon/Ebay/MSE-player class of captures fundamentally; universal across platforms). Estimated: 2-3 implementation sessions.
  4. **NEW §C section** added to this design doc capturing the 12 locked decisions + implementation arc + open questions for the next session to settle before coding begins.
  5. **No Rule 9 trigger** this session — pure design + diagnostic work; no code shipped to main; no schema changes; no deploy.

- **Reasoning:**
  - **(1) DevTools cooperation proved decisive in 1 step.** The service worker Network tab evidence (`blob:https://www.amazon.com/...` + `net::ERR_FILE_NOT_FOUND`) made the root cause unambiguous within a single director-driven inspection step. Code-reading alone (Builds #2-#8) could not have surfaced this because the failing fetch URL is constructed at runtime from `<video>.currentSrc` whose value is set by Amazon's JavaScript on page load — there's no way to see "this will be a blob: URL" without running the page. The Hybrid coverage approach (§A.13) is further-validated: automated tests can't run real Amazon pages with real MSE players; manual walkthrough surfaces the bug; DevTools cooperation surfaces the root cause; design + implementation closes the loop.
  - **(2) Director's screen-recording question reframed the problem.** Claude's original 3 short-term-fix options were all working WITHIN the existing "fetch the video bytes" architecture. Director's question — *"Is there a way to do a screen recording of the video..."* — pointed at a fundamentally different architecture (record what's on screen instead of fetching the source). That direction is universal (works on any video player regardless of how the source page serves bytes), pays compound dividends as MSE adoption grows, and reuses ~50% of existing infrastructure (the region-screenshot overlay from P-17). The director-non-programmer framing — "do a screen recording" — is also exactly how an end user would naturally describe what they want, which is a strong UX signal.
  - **(3) Skipping the short-term fix avoids disposable code.** Snapshot save (Option a) would have shipped ~75-100 LOC that becomes redundant once recording works on Amazon/Ebay. Even if snapshot fallback is kept as a fast-capture option later (Claude's original recommendation), it's not THIS session's load-bearing scope. Director's choice protects design quality over live-site UX continuity for the 2-3 session window.
  - **(4) Rule 24 search revealed P-17's existing tab-capture infrastructure** — `chrome.tabs.captureVisibleTab` API in use, `activeTab` permission already in manifest, content-script ↔ background bridge proven, region-selection overlay built. That cut the P-45 scope estimate from "3-5 sessions building from scratch" to "2-3 sessions extending an existing system from single-frame to multi-frame-over-time." Significant signal that this design direction was UNDER-priced in Claude's initial framing.
  - **(5) The 7 + 5 P-45 design decisions form a coherent design intent.** Locked in one session through structured Rule 14f pickers with recommendation markers; each decision is independently reversible. The lower-priority defaults (codec/quality, cancel UX, indicator, tab-close, schema enum) are smaller-stakes choices Claude can defend without director re-litigation; director's "default to recommendations" stance applies per `feedback_default_to_recommendation.md`.
  - **(6) The new §C section preserves design intent for the next session** without trying to mirror §A's 19-subsection thoroughness. The full Rule 18 interview-cluster deepening happens at the start of P-45 Build #1 (the next session) before any code lands — that's the canonical pattern when a design emerges organically during bug diagnosis rather than from a dedicated design session. §C captures the locked decisions + implementation arc + open questions; Build #1 expands it.

- **Impact on §A + new §C:**
  - **§A still holds** for the existing fast-fetch path (DIRECT_BYTES + EMBED branches). That path continues to work on Etsy + Walmart + any future site with plain HTTPS video sources. Director's "keep both paths" decision means §A is preserved unchanged for those sites.
  - **§A.2 implementation arc table row #9** (director real-Chrome verification walkthrough) PROGRESSES from "PARTIAL+" (Build #8 baseline — Etsy + Walmart full pass; Ebay + Amazon partial) to **PARTIAL+ with diagnosed unblock path** (Build #9 — Bug #12 root cause identified + design pivot to P-45 captured). The row will close fully when P-45 ships + cross-platform re-verification confirms Amazon + Ebay captures work via recording.
  - **§A.7 schema spec gains a planned future delta** — P-45 implementation will add `SCREEN_RECORDING` as a 3rd value in the `sourceType` enum. Documented in §C.4. Not a Build #9 change.
  - **§A.13 (Hybrid coverage)** further-validated — DevTools cooperation is now the 4th layer (automated + Playwright + manual walkthrough + DevTools cooperation) for bug classes the earlier layers can't address.
  - **NEW §C — P-45 Screen-Recording Sub-Feature Design (NEW 2026-05-22)** appended below. Captures the 12 locked decisions, 11-step user flow, capture API + permissions, schema impact, save-flow integration, implementation arc (2-3 builds), test coverage approach, open questions for next session.

---

## §C — P-45 Screen-Recording Sub-Feature Design (NEW 2026-05-22)

**Status:** initial design captured 2026-05-22 in `session_2026-05-22-c_p27-build-9-devtools-diagnosis-and-p45-screen-recording-pivot` (the same session that diagnosed Bug #12 + pivoted away from the short-term fix). 12 design decisions locked this session via Rule 14f pickers. The full Rule 18 interview-cluster deepening happens at the start of P-45 Build #1 (the next session) before any code lands. This §C is the canonical reference until Build #1 expands it into a full §C.0-§C.N interview-answers structure mirroring §A.

**Relationship to §A:** §C is a SECOND CAPTURE PATH alongside §A's fast-fetch path, not a replacement. §A's DIRECT_BYTES + EMBED branches continue to serve sites with plain HTTPS video sources (Etsy, Walmart). §C's screen-recording branch serves sites where the source video is unreachable from the background SW (Amazon, Ebay, any MSE-player site) — the bug class Build #9 diagnosed. Both paths share the existing 3-phase save flow + video-capture form + storage schema.

### §C.0 Why this exists (the gap §A doesn't cover)

§A's DIRECT_BYTES branch assumes the `<video>` element's `src` / `currentSrc` is a fetchable URL (plain HTTPS .mp4 / .webm / .mov). For sites using Media Source Extensions (MSE) — where the player downloads chunked media via XHR and assembles it in memory, exposing only a `blob:` URL to the `<video>` element — the background service worker cannot fetch the bytes (blob URLs are scoped to their creating document context; `net::ERR_FILE_NOT_FOUND` outside that context). This affects Amazon product video, Ebay video, Walmart hero player partially, Instagram, TikTok, YouTube, Netflix-style players, and increasingly most modern video platforms. §A's EMBED branch handles `<iframe>`-embedded video (YouTube/Vimeo iframe) but doesn't handle MSE players that don't use iframes. §C closes the gap.

### §C.1 The 12 locked design decisions

| # | Decision | Chosen | Why |
|---|---|---|---|
| 1 | Region selection scope | Draw a rectangle (mirrors P-17 region-screenshot UX) | Familiar to user; saved file is small + focused; reuses ~80% of existing region-screenshot overlay code |
| 2 | Audio capture | Always-on by default | Audio is half the analyzable signal for competitor video (ad copy, narration, music); free at the MediaRecorder layer; reversible per recording later if needed |
| 3 | Max recording duration | ~2-3 minutes with visible countdown timer | At 720p + reasonable bitrate hits ~100 MB cap; predictable UX; "record multiple clips" can ship as a future enhancement |
| 4 | Capture API | `navigator.mediaDevices.getDisplayMedia()` (web standard) | NO new manifest permission required (web standard, not extension-specific); Chrome shows its own "Choose what to share" dialog each recording (transparent permission UX); per-recording extra click is small cost vs. install-time re-permission prompt for ALL users |
| 5 | Trigger gesture | Right-click menu adds new "Record video" item alongside existing "Add to PLOS" | Consistent with current UX; user picks save vs. record at menu level (no surprises); discoverable from where users already look |
| 6 | Existing fast-fetch path | Kept alongside recording — both paths coexist | Zero regression for Etsy/Walmart users (they keep instant one-click captures); walker auto-routes based on what works; reversible (we can deprecate fast-fetch later if recording proves universally preferable) |
| 7 | Save flow order | Record first, then fill in the metadata form | Matches natural cognitive flow (time-bound action first, then sit-with-metadata at leisure); minor cost if user aborts mid-recording |
| 8 | Recording quality / file format | webm with VP9 codec at ~720p, ~2.5 Mbps target | Industry standard for Chrome screen recording; balances quality + file size to fit 2-3 min in 100 MB cap |
| 9 | Cancel UX when user dismisses Chrome's "Choose what to share" dialog | Show a small toast: "Recording cancelled. You can try again any time." | Quiet recovery; no error/red surface; existing `capture-failure-toast.ts` shipped Build #8 covers this idiomatically |
| 10 | In-progress visual indicator | Thin red dashed border around the recorded rectangle + small "REC ●" badge in top-right corner; disappears the moment recording stops | Clear feedback that recording is active; user can see what's being captured; standard screen-recording UX pattern |
| 11 | Tab-close mid-recording | Auto-stop + discard the partial recording | User wasn't actively saving anyway; preserving a partial recording adds complexity without clear value |
| 12 | Schema impact | Add `SCREEN_RECORDING` as 3rd value in `sourceType` enum on `CapturedVideo` table | Distinguishes recorded clips from fetched bytes for future analytics + UI affordances (e.g., "this was captured via screen recording" badge in detail page); minimal schema delta; `prisma db push` fires once during P-45 Build #1 |

### §C.2 The user flow (11 steps)

1. User right-clicks a video on a competitor page (Amazon, Ebay, etc.).
2. Extension menu shows two items: **"Add to PLOS"** (existing fast-fetch) and **"Record video"** (new screen-recording path).
3. User picks **"Record video"**.
4. Existing region-screenshot rectangle overlay appears (adapted for video context).
5. User draws the rectangle around the area to record + clicks **Start**.
6. Chrome's built-in "Choose what to share" dialog appears → user picks their current tab → recording begins.
7. Small floating toolbar appears at top showing **countdown timer** (caps at ~2-3 min) + **Stop** button. Thin red dashed border + "REC ●" badge appear on the recorded rectangle.
8. User plays the Amazon/Ebay video as usual; recording captures the rectangle area + audio in real-time.
9. User clicks Stop (or timer runs out + auto-stops).
10. Recorded clip becomes the preview in the existing video-capture form. User fills category, tags, notes.
11. User clicks Save → standard 3-phase upload to Supabase (Phase 1 requestVideoUpload → Phase 2 PUT bytes from MediaRecorder output + PUT thumbnail from first-frame canvas grab → Phase 3 finalizeVideoUpload with `sourceType: 'SCREEN_RECORDING'`).

### §C.3 Capture API + permissions

**API choice:** `navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })` (locked decision #4). Returns a `MediaStream` once user picks tab in Chrome's dialog. The stream feeds `MediaRecorder` for webm encoding. Region-cropping is achieved via canvas: render stream frames to a hidden canvas → crop to user-drawn rectangle → re-record from canvas via `canvas.captureStream()` → MediaRecorder. This is the standard pattern for region-restricted screen recording in Chrome.

**Permissions:** NO new manifest permission required. `getDisplayMedia` is a web standard available to extensions without manifest declaration; Chrome's per-recording "Choose what to share" dialog IS the permission UX. The existing `activeTab` permission (already in manifest for P-17 region-screenshot) covers any incidental tab access needed. **This is a major win** — no user-facing install-time re-permission prompt for the entire extension audience.

### §C.4 Schema impact

**Single delta:** add `SCREEN_RECORDING` as a 3rd value in the `sourceType` enum on the `CapturedVideo` Prisma model. Current enum: `'EMBED' | 'DIRECT_BYTES'`. Post-P-45: `'EMBED' | 'DIRECT_BYTES' | 'SCREEN_RECORDING'`. `prisma db push` fires once during P-45 Build #1 (Rule 9 destructive-operation trigger; director-Yes gate required).

**No other schema changes.** Same `videoStoragePath` (webm bytes in Supabase Storage), same `thumbnailStoragePath` (first-frame JPEG in Supabase Storage), same `mimeType` field (will be `video/webm` for recordings), same `fileSize` / `durationSeconds` / `width` / `height` fields, same `videoCategory` + `tags` + `composition` + `embeddedText` metadata fields.

### §C.5 Save flow integration

Reuses the existing 3-phase save flow from §A unchanged:
- **Phase 1** — `requestVideoUpload(projectId, urlId, { clientId, mimeType: 'video/webm', fileSize })` — mints signed Supabase URLs for video bytes + thumbnail.
- **Phase 2** — direct PUT of webm bytes from MediaRecorder output to video signed URL + PUT of first-frame JPEG to thumbnail signed URL. Bytes bypass Vercel (same as DIRECT_BYTES).
- **Phase 3** — `finalizeVideoUpload(projectId, urlId, { clientId, sourceType: 'SCREEN_RECORDING', capturedVideoId, videoStoragePath, thumbnailStoragePath, mimeType, fileSize, durationSeconds, ...userMetadata })` — server creates the CapturedVideo row.

The only NEW code: the recording controller that produces the bytes (`MediaRecorder.start()` → `dataavailable` events → final Blob on `stop`). Everything downstream is reuse.

### §C.6 Implementation arc (2-3 builds)

| Build | Scope | Expected duration |
|---|---|---|
| **P-45 Build #1** | Rule 18 interview-cluster deepening of §C → full §C.0-§C.N structure mirroring §A. Recording controller (`record-controller.ts` — ~150 LOC: getDisplayMedia + MediaRecorder + canvas-crop loop + countdown timer + start/stop API). Region-overlay adaptation (`video-region-record-overlay.ts` — fork of existing `region-screenshot-overlay.ts`). Right-click menu addition (new "Record video" item in orchestrator's context-menu builder). In-progress visual indicator (red dashed border + REC badge — ~50 LOC). Schema migration (add SCREEN_RECORDING enum value + `prisma db push` + Rule 9 gate). Dev-time happy-path verification on Amazon (Claude + director). Node:test coverage for record-controller. Playwright extension-context spec for the recording trigger path. | ~1 session |
| **P-45 Build #2** | Cross-platform verification (Amazon, Ebay, Walmart, Etsy — Etsy as regression check since recording path SHOULD work there too but isn't the primary path). Edge cases: user cancels Chrome's share dialog → toast; recording exceeds size cap → graceful truncate with toast + form opens with truncated clip; tab close mid-recording → auto-stop + discard; codec compatibility (webm should work everywhere; fallback path if VP9 unsupported); audio-disabled tabs (some sites disable audio capture); first-frame thumbnail extraction (canvas frame-grab from MediaRecorder output's first chunk). Director real-Chrome walkthrough across 4 platforms. Bug capture + fix-forward iteration if needed. | ~1 session |
| **P-45 Build #3 (CONDITIONAL)** | UX polish + accessibility (keyboard shortcut for Stop?, visible recording state in popup, "you have an active recording" reminder if user switches tabs). Cross-platform Playwright extension-context specs (recording trigger + region-overlay + form-after-stop). Deploy to vklf.com via Rule 9 gate. Director cross-platform re-verification. End-of-arc verification backlog entry. | ~1 session if needed |

### §C.7 Test coverage approach (Hybrid per Rule 27 + §A.13)

**Node:test (unit) layer:** record-controller state machine (start/stop/canceled transitions); region-crop canvas logic given synthetic MediaStream; timer countdown + auto-stop; first-frame extraction. Mockable via fake MediaStream + fake MediaRecorder. ~15-25 new test cases at P-45 Build #1.

**Playwright (extension-context integration) layer:** the right-click → "Record video" menu item dispatch path; region-overlay rendering; orchestrator's recording-state lifecycle. Cannot test actual `getDisplayMedia` because Playwright headless Chrome won't pop the user-selection dialog. Coverage stops at "the orchestrator calls getDisplayMedia"; what happens inside Chrome's dialog is OUT of automated coverage scope per the same boundary as P-17's region-screenshot tests. ~5-10 new Playwright cases at P-45 Build #1 + #2.

**Manual walkthrough layer:** director-driven cross-platform verification (Amazon, Ebay, Walmart, Etsy). This is the ONLY layer that can verify the actual screen-recording end-to-end with real Chrome's screen-share dialog + real MSE players + real audio capture + real codec compatibility. **The Hybrid model (§A.13) explicitly relies on this layer** for the parts automated tests cannot fake. Build #2 walkthrough covers happy paths + the 6+ edge cases enumerated above.

**DevTools cooperation layer:** kept available for any bug-class that surfaces during walkthrough that requires runtime evidence (e.g., codec-compatibility surprises on a specific platform). Build #9 proved this layer's value.

### §C.8 Open questions for P-45 Build #1 to settle before coding

These are the design questions Claude deliberately deferred this session by defaulting to recommendations. They need to be re-surfaced at Build #1 start before code lands, in case director's view evolves between sessions.

1. **Codec fallback if VP9 unsupported.** Chrome supports VP9 widely but Safari + some embedded contexts don't. The webm + VP9 default matches Chrome screen recording's native behavior. If we ever want cross-browser playback in the URL detail page renderer, we may need a transcode step. Out of P-45 scope; flag for future polish item.
2. **Should the recording include a watermark / "recorded via PLOS" overlay?** Privacy + provenance question. Default: NO (cleaner output). User can be told the saved file is "yours, not the source's."
3. **Audio mute/unmute toggle during recording.** Decision #2 locked audio as always-on. Should the floating toolbar show a mute toggle the user can hit mid-recording? Default: NO (simpler UI; user can mute the saved video in PLOS later).
4. **Region overlay vs. video element bounds — auto-snap?** When user starts drawing the rectangle, should we auto-detect the nearest `<video>` element bounds + offer to snap the rectangle to it? Reduces user effort; adds complexity. Default: NO for v1 (manual draw); polish item for future.
5. **What if user starts recording WITHOUT first clicking the page?** Some sites disable autoplay; if user picks "Record video" → draws rectangle → starts recording → realizes the video isn't playing → has to switch context to click play → loses 2-3 seconds. Should the toolbar offer a "Click to play, then Start" affordance? Default: rely on user to play first; polish item for future.
6. **Recovery if MediaRecorder fails mid-recording.** Browser may abort recording for memory / codec / permission reasons. Default: stop recording + show the failure toast + discard partial output. Don't attempt save with a partial blob.
7. **Storage of `originalSrcUrl` for SCREEN_RECORDING rows.** §A's existing schema requires `originalSrcUrl`. For recordings, this would be the page URL (Amazon product listing). Same as EMBED branch's intent for blob: cases. Confirm this is the right field semantics.
8. **Implementation language for the in-page recording toolbar.** Same TypeScript content-script pattern as the existing region-screenshot overlay? Or a more elaborate iframe-injected UI? Default: same pattern as P-17 for consistency.

### §C.9 Living Questions (Rule 7) for the next session to answer

- **Q1: Which data from upstream workflows does P-45 need?** Same as §A — `selectedProjectId` from extension state + `selectedPlatform` from extension state + the user's current page URL (resolved to a CompetitorUrl). No new upstream data.
- **Q2: Is each piece of shared data read-only or editable downstream?** Same as §A — read-only at capture time; downstream workflows (analytics, editing) treat the captured video as a fixed artifact.
- **Q3: If editable, how does the upstream tool see the edits?** Not applicable — read-only at capture time. Future polish items (clip-editing in PLOS UI) would create new derived rows.

### §C.10 Cross-Tool Data Flow Map reciprocal output declaration (Rule 18)

P-45 produces `CapturedVideo` rows with `sourceType='SCREEN_RECORDING'`. Same row shape as DIRECT_BYTES / EMBED rows (single table; sourceType discriminates). Downstream consumers (URL detail page renderer, future analytics workflows) read the same fields. No new shared-data registry entry required beyond the existing CapturedVideo declaration.

---

## §C.11–§C.20 — Implementation-ready deepening (NEW 2026-05-22 P-45 Build #1)

**Status:** §C.0–§C.10 above is the binding design surface — 12 decisions locked Build #9 via Rule 14f pickers; do NOT re-litigate per Rule 18. §C.11–§C.20 below is the Build #1 design-deepening pass per Rule 18 interview-cluster pattern — converts the outline into implementation-ready specs (concrete file paths, function signatures, state machine, error paths, save-flow architecture, test enumeration). Where §C.11–§C.20 makes a sub-decision §C.0–§C.10 did not lock, that sub-decision is recorded in §C.19 with its reasoning.

### §C.11 File layout + module boundaries

P-45 adds ONE new directory and 6 files to the extension; no files outside that directory are net-new (only edits).

```
extensions/competition-scraping/src/lib/screen-recording/
├── record-controller.ts                          NEW (~150 LOC) — recording state machine
├── record-controller.test.ts                     NEW (~15-25 cases) — node:test unit coverage
├── thumbnail-extraction.ts                       NEW (~40 LOC) — first-frame canvas grab from MediaRecorder Blob
├── thumbnail-extraction.test.ts                  NEW (~5-8 cases) — node:test
└── recording-bytes-upload.ts                     NEW (~80 LOC) — smart-client Phase 1+2+3 orchestration
```

```
extensions/competition-scraping/src/lib/content-script/
├── video-region-record-overlay.ts                NEW (~120 LOC) — forked from region-screenshot-overlay.ts
├── video-region-record-overlay.test.ts           NEW (~8-12 cases)
├── recording-indicator-overlay.ts                NEW (~50 LOC) — red-dashed-border + REC badge + floating Stop toolbar
├── recording-indicator-overlay.test.ts           NEW (~5 cases)
├── orchestrator.ts                               EDIT — add `enter-video-region-record-mode` message handler
├── video-capture-form.ts                         EDIT — add `kind: 'screen-recording'` branch + Save path
├── messaging.ts                                  EDIT — add 2 new message types (enter-record-mode, submit-video-screen-recording)
├── api-bridge.ts                                 EDIT — split video upload helpers for smart-client Phase 1+3
└── styles.ts                                     EDIT — add CSS for video-region-record-overlay + recording-indicator-overlay
```

```
extensions/competition-scraping/src/entrypoints/
└── background.ts                                 EDIT — register CONTEXT_MENU_RECORD_VIDEO entry + dispatcher + SCREEN_RECORDING branch in handleSubmitVideoCapture
```

```
src/lib/shared-types/
└── competition-scraping.ts                       EDIT — add 'SCREEN_RECORDING' to VIDEO_SOURCE_TYPES tuple + extend isCapturedVideo type-guard
```

```
prisma/
└── schema.prisma                                 EDIT — add SCREEN_RECORDING value to VideoSourceType enum (Rule 9 trigger via `npx prisma db push`)
```

**No new src/lib/ files on the platform side** — the existing API routes (`/api/projects/[id]/urls/[urlId]/videos/requestUpload` + `.../videos/finalize`) accept the new SCREEN_RECORDING value transparently once the shared-types tuple expands. The route-handler files don't branch on sourceType for the Phase 1 request (signed URLs are minted the same way for DIRECT_BYTES + SCREEN_RECORDING); they only branch in the Phase 3 finalize for the EMBED skip-bytes case. SCREEN_RECORDING travels the same Phase 1+2+3 path as DIRECT_BYTES.

### §C.12 record-controller.ts — state machine + interface

The recording state machine owns the lifecycle from start to stopped-or-cancelled. Pure module — no DOM coupling beyond the MediaStream + MediaRecorder calls.

**State machine:**

```
            ┌─────────┐
   start()  │         │  pickTab error
   ────────▶│  ASKING │──────────────────┐
            │   TAB   │                  │
            └────┬────┘                  │
                 │ user picked tab       │
                 ▼                       │
            ┌─────────┐                  │
            │         │  stop()/auto-cap │
            │RECORDING│──────────┐       │
            │         │          │       │
            └────┬────┘          ▼       │
            cancel()/        ┌────────┐  │
            tab-closed       │STOPPED │  │
                 │           │(emit   │  │
                 ▼           │ blob)  │  │
            ┌─────────┐      └────────┘  │
            │CANCELED │◀────────────────┘
            │(discard │
            │ blob)   │
            └─────────┘
```

**Public interface:**

```typescript
export interface RecordController {
  /** Start the recording. Returns a Promise that resolves AFTER the user has
   * picked a tab in Chrome's "Choose what to share" dialog AND MediaRecorder
   * has entered the recording state. Rejects if the user dismisses the
   * dialog (NotAllowedError) or the dialog fails for any other reason. */
  start(opts: RecordControllerStartOpts): Promise<void>;

  /** Stop the recording cleanly. Emits the final Blob via the onStopped
   * callback. Idempotent if already stopped. */
  stop(): void;

  /** Cancel the recording — discards the partial Blob. The MediaStream is
   * torn down + tracks stopped (so Chrome's "Sharing tab" indicator
   * disappears). Emits onCanceled. Idempotent if already cancelled/stopped. */
  cancel(): void;

  /** Current state, for the orchestrator's lifecycle book-keeping. */
  getState(): 'idle' | 'asking-tab' | 'recording' | 'stopped' | 'canceled';
}

export interface RecordControllerStartOpts {
  /** User-drawn rectangle in viewport coordinates. Used for the canvas-crop
   * loop that restricts the recorded MediaStream to the rectangle. */
  region: Rect;
  /** Hard cap — auto-stop fires at this duration. Default: 180 seconds (3 min)
   * per §C.1 #3. */
  maxDurationSeconds?: number;
  /** Fires once per second during RECORDING with the elapsed seconds count.
   * Drives the countdown UI in recording-indicator-overlay.ts. */
  onTick?(elapsedSeconds: number): void;
  /** Fires once when MediaRecorder transitions to recording. Used by the
   * orchestrator to swap the region-overlay into the indicator-overlay. */
  onStarted?(): void;
  /** Fires when stop() finishes flushing the final dataavailable event.
   * The Blob has MIME type 'video/webm;codecs=vp9,opus' by default. */
  onStopped(result: RecordControllerStoppedResult): void;
  /** Fires when cancel() completes OR when Chrome's dialog dismissal /
   * tab-close / MediaRecorder error tears down the recording. */
  onCanceled?(reason: 'user-cancel' | 'tab-closed' | 'dialog-dismissed' | 'recorder-error', detail?: string): void;
}

export interface RecordControllerStoppedResult {
  blob: Blob;                  // video/webm; full encoded recording
  mimeType: string;            // 'video/webm;codecs=vp9,opus' (or codec fallback)
  durationSeconds: number;     // wall-clock duration
  region: Rect;                // the region recorded (for width/height metadata)
}

export function createRecordController(): RecordController;
```

**Implementation outline:**

1. `start()` calls `navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })`. On rejection (`NotAllowedError`), emit `onCanceled('dialog-dismissed', err.message)` and transition to `canceled`.
2. With the returned `MediaStream`, set up a hidden `<video>` element as the stream's destination; play it muted.
3. Create a hidden `<canvas>` sized to `region.width × region.height` (rounded to even pixels for vp9 compatibility — odd dimensions trigger encoder errors).
4. Start a `requestAnimationFrame` loop that draws `<video>` onto the canvas with `ctx.drawImage(<video>, region.x, region.y, region.width, region.height, 0, 0, region.width, region.height)`. Frame rate matches the display refresh rate (typically 60 fps).
5. Call `canvas.captureStream(30)` to get a region-cropped MediaStream at 30 fps. Merge the original `MediaStream`'s audio tracks into this new stream via `croppedStream.addTrack(audioTrack)`.
6. Construct `MediaRecorder(croppedStream, { mimeType: 'video/webm;codecs=vp9,opus', videoBitsPerSecond: 2_500_000 })`. If `MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')` returns false, fall back to `'video/webm;codecs=vp8,opus'` then `'video/webm'` (Chrome supports vp9+opus on every desktop platform since 2018; the fallback is defense for embedded Chromium variants).
7. Wire `recorder.ondataavailable` to a `chunks: Blob[]` accumulator. Wire `recorder.onstop` to flush — build the final Blob via `new Blob(chunks, { type: mimeType })`, compute `durationSeconds` from a `performance.now()` delta captured at start, fire `onStopped`.
8. Call `recorder.start(1000)` — emits a dataavailable chunk every 1 second so partial recordings survive a crash with at most 1 second lost (the chunks array holds full bytes until stop fires).
9. Set up the duration cap as `setTimeout(() => this.stop(), maxDurationSeconds * 1000)`. Tick the countdown via `setInterval(() => onTick(elapsedSeconds), 1000)`.
10. Watch for tab close via `document.addEventListener('visibilitychange', ...)` — if `document.visibilityState === 'hidden'` AND the recording was started by THIS tab's getDisplayMedia call, treat it as a user-initiated tab close, call `cancel('tab-closed')`.
11. On stop/cancel: stop the rAF loop, stop ALL MediaStream tracks via `stream.getTracks().forEach(t => t.stop())` (this clears Chrome's "Sharing" indicator).

**Error paths:**

| Condition | Outcome |
|---|---|
| User dismisses Chrome's "Choose what to share" dialog | `start()` rejects with `NotAllowedError`; `onCanceled('dialog-dismissed')` fires; orchestrator shows the §C.1 #9 toast. |
| MediaRecorder fires `onerror` mid-recording | `onCanceled('recorder-error', err.message)`; partial Blob discarded per §C.8 #6; orchestrator shows a generic capture-failure toast. |
| User picks a non-current tab in Chrome's dialog | Recording proceeds against the picked tab. Out of scope for region cropping — the rectangle was drawn on the CURRENT tab; if the user picks a different tab, the crop region won't align. Surface as a §C.8 followup; for Build #1 the indicator-overlay just records whatever Chrome returns. |
| Tab is closed mid-recording | `document.visibilitychange` + `unload` listeners catch it; `cancel('tab-closed')` fires; per §C.1 #11 the partial Blob is discarded. |
| File size approaches the 100 MB Supabase bucket cap | Build #1 does NOT implement a size watchdog — at vp9 2.5 Mbps the 3-minute cap yields ~56 MB worst-case, safely under 100 MB. A size-based auto-stop is a §C.8 followup for Build #2 if real recordings exceed the projection. |

### §C.13 video-region-record-overlay.ts — fork specification

Fork of `region-screenshot-overlay.ts`. ~80% of the file is reused verbatim — overlay element creation, banner, dim panels, drag-rectangle drawing, Esc cancel listener. The differences are entirely in what happens on mouseup:

| Behavior | region-screenshot-overlay.ts | video-region-record-overlay.ts |
|---|---|---|
| On mouseup with valid rect | Calls `captureAndCrop(clampedRect)` (screenshot pipeline) | Calls `onRegionPicked(clampedRect)` — the orchestrator then hands the rect to `RecordController.start()` |
| Banner copy | "Drag a rectangle around the module — release to capture…" | "Drag a rectangle around the area to record — release to start recording. Audio + video; ~3 min max." |
| Cursor while armed | `crosshair` | `crosshair` (same — preserves UX consistency) |
| Processing-state UI between mouseup and onCaptured | "Capturing region…" spinner | NO spinner — overlay destroys itself immediately on valid mouseup; the RecordController handles the next-step UI (Chrome's "Choose what to share" dialog appears within ms) |
| Esc cancel | `onCancel('escape')` | `onCancel('escape')` — same |
| Too-small / outside-viewport | `onCancel(reason)` | `onCancel(reason)` — same |

**Public interface:**

```typescript
export interface VideoRegionRecordOverlay {
  destroy(): void;  // idempotent
}

export interface OpenVideoRegionRecordOverlayProps {
  onRegionPicked(rect: Rect): void;
  onCancel(reason: 'escape' | 'rect-too-small' | 'rect-outside-viewport'): void;
}

export function openVideoRegionRecordOverlay(
  props: OpenVideoRegionRecordOverlayProps,
): VideoRegionRecordOverlay;
```

Note the simpler interface vs. the screenshot overlay — there's no `onError` callback because the overlay doesn't own the capture pipeline (that's the RecordController's job; the overlay just hands back the rectangle).

### §C.14 Right-click menu wiring (background + orchestrator)

**`extensions/competition-scraping/src/entrypoints/background.ts` edits:**

```typescript
const CONTEXT_MENU_RECORD_VIDEO_ID = 'plos-add-record-video';
const CONTEXT_MENU_RECORD_VIDEO_TITLE = 'Record video for PLOS';  // see §C.19 sub-decision #1 for the title choice
```

Inside the `onInstalled` handler, add a 5th `chrome.contextMenus.create({...})` call with `contexts: ['all']` (same pattern as the image + video entries — the recording targets the screen, not a specific DOM target, so it should fire from any right-click context).

Inside the `onClicked` handler, add a new branch:

```typescript
if (info.menuItemId === CONTEXT_MENU_RECORD_VIDEO_ID) {
  const pageUrl = typeof info.pageUrl === 'string' ? info.pageUrl : tab?.url ?? '';
  const message: ContentScriptMessage = {
    kind: 'enter-video-region-record-mode',
    pageUrl,
  };
  chrome.tabs.sendMessage(tabId, message).catch(() => { /* no content script */ });
  return;
}
```

**`extensions/competition-scraping/src/lib/content-script/messaging.ts` edits:**

Add the new ContentScriptMessage kinds:

```typescript
| { kind: 'enter-video-region-record-mode'; pageUrl: string }
```

And add the new background request type for the SCREEN_RECORDING save:

```typescript
| { kind: 'submit-video-screen-recording-request-upload';
    projectId: string;
    urlId: string;
    clientId: string;
    mimeType: string;
    fileSize: number; }
| { kind: 'submit-video-screen-recording-finalize';
    projectId: string;
    urlId: string;
    clientId: string;
    capturedVideoId: string;
    videoStoragePath: string;
    thumbnailStoragePath?: string;
    mimeType: string;
    fileSize: number;
    durationSeconds: number;
    width: number;
    height: number;
    originalSrcUrl: string;        // page URL — best fit for SCREEN_RECORDING
    videoCategory: string;
    composition: string | null;
    embeddedText: string | null;
    tags: string[]; }
```

Both background requests delegate to the existing `requestVideoUpload` + `finalizeVideoUpload` helpers; no new server-side API routes needed (the SCREEN_RECORDING enum value is accepted by `finalizeVideoUpload` once the shared-types tuple expands).

**`extensions/competition-scraping/src/lib/content-script/orchestrator.ts` edits:**

Add a new branch to the `onMessage` handler after the existing `enter-region-screenshot-mode` branch:

```typescript
if (msg.kind === 'enter-video-region-record-mode') {
  const pageUrl = msg.pageUrl;
  const overlay = openVideoRegionRecordOverlay({
    onRegionPicked(rect) {
      overlay.destroy();
      const controller = createRecordController();
      const indicator = openRecordingIndicatorOverlay({
        region: rect,
        onStopClicked() { controller.stop(); },
        onCancelClicked() { controller.cancel(); },
      });
      void controller.start({
        region: rect,
        maxDurationSeconds: 180,
        onStarted() { indicator.setRecording(); },
        onTick(elapsed) { indicator.setElapsed(elapsed); },
        onStopped(result) {
          indicator.destroy();
          openVideoCaptureForm({
            kind: 'screen-recording',
            blob: result.blob,
            mimeType: result.mimeType,
            durationSeconds: result.durationSeconds,
            width: result.region.width,
            height: result.region.height,
            pageUrl,
            projectId,
            projectName,
            platform: platformModule.platform as Platform,
            onSaved() {},
            onClose() {},
          });
        },
        onCanceled(reason, _detail) {
          indicator.destroy();
          if (reason === 'dialog-dismissed') {
            showCaptureFailureToast('Recording cancelled. You can try again any time.');
          } else if (reason === 'recorder-error') {
            showCaptureFailureToast('Recording failed mid-way and was discarded.');
          }
          // 'user-cancel' + 'tab-closed' get no toast — they're already user-evident.
        },
      });
    },
    onCancel(_reason) { overlay.destroy(); },
  });
  sendResponse({ ok: true });
  return;
}
```

### §C.15 In-progress visual indicator + floating toolbar

`recording-indicator-overlay.ts` renders TWO synchronized UI elements:

1. **The region indicator** — a thin red dashed border (`border: 2px dashed #d00`) positioned absolutely at the user-drawn rect coordinates. `pointer-events: none` so the user can interact with the page underneath. `z-index: 2147483646` (one below the max int — same scale as the existing region-screenshot-overlay styles in `styles.ts`).

2. **The floating toolbar** — a small bar pinned to the top-center of the viewport with `position: fixed; top: 12px; left: 50%; transform: translateX(-50%)`. Contains a red "REC ●" badge (the dot pulses via a CSS keyframe), a live countdown display ("0:08 / 3:00"), a **Stop** button (primary, red), and a **Cancel** button (secondary, gray text-only). The toolbar's z-index is also 2147483646 — same plane as the region indicator.

**Public interface:**

```typescript
export interface RecordingIndicatorOverlay {
  setRecording(): void;          // call when MediaRecorder enters recording state
  setElapsed(elapsedSeconds: number): void;   // updates the countdown display
  destroy(): void;
}

export interface OpenRecordingIndicatorOverlayProps {
  region: Rect;
  onStopClicked(): void;
  onCancelClicked(): void;
  maxDurationSeconds?: number;   // default 180 — feeds the countdown denominator
}
```

**Lifecycle:**

- Renders in "PREPARING…" state with a gray border + spinner until `setRecording()` is called (covers the ~1-2 seconds between mouseup-on-region and the first MediaRecorder dataavailable event, which spans Chrome's "Choose what to share" dialog).
- After `setRecording()`: border switches to red dashed, REC badge appears, countdown starts incrementing.
- On `destroy()`: removes both DOM elements + clears any pending timers.

### §C.16 Save flow detail — smart-client architecture

Default-picked per §C.19 sub-decision #2: the content-script orchestrates Phases 1+2+3 itself, with Phase 1 + Phase 3 proxied through background (vklf.com CORS allowlist limits) and Phase 2 PUT directly to Supabase from content-script origin (Supabase signed URLs are CORS-cleared for any-origin uploads).

**`recording-bytes-upload.ts` flow:**

```typescript
export async function uploadScreenRecording(input: {
  projectId: string;
  urlId: string;
  blob: Blob;
  thumbnailBlob: Blob | null;    // from thumbnail-extraction.ts; null = no thumbnail
  pageUrl: string;
  durationSeconds: number;
  width: number;
  height: number;
  videoCategory: string;
  composition: string | null;
  embeddedText: string | null;
  tags: string[];
}): Promise<CapturedVideo> {
  const clientId = crypto.randomUUID();
  const mimeType = input.blob.type || 'video/webm';
  const fileSize = input.blob.size;

  // Phase 1 — proxied through background.
  const phase1 = await submitVideoScreenRecordingRequestUpload({
    projectId: input.projectId,
    urlId: input.urlId,
    clientId, mimeType, fileSize,
  });
  // phase1: { capturedVideoId, videoUploadUrl, videoStoragePath, thumbnailUploadUrl, thumbnailStoragePath }

  // Phase 2 — direct PUT from content-script. Supabase signed URL allows any origin.
  await fetch(phase1.videoUploadUrl, {
    method: 'PUT', body: input.blob,
    headers: { 'Content-Type': mimeType },
  });
  let thumbnailUploaded = false;
  if (input.thumbnailBlob) {
    try {
      await fetch(phase1.thumbnailUploadUrl, {
        method: 'PUT', body: input.thumbnailBlob,
        headers: { 'Content-Type': 'image/jpeg' },
      });
      thumbnailUploaded = true;
    } catch {
      // §A.12 NULL-thumbnail fallback — never blocks save.
    }
  }

  // Phase 3 — proxied through background.
  return submitVideoScreenRecordingFinalize({
    projectId: input.projectId,
    urlId: input.urlId,
    clientId,
    capturedVideoId: phase1.capturedVideoId,
    videoStoragePath: phase1.videoStoragePath,
    ...(thumbnailUploaded ? { thumbnailStoragePath: phase1.thumbnailStoragePath } : {}),
    mimeType, fileSize,
    durationSeconds: input.durationSeconds,
    width: input.width, height: input.height,
    originalSrcUrl: input.pageUrl,
    videoCategory: input.videoCategory,
    composition: input.composition,
    embeddedText: input.embeddedText,
    tags: input.tags,
  });
}
```

**Why smart-client over base64-through-message:** a 100 MB Blob base64-encodes to ~133 MB. `chrome.runtime.sendMessage` passes everything through structured clone in MV3 SWs; the practical limit varies by browser version but failures around 64 MB are well-attested. The smart-client path has no such ceiling — fetch() handles a 1 GB body the same way it handles 1 KB. Tradeoff: the host-page origin makes the PUT request, but Supabase signed URLs return `Access-Control-Allow-Origin: *` so CORS is non-issue.

**`originalSrcUrl` choice:** per §C.8 #7 — set to the page URL (Amazon product listing). Mirrors the EMBED branch's intent for blob:-source rows: when the underlying media has no fetchable URL, the page URL is the closest semantic equivalent. The URL detail page renderer uses this field only for analytics — playback comes from the storage path.

### §C.17 Schema migration mechanics

**The edit in `prisma/schema.prisma`:**

```diff
 enum VideoSourceType {
   EMBED
   DIRECT_BYTES
+  SCREEN_RECORDING
 }
```

**The edit in `src/lib/shared-types/competition-scraping.ts`:**

```diff
-export const VIDEO_SOURCE_TYPES = ['EMBED', 'DIRECT_BYTES'] as const;
+export const VIDEO_SOURCE_TYPES = ['EMBED', 'DIRECT_BYTES', 'SCREEN_RECORDING'] as const;
```

**The migration command:** `npx prisma db push`. This is a Rule 9 destructive operation — director-Yes gate fires via AskUserQuestion before invocation. Schema-change-in-flight flag flips to **YES** at the moment the command runs; stays YES until the next deploy lands the new enum live on vklf.com (P-45 Build #2's expected scope).

**Migration safety:** the change is purely additive (a new enum value). No existing rows are affected. The new value is accepted by all existing API routes (`finalizeVideoUpload` accepts any value matching the enum). No data backfill required.

**Post-push verification (no Claude action required):** the `npx prisma db push` command prints a summary of the schema diff applied; success = the new enum value lives in `pg_enum` for the `VideoSourceType` type. Failure surfaces as a Postgres error in stdout; rollback would be `npx prisma db push` with the enum value removed (also additive-reversible — no data depends on it yet).

### §C.18 Test-case enumeration

**Node:test (unit) layer — record-controller.test.ts (~15-25 cases):**

| # | Case |
|---|---|
| 1 | `start()` with valid stream resolves; state transitions idle → asking-tab → recording |
| 2 | `start()` when getDisplayMedia rejects with NotAllowedError emits `onCanceled('dialog-dismissed')` |
| 3 | `stop()` while recording transitions to stopped; `onStopped` fires with a Blob |
| 4 | `stop()` is idempotent — second call no-ops |
| 5 | `cancel()` while recording transitions to canceled; `onCanceled('user-cancel')` fires |
| 6 | `cancel()` is idempotent |
| 7 | `cancel()` after `stop()` is a no-op (no double-emit) |
| 8 | Auto-stop fires at `maxDurationSeconds` |
| 9 | `onTick` fires once per second with monotonically-increasing seconds |
| 10 | MediaRecorder fallback to vp8 when vp9 unsupported |
| 11 | MediaRecorder fallback to plain webm when both vp9 and vp8 unsupported |
| 12 | `onCanceled('recorder-error', detail)` fires when MediaRecorder fires onerror |
| 13 | All MediaStream tracks are stopped on stop |
| 14 | All MediaStream tracks are stopped on cancel |
| 15 | Tab visibility transition to hidden during recording triggers `cancel('tab-closed')` |
| 16 | Region with width=0 or height=0 throws on start (invalid input) |
| 17 | Region with odd dimensions is rounded to even before canvas sizing |
| 18 | `durationSeconds` in `onStopped` result reflects wall-clock from start to stop |
| 19 | `mimeType` in `onStopped` matches the picked MediaRecorder mimeType |
| 20 | `getState()` returns correct value across all transitions |

**Node:test (unit) layer — thumbnail-extraction.test.ts (~5-8 cases):**

| # | Case |
|---|---|
| 1 | Given a valid webm Blob, returns a JPEG Blob |
| 2 | JPEG quality is 0.85 |
| 3 | Output dimensions match the recording's width/height |
| 4 | Empty/zero-byte Blob returns null (no thumbnail) |
| 5 | Decode error returns null (no thumbnail) — never throws |

**Node:test (unit) layer — video-region-record-overlay.test.ts (~8-12 cases):**

Largely mirrored from existing region-screenshot-overlay tests with sink swapped. Drag-rectangle math reuses `rectFromDrag` + `clampRectToViewport` from `region-screenshot.ts` — no new math to test.

**Node:test (unit) layer — recording-indicator-overlay.test.ts (~5 cases):**

| # | Case |
|---|---|
| 1 | Initial state shows PREPARING border + no countdown |
| 2 | `setRecording()` switches to red border + REC badge + 0:00 countdown |
| 3 | `setElapsed(seconds)` updates countdown text |
| 4 | Stop button click fires `onStopClicked` |
| 5 | Cancel button click fires `onCancelClicked` |
| 6 | `destroy()` removes both DOM elements |

**Playwright (extension-context integration) layer:** **DEFERRED to Build #2 or #3** per §C.6's implementation arc table. Reason: Playwright's headless Chrome can't pop the user-selection dialog for `getDisplayMedia`; meaningful integration coverage requires the dev-time happy-path walkthrough instead. The Build #1 Playwright count (94) stays unchanged.

**Manual walkthrough layer:** the §C.18 dev-time happy-path walkthrough on Amazon is the integration test that Build #1 ships. Build #2 extends this to Amazon + Ebay + Walmart + Etsy.

### §C.19 Sub-decisions defaulted this session

These are the implementation-detail sub-decisions §C.0–§C.10 did not lock to full resolution. Per the Default-to-recommendation exception (HANDOFF_PROTOCOL Rule 14f), each was decided by Claude with the most-thorough/reliable path; recorded here for audit.

| # | Sub-decision | Choice | Reasoning |
|---|---|---|---|
| 1 | Right-click menu title | "Record video for PLOS" | Distinct from existing "Add to PLOS — Captured Video" entry (avoids "Add to PLOS — Record Video" colliding visually). The verb-first phrasing makes the action clearer in a right-click menu. **THIS IS USER-VISIBLE** — surfaced as a Rule 14f picker at task #7 before code lands. |
| 2 | Save-flow architecture | Smart-client (content-script orchestrates Phase 1+2+3; Phase 2 PUTs directly to Supabase) | Avoids the chrome.runtime.sendMessage size ceiling that a base64-through-message approach would hit for >50 MB recordings. Implementation detail per Rule 14d. |
| 3 | MediaRecorder mimeType string | `'video/webm;codecs=vp9,opus'` with fallback to vp8 then plain webm | Matches §C.1 #8 locked decision; fallback covers embedded Chromium variants without breaking the happy path. |
| 4 | Esc-key cancel listener registration | `window.addEventListener('keydown', handler, true)` (capture phase) | Mirrors region-screenshot-overlay.ts; capture phase ensures host page Esc handlers don't intercept. |
| 5 | Visual indicator z-index | 2147483646 (one below int max) | Same scale as existing region-screenshot-overlay styles in styles.ts; guarantees we sit above any host-page modal. |
| 6 | File-size warning toast copy | NOT NEEDED IN BUILD #1 — vp9 at 2.5 Mbps for 3 min ≤ 56 MB, safely under 100 MB cap | Defer to Build #2 if real recordings exceed projection. |
| 7 | Recording indicator initial state during Chrome dialog | "PREPARING…" gray border + spinner | Covers the 1-2 sec gap between mouseup-on-region and MediaRecorder transitioning to recording; clearer than blank waiting. |
| 8 | Cancel UX | Esc key + on-screen Cancel button + revoke MediaStream | §C.1 default-lock #9 confirmed: floating toolbar has a Cancel button; Esc also cancels per region-overlay precedent. |
| 9 | Where the recording indicator + overlay live (DOM root) | `document.body.appendChild(...)` | Mirrors region-screenshot-overlay; works across all 4 supported platforms. |
| 10 | What `originalSrcUrl` stores for SCREEN_RECORDING rows | Page URL (e.g., Amazon product listing URL) | §C.8 #7 confirmed: closest semantic equivalent to EMBED's iframe URL; analytics consumer reads this field. |

### §C.20 Build #1 ship checklist

**Status as of 2026-05-22-e (Build #1b complete):** Items 1-3 shipped in 1a (`7e2eb2c`); items 4-19 shipped in 1b (`80713ff`); item 20 (dev-time happy-path verify on Amazon) DEFERRED to Build #2's Phase 1 per director directive late-session "please defer all testing for later and continue with whatever is next on the roadmap"; items 21-22 ✅ this session.

Pre-flight (before any code):

- [x] §C.11–§C.20 written + reviewed (1a)
- [x] Rule 9 director-Yes gate fires before `npx prisma db push` (1a — gate fired, push succeeded in 1.18s)

Code (in implementation order — each step verified independently):

1. [x] `prisma/schema.prisma` — add `SCREEN_RECORDING` value to `VideoSourceType` enum (1a)
2. [x] `src/lib/shared-types/competition-scraping.ts` — extend `VIDEO_SOURCE_TYPES` tuple + verify `isCapturedVideo` type-guard accepts the new value (1a)
3. [x] `npx prisma db push` (Rule 9 gate fired in 1a; SCREEN_RECORDING enum live on Supabase since 2026-05-22-d 14:09 UTC)
4. [x] `extensions/competition-scraping/src/lib/screen-recording/record-controller.ts` + .test.ts (1a — 29 tests; 1b extended with optional `cropStreamToRegion` DI dep + 5 new canvas-crop tests = 34 total)
5. [x] `extensions/competition-scraping/src/lib/screen-recording/thumbnail-extraction.ts` + .test.ts (1b — 8 tests; `extractFirstFrameThumbnail` NEVER throws — returns null on any failure per §A.12)
6. [x] `extensions/competition-scraping/src/lib/screen-recording/recording-bytes-upload.ts` (1b — ~150 LOC smart-client Phase 1+2+3 orchestrator + `normalizeBlobMime` codec-param stripper)
7. [x] `extensions/competition-scraping/src/lib/content-script/video-region-record-overlay.ts` + .test.ts (1b — 8 tests; forked from `region-screenshot-overlay.ts`)
8. [x] `extensions/competition-scraping/src/lib/content-script/recording-indicator-overlay.ts` + .test.ts (1b — 12 tests; red dashed border + REC ● pulsing badge + M:SS countdown + Stop + Cancel toolbar + PREPARING state)
9. [x] `extensions/competition-scraping/src/lib/content-script/messaging.ts` — add 3 new message types (1b — EnterVideoRegionRecordModeMessage + SubmitVideoScreenRecordingRequestUploadRequest + SubmitVideoScreenRecordingFinalizeRequest + response envelopes + type-guard branches)
10. [x] `extensions/competition-scraping/src/lib/content-script/api-bridge.ts` — add 2 new background-request helpers (1b — `submitVideoScreenRecordingRequestUpload` + `submitVideoScreenRecordingFinalize`)
11. [x] `extensions/competition-scraping/src/entrypoints/background.ts` — add menu registration + dispatch + Phase 1/3 handlers (1b — `CONTEXT_MENU_RECORD_VIDEO` id `plos-add-record-video` with title locked **"Record video for PLOS"** per §C.19 #1 + `onClicked` branch + `handleSubmitVideoScreenRecordingRequestUpload` + `handleSubmitVideoScreenRecordingFinalize`)
12. [x] `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` — add `enter-video-region-record-mode` branch (1b — opens overlay → on region picked creates RecordController + indicator overlay → wires onTick/onStopped/onCanceled to drive the indicator + opens video-capture-form on stop + surfaces capture-failure toasts)
13. [x] `extensions/competition-scraping/src/lib/content-script/video-capture-form.ts` — add `kind: 'screen-recording'` branch + Save path (1b — preview via `<video controls>` from Blob createObjectURL + source-kind banner showing size + duration + Save calls `uploadScreenRecording()` + first-frame thumbnail extraction first + `URL.revokeObjectURL` on form destroy via stashed `_plosBlobUrl`)
14. [x] `extensions/competition-scraping/src/lib/content-script/styles.ts` — add CSS for new overlays (1b — video-region-record-overlay + recording-indicator region + toolbar + `plos-cs-rec-pulse` keyframe)

Additional 1b file edits beyond the original 14-item code list:

14a. [x] `extensions/competition-scraping/src/lib/content-script/captured-video-validation.ts` — bytes-required gate broadened symmetrically to accept SCREEN_RECORDING paralleling DIRECT_BYTES branch (1b — prior `if (draft.sourceType === 'DIRECT_BYTES')` becomes `if (draft.sourceType === 'DIRECT_BYTES' || draft.sourceType === 'SCREEN_RECORDING')`)

Verification:

15. [x] `npx tsc --noEmit` (root + extension) — both clean after fixing TS18048 errors on indexed-array accesses in 3 new test files + `recording-bytes-upload.ts` line 72 via non-null assertions `!` + `?? ''` fallback (caught at first scoreboard pass, fixed within 5 min)
16. [x] `npm test` in `extensions/competition-scraping/` — **558/558** (+34 over 1a's 524 — 8 thumbnail-extraction + 8 video-region-record-overlay + 12 recording-indicator-overlay + 5 canvas-crop on record-controller + 1 normalizeBlobMime helper)
17. [x] `npm test` in `/workspaces/brand-operations-hub` (src/lib node:test) — **590/590** unchanged (validator broadening covered by existing `isVideoSourceType` test from 1a)
18. [x] `npm run build` — **57 routes** unchanged (no new API route; the existing finalize + requestUpload routes accept SCREEN_RECORDING via 1a's enum broadening)
19. [ ] `npm run zip` — DEFERRED to Build #2's Phase 3 deploy (fresh zip carries the screen-recording wiring end-to-end as the natural deploy artifact; no standalone zip this session since dev-time verify is deferred too)
20. [ ] Dev-time happy-path verification on Amazon (director + Claude) — **DEFERRED to Build #2's Phase 1** per director directive late-session ("please defer all testing for later and continue with whatever is next on the roadmap"); reframed as Build #2's natural opening step per the 1a precedent for cross-session binding inputs

End-of-session:

21. [x] /scoreboard (pre-end-of-session GREEN) — root tsc clean / extension tsc clean / 57 routes / 590 src/lib / 558 ext / Playwright SKIPPED non-deploy
22. [x] /end-of-session — doc-batch + commit + push + Personalized Handoff (no deploy; Build #2 owns the deploy)

---

### §B 2026-05-22-d — `session_2026-05-22-d_p45-build-1a-screen-recording-engine-foundation` — Build #1a foundation slice mid-session decisions (scope-pacing 1a-vs-1-shot picker / menu label locked "Record video for PLOS" / §C.19 10 sub-decisions defaulted via Default-to-recommendation / save-flow smart-client architecture)

- **Director said:**
  - At the start-of-session Rule 14f menu-label picker — chose **"Record video for PLOS"** (verb-first phrasing) over the parallel-pattern option "Add to PLOS — Record Video." Reasoning explicitly accepted: verb-first is more distinct from the existing "Add to PLOS — Captured Video" entry than the parallel-pattern option, which reduces user confusion at the right-click moment between fast-fetch capture vs. screen-recording capture.
  - At the mid-Phase-2 Rule 14f scope-pacing forced-picker (fired when the original "single Build #1" framing surfaced as risking a 4-5 hour single-shot push past Rule 13's 90-minute trigger combining a Rule 9 destructive op + >1 hour of dependent code + a director-cooperation dev-verify step), chose **Option A: split 1a foundation + 1b wiring** (recommended per most-thorough/reliable per `feedback_recommendation_style.md`) over Option B (continue as single Build #1 single-shot) and Option C (narrow MVE).
  - At the Rule 9 destructive-op gate for `npx prisma db push`, gave director-Yes via AskUserQuestion picker. Push succeeded in 1.18s. SCREEN_RECORDING enum value is live on Supabase as of 14:09 UTC this session.
  - At the §C.19 sub-decision batch (10 implementation-detail items: codec MIME preference list / region-validator min dimensions / countdown timer cadence / stop button position / canvas-crop strategy / first-frame timing / failure-mode toast copy / mediaStream-track-end auto-stop wiring / form pre-fill default values / floating Stop toolbar dismissal behavior), defaulted to Claude's recommendations per `feedback_default_to_recommendation.md` — each defaulted decision is reversible at any time during Build #1b or later.

- **Alternatives considered:**

  **(1) Scope pacing — 1a + 1b split vs. single-shot Build #1 vs. narrow MVE.** The original Build #1 framing in (a.63) listed 6 deliverables: §C deepening, record-controller, overlay fork, menu wiring, indicator overlay, schema migration, dev-time verify. Approximate session time: 4-5 hours of careful work. Rule 13's 90-minute trigger had already fired by hour 2 of Phase 1 design deepening. Options:
    - (a) **Continue as single Build #1 single-shot** — preserves the original (a.63) framing. Risk: session would chain a Rule 9 destructive op (mid-Phase-2) + ~2-3 hours of dependent code + a director-cooperation dev-verify step in a single window. Fatigue on any of those three multiplies risk.
    - (b) **Split 1a foundation + 1b wiring (recommended).** 1a ships the destructive op + the pure-engine foundation (record-controller + tests + validator + API route broadening). 1b ships the wiring (overlay fork + indicator + orchestrator/form/menu integration + thumbnail-extraction + smart-client recording-bytes-upload + dev-time verify). The split keeps each session within Rule 13's 90-minute window + cleanly separates the destructive-op session from the dev-cooperation session.
    - (c) **Narrow MVE — drop the in-progress visual indicator + the floating Stop toolbar from Build #1 entirely.** Saves ~30-45 min. Trade-off: ships a Build #1 that doesn't visually confirm recording is happening, which would hurt the dev-time verify UX. Not chosen.

  **(2) Menu label — "Record video for PLOS" (verb-first) vs. "Add to PLOS — Record Video" (parallel-pattern).** The existing right-click menu has "Add to PLOS — Captured Video" for the fast-fetch path. Options:
    - **"Record video for PLOS" (chosen)** — verb-first phrasing; more distinct from the fast-fetch entry; reads as a different action at the right-click moment.
    - "Add to PLOS — Record Video" — parallel to existing entry; consistent menu grammar; risk of users misreading at the right-click moment as "another way to add the same captured video."
    - "PLOS: Record video" — colon-prefix variant; matches some browser-native menu conventions; rejected as less idiomatic for extension menus.

  **(3) Save-flow architecture — smart-client (chosen) vs. base64-through-chrome.runtime.sendMessage vs. content-script-relay-PUT-from-background.** The recorded webm file can reach Supabase via three architectures:
    - **Smart-client (chosen)** — content-script orchestrates Phase 1 (requestVideoUpload via background) + Phase 2 (PUT video bytes directly to Supabase signed URL from content-script origin) + Phase 3 (finalizeVideoUpload via background). No size ceiling (fetch handles 1 GB the same as 1 KB). Supabase signed URLs return `Access-Control-Allow-Origin: *` so CORS is a non-issue from a content-script origin.
    - base64-through-chrome.runtime.sendMessage — content-script base64-encodes the Blob + sends via chrome.runtime.sendMessage to background → background PUTs to Supabase. Practical size ceiling around 64 MB on chrome.runtime.sendMessage; base64 adds ~33% overhead. Rejected as size-bound.
    - Content-script-fetches-signed-URL-then-relays-bytes-to-background — content-script gets the signed URL from background, fetches the file, sends bytes to background. Same size ceiling problem as base64. Rejected.

  **(4) §C.19 sub-decisions (10 items defaulted via Default-to-recommendation).** Each item had 2-4 plausible options surfaced + Claude's recommendation marked with the most-thorough/reliable marker per `feedback_recommendation_style.md`. Director's "default to your recommendations and proceed" stance applies per `feedback_default_to_recommendation.md`. The 10 items are listed in §C.19 with reasoning for each defaulted choice; each is reversible during Build #1b or later if real-world use surfaces a different need.

- **Decision:**
  1. **Phase 1 design deepening** — §C.11-§C.20 appended below the existing §C.0-§C.10 outline per Rule 18 append-only; original outline untouched. The deepened block carries: §C.11 file layout + module boundaries (1 new directory + 6 new files + 9 file edits per the layout table); §C.12 record-controller state machine + interface; §C.13 video-region-record-overlay fork specification; §C.14 right-click menu wiring (with the locked label "Record video for PLOS"); §C.15 in-progress visual indicator + floating Stop toolbar; §C.16 save-flow detail (smart-client architecture); §C.17 schema migration mechanics; §C.18 test-case enumeration (~5-25 cases per new file); §C.19 sub-decisions defaulted this session (10 items); §C.20 Build #1 ship checklist (split into 1a + 1b sub-checklists).
  2. **Phase 2 (1a) foundation slice SHIPPED** — schema migration via `prisma db push` (Rule 9 director-Yes gate) + `record-controller.ts` ~280 LOC + 29 node:test cases + `isFinalizeVideoUploadRequest` validator broadening + finalize-route bytes-required gate broadening + list-route signed-URL minting gate broadening. Build commit `7e2eb2c`.
  3. **Phase 2 (1b) wiring slice DEFERRED to next session** — captured as binding inputs in NEXT_SESSION.md, not as orphan TaskList DEFERRED items per Rule 26's intent.
  4. **No deploy this session** — no main push; no ff-merge; no Vercel redeploy; no fresh extension zip (no orchestrator wiring landed yet, so a zip would surface a foundation-only bundle with no user-visible surface change vs. Build #8 deploy zip).
  5. **Schema-change-in-flight flag flipped to YES** at the moment of `prisma db push`; stays YES at session end until P-45 Build #2 deploys the new enum value live on vklf.com.

- **Reasoning:**
  - **(1) The 1a/1b split is the recommended-most-thorough/reliable option.** Per `feedback_recommendation_style.md`, the recommendation should be the most-thorough/reliable option, not the fastest/cheapest. The single-shot Build #1 was fastest but risked compounded fatigue across destructive-op + wiring + dev-verify in one window. The narrow MVE was cheapest but would have shipped a Build #1 that doesn't visually confirm recording — hurting the dev-time verify UX. The split is most-thorough/reliable because (a) the destructive op happens in a session with no fatigue-risk for the gate decision, (b) the wiring happens with the foundation already validated, (c) the dev-time verify happens with a complete user-visible surface to walk, and (d) each session stays within Rule 13's 90-minute window.
  - **(2) Verb-first menu label is the more UX-distinct option at the right-click moment.** When the user right-clicks on a video element, the menu shows multiple PLOS entries (the existing "Add to PLOS — Captured Video" + potentially others). Distinct labels reduce mis-pick risk. "Record video for PLOS" reads as a fundamentally different action than "Add to PLOS — Captured Video"; "Add to PLOS — Record Video" reads as a variant of the same action. The user can't accidentally pick the wrong path with the verb-first label.
  - **(3) Smart-client save-flow has no size ceiling + Supabase CORS is permissive.** chrome.runtime.sendMessage has a practical size ceiling around 64 MB (varies by Chrome version). The P-45 cap is 100 MB (matches the existing CapturedVideo bucket file-size limit). Smart-client routes Phase 2 (the PUT of video bytes) directly from content-script origin to Supabase — no Chrome IPC in the critical path. Supabase signed URLs return `Access-Control-Allow-Origin: *` so CORS is a non-issue from a content-script origin. Verified at design time by reading the Supabase storage docs + the existing DIRECT_BYTES path's PUT-from-content-script architecture (which already works the same way for fast-fetch video bytes).
  - **(4) §C.19 defaults are reversible.** Each of the 10 items defaulted this session is a small-stakes implementation detail that can be reversed during Build #1b or any subsequent session. Captured for traceability per Rule 18; not binding beyond Build #1b's first implementation pass.
  - **(5) Test regression caught + fixed within the scoreboard pass.** The `VIDEO_SOURCE_TYPES` deepEqual assertion in `src/lib/shared-types/competition-scraping.test.ts:177` held the prior tuple verbatim — when the enum tuple was extended from `['EMBED', 'DIRECT_BYTES']` to `['EMBED', 'DIRECT_BYTES', 'SCREEN_RECORDING']`, the assertion failed at the first scoreboard run. Fix: update the deepEqual expected value + add a new `isVideoSourceType('SCREEN_RECORDING')` test case. Re-ran in <2 minutes; baseline confirmed 590/590. Normal test-update-with-schema-change, not a corrections-tier slip — the failing test caught the schema change exactly as it was supposed to.

- **Impact on §A + §C:**
  - **§A still holds** — fast-fetch DIRECT_BYTES + EMBED branches continue to serve plain-HTTPS-source sites unchanged. The shared `isFinalizeVideoUploadRequest` validator now accepts SCREEN_RECORDING as a third variant; the broadening is additive (the prior two variants still validate exactly as before).
  - **§A.7 schema spec DELTA SHIPPED** — `VideoSourceType` enum gained `SCREEN_RECORDING` value via `npx prisma db push` this session. Schema-change-in-flight flag stays YES until P-45 Build #2 deploys the new enum live on vklf.com.
  - **§C.0-§C.10 outline untouched** — original interview-cluster outline preserved per Rule 18 append-only.
  - **NEW §C.11-§C.20 deepening block** appended below §C.10. The deepened block is binding spec for Build #1b; do NOT re-litigate at implementation time per Rule 18 interview-cluster pattern.
  - **§C.20 ship checklist** split into 1a (foundation, ✅ complete this session) + 1b (wiring, opens via (a.64)) sub-checklists.

---

### §B 2026-05-22-e — `session_2026-05-22-e_p45-build-1b-screen-recording-wiring-slice` — Build #1b wiring slice mid-build judgment calls (validator broadening symmetric / canvas-crop as optional DI dep / preview via `<video controls>` from Blob createObjectURL / verify deferral handling per the 1a precedent / strict-mode TS18048 normalization)

- **Director said:**
  - Late-session, after Task #13 (dev-time happy-path verify on Amazon — the final §C.20 ship checklist item before end-of-session) was surfaced as the next step, director instructed: *"please defer all testing for later and continue with whatever is next on the roadmap"*. Interpretation: the dev-time verify becomes Build #2's Phase 1 binding input (Build #2 is clearly-named + verify is its natural opening step before deploy).
  - No other mid-build directives this session — the §C.11-§C.20 deepening from 2026-05-22-d locked all the implementation-detail decisions in advance per Rule 18 interview-cluster pattern, so this session was straight implementation against a binding spec.

- **Alternatives considered:**

  **(1) Validator broadening — symmetric (chosen) vs. partial-broadening vs. defer.** The `validateCapturedVideoDraft` bytes-required gate in `captured-video-validation.ts` checked only `if (draft.sourceType === 'DIRECT_BYTES')` for the bytes-required path. Options when extending to SCREEN_RECORDING:
    - **Symmetric (chosen)** — broaden to `if (draft.sourceType === 'DIRECT_BYTES' || draft.sourceType === 'SCREEN_RECORDING')` so both bytes-required source types share the same gate (bytes + MIME + size + 100 MB cap all enforced).
    - Partial-broadening — broaden only the bytes-required check but skip the MIME/size validation for SCREEN_RECORDING. Rejected: would risk SCREEN_RECORDING rows missing the 100 MB cap or accepting non-webm MIMEs.
    - Defer until Build #2 — leave the validator alone in 1b; broaden in Build #2 alongside the deploy. Rejected: the Phase 1 dev-time verify in Build #2 needs the validator to accept SCREEN_RECORDING; if 1b ships incomplete, Phase 1 fails immediately + Build #2 stalls before deploy mechanics.

  **(2) Canvas-crop region constraint — optional DI dep (chosen) vs. required dep vs. production-only.** The 1a-shipped RecordController didn't apply the user-drawn rectangle as a region constraint on the recorded video (the foundation just records the full screen via getDisplayMedia). 1b needs to add the canvas-crop pipeline. Options:
    - **Optional DI dep (chosen)** — `cropStreamToRegion` is an OPTIONAL field on `RecordControllerDeps` with a production implementation in `createProductionDeps` (via `productionCropStreamToRegion`). Tests that don't pass the dep get the raw stream recorded (1a backward-compatibility preserved — zero test breakage on the 29 1a-shipped tests).
    - Required DI dep — would have forced rewriting all 29 1a test fixtures to either pass a fake `cropStreamToRegion` or a no-op. Rejected: most-thorough/reliable preserves the 1a test surface intact.
    - Production-only (no DI) — directly call the production cropper inside RecordController. Rejected: prevents unit-testing the canvas-crop logic independently + couples the state machine to canvas-API availability.

  **(3) Preview UX in the form's screen-recording branch — `<video controls>` from Blob createObjectURL (chosen) vs. static thumbnail-only preview vs. no preview.** When the form opens with a recording attached, the user needs some way to see what they just recorded before clicking Save. Options:
    - **`<video controls>` from Blob createObjectURL (chosen)** — recording is already in-memory as a Blob; `URL.createObjectURL(blob)` is instant + native + the user can scrub through their recording before saving. URL revoked on form destroy via querySelector hunt for stashed `_plosBlobUrl` to prevent memory leak.
    - Static thumbnail-only preview — show the extracted first-frame thumbnail as a static image; user can't preview the recording before saving. Rejected: would miss any visible-only-during-playback errors (e.g. user accidentally recorded the wrong region; audio out of sync; recording cut off mid-action).
    - No preview — go straight to metadata form. Rejected: violates the most-thorough preview UX principle; user has to commit to saving without seeing the result first.

  **(4) Verify deferral handling — Build #2's Phase 1 binding input (chosen per 1a precedent) vs. orphan TaskList DEFERRED vs. block end-of-session until verify completes.** Director's late-session directive deferred the verify to a future session. Options:
    - **Build #2's Phase 1 binding input (chosen)** — captured in NEXT_SESSION.md, not as orphan TaskList DEFERRED per Rule 26's intent + the 1a precedent for clearly-named cross-session binding inputs. Build #2 needs to verify before deploy anyway under Rule 9 + §C.20 step 20.
    - Orphan TaskList DEFERRED — captured as TaskList entry "DEFERRED: dev-time verify on Amazon". Rejected: Rule 26's intent is to capture items that don't have a clearly-named next session; Build #2 is clearly-named and the verify is its natural opening step.
    - Block end-of-session until verify completes — refuse to honor the director directive. Rejected: director's intent is clear + the verify can absolutely happen in Build #2.

  **(5) Strict-mode TS18048 normalization — non-null assertions in tests + `?? ''` fallback in production (chosen) vs. relax tsconfig vs. type-guard everything.** `noUncheckedIndexedAccess: true` in extension tsconfig caused 3 new test files + `recording-bytes-upload.ts` line 72 to fail extension tsc. Options:
    - **Non-null assertions `!` in tests + `?? ''` fallback in production (chosen)** — tests know the elements exist by construction (the test explicitly set them up); production uses safer fallback. Caught at first scoreboard pass; fixed within 5 min.
    - Relax tsconfig — turn off `noUncheckedIndexedAccess` for new files. Rejected: the strict-mode check caught real edge cases (e.g. `split('/')[0]` returning undefined on an empty MIME string — possible in pathological inputs even though MediaRecorder won't produce one in practice).
    - Type-guard everything — add explicit `if (x === undefined) throw new Error()` before each indexed access. Rejected: overengineered for cases where the test fixture guarantees existence by construction.

- **Decision:**
  1. **Validator broadening** — symmetric DIRECT_BYTES + SCREEN_RECORDING in `captured-video-validation.ts` bytes-required gate. Additive coverage; no test regression because existing tests don't exercise SCREEN_RECORDING.
  2. **Canvas-crop region constraint** — optional `cropStreamToRegion` DI dep on RecordControllerDeps with production implementation in `createProductionDeps` via helper `productionCropStreamToRegion`. `CroppedStream` type exported with `stream + teardown()`. 1a tests stay green because the new dep is optional.
  3. **Preview UX** — `<video controls>` from Blob `URL.createObjectURL` in the form's `kind:'screen-recording'` branch. URL revoked on form destroy via querySelector hunt for stashed `_plosBlobUrl`.
  4. **Verify deferral handling** — dev-time happy-path verify on Amazon captured in NEXT_SESSION.md as Build #2's Phase 1 binding input; Task #13 marked deleted (not DEFERRED) per the 1a precedent for clearly-named cross-session binding inputs.
  5. **Strict-mode TS18048 normalization** — non-null assertions `!` in 3 new test files + `?? ''` fallback for `split[0]` case in `recording-bytes-upload.ts` line 72. Fixed within 5 min at first scoreboard pass.

- **Reasoning:**
  - **(1) Symmetric validator broadening is the most-thorough/reliable option** per `feedback_recommendation_style.md`. Partial broadening would create asymmetry between the two bytes-required source types (DIRECT_BYTES + SCREEN_RECORDING) where one type's rows could escape the 100 MB cap or accept non-webm MIMEs while the other type's rows couldn't. The symmetric broadening enforces the same gate for both bytes-required types + makes future variant additions easy (just add another OR branch).
  - **(2) Optional DI dep preserves 1a test backward-compatibility** + makes the canvas-crop logic independently unit-testable. The 29 1a-shipped tests still pass without modification because they don't pass `cropStreamToRegion` (the controller falls back to raw stream — which is what the 1a tests verified). New canvas-crop tests pass a fake `cropStreamToRegion` that returns a deterministic cropped stream. Production passes `productionCropStreamToRegion` which wires the canvas-API pipeline.
  - **(3) `<video controls>` preview UX is the most-thorough preview option.** The user can scrub through their recording before saving — catches visible-only-during-playback errors (wrong region recorded; audio out of sync; recording cut off mid-action). `URL.createObjectURL(blob)` is instant + native; no Supabase round-trip needed since the recording is already in-memory. URL revoked on form destroy prevents memory leak.
  - **(4) Verify deferral as Build #2's Phase 1 binding input** is per the 1a precedent (2026-05-22-d closed 6 Phase 2 wiring tasks as binding inputs to 1b rather than orphan TaskList DEFERRED entries since 1b was clearly-named + wiring was its natural opening step). Build #2 is clearly-named + verify is its natural opening step before deploy mechanics. Combining verify + deploy into a single session is more natural than splitting verify into its own session — Build #2's Phase 1 verify catches any wiring bugs before Phase 3 deploy ships them to vklf.com, which is exactly the right time to catch them.
  - **(5) Strict-mode TS18048 fixes are normal strict-mode-with-new-code, not a corrections-tier slip.** The strict-mode check caught real edge cases (e.g. `split('/')[0]` returning undefined on pathological MIME strings); the fix is part of the change, not a correction. Non-null assertions in tests are safe because the test fixture guarantees existence by construction; `?? ''` fallback in production is safer than `!` because production handles edge cases that tests don't model.

- **Impact on §A + §C:**
  - **§A still holds** — fast-fetch DIRECT_BYTES + EMBED branches continue to serve plain-HTTPS-source sites unchanged. The validator broadening + the bytes-required gate broadening are additive — existing 2-variant callers still pass through.
  - **§A.12 NULL-thumbnail fallback further-validated** — `thumbnail-extraction.ts` `extractFirstFrameThumbnail` NEVER throws (returns null on any failure: bad MIME, decode error, canvas tainted, video seek failure, etc.). The form gracefully handles null thumbnails per the existing §A.12 pattern.
  - **§A.13 (Hybrid coverage) further-validated** — the 3 new test files + 5 new canvas-crop cases on record-controller add 34 unit-test cases at the node:test layer; extension-context Playwright deferred to Build #3 per §C.18's "manual walkthrough is the integration test" decision (`getDisplayMedia` permission prompt can't be satisfied in Playwright headless Chromium at full fidelity).
  - **§C.0-§C.10 outline untouched** — original interview-cluster outline preserved per Rule 18 append-only.
  - **§C.11-§C.20 deepening was BINDING spec implemented this session; no spec drift** — every file landed in 1b matched the §C.11 file layout table; the `messaging.ts` types match §C.14; the menu label "Record video for PLOS" matches §C.19 #1; the smart-client save flow matches §C.16; the canvas-crop region constraint extends `record-controller.ts` per §C.12 + the §C.20 ship checklist's item 4 extension scope.
  - **§C.20 ship checklist** updated this session: items 1-3 ✅ in 1a; items 4-19 ✅ in 1b; item 20 (dev-time happy-path verify on Amazon) ⏭ DEFERRED to Build #2's Phase 1 per director directive; items 21-22 ✅ this session. New item 14a added for the `captured-video-validation.ts` bytes-required gate broadening that landed in 1b beyond the original 14-item code list.

---

### §B 2026-05-22-i — `session_2026-05-22-i_p45-build-2-deploy-with-phase-1-fix-forward` — Build #2 deploy session mid-build judgment calls (Phase 1 fix-forward for 3 fixable issues + structural-ceiling Phase 1 limit recognized + Phase 4 cross-platform PASS)

- **Director said:** (paraphrased from session transcript) at session start, "please proceed with P-45 Build #2 as the next session task per the 2026-05-22-h NEXT_SESSION pointer." Mid-session at Issue 2 fix-scope picker: defaulted to the aggressive band-aid recommendation per Default-to-recommendation. At Phase 3 Rule 9 deploy gate: "Yes, push origin main." At Phase 4 cross-platform walkthrough end: "All passed."

- **What landed:** Build #2 fix-forward commit `ee8c79d` (3 files changed +78/-30) before deploy. ff-merge `d4a2940..ee8c79d` brought 11 commits to `main` as a single fast-forward (Build #1a + 1a-doc + 1b + 1b-doc + P-42 + P-42-doc + P-43 + P-43-doc + P-44 + P-44-doc + Build #2 fix-forward). Fresh extension zip `plos-extension-2026-05-22-w2-deploy-33.zip` (202.75 KB) at repo root. Schema-change-in-flight flag FLIPPED YES → NO at deploy completion. Phase 4 director real-Chrome cross-platform verify PASSED CLEAN on all 4 platforms (Amazon + Ebay + Walmart + Etsy) with zero caveats.

- **Mid-build judgment calls (Rule 14f forced-picker outcomes + §C.20 ship-checklist final closures):**

  1. **Phase 1 sideload-mechanism picker outcome = one-shot zip download** — at Phase 1 start, the picker between (A) build a fresh dev-mode hot-reload via `npm run dev` vs. (B) one-shot zip download via `npm run zip` + sideload + iterate landed on (B) because Phase 1 is dev-time verify on Amazon — needs production-build behavior (NOT hot-reload dev mode where wxt's `defineUnlistedScript` + the dev-runtime injection don't match production); one-shot zip + sideload is the most-thorough/reliable path for surfacing production-only failures like Issue 1's `selfBrowserSurface` interaction with the production wrapper. Director approved per Default-to-recommendation; Phase 1 ran with `plos-extension-2026-05-22-w2-deploy-33-prebuild-1.zip` (a Phase 1 test artifact NOT committed; the final deploy zip is the one in the repo root at `plos-extension-2026-05-22-w2-deploy-33.zip`).

  2. **Issue 2 fix-scope picker outcome = aggressive band-aid + verify Amazon then fallback Walmart** — at Issue 2 diagnosis, the picker between (A) aggressive 20-event stopPropagation band-aid on all 4 inputs (recommended; ships in same Build #2 — defends the FOCUS-layer not just keystroke-layer; matches the empirical observation that Build #8's narrower defense was insufficient) vs. (B) ship a "click to focus" inline button alongside the existing input (visual cue + manual focus restore; ~30 min more code; risk of confusing UX) vs. (C) ship a "click-to-edit-in-popup-modal" escape hatch (heavy; ~2 hours; would require new content-script-to-popup messaging) vs. (D) Shadow DOM mount as the proper long-term fix (correct architecturally but ~2-3 hours of CSS migration; risk of CSS gaps on the same Build #2 ship). Director approved (A) per Default-to-recommendation; Shadow DOM was captured as a SEPARATE polish item P-47 for the proper long-term fix rather than deferred-inside-P-45. Empirical verify: Amazon Phase 4 walkthrough confirmed all 4 inputs accept typing post-deploy — the band-aid works. Walmart fallback wasn't needed (Walmart inputs worked fine without the band-aid since Walmart doesn't have the focus-stealing JavaScript pattern Amazon has; the band-aid is harmless additive defense on platforms that don't need it).

  3. **Phase 1 finalize 400 = recognized as schema-in-flight artifact, deferred to Phase 4** — when post-Issue-3 Phase 1 reached the Save step and director clicked Save, the finalize call returned `'Couldn't save (400): Request body must include clientId + sourceType (EMBED|DIRECT_BYTES) + originalSrcUrl; DIRECT_BYTES additionally requires capturedVideoId + videoStoragePath'`. Recognized within ~30 seconds as a structural Phase 1 ceiling — production vklf.com routes don't have Build #1a's `isVideoSourceType('SCREEN_RECORDING')` validator change yet (undeployed code at the schema-change-in-flight boundary). The picker at this moment was between (A) declare Phase 1 done up to finalize + proceed to Phase 2/3 + verify the previously-unverifiable step in Phase 4 against freshly-deployed production code (recommended; structural-ceiling-acknowledgment per Reusable Pattern C captured in CORRECTIONS_LOG §Entry 2026-05-22-i) vs. (B) deploy a temporary content-script bypass that fakes the finalize success at Phase 1 (heavy; risk of leaving the bypass in production; ~30 min code) vs. (C) STOP Phase 1 + flag the structural limit as a process-breaking problem (overkill — Phase 4 has always been the canonical real-world verify gate; Phase 1 is dev-time sideload pre-deploy not a contract against the structural limit). Director approved (A) per Default-to-recommendation; Phase 4 confirmed finalize succeeded post-deploy + row landed in Supabase with `sourceType='SCREEN_RECORDING'` + URL detail page rendered the recording inline via `<video controls>`.

  4. **Phase 4 = all 4 platforms passed clean; no Build #3 needed.** The Phase 4 director cooperative real-Chrome walkthrough went smoother than any prior W#2 cross-platform verification — Amazon + Ebay + Walmart + Etsy all completed the full record → form → save → URL-detail-page playback cycle with zero failures + zero caveats. Director reported "All passed." The §C.20 ship checklist's deferred items 20 + 21 + 22 from Build #1b are now all ✅: item 20 (dev-time happy-path verify on Amazon) verified during Phase 1 (up to finalize structural limit); items 21-22 (cross-platform verify + post-deploy real-Chrome verify) verified clean during Phase 4. No Build #3 fix-forward session needed; P-45 graduates at ✅ DONE-AND-VERIFIED 2026-05-22-i.

- **Impact on §A + §C:**
  - **§A still holds** — fast-fetch DIRECT_BYTES + EMBED branches continue to serve plain-HTTPS-source sites unchanged. The 3 fix-forward changes are surgical + additive + defensive (Issue 1 sets a Chrome API option that was using the default; Issue 2 adds event-isolation listeners without removing any existing behavior; Issue 3 normalizes a MIME string before it's sent). No production code path touched on the existing DIRECT_BYTES + EMBED branches.
  - **§A.12 NULL-thumbnail fallback still validated** — `thumbnail-extraction.ts` `extractFirstFrameThumbnail` continues to NEVER throw; Phase 4 verify didn't surface any thumbnail-extraction failure on the 4 platforms tested (all videos had decodable first frames + the canvas grab succeeded). The §A.12 fallback path remains as documented; no production change.
  - **§A.13 (Hybrid coverage) further-validated** — Phase 4 director real-Chrome cross-platform walkthrough is the canonical "manual walkthrough is the integration test" per §C.18 + Rule 27; the cross-platform PASS validates the §A.13 hybrid coverage model in production.
  - **§C.0-§C.10 outline untouched** — original interview-cluster outline preserved per Rule 18 append-only.
  - **§C.11-§C.20 deepening untouched per Rule 18 append-only** — the BINDING spec implemented in Build #1a + Build #1b + Build #2 matched every section; no spec drift. §C.20 ship checklist all items now ✅ (the deferred items 20 + 21 + 22 from prior sessions all complete via Phase 4 verify).
  - **NEW polish item P-47 captured for the Shadow DOM refactor** — the 80-event-listener band-aid shipped in Issue 2 works empirically but Shadow DOM mount is the proper long-term replacement. P-47 LOW priority since band-aid works for current scope. Sequencing-wise, P-47 should wait until P-46's design lands first because P-46 may introduce new in-form interactions that change the refactor's scope.
  - **Closes P-27 Bug #11** — the Issue 2 band-aid empirically verified on Amazon during Phase 4 (the canonical reproduction platform for Bug #11). P-27 Bug #9 + Bug #15 remain DEFERRED.

- **CORRECTIONS_LOG cross-reference:** new §Entry 2026-05-22-i CLOSING P-45 with the 3-Pattern Reusable narrative + 2 embedded informational sub-observations.

---

END OF DOCUMENT
