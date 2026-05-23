# Next session

**Written:** 2026-05-22-i (`session_2026-05-22-i_p45-build-2-deploy-with-phase-1-fix-forward` — end-of-session handoff after **W#2 polish P-45 screen recording SHIPPED + DEPLOYED + REAL-CHROME-VERIFIED across Amazon + Ebay + Walmart + Etsy 2026-05-22-i on vklf.com via `workflow-2-competition-scraping` → `main` ff-merge `d4a2940..ee8c79d` (11 commits 39 files +5067/-200; carries Build #1a + 1a-doc + Build #1b + 1b-doc + P-42 + P-42-doc + P-43 + P-43-doc + P-44 + P-44-doc + Build #2 fix-forward `ee8c79d`)**. Build #2 was the deploy session that has been paused for THREE prior polish-detour sessions (P-42 → P-43 → P-44) and finally shipped today. Build #2's Phase 1 dev-time verify on Amazon surfaced THREE fixable issues that landed in `ee8c79d` (3 files changed +78/-30) — Issue 1 selfBrowserSurface include / Issue 2 aggressive 20-event stopPropagation band-aid on all 4 text inputs + click-handler force-focus / Issue 3 normalized Content-Type for Supabase strict allowedMimeTypes — plus a structural-ceiling 4th issue at the FINALIZE call that was correctly recognized as a schema-change-in-flight artifact (production validator didn't have Build #1a's `isVideoSourceType('SCREEN_RECORDING')` change yet) and deferred to Phase 4 post-deploy. Pre-deploy /scoreboard all 6 checks GREEN at exact baselines (57 routes / 590 src/lib / 558 ext / 94 Playwright in 2.7m). Rule 9 deploy gate fired once for `git push origin main` via AskUserQuestion picker. Fresh extension zip `plos-extension-2026-05-22-w2-deploy-33.zip` 202.75 KB at repo root via `npm run zip` in 2.2s. **Phase 4 director real-Chrome cross-platform verify PASSED CLEAN on all 4 platforms (Amazon + Ebay + Walmart + Etsy) with zero caveats — the cleanest cross-platform PASS in any W#2 cooperation session to date.** Schema-change-in-flight flag FLIPPED YES → NO at deploy completion. **Closes P-45 ✅ DONE-AND-VERIFIED 2026-05-22-i** (no Build #3 needed). **Closes P-27 Bug #11 ✅ DONE 2026-05-22-i** via Issue 2 band-aid empirically verified on Amazon. **Opens (a.69) RECOMMENDED-NEXT = P-46 W#2 Phase 2 design session.** **Opens NEW polish ROADMAP entry P-47** — Shadow DOM refactor as long-term replacement for the Issue 2 band-aid (LOW priority).

---

## What we did this session (in plain terms)

After three sessions of pre-flight detours (fixing Claude's memory backup, fixing how `.claude/` slash commands handle directory paths, and fixing the wxt build/zip hang), we finally shipped the screen-recording feature live to vklf.com. This was the deploy session for **P-45 — the universal video-capture solution** that was designed during the May 22 design pivot from a "fix Bug #12 narrowly" path to "design a screen-recording feature that bypasses the entire class of broken-video-URL bugs."

What screen recording does in plain English: instead of trying to fetch the video bytes from the page (which fails on Amazon and Ebay because their video players use a special browser feature called Media Source Extensions that hides the real video URL behind a temporary internal pointer), the extension now lets you right-click on a video, draw a rectangle around the area you want to record, and then it captures whatever plays inside that rectangle as a real video file — using Chrome's built-in screen-recording API. The recording goes to PLOS just like the existing "Captured Video" feature, but now it works on any website that plays a video, regardless of how the website tries to hide the underlying file.

The deploy followed our usual 4-phase pattern (Phase 1 sideload test on Amazon → Phase 2 pre-deploy quality check → Phase 3 deploy + zip + sync → Phase 4 your real-Chrome walkthrough across platforms). Phase 1 surfaced three fixable bugs which we patched in a single commit before Phase 2, plus one bug that we recognized couldn't be fixed at Phase 1 because it required the server-side code to be deployed first — we sequenced it correctly: ship, then verify the previously-unfixable step in Phase 4 against the freshly-deployed production code.

The three Phase 1 fixes in plain terms:

1. **Chrome was hiding the "share this tab" option.** When the user clicked "Record video for PLOS" + drew the rectangle, Chrome's "what would you like to share?" dialog should have shown a Tab option for the current tab — but Chrome was hiding it by default because there's a privacy guard called `selfBrowserSurface` that defaults to "exclude" (so users don't accidentally share the page they're on). Since our entire feature is recording the current tab, we set it to "include" to bring the Tab option back. 1-line change.

2. **All four text input boxes on the form refused to accept typing on Amazon.** This was the long-standing P-27 Bug #11 problem — Amazon's page-level JavaScript was stealing focus from our form's inputs before any keystroke could land. We tried fixing this once before (P-27 Build #8) but the fix was too narrow — it defended against keystrokes after focus was already on the input, but the real problem was that the inputs never received focus in the first place. The new fix is more aggressive: we add 20 different event-blockers (for every keyboard, mouse, focus, and clipboard event) to all four text inputs, plus a "force-the-focus-back-here" loop that runs the next microtask after any click. 80 listeners total per form open, which is a lot of machinery, but it works — director verified all four inputs accepted typing on Amazon during Phase 4. We've captured a follow-up polish item (P-47) for a cleaner long-term fix using Shadow DOM isolation, but the band-aid works for now.

3. **Supabase was rejecting our video uploads with a 400 error.** Our recording code was attaching the full media type to the upload header (something like `video/webm;codecs=vp9,opus` which includes the codec info), but Supabase's storage bucket is configured to only accept exact matches against `['video/mp4', 'video/webm', 'video/quicktime']` — the codec part of the header makes it not match. Fix: strip the codec part before sending. The codec info is still preserved inside the video file itself (browsers figure it out from the file contents), so playback isn't affected. 1-line change.

The fourth issue we caught at Phase 1 was structural — when you clicked Save after all the fixes, the production server returned a 400 saying it didn't recognize SCREEN_RECORDING as a valid video source type. The reason: the code that knows about SCREEN_RECORDING was sitting on our feature branch but hadn't been deployed to vklf.com yet — that's what this whole deploy session was about. We correctly recognized that Phase 1 has a structural ceiling (it tests against live production, which doesn't have the new code yet), declared Phase 1 done up to that point, proceeded through Phase 2 → Phase 3 to ship the new server-side code, and then verified the previously-failing step worked in Phase 4 against the freshly-deployed code.

Phase 4 was the smoothest cross-platform verification we've had in any W#2 session — all four platforms (Amazon + Ebay + Walmart + Etsy) passed clean with zero caveats. Director's exact words: "All passed." No Build #3 needed.

The P-45 screen-recording arc is now closed end-to-end after three sessions (Build #1a engine foundation 2026-05-22-d + Build #1b wiring 2026-05-22-e + Build #2 deploy + Phase 1 fix-forward + cross-platform verify today). The schema-change-in-flight flag flipped from YES (since 2026-05-22-d when the SCREEN_RECORDING enum landed in Supabase but not yet on vklf.com) to NO (deploy completed, production routes now read the new enum). That flag has been YES for a week — it's been a long arc.

One bonus closure: **P-27 Bug #11** (the Amazon input-dead bug that's been on the backlog since Build #8 deploy 2026-05-21) closed today via the Issue 2 band-aid empirically verified on Amazon during Phase 4. P-27 Bug #9 (Amazon hover-preview deeper-walk) + Bug #15 (Ebay native-controls quirk) remain DEFERRED since P-45's flow didn't exercise them.

What we did NOT do: we did NOT touch P-46 (the big W#2 Phase 2 redesign) at all this session — that starts next session. We did NOT close P-26 (below-fold scroll capture) — also DEFERRED. We hit ZERO procedural slips this session that rise to a corrections-tier entry — the two P-43-bug-class re-reproductions during scoreboard runs were caught + recovered within seconds + captured as informational sub-observations in the CORRECTIONS_LOG §Entry, not top-level slips.

## What we'll do next session (in plain terms)

Next session is **P-46 W#2 Phase 2 design session** — the deep design session that's been on the roadmap since 2026-05-22-c (locked to start AFTER P-45 ships, which happened today). This is the BIG W#2 Phase 2 scope-drop: redesign the Competition Data page, build a brand-new Comprehensive Competitor Analysis page, add ~12 new table columns, add a brand-new Reviews capture workflow, restructure the URL detail page with per-item AI-ready Analysis text boxes, add vklf.com-side upload/edit/delete capabilities (so you don't have to use the extension for everything), and add extension form additions for Type/Description-1/Description-2/Price + thumbnail-selection-on-failure.

**Next session is PURE DESIGN — no code.** ~1 session to lock the design via the 10 deferred clarification questions captured in the P-46 ROADMAP entry. Mechanically, the session will:

1. **Read** the P-46 ROADMAP entry + `docs/COMPETITION_SCRAPING_DESIGN.md` §A frozen interview answers + `docs/CAPTURED_VIDEOS_DESIGN.md` (the §A frozen interview shape we'll mirror for the new design doc).

2. **Walk through the 10 clarification questions one at a time** via Rule 14f forced-pickers — each picker has 2-4 plausible options + a recommended pick + the rationale. The questions cover: Reviews capture extraction shape / inline cell editing / per-user UI preference persistence / Comprehensive Analysis page scope (one per Project vs one per Platform) / rich-text editor library (TipTap recommended) / Sizes/Options box deletion vs hide / Competition Score input shape / Status column ↔ URL detail page Scraping Status mirroring / "Select preview thumbnail" trigger shape / 5-workstream sequencing order.

3. **Create new `docs/COMPETITION_DATA_V2_DESIGN.md`** with §A frozen interview answers (the 10 questions + decisions) + §B append-only refinements log + §C per-workstream implementation outlines.

4. **Update ROADMAP P-46 entry** with the locked design + per-workstream session counts now that the design is committed.

5. **End-of-session doc-batch** (the usual 6-Group-A + COMPETITION_DATA_V2_DESIGN.md new doc) + **ONE push** (this is a doc-only session — no code commits, no deploys, no zips, no Rule 9 gates).

After P-46 design lands, the next ~15-25 sessions across 5 workstreams ship the actual P-46 implementation (Workstream 1 schema + 4 more workstreams for UI + extension + reviews). Then W#2 graduates. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).

**No real-world testing required.** No Phase 1 / Phase 2 / Phase 3 / Phase 4 deploy mechanics — this is pure design. Director's role is to answer the 10 clarification questions via Rule 14f pickers; Claude's role is to surface options + recommendations + capture decisions in the new design doc.

## What's still left on the total roadmap (in plain terms)

Major W#2 items as of session-end 2026-05-22-i:

- **P-46 W#2 Phase 2 design session (NEXT — recommended).** ~1 dedicated DESIGN session. New `docs/COMPETITION_DATA_V2_DESIGN.md` doc created at this session. No code; no deploy; no Rule 9 gates.
- **P-46 W#2 Phase 2 implementation.** ~15-25 sessions across 5 workstreams (Schema + Competition Data page redesign + URL detail page redesign + Comprehensive Competitor Analysis page + Extension + new Reviews capture workflow). Workstream 1 (Schema) is non-negotiable first. Estimated arrival: ~3-6 weeks of session work depending on pace.
- **P-47 Shadow DOM refactor (NEW this session).** ~2-3 sessions to replace the Issue 2 80-event-listener band-aid with proper Shadow DOM isolation. LOW priority since band-aid works. Sequencing AFTER P-46's design lands since P-46 may introduce new in-form interactions that change the refactor's scope.
- **P-26 below-fold scroll capture** — lower-priority W#2 polish; current workaround works (two captures + two metadata-tagged rows); ~1-2 sessions when we get to it. May be reduced in urgency by P-46's vklf.com-side image upload affordances.
- **P-27 Bug #9 (Amazon hover-preview deeper-walk) + Bug #15 (Ebay native-controls quirk)** — DEFERRED low-priority polish items; not exercised by P-45's flow; may stay deferred indefinitely or close as obsoleted once P-46's redesign covers the user-visible surface differently.
- **W#2 graduation** after P-46 + P-47 + P-26 ship. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking P-46):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Not blocking P-46 design at all.

---

**For:** the next Claude Code session — **P-46 W#2 Phase 2 design session** (estimated ~2-3 hours: pre-build doc reads ~30 min + 10 clarification questions via Rule 14f pickers ~60-90 min cooperative + create `docs/COMPETITION_DATA_V2_DESIGN.md` ~30-60 min + end-of-session doc-batch ~30 min). Per Rule 23 Change Impact Audit: **PURE DOCS this session** (safe) — ZERO code changes; only design-doc creation + ROADMAP P-46 entry update + the usual Group A header bumps + NEXT_SESSION.md rewrite. Reversible at any point until P-46 Workstream 1 ships code (the next session after the design session, sometime after this design session). No new dependencies. No data risk. Zero downstream W#1 / W#3 cross-tool impact. **Schema-change-in-flight flag stays NO** the entire session — no `prisma db push` planned, no schema delta. **Rule 9 triggers planned: ZERO** — pure docs session, no destructive operations; no `git push origin main`, no `prisma db push`, no `git reset --hard`, no `rm -rf`, no SQL DELETE/DROP/TRUNCATE. **ONE push planned** — end-of-session doc-batch push to `origin/workflow-2-competition-scraping`.

---

## Status of today's session

**P-45 ✅ DONE-AND-VERIFIED 2026-05-22-i on vklf.com via `workflow-2-competition-scraping` → `main` ff-merge `d4a2940..ee8c79d` (11 commits 39 files +5067/-200; fresh extension zip `plos-extension-2026-05-22-w2-deploy-33.zip` 202.75 KB).** One-hundred-and-thirty-fifth Claude Code session — `session_2026-05-22-i_p45-build-2-deploy-with-phase-1-fix-forward`. Build #2 deploy session — Phase 1 fix-forward (3 issues) + Phase 2 /scoreboard GREEN + Phase 3 /deploy orchestration + Phase 4 director real-Chrome cross-platform verify PASSED CLEAN on all 4 platforms.

**Session shape (canonical deploy session):**

- Build commit `ee8c79d` landed on `workflow-2-competition-scraping` (3 files changed +78/-30 — Issue 1 selfBrowserSurface include in record-controller.ts; Issue 2 aggressive 20-event stopPropagation band-aid in video-capture-form.ts; Issue 3 Content-Type normalization in recording-bytes-upload.ts).
- ff-merge `workflow-2-competition-scraping` → `main` (`d4a2940..ee8c79d` — 11 commits carried as a single fast-forward).
- `git push origin main` — Rule 9 director-Yes gate fired ONCE via AskUserQuestion picker.
- Vercel auto-redeploy fired post-push — director confirmed Phase 4 passed which implies vklf.com was deployed before Phase 4.
- Ping-pong sync — `git push origin workflow-2-competition-scraping` (`e03a317..ee8c79d`).
- Fresh extension zip `plos-extension-2026-05-22-w2-deploy-33.zip` (202.75 KB) at repo root via `npm run zip` in 2.2s (exits cleanly thanks to P-44's wxt-zip.mjs wrapper).
- Phase 4 director real-Chrome cross-platform verify cooperative — ALL 4 PLATFORMS PASSED CLEAN (Amazon + Ebay + Walmart + Etsy).
- TWO pushes for the doc-batch + ping-pong at end-of-session (operationally adjacent per the canonical 3-push pattern).
- Schema-change-in-flight flag FLIPPED YES → NO at deploy completion.

**Director sentiment:** Phase 4 "All passed" — cleanest cross-platform PASS in any W#2 cooperation session.

**§4 Step 1c forced-picker FIRED** — between P-46 (recommended — the natural next step per the long-standing roadmap commitment that P-46's deep design starts AFTER P-45 ships; ~1 dedicated design session, no code, no deploy, no Rule 9 gates) vs. P-47 (new — Shadow DOM refactor; LOW priority + sequencing-wise should wait until P-46 design lands first to avoid scope drift) vs. P-27 leftovers (Bug #9 + Bug #15; LOW priority + may obsolete with P-46 redesign) vs. P-26 (below-fold scroll capture; lower priority + may obsolete with P-46's vklf.com-side image uploads) vs. "I have a question first." — director picked P-46 per `feedback_default_to_recommendation.md`.

**ZERO new DEFERRED items at session end (Rule 26)** — all 10 tasks completed (4-phase deploy + 3 fix-forward sub-tasks + re-build/re-verify + end-of-session).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry this session — the P-45 CLOSING §Entry** capturing empirical fix narrative for all 3 Phase-1 issues + 3 Reusable Patterns (A: Supabase bucket validation 400 via Content-Type normalization / B: P-27-Bug-#11-class page-level focus-stealing dampened via aggressive event isolation with Shadow DOM P-47 as long-term fix / C: verifying a feature whose server-side code is undeployed at Phase 1 — structural-ceiling acknowledgment + Phase 4 deferral) + 2 embedded informational sub-observations about P-43-bug-class re-reproductions at Claude's inline-typed Bash layer (pre-deploy + post-merge Check 5 cwd-leak; both `0` routes; both recovered with absolute cd; LOW informational reinforcing template hardening protects verbatim-template-read pathway but not Claude's inline-typed shortcuts).

**THIRTEENTH end-of-session run under the Rule 30 + §4 Step 4b template** (first was 2026-05-21-b Build #3; second was 2026-05-21-c Build #4; third was 2026-05-21-d Build #5; fourth was 2026-05-22 Build #6; fifth was 2026-05-22-b Build #7; sixth was 2026-05-21 Build #8; seventh was 2026-05-22-c Build #9; eighth was 2026-05-22-d Build #1a; ninth was 2026-05-22-e Build #1b; tenth was 2026-05-22-f P-42; eleventh was 2026-05-22-g P-43; twelfth was 2026-05-22-h P-44). The 3 plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-46 design session lands here (doc-only commits stay on workflow-2 per the established pattern; design doc lives on workflow-2 until any P-46 implementation session deploys it forward via ff-merge to main). The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at commit `ee8c79d` (or the doc-batch commit that lands after this NEXT_SESSION.md is written). `main` ALSO at `ee8c79d` (deployed today). After this session's end-of-session doc-batch push, both branches will be at the doc-batch commit. After the next P-46 design session's end-of-session doc-batch, workflow-2 will be 1 commit ahead of main (the design session's doc-batch; will not be ff-merged to main since design docs live on workflow-2 until first implementation session deploys).

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-46 W#2 Phase 2 design session, on `workflow-2-competition-scraping`.** Closes **(a.69) RECOMMENDED-NEXT**. This is the dedicated DESIGN session that's been on the roadmap since 2026-05-22-c (locked to start AFTER P-45 ships, which happened 2026-05-22-i). PURE DESIGN — no code commits, no deploys, no Rule 9 gates, no fresh extension zip, no Phase 1/2/3/4 mechanics. The session creates a new design doc + locks the 10 clarification questions via Rule 14f forced-pickers.

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or coding).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-46 polish-backlog entry (the 10 clarification questions are listed in the entry verbatim — the binding input for today's session) + the P-45 polish-backlog entry (now ✅ DONE-AND-VERIFIED 2026-05-22-i — graduated last session; informs the "what's already shipped" baseline) + the P-47 polish-backlog entry (NEW 2026-05-22-i — Shadow DOM refactor; informs the sequencing — P-47 may follow P-46 after P-46's design lands).
- `docs/CAPTURED_VIDEOS_DESIGN.md` §A frozen interview shape (the model for the new P-46 design doc's §A — read fully to understand the question-cluster + frozen-decision pattern this design doc should mirror).
- `docs/COMPETITION_SCRAPING_DESIGN.md` §A frozen Phase 1 interview answers (the prior W#2 design surface this P-46 Phase 2 redesign builds on) + §B append-only refinements log (the precedent for append-only design-doc evolution per Rule 18).
- `docs/HANDOFF_PROTOCOL.md` Rule 14f (forced-picker pattern — fires 10 times this session, once per clarification question) + Rule 18 (append-only design doc — once `docs/COMPETITION_DATA_V2_DESIGN.md` §A is locked at end of this session, it becomes frozen per Rule 18; future P-46 implementation sessions append §B refinements without modifying §A) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit — DOC-ONLY this session; safe) + Rule 24 (Default-to-recommendation may apply — many clarification questions have a single most-thorough/reliable answer that director would default-approve; surface options anyway since these are intent-clarification not permission-clarification) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `prisma/schema.prisma` (the live schema — informs the schema-additions list in the P-46 entry; confirm which fields exist today vs. greenfield).
- `src/lib/shared-types/competition-scraping.ts` (wire types informing the schema additions + new model shapes).
- `src/app/projects/[projectId]/competition-scraping/page.tsx` + `src/app/projects/[projectId]/competition-scraping/url/[urlId]/page.tsx` + `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx` (the existing Competition Data page + URL detail page surfaces P-46 redesigns; read to understand the as-is layout the redesign departs from).
- `src/app/projects/[projectId]/competition-scraping/components/DetailedUserGuide.tsx` (the Detailed User Guide box P-46 shrinks + repositions — read for the as-is content layout).

**Task shape (P-46 W#2 Phase 2 design session):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or coding. Cover: what we'll do in the session (read P-46 entry + read existing design docs + walk through 10 clarification questions via Rule 14f pickers + create `docs/COMPETITION_DATA_V2_DESIGN.md` with §A frozen interview answers + update ROADMAP P-46 entry with locked design + end-of-session doc-batch), the zero-Rule-9-gates shape, the no-deploy-no-code shape (this is the design session — implementation arrives in 15-25 future BUILD sessions across 5 workstreams).

2. **Pre-design read** — execute the pre-build read list above. ~30 minutes. Surface any drift between the P-46 entry's claimed schema vs. the live prisma/schema.prisma + the existing UrlDetailContent.tsx surface vs. the P-46 entry's claimed line numbers; capture as informational drift-check notes per Rule 22 + Rule 24, NOT as a corrections-tier slip unless something materially impacts the design.

3. **Walk through the 10 clarification questions one at a time** via Rule 14f forced-pickers. Each picker shape: (A) the most-thorough option (recommended; tagged inside the option label) + (B-D) 2-3 plausible alternatives + "I have a question first." escape hatch. Per `feedback_default_to_recommendation.md`, if the question is about clarifying director's INTENT (e.g., "Reviews capture extraction shape — auto-extract from DOM or user-entered?"), surface options + recommended pick + wait for director answer. If the question is asking permission to proceed on a path director would default-approve (e.g., "should Workstream 1 schema be non-negotiable first?"), skip the picker + proceed with the recommendation per Default-to-recommendation. **The 10 questions verbatim from the P-46 ROADMAP entry:** (1) Reviews capture extraction shape — star rating + reviewer + body from DOM auto-extract or user-entered? Reviewer name? Date? (2) Inline cell editing in table — click-to-edit on every cell vs. edit-mode toggle? (3) Where do per-user UI preferences persist — server-side per-user (cross-device sync) or chrome.storage.local (per-browser)? (4) Comprehensive Competitor Analysis page — one per Project, one per Platform within Project, or freeform multiple per Project? (5) Rich-text editor library choice — TipTap (recommended) vs. Lexical vs. Slate vs. Quill vs. ProseMirror? (6) Sizes / Options box removal — delete prod data or just hide UI? (7) Competition Score 1-100 — slider / number input / both? (8) Status column "Complete/Incomplete" identical to URL detail page's "Scraping Status" toggle? (assumed yes — confirm). (9) "Select preview thumbnail" button — appears only when thumbnail capture fails, or always available as alternative? Uses P-17 region-screenshot infrastructure or new mechanism? (10) Sequencing inside P-46 — ship the 5 workstreams in what order? (Schema first is non-negotiable; then probably URL detail page → Competition Data table → Comprehensive Analysis page → Reviews capture → Extension form additions).

4. **Create `docs/COMPETITION_DATA_V2_DESIGN.md`** with §A frozen interview answers (the 10 questions + decisions; mirrors the §A shape of `docs/CAPTURED_VIDEOS_DESIGN.md`) + §B append-only refinements log (empty initially; future P-46 implementation sessions append) + §C per-workstream implementation outlines (~5 §C subsections one per workstream — Schema / Competition Data page / URL detail page / Comprehensive Analysis page / Extension + Reviews capture). Cross-references at the top: link to P-46 ROADMAP entry, CAPTURED_VIDEOS_DESIGN.md (the design-doc shape model), COMPETITION_SCRAPING_DESIGN.md (the prior W#2 Phase 1 design), HANDOFF_PROTOCOL Rule 14f + Rule 18 (the design-interview pattern + append-only governance).

5. **Update ROADMAP P-46 entry** with the 10 locked decisions inline + per-workstream session counts now that the design is committed + cross-reference to the new design doc + flip the "10 clarification questions" subsection to "10 DECISIONS LOCKED 2026-05-22-NEXT-LETTER" with each Q→A mapping.

6. **End-of-session doc-batch** covers ROADMAP (header bump + P-46 entry update) + CHAT_REGISTRY (header bump — 136th Claude Code session) + DOCUMENT_MANIFEST (header bump + register new COMPETITION_DATA_V2_DESIGN.md as Group B) + CORRECTIONS_LOG (header bump only — likely zero new §Entries unless a process slip occurs) + NEXT_SESSION.md (rewritten for P-46 Workstream 1 schema build session, the natural next step after the design) + HANDOFF_PROTOCOL (header bump only — no new rules expected) + CLAUDE_CODE_STARTER (header bump only) + NEW `docs/COMPETITION_DATA_V2_DESIGN.md` (the design itself). **ONE push** to `origin/workflow-2-competition-scraping` (no main push since no Rule 9 trigger this session; no ping-pong sync since main doesn't move).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** for the 10 clarification questions, surface 2-4 plausible options + the recommended option + the rationale; default to the recommendation if director defers. Per `feedback_default_to_recommendation.md`, skip the picker if the question is asking permission to proceed on a path the director would default-approve (intent vs. permission distinction). Schema-additions, workstream sequencing, and editor-library choice are all intent-clarification — surface options. Per-workstream session counts + the file layout for the new design doc are permission-on-default-approved-path — skip pickers + proceed with the recommendation.

**Schema-change-in-flight flag:** stays **NO** the entire session — no `prisma db push` planned, no schema delta, no Rule 9 gate fires.

---

## Pre-session notes (offline steps for director between sessions)

**NO required offline steps for P-46 design session** — the session runs entirely from Claude reading docs + director answering Rule 14f pickers. No Supabase changes, no Vercel changes, no extension reload, no real-Chrome walkthrough.

**Standing optional offline step (NOT blocking P-46 — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking P-46 design at all — can happen any time. Note: screen-recorded webm files are typically smaller than directly-captured mp4 files, so the 100 MB cap is less likely to bite for SCREEN_RECORDING than for DIRECT_BYTES rows.

**Optional offline reading for director:** `docs/ROADMAP.md` P-46 polish-backlog entry (the full ~3KB scope-drop directive that captured what P-46 is — the 5 workstreams + the 10 clarification questions). ~10-minute skim before the next session if director wants the full context. Also worth skimming: `docs/CAPTURED_VIDEOS_DESIGN.md` §A (the model design doc the new P-46 design doc mirrors; gives a feel for the §A frozen interview shape).

**Pre-design setup (informational — Claude will handle in-session):** the design session doesn't sideload the extension or run any code; the only "setup" is making sure the director has the ROADMAP P-46 entry's 10 questions visible (Claude will re-read them at the start of the picker walkthrough; this is informational only).

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — pure design session; no destructive operations.

**Rule 9 triggers planned this session: ZERO** — no `prisma db push`, no `git push origin main`, no `git reset --hard`, no `git push --force`, no `git branch -D`, no `rm -rf`, no SQL DELETE/DROP/TRUNCATE planned.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits a 🚨 alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any design work — the mirror should be healthy entering P-46 because P-42 shipped 2026-05-22-f and has run cleanly since.

---

## Why this pointer was written this way (debug aid)

Today's session shipped P-45 Build #2 — the screen-recording deploy session that had been paused for THREE prior polish-detour sessions (P-42 backup-memory hook 2026-05-22-f → P-43 absolute-paths discipline 2026-05-22-g → P-44 wxt build/zip hang 2026-05-22-h). The deploy went smoothly: Phase 1 surfaced 3 fixable issues that we shipped in `ee8c79d` before Phase 2; Phase 2 /scoreboard GREEN at exact baselines; Phase 3 /deploy orchestration with Rule 9 director-Yes gate + ff-merge → main + Vercel auto-redeploy + ping-pong sync + fresh extension zip; Phase 4 director real-Chrome cross-platform verify PASSED CLEAN on all 4 platforms.

The natural next-session task per the long-standing roadmap commitment is P-46 W#2 Phase 2 design — locked since 2026-05-22-c to start AFTER P-45 ships, which happened today. P-46 is the BIG W#2 Phase 2 scope-drop the director captured 2026-05-22-c — Competition Data page redesign + new Comprehensive Competitor Analysis page + ~12 new table columns + new Reviews capture workflow + URL detail page restructure + vklf.com-side upload/edit/delete + extension form additions + thumbnail-selection-on-failure.

The shape of the P-46 design session is **pure design — no code commits, no deploys, no Rule 9 gates** — the next session walks through the 10 clarification questions captured in the P-46 ROADMAP entry, locks the decisions via Rule 14f pickers, creates a new `docs/COMPETITION_DATA_V2_DESIGN.md` mirroring the §A shape of `CAPTURED_VIDEOS_DESIGN.md`, and lands ONE push (doc-batch only).

**Alternate next-session candidates if director shifts priorities at session start (after P-45 + before P-46):**

- **Defer P-46 + start P-47 Shadow DOM refactor.** ~2-3 sessions. Not recommended — P-47 is LOW priority (band-aid works empirically) and sequencing-wise should wait until P-46's design lands first because P-46 may introduce new in-form interactions that change the refactor's scope. If director picks this anyway, it's a small reversible polish + would close the band-aid debt at the cost of deferring P-46.
- **Defer P-46 + start P-26 below-fold scroll capture.** ~1-2 sessions. Not recommended — P-46 is the big-scope item that's been on the roadmap for over two weeks since the scope-drop directive; P-26 is much smaller + the workaround works. Jumping to P-26 doesn't advance the W#2 graduation path materially.
- **Defer P-46 + start P-27 Bug #9 + Bug #15 (the remaining deferred captured-videos polish leftovers).** Not recommended — both bugs are LOW priority and may obsolete entirely with P-46's redesign (which restructures the URL detail page surface they live in). Better to lock the P-46 design first + see if P-46 reshapes the surface in a way that closes Bug #9 + Bug #15 incidentally.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time.
- **A polish-detour ahead of P-46 if director wants pre-flight infrastructure work.** Reasonable candidates: nothing immediately obvious — P-42 + P-43 + P-44 covered the three reliably-reproducible operational pain classes that were open. If director picks this path, we should surface the open polish landscape as a Rule 14f forced-picker. My recommended pick in that scenario would be to ship P-47 Shadow DOM refactor as a 2-3 session polish detour ahead of P-46 implementation (NOT before P-46 design — the design needs to lock first), but only if director thinks the 80-listener band-aid is too heavy + wants the proper Shadow DOM mount before P-46 introduces new form interactions.

Check `ROADMAP.md` for the canonical state.
