# Next session

**Written:** 2026-05-14 — session_2026-05-14_w2-main-deploy-session-13-p23-amazon-context-menu-DEPLOYED-FULL-VERIFY (Claude Code, on `workflow-2-competition-scraping`).

**For:** the next Claude Code session.

**Status of P-23 (Amazon main-image right-click context-menu):** ✅ **SHIPPED-AT-DEPLOY-LEVEL today.** Standard cheat-sheet (b) flow executed cleanly — workflow-2 1 commit ahead of origin/main → rebase no-op fast-forward → push origin/workflow-2 → ff-merge to main → push origin/main. Pre-deploy verification scoreboard all GREEN (ext tsc clean; ext `npm test` 334/334; root Playwright extension project 31/31; ext build clean; content.js 63,038 bytes). Fresh zip packaged: `plos-extension-2026-05-14-w2-deploy-13.zip` (188,102 bytes; 9 files). Real-Amazon browser verification director-reported: *"Everything worked perfectly. No need to check the database."* All 9 walkthrough steps passed including UX-noise spot-check (menu appears on non-images, bails silently as designed).

**Three new polish items captured this session per Rule 24 + Rule 14a Read-It-Back:** P-27 (delete captured texts/images from a URL), P-28 (delete saved URLs with cascade), P-29 (manually add URLs/texts/images on vklf.com — any platform, including "Other" for independent websites). All three are partial-implementations of original W#2 design-doc intent (lines 487/489/506) — captured as polish-backlog entries with cross-references to design-doc lineage. P-29 explicitly reverses the 2026-05-07 deliberate deferral.

**Director picked next session via §4 Step 1c interview:** P-29 design session (manual-add UI on vklf.com).

---

## Branch
workflow-2-competition-scraping

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**W#2 P-29 design session — manual-add URLs / captured texts / captured images on vklf.com (any platform, including "Other" for independent websites).** Closes (a.29) RECOMMENDED-NEXT.

This is a **DESIGN session** — settle the open design questions FIRST via Rule 14f forced-pickers, then propose a build slice. Do NOT start coding before director approves the design shape. The Rule 18 mid-build directive Read-It-Back applies per question: each forced-picker outcome lands as an append-only entry in `COMPETITION_SCRAPING_DESIGN.md §B`.

**Open design questions to settle in this session (each via Rule 14f forced-picker, recommendations marked per `feedback_recommendation_style.md` "most thorough and reliable, not fastest/cheapest"):**

  1. **Image upload mechanics for manual-add image form** — drag-and-drop from filesystem vs. paste-from-clipboard vs. URL-of-image-from-the-web vs. all three? Backend already supports the 2-phase signed-URL upload pattern (`requestUpload` + `finalize`); the question is what front-end input shapes to expose. The director's original intent from DESIGN doc line 489 (manual-add for "independent websites") implies "URL-of-image-from-the-web" is needed at minimum; drag-and-drop is the most thorough complete coverage.

  2. **"Other" platform option for independent websites** — does this require a schema add (new enum value or shift to string-typed platform field)? Implications for downstream workflows that may filter by platform. Originally implied by DESIGN doc line 489's "independent websites" phrasing.

  3. **Audit-trail distinction** — manually-added rows should be distinguishable from extension-captured rows per PLATFORM_REQUIREMENTS §5. Add a `source: 'extension' | 'manual'` column to CapturedImage / CapturedText / CompetitorUrl? Or infer from context (e.g., admin manually-adds via vklf.com; workers extension-capture)?

  4. **Permission model** — admin-only in Phase 1 (matches current admin-solo model) vs. worker-also-allowed in Phase 2?

  5. **Manual-add URL form UX location** — modal opened from a "+ Manually add URL" button on `UrlTable.tsx`? Inline expansion in the table? Separate `/competition-scraping/url/new` page?

**Per HANDOFF_PROTOCOL.md Rule 25 + MULTI_WORKFLOW_PROTOCOL.md, this is a W#2-scope session** — branch is `workflow-2-competition-scraping`. Work touches `src/app/projects/[projectId]/competition-scraping/...` UI + likely new `src/app/api/projects/[projectId]/competition-scraping/.../route.ts` handlers for vklf.com-side image uploads. Schema add for "Other" platform is in scope IF director picks it during design.

**At session start, before any code change:** verify branch state with `git branch --show-current`. Run `git log origin/main..workflow-2-competition-scraping` (expect 0 commits — clean state post-deploy-#13) AND `git log workflow-2-competition-scraping..origin/main` (expect 0 commits). Read `COMPETITION_SCRAPING_DESIGN.md §A` interview answers (esp. lines 487/489/506) + `§B` in-flight refinements for context on the original design intent. Read `DATA_CATALOG.md` entries for `CapturedImage` / `CapturedText` / `CompetitorUrl` to understand the data model. Per Rule 24, perform pre-capture search reconfirming the P-29 design-doc lineage I captured this session.

**Rule 18 §B append-only entries are mandatory** for each design decision the director picks via forced-picker.

**Verification approach for the eventual build:** when the design pass ends and you propose a build slice, run a Rule 27 Playwright forced-picker before any manual walkthrough — most of the P-29 UI is in-browser DOM/forms which is exactly Playwright's strong suit. Manual director walkthrough is appropriate for the visual-judgment portions (does the form layout feel right?) and any "Other" platform end-to-end smoke.

## Pre-session notes (optional, offline steps to do between sessions)

Nothing strictly required. If you (the director) want to do offline reading: the three new polish items live in `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` at the bottom, in sections "P-27 NEW POLISH ITEM," "P-28 NEW POLISH ITEM," and "P-29 NEW POLISH ITEM." They're written in plain-language and capture the open design questions for each item. P-29 is the next-session pick.

## Why this pointer was written this way (debug aid)

Today's session (W#2 → main deploy session #13) deployed P-23 cleanly with real-Amazon browser-verify PASS on all 9 walkthrough steps. Director then surfaced three new W#2 features (delete texts/images per URL, delete URLs, manual-add on vklf.com). Rule 24 pre-capture search revealed all three were ALREADY specified in the original W#2 design interview (DESIGN doc lines 487/489/506) but never built — and P-29 specifically was deliberately deferred on 2026-05-07 in favor of the extension as the canonical data-entry path. Captured as P-27 / P-28 / P-29 in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` with cross-references to the design-doc lineage. Director picked **P-29 (recommended)** via §4 Step 1c interview as next session.

P-29 has more open design questions than P-27 or P-28 (which are more "build UI for known back-end" shapes), so this next session is framed as **DESIGN-FIRST**. If the design pass goes quickly the same session could ship the first build slice — but the launch prompt explicitly asks the next Claude session to wait for director's design approval before coding.

If you (the next session) read this and director has revised intent OR P-29 is no longer the right next pick, check `ROADMAP.md` Current Active Tools for the actual current state and ask the director which task they'd like to work on instead. The candidate list at end-of-this-session was: P-29 (picked) / P-28 / P-27 / P-21 (pickInitialUrl asymmetric canonicalize, MEDIUM, still open) / P-19 (green-overlay-dismiss → one-time selection collapse, LOW-MEDIUM, still open) / P-13 (autofocus on "+ Add new…" inline category input, LOW, still open).
