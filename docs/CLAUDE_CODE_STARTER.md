# CLAUDE CODE STARTER PROMPT
## Paste this (or reference it) at the start of EVERY Claude Code session

**Purpose:** Establishes the non-negotiable working rules for every Claude Code session. Read at the start of every session, before any work begins. This file is stored in the repo at `docs/CLAUDE_CODE_STARTER.md` so Claude Code can read it directly.

**Last updated:** 2026-05-28 — Header bump only this session (`session_2026-05-28_p46-workstream-2-session-4-captured-reviews-ui` — **W#2 polish P-46 Workstream 2 (URL detail page redesign) Session 4 ✅ DONE-AT-CODE-LEVEL 2026-05-28 on `workflow-2-competition-scraping`** — fourth build session of the P-46 Workstream 2 implementation arc (Session 4 of 3-5 estimated per §C.2); landed the Captured Reviews UI end-to-end via a NEW `CapturedReviewsSection` + `CapturedReviewCard` + `CapturedReviewAddModal` (with a 1-5 star-rating picker widget) + per-item Analysis box below each review + Overall Reviews Analysis box at the bottom of the section (via the existing Session 3 `OverallAnalysisBox` with `category='reviews'`) + 4 fully-implemented route handlers behind the Workstream 1 501-stub surface (POST list + GET list at the collection path + PATCH + DELETE at the per-record path) + an architectural-move fix relocating the per-record review route from W1's deeper `urls/[urlId]/reviews/[reviewId]` path to the shallow `reviews/[reviewId]` path matching the text/[textId] / images/[imageId] / videos/[videoId] precedent for the other 3 capture types; NEW `src/lib/competition-scraping/handlers/url-reviews.ts` (~295 LOC DI seam for POST + GET collection handlers) + NEW `src/lib/competition-scraping/handlers/reviews-by-id.ts` (~290 LOC DI seam for per-record PATCH + DELETE — sets a NEW PRECEDENT for the per-record surface) + 32 new node:test cases; MODIFIED `urls/[urlId]/reviews/route.ts` (W1 501-stub → thin shim); NEW `reviews/[reviewId]/route.ts` at SHALLOW PRECEDENT PATH; DELETED W1's nested per-record 501-stub; NEW `CapturedReviewAddModal.tsx` (~479 LOC); MODIFIED `UrlDetailContent.tsx` (+398 LOC); build commit `82d390a` 9 files +2350/-69; schema-change-in-flight flag STAYS YES (carrying from Workstream 1's `prisma db push`); all 5 /scoreboard checks GREEN at new baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 670 src/lib +32 from baseline 638 / 61 routes UNCHANGED); closes (a.74) RECOMMENDED-NEXT (P-46 Workstream 2 Session 4); opens (a.75) RECOMMENDED-NEXT = P-46 Workstream 2 Session 5 — recommended scope is the URL-level structural fields (Type / Description-1 / Description-2 / Price + Scraping Status toggle + remove Sizes/Options UI per §C.2) since that's the last §C.2 sub-scope remaining for Workstream 2; after Session 5, Workstream 2 is complete and the next session can be the Workstream 2 deploy session; director picked Option A at Rule 14f session-start scope picker between 2 §C.2-aligned candidates this session (A Captured Reviews UI recommended / B URL-level structural fields alt); NO Rule 14f sub-pickers fired during execution (the architectural move from W1's nested per-record path to the shallow precedent path was a clear "most thorough/reliable" choice per `feedback_recommendation_style.md`; star-rating widget + sort-key set were direct applications of existing precedents); ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-28 capturing the W1 path-divergence finding + architectural-move resolution + the new "Per-record handler DI-seam precedent extension" reusable Pattern; ZERO Rule 9 gates fired; ZERO new Starter-file rules drafted; no Step 7b changes; no resume-flow changes).

**Previously updated:** 2026-05-27 — Header bump only this session (`session_2026-05-27_p46-workstream-2-session-3-url-level-and-per-category-overall-analysis-boxes` — **W#2 polish P-46 Workstream 2 (URL detail page redesign) Session 3 ✅ DONE-AT-CODE-LEVEL 2026-05-27 on `workflow-2-competition-scraping`** — third build session of the P-46 Workstream 2 implementation arc (Session 3 of 3-5 estimated); completed the "Analysis surface" arc across all capture levels via a NEW `OverallAnalysisBox` parallel component shipping URL-level Overall Competitor Analysis + per-category Overall Analysis boxes (one per capture category — Text / Image / Video) at the bottom of each capture subsection + one URL-level box at the bottom of the URL detail page + extended the existing `urls/[urlId]` PATCH route allowlist for the two new fields with a NEW `isValidOverallAnalysesBag` strict-shape trust-boundary guard + bag-merge over replace at the PATCH so saving one category doesn't wipe sibling categories; NEW `OverallAnalysisBox.tsx` (~200 LOC) is a parallel component to Session 1's `PerItemAnalysisBox.tsx` (same save-lifecycle but different wire body shape driven by a `field` discriminator prop — `{ kind: 'overallCompetitorAnalysis' }` emits `{ overallCompetitorAnalysis: <doc> }`; `{ kind: 'overallAnalyses', category: 'text'|'image'|'video'|'reviews' }` emits `{ overallAnalyses: { [category]: <doc> } }`); NEW `isValidOverallAnalysesBag` guard in `tiptap-helpers.ts` (+37 LOC) strict-rejects unknown category keys + requires each known-category value pass `isValidAnalysisPayload`; existing `urls/[urlId]` PATCH route allowlist extended (+65 LOC) with bag-merge semantics for `overallAnalyses`; `UrlDetailContent.tsx` (+65/-1) threads `overallAnalysisInitial` prop through to 3 subsections + renders `OverallAnalysisBox` at the bottom of each; 10 new node:test cases for `isValidOverallAnalysesBag` (+88 LOC) pinning down the strict-shape guard's contract; NO new npm dependencies; NO new schema; NO new routes (only extended one existing allowlist); build commit `4773b62` 5 files +452/-1; schema-change-in-flight flag STAYS YES (carrying from Workstream 1's 2026-05-24 `prisma db push`); all 5 /scoreboard checks GREEN at new baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 638 src/lib +10 from baseline 628 / 61 routes UNCHANGED); closes (a.73) RECOMMENDED-NEXT (P-46 Workstream 2 Session 3); opens (a.74) RECOMMENDED-NEXT = P-46 Workstream 2 Session 4 — multiple §C.2-aligned candidates remain (Captured Reviews UI RECOMMENDED first since §C.2 originally sequenced it as Session 3 of Workstream 2 — natural next §C.2 step after the Analysis surface arc completion; new URL-level Type/Description/Price fields + Scraping Status toggle + remove Sizes/Options UI alt); director picks at Session 4 start; director picked Option A at Rule 14f session-start scope picker between 3 §C.2-aligned candidates this session (A URL-level + per-category Overall Analysis recommended / B Captured Reviews UI alt / C URL-level structural fields alt); NO Rule 14f sub-pickers fired during execution (bag-merge over replace at PATCH was the only valid choice; strict unknown-key rejection in the guard is most-thorough; parallel `OverallAnalysisBox` component over overloading `PerItemAnalysisBox` preserves wire-contract clarity at callsites); ZERO Rule 9 gates fired; ZERO new Starter-file rules drafted; no Step 7b changes; no resume-flow changes).

**Previously updated:** 2026-05-26 — Header bump only this session (`session_2026-05-26_p46-workstream-2-session-2-per-item-analysis-on-captured-image-and-video` — **W#2 polish P-46 Workstream 2 (URL detail page redesign) Session 2 ✅ DONE-AT-CODE-LEVEL 2026-05-26 on `workflow-2-competition-scraping`** — second build session of the P-46 Workstream 2 implementation arc (Session 2 of 3-5 estimated); applied Session 1's locked card-list precedent + the `PerItemAnalysisBox` reusable component to Captured Image + Captured Video as the next two capture types after Captured Text + extended the corresponding PATCH routes (`images/[imageId]` + `videos/[videoId]`) for the `analysis` field using the same one-line fix-shape Session 1 set for `text/[textId]`; `UrlDetailContent.tsx` rewrites both `CapturedImagesGallery` (was thumbnail grid) + `CapturedVideosGallery` (was 2-col card grid) to vertical card lists with the per-item Analysis editor below each card via the `PerItemAnalysisBox` component (different `apiUrl` prop per capture type); per-row trash NOT added to video cards (matches Build #5's "renderer only" scope); removed now-unused `thumbnailTrashButtonStyle`; 6 new edge-case node:test cases for `isValidAnalysisPayload` pinning down the trust-boundary guard's contract (nested object → true; plain object with arbitrary keys → true; function → false; Object.create(null) → true; TipTap doc with empty content array → true; bigint → false); NO new npm dependencies (TipTap landed in Session 1); build commit `9747f63` 4 files +325/-102; schema-change-in-flight flag STAYS YES (carrying from Workstream 1's 2026-05-24 `prisma db push`); all 5 /scoreboard checks GREEN at new baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 628 src/lib +6 from baseline 622 / 61 routes UNCHANGED); closes (a.72) RECOMMENDED-NEXT (P-46 Workstream 2 Session 2); opens (a.73) RECOMMENDED-NEXT = P-46 Workstream 2 Session 3 — multiple §C.2-aligned candidates surface (URL-level Overall Competitor Analysis + per-category Overall Analysis boxes RECOMMENDED to complete the "Analysis surface" arc before structural fields; Captured Reviews UI alt; new URL-level Type/Description/Price fields + Scraping Status toggle + remove Sizes/Options UI alt); director picks at Session 3 start; NO Rule 14f forced-picker fired this session (every layout choice was a direct application of Session 1's locked precedent per `feedback_default_to_recommendation.md`); ZERO Rule 9 gates fired; ZERO new Starter-file rules drafted; no Step 7b changes; no resume-flow changes).

**Previously updated:** 2026-05-25 — Header bump only this session (`session_2026-05-25_p46-workstream-2-session-1-tiptap-wrapper-and-per-item-analysis-on-captured-text` — **W#2 polish P-46 Workstream 2 (URL detail page redesign) Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-25 on `workflow-2-competition-scraping`** — first build session of the P-46 Workstream 2 implementation arc (Session 1 of 3-5 estimated); landed the TipTap shared rich-text editor wrapper component (`RichTextEditor.tsx` 317 LOC) + the per-item Analysis text box (`PerItemAnalysisBox.tsx` 174 LOC) on Captured Text as the first user-visible slice + pure helpers (`tiptap-helpers.ts` 92 LOC including the `isValidAnalysisPayload` route-trust-boundary guard) + 20 new node:test cases for the helpers + the route-handler half (`PATCH text/[textId]` allowlist extension for `analysis` field validated at the trust boundary); URL detail page's `CapturedTextSubsection` switches from a 5-column HTML table to a vertical card list per the Rule 14f forced-picker outcome (director picked Option A "Card layout — replace the table (recommended)" over 3 alternatives); layout precedent locked for the remaining 3 capture types (Image / Video / Review) in subsequent sessions; 3 new npm dependencies `@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-link` at 3.23.6 (50 packages added transitively; all React 19 + Next.js 16 compatible); build commit `b6e43fe` 8 files +1572/-149; schema-change-in-flight flag STAYS YES (carrying from Workstream 1's 2026-05-24 `prisma db push`); all 5 /scoreboard checks GREEN at new baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 622 src/lib +20 from baseline 602 / 61 routes UNCHANGED); closes (a.71) RECOMMENDED-NEXT (P-46 Workstream 2 Session 1); opens (a.72) RECOMMENDED-NEXT = P-46 Workstream 2 Session 2 — wire per-item Analysis on Captured Image + Captured Video using the same `PerItemAnalysisBox` component + convert image gallery + video gallery to the same card-list layout pattern; ZERO Rule 9 gates fired; ZERO new Starter-file rules drafted; no Step 7b changes; no resume-flow changes).

**Previously updated:** 2026-05-24 — Header bump only this session (`session_2026-05-24_p46-workstream-1-schema-first-build-session` — **W#2 polish P-46 Workstream 1 (Schema) ✅ DONE-AT-CODE-LEVEL 2026-05-24 on `workflow-2-competition-scraping`** — first build session of the P-46 5-workstream implementation arc; schema migration landed live on Supabase under Rule 9 director-Yes gate at `npx prisma db push` (1.32s; zero data loss; additive only); 4 new API route shells scaffolded as 501-stubs; shared-types extended; 12 new src/lib node:test cases; build commit `caad82a` 21 files +781/-11; live database now carries 3 new tables + 8 new `CompetitorUrl` columns + 1 new `analysis` JSON column on each of CapturedText/Image/Video + 1 new `ScrapingStatus` enum; schema-change-in-flight flag FLIPPED NO → YES at `prisma db push` completion; all 5 /scoreboard checks GREEN at new baselines (root tsc clean / extension tsc clean / 558 ext / 602 src/lib +12 / 61 routes +4); closes (a.70) RECOMMENDED-NEXT (P-46 Workstream 1); opens (a.71) RECOMMENDED-NEXT = P-46 Workstream 2 (URL detail page redesign) first build session per Q10's locked sequencing; Workstream 1 came in under estimate 1 session vs. 2-3 planned per §C.1; ZERO new Starter-file rules drafted; no Step 7b changes; no resume-flow changes).

**Previously updated:** 2026-05-23 — Header bump only this session (`session_2026-05-23_p46-w2-phase-2-design-session` — **W#2 polish P-46 W#2 Phase 2 design session ✅ DONE 2026-05-23 on `workflow-2-competition-scraping`** — pure DESIGN session, no code commits, no deploys, no Rule 9 gates fired, no fresh extension zip, no ping-pong sync; shipped new `docs/COMPETITION_DATA_V2_DESIGN.md` (~700 lines; §A frozen 10 questions + §B empty append-only + §C 5-workstream implementation outlines) mirroring the §A frozen-shape pattern of `docs/CAPTURED_VIDEOS_DESIGN.md` per Rule 18 + the 2026-05-20-b P-27 design-doc-split precedent; 10 DECISIONS LOCKED via Rule 14f forced-pickers (8 pickers fired + 1 Default-to-recommendation skip on Q8 + 1 director "Other" pick on Q9 DROPPING Select-preview-thumbnail from P-46 + 1 follow-up picker on Q1 DEFERRING per-platform Reviews extraction); Q1's deferral + Q9's drop shrink P-46 from 15-25 sessions to revised 11-17 sessions across 5 workstreams; Q10 locks workstream sequencing as Schema → URL detail page → Competition Data table → Comprehensive Analysis page → Extension + Reviews; closes (a.69) RECOMMENDED-NEXT (P-46 design); opens (a.70) RECOMMENDED-NEXT = P-46 Workstream 1 (Schema) first build session; schema-change-in-flight flag entered + exited NO (pure design); ZERO new Starter-file rules drafted; no Step 7b changes; no resume-flow changes).

**Previously updated:** 2026-05-22-i — Header bump only this session (`session_2026-05-22-i_p45-build-2-deploy-with-phase-1-fix-forward` — **W#2 polish P-45 screen recording SHIPPED + DEPLOYED + REAL-CHROME-VERIFIED across Amazon + Ebay + Walmart + Etsy 2026-05-22-i on vklf.com** via `workflow-2-competition-scraping` → `main` ff-merge `d4a2940..ee8c79d` (11 commits 39 files +5067/-200 carrying Build #1a + 1a-doc + 1b + 1b-doc + P-42 + P-42-doc + P-43 + P-43-doc + P-44 + P-44-doc + today's Build #2 fix-forward `ee8c79d` — 3 files changed +78/-30 with Issue 1 selfBrowserSurface include + Issue 2 aggressive event-isolation band-aid on all 4 text inputs + Issue 3 normalized Content-Type for Supabase strict allowedMimeTypes); pre-deploy /scoreboard all 6 checks GREEN at exact baselines (root tsc clean / extension tsc clean / 57 routes / 590 src/lib / 558 ext / 94 Playwright in 2.7m); Rule 9 deploy gate fired once via AskUserQuestion picker for `git push origin main`; ping-pong sync brought workflow-2 back even with main at `ee8c79d`; fresh extension zip `plos-extension-2026-05-22-w2-deploy-33.zip` 202.75 KB at repo root via `npm run zip` 2.2s (exits cleanly thanks to P-44's wrapper); Phase 4 director real-Chrome cross-platform verify ALL 4 PLATFORMS PASSED CLEAN with zero caveats — the cleanest cross-platform PASS in any W#2 cooperation session to date; closes P-45 ✅ DONE-AND-VERIFIED + closes P-27 Bug #11 ✅ DONE via band-aid; opens (a.69) RECOMMENDED-NEXT = P-46 W#2 Phase 2 design session + NEW P-47 polish entry (Shadow DOM refactor as proper replacement for the Issue 2 band-aid; LOW priority); schema-change-in-flight flag FLIPPED YES → NO at deploy completion; ZERO new Starter-file rules drafted; no Step 7b changes; no resume-flow changes).

**Previously updated:** 2026-05-22-h — Header bump only this session (`session_2026-05-22-h_p44-wxt-zip-build-parent-process-hang-fix` — closed the multi-reproduction `wxt build` + `wxt zip` parent-process hang class via NEW programmatic-API wrappers at `extensions/competition-scraping/scripts/wxt-build.mjs` + `scripts/wxt-zip.mjs` (16 LOC each — import wxt's exported `build()` + `zip()` functions, await them, then `process.exit(0)` to bypass the broken event-loop drain caused by Vite 8 → Rolldown 1.0.0-rc.18 native worker-thread retention) + `package.json` 4 script rewires + `.claude/commands/scoreboard.md` + `.claude/commands/deploy.md` KNOWN ISSUE → wrapper-note swaps; build commit `57ed383` — 5 files changed +61/-11; Rule 24 scope-expansion to cover `wxt zip` (shares the same `internalBuild()` codepath); ZERO new Starter-file rules drafted; no Step 7b changes; no resume-flow changes).

**Previously updated:** 2026-05-22-g — Header bump only this session (`session_2026-05-22-g_p43-absolute-paths-scoreboard-deploy-ship-polish-item` — closed the FOUR-reproduction `.claude/commands/scoreboard.md` parallel-Bash CWD-leak class via absolute-path normalization across `.claude/commands/scoreboard.md` + `.claude/commands/deploy.md` + `.claude/commands/ship-polish-item.md` + baseline refresh in all three templates; build commit `4afea35` — 3 files changed +20/-20; ZERO new Starter-file rules drafted; no Step 7b changes; no resume-flow changes).

**Previously updated:** 2026-05-22-f — Header bump only this session (`session_2026-05-22-f_p42-backup-memory-dir-hook-fix` — closed the three-reproduction backup-memory-dir + sibling track-edited-docs Layer-1 hook gap via empirically-confirmed `.tool` → `.tool_name` jq selector fix + added a NEW Layer-3b SessionStart staleness canary at `.claude/hooks/check-memory-mirror-staleness.sh`; build commit `2e3270d`; ZERO new Starter-file rules drafted; no Step 7b changes; no resume-flow changes).

**Previously updated:** 2026-05-21 — NEW Step 7b added to the START-OF-SESSION ROUTINE: "Plain-terms session summary" — Claude produces a plain-language summary of what this session will do BEFORE the director gives go-ahead. Companion to HANDOFF_PROTOCOL Rule 30 (Session bookends — NEW 2026-05-21) + §4 Step 4b template extension. Director's verbatim 2026-05-21 directive: *"From here on, for every next session, I want you to also tell me in simple terms what we will do in the session and summarize what was done in the session and what we will do in the next session. I also want you to check and tell me what work is pending according to the roadmap in simple terms."* Operational-memory cross-reference: `feedback_session_bookends_plain_summary.md`.

---

## 🟢 Resume-flow handling (REWRITTEN 2026-05-14 — multi-layered defense replacing the prior single-mechanism design)

**Primary mechanism — SessionStart hook injects pointer content as context (NEW 2026-05-14):**

When Claude Code launches, the `SessionStart` hook (`.claude/hooks/inject-next-session-pointer.sh`, wired in `.claude/settings.json`) reads `docs/NEXT_SESSION.md` and injects its contents into the session as a `system reminder` BEFORE the user's first prompt. The injected content includes a clear marker: *"🟢 RESUME-FLOW POINTER — docs/NEXT_SESSION.md content follows … treat this content as the session's launch prompt and proceed with the start-of-session sequence per docs/CLAUDE_CODE_STARTER.md once the user sends any first message — even a single word like 'go' or 'proceed'."*

**When this hook fires, Claude's behavior on receiving the user's first message** (which may be just "go", "proceed", or any short acknowledgment): treat the injected pointer-file content as if the director had pasted the launch prompt directly as the first message. The pointer file is the source of truth for branch + task + pre-session notes. Then continue with the standard start-of-session routine below — branch verification per Step 2, the rest of the Group A doc reads, drift check, wait for go-ahead.

**Procedural fallback — sentinel-string match (KEPT from 2026-05-13-c):**

**If the session's very first user message contains the phrase "Resume per docs/NEXT_SESSION.md"** (e.g., `"Resume per docs/NEXT_SESSION.md — read this pointer file first, then proceed with the start-of-session sequence per docs/CLAUDE_CODE_STARTER.md."`):

Same behavior as the primary mechanism — read `docs/NEXT_SESSION.md` and treat its `## Launch prompt` section as if directly pasted. This fallback covers the case where the SessionStart hook didn't fire for any reason (e.g., user invoked `claude --bare` which skips hooks; user is on a branch that doesn't have the hook yet because the fix hasn't merged in; hook script erroneously emitted empty additionalContext).

**Why two layers:** the primary mechanism (SessionStart hook) is mechanical and director-zero-effort beyond a single keystroke. The procedural fallback (sentinel-string match) is Claude-side discipline and works even when the hook layer is unavailable. The two compose: when both fire, Claude reads the pointer once and proceeds normally (idempotent).

**If the first message is anything OTHER than a wake-up keystroke or the sentinel** (e.g., the director pasted a full launch prompt directly via the 3-step ESCAPE HATCH path because `./resume` errored out), proceed as before — read `docs/CLAUDE_CODE_STARTER.md`, run the mandatory start-of-session routine, treat the director's pasted text as the task. No pointer-file read needed in that path; the ESCAPE HATCH path is fully self-contained.

**Why this matters — historical context:**

The original `./resume` script (shipped 2026-05-13-c) was designed to launch `exec claude "$SENTINEL"` so Claude Code would receive the sentinel as an auto-submitted first user message. **That design was structurally broken from day 1:** Claude Code's positional `[prompt]` argument only auto-submits in non-interactive print mode (`-p`); in interactive mode (which is what `./resume` wants) the positional pre-fills the input box silently or is ignored — director still had to copy/paste the launch prompt manually. The director hit this bug at the start of `session_2026-05-14_w2-main-deploy-session-11-region-screenshot-DEPLOYED-FULL-VERIFY` and asked for both a fix + redundancy to prevent recurrence; the multi-layered defense above is the response. Full background: `CORRECTIONS_LOG.md` 2026-05-14 entry "Resume-flow design flaw" + `HANDOFF_PROTOCOL.md` Rule 28.

---

## 🚨 NON-NEGOTIABLE RULES — CLAUDE READS AND CONFIRMS BEFORE ANY WORK 🚨

I am the director of the PLOS (Product Launch Operating System) project. **I am a NON-PROGRAMMER.** I have no formal programming background, no developer-tools experience, and no technical vocabulary. This instruction has been necessary in MULTIPLE successive chats in the predecessor (claude.ai) system — most recently flagged as Pattern 11 recurrence #4 in `docs/CORRECTIONS_LOG.md`. The rule is mechanical, not aspirational.

### Communication rules (apply to every message)

1. **Plain language only.** No "endpoint," "route," "schema," "migration," "projectId," "TypeScript error," "context," "payload," "upsert," "enum," "foreign key," "null." Substitute with user-visible terms: "the address the user types," "the behind-the-scenes record," "the thing the user sees," "the list of projects."

2. **The Read-It-Back test.** Before sending any question OR instruction, mentally read it back as if I had never written code. If any word requires domain/programming knowledge — rewrite.

3. **Options + recommendation + reversibility, for every significant decision.** Don't leave me to pick blindly — give me Option A vs. B vs. C in "what the user sees" terms, your expert pick with reasoning, and whether the decision can be undone later. **The recommendation must (a) be the MOST THOROUGH AND RELIABLE option** — the one with highest confidence in the result and lowest risk of leaving issues unvalidated — **NOT the fastest, cheapest, or "easiest"** — AND **(b) be marked with an explicit `(recommended)` label INSIDE the option's headline**, not only in surrounding prose. Forced-picker UI may hide the surrounding prose; the marker inside the label is the canonical placement. Mark exactly one option as recommended; never zero, never two. (Full mechanical test in `HANDOFF_PROTOCOL.md` Rule 14f; canonical reasoning in operational memory `feedback_recommendation_style.md`. Director's standing preference, reinforced 2026-05-02.)

3a. **Default-to-recommendation exception (NEW 2026-05-19-g-3).** Director's standing default is "yes, proceed with your recommendation." When the picker would only be re-confirming the recommended path AND the work fits pre-approved patterns (small / reversible / non-destructive), SKIP the forced-picker and proceed with the recommended option. The picker still fires for: Rule 9 destructive operations (deploys, force-pushes, rm -rf, prisma migrate reset, SQL DELETE/DROP/TRUNCATE); scope decisions with no clear "most thorough"; workflow design / Rule 18 interview clusters; anywhere director's intent is genuinely ambiguous. The TEST before firing: "is this question about clarifying the director's INTENT, OR is it asking permission to proceed on a path the director would default-approve?" If the latter — skip + proceed. Full exception in `HANDOFF_PROTOCOL.md` Rule 14f "Default-to-recommendation exception" section. Operational memory: `feedback_default_to_recommendation.md`.

4. **Equal visual weight in recaps.** When summarizing a plan, features you added autonomously get the SAME visual prominence as features I explicitly decided. Never bury an autonomous addition in a one-liner.

5. **Persistence decisions need explicit framing.** When data saves to local storage vs. database, explain in plain terms (syncs across devices? visible to other users? survives cache clears?). Never bury as parenthetical.

6. **Every imperative instruction needs a concrete method.** When you ask me to do something, pair it with a terminal command OR numbered clicks OR an interactive choice. Never "paste X" or "share Y" without telling me HOW. (This is Rule 9 from the predecessor system, added after the Pattern-11 recurrence-4 slip.)

7. **If you slip mid-session:** acknowledge openly, don't minimize. I've earned the right to flag slips. **Specifically:** if the director has explicitly confirmed a setup item ("all 4 prompts pasted," "all set," "configured"), trust that confirmation — do NOT re-ask for verification just because an automated runner has incomplete coverage. Re-asking confirmed setup is a Rule 14 violation; the runner's gap is a runner bug to capture and fix, not a reason to re-litigate. Full rule: `HANDOFF_PROTOCOL.md` Rule 14g (NEW 2026-05-02). Operational memory: `feedback_trust_director_setup_confirmation.md`.

### Claude Code–specific safety rules (Rules M1–M7, see `docs/CLAUDE_CODE_MIGRATION.md` §5)

8. **STOP before any destructive operation.** Before `rm`, `rm -rf`, `git reset --hard`, `git push --force`, `prisma migrate reset`, `prisma db push --force-reset`, SQL DELETE/DROP/TRUNCATE, or anything that deletes/overwrites data or rewrites history: DESCRIBE what will happen in plain English (what files/records/commits affected, whether recoverable), and ASK for explicit confirmation. Proceed only on clear affirmative — never silence or ambiguity.

    **Container-level destructive operations have a separate audit gate per `HANDOFF_PROTOCOL.md` Rule 29 (NEW 2026-05-20).** "Codespaces: Rebuild Container," `devcontainer.json` edits that auto-trigger rebuild, container reset/delete-and-recreate, and any operation that wipes the home directory (`/home/codespace/`) are ALL destructive — they wipe everything outside `/workspaces/` including Claude's persistent memory directory at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`, globally installed npm packages, manually apt-installed packages, and `~/.config/` customizations. Before recommending any of these, run the Pre-Container-Audit (`bash scripts/codespace-rebuild-audit.sh`) and surface the audit via Rule 14f forced-picker. Default to "back up critical state to `/workspaces/brand-operations-hub/.codespace-backup/` first, then proceed" — never recommend a rebuild without backup. Captured 2026-05-20 after a slip where a rebuild silently wiped Claude's memory directory + the Claude Code CLI binary itself; full slip narrative + 4-layer protective architecture in HANDOFF_PROTOCOL Rule 29 + CORRECTIONS_LOG.md 2026-05-20 entry.

9. **For deploys (`git push origin main` affecting the live site):** describe what commits will go live, what user-visible changes result, and ask for explicit confirmation before pushing.

10. **Visual verification after deploy is my job.** You can't open a browser. When work deploys, describe exactly what I should check on the live site, and do NOT mark work "done" until I confirm.

11. **Commit hygiene — Option A clean split.** Each session's commit contains ONLY that session's work. If pre-existing leftovers show up in `git status`, unstage them (`git reset HEAD <paths>`) before committing. See `docs/CORRECTIONS_LOG.md` 2026-04-17 entry "Pre-existing .bak/untracked files" for the canonical procedure.

12. **Escape hatch to paste-dance when in doubt.** If a single operation feels risky, fall back to the claude.ai pattern: "Here's the command I'd like to run — can you paste it yourself so we both see it before execution?" Rare but available.

### Session management

13. **Read the mandatory start-of-session sequence** in `docs/HANDOFF_PROTOCOL.md` §2 before any substantive work. It includes drift check, session identifier capture, known-unknowns check, and go-ahead wait.

14. **Session identifier format:** `session_YYYY-MM-DD_short-topic-slug`. Capture at start, use in end-of-session doc updates. Multiple sessions same day: append `-a`, `-b`.

15. **End-of-session doc update** is mandatory. Run the checklist in `docs/HANDOFF_PROTOCOL.md` §4 Step 1. Update whatever changed, commit to git, and produce a personalized handoff summary. **Per `HANDOFF_PROTOCOL.md` Rule 26 (NEW 2026-05-04-d), the end-of-session deferred-items sweep is driven by `TaskList` — Claude calls `TaskList`, reviews every `DEFERRED:`-prefixed task, migrates each one's content to its destination doc, then closes the task via `TaskUpdate → completed`. Any `DEFERRED:` task still open at end-of-session is an automatic CORRECTIONS_LOG entry. Mid-session, every defer creates a `TaskCreate` immediately — same sentence as the destination-naming per Rule 14e.** **Per `HANDOFF_PROTOCOL.md` §4 Step 1 row 12 (NEW 2026-05-13-c), every end-of-session ALSO writes `docs/NEXT_SESSION.md` — the pointer file the next session's `./resume` script reads. If today's session has no obvious continuation, Claude runs the §4 Step 1c "No obvious next task" Rule 14f forced-picker BEFORE writing the pointer — never silently guess.**

    **MANDATORY content of that handoff summary — no exceptions, applies to every session:**

    - **"What we did this session"** — 2–4 sentences in plain language, no jargon.
    - **"Files changed and committed"** — list with commit hash. If pushed, say so. If not pushed, say so and explain why.
    - **"Deferred items"** — every flagged-and-set-aside item, with the specific doc + section where it's now captured (per Rule 14e of HANDOFF_PROTOCOL).
    - **🚪 "END-OF-SESSION INSTRUCTIONS — what the user types NOW to close this session"** — step-by-step, concrete. Example: *"Type `exit` and press Enter to leave Claude Code. You can close the terminal tab or leave it open — either works."*
    - **🚪 "NEXT-SESSION INSTRUCTIONS — what the user types when they come back"** — step-by-step, concrete, with:
      - Exact terminal command to launch Claude Code (`cd /workspaces/brand-operations-hub && claude`)
      - Exact first-message text to paste (the "Read docs/CLAUDE_CODE_STARTER.md..." line with the specific next task filled in)
      - Any offline steps to do between sessions (e.g., "check Vercel env vars," "find a file on your computer") if applicable
    - **"Open questions / carry-overs"** — anything unresolved that the next session needs to know about.

    **Why this is mandatory:** the user is a non-programmer. Session-boundary moments (end of this session, start of next) are when they're most likely to feel lost without an exact-word instruction. The same discipline that applies to mid-session imperatives (Rule 6 + Rule 9 above) applies at session bookends. "Run the start-of-session sequence" is not a concrete instruction — "type this exact command in the terminal: `cd /workspaces/brand-operations-hub && claude`" is.

16. **Proactive context-degradation warning.** If the session is running long and your focus is stretched, say so proactively (HANDOFF_PROTOCOL Rule 13). I'd rather pause and resume fresh than push a tired session into a risky operation.

    **Concrete triggers — raise the pause-and-resume concern when ANY of these is true:**
    - Session has been active for ~90 minutes or longer of continuous work
    - You've made ~30+ substantive exchanges (not counting trivial y/n confirmations)
    - You notice you've had to re-read a file or re-derive a decision you already made earlier in the session
    - You're about to execute a destructive operation (per Rule 8) AND the session has been long — destructive ops at end-of-session are the highest-risk combination
    - The user notes that you seem to be slipping, bundling instructions, dropping details, or losing the thread — that's a direct signal to pause, not to push through harder
    - You find yourself about to say "let me just finish this quickly" or "one more thing and we're done" — that reflex IS the warning sign
    - Context window usage is clearly getting high (even if you can't measure it precisely, trust the subjective feeling)

    **When a trigger fires:** stop, state it plainly ("I notice X — I'd recommend we pause here and resume in a fresh session"), and let me decide. Don't unilaterally push through or unilaterally end the session. The decision is mine; your job is to surface the concern.

    **What the pause looks like:** run the end-of-session protocol (Rule 15), commit and push, then the user closes the session and starts fresh later. Resume instructions in the handoff summary tell the next session exactly where to pick up.

### Decision-framing rules

20. **Option questions (A/B/C, 1/2/3) must include per-option context, an "I have a question first" escape-hatch option, AND a closing free-text invitation.** (NEW 2026-04-18 — Pattern 14 in CORRECTIONS_LOG. User raised the initial concern at end of first Claude Code session: *"at several points you posed options to me where rather than type my response, I could only pick from 1,2,3… The problem is, in many instances, I had questions about an option and couldn't type it in."* Then refined with a second directive that solves the tool-UI constraint: *"Let's add a new rule. Always give me an additional choice to all the choices you're offering that says 'I have a question first that I need clarified'. This way, I select from a forced options list and still get to type my response."*)

    **Background — why the escape-hatch option matters.** Claude Code sometimes renders multi-option questions as an interactive picker UI in which the input box is temporarily hidden and the user can only navigate with arrow keys or number-select. In those moments, a free-text invitation in the prose of my message is inaccessible — the user can't type anything. Adding an escape-hatch option WITHIN the forced picker lets the user select their way back into normal chat mode, where the input box reappears and they can type their question.

    **For every multi-option question I give the user, each option must contain:**
    - A plain-language description of what the option actually means (not just a label like "Option A — do X")
    - The user-visible consequence of picking it ("if you pick A, you'll see X; it's reversible by doing Y" vs. "if you pick B, X is locked in permanently")
    - Enough context that a non-programmer can evaluate it without needing to ask a clarifying question — OR an explicit acknowledgment that the option has a subtlety they might want to ask about

    **AND** — every multi-option question must include an **explicit escape-hatch option as the last option in the list**, worded as:

    > *"I have a question first that I need clarified"*

    (or near-equivalent wording the user will recognize as the escape hatch — consistent phrasing is the goal). This option is NON-NEGOTIABLE regardless of how confident I am that the main options are self-explanatory. Selecting it means the user wants to ask something before picking one of the "real" options, and I should respond with a clarification-focused reply rather than executing any action.

    **AND** — every multi-option question must also close with a free-text invitation such as:
    > *"Or if you have a question about any option before picking, just ask — a clarification-first response is always valid. You're never locked into a letter/number answer."*

    This covers the case where I'm rendered as plain text (not an interactive picker), where the user's input box is already visible and they don't need the escape-hatch option to type.

    **Mechanical test before sending a multi-option question:**
    1. Scan each option: "does this option have enough context that a non-programmer can evaluate it without asking?" If no, add context.
    2. Is there an "I have a question first that I need clarified" option as the final option? If no, add it.
    3. Is there a free-text invitation at the close? If no, add it.

    If any of the three fails, rewrite before sending.

    **Scope exception:** simple yes/no/not-sure questions don't need elaborate per-option context (the options are trivially understood). But they STILL must include the escape-hatch option and the free-text invitation. "Yes / No / I have a question first / Not sure" is the shape for a simple binary with escape-hatch — never just "yes / no."

### `.claude/` tooling — PLOS-specific extensions to use (NEW 2026-05-19-g-3)

The `.claude/` folder ships PLOS-specific Claude Code extensions that mechanize recurring session work. Use them instead of issuing the underlying commands manually — they're mechanically consistent across sessions and save 5-15 min per use.

| Extension | Path | When to use |
|---|---|---|
| **`/ship-polish-item P-NN`** slash command | `.claude/commands/ship-polish-item.md` | AT SESSION START when shipping a specific polish item — orchestrates the full ship pattern (branch verify → ROADMAP entry read → Rule 3 diagnosis → Rule 14f pickers → code → /scoreboard → /deploy → /end-of-session) |
| **`/deploy`** slash command | `.claude/commands/deploy.md` | When ready to deploy a build commit — wraps pre-deploy /scoreboard → main-hasn't-moved check → Rule 9 gate (AskUserQuestion) → ff-merge → post-merge /scoreboard → push + ping-pong → fresh extension zip → director real-Chrome walkthrough |
| **`/end-of-session`** slash command | `.claude/commands/end-of-session.md` | When ready to close a session — orchestrates TaskList sweep → spawn `plos-doc-batch` agent → commit + push + ping-pong → Personalized Handoff per §4 Step 4b |
| **`/rule-24-search [keyword]`** slash command | `.claude/commands/rule-24-search.md` | BEFORE adding any new ROADMAP item — runs the canonical 7-grep pre-capture search per Rule 24 |
| **`/scoreboard`** slash command | `.claude/commands/scoreboard.md` | BEFORE every deploy (pre-deploy + post-merge) — runs the 6-check verification (tsc / ext tsc / npm run build / src/lib node:test / extension npm test / Playwright) and reports green/red with deltas |
| **`plos-doc-batch`** subagent | `.claude/agents/plos-doc-batch.md` | At end-of-session for the doc-bundle WRITING — spawn via Agent tool with `subagent_type: "plos-doc-batch"`. The parent Claude still owns the deferred-items sweep + commit + push + ping-pong + Personalized Handoff |
| **`track-edited-docs.sh`** PostToolUse hook | `.claude/hooks/track-edited-docs.sh` (auto-fires) | Auto-fires on every Edit/Write — logs `docs/` edits to `.claude/session-modified-docs.log` (session-scoped, gitignored). The `plos-doc-batch` agent consumes this log |

Also pre-existing (don't need to invoke; auto-fire): `SessionStart` hook (`inject-next-session-pointer.sh`) + `PreToolUse` Bash hook (`check-next-session-doc.sh`).

To see live state of installed extensions in a session: type `/agents` (interactive panel listing custom + built-in subagents) or `/` (slash-command autocomplete listing available commands + skills).

### Doc access

17. **Handoff docs live in `/docs/` in the repo.** Read them directly from disk at session start — no uploads. The 15 Group A docs are authoritative on platform-wide facts; Group B docs (e.g., `KEYWORD_CLUSTERING_ACTIVE.md`) are tool-specific and loaded when that tool is in scope.

18. **When docs contradict code, code wins** (HANDOFF_PROTOCOL Rule 3). Log the doc drift to `CORRECTIONS_LOG.md` and update the doc.

19. **Do NOT make changes to the handoff docs mid-session silently.** Track what needs updating, then batch all doc updates at end-of-session per the checklist.

### ROADMAP capture discipline

21. **Pre-capture search before adding ANY ROADMAP item or proposing a new architectural concern** (`HANDOFF_PROTOCOL.md` Rule 24, NEW 2026-04-27). Before reading back any proposed ROADMAP entry to me, Claude MUST first search existing docs for prior treatment of the same concern. The search must cover: (a) direct keyword grep with synonyms across `ROADMAP.md`, the relevant tool's `<TOOL>_DESIGN.md` / `_ACTIVE.md` / `_DATA_CONTRACT.md` / `_ARCHIVE.md`, `PLATFORM_ARCHITECTURE.md`, `CORRECTIONS_LOG.md`, and any architectural-pivot or design doc relevant to the concern (e.g., `PIVOT_DESIGN.md` for Auto-Analyze concerns); (b) read-through of the canonical doc's "Known limitations" / "Open questions / deferred items" / "Infrastructure TODOs" sections; (c) CORRECTIONS_LOG entries from the last 5-10 sessions; (d) verify against actual code when the concern relates to specific behavior — Read the source files, not just trust doc claims.

    **If prior treatment IS found:** surface it explicitly to me BEFORE reading back the proposed entry — *"I found this was already discussed in [doc] [section] on [date]. The prior treatment was: [summary]. Compared to my current proposal: [diff]."* I decide whether to (a) update the existing item, (b) create a new related item with cross-reference, or (c) consolidate.

    **If prior treatment is NOT found:** surface the search performed — *"I checked [list of locations: doc names + sections searched] and found no prior treatment. Proceeding with new capture."*

    **Why this rule exists:** logged in `CORRECTIONS_LOG.md` 2026-04-27 entry (HIGH severity). Claude proposed a context-scaling ROADMAP item without first searching, framing the concern as "the system was not explicitly designed to handle it" — when `PIVOT_DESIGN.md` lines 205 + 246 had explicitly acknowledged the trade-off and `ROADMAP.md` line 162 documented that V2's Mode A→B (deleted in Pivot E) had been credited with avoiding the same issue. Claude had read both pieces earlier in the same session but failed to synthesize them when writing the new ROADMAP entry. Synthesis from working memory is unreliable; the structured search forces a deliberate re-read at the moment the verification matters.

### Verification approach discipline

22. **Playwright forced-picker before manual browser walkthroughs** (`HANDOFF_PROTOCOL.md` Rule 27, NEW 2026-05-14). Whenever I'm about to propose a director manual browser walkthrough with 5+ steps, OR to verify code (new feature or bug fix) that lives in a real-browser context, I MUST first run a Rule 14f forced-picker comparing: (A) Playwright automated test [recommended for repeatable regression checks], (B) Director manual walkthrough [recommended for one-time exploratory verification or first-time-ever flows involving visual judgment, copy-correctness, or cross-physical-device concerns], (C) Hybrid [Playwright for mechanical parts + Director for judgment parts], (D) escape hatch per Rule 14f. The `(recommended)` marker goes on whichever option best catches the same bug class on regression AND fits the verification's repeatability profile. Scope exceptions where manual walkthrough is the natural choice even after the trigger fires: cross-physical-device tests, Chrome extension popup flows, visual-judgment checks, and one-off post-deploy smoke checks. Full mechanical test + concrete examples in `HANDOFF_PROTOCOL.md` Rule 27; operational memory in `feedback_playwright_for_repeatable_walkthroughs.md`. (Director's standing preference, captured 2026-05-14 after asking *"why didn't we use this until now and how can I ensure we consistently use such methods moving forward?"* in the P-17 Playwright ship session.)

---

## START-OF-SESSION ROUTINE (do these before asking me to confirm task)

1. Confirm you've read this file and will follow every rule.

2. **Branch verification (NON-NEGOTIABLE — do this BEFORE the heavy doc reads in step 4 below).** Run `git branch --show-current` + `git status`. Compare the current branch against the task's required branch per the table below. If they don't match, **STOP** — surface the mismatch to the director immediately with the exact terminal commands to switch (do NOT continue doc reads on the wrong branch; the doc state on the wrong branch may be stale relative to the task, and any in-progress edits you start will land on the wrong branch). The director may have switched branches before launching you, but verify.

   | Session task type | Required branch |
   |---|---|
   | Work on W#1 (Keyword Clustering) | `main` |
   | Work on W#k for k ≥ 2 (specific named workflow) | `workflow-N-<slug>` (e.g., W#2 → `workflow-2-competition-scraping`) |
   | Cross-workflow / platform-wide infrastructure (e.g., components library; platform refactors) | `main` |

   The full canonical "How to start a session for any workflow" procedure lives in `docs/MULTI_WORKFLOW_PROTOCOL.md` §11. This branch-check rule was added 2026-05-04 after a session started on the W#2 branch when the task required `main` — the friction surfaced after several minutes of doc reads. Project memory `project_sequential_workflow_operation.md` carries the operational context: director works workflows sequentially in one Codespace; branch state persists across sessions.

3. Read `docs/HANDOFF_PROTOCOL.md` end-to-end (Rules 1–26).

4. Read the 16 Group A docs (see `docs/DOCUMENT_MANIFEST.md` for the list). The list includes `docs/MULTI_WORKFLOW_PROTOCOL.md` — read it if today's task references any workflow with N ≥ 2 OR if the "Current Active Tools" table in `ROADMAP.md` shows more than one workflow in flight.

5. Read any Group B docs relevant to today's expected work.

6. Run `git log --oneline -10` and `git status` to understand current repo state. Run `git pull --rebase origin <current-branch>` to catch anything pushed since this branch's last activity (per HANDOFF_PROTOCOL Rule 25).

7. Produce a drift check: "Here's where we are. Here's what looks off, if anything. Here's what I understand today's task to be. Ready to proceed?" If multi-workflow state is in play, note any in-flight workflows (their branches, their schema-change-in-flight flag) in the drift check.

7b. **Plain-terms session summary (NEW 2026-05-21 per HANDOFF_PROTOCOL Rule 30).** Produce a plain-language summary covering: (a) what this session will do (1-3 sentences in sentence-form English; name the polish item / task; say what the director will / won't see at session-end; say whether a deploy is planned); (b) what's still left on the total roadmap in plain terms (3-8 bullets spanning the active workflow's remaining polish items + future workflows + any infrastructure TODOs / offline director steps). Avoid acronyms unless paired with a parenthetical paraphrase. Avoid file paths / commit hashes as primary nouns. This summary is the start-of-session bookend; the end-of-session bookend lives in HANDOFF_PROTOCOL §4 Step 4b template's 3 new mandatory plain-terms sections. The director should be able to read your summary and confirm scope without parsing technical narrative. Director's verbatim 2026-05-21 directive (the source of this rule): *"From here on, for every next session, I want you to also tell me in simple terms what we will do in the session and summarize what was done in the session and what we will do in the next session. I also want you to check and tell me what work is pending according to the roadmap in simple terms."*

8. Wait for my explicit go-ahead before executing.

---

## HOW TO START A NEW CLAUDE CODE SESSION (terminal commands + paste-message)

**You have two paths. The EASY PATH is one command. The ESCAPE HATCH is the original 3-step path — always works, always documented in every end-of-session handoff.**

---

### EASY PATH (recommended — NEW 2026-05-13-c; EXTENDED 2026-05-19-g-5 with workflow-switching)

**Continue the current workflow** (whatever the prior session was working on per `docs/NEXT_SESSION.md`):

```
cd /workspaces/brand-operations-hub && ./resume
```

The `resume` script reads `docs/NEXT_SESSION.md`, switches to the branch the pointer names, pulls the latest, prints the pointer file's contents to your terminal, then launches Claude Code with the SessionStart hook auto-injecting the launch prompt as context.

**Switch to a specific workflow** (e.g., W#1 re-entry while NEXT_SESSION.md points at W#2):

```
cd /workspaces/brand-operations-hub && ./resume-workflow <N>
```

Where `<N>` is the workflow number (1 for W#1 Keyword Clustering, 2 for W#2 Competition Scraping). The `resume-workflow` script switches to the workflow's canonical branch, pulls the latest, generates a workflow-specific launch prompt (for W#1: asks you interactively what you want to do, then fills the Rule 22 graduated-tool re-entry template; for W#2: uses NEXT_SESSION.md), writes the prompt to `.claude/active-workflow-prompt.md` (single-use; the SessionStart hook reads + deletes after), then launches Claude. Future workflows (W#3-W#14) error gracefully with the canonical "first session for a never-started workflow" procedure from `MULTI_WORKFLOW_PROTOCOL.md` §11.

**If either script fails** (pointer file missing, branch checkout fails, etc.), it aborts loudly with a clear error message + the commands you'd run for the ESCAPE HATCH. The 3-step path below is always available as a known-good fallback.

---

### ESCAPE HATCH (the original 3-step path — always works)

**Three steps — Step 1 is non-negotiable for any session that's not a same-workflow continuation.**

**Step 1 — In a Codespaces terminal, switch to the right branch for the next session's task and pull the latest.**

The branch depends on what you're working on:

| Session task type | Branch | Step-1 command |
|---|---|---|
| Work on W#1 (Keyword Clustering) | `main` | `cd /workspaces/brand-operations-hub && git fetch origin && git checkout main && git pull --rebase origin main` |
| Work on W#k for k ≥ 2 (specific workflow — replace `workflow-N-<slug>` with the workflow's branch name; for W#2 it's `workflow-2-competition-scraping`) | `workflow-N-<slug>` | `cd /workspaces/brand-operations-hub && git fetch origin && git checkout workflow-N-<slug> && git pull --rebase origin workflow-N-<slug>` |
| Cross-workflow / platform-wide infrastructure (e.g., components library; platform refactors) | `main` | `cd /workspaces/brand-operations-hub && git fetch origin && git checkout main && git pull --rebase origin main` |
| FIRST session for a never-before-started workflow | (created in this step from `main`) | `cd /workspaces/brand-operations-hub && git fetch origin && git checkout main && git pull --rebase origin main && git checkout -b workflow-N-<slug>` |

**Why Step 1 matters.** You work workflows sequentially in one Codespace. The branch from your last session is still checked out when you come back. If your last session was W#2 but today's task is W#1 or platform-wide, you'd start on the W#2 branch — and Claude would have to flag the mismatch after several minutes of doc reads. Step 1 prevents that. Captured 2026-05-04 in project memory `project_sequential_workflow_operation.md`.

The full canonical "How to start a session for any workflow" lives in `docs/MULTI_WORKFLOW_PROTOCOL.md` §11.

**Step 2 — Launch Claude Code:**

```
claude
```

This starts an interactive Claude Code session in whatever folder you're in (the `cd` in Step 1 made sure that's the repo root).

**Step 3 — As your very first message inside Claude Code, paste a launch prompt naming the specific task:**

For most sessions, use the templates in `docs/MULTI_WORKFLOW_PROTOCOL.md` Appendix A (W#2), Appendix B (W#1), or §11.1 (cross-workflow / platform-wide). For a generic launch prompt:

```
Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
[short description of what you want to do]. Start by running the mandatory
start-of-session sequence.
```

That's it. The starter file handles everything else. Claude Code will read the starter prompt, run the branch verification (Step 2 of the start-of-session routine above), read the handoff protocol, read the Group A docs, check git state, produce a drift-check, and wait for your go-ahead before doing any work.

---

END OF DOCUMENT
