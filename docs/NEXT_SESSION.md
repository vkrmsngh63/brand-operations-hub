# Next session

**Written:** 2026-05-18 — `session_2026-05-18_w2-main-deploy-session-17-p28-p27-DEPLOYED-FULL-VERIFY-plus-P-33-hover-tackon` (Claude Code; dual-branch — pre-deploy scoreboard on `workflow-2-competition-scraping`, ff-merge + deploy phases on `main`, ping-pong sync after main push).

**For:** the next Claude Code session.

**Status of W#2 → main deploy session #17:** ✅ **P-28 + P-27 ALL DEPLOYED to vklf.com + REAL-INDEPENDENT-WEBSITE FULL VERIFY across Parts A-E.** Closes (a.39) RECOMMENDED-NEXT. **Standard W#2 → main deploy cheat-sheet executed cleanly:** pre-deploy scoreboard all GREEN on workflow-2 (tsc / extension tsc / `npm run build` 53 routes / src/lib node:test 527/527 / extension `npm test` 334/334 / Playwright 75/75); rebase no-op (workflow-2 linearly 2 commits ahead of main since deploy #16's ping-pong sync — `a226ea1` P-28+P-27 code + `f58ca8c` doc batch); ff-merge `62d215c..f58ca8c` clean (19 files +1989/-94); post-merge scoreboard re-run on `main` all GREEN; Rule 9 deploy-gate via AskUserQuestion 4-option picker → director picked "Deploy now (Rule 9-approved)"; pushed `origin/main 62d215c..f58ca8c` (Vercel auto-redeployed cleanly ~1-2 min); ping-pong sync no-op since workflow-2 was already at the same SHA as main post-merge. **Director walkthrough on real Independent Website URL — single batched pass across all 5 parts ALL GREEN:** Part A captured-text row trash ✅ (dialog preview + confirm + persisted after reload) / Part B captured-image thumbnail trash ✅ (overlay click + dialog + persisted after reload) / Part C URL detail Delete URL header button with cascade disclosure ✅ (loading state visible briefly + correct N + M counts + navigation back to list + row gone) / Part D URL list row trash with cascade disclosure ✅ (same dialog shape, row vanishes + persisted after reload) / Part E rollback path spot-check via DevTools Offline throttle ✅ (dialog stayed open + inline error surfaced + row re-appeared after optimistic-update rollback). **HEADLINE OUTCOME: the W#2 admin data-management surface (add via extension + manual-add via P-29 + edit via inline-edit + delete via P-28/P-27) is now COMPLETE + LIVE on vklf.com end-to-end.** **One in-session SCOPE-ADD this session (P-33):** director surfaced post-walkthrough natural-use feedback — "When the user puts their mouseover a row in the table in competition workflow, that row should get highlighted in a different color." Rule 11 scope-add forced-picker fired; director picked Ship-as-tack-on (over defer-to-polish-backlog). **First attempt SHIPPED but invisible on production** — `<tr>` background paint hidden by `<td>` cells which the codebase convention applies hover to (mt-tbl / ast-tbl / ctm-table all use `tbody tr:hover td { background: ... }`). **HOT-FIX shipped same session (commit `507f7d6`):** swapped to `querySelectorAll<HTMLTableCellElement>('td')` to set background on each cell + bumped color from `#161b22` → `#21262d` (clearly visible GitHub-dark elevation step). Director re-verified post-hot-fix-deploy: **hover-highlight visible + working on vklf.com.** P-33 entry in COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md flipped ✅ SHIPPED + DEPLOYED + VERIFIED 2026-05-18 in the same session. **§4 Step 1c forced-picker fired** at end-of-session (deploy session wrapped cleanly + W#2 admin data-management surface complete + live; no inherent continuation). Director picked **(a.40) RECOMMENDED-NEXT = W#2 polish — propagate hover-highlight to captured-text rows + image thumbnails (P-34)** — closes the UX consistency gap from today's P-33 tack-on (URL list table got hover-highlight but URL detail page's captured-text rows + image thumbnails did NOT). Small focused session (~30 min code work) using the same `querySelectorAll` pattern + scoreboard + W#2 → main deploy + brief director re-verify.

---

## Branch
workflow-2-competition-scraping (start here; on entry should be in lockstep with `origin/main` after today's ping-pong sync = 0 commits ahead, 0 commits behind; verify with `git log origin/main..workflow-2-competition-scraping --oneline` expecting empty + `git log workflow-2-competition-scraping..origin/main --oneline` expecting empty).

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**W#2 polish — propagate row hover-highlight to captured-text rows + image thumbnails on URL detail page (P-34).** Closes (a.40) RECOMMENDED-NEXT.

Verify branch state with `git branch --show-current` before any doc reads — should be on `workflow-2-competition-scraping` (`./resume` switched you; verify). Start by running the mandatory start-of-session sequence.

**Schema-change-in-flight flag stays "No"** for this entire session (P-34 is purely UI polish — onMouseEnter/onMouseLeave handlers + Tailwind-equivalent inline-style swaps; no schema, no API change, no shared-types change).

**Pre-build read list (in addition to mandatory start-of-session sequence):**

- `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — most-recent "Deploy session #17 + P-33 hover tack-on" section + new P-34 polish entry (top of polish backlog).
- `COMPETITION_SCRAPING_DESIGN.md` §B newest 2026-05-18 entry — covers P-33's `<td>`-vs-`<tr>` paint lesson + the `querySelectorAll` pattern P-34 will reuse.
- `src/app/projects/[projectId]/competition-scraping/components/UrlTable.tsx` — the P-33 reference implementation (lines ~492-515; the canonical pattern to copy).
- `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx` — the target file for P-34; captured-text rows + image thumbnails live here.

**P-34 scope + design pattern (no Rule 14f picker needed — pattern + colors already settled by P-33):**

- **Captured-text rows:** find the `<tr>` rendering pattern for captured-text rows in `UrlDetailContent.tsx`. Add `onMouseEnter` + `onMouseLeave` that `querySelectorAll<HTMLTableCellElement>('td')` and swap each cell's `background` to `#21262d` on hover, empty string on leave. Same exact pattern as `UrlTable.tsx:492-515`.
- **Image thumbnails:** different element shape — thumbnails are not table rows. Use the same hover effect but apply it to the thumbnail container element (likely a `<div>` or `<figure>`). Inline-style background swap is fine since the same color (`#21262d`) and 0-transition behavior applies. Consider whether the trash-overlay's own focus/hover interaction needs a subtle elevation tweak to read cleanly when both row + trash overlay highlight — director can call it at session end.

**Pre-deploy verification scoreboard targets (expected baselines from today's deploy session #17 post-state):**

- `npx tsc --noEmit` clean
- `cd extensions/competition-scraping && npx tsc --noEmit` clean
- `npm run build` clean — **53 routes** (unchanged; no new routes)
- `src/lib` node:test: **527/527 pass** (unchanged; no new lib code)
- Extension `npm test`: **334/334** unchanged
- Playwright: **75/75 pass** (unchanged; pure-event-handler change has no test coverage)

**Deploy mechanics (cheat-sheet b applied):**

1. Pre-deploy scoreboard on `workflow-2-competition-scraping` (all 6 checks above; abbreviated tsc + build sufficient since change is pure DOM event-handler swap — full Playwright optional but recommended for thoroughness).
2. `git fetch origin main && git rebase origin/main` — expected no-op (workflow-2 0 commits ahead post-deploy-#17's ping-pong sync; will be 1 commit ahead after the P-34 + doc-batch commits).
3. `git checkout main && git pull --rebase origin main` — expected no-op.
4. `git merge --ff-only workflow-2-competition-scraping` — should fast-forward cleanly.
5. Post-merge scoreboard on `main` (re-run the 6 checks).
6. **Rule 9 deploy gate via AskUserQuestion** with the standard 4-option picker (Deploy now / Hold / Hold + reason / Question first). Recommend "Deploy now (Rule 9-approved)."
7. `git push origin main` → Vercel auto-redeploys (~1-2 min).
8. Ping-pong sync: `git checkout workflow-2-competition-scraping && git merge --ff-only main && git push origin workflow-2-competition-scraping` (same approval scope per `feedback_approval_scope_per_decision_unit.md`).

**Director re-verify on vklf.com (brief — 1 part, no destructive ops needed):**

1. Navigate to Independent Website project → Competition Scraping workflow → click into any URL detail page that has ≥1 captured text + ≥1 captured image.
2. Hover over a captured-text row → should highlight to `#21262d` smoothly.
3. Hover over a captured-image thumbnail → should highlight (whole-thumbnail or thumbnail-container).
4. Confirm trash icon + dialog flows from P-27 still work cleanly with hover-highlight applied (no flicker / no broken click).

**Per Rule 23 Change Impact Audit (pre-classify before code):** ADDITIVE — pure DOM event handlers on existing markup; no schema change; no API change; no shared-types change.

**Group A docs to update at end-of-session:** ROADMAP (W#2 row Last Session + (a.40) → flip ✅ DONE + new (a.41) RECOMMENDED-NEXT pick); CHAT_REGISTRY (new top entry); DOCUMENT_MANIFEST (per-doc flag timestamps); CORRECTIONS_LOG (header bump + any new entries); NEXT_SESSION (rewritten for the next pick — likely older W#2 polish P-13 / P-19 / P-21 OR pivot to platform-wide work OR W#1 re-entry OR new workflow start; settle via §4 Step 1c forced-picker if no obvious continuation).

**Group B docs to update at end-of-session:** COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md (P-34 entry flipped ✅ SHIPPED + DEPLOYED in same session + new "Deploy session #18 — P-34 hover-propagation" section); COMPETITION_SCRAPING_DESIGN.md (new §B entry covering the propagation outcome).

## Pre-session notes (optional, offline steps to do between sessions)

None. P-34 is an all-Claude-Code session — no offline preparation needed. Director's role during this session: pick "Deploy now" via Rule 9 AskUserQuestion gate; run the brief hover walkthrough on the URL detail page after Vercel reports green; pick the next session's task via §4 Step 1c interview at end (W#2 admin data-management surface stays complete + live; remaining W#2 polish backlog is P-13 / P-19 / P-21 plus whatever else surfaces; or pivot to platform/W#1/new workflow).

## Why this pointer was written this way (debug aid)

Today's W#2 → main deploy session #17 brought P-28 + P-27 to vklf.com cleanly + director walkthrough verified all four delete surfaces + rollback path on real production data. The hover-highlight tack-on (P-33) shipped + had a paint-bug hot-fix + verified mid-session. Director picked P-34 (hover propagation to text rows + image thumbnails) as next session — small focused continuation that closes the UX consistency gap from P-33 while the codebase + pattern are fresh in memory. Next-next session likely pivots off W#2 polish (P-13 / P-19 / P-21 / platform-wide / W#1 / new workflow) — settle via §4 Step 1c forced-picker at end of P-34 session.

**Alternate next-session candidates if director shifts priorities at session start:**

- Pre-existing W#2 polish backlog: P-13 (LOW autofocus) / P-19 (LOW-MEDIUM overlay-dismiss) / P-21 (MEDIUM defensive symmetric-canonicalize).
- Pivot to platform-wide on `main`: (a.13) P-17 authFetch real-fetch integration test.
- W#1 graduated-tool re-entry per Rule 22.
- New workflow #3-#14 first session per Rule 18 Workflow Requirements Interview.

Check `ROADMAP.md` W#2 row for the canonical state.

**After P-34 ships:** W#2's admin data-management surface (add + edit + delete) stays complete + live on vklf.com with hover-highlight consistency across URL list + captured-text rows + image thumbnails. W#2's remaining polish backlog reduces to older items P-21 / P-19 / P-13.
