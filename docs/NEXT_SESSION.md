# Next session

**Written:** 2026-05-15-h — session_2026-05-15-h_w2-p31-route-handler-di-refactor (Claude Code, on `workflow-2-competition-scraping`).

**For:** the next Claude Code session.

**Status of W#2 P-31 BUILD session #15-h:** ✅ **Route-handler DI refactor SHIPPED at code level + P-32 multi-file-drop fix SHIPPED + 62 new node:test cases all passing.** Director's Rule 14f pick at session start was Option A (per-route closure factory `makeHandler(deps)`) over Option B (module-level pure function) / Option C (testable-route adapter pattern); discovered mid-flight that `next/server` is missing from Next's `package.json` `exports` field so `node --test --experimental-strip-types` can't load it directly → second Rule 14f picker run → director picked A' (RequestLike contract in the factory, Next types only at the route boundary). Factory files live at `src/lib/competition-scraping/handlers/{urls,url-text,images-finalize,images-fetch-by-url}.ts` with a shared `shared.ts` (RequestLike + HandlerResult + VerifyAuthFn types). Each route.ts shim is now ~70 LOC: imports the factory, wires production deps (including a NextResponse→HandlerResult adapter for `verifyProjectWorkflowAuth`'s error path), exposes Next-typed POST/GET/OPTIONS. **P-32 one-line fix** SHIPPED first as session-opener (moved `setWarningMessage(null)` out of `tryLoadFile` into the call sites that want clearing — paste path + file-input fallback — but NOT onDrop, which intentionally keeps the warning); re-enabled the Playwright skip → **17/17 captured-image cases now pass** (was 16/17 + 1 P-32-deferred-skip). **HEADLINE P-31 DELTA: src/lib node:test went from 447/447 → 509/509 in a single session** (16 urls + 15 url-text + 16 images-finalize + 15 fetch-by-url = exactly +62 new cases — well over the launch-prompt's "30-40" target). Closes (a.36) RECOMMENDED-NEXT.

**One CORRECTIONS_LOG INFORMATIONAL entry this session:** I showed the original Rule 14f picker (A/B/C) without first verifying whether `next/server` could be imported under `node --test --experimental-strip-types`. The constraint became visible only after writing the factory + running the first probe. Surfaced honestly mid-flight, ran a second picker (A vs. A' vs. B vs. C), director picked A'. Net cost: ~3 minutes. Captured because future Rule 14f pickers involving test-runner constraints should verify the constraint BEFORE the picker fires, not after.

**The recommended next pick:** **W#2 → main deploy session #16 — bring P-30 + P-31 + P-32 to vklf.com in one combined deploy.** Closes (a.37) RECOMMENDED-NEXT. After this deploy: the P-29 manual-add feature has end-to-end automated regression coverage (UI-mechanical via P-30 + route-handler integration via P-31) AT ZERO director-time cost, AND the P-32 multi-file-drop warning bug is live-fixed. Director walkthrough scope is minimal — production behavior is unchanged except for the (visible-on-multi-file-drop) P-32 warning text becoming visible.

---

## Branch
workflow-2-competition-scraping (start here; on entry should be 3 commits ahead of `origin/main` = today's P-31/P-32 code commit + today's end-of-session doc batch + the 2026-05-15-g P-30 commit `0548da7` + the 2026-05-15-g doc-batch commit `a1b99d2`. Actually that's 4 commits — verify with `git log origin/main..workflow-2-competition-scraping --oneline` at session start). The deploy session merges all of them onto `main` in one fast-forward.

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**W#2 → main deploy session #16 — bring P-30 (Playwright React-bundle stub-page rig) + P-31 (route-handler DI refactor + 62 new node:test cases) + P-32 (`CapturedImageAddModal` multi-file-drop warning fix) to vklf.com.** Goal: rebase `workflow-2-competition-scraping` onto `origin/main`; fast-forward merge onto `main`; Rule 9 deploy-gate ask; push origin/main → Vercel auto-redeploy; push origin/workflow-2 for ping-pong sync. Closes (a.37) RECOMMENDED-NEXT.

Verify branch state with `git branch --show-current` before any doc reads — should be on `workflow-2-competition-scraping` (`./resume` switched you; verify). Start by running the mandatory start-of-session sequence.

**Schema-change-in-flight flag stays "No"** — zero schema changes accumulated across P-30 + P-31 + P-32.

**Deploy session #16 scope:**

1. **Pre-deploy verification scoreboard on `workflow-2-competition-scraping`** (per standard W#2 → main deploy cheat-sheet):
   - `npx tsc --noEmit` clean
   - `cd extensions/competition-scraping && npm run compile` clean
   - `npm run build` clean (52 routes — same baseline)
   - `find src/lib -name "*.test.ts" | xargs node --test --experimental-strip-types` → 509/509 (was 447 pre-P-31; +62 new P-31 cases)
   - Extension `npm test` 334/334 unchanged
   - `npx playwright test` 64/64 (P-32 fix landed it from 63 pass + 1 skip → 64 pass)

2. **Rebase + ff-merge per Rule 25:**
   - `git checkout main && git pull --rebase origin main` — confirm 0 commits ahead of origin/main (deploy #15 left them in lockstep; P-30 + P-31 sessions stayed on workflow-2).
   - `git checkout workflow-2-competition-scraping && git pull --rebase origin workflow-2-competition-scraping` — should be 4 commits ahead of origin/main (verify via `git log origin/main..workflow-2-competition-scraping --oneline`).
   - `git rebase main` on workflow-2 → expected to be a no-op (workflow-2 has been linearly ahead of main since deploy #15's ping-pong sync).
   - `git checkout main && git merge --ff-only workflow-2-competition-scraping` → clean ff-merge.
   - Re-run verification scoreboard on `main` post-merge — all GREEN.

3. **Rule 9 deploy-gate ask:**
   - Describe the 4 commits going live + their user-visible effects (in plain language):
     - P-30 test-infra (zero `src/` runtime changes — invisible to users)
     - P-31 route-handler DI refactor (zero behavior change — same status codes, same error messages, same persistence; test-infra-adjacent only)
     - P-32 fix (multi-file-drop warning UI now visible — the bug fix surfaces an existing-intended-but-unreachable warning)
   - Director picks: Yes push / No / Question first.

4. **Deploy push + Vercel auto-redeploy:**
   - `git push origin main <hash>..<hash>` → Vercel auto-redeploy ~1-2 min.
   - `git push origin workflow-2-competition-scraping <hash>..<hash>` → ping-pong sync.

5. **Director manual walkthrough on real Independent Website URL (Rule 27 scope-exception — one-off post-deploy smoke check):**
   - Re-exercise the captured-image multi-file-drop case: drag 2+ image files onto the drop zone → expect the warning text "N files dropped — only the first will be used" to appear + the preview to show the first file. (This is P-32's user-visible behavior.)
   - Spot-check other P-29 flows (URL add + text add + image add via drag/paste/URL) to confirm zero behavior change from P-31's refactor.

6. **End-of-session doc batch:**
   - ROADMAP polish-backlog P-30 + P-31 + P-32 status → all ✅ DEPLOYED
   - (a.37) RECOMMENDED-NEXT → ✅ DONE; new (a.38) RECOMMENDED-NEXT picked via §4 Step 1c forced-picker (likely candidates: P-28 delete URLs cascade / P-27 delete captured texts/images / older polish P-21 / P-19 / P-13).
   - CHAT_REGISTRY new top row
   - DOCUMENT_MANIFEST header + per-doc flags
   - COMPETITION_SCRAPING_DESIGN §B new 2026-05-?? entry
   - COMPETITION_SCRAPING_VERIFICATION_BACKLOG: "Deploy session #16 — P-30+P-31+P-32 DEPLOYED" section
   - NEXT_SESSION.md rewrite

**Pre-deploy checklist at session start:**

- `git branch --show-current` confirms `workflow-2-competition-scraping`.
- `git log origin/main..workflow-2-competition-scraping --oneline` — expects 4 commits (2026-05-15-g `0548da7` P-30 code + 2026-05-15-g `a1b99d2` doc batch + today's P-31/P-32 code + today's doc batch).
- Read `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` P-30 + P-31 + P-32 SHIPPED sections.
- Read `COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-15-g + 2026-05-15-h entries.
- Read `ROADMAP.md` W#2 row + (a.37) RECOMMENDED-NEXT entry.
- Per Rule 23, run Change Impact Audit before any code. Deploy session classification: **Additive (safe)** — P-30 + P-31 are test-infra/refactor with zero production behavior change; P-32 fix surfaces an intended-but-unreachable warning. No schema; no shared-types changes; no downstream consumer (Chrome extension; UI) sees a different API contract.

**Verification scoreboard for deploy session #16 (target state at end-of-session):**

- All pre-deploy scoreboard items still GREEN on `main` post-merge.
- Vercel build green within ~1-2 min of `git push origin main`.
- Director manual walkthrough on real Independent Website URL: P-32 multi-file-drop warning visible + zero regression on P-29 area flows.

## Pre-session notes (optional, offline steps to do between sessions)

None. Deploy session #16 is an all-Claude-Code session — no offline preparation needed. Director's role this session: Rule 9 deploy-gate approval + post-deploy manual walkthrough on a real Independent Website URL.

## Why this pointer was written this way (debug aid)

P-30 + P-31 + P-32 accumulated on `workflow-2-competition-scraping` across two consecutive build sessions (2026-05-15-g shipped P-30; 2026-05-15-h shipped P-31 + P-32). Deploy session #16 is the natural next pick per `feedback_recommendation_style.md`: closes the deploy gap before any next polish work; brings the P-29 area's full regression-coverage trifecta (UI mechanical + route-handler integration + real-website smoke) live on vklf.com; fixes the only production bug accumulated (P-32). Director picked this via §4 Step 1c forced-picker over alternatives (P-28 / P-27 / older polish).

**Alternate next-session candidates if director shifts priorities at session start:**

- P-28 (delete URLs cascade — user-facing admin feature) — defers the deploy
- P-27 (delete captured texts/images — sibling of P-28) — defers the deploy
- Older polish items P-21 / P-19 / P-13 — defers the deploy

Check `ROADMAP.md` W#2 row for the canonical state.

**After deploy session #16 ships:** the P-29 area is fully live with end-to-end regression coverage AND the P-32 production bug is fixed. W#2's polish backlog then continues with the next director-picked item (P-27 / P-28 / older polish / new polish surfaces from natural use).
