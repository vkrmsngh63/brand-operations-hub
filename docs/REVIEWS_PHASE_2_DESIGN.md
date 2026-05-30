# REVIEWS PHASE 2 — DESIGN DOC (Workflow #2 polish P-49)

**Polish item:** P-49 — W#2 Phase 2 automated per-platform review collection (Amazon + eBay + Etsy + Walmart) + 3-level AI-driven review analysis system (per-product two-sweep + cross-Type pooled + cross-everything competitive landscape) + Captured Reviews UI extensions on vklf.com (star-count breakdown counter-bar + server-side drag-to-reorder + bulk-delete affordance).
**Parent workflow:** W#2 Competition Scraping & Deep Analysis (🔍)
**Status:** 🟢 Implementation phase — initial interview FROZEN 2026-05-25 (this doc); Workstream 2 Amazon Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-26 via build commit `422436f` (foundation session bundling §A.16 schema migration + shared content-script infra + Amazon DOM walker) + Workstream 2 Amazon Session 2 ✅ DONE-AT-CODE-LEVEL 2026-05-27 via build commit `1830074` (cross-star navigation loop + helpful-count sort within star + `Customers say` AI-summary block capture + Shadow DOM trigger popup with per-URL cap override) + Workstream 2 Amazon ✅ DEPLOYED-AND-VERIFIED 2026-05-28 on vklf.com end-to-end via `workflow-2-competition-scraping` → `main` (initial deploy ff-merge `1914171..0ef8340` carrying Sessions 1 + 2 + intervening doc-batches under ONE Rule 9 gate + 3 fix-forward commits FF#1 `8bc2e7e` accept /dp/<ASIN> dispatch + FF#2+#3 `b55cdbd` bundled trigger-modal-per-star-checkboxes + progress-indicator-per-star-breakdown + FF#4 `f6944db` pageNumber-increment pagination shipped under 3 additional Rule 9 deploy gates; final director PASS verdict after FF#4 RESOLVES the Sessions 1 + 2 standing carry-over) + **Workstream 4 Captured Reviews UI extensions Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-29 on `workflow-2-competition-scraping` via build commit `e89ae50` (9 files +2162/-43) — all 3 §C.4 pieces shipped in ONE session per Rule 14f scope picker outcome — star-count counter-bar with click-to-filter per §A.14 + drag-to-reorder via the `sortRank Int?` column (reusing the P-46 W3 S3 @dnd-kit shared debounced-mutation Pattern from 2026-05-23-f) per §A.5 + bulk-delete with multi-select checkboxes + confirm modal + new batch-delete API route per §A.6; directly addresses 2026-05-28 Phase 4 verification issue #3; 52 new src/lib tests + 2 new API routes; ZERO Rule 9 deploy gates this session (build commit stays on workflow branch until W4 deploy session per (a.97))** + **Workstream 4 ✅ DEPLOYED-AND-VERIFIED 2026-05-29 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` (ff-merge `a40e4ba..1e610ce` under ONE Rule 9 deploy gate; Phase 4 director real-Chrome verification 6/6 PASS)** + **Workstream 2 eBay sub-cluster ✅ DEPLOYED-AND-VERIFIED 2026-05-30 on vklf.com end-to-end via `workflow-2-competition-scraping` → `main` — Session 1 build commit `11e99e1` + 5 fix-forward commits all on main under 5 separate Rule 9 deploy gates (FF#1+#2 bundled + FF#3 + FF#4 diagnostic + FF#5 empirically-verified fix); director Phase 4 PASS verdict on FF#5 "Everything worked perfectly"; eBay sub-cluster now fully ✅ DEPLOYED-AND-VERIFIED with no remaining scope; §C.2 estimate "~3-4 sessions" compressed into "1 calendar day"; eBay Sessions 2 + 3 from §C.2 outline CLOSED** + **Workstream 2 Etsy sub-cluster ✅ DEPLOYED-AND-VERIFIED 2026-05-31 on vklf.com end-to-end via `workflow-2-competition-scraping` → `main` — Session 1 build commit `c572a42` URL-construction approach BUSTED in Phase 4 because Etsy's "View all reviews for this item" overlay loads via AJAX on the same listing URL with no separate URL for filters or pagination → architecture pivot via FF#1 `67aeacd` to live-DOM driver based on director's paste of the 41 KB overlay outerHTML → FF#1 BUSTED silently → diagnostic-instrumentation FF#2 `a3107b6` per yesterday's eBay FF#4 Pattern → FF#3 `41b03c5` empirical fix the WIN (restrict `findOverlayContainer` to `.deep-dive-sheet` only + reject hidden variants + remove FF#2 instrumentation); director Phase 4 PASS verdict on FF#3 "Everything worked perfectly this time" (identical phrasing to yesterday's eBay FF#5 PASS); Etsy sub-cluster now fully ✅ DEPLOYED-AND-VERIFIED with no remaining scope; §C.2 estimate "~2-3 sessions" compressed into "1 calendar day"; Etsy Sessions 2 + 3 from §C.2 outline CLOSED** + **Workstream 2 Walmart sub-cluster ✅ DEPLOYED-AND-VERIFIED 2026-06-01 on vklf.com end-to-end via `workflow-2-competition-scraping` → `main` — Session 1 build commit `3316eaa` URL-construction approach + `LISTING_PAGE_PATH` regex too restrictive in Phase 4 (Walmart serves BOTH `/ip/<id>` slugless and `/ip/<slug>/<id>` slug+id; original regex required slug) → FF#1 `3321690` loosen-regex fix from director's URL paste → FF#1 still BUSTED in row-walker phase (all 14 candidate selectors returned 0 in selector probe) → FF#2 `c953e71` diagnostic-instrumentation per yesterday's Etsy FF#2 Pattern THIRD consecutive day → FF#3 `86cbfbd` empirical fix the WIN (anchor on per-review body `data-testid="enhanced-review-content"` + walk up via `closest('.overflow-visible')` + screen-reader-only `<span class="ld_Ec">N out of 5 stars review</span>` star + `<h3>` null-when-missing title + `<p>` body inside `enhanced-review-content` + `aria-label` reviewer name with word-boundary regex filter `/\b(review|...)\b/i` + `.f7.gray` date + removed `findWalmartReviewsContainer` + removed FF#2 instrumentation + test file rewritten); director Phase 4 PASS verdict on FF#3 "Everything passed" (third consecutive day the Diagnostic-instrumentation FF Pattern delivered a PASS verdict on the empirical-fix FF); Walmart sub-cluster now fully ✅ DEPLOYED-AND-VERIFIED with no remaining scope; §C.2 estimate "~2-3 sessions" compressed into "1 calendar day"; Walmart Sessions 2 + 3 from §C.2 outline CLOSED; **CLOSES the entire P-49 W2 per-platform extension extraction arc across all 4 platforms** — Amazon (2026-05-28) + eBay (2026-05-30) + Etsy (2026-05-31) + Walmart (2026-06-01) all now ✅ DEPLOYED-AND-VERIFIED end-to-end on vklf.com; **UNBLOCKS Workstream 5 AI review analysis Session 1** (becomes next-next task per (a.101))**; Workstream 5 AI review analysis Session 1 NEXT per (a.101) on `workflow-2-competition-scraping` per §C.5 implementation outline.
**Branch (design):** `workflow-2-competition-scraping`
**Created:** 2026-05-25
**Created in session:** `session_2026-05-25_reviews-phase-2-design-session` (Claude Code; on `workflow-2-competition-scraping`)
**Pre-graduation gating:** YES — P-49 is the major Phase 2 review-collection + analysis expansion of W#2 announced via director's 2026-05-25 scope-drop directive. W#2 graduation step now further deferred — gated by P-49 closing at the workstream-by-workstream level after P-46 + P-47 + P-48 stutter Session 3 + P-26 + P-27 all close.

**Doc type:** Group B (workflow-specific). Loaded whenever a session works on any P-49 workstream.

**Doc location rationale:** P-49 is a large multi-workstream scope-drop analogous to P-46. A dedicated top-level doc parallels `COMPETITION_DATA_V2_DESIGN.md` (P-46) and `CAPTURED_VIDEOS_DESIGN.md` (P-27/P-45), and keeps `COMPETITION_SCRAPING_DESIGN.md` (3,500+ lines already) from absorbing another large §B-style append history. Future P-49 build sessions read this file directly without grepping into prior W#2 history.

**Related docs:**

- `HANDOFF_PROTOCOL.md` Rule 18 — Interview-cluster + append-only DESIGN doc structure methodology (this doc is its deliverable for P-49).
- `HANDOFF_PROTOCOL.md` Rule 14f — Forced-picker pattern (used 15 times this session, one per interview question; ZERO escape-hatch picks; one Q7 "Other" refinement on the model-version selector).
- `HANDOFF_PROTOCOL.md` Rule 21 + Rule 22 — Pre-design directive scan + Graduated-Tool Re-Entry (executed at session start; the 2026-05-25 capture session's `## Proposed interview question scaffold` in NEXT_SESSION.md was the binding pre-session directive).
- `HANDOFF_PROTOCOL.md` Rule 23 — Change Impact Audit (DESIGN session — no production code; no schema migration yet; flag classified at §A.16).
- `HANDOFF_PROTOCOL.md` Rule 24 — Pre-capture search (executed during the 2026-05-25 Reviews Phase 2 scope-expansion capture session that produced this design's launch directive; preserved verbatim in P-49 ROADMAP entry).
- `HANDOFF_PROTOCOL.md` Rule 27 — Playwright forced-picker for verification (will fire per-workstream implementation session as needed; for design session: not applicable since no code lands).
- `HANDOFF_PROTOCOL.md` Rule 30 — Session bookends (this session ran the start + end plain-terms summaries per director's 2026-05-21 directive).
- `ROADMAP.md` P-49 polish-backlog entry — the original capture + director's verbatim per-platform DOM specs that this design ingests.
- `ROADMAP.md` P-46 polish-backlog entry — the prior W#2 hub-and-spokes scope this doc mirrors structurally.
- `ROADMAP.md` P-48 polish-backlog entry — the screen-recording stutter Session 3 (Diagnostic #2) opportunistically interleavable with P-49 build sessions.
- `ROADMAP.md` P-50 polish-backlog entry — Condition Pathology placeholder card (small `main`-branch session; not on the P-49 critical path).
- `COMPETITION_DATA_V2_DESIGN.md` — the §A frozen-shape precedent this doc mirrors. §A.1 (deferred-2026-05-23-then-resolved-2026-05-25 cross-reference to this doc); §A.1b (v1 Reviews surface shipped via P-46 W2 Session 4 2026-05-28); §A.4 (ComprehensiveCompetitorAnalysis page — home for P-49 W5 cross-Type + cross-Project AI surfaces per A.10 below); §A.5 (TipTap JSON storage — reused for AI analysis output rendering per A.9 below); §A.11 (consolidated schema list — extended in A.16 below).
- `COMPETITION_SCRAPING_DESIGN.md` §A — the prior W#2 Phase 1 frozen design this Phase 2 collection-and-analysis automation builds on.
- `COMPETITION_SCRAPING_DESIGN.md` §B (P-23 §B 2026-05-19-g; P-45 §B 2026-05-22-i; P-47 §B 2026-05-24-d; P-46 W5 §B 2026-05-24-c+e+f) — extension content-script architecture precedents this design's Workstream 2 per-platform extraction reuses (URL-prefix dispatch + Shadow DOM mounts + `makeTextareaField()` helper extension pattern).
- `AUTO_ANALYZE_PROMPT_V2.md` / `V3.md` / `V4.md` (W#1 Keyword Clustering AI prompt history through 4 iterations) — relevant precedent for W5 AI analysis prompt evolution; expect the per-product two-sweep prompt to iterate through several versions before stabilizing.
- `MODEL_QUALITY_SCORING.md` — W#1 AI output stability-scoring algorithm; relevant precedent for measuring per-product review-summary quality across model versions (Opus 4.6 vs 4.7 selectability per A.7).
- `INPUT_CONTEXT_SCALING_DESIGN.md` — W#1 Tiered Canvas Serialization batch-sizing pattern; directly reused by W5 per A.8.
- `prisma/schema.prisma` — the live schema P-49 W2 first session extends with the §A.16 migration (additive; zero data backfill needed).
- `src/lib/shared-types/competition-scraping.ts` — wire types extended additively for new fields and models per §A.16.
- `extensions/competition-scraping/src/lib/content-script/` directory — where the per-platform extraction modules from W2 land (one new module per platform alongside existing `text-capture-form.ts` / `image-capture-form.ts` / `video-capture-form.ts` / `url-add-form.ts`).
- `feedback_recommendation_style.md` — Most-thorough/reliable recommendation principle; every Rule 14f picker this session surfaced the recommended path.
- `feedback_default_to_recommendation.md` — Director's standing default to accept recommendation; honored at all 15 pickers (14 direct-Yes + 1 Q7 refinement on the model-version selector).
- `feedback_approval_scope_per_decision_unit.md` — 2-push design-session pattern: doc-batch push to workflow branch + ff-merge push to main for doc-batch.
- `feedback_session_bookends_plain_summary.md` — Rule 30 plain-terms session-bookend directive (3 mandatory plain-terms sections at top of NEXT_SESSION.md + at session-start summary).

**Structure (per HANDOFF_PROTOCOL Rule 18):**

- **§A — Initial design-session interview answers.** Frozen at end-of-session (this session). Authoritative initial spec for P-49 v1. 15 questions answered + 6 auxiliary sub-sections (A.16-A.21).
- **§B — In-flight refinements (append-only).** Empty at end of interview. Future P-49 build sessions append entries here, never edit prior ones or §A.
- **§C — Per-workstream implementation outlines.** Five subsections (one per workstream W1-W5; W3 marked DROPPED per Q1 outcome) with file-level scope, session estimates, dependencies, test approach, deploy mechanics, and cross-references back to §A decisions.

---

## §A — Initial design-session interview answers (FROZEN 2026-05-25)

### A.0 Interview meta

- **Interview format:** 15 questions captured in the `## Proposed interview question scaffold` section of `docs/NEXT_SESSION.md` (written 2026-05-25 by the prior `session_2026-05-25_reviews-phase-2-capture-session`). Walked one-at-a-time with a Rule 14f forced-picker fired per question per the design-session task shape from the launch prompt. Each picker offered (A) Recommended + (B) alternative + (C) alternative + Other (auto-provided escape hatch).
- **Pre-design directive scan (Rule 21):** the launch prompt (NEXT_SESSION.md written 2026-05-25) carried 1 binding constraint — Reviews Phase 2 Design Session must be PURE DESIGN with zero code, zero deploys, zero Rule 9 gates. ROADMAP P-49 entry + P-46 W#2 Phase 2 design doc precedent + `feedback_default_to_recommendation.md` + `feedback_recommendation_style.md` carried into the per-question walkthrough.
- **Sister-workflow state at interview time:** W#1 (Keyword Clustering) on `main`, no schema-change-in-flight; W#2 on `workflow-2-competition-scraping`, schema-change-in-flight = NO this entire session (design-only).
- **Forced-picker outcomes captured this session:** 15 decisions locked (14 direct-Yes to Recommended + 1 Q7 "Other" director-refinement on the model-version selector preserving the underlying Opus-throughout Recommended path). See §A.1–§A.15.
- **Director's standing pickup at session-start:** Reviews Phase 2 Design Session was the locked next-session task per (a.92) RECOMMENDED-NEXT closed by the prior 2026-05-25 capture session. No Rule 14f session-start picker fired (director-confirmed the task via "go ahead" after the Step 7b plain-terms summary).

---

### A.1 Q1 — Collection method (extension vs crawler)

**Director's pick:** "Extension only — defer crawler entirely (recommended)."

**Locked decision:** All per-platform review collection happens via the browser extension running in director's logged-in browser session at director's IP address. No server-side crawler infrastructure is built or planned in P-49. Workstream 3 (Crawler infrastructure) DROPS from P-49 entirely; P-49 becomes 4 workstreams instead of 5 (W1 Design Session this session + W2 per-platform extension extraction + W4 Captured Reviews UI extensions + W5 AI review analysis system). The W3 placeholder remains in §C with a DROPPED status note for traceability and to preserve W#-numbering across docs.

**Alternatives considered:**
- (B) Extension primary + crawler for non-Amazon platforms only (eBay/Etsy/Walmart) — rejected for the cost + complexity of maintaining two collection codebases AND still incurring anti-bot risk on 3 platforms.
- (C) Crawler-first across all 4 platforms with extension as fallback — rejected for substantial Amazon anti-bot risk that could affect director's seller account, significant ongoing infrastructure cost ($100-500/month for proxies + captcha-solving + fingerprint randomization), and ongoing maintenance overhead as platforms update their anti-bot defenses.
- (D) Defer Q1 (design crawler later as separate session if collection volume proves insufficient) — not surfaced as a separate option this session per the 3-option-plus-Other Rule 14f shape; subsumed under "Other" if director had wanted to defer.

**Reasoning (director-supplied during the 2026-05-25 scope-expansion capture session, preserved verbatim):** *"Both methods should ensure that we don't get flagged by amazon for going against their terms or doing something wrong. That means our functionality should be very close to real world human user sitting where admin is."* Extension-method runs in director's logged-in browser session at director's IP — behaviorally indistinguishable from a power user; lowest anti-bot risk on all 4 platforms; no proxy/captcha-solving/fingerprint-randomization infrastructure cost.

**Trade-off:** Collection happens only when director is actively on a platform page (no overnight automated scrapes). Mitigated because director's session-by-session use of the extension already aligns with the platforms director cares about most at the moment.

**Cascade impact:**
- **Workstream 3 (Crawler infrastructure) DROPS entirely.** ~5-10 sessions saved. §C.3 below marks W3 as DROPPED with a brief note for traceability.
- **Q3 (scrape job orchestration) constrained** to in-page extension worker since crawler-driven orchestration is no longer in scope.
- **Q15 (anti-bot defensive posture) reinforced** — extension-only is already 90% of the way to "behaviorally indistinguishable from a real user"; Q15 locks the remaining 10% (random pagination delays + captcha-aware abort).

---

### A.2 Q2 — Per-platform priority order

**Director's pick:** "Amazon → eBay → Etsy → Walmart (recommended; matches director's stated order)."

**Locked decision:** Workstream 2 builds the 4 per-platform extension extraction modules in the order Amazon → eBay → Etsy → Walmart. Each platform is its own build cluster of approximately 3-4 sessions, for ~12-16 sessions total in W2.

**Alternatives considered:**
- (B) Walmart → Etsy → eBay → Amazon (simplest-first) — rejected because pushing Amazon's complexity to the end risks needing rework of the simpler platforms if Amazon-specific concerns (helpful-count sort + per-star pagination shape) surface only after the easier 3 platforms are locked.
- (C) Pair-wise (Amazon+Walmart together + eBay+Etsy together) — rejected because the first pair would balloon to ~4-5 sessions and harder to test one platform at a time.
- (D) Director picks per-platform readiness — not surfaced as a separate option; subsumed under "Other" if director's catalog readiness shifts between sessions.

**Reasoning:**
- (a) Most-complex DOM first: Amazon's per-star pagination URL (`https://www.amazon.com/product-reviews/<ASIN>/...&filterByStar=critical&pageNumber=N`) + helpful-count + `Customers say` block + Top reviews US/other countries is the hardest case. Building it first means we tackle the hardest case while we're freshest and it forces the extraction patterns to be flexible enough for the easier three.
- (b) Director explicitly listed Amazon first in 2026-05-25 scope drop.
- (c) Amazon is likely director's highest-value competitor surface for review intelligence; shipping Amazon first means the most-valuable analysis output comes online soonest.
- (d) Patterns built for Amazon (per-star pagination loop, helpful-count sort, "View 10 more reviews" click-loop) translate downward to the simpler platforms — Walmart's per-star query-param URL reuses the per-star-loop pattern; Etsy's overlay paginated at ~8/page reuses the "View more" click pattern; eBay's feedback-URL paginated at ~25/page reuses the body-only-capture pattern with the Neutral → 3-star + Negative → 1-star mapping per the director's verbatim spec.

**Trade-off:** Longest first cycle (~3-4 sessions) before director sees the second platform land. Mitigated because Amazon is director's highest-value surface, so the first cycle's output is also the highest-value.

**Cascade impact:**
- **Workstream 2 sequencing locked.** ~12-16 sessions total for W2.
- **W2 Session 1 (Amazon first build session) bundles the §A.16 schema migration** as the foundation step (mirrors the P-46 W1 Schema-as-foundation Pattern from 2026-05-24); schema-change-in-flight flag flips YES at that session.

---

### A.3 Q3 — Scrape job orchestration

**Director's pick:** "In-page only — synchronous within the open tab (recommended)."

**Locked decision:** The scrape runs entirely inside the browser tab that's showing the review page. The content-script walks the DOM, paginates ("View 10 more reviews" loop per Amazon; per-star URL navigation per Walmart; overlay pagination per Etsy; feedback-URL pagination per eBay), and inserts captured reviews directly via the existing Supabase auth in the page session. A small progress indicator UI mounted inside a Shadow DOM root (per the P-47 Shadow DOM mount pattern shipped 2026-05-24-d) sits in the corner of the page showing "X of Y reviews collected" + Cancel button. If director closes the tab mid-scrape, the scrape stops cleanly and any reviews already inserted stay saved.

**Alternatives considered:**
- (B) Background extension worker — close-tab-and-walk-away — rejected because extension service workers can't read third-party DOM directly; they'd have to open a hidden tab to do the work, which is itself a bot-behavior signal on Amazon (contradicts the Q1/Q15 anti-bot constraint).
- (C) Hybrid (in-page initial grab + background pagination) — rejected for code complexity (roughly 2× the test surface) and because the background-worker pagination half inherits the same anti-bot concern as option B.
- (D) Crawler-driven — not applicable since Q1 locked extension-only.

**Reasoning:** Director's session-by-session use of the extension already implies director is sitting at the page when scraping anyway. The in-page approach is the cleanest fit for the Q1 constraint ("very close to real world human user sitting where admin is"). The Shadow DOM progress indicator gives director live visibility into the scrape's progress and a clean cancel affordance.

**Trade-off:** Locks the tab during scrape (typically 30 seconds to 5 minutes depending on per-star cap × 5 stars × per-page review count + Q15 conservative 1-3s pagination delays). If director closes the tab, the scrape aborts (partial inserts already saved stay saved). Mitigated by the live progress indicator + cancel affordance.

**Cascade impact:**
- **Q14 progress UI surface paired with the star-count breakdown.** The Shadow DOM progress popup and the existing Captured Reviews section's star-count counter-bar (Q14) can share a single visual surface or be designed as adjacent affordances. Defer to W4 build session.
- **Q15 anti-bot defensive posture reinforced** — in-page execution is the cleanest "real user" behavior shape.
- **No new background-worker code needed** in W2; all per-platform module code lives in content-script.

---

### A.4 Q4 — Per-star scrape cap UX

**Director's pick:** "Per-URL setting + per-trigger override (recommended)."

**Locked decision:** Each saved `CompetitorUrl` row carries a new `reviewScrapeCap Int? @default(200)` column (per §A.16 schema additions). The cap is editable via the click-to-edit cell editors shipped in P-46 W3 Session 2 (2026-05-23-e) — the new column appears as one of the editable cells in the Competition Data table + as an editable field on the URL detail page. When director triggers a scrape (right-click "Scrape reviews for this URL" or whatever trigger shape lands at W2 Session 1 — likely a small popup mounted in the same Shadow DOM as the progress indicator per Q3), the trigger popup shows the URL's saved cap as the default value in a small number-input field. Director can override that default for the one scrape run without changing the saved per-URL setting.

**Alternatives considered:**
- (B) Per-Project global cap (lives in existing `UserTablePreferences`) — rejected for less flexibility (some products have 10 reviews, others have 50,000; one number can't be optimal for both).
- (C) Per-trigger only (no persisted setting) — rejected for friction (director would type the cap on every scrape).
- (D) Fixed at 200/star with no override — rejected for inflexibility.

**Reasoning:** Per-URL granularity matches real-world need. Reuses existing P-46 W3 Session 2 click-to-edit cell editors (no new UI to learn). The per-trigger override accommodates one-off "I only want a quick 20 reviews to see what's there" scenarios.

**Trade-off:** Small additive schema change (one nullable integer column with default). Zero migration risk; existing URL rows render with the 200 default until director edits.

**Cascade impact:**
- **§A.16 schema adds** `CompetitorUrl.reviewScrapeCap Int? @default(200)`.
- **W2 per-platform modules** all read the per-URL cap at trigger time + accept the override value from the trigger popup.
- **W4 UI extensions** include the cap as one of the editable cells in the Competition Data table column visibility set (per the W3 Session 2 click-to-edit pattern).

---

### A.5 Q5 — Server-side review reordering

**Director's pick:** "Drag-to-reorder, persists per-user across devices (recommended)."

**Locked decision:** Each captured review carries a new `sortRank Int?` column (per §A.16 schema additions). The Captured Reviews UI on the URL detail page (shipped in P-46 W2 Session 4 2026-05-28; extended by W4 per Q14 below) gains a drag handle (⋮⋮) at the left edge of each review card. Director can grab any review and drag it up or down to reorder, both within a star group and across star groups. Reorder persists per-user-per-product across all devices via a new PUT route to the existing `urls/[urlId]/reviews` collection endpoint with a sortRank-update payload. Reuses the `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` drag-and-drop libraries shipped in P-46 W3 Session 3 (2026-05-23-f) for the Competition Data table row reorder + the shared debounced-mutation lifecycle Pattern memorialized in §B 2026-05-23-f of `COMPETITION_DATA_V2_DESIGN.md`.

**Alternatives considered:**
- (B) Auto-sort by helpful-count (Amazon only) — rejected for cross-platform asymmetry (eBay/Etsy/Walmart don't supply helpful-count) and for removing director's ability to surface a specific review director finds important.
- (C) Defer reorder entirely; ship Q4 cap + Q14 star-count UI first — rejected because the schema cost is small (one nullable integer column) and the drag-and-drop infrastructure already exists from P-46 W3 Session 3.

**Reasoning:** Director's daily competitive-intel use of the Captured Reviews section is enriched by being able to push the most-relevant review to the top (e.g., the review that names a specific competitor's product flaw director wants to remember). The drag-and-drop UX is already familiar from the Competition Data table row reorder. Reusing the shared debounced-mutation lifecycle Pattern minimizes new code.

**Trade-off:** Small additive schema change (`sortRank Int?` on CapturedReview). Zero migration risk; existing review rows render in insertion order until director drags one.

**Cascade impact:**
- **§A.16 schema adds** `sortRank Int?` on `CapturedReview`.
- **W4 implementation outline gains a drag-and-drop session** for the Captured Reviews section (~1 session inside W4's ~2-3 session estimate).
- **No new npm dependencies** — `@dnd-kit/*` libraries already shipped in P-46 W3 Session 3.

---

### A.6 Q6 — Bulk-delete affordance

**Director's pick:** "Multi-select checkboxes + bulk-delete-with-confirm modal (recommended)."

**Locked decision:** Each captured review card in the Captured Reviews section gains a small checkbox at the left edge. When director checks one or more reviews, a "Delete X selected" button appears at the top of the section (a la the mid-toolbar pattern). Clicking it shows a confirm modal: "Delete X reviews? This can't be undone." On Yes, all selected reviews delete in one batched network request via a NEW batch-delete API route (mirrors the per-review DELETE route shipped in W2 Session 4 2026-05-28 but accepts an array of review IDs). The checkbox state lives in component-local state (no schema change for selection state).

**Alternatives considered:**
- (B) Filter-then-delete-all-shown — rejected for inability to hand-pick which subset to delete within a filtered group; director might want to delete 20 of 23 1-star reviews and keep 3 keepers.
- (C) Per-row only (no bulk; current shipped state from W2 Session 4) — rejected for high friction (cleaning 50 spam reviews = 50 clicks + 50 confirms).

**Reasoning:** Standard multi-select pattern director already understands from the W3 Competition Data table bulk operations. Covers both spam-cleanup workflows (check all 1-star then delete) and hand-picked deletion (check 5 specific reviews across multiple star groups then delete). One batched API request keeps the network cost low.

**Trade-off:** New batch-delete API route (~50 LOC); checkbox-state UI addition to the existing CapturedReviewCard component.

**Cascade impact:**
- **W4 implementation outline gains a checkbox-state + bulk-delete affordance** (~1 session inside W4).
- **NEW batch-delete API route** at `/api/projects/[projectId]/competition-scraping/reviews/batch-delete` (POST with `{ reviewIds: string[] }` payload) — mirrors the per-review DELETE route shipped in W2 Session 4.
- **No schema change** — bulk delete uses the existing CapturedReview row deletion mechanism.

---

### A.7 Q7 — AI model + cost guards (with director refinement)

**Director's pick:** "I want to have the choice to use Opus 4.6 or Opus 4.7" — refinement on the Recommended (A) "Claude Opus 4 throughout + per-run + per-Project monthly caps."

**Locked decision:** All 3 AI analysis levels (per-product two-sweep / cross-Type pooled / cross-everything competitive landscape) use Claude Opus, with a **model-version selector** in the trigger UI (per Q11 below) letting director pick Opus 4.6 or Opus 4.7 per analysis run. Default selection is Opus 4.7 (the current flagship as of session knowledge cutoff January 2026). Per-run cost cap (refuse to start if estimated cost > $X) + per-Project monthly cost cap (alert + block if cumulative monthly spend > $Y) both enforced via the same pattern as W#1 Keyword Clustering (`docs/MODEL_QUALITY_SCORING.md` per-Project cost-cap precedent). Cost caps default to $10/run + $50/Project/month with director-editable thresholds via a per-Project settings surface (TBD per first W5 build session — likely lives alongside the existing AI-tool settings on vklf.com).

**Alternatives considered:**
- (B) Hybrid (Opus for per-product, Sonnet for cross-Type/cross-Project) — not picked because director wants per-run model choice on the per-product level (where most reading happens) without locking the cross-Type + cross-Project to a cheaper model that may miss signals. The selector UX accommodates this by letting director pick per-run anywhere.
- (C) Claude Sonnet 4 throughout — rejected for quality drop on nuanced review reading.
- (D) GPT-4o or Gemini-Pro — not surfaced this session; PLOS infrastructure is Anthropic-only; introducing a second provider adds operational complexity not justified by P-49 alone.

**Reasoning:**
- (a) Opus is the most-thorough/reliable model for nuanced review summarization (sarcasm, returns context, edge-case complaints).
- (b) Per-run model selector gives director cost-vs-quality control without locking in either choice at design time.
- (c) Opus 4.7 default reflects the current flagship; Opus 4.6 selectable as a calibration data point or cost-saving fallback.
- (d) Cost-cap pattern reuses W#1 infrastructure; one less thing to design.

**Trade-off:** Opus is ~5× more expensive than Sonnet ($15/M input + $75/M output vs $3/M + $15/M). Mitigated by the cost-cap pattern.

**Cascade impact:**
- **Q11 trigger UX gains a small "Model" dropdown** next to the "Analyze" button on each surface (URL detail page per-product / per-Type sections / cross-everything).
- **Q12 caching keys include the model version** so re-running with a different model produces a fresh cache entry (the `reviewsHash` + `modelVersion` together form the fingerprint).
- **§A.16 schema's `ReviewAnalysis` model stores `modelVersion String`** for audit + cost attribution per run.

**Estimated cost (informational):**
- Per-product summary of ~1,000 reviews: $0.50-$1.50 per run (Opus 4.7); ~$0.40-$1.20 (Opus 4.6).
- Per-Type analysis pooling ~5 products × 1,000 reviews each (already-summarized inputs): $1-3 per run.
- Cross-everything competitive landscape pooling all per-Type summaries: $5-15 per run.
- With $50/Project/month cap, expect ~40-100 per-product runs + ~10-15 cross-Type runs + ~3-5 cross-everything runs per Project per month at reasonable usage.

---

### A.8 Q8 — Two-sweep batch sizing

**Director's pick:** "Adaptive — fill ~80% of model context per batch (recommended)."

**Locked decision:** Per-product first-sweep AI calls dynamically size their batches based on token count, targeting ~80% of Opus's 200,000-token context window per batch. The remaining ~20% leaves headroom for the system prompt + few-shot examples + response tokens. Concretely: a token-counter helper measures each batch as it's built; reviews are added until the batch reaches the threshold; the batch is sent; the next batch begins. Typical batch sizes end up around 200-1000 reviews per call depending on average review length (Amazon reviews tend to be longer; eBay/Walmart shorter). Second-sweep merges all per-batch summaries into a comprehensive per-product summary; second-sweep input is the concatenation of first-sweep outputs, sized via the same adaptive heuristic.

**Alternatives considered:**
- (B) Fixed 100 reviews per batch — rejected for not scaling to high-review Amazon products (50,000 reviews → 500 first-sweep calls → 80+ minutes wall-clock at 10s/call + ~$25-75 cost per product summary).
- (C) Fixed 500 reviews per batch — rejected because long Amazon reviews can push a 500-batch past Opus's window, requiring a fallback-to-smaller-batch handler that adds complexity without the principled approach of adaptive sizing.
- (D) Defer batch sizing to first W5 build session — rejected because the W#1 INPUT_CONTEXT_SCALING_DESIGN.md precedent makes this decision low-risk to lock now.

**Reasoning:**
- (a) Mirrors W#1 Keyword Clustering's `INPUT_CONTEXT_SCALING_DESIGN.md` "Tiered Canvas Serialization" pattern that's already proven in production through 4 prompt iterations.
- (b) Adaptive batching minimizes total AI call count = minimum total cost + minimum total wall-clock time.
- (c) Future-proofs against model context-window growth (when Opus 4.8 or beyond ships with a larger window, the adaptive heuristic auto-scales without prompt changes).

**Trade-off:** Token-counter + batch-sizer adds ~1 build session inside W5 (probably the foundation primitive for the whole AI workstream, akin to W1 Schema-as-foundation in P-46).

**Cascade impact:**
- **W5 Session 1 likely builds the token-counter + batch-sizer** as the foundation primitive before any per-level analysis surfaces land.
- **Q12 caching keys include batch-size** in the fingerprint so re-runs at different model versions (which have different context windows) produce consistent cache behavior.
- **Reuses W#1 INPUT_CONTEXT_SCALING_DESIGN.md token-counting helpers** if extractable; otherwise builds parallel-component primitive (likely cleaner since W#1's helpers are Keyword-Clustering-specific in their batch-content structure).

---

### A.9 Q9 — AI analysis output shape

**Director's pick:** "Rich-text TipTap JSON (recommended)."

**Locked decision:** All 3 AI analysis levels emit their output as a TipTap JSON document. Stored as `Json` column on the new `ReviewAnalysis.analysisJson` field (per §A.16 schema). Rendered via the existing `RichTextEditor` (read-mode via the `AnalysisReadView` shipped in P-46 W2 Sessions 1+3 and W4 Sessions 1+2). Director can hand-edit any AI summary using the same TipTap editor (edit-mode toggles the readonly flag off). Internal hyperlinks via the `#url/<urlId>` shorthand from W4 Session 2 (2026-05-25) work for free in the AI output — the AI can be prompted to reference specific products by name + `#url/<urlId>` link, and director clicking the link navigates to the URL detail page.

**Alternatives considered:**
- (B) Structured JSON with named fields (`{pros, cons, commonComplaints, commonPraise, notableQuotes}`) — rejected for rigid shape (adding a 7th field needs a schema migration), incompatibility with the existing TipTap rendering pipeline (needs new custom renderer per UI surface), harder to hand-edit, and inconsistency with the W4 Comprehensive Analysis page which is already rich-text.
- (C) Both (structured internally + TipTap for display) — rejected for 2× storage cost, more complex AI prompt (must emit 2 formats per run = ~1.5× cost), and more code paths to maintain.
- (D) Plain markdown — rejected because doesn't fit the existing rich-text editor rendering pipeline and loses the internal-hyperlink affordance.

**Reasoning:**
- (a) Consistent with every other Analysis surface on the site (per-item Analysis boxes on Captured Text/Image/Video/Reviews from P-46 W2; URL-level + per-category Overall Analysis boxes from W2 Session 3; Comprehensive Competitor Analysis page from W4).
- (b) Zero new rendering code needed (reuses RichTextEditor in read-mode).
- (c) Hand-editability is critical for AI outputs — director may want to tweak a summary, add a note, or correct a misread.
- (d) Internal hyperlinks via `#url/<urlId>` shorthand let AI cross-reference specific products in cross-Type + cross-everything analyses, enabling click-through navigation.

**Trade-off:** AI prompt design must guide the model to emit valid TipTap JSON structure (headings, bullet lists, bold, links). Mitigated by the W#1 Keyword Clustering precedent of guiding Claude to emit structured outputs.

**Cascade impact:**
- **§A.16 schema's `ReviewAnalysis.analysisJson Json` field is TipTap doc shape** validated via the existing `isValidAnalysisPayload` trust-boundary guard from P-46 W2 Session 1 (`tiptap-helpers.ts`).
- **No new rendering components** needed in W4 or W5 — reuse `AnalysisReadView` from P-46 W4 Session 1.
- **Internal `#url/<urlId>` hyperlink Pattern** from W4 Session 2 reused for AI-emitted cross-references.

---

### A.10 Q10 — AI analysis UI placement

**Director's pick:** "Per-product on URL detail + per-Type & cross-everything on the existing Comprehensive page (recommended)."

**Locked decision:**
- **Per-product summary** lives on the URL detail page (`src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx`) as a new section below the existing Captured Reviews section. Co-located with the data it summarizes. Uses the same card-list visual treatment as the per-item Analysis boxes.
- **Per-Type summaries** live as a new section on the existing Comprehensive Competitor Analysis page (`src/app/projects/[projectId]/competition-scraping/comprehensive-analysis/page.tsx`, shipped in P-46 W4 Session 1 2026-05-24-b). Accordion-style layout — one collapsible block per unique `type` value in the Project's CompetitorUrl rows, with the AI analysis inside each block.
- **Cross-everything competitive landscape summary** lives as a single section at the top (or bottom — defer to W5 build session) of the Comprehensive Competitor Analysis page. One block, no accordion.

**Alternatives considered:**
- (B) New dedicated `/reviews-analysis` page with all 3 levels in one place — rejected for introducing a new page + new top-level navigation entry, disconnecting per-product analysis from the actual reviews data, and roughly 1 extra build session for the new page scaffolding.
- (C) Per-product on URL detail + per-Type on Competition Data row-expand + cross-everything on Comprehensive page — rejected for the row-expand UI collision with the existing P-46 W3 row-click → URL-detail navigation and harder side-by-side Type comparison.

**Reasoning:**
- (a) Reuses existing surfaces director already navigates daily.
- (b) Per-product summary co-located with the underlying reviews — minimum friction to "see analysis + read source reviews."
- (c) Per-Type + cross-everything on the same page as the existing Comprehensive Analysis is conceptually adjacent (both are "comprehensive views" at different aggregation levels).
- (d) No new pages or navigation entries — minimal cognitive load on director.

**Trade-off:** The Comprehensive Competitor Analysis page grows in vertical length (existing single-doc surface + N per-Type accordion blocks + 1 cross-everything block + the existing P-46 W4 Comprehensive doc). May need a per-section navigation/jump-to affordance if it gets too long; defer to W5 build session.

**Cascade impact:**
- **W5 file scope contained** — extends existing pages rather than creating new ones.
- **W5 per-product surface** lives in `UrlDetailContent.tsx` as a new section + per-product Analyze button + dropdown + cost preview UI.
- **W5 per-Type + cross-everything surfaces** live in the Comprehensive Analysis page as new sections.
- **No new top-level navigation** entry needed.

---

### A.11 Q11 — AI analysis trigger UX

**Director's pick:** "Manual button per surface + model-version dropdown (recommended)."

**Locked decision:** Director initiates each AI analysis run manually via a button on the relevant surface:
- **URL detail page (per-product):** "Analyze reviews" button below the Captured Reviews section + small model-version dropdown next to it (Opus 4.7 default / Opus 4.6) + estimated-cost preview shown before run starts ("~$1.20 — confirm to proceed").
- **Comprehensive page per-Type section:** "Analyze this Type" button at the top of each Type's accordion block + same model + cost-preview UI.
- **Comprehensive page cross-everything section:** "Analyze Project" button at the top of the cross-everything block + same model + cost-preview UI.

Each button click flows: (1) click button → (2) modal opens showing model dropdown + estimated cost + Confirm/Cancel → (3) Confirm starts the run + button changes to "Analyzing… X of Y batches complete" progress indicator → (4) on completion, the new analysis appears inline + the staleness badge from Q12 clears + the button returns to its idle "Re-run" state.

**Alternatives considered:**
- (B) Auto-trigger on review-count threshold — rejected for less director control over cost, harder monthly budgeting, and incompatibility with the Q7 model-version-per-run choice.
- (C) Auto-trigger on every review add — rejected for prohibitively high cost and contradiction with the two-sweep batching design.
- (D) Hybrid (manual button + optional auto-trigger toggle per Project) — rejected for UI complexity without clear value-add over the manual-only baseline.

**Reasoning:**
- (a) Director-controlled cost — no surprise charges.
- (b) Per-run model choice (Q7 refinement) fits cleanly with manual trigger.
- (c) Cost preview before run shifts cost-awareness to the moment of decision (not after the fact).
- (d) Re-running after new reviews added is one click.

**Trade-off:** Director must remember to re-run after collecting new reviews. Mitigated by the Q12 "out of date" badge that surfaces staleness automatically.

**Cascade impact:**
- **Q12 caching gets a clean "explicit re-run" affordance** — no auto-trigger means no implicit cache invalidation logic needed beyond the fingerprint check.
- **§A.16 schema's `ReviewAnalysis.runByUserId` + `costUsdMicros`** capture audit data per click.
- **Model-version dropdown component** (from Q7) is a small reusable component used on all 3 AI trigger surfaces.

---

### A.12 Q12 — AI analysis caching + re-run

**Director's pick:** "Cache by review-set fingerprint + 'out of date' badge + explicit re-run button (recommended)."

**Locked decision:** Each saved `ReviewAnalysis` row stores a `reviewsHash String` field — the SHA-256 hash of the sorted list of review IDs included in the analysis, concatenated with the model version used. When director visits a page that displays an analysis (URL detail page per-product / Comprehensive page per-Type / cross-everything), the page computes the current reviews-set hash (sorted review IDs for the relevant scope + current model selection) and compares to the cached analysis's hash:
- **Match:** Analysis is fresh; render as-is.
- **Mismatch:** Analysis is stale (new reviews added, some deleted, or director would pick a different model). Render the cached analysis as-is + display an orange "Out of date — N new reviews since this analysis" badge above it with a "Re-run" button. Click → opens the trigger modal from Q11 with the current model selection + cost preview.

The staleness check is a single database query (fetch the cached `reviewsHash` field) + a local hash computation; no AI cost incurred to check.

**Alternatives considered:**
- (B) Cache without staleness check — rejected for easy-to-act-on-stale-insights failure mode.
- (C) Cache + auto-refresh on every page load if stale — rejected for surprise charges per page load and 10-30s page-load latency whenever staleness detected.
- (D) No caching (every page view triggers a new run) — rejected as prohibitively expensive at scale.

**Reasoning:**
- (a) Lowest cost path — analysis cached forever until director chooses to re-run.
- (b) Director always sees prior analysis instantly (zero page-load latency for cached analyses).
- (c) Staleness is always visible (the badge surfaces it) but never forces a cost-incurring action.
- (d) Re-running with a different model is naturally handled by the hash including the model version.

**Trade-off:** Director responsible for choosing when to re-run. Mitigated by the staleness badge always being visible when stale.

**Cascade impact:**
- **§A.16 schema's `ReviewAnalysis.reviewsHash String` + `modelVersion String`** together form the cache key.
- **W4 implementation outline gains a staleness-badge component** that lives above each AI analysis surface (per-product, per-Type, cross-everything).
- **Hash computation helper** (`computeReviewsHash(reviews, modelVersion)`) lives in `src/lib/competition-scraping/review-analysis-cache.ts` (new file in W5 Session 1).
- **No background job needed** to maintain freshness — pull-on-page-load with cheap hash compare.

---

### A.13 Q13 — Schema additions (consolidated)

**Director's pick:** "Full package as outlined — one discriminated `ReviewAnalysis` table + `CapturedReview` field additions + `CompetitorUrl.reviewScrapeCap` (recommended)."

**Locked decision:** All P-49 schema changes are locked at this design session. The first build session (W2 Session 1 — Amazon per-platform module) bundles the schema migration as its foundation step (mirrors the P-46 W1 Schema-as-foundation Pattern from 2026-05-24). Schema-change-in-flight flag flips YES at that session; flips NO at the W2 Amazon deploy session.

See §A.16 below for the canonical consolidated schema additions list with full Prisma field definitions.

**Alternatives considered:**
- (B) 3 separate per-level analysis tables (PerProductReviewAnalysis + PerTypeReviewAnalysis + PerProjectReviewAnalysis) — rejected for 3× the migration work, 3× the downstream code paths, and harder to add a 4th analysis level later.
- (C) Minimal (only the `source` enum value addition; defer all other schema additions to per-workstream sessions) — rejected because each subsequent build session would face its own mid-build schema decision, risking incremental drift and reducing the design session's value.

**Reasoning:**
- (a) Locks all schema decisions at this design session so per-platform build sessions don't get derailed by mid-build schema work.
- (b) Single discriminated `ReviewAnalysis` table keeps the data model clean while serving all 3 AI surfaces — adding a 4th aggregation level later (e.g., per-Star-rating-cross-product) is one new enum value + one migration.
- (c) All additions are additive + nullable or defaulted = zero-risk migration; no data backfill needed.

**Trade-off:** Single migration touches multiple existing tables + adds one new table. Mitigated by additive-only shape (no data backfill needed).

**Cascade impact:**
- **Schema-change-in-flight flag flips YES at W2 Session 1 (Amazon)** — when `prisma db push` runs the migration.
- **§A.16 below carries the canonical Prisma field definitions** for the migration.
- **W2 Amazon Session 1 bundles the schema migration** as the foundation step (parallel to P-46 W1's role; W2 Session 1 is effectively a "Schema + first per-platform module" hybrid session, estimated ~3-4 sessions for the Amazon cluster including the schema bundle).

---

### A.14 Q14 — Star-count breakdown UI

**Director's pick:** "Counter-bar with click-to-filter (replaces existing checkboxes) (recommended)."

**Locked decision:** The Captured Reviews section on the URL detail page (shipped in P-46 W2 Session 4 2026-05-28 with star-rating multi-select checkboxes) gets a new horizontal counter-bar at the top replacing the existing checkbox UI:

```
[★1 (47)]  [★2 (12)]  [★3 (8)]  [★4 (35)]  [★5 (180)]
```

Each button shows the star count + the number of reviews at that star rating in the product's full review set. Clicking a button toggles a filter on the review list:
- Click `★1 (47)` → filter to 1-star reviews only.
- Click `★1` again → un-filter (show all).
- Click `★1` + `★2` → multi-select OR (show 1- and 2-star reviews).
- Active buttons are visually highlighted (filled background).

Internally reuses the existing multi-select filter state from W2 Session 4; the buttons are just a new presentation layer over the same state. Counts are computed client-side from the already-loaded reviews list (no extra database call).

**Alternatives considered:**
- (B) Keep existing checkboxes, add count labels — rejected for taking more vertical space and slower interaction (check + uncheck vs single tap).
- (C) Counter-bar (display only) + separate filter dropdown — rejected for splitting the UI into two affordances director must learn separately.

**Reasoning:**
- (a) Compact, data-dense at-a-glance review distribution view.
- (b) Tap-to-filter is faster than check/uncheck.
- (c) Matches Amazon-style review-filter UX director already understands.
- (d) Reuses existing multi-select state internally — minimal new code.

**Trade-off:** Replaces existing W2 Session 4 checkbox UI. Mitigated by being functionally equivalent + more compact.

**Cascade impact:**
- **W4 file scope replaces existing checkbox component** in `CapturedReviewsSection.tsx`.
- **Counts are computed from already-loaded reviews list** — no extra database call.
- **No schema change** — the new UI is a pure presentation layer over existing state.

---

### A.15 Q15 — Anti-bot defensive posture

**Director's pick:** "Conservative everywhere: 1-3s random pagination delays + abort on captcha + clear rate-limit UI (recommended)."

**Locked decision:** Each per-platform extension module uses the same conservative anti-bot defaults:
- **Pagination delays:** Each click that loads more reviews (Amazon "View 10 more reviews" button click; Walmart per-star URL navigation; Etsy overlay pagination; eBay feedback-URL pagination) waits a random 1-3 second interval before firing. The randomization is per-click (Math.random() in the 1000-3000ms range), not a fixed interval — fixed intervals are themselves a bot signal.
- **Captcha detection:** If a captcha element appears during pagination (per-platform DOM detector — Amazon's captcha selector, eBay/Etsy/Walmart equivalents), the scrape stops cleanly. The Shadow DOM progress indicator (from Q3) surfaces a message: "Captcha detected on Amazon — finish it in the tab and click Resume, or click Abort." Director can resolve the captcha + click Resume to continue, or Abort to stop. Aborting on captcha is critical — silently retrying past one is the strongest single bot signal.
- **Rate-limit detection:** If a platform returns an HTTP 429 (Too Many Requests) or equivalent response, the scrape stops cleanly. The progress indicator surfaces: "Amazon is asking us to slow down. Wait 5 minutes and retry." Director can retry after the wait period; no auto-retry (auto-retry on rate-limit is itself a bot signal that escalates risk).
- **Partial-progress preservation:** Reviews already inserted before any abort (captcha / rate-limit / director-cancel) stay saved. Re-running starts from where the abort occurred (the per-star pagination cursor is persisted in component-local state during the scrape, but on re-run the scrape skips already-saved reviews via the existing `clientId` unique-constraint dedup pattern from P-46).

**Alternatives considered:**
- (B) Aggressive (50-200ms delays + auto-retry on rate-limit) — rejected for high bot-signal risk that may escalate Amazon's response from "slow down" to "you're a bot, banned."
- (C) Platform-specific (conservative Amazon, faster eBay/Etsy/Walmart) — rejected for per-platform tuning maintenance cost + contradiction with the "one consistent behavior" principle of Q1.

**Reasoning:**
- (a) Honors director's verbatim Q1 constraint *"functionality should be very close to real world human user sitting where admin is"* with margin to spare.
- (b) Safest for director's Amazon seller account.
- (c) Conservative defaults work everywhere; per-platform tuning can be added later if a platform proves uniformly safe at faster speeds.
- (d) Captcha-aware abort + rate-limit-aware abort are critical anti-escalation behaviors.

**Trade-off:** Slower scrapes — a 1000-review product at 5 stars × 200/star × 1-3s/pagination-click × 10-25 reviews/page = ~5-10 minutes wall-clock per scrape (varies by per-page review count). Mitigated by the live progress indicator (director can leave the tab and come back).

**Cascade impact:**
- **W2 per-platform module shape locked** — each module imports a shared `paginate(delayMsRangeStart, delayMsRangeEnd, captchaDetector, rateLimitDetector)` helper from `extensions/competition-scraping/src/lib/content-script/scrape-pagination.ts` (new file in W2 Session 1).
- **Estimated +1 file for the shared helper**, picked up by all 4 platform modules.
- **Shadow DOM progress indicator from Q3** is the single surface for captcha-detected + rate-limit-detected + abort UI.
- **`clientId` dedup pattern** from P-46 W2 Session 4 (CapturedReview model) prevents duplicate inserts on resume after abort.

---

### A.16 Schema additions (consolidated)

Canonical list of all P-49 schema changes. All additions are additive + nullable or defaulted = zero-risk migration; no data backfill needed. Bundled into the W2 Session 1 (Amazon) build session as the foundation step (mirrors P-46 W1 Schema-as-foundation Pattern).

**`CompetitorUrl` — new column (per A.4 Q4 per-star cap UX):**

```prisma
reviewScrapeCap Int? @default(200) // P-49 W2 (2026-MM-DD) — per-URL review scrape cap per §A.4; editable via click-to-edit cell from P-46 W3 Session 2; per-trigger override available in trigger popup
```

**`CapturedReview` — new columns + enum value addition (per A.1 Q1 collection method + A.5 Q5 reorder + miscellaneous):**

```prisma
sortRank      Int?    // P-49 W4 (2026-MM-DD) — server-side drag-to-reorder per §A.5; @dnd-kit reuse from P-46 W3 S3 2026-05-23-f; null = insertion order
helpfulCount  Int?    // P-49 W2 (2026-MM-DD) — Amazon-supplied "X people found this helpful"; null for eBay/Etsy/Walmart
platform      String? // P-49 W2 (2026-MM-DD) — denormalized from parent CompetitorUrl for cross-product query convenience (e.g., "all 1-star reviews on Amazon products in this Project")
```

Plus `source` enum value addition — `source` is currently a free-form `String` defaulting to `"manual"` (from P-46 W2 Session 4). P-49 W2 adds the convention value `"extension-scrape"` for reviews captured via the per-platform extension extraction modules. Since `source` is `String` (not a Prisma enum), the addition is purely an application-layer convention; no schema migration needed for the `source` field itself.

**NEW `ReviewAnalysis` model (per A.9 Q9 output shape + A.11 Q11 trigger + A.12 Q12 caching + A.13 Q13 schema consolidation):**

```prisma
// ReviewAnalysis — one row per AI-generated review summary at one of three aggregation levels.
// P-49 W5 (2026-MM-DD) per §A.16. Cached + re-runnable per §A.12.
model ReviewAnalysis {
  id            String                @id @default(uuid())
  level         ReviewAnalysisLevel   // PER_PRODUCT | PER_TYPE | PER_PROJECT
  // Scope fields — exactly one combination set based on level:
  urlId         String?               // set when level=PER_PRODUCT (FK to CompetitorUrl)
  projectId     String?               // set when level=PER_TYPE or PER_PROJECT
  typeFilter    String?               // set when level=PER_TYPE (the value of CompetitorUrl.type pooled)
  // Analysis payload + cache key per §A.9 + §A.12:
  analysisJson  Json                  @default("{}") // TipTap document per §A.9
  reviewsHash   String                // SHA-256(sorted review IDs included + modelVersion) per §A.12
  modelVersion  String                // "claude-opus-4-7" | "claude-opus-4-6" | future Opus versions per §A.7
  // Audit:
  runAt         DateTime              @default(now())
  runByUserId   String?               // null if run by automation (not used in v1 per §A.11 manual-trigger lock)
  costUsdMicros Int?                  // total cost in millionths of a dollar; nullable since Anthropic API responses may not always include cost
  // FKs:
  competitorUrl CompetitorUrl? @relation(fields: [urlId], references: [id], onDelete: Cascade)

  @@index([urlId])
  @@index([projectId, level])
  @@index([projectId, typeFilter])
  @@index([reviewsHash])
}

// ReviewAnalysisLevel — P-49 W5 (2026-MM-DD) per §A.10 + §A.16.
// PER_PRODUCT — one analysis per CompetitorUrl (uses urlId scope).
// PER_TYPE — one analysis per (projectId, typeFilter) pair pooling all products of that Type.
// PER_PROJECT — one analysis per projectId pooling all products in the Project (competitive landscape).
enum ReviewAnalysisLevel {
  PER_PRODUCT
  PER_TYPE
  PER_PROJECT
}
```

Also adds the inverse relation on `CompetitorUrl`:

```prisma
reviewAnalyses ReviewAnalysis[]
```

**No data backfill needed** — all fields are nullable or have defaults. Existing CompetitorUrl rows render with `reviewScrapeCap` defaulting to 200; existing CapturedReview rows render with null `sortRank` / `helpfulCount` / `platform` until edited or re-captured via the extension extraction; no existing ReviewAnalysis rows so no migration data shape concern.

**Schema-change-in-flight flag:** Flips YES at W2 Session 1 (Amazon) when `prisma db push` runs the migration; stays YES until W2 Amazon deploy session deploys the new schema live on vklf.com. All subsequent P-49 sessions read against the post-migration schema.

**NEW API routes added across the workstreams:**
- `POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews/scrape` — W2 trigger endpoint per platform (accepts `{ cap?: number, source: "extension-scrape" }`; returns `{ inserted: number, aborted?: "captcha" | "rate-limit" | "user-cancel" }`).
- `POST /api/projects/[projectId]/competition-scraping/reviews/batch-delete` — W4 bulk-delete per §A.6 (accepts `{ reviewIds: string[] }`; returns `{ deleted: number }`).
- `PUT /api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews/reorder` — W4 server-side reorder per §A.5 (accepts `{ orderings: Array<{ reviewId: string, sortRank: number }> }`; returns `{ updated: number }`).
- `POST /api/projects/[projectId]/competition-scraping/review-analysis/run` — W5 trigger endpoint per §A.11 (accepts `{ level: ReviewAnalysisLevel, urlId?: string, typeFilter?: string, modelVersion: string }`; returns the new ReviewAnalysis row).
- `GET /api/projects/[projectId]/competition-scraping/review-analysis` — W5 fetch endpoint (accepts query params for level + scope; returns matching ReviewAnalysis row or null).

---

### A.17 Platform-truths audit (Rule 19)

Two platform-level facts surfaced during this design session and warrant `PLATFORM_REQUIREMENTS.md` updates at the W2 Session 1 (Amazon) end-of-session per Rule 19 timing:

1. **First server-side automation against platform pages.** P-49 W2 is the first PLOS workstream that automates pagination against third-party platform pages (Amazon / eBay / Etsy / Walmart). The anti-bot defensive posture lock from §A.15 + the extension-only constraint from §A.1 together establish the platform-canonical pattern for any future workflow that needs to read third-party pages: extension-only execution + conservative random delays + captcha-aware abort + rate-limit-aware abort. Add to `PLATFORM_REQUIREMENTS.md` (new section or §11 extension): "Platform-page automation must use extension-only execution in director's logged-in session at director's IP; conservative random pagination delays (1-3s); captcha-aware clean-abort; rate-limit-aware clean-abort; no silent retry past captcha or rate-limit responses. Server-side crawlers against platform pages require explicit director approval + design-session audit per the P-49 Q1 precedent."

2. **First per-Project LLM cost-cap pattern reuse across workflows.** P-49 W5 is the second PLOS workstream after W#1 Keyword Clustering to use Anthropic Claude API with per-run + per-Project cost caps. The pattern is now sufficiently used (2 workflows) to be platform-canonical. Add to `PLATFORM_REQUIREMENTS.md` (or `DATA_CATALOG.md`): "LLM-using workflows enforce both per-run + per-Project monthly cost caps via the W#1 Keyword Clustering pattern (see `docs/MODEL_QUALITY_SCORING.md`). Per-run cap refuses to start runs estimated above threshold; per-Project monthly cap alerts + blocks at threshold. Cap thresholds are director-editable per Project."

Both updates land at the W2 Session 1 (Amazon) build session's end-of-session — when the spec they describe begins shipping in code — not at this design-only session.

---

### A.18 Living Questions (Rule 7) answers — for `DATA_CATALOG.md` Shared Data Registry

Three questions every new feature must answer:

1. **Which data from upstream workflows does P-49 need?**
   - Project (existing — `projects` table).
   - Platform (existing — W#2's per-Project platform context in `chrome.storage.local`).
   - CompetitorUrl (existing — W#2's own captured URLs; P-49 W2 adds the `reviewScrapeCap` column + W2 modules write to the `CapturedReview` child rows).
   - CapturedReview (existing — shipped via P-46 W2 Session 4 2026-05-28; P-49 W2 writes via extension extraction with `source = "extension-scrape"`; P-49 W4 extends UI; P-49 W5 reads to produce ReviewAnalysis rows).
   - CompetitorUrl.type (existing — shipped via P-46 W3 Session 2 2026-05-23-e; P-49 W5 reads to scope per-Type analyses).
   - User (existing — Supabase auth; P-49 W5 reads to populate `ReviewAnalysis.runByUserId`).

2. **Is each piece of shared data read-only or editable downstream?**
   - All P-49 outputs (`ReviewAnalysis` rows + new `CapturedReview` fields + `CompetitorUrl.reviewScrapeCap`) are **read-only by downstream W#3+** (per `COMPETITION_SCRAPING_DESIGN.md` §A.5 standing pattern — W#2 outputs are read-only downstream in v1).

3. **If editable, how does the upstream tool see the edits?** N/A — read-only.

Add to `DATA_CATALOG.md` Shared Data Registry at end of W2 Session 1 (data must exist before declaring it shared).

---

### A.19 Cross-Tool Data Flow Map reciprocal output declaration (Rule 18)

**New entries for W#2's row in `DATA_CATALOG.md` §7 Cross-Tool Data Flow Map (added at W2 Session 1 end-of-session):**

| Output | Producer | Schema location | Initial downstream consumers |
|---|---|---|---|
| Extension-scraped reviews (`CapturedReview` rows with `source = "extension-scrape"`) | W#2 P-49 | `prisma/schema.prisma` `CapturedReview` model + `src/lib/shared-types/competition-scraping.ts` `CapturedReviewShared` interface (extended) | TBD — likely W#5 Conversion Funnel (review-pattern signals at scale) + W#10 Reviews (assumed) |
| Per-product AI review summary (`ReviewAnalysis` rows with `level = "PER_PRODUCT"`) | W#2 P-49 W5 | `prisma/schema.prisma` `ReviewAnalysis` model + new `ReviewAnalysisShared` interface | TBD — likely W#3 Therapeutic Strategy + W#6 Content Development (review insights inform positioning) |
| Per-Type pooled AI review summary (`ReviewAnalysis` rows with `level = "PER_TYPE"`) | W#2 P-49 W5 | `prisma/schema.prisma` `ReviewAnalysis` model | TBD — likely W#3 + W#5 + W#6 (Type-level competitive intelligence) |
| Cross-everything competitive landscape AI review summary (`ReviewAnalysis` rows with `level = "PER_PROJECT"`) | W#2 P-49 W5 | `prisma/schema.prisma` `ReviewAnalysis` model | TBD — likely all downstream W#3+ workflows as a strategic-context input |
| Per-URL review scrape cap setting (`CompetitorUrl.reviewScrapeCap`) | W#2 P-49 W2 | `prisma/schema.prisma` `CompetitorUrl.reviewScrapeCap` | N/A — internal-only setting for scrape orchestration |

---

### A.20 Scaffold fit (Rule 20)

P-49 is an EXTENSION to already-graduated-pattern W#2 surfaces, not a new workflow. The Shared Workflow Components Library is consumed by the PLOS-side rendering (existing `<StatusBadge>` / `<WorkflowTopbar>` / `<DeliverablesArea>` on the Competition Data page + URL detail page + Comprehensive Competitor Analysis page).

**Library components consumed (PLOS side):** existing — no changes to existing imports.

**New shared-library component additions proposed by P-49:** none in v1. The AI analysis trigger button + model-version dropdown + cost preview modal + staleness badge components are W#2-local; if a second workflow needs the same shape later, that workflow's design session can propose lifting the component into the shared library.

**Extension content-script modules remain W#2-specific** and don't import from the shared library (W#2-local UI primitives only). The per-platform extraction modules + the shared `scrape-pagination.ts` helper + the Shadow DOM progress indicator all live in `extensions/competition-scraping/src/lib/content-script/`.

---

### A.21 Deferred-items registry from this session (Rule 14e + Rule 26)

Captured via `TaskCreate` with `DEFERRED:` prefix during this session: **none.** All Tasks created this session (the 18 interview + assemble + close-session tasks) complete cleanly within scope.

In-doc deferrals (scope-deferral for v1, captured per A.7 + A.10 + A.13):

- **AI cost-cap threshold UI** (A.7 — director-editable per-Project caps; default $10/run + $50/Project/month; the per-Project settings surface lives TBD per first W5 build session — likely alongside existing AI-tool settings on vklf.com).
- **Comprehensive Analysis page section navigation** (A.10 — if the page grows too long with all 3 AI surfaces + existing W4 comprehensive doc, a per-section jump-to affordance may be needed; defer to W5 build session).
- **Cross-everything section placement (top or bottom of Comprehensive page)** (A.10 — defer to W5 build session for empirical decision based on visual hierarchy).
- **Per-platform shared `scrape-pagination.ts` helper extraction shape** (A.15 — exact helper signature locked at W2 Session 1; the design here is the conceptual shape).
- **AI prompt iteration plan** (A.8 — expect the per-product two-sweep prompt to evolve through several versions mirror the W#1 AUTO_ANALYZE_PROMPT_V1 → V4 evolution; first version locked at W5 Session 1).
- **Re-run-from-where-aborted edge cases** (A.15 — partial-progress preservation works via the `clientId` dedup pattern; edge cases like "user resumed after platform DOM changed mid-scrape" deferred to W2 Session 2+).
- **W3 Crawler infrastructure** (A.1 — DROPPED entirely per Q1; preserved in §C.3 below as DROPPED for traceability; if anti-bot landscape changes substantially or director's needs shift, a future polish item can capture a crawler design separately).
- **Auto-trigger AI analysis** (A.11 — DROPPED in favor of manual button; if cost caps prove generous enough and director wants set-and-forget automation, a follow-up design session can capture).

---

## §B — In-flight refinements (append-only)

**Empty at end of interview 2026-05-25.** Future P-49 build sessions append entries here following the canonical format:

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

## §C — Per-workstream implementation outlines

Each subsection captures: scope (what ships), file-level deltas (which files change), session estimate, dependencies (what must ship first), test approach, deploy mechanics, cross-references back to §A decisions.

### §C.1 Workstream 1 — Reviews Phase 2 Design Session

**Status:** ✅ DONE this session (`session_2026-05-25_reviews-phase-2-design-session` 2026-05-25 on `workflow-2-competition-scraping`).

**Scope:** Workflow Requirements Interview producing this document. 15 questions answered + auxiliary sections (A.16-A.21) + 4 workstream implementation outlines below + empty §B.

**Files touched:** this design doc only (NEW `docs/REVIEWS_PHASE_2_DESIGN.md`). End-of-session doc-batch additionally touches the standard Group A bundle + cross-reference §B entries in `docs/COMPETITION_DATA_V2_DESIGN.md` + `docs/COMPETITION_SCRAPING_DESIGN.md`.

**Sessions estimated:** 1 (DONE).

**Dependencies:** P-46 W2 Session 4 (CapturedReview model + manual entry surface — shipped 2026-05-28) + P-46 W3 Session 2 (click-to-edit cell editors — shipped 2026-05-23-e) + P-46 W4 (Comprehensive Competitor Analysis page — shipped 2026-05-24-f).

**Test approach:** N/A (design session — no code).

**Deploy mechanics:** N/A (design session — no deploy). End-of-session doc-batch pushes to `origin/workflow-2-competition-scraping` + ff-merges to `origin/main` (operationally adjacent; does NOT invoke Rule 9).

**Cross-references:** ALL §A subsections.

---

### §C.2 Workstream 2 — Per-platform extension extraction

**Scope:** Build per-platform review extraction modules in `extensions/competition-scraping/src/lib/content-script/`, one per platform in the order Amazon → eBay → Etsy → Walmart (per §A.2). Each platform module: (a) right-click context-menu entry "Scrape reviews for this URL" registered via existing extension context-menu wiring; (b) platform-specific DOM walker per the director-supplied per-platform specs preserved in the P-49 ROADMAP entry; (c) paginated "load more" automation honoring per-page review counts (Amazon 10/page, eBay 25/page, Etsy 8/page, Walmart 10/page); (d) Supabase write through existing `CapturedReview` model with `source = "extension-scrape"`; (e) user-configurable scrape cap default 200/star per §A.4; (f) Shadow DOM progress indicator + captcha/rate-limit abort UI per §A.3 + §A.15.

The Amazon cluster (Session 1) bundles the §A.16 schema migration as the foundation step (parallel to P-46 W1 Schema-as-foundation Pattern from 2026-05-24).

**Files touched (across all 4 platform clusters):**
- `prisma/schema.prisma` — additions per §A.16 (lands in W2 Session 1 Amazon).
- `src/lib/shared-types/competition-scraping.ts` — extend `CapturedReviewShared` + `CompetitorUrlShared` per §A.16 (lands in W2 Session 1 Amazon).
- NEW `extensions/competition-scraping/src/lib/content-script/scrape-pagination.ts` — shared `paginate(rangeStart, rangeEnd, captchaDetector, rateLimitDetector)` helper per §A.15 (lands in W2 Session 1 Amazon; consumed by all 4 platform modules).
- NEW `extensions/competition-scraping/src/lib/content-script/scrape-progress-indicator.ts` — Shadow DOM progress UI per §A.3 + §A.15 (lands in W2 Session 1 Amazon).
- NEW `extensions/competition-scraping/src/lib/content-script/amazon-review-extractor.ts` — Amazon platform module per the director-supplied DOM spec (per-star pagination URL + helpful-count + `Customers say` block; lands in W2 Amazon cluster).
- NEW `extensions/competition-scraping/src/lib/content-script/ebay-review-extractor.ts` — eBay platform module per the director-supplied DOM spec (feedback URL + Neutral → 3-star + Negative → 1-star mapping; lands in W2 eBay cluster).
- NEW `extensions/competition-scraping/src/lib/content-script/etsy-review-extractor.ts` — Etsy platform module per the director-supplied DOM spec (overlay pagination + per-star percentage filters; lands in W2 Etsy cluster).
- NEW `extensions/competition-scraping/src/lib/content-script/walmart-review-extractor.ts` — Walmart platform module per the director-supplied DOM spec (per-star `?ratings=N` query-param URL + "View more" expander; lands in W2 Walmart cluster).
- NEW `src/lib/competition-scraping/handlers/url-reviews-scrape.ts` — DI seam for the POST scrape endpoint (~150 LOC mirroring `url-reviews.ts` precedent from P-46 W2 Session 4).
- NEW `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews/scrape/route.ts` — thin shim wiring DI seam (~50 LOC).
- Per-platform Playwright spec extensions in `extensions/competition-scraping/specs/` (per Rule 27 picker per cluster).

**Sessions estimated:** ~12-16 total across 4 platform clusters.
- **Amazon cluster (~3-4 sessions):** Session 1 schema + shared helpers + Amazon DOM walker + initial trigger (per-URL extraction working end-to-end on a real Amazon product page). Session 2 helpful-count sort + per-star pagination loop polish + edge cases. Session 3 Playwright spec + trigger popup UI + cap override input. Session 4 (CONDITIONAL — DEPLOY) bundled deploy for Amazon cluster.
- **eBay cluster (~2-3 sessions):** Session 1 eBay DOM walker + feedback URL handling + Neutral/Negative star mapping. Session 2 polish + Playwright spec. Session 3 (CONDITIONAL — DEPLOY).
- **Etsy cluster (~2-3 sessions):** Session 1 Etsy DOM walker + overlay pagination + per-star percentage handling. Session 2 polish + Playwright spec. Session 3 (CONDITIONAL — DEPLOY).
- **Walmart cluster (~2-3 sessions):** Session 1 Walmart DOM walker + per-star query-param URL + "View more" expander. Session 2 polish + Playwright spec. Session 3 (CONDITIONAL — DEPLOY).

**Dependencies:** W1 Design Session (this session — done). The Amazon cluster Session 1 has no other dependencies (it bundles the schema migration as foundation).

**Test approach:** Hybrid per Rule 27 — node:test for any new validation helpers + Playwright extension-context spec per platform for the scrape flow (mirrors P-22-style cross-platform regression pattern) + manual walkthrough for the captcha-detection + rate-limit-detection edge cases (which Playwright can't realistically simulate against live platforms).

**Deploy mechanics:** Each platform cluster's deploy session is standard 4-phase per `.claude/commands/deploy.md`. Rule 9 gate fires once per deploy for `git push origin main`. Amazon cluster's first deploy session also fires Rule 9 gate for `npx prisma db push` (schema migration on Supabase). Fresh extension zip via `npm run zip` after each deploy.

**Cross-references:** §A.1 (extension-only) + §A.2 (Amazon → eBay → Etsy → Walmart order) + §A.3 (in-page execution + Shadow DOM progress) + §A.4 (per-URL cap + per-trigger override) + §A.13 (schema package) + §A.15 (conservative anti-bot defaults) + §A.16 (full schema additions).

---

### §C.3 Workstream 3 — Crawler infrastructure (DROPPED per Q1)

**Status:** DROPPED 2026-05-25 per §A.1 (Q1 collection method outcome — Extension only).

**Scope (preserved for traceability):** Server-side crawler infrastructure for paginated review collection. If scoped in, would include: residential proxy rotation strategy, rate-limiting + scheduling, captcha-solving service integration, browser-fingerprint randomization, job-queue, output ingestion to `CapturedReview` table.

**Why dropped:** Director's verbatim anti-bot constraint (*"functionality should be very close to real world human user sitting where admin is"*) + Q1 forced-picker outcome (Extension only Recommended). Crawler-method runs at headless server-IPs which would behave like a robot to Amazon's anti-bot systems, contradicting the constraint and risking director's Amazon seller account.

**Re-evaluation trigger:** If anti-bot landscape changes substantially (e.g., Amazon publishes an explicit "OK to scrape with these credentials" API), or if director's needs shift (e.g., need for overnight scrapes across hundreds of products that director can't realistically click through manually), a future polish item can capture a crawler design separately. Not on the P-49 critical path.

**Sessions estimated:** 0 (dropped).

**Dependencies:** N/A.

**Test approach:** N/A.

**Deploy mechanics:** N/A.

**Cross-references:** §A.1 (the Q1 decision that dropped this workstream).

---

### §C.4 Workstream 4 — Captured Reviews UI extensions on vklf.com

**Scope:** Extend the existing Captured Reviews section on the URL detail page (shipped in P-46 W2 Session 4 2026-05-28) with: star-count breakdown counter-bar (replaces existing checkboxes) per §A.14; server-side drag-to-reorder (within-star + across-star) per §A.5; bulk-delete affordance (multi-select checkboxes + confirm modal) per §A.6; staleness badge UI for AI analysis per §A.12 (the badge component itself lives in W4 since it's UI-only; the cache fingerprint logic lives in W5).

**Files touched:**
- `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/CapturedReviewsSection.tsx` — major rewrite:
  - Replace existing star-rating multi-select checkboxes with counter-bar component per §A.14.
  - Add drag handle (⋮⋮) to each CapturedReviewCard + integrate `@dnd-kit` per §A.5.
  - Add checkbox to each CapturedReviewCard for multi-select per §A.6.
  - Add "Delete X selected" bulk-action button at top per §A.6.
  - Add staleness badge component above the per-product AI analysis section per §A.12 (the AI analysis section itself lands via W5).
- NEW `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/StarCountCounterBar.tsx` — the counter-bar component per §A.14.
- NEW `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/BulkDeleteConfirmModal.tsx` — confirm modal per §A.6.
- NEW `src/app/projects/[projectId]/competition-scraping/components/AnalysisStalenessBadge.tsx` — staleness badge per §A.12 (reused across all 3 AI analysis surfaces in W5).
- NEW `src/lib/competition-scraping/handlers/reviews-batch-delete.ts` — DI seam for batch-delete POST endpoint (~120 LOC mirroring `reviews-by-id.ts` precedent).
- NEW `src/lib/competition-scraping/handlers/reviews-reorder.ts` — DI seam for reorder PUT endpoint (~140 LOC).
- NEW `src/app/api/projects/[projectId]/competition-scraping/reviews/batch-delete/route.ts` — thin shim (~50 LOC).
- NEW `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews/reorder/route.ts` — thin shim (~50 LOC).

**Sessions estimated:** ~2-3.
- Session 1: Counter-bar replaces checkboxes per §A.14 + bulk-delete checkboxes + confirm modal + batch-delete API route per §A.6.
- Session 2: Drag-to-reorder with `@dnd-kit` + reorder API route + staleness badge component per §A.5 + §A.12.
- Session 3 (CONDITIONAL — DEPLOY): if Sessions 1-2 land clean, deploy.

**Dependencies:** W1 Design Session (this session — done). Can run in parallel with W2 per-platform extraction OR W5 AI analysis (W4 is purely UI-side on existing schema; no inter-workstream blocking).

**Test approach:** Hybrid per Rule 27 — node:test for new validators in the batch-delete + reorder DI seams + Playwright spec for the counter-bar filter + bulk-delete flow + drag-reorder flow + Manual walkthrough for end-to-end multi-device reorder persistence.

**Deploy mechanics:** Standard 4-phase. Rule 9 gate once for `git push origin main`. No `prisma db push` needed (W2 Amazon cluster ships the schema; W4 reads existing fields + writes existing fields).

**Cross-references:** §A.5 (reorder) + §A.6 (bulk-delete) + §A.12 (staleness badge) + §A.14 (counter-bar) + §A.16 (schema fields W4 reads + writes).

---

### §C.5 Workstream 5 — AI review analysis system

**Scope:** Build the 3-level AI analysis system per §A.7 (model + cost guards) + §A.8 (adaptive batching) + §A.9 (TipTap output) + §A.10 (UI placement) + §A.11 (manual trigger) + §A.12 (fingerprint cache). Per-product two-sweep summarization on URL detail page + per-Type pooled summarization on Comprehensive page + cross-everything competitive landscape summarization on Comprehensive page.

**Files touched:**
- NEW `src/lib/competition-scraping/review-analysis/token-counter.ts` — token-counting helper for adaptive batching per §A.8 (~100 LOC; mirrors W#1 INPUT_CONTEXT_SCALING_DESIGN.md pattern).
- NEW `src/lib/competition-scraping/review-analysis/batch-sizer.ts` — adaptive batch-sizer using token-counter per §A.8 (~120 LOC).
- NEW `src/lib/competition-scraping/review-analysis/cache.ts` — `computeReviewsHash(reviews, modelVersion)` + cache-lookup helpers per §A.12 (~100 LOC).
- NEW `src/lib/competition-scraping/review-analysis/prompts.ts` — per-level prompt templates (per-product two-sweep / cross-Type pooled / cross-everything); v1 prompts likely iterate through several versions (mirror W#1 AUTO_ANALYZE_PROMPT_V1 → V4 evolution).
- NEW `src/lib/competition-scraping/review-analysis/cost-cap.ts` — per-run + per-Project cost-cap enforcement per §A.7 (~80 LOC; mirrors W#1 MODEL_QUALITY_SCORING.md cost-cap pattern).
- NEW `src/lib/competition-scraping/handlers/review-analysis-run.ts` — DI seam for POST trigger endpoint (~250 LOC including the two-sweep loop).
- NEW `src/lib/competition-scraping/handlers/review-analysis-fetch.ts` — DI seam for GET fetch endpoint (~100 LOC).
- NEW `src/app/api/projects/[projectId]/competition-scraping/review-analysis/run/route.ts` — thin shim (~50 LOC).
- NEW `src/app/api/projects/[projectId]/competition-scraping/review-analysis/route.ts` — thin shim (~50 LOC).
- MODIFIED `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx` — add per-product AI analysis section with Analyze button + model dropdown + cost preview modal + AnalysisReadView render + staleness badge per §A.10 + §A.11 + §A.12.
- MODIFIED `src/app/projects/[projectId]/competition-scraping/comprehensive-analysis/page.tsx` — add per-Type accordion sections (one per unique Type value in Project) + cross-everything section, each with Analyze button + model dropdown + cost preview + AnalysisReadView + staleness badge.
- NEW `src/app/projects/[projectId]/competition-scraping/components/AnalysisRunModal.tsx` — shared modal with model dropdown + estimated-cost preview + Confirm/Cancel per §A.11 (used by all 3 AI trigger surfaces).
- NEW `src/app/projects/[projectId]/competition-scraping/components/ReviewAnalysisSection.tsx` — shared section component rendering the Analyze button + analysis content + staleness badge (used by all 3 AI surfaces).
- NEW `prisma/schema.prisma` `ReviewAnalysis` model + enum (ships via W2 Amazon cluster Session 1 per §A.16 schema bundle).
- NEW `src/lib/shared-types/competition-scraping.ts` — `ReviewAnalysisShared` interface (additive; lands in W2 Amazon cluster Session 1).
- node:test coverage for token-counter + batch-sizer + cache + cost-cap helpers + DI-seam validators.

**Sessions estimated:** ~5-10 total.
- Session 1: Token-counter + batch-sizer + cache + cost-cap foundation primitives + first per-product prompt + first end-to-end run on a small product (e.g., one with 50 reviews) to validate the pipeline. May feel "foundational and the user-visible part is small" — that's expected (mirrors P-46 W1 Schema-only session).
- Session 2: Per-product analysis UI on URL detail page + AnalysisRunModal + ReviewAnalysisSection + AnalysisReadView integration + staleness badge wiring per §A.12.
- Session 3: Per-Type pooled analysis prompt + per-Type accordion UI on Comprehensive page.
- Session 4: Cross-everything competitive landscape prompt + cross-everything UI on Comprehensive page.
- Session 5: Prompt iteration based on real output (expect 2-3 iterations per level if W#1 AUTO_ANALYZE_PROMPT_V1 → V4 evolution is a guide).
- Sessions 6+: Polish + edge cases + deploy.

**Dependencies:** W1 Design Session (this session — done). W2 Amazon cluster Session 1 deployed (the `ReviewAnalysis` schema + `ReviewAnalysisShared` types must be live; W5 can begin code at Session 1 against the schema but can't deploy until W2 Amazon ships). Can run partially in parallel with W4 once schema is live.

**Test approach:** Hybrid per Rule 27 — node:test for token-counter + batch-sizer + cache + cost-cap helpers + Playwright spec for the trigger button + modal flow + staleness badge + Manual walkthrough for AI output quality assessment (visual judgment on whether summaries are actually useful — Playwright can validate the output exists but not whether it's good).

**Deploy mechanics:** Standard 4-phase. Rule 9 gate once per deploy for `git push origin main`. Anthropic API key must be set as a Vercel env var before first deploy (already set per W#1 Keyword Clustering — reuse).

**Cross-references:** §A.7 (Opus + model selector + cost caps) + §A.8 (adaptive batching) + §A.9 (TipTap output) + §A.10 (UI placement on URL detail + Comprehensive pages) + §A.11 (manual trigger + model dropdown + cost preview) + §A.12 (fingerprint cache + staleness badge) + §A.16 (ReviewAnalysis schema + API routes).

---

## §B 2026-05-26 — `session_2026-05-26_p49-w2-amazon-session-1` — Workstream 2 Amazon Session 1 (foundation build) lands schema migration + shared content-script infrastructure + Amazon DOM walker at code level via build commit `422436f` (20 files +2069/-7); FIRST build-session §B entry in this brand-new design doc per Rule 18; TWO NEW reusable Patterns memorialized (`fetch()` + `DOMParser` pagination + Foundation-session-bundles-substrate)

**§A frozen** per Rule 18. This is the first build-session §B entry in `docs/REVIEWS_PHASE_2_DESIGN.md` (the design doc was created 2026-05-25-b with §B empty per Rule 18). Today's entry opens the §B append history with the Workstream 2 Amazon Session 1 closing entry.

**Session shape: pure CODE session (NO deploys, NO Rule 9 gates fired, ZERO Rule 14f forced-pickers fired).** The launch prompt + design doc + (a.93) RECOMMENDED-NEXT all aligned unambiguously, so no clarifying pickers were needed. Build commit `422436f` (20 files +2069/-7) lands on `workflow-2-competition-scraping`; NOT ff-merged to main this session (build session; build commit stays on the workflow branch until the eventual Amazon deploy session ~3-5 sessions from now). **Schema-change-in-flight flag flipped NO → YES at `npx prisma db push`** (1.44s; additive only; zero data loss) — stays YES until the eventual Amazon deploy session ships the migration to production.

**Files touched (per §C.2 plan + the launch-prompt task shape):**

**Schema migration (per §A.13 + §A.16):**
- `prisma/schema.prisma` (+60/-1) — new `ReviewAnalysis` model + `ReviewAnalysisLevel` enum (PER_PRODUCT/PER_TYPE/PER_PROJECT) + `CapturedReview.sortRank Int?` + `.helpfulCount Int?` + `.platform String?` + `CompetitorUrl.reviewScrapeCap Int? @default(200)` + inverse relation `CompetitorUrl.reviewAnalyses ReviewAnalysis[]`. Applied to Supabase via `npx prisma db push` (1.44s; additive only; zero data loss).

**Shared content-script infrastructure (3 new files per §C.2):**
- NEW `extensions/competition-scraping/src/lib/content-script/scrape-pagination.ts` (~310 LOC; +371 in the diff including blank/test stubs): generic `paginate(opts)` loop + 1-3s random `randomPaginationDelay()` + `detectCaptcha()` with Amazon-specific (`#captchacharacters` / Amazon `validateCaptcha` form) + generic CAPTCHA selectors (any `iframe[src*="captcha"]` + `.g-recaptcha` + `.h-captcha` + `[data-sitekey]` + any element with `role="captcha"`) + `isRateLimitStatus()` HTTP 429/503 detection + AbortSignal-cancellable + structured `ScrapeProgress` event stream (page-loading / page-loaded / row-saved / completed / aborted-by-user / aborted-captcha / aborted-rate-limit / aborted-error per §A.15).
- NEW `extensions/competition-scraping/src/lib/content-script/scrape-progress-indicator.ts` (~230 LOC; +331 in the diff): Shadow DOM-mounted corner indicator reusing the P-47 2026-05-24-d mount pattern (open Shadow DOM root on a fixed-positioned host `<div>` in `document.body` with `z-index: 999999`). NEW `PROGRESS_INDICATOR_CSS` constant injected inside the shadow. Subscribes to `ScrapeProgress` events from `scrape-pagination.ts` + renders "Scraping page N — X reviews captured so far..." with cancel button + auto-dismiss-on-completed + persists-on-captcha/rate-limit/error per §A.3.

**Amazon per-platform extractor (1 new file per §C.2):**
- NEW `extensions/competition-scraping/src/lib/content-script/amazon-review-extractor.ts` (~300 LOC; +325 in the diff): URL detection helpers (`isAmazonReviewPage(url)` matches `^https://(www\.)?amazon\.[^/]+/product-reviews/` + `extractAsinFromReviewUrl(url)` parses 10-char ASIN from `product-reviews/<ASIN>/` path segment + `urlsMatchByAsin(urlA, urlB)` ASIN-equality comparison for orchestrator dispatch). Per-row DOM walker `extractReviewsFromDocument(doc, opts)` against `[data-hook="review"]` selectors + per-row parsers (`parseStarRating(node)` reads `[data-hook="review-star-rating"] .a-icon-alt` text + parses "X out of 5 stars" → 1-5 integer + `parseHelpfulCount(node)` reads `[data-hook="helpful-vote-statement"]` text + handles "One person found this helpful" + "X people found this helpful" + commas + `parseAmazonReviewDate(node)` reads `[data-hook="review-date"]` text + handles "Reviewed in the United States on May 1, 2024" + "Reviewed in <country> on <date>" formats). `findNextPageUrl(doc, currentUrl)` resolves `.a-pagination .a-last a[href]` href to absolute URL or returns null on last page. **`runAmazonReviewScrape(opts)` orchestrator uses `fetch()` + `DOMParser` for pagination** (avoids killing the content-script via full-page navigation — see Pattern memorialization below).

**Right-click context-menu wiring (3 modified files):**
- `extensions/competition-scraping/src/entrypoints/background.ts` (+49): new `CONTEXT_MENU_SCRAPE_REVIEWS_ID` entry with title "Scrape reviews for this URL" + `contexts: ['all']` + dispatch handler on click sending `start-review-scrape` message to active tab's content-script + new `create-captured-review` BackgroundRequest handler proxying to the existing url-reviews POST endpoint.
- `extensions/competition-scraping/src/lib/content-script/messaging.ts` (+50/-1): new `StartReviewScrapeMessage` ContentScriptMessage type (payload: `pageUrl` string) + new `CreateCapturedReviewRequestMessage` BackgroundRequest type (payload: `projectId` + `urlId` + `body` with the CreateCapturedReview wire shape) + `isContentScriptMessage` + `isBackgroundRequest` type guards updated.
- `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` (+96): imports the new Amazon extractor + adds `savedCompetitorUrlRows` cache (tracks per-URL `id`, `url`, `reviewScrapeCap`, `productName`) populated from the existing URL-list fetch path + new `start-review-scrape` handler that detects platform via `isAmazonReviewPage()` + matches the trigger `pageUrl` against saved CompetitorUrls by ASIN via `urlsMatchByAsin()` + dispatches to `runAmazonReviewScrape()` with the matched `competitorUrlId` + per-URL `reviewScrapeCap` + AbortSignal; eBay/Etsy/Walmart route to a friendly "Platform not yet supported in this Session — Amazon ships first per §A.2" toast.

**Per-extension api-bridge / api-client additions (2 modified files):**
- `extensions/competition-scraping/src/lib/api-client.ts` (+24): new `createCapturedReview(projectId, urlId, body)` function calling the existing POST `/api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews` endpoint with the additional `helpfulCount` + `platform` fields.
- `extensions/competition-scraping/src/lib/content-script/api-bridge.ts` (+21): new `createCapturedReview` wrapper routing through the background-proxy (since content-scripts can't directly fetch arbitrary cross-origin URLs).

**PLOS-side handler extensions (5 modified files; additive to P-46 W2 S4 baseline per §A.16):**
- `src/lib/competition-scraping/handlers/url-reviews.ts` (+31): `CapturedReviewRow` interface extended with new fields + `toWireShape` returns them + POST handler validates new optional `helpfulCount` (non-negative integer) + `platform` (string) + persists via `createData`.
- `src/lib/competition-scraping/handlers/reviews-by-id.ts` (+8): `CapturedReviewRow` + `toWireShape` extended with new fields (PATCH allowlist for them is deferred to a future session — Session 1 ships read-side + create-side only).
- `src/lib/competition-scraping/handlers/urls.ts` (+4): `CompetitorUrlRow` + `toWireShape` extended with `reviewScrapeCap`.
- `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/route.ts` (+2): local `toWireShape` extended with `reviewScrapeCap`.
- `src/lib/shared-types/competition-scraping.ts` (+55/-5): `CapturedReview` + `CreateCapturedReviewRequest` extended; `CompetitorUrl` + `UpdateCompetitorUrlRequest` extended with `reviewScrapeCap`; NEW `ReviewAnalysis` interface + `ReviewAnalysisLevel` type + `isReviewAnalysisLevel` type guard.

**Tests (49 new extension node:test cases per Rule 27):**
- NEW `extensions/competition-scraping/src/lib/content-script/scrape-pagination.test.ts` (+318) — 20 cases covering `isRateLimitStatus` (429 / 503 / 200 / 0) + `detectCaptcha` (Amazon `#captchacharacters` / generic iframe / no-captcha) + `randomPaginationDelay` (within 1000-3000ms) + `paginate` loop happy-path + cap-hit + multi-page + captcha-abort + HTTP-429-abort + generic-error-classification + user-cancel via AbortSignal + row-saved-event-emitted-per-row.
- NEW `extensions/competition-scraping/src/lib/content-script/amazon-review-extractor.test.ts` (+320) — 29 cases covering `isAmazonReviewPage` + `extractAsinFromReviewUrl` + `urlsMatchByAsin` + `parseStarRating` (canonical "5.0 out of 5 stars" / "4.0 out of 5 stars" / "1.0 out of 5 stars" / half-rounded "4.5 out of 5 stars" / garbled / out-of-range) + `parseHelpfulCount` (42 / "One person" / commas / empty / garbled) + `parseAmazonReviewDate` (US-format / other-country / garbled) + `extractReviewsFromDocument` (well-formed multi-row Document / missing-star fallback / empty-body row / empty-doc) + `findNextPageUrl` (resolved-href / null-on-last-page).
- 4 fixture-only updates extending makeRow factories with new column defaults in `urls.test.ts` (+2; `reviewScrapeCap: 200`) + `url-reviews.test.ts` (+4; `sortRank: null, helpfulCount: null, platform: null`) + `reviews-by-id.test.ts` (+4) + `captured-text-validation.test.ts` (+1; `reviewScrapeCap: 200`).

**Pre-build + post-build /scoreboard 5/5 GREEN at expected new baselines** (root tsc clean / extension tsc clean / **extension `npm test` 611/611 +49 from baseline 562** — exact match with the 49 new test cases / **786 src/lib UNCHANGED** / **62 routes UNCHANGED**); Check 6 Playwright SKIPPED per Rule 27 non-deploy-session convention. **NEW baseline locked from this session:** extension `npm test` = **611/611**.

**Confirm §A.1 + §A.3 + §A.4 + §A.13 + §A.15 + §A.16 all hold (none refined or contradicted at build time).** Every §A decision consumed by Session 1 landed cleanly without surfacing a need for a §A amendment:
- **§A.1 (Extension only)** — confirmed. The content-script extractor runs in the director's logged-in Chrome session at the director's IP, behaviorally indistinguishable from manual browsing.
- **§A.3 (in-page execution + Shadow DOM progress indicator)** — confirmed. `scrape-progress-indicator.ts` mounts inside an open Shadow DOM root reusing the P-47 pattern; the indicator surfaces inside the page itself, not in a popup or sidebar.
- **§A.4 (per-URL cap + per-trigger override)** — confirmed. `CompetitorUrl.reviewScrapeCap Int? @default(200)` shipped; per-trigger override mechanism is deferred to Session 2's trigger popup with cap-override input.
- **§A.13/§A.16 (full schema package)** — confirmed. `npx prisma db push` ran cleanly (1.44s; additive only; zero data loss); all 4 schema additions (new `ReviewAnalysis` model + `CapturedReview` 3 new fields + `CompetitorUrl.reviewScrapeCap`) landed as spec'd.
- **§A.15 (conservative anti-bot defaults)** — confirmed. 1-3s random delays via `randomPaginationDelay()` + captcha-aware abort via `detectCaptcha()` + HTTP 429/503 rate-limit detection via `isRateLimitStatus()` + AbortSignal-cancellable for user-initiated cancel + structured event stream for UI surface.

**Additive context to §A.3 (informational — NOT a §A change): "in-page execution" includes same-origin `fetch()` + `DOMParser`, not strictly the live document only.** The §A.3 spec locks "In-page with Shadow DOM progress indicator" as the scrape execution strategy. Session 1's `runAmazonReviewScrape` orchestrator implementation refined the "in-page" interpretation to include same-origin `fetch()` + `new DOMParser().parseFromString(html, 'text/html')` for pages 2..N (page 1 is read from the live DOM). This is NOT a §A change — it's the canonical interpretation of "in-page" for content-script architectures that need long-running pagination workflows (the alternative of clicking the live "Next page" anchor would navigate the actual tab + kill the running content-script). The Pattern memorialization below captures this as a reusable Pattern. Future P-49 W2 sessions (eBay / Etsy / Walmart sub-clusters) follow the same fetch+DOMParser pagination Pattern.

**TWO NEW reusable Patterns memorialized this session.**

1. **"Content-script pagination via `fetch()` + `DOMParser` avoids the full-page-navigation kill."** Trigger: a content-script wants to walk pages 2..N of a paginated review-list whose "Next page" affordance is a regular HTML anchor that would navigate the live tab. Behavior: rather than clicking the live anchor (which navigates the tab + kills the running content-script + loses all in-memory scrape state), use `await fetch(nextPageUrl)` + `new DOMParser().parseFromString(html, 'text/html')` to materialize a fully-walkable Document. Rationale: long-running multi-page scrape workflows are otherwise impossible in a single content-script lifetime — full-page navigation cycles the content-script's V8 context. Pairs with P-23 URL-prefix-dispatch as content-script-architecture-level Patterns.

2. **"Foundation session bundles schema + shared helpers + first per-platform module under one commit."** Trigger: a multi-workstream polish item with a per-platform sub-cluster structure needs its first build session. Behavior: ship ALL of (1) schema migration + (2) shared infrastructure modules + (3) the FIRST per-platform module getting basic end-to-end working under one commit. Rationale: subsequent per-platform sub-cluster Sessions 1's reuse the shared substrate without re-design. Pairs with P-46 W1 Schema-as-foundation Pattern (2026-05-24) as the next-evolution version (schema-only → schema + shared infra + first consumer).

**Session 2 next scope (per (a.94)).** Cross-star navigation loop (visit each of the 5 filterByStar values OR the canonical "all star ratings" view + scrape up to per-URL cap per star) + helpful-count sort within star (sort the in-memory extracted rows by helpfulCount desc before inserting) + `Customers say` AI-summary block capture on the product listing page (separate fetch from a `/dp/<ASIN>` URL) + trigger popup with per-URL cap override input (small Shadow DOM modal mounted before the scrape starts). The cross-star loop is non-trivial because Amazon's per-star pages each need their own fetch+DOMParser walk + the scrape-pagination helper needs to compose with an outer "loop over stars" wrapper. Defensive but worth its own session. Real-Chrome calibration data from the eventual Amazon deploy session's interactive test will inform any final pre-deploy refinements. Estimated 1 session for Session 2.

**Scope deferred from Session 1 to Session 2 (preserved for traceability).** Per the launch prompt + the §A.1/§A.4 references: the design doc spec'd "per-star URL pattern + helpful-count selector + Customers say block + sort by helpful-count desc within star" — Session 1 ships the foundation (single-filter-view scrape + helpful-count CAPTURE but not sort + no cross-star loop + no Customers-say block + no trigger popup with cap override). Session 1's cap is 200 reviews total from the current visible review-list filter; Session 2 expands to ~200/star × 5 stars = up to 1000.

**ONE DEFERRED carry-over to the eventual Amazon deploy session (Rule 26).** First end-to-end real-Chrome extraction test on a real Amazon product page (originally launch-prompt step 10) — deferred to the eventual Amazon deploy session ~3-5 sessions from now. Reason: the PLOS-side handler changes (`toWireShape` additions + POST accept `helpfulCount` + `platform`) aren't yet on production vklf.com — they ship at the Amazon deploy session when the build commits ff-merge to main under Rule 9 gate. Until then, an end-to-end test against vklf.com would silently drop the new fields. Captured here in §B + in the eventual deploy session's launch prompt; not in NEXT_SESSION.md `## Standing carry-overs` since it requires the deploy session to be the resolution venue, not a Claude-defer the next session can resolve directly.

**Cross-references:**
- `docs/ROADMAP.md` P-49 status flip from "🟢 DESIGN-FROZEN 2026-05-25-b" to "🟢 IN-FLIGHT 2026-05-26 — Workstream 2 Amazon Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-26" + Amazon Session 1 narrative landed in the Workstream 2 section + (a.93) closes + (a.94) opens.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-26 — closing entry for this session capturing TWO NEW reusable Patterns + calibration data point + LOW informational sub-observation (pure-design-session investment pays off at first build session as the third Pattern in the capture → design → build pipeline).
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-26 — extension-side architecture cross-reference pointer for the new shared content-script modules + new context-menu entry + orchestrator handler addition per the P-23 + P-46 precedent.
- §A.1 (Extension only) — confirmed at build time.
- §A.2 (Amazon first priority) — confirmed at build time.
- §A.3 (in-page Shadow DOM progress indicator) — confirmed at build time + additive interpretation context (fetch+DOMParser is "in-page" for pagination workflows).
- §A.4 (per-URL `reviewScrapeCap` default 200/star + per-trigger override) — per-URL part shipped; per-trigger override deferred to Session 2.
- §A.13/§A.16 (full schema package) — shipped via `npx prisma db push`.
- §A.15 (conservative anti-bot defaults) — shipped via `scrape-pagination.ts`.
- §C.2 (Workstream 2 implementation outline) — Session 1 hit the spec'd scope cleanly.
- `feedback_recommendation_style.md` (most-thorough/reliable — every implementation decision today followed the design doc + launch prompt's Recommended path).
- `feedback_default_to_recommendation.md` (ZERO Rule 14f pickers fired this session validates the default-to-Recommended posture when upstream specs are unambiguous).
- `feedback_approval_scope_per_decision_unit.md` (2-push build-session pattern: workflow-branch push + doc-batch ff-merge to main for doc-batch only).
- §Entry 2026-05-25-b CORRECTIONS_LOG (Reviews Phase 2 Design Session closing entry — pre-build upstream) — yesterday's pure-design session produced the design doc this session consumes.
- §Entry 2026-05-25 CORRECTIONS_LOG (Reviews Phase 2 scope-expansion capture session — pre-pre-build upstream) — the original capture session whose verbatim DOM specs informed the design session yesterday + the build session today.

**Closing line:** P-49 W2 Amazon Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-26 on `workflow-2-competition-scraping` via build commit `422436f` (20 files +2069/-7) — first build session of the Reviews Phase 2 implementation arc; foundation session bundling schema (the §A.13/§A.16 package via `npx prisma db push` 1.44s additive only zero data loss) + shared content-script infrastructure (`scrape-pagination.ts` + `scrape-progress-indicator.ts`) + Amazon DOM walker (`amazon-review-extractor.ts`) + right-click context-menu wiring + PLOS-side handler extensions under one commit. ZERO Rule 9 deploy gates fired. ZERO Rule 14f forced-pickers fired. Schema-change-in-flight flag flipped NO → YES at `npx prisma db push`. Pre-build + post-build /scoreboard 5/5 GREEN at expected new baselines (611 ext +49 from baseline 562; 786 src/lib UNCHANGED; 62 routes UNCHANGED). NEW baseline locked: extension `npm test` = 611/611. §A unchanged per Rule 18 — every §A decision consumed by Session 1 confirmed at build time; the fetch+DOMParser pagination approach is an in-build interpretation of §A.3 ("in-page" includes same-origin fetch+DOMParser, not strictly the live document only) — additive context, not a §A change. TWO NEW reusable Patterns memorialized in §Entry 2026-05-26 of CORRECTIONS_LOG. Closes (a.93); opens (a.94) RECOMMENDED-NEXT = P-49 W2 Amazon Session 2 (cross-star navigation loop + helpful-count sort within star + `Customers say` AI-summary block capture + trigger popup with per-URL cap override) on `workflow-2-competition-scraping`. FIRST build-session §B entry in this design doc per Rule 18 — future P-49 build-session §B entries land here.

---

## §B 2026-05-27 — `session_2026-05-27_p49-w2-amazon-session-2` — Workstream 2 Amazon Session 2 ships cross-star navigation loop + helpful-count sort + Customers-say block + Shadow DOM trigger popup with per-URL cap override atop the Session 1 foundation via build commit `1830074` (5 files +1054/-99); SECOND build-session §B entry per Rule 18; §A.4 cap cascade memorialized (Session 1 per-URL default + Session 2 per-trigger override); Customers-say Rule 14f outcome memorialized (starRating=5 sentinel + source="extension-scrape:customers-say" discriminator)

**§A frozen** per Rule 18. This is the SECOND build-session §B entry in this design doc (the first was Session 1's §B 2026-05-26). Today's entry consumes §A.4 (per-URL cap + per-trigger override — both halves now shipped at code level after today) without surfacing a §A amendment.

**Session shape: pure CODE session (NO deploys, NO Rule 9 gates fired, EXACTLY ONE Rule 14f forced-picker fired for the Customers-say block storage-shape choice).** Build commit `1830074` (5 files +1054/-99) lands on `workflow-2-competition-scraping`; NOT ff-merged to main this session (build session; build commits stay on the workflow branch until the Amazon deploy session per (a.95)). **Schema-change-in-flight flag STAYS YES** entire session carrying from Session 1's `npx prisma db push` — no schema work this session; STAYS YES until Amazon deploy session ships migration live on vklf.com.

**Files touched (per the launch-prompt task shape):**

**Major refactor of the Amazon per-platform extractor (1 file +419/-93):**
- `extensions/competition-scraping/src/lib/content-script/amazon-review-extractor.ts` (+419/-93) — NEW `AMAZON_STAR_FILTERS` const + `AmazonStarFilter` type (one_star / two_star / three_star / four_star / five_star — Amazon's URL convention for the `filterByStar` query parameter); NEW `starRatingForFilter(filter: AmazonStarFilter): 1 | 2 | 3 | 4 | 5` mapping helper + NEW `buildAmazonStarFilterUrl(asin: string, filter: AmazonStarFilter, pageNumber: number)` URL constructor (composes `https://www.amazon.com/product-reviews/<ASIN>/?filterByStar=<filter>&pageNumber=<N>`) + NEW `buildAmazonProductListingUrl(asin: string)` URL constructor (composes `https://www.amazon.com/dp/<ASIN>` for the Customers-say block fetch). **`runAmazonReviewScrape` refactored from "scrape current view" to ASIN-driven cross-star loop** (pages 1..N all fetched via fetch+DOMParser — an EXTENSION of Session 1's `fetch()` + `DOMParser` pagination Pattern at the cross-star loop level). Session 1's orchestrator rooted page 1 in the live DOM; Session 2's refactor fetches page 1 via fetch+DOMParser too since the cross-star loop visits up to 5 different filter views and only one of them (at most) can be the live DOM. `AmazonScrapeContext` shape changed: `cap` → `capPerStar` + NEW `asin: string` + NEW optional `starsToVisit?: AmazonStarFilter[]` (default: all 5 filters in order). `AmazonScrapeResult` gains `insertedByStar: Record<AmazonStarFilter, number>` + `customersSayInserted: boolean`. Captcha + rate-limit abort the whole scrape per §A.15 anti-escalation (one trip-wire halts all 5 star-filters' remaining work). NEW `sortByHelpfulCountDesc(rows: ParsedReview[]): ParsedReview[]` helper (stable; null sorts last; doesn't mutate input — pure functional preserving immutability) applied per-star before saveReview. NEW `extractCustomersSayFromListing(doc: Document): string | null` helper with 4 selector fallbacks (`[data-hook="cr-insights-widget"]` canonical + 3 alternates) — defensive against Amazon's evolving DOM. NEW private `scrapeOneStar(ctx, filter, signal)` orchestration helper + NEW private `scrapeCustomersSayBlock(ctx, signal)` orchestration helper (extracted from `runAmazonReviewScrape` to reduce its cognitive load + enable per-helper unit testing). `AmazonScrapeSaveInput.source` widened to discriminated union `'extension-scrape' | 'extension-scrape:customers-say'` per the Rule 14f picker outcome below.

**Orchestrator handler refactor (1 file +59/-37):**
- `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` (+59/-37) — `start-review-scrape` handler refactored to: (a) extract ASIN via existing `extractAsinFromReviewUrl` helper from Session 1; (b) fire `openScrapeTriggerModal({ defaultCap: savedCompetitorUrlRows[urlId]?.reviewScrapeCap ?? 200 })` BEFORE dispatching to `runAmazonReviewScrape` (modal cancel returns silently with no toast); (c) build new context shape (`asin` + `capPerStar` from modal output + per-URL `competitorUrlId` from the saved row); (d) saveReview wrapper passes `input.source` through to `createCapturedReview` so both per-reviewer rows (`'extension-scrape'`) + Customers-say rows (`'extension-scrape:customers-say'`) reach the API correctly.

**NEW Shadow DOM trigger modal (2 new files; 364 LOC total):**
- NEW `extensions/competition-scraping/src/lib/content-script/scrape-trigger-modal.ts` (320 LOC) — Shadow DOM-mounted modal with per-star-cap numeric input pre-filled with saved per-URL `reviewScrapeCap` default. Open shadow root on a fixed-positioned host `<div>` in `document.body` with high `z-index` (reuses the P-47 2026-05-24-d mount pattern — **SECOND consumer of the P-47 Pattern after Session 1's `scrape-progress-indicator.ts`**). Returns Promise resolving to `{ capPerStar: number }` on Start OR `null` on Cancel / Escape / backdrop click (canonical modal UX). NEW `clampCap(raw: unknown): number` pure helper exported for unit testing (MIN_CAP=1, MAX_CAP=5000; floors decimals via `Math.floor`; returns 200 for non-finite or NaN inputs; clamps to [MIN_CAP, MAX_CAP]).
- NEW `extensions/competition-scraping/src/lib/content-script/scrape-trigger-modal.test.ts` (44 LOC) — 5 new node:test cases for `clampCap`: (1) within-range value passes through unchanged; (2) value below MIN_CAP clamped up to 1; (3) value above MAX_CAP clamped down to 5000; (4) decimal value floored; (5) non-finite (NaN / Infinity / `null`) returns 200 default.

**Tests for the Amazon refactor (1 file +182):**
- `extensions/competition-scraping/src/lib/content-script/amazon-review-extractor.test.ts` (+182) — 17 new node:test cases covering all new helpers (`starRatingForFilter` × 5 cases / `buildAmazonStarFilterUrl` × 2 cases / `buildAmazonProductListingUrl` × 1 case / `sortByHelpfulCountDesc` × 4 cases including stable-sort + null-sorts-last + empty + immutability / `extractCustomersSayFromListing` × 4 cases including canonical selector hit + first-fallback hit + all-selectors-miss returns null + multi-line text extraction / new `runAmazonReviewScrape` cross-star orchestration × 1 integration-style case verifying the modal-then-scrape flow returns the new shape).

**Pre-build + post-build /scoreboard 5/5 GREEN at expected new baseline** (root tsc clean / extension tsc clean / **extension `npm test` 633/633 +22 from Session 1 baseline 611** — exact match with the 22 new test cases / **786 src/lib UNCHANGED** / **62 routes UNCHANGED**); Check 6 Playwright SKIPPED per Rule 27 non-deploy-session convention. **NEW baseline locked from this session:** extension `npm test` = **633/633**.

**Confirm §A.4 cap cascade memorialized (§A frozen per Rule 18 — informational note, not a §A change).** §A.4 spec'd "per-URL setting via new `CompetitorUrl.reviewScrapeCap` column + per-trigger override." Session 1 shipped the per-URL default (`CompetitorUrl.reviewScrapeCap Int? @default(200)` + handler/route wiring); Session 2 shipped the per-trigger override (the trigger modal pre-fills with the per-URL default + lets the user override for this run via the numeric input). The cap cascade is now fully implemented at code level. Phase 4 verification (next session at the Amazon deploy) confirms the cascade end-to-end on a real Amazon product.

**Customers-say Rule 14f outcome memorialized (§A frozen per Rule 18 — informational note, not a §A change).** The launch prompt explicitly anticipated a Rule 14f picker for the Customers-say block storage-shape choice. 4 options were offered: **(A) starRating=5 sentinel + source="extension-scrape:customers-say"** — no schema change, no wire-validator change, but lies about rating semantic; **(B) Relax wire validator to allow starRating=0 sentinel** — cleaner semantic but couples validator to source; **(C) Add new `amazonCustomersSayText` column on CompetitorUrl** — additive schema change requiring another `prisma db push`; **(D) Defer Customers-say entirely.** Director picked Option A (Recommended). Rationale: Customers-say is overall-positive AI-summary — starRating=5 is closer to the truth than starRating=0; the wire validator stays decoupled from source semantics; W4's star-count counter-bar (per §A.14) will filter on the `source` discriminator to render Customers-say rows specially (likely a separate banner above the per-star counter-bar rather than as a 5-star count contribution); rows can be re-encoded later via the existing PATCH route if a future design decision picks a different shape (reversibility preserved). **The discriminator field choice (source vs. new column) was NOT a separate picker** — the launch prompt locked "reuse the existing `source` column with a new value over add a new enum/column" as Recommended and per `feedback_default_to_recommendation.md` no re-confirmation picker fired. The widened `AmazonScrapeSaveInput.source` discriminated union (`'extension-scrape' | 'extension-scrape:customers-say'`) is the type-system-level expression of this choice.

**NEW reusable Pattern: "Cross-star loop's 'fetch page 1 too' refines Session 1's fetch+DOMParser Pattern."** Session 1's `runAmazonReviewScrape` rooted page 1 in the live DOM (`document` — the page the user is already on when right-clicking) + walked pages 2..N via `fetch()` + `DOMParser`. That was correct for the single-filter-view scrape Session 1 shipped. Session 2's cross-star loop visits up to 5 different filter views (one_star / two_star / three_star / four_star / five_star), only ONE of which (at most) can be the live DOM — the user can't be on five different filter URLs simultaneously. Therefore the cross-star loop fetches page 1 via fetch+DOMParser TOO — not just pages 2..N. The fetch+DOMParser Pattern from Session 1 generalizes from "pages 2..N within one filter view" to "all pages of all filter views" without adding any new mechanism: the cross-star loop just invokes the same paginate-via-fetch+DOMParser helper once per filter. The Pattern's generalization observation: **once you've decided to use fetch+DOMParser for any pages in a multi-page scrape, using it uniformly for ALL pages (including page 1) is the most-thorough/reliable choice** — eliminates the live-DOM-vs-fetched-DOM branching in the per-row walker + ensures all rows are extracted from identical Document shapes (no accidental coupling to live-DOM-specific behaviors like CSS-applied styles).

**Affected §A sections in this doc (informational — §A stays frozen per Rule 18).**
- **§A.3 (in-page execution with Shadow DOM progress indicator) — informationally extended** with Session 2's additional consumer of the P-47 Shadow DOM mount pattern (the trigger modal). §A.3 stays frozen; today's entry memorializes that the progress indicator (Session 1) + the trigger modal (Session 2) are now BOTH active consumers of the P-47 Pattern within the P-49 W2 Amazon scrape flow. Any future per-platform sub-cluster trigger modals (eBay, Etsy, Walmart) will reuse the SAME `scrape-trigger-modal.ts` helper, not re-implement.
- **§A.4 (per-URL cap + per-trigger override) — cascade complete at code level.** Session 1 shipped the per-URL default; Session 2 ships the per-trigger override. Both halves of §A.4 are now implemented at code level. Phase 4 verification at the Amazon deploy session confirms end-to-end.
- **§A.13/§A.16 (full schema package) — already shipped Session 1; reused this session.** No schema work this session — Session 2 reads + writes existing fields (`reviewScrapeCap` for the modal default; `helpfulCount` for the sort; `source` widened in the type system but not the database) from Session 1's schema additions.
- **§A.15 (conservative anti-bot defensive posture) — reused Session 1's helpers.** The `scrape-pagination.ts` helper from Session 1 provides the conservative defaults (1-3s random delays + captcha-aware abort + rate-limit detection); Session 2's cross-star loop composes against this helper once per star filter without re-implementing the anti-bot logic.
- **§A.14 (star UI — counter-bar with click-to-filter) — cross-reference for W4 ingestion.** Session 2's Customers-say block storage-shape decision (starRating=5 sentinel + source discriminator) sets up W4's counter-bar implementation to filter on `source` for special rendering. Memorialized here so W4's design session reads the discriminator semantic as locked.

**Session 3 next scope (if needed) — likely NOT needed.** The launch prompt anticipated possibly a Session 3 for refinement based on real-Chrome calibration data, but Sessions 1 + 2 together ship the full Amazon scope spec'd in the design doc (single-filter + cross-star + Customers-say + trigger modal). Recommended path (per (a.95)) is to deploy first + use Phase 4 verification to surface any refinement needs empirically. If Phase 4 surfaces issues, the fix-forward Pattern (small UI-only or selector-tweak commits ship under additional Rule 9 gates within the same deploy session) handles most cases. A standalone Session 3 between Session 2 and deploy is NOT recommended — pure speculation would be redundant with Phase 4's empirical data.

**Scope deferred to Phase 4 verification (NOT a carry-over; resolution venue is the next session by definition).** First end-to-end real-Chrome extraction test on a real Amazon product page — carrying from Session 1's deferred carry-over. The Amazon deploy session ff-merges Sessions 1 + 2 builds + intervening doc-batches to main under Rule 9 gate, Vercel auto-redeploys vklf.com with the new PLOS-side handlers, `npm run zip` produces a fresh extension package, and director runs the first end-to-end real-Chrome extraction test on a real Amazon product page. This is captured in the §Entry 2026-05-27 of CORRECTIONS_LOG + in the deploy session's launch prompt; NOT in NEXT_SESSION.md `## Standing carry-overs` since it resolves AT the next session by definition.

**Cross-references:**
- `docs/ROADMAP.md` P-49 status update — Workstream 2 Amazon Sessions 1 + 2 ✅ DONE-AT-CODE-LEVEL on `workflow-2-competition-scraping`; (a.94) closes + (a.95) opens for P-49 W2 Amazon DEPLOY session; Schema-change-in-flight flag STAYS YES.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-27 — closing entry for this session capturing TWO NEW reusable Patterns ("Build-session end-of-session push pattern: ONE push to workflow branch, NOT two" + "Pre-emptive design choice rolled into Rule 14f picker") + LOW informational drift sub-observation + calibration data point.
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-27 — extension-side architecture cross-reference pointer entry per the P-23 + P-46 + Session 1 precedent — mentions the NEW Shadow DOM trigger modal as the SECOND consumer of the P-47 Pattern after Session 1's progress indicator.
- §B 2026-05-26 — Session 1 first build-session entry; today's entry pairs with it as the W2 Amazon build-cluster pair before the deploy session.
- §A.4 (per-URL cap + per-trigger override) — cascade complete this session.
- §A.13/§A.16 (schema package) — reused without modification.
- §A.14 (star UI counter-bar) — informational cross-reference for W4 future ingestion of the Customers-say source discriminator.
- §A.15 (conservative anti-bot defensive posture) — reused via Session 1's `scrape-pagination.ts` helper without modification.
- §C.2 (Workstream 2 implementation outline) — Session 2 hit the spec'd scope cleanly.
- `feedback_recommendation_style.md` (most-thorough/reliable — every implementation decision today followed the design doc + launch prompt's Recommended path; the Customers-say Rule 14f picker offered the Recommended Option A director picked).
- `feedback_default_to_recommendation.md` (default to Recommended — director picked Recommended on the one picker that fired; the discriminator-column choice was skipped as a picker since the launch prompt locked it as Recommended).
- `feedback_approval_scope_per_decision_unit.md` (1-push pattern this session per the NEW Pattern in CORRECTIONS_LOG §Entry 2026-05-27 sub-observation (b)).
- P-47 Shadow DOM mount strategy (§B 2026-05-24-d in `docs/COMPETITION_SCRAPING_DESIGN.md`) — the mount pattern today's `scrape-trigger-modal.ts` reuses as the SECOND consumer after Session 1's `scrape-progress-indicator.ts`.
- §Entry 2026-05-26 CORRECTIONS_LOG (Session 1 closing entry) — yesterday's Pattern memorializations (fetch+DOMParser + Foundation-session-bundles) extended today.

**Closing line:** P-49 W2 Amazon Session 2 ✅ DONE-AT-CODE-LEVEL 2026-05-27 on `workflow-2-competition-scraping` via build commit `1830074` (5 files +1054/-99) — second build session of the Reviews Phase 2 implementation arc atop the Session 1 foundation; cross-star navigation loop + helpful-count sort within star + `Customers say` AI-summary block capture + Shadow DOM trigger popup with per-URL cap override all shipped at code level under one commit. ZERO Rule 9 deploy gates fired. EXACTLY ONE Rule 14f forced-picker fired (Customers-say storage-shape — director picked Recommended Option A: starRating=5 sentinel + source="extension-scrape:customers-say" discriminator). Schema-change-in-flight flag STAYS YES carrying from Session 1; STAYS YES until Amazon deploy completion. Pre-build + post-build /scoreboard 5/5 GREEN at expected new baseline (633 ext +22 from Session 1 baseline 611; 786 src/lib UNCHANGED; 62 routes UNCHANGED). NEW baseline locked: extension `npm test` = 633/633. §A unchanged per Rule 18 — every §A decision consumed by Session 2 confirmed at build time without surfacing a §A amendment. §A.4 cap cascade now fully implemented at code level (Session 1 per-URL default + Session 2 per-trigger override). Customers-say Rule 14f outcome memorialized as informational design-doc note (starRating=5 sentinel + source discriminator; reversible via PATCH route). Closes (a.94); opens (a.95) RECOMMENDED-NEXT = P-49 W2 Amazon DEPLOY session (bundle Sessions 1 + 2 build commits + intervening doc-batches as one ff-merge under Rule 9 gate; Vercel auto-redeploy; fresh extension zip via `npm run zip`; Phase 4 director real-Chrome verification on a real Amazon product page resolves the Session 1 deferred carry-over) on `workflow-2-competition-scraping` → `main`. SECOND build-session §B entry in this design doc per Rule 18 — pairs with §B 2026-05-26 (Session 1) as the W2 Amazon build-cluster pair before the deploy session.

---

## §B 2026-05-28 — `session_2026-05-28_p49-w2-amazon-deploy-and-fix-forwards` — P-49 W2 Amazon ✅ DEPLOYED-AND-VERIFIED 2026-05-28 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — first production deploy of the Reviews Phase 2 implementation arc; Sessions 1 + 2 + intervening doc-batches all ff-merged to main under ONE Rule 9 deploy gate as the initial deploy + 3 fix-forward commits (FF#1 standalone + FF#2+FF#3 bundled + FF#4 standalone) shipped under 3 additional Rule 9 deploy gates within ONE Phase 4 verification session; final director PASS verdict after FF#4 ("It worked, all reviews scraped past 10"); RESOLVES the Sessions 1 + 2 standing carry-over (first end-to-end real-Chrome extraction test on a real Amazon product page); **Schema-change-in-flight flag FLIPPED YES → NO at initial deploy push completion** (canonical schema-change-ships-to-production transition); THIRD build/deploy-session §B entry per Rule 18

**§A frozen** per Rule 18. This entry is informational + deploy-session memorialization. The deploy-session-side entry lives here (canonical for the build/deploy arc per Rule 18); the extension-side architecture cross-reference pointer lives in `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-28 per the dual-doc precedent set by §B 2026-05-26 (Session 1) + §B 2026-05-27 (Session 2).

**Session shape: DEPLOY + 4-FIX-FORWARD session on `workflow-2-competition-scraping` → `main` (4 Rule 9 deploy gates fired; 9 Rule 14f forced-pickers fired all director-Yes to Recommended).** Initial deploy ff-merge `1914171..0ef8340` carrying 4 commits (Session 1 build `422436f` + Session 1 doc-batch `1323f9a` + Session 2 build `1830074` + Session 2 doc-batch `0ef8340`) under Rule 9 deploy gate #1; Vercel auto-redeploy fired; fresh extension zip `plos-extension-2026-05-28-w2-deploy-37.zip` produced via `npm run zip`; Phase 4 director real-Chrome verification on a real Amazon product page surfaced 4 distinct issues across 2 verification rounds; 3 fix-forward commits shipped under their own Rule 9 deploy gates (FF#1 `8bc2e7e` standalone + FF#2+#3 `b55cdbd` bundled + FF#4 `f6944db` standalone); final director PASS verdict after FF#4. **4 fresh extension zips at repo root** (initial + ff1 + ff2-ff3 + ff4 — director used the final `-ff4.zip` for the PASS verification). **Schema-change-in-flight flag FLIPPED YES → NO at initial deploy push completion** (canonical schema-change-ships-to-production transition carrying from Session 1's `npx prisma db push` of the §A.16 migration); STAYED NO through 3 fix-forwards (none touch schema); final state NO at session end.

**4-fix-forward cascade narrative (each fix's diagnosis + resolution):**

- **FF#1 `8bc2e7e`** (3 files +190/-16; +18 ext tests) — Phase 4 surfaced the right-click on `/dp/` product page was rejected with "Review scraping is currently available on Amazon product-review pages only"; dispatch check at `orchestrator.ts:1163` (`isAmazonReviewPage(url)`) was too restrictive given Session 2's cross-star refactor (ALL pages fetched via fetch+DOMParser, so the starting page is just an ASIN source); added `isAmazonProductPage` / `isAmazonScrapableUrl` / `extractAsinFromProductUrl` / `extractAsinFromAmazonUrl` symmetric helpers + updated dispatch + extended `urlsMatchByAsin` to accept `/dp/` in first arg. 18 new test cases: `isAmazonProductPage` × 5 + `isAmazonScrapableUrl` × 5 + `extractAsinFromProductUrl` × 3 + `extractAsinFromAmazonUrl` × 3 + `urlsMatchByAsin` × 2 new cases against /dp/ in first arg.

- **FF#2+#3 `b55cdbd` bundled** (6 files +274/-8; +4 ext tests) — FF#2 addressed the modal lacking per-star granularity (director couldn't pick which stars to scrape) — added 5 star checkboxes to the Shadow DOM trigger modal + new `starFilterForRating` helper. FF#3 addressed the progress indicator's confusing "0 reviews then 46 reviews" messaging — added per-star breakdown so the indicator shows current star + cumulative count per star + total cumulative. Bundled into ONE commit + ONE deploy since operationally adjacent + ship to the same UI surface. 4 new test cases for `starFilterForRating` helper.

- **FF#4 `f6944db`** (1 file +23/-10; 0 new tests — integration-level deferred to Playwright per Rule 27) — Phase 4 surfaced "all reviews per star end at 10"; `findNextPageUrl()` looked for the OLD `<li.a-last><a>` next-link CSS selector which Amazon no longer renders (Amazon switched to "Show 10 more reviews" button); replaced `findNextPageUrl` call in `scrapeOneStar`'s `advanceToNextPage` with direct pageNumber increment via `buildAmazonStarFilterUrl(asin, filter, N+1)`; stop signal = fetched page has 0 reviews; doesn't depend on Amazon's UI; works regardless of numbered links / Show-more button / AJAX. Final director PASS verdict after this fix-forward ("It worked, all reviews scraped past 10").

**NEW reusable Pattern: "Phase 4 verification fix-forward cascade scales beyond N=5 when each issue is scoped + reversible + UI-only."** (Canonical memorialization lives in `docs/CORRECTIONS_LOG.md` §Entry 2026-05-28 sub-observation (b); this entry references the Pattern as a deploy-session-level Pattern.) Today shipped 4 fix-forwards (3 commits since FF#2+FF#3 bundled) under separate Rule 9 deploy gates within ONE Phase 4 verification session. Each fix targeted a single empirically-surfaced issue; each was scoped to a small file set (max 6 files in FF#2+#3); each was UI-only or routing-only (no schema work, no API contract changes); each was reversible via standard ff-merge revert. The 4-fix cascade landed cleanly without compounding side effects. **Pairs with + extends the P-46 W3 2026-05-24-f "Phase-4 verification fix-forward cascade in a single deploy session" Pattern (which set the precedent at N=5 fix-forwards in one session).** Future P-49 W2 sub-cluster deploy sessions (eBay / Etsy / Walmart) should expect 1-5 fix-forwards within the same deploy session as the canonical pattern, not single-fix-forward sessions.

**NEW reusable Pattern: "FF#1 dispatch over-restriction antipattern at the per-platform extractor layer."** (Canonical memorialization in CORRECTIONS_LOG §Entry 2026-05-28 sub-observation (c).) Session 2's dispatch check `isAmazonReviewPage(url)` only accepted `/product-reviews/<ASIN>/` URLs. Per the Session 2 cross-star refactor (everything fetched via fetch+DOMParser), the starting page is JUST an ASIN source — the dispatch should accept ANY Amazon URL exposing the ASIN. **The design intent and the code drifted apart between Session 1's "live-DOM rooted" approach and Session 2's "all-fetch-based" approach**; the dispatch check wasn't updated when Session 2 generalized the pagination. **Future per-platform sub-cluster sessions (eBay / Etsy / Walmart) should adopt the `isXxxScrapableUrl` + `extractAsinFromXxxUrl` symmetric helper Pattern from FF#1 from the start** — each platform's dispatch should accept ALL valid product/listing/review URLs exposing the canonical item identifier (ASIN for Amazon; ItemID for eBay; ListingID for Etsy; ItemID for Walmart). Reduces the likelihood of repeating this antipattern at each platform's first deploy session.

**NEW reusable Pattern: "Findnextpage-link-selector empirically falsified by Amazon UI change → pageNumber-direct-increment is the more robust replacement."** (Canonical memorialization in CORRECTIONS_LOG §Entry 2026-05-28 sub-observation (d).) FF#4 replaced `findNextPageUrl` with direct pageNumber URL construction. When the underlying URL parameter contract is stable (Amazon's `?pageNumber=N` has been stable for years), prefer URL-construction-based pagination over DOM-link-scraping-based pagination — the latter is brittle to UI changes that the former is immune to. **Reinforces the P-48 Session 1 "ffprobe-first / empirical-first diagnostic" Pattern at the pagination layer.** Generalizable observation: the per-platform extractor design should prefer URL-construction-based navigation primitives wherever the platform exposes a stable URL parameter contract. Amazon, eBay (page number in query string), Etsy (page number in URL path), Walmart (page number in query string) all expose stable URL-parameter pagination contracts. Future per-platform sub-cluster sessions should adopt URL-construction pagination from the start, not DOM-link-scraping.

**Affected §A sections in this doc (informational — §A stays frozen per Rule 18).**
- **§A.13 (schema package) — first production deploy 2026-05-28.** The full §A.13 + §A.16 schema package (`ReviewAnalysis` model + `ReviewAnalysisLevel` enum + `CapturedReview.sortRank` / `.helpfulCount` / `.platform` + `CompetitorUrl.reviewScrapeCap`) shipped via Session 1's `npx prisma db push` 2026-05-26 + reached production via today's initial deploy push 2026-05-28. Schema-change-in-flight flag FLIPPED YES → NO at this push completion.
- **§A.4 (per-URL cap + per-trigger override) — FF#2 extended the per-trigger override UI with per-star checkbox granularity.** Session 1 shipped the per-URL default; Session 2 shipped the per-trigger override numeric input; today's FF#2 extended the trigger override with per-star checkboxes letting director pick which stars to scrape (5 checkboxes pre-checked by default = all stars on). §A.4 stays frozen per Rule 18; today's FF#2 is informational — the per-trigger override UI gained a granularity dimension (per-star vs. all-stars) without changing the underlying schema or wire shape.
- **§A.14 (star UI — counter-bar with click-to-filter) — DEFERRED to W4 Session 1 per Phase 4 verification issue #3 W4-destination capture.** Phase 4 verification surfaced "no way to see reviews of specific star counts on vklf.com Captured Reviews section after the Amazon DEPLOY populated the corpus." Per the §4 Step 1c forced-picker outcome locked at end-of-session, director picked P-49 W4 Captured Reviews UI extensions Session 1 NEXT (Recommended), which directly addresses issue #3 by shipping the star-count counter-bar with click-to-filter per §A.14. The deferral to W4 is more thorough than a quick fix-forward at deploy time — the canonical §A.14 scope ships in the canonical workstream. §A.14 stays frozen per Rule 18; today's deferral is informational — the §A.14 implementation moves from "P-49 W4 future scope" to "P-49 W4 Session 1 NEXT scope."
- **§A.15 (conservative anti-bot defensive posture) — held under the 4-fix-forward stress test.** None of the 4 fix-forwards triggered captcha or rate-limit on Amazon; the conservative defaults (1-3s random delays + captcha-aware abort + rate-limit detection) from Session 1's `scrape-pagination.ts` held under real-Chrome verification on a multi-thousand-review Amazon product. §A.15 stays frozen per Rule 18; today's verification is informational — the conservative posture is empirically validated at production scale.

**Cross-references:**
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-28 — closing entry for this deploy session capturing THREE NEW reusable Patterns memorialized canonically + LOW informational P-43 cwd-leak Pattern Class reproduction + calibration data point (9/9 = 100% director-Yes to Recommended).
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-28 — extension-side architecture cross-reference pointer entry; FF#2 trigger modal extension with 5 star checkboxes is the THIRD P-47 mount pattern consumer + FF#4 pageNumber-increment pagination is the FIRST URL-construction-based pagination Pattern in the extension.
- `docs/ROADMAP.md` P-49 status update — Workstream 2 Amazon ✅ DEPLOYED-AND-VERIFIED 2026-05-28 narrative; (a.95) closes + (a.96) opens for P-49 W4 Captured Reviews UI extensions Session 1.
- §B 2026-05-27 (P-49 W2 Amazon Session 2 second build-session entry) — Session 2 build cluster (cross-star + Customers-say + trigger modal); today's deploy ships Session 2 + 3 fix-forwards.
- §B 2026-05-26 (P-49 W2 Amazon Session 1 first build-session entry) — Session 1 foundation (schema + shared infra + Amazon DOM walker); today's deploy ships Session 1 too.
- §A.13 + §A.16 (full schema package) — first production deploy 2026-05-28 via today's initial deploy push.
- §A.4 (per-URL cap + per-trigger override) — FF#2 extended per-trigger override UI with per-star checkbox granularity.
- §A.14 (star UI counter-bar with click-to-filter) — DEFERRED to W4 Session 1 per Phase 4 verification issue #3.
- §A.15 (conservative anti-bot defensive posture) — empirically validated at production scale.
- §C.2 (Workstream 2 implementation outline) — Amazon sub-cluster ✅ COMPLETE (Sessions 1 + 2 build + today's deploy + 4-fix-forward cascade); eBay sub-cluster NEXT in W2 priority order per A.2 (but per Step 1c picker outcome, W4 Session 1 takes priority for one session to address Phase 4 issue #3 first).
- `feedback_recommendation_style.md` (most-thorough/reliable — every Rule 14f picker today framed Recommended; 9/9 director-Yes).
- `feedback_default_to_recommendation.md` (default-to-Recommended — 9/9 = 100% calibration data point reinforces).
- `feedback_playwright_for_repeatable_walkthroughs.md` (Phase 4 mode picker fired at the 5+ step manual walkthrough decision point per the directive; director picked Manual walkthrough Recommended).
- P-46 W3 2026-05-24-f bundled Phase-4 verification + fix-forward cascade entry — today's 4-fix-forward cascade extends this precedent.
- P-47 Shadow DOM mount strategy (§B 2026-05-24-d in `docs/COMPETITION_SCRAPING_DESIGN.md`) — FF#2 extended the trigger modal (Session 2's P-47 consumer) with 5 star checkboxes; the trigger modal is now the THIRD P-47 mount pattern consumer after the progress indicator + the original `video-capture-form.ts`.
- P-48 Session 1 ffprobe-first / empirical-first diagnostic Pattern (§Entry 2026-05-25) — today's FF#4 pageNumber-direct-increment reinforces this Pattern at the pagination layer.

**Closing line:** P-49 W2 Amazon ✅ DEPLOYED-AND-VERIFIED 2026-05-28 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — first production deploy of the Reviews Phase 2 implementation arc. 4 Rule 9 deploy gates fired (initial + FF#1 + FF#2+#3 + FF#4). 9 Rule 14f forced-pickers fired, all director-Yes to Recommended (9/9 = 100% calibration). Schema-change-in-flight flag FLIPPED YES → NO at initial deploy push completion (canonical schema-change-ships-to-production transition). NEW baseline locked: extension `npm test` = 655/655 (+22 cumulative from 633 entry baseline; +18 FF#1 + 4 FF#2+#3 + 0 FF#4). 4 fresh extension zips at repo root (initial + ff1 + ff2-ff3 + ff4). Final director PASS verdict after FF#4 RESOLVES the Sessions 1 + 2 standing carry-over (first end-to-end real-Chrome extraction test on a real Amazon product page). §A unchanged per Rule 18 — every §A decision consumed by today's deploy session confirmed at production-deploy time without surfacing a §A amendment. §A.13 + §A.16 schema package shipped to production via initial deploy push. §A.4 cap cascade gained per-star granularity via FF#2. §A.14 star UI counter-bar deferred to W4 Session 1 per Phase 4 verification issue #3 W4-destination capture. §A.15 conservative anti-bot defensive posture empirically validated at production scale. THREE NEW reusable Patterns memorialized — "Phase 4 verification fix-forward cascade scales beyond N=5" + "FF#1 dispatch over-restriction antipattern" + "Findnextpage-link-selector empirically falsified → pageNumber-direct-increment more robust." Closes (a.95); opens (a.96) RECOMMENDED-NEXT = P-49 W4 Captured Reviews UI extensions Session 1 on `workflow-2-competition-scraping`. THIRD build/deploy-session §B entry in this design doc per Rule 18 — pairs with §B 2026-05-26 (Session 1) + §B 2026-05-27 (Session 2) as the W2 Amazon arc's complete build-cluster + deploy-cluster trio. The next §B entry will land at the W4 Session 1 close.

---

## §B 2026-05-29 — `session_2026-05-29_p49-w4-captured-reviews-ui-session-1` — Workstream 4 Captured Reviews UI extensions Session 1 lands all 3 §C.4 pieces (counter-bar + bulk-delete + drag-reorder) in ONE session per the Rule 14f scope picker outcome via build commit `e89ae50` (9 files +2162/-43); FOURTH build/deploy-session §B entry per Rule 18; directly addresses 2026-05-28 Phase 4 verification issue #3 W4-destination capture; TWO NEW reusable Patterns memorialized ("Pure helpers extracted from .tsx component file for node:test coverage" + "Customers-say split: separate AI-summary row from main reviews via source discriminator")

**Session shape:** Pure CODE session on `workflow-2-competition-scraping`; ZERO Rule 9 deploy gates fired (build commit stays on workflow branch until W4 deploy session per (a.97)); EXACTLY ONE Rule 14f forced-picker fired at start of code mechanics (Session 1 scope picker — director picked Option B "All three" over Recommended Option A "§C.4 split into Sessions 1+2"). **Schema-change-in-flight flag STAYS NO** entire session (W4 is UI + 2 new API routes only; no schema work; the underlying `sortRank Int?` column shipped at W2 Session 1's `npx prisma db push` + already in production via 2026-05-28 Amazon DEPLOY initial deploy push).

**Build commit `e89ae50` (9 files +2162/-43):**

- **NEW `src/lib/competition-scraping/handlers/reviews-batch-delete.ts`** (~165 LOC) — DI seam for POST batch-delete API route per §A.6; `MAX_BATCH_DELETE = 2000` ceiling; dedupes + drops empty IDs at boundary; filters to project-owned IDs before deleting via `findMany {id in [...], competitorUrl: {projectWorkflowId}}` (cross-project review-ID smuggling silently dropped); idempotent posture on missing rows (P2025 swallowed); recordFlake on unknown prisma error; markWorkflowActive fired only when ≥1 row actually deleted.
- **NEW `src/lib/competition-scraping/handlers/reviews-batch-delete.test.ts`** (~250 LOC; 15 new node:test cases): auth rejection / invalid JSON / non-array reviewIds / non-string entries / empty array no-op / empty-after-trim no-op / dedup / oversized batch (>MAX_BATCH_DELETE) / ownership scoping (cross-project drop) / zero owned IDs no-op / happy path delete / P2025 swallowed / unknown error 500 + flake / markWorkflowActive fires when ≥1 row deleted / markWorkflowActive skipped when 0 rows deleted.
- **NEW `src/lib/competition-scraping/handlers/reviews-reorder.ts`** (~210 LOC) — DI seam for PUT reorder API route per §A.5; `MAX_REORDER_BATCH = 2000` ceiling; parent CompetitorUrl ownership lookup before any write; dedupe by reviewId (last entry wins for any duplicates in the input array); cross-URL reviewId smuggling silently dropped via `findMany {id in [...], competitorUrlId: urlId, competitorUrl: {projectWorkflowId}}`; updates run inside `$transaction` so partial failure rolls back atomically; P2025 swallowed; recordFlake on unknown error.
- **NEW `src/lib/competition-scraping/handlers/reviews-reorder.test.ts`** (~310 LOC; 17 new node:test cases): auth rejection / invalid JSON / non-array reviewOrderings / missing reviewId / non-integer sortRank / empty reviewId / empty orderings array no-op / oversized batch (>MAX_REORDER_BATCH) / 404 when parent CompetitorUrl missing / ownership scoping (cross-project drop) / cross-URL smuggling drop / dedup last-wins / zero owned no-op / happy path apply-all / negative sortRank accepted (no constraint) / P2025 swallowed / unknown error 500 + flake / markWorkflowActive fires when ≥1 row reordered.
- **NEW thin route shims** (~50 LOC each):
  - `src/app/api/projects/[projectId]/competition-scraping/reviews/batch-delete/route.ts` — POST shim per the precedent of `reviews/[reviewId]/route.ts` (calls into `reviews-batch-delete.ts` handler with `createProductionDeps()`).
  - `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews/reorder/route.ts` — PUT shim per the same precedent (calls into `reviews-reorder.ts` handler).
- **NEW `src/lib/competition-scraping/captured-reviews-helpers.ts`** (~115 LOC) — pure helpers extracted from the `UrlDetailContent.tsx` component for node:test coverage (NEW reusable Pattern memorialized — see below): `CUSTOMERS_SAY_SOURCE` constant (`"extension-scrape:customers-say"` matching W2 Session 2's storage-shape outcome) + `ReviewSortKey` type union (`addedAt | starRating | manual`) + `compareReviews()` comparator (manual mode sorts by sortRank asc nulls-last, ties broken by addedAt asc; addedAt + starRating modes also exposed) + `splitCustomersSay(reviews)` returns `{ customersSay, regular }` discriminator split + `computeStarCounts(reviews)` returns `Record<1|2|3|4|5, number>` tally + `filterByStarSelection(reviews, selectedStars)` OR filter across selected star buckets (empty selection passes through) + `spliceVisibleReorderIntoFull(full, visibleIdsReordered)` merges visible-list reorder back into full-list while preserving non-visible row positions.
- **NEW `src/lib/competition-scraping/captured-reviews-helpers.test.ts`** (~210 LOC; 20 new node:test cases): `compareReviews()` addedAt asc + desc + starRating asc + desc + manual sortRank + manual null-last + manual tied-rank-tiebreak (by addedAt asc) + manual null-null-addedAt-tiebreak / `splitCustomersSay()` empty + separates + order-preserved within each subset / `computeStarCounts()` empty + tally + out-of-range-drop / `filterByStarSelection()` empty-passthrough + single-star + multi-star-OR / `spliceVisibleReorderIntoFull()` append-tail + all-visible + empty-visible.
- **MODIFIED `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx`** (+637/-43) — major rewrite of the `CapturedReviewsSection` function (was ~140 LOC, now ~290 LOC) + extension of the `CapturedReviewCard` to accept `selected` + `onToggleSelected` props + checkbox + drag handle via @dnd-kit `useSortable` (sets `attributes` / `listeners` / `setActivatorNodeRef` from the hook); NEW inline `StarCountCounterBar` helper component (horizontal bar with per-star buttons + "All" button + multi-select OR + active-state styling) + NEW inline `BulkSelectionToolbar` helper component (shows when ≥1 row selected; "Delete selected" button opens confirm modal; "Clear selection" button) + NEW inline `CustomersSayBanner` helper component (renders the source="extension-scrape:customers-say" row's body text as a distinct banner above the per-star counter-bar; styled differently from regular review cards); updated existing `CapturedReviewSortControl` to conditionally show the `'manual'` sort option + hide the sortDir picker in manual mode (manual mode has its own sortRank order); parent `UrlDetailContent` gained 2 new useCallback handlers — `handleReviewsBulkDeleted(reviewIds)` (optimistic-remove from `reviewsSlot` state + POST to batch-delete API + rollback on failure via setReviewsSlot to prior value) + `handleReviewsReordered(visibleIdsReordered)` (optimistic sortRank reassignment via `spliceVisibleReorderIntoFull()` helper + setReviewsSlot; 500ms debounce before firing PUT to reorder API per the P-46 W3 S3 shared debounced-mutation Pattern from 2026-05-23-f); new `useRef` (debounce-timeout-id holder) + `useEffect` (cleanup on unmount); new imports: `useRef` from React, `DndContext` / `DragEndEvent` / `PointerSensor` / `closestCenter` / `useSensor` / `useSensors` from `@dnd-kit/core`, `SortableContext` / `arrayMove` / `useSortable` / `verticalListSortingStrategy` from `@dnd-kit/sortable`, `CSS` from `@dnd-kit/utilities`, the 7 helpers from `@/lib/competition-scraping/captured-reviews-helpers`.

**TOTAL: 52 new src/lib node:test cases (15 batch-delete + 17 reorder + 20 helpers) + 2 new API routes (batch-delete POST + reorder PUT).**

**Scoreboard transitions:**

| Check | Pre-build | Post-build | Δ |
|-------|-----------|------------|---|
| root tsc | clean | clean | UNCHANGED |
| extension tsc | clean | clean | UNCHANGED |
| extension `npm test` | 655/655 | 655/655 | UNCHANGED (W4 is purely PLOS-side) |
| src/lib `npm run -w src/lib test` | 786/786 | **838/838** | **+52** (15 batch-delete + 17 reorder + 20 helpers) |
| npm run build routes | 62 | **64** | **+2** (batch-delete POST + reorder PUT) |
| Playwright (Check 6) | SKIPPED | SKIPPED | per Rule 27 non-deploy-session |

**NEW baselines locked from this session:** src/lib **838/838** (+52); npm run build **64 routes** (+2); extension **655/655 UNCHANGED**.

**Rule 14f forced-picker fired this session:** EXACTLY ONE — Session 1 scope picker at start of code mechanics. Options offered: (A) §C.4 split into counter-bar + bulk-delete only (Recommended per most-thorough/reliable framing per `feedback_recommendation_style.md` — smaller diff, 2 API surfaces, easier verification, separate drag-reorder into Session 2) / (B) All three: counter-bar + bulk-delete + drag-reorder per last night's launch prompt / (C) Counter-bar only. **Director picked Option B (All three).** This was NOT director-Yes-to-Recommended — first non-Recommended pick since the 14/15 = 93.3% calibration data point on 2026-05-25-b and the 9/9 = 100% on 2026-05-28. Calibration data point: 0/1 = 0% Yes-to-Recommended on the single picker fired this session; running cumulative across recent 4 sessions: 23/26 = 88.5%. **NOT a session-trend signal** (single-picker session); framing still well-calibrated overall; today's pick reflects a director-side scope preference that the launch prompt had already encoded — not a recommendation-framing miss. Per `feedback_default_to_recommendation.md` the Rule 27 Check 6 Playwright SKIP picker was NOT fired this session — last 39 sessions all SKIP for non-deploy; treated as default-approved.

**TWO NEW reusable Patterns memorialized in CORRECTIONS_LOG §Entry 2026-05-29:**

1. **"Pure helpers extracted from .tsx component file for node:test coverage"** — when a React `'use client'` component file contains substantial pure-function logic (comparator + filter + count + split + array splice), extract those helpers into a separate `.ts` module under `src/lib/` so node:test can load + exercise them without the React tree. Pattern fired here to extract 5 helpers from `UrlDetailContent.tsx` into `captured-reviews-helpers.ts`. **Lesson:** node:test can't load `'use client'` .tsx files because the React tree + DOM dependencies + JSX transform don't compose with the test runner; extraction unlocks 20 new tests this session that would otherwise have required Playwright spec or component-test infra. Future feature work on .tsx components should adopt this extraction Pattern from the start — any pure function inside a `'use client'` component taking plain data in + returning plain data out is a candidate for src/lib extraction + node:test coverage.

2. **"Customers-say split: separate AI-summary row from main reviews via source discriminator"** — when persisting a non-review record into the captured-reviews table via the existing schema's `source: String` field (per the 2026-05-27 W2 Session 2 Rule 14f outcome: starRating=5 sentinel + source="extension-scrape:customers-say"), the consuming UI should split rows by source discriminator at render time + render the AI-summary rows as a separate banner above the main list. The split achieves four UX outcomes simultaneously: (1) AI-summary rows don't inflate per-star counts (the `computeStarCounts()` helper filters them out via `CUSTOMERS_SAY_SOURCE` constant); (2) AI-summary rows don't participate in drag-reorder (the `SortableContext` only wraps the main-review subset); (3) AI-summary rows don't participate in bulk-select (the checkboxes only appear on main-review rows); (4) AI-summary rows visually signal their distinct nature via different banner styling above the per-star counter-bar. **Pairs with the 2026-05-27 W2 Session 2 Pattern "Pre-emptive design choice rolled into Rule 14f picker"** — Session 2's storage-shape picker directly enables today's UI split Pattern. Future per-platform sub-cluster sessions (eBay / Etsy / Walmart) that add their own AI-summary equivalents should reuse this discriminator + split Pattern from the start.

**§A consumption by W4 Session 1 (informational; §A frozen per Rule 18):**

- **§A.5 (drag-to-reorder via sortRank) — consumed.** The `sortRank Int?` column on `CapturedReview` shipped at W2 Session 1's `npx prisma db push` + reached production via the 2026-05-28 Amazon DEPLOY initial deploy push; W4 Session 1's drag-reorder UI + new PUT reorder route consume this column. The P-46 W3 S3 @dnd-kit shared debounced-mutation Pattern from 2026-05-23-f is reused for the 500ms debounce + the optimistic-then-PUT flow.
- **§A.6 (bulk-delete with multi-select + confirm modal + batch-delete API route) — consumed.** The new POST batch-delete API route at `/api/projects/[projectId]/competition-scraping/reviews/batch-delete` + the `BulkSelectionToolbar` inline component + the confirm modal cover §A.6 fully.
- **§A.14 (star UI counter-bar with click-to-filter) — consumed.** The `StarCountCounterBar` inline component replaces the existing star-rating-multi-select dropdown; multi-select OR semantics across star buckets; "All" button clears the filter.
- **§A.16 (API routes list) — fully consumed for W4 scope.** Two new API routes added (POST batch-delete + PUT reorder) bringing the W4 share of §A.16 to complete.
- **§A.12 (staleness badge for ReviewAnalysis fingerprint cache) — DEFERRED to W5.** The staleness badge requires the ReviewAnalysis fetch logic to compute "out of date" — that's W5 (AI review analysis system), not W4. W4 Session 1 does NOT touch ReviewAnalysis.

**§C.4 estimate transition:** "~2-3 sessions" actually compressed into "1 session" because all three pieces landed cleanly under one Rule 14f scope picker outcome where director picked Option B (All three). The pure-helpers extraction + the 3 inline helper components + the 2 new handlers + the 2 thin route shims all composed cleanly under one build commit; no mid-build refactor cascades; no compounding side effects. **W4 is now fully covered after this session** — the W4 deploy session per (a.97) is the natural next step; no W4 Session 2 needed.

**Cross-references:**
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-29 — closing entry capturing the 2 NEW reusable Patterns + LOW informational P-43 cwd-leak Pattern Class reproduction (2 more this session; running tally ~6-7+) + calibration data point (0/1 = 0% Yes-to-Recommended this session; running cumulative 23/26 = 88.5%).
- §B 2026-05-26 (W2 Session 1 foundation) — `sortRank Int?` column shipped here + reached production via 2026-05-28 Amazon DEPLOY + consumed today for drag-reorder.
- §B 2026-05-27 (W2 Session 2) — Customers-say storage-shape Rule 14f outcome (starRating=5 sentinel + source="extension-scrape:customers-say" discriminator) directly enables today's Customers-say split UI Pattern.
- §B 2026-05-28 (W2 Amazon DEPLOY + 4-fix-forward cascade) — Phase 4 verification issue #3 (W4 destination capture for "no way to see reviews of specific star counts on vklf.com") directly addressed by today's star-count counter-bar + click-to-filter.
- P-46 W3 S3 (2026-05-23-f) — @dnd-kit shared debounced-mutation Pattern reused for today's drag-reorder implementation.
- `docs/ROADMAP.md` P-49 polish-backlog entry (W4 status flipped to ✅ DONE-AT-CODE-LEVEL 2026-05-29 + (a.96) closes + (a.97) opens for W4 deploy session).

**Closing line:** P-49 W4 Captured Reviews UI extensions Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-29 on `workflow-2-competition-scraping` via build commit `e89ae50` (9 files +2162/-43) — first build session of the W4 cluster; all 3 §C.4 pieces shipped in ONE session per Rule 14f scope picker outcome; 52 new src/lib tests + 2 new API routes; 5/5 scoreboard GREEN at new baselines (838 src/lib +52 / 64 routes +2 / 655 ext UNCHANGED); ZERO Rule 9 deploy gates fired; EXACTLY ONE Rule 14f forced-picker fired (Session 1 scope picker — director picked Option B "All three" over Recommended Option A "§C.4 split"); Schema-change-in-flight flag STAYS NO entire session; TWO NEW reusable Patterns memorialized ("Pure helpers extracted from .tsx component file for node:test coverage" + "Customers-say split: separate AI-summary row from main reviews via source discriminator"). §A unchanged per Rule 18 — every §A decision consumed by today's build session confirmed at build-time without surfacing a §A amendment; §A.5 + §A.6 + §A.14 fully consumed; §A.16 API-routes list fully consumed for W4 scope; §A.12 staleness badge deferred to W5 (ReviewAnalysis dependency). §C.4 estimate "~2-3 sessions" actually compressed into "1 session" because all three pieces landed cleanly under one Rule 14f scope picker outcome. W4 is now fully covered after this session — W4 deploy session per (a.97) is the natural next step; no W4 Session 2 needed. Closes (a.96); opens (a.97) RECOMMENDED-NEXT = P-49 W4 Captured Reviews UI extensions deploy session on `workflow-2-competition-scraping` → `main`. FOURTH build/deploy-session §B entry in this design doc per Rule 18 — pairs with §B 2026-05-26 (W2 Session 1) + §B 2026-05-27 (W2 Session 2) + §B 2026-05-28 (W2 Amazon DEPLOY) as the W2 Amazon arc trio + this W4 Session 1 entry as the first W4 entry. The next §B entry will land at the W4 deploy session close.

---

## §B 2026-05-29 — POST-DEPLOY SUB-SECTION — `session_2026-05-29_p49-w4-captured-reviews-ui-session-1` (continued same calendar day) — W4 Captured Reviews UI extensions ✅ DEPLOYED-AND-VERIFIED 2026-05-29 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`; ff-merge `a40e4ba..1e610ce main -> main` under ONE Rule 9 deploy gate; Phase 4 director real-Chrome verification 6/6 PASS; W4 entire workstream now ✅ DEPLOYED-AND-VERIFIED with no remaining scope; Sessions 2 + 3 from §C.4 outline CLOSED; §C.4 estimate "~2-3 sessions" compressed into "1 session shipped + 1 session deployed in same day"

**Same calendar day extension of the §B 2026-05-29 build-session entry above** per the existing-entry-same-day pattern (mirrors the 2026-05-26 + 2026-05-27 + 2026-05-28 build/deploy-session §B entry precedent for same-day deploy after build-session entry already landed). Build session above closed at "ZERO Rule 9 deploy gates fired + EXACTLY ONE Rule 14f forced-picker fired"; this sub-section closes the post-deploy outcome.

**Session shape transition (build-only → build + deploy + Phase-4-PASS):** end-of-session Rule 14f deploy-or-exit picker fired offering (A) Deploy-now-and-Phase-4-verify (Recommended — ~30-60 min in-Claude; W4 UI lands on vklf.com immediately; corpus already exists from 2026-05-28 Amazon DEPLOY; bounded UI features against locked spec) vs (B) Exit-now (~10-15 min next-session-start overhead) vs (C) Defer Phase 4 only. **Director picked Recommended "Deploy now" (option A).** Calibration data point 1/1 on the deploy-or-exit picker; combined with the Session 1 scope picker earlier (0/1), final session calibration is 1/2 = 50% Yes-to-Recommended; running cumulative 24/27 = 88.9% across recent 4 sessions.

**Deploy execution:**

- **Pre-deploy /scoreboard 5/5 GREEN** identical to the post-build baselines (no code change between post-build and pre-deploy; root tsc clean / extension tsc clean / **655 ext** / **838 src/lib** / **64 routes**); Check 6 Playwright SKIP picker fired + director picked SKIP (Recommended per the standing non-deploy-session precedent — though this IS a deploy session, the W4 UI changes don't have Playwright spec coverage).
- **Rule 9 deploy gate combined picker** — director picked Deploy now (Recommended) covering ff-merge + push + Vercel auto-redeploy + ping-pong.
- **Ff-merge `a40e4ba..1e610ce main -> main`** carrying 2 commits (build commit `e89ae50` + build-session doc-batch `1e610ce`).
- **Push to `origin/main`** triggered Vercel auto-redeploy (~2-3 min cycle).
- **Ping-pong push to `origin/workflow-2-competition-scraping`** brings both branches even at the deploy SHA.
- **Post-merge /scoreboard SKIPPED full re-run** per the 2026-05-24-e "trust-at-unchanged-baseline" Pattern (code byte-identical pre + post; no merge commit, no conflict resolution).

**Phase 4 director real-Chrome verification 6/6 PASS on vklf.com** on a project with existing Amazon-scraped review corpus from the 2026-05-28 Amazon DEPLOY:

| # | Step | Verdict |
|---|------|---------|
| 1 | Customers-say banner renders separately above counter-bar | **PASS** |
| 2 | Counter-bar shows per-star counts matching actual scraped data | **PASS** |
| 3 | Click-to-filter narrows the list to the clicked star | **PASS** |
| 4 | Multi-star selection OR's the filters together | **PASS** |
| 5 | Bulk-select + delete batches correctly with confirm modal | **PASS** |
| 6 | Drag-to-reorder persists + survives page reload | **PASS** |

**Director PASS verdict resolves the session at ✅ DEPLOYED-AND-VERIFIED 2026-05-29 end-to-end on vklf.com.** No fix-forwards needed (the W4 UI features were bounded against locked spec; no extension-side changes; no schema changes; no anti-bot considerations).

**Files now live in production on vklf.com:**

- `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx` — major rewrite (counter-bar / banner / drag handles / checkboxes / bulk-delete / all wiring)
- `src/lib/competition-scraping/captured-reviews-helpers.ts` — 5 pure helpers
- `src/lib/competition-scraping/handlers/reviews-batch-delete.ts` + thin shim route — POST batch-delete API
- `src/lib/competition-scraping/handlers/reviews-reorder.ts` + thin shim route — PUT reorder API

**Schema-change-in-flight flag STAYS NO entire session** (W4 had no schema work; the broader Reviews Phase 2 schema YES → NO transition already happened at the 2026-05-28 Amazon DEPLOY initial deploy push completion).

**W4 estimate compression memorialized:** §C.4 "~2-3 sessions" → "1 session shipped + 1 session deployed in same day" (well under estimate). Per the §C.4 outline, W4 had Session 1 + Session 2 + Session 3 (CONDITIONAL deploy). With all 3 §A pieces (counter-bar + bulk-delete + drag-reorder) shipped in Session 1 + deployed today, **Sessions 2 + 3 from §C.4 are now CLOSED (no remaining W4 scope). W4 entire workstream is now ✅ DEPLOYED-AND-VERIFIED with no remaining scope.** This compression came from the convergence of two Rule 14f picker outcomes within one session: Session 1 scope picker (director picked all-three-bundled) + end-of-session deploy-or-exit picker (director picked immediate-deploy).

**Active workstream status post-W4-DEPLOY:**

- **W1 Reviews Phase 2 Design Session** — ✅ DONE 2026-05-25-b.
- **W2 Per-platform extension extraction** — IN-FLIGHT. Amazon sub-cluster ✅ DEPLOYED-AND-VERIFIED 2026-05-28. eBay sub-cluster NEXT per (a.98) per §A.2 priority order. Etsy sub-cluster after eBay. Walmart sub-cluster fourth.
- **W3 Crawler infrastructure** — DROPPED per A.1 Q1 outcome.
- **W4 Captured Reviews UI extensions** — ✅ DEPLOYED-AND-VERIFIED 2026-05-29 (TODAY). Fully covered with no remaining scope.
- **W5 AI review analysis system** — DEFERRED until W2 per-platform sub-clusters all deploy (W5 strictly depends on review data corpus; Amazon corpus exists since 2026-05-28; eBay + Etsy + Walmart corpora pending).

**§C.4 outline cross-reference (informational; §C frozen per Rule 18):**

- §C.4 Session 1 (counter-bar + bulk-delete + drag-reorder) — ✅ SHIPPED 2026-05-29 + ✅ DEPLOYED-AND-VERIFIED 2026-05-29.
- §C.4 Session 2 (additional polish) — CLOSED (no remaining scope; all pieces shipped in Session 1).
- §C.4 Session 3 (CONDITIONAL deploy) — CLOSED (deploy happened end-of-Session 1 within one calendar day).

**NEW reusable Pattern candidate cross-referenced from CORRECTIONS_LOG §Entry 2026-05-29 post-deploy sub-observation:** **"End-of-build-session deploy-or-exit Rule 14f picker — when a build session lands clean + the design doc opens a deploy session as the next-task, fire a director picker offering Deploy-now vs Exit. Director's energy + availability for Phase 4 verification determines the right path; the framing must surface both options with their realistic trade-offs (~30-60 min in-Claude for deploy-now + Phase 4 vs. ~10-15 min next-session-start overhead for exit-now)."** Today fired this Pattern at the end of the build portion of the session — pairs with the 2026-05-27 build-session push Pattern as the symmetric in-session-deploy variant. Future build sessions should consider firing this picker at end-of-build IF (a) build lands clean, (b) design doc opens deploy session as next-task, (c) director available for Phase 4, (d) deploy is bounded (no schema; no anti-bot; UI-only or API-only).

**Cross-references:**

- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-29 sub-observation (f) — canonical post-deploy outcome capture + NEW reusable Pattern candidate "End-of-build-session deploy-or-exit Rule 14f picker" + final calibration 1/2 + P-43 cwd-leak Pattern Class reproductions UPDATED to 3 + W4 estimate compression.
- §B 2026-05-29 build-session entry above — predecessor entry capturing the build portion of today's session.
- §B 2026-05-28 (W2 Amazon DEPLOY + 4-fix-forward cascade) — Phase 4 verification issue #3 (W4 destination capture) RESOLVED today via the W4 deploy + Phase 4 PASS.
- §A.5 (drag-to-reorder via sortRank) + §A.6 (bulk-delete) + §A.14 (star UI counter-bar) — all fully consumed + deployed today.
- §A.16 (API routes list) — fully consumed for W4 scope (2 new API routes deployed: POST batch-delete + PUT reorder).
- §A.12 (staleness badge for ReviewAnalysis fingerprint cache) — DEFERRED to W5 (ReviewAnalysis dependency); W4 deploy does not touch ReviewAnalysis.
- `docs/ROADMAP.md` P-49 polish-backlog entry — W4 status flipped to ✅ DEPLOYED-AND-VERIFIED 2026-05-29 + W4 entire workstream status to ✅ DEPLOYED-AND-VERIFIED + (a.96) + (a.97) close + (a.98) opens for P-49 W2 eBay sub-cluster Session 1.

**Closing line (POST-DEPLOY UPDATED):** P-49 W4 Captured Reviews UI extensions ✅ DEPLOYED-AND-VERIFIED 2026-05-29 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — Session 1 build commit `e89ae50` (9 files +2162/-43) + build-session doc-batch `1e610ce` ff-merged to main under ONE Rule 9 deploy gate (`a40e4ba..1e610ce`); Vercel auto-redeploy fired; Phase 4 director real-Chrome verification 6/6 PASS on vklf.com; W4 entire workstream now ✅ DEPLOYED-AND-VERIFIED with no remaining scope (Sessions 2 + 3 from §C.4 outline CLOSED); §C.4 estimate "~2-3 sessions" compressed into "1 session shipped + 1 session deployed in same day"; 52 new src/lib tests + 2 new API routes live in production; 5/5 scoreboard GREEN at new baselines (838 src/lib +52 / 64 routes +2 / 655 ext UNCHANGED); ONE Rule 9 deploy gate + TWO Rule 14f forced-pickers fired total (Session 1 scope 0/1 + deploy-or-exit 1/1 = 50% final calibration; running cumulative 24/27 = 88.9%); Schema-change-in-flight flag STAYS NO entire session; TWO NEW reusable Patterns memorialized in build sub-section above + ONE NEW reusable Pattern candidate in post-deploy sub-observation ("End-of-build-session deploy-or-exit Rule 14f picker"); LOW informational P-43 cwd-leak Pattern Class reproduction UPDATED to 3 this session (running tally ~7-8+; strong empirical signal continues mounting). **Closes (a.96) + (a.97); opens (a.98) RECOMMENDED-NEXT = P-49 W2 eBay sub-cluster Session 1** on `workflow-2-competition-scraping` per §A.2 priority order + §C.2 implementation outline (reuses W2 Amazon Patterns: FF#1 symmetric helpers + FF#4 URL-construction pagination + cross-star loop + Shadow DOM trigger modal). **FOURTH+ build/deploy-session §B entry in this design doc per Rule 18** — pairs with §B 2026-05-26 (W2 Session 1) + §B 2026-05-27 (W2 Session 2) + §B 2026-05-28 (W2 Amazon DEPLOY) as the W2 Amazon arc trio + §B 2026-05-29 build-session above as the first W4 entry + this post-deploy sub-section closing the W4 arc. The next §B entry will land at the eBay sub-cluster Session 1 close (likely §B 2026-05-30 if next session lands within 24 hours).

---

## §B 2026-05-30 — `session_2026-05-30_p49-w2-ebay-sub-cluster-session-1` — P-49 W2 eBay sub-cluster ✅ DEPLOYED-AND-VERIFIED 2026-05-30 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — first deploy session of the W2 eBay sub-cluster (second per-platform sub-cluster after Amazon); Session 1 build commit `11e99e1` (3 files +1535/-99) carrying NEW `ebay-review-extractor.ts` (~390 LOC) + NEW `ebay-review-extractor.test.ts` (~470 LOC; 64 new node:test cases) + MODIFY `orchestrator.ts` (eBay dispatch) + 5 fix-forward commits all on main under 5 separate Rule 9 deploy gates (FF#1+#2 bundled + FF#3 + FF#4 diagnostic + FF#5 empirically-verified fix); director Phase 4 PASS verdict on FF#5 "Everything worked perfectly"; eBay sub-cluster now fully ✅ DEPLOYED-AND-VERIFIED with no remaining scope; §C.2 estimate "~3-4 sessions" compressed into "1 calendar day"; eBay Sessions 2 + 3 from §C.2 outline CLOSED; FIFTH build/deploy-session §B entry per Rule 18; THREE NEW reusable Patterns memorialized ("Diagnostic-instrumentation FF as escape valve from speculative-FF antipattern" + "Tabpanel-scoped DOM walking via `[role=tabpanel]:not([hidden])`" + "JSON data-island extraction for server-rendered seller/product metadata")

**Session shape:** BUILD + DEPLOY + 5-FIX-FORWARD cascade + PHASE-4-PASS bundled into ONE calendar day on `workflow-2-competition-scraping` → `main`; 5 Rule 9 deploy gates fired (stretches the 2026-05-28 Amazon DEPLOY 4-FF Pattern by one further); 3 Rule 14f forced-pickers fired all director-Yes-to-Recommended (3/3 = 100% calibration this session; running cumulative 27/30 = 90% across recent 5 sessions). **Schema-change-in-flight flag STAYS NO entire session** (eBay reuses the schema W2 Amazon shipped 2026-05-28; no `prisma db push`; no API contract changes; new platform discriminator `'ebay'` already accepted by the `CapturedReview.platform String?` column shipped at W2 Session 1 2026-05-26).

**Build commit `11e99e1` (3 files +1535/-99):**

- **NEW `extensions/competition-scraping/src/lib/content-script/ebay-review-extractor.ts`** (~390 LOC) — per-platform module mirroring W2 Amazon Patterns from the 2026-05-28 deploy session: FF#1 symmetric helpers Pattern (`isEbayListingUrl` + `isEbayFeedbackUrl` + `isEbayScrapableUrl` + `extractItemIdFromEbayListingUrl` + `extractItemIdFromEbayFeedbackUrl` + `extractItemIdFromEbayUrl` + `extractSellerFromListingDocument` for DOM-based seller-username extraction — later supplemented by FF#5's `extractSellerFromListingHtml` raw-HTML extraction for modern eBay pages); FF#4 URL-construction-based pagination Pattern (`buildEbayFeedbackUrl(itemId, seller, feedbackType, pageNumber)` direct URL construction; stop signal = fetched page has 0 reviews; later refined across FF#1+#2 + FF#3 to honor director's working URL params); cross-filter loop NEUTRAL→NEGATIVE structure mirroring Session 2's 5-star Amazon loop (eBay maps Neutral → 3-star + Negative → 1-star automatically per §A.2 spec); Shadow DOM trigger modal reuse with per-URL cap override (existing modal from W2 Session 2 2026-05-27 reused — only the dispatch + per-item-ID handler added).
- **NEW `extensions/competition-scraping/src/lib/content-script/ebay-review-extractor.test.ts`** (~470 LOC; 64 new node:test cases) covering URL-detection helpers (`isEbayListingUrl` + `isEbayFeedbackUrl` + `isEbayScrapableUrl` matrix) + item-ID extraction matrix + seller extraction from listing document + feedback URL construction matrix + feedback type mapping (Neutral → 3-star + Negative → 1-star) + cross-filter loop dispatch coverage + integration shape coverage. Test count chosen to match the Amazon Session 1 precedent's 29 cases proportionally — eBay needed roughly 2x because of the additional URL surface area (listing URL + feedback URL + seller-from-listing helper).
- **MODIFIED `extensions/competition-scraping/src/lib/content-script/orchestrator.ts`** — `start-review-scrape` handler extended to recognize eBay URLs via `isEbayScrapableUrl` + dispatch to `runEbayReviewScrape` orchestrator; reuses the existing `openScrapeTriggerModal` + `saveReview` wrapper from W2 Sessions 1 + 2. PLOS-side handlers — NONE extended; eBay reviews flow through the existing `create-captured-review` BackgroundRequest into the existing `POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews` handler with `platform: 'ebay'` (the `CapturedReview.platform String?` column from W2 Session 1 already accepts the new discriminator value).

**5-fix-forward cascade after Phase 4 director real-Chrome verification surfaced TWO co-occurring bugs:**

- **FF#1+#2 bundled `23b6221`** (4 files +183/-30; +4 ext tests). FF#1 = trigger modal extended with optional eBay seller text input (auto-detect prefill; manual paste fallback when listing-page extraction fails). FF#2 = `buildEbayFeedbackUrl` adds `q=<itemId>` + `filter=feedback_page:RECEIVED_AS_SELLER` (director's working URL params). **BUSTED — still returned All Items rows.**
- **FF#3 `c19f187`** (2 files +58/-25; 0 new tests) — full `_item`-suffixed param set replaces `_pgn` pagination (`page_id_item=N` + `sort_item=RELEVANCEV2` + `filter_image_item=false` + `filter_video_item=false` + `filter_automated_feedback_item=true` + `filter_topic_item=`). **BUSTED — still returned All Items rows.**
- **Rule 14f mid-Phase-4 picker fired** after FF#3 BUSTED: (A) Diagnostic instrumentation [Recommended] vs (B) Defer to next session. Director picked (A). **FF#4 `6675963`** (2 files +116/-0) shipped TEMPORARY diagnostic instrumentation: dumps fetched HTML to director's Downloads folder via programmatic `<a download>` click + console.logs structured row-count breakdowns per selector probe. Director ran ONE scrape → uploaded 3 HTML files (listing + NEGATIVE feedback page 1 + NEUTRAL feedback page 1) + pasted console output.
- **FF#5 `23aa851` — the WIN** (3 files +176/-135; +8 ext tests — 6 sellerFromListingHtml + 2 tabpanel-scoping). Analysis of dumped HTML files revealed BOTH root causes simultaneously. **Bug 1 — Seller auto-detect:** modern eBay listing pages don't render `/usr/<seller>` links in the visible DOM (zero matches); seller is embedded in a JSON data island as `"sellerUserName":"<value>"`. Fix: NEW `extractSellerFromListingHtml(html)` regex extraction from raw HTML; legacy DOM-based `extractSellerFromListingDocument` preserved as classic-view fallback. **Bug 2 — This Item filter:** eBay's feedback page renders BOTH the "This Item" tabpanel AND the "All Items" tabpanel server-side; the All Items panel carries the `hidden` attribute. Walker was matching rows from both panels. Empirical evidence: NEGATIVE page had "This item (1)" header but 26 `.fdbk-container__details` rows total (1 + 25 from hidden All Items panel). Fix: scope walker to `[role=tabpanel]:not([hidden])`; fall through to whole-doc scope as classic-view safety net. Removes ALL FF#4 diagnostic instrumentation.

**Director Phase 4 PASS verdict on FF#5 = "Everything worked perfectly."** RESOLVES the eBay sub-cluster end-to-end on vklf.com. No further fix-forwards needed.

**Scoreboard transitions:**

| Check | Pre-deploy | Post-FF#5 | Δ |
|-------|-----------|-----------|---|
| root tsc | clean | clean | UNCHANGED |
| extension tsc | clean | clean | UNCHANGED |
| extension `npm test` | 655/655 | **731/731** | **+76** (64 Session 1 module + 4 FF#1+#2 + 0 FF#3 + 0 FF#4 + 8 FF#5) |
| src/lib `npm run -w src/lib test` | 838/838 | 838/838 | UNCHANGED (eBay is purely extension-side) |
| npm run build routes | 64 | 64 | UNCHANGED (no new API routes) |
| Playwright (Check 6) | SKIPPED | SKIPPED | per Rule 27 |

**NEW baseline locked from this session:** extension `npm test` = **731/731** (+76 from 655 entry baseline).

**Rule 14f forced-pickers fired this session: THREE — all director-Yes-to-Recommended (3/3 = 100% calibration this session; running cumulative 27/30 = 90% across recent 5 sessions):**

1. **Start-of-session deploy-now picker** — Deploy-now vs Exit. The "End-of-build-session deploy-or-exit Rule 14f picker" Pattern from §Entry 2026-05-29 sub-observation (f) firing for the FIRST TIME at start-of-session (rather than end-of-session) for an inbound build task. Director picked Recommended Deploy-now.
2. **Mid-Phase-4 diagnostic-vs-defer picker** — after FF#3 BUSTED. (A) Diagnostic instrumentation [Recommended — dump fetched artifacts + console.log selector probes; director uploads → empirical evidence → next FF is correct] vs (B) Defer to next session [PARTIAL deploy + capture in NEXT_SESSION.md]. Director picked Recommended Diagnostic instrumentation, which directly produced FF#5's empirically-verified one-shot fix for BOTH bugs.
3. **End-of-session §4 Step 1c next-task picker** — Etsy / W5 AI review analysis Session 1 / P-43 mechanical prevention / P-48 Session 3. Director picked Recommended Etsy per §A.2 priority order.

**THREE NEW reusable Patterns memorialized in CORRECTIONS_LOG §Entry 2026-05-30:**

1. **"Diagnostic-instrumentation FF as escape valve from speculative-FF antipattern"** — when 2+ consecutive speculative fix-forwards BUSTED, ALWAYS fire a Rule 14f picker offering (A) Diagnostic instrumentation [Recommended] vs (B) Defer to next session. Don't ship a 3rd speculative FF. Pairs with + extends the 2026-05-25 P-48 Session 1 "ffprobe-first / empirical-first diagnostic" Pattern at the deploy-session-cascade level. Future P-49 W2 sub-cluster deploy sessions (Etsy / Walmart) should expect the diagnostic-instrumentation FF as a normal escape valve when speculative FFs stack up.

2. **"Tabpanel-scoped DOM walking — `[role=tabpanel]:not([hidden])` to avoid capturing rows from inactive tabs"** — generalizes beyond eBay to any tabbed-content scraping surface (Amazon's tabbed review-filter UI, Etsy's per-star filter overlay, Walmart's review aggregator tabs all potentially exhibit this pattern). Future per-platform module sessions should adopt this walker-scope Pattern proactively.

3. **"JSON data-island extraction for server-rendered seller/product metadata"** — modern site listing pages frequently embed JSON blobs containing canonical seller/product fields (`"sellerUserName":"<value>"` on eBay; likely similar shapes on Etsy + Walmart). Regex extraction against raw HTML is more robust than DOM-link probing when the visible UI renders the same data via React buttons/spans rather than `<a href>`. **Applies directly to future Etsy + Walmart sub-cluster sessions** — adopt the JSON data-island extraction Pattern from the start for any platform-canonical seller/listing/product metadata; preserve DOM-link walker as a classic-view fallback.

**§A consumption by W2 eBay sub-cluster Session 1 + DEPLOY (informational; §A frozen per Rule 18):**

- **§A.2 (per-platform priority order — eBay second after Amazon) — consumed.** eBay sub-cluster shipped second after Amazon per the director-verbatim priority order; Etsy sub-cluster NEXT per (a.99); Walmart fourth.
- **§A.2 (eBay-specific spec — Neutral → 3-star + Negative → 1-star mapping; ~25 reviews/page) — consumed.** The cross-filter loop in `runEbayReviewScrape` iterates NEUTRAL → NEGATIVE in that order; each feedback row mapped to `starRating: 3` (Neutral) or `starRating: 1` (Negative) at save time. The 25 reviews/page pagination is honored via FF#4-Pattern URL-construction (`page_id_item=N` increment).
- **§A.3 (Shadow DOM progress indicator + trigger modal mounts) — consumed (no changes; reuse).** eBay reuses the existing `scrape-progress-indicator.ts` + `scrape-trigger-modal.ts` from W2 Sessions 1 + 2 unchanged — only the dispatch glue was added.
- **§A.4 (per-URL `reviewScrapeCap` override) — consumed (no changes; reuse).** eBay reuses the trigger modal's per-URL cap override + existing `CompetitorUrl.reviewScrapeCap Int? @default(200)` column from W2 Session 1 schema migration.
- **§A.13 (data shape — `CapturedReview.platform String?` discriminator) — consumed.** eBay reviews tagged with `platform: 'ebay'`; the column already in production from the 2026-05-28 Amazon DEPLOY initial deploy push.
- **§A.15 (conservative anti-bot defaults — 1-3s random pagination delay + CAPTCHA detection + rate-limit detection + AbortSignal-cancellable) — consumed (no changes; reuse).** eBay reuses `scrape-pagination.ts` from W2 Session 1 unchanged; same conservative defaults apply.
- **§A.16 (no new API routes needed) — consumed.** No new API routes added this session — eBay reviews flow through the existing `POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews` handler from W2 Session 1.

**§C.2 estimate transition:** "~3-4 sessions for the full eBay arc" actually compressed into "1 session shipped + 1 session deployed + 5 FFs + Phase 4 PASS, all in one calendar day". The compounding effect of the W2 Amazon Pattern library (from 2026-05-28 deploy) + the W2 Session 1 shared infrastructure (from 2026-05-26 build) + the new "End-of-build-session deploy-or-exit Rule 14f picker" Pattern (from 2026-05-29) is producing per-platform sub-cluster delivery at 1-calendar-day cadence rather than the original 3-4-session estimates. **eBay Sessions 2 + 3 from §C.2 outline CLOSED — entire eBay sub-cluster ✅ DEPLOYED-AND-VERIFIED at session-end with no remaining scope.** Future Etsy + Walmart sub-clusters should adopt the same shape: build commit + deploy + N fix-forwards + Phase 4 PASS in one calendar day, with the diagnostic-instrumentation FF as the canonical escape valve when speculative FFs stack up.

**Active workstream status post-eBay-DEPLOY:**

- **W1 Reviews Phase 2 Design Session** — ✅ DONE 2026-05-25-b.
- **W2 Per-platform extension extraction** — IN-FLIGHT. Amazon sub-cluster ✅ DEPLOYED-AND-VERIFIED 2026-05-28. eBay sub-cluster ✅ DEPLOYED-AND-VERIFIED 2026-05-30 (TODAY). Etsy sub-cluster NEXT per (a.99) per §A.2 priority order. Walmart sub-cluster fourth.
- **W3 Crawler infrastructure** — DROPPED per A.1 Q1 outcome.
- **W4 Captured Reviews UI extensions** — ✅ DEPLOYED-AND-VERIFIED 2026-05-29.
- **W5 AI review analysis system** — DEFERRED until W2 per-platform sub-clusters all deploy (W5 strictly depends on review data corpus; Amazon + eBay corpora exist as of today; Etsy + Walmart corpora pending).

**Cross-references:**

- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-30 — canonical post-deploy outcome capture + THREE NEW reusable Patterns + 3 LOW informational sub-observations + final calibration 3/3 = 100% + P-43 cwd-leak Pattern Class reproductions UPDATED to ~3 this session (running tally ~11+) + §C.2 estimate compression memorialized.
- §B 2026-05-29 (W4 Captured Reviews UI extensions Session 1 + DEPLOY) — predecessor entry capturing the W4 cluster completion + the "End-of-build-session deploy-or-exit Rule 14f picker" Pattern that fired for the FIRST TIME today at start-of-session.
- §B 2026-05-28 (W2 Amazon DEPLOY + 4-fix-forward cascade) — predecessor entry capturing the W2 Amazon Patterns directly reused by today's eBay sub-cluster (FF#1 symmetric helpers + FF#4 URL-construction pagination + the 4-fix-forward cascade Pattern that today's 5-fix-forward cascade extends).
- §B 2026-05-27 (W2 Amazon Session 2) — predecessor entry capturing the cross-star/cross-filter loop Pattern + Shadow DOM trigger modal Pattern reused today.
- §B 2026-05-26 (W2 Amazon Session 1) — foundation entry capturing the `fetch()` + `DOMParser` content-script pagination Pattern + the foundation-session-bundle-substrate Pattern.
- §A.2 (per-platform priority order + eBay-specific spec) + §A.3 (Shadow DOM mounts) + §A.4 (per-URL cap override) + §A.13 (platform discriminator) + §A.15 (anti-bot defaults) + §A.16 (no new API routes) — all consumed today; §A stays frozen per Rule 18.
- `docs/ROADMAP.md` P-49 polish-backlog entry — W2 eBay sub-cluster status flipped to ✅ DEPLOYED-AND-VERIFIED 2026-05-30 + (a.98) closes + (a.99) opens for P-49 W2 Etsy sub-cluster Session 1.
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-30 (NEW — extension-side architecture cross-reference pointer per the W2 Amazon precedent; canonical eBay deploy-session entry lives in this doc's §B 2026-05-30).

**Closing line:** P-49 W2 eBay sub-cluster ✅ DEPLOYED-AND-VERIFIED 2026-05-30 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — Session 1 build commit `11e99e1` (3 files +1535/-99) + 5 fix-forward commits all on main under 5 separate Rule 9 deploy gates (build deploy + FF#1+#2 bundled `23b6221` deploy + FF#3 `c19f187` deploy + FF#4 `6675963` diagnostic deploy + FF#5 `23aa851` empirically-verified fix deploy); director Phase 4 PASS verdict on FF#5 "Everything worked perfectly"; eBay sub-cluster now fully ✅ DEPLOYED-AND-VERIFIED with no remaining scope (§C.2 estimate "~3-4 sessions" compressed into "1 calendar day"; eBay Sessions 2 + 3 from §C.2 CLOSED); 5 Rule 9 deploy gates fired (stretches 2026-05-28 Amazon DEPLOY 4-FF Pattern by one further); 3 Rule 14f forced-pickers fired all director-Yes-to-Recommended (3/3 = 100% calibration; running cumulative 27/30 = 90%); Schema-change-in-flight flag STAYS NO entire session; THREE NEW reusable Patterns memorialized ("Diagnostic-instrumentation FF as escape valve from speculative-FF antipattern" + "Tabpanel-scoped DOM walking via `[role=tabpanel]:not([hidden])`" + "JSON data-island extraction for server-rendered seller/product metadata"); LOW informational P-43 cwd-leak Pattern Class reproduction running tally now ~11+. **Closes (a.98); opens (a.99) RECOMMENDED-NEXT = P-49 W2 Etsy sub-cluster Session 1** on `workflow-2-competition-scraping` per §A.2 priority order + §C.2 implementation outline (reuses W2 Amazon + eBay Patterns: FF#1 symmetric helpers + FF#4 URL-construction pagination + cross-filter loop + Shadow DOM trigger modal + today's NEW JSON data-island extraction Pattern). **FIFTH+ build/deploy-session §B entry in this design doc per Rule 18** — pairs with §B 2026-05-26 (W2 Session 1) + §B 2026-05-27 (W2 Session 2) + §B 2026-05-28 (W2 Amazon DEPLOY) + §B 2026-05-29 (W4 Session 1 + post-deploy sub-section) + this W2 eBay DEPLOY entry as the second per-platform DEPLOY entry in the Reviews Phase 2 arc. The next §B entry will land at the Etsy sub-cluster Session 1 close (likely §B 2026-05-31 if next session lands within 24 hours).

## §B 2026-05-31 — `session_2026-05-31_p49-w2-etsy-sub-cluster-session-1` — P-49 W2 Etsy sub-cluster ✅ DEPLOYED-AND-VERIFIED 2026-05-31 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — second deploy session of the W2 per-platform arc to reuse the Diagnostic-instrumentation FF Pattern (eBay was first 2026-05-30; Etsy is second); Session 1 build commit `c572a42` (3 files +1509/-3) carrying NEW `etsy-review-extractor.ts` (~565 LOC; initial URL-construction approach using `buildEtsyReviewUrl` + `fetch+DOMParser`) + NEW `etsy-review-extractor.test.ts` (~580 LOC; 72 new node:test cases) + MODIFY `orchestrator.ts` (Etsy dispatch); BUSTED in Phase 4 because Etsy's "View all reviews for this item" overlay loads via AJAX on the same listing URL with no separate URL for filters or pagination; architecture pivot via FF#1 `67aeacd` (2 files +1058/-705) to live-DOM driver based on director's paste of the 41 KB overlay outerHTML; FF#1 BUSTED silently → diagnostic-instrumentation FF#2 `a3107b6` (1 file +163/-2) per yesterday's eBay FF#4 Pattern → FF#3 `41b03c5` empirical fix the WIN (2 files +73/-190) restricting `findOverlayContainer` to `.deep-dive-sheet` only + rejecting hidden variants (aria-hidden, wt-display-none, hidden attribute) + removing FF#2 instrumentation; director Phase 4 PASS verdict on FF#3 "Everything worked perfectly this time" (identical phrasing to yesterday's eBay FF#5 PASS — same outcome shape twice in a row across different platforms + different root causes); Etsy sub-cluster now fully ✅ DEPLOYED-AND-VERIFIED with no remaining scope; §C.2 estimate "~2-3 sessions" compressed into "1 calendar day"; Etsy Sessions 2 + 3 from §C.2 outline CLOSED; SIXTH build/deploy-session §B entry per Rule 18; THREE NEW reusable Patterns memorialized ("Diagnostic-instrumentation FF Pattern reusability validated across consecutive sessions" + "Over-broad fallback selectors in platform DOM-walkers should be DELETED, not added" + "AJAX-loaded overlay scraping requires live-DOM driver, not URL-construction")

**Session shape:** BUILD + DEPLOY + 3-FIX-FORWARD cascade + PHASE-4-PASS bundled into ONE calendar day on `workflow-2-competition-scraping` → `main`; 4 Rule 9 deploy gates fired (build deploy + FF#1 deploy + FF#2 diagnostic deploy + FF#3 fix deploy — one fewer than yesterday's eBay 5-FF; the Diagnostic-instrumentation FF Pattern enabled FEWER speculative FFs this time because the mid-Phase-4 picker rerouted to diagnostic earlier in the cascade); 8 Rule 14f forced-pickers fired all director-Yes-to-Recommended (8/8 = 100% calibration this session; running cumulative 35/38 = 92.1% across recent 6 sessions). **Schema-change-in-flight flag STAYS NO entire session** (Etsy reuses the schema W2 Amazon shipped 2026-05-28; no `prisma db push`; no API contract changes; `'etsy'` discriminator already accepted by the `CapturedReview.platform String?` column shipped at W2 Session 1 2026-05-26).

**Build commit `c572a42` (3 files +1509/-3) — initial URL-construction approach BUSTED in Phase 4:**

- **NEW `extensions/competition-scraping/src/lib/content-script/etsy-review-extractor.ts`** (~565 LOC) — initial per-platform module mirroring the W2 Amazon + eBay Patterns: FF#1 symmetric helpers Pattern (`isEtsyListingUrl` + `isEtsyScrapableUrl` + `extractListingIdFromEtsyUrl` + `extractListingIdFromCanonicalUrl`); FF#4 URL-construction-based pagination Pattern (`buildEtsyReviewUrl(listingId, starFilter, pageNumber)` direct URL construction; stop signal = fetched page has 0 reviews); cross-filter loop 3-star → 2-star → 1-star per §A.2 spec; `runEtsyReviewScrape` orchestrator using `fetch()` + `DOMParser` for pagination. **The approach was a reasonable hypothesis based on the Amazon + eBay precedents — but Etsy's overlay-based AJAX architecture broke it in Phase 4.**
- **NEW `extensions/competition-scraping/src/lib/content-script/etsy-review-extractor.test.ts`** (~580 LOC; 72 new node:test cases) covering URL-detection helpers + listing-ID extraction + review-URL construction matrix + parser coverage + cross-filter loop dispatch coverage + integration shape coverage. Test count chosen to match the eBay precedent's 64 cases proportionally (Etsy needed slightly more due to additional URL-construction parameter coverage).
- **MODIFIED `extensions/competition-scraping/src/lib/content-script/orchestrator.ts`** — `start-review-scrape` handler extended to recognize Etsy URLs via `isEtsyScrapableUrl` + dispatch to `runEtsyReviewScrape` orchestrator; reuses the existing `openScrapeTriggerModal` + `saveReview` wrapper. PLOS-side handlers — NONE extended; Etsy reviews flow through the existing `POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews` handler with `platform: 'etsy'`.

**3-fix-forward cascade after Phase 4 director real-Chrome verification surfaced the URL-construction approach was BUSTED:**

- **FF#1 `67aeacd` — Architecture pivot to live-DOM driver** (2 files +1058/-705). Director pasted the 41 KB outerHTML of Etsy's "View all reviews for this item" overlay (loaded via AJAX on the same listing URL with no separate URL for filters or pagination). Rewrote `etsy-review-extractor.ts` from URL-construction to live-DOM driver: click View-all-reviews button → wait for overlay → click histogram filter → wait for AJAX content swap → walk rows → click pagination Next → wait → repeat. Empirically-grounded selectors: `.deep-dive-sheet` + `[data-deep-dive-reviews-container="true"]` + `[data-review-region]` + `.wt-text-body` + `a[href*="/people/"]` + `[role="img"][aria-label^="Rating:"]` + `[data-reviews-histogram="true"] button[data-rating-value="N"]` + `nav[aria-label="Pagination of reviews"]`. **BUSTED silently — scrape ended with 0 captures + no error toast.**
- **Rule 14f mid-Phase-4 picker fired** after FF#1 BUSTED: (A) Diagnostic instrumentation [Recommended — reuse yesterday's eBay FF#4 Pattern] vs (B) Defer to next session. Director picked (A). **FF#2 `a3107b6`** (1 file +163/-2) shipped TEMPORARY diagnostic instrumentation: `[PLOS ETSY DIAGNOSTIC]` console.log at every step of the live-DOM driver + auto-download of overlay HTML to Downloads via programmatic `<a download>` click. Director ran ONE scrape with DevTools Console open → uploaded the diagnostic console output + the overlay HTML (`plos-etsy-diag-overlay-at-scrape-start.html` 41 KB).
- **FF#3 `41b03c5` — the WIN** (2 files +73/-190). Analysis of the dumped HTML file revealed the exact root cause: `findOverlayContainer` fallback selector `[aria-modal="true"][role="dialog"]` matched Etsy's hidden `#customer-photo-overlay-carousel` (review-photo lightbox; pre-rendered in DOM with `aria-hidden="true"` + `wt-display-none` class but present at page load). Fix: restrict to `.deep-dive-sheet` only + reject hidden variants (aria-hidden, wt-display-none, hidden attribute). All FF#2 diagnostic instrumentation removed in the same commit (mirrors yesterday's eBay FF#5 removing FF#4 instrumentation).

**Director Phase 4 PASS verdict on FF#3 = "Everything worked perfectly this time."** RESOLVES the Etsy sub-cluster end-to-end on vklf.com. No further fix-forwards needed.

**Scoreboard transitions:**

| Check | Pre-deploy | Post-build | Post-FF#1 | Post-FF#2 | Post-FF#3 (final) | Δ |
|-------|-----------|-----------|-----------|-----------|-------------------|---|
| root tsc | clean | clean | clean | clean | clean | UNCHANGED |
| extension tsc | clean | clean | clean | clean | clean | UNCHANGED |
| extension `npm test` | 731/731 | 803/803 (+72) | 815/815 (+12) | 815/815 | **818/818** | **+87** (72 build + 12 FF#1 + 0 net FF#2 + 3 net FF#3) |
| src/lib `npm run -w src/lib test` | 838/838 | 838/838 | 838/838 | 838/838 | 838/838 | UNCHANGED (Etsy is purely extension-side) |
| npm run build routes | 64 | 64 | 64 | 64 | 64 | UNCHANGED (no new API routes) |
| Playwright (Check 6) | SKIPPED | SKIPPED | SKIPPED | SKIPPED | SKIPPED | per Rule 27 |

**NEW baseline locked from this session:** extension `npm test` = **818/818** (+87 from 731 entry baseline).

**Rule 14f forced-pickers fired this session: EIGHT — all director-Yes-to-Recommended (8/8 = 100% calibration this session; running cumulative 35/38 = 92.1% across recent 6 sessions):**

1. **Start-of-session deploy-now-vs-exit picker** — director picked Recommended "Build + Deploy + Phase 4 today". The Pattern from §Entry 2026-05-29 sub-observation (f) firing for the SECOND TIME at start-of-session (first was yesterday's eBay session).
2. **Rule 9 deploy gate for build commit `c572a42`** — director picked Recommended "Deploy now".
3. **Mid-Phase-4 evidence-gathering picker** — after build commit BUSTED. Options: (A) Manual DevTools paste [Recommended] / (B) Diagnostic-instrumentation FF / (C) Speculative FF. Director picked (A); led to director's empirical paste of the 41 KB overlay outerHTML.
4. **Rule 9 deploy gate for FF#1 `67aeacd`** — director picked Recommended "Deploy FF#1 now".
5. **Mid-Phase-4 diagnostic-vs-defer picker** — after FF#1 BUSTED silently. Director picked Recommended "Diagnostic-instrumentation FF#2 (yesterday's eBay Pattern)" — directly produced FF#3's empirical one-shot fix.
6. **Rule 9 deploy gate for FF#2 diagnostic `a3107b6`** — director picked Recommended "Deploy FF#2 diagnostic now".
7. **Rule 9 deploy gate for FF#3 fix `41b03c5`** — director picked Recommended "Deploy FF#3 now".
8. **End-of-session §4 Step 1c next-task picker** — director picked Recommended **P-49 W2 Walmart sub-cluster Session 1** over P-43 mechanical prevention / W5 AI / P-48 Session 3.

**THREE NEW reusable Patterns memorialized in CORRECTIONS_LOG §Entry 2026-05-31:**

1. **"Diagnostic-instrumentation FF Pattern reusability validated across consecutive sessions"** — yesterday's eBay session memorialized the Diagnostic-instrumentation FF Pattern (§Entry 2026-05-30 sub-observation a). Today's Etsy session reused it identically: FF#1 BUSTED → Mid-Phase-4 picker → FF#2 diagnostic → FF#3 empirical fix (THE WIN with director verbatim "Everything worked perfectly this time"). Same outcome shape twice in a row across different platforms + different root causes (eBay: JSON data-island + tabpanel-scoping bugs; Etsy: over-broad findOverlayContainer fallback selector matching hidden non-deep-dive dialogs). **Pattern is now empirically validated as a repeatable success Pattern for the per-platform sub-cluster deploy session shape.** Future Walmart sub-cluster + future W3-W14 workstreams that need platform-DOM diagnostics should adopt this Pattern from the start.

2. **"Over-broad fallback selectors in platform DOM-walkers should be DELETED, not added"** — FF#1 BUSTED because the `[aria-modal="true"][role="dialog"]` fallback selector in `findOverlayContainer` matched Etsy's hidden `#customer-photo-overlay-carousel` dialog (the review-photo lightbox, pre-rendered in the DOM with `aria-hidden="true"` + `wt-display-none` class but present at page load). Defensive coding instinct said "add more fallbacks for resilience" but the empirical failure mode was the OPPOSITE — too many fallbacks let the wrong element through. **Lesson: prefer a single canonical-class selector + a hidden-state filter over multiple progressively-broader fallbacks.** Generalizes to all 4 platform extractors: each `findXxxContainer` helper should use the platform-canonical class + reject hidden variants (aria-hidden, wt-display-none, hidden attribute), not fall back to bare role/modal selectors. **Applies directly to W2 Walmart Session 1** — `findWalmartContainer` (if it exists) should follow this pattern from the start.

3. **"AJAX-loaded overlay scraping requires live-DOM driver, not URL-construction"** — Etsy's "View all reviews for this item" overlay loads via AJAX on the same listing URL (no separate URL exists for the overlay OR for per-star filters OR for pagination). The Amazon + eBay URL-construction Pattern (FF#4 from 2026-05-28; reused for eBay 2026-05-30) doesn't apply. Etsy required architecture pivot to live-DOM driver: click trigger → wait for overlay → click histogram filter → wait for content swap → walk rows → click pagination Next → wait → repeat. **Generalizes to W2 Walmart sub-cluster:** investigate Walmart's URL contract FIRST (the director-verbatim spec says `/reviews/product/<ID>?ratings=N` separate URLs — so URL-construction applies, NOT live-DOM driver like Etsy). But future per-platform sub-clusters where the platform uses AJAX overlays will need the live-DOM driver Pattern. Recommendation for FUTURE: build a small URL-contract-vs-AJAX detection helper at design-session time per platform so the architecture choice is locked before Session 1 begins.

**§A consumption by W2 Etsy sub-cluster Session 1 + DEPLOY (informational; §A frozen per Rule 18):**

- **§A.2 (per-platform priority order — Etsy third after Amazon + eBay) — consumed.** Etsy sub-cluster shipped third per the director-verbatim priority order; Walmart sub-cluster NEXT per (a.100); Walmart fourth + FINAL.
- **§A.2 (Etsy-specific spec — `View all reviews for this item` overlay with per-star percentage filter affordances; ~8 reviews/page in overlay; default `3-star + 2-star + 1-star at 200/star` user-adjustable) — consumed.** The cross-filter loop in `runEtsyReviewScrape` iterates 3-star → 2-star → 1-star per spec. **However, the URL-construction approach to pagination from §A.2's overlay-pagination assumption was empirically falsified** — Etsy's overlay loads via AJAX with no separate URL for filters or pagination; live-DOM driver required. §A.2 stays frozen per Rule 18; the Etsy-specific spec is now informationally annotated by this entry as "URL-construction does not apply; live-DOM driver required."
- **§A.3 (Shadow DOM progress indicator + trigger modal mounts) — consumed (no changes; reuse).** Etsy reuses the existing `scrape-progress-indicator.ts` + `scrape-trigger-modal.ts` from W2 Sessions 1 + 2 unchanged — only the dispatch glue was added.
- **§A.4 (per-URL `reviewScrapeCap` override) — consumed (no changes; reuse).** Etsy reuses the trigger modal's per-URL cap override + existing `CompetitorUrl.reviewScrapeCap Int? @default(200)` column.
- **§A.13 (data shape — `CapturedReview.platform String?` discriminator) — consumed.** Etsy reviews tagged with `platform: 'etsy'`; column already in production from the 2026-05-28 Amazon DEPLOY.
- **§A.15 (conservative anti-bot defaults — 1-3s random pagination delay + CAPTCHA detection + rate-limit detection + AbortSignal-cancellable) — consumed (no changes; reuse).** The live-DOM driver respects the same conservative anti-bot defaults — pagination clicks include the 1-3s random delay.
- **§A.16 (no new API routes needed) — consumed.** No new API routes added this session — Etsy reviews flow through the existing handler.

**§C.2 estimate transition:** "~2-3 sessions for the full Etsy arc" actually compressed into "1 session shipped + 1 session deployed + 3 FFs + Phase 4 PASS, all in one calendar day". The compounding effect of the W2 Pattern library (Amazon 2026-05-28 deploy + eBay 2026-05-30 deploy) + the Diagnostic-instrumentation FF Pattern (now validated across 2 consecutive sessions) is producing per-platform sub-cluster delivery at 1-calendar-day cadence reliably. **Etsy Sessions 2 + 3 from §C.2 outline CLOSED — entire Etsy sub-cluster ✅ DEPLOYED-AND-VERIFIED at session-end with no remaining scope.** Future Walmart sub-cluster expected to land at the same 1-calendar-day cadence (build + deploy + N fix-forwards + Phase 4 PASS).

**Active workstream status post-Etsy-DEPLOY:**

- **W1 Reviews Phase 2 Design Session** — ✅ DONE 2026-05-25-b.
- **W2 Per-platform extension extraction** — IN-FLIGHT. Amazon sub-cluster ✅ DEPLOYED-AND-VERIFIED 2026-05-28. eBay sub-cluster ✅ DEPLOYED-AND-VERIFIED 2026-05-30. Etsy sub-cluster ✅ DEPLOYED-AND-VERIFIED 2026-05-31 (TODAY). **Walmart sub-cluster NEXT per (a.100) per §A.2 priority order — Walmart fourth + FINAL per-platform sub-cluster.**
- **W3 Crawler infrastructure** — DROPPED per A.1 Q1 outcome.
- **W4 Captured Reviews UI extensions** — ✅ DEPLOYED-AND-VERIFIED 2026-05-29.
- **W5 AI review analysis system** — DEFERRED until W2 Walmart sub-cluster deploys (after Walmart deploys, all 4 platform corpora exist; W5 currently has Amazon + eBay + Etsy corpora available — Walmart pending).

**Cross-references:**

- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-31 — canonical post-deploy outcome capture + THREE NEW reusable Patterns + 3 LOW informational sub-observations + final calibration 8/8 = 100% + P-43 cwd-leak Pattern Class reproductions UPDATED to ~5 this session (running tally ~16+) + §C.2 estimate compression memorialized AGAIN.
- §B 2026-05-30 (W2 eBay sub-cluster DEPLOY + 5-fix-forward cascade) — predecessor entry capturing the Diagnostic-instrumentation FF Pattern that today's Etsy session reused identically (FF#1 BUSTED → Mid-Phase-4 picker → FF#2 diagnostic → FF#3 empirical fix = THE WIN).
- §B 2026-05-29 (W4 Captured Reviews UI extensions Session 1 + DEPLOY) — predecessor entry capturing the "End-of-build-session deploy-or-exit Rule 14f picker" Pattern that fired today at start-of-session for the SECOND time (first was yesterday's eBay; today's Etsy = SECOND).
- §B 2026-05-28 (W2 Amazon DEPLOY + 4-fix-forward cascade) — predecessor entry capturing the W2 Amazon Patterns; today's Etsy session attempted to reuse the URL-construction Pattern (FF#4 from this entry) but empirically falsified the assumption for Etsy's AJAX-overlay architecture.
- §B 2026-05-27 (W2 Amazon Session 2) — predecessor entry capturing the cross-star/cross-filter loop Pattern + Shadow DOM trigger modal Pattern reused today by the Etsy module (cross-filter loop applied; trigger modal reused unchanged).
- §B 2026-05-26 (W2 Amazon Session 1) — foundation entry capturing the `fetch()` + `DOMParser` content-script pagination Pattern (used in the BUSTED initial build commit) + the foundation-session-bundle-substrate Pattern.
- §A.2 (per-platform priority order + Etsy-specific spec) + §A.3 (Shadow DOM mounts) + §A.4 (per-URL cap override) + §A.13 (platform discriminator) + §A.15 (anti-bot defaults) + §A.16 (no new API routes) — all consumed today; §A stays frozen per Rule 18.
- `docs/ROADMAP.md` P-49 polish-backlog entry — W2 Etsy sub-cluster status flipped to ✅ DEPLOYED-AND-VERIFIED 2026-05-31 + (a.99) closes + (a.100) opens for P-49 W2 Walmart sub-cluster Session 1.
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-31 (NEW — extension-side architecture cross-reference pointer per the W2 Amazon + eBay precedent; canonical Etsy deploy-session entry lives in this doc's §B 2026-05-31).

**Closing line:** P-49 W2 Etsy sub-cluster ✅ DEPLOYED-AND-VERIFIED 2026-05-31 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — Session 1 build commit `c572a42` (3 files +1509/-3) + 3 fix-forward commits all on main under 4 separate Rule 9 deploy gates (build deploy + FF#1 `67aeacd` deploy [architecture pivot from URL-construction to live-DOM driver based on director's paste of the 41 KB overlay outerHTML] + FF#2 `a3107b6` diagnostic deploy [TEMPORARY `[PLOS ETSY DIAGNOSTIC]` console.log + auto-download of overlay HTML; reused yesterday's eBay FF#4 Pattern] + FF#3 `41b03c5` empirical fix deploy [restrict `findOverlayContainer` to `.deep-dive-sheet` only + reject hidden variants + remove FF#2 instrumentation]); director Phase 4 PASS verdict on FF#3 "Everything worked perfectly this time" (identical phrasing to yesterday's eBay FF#5 PASS — same outcome shape twice in a row across different platforms + different root causes); Etsy sub-cluster now fully ✅ DEPLOYED-AND-VERIFIED with no remaining scope (§C.2 estimate "~2-3 sessions" compressed into "1 calendar day"; Etsy Sessions 2 + 3 from §C.2 CLOSED); 4 Rule 9 deploy gates fired (one fewer than yesterday's eBay 5-FF; Diagnostic-instrumentation FF Pattern enabled fewer speculative FFs this time); 8 Rule 14f forced-pickers fired all director-Yes-to-Recommended (8/8 = 100% calibration; running cumulative 35/38 = 92.1%); Schema-change-in-flight flag STAYS NO entire session; THREE NEW reusable Patterns memorialized ("Diagnostic-instrumentation FF Pattern reusability validated across consecutive sessions" + "Over-broad fallback selectors in platform DOM-walkers should be DELETED, not added" + "AJAX-loaded overlay scraping requires live-DOM driver, not URL-construction"); LOW informational P-43 cwd-leak Pattern Class reproduction running tally now ~16+. **Closes (a.99); opens (a.100) RECOMMENDED-NEXT = P-49 W2 Walmart sub-cluster Session 1** on `workflow-2-competition-scraping` per §A.2 priority order + §C.2 implementation outline (reuses W2 Amazon + eBay + Etsy Patterns: FF#1 symmetric helpers + FF#4 URL-construction pagination — Walmart's spec per §A.2 uses separate URLs `/reviews/product/<ID>?ratings=N` for per-star filters so URL-construction applies + cross-filter loop + Shadow DOM trigger modal + today's NEW "Over-broad fallback selectors should be DELETED, not added" Pattern applied from the start). **SIXTH build/deploy-session §B entry in this design doc per Rule 18** — pairs with §B 2026-05-26 (W2 Session 1) + §B 2026-05-27 (W2 Session 2) + §B 2026-05-28 (W2 Amazon DEPLOY) + §B 2026-05-29 (W4 Session 1 + post-deploy sub-section) + §B 2026-05-30 (W2 eBay DEPLOY) + this W2 Etsy DEPLOY entry as the third per-platform DEPLOY entry in the Reviews Phase 2 arc + second consecutive per-platform DEPLOY entry to reuse the Diagnostic-instrumentation FF Pattern (eBay was first 2026-05-30; Etsy is second 2026-05-31). The next §B entry will land at the Walmart sub-cluster Session 1 close (likely §B 2026-06-01 if next session lands within 24 hours per the now-canonical 1-calendar-day cadence).

---

## §B 2026-06-01 — `session_2026-06-01_p49-w2-walmart-sub-cluster-session-1` — P-49 W2 Walmart sub-cluster ✅ DEPLOYED-AND-VERIFIED 2026-06-01 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — **CLOSES the entire P-49 W2 per-platform extension extraction arc across all 4 platforms** (Amazon 2026-05-28 + eBay 2026-05-30 + Etsy 2026-05-31 + Walmart 2026-06-01); third consecutive per-platform deploy session to reuse the Diagnostic-instrumentation FF Pattern (eBay was first 2026-05-30; Etsy second 2026-05-31; Walmart third today); SEVENTH build/deploy-session §B entry per Rule 18; THREE NEW reusable Patterns memorialized ("Diagnostic-instrumentation FF Pattern reusability validated across 3 consecutive days/platforms" + "Word-boundary regex `\b...\b` for reserved-keyword filtering against natural-language strings" + "closest() walk-up + anchor-on-canonical-data-testid pattern when no card-level data-testid exists"); UNBLOCKS Workstream 5 AI review analysis Session 1 (becomes next-next task per (a.101)).

**Session shape:** build + deploy + 3-fix-forward cascade + Phase-4-PASS bundled into ONE calendar day. Build session expanded to build + deploy + 3-FF cascade + Phase-4-PASS via the now-canonical start-of-session deploy-now picker (Pattern memorialized 2026-05-29; firing for THIRD consecutive session at start-of-session — eBay 2026-05-30 + Etsy 2026-05-31 + Walmart today 2026-06-01; director Yes-to-Recommended all 3 times).

**Build commit `3316eaa` (3 files +1625/-5):**

- NEW `extensions/competition-scraping/src/lib/content-script/walmart-review-extractor.ts` (~530 LOC). URL-construction approach using FF#1 symmetric helpers (`isWalmartScrapableUrl` + `extractProductIdFromWalmartUrl`) + FF#4 URL-construction pagination (`buildWalmartReviewUrl(productId, starFilter, pageNumber)`) + cross-star loop (5 → 4 → 3 → 2 → 1 star per §A.2 spec). Applies the 2026-05-31 Etsy FF#3 Pattern from the start — single canonical-class selectors, no progressively-broader fallbacks.
- NEW `walmart-review-extractor.test.ts` (~660 LOC; 88 new node:test cases).
- MODIFY `orchestrator.ts` — Walmart dispatch block inserted between Etsy and the fallback toast; new fallback message acknowledges all 4 platforms now ship.

**ff-merged to main under Rule 9 deploy gate; Vercel auto-redeploy fired; fresh extension zip `plos-extension-2026-06-01-w2-walmart-deploy-1.zip` produced via `npm run zip`.**

**Phase 4 director real-Chrome verification surfaced FF#1 root cause via empirical URL paste:** the saved URL `https://www.walmart.com/ip/803154651` (slugless) didn't match the `LISTING_PAGE_PATH` regex which required the slug. Walmart canonically serves BOTH `/ip/<id>` (slugless) AND `/ip/<slug>/<id>` (slug + id; e.g. `/ip/PanOxyl-Foaming-Acne-Wash-10-Benzoyl-Peroxide-Maximum-Strength-5-5-oz/803154651?classType=VARIANT&athbdg=L1102&from=/search`).

**FF#1 `3321690` (2 files +60/-1):** empirically-grounded loosen-LISTING_PAGE_PATH-regex fix from director's URL paste. Loosened regex to `/\/ip\/(?:[^/?#]+\/)?(\d+)\b/` + 6 new test cases (912/912 from 906).

FF#1 still BUSTED in the row-walker phase — the scrape recognized the URL and fetched pages successfully, but the row walker extracted 0 reviews per page. **All 14 FF#1-shipped candidate selectors returned 0 in the SELECTOR PROBE.**

**Rule 14f mid-Phase-4 diagnostic-vs-defer picker fired** — director picked Recommended Diagnostic instrumentation (THIRD consecutive day this Pattern fired; eBay 2026-05-30 + Etsy 2026-05-31 + Walmart today).

**FF#2 `c953e71` (1 file +101/-1; TEMPORARY diagnostic instrumentation):**

- `[PLOS WALMART DIAGNOSTIC]` console.log at every step of `runWalmartReviewScrape` entry + `scrapeOneStar` entry + `extractCurrentPageRows` + `advanceToNextPage` (fetch URL + HTTP status + content-type + HTML size).
- SELECTOR PROBE per page logging counts of 14 candidate selectors.
- AUTO-DOWNLOAD via programmatic `<a download>` click of the FIRST star + FIRST page HTML to Downloads (`plos-walmart-diag-<productId>-<star>star-page1.html`; gated by boolean to dump only once per scrape, not per page).
- All instrumentation marked with `[PLOS WALMART DIAGNOSTIC]` prefix for clean removal in FF#3.

Director ran ONE scrape with DevTools Console open + uploaded 3 HTML files (`plos-walmart-diag-803154651-1star-page1.html` + `2star` + `3star` page1; 288-291 KB each).

**FF#3 `86cbfbd` (2 files +379/-403) — the WIN.** Empirical analysis of the dumped HTML files revealed Walmart's actual review row attributes:

- **Per-review body anchor:** `data-testid="enhanced-review-content"` (10/page, 1:1 with reviews).
- **Per-review card root via `closest('.overflow-visible')` walk-up** (class `overflow-visible b--none mt4-l ma0 dark-gray` is unique to review cards on the page). NEW Pattern (c) below.
- **Star rating:** `<span class="ld_Ec">N out of 5 stars review</span>` — Walmart's screen-reader-only canonical text; always present 10/10.
- **Title:** `<h3>` (only ~40% of reviews have titles — 6/10 reviews on 3-star page are body-only; null when missing).
- **Body:** `<p>` inside `enhanced-review-content` (CSS `-webkit-line-clamp:3` is truncation only — full text IS in DOM; "View more" is CSS, not AJAX).
- **Reviewer name:** `aria-label` value on `<div class="flex flex-column " aria-label="<Name>">` (10 empirical names from the 3 HTML files: Mimiofboys, Stacia, alexandra, anonymous, "Walmart customer, Top Reviewer", Pay, "A, Top Reviewer", Kelsey, Arterial, WalmartCustomer).
- **Date:** first `.f7.gray` element ("Oct 16, 2025" format).
- **Reviewer-name filter:** `/\b(review|purchase|rating|upvote|downvote)\b/i` — **word-boundary regex; critical so "Top Reviewer" is NOT filtered.** NEW Pattern (b) below.

FF#3 also removed `findWalmartReviewsContainer` (was wrong — replaced by the `closest()` walk-up) + removed ALL FF#2 diagnostic instrumentation in the same commit (yesterday's Etsy FF#3 Pattern: fix + cleanup land together) + test file rewritten with new fixtures matching the new walker shape (FakeEl extended with `closest()` + parent linkage; `buildCardWithBody` helper).

**Director Phase 4 PASS verdict on FF#3 = "Everything passed"** — identical outcome shape to yesterday's Etsy FF#3 PASS + day-before's eBay FF#5 PASS; **third consecutive day** the Diagnostic-instrumentation FF Pattern delivered a PASS verdict on the empirical-fix FF.

**THREE NEW reusable Patterns memorialized this session (cross-referenced in CORRECTIONS_LOG §Entry 2026-06-01):**

(a) **"Diagnostic-instrumentation FF Pattern reusability validated across 3 consecutive days/platforms"** — eBay 2026-05-30 (FF#4 diagnostic → FF#5 PASS "Everything worked perfectly") + Etsy 2026-05-31 (FF#2 diagnostic → FF#3 PASS "Everything worked perfectly this time") + Walmart 2026-06-01 (FF#2 diagnostic → FF#3 PASS "Everything passed"). Same outcome shape THREE consecutive days across three different platforms with three different root causes. Pattern is now empirically validated as a **repeatable canonical Pattern for the per-platform sub-cluster deploy session shape**. Future W3-W14 workstreams that need platform-DOM diagnostics should adopt this Pattern from the start.

(b) **"Word-boundary regex `\b...\b` for reserved-keyword filtering against natural-language strings"** — FF#3 reviewer-name extractor filter `/\b(review|purchase|rating|upvote|downvote)\b/i` (with `\b` word boundaries). Critical: real reviewer name "Walmart customer, Top Reviewer" contains "Reviewer" — a substring regex `/review/i` falsely matched the substring "Review" inside "Reviewer" and filtered the name out. Word-boundary anchors require the keyword to be a complete word. **Generalizes to ANY denylist filter against natural-language strings.**

(c) **"closest() walk-up + anchor-on-canonical-data-testid pattern when no card-level data-testid exists"** — Walmart has stable per-review data-testids on the BODY (`enhanced-review-content`) + the FOOTER (`enhanced-review-section`), but NOT on the review card root. Anchor on the body, walk up via `closest('.overflow-visible')` to find the card boundary. Cleaner + more robust than scanning for the card root via CSS-attribute-contains or parentElement chain navigation. **Applies to any future per-platform DOM walker where the row-level marker is on a SUB-element of the row, not the row root itself.**

**Affected §A sections (informational — §A frozen per Rule 18):**

- §A.2 (per-platform priority order + Walmart-specific spec) — consumed; Walmart was fourth + FINAL per-platform sub-cluster.
- §A.3 (Shadow DOM mounts) — reused; trigger modal + progress indicator unchanged.
- §A.4 (per-URL cap override) — reused; `reviewScrapeCap` per-URL default applies to Walmart.
- §A.13 (platform discriminator) — consumed; `'walmart'` discriminator already accepted by `CapturedReview.platform String?` column.
- §A.15 (anti-bot defaults) — reused; conservative 1-3s random delays + captcha-aware abort applied.
- §A.16 (no new API routes) — confirmed; Walmart reviews flow through existing `create-captured-review` BackgroundRequest into existing `POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews` handler with `platform: 'walmart'`.

**§C.5 (Workstream 5 AI review analysis) UNBLOCKED:** all 4 platform corpora now exist in production as of today's Walmart deploy. W5 Session 1 = token-counter + batch-sizer + cache + cost-cap foundation primitives + first per-product prompt + first end-to-end run on a small product (per §C.5 outline). Estimated ~5-10 sessions for the full W5 arc.

**Pre-deploy + post-merge verification scoreboard:**

| Check | Pre-deploy baseline | Post-FF#3 baseline | Delta |
|---|---|---|---|
| root tsc | clean | clean | unchanged |
| extension tsc | clean | clean | unchanged |
| extension `npm test` | 818/818 | **910/910** | **+92 cumulative** (88 from build + 6 from FF#1 + 0 net from FF#2 + net-rewrite FF#3) |
| src/lib node:test | 838/838 | 838/838 | unchanged |
| npm run build routes | 64 | 64 | unchanged |
| Playwright (Check 6) | SKIPPED | SKIPPED | Rule 27 |

**NEW baseline locked from this session:** extension `npm test` = **910/910** (+92 from 818 entry baseline).

**Rule 9 deploy gates fired:** 4 (build deploy + FF#1 deploy + FF#2 diagnostic deploy + FF#3 fix deploy — same count as yesterday's Etsy 3-FF; one fewer than 2026-05-30 eBay 5-FF).

**Rule 14f forced-pickers fired:** 7, all director-Yes-to-Recommended (7/7 = 100% calibration this session; running cumulative 50/53 = 94.3% across recent 8 sessions). The 7 picks:

1. Start-of-session deploy-now-vs-exit picker (Pattern memorialized 2026-05-29; firing for THIRD consecutive day at start-of-session).
2. Rule 9 deploy gate #1 (build commit) → Recommended Deploy now.
3. Rule 9 deploy gate #2 (FF#1) → Recommended Deploy now.
4. Mid-Phase-4 picker after FF#1 BUSTED silently — Recommended Diagnostic-instrumentation FF#2 over Defer to next session.
5. Rule 9 deploy gate #3 (FF#2 diagnostic) → Recommended Deploy now.
6. Rule 9 deploy gate #4 (FF#3 fix) → Recommended Deploy now.
7. §4 Step 1c next-task picker → Recommended P-49 W5 AI review analysis Session 1 over P-43 mechanical prevention / P-48 Session 3 / P-50 Condition Pathology.

**Schema-change-in-flight flag:** STAYS NO entire session (Walmart reuses the schema W2 Amazon shipped 2026-05-28; no `prisma db push`; no API contract changes; `'walmart'` discriminator already accepted by `CapturedReview.platform String?` column from W2 Session 1 2026-05-26).

**§C.2 estimate compression memorialized for THIRD consecutive day:** "~2-3 sessions for the full Walmart arc" → "1 calendar day". Identical compression shape as eBay 2026-05-30 ("~3-4 sessions" → "1 calendar day") + Etsy 2026-05-31 ("~2-3 sessions" → "1 calendar day"). **Per-platform sub-cluster 1-calendar-day cadence is now the EMPIRICAL NORM, not the exception** — validated across 3 consecutive days/3 consecutive platforms. Walmart Sessions 2 + 3 from §C.2 outline CLOSED; entire Walmart sub-cluster ✅ DEPLOYED-AND-VERIFIED with no remaining scope; **the P-49 W2 entire 4-platform arc is now COMPLETE**.

**LOW informational sub-observations (full details in CORRECTIONS_LOG §Entry 2026-06-01):**

- P-43 cwd-leak Pattern Class reproduced ~3 more times this session (running tally ~19+; strong empirical signal continues mounting for the P-43 mechanical prevention small fix).
- Calibration data point — Rule 14f forced-pickers fired 7 times today, all director-Yes-to-Recommended (7/7 = 100% this session); running cumulative 50/53 = 94.3% across recent 8 sessions; framing well-calibrated.
- §C.2 estimate compression memorialized for THIRD consecutive day (above).

**Cross-references:**

- §B 2026-05-31 (W2 Etsy DEPLOY) — predecessor entry capturing the Diagnostic-instrumentation FF Pattern reused identically today (SECOND consecutive day reuse → today's THIRD consecutive day reuse validates the Pattern as canonical).
- §B 2026-05-30 (W2 eBay DEPLOY) — first per-platform DEPLOY entry to memorialize the Diagnostic-instrumentation FF Pattern; today's Walmart is the third consecutive reuse.
- §B 2026-05-29 (W4 Captured Reviews UI extensions Session 1 + DEPLOY) — predecessor entry capturing the "End-of-build-session deploy-or-exit Rule 14f picker" Pattern that fired today at start-of-session for the THIRD consecutive time (first was 2026-05-30 eBay; second was 2026-05-31 Etsy; today's Walmart = THIRD).
- §B 2026-05-28 (W2 Amazon DEPLOY + 4-fix-forward cascade) — predecessor entry capturing the W2 Amazon URL-construction Patterns (FF#1 symmetric helpers + FF#4 URL-construction pagination) reused successfully today by the Walmart module (URL-construction applies cleanly to Walmart per §A.2 spec — both `/ip/<id>` and `/ip/<slug>/<id>` accepted via FF#1 regex loosening).
- §B 2026-05-27 (W2 Amazon Session 2) — predecessor entry capturing the cross-star/cross-filter loop Pattern + Shadow DOM trigger modal Pattern reused today by the Walmart module (cross-star loop applied; trigger modal reused unchanged).
- §B 2026-05-26 (W2 Amazon Session 1) — foundation entry capturing the `fetch()` + `DOMParser` content-script pagination Pattern (used directly by today's Walmart module).
- §A.2 (Walmart-specific spec) + §A.3 + §A.4 + §A.13 + §A.15 + §A.16 — all consumed today; §A stays frozen per Rule 18.
- `docs/ROADMAP.md` P-49 polish-backlog entry — W2 Walmart sub-cluster status flipped to ✅ DEPLOYED-AND-VERIFIED 2026-06-01 + (a.100) closes + (a.101) opens for P-49 W5 AI review analysis Session 1; **entire P-49 W2 4-platform arc COMPLETE acknowledged**.
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-06-01 (NEW — extension-side architecture cross-reference pointer per the W2 Amazon + eBay + Etsy precedent; canonical Walmart deploy-session entry lives in this doc's §B 2026-06-01).

**Closing line:** P-49 W2 Walmart sub-cluster ✅ DEPLOYED-AND-VERIFIED 2026-06-01 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — Session 1 build commit `3316eaa` (3 files +1625/-5) + 3 fix-forward commits all on main under 4 separate Rule 9 deploy gates (build deploy + FF#1 `3321690` deploy [loosen `LISTING_PAGE_PATH` regex to accept BOTH `/ip/<id>` and `/ip/<slug>/<id>` per director's URL paste; +6 tests 912/912] + FF#2 `c953e71` diagnostic deploy [TEMPORARY `[PLOS WALMART DIAGNOSTIC]` console.log + auto-download of first star + first page HTML to Downloads; reused 2026-05-30 eBay FF#4 + 2026-05-31 Etsy FF#2 Pattern THIRD consecutive day] + FF#3 `86cbfbd` empirical fix deploy [anchor on per-review body `data-testid="enhanced-review-content"` + `closest('.overflow-visible')` walk-up + screen-reader-only `<span class="ld_Ec">` star + `<h3>` null-when-missing title + `<p>` body + `aria-label` reviewer name with word-boundary regex filter + `.f7.gray` date + removed `findWalmartReviewsContainer` + removed FF#2 instrumentation + test file rewritten]); director Phase 4 PASS verdict on FF#3 "Everything passed" (third consecutive day the Diagnostic-instrumentation FF Pattern delivered a PASS verdict on the empirical-fix FF); Walmart sub-cluster now fully ✅ DEPLOYED-AND-VERIFIED with no remaining scope (§C.2 estimate "~2-3 sessions" compressed into "1 calendar day"; Walmart Sessions 2 + 3 from §C.2 CLOSED); **CLOSES the entire P-49 W2 per-platform extension extraction arc across all 4 platforms — Amazon (2026-05-28) + eBay (2026-05-30) + Etsy (2026-05-31) + Walmart (2026-06-01) all now ✅ DEPLOYED-AND-VERIFIED end-to-end on vklf.com**; 4 Rule 9 deploy gates fired (same count as yesterday's Etsy 3-FF); 7 Rule 14f forced-pickers fired all director-Yes-to-Recommended (7/7 = 100% calibration; running cumulative 50/53 = 94.3%); Schema-change-in-flight flag STAYS NO entire session; THREE NEW reusable Patterns memorialized ("Diagnostic-instrumentation FF Pattern reusability validated across 3 consecutive days/platforms" + "Word-boundary regex for reserved-keyword filtering against natural-language strings" + "closest() walk-up + anchor-on-canonical-data-testid Pattern"); LOW informational P-43 cwd-leak Pattern Class reproduction running tally now ~19+. **Closes (a.100); opens (a.101) RECOMMENDED-NEXT = P-49 W5 AI review analysis Session 1** on `workflow-2-competition-scraping` per §C.5 implementation outline (token-counter + batch-sizer + cache + cost-cap foundation primitives + first per-product prompt + first end-to-end run on a small product) — newly unblocked because all 4 platform corpora exist in production. **SEVENTH build/deploy-session §B entry in this design doc per Rule 18** — pairs with §B 2026-05-26 (W2 Session 1) + §B 2026-05-27 (W2 Session 2) + §B 2026-05-28 (W2 Amazon DEPLOY) + §B 2026-05-29 (W4 Session 1 + post-deploy sub-section) + §B 2026-05-30 (W2 eBay DEPLOY) + §B 2026-05-31 (W2 Etsy DEPLOY) + this W2 Walmart DEPLOY entry as the fourth + FINAL per-platform DEPLOY entry in the Reviews Phase 2 arc; **closes the entire P-49 W2 per-platform extension extraction arc**; the next §B entry will land at the W5 AI review analysis Session 1 close.

---

## §B 2026-06-02 — `session_2026-06-02_p49-w5-session-1-foundation-shipped-output-shape-deferred` — Workstream 5 AI review analysis Session 1 — foundation primitives + plumbing handler SHIPPED at code level via build commit `04f74cf` (19 files +2968/-1) on `workflow-2-competition-scraping`; v1 prompt content + UI placement re-confirmation + first live end-to-end run all DEFERRED to next session per director's explicit mid-session directive to plan the per-product analysis output shape FIRST before writing prompt code; FIRST W5 §B entry in this design doc (EIGHTH build/deploy-session §B entry per Rule 18 — closes the gap left at the end of yesterday's Walmart DEPLOY entry which noted "the next §B entry will land at the W5 AI review analysis Session 1 close"); NEW reusable Pattern memorialized via NEW memory file `feedback_plan_output_shape_before_building.md` — "Plan AI-output shape (prompts + UI placement) with director BEFORE writing prompt code, even when launch prompt says ship-and-iterate"; W5 architecturally diverges from W#1 on the AI-infrastructure axis (W5: `@anthropic-ai/sdk ^0.98.1` + real pre-flight cost-cap enforcement + real pre-flight token counting via `client.messages.countTokens`; W#1: raw `fetch()` + post-facto cost logging + response-usage token reads); ZERO Rule 9 deploy gates fired this session (pure BUILD session); Schema-change-in-flight flag STAYS NO entire session.

**Why this entry exists separately from a future W5 DEPLOY §B entry:** Today's session was the OPENING session in the W5 implementation arc. The launch prompt + §C.5 implementation outline anticipated a "ship-foundation-primitives + v1-prompt + first-live-run-on-small-corpus" single-session shape mirroring P-46 W1's Schema-only session. Reality diverged mid-session via director's free-text Rule 14f redirect — the foundation primitives + plumbing handler shipped at code level, but the v1 prompt content + UI placement re-confirmation + first live end-to-end run all DEFERRED to next session (a.102) per the new memory file's meta-pattern. **This §B entry captures the foundation-only shape so the next session (W5 Session 1.5 — director-driven output-shape planning) has a clean canonical reference for what code is in place + what design conversations need to happen + which §A sections need re-confirmation or pivot.**

**Build commit `04f74cf` (19 files +2968/-1) — code shipped at this session:**

- NEW `src/lib/competition-scraping/review-analysis/` directory with **7 modules**:
  1. `client.ts` (~85 LOC) — Anthropic SDK seam + supported-model registry (Opus 4.7 default + Sonnet 4.5 selectable + Haiku 4 selectable per §A.7) + dual-key precedence (`ANTHROPIC_API_KEY` then `CLAUDE_API_KEY`); DI-seam factory `createReviewAnalysisClient()` returns the production SDK instance, test-mode factory returns a stub.
  2. `pricing.ts` (~60 LOC) — per-model per-million-token input/output/cache-write/cache-read cost math + `estimateBatchCost()` helper.
  3. `cache.ts` (~75 LOC) — SHA-256 `computeReviewsHash()` over the per-product corpus (sorted reviewId list + bodyHashes; deterministic) + `isStale()` against existing `ReviewAnalysis.reviewsHash` per §A.12 fingerprint-cache spec.
  4. `cost-cap.ts` (~95 LOC) — preventive per-run cap (refuses pre-flight if estimate exceeds threshold) + per-Project monthly running-total cap (queries `ReviewAnalysis` table sum over current calendar month) per §A.7; returns structured `CostCapDecision` (allow + soft-warn + hard-deny) for the handler to act on.
  5. `token-counter.ts` (~90 LOC) — pre-flight `client.messages.countTokens` wrapper (authoritative Anthropic count) + char/3.6 heuristic fallback when network unavailable; **architectural divergence from W#1** (W#1 reads response.usage post-call; W5 counts pre-call).
  6. `batch-sizer.ts` (~125 LOC) — adaptive batching to ~80K-token budget per batch per §A.8 (Claude's 200K context with 80K reserved for system + tools + output headroom); chunks the per-product review corpus into batches that fit the budget; sticky per-batch starRating headers for two-sweep prompt context.
  7. `prompts.ts` (~90 LOC PLACEHOLDER) — v1 per-product two-sweep prompt scaffold; **PLACEHOLDER CONTENT** to be rewritten next session per director's planning conversation; current scaffold ships a minimal "summarize key themes + complaints + praise" prompt that runs end-to-end but is NOT the canonical v1 per §A.7-§A.9 — flagged in source comments as `// TODO(W5-Session-1.5): rewrite per director's planning conversation`.

- **6 test files** (~47 new node:test cases): `client.test.ts` (4) + `pricing.test.ts` (6) + `cache.test.ts` (10) + `cost-cap.test.ts` (10) + `token-counter.test.ts` (9) + `batch-sizer.test.ts` (8).

- NEW `src/lib/competition-scraping/handlers/review-analysis-run.ts` (~430 LOC DI-seam POST handler) — orchestrates: auth via existing session helper → load Project + competitor URL + filtered `CapturedReview` rows by `urlId` → compute `reviewsHash` → check staleness against existing `ReviewAnalysis` → batch via `batch-sizer.ts` → pre-flight cost estimate via `token-counter.ts` + `pricing.ts` → gate via `cost-cap.ts` → two-sweep Anthropic call with prompt caching on system block per §A.7 → parse JSON output via tolerant `extractJsonFromModelText` helper (handles ```json ``` fences + raw object + trailing chatter) → persist `ReviewAnalysis` row via Prisma upsert.

- NEW `review-analysis-run.test.ts` (~14 cases) — 5 `extractJsonFromModelText` unit tests + auth-required + missing-Project-404 + cache-hit-short-circuit + cost-cap-rejection + single-batch happy path + multi-batch happy path + Anthropic-API-error path + Prisma-upsert-error path.

- NEW thin API route shim at `src/app/api/projects/[projectId]/competition-scraping/review-analysis/run/route.ts` — re-exports the DI-seam handler with production deps (real `prisma` + real `createReviewAnalysisClient`) per the per-record handler DI-seam Pattern from W2 Amazon Session 1 §B 2026-05-26.

- NEW `scripts/test-w5-end-to-end.mjs` — standalone Node script with `--dry-run` (no Anthropic API call; verifies primitives + handler wiring end-to-end against a real Project + corpus; PASSED this session) and `--live` (placeholder for next session's first live run; currently exits with "DEFERRED to next session per output-shape planning" message). `--dry-run` PASSED this session.

- MODIFY `package.json` + `package-lock.json` for NEW dependency `@anthropic-ai/sdk ^0.98.1` (~3 MB).

**Pre-build /scoreboard 5/5 GREEN at entry baselines:** root tsc clean / extension tsc clean / **910 ext** / **838 src/lib** / **64 routes**; Check 6 Playwright SKIPPED per Rule 27 picker.

**Post-build /scoreboard 5/5 GREEN at new src/lib baseline:** src/lib `npm test` = **899/899** (+61 cumulative from 838 — 47 from primitives + 14 from handler); `npm run build` = **65 routes** (+1 for new review-analysis/run shim); extension `npm test` = **910/910** UNCHANGED; Check 6 SKIPPED per Rule 27.

**NEW baseline locked: src/lib `npm test` = 899/899** (+61 from 838 entry baseline); routes = **65** (+1).

**TWO Rule 14f forced-pickers fired this session:**

- **Picker #1 (ANSWERED) — W5 architecture-decision picker:** "Install `@anthropic-ai/sdk` + build real pre-flight cost-cap module + use real pre-flight token counting (RECOMMENDED) — OR — mirror W#1's pattern of raw fetch + no separate cost-cap module + heuristic-only token estimation?" Director picked Recommended Yes. **1/1 = 100% on the picker that was answered.** This locked W5's architectural divergence from W#1 on the AI-infrastructure axis (see "Architecture divergence" section below).
- **Picker #2 (REDIRECTED) — "Fire live end-to-end run now?":** framed as 3 options (Yes Recommended + Defer to next session + Spend more session on prompt iteration before going live). Director REDIRECTED via free-text escape-hatch with the verbatim message: *"You didn't ask me how I wanted to approach the analysis of the reviews. I want to first plan out how the analysis of the reviews should be done and where the output should be posted. i want you to wrap this session and begin the next session by you asking me for the suggestions i have for the review analysis function and once i provide it, i want you to plug as much of that into the 6 dimensions of plan you have identified and then if anything is still missing, i want you to ask me specific questions to help clarify those hazy areas."* This **REDIRECTED** the picker (not chosen-from-options) — positive calibration data point for Rule 14f free-text escape-hatch design.

**ZERO Rule 9 deploy gates fired this session** — pure BUILD session; build commit `04f74cf` stays on `workflow-2-competition-scraping` until W5 deploy session ~5-10 sessions from now per §C.5 outline.

**Schema-change-in-flight flag STAYS NO entire session** (entry NO + exit NO; `ReviewAnalysis` model + `ReviewAnalysisLevel` enum schema already shipped via W2 Amazon Session 1's `prisma db push` 2026-05-26 + deployed 2026-05-28; W5 Session 1 reads + writes against the post-migration schema).

**Architecture divergence from W#1 on the AI-infrastructure axis (memorialized for future-sessions reference; supersedes the "mirror W#1" framing in §C.5):**

| Axis | W5 (this session) | W#1 |
|------|---|---|
| SDK dependency | `@anthropic-ai/sdk ^0.98.1` (~3 MB; new in `package.json`) | None — raw `fetch()` with hand-rolled request shape |
| Cost-cap enforcement | Real pre-flight enforcement (`cost-cap.ts` rejects requests pre-flight if estimated cost exceeds per-run or per-Project monthly cap) | Post-facto cost logging only (reads response.usage and logs after call returns) |
| Token counting | Real pre-flight count via `client.messages.countTokens` (authoritative Anthropic count) | Response-usage read-back (post-call, not pre-flight) |

**Justification for the divergence:** the per-product review-analysis surface ships consequential AI cost (each per-product analysis processes large per-platform corpora at potentially Opus 4.7 pricing; cost-cap enforcement matters more than for W#1's smaller keyword-clustering workloads). The "mirror W#1's cost-cap pattern" framing in the launch prompt + §C.5 contained a factual problem worth recording here: the W#1 cost-cap "module" referenced in §C.5 (pointing to `docs/MODEL_QUALITY_SCORING.md`) does not exist — `MODEL_QUALITY_SCORING.md` is about a stability-score algorithm for keyword clustering, NOT cost caps. Future workstreams reading W#1 precedents should re-verify W#1's actual architecture before mirroring; don't trust launch-prompt summaries of "mirror W#1's Pattern" without re-reading the W#1 doc. **§C.5 will be updated next session to capture W5's actual architecture choices replacing the "mirror W#1" framing.**

**6 design dimensions identified mid-session for next session's planning conversation (per the new memory file):**

1. **Audience & purpose** — who reads the per-product analysis + to what end? (e.g., spot product gaps to inform Brand Vibe Library, share with product team for roadmap decisions, weekly tracking against a baseline)
2. **Sections & topics** — what the analysis covers? (e.g., praise/complaints/quotes vs. things-to-copy/things-to-avoid/pricing-signals vs. JTBD/friction/delight)
3. **Depth & length** — short bullet summary for 10-second scan vs. paragraph-per-section for 1-2 min vs. exhaustive for 5 min?
4. **Perspective & tone** — neutral analyst vs. brand-owner-actionable vs. customer-voice-aggregation?
5. **UI placement** — re-confirm §A.10 (URL detail page below Captured Reviews) or pivot to a tab/sidebar/modal placement?
6. **Interaction** — re-confirm §A.11 (manual button → modal → progress → inline) + §A.12 (stale badge + re-run affordance) or change?

**Affected §A sections (informational — §A is frozen per Rule 18; these are sections the next session's planning conversation will re-confirm or pivot):**

- **§A.7 (model + cost guards)** — re-confirmed by this session's architecture-decision picker outcome (SDK + pre-flight cost-cap + pre-flight token-counter). No pivot needed; just document W5's actual implementation choices in §C.5 next session.
- **§A.8 (adaptive batching)** — implementation now shipped in `batch-sizer.ts` at the ~80K-token budget level. No pivot needed.
- **§A.9 (TipTap output)** — TipTap rendering of the analysis output is shipped at the §C.4 W4 layer (Captured Reviews UI extensions 2026-05-29). v1 per-product prompt's JSON output will be transformed to TipTap server-side per §A.9 spec. **Re-confirmation needed** that the v1 output shape matches the TipTap rendering layer expectations.
- **§A.10 (UI placement — URL detail page below Captured Reviews)** — design dimension #5 above; next session's planning conversation will re-confirm or pivot.
- **§A.11 (manual trigger flow)** — design dimension #6 above; next session's planning conversation will re-confirm or pivot.
- **§A.12 (fingerprint cache)** — implementation now shipped in `cache.ts` at the SHA-256 reviewsHash level. No pivot needed.

**Per Rule 23 Change Impact Audit:** PLOS-SIDE handler + src/lib module surface (new W5 review-analysis primitives + new DI-seam handler + new thin shim route + new dev script + new dependency `@anthropic-ai/sdk`; no schema; no API contract changes since the new route is purely additive; no extension-side changes). No data risk to existing rows (additive only; `ReviewAnalysis` table empty until first live run fires next session). Zero downstream W#1 cross-tool impact.

**Cross-references:**

- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-02 — captures the same outcome from the meta-pattern perspective (NEW reusable Pattern + 5 sub-observations including W5-vs-W#1 architecture divergence + P-43 cwd-leak Pattern Class reproduced ~1-2 more times this session running tally ~20+ + Rule 14f free-text escape-hatch calibration data point).
- `feedback_plan_output_shape_before_building.md` — NEW memory file capturing the meta-pattern; PRIMARY directive for next session's session-start protocol.
- `docs/REVIEWS_PHASE_2_DESIGN.md` §A.7-§A.12 (UX + interaction spec) + §C.5 (implementation outline; will be updated next session to capture W5's actual architecture choices).
- `docs/COMPETITION_SCRAPING_DESIGN.md` — UNCHANGED this session (W5 is PLOS-side AI infrastructure, not extension-side; no cross-reference pointer needed).

**Closing line:** P-49 W5 AI review analysis Session 1 shipped foundation primitives + plumbing handler + thin API route shim + 61 src/lib node:test cases + standalone e2e script + new `@anthropic-ai/sdk` dependency at code level via build commit `04f74cf` on `workflow-2-competition-scraping`. v1 prompt content + UI placement re-confirmation + first live end-to-end run DEFERRED to next session per director's explicit mid-session directive (verbatim) to plan the per-product analysis output shape FIRST. ZERO Rule 9 deploy gates fired (pure BUILD session). 1 Rule 14f picker answered (architecture-decision Yes-to-Recommended) + 1 Rule 14f picker REDIRECTED by director via free-text escape-hatch (output-shape planning). Schema-change-in-flight flag STAYS NO entire session. NEW baseline locked: src/lib `npm test` = **899/899** (+61 cumulative from 838 entry baseline); npm run build = **65 routes** (+1). W5 architecturally diverges from W#1 on the AI-infrastructure axis (W5: SDK + pre-flight cost-cap + pre-flight token-counter; W#1: raw fetch + post-facto cost logging + response-usage token reads) — divergence justified for W5's consequential per-product analysis cost surface; future workstreams reading W#1 precedents should re-verify W#1's actual architecture before mirroring. NEW reusable Pattern memorialized via NEW memory file `feedback_plan_output_shape_before_building.md` — "Plan AI-output shape with director BEFORE writing prompt code, even when launch prompt says ship-and-iterate." Closes (a.101) PARTIALLY; opens (a.102) RECOMMENDED-NEXT = **P-49 W5 Session 1.5 — director-driven planning of the per-product analysis output shape** on `workflow-2-competition-scraping` per the new memory file. **EIGHTH build/deploy-session §B entry per Rule 18 — first W5 entry in this design doc.** The next §B entry will land at the W5 Session 1.5 close (capturing director's planning conversation outcome + the rewrite of `prompts.ts` PLACEHOLDER + first live end-to-end run on a small product corpus).

---

## §B 2026-05-27 — `session_2026-05-27_p49-w5-session-1.5-reviews-phase-3-design-lock` — Workstream 5 Session 1.5 — Reviews Phase 3 design lock (3-table + 7-flow + browser-first execution + 7 v1 prompts + 4-option toggle expansion) + schema enum extension + shared ExecutionModeSelect component SHIPPED at code level via build commit `252e1dd` (6 files +181/-10) on `workflow-2-competition-scraping`; per-batch server endpoint scaffold + `prompts.ts` rewrite + Table 2 page + first live end-to-end run DEFERRED to next W5 session in a deliberately narrow code-mechanics scope cut; NINTH build/deploy-session §B entry per Rule 18 — FIRST W5 Session 1.5 entry; **supersedes §A.10 + §A.11 + §A.12 substantially** (per Rule 18 §A frozen; new locked decisions captured here); NEW reusable Pattern memorialized via NEW memory file `feedback_browser_first_ai_with_server_migration.md`

**Closes (a.102) RECOMMENDED-NEXT** = P-49 W5 Session 1.5 director-driven output-shape planning ✅ DONE 2026-05-27 at code level via build commit `252e1dd`. **Opens (a.103) RECOMMENDED-NEXT** = P-49 W5 Session 2 — per-batch server endpoint scaffold + delete shipped per-product two-sweep handler + rewrite `prompts.ts` with 7 flow-specific builders + start Table 2 page + Per-Review Summarize button + modal + browser batch loop + first live end-to-end run on `workflow-2-competition-scraping`.

**Director-driven Reviews Phase 3 design lock conversation:** at session start director surfaced a comprehensive expansion directive — a much bigger vision than what §A.10/§A.11/§A.12 had locked. The new locked design:

1. **A 4-option toggle at the top of the Competition Scraping page** giving the user access to four surface views (the existing two surfaces + two new tables). Position: at the top of the page above the existing Competitor URLs surface. Locked via Round-1 placement picker (Recommended Yes-to-Yes).

2. **Three brand-new tables** reachable via that toggle:
   - **Table 2 — Competitor Reviews Analysis Table** with per-review nested rows: one outer row per competitor + per-product nested rows + per-review inner-nested rows. Columns include the existing per-review fields (star + title + body + reviewer + date) PLUS new AI-output columns (Per-Review Summarize result + per-competitor comprehensive bulleted + non-bulleted summaries spanning a competitor's products).
   - **Table 3 — By Category** with one row per competitor grouped by Category. **Round 2 row-structure picker REDIRECTED by director via free-text** with *"Thanks for identifying this oversight. I want you to not include the Reviews and Stars columns in these tables"* — Tables 3 + 4 drop Stars + Reviews Summary columns (those columns are per-product not per-competitor-per-grouping; the AI flows on Tables 3 + 4 are comprehensive-per-grouping rather than per-product per-review-aggregation).
   - **Table 4 — By Type** with one row per competitor grouped by Type. Same column structure as Table 3 (Stars + Reviews Summary columns dropped per Round 2 redirect).

3. **Seven AI run flows** across the three tables:
   - **Table 2 (per-review level):** (1) Per-Review Summarize — one AI call per review producing a 1-2 sentence summary for the per-review row.
   - **Table 2 (per-product level):** (2) Per-Competitor-Per-Product Comprehensive (bulleted) + (3) Per-Competitor-Per-Product Comprehensive (non-bulleted) — two AI flows producing per-product comprehensive analyses (the bulleted/non-bulleted split lets the user choose presentation form at run time).
   - **Table 3 (per-category level):** (4) Per-Category Comprehensive (bulleted) + (5) Per-Category Comprehensive (non-bulleted) — same bulleted/non-bulleted split at the Category aggregation level.
   - **Table 4 (per-type level):** (6) Per-Type Comprehensive (bulleted) + (7) Per-Type Comprehensive (non-bulleted) — same split at the Type aggregation level.

4. **Browser-first execution mirroring W#1's existing pattern** — locked via the **mid-planning architectural redirect** from director after Claude had proposed a Vercel-suspend-resume server-side worker pattern to deal with Vercel's per-request time limit. Director surfaced *"If keeping things server-side significantly constrains us, we can run things on the browser side and have the option to move things server-side when things scale up..."* — this redirect pivoted the architecture to W#1's existing pattern at `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx`: a browser-side BatchObj queue + localStorage checkpoint + per-batch server endpoint for the Anthropic call. The browser orchestrates the queue + handles pause/resume/cancel + tracks running cost tally; the server endpoint receives one batch at a time + makes one Anthropic call + returns the result, well within Vercel's per-request time limit. **NEW reusable Pattern memorialized in NEW memory file `feedback_browser_first_ai_with_server_migration.md`** — "Default new AI batch flows to browser-side execution (W#1's existing pattern); add execution-mode dropdown now for seamless future server-side migration; mirror dropdown into W#1's existing modal at the same time so both workflows can migrate together."

5. **Execution-mode dropdown** added NOW to all future modals — a controlled `<select>` exposing two options: Browser (default; Recommended) + Server (future). The Server option's wiring is deferred until W#2 hits production scale that necessitates server-side migration off Vercel; the dropdown is in place now so the future migration is a label flip + endpoint swap rather than a UI refactor. Mirror the dropdown into W#1's existing AutoAnalyze modal at the same time so both workflows can migrate together. (W#1 AutoAnalyze refactor DEFERRED to opportunistic future session when AutoAnalyze.tsx is being touched anyway; today's scope cut skipped this to avoid mid-build edits to W#1's working modal.)

6. **Seven v1 prompts drafted + locked** during the planning conversation — flat-bullet structured / third-person neutral analyst tone / soft length targets / echoed IDs for redundancy. Prompt content drafted in conversation; rewrite into `src/lib/competition-scraping/review-analysis/prompts.ts` DEFERRED to next W5 session (the prompts.ts PLACEHOLDER from W5 Session 1 stays until next session's rewrite).

7. **No cost caps** — locked via the **Round 3 cost-caps picker REDIRECTED by director via free-text** with *"I don't want any caps"*. Existing §A.7 cost-cap framing is now reduced to **transparency only**: pre-flight cost estimate displayed in the modal before the user starts a run + running cost tally during the run; both are informational only with no enforcement. The `cost-cap.ts` module from W5 Session 1 stays in place at code level but its caps default to effectively infinite for the new flows (per-flow caps + per-Project monthly caps both unenforced); the module is preserved for any future flows that DO need enforcement.

8. **One flow at a time per Project** — locked via Round-4 concurrency picker (Recommended Yes-to-Yes). Cells lock with a pending badge during a run; pause = preserve cells + resume from cursor; cancel = keep partial.

9. **Excel export / drag-reorder / click-to-edit / show-hide columns** — all locked as Table-feature scope across all 3 new tables (and existing Captured Reviews surface as a tail extension where applicable). Implementation deferred to opportunistic future W5 sessions (most are mechanical; @dnd-kit + xlsx libraries already in use elsewhere).

**~20 Rule 14f forced-pickers fired across the planning conversation:**

- Rounds 1-5 design-lock pickers (placement / row structure / cost caps / concurrency / + others) — 16 answered Yes-to-Recommended + 2 free-text redirects (Round 2 + Round 3) + 1 final go/no-go.
- 1 final summary picker = director re-confirmed the locked design summary.
- 1 export-columns sub-picker for Tables 3 + 4 (answered Yes-to-Recommended).
- **19/19 = 100% Yes-to-Recommended on the pickers answered + 2 free-text redirects** (positive calibration data points for Rule 14f's free-text escape-hatch design — both redirects produced superior outcomes vs the offered picker options).

**Code mechanics — deliberately narrow scope cut:**

After design lock, Claude proposed a much broader code-mechanics scope (per-batch endpoint scaffold + prompts.ts rewrite + Table 2 page start + W#1 AutoAnalyze refactor) but **director's directive to cleanly close this session** at the design-lock + small-shippable-code-mechanics boundary led to the scope cut. Today's build commit covered ONLY:

- **MODIFY `prisma/schema.prisma`** — `ReviewAnalysisLevel` enum extended with `PER_REVIEW` + `PER_CATEGORY`; comment block rewritten to document all 5 values (PER_REVIEW + PER_PRODUCT + PER_CATEGORY + PER_TYPE + CROSS_EVERYTHING) mapped to the 7 flows. `npx prisma db push` completed cleanly in 1.19s (additive only; zero data loss; **schema-change-in-flight flag FLIPPED NO → YES** at completion).
- **MODIFY `src/lib/shared-types/competition-scraping.ts`** — `ReviewAnalysisLevel` union widened to all 5 values + `isReviewAnalysisLevel` validator narrowed against all 5 values + comment block expanded to document the 7-flow mapping.
- **MODIFY `src/lib/competition-scraping/handlers/review-analysis-run.ts`** — `ReviewAnalysisRow.level` union widened to all 5 values to keep tsc green (the W5 Session 1 handler is scheduled for replacement by the per-batch endpoint in next W5 session; widening the union here is a stop-gap for type-safety during this session's build commit only).
- **NEW `src/lib/workflow-components/execution-mode.ts`** — type + constants + `isExecutionMode` validator. Browser/server mode labels match W#1's verbatim text at `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` lines 2094-2099 (Claude grep'd W#1's source for the exact label strings to ensure future migration is text-perfect).
- **NEW `src/lib/workflow-components/execution-mode-select.tsx`** — controlled `<select>` React component for modal consumption (W#2's future modals + future W#1 refactor).
- **NEW `src/lib/workflow-components/execution-mode.test.ts`** — 7 node:test cases pinning labels to W#1's verbatim text + validator semantics (so any drift in W#1's labels would fail the W#2-side test).

**Scoreboard verification:**

| Check | Pre-build (entry) | Post-build (new baseline) | Delta |
|---|---|---|---|
| Root tsc clean | ✅ | ✅ | unchanged |
| Extension tsc clean | ✅ | ✅ | unchanged |
| Extension `npm test` | 910/910 | 910/910 | UNCHANGED |
| src/lib `node:test` | 899/899 | **906/906** | **+7 — exact match with 7 new cases in `execution-mode.test.ts`** |
| `npm run build` routes | 65 | 65 | UNCHANGED |
| Check 6 Playwright | SKIPPED per Rule 27 | SKIPPED per Rule 27 | unchanged |

**NEW baseline locked from this session:** src/lib `node:test` = **906/906** (+7 from 899); routes = **65 UNCHANGED**; extension = **910/910 UNCHANGED**.

**Schema-change-in-flight transition:**

- Entry: NO (carrying from W5 Session 1 which kept it NO)
- Mid-session: NO → YES at `npx prisma db push` completion (PER_REVIEW + PER_CATEGORY enum values added)
- Exit: YES (stays YES until next W5 deploy session ff-merges to main + Vercel auto-redeploys)

**§A sections superseded by this entry (per Rule 18 §A is frozen; the new locked decisions live here):**

- **§A.10 "UI surfaces"** — original locked decision was per-product analysis on the URL detail page below Captured Reviews + per-Type and cross-everything on the existing Comprehensive Competitor Analysis page. Superseded: the 4-option toggle + 3 brand-new tables (Table 2 / Table 3 / Table 4) become the new surface. Future build sessions touching the per-product analysis UI should reference §B 2026-05-27 for the new locked surface, NOT §A.10. The existing Comprehensive Competitor Analysis page from P-46 W4 is unaffected by this supersedence (it remains the home for any P-46-era surfaces; the new W5 tables live separately under the new toggle).
- **§A.11 "Interaction model"** — original locked decision was manual button + model dropdown + cost preview modal. Superseded: the modal now also includes the new execution-mode dropdown (Browser default / Server future) + the cost preview is now transparency-only (no enforcement) per §A.7 supersedence. Pause/resume/cancel semantics are NEW (locked at Round-4 concurrency picker): cells lock with pending badge during run; pause preserves cells + resumes from cursor; cancel keeps partial. Future build sessions touching the run-modal UI should reference §B 2026-05-27 for the new locked interaction model.
- **§A.12 "Cache + freshness"** — original locked decision was a fingerprint cache (review-IDs + model version) + "out of date" badge + explicit re-run. Superseded for the new flows: cache is now per-flow not just per-product (each of the 7 flows produces its own ReviewAnalysis row keyed by level + projectId + competitorId + optional categoryId/typeId); the cache.ts module from W5 Session 1 stays in place at code level but its keyspace expands to all 5 enum values. Future build sessions touching cache invalidation should reference §B 2026-05-27 for the expanded keyspace.
- **§A.7 "Cost caps"** — original locked decision was per-run + per-Project monthly caps with enforcement. Superseded: caps are now **transparency-only** (pre-flight estimate + running tally displayed; no enforcement) per Round 3 free-text redirect. The `cost-cap.ts` module from W5 Session 1 stays in place at code level but its enforcement defaults to effectively infinite for the new flows.

**TaskList sweep this session (Rule 26):** 14 tasks created across the session — 8 completed (planning + verification + schema + ExecutionModeSelect + scope cut decision); 4 marked `DEFERRED:` with destinations noted per `feedback_deferred_items_registry.md` registry pattern:

- **DEFERRED: Per-batch server endpoint scaffold** → next session (a.103)
- **DEFERRED: Rewrite prompts.ts with 7 v1 prompt builders** → next session (a.103)
- **DEFERRED: Refactor W#1 AutoAnalyze to use shared ExecutionModeSelect** → future opportunistic session (when AutoAnalyze.tsx is being touched anyway; today's scope cut skipped this to avoid mid-build edits to W#1's working modal)
- **PENDING: Update REVIEWS_PHASE_2_DESIGN.md §B with new locked decisions** → handled by this doc-batch (this §B 2026-05-27 entry IS that update)

ZERO open `DEFERRED:` items at session end after this doc-batch lands.

**Per Rule 23 Change Impact Audit:** PLOS-SIDE schema + handler + src/lib module surface (schema enum extension — additive only, zero data loss + handler row type widening + new shared ExecutionModeSelect component module). No data risk to existing rows (additive only; existing PER_PRODUCT / PER_TYPE / CROSS_EVERYTHING enum values untouched; ReviewAnalysis table empty pending first live run). Zero downstream W#1 cross-tool impact (the new shared component lives at `src/lib/workflow-components/`; W#1's existing modal at AutoAnalyze.tsx UNCHANGED this session — refactor to consume shared component DEFERRED to opportunistic future session).

**Cross-references:**

- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-27 — captures the same outcome from the meta-pattern perspective (NEW reusable Pattern + 4 sub-observations including the Rule 14f free-text escape-hatch calibration data point + the P-43 cwd-leak Pattern Class reproduction running tally ~22+ + the supersedence of §A.10/§A.11/§A.12).
- `feedback_browser_first_ai_with_server_migration.md` — NEW memory file capturing the meta-pattern; PRIMARY directive for next W5 session's per-batch endpoint scaffold + browser batch loop implementation.
- `feedback_plan_output_shape_before_building.md` — predecessor memory file from W5 Session 1 2026-06-02; the planning conversation today executed the protocol from that memory file.
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-27 — extension-side cross-reference pointer entry (one-line pointer to this §B 2026-05-27 per Rule 18 cross-doc precedent).
- §B 2026-06-02 above — W5 Session 1 foundation primitives + plumbing handler entry; today's Session 1.5 design lock + schema enum extension + shared ExecutionModeSelect builds on that foundation.

**Closing line:** P-49 W5 Session 1.5 Reviews Phase 3 design lock + schema enum extension + shared ExecutionModeSelect component shipped at code level via build commit `252e1dd` (6 files +181/-10) on `workflow-2-competition-scraping`. Design lock covers 3-table + 7-flow + browser-first execution + 7 v1 prompts + 4-option toggle expansion via ~20 Rule 14f forced-pickers (19/19 = 100% Yes-to-Recommended on pickers answered + 2 free-text redirects). Mid-planning architectural redirect from server-side worker pattern to W#1's browser-first execution pattern memorialized as NEW reusable Pattern via NEW memory file `feedback_browser_first_ai_with_server_migration.md`. Schema enum `ReviewAnalysisLevel` extended with PER_REVIEW + PER_CATEGORY; schema-change-in-flight flag FLIPPED NO → YES mid-session at `npx prisma db push` completion; STAYS YES until next W5 deploy session. ZERO Rule 9 deploy gates fired this session (pure BUILD session). NEW baseline locked: src/lib `node:test` = **906/906** (+7); routes UNCHANGED at 65; extension UNCHANGED at 910/910. **Supersedes REVIEWS_PHASE_2_DESIGN.md §A.10 + §A.11 + §A.12 substantially** per Rule 18 (§A frozen; new locked decisions captured here in §B 2026-05-27). Closes (a.102) RECOMMENDED-NEXT = P-49 W5 Session 1.5 director-driven output-shape planning ✅ DONE 2026-05-27. Opens (a.103) RECOMMENDED-NEXT = **P-49 W5 Session 2 — per-batch server endpoint scaffold + delete shipped per-product two-sweep handler + rewrite `prompts.ts` with 7 flow-specific builders + start Table 2 page + Per-Review Summarize button + modal + browser batch loop + first live end-to-end run** on `workflow-2-competition-scraping`. **NINTH build/deploy-session §B entry per Rule 18 — FIRST W5 Session 1.5 entry in this design doc.** The next §B entry will land at the W5 Session 2 close (capturing per-batch endpoint scaffold + 7 flow-specific prompts + Table 2 page start + first live end-to-end run on a small product corpus).

---

## §B 2026-05-27-b — `session_2026-05-27-b_p49-w5-session-2-deploy-and-catchup-doc-batch` — Workstream 5 Session 2 — per-batch endpoint scaffold + Per-Review Summarize end-to-end ✅ DEPLOYED-AND-VERIFIED 2026-05-27 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — initial build commit `60609f6` (12 files +2975/-1267) + 3 fix-forward commits (FF#1 `ecf292d` Table 2 response-shape unwrap / FF#2 `d713712` in-modal View prompts panel for AI transparency / FF#3 `cd6478b` v2 bulleted-critical prompt + cache-key version bump + Table 2 whiteSpace pre-wrap) all ff-merged to main under 4 Rule 9 deploy gates within ONE Phase 4 verification day — TENTH build/deploy-session §B entry per Rule 18 — this entry is special because it covers BOTH the prior unrecorded session's W5 Session 2 build + deploy + 3 FF cascade AND this catch-up doc-batch session that retroactively executes the missing §4 Step 1 doc-batch protocol; **supersedes §A.13 prompt content AND the §B 2026-05-27 line-1474 reference to "7 v1 prompts locked during planning"** — the v2 bulleted-critical format shipped today (FF#3) replaces both per Rule 18 (§A frozen; supersedence captured in §B only); THREE NEW reusable Patterns memorialized (v1 → v2 prompt-version-bump + cache-key-versioning Pattern from FF#3 + in-modal View prompts panel UI transparency Pattern from FF#2 + Rule 14f scope-narrowing Pattern from W5 Session 2's start where 7-flow attempt narrowed to Per-Review only)

**Closes (a.103) RECOMMENDED-NEXT** = P-49 W5 Session 2 — per-batch server endpoint scaffold + Per-Review Summarize end-to-end ✅ DEPLOYED-AND-VERIFIED 2026-05-27. **Opens (a.104) RECOMMENDED-NEXT** = P-49 W5 Session 3 — rewrite remaining 6 of 7 flow builders into `prompts.ts` + start Tables 3 + 4 (By Category + By Type) per §B 2026-05-27 design lock + add their AI run buttons + modals + browser batch loops + first live e2e runs on those 6 flows on `workflow-2-competition-scraping`.

**Two-session structure of this entry:**

- **The 168th Claude session (unrecorded; PROCESS-GAP / RETROACTIVE RECONSTRUCTION)** — ran W5 Session 2 build + 3 fix-forwards + Phase 4 PASS + deploy + 4 Rule 9 deploy gates fired; ended without running the canonical end-of-session §4 Step 1 doc-batch protocol. Reconstructed from commit messages + git timestamps (commits `60609f6` 2026-05-27 18:08:43 / `ecf292d` 18:19:04 / `d713712` 18:30:25 / `cd6478b` 18:47:34). The commit messages themselves are rich + exhaustive (build commit contains 12-file diff narrative + 7-flow architecture rationale + Rule 14f scope-narrow rationale + W#1 mirror reference + per-commit scoreboard; FF commits contain per-FF root cause + fix narrative + version history; all preserved here).
- **The 169th Claude session (this catch-up doc-batch)** — ran the missing doc-batch + push only; ZERO code changes; 2 Rule 14f forced-pickers fired (initial "catch-up vs skip vs other" + §4 Step 1c next-task picker) both director-Yes-to-Recommended; ZERO Rule 9 deploy gates fired this session itself.

**Build commit `60609f6` (12 files +2975/-1267) carrying:**

- **NEW `src/lib/competition-scraping/handlers/review-analysis-run-batch.ts`** — per-batch handler with cache lookup + ONE Anthropic call per batch + reviewId alignment validation + N PER_REVIEW row persistence; 7 SUPPORTED_FLOWS registry (Per-Review Summarize / Per-Competitor-Per-Product Comprehensive bulleted+non-bulleted / Per-Category Comprehensive bulleted+non-bulleted / Per-Type Comprehensive bulleted+non-bulleted) with 1 SHIPPED_FLOWS today (Per-Review Summarize); each call well under Vercel's per-request time limit (no more two-sweep server orchestration); one AI call per BATCH not per review (10-100× cost savings + prompt-cache hits); echoed reviewId defends against drops / reorders / merges / hallucinated ids; cache key per-review = SHA-256(reviewId|modelVersion); cache hits skip AI call entirely.
- **NEW `review-analysis-run-batch.test.ts`** — 21 new node:test cases covering the handler + cache lookup + alignment validation + persistence + error paths.
- **NEW thin API route shim at `src/app/api/projects/[projectId]/competition-scraping/review-analysis/run-batch/route.ts`** — wires prod Anthropic client + Prisma + auth.
- **NEW Table 2 page at `src/app/projects/[projectId]/competition-scraping/competitor-reviews-analysis/page.tsx`** (614 LOC) — Competitor Reviews Analysis Table with per-review nested rows + Summarize button per the design lock from §B 2026-05-27.
- **NEW `PerReviewSummarizeModal.tsx`** (530 LOC) — modal + browser batch loop mirroring W#1's AutoAnalyze.tsx at `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx`; consumes the shared ExecutionModeSelect component from W5 Session 1.5; browser orchestrates the queue + cost tally + pause/cancel; per-batch server endpoint receives one batch + makes one Anthropic call + persists N PER_REVIEW rows + returns to browser.
- **NEW `CompetitionScrapingSurfaceNav.tsx`** (130 LOC) — 4-option toggle: Competitor URLs / Comprehensive Analysis / Competitor Reviews Analysis / By Category-Type [disabled until Sessions 3+ ship Tables 3 + 4] per the §B 2026-05-27 design lock.
- **DELETE `src/lib/competition-scraping/handlers/review-analysis-run.ts`** + its test file (the W5 Session 1 + 1.5 two-sweep handler — replaced wholesale by the per-batch endpoint).
- **DELETE the corresponding `/run/route.ts` thin shim** — replaced by the new `/run-batch/route.ts`.
- **MODIFY `src/lib/competition-scraping/review-analysis/prompts.ts`** — PLACEHOLDER per-product two-sweep prompts from W5 Session 1 removed; replaced with `PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT` + `buildPerReviewBatchUserMessage` + `validatePerReviewBatchOutput` + `findReviewIdMismatch`; v1 prompt director-confirmed at session start before any code lands per `feedback_plan_output_shape_before_building.md`.
- **MODIFY `prompts.test.ts`** — 11 cases for v1 prompt + validator + reviewId-mismatch detector.
- **MODIFY existing Competition Scraping + Comprehensive Analysis pages** to wire the surface nav.

**Architecture (per §B 2026-05-27 + `feedback_browser_first_ai_with_server_migration.md`):** browser orchestrates queue + cost tally + pause/cancel; per-batch server endpoint receives one batch + makes one Anthropic call + persists N PER_REVIEW rows + returns to browser. Each call well under Vercel's per-request time limit. One AI call per BATCH not per review. Cost caps now transparency-only per §B 2026-05-27 Round 3 free-text redirect (no enforcement).

**Session scope (W5 Session 2 narrowed at session start from 7-flow attempt to Per-Review only end-to-end via Rule 14f scope picker, Option A Recommended):** rationale = the 7 v1 prompt drafts from yesterday-morning's W5 Session 1.5 planning conversation were NOT preserved in any docs (only the meta-style was captured); per `feedback_plan_output_shape_before_building.md` the other 6 prompts each need their own director-input round to lock content; validating one flow live > shipping 7 flows half-baked.

**FF#1 `ecf292d` (1 file +8/-4) — Table 2 page response-shape unwrap:**

Phase 4 verification on vklf.com surfaced "No competitor URLs in this Project" empty-state on the new `/competitor-reviews-analysis` page despite the Project having captured competitor URLs. **Root cause:** the new page expected `{ items: CompetitorUrl[] }` from GET `/urls` and `{ items: CapturedReview[] }` from GET `/urls/[urlId]/reviews`. Both endpoints actually return the bare `CompetitorUrl[]` / `CapturedReview[]` array directly (consistent with the existing CompetitionScrapingViewer's shape; see `src/lib/competition-scraping/handlers/urls.ts:164` + `url-reviews.ts:145` — both return wire arrays via `body: wire`). **Fix:** unwrap both fetch handlers to parse the bare array. Two-line correction. No test changes (server-side handler tests still pass; the bug was in the client-side fetch parsing, exercised by Phase 4 real-Chrome verification not by node:test).

**FF#2 `d713712` (2 files +143/-6) — in-modal "View prompts" panel for AI transparency:**

Director's Phase 4 verification surfaced a transparency gap — they could fire the Per-Review Summarize batch loop but had no way to see what was being sent to Claude. The v1 modal showed config (model + batch size + execution mode) + progress (cost tally + cache hits) but NOT the actual system prompt or user message. **Fix-forward:** expandable "View prompts" panel inside the modal, collapsed by default. Shows: system prompt — verbatim PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT (the cached prefix); user message — first-batch preview built via `buildPerReviewBatchUserMessage` using the actual loaded review data (real product name + platform + review bodies + echoed reviewIds for Batch 1 of N); footer note explaining subsequent batches reuse the same shape with different reviews. **Implementation details:** `prompts.ts` is already client-importable (its only import is `import type { BatchableReview }` — pure type, no runtime dep on Anthropic SDK / Node crypto); modal API widened to take the full `reviews: CapturedReview[]` array (instead of just `reviewIds: string[]`) plus `platform: string`; internal reviewIds derive via useMemo so the batch loop's wire shape is unchanged; parent Table 2 page passes the full reviews array + url.platform through. No server-side changes — purely a client-side UI addition.

**FF#3 `cd6478b` (5 files +80/-17) — v2 per-review prompt (bulleted critical-only) + cache-key version bump:**

Director's Phase 4 verification of FF#2 surfaced a content-shape redirect — the v1 prompt asked for 1-2 sentence plain-prose third-person neutral summaries, but the actual signal a brand-owner needs is a flat-bullet list of critical signals with filler stripped out. v1 was generating correctly-formed JSON with neutral prose, but the prose form was burying the load-bearing facts under filler the reviewer themselves had dismissed.

**Fix-forward:** v1 → v2 prompt rewrite + cache-key version bump + UI line-break rendering.

- **v2 prompt shape (`prompts.ts`):** "summary" field becomes a string of newline-separated bullets (`"- bullet\n- bullet"`); each bullet is one short sentence (one main idea) starting with `"- "`; include ONLY critical info (reviewer's main stance + strongest specific claim/complaint/praise/use case/experience pattern); LEAVE OUT non-critical filler (parenthetical asides + mild observations the reviewer themselves dismissed + generic positive/negative comments not tied to a specific signal + repeated points); range: typically 1-4 bullets; reviews with no critical signal emit single bullet `"- (no critical signal)"`; third-person neutral analyst voice + product name when relevant + sparing short-fragment quotes + verbatim reviewId echo — all retained from v1.
- **Cache-key version bump (`review-analysis-run-batch.ts`):** NEW `PER_REVIEW_SUMMARIZE_PROMPT_VERSION = 'v2'` constant (with version history comment block: v1 retired same day after Phase 4 redirect; v2 current); per-review cache hash extended from `modelVersion` to `${modelVersion}|${PER_REVIEW_SUMMARIZE_PROMPT_VERSION}` so v1's cached summaries don't get served stale when v2 is requested; no DB schema change — prompt-version drift is implicit in the hash itself; the per-review cache row still persists just modelVersion (which is what the schema column tracks).
- **UI rendering (`page.tsx` Table 2):** adds `whiteSpace: 'pre-wrap'` to the summary cell so the bullet `"\n"`s render as line breaks instead of running together.
- **Test updates:** `prompts.test.ts` old "1-2 sentences" tripwire replaced with v2 assertions (bulleted list + critical + LEAVE OUT filler + no critical signal); NEW negative test asserts v1 phrasings ("1-2 sentences" / "No bullets" / "Plain prose") are NOT present to defend against accidental partial revert during future iterations; NEW positive test pins PROMPT_VERSION to 'v2' so any future bump triggers an intentional update of the history comment block; `review-analysis-run-batch.test.ts` two cache-hit tests updated to compute the hash with the new composite `${modelVersion}|${PER_REVIEW_SUMMARIZE_PROMPT_VERSION}` key — mirrors the handler's cache lookup so the test coverage stays valid.

**Scoreboard verification (just-run at catch-up doc-batch entry; post-FF#3 working tree; 5/5 GREEN):**

| Check | Pre-build (entry — from W5 Session 1.5 close) | Post-FF#3 (new baseline) | Delta |
|---|---|---|---|
| Root tsc clean | ✅ | ✅ | unchanged |
| Extension tsc clean | ✅ | ✅ | unchanged |
| Extension `npm test` | 910/910 | **910/910** | UNCHANGED |
| src/lib `node:test` | 906/906 | **922/922** | **+16 net (+21 new per-batch handler tests, -14 deleted old run handler tests, +6 net new prompts tests in initial build, +5 net through FF cascade)** |
| `npm run build` routes | 65 | **66** | **+1 (new `/competitor-reviews-analysis` Table 2 page; new `/run-batch/route.ts` API replaced the deleted `/run/route.ts` net 0 on API routes)** |
| Check 6 Playwright | SKIPPED per Rule 27 | SKIPPED per Rule 27 | unchanged |

**NEW baselines locked from this session:** src/lib `node:test` = **922/922** + `npm run build` = **66 routes** + extension `npm test` = **910/910 UNCHANGED**.

**Schema-change-in-flight transitions:**

- Entry of unrecorded W5 Session 2 session: YES (carrying PER_REVIEW + PER_CATEGORY enum values from W5 Session 1.5's `npx prisma db push`).
- FLIPPED YES → NO at the W5 Session 2 initial deploy push completion (canonical schema-change-ships-to-production transition).
- STAYS NO through the 3 FFs (no schema work).
- Final state at catch-up doc-batch entry: NO.

**§A sections superseded by this entry (per Rule 18 §A frozen; supersedence captured in §B only):**

- **§A.13 "Schema model"** — original locked decision was a ReviewAnalysis model with `level` enum {PER_PRODUCT, PER_TYPE, PER_PROJECT} + a single AI call per analysis level. Already superseded by §B 2026-05-27 (W5 Session 1.5 enum extension to 5 values + 7-flow surface); today's §B 2026-05-27-b further refines the prompt content per-flow — the v2 bulleted-critical format shipped today for the Per-Review flow replaces the original prose-summary framing locked at §A.13. Future workstreams reading §A.13 should always cross-check §B 2026-05-27-b for the v2 prompt format + cache-key versioning Pattern.
- **§B 2026-05-27 line-1474 reference to "Seven v1 prompts drafted + locked during the planning conversation — flat-bullet structured / third-person neutral analyst tone / soft length targets / echoed IDs for redundancy. Prompt content drafted in conversation; rewrite into `src/lib/competition-scraping/review-analysis/prompts.ts` DEFERRED to next W5 session"** — superseded by today's W5 Session 2 work: the 7 v1 prompt content was NOT preserved anywhere (only the meta-style was captured); W5 Session 2 narrowed scope to 1 flow + locked v1 + Phase-4-redirected to v2; the v2 bulleted-critical format shipped today for the Per-Review flow IS the canonical reference; the other 6 flows each need their own director-input prompt-content round in W5 Session 3+.

**THREE NEW reusable Patterns memorialized (see CORRECTIONS_LOG §Entry 2026-05-27-b sub-observations b/c/d for full Pattern descriptions):**

1. **"Prompt-version-bump + cache-key versioning pattern"** (sub-observation b) — when a prompt template changes semantically, bump a `PROMPT_VERSION` constant + include it in the cache hash to prevent stale-cached responses against the new prompt; pair with a test that pins the value so future bumps trigger intentional history-comment updates; applies to all future AI batch flows.
2. **"AI-batch modals ship an expandable 'View prompts' panel by default"** (sub-observation c) — expandable panel inside the modal showing verbatim system prompt + first-batch user message preview built from actual loaded data; without this, director's Phase 4 review can't validate prompt content vs. behavior; applies to all future AI-batch modals on PLOS.
3. **"Rule 14f scope-narrowing pattern for prior-locked-meta-style-only design carry"** (sub-observation d) — when prior planning locked N flows but only meta-style was preserved (not flow-by-flow content), narrow scope to 1 flow + force per-flow director-input rounds for the remaining N-1; validating one flow live > shipping N flows half-baked.

**TaskList sweep this session (Rule 26):** 6 in-session tasks for the catch-up doc-batch; all completed; ZERO open `DEFERRED:` tasks at session end; ZERO open `in_progress` tasks at session end; W5 Session 3 IS the next-session task per (a.104), not a Claude-defer.

**Per Rule 23 Change Impact Audit:** ZERO code surface touched this catch-up doc-batch session — doc edits only. The 4 work commits were authored in the prior unrecorded session and are already on main; this session adds only the doc-batch commit. No data risk; no API contract changes; no schema work.

**Cross-references:**

- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-27-b — captures the same outcome from the meta-pattern perspective (process-gap meta-pattern as positive learning opportunity + 3 NEW reusable Patterns + P-43 cwd-leak reproduction running tally ~24+ + operational notes on UNCHANGED Group B docs).
- `feedback_browser_first_ai_with_server_migration.md` — predecessor memory file from W5 Session 1.5 2026-05-27 governing this session's execution architecture (browser-first batch loop + per-batch server endpoint); today's W5 Session 2 successfully executed against that architecture spec.
- `feedback_plan_output_shape_before_building.md` — predecessor memory file from W5 Session 1 2026-06-02; today's Rule 14f scope-narrowing Pattern is the natural successor — that Pattern said plan shape with director BEFORE writing code; this new Pattern says when shape is locked but content of N items isn't, narrow to 1 + force per-item content rounds on the rest.
- §B 2026-05-27 above (W5 Session 1.5 design lock) — predecessor entry; this entry's per-batch endpoint + Per-Review flow ARE the canonical implementation of the design locked there.
- §B 2026-06-02 above (W5 Session 1 foundation) — earliest W5 §B entry; today's per-batch endpoint replaces the two-sweep handler that W5 Session 1 shipped (handler + its test file + thin shim deleted in `60609f6`).
- `docs/COMPETITION_SCRAPING_DESIGN.md` — UNCHANGED this session (W5 is PLOS-side AI infrastructure; commit set touched only `src/lib/` + `src/app/` files, no `extensions/` files; no cross-reference pointer entry needed per W5 Session 1 2026-06-02 precedent).

**Closing line:** P-49 W5 Session 2 per-batch endpoint scaffold + Per-Review Summarize end-to-end ✅ DEPLOYED-AND-VERIFIED 2026-05-27 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — initial build commit `60609f6` (12 files +2975/-1267) + 3 fix-forward commits (FF#1 `ecf292d` Table 2 response-shape unwrap / FF#2 `d713712` in-modal View prompts panel for AI transparency / FF#3 `cd6478b` v2 bulleted-critical prompt + cache-key version bump + Table 2 whiteSpace pre-wrap) all ff-merged to main under 4 Rule 9 deploy gates within ONE Phase 4 verification day. Per-Review flow shipped + Phase-4-verified is now the canonical pattern; Sessions 3+ reuse the per-batch endpoint shape with grouping shape + prompt flow changing. Schema enum `ReviewAnalysisLevel` already in production from the W5 Session 2 initial deploy push (PER_REVIEW + PER_CATEGORY enum values shipped); schema-change-in-flight flag FLIPPED YES → NO at the initial deploy push completion. THREE NEW reusable Patterns memorialized (v1 → v2 prompt-version-bump + cache-key-versioning + in-modal View prompts panel UI transparency + Rule 14f scope-narrowing). **Supersedes §A.13 prompt content + the §B 2026-05-27 line-1474 reference to "7 v1 prompts locked during planning"** per Rule 18 (§A frozen; supersedence captured in §B only). NEW baselines locked: src/lib `node:test` = **922/922** + `npm run build` = **66 routes** + extension `npm test` = **910/910 UNCHANGED**. Closes (a.103) RECOMMENDED-NEXT = P-49 W5 Session 2 ✅ DEPLOYED-AND-VERIFIED 2026-05-27. Opens (a.104) RECOMMENDED-NEXT = **P-49 W5 Session 3 — rewrite remaining 6 of 7 flow builders into `prompts.ts` + start Tables 3 + 4 (By Category + By Type) per §B 2026-05-27 design lock + add their AI run buttons + modals + browser batch loops + first live e2e runs on those 6 flows** on `workflow-2-competition-scraping`. **TENTH build/deploy-session §B entry per Rule 18 — second W5 deploy entry in this design doc; first to ship live AI batch processing end-to-end on production.** The next §B entry will land at the W5 Session 3 close (capturing the remaining 6 flow builders + Tables 3 + 4 + first live e2e runs on those 6 flows).

---

## §B 2026-05-27-c — `session_2026-05-27-c_p49-w5-session-3-per-competitor-deploy-and-2-ff-cycles` — Workstream 5 Session 3 — Per-Competitor Comprehensive (bulleted) flow ✅ DEPLOYED-AND-VERIFIED 2026-05-27-c end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — initial build commit `b9d232e` (10 files +1481/-45) + 2 fix-forward commits (FF#1 `1cd6e3b` 10 files +1678/-106 bundling FOUR Phase 4 redirects / FF#2 `7f19aca` 4 files +135/-39 bundling TWO Phase 4 redirects) all ff-merged to main under 3 Rule 9 deploy gates within ONE Phase 4 verification day — ELEVENTH build/deploy-session §B entry per Rule 18 — first of 3 remaining aggregation flows from §B 2026-05-27 design lock shipped + Phase-4-verified live end-to-end; Per-Competitor flow now CANONICAL for the remaining 2 aggregation flows (Per-Category + Per-Type) which will reuse the validated v3 critique-theme-emergent prompt shape + the per-batch handler's flow-dispatch architecture; THREE NEW reusable Patterns memorialized ("Same-day Phase 4 multi-redirect bundling Pattern" + "Edit affordance for cached AI output Pattern" + "Test stub level-discriminator filtering Pattern"); director Phase 4 PASS verdict on FF#2 confirms theme-emergent prompt + completion banner across both modals.

**Closes (a.104) RECOMMENDED-NEXT** = P-49 W5 Session 3 Per-Competitor flow ✅ DEPLOYED-AND-VERIFIED 2026-05-27-c. **Opens (a.105) RECOMMENDED-NEXT** = **P-49 W5 Session 4 — Per-Category Comprehensive (bulleted) flow + NEW "By Category-Type" page (Table 3 scaffold)** on `workflow-2-competition-scraping`. Reuses the validated v3 critique-theme-emergent prompt shape from today + the per-batch handler's flow-dispatch architecture. NEW work: new By Category-Type page (enables the disabled 4th toggle option from W5 Session 2's `CompetitionScrapingSurfaceNav.tsx`), Per-Category prompt builder, Per-Category modal, browser loop adapted for category-grouping.

**Build commit `b9d232e` (10 files +1481/-45) carrying:**

- **NEW prompt builders in `src/lib/competition-scraping/review-analysis/prompts.ts`** for the Per-Competitor Comprehensive (bulleted) flow — `PER_COMPETITOR_BULLETED_PROMPT_VERSION = 'v1'` constant + `PER_COMPETITOR_BULLETED_SYSTEM_PROMPT` + `buildPerCompetitorBatchUserMessage` + `validatePerCompetitorBatchOutput`. **+8 new node:test cases** for the v1 prompt + validator.
- **Per-batch handler dispatch branch for `per-competitor-bulleted` flow in `review-analysis-run-batch.ts`** — one AI call per URL (each URL's full review corpus passed as one batch; raw review bodies passed directly per the Rule 14f input-strategy picker outcome — direct one-shot not map-reduce) + one PER_PRODUCT row persisted per URL with the flow's prompt-version embedded in the cache hash. **+6 new node:test cases** for the dispatch branch.
- **NEW `PerCompetitorSummarizeModal.tsx`** — modal + per-URL batch loop mirroring W5 Session 2's `PerReviewSummarizeModal.tsx` but with per-URL granularity instead of per-review granularity. Same View prompts panel Pattern from W5 Session 2's FF#2 shipped from the start (not waiting for Phase 4 to surface the gap).
- **NEW button on Table 2 page** (per-URL row) "Summarize competitor" + **NEW `CompetitorSummaryBanner` component** rendering the persisted PER_PRODUCT summary inline below the URL row.

**FF#1 `1cd6e3b` (10 files +1678/-106) — FOUR Phase 4 redirects bundled into ONE commit + ONE deploy gate** — FIRST canonical demonstration of the NEW "Same-day Phase 4 multi-redirect bundling Pattern":

- **(a) v1→v2 prompt rewrite** — drop positive signals + use cases entirely; critique-only with 4 fixed theme headings (Product / Fulfillment / Company-seller / Other notable). `PER_COMPETITOR_BULLETED_PROMPT_VERSION` bump v1→v2 + cache-key versioning (reusing the Pattern from W5 Session 2's FF#3 `cd6478b`). **+1 net new prompt test case** asserting v2 phrasing + asserting v1 phrasing absent.
- **(b) NEW global "Summarize Reviews for All Competitors" button + NEW `GlobalCompetitorSummarizeModal.tsx` (606 LOC)** — sequential browser loop iterating URLs with ≥2 reviews; per-URL status table showing each URL's progress (idle / running / completed / error / skipped<2reviews); cancel button (sets abort flag that the loop checks between URLs); cost tally accumulating across URLs. This is a NEW UI surface for batch-running the Per-Competitor flow across all competitor URLs in one click rather than per-URL clicks; mirrors W5 Session 2's per-review batch loop architecture but at URL-level granularity.
- **(c) Table 2 URL row button rename** — "Summarize competitor" → "Summarize Competitor Reviews" (clarifies that the button summarizes REVIEWS not the competitor product itself).
- **(d) Edit affordance on `CompetitorSummaryBanner`** — inline textarea + Save/Cancel + NEW PATCH endpoint at `/api/projects/[projectId]/competition-scraping/review-analysis/[analysisId]/route.ts` + NEW `src/lib/competition-scraping/handlers/review-analysis-update.ts` handler + **+13 new node:test cases** for the PATCH handler (auth + ownership check + 404 path + idempotent overwrite + cache-key-stable property). Wire-shape extended: `PerCompetitorBulletedResponseBody` now includes `analysisId` so the client can target the PATCH endpoint with the row's primary key. This is the FIRST canonical demonstration of the NEW "Edit affordance for cached AI output Pattern".

**FF#2 `7f19aca` (4 files +135/-39) — TWO Phase 4 redirects bundled into ONE commit + ONE deploy gate** — second demonstration of the multi-redirect bundling Pattern:

- **(a) v2→v3 prompt rewrite — theme-emergent.** Reframes the 3 critique categories (Product / Fulfillment / Company-seller) as COMMON EXAMPLES + adds explicit "INVENT a new theme heading" directive + 9 example emergent themes (Pricing / Documentation / Compatibility / Safety / Software / Customer support / Longevity / Marketing accuracy / Accessibility) with explicit invitation to invent more themes beyond the listed examples. `PER_COMPETITOR_BULLETED_PROMPT_VERSION` bump v2→v3. **Trigger:** v2's 4 FIXED headings (Product / Fulfillment / Company-seller / Other notable) became too restrictive — director's Phase 4 review surfaced that some review corpora reveal themes outside those 4 buckets (e.g., a category-wide pricing concern that doesn't fit Product / Fulfillment / Company-seller / Other) so v3 reframes them as COMMON EXAMPLES + adds the explicit "INVENT" directive + 9 named emergent themes as inspiration. Tests updated to match the v3 prompt shape.
- **(b) Explicit "✅ AI Review Summarizing job complete" green-bordered banner** in BOTH `PerCompetitorSummarizeModal` + `GlobalCompetitorSummarizeModal` when `runState.kind === 'completed'` — gives director a clear visual signal that the flow has finished vs. an ambiguous quiet state.

**Architecture (per §B 2026-05-27 + `feedback_browser_first_ai_with_server_migration.md`):** browser orchestrates queue + cost tally + pause/cancel; per-batch server endpoint receives one batch (here = one URL's full review corpus) + makes one Anthropic call + persists ONE PER_PRODUCT row + returns to browser. Each call well under Vercel's per-request time limit. **For the Global modal:** browser iterates URLs sequentially, firing one per-batch endpoint call per URL with ≥2 reviews; per-URL status table reflects each call's progress; cost tally accumulates across URLs; cancel between URLs respected.

**Eight Rule 14f forced-pickers fired this session — 8/8 = 100% Yes-to-Recommended:**

1. **Variant scope picker:** Bulleted-critical only (3 flows total instead of 6 — confirms today's Phase 4 redirect from W5 Session 2's v1→v2 prose→bulleted generalizes across the 6 remaining flows).
2. **Build order picker:** Sequential one flow first → live test → iterate.
3. **Which flow first picker:** Per-Competitor (most reused architecture from W5 Session 2's Per-Review pattern).
4. **Bullet structure picker (v1+v2):** Theme-grouped under 4 headings (later relaxed to emergent themes in v3 via FF#2 after director's Phase 4 review surfaced that some review corpora reveal themes outside the 4 buckets).
5. **Length range picker:** 8-15 bullets.
6. **Input strategy picker:** Raw review bodies (direct one-shot, not map-reduce — costs more tokens per call but preserves all critical signal in one AI pass).
7. **Deploy-now-vs-continue picker:** Deploy now after Per-Competitor at code level.
8. **End-session-vs-continue picker:** End session after Per-Competitor verified rather than continuing to Per-Category in the same session.

Running cumulative across recent sessions adds 8/8 to the prior 70/73 = **78/81 = 96.3% Yes-to-Recommended**.

**Scoreboard verification:**

| Check | Pre-deploy (entry — from W5 Session 2 close) | After build (`b9d232e`) | After FF#1 (`1cd6e3b`) | After FF#2 (`7f19aca`) — NEW LOCKED |
|---|---|---|---|---|
| Root tsc | clean | clean | clean | clean |
| Extension tsc | clean | clean | clean | clean |
| Extension `npm test` | 910/910 | 910/910 UNCHANGED | 910/910 UNCHANGED | **910/910 UNCHANGED** |
| src/lib `node:test` | 922/922 | 936/936 (+14: +8 prompts + +6 handler dispatch) | 950/950 (+14: +1 prompt + +13 PATCH handler) | **950/950** |
| `npm run build` routes | 66 | 66 UNCHANGED | 67 (+1 NEW PATCH endpoint) | **67 routes** |
| Check 6 Playwright | SKIPPED Rule 27 | SKIPPED | SKIPPED | SKIPPED |

**NEW baselines locked from this session:** src/lib `node:test` = **950/950** + `npm run build` = **67 routes** + extension `npm test` = **910/910 UNCHANGED**.

**Schema-change-in-flight transitions:** STAYS NO entire session. Entry NO (PER_PRODUCT enum value used by Per-Competitor was already shipped in W5 Session 2's deploy 2026-05-27 morning). STAYS NO through both FFs (no schema work). Final state at session end: NO.

**§A sections affected by this entry:** §A.10 + §A.11 + §A.12 remain superseded by §B 2026-05-27 (per Rule 18 §A frozen since the W5 Session 1.5 design lock); §A.13 prompt content + the §B 2026-05-27 line-1474 reference to "7 v1 prompts locked during planning" remain superseded by §B 2026-05-27-b (which today's §B 2026-05-27-c builds on by extending the canonical pattern from Per-Review to Per-Competitor). **No new §A supersedences in this entry** — today's work executes against the design lock without surfacing new design questions; the v1→v2→v3 prompt evolution is a content iteration on the design-locked shape, not a shape change.

**THREE NEW reusable Patterns memorialized (see CORRECTIONS_LOG §Entry 2026-05-27-c for full Pattern descriptions):**

1. **"Same-day Phase 4 multi-redirect bundling Pattern"** — when director surfaces N≥2 redirects in a single Phase 4 verification window on a freshly-deployed flow, bundle them into ONE FF commit + ONE deploy gate rather than one-FF-per-issue; today's FF#1 bundled 4 distinct concerns; FF#2 bundled 2; saves N-1 Rule 9 deploy gates + N-1 Phase 4 verification cycles vs the prior eBay 5-FF / Walmart 3-FF one-FF-per-issue historical pattern; works when redirects share the same flow + production state can't surface partial; doesn't work when redirects are gated by each other's Phase 4 outcome (sequential dependency).
2. **"Edit affordance for cached AI output Pattern"** — when an AI flow's output is persisted, ship Edit via (i) wire-shape extension to return the row id; (ii) new PATCH endpoint overwriting `analysisJson.summary`; (iii) cache-key-stable so subsequent reads serve the edit — the cache hit on a future re-run will return the edited text because the lookup hits the SAME row whose JSON now carries the override; no special-case logic needed in the cache code; director's verbatim trigger: *"User should be able to edit the Review Summary."* Applies to all future AI batch flows in PLOS where the output is the AUTHORITATIVE artifact (vs. ephemeral preview).
3. **"Test stub level-discriminator filtering Pattern"** — when production has a uniqueness constraint via an enum discriminator (here: `ReviewAnalysis.level` discriminating PER_REVIEW vs PER_PRODUCT cache rows), the test stub MUST mirror it; otherwise tests that seed a row with a "wrong" hash but right level coincidence pass when they should fail; today's W5 Session 3 surfaced this when both `PER_REVIEW_SUMMARIZE_PROMPT_VERSION` and `PER_COMPETITOR_BULLETED_PROMPT_VERSION` coincidentally landed at 'v2' — the version-tripwire test broke because the hash strings coincided; fix: extended `StubCachedRow` with a `level` field + stub filter now mirrors prod's `level` WHERE clause; future test stubs for handlers with enum discriminators should ship with discriminator-aware filtering from the start.

**TaskList sweep this session (Rule 26):** 15 in-session tasks; all 15 completed cleanly; ZERO open `DEFERRED:` tasks at session end; ZERO open `in_progress` tasks at session end; W5 Session 4 IS the next-session task per (a.105), not a Claude-defer.

**Per Rule 23 Change Impact Audit:** PLOS-SIDE handler + src/lib module surface + new API route + UI surface (additive only). NEW PATCH endpoint at `/api/projects/[projectId]/competition-scraping/review-analysis/[analysisId]` — additive route. NEW `review-analysis-update.ts` handler. NEW prompt builders + handler dispatch branch (existing PER_REVIEW dispatch untouched). NEW modal components (parallel to W5 Session 2's modal). Edit affordance is additive on `analysisJson.summary` field. No data risk to existing rows. Zero downstream W#1 cross-tool impact. No schema work.

**Cross-references:**

- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-27-c — captures the same outcome from the meta-pattern perspective (3 NEW reusable Patterns + 4 sub-observations including the P-43 cwd-leak Pattern Class reproduction running tally ~26+).
- `feedback_browser_first_ai_with_server_migration.md` — predecessor memory file from W5 Session 1.5 2026-05-27 governing this session's execution architecture (browser-first batch loop + per-batch server endpoint); today's W5 Session 3 successfully executed against that architecture spec at URL-level granularity (the Global modal's sequential browser loop iterating URLs).
- `feedback_plan_output_shape_before_building.md` — predecessor memory file from W5 Session 1 2026-06-02; today's pre-build planning round for the Per-Competitor flow output shape executed against this memory file's protocol; the v1 prompt director-confirmed at session start before any code lands.
- `feedback_approval_scope_per_decision_unit.md` — explicitly validated this session: session-start deploy-or-continue picker approved the whole Phase 4 redirect cycle including FF iterations; 6 pushes total (3 deploy + 3 ping-pong pairs) under one approval scope.
- §B 2026-05-27-b above (W5 Session 2 per-batch endpoint + Per-Review Summarize flow) — predecessor entry; today's W5 Session 3 extends that canonical pattern from Per-Review to Per-Competitor; the multi-redirect bundling Pattern that compresses today's FF cascade contrasts with W5 Session 2's 3-separate-FF pattern.
- §B 2026-05-27 above (W5 Session 1.5 design lock) — earlier predecessor entry; today's Per-Competitor flow IS one of the 3 aggregation flows (Per-Competitor + Per-Category + Per-Type) locked during that planning conversation; the 4-option toggle + Table 2 + Tables 3 + 4 architecture comes from that design.
- §B 2026-06-02 above (W5 Session 1 foundation) — earliest W5 §B entry; today's per-batch endpoint dispatch branch reuses the foundation primitives (Anthropic SDK seam + pricing + cache + token-counter + batch-sizer) from that session, none of which needed extension this session.

**Closing line:** P-49 W5 Session 3 Per-Competitor Comprehensive (bulleted) flow ✅ DEPLOYED-AND-VERIFIED 2026-05-27-c end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — initial build commit `b9d232e` (10 files +1481/-45) + 2 fix-forward commits (FF#1 `1cd6e3b` 10 files +1678/-106 bundling 4 Phase 4 redirects — v1→v2 critique-only prompt with 4 fixed theme headings + NEW global Summarize-all button + NEW `GlobalCompetitorSummarizeModal.tsx` 606 LOC + Table 2 button rename + Edit affordance with NEW PATCH endpoint + NEW `review-analysis-update.ts` handler + wire-shape extension carrying `analysisId` / FF#2 `7f19aca` 4 files +135/-39 bundling 2 Phase 4 redirects — v2→v3 theme-emergent prompt + 9 example emergent themes + PROMPT_VERSION bump v2→v3 + explicit "✅ AI Review Summarizing job complete" banner in both modals) all ff-merged to main under 3 Rule 9 deploy gates within ONE Phase 4 verification day. Per-Competitor flow shipped + Phase-4-verified is now the canonical pattern; the remaining 2 aggregation flows (Per-Category + Per-Type) reuse the per-batch endpoint shape + the v3 critique-theme-emergent prompt shape + the per-batch handler's flow-dispatch architecture. THREE NEW reusable Patterns memorialized (Same-day Phase 4 multi-redirect bundling + Edit affordance for cached AI output + Test stub level-discriminator filtering). Schema-change-in-flight flag STAYS NO entire session. NEW baselines locked: src/lib `node:test` = **950/950** + `npm run build` = **67 routes** + extension `npm test` = **910/910 UNCHANGED**. Closes (a.104) RECOMMENDED-NEXT = P-49 W5 Session 3 Per-Competitor flow ✅ DEPLOYED-AND-VERIFIED 2026-05-27-c. Opens (a.105) RECOMMENDED-NEXT = **P-49 W5 Session 4 — Per-Category Comprehensive (bulleted) flow + NEW "By Category-Type" page (Table 3 scaffold)** on `workflow-2-competition-scraping`. **ELEVENTH build/deploy-session §B entry per Rule 18 — third W5 deploy entry in this design doc; second to ship live AI batch processing end-to-end on production (after W5 Session 2's Per-Review flow).** The next §B entry will land at the W5 Session 4 close (capturing the Per-Category flow + new By Category-Type page + Phase 4 verification on the second aggregation flow).

---

## §B 2026-05-28 — `session_2026-05-28_p49-w5-session-4-scope-misread-rollback-and-corrective-planning` — Workstream 5 Session 4 — SCOPE-MISREAD ROLLBACK + CORRECTIVE-PLANNING SESSION — wrong-spec build commit `5fa1f53` (8 files +2705/-54) shipped to vklf.com and was HARD-REVERTED mid-Phase-4 via revert commit `958ccf8` (8 files +54/-2705); director established NEW Rule 31 (polish-item spec capture) + Claude backfilled 3 NEW spec docs in NEW `docs/polish-item-specs/` directory; 5-session corrective rebuild plan locked; Block 1 planning paused mid-way with 6 open questions — TWELFTH build/deploy-session §B entry per Rule 18 — FOURTH W5 entry; FIRST W5 entry covering a revert; first major divergence-incident under the post-`feedback_plan_output_shape_before_building.md` regime (the rule shipped 2026-06-02 W5 Session 1 and was meant to prevent exactly this class of failure; the 2026-05-28 incident is a RE-VIOLATION; NEW Rule 31 + the spec-doc mechanism are the structural backstop going forward).

**Closes (a.105) RECOMMENDED-NEXT** = P-49 W5 Session 4 wrong-spec build SHIPPED + HARD-REVERTED. **Opens (a.106) RECOMMENDED-NEXT** = **P-49 W5 corrective rebuild — Block 1 planning resume (answer the 6 open questions) + (likely) Session 1 Category page scaffold per `docs/polish-item-specs/P-49-W5-S4-category-page.md` §3** on `workflow-2-competition-scraping`.

### Scope-misread + rollback summary

The launch prompt for this session (`docs/NEXT_SESSION.md` written 2026-05-27-c) directed Claude to build "P-49 W5 Session 4 — Per-Category Comprehensive (bulleted) flow + NEW 'By Category-Type' page (Table 3 scaffold)". Claude framed a pre-build joint-confirmation per `feedback_plan_output_shape_before_building.md` pinning the high-level shape: "one row per category with rows collapsing competitors that share the category; browser-side execution per the W#1 Pattern; one bulleted flow first; deploy after Phase 4 PASSES". Director approved with "all good as proposed". Claude built + scoreboard-verified + ff-merged to main + Vercel auto-redeployed.

During the live Phase 4 walkthrough on vklf.com, director surfaced a **MAJOR scope misread**. The director's actual spec (preserved verbatim in the new spec doc at `docs/polish-item-specs/P-49-W5-S4-category-page.md` §1) required TWO separate pages (Category page + Type page) + flat 13-column tables (not card-style grouping) + first-row-carries-label grouping (subsequent rows in a category group leave Column 1 EMPTY) + per-batch endpoint architecture (server-side, mirroring W5 Sessions 2-3) + 4 AI flows (Category bulleted + non-bulleted × Category page + Type page) + click-to-edit on populated cells + drag-to-reorder (two-level — main category rows + competitor rows within a category) + Excel export + write-back to URL detail's "Overall Analysis — Captured Reviews" box (merge, never overwrite). Claude had built ONE combined page + card-style grouping + browser-side execution + 1 AI flow + none of the other surfaces.

The full divergence table is reproduced verbatim in `docs/CORRECTIONS_LOG.md` §Entry 2026-05-28 §(a).

**Root cause:** the pre-build joint-confirmation step DID fire this session BUT pinned the **high-level shape** without pinning the **concrete particulars** — concrete column list (director's spec named 13 specific columns; the proposal said "essential columns"), concrete button labels (director's spec named four specific buttons; the proposal said "Summarize button"), concrete AI-flow counts (director's spec was four; the proposal was one), concrete execution-model semantics (director's spec was server-side per-batch; the proposal was browser-side per `feedback_browser_first_ai_with_server_migration.md` default without checking whether director's verbatim spec contradicted that default). Director's "all good as proposed" approved an abstract proposal that diverged from the concrete spec in director's mind. **This is a RE-VIOLATION of `feedback_plan_output_shape_before_building.md`** — the rule already existed and Claude executed the protocol's surface form (proposal + confirmation) without the protocol's intent (every load-bearing concrete detail confirmed). NEW Rule 31 + the spec-doc mechanism are the structural backstop going forward.

Director picked the hard-revert picker option (a) over leave-tab-live-and-patch-later (b) and quick-patch-hide-tab-only (c). Revert commit `958ccf8` deleted all 8 files from the build commit + the NEW P-51 ROADMAP skeleton entry that landed in the same build commit. Build commit `5fa1f53` remains in git history on both `main` and `workflow-2-competition-scraping` for forensic audit trail. Live site returned to W5 Session 3 deploy state. No data lost since no `prisma db push` fired this session.

### 5-session corrective rebuild plan locked (per director Q4 "play the expert, safe + thorough")

- **Session 1** = Category page scaffold (route + 13-column flat table + first-row-carries-label grouping + column show/hide checkboxes + click-to-edit cells; NO drag, NO AI, NO Excel; smallest verifiable unit to lock the table primitive against director's spec before stacking interactions atop it).
- **Session 2** = Category page two AI flows (bulleted dedup + non-bulleted prose) + real-time per-cell painting as each per-category Anthropic call returns + write-back to URL detail's "Overall Analysis — Captured Reviews" box for the non-bulleted flow (merge, never overwrite).
- **Session 3** = Category page two-level drag-to-reorder + drag persistence + Excel export with `.xlsx` library (TBD between `xlsx` and `exceljs` during session planning).
- **Session 4** = Type page scaffold + drag + Excel together (compressed since pattern proven by Category page Sessions 1 + 3 by then; Type page is structurally identical to Category page so the scaffold + drag + Excel ship in one Type-page session).
- **Session 5** = Type page two AI flows (mirror Session 2 with Type/type substituted for Category/category).

The two canonical reference docs for the corrective rebuild:
- `docs/polish-item-specs/P-49-W5-S4-category-page.md` §3 — Category page consolidated source-of-truth (Sessions 1-3).
- `docs/polish-item-specs/P-49-W5-S5-type-page.md` §3 — Type page consolidated source-of-truth (Sessions 4-5).

### Block 1 planning paused mid-way — 6 open questions awaiting director answers

These 6 questions are captured in `docs/polish-item-specs/P-49-W5-S4-category-page.md` §4 and reproduced in the launch prompt of `docs/NEXT_SESSION.md` for next session pickup:

- **Q-A** — Column 8 "Stars" semantics (per-review breakdown vs URL-level rating).
- **Q-B** — Column 9 "Reviews Summary" data source + rendering (per-review summarization output stacked list vs count + click-to-expand).
- **Q-C** — Column 11 "Competitor Comprehensive Reviews Analysis (non-bulleted)" — NOT yet a shipped flow at per-competitor level; drop column / placeholder + per-row Generate button firing NEW per-competitor non-bulleted flow / piggyback on Session 2 non-bulleted flow.
- **1b-i** — Visual treatment of first-row-carries-label grouping (literal empty cell vs subtle visual signal like thin top-border + indent + "↑ same as above" hint).
- **1b-ii** — Drag handle placement (dedicated leftmost column / hover-anywhere-in-row / hover-on-first-column-cell).
- **1b-iii** — Uncategorized bucket placement + Auto-create button disabled state.

### NEW Rule 31 cross-reference

NEW Rule 31 added inline to `docs/HANDOFF_PROTOCOL.md` at line 936 — "Whenever the director introduces a NEW polish item with detailed instructions — OR adds substantial new scope to an existing polish item — the responsible Claude session MUST IMMEDIATELY (same session) create or extend a spec doc at `docs/polish-item-specs/<item-id>-<slug>.md` capturing the director's verbatim instructions." Standardized 5-section structure: §1 verbatim append-only / §2 joint-discussion append-only / §3 consolidated source-of-truth / §4 open questions / §5 cross-references. The §3 read is mandatory at session start for every session that touches a polish item with a spec doc. Director's verbatim 2026-05-28 standing directive (Rule 31 source quotation): *"I want us to make a note of this huge disparity in what I had instructed and what you developed and put something in the documentation that will prevent such a thing from happening in the future..."*

### Backfill artifacts created this session

THREE NEW spec docs in NEW `docs/polish-item-specs/` directory:

1. **`docs/polish-item-specs/P-49-W5-S4-category-page.md`** (25 KB) — Category page; §1 verbatim director instructions + §2 Block-0 architecture decisions resolved in mid-session Q&A + §3 consolidated spec rolled-up + §4 6 open questions for Block 1 + §5 cross-references.
2. **`docs/polish-item-specs/P-49-W5-S5-type-page.md`** (15 KB) — Type page; structurally mirrors Category; the canonical reference for Sessions 4-5 of the corrective rebuild.
3. **`docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md`** (7 KB) — SKELETON PLACEHOLDER per director's "Q&A at start of P-51 session" directive; §2-§4 to be filled during the dedicated P-51 build session.

### Scoreboard verification

| Check | Pre-deploy (entry — from W5 Session 3 close) | Mid-session (post-build `5fa1f53`, pre-deploy) | Post-revert (current LOCKED — UNCHANGED from W5 Session 3 exit) |
|---|---|---|---|
| Root tsc | clean | clean | clean |
| Extension tsc | clean | clean | clean |
| Extension `npm test` | 910/910 | 910/910 UNCHANGED | **910/910 UNCHANGED** |
| src/lib `node:test` | 950/950 | 968/968 (+18 — new per-category-type prompt + handler + modal tests) | **950/950 (back to entry baseline)** |
| `npm run build` routes | 67 | 68 (+1 — new by-category-type page) | **67 (back to entry baseline)** |
| Check 6 Playwright | SKIPPED Rule 27 | SKIPPED | SKIPPED |

**NEW baselines locked from this session:** UNCHANGED from W5 Session 3 exit (since the build was hard-reverted): src/lib `node:test` = **950/950** + `npm run build` = **67 routes** + extension `npm test` = **910/910 UNCHANGED**.

### Schema-change-in-flight transitions

STAYS NO entire session. Entry NO (PER_PROJECT enum value already in production from W5 Session 1.5 schema push 2026-05-27). STAYS NO through the build (no `prisma db push` fired; the wrong-spec build reused existing PER_PRODUCT + PER_CATEGORY enum values). STAYS NO through the revert. Final state at session end: NO. The corrective rebuild plan also does NOT require schema changes (existing PER_PRODUCT + PER_CATEGORY + PER_TYPE + PER_PROJECT enum values cover all upcoming work; existing `ReviewAnalysis` model is sufficient; existing `CompetitorUrl.competitionCategory` + `.type` + `.overallAnalyses` columns cover all data sources).

### §A sections affected by this entry

- **§A.10 + §A.11 + §A.12** remain superseded by §B 2026-05-27 (per Rule 18 §A frozen since W5 Session 1.5 design lock).
- **§A.13 prompt content + the §B 2026-05-27 line-1474 reference to "7 v1 prompts locked during planning"** remain superseded by §B 2026-05-27-b.
- **The 7-flow modal-per-flow surface architecture from §B 2026-05-27 design lock** is partially superseded for the Category + Type aggregation flows by today's 5-session corrective rebuild plan (TWO separate pages with flat 13-column tables vs the 7-flow modal-per-flow architecture); the **cache-key + per-batch endpoint architecture from §B 2026-05-27-b (W5 Session 2)** and the **v3 critique-only theme-emergent prompt shape from §B 2026-05-27-c (W5 Session 3)** are PRESERVED for the per-competitor input column (Column 10 of the Category page reads cached PER_PRODUCT rows produced by the W5 Session 3 Per-Competitor bulleted flow with the v3 prompt). §A frozen per Rule 18; this supersedence is captured in §B only.
- **No new §A supersedences in this entry** beyond the surface-architecture-of-Category-and-Type-pages note above.

### TaskList sweep this session (Rule 26)

7 in-session tasks; all 7 completed cleanly. Task #5 (`DEFERRED: corrective rebuild — TWO separate surfaces`) → COMPLETED. Destination = the two new spec docs `docs/polish-item-specs/P-49-W5-S4-category-page.md` + `docs/polish-item-specs/P-49-W5-S5-type-page.md` + the ROADMAP P-49 cross-reference to those spec docs. Task #6 (`DEFERRED: Capture CORRECTIONS_LOG entry — HIGH-importance scope-misread`) → COMPLETED via the new CORRECTIONS_LOG §Entry 2026-05-28 in this doc-batch. Task #7 (`Backfill polish-item-specs directory + Rule 31 + 3 spec docs`) → COMPLETED earlier in session. ZERO open `DEFERRED:` tasks at session end; ZERO open `in_progress` tasks at session end; W5 corrective rebuild Block 1 planning resume IS the next-session task per (a.106), not a Claude-defer.

### Per Rule 23 Change Impact Audit

No net code surface touched this session — the build commit `5fa1f53` was reverted in `958ccf8`; only persistent surface changes this session are doc-only (NEW directory `docs/polish-item-specs/` with 3 NEW spec docs + NEW Rule 31 in HANDOFF_PROTOCOL.md line 936 + ROADMAP P-49 + P-51 entry cross-reference updates). No data risk. No schema work. Zero downstream W#1 cross-tool impact.

### Cross-references

- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-28 (HIGH) — captures the same outcome from the meta-pattern perspective (with the divergence-table reproduced verbatim) + root cause + NEW Rule 31 + 5-session corrective rebuild plan + 6 open Block 1 questions paused mid-way + 3 sub-observations.
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (NEW this session, line 936) — the protocol mandate for polish-item spec capture.
- `docs/polish-item-specs/P-49-W5-S4-category-page.md` — Category page spec; the canonical reference for Sessions 1-3 of the corrective rebuild.
- `docs/polish-item-specs/P-49-W5-S5-type-page.md` — Type page spec; the canonical reference for Sessions 4-5 of the corrective rebuild.
- `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md` — P-51 skeleton placeholder.
- `feedback_plan_output_shape_before_building.md` — the related procedural memory (rule shipped 2026-06-02 W5 Session 1); today's incident is a RE-VIOLATION of this rule; Rule 31 + the spec-doc mechanism are the structural backstop.
- §B 2026-05-27 above (W5 Session 1.5 design lock) — predecessor entry; today's corrective rebuild plan supersedes its surface architecture for the Category + Type aggregation flows.
- §B 2026-05-27-b above (W5 Session 2 per-batch endpoint + Per-Review Summarize) — predecessor entry; the cache-key + per-batch endpoint architecture from that entry is PRESERVED in the corrective rebuild.
- §B 2026-05-27-c above (W5 Session 3 Per-Competitor deploy + 2-FF cycles) — predecessor entry; the v3 critique-only theme-emergent prompt shape from that entry is PRESERVED for the per-competitor input column (Column 10) of the corrective-rebuild Category page.
- Commits `5fa1f53` (wrong-spec build SHIPPED + then REVERTED) + `958ccf8` (revert; CURRENT HEAD on both `main` and `workflow-2-competition-scraping`) — forensic audit trail of the scope-misread incident.

**Closing line:** P-49 W5 Session 4 SCOPE-MISREAD ROLLBACK + CORRECTIVE-PLANNING SESSION on `workflow-2-competition-scraping`. Wrong-spec build commit `5fa1f53` (8 files +2705/-54 — single combined "By Category-Type" page + card-style grouping + browser-side execution + 1 AI flow + NEW P-51 ROADMAP skeleton) SHIPPED to vklf.com via ff-merge to main + Vercel auto-redeploy and was HARD-REVERTED mid-Phase-4 via revert commit `958ccf8` (8 files +54/-2705); net live-site change = ZERO since the revert returned the site to the W5 Session 3 deploy state. NEW Rule 31 added inline to HANDOFF_PROTOCOL.md line 936 — Polish-item spec capture: verbatim director instructions checked into `docs/polish-item-specs/<item-id>-<slug>.md` per the standardized 5-section structure. THREE NEW spec docs backfilled in NEW `docs/polish-item-specs/` directory. 5-session corrective rebuild plan locked; Block 1 planning paused mid-way with 6 open questions awaiting director answers at next session start. THREE Rule 14f forced-pickers fired this session — 3/3 = 100% Yes-to-Recommended. TWO Rule 9 deploy gates fired (build deploy + hard-revert deploy). Schema-change-in-flight flag STAYS NO entire session. NEW baselines UNCHANGED from W5 Session 3 exit. **Closes (a.105) RECOMMENDED-NEXT** = P-49 W5 Session 4 wrong-spec build SHIPPED + HARD-REVERTED. **Opens (a.106) RECOMMENDED-NEXT = P-49 W5 corrective rebuild — Block 1 planning resume + (likely) Session 1 Category page scaffold per `docs/polish-item-specs/P-49-W5-S4-category-page.md` §3** on `workflow-2-competition-scraping`. **TWELFTH build/deploy-session §B entry per Rule 18 — FOURTH W5 entry; FIRST W5 entry covering a revert.** The next §B entry will land at the close of Session 1 of the corrective rebuild (Category page scaffold per `docs/polish-item-specs/P-49-W5-S4-category-page.md` §3 — route + 13-column flat table + first-row-carries-label grouping + column show/hide + click-to-edit; NO drag, NO AI, NO Excel).

---

## §B 2026-05-28-b — `session_2026-05-28-b_p49-w5-reviews-phase-2-master-spec-backfill-and-page-2-divergence-fix-plan` — Workstream 5 Sessions 2 + 3 page divergence discovery + master spec backfill + 3-session corrective-fix plan locked — PURE-PLANNING + DOC-ONLY SESSION on `workflow-2-competition-scraping` — NO code, NO builds, NO deploys this session — 12 divergence findings (D-1 through D-12) on the shipped Reviews Analysis Table page (W5 Sessions 2 + 3) catalogued + 3-session corrective-fix plan Fix A + Fix B + Fix C locked + NEW master spec doc + NEW backfilled Reviews Analysis Table spec doc + NEW Rule 31 mechanical read-guarantee + audit-shipped-state mandate sub-sections + 2 NEW reusable PATTERNS memorialized — THIRTEENTH build/deploy-session §B entry per Rule 18; FIFTH W5 entry; SECOND W5 entry covering a non-deploy session (the FIRST was W5 Session 1.5 design lock 2026-05-27)

**Closes (a.106) RECOMMENDED-NEXT** = P-49 W5 corrective rebuild Block 1 planning resume — REDIRECTED to Reviews Analysis Table master-spec-backfill + page-2 divergence-discovery + 3-session corrective-fix plan locked. **Opens (a.107) RECOMMENDED-NEXT = P-49 W5 Reviews Analysis Table Fix Session A** on `workflow-2-competition-scraping` per `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 "Fix Session A" sub-section.

### Session shape — pure-planning, NO code

Session opened per yesterday's NEXT_SESSION.md pointer scoping "P-49 W5 corrective rebuild Block 1 planning resume + (likely) Session 1 Category page scaffold". Claude completed start-of-session routine (branch verify ✅ / Group A doc reads / Rule 31 §3 read of Category + Type spec docs / drift check / Step 7b plain-terms summary) and awaited go-ahead.

Director redirected immediately at session-start with a MAJOR scope correction NOT covered by the launch prompt: the previously-shipped `/competitor-reviews-analysis` page (W5 Sessions 2 + 3, deployed 2026-05-27 + 2026-05-27-c per §B 2026-05-27-b + §B 2026-05-27-c above) has multiple divergences from director's original verbatim spec. Director re-pasted the FULL original instruction set covering all 3 Reviews Phase 2 pages and asked Claude to (a) audit shipped state vs verbatim spec, (b) surface clarifying questions, (c) propose prevention mechanism, (d) propose forward path.

Director picked Rule 14f Option A "Planning + spec backfill only today. NO code today." over alternative pickers (B: Plan + scaffold + ship Phase 1 of one corrective fix today; C: Plan + ship a quick patch to bring page closer to spec while planning the rest). Session became 100%-planning.

### 12-divergence finding on the shipped Reviews Analysis Table page

Code-truth audit of `src/app/projects/[projectId]/competition-scraping/competitor-reviews-analysis/page.tsx` + URL detail page surface + `CompetitionScrapingSurfaceNav.tsx` + `review-analysis-run-batch.ts` + `review-analysis-update.ts` + prisma schema produced 12 divergence findings (D-1 through D-12). Full list reproduced verbatim from `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §2 + `docs/CORRECTIONS_LOG.md` §Entry 2026-05-28-b §(a):

- **D-1** — Toggle labels truncated; 5th toggle option missing (the master spec introduces a NEW top-level page "Competitor Comprehensive Reviews Analysis Table").
- **D-2** — Only 4 of 10 spec columns shipped on URL row; missing 6 (Platform / Category / Type / Product Name / Results Rank / Competition Score).
- **D-3** — Only 1 of 4 top-of-page buttons shipped (no non-bulleted Auto-create button, no Export Table button).
- **D-4** — No click-to-edit on URL-row data cells.
- **D-5** — No show/hide column checkboxes.
- **D-6** — No drag-to-reorder.
- **D-7** — No Excel export affordance.
- **D-8** — Per-review summary persistence-on-refresh bug.
- **D-9** — NO write-back to `CapturedReview.analysis` ("Your Analysis" box).
- **D-10** — NO write-back to `CompetitorUrl.overallAnalyses["reviews"]` ("Overall Analysis — Captured Reviews" box).
- **D-11** — The "Overall Analysis — Captured Reviews" box itself NOT EVEN RENDERED on URL detail page.
- **D-12** — Per-review Edit affordance rejected as out-of-scope-for-now (revisited in Fix Session B).

The Sonnet 4.6 mention in director's verbatim spec was corrected at implementation time — Opus 4.6 + Opus 4.7 already in production model picker (verified in modal source code).

### 7-question + 7-answer cluster — 7/7 = 100% Yes-to-Recommended

7 clarifying questions answered Yes-to-Recommended via 2 AskUserQuestion batches (4 + 3 = 7). Answers folded into §2 + §3 of the new Reviews Analysis Table spec doc + into master spec §2 (cross-cutting CQ-1 + CQ-7). The 7 questions covered the architecture of the 5-option toggle, the column layout, the click-to-edit propagation Pattern, the write-back semantics, the Excel export library choice, and the corrective-fix-plan decomposition into 3 sessions.

3 NEW open questions emerged from today's discussion (captured in §4 of the new spec doc; resolved at start of corresponding Fix Sessions):

- **Q8** — Flow-value naming convention for NEW per-competitor non-bulleted (Fix Session C concern).
- **Q9** — Per-review summary Edit UI pattern (Fix Session B concern).
- **Q10** — Display format for "N of M summarized" count cell (Fix Session A concern; resolved at start of THIS upcoming session).

Running cumulative across recent 10 sessions: 82/85 + 7/7 = **89/92 = 96.7% Yes-to-Recommended**.

### 3-session corrective-fix plan Fix A + Fix B + Fix C locked

Captured in `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 with full sub-bullet decomposition (summary reproduced from CORRECTIONS_LOG §Entry 2026-05-28-b §(e)):

- **Fix Session A (BUILD by default; 0-1 Rule 9 deploy gates)** — toggle rename to 5 options + URL-row column population (10 columns left-to-right) + title+description display-time merge on review-row body + Column 8 "N of M summarized" count display + ColumnVisibilityBar show/hide for 10 columns + click-to-edit on URL-row cells 1-7 (via existing CompetitorUrl PATCH; single source of truth) + click-to-edit on review-row body/star/reviewer/date cells (via existing CapturedReview PATCH; single source of truth). NO drag, NO new AI flows, NO write-backs, NO Excel.
- **Fix Session B (BUILD by default; 0-1 Rule 9 deploy gates)** — drag-to-reorder URL rows + drag-to-reorder review rows within URL group + per-review Edit affordance. NO Excel, NO write-backs, NO new AI flows.
- **Fix Session C (BUILD by default; 0-1 Rule 9 deploy gates; 1 schema change)** — NEW `Auto-create Competitor Comprehensive Reviews Analysis (non-bulleted)` flow + Excel export button + write-back to `CapturedReview.analysis` + write-back to `CompetitorUrl.overallAnalyses["reviews"]` (merge, not overwrite) + render the "Overall Analysis — Captured Reviews" box on URL detail page if not yet rendered + 1 NEW column `CapturedReview.sortRankInReviewsTable` for review-row drag persistence (schema change; will fire `npx prisma db push` + flip Schema-change-in-flight flag NO→YES mid-session).

After Fix Sessions A + B + C complete, Category page Sessions 1-3 + Type page Sessions 4-5 from yesterday's 5-session corrective rebuild plan (§B 2026-05-28 above) resume.

### 2 NEW reusable PATTERNS memorialized

- **PATTERN: "Master-spec-plus-per-page-specs structure for multi-page polish items"** — when a polish item covers N pages with shared cross-cutting decisions, create ONE master spec doc (verbatim full re-paste + cross-cutting joint decisions) + N per-page spec docs (each deriving §1 from master + carrying surface-specific §2 + §3 + §4). Canonical reference implementation: today's `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` + the 3 per-page specs.

- **PATTERN: "Backfill spec doc for already-shipped pre-Rule-31 polish items as discovery surfaces divergence"** — when Rule 31 establishes mid-arc, already-shipped surfaces may have spec gaps. When divergence on a shipped surface is surfaced, backfill the spec doc IMMEDIATELY at that moment — NOT retroactively at a future cleanup session. The backfill itself catalogues divergences as §2 entries, feeding directly into the corrective-fix plan in §3. Canonical reference: today's `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` backfill.

### NEW Rule 31 sub-sections cross-reference

NEW sub-sections added inline to `docs/HANDOFF_PROTOCOL.md` under existing Rule 31 (no new top-level rule number — these are extensions):

- **"Mechanical read-guarantee (NEW 2026-05-28-b)"** — the SessionStart hook `.claude/hooks/inject-next-session-pointer.sh` now auto-detects `P-NN` token references in the resume-flow pointer content + emits a "🔵 RULE 31 MANDATORY READ — POLISH-ITEM SPEC DOCS" block listing every matching `docs/polish-item-specs/P-NN-*.md` file. Tested working: for today's pointer content referencing P-43/P-46/P-49/P-50/P-51, the hook emits all 5 matching files.

- **"Audit-shipped-state mandate for in-flight workstreams (NEW 2026-05-28-b)"** — Claude MUST audit every shipped sister surface on an in-flight workstream against the master verbatim spec at session start — NOT just the surface the launch prompt is steering toward. Today's incident is the trigger.

### Scoreboard verification

/scoreboard NOT RUN this session — pure-doc work; Check 6 SKIPPED per Rule 27 standing precedent for pure-doc sessions; baselines UNCHANGED from W5 Session 4 (= W5 Session 3 baselines):

| Check | Entry baseline (from W5 Session 4 exit) | Post-session (UNCHANGED — no code shipped) |
|---|---|---|
| Root tsc | clean | clean |
| Extension tsc | clean | clean |
| Extension `npm test` | 910/910 | **910/910 UNCHANGED** |
| src/lib `node:test` | 950/950 | **950/950 UNCHANGED** |
| `npm run build` routes | 67 | **67 UNCHANGED** |
| Check 6 Playwright | SKIPPED Rule 27 | SKIPPED |

**NEW baselines locked from this session:** UNCHANGED from W5 Session 4 (since no code shipped).

### Schema-change-in-flight transitions

STAYS NO entire session. Entry NO. No schema work. The corrective-fix plan introduces 1 new column `CapturedReview.sortRankInReviewsTable` in Fix Session C — NOT this session. Final state at session end: NO.

### §A sections affected by this entry

- **§A.7 (cost-cap framing)**, **§A.10 + §A.11 + §A.12** remain superseded by §B 2026-05-27 (W5 Session 1.5 design lock).
- **§A.13 prompt content + the §B 2026-05-27 line-1474 reference to "7 v1 prompts locked during planning"** remain superseded by §B 2026-05-27-b.
- **No new §A supersedences in this entry** — today's master-spec backfill captures cross-cutting decisions that supplement (not supersede) §A's frozen content; the divergence findings + corrective-fix plan are surface-specific to the already-shipped Reviews Analysis Table page (W5 Sessions 2 + 3 ship state) and live in §3 of the per-page spec doc, not in §A.

### TaskList sweep this session (Rule 26)

7 in-session tasks; all 7 completed cleanly (start-of-session routine ✅ / master spec doc ✅ / Reviews Analysis Table backfill spec doc ✅ / 7 clarifying questions ✅ / Category + Type §5 cross-refs ✅ / multi-session fix plan locked ✅ / Rule 31 mechanical-layer + audit-shipped-state extensions ✅ / ROADMAP cross-references ✅ / end-of-session in_progress.) ZERO open `DEFERRED:` tasks at session end; ZERO open `in_progress` tasks at session end (apart from the end-of-session doc-batch fire itself); Fix Session A IS the next-session task per (a.107), not a Claude-defer.

### Per Rule 23 Change Impact Audit

ZERO code surface touched this session — doc + spec + operational-hook only (2 NEW spec docs + 2 MODIFIED spec docs §5 cross-refs + 5 MODIFIED Group A docs + 1 MODIFIED Group B doc + 1 MODIFIED operational hook + NEW Rule 31 sub-sections in HANDOFF_PROTOCOL.md). No data risk. No schema work. Zero downstream W#1 cross-tool impact.

### Architecture preserved across the corrective fix

- **Per-batch endpoint architecture from §B 2026-05-27-b (W5 Session 2 ship)** — PRESERVED. Fix Session A reuses the existing `/api/projects/[projectId]/competition-scraping/review-analysis/run-batch/route.ts` thin shim + `review-analysis-run-batch.ts` handler dispatch shape; Fix Sessions B + C extend the handler dispatch with new flow values without modifying the architecture.
- **v3 critique-only theme-emergent prompt shape from §B 2026-05-27-c (W5 Session 3 ship)** — PRESERVED for the Per-Competitor input column (Column 9 of the corrective-fix Reviews Analysis Table; Column 10 of the corrective-rebuild Category page).
- **PATCH endpoint at `/api/projects/[projectId]/competition-scraping/review-analysis/[analysisId]/route.ts` from §B 2026-05-27-c (W5 Session 3 ship)** — PRESERVED. Fix Sessions A + C reuse this for cell-level edits via Edit affordance; Fix Session B extends it for per-review Edit (Q9 resolved at start of Fix Session B).
- **The 5-session corrective rebuild plan from §B 2026-05-28** — Category page Sessions 1-3 + Type page Sessions 4-5 STILL VALID; pushed back behind Fix Sessions A + B + C. Yesterday's wrong-spec build commit `5fa1f53` + revert `958ccf8` already memorialized in §B 2026-05-28; not duplicated here.

### Cross-references

- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-28-b (HIGH) — captures the same outcome from the meta-pattern perspective (with the 12-divergence finding + root cause + NEW Rule 31 extensions + 2 NEW reusable PATTERNS + 3-session corrective-fix plan + 7-of-7 clarifying-question cluster + sub-observations).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (NEW sub-sections this session) — the protocol mandate extension for mechanical read-guarantee + audit-shipped-state.
- `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` — NEW master spec doc; the canonical cross-cutting source-of-truth for the entire P-49 W5 Reviews Phase 2.
- `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` — NEW backfilled spec doc for the already-shipped Reviews Analysis Table page; covers W5 Sessions 2 + 3 ship state + 12 divergence findings + 4 chronological joint-discussion entries + 3-session corrective-fix plan Fix A + Fix B + Fix C + Q8/Q9/Q10 open + §5 cross-references.
- `docs/polish-item-specs/P-49-W5-S4-category-page.md` §5 — UPDATED with cross-reference to master spec doc; the canonical reference for Category page Sessions 1-3 of the corrective rebuild (pushed back behind Fix Sessions A + B + C).
- `docs/polish-item-specs/P-49-W5-S5-type-page.md` §5 — UPDATED with cross-reference to master spec doc; the canonical reference for Type page Sessions 4-5 of the corrective rebuild.
- `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md` — UNCHANGED this session; the canonical reference for the P-51 dedicated build session.
- `.claude/hooks/inject-next-session-pointer.sh` — EXTENDED to auto-detect `P-NN` token references + emit Rule 31 mandatory-read block.
- §B 2026-05-27 above (W5 Session 1.5 design lock) — predecessor entry; today's master spec doc carries the FULL verbatim re-paste covering the 3 Reviews Phase 2 pages whose surface architecture §B 2026-05-27 had locked at the high-level; the master spec doc + per-page specs are the structural backstop per NEW Rule 31.
- §B 2026-05-27-b above (W5 Session 2 per-batch endpoint + Per-Review Summarize ship) — predecessor entry; the per-batch endpoint architecture from that ship is PRESERVED across the corrective fix.
- §B 2026-05-27-c above (W5 Session 3 Per-Competitor deploy + 2-FF cycles) — predecessor entry; the v3 critique-only theme-emergent prompt shape + the PATCH endpoint from that ship are PRESERVED across the corrective fix.
- §B 2026-05-28 above (W5 Session 4 scope-misread rollback + corrective planning) — immediate predecessor entry; yesterday's wrong-spec build commit `5fa1f53` + revert `958ccf8` already memorialized there; not duplicated here. Today's session is the first major test of yesterday's NEW Rule 31 structural backstop + surfaces the audit-shipped-state gap that NEW Rule 31's audit-shipped-state mandate extension addresses.
- `feedback_plan_output_shape_before_building.md` — the related procedural memory; today's session reinforces that Rule 31 + the spec-doc mechanism + the mechanical read-guarantee + the audit-shipped-state mandate are the structural backstops for the same intent.

**Closing line:** P-49 W5 Reviews Phase 2 master-spec-backfill + page-2 (Competitor Reviews Analysis Table) divergence-discovery + 3-session corrective-fix plan locked on `workflow-2-competition-scraping`. PURE-PLANNING + DOC-ONLY session: ZERO code changes; ZERO Rule 9 deploy gates fired; ZERO schema changes; ZERO new routes. 12 divergence findings (D-1 through D-12) catalogued on the shipped Reviews Analysis Table page; NEW master spec doc + NEW backfilled Reviews Analysis Table spec doc + NEW Rule 31 sub-sections (mechanical read-guarantee + audit-shipped-state mandate) + EXTENDED SessionStart hook + 2 NEW reusable PATTERNS memorialized + 3-session corrective-fix plan Fix A + Fix B + Fix C locked. 8/8 = 100% Yes-to-Recommended this session (1 session-shape picker + 7 clarifying questions); running cumulative 89/92 = 96.7%. Schema-change-in-flight flag STAYS NO entire session. NEW baselines UNCHANGED from W5 Session 4 (since no code shipped). **Closes (a.106) RECOMMENDED-NEXT** = P-49 W5 corrective rebuild Block 1 planning resume — REDIRECTED. **Opens (a.107) RECOMMENDED-NEXT = P-49 W5 Reviews Analysis Table Fix Session A** on `workflow-2-competition-scraping`. **THIRTEENTH build/deploy-session §B entry per Rule 18 — FIFTH W5 entry; SECOND W5 entry covering a non-deploy session.** The next §B entry will land at the close of Fix Session A of the corrective fix (Reviews Analysis Table 10-column shape + show/hide + click-to-edit + Column 8 count display per `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 "Fix Session A" sub-section).

---

## §B 2026-05-29 — `session_2026-05-29_p49-w5-reviews-analysis-table-fix-session-a-shipped-with-4-bundled-ff-cycles` — Workstream 5 Reviews Analysis Table Fix Session A ✅ DEPLOYED-AND-VERIFIED 2026-05-29 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — the first of the 3-session corrective-fix plan locked 2026-05-28-b — initial build commit `8708343` (5 files +973/-183) plus FOUR fix-forward commits (FF1 `0b21c09` 5 files +936/-517 bundling 8 Phase-4 redirects + FF2 `31c54a0` 5 files +466/-6 bundling 5 Phase-4 redirects + FF3 `12c042c` 2 files +97/-33 bundling 4 Phase-4 redirects + FF4 `3fbe12e` 3 files +308/-55 bundling 1 Phase-4 redirect = 18 total redirects across 4 FFs in one Phase 4 verification day) all ff-merged to main under 5 Rule 9 deploy gates within ONE Phase 4 verification day — FOURTEENTH build/deploy-session §B entry per Rule 18; SIXTH W5 entry — director Phase 4 verbatim PASS verdict on FF4: "everything passed"; NEW RECORD for the Same-day Phase 4 multi-redirect bundling Pattern beating the prior 3-FF max (Etsy 2026-05-31 + Walmart 2026-06-01 had 3 FFs each per §B 2026-05-31 + §B 2026-06-01 above); Q3 schema-gap discovery during build DEFERRED to Fix Session B per director-approved Rule 14f picker preserving Fix Session A's NO-schema-change scope intact; NEW reusable PATTERN memorialized — Cell-level click handlers + state-aware text affordance Pattern (FF4)

**Closes (a.107) RECOMMENDED-NEXT** = P-49 W5 Reviews Analysis Table Fix Session A ✅ DEPLOYED-AND-VERIFIED 2026-05-29 with 4 bundled fix-forward cycles. **Opens (a.108) RECOMMENDED-NEXT = P-49 W5 Reviews Analysis Table Fix Session B** on `workflow-2-competition-scraping` per `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 "Fix Session B" sub-section (with Q3 schema gap carry-over).

### Session shape — DEPLOY with 5 ff-merges across 5 Rule 9 deploy gates within one Phase 4 verification day

Session opened per yesterday's NEXT_SESSION.md pointer scoping "P-49 W5 Reviews Analysis Table Fix Session A" per the 3-session corrective-fix plan locked 2026-05-28-b (Fix A this session + Fix B + Fix C). Claude completed start-of-session routine (branch verify ✅ / Group A doc reads / Rule 31 §3 read of the 2 P-49-W5 spec docs auto-loaded by the SessionStart hook / audit-shipped-state confirmation of the live `/competitor-reviews-analysis` page state per the 2026-05-28-b 12-divergence finding / Step 7b plain-terms summary) and awaited director's go-ahead.

Phase 1 (Q10 resolution) — director picked Recommended (plain text "N of M summarized" format on URL-row Column 8; matches existing count-cell style on the Competitor URLs sibling page; reversible later if richer affordance preferred).

Phase 2 (initial build) shipped 7 of the Fix Session A sub-items per spec doc §3:

1. **Toggle nav renamed** to the 5 verbatim labels (Competitor Content Table + Competitor Reviews Analysis Table + Reviews Analysis By Competitor Category Table + Reviews Analysis By Competitor Type Table + Comprehensive Analysis preserved as 5th per Q1 → A from 2026-05-28-b).
2. **URL row expanded to all 10 spec columns** left-to-right (Platform / Category / Type / Product Name / Results Rank / Competition Score / URL / Reviews Summary / Bulleted / Non-Bulleted).
3. **Column 8 "Reviews Summary" plain-text "N of M summarized" count display** on the URL row (Q2 → B + Q10 → A).
4. **NEW `ColumnVisibilityBar` checkbox bar** above the table for show/hide of the 10 columns (mirroring the Competitor Content Table pattern).
5. **Click-to-edit on URL-row cells 1-7** propagating to `CompetitorUrl` columns via the existing PATCH endpoint (single source of truth across sibling tables per Q6 → A).
6. **Click-to-edit on review-row body / star / reviewer / date** cells propagating to `CapturedReview` columns via the existing PATCH endpoint (single source of truth across URL detail page per Q6 → A).
7. **NEW pure helper module** `src/lib/competition-scraping/reviews-analysis-table-columns.ts` carrying the 10-column shape constants + width helpers + count-display helper + 18 new node:test cases pinning the table primitive against spec.

**Q3 schema-gap discovery during build.** Mid-build code-truth audit at the orchestrator's `saveReview` adapter (`orchestrator.ts:1254-1275`) revealed: `CapturedReview` prisma model has only a single `body` column; extractors (`amazon-review-extractor.ts:283`, `walmart-review-extractor.ts:305`) DO capture `title` separately but the adapter silently DROPS the title before persisting via `createCapturedReview`. The Q3 → A title+description display-time merge from 2026-05-28-b CAN'T ship without a schema migration. Director-approved Rule 14f mid-build picker (4-option) — director picked Recommended (Defer to Fix Session B + preserve Fix Session A's NO-schema-change scope intact). Q3 carry-over fully captured into the spec doc §3 Fix Session B item 6 + §4 RESOLVED-via-deferral note.

Phase 3 (initial-build deploy decision Rule 14f picker) — director picked Recommended (Deploy `8708343` to main). Initial deploy fired; ff-merge `fc24d38..8708343 main -> main` under Rule 9 deploy gate #1.

Phase 4 (initial-build director real-Chrome verification) — surfaced 8 redirects bundled into FF1 (see below).

### 4 FF cycles — 18 redirects bundled across one Phase 4 verification day

**FF1 `0b21c09` — 8 redirects bundled:**

- NEW Platforms filter chips above the table (mirrors Competitor Content Table chip strip).
- Visible cell borders on all 10 columns + the expand-toggle column.
- Fix overlapping columns (CSS grid layout → HTML `<table>` + `<colgroup>` with `tableLayout: fixed`).
- Edge-to-edge table (1280px maxWidth removed from outer page wrapper).
- Drag-to-resize column widths via NEW shared `ColumnResizeHandle` EXTRACTED from `UrlTable.tsx` into `src/app/projects/[projectId]/competition-scraping/components/ColumnResizeHandle.tsx`. Now used by BOTH the Competitor URLs sibling table + the Reviews Analysis Table.
- 3 button text renames (per-URL "Summarize all reviews within this product" + per-URL "Summarize each individual review under this product" + top-of-page "Summarize All Reviews From All Competitors").
- Helper module changes: `width: string` → `defaultWidth: number`; NEW `MIN/MAX_REVIEWS_COLUMN_WIDTH` + `resolveReviewsColumnWidth`.
- +2 new node:test cases for `resolveReviewsColumnWidth`.

Rule 9 deploy gate #2 — director Yes-to-Recommended. ff-merge `8708343..0b21c09 main -> main`. Phase 4 surfaced 5 more redirects bundled into FF2.

**FF2 `31c54a0` — 5 redirects bundled:**

- Drag handles work along the full length of the column header (removed `overflow: hidden` from `thStyle`).
- Sticky table header (CSS `position: sticky; top: 0`).
- Horizontal scrollbar locked to viewport (`maxHeight: calc(100vh - 280px)` on the outer table div).
- Column widths + visibility persist server-side via the existing `/table-preferences` endpoint with `reviewsTable:` key prefix namespace (**NO schema change** — extends the existing JSON value shape per spec doc directive).
- Right edge of table draggable via `ColumnResizeHandle` on the Actions column header (key `__actions__`).
- Per-review + per-competitor summary persistence-on-refresh via NEW `GET /api/projects/[projectId]/competition-scraping/review-analysis` route + NEW handler `src/lib/competition-scraping/handlers/review-analysis-list.ts` (closes D-8 — lifted forward from Fix Session B per director directive).
- +5 new node:test cases for `resolveActionsColumnWidth`.
- +1 NEW API route in `npm run build` count (67 → 68).

Rule 9 deploy gate #3 — director Yes-to-Recommended. ff-merge `0b21c09..31c54a0 main -> main`. Phase 4 surfaced 4 more redirects bundled into FF3.

**FF3 `12c042c` — 4 redirects bundled:**

- Colspan off-by-one fix (`tableColspan` corrected; explicit `border: none` on banner + ReviewsList `<td>`s).
- Click-to-expand on Column 8 cell now works (removed `<td>`-level `stopPropagation`; InlineCell components carry their own internal `stopPropagation`).
- Horizontal scrollbar now floats at viewport bottom via full-viewport flex-column page restructure (`height: 100vh` + `display: flex; flexDirection: column` + `overflow: hidden` on outer page wrapper; table region takes `flex: 1` of remaining viewport with `minHeight: 0`).
- Blue "Summarize each individual review" button moved ABOVE green "Summarize all reviews within this product" button.
- `ColumnResizeHandle` gained NEW `showRestingLine` prop (default true for URLs page; set false on Reviews Analysis Table so the full-height column lines don't bleed into the expanded sub-rows).

Rule 9 deploy gate #4 — director Yes-to-Recommended. ff-merge `31c54a0..12c042c main -> main`. Phase 4 surfaced 1 more redirect bundled into FF4.

**FF4 `3fbe12e` — Column 8 + Column 9 cells become expand/collapse triggers with state-aware text:**

- Split single `expanded` state into `reviewsExpanded` (Column 8 toggle) + `bannerExpanded` (Column 9 toggle).
- Leftmost ▸/▾ cell becomes "expand both" master toggle.
- Auto-expand on per-URL AI run kickoff + on fresh in-session per-competitor summary land.
- NEW pure helpers `computeReviewsSummaryCellAffordance` + `computeBannerCellAffordance` in the helper module.
- +9 new node:test cases pinning text states + clickability semantics.

Rule 9 deploy gate #5 — director Yes-to-Recommended. ff-merge `12c042c..3fbe12e main -> main`. **Director Phase 4 verbatim PASS verdict on FF4: "everything passed".**

### Scoreboard verification

Pre-deploy /scoreboard 5/5 GREEN at entry baselines = W5 Session 4 exit = 2026-05-27-c locked:

| Check | Entry baseline (W5 Session 4 exit) | Mid-session (post-initial `8708343`) | Mid-session (post-FF1 + FF2) | Post-FF4 (FINAL) |
|---|---|---|---|---|
| Root tsc | clean | clean | clean | clean |
| Extension tsc | clean | clean | clean | clean |
| Extension `npm test` | 910/910 | **910/910 UNCHANGED** | **910/910 UNCHANGED** | **910/910 UNCHANGED** |
| src/lib `node:test` | 950/950 | **968/968** (+18 initial reviews-analysis-table-columns tests) | **975/975** (+7 cumulative across FF1 + FF2 = +2 `resolveReviewsColumnWidth` + +5 `resolveActionsColumnWidth`) | **984/984** (+9 FF4 affordance helper tests; FF3 was layout-only) |
| `npm run build` routes | 67 | 67 UNCHANGED | **68** (+1 NEW GET /review-analysis route in FF2) | **68 UNCHANGED** |
| Check 6 Playwright | SKIPPED Rule 27 | SKIPPED | SKIPPED | SKIPPED |

**NEW baselines locked from this session:** src/lib `node:test` = **984/984** + `npm run build` = **68 routes** + extension `npm test` = **910/910 UNCHANGED**.

### Schema-change-in-flight transitions

STAYS NO entire session. Entry NO. No schema work shipped this session. Q3 schema-gap discovery during build led to director-approved Rule 14f deferral to Fix Session B — Fix Session A's NO-schema-change scope preserved intact. Final state at session end: NO. Fix Session B entry state: YES (Q3 schema migration carried over — additive nullable `CapturedReview.title String?` column).

### Calibration data point — 7/7 = 100% Yes-to-Recommended this session

The 7 pickers this session: 1 Q10 resolution picker (plain text Recommended) + 1 Q3 schema-gap discovery picker (Defer to Fix Session B Recommended) + 5 Rule 9 deploy gates (initial + FF1 + FF2 + FF3 + FF4 all Recommended). Running cumulative across recent 10 sessions: **96/99 = 97.0% Yes-to-Recommended** (was 89/92 = 96.7% at session entry).

### NEW reusable PATTERN memorialized — Cell-level click handlers + state-aware text affordance Pattern (FF4)

**Pattern statement.** When a table cell needs to toggle a sub-surface (expand/collapse a sub-row group, open a detail panel, etc.) AND the cell's text needs to reflect the current state of that sub-surface, do BOTH of the following together:

1. **Split single boolean state into per-toggle state** — instead of one `expanded` flag, model each toggle as its own state (e.g., `reviewsExpanded` + `bannerExpanded`). Each cell click reads + flips its own state independently.
2. **Extract pure helper(s) that compute the cell's text + clickability based on current state** — e.g., `computeReviewsSummaryCellAffordance(state, hasContent, count)` returns `{ text, clickable }`. Pin the text states + clickability semantics in node:test cases so the cell rendering stays correct as state grows.

**Canonical reference:** FF4 `3fbe12e` split `expanded` → `reviewsExpanded` + `bannerExpanded` on the Reviews Analysis Table, made Column 8 + Column 9 cells expand/collapse triggers with state-aware text. NEW pure helpers `computeReviewsSummaryCellAffordance` + `computeBannerCellAffordance` in `src/lib/competition-scraping/reviews-analysis-table-columns.ts` with +9 new node:test cases.

**Why it's reusable.** Any table with sub-row groups (Reviews Analysis Table, future Category/Type tables with expandable competitor groups) benefits. The pure-helper extraction also feeds directly into node:test coverage with NO React component instantiation overhead.

**Cross-reference:** complements the "Pure helpers extracted from .tsx component file for node:test coverage" Pattern from §B 2026-05-29 W4 Captured Reviews UI Session 1 above (the W4 session extracted pure helpers from `.tsx` for node:test coverage; today's Fix Session A FF4 extends the precedent by also using the extracted helpers to drive state-aware UI text).

### NEW positive pattern — Q3 schema-gap discovery during build + director-approved Rule 14f deferral preserves session scope

Mid-build code-truth audit surfaced a schema gap that would have un-scoped Fix Session A (which was deliberately NO-schema-change). Rule 14f mid-build picker offered 4 options including "Defer to Fix Session B" Recommended; director picked Recommended. The Q3 carry-over was captured cleanly into the spec doc §3 Fix Session B item 6 + §4 RESOLVED-via-deferral note. Rule 14f's mid-build use here is a CONFIRMING data point for the rule's design — the picker's "I have a question first" escape-hatch + the 4-option shape made the deferral decision easy to surface without un-scoping Fix Session A.

### §A sections affected by this entry

- **§A.7 (cost-cap framing)**, **§A.10 + §A.11 + §A.12** remain superseded by §B 2026-05-27 (W5 Session 1.5 design lock).
- **§A.13 prompt content + the §B 2026-05-27 line-1474 reference to "7 v1 prompts locked during planning"** remain superseded by §B 2026-05-27-b.
- **No new §A supersedences in this entry** — Fix Session A is a corrective fix on the already-shipped Reviews Analysis Table page surface and re-uses the per-batch endpoint architecture from §B 2026-05-27-b + the v3 critique-only theme-emergent prompt shape from §B 2026-05-27-c + the PATCH endpoint from §B 2026-05-27-c (all PRESERVED). The new behaviors (5-toggle nav + 10 columns + show/hide + click-to-edit + Column 8 plain-text count + drag-to-resize via shared `ColumnResizeHandle` + sticky header + viewport-floating scrollbar + persistence-on-refresh via NEW GET endpoint + Column 8/9 expand-collapse with state-aware text) live in §3 of the per-page spec doc, not in §A.

### TaskList sweep this session (Rule 26)

~15 in-session tasks; all completed cleanly. The Q3 schema-gap carry-over was captured DIRECTLY into the spec doc §3 Fix Session B item 6 + §4 RESOLVED-via-deferral note — NOT into the TaskList per Rule 14e (spec-doc captures for cross-session work). ZERO open `DEFERRED:` tasks at session end. ZERO open `in_progress` tasks at session end (apart from the end-of-session doc-batch fire itself). Fix Session B IS the next-session task per (a.108).

### Per Rule 23 Change Impact Audit

PLOS-side UI + src/lib module surface + 1 NEW API route (`GET /api/projects/[projectId]/competition-scraping/review-analysis` in FF2) + 1 NEW shared component (`ColumnResizeHandle` in FF1) + 1 NEW helper module (`reviews-analysis-table-columns.ts`). No data risk to existing rows (FF2's GET endpoint is read-only over existing `ReviewAnalysis` rows; table-preferences extension reuses existing JSON value shape; no schema work this session per the Q3 deferral). Zero downstream W#1 cross-tool impact.

### Architecture preserved across the corrective fix

- **Per-batch endpoint architecture from §B 2026-05-27-b (W5 Session 2 ship)** — PRESERVED across all 5 deploys this session. Fix Session A re-used the existing `/api/projects/[projectId]/competition-scraping/review-analysis/run-batch/route.ts` thin shim + `review-analysis-run-batch.ts` handler dispatch shape.
- **v3 critique-only theme-emergent prompt shape from §B 2026-05-27-c (W5 Session 3 ship)** — PRESERVED across Fix Session A. No prompt iteration this session.
- **PATCH endpoint at `/api/projects/[projectId]/competition-scraping/review-analysis/[analysisId]/route.ts` from §B 2026-05-27-c (W5 Session 3 ship)** — PRESERVED across Fix Session A. Reuse for cell-level edits via Edit affordance. Fix Session B will extend it to ACCEPT PER_REVIEW edits (currently rejected at line 181-193) per the Q9 + D-11 fix scope.
- **NEW shared `ColumnResizeHandle` component (FF1)** — extracted from `UrlTable.tsx`; both sibling tables now share. Reusable for future Category + Type pages in the corrective rebuild.

### Cross-references

- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-29 (INFORMATIONAL) — captures the same outcome from the meta-pattern perspective (with the 4 observations + NEW reusable PATTERN memorialized + Q3 schema-gap discovery NEW positive pattern + P-43 cwd-leak Pattern Class running tally update).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 + Rule 9 + Rule 14f + Rule 18 + Rule 23 + Rule 26 + Rule 27 + Rule 30 — all standing rules; no new rules drafted this session.
- `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` — §3 pointer table UPDATED — Reviews Analysis Table page status flipped from "🔴 PARTIAL — shipped at W5 Sessions 2 + 3 with multiple divergences" to "🟡 PARTIAL — Fix Session A ✅ DEPLOYED-AND-VERIFIED 2026-05-29; Fix Sessions B + C remaining".
- `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` — Status field flipped to "Fix Session A SHIPPED-AND-VERIFIED 2026-05-29 — D-1 through D-7 closed; D-8 PARTIALLY closed in FF2 (lifted forward from Fix Session B); D-9/D-10/D-11 + Q3 schema gap carried to Fix Session B" + §3 Fix Session A items marked ✅ DONE + Q10 → A RESOLVED + §3 Fix Session B item 6 added carrying Q3 schema gap + §4 reduced to Q8 + Q9 open + Q10 RESOLVED note.
- `docs/polish-item-specs/P-49-W5-S4-category-page.md` UNCHANGED this session (Category page work pushed back behind Fix Sessions A + B + C).
- `docs/polish-item-specs/P-49-W5-S5-type-page.md` UNCHANGED this session (Type page work pushed back behind Fix Sessions A + B + C + Category Sessions 1-3).
- `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md` UNCHANGED this session.
- §B 2026-05-28-b above (W5 Reviews Phase 2 master-spec-backfill + 3-session corrective-fix plan locked) — immediate predecessor entry; the 3-session plan's Fix Session A is what this entry executes + ships. Fix Session B + C remain queued.
- §B 2026-05-28 above (W5 Session 4 scope-misread rollback + corrective planning) — the original 5-session corrective rebuild plan; Category + Type Sessions still pushed back behind Fix Sessions B + C.
- §B 2026-05-27-c above (W5 Session 3 Per-Competitor deploy + 2-FF cycles) — the same-day multi-redirect bundling Pattern's original §Entry; today's 4-FF / 18-redirect ceiling extends the Pattern.
- §B 2026-05-27-b above (W5 Session 2 per-batch endpoint + Per-Review Summarize ship) — the per-batch endpoint architecture PRESERVED across Fix Session A.
- §B 2026-05-27 above (W5 Session 1.5 design lock) — predecessor entry; partially superseded by the 3-session corrective-fix plan on the Reviews Analysis Table page surface.

**Closing line:** P-49 W5 Reviews Analysis Table Fix Session A ✅ DEPLOYED-AND-VERIFIED 2026-05-29 with 4 bundled fix-forward cycles on `workflow-2-competition-scraping`. 5 deploys + 18 Phase-4 redirects bundled within one verification day — NEW RECORD for the Same-day Phase 4 multi-redirect bundling Pattern beating the prior 3-FF max. Q3 schema-gap discovery during build led to director-approved Rule 14f deferral to Fix Session B (NEW positive pattern preserving session scope). NEW reusable PATTERN memorialized: Cell-level click handlers + state-aware text affordance Pattern. 7/7 = 100% Yes-to-Recommended this session; running cumulative 96/99 = 97.0%. Schema-change-in-flight flag STAYS NO entire session. NEW baselines: src/lib `node:test` = **984/984** + `npm run build` = **68 routes** + extension = 910/910 UNCHANGED. **Closes (a.107) RECOMMENDED-NEXT** = P-49 W5 Reviews Analysis Table Fix Session A ✅ DEPLOYED-AND-VERIFIED 2026-05-29. **Opens (a.108) RECOMMENDED-NEXT = P-49 W5 Reviews Analysis Table Fix Session B** on `workflow-2-competition-scraping` (with Q3 schema gap carry-over). **FOURTEENTH build/deploy-session §B entry per Rule 18 — SIXTH W5 entry.** The next §B entry will land at the close of Fix Session B (write-backs + per-review Edit + persistence-on-refresh re-verify + Q3 schema migration shipped per spec doc §3 "Fix Session B" sub-section).

---

## §B 2026-05-30 — `session_2026-05-30_p49-w5-reviews-analysis-table-fix-session-b` — Workstream 5 Reviews Analysis Table Fix Session B ✅ DEPLOYED-AND-VERIFIED 2026-05-30 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — the SECOND of the 3-session corrective-fix plan locked 2026-05-28-b — initial build commit `351342a` (19 files +1115/-63) plus ONE fix-forward commit FF1 `add00ad` (4 files +257/-55 — the only Phase-4 redirect) all ff-merged to main under 2 Rule 9 deploy gates — FIFTEENTH build/deploy-session §B entry per Rule 18; SEVENTH W5 entry — director Phase 4 verbatim PASS verdict: "Both worked now, everything passed"; closes D-8 + D-9 + D-10 (bulleted half) + D-11 + the Q3 schema-gap carry-over from Fix Session A; Q3 schema-change-in-flight YES entry → FLIPPED YES → NO at the initial deploy push; NEW reusable PATTERN memorialized — "Write-back-on-cache-hit gap"; AUDIT FINDING (Rule 31 audit-shipped-state) — the "Overall Analysis — Captured Reviews" box already rendered (shipped P-46 W2 Session 4), so D-10's "box missing" sub-claim was stale, only the write-back was the real gap

**Closes (a.108) RECOMMENDED-NEXT** = P-49 W5 Reviews Analysis Table Fix Session B ✅ DEPLOYED-AND-VERIFIED 2026-05-30 (build `351342a` + FF1 `add00ad`). **Opens (a.109) RECOMMENDED-NEXT = P-49 W5 Reviews Analysis Table Fix Session C** on `workflow-2-competition-scraping` per `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 "Fix Session C" sub-section (NEW per-competitor non-bulleted AI flow + Auto-create non-bulleted button + Excel export D-7 + drag-to-reorder review rows D-6 + NEW `CapturedReview.sortRankInReviewsTable Int?` schema column + Q8 flow-naming; Schema-change-in-flight YES entry).

### Session shape — DEPLOY with 2 ff-merges across 2 Rule 9 deploy gates

Session opened per yesterday's NEXT_SESSION.md pointer scoping "P-49 W5 Reviews Analysis Table Fix Session B" per the 3-session corrective-fix plan. Claude completed the start-of-session routine (branch verify / Group A doc reads / Rule 31 §3 read of the 2 P-49-W5 spec docs auto-loaded by the SessionStart hook / audit-shipped-state confirmation of the live `/competitor-reviews-analysis` page + URL detail page state) and awaited director go-ahead.

**Phase 1 (Q9 + Q3 resolutions).** Q9 (per-review summary Edit UI) — director picked Recommended (same Edit-button pattern as the banner row). Q3 (schema-change shape) — director picked Recommended (add the column this session); a free-text "explain in simpler terms" interjection landed on Q3 before a re-framed plain-terms picker resolved Recommended (a positive director-comprehension data point, NOT a redirect — the framing was clarified, not reversed). Schema-change-in-flight FLIPPED NO → YES at session entry per the Q3 carry-over.

**Phase 2 (build) — `351342a` (19 files +1115/-63):**

1. **Q3 schema column** — NEW additive nullable `CapturedReview.title` column (`prisma db push` 1.50s, zero data loss). Extension orchestrator `saveReview` adapters (amazon/ebay/etsy/walmart) now pass the captured title through to `createCapturedReview` (previously silently dropped). PLOS POST (`url-reviews.ts`) + PATCH (`reviews-by-id.ts`) + wire shape + shared-types accept/persist title. Review-row body cell renders `'title. body'` display-merge via NEW pure `mergeTitleAndBody` helper (formatRead; editing targets the body column only — never corrupts the title column).
2. **D-9** — per-review (PER_REVIEW) AI run writes summary back to `CapturedReview.analysis` (TipTap doc).
3. **D-10 (bulleted half)** — per-competitor (PER_PRODUCT bulleted) AI run appends summary to the bottom of `CompetitorUrl.overallAnalyses["reviews"]`.
4. **D-11** — `review-analysis-update.ts` PATCH now accepts PER_REVIEW edits + syncs `CapturedReview.analysis` on edit (single source of truth, Q6). NEW `PerReviewSummaryCell` component + `analysisId` threaded through the per-review batch response + page hydration so cells are editable live + post-refresh.
5. **D-8** — persistence-on-refresh confirmed.
6. NEW pure helpers: `mergeTitleAndBody` (reviews-analysis-table-columns.ts); `summaryStringToContentNodes` / `summaryStringToTipTapDoc` / `appendSummaryToTipTapDoc` (tiptap-helpers.ts).

**Audit finding during Phase 2 (Rule 31 audit-shipped-state mandate paid off).** The "Overall Analysis — Captured Reviews" box on the URL detail page ALREADY rendered — it shipped in P-46 W2 Session 4. So D-10's "box doesn't render" sub-claim from the 2026-05-28-b divergence catalogue was stale; only the write-back was the real gap. Auditing the shipped state first saved building a box that already existed.

**Phase 3 (initial-build deploy decision).** Director picked Recommended (Deploy `351342a` to main). Initial deploy fired; ff-merge to main under Rule 9 deploy gate #1. Schema-change-in-flight FLIPPED YES → NO at this push.

**Phase 4 (initial-build director real-Chrome verification) — surfaced 1 redirect bundled into FF1.**

### FF1 `add00ad` — the only Phase-4 redirect — NEW reusable PATTERN "Write-back-on-cache-hit gap"

**Symptom.** Per-review + per-competitor summaries generated BEFORE the deploy never appeared on the URL detail page after the build shipped.

**Root cause.** The initial build only wrote back on FRESH AI persists. When the per-batch handler took a cache HIT (a summary already existed in the `ReviewAnalysis` cache from a pre-deploy run), it returned early and skipped the write-back to `CapturedReview.analysis` / `CompetitorUrl.overallAnalyses["reviews"]`. So any data summarized before the write-back code existed stayed invisible.

**Fix (FF1 `add00ad`, 4 files +257/-55).** Fire both write-backs on cache hits too. Per-review REPLACE is idempotent. Per-competitor APPEND is guarded by NEW `tipTapDocContainsSummary` content-dedup so re-runs don't duplicate. Factored into one shared `writeBackPerCompetitorReviews` helper. NEW helpers: `tipTapDocToPlainText` + `tipTapDocContainsSummary`. Ff-merged to main under Rule 9 deploy gate #2.

**The reusable Pattern.** When an AI-run side effect (write-back, notification, downstream sync) is wired ONLY into the fresh-persist branch, it silently skips already-cached data. Prevention: fire the side effect on cache hits too; for append-semantics targets, add a content-dedup guard so the side effect stays idempotent across re-runs. Complements the "Edit affordance for cached AI output Pattern" (§B 2026-05-27-c) — both treat the cache-hit branch as a first-class path.

**Director's verbatim Phase 4 verification result on FF1: "Both worked now, everything passed".**

### Scoreboard

Entry baselines = Fix Session A exit = 2026-05-29 locked (root tsc clean / extension tsc clean / **910 ext** / **984 src/lib** / **68 routes**). Post-FF1 /scoreboard 5/5 GREEN at NEW LOCKED baseline:

| Check | Entry | Exit | Delta |
| --- | --- | --- | --- |
| Root tsc | clean | clean | unchanged |
| Extension tsc | clean | clean | unchanged |
| Extension `npm test` | 910/910 | 910/910 | UNCHANGED (PLOS-side + extension orchestrator change; no extension test delta) |
| src/lib `node:test` | 984/984 | **1018/1018** | **+34** (mergeTitleAndBody 7 + tiptap summary/append helpers 12 + tiptap plaintext/contains 5 + run-batch write-back + cache 6 + review-analysis-update PER_REVIEW 2 + url-reviews title 3 + reviews-by-id title 2, minus 1 replaced test) |
| `npm run build` | 68 routes | **68 routes** | UNCHANGED (PATCH reuses existing [analysisId] route; GET /review-analysis already existed) |
| Playwright | — | SKIPPED | per Rule 27 (build/deploy session) |

### Affected §A sections (informational — §A FROZEN per Rule 18)

- §A.16 schema — the NEW `CapturedReview.title String?` column is additive + nullable + zero data loss; it complements the existing `body` / `analysis` / `sortRank` columns. §A is frozen; this supersedence note lives in §B only.
- The per-review + per-competitor write-back targets (`CapturedReview.analysis` + `CompetitorUrl.overallAnalyses["reviews"]`) were already specified in the master verbatim spec; this entry records that both write-back paths are now WIRED (D-9 + D-10 bulleted half).

### Cross-references

- §B 2026-05-29 above (W5 Fix Session A deploy + 4-FF cascade) — the predecessor entry; Q3 schema-gap was DISCOVERED there + DEFERRED to this session, now CLOSED.
- §B 2026-05-27-c above (W5 Session 3 Per-Competitor deploy) — the "Edit affordance for cached AI output Pattern" + the per-batch flow-dispatch architecture that this session's write-back hooks extend.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-30 — the INFORMATIONAL entry capturing the "Write-back-on-cache-hit gap" Pattern + the audit-shipped-state positive win + the P-43 running tally.
- `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 Fix Session B (now ✅ DONE) + §4 (reduced to Q8); `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §3 pointer table (Reviews Analysis Table page flipped to "Fix Sessions A + B ✅ DEPLOYED-AND-VERIFIED; Fix Session C remaining").

**Closing line:** P-49 W5 Reviews Analysis Table Fix Session B ✅ DEPLOYED-AND-VERIFIED 2026-05-30 (build `351342a` + FF1 `add00ad`) under 2 Rule 9 deploy gates on `workflow-2-competition-scraping`. Closes D-8 + D-9 + D-10 (bulleted half) + D-11 + the Q3 schema-gap carry-over. NEW reusable PATTERN memorialized: "Write-back-on-cache-hit gap". Rule 31 audit-shipped-state mandate paid off (caught D-10's stale "box missing" sub-claim). Schema-change-in-flight YES → NO at deploy. 5/5 = 100% Yes-to-Recommended this session; running cumulative 101/104 = 97.1%. NEW baselines: src/lib `node:test` = **1018/1018** + `npm run build` = **68 routes UNCHANGED** + extension = 910/910 UNCHANGED. **Closes (a.108) RECOMMENDED-NEXT.** **Opens (a.109) RECOMMENDED-NEXT = P-49 W5 Reviews Analysis Table Fix Session C.** **FIFTEENTH build/deploy-session §B entry per Rule 18 — SEVENTH W5 entry.** The next §B entry will land at the close of Fix Session C (NEW per-competitor non-bulleted AI flow + Excel export + drag-to-reorder review rows + `CapturedReview.sortRankInReviewsTable Int?` schema column per spec doc §3 "Fix Session C" sub-section).

---

## §B 2026-05-31 — `session_2026-05-31_p49-w5-reviews-analysis-table-fix-session-d` — Workstream 5 Reviews Analysis Table Fix Session D ✅ DEPLOYED-AND-VERIFIED 2026-05-31 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — RE-SEQUENCED ahead of the planned Fix Session C per director's session-start Rule 14f pick — initial build commit `4db2b5c` (8 files +1052/-276) plus ONE fix-forward commit FF1 `889667e` (4 files +318/-54 — the only Phase-4 redirect) all ff-merged to main under 2 Rule 9 deploy gates — SIXTEENTH build/deploy-session §B entry per Rule 18; EIGHTH W5 entry — director Phase 4 verdict: table feature "Both worked"; FF1 "Pass"; the "Overall Analysis — Captured Reviews" box on the URL detail page is now a read-only 3-column traceability table (Category / Complaint / source captured reviews + star counts); NEW reusable PATTERN memorialized — "Transient DB-auth 500 under AI-batch load → client-side autosave retry"; Schema-change-in-flight NO entire session (the structured traceability shape lives in the EXISTING `ReviewAnalysis.analysisJson` Json column)

**Closes (a.109) RECOMMENDED-NEXT with a twist** — (a.109) was "P-49 W5 Reviews Analysis Table Fix Session C"; this session RE-SEQUENCED and shipped **Fix Session D** instead ✅ DEPLOYED-AND-VERIFIED 2026-05-31 (build `4db2b5c` + FF1 `889667e`); Fix Session C is NOT done — it remains pending. **Opens (a.110) RECOMMENDED-NEXT = P-49 W5 Reviews Analysis Table follow-ups** on `workflow-2-competition-scraping`, in order: (1) delete entries from the Overall Analysis traceability table individually + in bulk (NEEDS a design chat — reverses this session's read-only decision); (2) deleted-reviews sync bug on the `/competitor-reviews-analysis` table (cache-invalidation fix); THEN (3) Fix Session C (non-bulleted flow + Excel export D-7 + drag-to-reorder review rows D-6 + NEW `CapturedReview.sortRankInReviewsTable Int?` schema column + Q8 flow-naming; Schema-change-in-flight YES entry for THAT piece).

### Session shape — DEPLOY with 2 ff-merges across 2 Rule 9 deploy gates; the corrective-fix plan re-sequenced at session start

Session opened per yesterday's NEXT_SESSION.md pointer scoping "Fix Session C". Claude completed the start-of-session routine (branch verify / Group A doc reads / Rule 31 §3 read of the P-49-W5 spec docs / audit-shipped-state confirmation of the URL detail page state) and awaited director go-ahead.

**Phase 1 (re-sequence + design).** During the output-shape design discussion for the Fix Session C non-bulleted flow, the director paused the initial 2-question output-shape design picker to ask "what were you referring to" (a comprehension check — NOT a reversal) and then re-pasted the 2026-05-30 §1 ADDENDUM (the 3-column traceability-table feature, originally scoped as "Fix Session D" AFTER Fix C). Via a Rule 14f picker, the director chose to build the traceability table THIS session ahead of Fix C. Three further design-decision pickers resolved Recommended: (a) box layout — table-on-top + notes-below; (b) editability — read-only generated table; (c) source-text — full review text (title+body merge) in the source column. So Fix Session D was built; Fix Session C remains pending.

**Phase 2 (build) — `4db2b5c` (8 files +1052/-276):**

1. **Structured per-competitor output (prompt v3→v4).** The per-competitor bulleted prompt now emits STRUCTURED output `{ categories: [{ name, bullets: [{ text, reviewRefs }] }] }` instead of free-text bullets. Input reviews are labeled R1..Rn so the model cites by short label. PROMPT_VERSION bump invalidates the cache for fresh structured runs.
2. **R-label resolution (`resolveReviewRefs`).** The per-batch handler maps each bullet's R-labels → real `CapturedReview` ids by prompt position, then persists `analysisJson` as `{ summary (flattened, back-compat) + categories (structured) }`.
3. **Back-compat (`flattenCategoriesToSummaryString`).** The flattened `summary` string keeps the main table's Column 9 + Edit affordance + cache reads working unchanged; legacy `{ summary }`-only rows render via the flattened path.
4. **NEW read-only 3-column traceability table (`ReviewsTraceabilityTable.tsx`)** on the URL detail page — Category / Complaint / source captured reviews (full review text via title+body merge + star count). Category cells rowspan-grouped. NEW pure helpers `reviews-traceability.ts` (parse + buildRows + mergeReviewTitleBody).
5. **URL detail page wiring (`UrlDetailContent.tsx`).** Fetches the latest PER_PRODUCT analysis for the URL via the existing `GET /review-analysis` route, renders the table on top, and relabels the free-text box "Your notes — Captured Reviews" below it. Removed the Fix B FF1 box free-text write-back (the box now renders the table from the structured row; director-typed box content untouched).

**Phase 3 (initial-build deploy decision).** Director picked Recommended (Deploy `4db2b5c` to main). Ff-merge to main under Rule 9 deploy gate #1.

**Phase 4 (initial-build director real-Chrome verification) — surfaced 1 redirect bundled into FF1.**

### FF1 `889667e` — the only Phase-4 redirect — NEW reusable PATTERN "Transient DB-auth 500 under AI-batch load → client-side autosave retry"

**Symptom.** Director reported that many "Your Analysis" + notes autosave boxes showed "Save failed — HTTP 500" / "Failed to resolve project workflow", and that "a page refresh fixes it."

**Root cause.** Those rich-text boxes PATCH on every debounced edit. Each request runs `verifyProjectWorkflowAuth`, which performs a `projectWorkflow.upsert` (a DB write). During and after a heavy AI summarization run the Supabase connection pool transiently saturates → the upsert throws → the route 500s → the box is stranded until a manual refresh. This is a PRE-EXISTING transient-infrastructure exposure that the heavy bulleted run surfaced — NOT caused by the Fix D table work (the per-review save path was untouched this session).

**Fix (FF1 `889667e`, 4 files +318/-54).** NEW shared `src/lib/rich-text/save-with-retry.ts` transparently retries transient failures (HTTP 5xx + network throws) with exponential backoff (500/1000/2000ms, 4 attempts); 4xx is NOT retried; a generation-cancel hook lets a newer keystroke supersede an in-flight retry. Applied to BOTH `PerItemAnalysisBox` + `OverallAnalysisBox`. A brief DB hiccup now self-heals silently. Ff-merged to main under Rule 9 deploy gate #2.

**The reusable Pattern.** Any per-keystroke / debounced autosave that routes through `verifyProjectWorkflowAuth`'s `projectWorkflow.upsert` DB write needs transient-retry resilience under heavy-AI-run Supabase pool saturation. Prevention: wrap the save in a shared retry helper that backs off on 5xx/network throws (NOT 4xx) and supersedes on a newer generation. Reusable for every PLOS rich-text autosave surface.

**Director's verbatim Phase 4 verification results: table feature "Both worked"; FF1 "Pass".**

### Scoreboard

Entry baselines = Fix Session B exit = 2026-05-30 locked (root tsc clean / extension tsc clean / **910 ext** / **1018 src/lib** / **68 routes**). Post-FF1 /scoreboard all GREEN at NEW LOCKED baseline:

| Check | Entry | Exit | Delta |
| --- | --- | --- | --- |
| Root tsc | clean | clean | unchanged |
| Extension tsc | clean | clean | unchanged |
| Extension `npm test` | 910/910 | 910/910 | UNCHANGED (PLOS-side only session) |
| src/lib `node:test` | 1018/1018 | **1038/1038** | **+20** (+11 Fix D: structured prompt/validator + `resolveReviewRefs` + `flattenCategoriesToSummaryString` + reviews-traceability parse/buildRows; +9 save-with-retry) |
| `npm run build` | 68 routes | **68 routes** | UNCHANGED (the table reuses the existing GET /review-analysis route — no new route) |
| Playwright | — | SKIPPED | per Rule 27 (build/deploy session) |

### Affected §A sections (informational — §A FROZEN per Rule 18)

- The per-competitor analysis output shape evolves from free-text `{ summary }` to structured `{ summary (flattened) + categories }` within the EXISTING `ReviewAnalysis.analysisJson` Json column — no schema migration, no new column. §A is frozen; this supersedence note lives in §B only. The flattened `summary` string is retained for back-compat with the main table + legacy rows.
- The "Overall Analysis — Captured Reviews" box on the URL detail page changes role: it no longer renders the per-competitor bulleted free-text write-back (added Fix B FF1) — that area now renders the read-only `ReviewsTraceabilityTable`, and the adjacent free-text box is relabeled "Your notes — Captured Reviews" for director-typed content. This supersedes the §B 2026-05-30 D-10-bulleted-half write-back-into-the-box behavior (§A frozen; supersedence captured in §B only).

### Cross-references

- §B 2026-05-30 above (W5 Fix Session B deploy + FF1 write-back-on-cache-hit) — the predecessor entry; this session replaces that box write-back with the structured table render.
- §B 2026-05-27-c above (W5 Session 3 Per-Competitor bulleted deploy) — the v3 critique-theme prompt + per-batch flow-dispatch architecture this session's v4 structured prompt extends.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-31 — the INFORMATIONAL entry capturing the "Transient DB-auth 500 → autosave retry" Pattern + the re-sequence process note + the 2 new follow-up items + the P-43 running tally.
- `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §2 (NEW 2026-05-31 entry) + §3 (Fix Session D scope now ✅ DONE + the 2 NEW follow-up items) + §4 (NEW delete-from-table design question); `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §3 pointer table (Reviews Analysis Table page now "Fix Sessions A + B + D ✅ DEPLOYED-AND-VERIFIED; Fix Session C + 2 new follow-ups remaining").

**Closing line:** P-49 W5 Reviews Analysis Table Fix Session D ✅ DEPLOYED-AND-VERIFIED 2026-05-31 (build `4db2b5c` + FF1 `889667e`) under 2 Rule 9 deploy gates on `workflow-2-competition-scraping` — RE-SEQUENCED ahead of Fix Session C per director's Rule 14f pick. The "Overall Analysis — Captured Reviews" box is now a read-only 3-column traceability table (Category / Complaint / source reviews + star counts). NEW reusable PATTERN memorialized: "Transient DB-auth 500 under AI-batch load → client-side autosave retry". Schema-change-in-flight NO entire session (structured shape in the existing `ReviewAnalysis.analysisJson` Json column). 7/7 = 100% Yes-to-Recommended this session; running cumulative 108/111 = 97.3%. NEW baselines: src/lib `node:test` = **1038/1038** + `npm run build` = **68 routes UNCHANGED** + extension = 910/910 UNCHANGED. **Closes (a.109) RECOMMENDED-NEXT with a twist.** **Opens (a.110) RECOMMENDED-NEXT = P-49 W5 Reviews Analysis Table follow-ups** (delete-from-table feature + deleted-reviews sync bug + THEN Fix Session C). **SIXTEENTH build/deploy-session §B entry per Rule 18 — EIGHTH W5 entry.** The next §B entry will land at the close of the (a.110) follow-ups (delete-from-table feature + deleted-reviews sync bug) and/or Fix Session C.

---

## §B 2026-05-31-b — `session_2026-05-31-b_p49-w5-fu1-edit-delete-overall-analysis-box-plus-fu2-deleted-reviews-sync-bug` — Workstream 5 Reviews Analysis Table FU-1 (EDIT + delete entries in the "Overall Analysis — Captured Reviews" traceability box, individually + in bulk) + FU-2 (deleted-reviews sync bug) ✅ DEPLOYED-AND-VERIFIED 2026-05-31-b end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — single build commit `7d89d75` (10 files) ff-merged to main under ONE Rule 9 deploy gate — SEVENTEENTH build/deploy-session §B entry per Rule 18; NINTH W5 entry — director Phase 4 verbatim verdict: "Everything passed"; FU-1 reverses Fix Session D's read-only decision (the traceability box is now fully editable); TWO NEW reusable PATTERNS memorialized — "Cross-page stale client cache → re-fetch on tab refocus (visibilitychange/focus)" + "Structured-edit PATCH re-derives the flattened back-compat field"; Schema-change-in-flight NO entire session (the structured edit lives in the EXISTING `ReviewAnalysis.analysisJson` Json column)

**Closes (a.110) RECOMMENDED-NEXT partially** — (a.110) listed three things in order: (1) edit/delete entries from the traceability box, (2) the deleted-reviews sync bug, (3) THEN Fix Session C. This session shipped (1) [expanded by the director at session start from delete-only to EDIT + delete] + (2) ✅ DEPLOYED-AND-VERIFIED 2026-05-31-b (build `7d89d75`); (3) Fix Session C was always a separate later session and remains PENDING. **Opens (a.111) RECOMMENDED-NEXT = AI model registry doc + central model-selection methodology rule + Opus 4.8 rollout** on the **`main`** track (platform-wide; spans W#1 Keyword Clustering + W#2 Competition Scraping) — captured as NEW ROADMAP entry P-52; deferred to its own main-track session because it touches the live W#1 tool.

### Session shape — DEPLOY with 1 ff-merge under 1 Rule 9 deploy gate; director added TWO new issues at session start

Session opened per yesterday's NEXT_SESSION.md pointer scoping the (a.110) follow-ups. At session start the director added TWO new issues. **Issue 1 EXPANDED the already-queued FU-1** from delete-only to EDIT + delete of entries in the (until-now read-only) 3-column traceability table — reversing Fix Session D's read-only decision. **Issue 2** = create a central AI-model registry doc + a methodology rule + roll Opus 4.8 (`claude-opus-4-8`) into every model picker. A 2-question session-direction Rule 14f picker (both Yes-to-Recommended) resolved: tackle the box edit/delete + the sync bug NOW; defer the model work to its own platform-wide `main`-track session (Q2=A) because it spans W#1 + W#2 and touches the live W#1 tool. Issue 2 was captured as NEW ROADMAP entry P-52 after a Rule 24 pre-capture search (PRIOR TREATMENT FOUND in `docs/REVIEWS_PHASE_2_DESIGN.md` §A.7 W#2 model policy + `docs/MODEL_QUALITY_SCORING.md` W#1 stability scoring; no existing central registry doc).

**Phase 1 (FU-1 design).** A 4-question Rule 14f picker (4/4 Yes-to-Recommended) locked: (a) delete unit = three levels (single complaint / whole category / single source review under a complaint); (b) edit scope = click-to-edit on category names + complaint wording; (c) bulk UX = always-visible bulk-select checkboxes + "Delete selected" + a confirm; (d) re-run behavior = warns-then-replaces hand-edits.

**Phase 2a (build FU-1 edit+delete).** All edits/deletes trim/modify `analysisJson.categories` on the per-competitor PER_PRODUCT `ReviewAnalysis` row via the extended PATCH (`handlers/review-analysis-update.ts`). The PATCH re-derives the flattened `analysisJson.summary` via `flattenCategoriesToSummaryString` (so the main table's Column 9 + cache reads stay in lock-step with the edited structured table) and sets `manuallyEdited:true` (which enables the re-run warning). The edits/deletes NEVER touch `CapturedReviews` — only the analysis row's structured categories. UI lives in `ReviewsTraceabilityTable.tsx` (click-to-edit + delete affordances + bulk-select checkboxes) wired through `UrlDetailContent.tsx`. NEW mutation/validator helpers added to `reviews-traceability.ts` (+11 node:test cases) + 4 PATCH-categories cases in `review-analysis-update.test.ts`.

**Phase 2b (build FU-2 deleted-reviews sync bug).** Root cause: the App Router kept the `/competitor-reviews-analysis` page mounted behind the URL-detail-page navigation, so its `reviewsByUrl` lazy-load cache went stale after a cross-page review deletion — the deleted review still showed in the table + the "N of M summarized" count was wrong until a manual reload. Fix: the page now registers a tab-refocus listener (`visibilitychange`/`focus`) that re-hydrates summaries + force-refetches the already-loaded per-URL reviews. Touches `competitor-reviews-analysis/page.tsx` + the two summarize modals (`PerCompetitorSummarizeModal.tsx` + `GlobalCompetitorSummarizeModal.tsx`).

**Phase 3 (deploy decision).** Director picked Recommended (Deploy `7d89d75` to main). Ff-merge `ca7266a..7d89d75` to main under the single Rule 9 deploy gate; ping-pong pushed `origin/workflow-2-competition-scraping`; both branches at `7d89d75`. Vercel auto-redeployed vklf.com.

**Phase 4 (director real-Chrome verification) — NO redirects; clean PASS.** Director's verbatim verdict: **"Everything passed."** No fix-forward commit this session.

### NEW reusable PATTERNS

- **"Cross-page stale client cache → re-fetch on tab refocus (visibilitychange/focus)"** (FU-2 root cause + fix). When an App Router page stays mounted while the user navigates to a sibling page that mutates shared data, the mounted page's lazy-load cache goes stale. Fix = a refocus listener that re-hydrates + force-refetches the loaded data on `visibilitychange`/`focus`. Reusable for any sibling-page stale-cache-after-cross-page-mutation situation.
- **"Structured-edit PATCH re-derives the flattened back-compat field"** (FU-1 mechanism). When a structured JSON field is the source-of-truth but a flattened back-compat field is still read elsewhere, the PATCH must re-derive the flattened field on every structured edit so the two never drift; a `manuallyEdited` flag drives the re-run-will-replace warning.

### Scoreboard

Entry baselines = Fix Session D exit = 2026-05-31 locked (root tsc clean / extension tsc clean / **910 ext** / **1038 src/lib** / **68 routes**). Post-merge /scoreboard all GREEN at NEW LOCKED baseline:

| Check | Entry | Exit | Delta |
| --- | --- | --- | --- |
| Root tsc | clean | clean | unchanged |
| Extension tsc | clean | clean | unchanged |
| Extension `npm test` | 910/910 | 910/910 | UNCHANGED (no extension code changed) |
| src/lib `node:test` | 1038/1038 | **1053/1053** | **+15** (11 traceability mutation/validator/row-index cases + 4 PATCH-categories cases) |
| `npm run build` | 68 routes | **68 routes** | UNCHANGED (reused the existing PATCH route — no new route) |
| Playwright | — | SKIPPED | per Rule 27 (build/deploy session) |

### Affected §A sections (informational — §A FROZEN per Rule 18)

- §A.7 W#2 model policy ("Opus 4.7 default + Opus 4.6 selectable") is the PRIOR TREATMENT the Rule 24 search surfaced for the DEFERRED Issue 2 (P-52 model-registry work); the future (a.111) session will add Opus 4.8 to the model lists + pricing table + author a central registry doc + methodology rule. §A is frozen; this forward-pointer lives in §B only.
- The "Overall Analysis — Captured Reviews" box on the URL detail page changes role again: Fix Session D made it a read-only 3-column traceability table; FU-1 makes that table EDITABLE (rename categories, reword complaints, delete at 3 levels, bulk-delete). The edits persist via the structured `analysisJson.categories` PATCH and re-derive the flattened `summary`. This supersedes the §B 2026-05-31 read-only-table behavior (§A frozen; supersedence captured in §B only).

### Cross-references

- §B 2026-05-31 above (W5 Fix Session D deploy + the read-only traceability table) — the predecessor entry; this session makes that table editable + adds delete + bulk-delete.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-31-b — the INFORMATIONAL entry capturing the two NEW Patterns + the director scope-expansion-handling note + the date-stamp-uncertainty flag + the P-43 running tally.
- `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §4 (Q11 RESOLVED) + §3 (FU-1 + FU-2 ✅ DEPLOYED-AND-VERIFIED 2026-05-31-b; Status updated; Fix Session C + Category/Type still remaining); `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §3 pointer table ("Fix A + B + D + FU-1 + FU-2 ✅ DEPLOYED-AND-VERIFIED; Fix Session C remaining").
- `docs/ROADMAP.md` NEW entry **P-52** (AI model registry + central model-selection methodology + Opus 4.8 rollout) — the destination for the deferred Issue 2; queued as (a.111) on the `main` track.

**Closing line:** P-49 W5 FU-1 (edit+delete the traceability box) + FU-2 (deleted-reviews sync bug) ✅ DEPLOYED-AND-VERIFIED 2026-05-31-b (build `7d89d75`) under 1 Rule 9 deploy gate on `workflow-2-competition-scraping` — director "Everything passed." The traceability box is now fully editable (rename categories / reword complaints / delete a single complaint, a whole category, or a single source review / bulk-delete) and review deletions stay in sync across the table + box on tab refocus. TWO NEW reusable PATTERNS memorialized. Schema-change-in-flight NO entire session. 7/7 = 100% Yes-to-Recommended this session; running cumulative 115/118 = 97.5%. NEW baselines: src/lib `node:test` = **1053/1053** + `npm run build` = **68 routes UNCHANGED** + extension = 910/910 UNCHANGED. **Closes (a.110) RECOMMENDED-NEXT partially** (FU-1 + FU-2 done; Fix Session C remains). **Opens (a.111) RECOMMENDED-NEXT = AI model registry doc + methodology rule + Opus 4.8 rollout** on `main` (NEW ROADMAP entry P-52). **SEVENTEENTH build/deploy-session §B entry per Rule 18 — NINTH W5 entry.**

---

## §B 2026-05-29-b — `session_2026-05-29-b_p52-ai-model-registry-rule-32-opus-4-8-rollout` — P-52 AI model registry doc + central model-selection methodology (NEW Rule 32) + Opus 4.8 rollout ✅ DEPLOYED-AND-VERIFIED 2026-05-29-b end-to-end on vklf.com on the `main` track (platform-wide; spans W#1 Keyword Clustering + W#2 Competition Scraping) — single build commit `5b9784a` (14 files +343/-31) pushed to main + ping-ponged to `workflow-2-competition-scraping` under ONE Rule 9 deploy gate — EIGHTEENTH build/deploy-session §B entry per Rule 18; TENTH W5 entry — director Phase 4 verbatim verdict: "passed"; NEW reusable PATTERN memorialized — "SDK-free constants module lets client components import shared constants without bundling the server SDK"; Schema-change-in-flight NO entire session (model lists + pricing are code constants)

**§A frozen per Rule 18.** This entry is a SUPERSEDENCE note for §A.7 (the W#2 model policy "Opus 4.7 default + Opus 4.6 selectable") — it is ADDITIVE and does NOT change the Opus-only policy. It records how the model menu + the model-list plumbing evolved this session without editing §A.

### What shipped (W#2-relevant slice of the platform-wide P-52 work)

- **Opus 4.8 (`claude-opus-4-8`) added to the §A.7 Opus-only menu — ADDITIVE.** The W#2 review-summarize modals now offer Opus 4.8, Opus 4.7 (default — UNCHANGED), and Opus 4.6. The Opus-only policy from §A.7 is intact; 4.8 simply joins the existing Opus menu. This is a §B supersedence note over §A.7's enumerated menu, NOT a policy change.
- **The 3 W#2 summarize modals refactored to import a central model list.** Before this session, `PerReviewSummarizeModal` / `PerCompetitorSummarizeModal` / `GlobalCompetitorSummarizeModal` each kept its OWN duplicate copy of `SUPPORTED_MODEL_VERSIONS` — a 3-way drift hazard (add a model to one, forget the other two). This session extracted the constants into a NEW SDK-free module `src/lib/competition-scraping/review-analysis/models.ts` that `client.ts` re-exports for back-compat; the 3 modals now IMPORT from `models.ts`. ONE source of truth for the W#2 model menu, AND the server-only `@anthropic-ai/sdk` (imported by `client.ts`) stays out of the browser bundle.
- **`pricing.ts`** gained an Opus 4.8 entry (Opus-tier PLACEHOLDER pricing, same as 4.7, with a `CONFIRM` comment pending official numbers).
- **The central registry doc + Rule 32.** NEW `docs/AI_MODEL_REGISTRY.md` indexes every model-choice declaration site across W#1 + W#2 (the W#2 sites are `models.ts` + `pricing.ts`); NEW HANDOFF_PROTOCOL Rule 32 + the SessionStart hook `.claude/hooks/check-model-registry-drift.sh` keep that index honest as the platform grows.

### Design choices made this session (Rule 14f)

- **SDK-free constants module over importing from `client.ts` directly** (the Phase 1 design picker, Recommended + chosen). The modals are `'use client'`; importing the list from `client.ts` would pull the server SDK into the browser bundle. Extracting the constants into `models.ts` (re-exported by `client.ts`) is the clean fix — see the NEW reusable Pattern.
- **Defaults UNCHANGED.** W#2 stays on Opus 4.7 (`DEFAULT_MODEL_VERSION`); director did not promote 4.8 to default.

### Implementation subtlety

`client.ts` remains the SDK seam + back-compat re-export point, so every existing W#2 consumer (`review-analysis-run-batch.ts` validator via `isSupportedModelVersion`, the modals via the re-export → now direct import) reads the SAME list. No behavior change for existing models; Opus 4.8 simply appears as a new selectable option.

### Affected §A sections (informational — §A frozen per Rule 18)

- **§A.7** (model policy) — Opus 4.8 joins the Opus-only menu (additive supersedence; policy unchanged).
- **§A.12** (model/version + pricing plumbing references) — the W#2 model list now lives in `models.ts` (re-exported by `client.ts`); pricing in `pricing.ts` gained the 4.8 entry. These are plumbing-location notes; the design intent in §A is unchanged.

### Scoreboard

src/lib `node:test` = **1059/1059** (+6 from 1053 — 5 new `models.test.ts` cases + 1 new `pricing.test.ts` case); `npm run build` = **68 routes UNCHANGED** (constants only; no new route); extension `npm test` = **910/910 UNCHANGED** (no extension model selection); root + extension tsc clean; Check 6 SKIPPED per Rule 27.

### Cross-references

- `docs/AI_MODEL_REGISTRY.md` — the NEW central declaration-site registry (the P-52 deliverable). `docs/HANDOFF_PROTOCOL.md` **Rule 32** + `.claude/hooks/check-model-registry-drift.sh` — the methodology + enforcement.
- `docs/polish-item-specs/P-52-ai-model-registry.md` — the Rule 31 spec doc (§4 carries the 2 OPEN carry-overs: official Opus 4.8 pricing numbers + the deferred W#1 `AutoAnalyze.tsx` shared-list migration).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-29-b — the INFORMATIONAL entry (DATE-STAMP DRIFT RESOLVED + the SDK-free-constants Pattern + Rule 32 + the P-43 tally).
- `docs/ROADMAP.md` **P-52** — status flipped to ✅ DEPLOYED-AND-VERIFIED 2026-05-29-b (build `5b9784a`).
- Predecessor entry: §B 2026-05-31-b above (W5 FU-1 + FU-2 — the session that DEFERRED this model-registry work to its own `main`-track session).

**Closing line:** P-52 AI model registry + central model-selection methodology (NEW Rule 32) + Opus 4.8 rollout ✅ DEPLOYED-AND-VERIFIED 2026-05-29-b (build `5b9784a`) under 1 Rule 9 deploy gate — platform-wide on `main` (spans W#1 + W#2). The W#2-relevant slice: Opus 4.8 added to the §A.7 Opus-only menu (additive) + the 3 W#2 modals now import a single central `models.ts` list. NEW reusable PATTERN: "SDK-free constants module lets client components import shared constants without bundling the server SDK". Schema-change-in-flight NO entire session. Running cumulative 121/124 = 97.6% Yes-to-Recommended. NEW baselines: src/lib `node:test` = **1059/1059** + `npm run build` = **68 routes UNCHANGED** + extension = 910/910 UNCHANGED. **Closes (a.111) RECOMMENDED-NEXT.** **Opens (a.112) RECOMMENDED-NEXT = P-49 W5 Reviews Analysis Table Fix Session C** on `workflow-2-competition-scraping` (the only remaining Reviews Analysis Table work; carries the only remaining schema change `CapturedReview.sortRankInReviewsTable Int?`). **EIGHTEENTH build/deploy-session §B entry per Rule 18 — TENTH W5 entry.** The next §B entry will land at the close of Fix Session C.

---

## §B 2026-05-29-c — `session_2026-05-29-c_p49-w5-fix-session-c-deploy-1-nonbulleted-prose-excel-tooltips` — Workstream 5 Reviews Analysis Table Fix Session C "Deploy 1" (NEW per-competitor non-bulleted prose AI flow + "Export Table" Excel download + the additive nullable `CapturedReview.sortRankInReviewsTable Int?` schema column) ✅ DEPLOYED-AND-VERIFIED 2026-05-29-c end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — Deploy 1 build `a24e92c` (10 files) + 3 fix-forwards (FF1 `ecad5af` + FF2 `9da50ec` + FF3 `0631762`) ff-merged to main under FOUR Rule 9 deploy gates — NINETEENTH build/deploy-session §B entry per Rule 18; ELEVENTH W5 entry — director Phase 4 verbatim verdict: "Everything passed"; THREE NEW reusable PATTERNS memorialized — "Body-portal + viewport-fixed positioning for tooltips/overlays that must escape table-row stacking-context + overflow:auto clipping" + "Second-pass AI transform reads a prior flow's output, not raw inputs" + "analysisJson.flow discriminator lets two same-level (PER_PRODUCT) rows coexist per URL"; Schema-change-in-flight YES entry → FLIPPED YES → NO at the Deploy 1 push

**Closes (a.112) RECOMMENDED-NEXT PARTIALLY** — Fix Session C was split into "Deploy 1" (non-bulleted prose flow + Excel export + the `sortRankInReviewsTable` schema column) ✅ DEPLOYED-AND-VERIFIED 2026-05-29-c + "Deploy 2" (drag-to-reorder) DEFERRED to next session per a director Rule 14f reliability pick (the riskiest, cleanly-separable UI piece). **Opens (a.113) RECOMMENDED-NEXT = P-49 W5 Fix Session C "Deploy 2" — drag-to-reorder** on `workflow-2-competition-scraping` (URL rows via existing `CompetitorUrl.sortRank` + review rows within a URL via the already-shipped `CapturedReview.sortRankInReviewsTable`; @dnd-kit, mirror `UrlTable.tsx`; Schema-change-in-flight NO at entry since the column already shipped).

### Session shape — DEPLOY with 4 ff-merges under 4 Rule 9 deploy gates (Deploy 1 + 3 fix-forwards) in one Phase 4 verification day

Session opened per yesterday's NEXT_SESSION.md pointer scoping (a.112) Fix Session C. A 4-question Phase-0 design batch (4/4 Yes-to-Recommended) + the Deploy 1 gate + the Deploy-2-sequencing pick + 3 fix-forward gates = NINE Rule 14f decisions, 9/9 = 100% Yes-to-Recommended. **Q8 (the per-batch flow-value naming convention) was resolved DIRECTLY** = `per-competitor-nonbulleted` — it was already in the VALID_FLOWS allowlist and is consistent with the shipped `per-competitor-bulleted`, so no director picker was needed.

### Phase 0 — 4 design decisions (all Recommended)

- **Prose layout = short labeled paragraphs by theme.** The non-bulleted output is a set of theme-labeled plain paragraphs (not bullets, not one wall of text).
- **Length = moderate (2-4 paragraphs); volume cues kept; no formal citations.** The prose paints a clear, critique-ready picture without inline review-ID citations.
- **Input source = read the already-generated BULLETED summary, NOT the raw review corpus.** This is the key design divergence from every prior flow — the non-bulleted flow is a SECOND-PASS TRANSFORM over Column 9's bulleted summary. If a competitor has no bullet summary, the run SKIPS + FLAGS that competitor.
- **Excel = currently-VISIBLE columns only (Q7→A).** "Export Table" exports whatever columns are shown, with word-wrap on AI cells.

### Phase 1-2 — what shipped (Deploy 1 build `a24e92c`, 10 files)

- **NEW per-competitor non-bulleted (prose) AI flow** in `review-analysis/prompts.ts` (v1 builder + normalizer) + `handlers/review-analysis-run-batch.ts` dispatch (flow `per-competitor-nonbulleted`; fresh/cache/400/502 paths tested). The flow reads the competitor's bulleted `analysisJson.summary` (Column 9) and emits theme-labeled prose.
- **NEW top "Auto-create Competitor Comprehensive Reviews Analysis (non-bulleted)" button + global modal** `GlobalCompetitorNonBulletedModal.tsx` (SKIPS + FLAGS competitors without a bullet summary) + **NEW per-URL inline button + single-URL modal** `PerCompetitorNonBulletedModal.tsx`. Both modals render a model-selection `<select>` over `SUPPORTED_MODEL_VERSIONS` imported from the central `models.ts` (Rule 32 consumers — registered in `docs/AI_MODEL_REGISTRY.md`; no new declaration site).
- **Column 10 cell + banner** (reuses `CompetitorSummaryBanner`) + **edit-in-place** + **refresh-persistence**: hydration discriminates the non-bulleted PER_PRODUCT row from the bulleted one via `analysisJson.flow='per-competitor-nonbulleted'`.
- **Append-merge write-back** to `CompetitorUrl.overallAnalyses["reviews"]` (added at the bottom per §1 verbatim "merge, never overwrite").
- **"Export Table" Excel download** — NEW pure `review-analysis/reviews-table-export.ts` (+ `.test`, +11 cases) maps the currently-VISIBLE columns to an xlsx workbook with word-wrap on AI cells; filename `competitor-reviews-analysis-{slug}-{YYYY-MM-DD}.xlsx`. Client-side; no new route.
- **Additive nullable `CapturedReview.sortRankInReviewsTable Int?`** schema column shipped via `prisma db push` (zero data loss). It does nothing visible yet — it is the persistence target the deferred Deploy 2 drag-to-reorder will write.

### Phase 3 — 3 fix-forwards (tooltips)

- **FF1 `ecad5af`** (page.tsx) — a `HoverTooltip` component + fade-in hover tooltips on the two NEW non-bulleted buttons.
- **FF2 `9da50ec`** (page.tsx) — tooltips on the remaining four buttons (top bulleted "Auto-create", "Export Table", per-URL per-review, per-URL per-competitor bulleted) + `width:100%` on their styles.
- **FF3 `0631762`** (page.tsx) — re-render the tooltips in a **body portal with viewport-fixed positioning** (`createPortal` + `getBoundingClientRect`) to fix director-reported clipping: last-column tooltips, absolutely-positioned inside a `<td>`, were painted behind adjacent rows + clipped by the table's `overflow:auto`. Rendering them in a body portal positioned from the button's bounding rect escapes both the row stacking-context and the scroll container.

### Phase 4 (director real-Chrome verification) — clean PASS

Director's verbatim verdict: **"Everything passed."** No further fix-forwards.

### NEW reusable PATTERNS

- **"Body-portal + viewport-fixed positioning for tooltips/overlays that must escape table-row stacking-context + overflow:auto clipping"** (the FF3 fix). An absolutely-positioned tooltip inside a table cell gets painted behind sibling rows and clipped by a scrolling table container. Rendering it via `createPortal` to `document.body`, positioned from the trigger's `getBoundingClientRect()`, escapes both.
- **"Second-pass AI transform reads a prior flow's output, not raw inputs"** (the non-bulleted flow design). Unlike every prior flow that reads the raw review corpus or per-review summaries, the non-bulleted flow reads the competitor's already-generated BULLETED summary and rewrites it — a transform over a prior flow's output. Skip-and-flag when the prerequisite output is missing.
- **"analysisJson.flow discriminator lets two same-level (PER_PRODUCT) rows coexist per URL"** (the storage design). The bulleted and non-bulleted per-competitor summaries both live at `ReviewAnalysisLevel.PER_PRODUCT`; they are told apart by `analysisJson.flow` (`per-competitor-bulleted` vs `per-competitor-nonbulleted`). Hydration + GET routing key off this discriminator. A positive consequence: the PATCH endpoint already supported non-bulleted edits with ZERO change, because its `{summary}` branch spreads `existingJson` (preserving the flow discriminator) — an audit-shipped-state win.

### Scoreboard

Entry baselines = 2026-05-29-b exit = locked (root tsc clean / extension tsc clean / **910 ext** / **1059 src/lib** / **68 routes**). Post-merge /scoreboard all GREEN at NEW LOCKED baseline:

| Check | Entry | Exit | Delta |
| --- | --- | --- | --- |
| Root tsc | clean | clean | unchanged |
| Extension tsc | clean | clean | unchanged |
| Extension `npm test` | 910/910 | 910/910 | UNCHANGED (no extension code changed) |
| src/lib `node:test` | 1059/1059 | **1080/1080** | **+21** (+9 prompts.test [non-bulleted builder/normalizer + SHIPPED_FLOWS tripwire update — one tripwire test UPDATED not added] + 11 NEW reviews-table-export.test + 4 run-batch.test non-bulleted dispatch [fresh/cache/400/502]) |
| `npm run build` | 68 routes | **68 routes** | UNCHANGED (Excel is client-side; no new route) |
| Playwright | — | SKIPPED | per Rule 27 (build/deploy session) |

### Affected §A sections (informational — §A FROZEN per Rule 18)

- The "Competitor Comprehensive Reviews Analysis (non-bulleted)" column (Column 10) + its AI flow + the "Auto-create … (non-bulleted)" buttons (both top + per-URL) + the "Export Table" Excel button are now LIVE per the §1 verbatim spec for the Competitor Reviews Analysis Table page. The drag-to-reorder requirement (both URL rows and review rows) remains the LAST §1 item not yet shipped — deferred to "Deploy 2" (a.113). §A is frozen; this implementation note lives in §B only.
- The §1 instruction "this bullet list should also be added to the 'Overall Analysis — Captured Reviews' box … merged … added to the very bottom so that no data … is overwritten" is honored by the non-bulleted append-merge write-back to `CompetitorUrl.overallAnalyses["reviews"]`.

### Cross-references

- §B 2026-05-31-b above (W5 FU-1 + FU-2 — the editable traceability box + the deleted-reviews sync fix) — the predecessor W5 entry; Deploy 1 must not regress the editable box or the structured `analysisJson` shape.
- §B 2026-05-29-b above (P-52 — the central `models.ts` list) — the 2 NEW non-bulleted modals import `SUPPORTED_MODEL_VERSIONS` from that central list rather than re-duplicating it.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-29-c — the INFORMATIONAL entry (the 3 NEW Patterns + the audit-shipped-state PATCH win + the P-43 tally).
- `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 "Fix Session C" (items 1-7 ✅ DONE; items 8/9/10 → Deploy 2) + §4 (Q8 RESOLVED) + §2 2026-05-29-c note; `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §3 pointer table ("Fix A+B+D+FU-1+FU-2 + Fix C Deploy 1 ✅ DEPLOYED-AND-VERIFIED; Fix C Deploy 2 remaining").
- `docs/AI_MODEL_REGISTRY.md` §2 — the 2 NEW non-bulleted modals registered as W#2 CONSUMERS.
- `docs/ROADMAP.md` P-49 — status updated to "🟢 IN-FLIGHT 2026-05-29-c — Fix Session C Deploy 1 ✅ DEPLOYED-AND-VERIFIED".

**Closing line:** P-49 W5 Reviews Analysis Table Fix Session C "Deploy 1" (non-bulleted prose flow + Excel export + the `CapturedReview.sortRankInReviewsTable` schema column) ✅ DEPLOYED-AND-VERIFIED 2026-05-29-c (Deploy 1 build `a24e92c` + 3 FFs) under 4 Rule 9 deploy gates on `workflow-2-competition-scraping` — director "Everything passed." THREE NEW reusable PATTERNS memorialized. Schema-change-in-flight YES entry → NO at the Deploy 1 push. 9/9 = 100% Yes-to-Recommended this session; running cumulative 130/133 = 97.7%. NEW baselines: src/lib `node:test` = **1080/1080** + `npm run build` = **68 routes UNCHANGED** + extension = 910/910 UNCHANGED. **Closes (a.112) RECOMMENDED-NEXT PARTIALLY** (Deploy 1 done; Deploy 2 drag-to-reorder remains). **Opens (a.113) RECOMMENDED-NEXT = P-49 W5 Fix Session C "Deploy 2" — drag-to-reorder** on `workflow-2-competition-scraping`. **NINETEENTH build/deploy-session §B entry per Rule 18 — ELEVENTH W5 entry.** The next §B entry will land at the close of Fix Session C "Deploy 2".

---

## §B 2026-05-29-d — `session_2026-05-29-d_p49-w5-fix-session-c-deploy-2-drag-to-reorder` — Workstream 5 Reviews Analysis Table Fix Session C "Deploy 2" — drag-to-reorder (URL/competitor rows + review rows within a URL) ✅ DEPLOYED-AND-VERIFIED 2026-05-29-d end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — single build `194e66f` (11 files +743/-29) ff-merged to main under ONE Rule 9 deploy gate — TWENTIETH build/deploy-session §B entry per Rule 18; TWELFTH W5 entry — director Phase 4 verbatim verdict: "Passed"; the LAST remaining Reviews Analysis Table work — the page is now fully §1-compliant / CLOSED; TWO NEW reusable PATTERNS memorialized — "Reorder-field discriminator on a shared reorder endpoint" + "Spec-named storage column may not exist — audit before building" (the Rule 3 `CompetitorUrl.sortRank`-never-existed finding); Schema-change-in-flight NO entire session

**§A frozen per Rule 18.** This entry is an implementation note for the §1 "Drag-to-reorder" requirement — it is ADDITIVE and does NOT edit §A. It records how the two drag surfaces were built + persisted without changing the design intent in §A.

**Closes (a.113) RECOMMENDED-NEXT** — Fix Session C "Deploy 2" drag-to-reorder ✅ DEPLOYED-AND-VERIFIED 2026-05-29-d. With it, the Competitor Reviews Analysis Table page is fully §1-compliant / CLOSED — only the Category page (Sessions 1-3) + Type page (Sessions 4-5) corrective rebuilds remain in P-49 W5. **Opens (a.114) RECOMMENDED-NEXT = P-49 W5 Category page corrective rebuild — Block 1 planning resume** on `workflow-2-competition-scraping` (answer the 6 open questions in `docs/polish-item-specs/P-49-W5-S4-category-page.md` §4 before any code).

### Session shape — DEPLOY with 1 ff-merge under 1 Rule 9 deploy gate

Session opened per yesterday's NEXT_SESSION.md pointer scoping (a.113) Fix Session C "Deploy 2". Phase 0 audit-shipped-state + a 2-question design batch (order-sync + drag-affordance, both Recommended + chosen) + the deploy gate = THREE Rule 14f decisions, 3/3 = 100% Yes-to-Recommended. No fix-forwards — director Phase 4 was a clean single-pass PASS ("Passed").

### Phase 0 — audit-shipped-state + the CRITICAL Rule 3 finding

The Phase 0 audit-shipped-state read (Rule 31) against the planned URL-row persistence mechanism surfaced the most important finding of the session: **the spec-named `CompetitorUrl.sortRank` column never existed.** The spec (Q5 → A, §3 "Drag-to-reorder", §3 schema notes) named `CompetitorUrl.sortRank` as the URL-row persistence column, claiming it was "the SAME column used by the Competitor Content Table." Code-truth: (a) there is NO `sortRank` field on the `CompetitorUrl` model in `prisma/schema.prisma`; (b) the Competitor Content Table (`UrlTable.tsx`) actually persists URL order via a per-user `UserTablePreferences.rowOrder` string[] array; (c) the Reviews Analysis page deliberately prefixes its other table-preferences keys (`reviewsTable:`) to avoid collision — but `rowOrder` is a single shared scalar. Surfaced to the director via the design picker; the director chose to keep the "reflects everywhere" behavior (director Q5 → A) by persisting URL-row order through the SHARED `rowOrder` field — so the order tracks across BOTH the Competitor Content Table and the Reviews Analysis Table. No schema change.

### Design choices made this session (Rule 14f forced-pickers — Rule 14f)

- **Order-sync across both tables = Synced (Recommended + chosen).** URL-row order persists via the shared `UserTablePreferences.rowOrder` field, so reordering competitors on the Reviews Analysis Table reflects on the Competitor Content Table and vice-versa — honoring the §1 / Q5 → A "reflects everywhere" intent. (The original spec named `CompetitorUrl.sortRank` as the mechanism, which never existed; the shared `rowOrder` field delivers the same intent with no schema change — see the Rule 3 finding.)
- **Drag affordance = dedicated grip handle (Recommended + chosen), NOT whole-row grab.** Every cell on this table is click-to-edit, so a whole-row grab would conflict with editing; both drag surfaces expose a dedicated grip handle instead.

### What shipped (build `194e66f`, 11 files +743/-29)

- **Two @dnd-kit drag surfaces, both mirroring the canonical `UrlTable.tsx` dnd pattern, in `competitor-reviews-analysis/page.tsx`.** (1) URL (competitor) rows drag to reorder; each competitor's child review rows ride along; persisted via the shared `UserTablePreferences.rowOrder` array. (2) Review rows within a URL drag to reorder (scoped strictly within a single URL group); persisted via the already-shipped `CapturedReview.sortRankInReviewsTable` column.
- **The existing `reviews-reorder.ts` handler gained an optional `field` discriminator** (default `'sortRank'` = back-compat with the URL-detail-page order; `'sortRankInReviewsTable'` for this page) so the two orders of the SAME `CapturedReview` rows never collide — NO new route (route count stayed 68).
- **NEW pure helper `src/lib/competition-scraping/reviews-table-reorder.ts` (+ `.test`, +17 cases)** carries the rank assignment / re-normalization logic. Rendered rows sort by the rank fields (URL rows by `rowOrder`; review rows within a URL by `sortRankInReviewsTable`, falling back to capture order for NULL ranks); the Excel export follows the on-screen order.
- **MODIFIED supporting files:** `url-reviews.ts` + `.test`, `reviews-by-id.ts` + `.test`, `captured-reviews-helpers.test.ts`, `shared-types/competition-scraping.ts` (the `field` param + sort-field plumbing).

### Phase 4 (director real-Chrome verification) — clean single-pass PASS

Director's verbatim verdict: **"Passed."** No fix-forwards. Verified: URL-row drag (with child review rows moving), review-row drag within a URL, order persistence across refresh, and the order-sync across both tables.

### NEW reusable PATTERNS

- **"Reorder-field discriminator on a shared reorder endpoint"** (the `reviews-reorder.ts` `field` param). When a second surface needs an INDEPENDENT order of the SAME rows, add an optional discriminator param (defaulting to the back-compat column) to the existing reorder PUT rather than minting a parallel route. Route count stayed 68.
- **"Spec-named storage column may not exist — audit before building"** (the Rule 3 finding). When a spec names a specific storage column/field, audit the actual `prisma/schema.prisma` + the analogous shipped persistence path BEFORE building against it; the shipped code is ground-truth (Rule 3). Here `CompetitorUrl.sortRank` never existed and the real mechanism was `UserTablePreferences.rowOrder`.

### Scoreboard

Entry baselines = 2026-05-29-c exit = locked (root tsc clean / extension tsc clean / **910 ext** / **1080 src/lib** / **68 routes**). Post-merge /scoreboard all GREEN at NEW LOCKED baseline:

| Check | Entry | Exit | Delta |
| --- | --- | --- | --- |
| Root tsc | clean | clean | unchanged |
| Extension tsc | clean | clean | unchanged |
| Extension `npm test` | 910/910 | 910/910 | UNCHANGED (no extension code changed) |
| src/lib `node:test` | 1080/1080 | **1101/1101** | **+21** (+17 NEW reviews-table-reorder.test pure-helper cases + 4 NEW reviews-reorder.test field-discriminator cases) |
| `npm run build` | 68 routes | **68 routes** | UNCHANGED (reused existing `/table-preferences` + `/reviews/reorder` endpoints; no new route) |
| Playwright | — | SKIPPED | per Rule 27 (deploy session; @dnd-kit drag impractical to Playwright reliably + sibling table drag has no Playwright coverage; director real-Chrome Phase 4 used instead) |

### Affected §A sections (informational — §A FROZEN per Rule 18)

- The §1 "Drag-to-reorder" requirement (both URL rows and review rows) is now LIVE — it was the LAST §1 item not yet shipped. With it, the Competitor Reviews Analysis Table page is fully §1-compliant / CLOSED. §A is frozen; this implementation note (the shared `rowOrder` mechanism + the `field`-discriminated review-row order + the grip-handle affordance) lives in §B only.
- The §1 / Q5 → A "reflects everywhere" intent for URL-row order is honored by persisting through the shared `UserTablePreferences.rowOrder` field (NOT the spec-named `CompetitorUrl.sortRank` column, which never existed — see the Rule 3 finding).

### Cross-references

- §B 2026-05-29-c above (W5 Fix Session C "Deploy 1" — the non-bulleted prose flow + Excel export + the `CapturedReview.sortRankInReviewsTable` column this Deploy 2 consumes) — Deploy 2 must NOT regress the Deploy 1 non-bulleted flow, the Excel export, the body-portal tooltips, or the structured `analysisJson` shape.
- §B 2026-05-31-b above (W5 FU-1 + FU-2 — the editable traceability box) — Deploy 2 must not regress the editable box.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-29-d — the INFORMATIONAL entry (the 2 NEW Patterns + the Rule 3 `CompetitorUrl.sortRank`-never-existed audit win + the P-43 tally).
- `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 (Fix Session C items 9 + 10 ✅ DONE; Fix Session C fully CLOSED) + §2 2026-05-29-d note; `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §3 pointer table (Reviews Analysis Table page CLOSED; Category + Type pages remaining).
- `docs/ROADMAP.md` P-49 — status updated to "🟢 IN-FLIGHT 2026-05-29-d — Fix Session C Deploy 2 ✅ DEPLOYED-AND-VERIFIED".
- Reorder-field-discriminator cross-reference: `src/lib/competition-scraping/handlers/reviews-reorder.ts` (the `field` param) + `src/lib/competition-scraping/reviews-table-reorder.ts` (rank-assignment helper) + `competitor-reviews-analysis/page.tsx` (the two @dnd-kit drag surfaces); build `194e66f`.

**Closing line:** P-49 W5 Reviews Analysis Table Fix Session C "Deploy 2" — drag-to-reorder (URL/competitor rows via the shared `UserTablePreferences.rowOrder` field + review rows within a URL via the already-shipped `CapturedReview.sortRankInReviewsTable` column through the `field`-discriminated reorder handler) ✅ DEPLOYED-AND-VERIFIED 2026-05-29-d (build `194e66f`) under 1 Rule 9 deploy gate on `workflow-2-competition-scraping` — director "Passed." The LAST remaining Reviews Analysis Table work — the page is now fully §1-compliant / CLOSED. TWO NEW reusable PATTERNS memorialized + a positive Rule 3 audit win (the spec-named `CompetitorUrl.sortRank` column never existed). Schema-change-in-flight NO entire session. 3/3 = 100% Yes-to-Recommended this session; running cumulative 133/136 = 97.8%. NEW baselines: src/lib `node:test` = **1101/1101** + `npm run build` = **68 routes UNCHANGED** + extension = 910/910 UNCHANGED. **Closes (a.113) RECOMMENDED-NEXT.** **Opens (a.114) RECOMMENDED-NEXT = P-49 W5 Category page corrective rebuild — Block 1 planning resume** on `workflow-2-competition-scraping`. **TWENTIETH build/deploy-session §B entry per Rule 18 — TWELFTH W5 entry.** The next §B entry will land at the close of the Category page corrective rebuild Block 1.

---

## §B 2026-05-30 — `session_2026-05-30_p49-w5-category-page-session-1-scaffold-and-polish` — Workstream 5 Category page (Reviews Analysis By Competitor Category Table) Session 1 scaffold + a 5-item look-and-feel polish pass + 3 follow-up fixes + a vertical-scrollbar-overlap fix — FOUR deploys, ALL ✅ DEPLOYED-AND-VERIFIED 2026-05-30 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — builds `f08a41f` (scaffold) + `ee56398` (5-item polish) + `90bfdf5` (3 fixes) + `9b1d023` (scrollbar-overlap fix) all ff-merged to main under ONE explicit Rule 9 deploy picker (first deploy) + 3 in-session director directives — TWENTY-FIRST build/deploy-session §B entry per Rule 18; THIRTEENTH W5 entry; the FIRST Category-page entry — director Phase 4 verbatim verdicts: all "passed"; the FIRST of the 5-session Category + Type corrective rebuild; TWO NEW reusable PATTERNS memorialized — "rowSpan sub-rows to align per-item data across two adjacent columns" + "Debounced merge-save must gate on initial-load-complete"; Schema-change-in-flight NO entire session (all persistence reused the existing `UserTablePreferences` model — NEXT session = YES at entry)

**§A frozen per Rule 18.** This entry is an implementation note for the §1 Category page (Reviews Analysis By Competitor Category Table) requirement — it is ADDITIVE and does NOT edit §A. It records how the Session 1 scaffold + polish + fixes were built without changing the design intent in §A. **It does NOT regress the sibling Reviews Analysis Table page** (`competitor-reviews-analysis/page.tsx`, CLOSED 2026-05-29-d) — the Category page is a NEW route alongside it.

**Closes (a.114) RECOMMENDED-NEXT** — Category page Block 1 planning resume RESOLVED (the 3 open questions settled) + Session 1 scaffold SHIPPED + a 5-item polish pass + 3 follow-up fixes, all deployed & verified. **Opens (a.115) RECOMMENDED-NEXT = P-49 W5 Category page "interactive batch"** on `workflow-2-competition-scraping` (drag whole categories + drag competitors within a category WITH the director-directed layout restructure [category name on its OWN header row, all competitor rows beneath it so the first is draggable] + hide-with-restore of a competitor and of an entire category scoped to THIS PAGE ONLY, backed by a NEW additive per-user/per-Project "memory" area → Schema-change-in-flight = YES at entry; then Session 2 = the two Category AI flows [Q-E prompts drafted at its start]; the Type page (Sessions 4-5) must inherit ALL Category behaviors per the 2026-05-30 director directive).

### Session shape — BUILD + DEPLOY with 4 ff-merges (1 explicit Rule 9 picker + 3 in-session director directives)

Session opened per yesterday's NEXT_SESSION.md pointer scoping (a.114) Category page Block 1 planning resume. A 3-question Block-1 planning batch (Q-A/B per-review-stacked + Q-C reuse the sibling per-competitor prose flow + Q-D mirror the xlsx export — all Recommended + chosen) preceded any code. The scaffold deployed under an explicit Rule 9 deploy picker (`f08a41f`); the director then directed the polish pass ("deploy those today" sequencing pick → `ee56398`) and the two fix rounds ("fix these issues" directives → `90bfdf5` + `9b1d023`), each covered by the in-session directive per `feedback_approval_scope_per_decision_unit.md`. A 3-decision refinement round (sequencing = polish-now-interactive-next + removal = hide-with-restore + scope = this-page-only — all Recommended + chosen) settled the deferred interactive batch. SEVEN Rule 14f decisions total, 7/7 = 100% Yes-to-Recommended.

### Design choices made this session (Rule 14f forced-pickers — Rule 14f)

- **Per-review Stars + Reviews Summary = stacked per-review, aligned (Q-A/B, Recommended + chosen).** Each captured review gets its own Stars value beside its own Reviews Summary, aligned row-for-row (implemented via real `rowSpan` sub-rows — see "What shipped").
- **Per-competitor summary columns (10/11) = reuse the sibling page's already-generated summaries (Q-C, Recommended + chosen).** The Category page reads the sibling Reviews Analysis Table page's per-competitor BULLETED + non-bulleted summaries rather than re-generating; cols 12/13 (the future Category-level AI flows) render "(not yet generated)" placeholders until Session 2.
- **Export = mirror the sibling xlsx export (Q-D, Recommended + chosen).** The Category page will mirror the sibling page's "Export Table" xlsx download (the sibling helper lives at `src/lib/competition-scraping/reviews-table-export.ts` — corrected from a prior handoff's `…/review-analysis/…` guess; see CORRECTIONS_LOG §Entry 2026-05-30 Obs. 4). Wiring this is part of the upcoming work.
- **Refinement round (interactive batch deferral):** sequencing = ship the look-and-feel polish now + defer the interactive batch to a dedicated next session (Recommended + chosen); row/category removal = hide-with-restore, NOT delete (Recommended + chosen — never destroys data elsewhere); scope = the hide + the drag-order live scoped to THIS PAGE ONLY (Recommended + chosen), backed by a NEW additive per-user/per-Project memory area.

### What shipped (builds `f08a41f` / `ee56398` / `90bfdf5` / `9b1d023`)

- **NEW route `reviews-analysis-by-category`** (`src/app/projects/[projectId]/competition-scraping/reviews-analysis-by-category/page.tsx`) + nav tab enabled — `npm run build` route count 68 → **69**.
- **A flat 13-column grouped table.** One block per competitor category; the grouping helper `category-table-grouping.ts` places the category label on the block's first row and sorts `(Uncategorized)` last (the uncategorized sentinel is the EMPTY STRING — see CORRECTIONS_LOG §Entry 2026-05-30 Obs. 3 for the stray-NUL-byte fix). Column show/hide + click-to-edit cells. Cols 10/11 reuse the sibling per-competitor summaries; cols 12/13 render "(not yet generated)" placeholders.
- **Per-review Stars / Reviews Summary via real `rowSpan` sub-rows.** Each review is a real `<tr>` sub-row; the non-per-item columns span all sub-rows via `rowSpan`, so each review's star sits beside its own summary with aligned borders (the "rowSpan sub-rows" Pattern — CORRECTIONS_LOG §Entry 2026-05-30 Obs. 1).
- **NEW pure helpers** `src/lib/competition-scraping/category-table-columns.ts` (column model / show-hide) + `category-table-grouping.ts` (the grouping + label-on-first-row + uncategorized-last logic), with `.test.ts` siblings (+29 node:test cases; src/lib 1101 → **1130**).
- **5-item look-and-feel polish (`ee56398`):** a Platforms filter box + full-length drag-to-resize column borders (incl. the right edge) + a floating bottom horizontal scrollbar + full-height AI content boxes + sub-row borders.
- **3 follow-up fixes (`90bfdf5`):** an explicit table width so the table can be dragged past the screen edge (per-column MAX raised 600→1000); the per-review `rowSpan` alignment; column-width server-side persistence fixed via a `hasLoadedPrefs` load-before-save gate (the "Debounced merge-save must gate on initial-load-complete" Pattern — CORRECTIONS_LOG §Entry 2026-05-30 Obs. 2). All column prefs persist under a `categoryTable:` key prefix on the existing `UserTablePreferences` model — NO schema change, NO `prisma db push`.
- **Vertical-scrollbar-overlap fix (`9b1d023`):** `scrollbar-gutter: stable` + 48px trailing scroll space so the scrollbar never covers the table's right edge / rightmost resize handle.

### Phase 4 (director real-Chrome verification) — clean PASS on all four deploys

Director's verbatim verdicts on all four deploys: "passed." No fix-forwards beyond the directed fix rounds (which were planned in-session, not Phase-4 redirects). Verified: the new page renders one block per category, editable cells, per-review stars beside summaries, show/hide columns, drag-to-resize columns, and the remembered layout across refresh.

### NEW reusable PATTERNS

- **"rowSpan sub-rows to align per-item data across two adjacent columns."** Stacking per-item lists in two separate `<td>`s does NOT keep item N's data aligned across columns once one cell wraps; making each item a real `<tr>` sub-row and spanning the non-per-item columns via `rowSpan` does. (Full statement: CORRECTIONS_LOG §Entry 2026-05-30 Obs. 1.)
- **"Debounced merge-save must gate on initial-load-complete."** A debounced GET-merge-PUT prefs save will wipe saved prefs if it fires before the initial load hydrates local state; gate the save on a `hasLoaded` (`hasLoadedPrefs`) flag. (Full statement: CORRECTIONS_LOG §Entry 2026-05-30 Obs. 2.)

### Scoreboard

Entry baselines = 2026-05-29-d exit = locked (root tsc clean / extension tsc clean / **910 ext** / **1101 src/lib** / **68 routes**). Post-merge /scoreboard all GREEN at NEW LOCKED baseline:

| Check | Entry | Exit | Delta |
| --- | --- | --- | --- |
| Root tsc | clean | clean | unchanged |
| Extension tsc | clean | clean | unchanged |
| Extension `npm test` | 910/910 | 910/910 | UNCHANGED (no extension code changed) |
| src/lib `node:test` | 1101/1101 | **1130/1130** | **+29** (the two new pure-helper test files `category-table-columns.test.ts` + `category-table-grouping.test.ts`) |
| `npm run build` | 68 routes | **69 routes** | **+1** (the new `reviews-analysis-by-category` page route) |
| Playwright | — | SKIPPED | per Rule 27 (build/deploy session; no e2e-relevant change; director real-Chrome Phase 4 used instead) |

### Affected §A sections (informational — §A FROZEN per Rule 18)

- The §1 Category page (Reviews Analysis By Competitor Category Table) requirement now has a LIVE Session 1 scaffold + polish. §A is frozen; this implementation note (the grouping helper's label-on-first-row + uncategorized-last shape, the per-review `rowSpan` sub-rows, the `categoryTable:`-prefixed column-prefs persistence on the existing `UserTablePreferences` model, the 5 polish items + the 3 fixes) lives in §B only.
- The DEFERRED interactive batch (drag whole categories + competitors-within-a-category + the header-row layout restructure + hide-with-restore scoped-to-page) is recorded here as the design intent locked this session; it will be built next session against a NEW additive per-user/per-Project "memory" area (drag-order + hidden-rows) → Schema-change-in-flight = YES at that session's entry. The exact storage shape (new nullable JSON columns on `UserTablePreferences` vs a sibling row) is confirmed at the start of that build session per `feedback_plan_output_shape_before_building.md`.

### Cross-references

- §B 2026-05-29-d above (W5 Fix Session C "Deploy 2" — the sibling Reviews Analysis Table page, now CLOSED) — the Category page is a NEW route alongside it; this session must NOT regress that page.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-30 — the INFORMATIONAL entry (the 2 NEW Patterns + the stray-NUL-byte build lesson + the xlsx-export-helper doc-drift correction + the P-43 tally).
- `docs/polish-item-specs/P-49-W5-S4-category-page.md` §2 2026-05-30 (parent-updated — the Session 1 ship state + the deferred interactive batch + the locked decisions hide-with-restore + scoped-to-page + the header-row layout restructure) + §3; `docs/polish-item-specs/P-49-W5-S5-type-page.md` §2 2026-05-30 (parent-updated — the Type page inherits ALL Category behaviors).
- `docs/ROADMAP.md` P-49 — status updated to "🟢 IN-FLIGHT 2026-05-30 — Category page Session 1 scaffold + polish + fixes ✅ DEPLOYED-AND-VERIFIED".
- Source cross-references: `src/app/projects/[projectId]/competition-scraping/reviews-analysis-by-category/page.tsx` (the new page; the `rowSpan` sub-rows + the `hasLoadedPrefs` gate) + `src/lib/competition-scraping/category-table-columns.ts` + `category-table-grouping.ts` (the new pure helpers) + `src/lib/competition-scraping/reviews-table-export.ts` (the sibling xlsx export helper to mirror next session); builds `f08a41f` / `ee56398` / `90bfdf5` / `9b1d023`.

**Closing line:** P-49 W5 Category page (Reviews Analysis By Competitor Category Table) Session 1 scaffold + a 5-item look-and-feel polish pass + 3 follow-up fixes + a vertical-scrollbar-overlap fix ✅ DEPLOYED-AND-VERIFIED 2026-05-30 (builds `f08a41f` / `ee56398` / `90bfdf5` / `9b1d023`) under 1 explicit Rule 9 deploy picker + 3 in-session director directives on `workflow-2-competition-scraping` — director "passed" on all four. The FIRST of the 5-session Category + Type corrective rebuild. TWO NEW reusable PATTERNS memorialized. All persistence reused the existing `UserTablePreferences` model (`categoryTable:` prefix) — NO schema change. Schema-change-in-flight NO entire session (NEXT session = YES at entry). 7/7 = 100% Yes-to-Recommended this session; running cumulative 140/143 = 97.9%. NEW baselines: src/lib `node:test` = **1130/1130** + `npm run build` = **69 routes** + extension = 910/910 UNCHANGED. **Closes (a.114) RECOMMENDED-NEXT.** **Opens (a.115) RECOMMENDED-NEXT = P-49 W5 Category page "interactive batch"** on `workflow-2-competition-scraping`. **TWENTY-FIRST build/deploy-session §B entry per Rule 18 — THIRTEENTH W5 entry; the FIRST Category-page entry.** The next §B entry will land at the close of the Category page interactive batch.

---

---

END OF DOCUMENT
