# P-59 — Update the in-app "Detailed User Guide" for ALL current Competition Scraping functionality

**Status:** ✅ **SHIPPED-AT-DEPLOY-LEVEL + DEPLOYED-AND-VERIFIED 2026-06-02-i — P-59 CLOSED.** (Spec created 2026-06-02-i as the session's first artifact per Rule 31 — it did not exist before; captured 2026-06-02-d as ROADMAP entry P-59.) W#2 Competition Scraping; the in-app `DetailedUserGuide.tsx`. ONE build commit (`3741078`); `main` went `ba31ec3 → 3741078`; director real-Chrome verdict on vklf.com: **"PASS"**. NO schema change; NO new route (a content-only edit of one existing component). **As shipped:** a comprehensive NEW "Part 3 — On the PLOS website (vklf.com)" was added (the 5-tab nav, the Competitor Content Table tools — ↗ open-detail / show-hide columns / platform filter / search / font size / click-sort + per-column funnel filter / drag-reorder columns + rows / the Sort By grouping box / dynamic category columns / +Add URL / delete-with-cascade — the competitor detail page sections + per-item Your Analysis + image viewer + category-pill ✕ delete + Overall Analysis box, capture & manage reviews, the three Reviews Analysis tables + the AI summaries at PLAIN "what you get + how to run it" depth, and the Comprehensive Analysis page Files box + editable primer + analysis editor); the Part 2 extension gaps were filled (NEW "Capture a video" + "Capture a competitor's reviews"), the stale image context-menu label ("Save image to PLOS — Competition Scraping" → the code-true "Add to PLOS — Image") was corrected, and the intro was rewritten to the 3-part shape, with gray screenshot placeholders consistent with the existing guide. THREE Rule 14f plan-shape pickers fired before writing copy (Q1 scope = Comprehensive, Q2 AI-flow depth = Plain, Q3 = gray screenshot placeholders — all the recommended option). Scoreboard UNCHANGED (915 ext / 1363 src/lib / 73 routes). See COMPETITION_SCRAPING_VERIFICATION_BACKLOG Deploy session #42 + CORRECTIONS_LOG §Entry 2026-06-02-i + COMPETITION_SCRAPING_DESIGN §B 2026-06-02-i.

**Severity:** MEDIUM — user-facing docs drift. The guide predates a large body of shipped PLOS-side features; new workers reading it would not learn ~70% of what the workflow can now do.

---

## §1 — Original director instructions (VERBATIM, append-only)

> **2026-06-02-d:** "The 'Detailed User Guide' in Workflow #2 should be updated for all the functionalities in Competition Scraping area on vklf.com and the extension that goes with it."

### Plain restatement (for traceability — NOT a substitute for §1)

Bring the always-visible in-app "Detailed User Guide" current with everything the Competition Scraping workflow can now do — both the Chrome extension capture flows AND the PLOS-side (vklf.com) surfaces (the tables, the URL detail page, reviews capture + AI analysis, the comprehensive-analysis files + primer, deletes, navigation).

---

## §2 — Rule 3 code-truth audit (done before any design, 2026-06-02-i, via Explore agent)

**The guide** = `src/app/projects/[projectId]/competition-scraping/components/DetailedUserGuide.tsx` (691 lines; a collapsible "Show guide ▸" panel with a Print-to-PDF button; uses internal `SectionHeading` / `SubsectionHeading` / `Step` / `Para` / `MutedNote` / `Kbd` / `ScreenshotPlaceholder` building blocks; screenshots are gray placeholder boxes).

**Currently documents (extension + basics):** install (7 steps + version-update), sign-in, Project + platform pick, Highlight Terms, capture a URL, add Sizes/Options, capture text, capture a regular image, capture an A+ region screenshot, browse captured (extension + PLOS table), edit a captured row (inline ✎), sign-out/reset, tips.

**NOT documented (the drift — shipped but absent):**
- **Extension:** video capture (where applicable).
- **Main Competitor Content Table tools:** column show/hide, column reorder (header drag), row drag-reorder, per-column filters, search, font-size stepper, the "Sort By" grouping box (Platform/Category/Type), dynamic content/image/video category columns, the **↗ open-detail icon** (P-60), the "Overall Competitor Analysis" column.
- **URL detail page (`url/[urlId]`):** the metadata card + custom fields, the captured-text / image / **video** / review sections, per-item "Your Analysis" rich-text boxes, the Overall Analysis box, the image viewer, category pills.
- **Reviews capture + the THREE Reviews Analysis tables** (`competitor-reviews-analysis`, `reviews-analysis-by-category`, `reviews-analysis-by-type`): grouped tables, per-review stacked cells, Source Reviews column, drag-reorder, hide/restore, Excel export, and the **AI summary flows** (per-review, per-competitor + global, per-category, per-type — each with a bulleted and a non-bulleted/prose variant).
- **Comprehensive Analysis page** (`comprehensive-analysis`): the downloadable Files box (the spreadsheets + the "without individual reviews" variants + Download-all .zip), the editable teaching **primer** (.docx download + Insert-primer + Edit/Save/Reset modal), the project-level rich-text analysis editor.
- **Deletes:** per-row delete of text / image / **video** / review, bulk review delete, URL delete (cascade), **category-label delete (✕ on pill, project-wide cascade with count-confirm — P-57)**.
- **Navigation:** the 5-tab surface nav across the workflow.

_(Note: the audit inventory is a map for planning; exact button labels/click-paths are re-verified against code when the copy for each section is written.)_

---

## §3 — Plan-shape decision (WITH the director, per feedback_plan_output_shape_before_building)

**2026-06-02-i — three plan-shape pickers answered (all the recommended option):**
- **Q1 Scope = Comprehensive.** Add a new top-level **"Part 3 — On the PLOS website (vklf.com)"** between Part 2 (extension) and the Tips section, covering: (3.0) the 5-tab navigation; (3.1) the Competitor Content Table tools (↗ open-detail, show/hide columns, Platforms filter, search, font size, click-to-sort + per-column funnel filter, drag-reorder columns + rows, the Sort By grouping box, dynamic category columns, + Add URL, delete-with-cascade); (3.2) a competitor's detail page (metadata edit, captured Text/Images/**Videos**/Reviews with per-item "Your Analysis", image viewer, category-pill ✕ delete, Overall Competitor Analysis box); (3.3) capturing & managing reviews; (3.4) the three Reviews Analysis tables + the AI summaries (plain); (3.5) the Comprehensive Analysis page (Files box + editable primer + analysis editor). Also fill the extension-side video gap in Part 2 where code supports it.
- **Q2 AI depth = Plain.** For each summary type explain plainly what it produces + the click-path to run it; group the parallel per-competitor / per-category / per-type bulleted + prose flows; omit model-picker / cost-tally / batch internals.
- **Q3 Screenshots = gray placeholders** consistent with the existing guide (no images captured this session).

**Change Impact Audit (Rule 23): Additive** — new prose sections + reuse of the existing in-file building blocks; no behavior change, no other consumers.

---

## §4 — Plan-shape questions (fired BEFORE writing copy)

- **Q1 — Scope & structure** of the PLOS-side coverage (comprehensive new "Part 3 — On the PLOS website" vs. moderate major-areas-only). _(pending)_
- **Q2 — Depth/tone for the AI analysis flows** (plain "what you get + how to run it" vs. detailed incl. model/cost/batch). _(pending)_
- **Q3 — Screenshots** for the new PLOS-side sections (gray placeholders consistent with the existing guide vs. text-only). _(pending)_

---

## §5 — Test coverage (Rule 27)

Content-only edit of one presentational component; no extractable pure logic. No new helper/test file anticipated. Guard = root tsc clean + `npm run build` route count unchanged + director real-Chrome read-through on vklf.com. Check 6 Playwright SKIPPED (prose content = director visual judgment).

---

## §6 — Verification

Director expands the Detailed User Guide on vklf.com, reads through, and confirms it now covers the PLOS-side surfaces + the extension accurately. PASS/FAIL recorded in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md`.

**RESULT (2026-06-02-i): ✅ PASS.** The director read through the updated Detailed User Guide on vklf.com (the new 3-part shape — extension install, extension capture flows incl. the new video + reviews capture, and the new "Part 3 — On the PLOS website") and confirmed it now accurately covers the shipped Competition Scraping surfaces + the extension. Director verbatim verdict: **"PASS."** Recorded in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` Deploy session #42.
