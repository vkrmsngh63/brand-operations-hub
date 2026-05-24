# Next session

**Written:** 2026-05-24-e (`session_2026-05-24-e_bundled-w5-p47-deploy` — end-of-session handoff after **W#2 polish P-46 Workstream 5 + P-47 Shadow DOM refactor BOTH ✅ DEPLOYED-PHASE-4-PENDING 2026-05-24-e on vklf.com via `workflow-2-competition-scraping` → `main` bundled ff-merge `9205340..d68885a` carrying 5 commits (W5 build `3c981be` + Reviews polish `41172f1` + W5 doc-batch `4d0f771` + P-47 build `d08f673` + P-47 doc-batch `d68885a`)**). Pure orchestration DEPLOY session on `workflow-2-competition-scraping` → `main`; 3 build commits + 2 doc-batch commits ff-merged behind ONE Rule 9 gate; Vercel auto-redeploy fired; fresh extension zip `plos-extension-2026-05-24-w2-deploy-34.zip` 202.98 KB dropped at repo root via `npm run zip` in `extensions/competition-scraping/`. **Phase-4 director real-Chrome verification DEFERRED to next session at director directive *"defer to next session (per W4 deploy 2026-05-26 Pattern)"*** — 3 verification walkthroughs preserved verbatim below in ## Standing carry-overs section so the next session can copy + execute without re-deriving. **TWO §4 Step 1c forced-pickers fired** — Rule 9 deploy gate picker (director picked "Deploy now — push to origin/main (Recommended)") + Phase-4 in-session vs deferred picker (director picked "Defer to next session (per W4 deploy 2026-05-26 Pattern)" over the Recommended "Run in-session now"; THIRD time the bundled-Phase-4 defer Pattern fires). **Schema-change-in-flight flag STAYS NO** — no schema work in any of the 3 build commits; W5 consumes already-deployed W1 schema; Reviews polish is React-component-only; P-47 is content-script DOM mount refactor. Pre-deploy + post-merge /scoreboard both 5/5 GREEN at unchanged baselines (root tsc clean / extension tsc clean / **558 ext UNCHANGED** / **786 src/lib UNCHANGED** / **62 routes UNCHANGED**); Check 6 Playwright SKIPPED per Rule 27 non-deploy-spec convention. **Closes (a.87) RECOMMENDED-NEXT = Bundled W5 + P-47 deploy session ✅ DEPLOYED-PHASE-4-PENDING 2026-05-24-e on vklf.com**; **opens (a.88) RECOMMENDED-NEXT = Bundled Phase-4 real-Chrome verification session** covering 3 walkthroughs (W4 10-step + W5 4-step + P-47 2-step) on `workflow-2-competition-scraping`. Three standing carry-overs preserved verbatim below — W4 Phase-4 verify (4th consecutive defer; from 2026-05-26 W4 deploy) + W5 Phase-4 verify (NEW today; 1st defer) + P-47 Phase-4 verify (NEW today; 1st defer); the W5 + P-47 walkthroughs pair into ONE Phase-4 step at next session since both ship via the same extension form surface.

---

## What we did this session (in plain terms)

Today was a **deploy session** — we shipped 3 pieces of work (sitting on the workshop branch since recent sessions) to the live site (vklf.com) in one bundled ff-merge under ONE deploy gate. The 3 pieces are:

- **(a) Chrome extension URL save form additions (P-46 Workstream 5)** — the extension URL save form now collects Type / Description-1 / Description-2 / Price so those fields land on vklf.com pre-filled at capture time instead of needing to be entered later via the web UI.
- **(b) Add Review modal duplicate-Save bug fix (P-46 Reviews polish)** — only ONE review row lands no matter how fast Save is clicked (the prior bug had the modal regenerating a fresh `clientId` on every Save click, defeating the server-side P2002 deduplication shipped W2 Session 4).
- **(c) Content-script video-capture form Shadow DOM mount (P-47 Session 1)** — the video capture form on competitor pages now mounts inside a "private" DOM bubble that structurally prevents page-level event interference (replaces an 80-event-listener workaround we shipped earlier).

What happened, in plain terms:

- **Director directive at session start matched the launch-prompt task** — proceed with the bundled W5 + P-47 deploy. Per `feedback_default_to_recommendation.md`, no re-confirmation picker fired because the launch-prompt task was already the recommended default + director directive matched exactly.
- **Pre-deploy /scoreboard 5/5 GREEN at unchanged baselines** (root tsc clean / ext tsc clean / 558 ext / 786 src/lib / 62 routes). Check 6 Playwright SKIPPED per Rule 27 — none of the 3 build commits in the ff-merge bundle introduced extension Playwright spec coverage.
- **Rule 9 deploy gate fired ONCE** — director picked "Deploy now — push to origin/main (Recommended)" per `feedback_recommendation_style.md` most-thorough/reliable.
- **`git push origin main` executed cleanly** — main fast-forwarded from `096a2ac` to `d68885a` via ff-merge `9205340..d68885a` carrying 5 commits (3 build + 2 doc-batch).
- **Vercel auto-redeploy fired** (~2-3 minute build + cache invalidation; landed cleanly with zero issues observed).
- **Fresh extension zip built** — `plos-extension-2026-05-24-w2-deploy-34.zip` 202.98 KB dropped at repo root via `npm run zip` in `extensions/competition-scraping/`. Ready for director sideload at Phase-4 verification next session.
- **Post-merge /scoreboard 5/5 GREEN at same baselines** on `main` — no surprises.
- **Phase-4 in-session vs deferred picker fired** — picker offered (A) Run Phase-4 in-session now (Recommended) / (B) Defer Phase-4 to next session (per W4 deploy 2026-05-26 Pattern). Director picked B. This is the THIRD time the bundled-Phase-4 defer Pattern fires (W4 2026-05-26 was first; W5+P-47 today is second; W4 still pending for the 4th consecutive defer is third instance).
- **NEW reusable Pattern memorialized** — "Bundled-build-commit deploy under ONE Rule 9 gate" — when N build commits sit on a workflow branch awaiting deploy + each commit already passed /scoreboard GREEN at its own session + all commits are additive + no inter-commit dependencies, the most-thorough/reliable choice is to ff-merge ALL N commits behind ONE Rule 9 gate rather than splitting into N separate deploy sessions. Today's 3-build-commit bundle is the FIRST CROSS-WORKSTREAM bundled deploy in W#2 history (P-46 W5 + P-46 Reviews polish + P-47 Shadow DOM are 3 distinct polish items shipped together). Pairs with W2 deploy 2026-05-23-c (single-workstream bundle) + W4 deploy 2026-05-26 (single Rule 9 gate + Phase-4 deferred — same shape).
- **TWO LOW informational P-43 cwd-leak reproductions** during /scoreboard execution (Check 5 pre-deploy + Check 3 post-merge; 6th+ reproduction in the Pattern class; caught + recovered immediately with absolute `cd /workspaces/brand-operations-hub` retry). Mechanical prevention candidate remains informational only.
- **Schema-change-in-flight flag STAYS NO** entire session — no `prisma db push`; pure deploy of pre-existing build commits.

**The session landed cleanly through additive-deploy + Phase-4-deferral + verbatim-preservation of 3 carry-overs.** No top-tier slips; no fix-forwards; ONE Rule 9 gate fired; 3 pushes planned (deploy push DONE; doc-batch push + ff-merge push pending).

## What we'll do next session (in plain terms)

Next session is the **bundled Phase-4 real-Chrome verification session** — director walks 3 verification scripts on Amazon in real Chrome covering everything that shipped to vklf.com in the prior few deploys:

- **(a) W4 Comprehensive Competitor Analysis page (10 steps)** — was already DEPLOYED-PHASE-4-PENDING from 2026-05-26 + has been deferred 3 sessions in a row + carries forward today as 4th consecutive defer. Per-Project rich-text editor with internal hyperlinks back to URL detail pages.
- **(b) W5 URL save form 4 new fields (4 steps)** — director triggers the extension URL save form on a competitor product page (Amazon recommended); verifies Type / Description-1 / Description-2 / Price fields appear as new textareas; types test values; clicks Save; opens vklf.com → Competition Data → finds the row → confirms the 4 new fields populated.
- **(c) P-47 Shadow DOM mount (2 steps)** — director triggers the extension video capture form on a competitor page (Amazon recommended); verifies form opens cleanly + interaction works cleanly with the Shadow DOM mount + no page-level focus interference (Amazon was the original Issue 2 platform — strongest signal for the band-aid replacement).

All 3 walkthroughs preserved verbatim in the ## Standing carry-overs section below so the session can copy + execute without re-deriving. The W5 + P-47 walkthroughs pair into ONE Phase-4 step (same extension form surface — director picks one Amazon product page + walks both verifications in one sitting); W4 is a separate Phase-4 step on a different surface (per-Project page on vklf.com).

**If all walkthroughs PASS:** P-46 W4 + W5 + P-47 all flip to ✅ DONE-AND-VERIFIED. P-46 Workstream 5 closes the entire P-46 implementation arc end-to-end. P-47 closes (only Session 1 was needed at code level + Phase-4; Sessions 2-3 from the original P-47 estimate were MERGED into today's bundled deploy). Next-next session would close (a.88) and open something new — likely P-46 W#2 graduation step OR a new W#2 polish item (P-26 below-fold scroll capture is the most-likely candidate per LOW priority OR P-43 mechanical prevention candidate per LOW informational) OR moving to W#3-W#14.

**If any walkthrough FAILS or PARTIAL:** initiate fix-forward cascade per the W3 deploy 2026-05-24 Pattern — each fix-forward becomes its own build commit + own Rule 9 gate + own Phase-4 reverify cycle. The W3 deploy session set a high-water mark at 6 deploys (initial + 5 fix-forwards) showing the pattern scales when issues are scoped + reversible + UI-only.

**Schema-change-in-flight flag** STAYS **NO** at the bundled Phase-4 verification session start AND end (no schema work; pure verification + optional fix-forwards consuming the already-live schema).

Estimated 30-60 min for in-session work + 15-30 min for Phase-4 verification walkthroughs themselves (director-paced).

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-24-e (P-46 W5 + P-47 both ✅ DEPLOYED-PHASE-4-PENDING 2026-05-24-e on vklf.com; Phase-4 verifies for W4 + W5 + P-47 all queued for next session):

- **Bundled Phase-4 verification session** (NEXT). ~1 session, 30-60 min. Closes 3 ✅ DEPLOYED-PHASE-4-PENDING items (W4 + W5 + P-47) to ✅ DONE-AND-VERIFIED if all walkthroughs PASS. Initiates fix-forward cascade per W3 deploy 2026-05-24 Pattern if any FAIL or PARTIAL.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions. Current two-captures workaround works fine. Has been the alternate candidate in recent end-of-session pickers; consistently not picked.
- **P-27 Bug #9 + Bug #15 — DEFERRED LOW.** May be obsolete now that P-46 redesigned the surfaces. Re-evaluate after P-46 closes end-to-end.
- **P-43 mechanical prevention candidate (LOW informational).** Add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md` (specifically Check 3's `npm test` + Check 5's `npm run build`). Not blocking any workstream. 7+ reproductions across sessions now.
- **W#2 graduation** after Phase-4 verifies pass. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent.

---

**For:** the next Claude Code session — **Bundled Phase-4 real-Chrome verification session** (estimated ~30-60 min in-Claude + 15-30 min director walkthroughs: pre-build doc reads ~5 min + branch state verify ~2 min + Phase-4 walkthrough (a) W4 ~5-10 min + Phase-4 walkthrough (b) W5 ~3-5 min + Phase-4 walkthrough (c) P-47 ~3-5 min + collation + status flips ~5 min + end-of-session doc-batch ~15-20 min + ping-pong sync ~3 min; OR fix-forward cascade if any walkthrough FAILS or PARTIAL: each fix-forward adds ~15-30 min for the fix + Rule 9 gate + Vercel redeploy + reverify cycle). Per Rule 23 Change Impact Audit: **VERIFICATION SESSION** (no new code unless fix-forward needed; consumes pre-deployed W4 + W5 + P-47 + W1 schema). **Schema-change-in-flight flag stays NO** (no transition expected). **Rule 9 triggers planned this session: ZERO** unless fix-forward cascade fires (each fix-forward fires its own Rule 9 gate per the W3 deploy 2026-05-24 Pattern). **Pushes planned per `feedback_approval_scope_per_decision_unit.md`:** 1 minimum (end-of-session doc-batch push to workflow branch + ff-merge to main); +1 per fix-forward if any walkthrough FAILS or PARTIAL.

---

## Status of today's session

**W#2 polish P-46 Workstream 5 + P-47 Shadow DOM refactor BOTH ✅ DEPLOYED-PHASE-4-PENDING 2026-05-24-e on vklf.com** via `workflow-2-competition-scraping` → `main` bundled ff-merge `9205340..d68885a` carrying 5 commits (W5 build `3c981be` + Reviews polish `41172f1` + W5 doc-batch `4d0f771` + P-47 build `d08f673` + P-47 doc-batch `d68885a`). Pure orchestration DEPLOY session; deployed to main this session.

**Session shape (DEPLOY SESSION — ff-merge to main; ONE Rule 9 gate; TWO §4 Step 1c forced-pickers; THREE pushes planned):**

- Pre-build reads at session start (read `docs/ROADMAP.md` P-46 + P-47 polish-backlog entries + `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-26 W4 deploy pattern + `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-24-d P-47 build session).
- Branch state verify — `workflow-2-competition-scraping` at `d68885a`; `main` at `096a2ac` (5 commits behind ff-merge target).
- Rule 14f session-start confirmation — NO picker fired because launch-prompt task was the recommended default + director's session-start directive matched the default.
- Pre-deploy /scoreboard 5/5 GREEN at unchanged baselines.
- Rule 9 deploy gate FIRED — director picked Deploy now — Recommended.
- ff-merge + push to `origin/main` executed cleanly at `d68885a`.
- Vercel auto-redeploy fired.
- Fresh extension zip built + dropped at repo root.
- Post-merge /scoreboard 5/5 GREEN at same baselines.
- Phase-4 in-session vs deferred picker FIRED — director picked Defer (B) over Recommended (A); same Pattern as W4 deploy 2026-05-26.
- End-of-session §4 Step 1c next-session-scope picker NOT FIRED — next-session task unambiguous (Bundled Phase-4 real-Chrome verification session).
- End-of-session doc-batch covers the 9-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG with new §Entry 2026-05-24-e + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION + COMPETITION_DATA_V2_DESIGN.md §B 2026-05-24-e + COMPETITION_SCRAPING_DESIGN.md §B 2026-05-24-e). 9 docs total since the deploy spans BOTH W#2's Competition Data design + the P-47 content-script design.
- THREE pushes this session: deploy push to `origin/main` (DONE under Rule 9 Yes at `d68885a`); end-of-session doc-batch push to `origin/workflow-2-competition-scraping`; end-of-session ff-merge push to `origin/main` for doc-batch (operationally adjacent; does NOT re-invoke Rule 9).

**§4 Step 1c forced-picker FIRED TWICE** — Rule 9 deploy gate picker resolved to Recommended A (Deploy now); Phase-4 in-session vs deferred picker resolved to non-Recommended B (Defer to next session) per the established W4 deploy 2026-05-26 Pattern.

**THREE DEFERRED items carry to next session as standing carry-overs (Rule 26):**

- **Task #1 (carry-over)** `DEFERRED: P-46 W4 Phase-4 real-Chrome verification` — deferred a 4th consecutive session (originally deferred 2026-05-26 W4 deploy session + re-deferred 2026-05-24-c + re-deferred 2026-05-24-d + re-deferred 2026-05-24-e today).
- **Task #2 (NEW today)** `DEFERRED: P-46 W5 Phase-4 real-Chrome verification` — 1st defer at director's "Defer to next session" pick on the Phase-4 picker; pairs with P-47 since both ship via the same extension form surface.
- **Task #3 (NEW today)** `DEFERRED: P-47 Session 1 Phase-4 real-Chrome verification` — 1st defer; pairs with W5.

ONE prior standing carry-over from 2026-05-24-c RESOLVED at today's deploy — P-46 W5 deploy session.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-24-e** — the bundled W5 + P-47 deploy session closing §Entry capturing (a) bundled-deploy outcome (5 commits ff'd under ONE Rule 9 gate; 5/5 GREEN pre + post); (b) NEW reusable Pattern "Bundled-build-commit deploy under ONE Rule 9 gate" (first cross-workstream bundle); (c) LOW informational dual P-43 cwd-leak reproductions; (d) calibration data point.

**THIRTY-FIRST end-of-session run under the Rule 30 + §4 Step 4b template** (sequence prior to today: 2026-05-21-b → 2026-05-21-c → 2026-05-21-d → 2026-05-22 → 2026-05-22-b → 2026-05-21 → 2026-05-22-c → 2026-05-22-d → 2026-05-22-e → 2026-05-22-f → 2026-05-22-g → 2026-05-22-h → 2026-05-22-i → 2026-05-23 → 2026-05-24 → 2026-05-25 → 2026-05-26 → 2026-05-27 → 2026-05-28 → 2026-05-23-b → 2026-05-23-c → 2026-05-23-d → 2026-05-23-e → 2026-05-23-f → 2026-05-24 → 2026-05-24-b → 2026-05-25 → 2026-05-26 → 2026-05-24-c → 2026-05-24-d → today 2026-05-24-e). The 3 plain-terms sections above + the parent's Personalized Handoff continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; the bundled Phase-4 real-Chrome verification session begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at today's end-of-session doc-batch commit. `main` is exactly even with `origin/main` at today's end-of-session doc-batch commit (both branches end the session at the same SHA after the canonical 3-push pattern's ping-pong sync). Verify with `git log main..HEAD --oneline` showing 0 commits ahead. The bundled Phase-4 verification session does NOT involve any new ff-merge to main unless a fix-forward fires (which would create its own ff-merge under its own Rule 9 gate).

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish bundled Phase-4 real-Chrome verification session, on `workflow-2-competition-scraping`.** Closes **(a.88) RECOMMENDED-NEXT**. Verification session — director walks 3 verification scripts on Amazon (and optionally other platforms) in real Chrome on Mac with the fresh extension `plos-extension-2026-05-24-w2-deploy-34.zip` sideloaded: (a) W4 Comprehensive Competitor Analysis page 10-step walkthrough; (b) W5 URL save form 4-step walkthrough; (c) P-47 Shadow DOM mount 2-step walkthrough. The W5 + P-47 walkthroughs pair into ONE Phase-4 step since both ship via the same extension form surface; W4 is a separate Phase-4 step on the per-Project Comprehensive Competitor Analysis page.

VERIFICATION session — ZERO Rule 9 gates planned unless fix-forward cascade fires. No new code unless fix-forward needed. No new npm dependencies. No new schema.

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify both branches' SHA relationships with `git log main..HEAD --oneline` — should show 0 commits ahead (both branches end the prior session at the same doc-batch SHA after the 3-push pattern's ping-pong sync).

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or Phase-4 mechanics).
- `docs/ROADMAP.md` lines 1-30 (header) + the **P-46 polish-backlog entry** (W4 sub-status currently ✅ DEPLOYED-PHASE-4-PENDING 2026-05-26 — will flip to ✅ DONE-AND-VERIFIED on Phase-4 PASS; W5 sub-status currently ✅ DEPLOYED-PHASE-4-PENDING 2026-05-24-e — will flip to ✅ DONE-AND-VERIFIED on Phase-4 PASS) + the **P-47 polish-backlog entry** (currently ✅ DEPLOYED-PHASE-4-PENDING 2026-05-24-e — will flip to ✅ DONE-AND-VERIFIED on Phase-4 PASS).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-26 (the W4 deploy session pattern — Phase-4-deferred-to-next-session shape that today's session executes the deferred Phase-4 for) + §B 2026-05-24-e (today's bundled W5 + P-47 deploy entry; cross-references) + §B 2026-05-24-c (W5 build session context — fix-shape narratives + Reviews modal idempotency bug fix detail in case Phase-4 surfaces issues).
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-24-d (P-47 build session — Shadow DOM mount mechanics + band-aid deletion narrative) + §B 2026-05-24-e (today's P-47 deploy entry).
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (the deploy gate — fires only if fix-forward cascade) + Rule 14f (will fire at most ONCE at session-start to confirm Phase-4 verification scope) + Rule 18 (Group B design docs append-only) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit — VERIFICATION SESSION + optional FIX-FORWARD) + Rule 25 (Multi-Workflow — workflow-2 → main if any fix-forward; ff-merge + ping-pong sync) + Rule 26 (DEFERRED items registry — 3 standing carry-overs for Phase-4 verifies; all 3 resolve today if all PASS) + Rule 27 (Playwright — N/A for verification session) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `feedback_approval_scope_per_decision_unit.md` (push count + ping-pong pattern; 1 push minimum end-of-session unless fix-forward cascade fires).
- The CORRECTIONS_LOG §Entry 2026-05-26 (W4 deploy session pattern — Phase-4 deferred-to-next-session branch + Truncated picker response Pattern; today's Phase-4 verification is the deferred outcome).
- The CORRECTIONS_LOG §Entry 2026-05-24-e (today's bundled deploy closing entry — bundled-deploy mechanics + NEW Pattern + LOW P-43 reproduction; context for any deploy-time verification issues).
- The CORRECTIONS_LOG §Entry 2026-05-24 (W3 deploy fix-forward cascade Pattern — the canonical 6-fix-forward in one session reference if today's Phase-4 surfaces issues).

**Task shape (Bundled Phase-4 real-Chrome verification session):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or Phase-4 mechanics. Cover: what we'll do in the session (pre-build reads + branch state verify + Phase-4 walkthrough (a) W4 + Phase-4 walkthrough (b) W5 + Phase-4 walkthrough (c) P-47 + collation + status flips + end-of-session doc-batch + ping-pong sync), schema-change-in-flight flag stays NO, ZERO Rule 9 gates planned unless fix-forward cascade fires.

2. **Pre-build reads** — execute the pre-build read list above. ~5 min.

3. **Branch state verify** — `git branch --show-current` (should be `workflow-2-competition-scraping`) + `git log main..HEAD --oneline` (should show 0 commits — both branches at same SHA from prior session's 3-push pattern ping-pong).

4. **Rule 14f session-start confirmation** — confirm bundled Phase-4 verification scope. Per `feedback_default_to_recommendation.md` no picker fires if launch-prompt task is the recommended default + director directive matches. If director shifts scope (e.g., wants to defer Phase-4 AGAIN for a 5th consecutive session, OR wants to scope a new W#2 polish item instead), fire clarifying picker.

5. **Phase-4 walkthrough (a) — W4 Comprehensive Competitor Analysis page** per ## Standing carry-overs section (a) below (10 steps). Director executes on Amazon (or any single platform — W4 is per-Project not per-platform). For each step: PASS / FAIL / PARTIAL.

6. **Phase-4 walkthrough (b) — W5 URL save form additions** per ## Standing carry-overs section (b) below (4 steps). Director executes on a competitor product page (Amazon recommended for consistency with section (c)). For each step: PASS / FAIL / PARTIAL.

7. **Phase-4 walkthrough (c) — P-47 Shadow DOM mount** per ## Standing carry-overs section (c) below (2 steps). Director executes on the SAME competitor page as section (b) (paired into one sitting since both use the same extension form surface). For each step: PASS / FAIL / PARTIAL.

8. **Collate results.** If ALL walkthroughs PASS → flip statuses: W4 → ✅ DONE-AND-VERIFIED; W5 → ✅ DONE-AND-VERIFIED + P-46 closes end-to-end; P-47 → ✅ DONE-AND-VERIFIED + P-47 closes. If any FAIL or PARTIAL → initiate fix-forward cascade per W3 deploy 2026-05-24 Pattern.

9. **If fix-forward cascade fires:** for each issue, scope the fix narrowly (UI-only preferred) + land via build commit on `workflow-2-competition-scraping` + fire Rule 9 gate for deploy push to `origin/main` + Vercel auto-redeploy + director re-verifies on vklf.com → loop until director's verdict is PASS. Each fix-forward adds ~15-30 min. Per `feedback_recommendation_style.md` most-thorough/reliable: fix-forward in-session rather than deferring unless the issue requires schema change OR significant new code OR director shifts scope away from current workstream.

10. **End-of-session doc-batch** covers ROADMAP (header bump + status flips on P-46 + P-47 based on Phase-4 outcome + new (a.89) opens if W4 + W5 + P-47 all close) + CHAT_REGISTRY (header bump — 154th Claude Code session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header + new §Entry capturing the Phase-4 verification outcome + any fix-forward cascade narrative + any new reusable Patterns surfaced) + NEXT_SESSION (rewritten for next-session task based on outcome) + HANDOFF_PROTOCOL (header bump only) + CLAUDE_CODE_STARTER (header bump only) + Group B doc per session scope (likely `docs/COMPETITION_DATA_V2_DESIGN.md` for the W4 + W5 verification outcome + `docs/COMPETITION_SCRAPING_DESIGN.md` for the P-47 verification outcome — TWO Group B docs likely this session).

11. **Ping-pong sync** — after doc-batch commit lands on `workflow-2-competition-scraping`, ff-merge to `main` + push to `origin/main` so both branches stay in sync. End-of-session 1-push pattern unless fix-forward cascade fires (then 1-push pattern + N fix-forward pushes).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** any picker that fires — surface the recommended path + default to it if director defers.

**Per Rule 14a tightening from 2026-05-24:** if any aspect of any fix-forward feels under-specified (e.g., a Phase-4 issue surfaces that's ambiguous between UI fix vs. schema fix vs. dependency fix), surface to director via Rule 14f picker BEFORE the build commit lands.

**Schema-change-in-flight flag:** STAYS **NO** at session start AND at session end (no schema work expected; fix-forwards if they fire would be UI-only per the W3 deploy 2026-05-24 Pattern).

---

## Standing carry-overs (deferred real-world testing)

The following three real-world-testing items are deferred at director's request from prior sessions. They carry forward across sessions until director picks them up. Preserved verbatim below so any future session can copy + execute without re-deriving the verification mechanics.

The (b) + (c) walkthroughs pair into ONE Phase-4 step at next session since both ship via the same extension form surface — director picks one Amazon product page + walks both verifications in one sitting. (a) is a separate Phase-4 step on the per-Project Comprehensive Competitor Analysis page on vklf.com.

### (a) P-46 Workstream 4 Phase-4 director real-Chrome verification

**Status:** DEFERRED a 4th consecutive session (originally deferred 2026-05-26 W4 deploy session; re-deferred 2026-05-24-c; re-deferred 2026-05-24-d; re-deferred 2026-05-24-e today at director directive *"defer to next session (per W4 deploy 2026-05-26 Pattern)"*).

**Pre-flight setup:**

- Open Chrome on Mac.
- Open vklf.com.
- Sign in if needed.
- Pick any one Project in your Project list — the W4 page is per-Project not per-platform, so cross-platform exception applies (pick any single Project rather than walking all 7 platforms).

**Step 1 — Navigate from Competition Data to the new Comprehensive Competitor Analysis page.**

Click into the chosen Project. Navigate to Competition Data (`/projects/<projectId>/competition-scraping`). Confirm you see the redesigned Competition Data page from the W3 deploy 2026-05-24 — horizontal `ColumnVisibilityBar` at the top combining platform filters + per-column show/hide toggles + click-to-edit cells + 17 columns + sticky table header + per-row "↗" Open button + drag-to-reorder rows + font-size stepper in the table toolbar. **Above the ColumnVisibilityBar at the top of the page**, look for a standalone "→ Comprehensive Competitor Analysis" navigation button row. **Click that button.** Expected: navigation to `/projects/<projectId>/competition-scraping/comprehensive-analysis/`. **Verify:** the URL bar shows the new path + the page loads without 404 or 501 error.

**Step 2 — Confirm initial page state (empty or existing content).**

The new Comprehensive Competitor Analysis page should load. If you've never written anything for this Project, you'll see an empty-state placeholder (something like "No analysis yet — click Edit to begin"). If you have written content before (which is unlikely for a fresh deploy but possible if any earlier session test-saved content), the existing rich-text content will render in read mode. **Verify:** the page renders cleanly, with a "← Competition Data" back-button visible at the top + an "Edit" toggle button somewhere on the page (likely top-right or top of the editor surface) + a last-edited timestamp footer at the bottom (the timestamp will be blank or show "Never" if the page is empty; otherwise it shows the last write time).

**Step 3 — Toggle into edit mode.**

Click the "Edit" button. Expected: the page transitions from read-mode to edit-mode. The static rendered content is replaced by an editable TipTap rich-text editor with a toolbar at the top. The toolbar should show (per §A.5 + W4 S1's variant='full' toolbar): H1 / H2 / H3 heading buttons + Bold + Italic + Underline + bullet-list + numbered-list + Link + Code block + the new **"Link to URL"** dropdown picker (added in W4 S2). The "Edit" button should now be a "Done" button. **Verify:** the editor mounts without errors + the toolbar shows all expected affordances + cursor lands in the editor surface ready for typing.

**Step 4 — Type body content.**

Click into the editor body. Type a short test paragraph: e.g., **"This is a test comprehensive analysis. Key competitors include the following:"** + press Enter. Now apply some formatting: select the word "Key" + click the Bold button + select "competitors" + click the Italic button. Make a heading: press Enter to start a new line + click the H2 button + type **"Key competitor URLs"** + press Enter. **Verify:** the typed text appears in real-time + Bold + Italic styling applies as expected + H2 heading renders larger than body text.

**Step 5 — Insert an internal hyperlink via the "Link to URL" toolbar dropdown.**

On a fresh line, click the **"Link to URL"** dropdown button in the toolbar. Expected: a dropdown panel opens showing a list of URLs from the current Project's competitor URL list (the same URLs that appear as rows in the Competition Data table). A search box at the top of the dropdown lets you filter case-insensitively. **Type a few characters** of a URL's product name OR seller name OR raw URL — the list filters live as you type. **Click any URL row** in the filtered list. Expected: the dropdown closes + a hyperlink is inserted at your cursor position. The hyperlink's visible text is a sensible default (product name OR seller name OR raw URL, depending on what's available). The hyperlink is styled in **blue underlined text** + has a small **🔗 emoji prefix** in front of it. **Verify:** all of the above + the cursor lands just after the inserted hyperlink ready for more typing.

**Step 6 — Toggle Done (transition to read mode).**

Click the "Done" button (the same button that was "Edit" before). Expected: the page transitions back from edit-mode to read-mode. The editor is replaced by a static rich-text rendering of the same content + the last-edited timestamp at the bottom of the page updates to the current time. **Verify:** the content you just typed renders cleanly in read mode (Bold + Italic + H2 all visually distinct + the 🔗 emoji prefix is still in front of the hyperlink + the hyperlink is still blue underlined).

**Step 7 — Click the rendered hyperlink.**

In read mode, click the rendered hyperlink (the one with the 🔗 emoji prefix). Expected: navigation to the matching URL detail page at `/projects/<projectId>/competition-scraping/url/<urlId>/`. The URL detail page shows the per-URL detail surface from the W2 deploy 2026-05-23-c (with the W2 Session 5 structural fields + Scraping Status toggle + bidirectional mirror with the Competition Data table's Status column). **Verify:** navigation works + the URL detail page loads + the URL detail surface shows the correct URL (the one you clicked).

**Step 8 — Navigate back via the back-button.**

On the URL detail page, click the "← Competition Data" back-button at the top of the page (this is the existing W2 affordance). Expected: navigation back to the Competition Data page (`/projects/<projectId>/competition-scraping`). Now click the standalone "→ Comprehensive Competitor Analysis" button again. Expected: you land back on the new W4 page (`/projects/<projectId>/competition-scraping/comprehensive-analysis/`) + your test content from Steps 4-5 is still there in read mode (because it was saved automatically when you clicked Done in Step 6).

**Step 9 — Toggle into edit mode one more time + verify the editor mounts.**

Click "Edit" again. Expected: editor mounts cleanly + your existing test content is loaded into the editor as editable rich-text + the hyperlink with the 🔗 emoji prefix is still styled correctly + clicking inside the hyperlink shows the standard TipTap Link mark interaction (edit/remove the link). Now click "Done" again without making any changes. Expected: page returns to read mode + the last-edited timestamp at the bottom of the page should update to the current time (since clicking Done triggers a save lifecycle even if no content changed — confirm this updates on every Done click OR document if it doesn't).

**Step 10 — Test the in-line `#url/<urlId>` shorthand syntax (advanced; optional).**

This step tests the "manual shorthand entry" path (the alternative to using the toolbar Link-to-URL picker). Click "Edit" one more time. On a fresh line in the editor, type literally: **the hash character followed by the word url followed by a slash followed by any valid urlId from the URL list, then press space**. Expected: the editor should recognize the shorthand pattern + the typed text should auto-convert to a hyperlink (via the same UrlReferenceExtension that handles the click interception). The result should look identical to the hyperlink you inserted via the picker in Step 5 (blue underlined + 🔗 emoji prefix). **Verify:** this auto-conversion works AND clicking the auto-created hyperlink (after toggling Done) navigates correctly per Step 7. If auto-conversion does NOT happen, that's a known limitation per §C.4's specification — the click interception works on `#url/<urlId>` hrefs regardless of HOW the href was inserted; the toolbar picker is the primary insertion affordance. Document the outcome either way.

**How to report back:**

For each step (1-10), tell Claude in plain language: PASS / FAIL / PARTIAL. If FAIL or PARTIAL, describe what you saw vs. what was expected. Screenshots or pasted observations are welcome. Claude will collate the report + either close W4 as ✅ DONE-AND-VERIFIED (if all 10 PASS) or initiate a fix-forward cascade (if any FAIL or PARTIAL).

**Cross-platform note:** the new Comprehensive Competitor Analysis page is per-Project, not per-platform. Pick any single platform (Amazon OR Ebay OR Walmart OR Etsy OR Aliexpress OR Macys OR Bestbuy) for the verification — there's no need to walk all 7 platforms since the page does not vary by platform.

### (b) P-46 Workstream 5 Phase-4 director real-Chrome verification

**Status:** DEFERRED a 1st time at director's "Defer to next session (per W4 deploy 2026-05-26 Pattern)" pick on the Phase-4 picker at 2026-05-24-e bundled W5 + P-47 deploy session. Pairs with section (c) below — same extension form surface; director walks both verifications in ONE sitting on the same Amazon product page.

**Pre-flight setup:**

- Open Chrome on Mac.
- Confirm the fresh extension `.crx` is loaded (manually unpack `plos-extension-2026-05-24-w2-deploy-34.zip` from the repo root into `chrome://extensions/` → "Load unpacked" → pick the dist/ directory; OR if a prior extension version is already loaded, replace it via Remove + Load unpacked).
- Open any one competitor platform (Amazon / Ebay / Walmart / Etsy / Aliexpress / Macys / Bestbuy) — pick the platform with the most-frequent existing URL captures for highest-signal verification (Amazon is recommended for consistency with section (c) which is Amazon-specific for Issue 2 verification).
- Sign in to vklf.com if needed.

**Step 1 — Open the extension URL save form on a competitor page.**

Navigate to a product page on the chosen platform (e.g., an Amazon product page). Trigger the extension's URL save flow — likely via the extension popup OR a content-script affordance per the existing URL save form interaction. **Verify:** the URL save form opens cleanly + shows the existing fields (URL / Platform / Brand Name / Sponsored Ad / etc.) **AND** shows the FOUR new fields between Brand Name + Sponsored Ad: **Type** / **Description-1** / **Description-2** / **Price**. The new fields render as textareas (per `makeTextareaField()` helper from W5 Session 1) with appropriate labels + placeholder hints.

**Step 2 — Fill in the four new fields + save.**

Type sensible test values into each new field: e.g., **Type:** "Product" / **Description-1:** "Test description 1" / **Description-2:** "Test description 2" / **Price:** "$29.99". Fill in the other required fields as usual. **Click Save.** **Verify:** the form submits without error + the URL save flow completes successfully (existing UX — likely a toast notification or form-closes-on-success).

**Step 3 — Confirm the row lands on vklf.com with all 4 new fields populated.**

Open vklf.com → navigate to the Project's Competition Data page (`/projects/<projectId>/competition-scraping`). Find the row for the URL you just saved. **Verify:** the row shows the 4 new fields populated with the values you typed in Step 2. The Type / Description-1 / Description-2 / Price columns should all render the test values. If the Type / Description columns are hidden by default, use the ColumnVisibilityBar to show them.

**Step 4 — Optional: test Reviews modal duplicate-Save behavior to confirm idempotency fix works end-to-end.**

Navigate to a URL detail page (`/projects/<projectId>/competition-scraping/url/<urlId>`). Click "Add Review" to open the `CapturedReviewAddModal`. Fill in a test review (1-5 stars + body + optional reviewer name + date). **Click Save TWICE in rapid succession** (or click Save → wait for error → click Save again). **Verify:** ONLY ONE review row lands in the URL's reviews list (the server-side P2002 dedup now correctly recognizes the duplicate clientId since the modal hoisted clientId to a `useState` instead of regenerating on every Save click).

**How to report back:**

For each step (1-4), tell Claude in plain language: PASS / FAIL / PARTIAL. If FAIL or PARTIAL, describe what you saw vs. what was expected. Screenshots or pasted observations are welcome. Claude will collate the report + either close W5 as ✅ DONE-AND-VERIFIED (if all PASS) or initiate a fix-forward cascade (if any FAIL or PARTIAL).

**Cross-platform note:** the URL save form additions are per-extension not per-platform, so cross-platform exception applies (pick any single platform; Amazon recommended for consistency with section (c)). Optionally walk the other platforms at director's discretion.

### (c) P-47 Session 1 Phase-4 director real-Chrome verification

**Status:** DEFERRED a 1st time at director's "Defer to next session (per W4 deploy 2026-05-26 Pattern)" pick on the Phase-4 picker at 2026-05-24-e bundled W5 + P-47 deploy session. Pair with section (b)'s W5 verification — same form surface, same Amazon platform pick.

**Pre-flight setup:** same as section (b) above (the form is the same content-script video-capture form; both W5's textarea fields + P-47's Shadow DOM mount ship in the same form).

**Step 1 — Open the extension URL save form on a competitor page + confirm the form opens cleanly.**

Navigate to a product page on the chosen platform (the same page from section (b) Step 1 is fine). Trigger the extension's URL save flow. **Verify:** the URL save form opens cleanly + the form is visible above the page content (the Shadow DOM mount uses `position:fixed` so the form should appear over the page regardless of scroll position) + all form fields are visible + the form chrome (backdrop overlay + form border + buttons) looks the same as before the refactor (the CSS extraction into `FORM_CHROME_CSS` is a single source of truth — if it looks different, that's a regression).

**Step 2 — Confirm form interaction works cleanly with the Shadow DOM mount + no page-level focus interference.**

Click into each text input + textarea in turn (URL / Platform / Brand Name / Type / Description-1 / Description-2 / Price / Sponsored Ad / etc.). For each: **Type some characters.** **Verify:** the text appears in the input + the input retains focus while typing + clicking outside the input + back into it returns focus cleanly + the page-level scroll position does NOT shift when you click into an input + the page background does NOT steal focus from the form. Specifically test on Amazon (the platform where the original Issue 2 focus-stealing problem surfaced — if Amazon works cleanly with the band-aid removed + Shadow DOM in place, that's the strongest signal the refactor preserved the band-aid's behaviour). **Press Escape:** **Verify:** the form closes cleanly (the Escape-to-close `keydown` listener stays on `document` and keydown events from inside the shadow root compose up through the host into the document tree, so the listener catches them).

**How to report back:**

For each step (1-2), tell Claude in plain language: PASS / FAIL / PARTIAL. If FAIL or PARTIAL, describe what you saw vs. what was expected. Screenshots or pasted observations are welcome. Claude will collate the report + either close P-47 as ✅ DONE-AND-VERIFIED (if both PASS) or initiate a fix-forward cascade (if either FAIL or PARTIAL).

**Cross-platform note:** the original Issue 2 focus-stealing was Amazon-specific; Amazon is the canonical verification target. Optionally walk Ebay / Walmart / Etsy / Aliexpress / Macys / Bestbuy at director's discretion for breadth.

---

## Pre-session notes (offline steps for director between sessions)

**Required offline step BEFORE the next bundled Phase-4 verification session:** sideload the fresh extension zip `plos-extension-2026-05-24-w2-deploy-34.zip` (at the repo root) into Chrome via `chrome://extensions/` → "Load unpacked" → pick the dist/ directory inside the unzipped folder. If a prior extension version is already loaded, replace it via Remove + Load unpacked. Director's involvement is the standard go-ahead after Step 7b plain-terms summary + the 3 Phase-4 walkthroughs themselves (on Amazon recommended; cross-platform breadth optional).

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking the bundled Phase-4 verification session at all — can happen any time. Director-independent.

**Optional offline reading for director:** the P-46 polish-backlog entry in ROADMAP.md (the W4 + W5 sub-status sections + the workstream-status overview) + the P-47 polish-backlog entry in ROADMAP.md (~line 239 — the canonical scope-and-where description with cross-references to P-45 Build #2's Issue 2 fix narrative). ~3-5 minute skim.

**Pre-session setup (informational — Claude will handle in-session):** the bundled Phase-4 verification session begins on `workflow-2-competition-scraping`; director's involvement is the standard go-ahead after Step 7b plain-terms summary + the 3 Phase-4 walkthroughs themselves.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (no rebases, no force pushes, no `git reset --hard`, no `git branch -D`). Pure verification session.

**Rule 9 triggers planned this session: ZERO** unless fix-forward cascade fires (each fix-forward would invoke its own Rule 9 gate per the W3 deploy 2026-05-24 Pattern). If all walkthroughs PASS, zero Rule 9 gates fire.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits an alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any Phase-4 mechanics.

---

## Why this pointer was written this way (debug aid)

Today's session was the **bundled W5 + P-47 deploy session** — pure orchestration deploy of 3 build commits (W5 build `3c981be` + Reviews polish `41172f1` + P-47 Shadow DOM `d08f673`) + 2 doc-batch commits (`4d0f771` W5 doc-batch + `d68885a` P-47 doc-batch) from `workflow-2-competition-scraping` to `main` via ONE ff-merge `9205340..d68885a` behind ONE Rule 9 gate. Vercel auto-redeploy fired; fresh extension zip dropped at repo root. Pre-deploy + post-merge /scoreboard both 5/5 GREEN at unchanged baselines.

At end-of-session, director picked the **defer Phase-4 to next session** option from the §4 Step 1c Phase-4 picker over the Recommended in-session-run option. This is the THIRD time the bundled-Phase-4 defer Pattern fires (W4 2026-05-26 first; W5+P-47 today second; W4 still pending for the 4th consecutive defer is third instance). The Pattern is established and director-preferred when 3+ walkthroughs queue together.

The natural next-session task per (a.88) RECOMMENDED-NEXT is the **bundled Phase-4 real-Chrome verification session** — director walks 3 verification scripts on Amazon (and optionally other platforms) covering everything deployed in recent sessions awaiting Phase-4 sign-off.

- **(Recommended)** Bundled Phase-4 real-Chrome verification session — director walks 3 walkthroughs (W4 10-step + W5 4-step + P-47 2-step) on Amazon; if all PASS, P-46 closes end-to-end + P-47 closes. Recommended because (a) all 3 walkthroughs preserved verbatim in this NEXT_SESSION.md ## Standing carry-overs section — copy + execute without re-derivation; (b) bundled verification minimizes director walkthrough overhead by pairing (b) + (c) on the same Amazon product page; (c) closes the most ✅ DEPLOYED-PHASE-4-PENDING items in one session — high value-density.

The shape of the bundled Phase-4 verification session is **plain-terms summary + pre-build reads + branch state verify + Rule 14f session-start confirmation + Phase-4 walkthroughs (a) + (b) + (c) + collate results + status flips OR fix-forward cascade + end-of-session doc-batch + ping-pong sync + 1 push minimum unless fix-forward cascade**.

**After the bundled Phase-4 verification ships,** if all PASS: P-46 closes end-to-end (W4 + W5 both ✅ DONE-AND-VERIFIED); P-47 closes (✅ DONE-AND-VERIFIED). Next-next session would close (a.88) and open something new — likely P-26 below-fold scroll capture OR P-43 mechanical prevention OR W#2 graduation step OR moving to W#3-W#14.

**Alternate next-session candidates if director shifts priorities at session start:**

- **Defer Phase-4 verification AGAIN for a 5th consecutive defer (for W4 specifically; W5 + P-47 would only be 2nd defers).** NOT recommended unless director is not yet ready for real-world testing — director has explicitly picked this defer Pattern 3 times in a row already. The 3 walkthroughs are preserved verbatim above for copy + execute when director is ready.
- **P-26 below-fold scroll capture (LOW).** NOT recommended this session — Phase-4 verification of the recently-deployed items takes priority over starting new polish work. Can happen any time after Phase-4 verifies.
- **P-43 mechanical prevention candidate.** NOT recommended — LOW informational; not blocking any workstream; can happen any time after Phase-4 verifies.
- **W#2 graduation step.** NOT recommended UNTIL all 3 Phase-4 verifies pass + P-46 + P-47 close. Graduation requires all polish items DONE-AND-VERIFIED.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time. Director-independent.

Check `ROADMAP.md` for the canonical state. Check the P-46 + P-47 polish-backlog entries for the binding scope-and-where descriptions. Check `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-26 (W4 deploy pattern with Phase-4 deferred — same shape that today's session executes the deferred Phase-4 for) + §B 2026-05-24-e (today's bundled W5 + P-47 deploy entry) + `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-24-d (P-47 build) + §B 2026-05-24-e (P-47 deploy) for the canonical context.
