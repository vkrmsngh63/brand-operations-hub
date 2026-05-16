# Next session

**Written:** 2026-05-16 — session_2026-05-16_w2-main-deploy-session-16-p30-p31-p32-DEPLOYED-FULL-VERIFY (Claude Code, dual-branch — main for deploy + workflow-2 ping-pong synced).

**For:** the next Claude Code session.

**Status of W#2 → main deploy session #16:** ✅ **P-30 + P-31 + P-32 ALL DEPLOYED to vklf.com + REAL-INDEPENDENT-WEBSITE FULL VERIFY across P-32 multi-file-drop case + 4 P-29 area spot-checks (URL add + text add + image drag + image fetch-by-URL).** Standard W#2 → main deploy cheat-sheet executed cleanly: pre-deploy scoreboard all GREEN on `workflow-2-competition-scraping` (tsc / extension tsc / `npm run build` 52 routes / src/lib node:test 509/509 / extension `npm test` 334/334 / Playwright 64/64); rebase no-op (workflow-2 linearly 4 commits ahead of main since deploy #15's ping-pong sync); ff-merge `3443971..f18e146` clean (4 commits — P-30 code + P-30 doc batch + P-31/P-32 code + P-31/P-32 doc batch; 32 files +4704/-1711 — 10 production source + 22 doc/test/infra); post-merge scoreboard re-run on `main` all GREEN; Rule 9 deploy-gate via AskUserQuestion picker → director picked Yes; pushed `origin/main 3443971..f18e146`; Vercel auto-redeployed cleanly in ~1-2 min; pushed `origin/workflow-2-competition-scraping a1b99d2..f18e146` (ping-pong sync). Director walkthrough on real Independent Website URL: P-32 multi-file-drop warning ✅ ("2 files dropped — only the first will be used" visible + first file previewed) + P-29 area spot-checks ✅ (all 4 saved cleanly; zero regression from P-31's DI refactor). **The P-29 area is now fully shipped + live on vklf.com with end-to-end automated regression coverage across both UI mechanical (P-30 Playwright) AND API route-handler integration (P-31 node:test 62 cases) layers + real-website director walkthrough verification.** Closes (a.37) RECOMMENDED-NEXT.

**One INFORMATIONAL CORRECTIONS_LOG entry this session:** cwd-leak Bash slip recurred TWICE this session (pre-deploy scoreboard + post-merge scoreboard) — when a parallel Bash batch contains ANY `cd <subdir>` command, the working directory leaks to subsequent commands in the same batch. Both instances caught immediately on inspecting test counts (334 instead of 509) and recovered with explicit `cd /workspaces/brand-operations-hub &&` prefix. Recurrence of the 2026-05-12-c / 2026-05-15-d slip class. Pattern strengthening: when running parallel Bash calls, EVERY command must explicitly prefix with the desired absolute cwd if ANY command in the batch uses `cd`. Net cost: ~30 seconds (one re-run); zero production impact.

**The recommended next pick:** **W#2 P-28 + P-27 paired build session on `workflow-2-competition-scraping`.** Build BOTH delete features in one session — **P-28** (delete saved URLs from a project on vklf.com, with cascade disclosure dialog showing "this will also delete N captured texts and M captured images") + **P-27** (delete individual captured texts and images from a URL detail page). Closes (a.38) RECOMMENDED-NEXT. Director picked this via §4 Step 1c forced-picker over alternatives (single-item W#2 polish / pivot to non-W#2 work). Rationale per `feedback_recommendation_style.md` (most thorough and reliable): their design questions overlap heavily (soft-vs-hard delete / cascade behavior / audit-trail granularity / permission model) so deciding them in one session keeps the choices consistent; the P-29 area is fresh in memory and has full regression coverage (P-30 + P-31 will catch any regression); fills the admin's data-hygiene gap in the area we just deployed.

---

## Branch
workflow-2-competition-scraping (start here; on entry should be in lockstep with `origin/main` = `f18e146` — both branches at same commit post-deploy #16's ping-pong sync; verify with `git log origin/main..workflow-2-competition-scraping --oneline` expecting empty + `git log workflow-2-competition-scraping..origin/main --oneline` expecting empty).

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**W#2 P-28 + P-27 paired build session — delete URLs (with cascade) + delete captured texts/images on vklf.com.** Build BOTH polish items in one session because their design questions overlap. Closes (a.38) RECOMMENDED-NEXT.

Verify branch state with `git branch --show-current` before any doc reads — should be on `workflow-2-competition-scraping` (`./resume` switched you; verify). Start by running the mandatory start-of-session sequence.

**Schema-change-in-flight flag flips "No" → "Yes" at session start** if the design pickers settle on soft-delete (adds `deletedAt DateTime?` columns to `CompetitorUrl` + `CapturedText` + `CapturedImage`) — Slice #1's `source` migration pattern applies. Flag flips back to "No" at end-of-session per Rule 25 standard practice.

**Pre-build read list (in addition to mandatory start-of-session sequence):**

- `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — P-27 section (line ~1748) + P-28 section (line ~1786). The "Open design questions" sub-sections enumerate the forced-picker candidates.
- `COMPETITION_SCRAPING_DESIGN.md` line 487 (P-28 lineage) + line 506 (P-27 lineage). Both were captured in W#2 Workflow Requirements Interview as original director intent; only partial implementations shipped.
- `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/route.ts:272` — verify the existing DELETE handler exists + check whether it already cascades (deletes child captured texts + images) or orphans them. **This is the load-bearing first read** — determines whether P-28's back-end work is "wire up cascade" or "just add disclosure dialog UI" or "fix orphan cleanup."
- `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/text/route.ts` + `images/route.ts` — confirm current DELETE handlers status (P-27 expects NEW handlers; verify).
- `src/lib/competition-scraping/handlers/{urls,url-text,images-finalize,images-fetch-by-url}.ts` — P-31's DI factories. Any new DELETE handlers should mirror this shape for consistency + automated test coverage.

**Per Rule 23 Change Impact Audit before any code:** Classification depends on design choices:
- **Soft-delete with `deletedAt` columns:** Compatible-modifying (caution) — adds nullable column to existing tables; existing reads must filter `where: { deletedAt: null }` (audit needed across all read paths in 6+ files); downstream Chrome extension reads need to be confirmed unaffected (they use POST/GET against routes that should filter; verify in build session).
- **Hard-delete cascade:** Additive (safe) for the new DELETE endpoints on text + images; Compatible-modifying for the URL DELETE if cascade behavior changes from "no-op on children" → "deletes children." No schema change.
- Either way, no shared-types changes if no schema columns added; if soft-delete picked, shared-types DTOs get `deletedAt?: string | null` field (echo-only — Phase 1 PLOS-side UI doesn't surface deleted rows).

**Forced-picker shape (Rule 14f) at session start — design questions to settle BEFORE any code:**

1. **Q1 — Soft-delete vs. hard-delete** (load-bearing; gates the other questions):
   - Option A — **Hard-delete with cascade** (DELETE removes row + child captured texts + child captured images; gone forever; no undo; simplest implementation; matches existing URL DELETE route handler at `urls/[urlId]/route.ts:272`)
   - Option B — **Soft-delete with `deletedAt` columns** *(recommended per `feedback_recommendation_style.md` — most thorough and reliable; preserves audit trail; reversible; matches W#1's `RemovedKeyword` convention per `DATA_CATALOG.md` line 273; lets admins restore "I deleted that wrong row" without DB intervention; downside: every read path needs `where: { deletedAt: null }` filter audit)*
   - Option C — **Hybrid** (hard-delete for now; add soft-delete in Phase 2 when audit trail becomes critical for multi-worker)
   - Option D — I have a question first that I need clarified

2. **Q2 — Image storage object cleanup** (only fires if Q1 = hard-delete OR if soft-delete includes "permanently purge after 30 days" cleanup):
   - Whether to also delete the Supabase Storage image bytes (the orphan problem) or leave them for storage GC. Three sub-options: synchronous delete via signed-delete URL / async background job / orphan-and-defer.

3. **Q3 — Audit-trail event shape** per `PLATFORM_REQUIREMENTS.md §5`:
   - Single coarse "URL deleted" event vs. per-row events with before-state snapshots.

4. **Q4 — Permission model** in Phase 1:
   - Admin-only (matches admin-solo) vs. worker-allowed-on-own-rows (forward-compatible with Phase 2 multi-user).

5. **Q5 — Confirm-dialog component placement** (UI architecture):
   - New shared `ConfirmDeleteDialog.tsx` (composable across text + image + URL) vs. inline AlertDialog per use site vs. browser-native `window.confirm` (rejected as ugly, no cascade disclosure).

**Build-session sequencing within the same session (recommended shape post-pickers):**

1. **Back-end first** — DELETE handlers on text + images routes (P-27 back-end) + verify URL DELETE cascade (P-28 back-end) + factor through `src/lib/competition-scraping/handlers/*` per P-31's DI pattern + add 20-30 new node:test cases (existing 509 baseline; +20-30 for new DELETE handlers covering happy-path + idempotency + 401 + 400 + cascade verification).
2. **UI second** — trash-can buttons on rows + URL list + Delete button on URL detail page + new ConfirmDeleteDialog component (if Q5 picks that route) + optimistic-update with rollback pattern matching existing `EditableField.tsx` + `CustomFieldsEditor.tsx`.
3. **Playwright third** — extend P-30 stub-page rig with delete-button click + confirm-dialog interaction cases for all three modal surfaces (text + image + URL).
4. **Director walkthrough DEFERRED** to W#2 → main deploy session #17 — workflow branch isn't live on vklf.com; walkthrough happens on real Independent Website URL at deploy.

**Pre-session checklist at session start:**

- `git branch --show-current` confirms `workflow-2-competition-scraping`.
- `git log origin/main..workflow-2-competition-scraping --oneline` — expects empty (lockstep with main post-deploy #16).
- `git log workflow-2-competition-scraping..origin/main --oneline` — expects empty (same).
- Read the pre-build read list above BEFORE the design pickers fire.
- Per Rule 23, run Change Impact Audit before any code (classification depends on Q1 pick).
- Per Rule 25, schema-change-in-flight flag flips "No" → "Yes" at session start if Q1 = soft-delete; back to "No" at end-of-session.

**Verification scoreboard targets at end-of-session:**

- `npx tsc --noEmit` clean
- `cd extensions/competition-scraping && npm run compile` clean (P-27/P-28 are PLOS-side only; no extension code touched — verify scoreboard remains clean for parity)
- `npm run build` clean (52 routes + 0-2 new if DELETE routes register separately; could stay at 52 if mounted on existing route.ts shims)
- `src/lib` node:test: target **530-540 pass** (was 509; +20-30 new DELETE handler tests across text/image/URL routes)
- Extension `npm test` 334/334 unchanged
- Playwright: target **70-75 pass** (was 64; +6-12 new delete-flow cases across all three modal surfaces)

## Pre-session notes (optional, offline steps to do between sessions)

None. P-28 + P-27 paired build is an all-Claude-Code session — no offline preparation needed. Director's role this session: pick design questions Q1-Q5 via Rule 14f forced-pickers at session start; design-doc Read-It-Back per Rule 18 mid-build directive discipline; end-of-session walkthrough on workflow-2 branch DEFERRED to the next W#2 → main deploy session.

## Why this pointer was written this way (debug aid)

W#2 → main deploy session #16 wrapped cleanly with no obvious continuation item (P-29 area is now fully shipped + live + has end-to-end regression coverage). Per HANDOFF_PROTOCOL §4 Step 1c, the forced-picker fired at end-of-session. Director picked W#2 P-28 + P-27 paired build session over: single-item-W#2-polish-next-session (P-28 alone / P-27 alone / older P-13/P-19/P-21); pivot-to-non-W#2-scope ((a.13) P-17 platform infrastructure / W#1 revisit / new workflow #3-#14 start). Rationale per `feedback_recommendation_style.md`: pairing the two delete features keeps overlapping design questions consistent + the P-29 area's fresh context + full regression coverage de-risk the build.

**Alternate next-session candidates if director shifts priorities at session start:**

- Single-item W#2: P-28 alone (delete URLs only — smaller scope, ~1 session)
- Single-item W#2: P-27 alone (delete texts/images only — needs new back-end handlers + UI, ~1-2 sessions)
- Older W#2 polish: P-13 (LOW autofocus) / P-19 (LOW-MEDIUM overlay-dismiss) / P-21 (MEDIUM defensive symmetric-canonicalize)
- Pivot to platform-wide on `main`: (a.13) P-17 authFetch real-fetch integration test
- W#1 graduated-tool re-entry per Rule 22
- New workflow #3-#14 first session per Rule 18 Workflow Requirements Interview

Check `ROADMAP.md` W#2 row for the canonical state.

**After P-28 + P-27 ship:** the W#2 admin data-management surface is complete on vklf.com (add via extension + manual-add via P-29 + delete via P-28/P-27 + edit via existing inline-edit). W#2's polish backlog then continues with older polish items P-21 / P-19 / P-13 or new polish surfaces from natural use.
