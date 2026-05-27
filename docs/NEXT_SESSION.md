# Next session

**Written:** 2026-06-02 (`session_2026-06-02_p49-w5-session-1-foundation-shipped-output-shape-deferred` — post-session doc-batch handoff after **W#2 polish P-49 Reviews Phase 2 Workstream 5 AI review analysis Session 1 — foundation primitives + plumbing handler SHIPPED at code level via build commit `04f74cf` on `workflow-2-competition-scraping`; v1 prompt content + UI placement re-confirmation + first live end-to-end run DEFERRED to next session (a.102) per director's explicit mid-session directive to plan the per-product analysis output shape FIRST before writing prompt code**) — pure BUILD session; NO production deploy; ZERO Rule 9 deploy gates fired this session; build commit stays on workflow branch until W5 deploy session. Build commit `04f74cf` (19 files +2968/-1) carrying NEW `src/lib/competition-scraping/review-analysis/` directory with 7 modules (`client.ts` Anthropic SDK seam + supported-model registry + `pricing.ts` per-model cost math + `cache.ts` SHA-256 reviewsHash + staleness check per §A.12 + `cost-cap.ts` preventive per-run + per-Project monthly caps per §A.7 + `token-counter.ts` pre-flight messages.countTokens wrapper + char/3.6 heuristic + `batch-sizer.ts` adaptive batching to ~80K-token budget per §A.8 + `prompts.ts` v1 per-product prompts PLACEHOLDER will be rewritten next session) + 6 test files (~47 new node:test cases across the primitives) + NEW `src/lib/competition-scraping/handlers/review-analysis-run.ts` (~430 LOC DI-seam POST handler) + NEW `review-analysis-run.test.ts` (~14 cases) + NEW thin API route shim at `src/app/api/projects/[projectId]/competition-scraping/review-analysis/run/route.ts` + NEW `scripts/test-w5-end-to-end.mjs` (--dry-run plumbing test PASSED this session; --live mode DEFERRED to next session) + MODIFY `package.json` + `package-lock.json` for NEW dependency `@anthropic-ai/sdk ^0.98.1`. TWO Rule 14f forced-pickers fired (1 answered Yes-to-Recommended on W5 architecture-decision picker; 1 REDIRECTED by director via free-text escape-hatch on the "Fire live end-to-end run now?" picker — director's verbatim redirect: *"You didn't ask me how I wanted to approach the analysis of the reviews. I want to first plan out how the analysis of the reviews should be done and where the output should be posted."*). ZERO Rule 9 deploy gates fired (pure BUILD session). Schema-change-in-flight STAYS NO entire session (`ReviewAnalysis` model + `ReviewAnalysisLevel` enum schema already shipped via W2 Amazon Session 1's `prisma db push` 2026-05-26 + deployed 2026-05-28). NEW reusable Pattern memorialized via NEW memory file `feedback_plan_output_shape_before_building.md` — "Plan AI-output shape (prompts + UI placement) with director BEFORE writing prompt code, even when launch prompt says ship-and-iterate." Pre-build /scoreboard 5/5 GREEN at entry baselines (root tsc clean / extension tsc clean / **910 ext** / **838 src/lib** / **64 routes**). Post-build /scoreboard 5/5 GREEN at new src/lib baseline: src/lib **899/899** (+61); npm run build **65 routes** (+1); extension **910/910** UNCHANGED. **Closes (a.101) PARTIALLY; opens (a.102) RECOMMENDED-NEXT = P-49 W5 Session 1.5 — director-driven planning of the per-product analysis output shape** on `workflow-2-competition-scraping` per the new memory file.

---

## What we did this session (in plain terms)

Today we shipped the **foundation infrastructure for the W5 AI review analysis system** — the small focused primitives + the plumbing handler + the standalone test script + the new Anthropic SDK dependency — all at code level on `workflow-2-competition-scraping` via build commit `04f74cf`. **But we deliberately did NOT write the v1 per-product prompt content + re-confirm the UI placement + run the first live end-to-end call** — director surfaced mid-session that those decisions should be made in a director-driven planning conversation FIRST, BEFORE Claude writes prompt code or fires the first live AI call.

**The mid-session director directive (verbatim):** *"You didn't ask me how I wanted to approach the analysis of the reviews. I want to first plan out how the analysis of the reviews should be done and where the output should be posted. i want you to wrap this session and begin the next session by you asking me for the suggestions i have for the review analysis function and once i provide it, i want you to plug as much of that into the 6 dimensions of plan you have identified and then if anything is still missing, i want you to ask me specific questions to help clarify those hazy areas."*

That redirect converted today from a "ship-foundation-primitives + v1-prompt + first-live-run + close in one session" shape into a "ship-foundation-only + plan-output-shape-with-director-next-session" shape. The foundation primitives + handler + plumbing test all stayed; only the v1 prompt content + UI placement re-confirmation + first live run got deferred.

**The new reusable Pattern memorialized:** "Plan AI-output shape (prompts + UI placement) with director BEFORE writing prompt code, even when launch prompt says ship-and-iterate." Captured in the new memory file `feedback_plan_output_shape_before_building.md` + `MEMORY.md` got a one-line pointer added. **Applies to:** W5 Sessions 2-4 (per-product analysis) + W5 Sessions 5+ (cross-Type pooled + cross-everything competitive-landscape — both are MORE consequential output shapes than per-product, so they get the same director-driven planning treatment) + ALL FUTURE AI tools across PLOS or other workflows.

**The 6 design dimensions Claude identified for next session's planning conversation:**

1. **Audience & purpose** — who reads the per-product analysis + to what end? (e.g., spot product gaps to inform Brand Vibe Library, share with product team for roadmap decisions, weekly tracking against a baseline)
2. **Sections & topics** — what the analysis covers? (e.g., praise/complaints/quotes vs. things-to-copy/things-to-avoid/pricing-signals vs. JTBD/friction/delight)
3. **Depth & length** — short bullet summary for 10-second scan vs. paragraph-per-section for 1-2 min vs. exhaustive for 5 min?
4. **Perspective & tone** — neutral analyst vs. brand-owner-actionable vs. customer-voice-aggregation?
5. **UI placement** — re-confirm §A.10 (URL detail page below Captured Reviews) or pivot to a tab/sidebar/modal placement?
6. **Interaction** — re-confirm §A.11 (manual button → modal → progress → inline) + §A.12 (stale badge + re-run affordance) or change?

**What landed code-side via build commit `04f74cf` (19 files +2968/-1):**

- NEW `src/lib/competition-scraping/review-analysis/` directory with 7 modules: `client.ts` (Anthropic SDK seam + supported-model registry per §A.7) + `pricing.ts` (per-model cost math) + `cache.ts` (SHA-256 reviewsHash + staleness check per §A.12) + `cost-cap.ts` (preventive per-run + per-Project monthly caps per §A.7) + `token-counter.ts` (pre-flight messages.countTokens wrapper + char/3.6 heuristic fallback) + `batch-sizer.ts` (adaptive batching to ~80K-token budget per §A.8) + `prompts.ts` (~90 LOC PLACEHOLDER — current scaffold ships a minimal "summarize key themes + complaints + praise" prompt that runs end-to-end but is NOT the canonical v1; flagged with `// TODO(W5-Session-1.5): rewrite per director's planning conversation`).
- 6 test files (~47 new node:test cases across the primitives).
- NEW `src/lib/competition-scraping/handlers/review-analysis-run.ts` (~430 LOC DI-seam POST handler orchestrating auth → load → hash → cache-check → batch → pre-flight cost estimate → cost-cap gate → two-sweep call → parse-JSON → persist `ReviewAnalysis` row; uses prompt caching on system block per §A.7).
- NEW `review-analysis-run.test.ts` (~14 cases including 5 `extractJsonFromModelText` unit tests).
- NEW thin API route shim at `src/app/api/projects/[projectId]/competition-scraping/review-analysis/run/route.ts`.
- NEW `scripts/test-w5-end-to-end.mjs` (--dry-run plumbing test PASSED this session; --live mode currently exits with "DEFERRED to next session per output-shape planning" message).
- MODIFY `package.json` + `package-lock.json` for NEW dependency `@anthropic-ai/sdk ^0.98.1`.

**W5 architecturally diverges from W#1 on the AI-infrastructure axis (locked by the architecture-decision picker this session):** W5 installs the Anthropic SDK + builds real pre-flight cost-cap enforcement (refuses requests pre-flight if estimated cost exceeds caps) + uses real pre-flight token counting via `client.messages.countTokens`. W#1 uses raw `fetch()` + post-facto cost logging + response-usage token reads (post-call). Divergence is JUSTIFIED for W5's consequential per-product analysis cost surface, but **future workstreams reading W#1 precedents should re-verify W#1's actual architecture before mirroring** — the launch prompt + §C.5 had a factual problem (referenced `MODEL_QUALITY_SCORING.md` as W#1's cost-cap "module" but that doc is about a stability-score algorithm for keyword clustering, NOT cost caps). §C.5 will be updated next session to capture W5's actual architecture choices.

**Pre-build /scoreboard 5/5 GREEN at entry baselines** (root tsc clean / extension tsc clean / **910 ext** / **838 src/lib** / **64 routes**); Check 6 Playwright SKIPPED per Rule 27.

**Post-build /scoreboard 5/5 GREEN at new src/lib baseline:** src/lib `npm test` = **899/899** (+61 cumulative from 838 — 47 from primitives + 14 from handler); `npm run build` = **65 routes** (+1 for new review-analysis/run shim); extension `npm test` = **910/910** UNCHANGED; Check 6 SKIPPED per Rule 27. **NEW baseline locked: src/lib `npm test` = 899/899** (+61 from 838 entry baseline); routes = **65** (+1).

## What we'll do next session (in plain terms)

**Next session is P-49 W5 Session 1.5 — director-driven planning of the per-product analysis output shape** on `workflow-2-competition-scraping` per (a.102). This is a **PLANNING session followed by a CODE session** in the same calendar session, driven by the new memory file `feedback_plan_output_shape_before_building.md`.

**The non-negotiable session-start protocol (per director's verbatim directive):**

**STEP 1 — Branch verify.** Run `git branch --show-current` BEFORE any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Run `git log main..HEAD --oneline` — should show **1 commit ahead** (build commit `04f74cf`) plus the end-of-session doc-batch commit from this session = expected 2 commits ahead of main at session entry (assuming the workflow-branch push has fired but the ff-merge to main has NOT — which is the build-session push pattern from `feedback_approval_scope_per_decision_unit.md`).

**STEP 2 — Plain-terms session-start summary per Rule 30 BEFORE asking director.** Produce the 3 plain-terms paragraphs (what this session will do + branch state + scoreboard expected) so director has session context before the planning conversation opens.

**STEP 3 — ASK DIRECTOR (the critical step — this is the first substantive action of next session, BEFORE any reads, scoreboard runs, or code mechanics):**

> *"What are your suggestions for the per-product review analysis function? I have 6 dimensions of plan I'd like to walk through with you — Audience & purpose, Sections & topics, Depth & length, Perspective & tone, UI placement, and Interaction. Once you share your suggestions, I'll plug as much as I can into those 6 dimensions and then ask specific clarifying questions for anything still hazy."*

Wait for director input.

**STEP 4 — Plug director's input into the 6 dimensions.** For each dimension, write a short paragraph summarizing director's input + flag which dimensions are filled vs. still hazy.

**STEP 5 — For each still-hazy dimension, fire a Rule 14f forced-picker** with Claude's recommendation + 2-3 alternatives + free-text escape-hatch invitation. Wait for director's pick (or redirect) on each. Once all 6 dimensions are decided, summarize the locked design back to director for one final go/no-go confirmation before code mechanics open.

**STEP 6 — Rewrite `src/lib/competition-scraping/review-analysis/prompts.ts` accordingly.** Replace the PLACEHOLDER scaffold with the locked v1 per-product prompt content + the locked system prompt + the locked output JSON shape. Adjust `review-analysis-run.test.ts` fixtures to match the new output shape. Run `/scoreboard` to confirm 5/5 GREEN at the same or near baselines (src/lib 899 or 899+N for any new test cases; routes 65 UNCHANGED; extension 910 UNCHANGED).

**STEP 7 — Fire the first live end-to-end run.** Use `node --experimental-strip-types scripts/test-w5-end-to-end.mjs --live` after surfacing the cost estimate (via `token-counter.ts` + `pricing.ts` pre-flight) + getting an explicit Yes from director (Rule 14f forced-picker for the live AI cost). Share the actual output with director for the FIRST real-world validation of the v1 prompt + output shape. Iterate if needed within this session before scoreboard close-out.

**STEP 8 — End-of-session doc-batch** (this protocol again — covers ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + NEXT_SESSION + REVIEWS_PHASE_2_DESIGN.md §B 2026-XX-XX = NINTH build-session §B entry).

**Session shape estimate:** ~1.5-3 hours in-Claude (longer than today's because of the upfront planning conversation + the first live AI call + likely first-iteration tweaks). BUILD session by default. ZERO Rule 9 deploy gates planned by default (build commits stay on workflow branch until W5 deploy session). Schema-change-in-flight STAYS NO entire session. Director should evaluate at session start whether the start-of-session deploy-now-vs-exit picker fires (less likely today because W5 Session 1.5 still doesn't land user-visible UI — the per-product analysis renders to TipTap output but the URL detail page rendering layer might not be wired this session unless director's planning conversation explicitly schedules it).

**Pre-build read list for next session:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory).
- `docs/ROADMAP.md` lines 1-30 + the **P-49 polish-backlog entry** (Status: "🟢 IN-FLIGHT 2026-06-02 — W5 Session 1 foundation primitives + plumbing handler SHIPPED at code level via `04f74cf`; W5 Session 1.5 director-driven output-shape planning NEXT per (a.102)").
- `docs/REVIEWS_PHASE_2_DESIGN.md` §A.7-§A.12 (UX + interaction spec — the canonical reference for what may need re-confirmation or pivot per director's planning conversation) + §C.5 (implementation outline) + **§B 2026-06-02** (today's W5 Session 1 entry — THE canonical reference for what code is in place + what design conversations need to happen + which §A sections need re-confirmation or pivot) + earlier §B entries (2026-05-26 through 2026-06-01) for full Reviews Phase 2 lineage context.
- **`docs/CORRECTIONS_LOG.md` §Entry 2026-06-02** (THE meta-pattern entry — THE canonical reference for the planning conversation; captures the NEW reusable Pattern verbatim + the architecture divergence from W#1 + the 6 design dimensions + the director's verbatim mid-session directive).
- **`feedback_plan_output_shape_before_building.md`** (PRIMARY directive for next session's session-start protocol — THE memory file that governs how the planning conversation runs).
- All other existing memory files (`feedback_recommendation_style.md` + `feedback_default_to_recommendation.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_deferred_items_registry.md` + `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md`).
- **The Claude API skill** (since W5 uses the Anthropic SDK; needed for the `prompts.ts` rewrite + the first live AI call).
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (zero gates expected) + Rule 14f (forced-picker mechanics — expect 0-6 to fire, one per still-hazy dimension after director's initial input + 1 cost-confirmation picker before the first live AI call + 1 §4 Step 1c next-task picker at session-end) + Rule 18 (§A frozen + §B append-only) + Rule 21 + Rule 22 + Rule 23 (Change Impact Audit — PLOS-side handlers + src/lib + no schema; schema-change-in-flight STAYS NO) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + §4 Step 4b extended template.

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-06-02 (W5 Session 1 foundation primitives + plumbing handler shipped at code level; W5 Session 1.5 director-driven output-shape planning NEXT):

- **P-49 W5 Session 1.5 — NEXT (a.102).** ~1.5-3 hours estimated for the director-driven planning conversation + `prompts.ts` rewrite + first live end-to-end run on a small product corpus. BUILD session by default; ZERO Rule 9 deploy gates planned unless start-of-session deploy-now picker fires (less likely for Session 1.5 since per-product analysis renders to TipTap but the URL detail page rendering layer might not be wired this session). Schema-change-in-flight STAYS NO. **The non-negotiable session-start protocol: Claude asks director for suggestions on the per-product review analysis function BEFORE any reads, scoreboard runs, or code mechanics** — per director's verbatim mid-session directive + the new memory file `feedback_plan_output_shape_before_building.md`.
- **P-49 W5 Sessions 2-10 (estimated) — UI wiring + cross-Type + cross-everything analysis levels.** Per §C.5 outline these later sessions wire the per-product analysis UI to the URL detail page + ship the cross-Type pooled analysis + ship the cross-everything competitive-landscape analysis. **The same "Plan output shape with director BEFORE writing prompt code" Pattern applies to each of these subsequent sessions** — especially Sessions 5+ which ship MORE consequential output shapes (cross-Type pooled + cross-everything).
- **P-49 total build arc ~5-10 sessions remaining.** Revised down from yesterday's ~5-10 since today shipped the W5 foundation primitives at code level. P-49 W2 4-platform arc COMPLETE; only W5 remains within P-49.
- **P-50 Condition Pathology card.** ~10 min in-Claude. Lives on `main` branch. Can slot into any deploy session OR done standalone. NOT on the critical path.
- **P-48 Session 3 (Diagnostic #2) — DEFERRED to opportunistic insertion.** ~30-60 min in-Claude.
- **P-43 mechanical prevention candidate (LOW informational).** ~1 small session. Add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`. **Empirical signal continues mounting** — ~1-2 more reproductions today; running tally ~20+ across recent sessions. **Increasingly worth slotting in opportunistically** — today's end-of-session §4 Step 1c picker did NOT offer P-43 as an alternative because the (a.102) shape (Session 1.5 director-driven planning) doesn't have a session-shape adjacent enough to substitute; P-43 stays competitive for the next picker after Session 1.5 completes.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions, OR drop. Re-evaluate after Reviews Phase 2 closes.
- **P-27 Bug #9 + Bug #15 — DEFERRED LOW.** ~0-1 sessions. Likely obsolete after P-46.
- **W#2 graduation step (further deferred).** Gated by Reviews Phase 2 closure at the workstream-by-workstream level. With today's W5 Session 1 foundation shipped at code level, the remaining work is: W5 Sessions 1.5-10 (~5-10 sessions). Likely 2-3 months out at current sessions-per-week cadence.
- **THEN STOP AND EXPLICITLY ASK DIRECTOR for any next round of competition-scraping additions** per your standing directive after Reviews Phase 2 + P-48 stutter + P-43 + P-26 + P-27 all close.
- **After your next round of additions ships:** W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent.

---

## Status of last session

**W#2 polish P-49 Reviews Phase 2 Workstream 5 AI review analysis Session 1 — foundation primitives + plumbing handler SHIPPED at code level via build commit `04f74cf` on `workflow-2-competition-scraping`; v1 prompt content + UI placement re-confirmation + first live end-to-end run DEFERRED to next session (a.102) per director's explicit mid-session directive to plan the per-product analysis output shape FIRST before writing prompt code** (`session_2026-06-02_p49-w5-session-1-foundation-shipped-output-shape-deferred`) — pure BUILD session; NO production deploy; ZERO Rule 9 deploy gates fired.

**Session shape (BUILD only — TWO Rule 14f forced-pickers fired = 1 answered Yes-to-Recommended + 1 REDIRECTED by director via free-text escape-hatch; ZERO Rule 9 deploy gates):**

- **Build portion:**
  - Pre-build /scoreboard 5/5 GREEN at entry baselines (root tsc clean / extension tsc clean / 910 ext / 838 src/lib / 64 routes); Check 6 SKIPPED per Rule 27.
  - **Rule 14f picker #1 fired (ANSWERED) — W5 architecture-decision picker:** SDK + pre-flight cost-cap + pre-flight token-counter (RECOMMENDED) over raw-fetch-mirror-W#1; director picked Recommended Yes. **1/1 = 100% on the picker answered.**
  - Code mechanics: NEW `src/lib/competition-scraping/review-analysis/` directory with 7 modules + 6 test files + NEW DI-seam POST handler + handler test file + NEW thin API route shim + NEW standalone e2e script + MODIFY `package.json` + `package-lock.json` for new dependency `@anthropic-ai/sdk ^0.98.1`.
  - Build commit `04f74cf` landed (19 files +2968/-1).
  - Post-build /scoreboard 5/5 GREEN at new src/lib baseline: src/lib `npm test` = **899/899** (+61 from 838); npm run build = **65 routes** (+1); extension `npm test` = **910/910** UNCHANGED; Check 6 SKIPPED.
  - **--dry-run plumbing test PASSED** via `node --experimental-strip-types scripts/test-w5-end-to-end.mjs --dry-run` — verified primitives + handler wiring end-to-end against a real Project + corpus without firing a live Anthropic API call.

- **Mid-session REDIRECT portion:**
  - **Rule 14f picker #2 fired (REDIRECTED) — "Fire live end-to-end run now?"** framed as 3 options (Yes Recommended + Defer to next session + Spend more session on prompt iteration before going live).
  - **Director REDIRECTED via free-text escape-hatch** with the verbatim message: *"You didn't ask me how I wanted to approach the analysis of the reviews. I want to first plan out how the analysis of the reviews should be done and where the output should be posted. i want you to wrap this session and begin the next session by you asking me for the suggestions i have for the review analysis function and once i provide it, i want you to plug as much of that into the 6 dimensions of plan you have identified and then if anything is still missing, i want you to ask me specific questions to help clarify those hazy areas."*
  - This REDIRECTED the session shape from "ship-and-iterate per launch prompt" into "ship-foundation-only + plan-output-shape-with-director-next-session". Foundation primitives + handler + plumbing test all stayed; only the v1 prompt content + UI placement re-confirmation + first live run got DEFERRED.

- **End-of-session:**
  - NEW memory file `feedback_plan_output_shape_before_building.md` created memorializing the meta-pattern; `MEMORY.md` got a one-line pointer added under the Feedback memories section; auto-mirrored to `.codespace-backup/memory/` via PostToolUse hook per Rule 29.
  - Doc-batch covers the 8-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION + REVIEWS_PHASE_2_DESIGN.md §B 2026-06-02 — EIGHTH build/deploy-session §B entry per Rule 18 — FIRST W5 entry).

**TWO Rule 14f forced-pickers fired total this session — 1 answered Yes-to-Recommended + 1 REDIRECTED via free-text escape-hatch.** Calibration: 1/1 = 100% on the picker answered. Running cumulative 51/54 = 94.4% across recent 9 sessions including this session's 1 answered + 1 redirected.

**ZERO Rule 9 deploy gates fired this session** (pure BUILD session; build commit `04f74cf` stays on `workflow-2-competition-scraping` until W5 deploy session ~5-10 sessions from now per §C.5 outline).

**Schema-change-in-flight flag STAYS NO entire session** (entry NO + exit NO; `ReviewAnalysis` model + `ReviewAnalysisLevel` enum schema already shipped via W2 Amazon Session 1's `prisma db push` 2026-05-26 + deployed 2026-05-28; W5 Session 1 reads + writes against the post-migration schema; no `prisma db push` planned).

**ZERO DEFERRED items at session end (Rule 26)** after the (a.102) capture lands in this NEXT_SESSION.md — W5 Session 1.5 IS the next-session task per (a.102), not a Claude-defer.

**Baselines locked from this session:** src/lib `npm test` = **899/899** (+61 cumulative from 838 entry baseline — 47 from primitives + 14 from handler); `npm run build` = **65 routes** (+1 for new review-analysis/run shim); extension `npm test` = **910/910** UNCHANGED. Files live on `workflow-2-competition-scraping` (NOT yet in production — pure BUILD session).

**NEW reusable Pattern memorialized via NEW memory file `feedback_plan_output_shape_before_building.md`** — "Plan AI-output shape (prompts + UI placement) with director BEFORE writing prompt code, even when launch prompt says ship-and-iterate." Director's verbatim trigger captured. Applies to W5 Sessions 2-4 (per-product analysis) + W5 Sessions 5+ (cross-Type + cross-everything) + ALL FUTURE AI tools across PLOS or other workflows.

**W5 architecturally diverges from W#1 on the AI-infrastructure axis** (locked by the architecture-decision picker): W5 installs `@anthropic-ai/sdk ^0.98.1` + builds real pre-flight cost-cap enforcement + uses real pre-flight token counting via `client.messages.countTokens`. W#1 uses raw `fetch()` + post-facto cost logging + response-usage token reads. Divergence is JUSTIFIED for W5's consequential per-product analysis cost surface, but future workstreams reading W#1 precedents should re-verify W#1's actual architecture before mirroring — the launch prompt + §C.5 had a factual problem (referenced `MODEL_QUALITY_SCORING.md` as W#1's cost-cap "module" but that doc is about a stability-score algorithm, not cost caps). §C.5 will be updated next session to capture W5's actual architecture choices.

**P-43 cwd-leak Pattern Class reproduced ~1-2 more times this session** (post-build `npm run build` invocation inherited extension cwd from a previous `cd .../extensions/competition-scraping && npm test` and ran the extension's build script instead of root Next.js; required re-run with explicit `cd /workspaces/brand-operations-hub` prefix). Running tally now ~20+ across recent sessions; **strong empirical signal continues mounting** for the P-43 mechanical prevention small fix.

**FORTY-FIFTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-49 W5 Session 1.5 begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping` and pre-load context. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` **2 commits ahead of `origin/main`** (build commit `04f74cf` + end-of-session doc-batch commit from this session). Verify with `git log main..HEAD --oneline` showing **2 commits ahead** at session entry. If shown as 0 commits ahead, the build commit + doc-batch may have been ff-merged to main unexpectedly between sessions — surface to director.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead. Then per the new memory file `feedback_plan_output_shape_before_building.md`, your FIRST substantive action — BEFORE any pre-build reads, scoreboard runs, or code mechanics — must be to ASK ME for my suggestions on the per-product review analysis function.**

**The non-negotiable session-start question (verbatim — use this phrasing or a close paraphrase):**

> *"What are your suggestions for the per-product review analysis function? I have 6 dimensions of plan I'd like to walk through with you — Audience & purpose, Sections & topics, Depth & length, Perspective & tone, UI placement, and Interaction. Once you share your suggestions, I'll plug as much as I can into those 6 dimensions and then ask specific clarifying questions for anything still hazy."*

Wait for my input. Once I share my suggestions, plug them into the 6 dimensions + fire a Rule 14f forced-picker for each still-hazy dimension with your recommendation + alternatives + free-text escape-hatch invitation.

**Today's task: W#2 polish P-49 Reviews Phase 2 Workstream 5 AI review analysis Session 1.5 on `workflow-2-competition-scraping`.** Closes **(a.102) RECOMMENDED-NEXT**. BUILD session — ZERO Rule 9 deploy gates planned by default. Schema-change-in-flight flag STAYS NO entire session.

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify SHA relationships with `git log main..HEAD --oneline` — should show **2 commits ahead at session entry** (build commit `04f74cf` + end-of-session doc-batch commit from 2026-06-02).

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list (read AFTER the session-start question + after director shares suggestions; the planning conversation comes BEFORE these reads):**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/ROADMAP.md` lines 1-30 (header + recent session sequence) + the **P-49 polish-backlog entry** (Status: "🟢 IN-FLIGHT 2026-06-02 — W5 Session 1 foundation primitives + plumbing handler SHIPPED at code level via `04f74cf`; W5 Session 1.5 director-driven output-shape planning NEXT per (a.102)").
- **`docs/REVIEWS_PHASE_2_DESIGN.md`** §A.7-§A.12 (UX + interaction spec — the canonical reference for what may need re-confirmation or pivot per director's planning conversation) + §C.5 (implementation outline) + **§B 2026-06-02** (THE canonical reference for what code is in place + what design conversations need to happen + which §A sections need re-confirmation or pivot) + §B 2026-06-01 (W2 Walmart DEPLOY + closes the W2 4-platform arc) + §B 2026-05-31 (W2 Etsy DEPLOY) + §B 2026-05-30 (W2 eBay DEPLOY) + §B 2026-05-29 (W4 Captured Reviews UI extensions + DEPLOY) + §B 2026-05-28 (W2 Amazon DEPLOY) + §B 2026-05-27 + §B 2026-05-26 (foundation).
- **`docs/CORRECTIONS_LOG.md` §Entry 2026-06-02** (THE meta-pattern entry — captures the NEW reusable Pattern verbatim + the architecture divergence from W#1 + the 6 design dimensions + the director's verbatim mid-session directive).
- **`feedback_plan_output_shape_before_building.md`** (PRIMARY directive for this session's session-start protocol — THE memory file that governs how the planning conversation runs).
- All other existing memory files (`feedback_recommendation_style.md` + `feedback_default_to_recommendation.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_deferred_items_registry.md` + `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md`).
- **The Claude API skill** (since this session rewrites `prompts.ts` + fires the first live AI call).
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (zero gates expected) + Rule 14f (forced-picker mechanics — expect 0-6 to fire, one per still-hazy dimension after director's initial input + 1 cost-confirmation picker before the first live AI call + 1 §4 Step 1c next-task picker at session-end) + Rule 18 (§A frozen + §B append-only) + Rule 21 + Rule 22 + Rule 23 (Change Impact Audit — PLOS-side handlers + src/lib + no schema; schema-change-in-flight STAYS NO) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + §4 Step 4b extended template.

**Task shape (P-49 W5 Session 1.5 — director-driven output-shape planning + `prompts.ts` rewrite + first live end-to-end run):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or code mechanics. The 3 plain-terms sections at top above provide the launch context.

2. **Branch state verify** — `git branch --show-current` (should be `workflow-2-competition-scraping`) + `git log main..HEAD --oneline` (should show **2 commits ahead at session entry**: `04f74cf` + 2026-06-02 doc-batch commit). If anything else, surface to director.

3. **ASK DIRECTOR THE SESSION-START QUESTION** (verbatim above) — BEFORE any pre-build reads, scoreboard runs, or code mechanics. This is the critical first substantive action of this session per the new memory file `feedback_plan_output_shape_before_building.md`.

4. **Plug director's input into the 6 dimensions.** For each dimension, write a short paragraph summarizing director's input + flag which dimensions are filled vs. still hazy.

5. **For each still-hazy dimension, fire a Rule 14f forced-picker** with Claude's recommendation + 2-3 alternatives + free-text escape-hatch invitation. Wait for director's pick (or redirect) on each. Once all 6 dimensions are decided, summarize the locked design back to director for one final go/no-go confirmation before code mechanics open.

6. **Pre-build reads** — execute the pre-build read list above. ~10-15 min. (Done AFTER the planning conversation, not before — per the new memory file.)

7. **Pre-build /scoreboard** — confirm 5/5 GREEN at the new baselines on `workflow-2-competition-scraping` (root tsc clean / extension tsc clean / **910 ext** / **899 src/lib** / **65 routes**); Check 6 Playwright SKIP via Rule 14f forced-picker per Rule 27 (Recommended per standing non-deploy SKIP precedent; treated as default-approved).

8. **Code mechanics — `prompts.ts` rewrite + handler test adjustment:**
   - Rewrite `src/lib/competition-scraping/review-analysis/prompts.ts` replacing the PLACEHOLDER scaffold with the locked v1 per-product prompt content + the locked system prompt + the locked output JSON shape per director's planning conversation.
   - Adjust `src/lib/competition-scraping/handlers/review-analysis-run.test.ts` fixtures to match the new output shape.
   - Adjust `extractJsonFromModelText` if needed for any tolerance edge cases that emerge from the new output shape.
   - Run `/scoreboard` to confirm 5/5 GREEN at the same or near baselines (src/lib **899/899** or **899+N** for any new test cases; routes **65** UNCHANGED; extension **910/910** UNCHANGED).

9. **First live end-to-end run — Rule 14f cost-confirmation picker MUST fire BEFORE the live call.** Surface the cost estimate (via `token-counter.ts` + `pricing.ts` pre-flight) to director + ask explicit Yes/No before firing the live Anthropic API call via `node --experimental-strip-types scripts/test-w5-end-to-end.mjs --live`. Once director says Yes, fire the live call against a small product corpus from production. Share the actual output with director for the FIRST real-world validation of the v1 prompt + output shape. Iterate within this session if needed.

10. **§4 Step 1c forced-picker at session-end** — locks the next-next task per Rule 14f. Likely alternatives: P-49 W5 Session 2 (Recommended if Session 1.5 lands the v1 prompt + first live run cleanly + the locked design is solid) vs P-49 W5 DEPLOY session (if Session 1.5 produces shipping-ready per-product analysis end-to-end) vs P-43 mechanical prevention small fix (~20+ cwd-leak reproductions running tally — increasingly competitive) vs P-48 Session 3 vs P-50 Condition Pathology card.

11. **End-of-session doc-batch** covers ROADMAP (header bump + P-49 polish-backlog entry status update for W5 Session 1.5 outcome + (a.102) closes + (a.103) opens) + CHAT_REGISTRY (header bump — 167th session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header + new §Entry 2026-XX-XX capturing W5 Session 1.5 outcome + any Patterns memorialized + director's locked design captured) + NEXT_SESSION (rewritten for next-next task per (a.103)) + HANDOFF_PROTOCOL (header bump only expected) + CLAUDE_CODE_STARTER (header bump only) + REVIEWS_PHASE_2_DESIGN.md §B 2026-XX-XX (NINTH build/deploy-session entry per Rule 18 — captures director's locked design + the `prompts.ts` rewrite + the first live e2e run outcome + the §C.5 update with W5's actual architecture choices).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** every Rule 14f picker fired during the planning conversation should surface the recommended path + default to it unless director shifts.

**Per `feedback_approval_scope_per_decision_unit.md` (build-session push pattern memorialized 2026-05-27):** ONE push to `origin/workflow-2-competition-scraping` carrying any new build commits + the doc-batch commit at session-end. NO ff-merge to main this session unless the start-of-session deploy-now picker fires + director picks Deploy-now (less likely today since W5 Session 1.5 still doesn't land user-visible UI per-product analysis until later sessions wire the URL detail page rendering layer).

**Schema-change-in-flight flag:** **STAYS NO entire session** (no schema work — the `ReviewAnalysis` model + `ReviewAnalysisLevel` enum schema already shipped via W2 Amazon Session 1's `prisma db push` 2026-05-26 + deployed 2026-05-28; W5 Session 1.5 reads + writes against the post-migration schema; no `prisma db push` planned).

**Rule 9 triggers planned this session: ZERO** (build session only by default; build commits stay on `workflow-2-competition-scraping` until W5 deploy session ~5-10 sessions from now).

---

## Pre-session notes (offline steps for director between sessions)

**No specific pre-session offline steps for the W5 Session 1.5 planning conversation.** Director can think ahead about the per-product analysis output shape (the 6 dimensions Claude identified) but no formal pre-session writing required — the planning conversation itself happens in-session with Claude facilitating via Rule 14f forced-pickers for any still-hazy dimensions.

**Optional director pre-thinking (helps the planning conversation move faster, NOT required):**

- **Audience & purpose:** who reads the per-product analysis? what do they DO with it? (e.g., spot product gaps for Brand Vibe Library + share with product team for roadmap decisions + weekly tracking against a baseline + something else?)
- **Sections & topics:** what should the analysis cover? (e.g., praise/complaints/quotes vs. things-to-copy/things-to-avoid/pricing-signals vs. JTBD/friction/delight vs. some other framing?)
- **Depth & length:** short bullet summary (10-second scan) vs. paragraph-per-section (1-2 min) vs. exhaustive (5 min)?
- **Perspective & tone:** neutral analyst vs. brand-owner-actionable vs. customer-voice-aggregation?
- **UI placement:** re-confirm §A.10 (URL detail page below Captured Reviews) or pivot to a tab/sidebar/modal placement?
- **Interaction:** re-confirm §A.11 (manual button → modal → progress → inline) + §A.12 (stale badge + re-run affordance) or change?

You can also bring example outputs from any product reviews you've consumed elsewhere that hit the right shape — Claude can mirror the structure.

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking W5 Session 1.5 at all — can happen any time. Director-independent.

---

## Standing carry-overs

**None this session.** No carry-overs at session entry; no carry-overs at session end. The (a.102) RECOMMENDED-NEXT = P-49 W5 Session 1.5 director-driven output-shape planning is NOT a carry-over — it's the natural next step driven by director's explicit mid-session directive captured in the new memory file `feedback_plan_output_shape_before_building.md`.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (build session does only push + possibly ff-merge if start-of-session deploy-now picker fires; no rebases, no force pushes, no `git reset --hard`, no `git branch -D`).

**Rule 9 triggers planned this session: ZERO** by default — build session only; no production deploy planned. Build commits stay on `workflow-2-competition-scraping` until W5 deploy session ~5-10 sessions from now.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe (including the NEW `feedback_plan_output_shape_before_building.md` memory file from this session — auto-mirrored via PostToolUse hook). **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits an alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any code mechanics.

---

## Why this pointer was written this way (debug aid)

Today's session executed the (a.101) RECOMMENDED-NEXT task locked at the 2026-06-01 W2 Walmart post-deploy doc-batch — P-49 W5 AI review analysis Session 1 — and **shipped the foundation primitives + plumbing handler at code level** but **DEFERRED the v1 prompt content + UI placement re-confirmation + first live end-to-end run** per director's explicit mid-session directive captured verbatim in the new memory file `feedback_plan_output_shape_before_building.md`. The redirect converted today from "ship-and-iterate per launch prompt" into "ship-foundation-only + plan-output-shape-with-director-next-session", and memorialized a NEW reusable Pattern that applies to ALL FUTURE AI tools across PLOS or other workflows.

The natural next-session task per (a.102) RECOMMENDED-NEXT is **P-49 W5 Session 1.5 — director-driven planning of the per-product analysis output shape on `workflow-2-competition-scraping`** with the non-negotiable session-start protocol of Claude ASKING DIRECTOR for suggestions on the per-product review analysis function BEFORE any reads, scoreboard runs, or code mechanics.

- **(Recommended)** P-49 W5 Session 1.5 — director-driven planning + `prompts.ts` rewrite + first live end-to-end run; ~1.5-3 hours in-Claude; BUILD session; ZERO Rule 9 deploy gates planned by default; Schema-change-in-flight STAYS NO. Recommended because (a) it's the explicit director-directed next step per the verbatim mid-session message; (b) the foundation primitives + plumbing handler already shipped at code level via `04f74cf` so the prompt content rewrite + first live run are the natural close to W5 Session 1's intended scope; (c) the new memory file `feedback_plan_output_shape_before_building.md` is the canonical source of truth for the session-start protocol and applies BEFORE any reads happen; (d) the 6 design dimensions already identified mid-session give Claude a structured way to facilitate the planning conversation efficiently.

The shape of P-49 W5 Session 1.5 is **plain-terms summary + branch state verify + ASK DIRECTOR THE SESSION-START QUESTION (the critical first substantive action) + plug director's input into the 6 dimensions + fire Rule 14f pickers for still-hazy dimensions + locked-design summary + pre-build reads + pre-build /scoreboard + code mechanics (rewrite prompts.ts + adjust handler tests + run /scoreboard) + Rule 14f cost-confirmation picker before first live AI call + first live end-to-end run + iterate if needed + §4 Step 1c next-session picker + end-of-session doc-batch (8-doc bundle including REVIEWS_PHASE_2_DESIGN.md §B NINTH build/deploy-session entry) + 1 push to workflow branch**.

**After W5 Session 1.5 ships,** the next-next sessions step through W5 Sessions 2-10 (UI wiring + cross-Type + cross-everything analysis levels). The same "Plan output shape with director BEFORE writing prompt code" Pattern applies to each of these subsequent sessions — especially Sessions 5+ which ship MORE consequential output shapes (cross-Type pooled + cross-everything competitive-landscape).

**Alternate next-session candidates if director shifts priorities at session start:**

- **P-43 mechanical prevention small fix.** **Increasingly justifiable** given ~20+ cwd-leak reproductions across recent sessions. NOT recommended as the immediate next session — opportunistic; defer to after W5 Session 1.5 ships. Today's end-of-session §4 Step 1c picker did NOT offer P-43 as an alternative because the (a.102) shape (Session 1.5 director-driven planning) doesn't have a session-shape adjacent enough to substitute; P-43 stays competitive for the next picker after Session 1.5 completes.
- **P-48 Session 3 (Diagnostic #2) — opportunistic insertion.** NOT recommended — W5 Session 1.5 is the natural next step per director's explicit mid-session directive.
- **P-50 Condition Pathology card — small `main`-branch standalone session.** NOT recommended as the next-session task — P-50 is ~10 min in-Claude + lives on `main` not `workflow-2-competition-scraping`. Could slot opportunistically.
- **P-26 below-fold scroll capture evaluation.** NOT recommended — LOW alternate; re-evaluate after Reviews Phase 2 closes (specifically after W5 closes).
- **P-27 Bug #9 + Bug #15 re-evaluation.** NOT recommended — likely obsolete after P-46.
- **W#2 graduation step.** NOT recommended UNTIL Reviews Phase 2 + P-48 stutter + P-43 + P-26 + P-27 all close.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above.

Check `ROADMAP.md` for the canonical state. Check `docs/REVIEWS_PHASE_2_DESIGN.md` for the canonical interview-locked spec + the §B 2026-05-26 + §B 2026-05-27 + §B 2026-05-28 + §B 2026-05-29 + §B 2026-05-30 + §B 2026-05-31 + §B 2026-06-01 + §B 2026-06-02 build/deploy-session entries (the full Reviews Phase 2 lineage now spanning W2 Amazon + W4 Captured Reviews UI + W2 eBay + W2 Etsy + W2 Walmart + W5 AI review analysis Session 1). Check `docs/CORRECTIONS_LOG.md` §Entry 2026-06-02 (today's closing entry) for the NEW reusable Pattern memorialization ("Plan AI-output shape with director BEFORE writing prompt code, even when launch prompt says ship-and-iterate") + 4 LOW informational sub-observations (W5-vs-W#1 architecture divergence on AI-infrastructure axis + P-43 cwd-leak Pattern Class reproduction running tally ~20+ + Rule 14f free-text escape-hatch calibration data point + session-letter date convention plain).

---

## Personalized Handoff (parent Claude — copy into the director-facing summary)

**What we did this session (3-minute read):**

Today we shipped the **foundation infrastructure for the W5 AI review analysis system** at code level on `workflow-2-competition-scraping` via build commit `04f74cf` (19 files +2968/-1) — but **deliberately did NOT write the v1 per-product prompt content + re-confirm UI placement + fire the first live AI call** because you redirected mid-session with the verbatim message that we should plan the per-product analysis output shape FIRST before writing prompt code.

**Your verbatim mid-session directive (captured in the new memory file):** *"You didn't ask me how I wanted to approach the analysis of the reviews. I want to first plan out how the analysis of the reviews should be done and where the output should be posted. i want you to wrap this session and begin the next session by you asking me for the suggestions i have for the review analysis function and once i provide it, i want you to plug as much of that into the 6 dimensions of plan you have identified and then if anything is still missing, i want you to ask me specific questions to help clarify those hazy areas."*

That redirect memorialized a **NEW reusable Pattern** in a new memory file `feedback_plan_output_shape_before_building.md` — "Plan AI-output shape (prompts + UI placement) with director BEFORE writing prompt code, even when launch prompt says ship-and-iterate." This Pattern applies to W5 Sessions 2-4 (per-product analysis) + W5 Sessions 5+ (cross-Type + cross-everything — both MORE consequential output shapes) + ALL FUTURE AI tools across PLOS or other workflows.

**The 6 design dimensions we'll walk through with you at the start of next session:**

1. **Audience & purpose** — who reads the per-product analysis + to what end?
2. **Sections & topics** — what the analysis covers?
3. **Depth & length** — short bullet summary vs. paragraph-per-section vs. exhaustive?
4. **Perspective & tone** — neutral analyst vs. brand-owner-actionable vs. customer-voice-aggregation?
5. **UI placement** — re-confirm §A.10 (URL detail page below Captured Reviews) or pivot to a tab/sidebar/modal?
6. **Interaction** — re-confirm §A.11 (manual button → modal → progress → inline) + §A.12 (stale badge + re-run) or change?

**What landed code-side via build commit `04f74cf` (foundation primitives + plumbing handler ONLY — no prompt content + no live AI call):**

- NEW `src/lib/competition-scraping/review-analysis/` directory with 7 modules (`client.ts` + `pricing.ts` + `cache.ts` + `cost-cap.ts` + `token-counter.ts` + `batch-sizer.ts` + `prompts.ts` PLACEHOLDER) + 6 test files (~47 new node:test cases).
- NEW `src/lib/competition-scraping/handlers/review-analysis-run.ts` (~430 LOC DI-seam POST handler) + handler test file (~14 cases).
- NEW thin API route shim at `src/app/api/projects/[projectId]/competition-scraping/review-analysis/run/route.ts`.
- NEW `scripts/test-w5-end-to-end.mjs` (--dry-run plumbing test PASSED this session).
- NEW dependency `@anthropic-ai/sdk ^0.98.1` in `package.json`.

**Architecture divergence from W#1 (locked by the architecture-decision picker this session — you picked Recommended Yes):** W5 installs the Anthropic SDK + builds real pre-flight cost-cap enforcement + uses real pre-flight token counting via `client.messages.countTokens`. W#1 uses raw `fetch()` + post-facto cost logging + response-usage token reads. Divergence is JUSTIFIED for W5's consequential per-product analysis cost surface, but worth memorializing because the "mirror W#1's Pattern" framing in the launch prompt had a factual problem (referenced `MODEL_QUALITY_SCORING.md` as W#1's cost-cap "module" but that doc is about a stability-score algorithm, not cost caps). Future workstreams reading W#1 precedents should re-verify W#1's actual architecture before mirroring.

**Pre-build scoreboard:** src/lib **838/838** → **899/899** post-build (+61); npm run build **64 routes** → **65 routes** (+1); extension **910/910** UNCHANGED. NEW baseline: src/lib **899/899** + 65 routes.

**Rule 14f forced-picker calibration this session:** 1/1 = 100% on the picker that was answered (architecture-decision picker — you picked Recommended Yes); 1 picker REDIRECTED by you via free-text escape-hatch ("Fire live end-to-end run now?" → "I want to first plan out the analysis"). That redirect is a positive calibration data point for Rule 14f's free-text escape-hatch design — the structure (recommended option + alternatives + free-text invitation) gave you the affordance to redirect rather than being railroaded into one of the three pre-framed options. Running cumulative across recent 9 sessions: 51/54 = 94.4%.

**P-43 cwd-leak Pattern Class reproduced ~1-2 more times this session** (post-build `npm run build` inherited extension cwd from a previous `cd .../extensions/competition-scraping && npm test` and ran the extension's build script instead of root Next.js; required re-run with explicit absolute-path `cd /workspaces/brand-operations-hub` prefix). Running tally now ~20+ across recent sessions. **Strong empirical signal continues mounting** for the P-43 mechanical prevention small fix; increasingly competitive for opportunistic insertion.

**Files now live on `workflow-2-competition-scraping` (NOT yet in production — pure BUILD session):**

- `src/lib/competition-scraping/review-analysis/` directory (7 modules + 6 test files).
- `src/lib/competition-scraping/handlers/review-analysis-run.ts` + test file.
- `src/app/api/projects/[projectId]/competition-scraping/review-analysis/run/route.ts` (thin shim).
- `scripts/test-w5-end-to-end.mjs` (standalone Node script).
- `package.json` + `package-lock.json` (new `@anthropic-ai/sdk` dependency).

**Push status:**

- (1) Workflow-branch push to `origin/workflow-2-competition-scraping` carrying BOTH build commit `04f74cf` + end-of-session doc-batch commit — PENDING (about to fire).
- Branch state at end-of-session: `workflow-2-competition-scraping` **2 commits ahead of `origin/main`** (build commit `04f74cf` + end-of-session doc-batch commit); main is unchanged from yesterday's W2 Walmart post-deploy doc-batch SHA.

**Deferred items at session end (Rule 26):** **ZERO.** No carry-overs at entry or end. The W5 Session 1.5 task per (a.102) is the natural next step driven by your explicit mid-session directive captured in the new memory file.

**END-OF-SESSION INSTRUCTIONS for you (the director, offline between sessions):**

**Optional pre-thinking on the 6 design dimensions (helps the next session's planning conversation move faster, NOT required):**

- **Audience & purpose:** who reads the per-product analysis? what do they DO with it? (e.g., spot product gaps for Brand Vibe Library + share with product team + weekly tracking + something else?)
- **Sections & topics:** what should the analysis cover? (e.g., praise/complaints/quotes vs. things-to-copy/things-to-avoid/pricing-signals vs. JTBD/friction/delight vs. some other framing?)
- **Depth & length:** short bullet summary (10-second scan) vs. paragraph-per-section (1-2 min) vs. exhaustive (5 min)?
- **Perspective & tone:** neutral analyst vs. brand-owner-actionable vs. customer-voice-aggregation?
- **UI placement:** re-confirm §A.10 (URL detail page below Captured Reviews) or pivot to a tab/sidebar/modal placement?
- **Interaction:** re-confirm §A.11 (manual button → modal → progress → inline) + §A.12 (stale badge + re-run affordance) or change?

You can also bring example outputs from any product reviews you've consumed elsewhere that hit the right shape — Claude can mirror the structure.

The standing optional offline step (raise the Supabase Global File Size Limit) remains available any time — see "Pre-session notes" above for the steps. NOT blocking.

**NEXT-SESSION INSTRUCTIONS for the next Claude Code session (the easy path):**

When you start the next session in Codespaces, run `./resume` (or `./resume-workflow 2`) — that will switch you to `workflow-2-competition-scraping` and pre-load context. Then paste the launch prompt above (the "Launch prompt" section). The next Claude will produce a plain-terms summary of what it'll do (per Rule 30) BEFORE asking director the session-start question. Once director gives go-ahead, Claude will ASK DIRECTOR for suggestions on the per-product review analysis function (the verbatim session-start question is in the launch prompt above) BEFORE any pre-build reads, scoreboard runs, or code mechanics — per the new memory file `feedback_plan_output_shape_before_building.md`. Expected ~1.5-3 hours in-Claude (longer than today's because of the upfront planning conversation + the first live AI call + likely first-iteration tweaks). BUILD session — ZERO Rule 9 deploy gates planned by default. Schema-change-in-flight STAYS NO.

**ESCAPE HATCH (if `./resume` doesn't work or you want a different task):**

If you'd rather pick a different next-session task, surface that at session start before the planning conversation opens — the Rule 14f forced-picker mechanics will accommodate. The alternate candidates are listed in the "Alternate next-session candidates" section above; W5 Session 1.5 is the canonical next step per your verbatim mid-session directive, but if you want to insert P-43 opportunistically given the ~20+ cwd-leak reproductions running tally (mechanical prevention fix that's increasingly competitive) or run P-50 Condition Pathology card on `main` branch standalone, that's available.

**Offline between sessions:** None blocking. Optional pre-thinking on the 6 design dimensions (above) helps the planning conversation move faster but is NOT required. Optional Supabase file size limit raise remains available.

**Open questions / carry-overs:** None at session end. Today's session shipped the foundation primitives + plumbing handler at code level + memorialized a NEW reusable Pattern that governs how next session's planning conversation runs. **The (a.102) RECOMMENDED-NEXT task — W5 Session 1.5 director-driven output-shape planning — is the natural next step** driven by your explicit mid-session directive captured verbatim in the new memory file `feedback_plan_output_shape_before_building.md`.

---
