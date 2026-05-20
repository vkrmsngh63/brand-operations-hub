# Next session

**Written:** 2026-05-20 (`session_2026-05-20_codespace-rebuild-memory-loss-recovery-and-rule29-prevention-DEPLOYED` — end-of-session handoff after the HIGH-severity Codespaces-rebuild memory-loss recovery session shipped the 4-layer protective architecture + closed P-18 fully via verification PASS + fired §4 Step 1c forced-picker; director picked **(a.53) RECOMMENDED-NEXT = W#2 polish P-27 Captured-videos feature DESIGN session**).

**For:** the next Claude Code session — first P-27 session is design-only (no code). Run the full Workflow Requirements Interview per HANDOFF_PROTOCOL Rule 18 in 3-5 question clusters, producing the canonical W#2-tool-specific design doc with §A (initial answers) + §B (empty, append-only). The 2026-05-19-g-2 director-confirmed scope pins (URL reference + uploaded bytes BOTH stored; full UX symmetry with text/image; pre-graduation gating) are binding inputs to Q1 (Purpose) and Q5 (Outputs) — do NOT re-litigate; carry them forward as already-settled.

---

## Status of today's session

**Codespaces-rebuild memory-loss recovery + Rule 29 "Pre-destructive-container-operation audit" + 4-layer protective scaffolding SHIPPED + DEPLOYED on `main`; P-18 verification PASS captured (`npm run test:e2e:all` 91/91 in 1.8 min after Codespace rebuild with ZERO manual lib install — postCreateCommand confirmed firing on rebuild); closes (a.51) + (a.52) RECOMMENDED-NEXT P-18 fully; opens (a.53) RECOMMENDED-NEXT = P-27 Captured-videos feature DESIGN session.** One-hundred-and-nineteenth Claude Code session. HIGH-severity slip recovery session — the 2026-05-21 session recommended a Codespaces "Rebuild Container" walkthrough to verify P-18 WITHOUT auditing what the rebuild would wipe. The rebuild succeeded at P-18 verification but silently wiped Claude's persistent operational memory directory (~10 cross-session operational-memory files) + the Claude Code CLI binary. No PLOS or vklf.com work was lost — all PLOS state lives in git + GitHub remote + Vercel + Supabase. The loss was Claude's own internal operational memory + dev tooling. Director caught the slip post-rebuild + requested permanent protective scaffolding. Five phases shipped: (1) memory reconstruction from `docs/HANDOFF_PROTOCOL.md` references; (2) procedural rule (HANDOFF_PROTOCOL Rule 29 + CLAUDE_CODE_STARTER Rule 8 augment); (3) hook layer (SessionStart canary + PostToolUse backup + audit script); (4) recovery infrastructure (`.codespace-backup/` persistent-volume directory + restore script); (5) P-18 verification PASS + ship. Pre-deploy scoreboard GREEN at exact 2026-05-20 baselines (post-rebuild): tsc / ext tsc / `npm run build` 53 routes / src/lib node:test 536/536 / extension `npm test` 428/428 / Playwright 91/91 in 1.8 min. Ff-merged clean onto main; pushed origin/main → Vercel auto-redeploy (web no-op — tooling/docs/procedural only); ping-pong sync to workflow-2. Schema-change-in-flight stayed "No" the entire session.

---

## Branch

**`workflow-2-competition-scraping`** — W#2 polish + new-feature design work. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` AND exactly even with `origin/main`. Both branches at the same SHA after this session's main push + ping-pong sync + end-of-session doc-batch push + ping-pong (the doc-batch commit SHA becomes the new shared tip).

---

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:

**W#2 polish P-27 — Captured-videos feature DESIGN SESSION** on `workflow-2-competition-scraping`. **First session is design-only — NO CODE.** Closes (a.53) RECOMMENDED-NEXT.

Branch is `workflow-2-competition-scraping`. Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Task shape — Workflow Requirements Interview per HANDOFF_PROTOCOL Rule 18:**

P-27 captured-videos is a substantive new functional surface for W#2 — end-to-end parity with the existing captured-text + captured-image flows so director can attach saved videos to CompetitorUrls alongside text + images. The 2026-05-19-g-2 addendum capture flagged P-27 as a NEW W#2 pre-graduation polish item but explicitly deferred the full design interview to a dedicated future session — THIS session. Run the canonical Workflow Requirements Interview producing the W#2-tool-specific design doc (either as a new `docs/CAPTURED_VIDEOS_DESIGN.md` Group B doc or as an append-only §B-style addendum to the existing `docs/COMPETITION_SCRAPING_DESIGN.md` — director's pick at session-start via Rule 14f forced-picker).

**Binding inputs from 2026-05-19-g-2 director-confirmed picks (do NOT re-litigate — these are settled inputs to the design):**

- **(Q1 Source — already settled)** URL reference + uploaded video bytes BOTH stored. The CapturedVideo table stores both: a URL field (for embedded videos on YouTube/Vimeo/etc. where bytes can't be downloaded per platform ToS) AND a storage-bucket path (for inline `<video>` elements where bytes are downloadable). When both are present, the URL is the canonical source-of-truth; the bytes are the local copy.
- **(Q2 Gestures — already settled)** Full UX symmetry with text/image — all 3 capture paths: (a) right-click on `<video>` element in-page → opens content-script form; (b) right-click on embed (YouTube/Vimeo iframe) → walks DOM to find underlying video URL (mirrors P-23-AMAZON's `findUnderlyingImage` helper for image discovery); (c) popup paste video URL form (mirrors `CapturedTextPasteForm.tsx`).
- **(Q3 Graduation timing — already settled)** Pre-graduation polish item — per director's standing directive *"All these things should ship before Workflow #2 is deemed complete."* P-27 joins P-26 as the 2 remaining items that must ship before W#2 graduation.

**Open design questions for this session (per the 2026-05-19-g ROADMAP P-27 entry — these are the questions to resolve via the interview):**

1. **Supabase bucket strategy** — new bucket dedicated to videos (chosen by elimination — existing image bucket has the 5MB cap that explicitly prevents video uploads per `STACK_DECISIONS.md:144`). Private vs. public; signed URLs (likely per `PLATFORM_REQUIREMENTS.md:427` already-flagged tech-debt note); size cap (candidates: 100 MB / 500 MB / per-project budget); MIME-type allowlist (`video/mp4` + `video/webm` + `video/quicktime`?).
2. **Thumbnail extraction** — server-side FFmpeg (heavy; new Vercel function) vs. client-side `<video>`+`<canvas>` frame-grab (lighter; extension captures thumb pre-upload) vs. external source-URL poster / YouTube auto-thumb API (lightest; relies on the source URL having a poster). Pick one for v1; defer the others to future polish.
3. **Schema additions** — new `CapturedVideo` table (parallel to `CapturedImage`; cleaner; chosen per 2026-05-19-g) vs. polymorphic `CapturedAsset` with `mediaType` discriminator (DRY-er but less type-safe; already rejected for symmetry with existing models). Confirm the field list: id + clientId + competitorUrlId + videoCategory + storagePath + storageBucket + originalSrcUrl + composition + embeddedText + tags + sourceType + fileSize + mimeType + duration_seconds (NEW relative to CapturedImage) + width + height + sortOrder + source + addedBy + addedAt + updatedAt + thumbnailUrl + fullSizeUrl.
4. **YouTube/Vimeo handling** — store URL only for embedded platforms (likely; ToS + technical constraints argue against attempting to download bytes from YouTube) vs. attempt download. Confirm the URL-only path for v1.
5. **Cross-platform `<video>` detection** — empirical investigation needed in this session for which of the 7 supported platforms (amazon + ebay + etsy + walmart + shopify + woocommerce + bigcommerce) host inline `<video>` elements vs. embeds vs. neither. Spot-check each platform's product page during the interview to ground the design.
6. **Three Living Questions (Rule 7) answers** to capture in DATA_CATALOG: (i) Upstream data needed = Project + Platform + CompetitorUrl + new video-category vocabulary; (ii) Read-only by downstream W#3+; (iii) N/A.
7. **DATA_CATALOG §7 Cross-Tool Data Flow Map** — new "captured videos" output entry to W#2's row, per Rule 18 reciprocal output declaration; downstream consumers initially "TBD."

**Workflow Requirements Interview — recommended cluster structure (3-5 questions per cluster; capture answers in §A; capture any clarifying directives in §B going forward per Rule 18):**

- **Cluster 1 — Purpose + Scope (questions 1-3):** What is the workflow goal in plain language? Where does P-27 fit in the W#2 graduation sequence? What is explicitly OUT of scope for v1?
- **Cluster 2 — Inputs + Triggers (questions 4-7):** What data does the capture path read? What triggers it (3 gesture surfaces — already settled)? What are the per-platform `<video>` detection patterns?
- **Cluster 3 — Outputs + Schema (questions 8-10):** What does CapturedVideo look like? What new vocabulary type (`video-category`)? What new bucket?
- **Cluster 4 — Edge cases + Error paths (questions 11-13):** YouTube/Vimeo URLs (no byte download); oversize videos (>cap); MIME-type rejection; CDN-not-authorized 404; thumbnail-extraction failure.
- **Cluster 5 — Test coverage approach (question 14):** Rule 27 Hybrid likely — node:test on extracted pure helpers (e.g., video-URL-normalizer; thumbnail-extraction logic) + Playwright extension-context spec on the right-click happy path single-platform amazon first; cross-platform extension to ebay + etsy + walmart deferred to a P-22-style follow-up.

After all 14 questions resolved + recorded in §A of the design doc, surface the design doc to director via Read-It-Back per Rule 18 before any code starts (no code starts THIS session — this is design-only).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** for each open design question, surface 2-4 plausible options + the recommended option + the rationale; default to the recommendation if director defers. The director-confirmed picks from 2026-05-19-g-2 stand; don't re-litigate them.

**Pre-build read list (in addition to mandatory start-of-session sequence):**

- `docs/ROADMAP.md` lines 1-30 (header) + the (a.53) Active Tools entry + the P-27 polish backlog entry (line 155 — full pre-capture-search summary + 7 open design questions + scope rationale + cross-references).
- `docs/COMPETITION_SCRAPING_DESIGN.md` — read entire §A + scan §B for any 2026-05-19-g-2 entry capturing the original scope-add directive verbatim. The new design doc (or new §B entry) extends from this base.
- `docs/COMPETITION_SCRAPING_STACK_DECISIONS.md` line 144 — the 5MB image-cap reasoning that explicitly mentions video prevention; needs deliberate revisit in this design session.
- `docs/PLATFORM_REQUIREMENTS.md` line 427 — already-flagged tech-debt note about workflow-deliverable storage strategy that P-27's bucket design will satisfy or scope.
- `docs/HANDOFF_PROTOCOL.md` Rule 18 (the canonical Workflow Requirements Interview pattern — 14-question shape; §A initial / §B append-only).
- `extensions/competition-scraping/src/lib/content-script/image-capture-form.ts` (the sibling pattern to mirror for the right-click `<video>` form — read its shape, NOT to copy code).
- `extensions/competition-scraping/src/lib/content-script/find-underlying-image.ts` (the sibling DOM-walking helper to mirror for the embed-fallback path).
- `extensions/competition-scraping/src/entrypoints/popup/components/CapturedTextPasteForm.tsx` (the sibling pattern to mirror for the popup paste video form).
- `prisma/schema.prisma` `CapturedImage` model (the sibling table to mirror for `CapturedVideo`).
- `docs/CAPTURED_VIDEOS_DESIGN.md` (NEW this session — to be created) OR `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-20 entry (the alternative — director's pick at session start).
- `docs/HANDOFF_PROTOCOL.md` Rule 29 (the NEW pre-destructive-container-operation audit rule shipped this session; informational read for context on the new operational discipline).

**Rule 14f forced-picker at session start (before any other interview work):**

Ask director — via AskUserQuestion — where the design doc should live:

- **(A) New `docs/CAPTURED_VIDEOS_DESIGN.md` Group B doc** (recommended per `feedback_recommendation_style.md` — cleaner separation; mirrors the precedent of having tool-specific design docs as their own files; makes the design visible at the top level of `docs/` rather than buried in COMPETITION_SCRAPING_DESIGN's §B append history; future P-27 build sessions read this doc directly without grepping for §B entries).
- **(B) New §B 2026-05-20 entry in existing `docs/COMPETITION_SCRAPING_DESIGN.md`** (the append-only path; lighter doc-add cost; keeps W#2 design in one place; consistent with 2026-05-19-g-2's existing §B entry that captured the original scope-add directive).
- **(C) Both — new top-level doc AND a §B entry cross-referencing it** (heaviest; potentially confusing — two places to update going forward; not recommended).
- **(D) Escape hatch — director wants a different doc structure.**

**Schema-change-in-flight flag:** stays "No" entire session (design-only; no schema work this session). The flag flips to "Yes" at the future implementation session that adds the `CapturedVideo` table.

**Pre-deploy verification scoreboard targets (if any code change ships — unlikely for design-only, but listed defensively):**

- `npx tsc --noEmit` clean
- `cd extensions/competition-scraping && npx tsc --noEmit` clean
- `npm run build` clean — **53 routes** (unchanged — no new route)
- `src/lib` node:test: **536/536** (unchanged — no server-side change)
- Extension `npm test`: **428/428** (unchanged — no extension source change)
- Playwright: **91/91** (unchanged — no test additions)

If this session somehow ships any code (it shouldn't — design-only), deploy mechanics are cheat-sheet (b) — Rule 9-gated AskUserQuestion deploy gate, ff-merge, ping-pong sync.

**Group A docs to update at end-of-session:** ROADMAP (header + P-27 polish backlog entry annotated with "design session 1 complete + design doc shipped" status + (a.53) flipped to ✅ DONE + new (a.54) RECOMMENDED-NEXT = P-27 implementation session #1); CHAT_REGISTRY (new top entry); DOCUMENT_MANIFEST (header bump + new Group B doc registered if option A picked); CORRECTIONS_LOG (header bump + any new entries — likely zero this session); NEXT_SESSION (rewritten for the next P-27 session — implementation #1 likely, but the design session's outcomes may shift the next pick).

**Group B docs to update at end-of-session:** new `docs/CAPTURED_VIDEOS_DESIGN.md` (if option A picked) OR `docs/COMPETITION_SCRAPING_DESIGN.md` (new §B 2026-05-20 entry — if option B picked); COMPETITION_SCRAPING_VERIFICATION_BACKLOG (no change this session — no verification artifact yet); COMPETITION_SCRAPING_STACK_DECISIONS (potentially — if the design session revisits the 5MB cap reasoning at line 144, capture the revisit + new video-bucket cap as a new §B-style entry).

Start by running the mandatory start-of-session sequence (read CLAUDE_CODE_STARTER.md + verify branch + read ROADMAP header + read this NEXT_SESSION.md), then fire the Rule 14f forced-picker (A/B/C/D above) for design-doc structure BEFORE any interview work.

---

## Pre-session notes (offline steps for director between sessions)

**No required offline steps this time.** P-27 is design-only first session — runs in a single Claude session without needing director-side setup or rebuild. The 4-layer protective architecture shipped this session means future destructive container operations (if any are recommended) will trigger the Rule 29 pre-rebuild audit + Rule 14f forced-picker BEFORE the destructive op runs.

**Optional offline reading for director:** the new HANDOFF_PROTOCOL Rule 29 + the `scripts/codespace-rebuild-audit.sh` script + the `.codespace-backup/README.md` documentation give director full visibility into the new operational discipline around destructive container operations. Worth a 5-minute skim before next session if director wants the full context.

---

## Why this pointer was written this way (debug aid)

Today's session was triggered by a HIGH-severity slip class — the 2026-05-21 session's recommendation to perform a Codespaces "Rebuild Container" walkthrough to verify P-18 silently wiped Claude's persistent operational memory because the recommender did not audit what the rebuild would wipe. Recovery + protective architecture shipped in 5 phases this session; the verification PASS was captured as a side effect (the rebuild that wiped the memory also proved P-18's postCreateCommand works). The §4 Step 1c forced-picker fired at end-of-session — director picked P-27 captured-videos DESIGN session as the next polish item because P-27 is the next largest pre-graduation item left in the W#2 polish backlog (P-26 below-fold + P-27 captured-videos are the 2 remaining; P-26 is small-scope code work; P-27 is large-scope and needs a design session BEFORE any code).

This NEXT_SESSION.md is written for P-27 design-session-#1. The launch prompt is design-only — no code. The Workflow Requirements Interview pattern from Rule 18 is the canonical shape for new-feature design sessions. The 2026-05-19-g-2 director-confirmed picks (URL + bytes both stored; full gesture symmetry; pre-graduation gating) are binding inputs that the interview does NOT re-litigate.

**Alternate next-session candidates if director shifts priorities at session start (after P-18 closes + before P-27 design):**

- **P-26 below-fold full-page-scroll capture** (LOW-severity deferred large lift — last in the queue with P-27; current workaround works; ~600-1000 LOC code-only session no design needed). Recommended *only* if director wants to wrap the smaller-scope polish item before the design-heavy P-27 path. Estimated 1-2 sessions.
- **Manual-add modal originalSrcUrl tack-on** (DEFERRED from 2026-05-19-e — trivial 1-line; could fold into any P-NN session or be its own sub-1-hour session).
- **Investigate the wxt-zip parent-process hang behavior session-over-session.** Multiple recent sessions have observed the hang (2026-05-19-f + 2026-05-19-g + 2026-05-21) interspersed with clean runs (2026-05-20). Worth a dedicated investigation session if it keeps recurring across deploys.

Check `ROADMAP.md` for the canonical state.
