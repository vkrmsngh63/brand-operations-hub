# REVIEWS PHASE 2 — DESIGN DOC (Workflow #2 polish P-49)

**Polish item:** P-49 — W#2 Phase 2 automated per-platform review collection (Amazon + eBay + Etsy + Walmart) + 3-level AI-driven review analysis system (per-product two-sweep + cross-Type pooled + cross-everything competitive landscape) + Captured Reviews UI extensions on vklf.com (star-count breakdown counter-bar + server-side drag-to-reorder + bulk-delete affordance).
**Parent workflow:** W#2 Competition Scraping & Deep Analysis (🔍)
**Status:** 🟢 Implementation phase — initial interview FROZEN 2026-05-25 (this doc); Workstream 2 Amazon Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-26 via build commit `422436f` (foundation session bundling §A.16 schema migration + shared content-script infra + Amazon DOM walker) + Workstream 2 Amazon Session 2 ✅ DONE-AT-CODE-LEVEL 2026-05-27 via build commit `1830074` (cross-star navigation loop + helpful-count sort within star + `Customers say` AI-summary block capture + Shadow DOM trigger popup with per-URL cap override) + Workstream 2 Amazon ✅ DEPLOYED-AND-VERIFIED 2026-05-28 on vklf.com end-to-end via `workflow-2-competition-scraping` → `main` (initial deploy ff-merge `1914171..0ef8340` carrying Sessions 1 + 2 + intervening doc-batches under ONE Rule 9 gate + 3 fix-forward commits FF#1 `8bc2e7e` accept /dp/<ASIN> dispatch + FF#2+#3 `b55cdbd` bundled trigger-modal-per-star-checkboxes + progress-indicator-per-star-breakdown + FF#4 `f6944db` pageNumber-increment pagination shipped under 3 additional Rule 9 deploy gates; final director PASS verdict after FF#4 RESOLVES the Sessions 1 + 2 standing carry-over) + **Workstream 4 Captured Reviews UI extensions Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-29 on `workflow-2-competition-scraping` via build commit `e89ae50` (9 files +2162/-43) — all 3 §C.4 pieces shipped in ONE session per Rule 14f scope picker outcome — star-count counter-bar with click-to-filter per §A.14 + drag-to-reorder via the `sortRank Int?` column (reusing the P-46 W3 S3 @dnd-kit shared debounced-mutation Pattern from 2026-05-23-f) per §A.5 + bulk-delete with multi-select checkboxes + confirm modal + new batch-delete API route per §A.6; directly addresses 2026-05-28 Phase 4 verification issue #3; 52 new src/lib tests + 2 new API routes; ZERO Rule 9 deploy gates this session (build commit stays on workflow branch until W4 deploy session per (a.97))**; Workstream 4 deploy session NEXT per (a.97).
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

---

END OF DOCUMENT
