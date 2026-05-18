# Next session

**Written:** 2026-05-18-b — `session_2026-05-18-b_w2-main-deploy-session-18-p34-hover-propagation-DEPLOYED-FULL-VERIFY` (Claude Code; dual-branch — pre-deploy scoreboard on `workflow-2-competition-scraping`, ff-merge + deploy phases on `main`, ping-pong sync after main push).

**For:** the next Claude Code session.

**Status of W#2 → main deploy session #18:** ✅ **P-34 ALL DEPLOYED to vklf.com + REAL-INDEPENDENT-WEBSITE VERIFY.** Closes (a.40) RECOMMENDED-NEXT. **Standard W#2 → main deploy cheat-sheet (b) executed cleanly:** pre-deploy scoreboard all GREEN on workflow-2 (tsc / extension tsc / `npm run build` 53 routes / src/lib node:test 527/527 / extension `npm test` 334/334 / Playwright 75/75); rebase no-op (workflow-2 0 commits ahead of main pre-this-commit per deploy #17 ping-pong); ff-merge `d551443..b5cf7ea` clean (1 file +33/-2); post-merge scoreboard re-run on `main` all GREEN (full Playwright 75/75 re-run on main for thoroughness); Rule 9 deploy-gate via AskUserQuestion 4-option picker → director picked "Deploy now (Rule 9-approved)"; pushed `origin/main d551443..b5cf7ea` (Vercel auto-redeployed cleanly ~1-2 min); ping-pong sync no-op (workflow-2 already at same SHA as main post-merge). **Director re-verify on real Independent Website URL detail page:** captured-text row hover-highlight ✅ + captured-image thumbnail hover-highlight ✅ — *"all green, hover works on both"*. **HEADLINE OUTCOME: the W#2 admin data-management surface (add via extension + manual-add via P-29 + edit via inline-edit + delete via P-28/P-27 + hover-consistency via P-33+P-34) is now COMPLETE + LIVE on vklf.com with UX consistency across URL list + captured-text rows + image thumbnails.** Smooth session — zero CORRECTIONS_LOG-tier slips on Claude's side. **§4 Step 1c forced-picker fired** at end-of-session (deploy session #18 wrapped cleanly + W#2 admin data-management surface complete + hover-consistent; no inherent continuation from this session). Director picked **(a.41) RECOMMENDED-NEXT = W#2 polish P-21** — symmetric-canonicalize `pickInitialUrl` + `buildRecognitionSet` (MEDIUM defensive; closes the slug-variant asymmetry that previously caused the P-15 Amazon FAIL in deploy session #9). Rationale per `feedback_recommendation_style.md` (most thorough/reliable): closes a known asymmetry with actual test coverage (~4 new node:test cases) rather than a smaller UX-only polish; defensive against future user-pasted slug-variant URLs at the URL-add form.

---

## Branch
workflow-2-competition-scraping (start here; on entry should be in lockstep with `origin/main` after today's ping-pong sync = 0 commits ahead, 0 commits behind; verify with `git log origin/main..workflow-2-competition-scraping --oneline` expecting empty + `git log workflow-2-competition-scraping..origin/main --oneline` expecting empty).

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**W#2 polish P-21 — symmetric-canonicalize `pickInitialUrl` + `buildRecognitionSet` to close the slug-variant asymmetry that caused the P-15 Amazon FAIL.** Closes (a.41) RECOMMENDED-NEXT.

Verify branch state with `git branch --show-current` before any doc reads — should be on `workflow-2-competition-scraping` (`./resume` switched you; verify). Start by running the mandatory start-of-session sequence.

**Schema-change-in-flight flag stays "No"** for this entire session (P-21 is pure-function library work — ~2 LOC fix + new node:test cases; no schema, no API change, no shared-types change).

**Pre-build read list (in addition to mandatory start-of-session sequence):**

- `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — find the P-21 polish-backlog entry (NEW 2026-05-12-g; captured during deploy session #9's Amazon FAIL root-cause analysis) for the canonical scope + root-cause framing.
- `COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-12-g entry — covers the original P-15 Amazon FAIL surfacing + asymmetry between left-side (canonicalized) and right-side (raw) of the URL comparison.
- `src/lib/captured-text-validation.ts` (around line 128) — `pickInitialUrl` definition; the LEFT side (page URL) gets canonicalized via `platformModule.canonicalProductUrl(...)` but the RIGHT side (saved row URL) does not.
- `src/lib/url-normalization.ts` (around line 63) — `buildRecognitionSet`; same asymmetry as `pickInitialUrl` for the orchestrator's "already saved" banner check.
- `src/lib/platform-modules/amazon.ts` — `canonicalProductUrl` implementation that the symmetric canonicalization should reuse.

**P-21 scope + design pattern (defensive symmetric-canonicalize):**

- Both `pickInitialUrl` (`captured-text-validation.ts:128`) and `buildRecognitionSet` (`url-normalization.ts:63`) canonicalize ONE side of the URL comparison but NOT the other. Fix: canonicalize both sides via the existing `platformModule.canonicalProductUrl(...)` helper before comparing / building the Set.
- Estimated ~2 LOC change in each function (4 LOC total) + ~4 new node:test cases per function (8 total) covering slug-variant `/Product-Name/dp/{ASIN}/ref=...`, `gp/product/{ASIN}`, trailing-slash, and query-string variants.
- Per Rule 23 Change Impact Audit (pre-classify before code): ADDITIVE — adds canonicalization to one side of an existing comparison; behavior for already-canonical inputs is unchanged (canonical → canonical is idempotent). Tests confirm idempotency + new positive cases. No schema, no API change, no shared-types change.

**Pre-deploy verification scoreboard targets (expected baselines from today's deploy session #18 post-state):**

- `npx tsc --noEmit` clean
- `cd extensions/competition-scraping && npx tsc --noEmit` clean
- `npm run build` clean — **53 routes** (unchanged; no new routes)
- `src/lib` node:test: **~531-535 pass** (was 527; **+4-8 new P-21 cases**)
- Extension `npm test`: **334/334** unchanged
- Playwright: **75/75 pass** (unchanged; pure-function lib change has no Playwright coverage)

**Deploy mechanics (cheat-sheet b applied):**

1. Pre-deploy scoreboard on `workflow-2-competition-scraping` (all 6 checks above).
2. `git fetch origin main && git rebase origin/main` — expected no-op (workflow-2 0 commits ahead post-deploy-#18's ping-pong sync; will be 1 commit ahead after the P-21 + doc-batch commits).
3. `git checkout main && git pull --rebase origin main` — expected no-op.
4. `git merge --ff-only workflow-2-competition-scraping` — should fast-forward cleanly.
5. Post-merge scoreboard on `main` (re-run the 6 checks).
6. **Rule 9 deploy gate via AskUserQuestion** with the standard 4-option picker (Deploy now / Hold / Hold + reason / Question first). Recommend "Deploy now (Rule 9-approved)."
7. `git push origin main` → Vercel auto-redeploys (~1-2 min).
8. Ping-pong sync: `git checkout workflow-2-competition-scraping && git merge --ff-only main && git push origin workflow-2-competition-scraping` (same approval scope per `feedback_approval_scope_per_decision_unit.md`).

**Director re-verify on vklf.com (brief — defensive fix, hard to surface in a happy-path walkthrough):**

P-21 is a defensive fix that previously surfaced only on Amazon slug-variant URLs in deploy session #9. The most credible re-verify path is automated (the new node:test cases) — director-side verification is OPTIONAL and would involve manually constructing a slug-variant Amazon URL, saving it via the extension, then trying to canonicalize via the URL-add form. Per Rule 27, this is a candidate for Playwright forced-picker at session start (the test cases + maybe a small Playwright spec covering the URL-add form's recognition behavior is more valuable than a director walkthrough).

**Per Rule 23 Change Impact Audit (pre-classify before code):** ADDITIVE — adds canonicalization to one side of an existing comparison; idempotent for already-canonical inputs; no schema change; no API change; no shared-types change.

**Group A docs to update at end-of-session:** ROADMAP (W#2 row Last Session 2026-05-18-c + (a.41) → flip ✅ DONE + new (a.42) RECOMMENDED-NEXT pick); CHAT_REGISTRY (new top entry); DOCUMENT_MANIFEST (per-doc flag timestamps); CORRECTIONS_LOG (header bump + any new entries); NEXT_SESSION (rewritten for the next pick — likely older W#2 polish P-13 / P-19 OR pivot to platform-wide work OR W#1 re-entry OR new workflow start; settle via §4 Step 1c forced-picker if no obvious continuation).

**Group B docs to update at end-of-session:** COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md (P-21 entry flipped ✅ SHIPPED + DEPLOYED in same session + new "Deploy session #19 — P-21 symmetric-canonicalize" section); COMPETITION_SCRAPING_DESIGN.md (new §B entry covering the symmetric-canonicalize outcome).

## Pre-session notes (optional, offline steps to do between sessions)

None. P-21 is an all-Claude-Code session — no offline preparation needed. Director's role during this session: pick "Deploy now" via Rule 9 AskUserQuestion gate; optionally walk through a slug-variant Amazon URL re-test on the live site after Vercel reports green; pick the next session's task via §4 Step 1c interview at end.

## Why this pointer was written this way (debug aid)

Today's W#2 → main deploy session #18 brought P-34 (hover-highlight propagation to captured-text rows + image thumbnails) to vklf.com cleanly + director re-verified both surfaces. The W#2 admin data-management surface is now complete + UX-consistent end-to-end. Director picked P-21 (defensive symmetric-canonicalize) via §4 Step 1c forced-picker as the most thorough/reliable next W#2 polish item — closes a known asymmetry that previously caused P-15 Amazon FAIL, with actual node:test coverage. Next-next session likely pivots off W#2 polish (P-19 / P-13 / platform-wide / W#1 / new workflow) — settle via §4 Step 1c forced-picker at end of P-21 session.

**Alternate next-session candidates if director shifts priorities at session start:**

- Pre-existing W#2 polish backlog: P-19 (LOW-MEDIUM overlay-dismiss) / P-13 (LOW autofocus).
- Pivot to platform-wide on `main`: (a.13) P-17 authFetch real-fetch integration test.
- W#1 graduated-tool re-entry per Rule 22.
- New workflow #3-#14 first session per Rule 18 Workflow Requirements Interview.

Check `ROADMAP.md` W#2 row for the canonical state.

**After P-21 ships:** W#2's admin data-management surface stays complete + live on vklf.com with hover-highlight consistency + symmetric URL canonicalization. W#2's remaining polish backlog reduces to older items P-19 / P-13.
