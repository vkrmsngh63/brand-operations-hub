# Next session

**Written:** 2026-05-17 — session_2026-05-17_w2-p28-p27-paired-build (Claude Code, on `workflow-2-competition-scraping`).

**For:** the next Claude Code session.

**Status of W#2 P-28 + P-27 paired build session:** ✅ **P-28 + P-27 SHIPPED at code level on `workflow-2-competition-scraping`** in two commits (code + doc batch). Closes (a.38) RECOMMENDED-NEXT. **Load-bearing finding surfaced + accepted at start-of-session per Rule 3 (code wins over doc):** the NEXT_SESSION.md + P-27 polish-backlog framing both claimed the back-end DELETE handlers for captured-text + captured-image didn't exist. **Code verification showed all three DELETE handlers ALREADY EXIST** — URL DELETE at `urls/[urlId]/route.ts:273` (cascades to children via Prisma `onDelete: Cascade`, idempotent); captured-text DELETE at `text/[textId]/route.ts:171` (idempotent, ownership-scoped via `competitorUrl: { projectWorkflowId }` relation filter); captured-image DELETE at `images/[imageId]/route.ts:209` (DB row + best-effort Supabase storage cleanup + janitor cron for orphans). This collapsed Q1-Q4 of the originally-planned 5-question forced-picker set (the answers were already encoded in the existing code). **Two genuinely-open forced-pickers fired** via AskUserQuestion: Q5 confirm-dialog component placement → director picked **shared `ConfirmDeleteDialog.tsx` with plain + cascade variants**; Q6 cascade-count mechanism → director picked **new `GET cascade-counts` lazy-fetch endpoint**. Q3 audit-trail event granularity stayed at the existing coarse `markWorkflowActive()` shape (no scope-add). **Code shipped (~9 files this session):** NEW `src/lib/competition-scraping/handlers/cascade-counts.ts` (DI factory + handler returning `{ texts, images }`); NEW `src/lib/competition-scraping/handlers/cascade-counts.test.ts` (**18 node:test cases** — 401 / 404 / 200 happy paths / 500 flake paths / withRetry passthrough / project-scope isolation); NEW `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/cascade-counts/route.ts` (thin route shim); NEW `src/app/projects/[projectId]/competition-scraping/components/ConfirmDeleteDialog.tsx` (~280 LOC — plain + cascade variants; loading/ready/error disclosure shapes; submit-in-flight lock; Escape/X/Cancel/backdrop dismiss; error-on-throw inline surface); modified `UrlTable.tsx` (trash button per row + new "actions" column + cascade-count lazy fetch on dialog open + optimistic-remove with rollback); modified `CompetitionScrapingViewer.tsx` (new `handleUrlDeleted` callback); modified `UrlDetailContent.tsx` (Delete URL header button + cascade-count lazy fetch + trash button per captured-text row + trash overlay per captured-image thumbnail + 3 dialog mounts at section/page level + 3 delete handlers with optimistic-remove + rollback); NEW `tests/playwright/mounts/p28-confirm-delete-dialog.mount.tsx` + `pages/p28-confirm-delete-dialog.html` + extended `build-bundle.mjs` + `test-server.mjs`; NEW `tests/playwright/p28-confirm-delete-dialog.spec.ts` (**11 UI-mechanical regression cases** — plain variant / cascade loading / cascade ready / singular vs plural / 0/0 softer phrasing / cascade error / confirm success / confirm-throw inline error / dismiss paths / submit-in-flight lock / reopen resets error state). **Verification scoreboard — all GREEN:** `npx tsc --noEmit` clean; `cd extensions/competition-scraping && npx tsc --noEmit` clean; `npm run build` clean (**53 routes — +1 cascade-counts**); src/lib node:test **527/527** (was 509; **+18 cascade-counts tests** — slightly below NEXT_SESSION.md's 530-540 target because existing per-row text/image DELETE handlers aren't DI-refactored, so additional node:test coverage there would have required a P-31-style refactor out of scope); extension `npm test` **334/334** unchanged; full Playwright suite **75/75** (was 64; **+11 P-28 dialog cases**, upper end of NEXT_SESSION.md's 70-75 target). **Director walkthrough on real Independent Website URL DEFERRED** to W#2 → main deploy session #17 — workflow branch isn't live on vklf.com; walkthrough exercises all four delete surfaces post-deploy. **The W#2 admin data-management surface is now complete at code level on workflow-2 branch** (add via extension + manual-add via P-29 + edit via inline-edit + **delete via P-28/P-27**) pending deploy.

**One INFORMATIONAL CORRECTIONS_LOG entry this session:** doc-vs-code drift caught at start-of-session — NEXT_SESSION.md's pre-build read list + COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md's P-27 section both wrongly framed the per-row text + image DELETE handlers as missing back-end work. Verified against code at session start before any design pickers fired; surfaced to director with full diff against doc claims; reframed scope to UI-only build + new cascade-counts endpoint. No production impact (the framing was stale, not wrong about underlying functionality — the per-row handlers shipped during the original session-1 API-routes work). Pattern lesson: when a polish-backlog entry's framing says "needs NEW back-end" for routes that lived under W#2 since session-1, run a directory check (`ls .../text` + `ls .../images`) BEFORE trusting the framing. Rule 3 (code wins over doc) applied cleanly + Rule 24 sub-step d ("verify against actual code") protected the design pickers from operating on false premises.

**The recommended next pick:** **W#2 → main deploy session #17 for P-28 + P-27** — bring both delete features to vklf.com in one combined deploy. Standard W#2 → main deploy cheat-sheet (b) applies: rebase workflow-2 onto origin/main (expected no-op since today's session started in lockstep + only this session's commits live on workflow-2); ff-merge to main; Rule 9 deploy gate via AskUserQuestion; push origin/main; Vercel auto-redeploys; ping-pong sync origin/workflow-2; director walkthrough on real Independent Website URL across all four delete surfaces (URL list trash with cascade disclosure + URL detail Delete button with cascade disclosure + captured-text row trash + captured-image thumbnail trash). Rationale per `feedback_recommendation_style.md`: most thorough/reliable next pick — closes the deferred director walkthrough debt while the code is fresh; the P-28/P-27 design has full regression coverage (18 node:test cascade-counts + 11 Playwright dialog) so the deploy is low-risk; brings the W#2 admin data-management surface complete + live on vklf.com.

---

## Branch
workflow-2-competition-scraping (start here; on entry should be 2 commits ahead of `origin/main` = today's P-28/P-27 code commit + this end-of-session doc-batch commit; verify with `git log origin/main..workflow-2-competition-scraping --oneline` expecting 2 commits + `git log workflow-2-competition-scraping..origin/main --oneline` expecting empty).

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**W#2 → main deploy session #17 — bring P-28 (delete URLs with cascade disclosure) + P-27 (delete captured texts/images) to vklf.com.** Standard W#2 → main deploy cheat-sheet (b) applies. Closes (a.39) RECOMMENDED-NEXT.

Verify branch state with `git branch --show-current` before any doc reads — should be on `workflow-2-competition-scraping` (`./resume` switched you; verify). Start by running the mandatory start-of-session sequence.

**Schema-change-in-flight flag stays "No"** for this entire session (P-28 + P-27 didn't add any columns — both built on existing DELETE handlers + a new read-only cascade-counts endpoint).

**Pre-deploy read list (in addition to mandatory start-of-session sequence):**

- `docs/MULTI_WORKFLOW_PROTOCOL.md` §10 — W#2 → main deploy cheat-sheet (b).
- `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — most-recent "P-28 + P-27 SHIPPED at code level" section + P-27 + P-28 polish entries (now flipped ✅ SHIPPED-AT-CODE-LEVEL).
- `COMPETITION_SCRAPING_DESIGN.md` §B newest 2026-05-17 entry — covers the doc-vs-code drift + Q5/Q6 picks + the four delete-surface UI design.

**Pre-deploy verification scoreboard targets (expected baselines from this session):**

- `npx tsc --noEmit` clean
- `cd extensions/competition-scraping && npx tsc --noEmit` clean
- `npm run build` clean — **53 routes** (52 baseline + new cascade-counts)
- `src/lib` node:test: **527/527 pass** (509 + 18 new cascade-counts)
- Extension `npm test`: **334/334** unchanged
- Playwright: **75/75 pass** (64 + 11 new P-28 dialog cases)

**Deploy mechanics (cheat-sheet b applied):**

1. Pre-deploy scoreboard on `workflow-2-competition-scraping` (all 6 checks above).
2. `git fetch origin main && git rebase origin/main` — expected no-op (workflow-2 linearly 2 commits ahead since today's session started in lockstep with main).
3. `git checkout main && git pull --rebase origin main` — expected no-op.
4. `git merge --ff-only workflow-2-competition-scraping` — should fast-forward cleanly.
5. Post-merge scoreboard on `main` (re-run all 6).
6. **Rule 9 deploy gate via AskUserQuestion** with the standard 4-option picker (Deploy now / Hold / Hold + reason / Question first). Recommend "Deploy now (Rule 9-approved)."
7. `git push origin main` → Vercel auto-redeploys (~1-2 min).
8. Ping-pong sync: `git checkout workflow-2-competition-scraping && git merge --ff-only main && git push origin workflow-2-competition-scraping` (same approval scope per `feedback_approval_scope_per_decision_unit.md`).

**Director walkthrough on real Independent Website URL — single batched pass across the four delete surfaces:**

- **Part A — Captured-text row trash:** navigate to a URL detail page with ≥1 captured text → click the trash icon on a text row → dialog shows "Delete this captured text row? [preview] — this cannot be undone." → confirm → row disappears → reload page → row stays gone.
- **Part B — Captured-image thumbnail trash:** same URL detail page with ≥1 captured image → hover/focus the thumbnail → click the small trash overlay (top-right of thumbnail) → dialog shows "Delete this captured image? [imageCategory or 'This image'] — this cannot be undone." → confirm → image disappears + Supabase storage row cleaned up best-effort → reload page → image stays gone.
- **Part C — URL detail Delete URL header button:** URL detail page → click "Delete URL" button in metadata card header → cascade-disclosure dialog opens → "Loading cascade counts…" briefly → resolves to "This will also delete N captured texts and M captured images." → confirm → navigate back to workflow main page → URL row gone from list.
- **Part D — URL list row trash with cascade disclosure:** workflow main page `/projects/[projectId]/competition-scraping` → trash icon in the right-most "actions" column of the URL list → cascade-disclosure dialog opens with brief loading → resolves to count line → confirm → row vanishes from list → reload page → row stays gone.
- **Part E (spot-check):** verify rollback path — open a delete dialog for a row → DevTools Network → throttle to "Offline" → confirm → dialog should show inline error + dialog stays open + row should re-appear in the list (optimistic-update rollback).

**Per Rule 23 Change Impact Audit (already classified at session start, deploy session inherits):** ADDITIVE — new cascade-counts endpoint adds a route; new ConfirmDeleteDialog component is purely client-side; trash buttons added to existing UI components don't change consumer-visible API; no schema change; no shared-types change.

**Group A docs to update at end-of-deploy-session:** ROADMAP (W#2 row Last Session + (a.38) → flip "✅ SHIPPED-AT-CODE-LEVEL" → "✅ DONE" + new (a.39) RECOMMENDED-NEXT pick); CHAT_REGISTRY (new top entry); DOCUMENT_MANIFEST (per-doc flag timestamps); CORRECTIONS_LOG (header bump + any new entries); NEXT_SESSION (rewritten for the next pick — likely older W#2 polish P-13 / P-19 / P-21 or platform-wide work or new workflow #3-#14 start; settle via §4 Step 1c forced-picker if no obvious continuation).

**Group B docs to update at end-of-deploy-session:** COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md (P-27 + P-28 entries flipped ✅ SHIPPED-AT-CODE-LEVEL → ✅ DEPLOYED 2026-05-{??} + new "Deploy session #17 — P-28 + P-27 DEPLOYED + FULL VERIFY" section); COMPETITION_SCRAPING_DESIGN.md (new §B entry covering the deploy outcome + director walkthrough verification).

## Pre-session notes (optional, offline steps to do between sessions)

None. P-28 + P-27 deploy is an all-Claude-Code session — no offline preparation needed. Director's role during this session: pick "Deploy now" via Rule 9 AskUserQuestion gate; run the 4-part walkthrough on a real Independent Website URL after Vercel reports green; pick the next session via §4 Step 1c interview if the deploy wraps cleanly with no obvious continuation.

## Why this pointer was written this way (debug aid)

W#2 P-28 + P-27 paired build session completed cleanly with the four-surface UI shipped + 29 new automated regression cases (18 node:test + 11 Playwright). The next-session pointer is W#2 → main deploy session #17 per the launch-prompt-named "walkthrough DEFERRED to next deploy" pattern — workflow-2 branch isn't live on vklf.com so the director walkthrough requires the deploy to bring the code to production. The W#2 admin data-management surface (add + edit + delete) is now complete at code level; deploy session #17 brings the delete half to production for the first director walkthrough verification.

**Alternate next-session candidates if director shifts priorities at session start:**

- Pre-existing W#2 polish backlog: P-13 (LOW autofocus) / P-19 (LOW-MEDIUM overlay-dismiss) / P-21 (MEDIUM defensive symmetric-canonicalize).
- Pivot to platform-wide on `main`: (a.13) P-17 authFetch real-fetch integration test.
- W#1 graduated-tool re-entry per Rule 22.
- New workflow #3-#14 first session per Rule 18 Workflow Requirements Interview.

Check `ROADMAP.md` W#2 row for the canonical state.

**After deploy #17 ships:** the W#2 admin data-management surface (add via extension + manual-add via P-29 + edit via inline-edit + delete via P-28/P-27) is COMPLETE and live on vklf.com. W#2's remaining polish backlog reduces to older items P-21 / P-19 / P-13 plus whatever new polish surfaces from natural use post-delete-feature.
