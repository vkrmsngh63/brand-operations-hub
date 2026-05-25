# Next session

**Written:** 2026-05-25 (`session_2026-05-25_reviews-phase-2-capture-session` — end-of-session handoff after **W#2 polish Reviews Phase 2 scope-expansion CAPTURE SESSION ✅ DONE 2026-05-25 on `workflow-2-competition-scraping`** — pure-capture session (NO code, NO builds, NO deploys, ZERO Rule 9 gates fired). Director surfaced the long-promised "next round of additions" at session-start before any P-48 Session 3 work began; Rule 14f session-direction picker chose pure capture (P-48 Session 3 deferred opportunistically). NEW `P-49 Reviews Phase 2` ROADMAP entry (hub-and-spokes mirroring P-46 — 5 internal workstreams: Design Session NEXT + per-platform extension extraction × 4 platforms Amazon→eBay→Etsy→Walmart + Crawler infrastructure CONDITIONAL + Captured Reviews UI extensions + AI review analysis system at 3 levels) + NEW `P-50 Condition Pathology card` ROADMAP entry (small `main`-branch placeholder card; card-only scope per Rule 14f picker — no W# renumbering). `docs/COMPETITION_DATA_V2_DESIGN.md` §A.1 updated with "RESOLVED 2026-05-25 — see ROADMAP P-49" cross-reference paragraph linking the original 2026-05-23 deferral to the now-captured P-49 hub. **Closes (a.91) RECOMMENDED-NEXT** = P-48 Session 3 (Diagnostic #2) DEFERRED to opportunistic insertion via the P-48 ROADMAP entry which already documents Session 3 as the next-within-P-48 step. **Opens (a.92) RECOMMENDED-NEXT** = Reviews Phase 2 Design Session (Workflow Requirements Interview producing `docs/REVIEWS_PHASE_2_DESIGN.md`) on `workflow-2-competition-scraping`.

---

## What we did this session (in plain terms)

Today was a **pure-capture session** — no code, no builds, no deploys, no pushes to production. The plan walking in was the screen-recording stutter diagnostic (P-48 Session 3). Before I read any of the pre-build documents, you flagged the long-promised "next round of additions" to Competition Scraping and dropped the entire scope in one message: automated review collection for Amazon, eBay, Etsy, and Walmart; per-product two-sweep AI review summarization; cross-Type pooled AI analysis; cross-everything competitive-landscape AI analysis; plus a small new "Condition Pathology" card on the PLOS dashboard.

I paused the stutter work and we ran three quick decision-pickers together: (1) should today be pure capture or mixed with the stutter work? — you picked pure capture; (2) should I capture this as one big hub-and-spokes ROADMAP entry mirroring P-46, or split it into 4-5 separate items? — you picked hub-and-spokes; (3) for the Condition Pathology card, is this just a placeholder card or a full new workflow we should renumber everything around? — you picked placeholder card only. With those locked, I wrote two new ROADMAP entries (P-49 Reviews Phase 2 + P-50 Condition Pathology card), updated the existing P-46 design doc to point §A.1's old "we'll figure out reviews per platform later" deferral at the new P-49 capture, and drafted a 15-question Workflow Requirements Interview for the design session next time we meet.

Nothing shipped to production. Nothing changed in code. The stutter work didn't go away — it's still queued via the P-48 ROADMAP entry — but it's now opportunistically interleavable rather than the immediate next-session lock, because today's capture revealed that Reviews Phase 2 is a multi-month workstream that gates W#2 graduation, and starting its design interview is the most-valuable next session.

## What we'll do next session (in plain terms)

Next session is the **Reviews Phase 2 Design Session** — a Workflow Requirements Interview where I walk you through about 15 design questions and we lock down all the open decisions before any code starts. The deliverable is a new document called `docs/REVIEWS_PHASE_2_DESIGN.md` — same shape as the existing P-46 design doc (`docs/COMPETITION_DATA_V2_DESIGN.md`): a §A section of frozen design decisions, an empty §B for future build-session refinements, and a §C with per-workstream implementation outlines.

**This is a pure design session — no code, no deploys.** Estimated ~1.5-2 hours of conversation. The questions cover: should we build extension-only or also a server-side crawler (anti-bot risk on Amazon especially)? Which of the 4 platforms do we tackle first? How do we orchestrate the actual scraping (background job vs in-page extension worker)? How does the UI let you adjust per-star scrape caps? How does the AI analysis work at 3 levels (per-product, cross-Type, cross-everything)? What AI model do we use and how do we guard the cost? Where in the UI does the AI analysis appear? What new database tables and columns do we need?

After the design session locks all the answers, the actual build sessions follow — most likely starting with the first per-platform extension extraction module (probably Amazon since that's your stated priority order). Each platform is its own ~2-4 session build cluster. The full P-49 arc is estimated at ~20-50 sessions total, broken into 5 workstreams; we'll do them one at a time, not all at once.

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-25 (Reviews Phase 2 scope-expansion CAPTURE ✅ DONE; W#2 polish queue grew significantly today since P-49 added a whole new multi-workstream hub):

- **Reviews Phase 2 Design Session — NEXT.** ~1.5-2 hours pure design conversation. No main push expected. Produces `docs/REVIEWS_PHASE_2_DESIGN.md`.
- **P-49 Reviews Phase 2 build workstreams (after design session locks scope).** ~20-50 sessions total across 5 workstreams (W1 Design Session NEXT + W2 per-platform extension extraction × 4 platforms = ~8-16 sessions + W3 crawler infrastructure CONDITIONAL ~5-10 sessions if scoped in + W4 Captured Reviews UI extensions ~2-3 sessions + W5 AI review analysis system ~5-10 sessions).
- **P-50 Condition Pathology card.** ~10 min in-Claude. Lives on `main` branch (platform-wide UI, not workflow-2-scoped). Can slot into any deploy session OR done standalone between W#2 sessions. NOT on the critical path.
- **P-48 Session 3 (Diagnostic #2) — DEFERRED to opportunistic insertion.** ~30-60 min in-Claude. Empirical instrumentation pass to identify the ~6-7 fps source-file bottleneck for the screen-recording stutter. Lives within the existing P-48 ROADMAP entry. Can interleave with P-49 work whenever you'd like to slot it in.
- **P-43 mechanical prevention candidate (LOW informational).** ~1 small session. Add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`. Opportunistic.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions, OR drop. Re-evaluate after Reviews Phase 2 closes.
- **P-27 Bug #9 + Bug #15 — DEFERRED LOW.** ~0-1 sessions. Likely obsolete after P-46. Re-evaluate after P-26.
- **W#2 graduation step (now further deferred).** Was originally gated by P-46 + P-47 + P-26. Now also gated by Reviews Phase 2 closure at the workstream-by-workstream level. Likely 6-12 months out at current sessions-per-week cadence.
- **THEN STOP AND EXPLICITLY ASK DIRECTOR for any next round of competition-scraping additions** per your standing directive after Reviews Phase 2 + P-48 stutter + P-43 + P-26 + P-27 all close.
- **After your next round of additions ships:** W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent.

---

**For:** the next Claude Code session — **Reviews Phase 2 Design Session (Workflow Requirements Interview producing `docs/REVIEWS_PHASE_2_DESIGN.md`) on `workflow-2-competition-scraping`** (estimated ~1.5-2 hours in-Claude: pre-build doc reads + branch state verify + read P-49 ROADMAP entry + read COMPETITION_DATA_V2_DESIGN.md §A as the structural precedent + walk director through the 15 interview questions one-at-a-time with Rule 14f forced-pickers per question + assemble locked-decisions §A in a new standalone design doc + write empty §B + write §C per-workstream implementation outlines + end-of-session doc-batch). Per Rule 23 Change Impact Audit: **DESIGN SESSION** (no production code; no schema; no API changes — the design doc is the deliverable). **Schema-change-in-flight flag stays NO** at session start AND at session end (no `prisma db push` this session; flag EXPECTED to flip to YES when first per-platform build session lands the `source = 'extension-scrape'` enum value addition + the AI analysis output tables). **Rule 9 triggers planned this session: ZERO** (design-only; no main push). **Pushes planned per `feedback_approval_scope_per_decision_unit.md`:** 2 (end-of-session doc-batch push + doc-batch ff-merge to main — both operationally adjacent + do NOT invoke Rule 9).

---

## Status of last session

**W#2 polish Reviews Phase 2 scope-expansion CAPTURE SESSION ✅ DONE 2026-05-25 on `workflow-2-competition-scraping`** — pure-capture session executing the Rule 14f session-direction picker outcome (Recommended: pure capture today).

**Session shape (PURE CAPTURE — ZERO Rule 9 gates fired; ZERO code commits; THREE Rule 14f forced-pickers fired):**

- Pre-build reads partial at session start (ROADMAP header + P-48 entry started but interrupted by director's scope drop).
- Director surfaced the long-promised "next round of additions" to W#2 before pre-build reads completed.
- Rule 14f session-direction forced-picker fired immediately — (A) Pure capture today (Recommended) / (B) Mixed P-48 + capture / (C) Pivot fully / (D) P-48 as planned + minimal capture; director picked (A).
- Rule 24 searches across all docs for prior treatment of Reviews Phase 2 + Condition Pathology + per-platform extraction + AI review analysis — no prior treatment found; only related touch is §A.1 in COMPETITION_DATA_V2_DESIGN (deferred decision from 2026-05-23) which today's capture RESOLVES.
- Rule 14f capture-shape forced-picker fired — Hub-and-spokes (Recommended) over flat split over hybrid for P-49 + card-only (Recommended) over full-Workflow over scope-defer for P-50; director picked both Recommended options.
- Wrote NEW P-49 Reviews Phase 2 hub-and-spokes ROADMAP entry with director's verbatim per-platform DOM specs preserved + anti-bot constraint preserved + 3-level AI analysis output shape preserved.
- Wrote NEW P-50 Condition Pathology placeholder card ROADMAP entry with card-only scope locked.
- Updated `docs/COMPETITION_DATA_V2_DESIGN.md` §A.1 with "RESOLVED 2026-05-25 — see ROADMAP P-49" cross-reference paragraph at end of §A.1 (preserves original director-supplied reasoning intact while making the resolution discoverable to future readers walking §A top-to-bottom).
- Drafted 15-question Workflow Requirements Interview scaffold for next session's design interview ingestion.
- Rule 14f entry-approval + next-session forced-picker fired — director approved both entries + locked Reviews Phase 2 Design Session as next-session task per (a.92).
- End-of-session doc-batch covers the 9-doc bundle (ROADMAP header bump only + CHAT_REGISTRY header bump only + DOCUMENT_MANIFEST header bump only + CORRECTIONS_LOG header bump + new §Entry 2026-05-25 Reviews Phase 2 capture + HANDOFF_PROTOCOL header bump only + CLAUDE_CODE_STARTER header bump only + this NEXT_SESSION full rewrite + COMPETITION_SCRAPING_DESIGN.md §B 2026-05-25 Reviews Phase 2 capture append + COMPETITION_DATA_V2_DESIGN.md §B 2026-05-25 Reviews Phase 2 capture append + §A.1 cross-reference update in COMPETITION_DATA_V2_DESIGN).
- TWO pushes planned per `feedback_approval_scope_per_decision_unit.md`: end-of-session doc-batch push to `origin/workflow-2-competition-scraping` + end-of-session ff-merge + push to `origin/main` for doc-batch (operationally adjacent + do NOT re-invoke Rule 9 since pure-capture + no destructive operations).

**THREE Rule 14f forced-pickers fired all director-Yes per recommendations:** session-direction (Pure capture) + capture-shape (Hub-and-spokes for P-49 + card-only for P-50) + entry-approval + next-session (Both approved + Reviews Phase 2 Design Session locked).

**ZERO Rule 9 deploy gates fired** (pure-capture; no deploys; no destructive ops).

**ZERO DEFERRED items at session end (Rule 26)** — P-48 Session 3 carries via the P-48 ROADMAP entry itself (which already documents Session 3 as the next-within-P-48 step), NOT as a NEXT_SESSION standing carry-over. Reviews Phase 2 Design Session IS the next-session task per (a.92).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-25 (the THIRD 2026-05-25-dated §Entry — Reviews Phase 2 scope-expansion capture)** capturing 4 sub-observations including (a) scope-expansion capture outcome; (b) NEW reusable Pattern "Mid-pre-build scope-expansion redirect — when director surfaces major new scope at session-start before pre-build reads complete, the most-thorough/reliable path is a pure-capture session (pause planned task; run Rule 24 searches; capture as ROADMAP entries; defer planned task) rather than mixed-session attempts" — pairs as a Rule-30 plain-terms-summary lesson; (c) LOW informational sub-observation — long-deferred concerns naturally resolve when director's mental model of what they want catches up with the deferred scope (A.1 deferred 2026-05-23; resolved 2026-05-25 with full Phase 2 specs); (d) operational note — 15 interview-question draft preserved verbatim in NEXT_SESSION.md ## Proposed interview question scaffold section.

**Baselines unchanged from prior session** (no code change to verify): root tsc clean / extension tsc clean / **562 ext UNCHANGED** / **786 src/lib UNCHANGED** / **62 routes UNCHANGED**. Check 6 Playwright SKIPPED per Rule 27.

**THIRTY-FIFTH end-of-session run under the Rule 30 + §4 Step 4b template.** The 3 plain-terms sections above + the parent's Personalized Handoff continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; Reviews Phase 2 Design Session begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at today's end-of-session doc-batch commit. `main` exactly even with `origin/main` at today's end-of-session doc-batch commit (both branches end the session at the same SHA after the doc-batch ff-merge — both branches share the doc-batch since pure-capture + ff-merge to main lands the docs equally on both). Verify with `git log main..HEAD --oneline` showing 0 commits ahead. Session entry branch SHA = today's end-of-session doc-batch commit; design session adds only doc commits on the workflow branch (no code).

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish Reviews Phase 2 Design Session on `workflow-2-competition-scraping`.** Closes **(a.92) RECOMMENDED-NEXT**. Pure design session — Workflow Requirements Interview walking through ~15 design questions to lock the anti-bot strategy + extension-vs-crawler scope + per-platform DOM extraction shape + AI model choice + cost guards + batch sizing + UI placement + schema additions before any code starts. The deliverable is a new standalone design doc `docs/REVIEWS_PHASE_2_DESIGN.md` with the same shape as `docs/COMPETITION_DATA_V2_DESIGN.md` (§A frozen-decisions + §B empty append-only + §C per-workstream implementation outlines).

DESIGN session — ZERO Rule 9 gates planned. NO main push for code expected. ONE end-of-session doc-batch push + ONE doc-batch ff-merge push to main (operationally adjacent; does NOT invoke Rule 9).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify both branches' SHA relationships with `git log main..HEAD --oneline` — should show 0 commits ahead.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or design mechanics).
- `docs/ROADMAP.md` lines 1-30 (header) + the **NEW P-49 Reviews Phase 2 polish-backlog entry** (canonical capture of director's verbatim per-platform DOM specs for Amazon/eBay/Etsy/Walmart + anti-bot constraint + 3-level AI analysis output shape + 5-workstream hub-and-spokes structure).
- `docs/ROADMAP.md` NEW P-50 polish-backlog entry — Condition Pathology card placeholder (small `main`-branch standalone session; not on the (a.92) critical path; not relevant to the design session but read for full ROADMAP awareness).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §A (lines 41-400ish — entire frozen-decisions section — as the structural precedent for how to organize the new `REVIEWS_PHASE_2_DESIGN.md` §A) + §A.1 with today's "RESOLVED 2026-05-25 — see ROADMAP P-49" cross-reference paragraph at end + §A.11 schema additions section + §A.13 Living Questions answers + §A.14 Cross-Tool Data Flow Map reciprocal output declaration + §A.16 Deferred-items registry.
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-25 (Reviews Phase 2 capture session) — yesterday's data-shape-side capture entry with schema cross-references + design-session ingestion guidance for the new design doc.
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-25 (Reviews Phase 2 capture session) — yesterday's extension-side-architecture capture entry covering URL-prefix dispatch + Shadow DOM mounts + `makeTextareaField()` helper extensions for the per-platform extraction modules.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-25 (Reviews Phase 2 scope-expansion capture — the THIRD 2026-05-25-dated §Entry) — today's closing §Entry with the NEW reusable Pattern "Mid-pre-build scope-expansion redirect" + 4 sub-observations.
- The **## Proposed interview question scaffold section BELOW** in this NEXT_SESSION.md — the 15 questions to walk director through verbatim per question with Rule 14f forced-pickers per question.
- `docs/AUTO_ANALYZE_PROMPT_V1.md` / `docs/AUTO_ANALYZE_PROMPT_V2.md` / `docs/AUTO_ANALYZE_PROMPT_V3.md` / `docs/AUTO_ANALYZE_PROMPT_V4.md` (the W#1 Keyword Clustering AI analysis prompt history — relevant Pattern reference for P-49 Workstream 5 AI analysis design questions Q7-Q12; the W#1 prompt evolved through 4 versions before stabilizing).
- `docs/MODEL_QUALITY_SCORING.md` + `docs/INPUT_CONTEXT_SCALING_DESIGN.md` (W#1 AI model evaluation + context scaling design docs — relevant for P-49 W5 model choice + cost guard design questions Q7-Q8).
- `prisma/schema.prisma` `CapturedReview` model — current v1 shape per P-46 W2 Session 4 (shipped 2026-05-28); P-49 W2 adds `source = 'extension-scrape'` enum value + likely other fields; locked at design-session per Q13.
- `extensions/competition-scraping/src/lib/content-script/` directory listing — current per-platform module structure (relevant for Q1 crawler scope + Q2 per-platform priority order + Q15 anti-bot defensive posture).
- `docs/HANDOFF_PROTOCOL.md` Rule 18 (Interview-cluster + append-only DESIGN doc structure methodology — this session's deliverable follows it) + Rule 14f (forced-picker mechanics — ~15 will fire this session, one per interview question) + Rule 21 + Rule 22 + Rule 23 (Change Impact Audit — DESIGN) + Rule 24 (search before capturing — relevant for any sub-design-decisions that surface mid-interview) + Rule 25 (Multi-Workflow — workflow-2 only) + Rule 26 (DEFERRED items registry — ZERO standing carry-overs at session entry) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `feedback_recommendation_style.md` (most-thorough/reliable — every Rule 14f picker this session should surface the recommended path + default to it).
- `feedback_approval_scope_per_decision_unit.md` (2-push design-session pattern: doc-batch push + doc-batch ff-merge push).
- `feedback_default_to_recommendation.md` (most picker choices should default to recommended unless director shifts).
- `feedback_session_bookends_plain_summary.md` (Rule 30 — the 3 mandatory plain-terms sections at session start + session end).

**Task shape (Reviews Phase 2 Design Session):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or design mechanics. Cover: what we'll do (pre-build reads + branch state verify + walk director through the 15 interview questions with Rule 14f forced-pickers per question + assemble the new `docs/REVIEWS_PHASE_2_DESIGN.md` with §A frozen-decisions + §B empty + §C per-workstream implementation outlines + end-of-session doc-batch); schema-change-in-flight flag stays NO; ZERO Rule 9 gates planned; 2 pushes planned total.

2. **Pre-build reads** — execute the pre-build read list above. ~10-15 min (this is a heavier read than usual because the design doc inheritance touches W#1 AI prompt history + the existing P-46 design doc + the two §B 2026-05-25 capture entries).

3. **Branch state verify** — `git branch --show-current` (should be `workflow-2-competition-scraping`) + `git log main..HEAD --oneline` (should show 0 commits ahead — both branches at same SHA from prior session's doc-batch ff-merge).

4. **Rule 14f session-start confirmation** — likely no picker fires (design-session task is the recommended default per (a.92); director directive matches). If director has additional context between sessions (e.g., they've thought further about the crawler-vs-extension tradeoff or about the AI model choice), fire clarifying picker on whether to expand or contract the interview scope.

5. **Walk director through the 15 interview questions BELOW one-at-a-time.** Fire Rule 14f forced-picker per question with options + Recommended pick. Capture director's answer + locked-decision narrative + alternatives considered + reasoning per question. Each question follows the same shape: question text + alternatives (A) (B) (C)... + Recommended pick + director's pick + locked decision + impact on other workstreams.

6. **Mid-interview cross-decision integration.** Some questions cascade — e.g., Q1 crawler scope decision affects Q15 anti-bot posture + Q3 scrape job orchestration; Q7 AI model choice affects Q8 batch sizing + Q12 caching. Be aware of cascade points + fire clarifying re-pickers if a later question's options shift based on an earlier question's answer.

7. **Assemble `docs/REVIEWS_PHASE_2_DESIGN.md`** — new standalone design doc with same shape as `docs/COMPETITION_DATA_V2_DESIGN.md`:
   - Header (Polish item: P-49 Reviews Phase 2 / Parent workflow: W#2 / Status: 🟢 Design phase — initial interview FROZEN <date> / Branch (design): workflow-2-competition-scraping / Created: <date> / Created in session: <session-id> / Pre-graduation gating: YES — P-49 is the major Phase 2 review-collection + analysis expansion of W#2 / Doc type: Group B (workflow-specific) / Doc location rationale: P-49 is a large multi-workstream scope-drop; dedicated top-level doc parallels COMPETITION_DATA_V2_DESIGN.md for P-46).
   - Related docs (mirror the COMPETITION_DATA_V2_DESIGN.md Related docs list with appropriate P-49 substitutions).
   - Structure note (per HANDOFF_PROTOCOL Rule 18 — §A frozen + §B empty + §C per-workstream).
   - **§A — Initial design-session interview answers (FROZEN <date>).** One subsection per locked question (A.1 = Q1 / A.2 = Q2 / etc.) + A.N Schema additions (consolidated) + A.N+1 Platform-truths audit + A.N+2 Living Questions answers + A.N+3 Cross-Tool Data Flow Map + A.N+4 Scaffold fit + A.N+5 Deferred-items registry per Rule 14e + Rule 26.
   - **§B — In-flight refinements (append-only).** Empty at end of interview.
   - **§C — Per-workstream implementation outlines.** Five subsections: W1 Design Session DONE (this session) / W2 Per-platform extension extraction (4 sub-clusters Amazon/eBay/Etsy/Walmart) / W3 Crawler infrastructure (CONDITIONAL per Q1 outcome) / W4 Captured Reviews UI extensions / W5 AI review analysis system. Each has file-level scope + session estimate + cross-references back to §A decisions.

8. **End-of-session doc-batch** covers ROADMAP (header bump + P-49 status flip from "DESIGN-PENDING" to "🟢 DESIGN-FROZEN <date>; Workstream 2 NEXT (a.93)" + (a.92) closes + (a.93) opens for whichever next-task; most likely (a.93) = Reviews Phase 2 Workstream 2 Amazon extension extraction Session 1 OR Workstream 4 UI extensions Session 1 depending on the design-session sequencing decision) + CHAT_REGISTRY (header bump — 158th Claude Code session) + DOCUMENT_MANIFEST (header bump + new doc REVIEWS_PHASE_2_DESIGN.md added to Group B registry) + CORRECTIONS_LOG (header + new §Entry capturing the design session outcome + any reusable Patterns memorialized during the interview) + NEXT_SESSION (rewritten for whichever next-next task per (a.93)) + HANDOFF_PROTOCOL (header bump only) + CLAUDE_CODE_STARTER (header bump only) + COMPETITION_DATA_V2_DESIGN.md §B (cross-reference pointer entry to the new REVIEWS_PHASE_2_DESIGN.md — mirrors §B 2026-05-23 pattern from when P-46 was first split into its own design doc) + COMPETITION_SCRAPING_DESIGN.md §B (cross-reference pointer entry to the new REVIEWS_PHASE_2_DESIGN.md — mirrors §B 2026-05-20-b pattern from CAPTURED_VIDEOS_DESIGN.md split + §B 2026-05-23 pattern from COMPETITION_DATA_V2_DESIGN.md split) + NEW REVIEWS_PHASE_2_DESIGN.md the actual design doc.

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** every Rule 14f picker fired during the interview should surface the recommended path + default to it unless director shifts.

**Schema-change-in-flight flag:** STAYS **NO** at session start AND at session end (no `prisma db push`; pure design doc). EXPECTED YES when next-next session (whichever P-49 Workstream 2 first build session) lands.

---

## Proposed interview question scaffold

The 15 questions below are the draft Workflow Requirements Interview scaffold for the Reviews Phase 2 Design Session. Walk director through them one-at-a-time with Rule 14f forced-pickers. **Recommended picks per most-thorough/reliable reasoning** are noted at each question; director should default to Recommended unless they shift.

---

**Q1 — Crawler scope.** Should Reviews Phase 2 build a server-side crawler as a parallel collection method alongside the extension-side capture, or extension-only?

- (A) **Extension-only — defer crawler entirely (Recommended).** Director's logged-in browser session at director's IP is behaviorally indistinguishable from a power user; lowest anti-bot risk on all 4 platforms; no proxy/captcha-solving/fingerprint-randomization infrastructure cost; matches director's verbatim anti-bot constraint *"functionality should be very close to real world human user sitting where admin is."* Trade-off: collection happens only when director is actively on a platform page (no overnight scrapes).
- (B) Extension primary + crawler for non-Amazon platforms only. Lower-risk crawler (eBay/Walmart/Etsy) lets background scrapes run; Amazon stays extension-only. Trade-off: split codebase + still some anti-bot risk + still proxy + captcha cost for 3 platforms.
- (C) Crawler-first across all 4 platforms with extension as fallback. Highest collection throughput + overnight capability. Trade-off: significant infrastructure cost + ongoing maintenance + non-trivial Amazon anti-bot risk that could trigger seller-account flags.
- (D) Defer Q1 — design crawler later as separate session if Phase 2 collection volume proves insufficient.

**Cascade impact:** Q1 outcome (A) drops Workstream 3 entirely from P-49; Q1 outcome (B) or (C) keeps W3 in scope. Affects Q3 (scrape job orchestration) + Q15 (anti-bot defensive posture).

---

**Q2 — Per-platform priority order.** In what order do we build the 4 per-platform extension extraction modules (P-49 Workstream 2 sub-clusters)?

- (A) **Amazon → eBay → Etsy → Walmart (Recommended; matches director's stated order).** Amazon first because (a) most-complex DOM (per-star pagination URL + helpful-count + Customers say block); (b) director explicitly listed Amazon first in 2026-05-25 scope drop; (c) builds the Pattern foundation for the simpler platforms after.
- (B) Walmart → Etsy → eBay → Amazon (simplest-first). Walmart's per-star query-param URL is the simplest; Amazon's per-star pagination + helpful-count is most-complex. Builds confidence on simpler platforms before tackling Amazon.
- (C) Pair-wise (Amazon+Walmart together + eBay+Etsy together). Amazon + Walmart share the per-star URL pattern; eBay + Etsy share the overlay/feedback pattern. Reuse Pattern infrastructure within each pair.
- (D) Director picks per-platform readiness (e.g., which platforms have active products in director's current catalog).

**Cascade impact:** Q2 affects per-platform-session sequencing only; no schema cascade.

---

**Q3 — Scrape job orchestration.** How does a single review-collection request get from director's click to the database insert?

- (A) **In-page extension worker — synchronous within the open tab (Recommended).** Director right-clicks → "Scrape reviews for this URL" → extension content-script walks the DOM + paginates + inserts directly via existing Supabase auth in the page session. Progress UI inside a Shadow DOM mounted on the page (per P-47 precedent). Trade-off: locks the tab during scrape (typically 30s-5min depending on review count); if director closes tab, scrape aborts (partial inserts kept).
- (B) Background extension worker — extension service worker handles the scrape; content-script just kicks it off then closes. Director can navigate away mid-scrape. Trade-off: extension service workers have limited DOM access (no canonical way to read a third-party page from a service worker without re-opening it via a hidden tab — which is also flaggable behavior on Amazon).
- (C) Hybrid — content-script captures the initial review batch from the current page state instantly + background worker continues pagination if needed. Best UX + still operates within director's session boundary.
- (D) Crawler-driven (Q1-dependent — if crawler scoped in, the scrape runs server-side; extension is just a trigger).

**Cascade impact:** Q3 affects UI design for the progress indicator (Q14 star-count breakdown UI may share the surface) + affects whether a "scrape complete" notification + retry-on-failure are needed.

---

**Q4 — Per-star scrape count UX.** How does director adjust the "200 reviews per star" default cap?

- (A) **Per-URL setting — small input field next to the right-click trigger (Recommended).** Director sets the cap once per URL save (lives on the existing `CompetitorUrl` row as new column `reviewScrapeCap Int? @default(200)`) + per-trigger override via a small input in the extension popup. Most-thorough/reliable because (i) per-URL granularity matches real-world need (some products have 10 reviews + some have 50000); (ii) reuses existing per-URL settings UI from P-46 W3 click-to-edit cell editors.
- (B) Global setting per Project (lives in `UserTablePreferences` model from P-46 W1). Simpler UI but less flexible.
- (C) Per-trigger only (no persisted setting — director enters cap each time). Maximum control but high friction.
- (D) Fixed at 200/star with no override. Simplest; defers customization.

**Cascade impact:** Q4 affects Q13 schema additions (whether `CompetitorUrl.reviewScrapeCap` field needed).

---

**Q5 — Server-side review reordering.** Reviews are stored per-star and need within-star + across-star reordering on vklf.com (drag-to-reorder, similar to P-46 W3 Session 3 column reorder + W3 Session 3 row reorder).

- (A) **Reuse the W3 Session 3 @dnd-kit row-reorder Pattern with new `sortRank Int?` field on `CapturedReview` (Recommended).** Same shared debounced-mutation lifecycle Pattern from W3 Session 3 (§B 2026-05-23-f). Pairs with existing P-46 W3 drag-to-reorder UI affordance.
- (B) Star-count sort only — no within-star reorder. Trade-off: less flexibility but no schema change + simpler UI.
- (C) Helpful-count sort (Amazon-only data; others use insertion order). Trade-off: cross-platform asymmetry; Amazon gets richer ordering than eBay/Etsy/Walmart.
- (D) Defer reorder entirely; ship Q4 (per-star cap UX) only at first.

**Cascade impact:** Q5 (A) adds `sortRank Int?` field to schema per Q13.

---

**Q6 — Bulk-delete affordance.** Reviews accumulate fast; director needs a way to bulk-delete reviews that aren't useful (typically 1-star spam reviews).

- (A) **Multi-select checkboxes + bulk-delete-with-confirm modal (Recommended).** Mirrors P-46 W2 Captured Reviews list per-row delete + adds multi-select. Standard UI pattern; reuses existing delete API route with batch wrapper.
- (B) Per-row delete only (current v1 from P-46 W2 Session 4). Trade-off: high friction for bulk operations.
- (C) Filter-then-bulk-delete (filter to 1-star + select all + delete). Most-thorough for spam-cleanup workflow.
- (D) Defer bulk-delete; ship multi-select-only without delete-confirm modal first.

**Cascade impact:** Q6 affects Q4 UI sub-design (whether the existing star-filter doubles as the multi-select scope).

---

**Q7 — AI model choice + cost guards.** Which LLM does P-49 Workstream 5 use for review analysis at 3 levels (per-product two-sweep + cross-Type pooled + cross-everything)?

- (A) **Claude Opus 4 (or whatever the current Anthropic flagship is at design-session time) + per-request cost cap + per-Project monthly cost cap (Recommended).** Best output quality for nuanced review summarization; cost caps prevent runaway spend; mirrors W#1 Keyword Clustering's per-Project cost-cap Pattern from `docs/MODEL_QUALITY_SCORING.md`. Trade-off: higher per-request cost than Claude Sonnet or GPT-4o.
- (B) Claude Sonnet 4 (cheaper Anthropic option). Trade-off: lower quality on long-context summarization; may need more two-sweep iterations to hit Opus-quality output.
- (C) Hybrid — Opus for per-product two-sweep + Sonnet for cross-Type/cross-everything where the input is already-summarized batch summaries. Cost-optimized.
- (D) GPT-4o or Gemini-Pro (non-Anthropic). Trade-off: PLOS currently has Anthropic infra; introducing a second provider adds operational complexity.

**Cascade impact:** Q7 affects Q8 batch sizing (different models have different context windows + cost-per-token) + Q12 caching + re-run economics.

---

**Q8 — Two-sweep batch sizing.** First-sweep batch sizing for per-product summarization: how many reviews per batch?

- (A) **Adaptive batching based on token count — 80% of model context window per batch (Recommended).** Claude Opus 4 context is ~200K tokens; reviews are typically 50-500 tokens each; batches of 200-1000 reviews per first-sweep call. Mirrors W#1 Keyword Clustering's INPUT_CONTEXT_SCALING_DESIGN.md adaptive pattern. Trade-off: more complex batch-sizing logic; needs token-counting before each call.
- (B) Fixed batch of 100 reviews per first-sweep call. Simple; predictable cost per batch. Trade-off: doesn't scale to high-review-count products (Amazon products with 50,000 reviews would need 500 first-sweep calls).
- (C) Fixed batch of 500 reviews per first-sweep call. Larger batches reduce call count but risk hitting context window limits on long reviews.
- (D) Defer to first build session of W5; ship Q7 model choice first + tune batch size empirically.

**Cascade impact:** Q8 affects Q12 caching strategy (per-batch caching vs per-product caching).

---

**Q9 — AI analysis output shape.** What does each level of AI analysis produce as its output artifact?

- (A) **Rich-text TipTap JSON (Recommended).** Reuses the existing `RichTextEditor` + `AnalysisReadView` rendering Pattern from P-46 W2 Sessions 1+3 + W4 Sessions 1+2. AI output renders inline with existing per-item + URL-level + Project-level analysis surfaces. Same schema shape as existing `analysis` JSONB columns.
- (B) Structured JSON with named fields (e.g., `{pros: [...], cons: [...], commonComplaints: [...], commonPraise: [...]}`). Trade-off: more structured for downstream querying but doesn't reuse the existing rich-text rendering Pattern.
- (C) Both — structured JSON internally + rendered to rich-text TipTap JSON for display. Maximum flexibility; supports both UI display + potential future downstream analytics. Trade-off: 2x storage; more complex AI prompt to emit two formats.
- (D) Plain markdown text. Trade-off: doesn't fit the existing rich-text editor rendering.

**Cascade impact:** Q9 affects Q13 schema additions for new AI analysis output tables.

---

**Q10 — AI analysis UI placement.** Where on vklf.com does each level's AI analysis output appear?

- (A) **Per-product on the existing URL detail page (next to Captured Reviews section) + cross-Type + cross-everything on the existing Comprehensive Competitor Analysis page (P-46 W4) as new sections (Recommended).** Reuses existing surfaces; consistent with the W#2 navigation pattern; no new pages needed. Per-product analysis sits next to the data it summarizes; cross-Type + cross-everything sit on the Project-level Comprehensive page.
- (B) New dedicated `/reviews-analysis` page per-Project with all 3 levels in one place. Trade-off: introduces a new page + navigation entry; better for "analysis-focused" workflows but doesn't co-locate with the underlying data.
- (C) Per-product on URL detail + per-Type on Competition Data table row expand + cross-everything on Comprehensive page. Trade-off: per-Type on row expand introduces a new affordance to the table; may collide with W3's existing row-expand UI.
- (D) Defer UI placement to first build session of W5; ship per-product first + decide cross-level placement empirically.

**Cascade impact:** Q10 affects file-level scope of Workstream 5 + extends or duplicates Comprehensive Competitor Analysis page from P-46 W4.

---

**Q11 — AI analysis trigger UX.** How does director initiate an AI analysis run?

- (A) **Button in the UI per surface — "Analyze reviews" on URL detail page (per-product); "Analyze Type" on Comprehensive page per-Type section; "Analyze Project" on Comprehensive page top (Recommended).** Director-controlled; cost-visible (button click = one cost-incurring run); supports re-run after new reviews added.
- (B) Auto-trigger on review-count threshold (e.g., when a product crosses 50 reviews, analysis auto-runs). Trade-off: less director control over cost; may run before director is ready for results.
- (C) Auto-trigger on review-add (analysis re-runs every time a new review lands). Trade-off: very high cost; not aligned with two-sweep batch design.
- (D) Hybrid — manual button + optional auto-trigger toggle per-Project setting.

**Cascade impact:** Q11 affects Q12 caching (manual trigger needs explicit re-run affordance; auto-trigger needs cache invalidation logic).

---

**Q12 — AI analysis caching + re-run.** When does AI analysis output become stale + how does re-run work?

- (A) **Cache per-product analysis by reviews-set-hash; show "out-of-date" indicator when new reviews land; re-run button refreshes (Recommended).** Lowest cost; user always sees prior analysis instantly; explicit re-run when director wants fresh. Hash includes all review IDs sorted; new review → new hash → "out-of-date" badge.
- (B) Cache per-product with no staleness check; explicit re-run only. Trade-off: director may not realize output is stale if new reviews added.
- (C) Cache + auto-refresh on every page load (re-runs in background). Trade-off: high cost; latency on page load.
- (D) No caching — every page view triggers an AI call. Trade-off: prohibitively expensive at scale.

**Cascade impact:** Q12 affects Q13 schema additions for cache-tracking fields.

---

**Q13 — Schema additions (consolidated).** What new Prisma schema additions does P-49 require?

- (A) **(Recommended)** `CapturedReview` field additions: `source` enum value `extension-scrape` added; new `sortRank Int?` (per Q5) + new `helpfulCount Int?` (Amazon-only nullable) + new `platform String?` (denormalized from parent for query convenience). `CompetitorUrl` field addition: new `reviewScrapeCap Int? @default(200)` (per Q4). NEW `ReviewAnalysis` model — `id` / `urlId? String?` (per-product) OR `projectId String? + typeFilter String?` (per-Type) OR `projectId String?` (per-Project) discriminated via `level enum {PER_PRODUCT, PER_TYPE, PER_PROJECT}` / `analysisJson Json` (TipTap per Q9) / `reviewsHash String` (cache key per Q12) / `modelVersion String` (Q7) / `runAt DateTime` / `runByUserId String?` / `costUsdMicros Int?`. NEW indexes per typical query paths.
- (B) Same as (A) but use 3 separate tables instead of one discriminated model (`PerProductReviewAnalysis` + `PerTypeReviewAnalysis` + `PerProjectReviewAnalysis`). Trade-off: clearer per-level queries but 3x migration work + 3x downstream code paths.
- (C) Minimal — only `source` enum addition; defer all other schema additions to per-workstream sessions.
- (D) Defer entire schema decision to first W2 or W5 build session.

**Cascade impact:** Q13 (A) or (B) flips Schema-change-in-flight flag to YES at the start of the first W1 or W5 build session. Q13 (C) or (D) keeps it deferred.

---

**Q14 — Star-count breakdown UI.** How does the new star-count counter bar replace or augment the existing star-rating multi-select filter on Captured Reviews?

- (A) **Counter-bar with click-to-filter (Recommended) — 1-star (count) / 2-star (count) / 3-star (count) / 4-star (count) / 5-star (count) buttons at top of Captured Reviews section; click toggles filter; reuses existing multi-select state internally but presents as one-click affordances.** Compact; data-dense; faster to filter than checkboxes; matches Amazon-style star-filter UX.
- (B) Keep existing multi-select checkboxes; add counter labels alongside each. Less change to existing UI.
- (C) Counter-bar only (no filter); separate filter dropdown for advanced filtering. Trade-off: splits the UI into two affordances.
- (D) Defer Q14 UI to W4 build session; lock counter-bar wiring only at design session.

**Cascade impact:** Q14 affects W4 file-level scope.

---

**Q15 — Anti-bot defensive posture.** What rate-limiting + behavioral randomization does the extension apply to per-platform scrapes to honor the verbatim director constraint *"functionality should be very close to real world human user sitting where admin is"*?

- (A) **Conservative defaults: 1-3 second random delay between pagination clicks + respect platform's intrinsic rate limits + abort on captcha detection + show clear UI notification to director if any platform rate-limits us (Recommended).** Mirrors human-paced browsing; respects platform limits + lets director know if behavior surfaces anti-bot challenges; aborts cleanly rather than retrying (which is itself a bot signal).
- (B) Aggressive — minimum delays (50-200ms) + retry on rate-limit. Trade-off: faster scrapes + higher anti-bot risk; may flag director's Amazon seller account.
- (C) Platform-specific — Amazon gets conservative defaults; eBay/Etsy/Walmart get faster defaults. Trade-off: per-platform tuning is more complex but recognizes Amazon's tighter anti-bot posture.
- (D) Defer Q15 to first W2 build session; lock rate-limit-aware UI affordance only at design session.

**Cascade impact:** Q15 affects W2 per-platform module code shape; Q15 (A) Recommended is the safest default for the "behavioral indistinguishability from a real user" constraint.

---

**End of interview question scaffold.** After walking through all 15 questions, assemble `docs/REVIEWS_PHASE_2_DESIGN.md` §A with one A.N subsection per locked question + the standard A.N+1 to A.N+5 sections (Schema additions / Platform-truths audit / Living Questions / Cross-Tool Data Flow Map / Scaffold fit / Deferred-items registry). Then write empty §B. Then write §C with 5 workstream implementation outlines (W1 DONE this session + W2 per-platform extraction with 4 sub-clusters + W3 crawler CONDITIONAL + W4 UI extensions + W5 AI analysis system).

---

## Pre-session notes (offline steps for director between sessions)

**Optional — not required for the design session:**

- Read the NEW P-49 Reviews Phase 2 ROADMAP entry to refresh context on the per-platform DOM specs you supplied (Amazon `Customers say` + per-star URL / eBay Neutral+Negative feedback / Etsy overlay / Walmart per-star query-param). These are preserved verbatim from your 2026-05-25 scope drop in the ROADMAP entry.
- Skim the 15 interview questions above to mentally pre-load the design decisions. Each has options + a Recommended pick; you can default to Recommended on any question without prepping.
- Think about Q1 (crawler scope) ahead of time — this is the highest-leverage question because it determines whether Workstream 3 (Crawler infrastructure) lives in P-49 at all. Recommended is extension-only (defer crawler entirely) per your anti-bot constraint.
- Think about Q2 (per-platform priority order) — the Recommended Amazon → eBay → Etsy → Walmart order matches what you stated at 2026-05-25 scope drop, but if you have a different priority based on your current catalog readiness or seasonal sales priorities, surface it at session start.

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking the Reviews Phase 2 Design Session at all — can happen any time. Director-independent.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (no rebases, no force pushes, no `git reset --hard`, no `git branch -D`). Pure design + doc-write session.

**Rule 9 triggers planned this session: ZERO** — no main push for code expected. Design doc lands on workflow-2-competition-scraping; doc-batch ff-merges to main at end-of-session (operationally adjacent; does NOT invoke Rule 9 since no destructive operations + no code changes).

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits an alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any design mechanics.

---

## Why this pointer was written this way (debug aid)

Today's session was unplanned — pre-build launch was P-48 Session 3 (Diagnostic #2), but director surfaced the long-promised "next round of additions" before pre-build reads completed. The most-thorough/reliable response (per the NEW reusable Pattern memorialized today in CORRECTIONS_LOG §Entry 2026-05-25 Reviews Phase 2 capture) was a pure-capture session: pause the planned task, run Rule 24 searches, capture as ROADMAP entries with verbatim director-supplied specs preserved, and defer the planned task opportunistically.

The natural next-session task per (a.92) RECOMMENDED-NEXT is **Reviews Phase 2 Design Session on `workflow-2-competition-scraping`** — Workflow Requirements Interview producing `docs/REVIEWS_PHASE_2_DESIGN.md`. The shape mirrors the 2026-05-23 P-46 Phase 2 design session (which produced `docs/COMPETITION_DATA_V2_DESIGN.md`) and is the foundation that gates all 5 P-49 workstreams.

- **(Recommended)** Reviews Phase 2 Design Session — Workflow Requirements Interview walking through 15 questions (anti-bot strategy + crawler scope + per-platform priority + scrape orchestration + UX details + AI model + analysis output shape + UI placement + caching + schema additions + defensive posture). Recommended because (a) it's the locked next-session task per director's Rule 14f forced-picker outcome 2026-05-25; (b) Workstream 1 must close before any of W2-W5 can start; (c) the 15-question scaffold is already drafted; (d) all 5 P-49 workstreams cascade from design decisions locked here; (e) pure-design session has zero deploy risk + zero Rule 9 gate exposure.

The shape of the Reviews Phase 2 Design Session is **plain-terms summary + pre-build reads + branch state verify + Rule 14f session-start confirmation + walk director through the 15 interview questions one-at-a-time with per-question Rule 14f forced-pickers + mid-interview cross-decision integration + assemble `docs/REVIEWS_PHASE_2_DESIGN.md` (§A frozen-decisions + §B empty + §C per-workstream implementation outlines) + end-of-session doc-batch (10 docs including the new REVIEWS_PHASE_2_DESIGN.md) + 2 pushes**.

**After the Design Session locks the §A frozen-decisions,** the next-next sessions step through P-49 Workstream 2 first per-platform extension extraction (Amazon Session 1 most likely per Q2 Recommended) → continue through W2 sub-clusters → W4 Captured Reviews UI extensions (interleavable) → W5 AI review analysis system (interleavable) → W3 Crawler infrastructure CONDITIONAL (if scoped in per Q1 outcome) → then P-43 mechanical prevention + P-26 below-fold scroll + P-27 re-evaluation → W#2 graduation step → THEN STOP AND EXPLICITLY ASK director for next round of competition-scraping additions per director's standing directive.

**Alternate next-session candidates if director shifts priorities at session start:**

- **P-48 Session 3 (Diagnostic #2) — defer Reviews Phase 2 Design Session to a later session.** NOT recommended — Reviews Phase 2 is the major scope expansion that gates W#2 graduation + already captured today as the (a.92) RECOMMENDED-NEXT. P-48 Session 3 is opportunistic and can interleave with P-49 work.
- **P-50 Condition Pathology card — small `main`-branch standalone session.** NOT recommended as the next-session task — P-50 is ~10 min in-Claude + lives on `main` not `workflow-2-competition-scraping`. Better to slot it into a future deploy session or do it standalone between W#2 sessions.
- **P-43 mechanical prevention small fix.** NOT recommended — P-43 is LOW informational + opportunistic. Better after Reviews Phase 2 Design Session + first per-platform build session land.
- **P-26 below-fold scroll capture evaluation.** NOT recommended — P-26 is LOW alternate; re-evaluate after Reviews Phase 2 closes (which is months out).
- **P-27 Bug #9 + Bug #15 re-evaluation.** NOT recommended — likely obsolete after P-46. Re-evaluate after P-26.
- **W#2 graduation step.** NOT recommended UNTIL Reviews Phase 2 + P-48 stutter + P-43 + P-26 + P-27 all close. Currently many months out.
- **Skip the design session + go directly to a P-49 Workstream 2 first build session.** NOT recommended — without the design session locking the 15 design decisions, the W2 build session would face 15 forced-pickers on its own session-start (which is the inverse of clean session-shapes per today's NEW reusable Pattern). The design session is the most-thorough/reliable foundation.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time. Director-independent.

Check `ROADMAP.md` for the canonical state. Check the NEW P-49 polish-backlog entry for the canonical capture of director's verbatim per-platform specs + anti-bot constraint + 3-level AI analysis output shape + 5-workstream hub-and-spokes structure. Check `docs/COMPETITION_DATA_V2_DESIGN.md` §A as the structural precedent for how to organize the new `REVIEWS_PHASE_2_DESIGN.md` §A. Check `docs/CORRECTIONS_LOG.md` §Entry 2026-05-25 (Reviews Phase 2 scope-expansion capture — the THIRD 2026-05-25-dated §Entry) for the NEW reusable Pattern memorialization + 4 sub-observations.
