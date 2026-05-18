# Next session

**Written:** 2026-05-19-c — `session_2026-05-19-c_w2-main-deploy-sessions-21-22-p13-p27-paired-DEPLOYED` (Claude Code; dual-branch — pre-deploy scoreboards on `workflow-2-competition-scraping`, two rebase + ff-merge + deploy cycles on `main`, ping-pong syncs after each main push).

**For:** the next Claude Code session.

**Status of W#2 → main deploy sessions #21 + #22:** ✅ **TWO fixes shipped + deployed in one paired session.** (1) **P-13 LOW autofocus on popup's inline "+ Add new…" category input** — closes (a.44) RECOMMENDED-NEXT; 1-LOC `autoFocus` prop on the conditionally-rendered `<input>` in `CapturedTextPasteForm.tsx`. Drift caught at start-of-session: ROADMAP P-13 entry claimed the fix needed both popup + content-script overlay surfaces, but the 3 content-script overlays (`text-capture-form.ts:305`, `image-capture-form.ts:368`, `url-add-form.ts:244`) **already had `.focus()` calls** — popup React was the only true gap. Deployed as session #21 (commit `e217eb9`). (2) **P-38 popup URL pre-select when only 1 saved URL exists** — Rule 11 scope-add surfaced by director's natural-use feedback during P-13 verification ("popup did not auto-select the URL for 'Attach to which saved URL?'"). Director picked the simple rule via in-session forced-picker: pre-select if `urls.length === 1`, else leave placeholder. ~4 LOC in `CapturedTextPasteForm.tsx` (useEffect + resetForm both apply the rule with local-extraction pattern to satisfy `noUncheckedIndexedAccess` tsconfig). Deployed as session #22 (commit `a0d5c8a`). Both fixes verified by director sideload — P-13 PASS on first try; P-38 PASS only after director set up a TRUE 1-URL test scenario (their initial test had 2+ URLs, which P-38 correctly leaves alone per the picked rule). Pre-deploy + post-merge scoreboards both deploys all GREEN: tsc / ext tsc / `npm run build` 53 routes / src/lib node:test 527/527 / extension `npm test` 352/352 (unchanged — Option A no new tests both fixes per Rule 27 scope exception) / Playwright 75/75. **(a.45) RECOMMENDED-NEXT = W#2 polish P-39 — sticky most-recently-used URL preference on `workflow-2-competition-scraping`** via §4 Step 1c forced-picker. Rationale per `feedback_recommendation_style.md`: closes the actual UX friction director felt today (multi-URL combos still require manual pick — P-38's 1-URL rule is the trivial case but most real Project+Platform combos have 2+ URLs); fresh-from-natural-use polish item; well-scoped single-session ship; lowest risk of remaining candidates (vs. heavier W#3 first session or W#2 P-16 service-worker diagnostics).

---

## Branch

**`workflow-2-competition-scraping`** — W#2 polish work, NOT platform-wide. The `./resume` script will switch you from `main` (where today's 2026-05-19-c deploy session ended) → `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`, not `main`. If you're still on `main` after `./resume`, STOP and surface to director.

Expected branch state on entry: `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` AND exactly even with `origin/main` (today's two deploy pushes + ping-pong syncs + end-of-session doc-batch push left all three at the same SHA — should be `a0d5c8a` + the end-of-session doc-batch commit on top).

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**Ship P-39 — sticky most-recently-used URL preference in popup paste-text flow** on `workflow-2-competition-scraping` (ROADMAP W#2 polish backlog new P-39 entry; new ROADMAP Active Tools (a.45) RECOMMENDED-NEXT). Goal: extend P-38's URL pre-select rule beyond the trivial 1-URL case — track user's last-selected URL per (project, platform) tuple in `chrome.storage.local`; pre-select it next time the popup opens for the same combo. Closes the multi-URL UX friction director surfaced 2026-05-19-c during P-38 verification (their real-world combos have 2+ URLs so P-38's simple rule doesn't help). Closes (a.45) RECOMMENDED-NEXT.

Branch is `workflow-2-competition-scraping`. Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Fix shape (~20-30 LOC + tests):**

- `extensions/competition-scraping/src/entrypoints/popup/components/CapturedTextPasteForm.tsx`:
  - On URL list load: if `urls.length >= 2`, look up `chrome.storage.local`'s `plos-cs-popup-url-pref-{projectId}-{platform}` key; if value matches an existing url's id, pre-select it. Falls back to P-38's `length === 1` rule if no stored preference. Falls back to placeholder if neither applies.
  - On URL selection change (i.e., the `onChange={...setSelectedUrlId...}` handler): also write the new value to `chrome.storage.local` under the same key. So the next popup open for the same (project, platform) restores the pick.
  - resetForm (post-save): keep the stored preference unchanged (user's last save was AT that URL, so that's the right thing to pre-select again).

- Storage key strategy: scoped per (projectId, platform) so different combos don't cross-contaminate. Suggested key shape `plos-cs-popup-url-pref-{projectId}-{platform}` (URL-safe, sortable in storage inspector).

- Edge case: if stored URL id no longer matches any current url (URL was deleted), fall back to P-38's `length === 1` rule or placeholder.

**Test coverage decision (Rule 27 forced-picker at session start):**

- (A) **Node:test cases on the lookup function** — extract `getStickyPreselectedUrlId(urls, storedPref)` as a pure function in `popup/lib/sticky-url-preselect.ts`; node:test cases: stored-pref matches existing url → pre-select; stored-pref doesn't match any url → fall back to length===1 rule; stored-pref undefined → fall back to length===1 rule; multiple urls + no stored pref → empty string; etc. Estimated +6-10 cases. **Recommend.** Pure-function extraction is testable in node:test without mocking chrome.storage. The chrome.storage write side is straightforward enough to skip explicit test coverage.
- (B) Playwright extension popup spec covering full chrome.storage round-trip. Higher confidence; +30-45 min authoring cost; +5-10 sec Playwright suite time. Belt-and-suspenders if A picked.
- (C) Director's manual smoke verification only — no automated test. Sideload + open popup with 2+-URL combo, pick a URL, save text, close popup, re-open popup with same combo, confirm previously-picked URL is pre-selected.
- (D) Escape hatch.

Per `feedback_recommendation_style.md` (most thorough/reliable), Option (A) is the natural pick — pure-function logic deserves regression coverage; chrome.storage side is mechanical wire-up.

**Pre-deploy verification scoreboard targets (expected baselines from today's deploy session #22 post-state):**

- `npx tsc --noEmit` clean
- `cd extensions/competition-scraping && npx tsc --noEmit` clean
- `npm run build` clean — **53 routes** (unchanged; no new routes)
- `src/lib` node:test: **527/527** unchanged (P-39 is extension UI only)
- Extension `npm test`: **352/352** baseline + new sticky-preselect cases if Option A picked (~358-362 expected)
- Playwright: **75/75** unchanged (+0-2 if Option B picked)

**Deploy mechanics (cheat-sheet b — standard W#2 → main deploy):** unchanged from today's sessions. Pre-deploy scoreboard → rebase if main moved → ff-merge → post-merge scoreboard → Rule 9 gate → push main → ping-pong sync → fresh extension build → director sideload + manual verification.

**Director re-verify on real Independent Website URL (~1 min visual check):**

After sideloading fresh extension build (deploy-23.zip), pick a Project + Platform combo with 2+ saved URLs in the popup; pick a specific URL from the dropdown (not the placeholder); paste some text + content category + Save. Close popup. Re-open the extension popup; pick the SAME Project + Platform combo. Confirm the "Attach to which saved URL?" dropdown is already showing the URL you previously picked — NOT the placeholder. Switch to a DIFFERENT Project + Platform combo; confirm its dropdown follows ITS own sticky preference (or the P-38 1-URL rule, or placeholder) independently.

**Per Rule 23 Change Impact Audit (pre-classify before code):** ADDITIVE — pure UX micro-feature; zero production behavior change outside the popup paste-text flow. chrome.storage.local writes are scoped to this extension; no cross-extension or server-side effect.

**Group A docs to update at end-of-session:** ROADMAP (header + (a.45) → flip ✅ DONE + new (a.46) RECOMMENDED-NEXT — likely W#2 polish P-16 service-worker diagnostics OR W#2 Tool Graduation OR start W#3 first session; settle via §4 Step 1c forced-picker); CHAT_REGISTRY; DOCUMENT_MANIFEST; CORRECTIONS_LOG (header bump + any new entries); NEXT_SESSION (rewritten for the next pick).

**Group B docs to update at end-of-session:** COMPETITION_SCRAPING_VERIFICATION_BACKLOG (new Deploy session #23 entry + P-39 ⏳ OPEN → ✅ DONE); COMPETITION_SCRAPING_DESIGN §B 2026-05-XX entry covering the sticky-preselect mechanism + storage key design.

Schema-change-in-flight flag stays "No" for this entire session (P-39 is extension UI + chrome.storage only — no schema change, no server API change, no shared-types change).

Start by running the mandatory start-of-session sequence.

**Pre-build read list (in addition to mandatory start-of-session sequence):**

- `extensions/competition-scraping/src/entrypoints/popup/components/CapturedTextPasteForm.tsx` (lines 65-95 useEffect, 105-120 resetForm, 222-238 URL dropdown rendering) — the integration site.
- `extensions/competition-scraping/wxt.config.ts` or `manifest.json` — confirm `storage` permission is in place (likely yes since the popup already uses chrome.storage elsewhere; verify before coding).
- ROADMAP W#2 polish backlog new P-39 entry — full root-cause + fix-shape narrative.

## Pre-session notes (optional, offline steps to do between sessions)

None. P-39 is an all-Claude-Code session. Director's role during this session: pick test coverage via Rule 27 forced-picker at session start (probably Option A — pure-function node:test); pick "Deploy now" via Rule 9 gate; pick next session's task via §4 Step 1c interview at end.

## Why this pointer was written this way (debug aid)

Today's session shipped P-13 + P-38 in two stacked deploy cycles (sessions #21 + #22). P-13 was the planned task; P-38 was a Rule 11 scope-add surfaced by director's natural use during P-13 verification. P-38's simple "exactly 1 URL" rule was the smallest defensible UX default, but director's real-world combos have 2+ URLs — so the friction they actually feel (manual URL picking on every popup save) isn't covered by P-38. P-39 is the natural next polish item: extend the pre-select rule with chrome.storage-backed sticky preference per (project, platform) tuple. Director picked P-39 over P-16 (service-worker MV3 crash diagnostics) and W#3 first session via §4 Step 1c forced-picker — P-39 is the highest-priority fresh-from-natural-use friction; closes a clear UX gap; well-scoped single-session ship.

**Alternate next-session candidates if director shifts priorities at session start:**

- W#2 polish P-16 service-worker MV3 crash diagnosis (MEDIUM severity; ~30-60 min diagnostic session).
- W#2 Tool Graduation per HANDOFF_PROTOCOL §4 Step 2 Scenario B — only if director declares W#2 complete after P-39 ships; otherwise the polish backlog still has open items.
- Start W#3 Therapeutic Strategy first session per Rule 18 — large lift (~90-150 min).
- W#1 graduated-tool re-entry per Rule 22 — only if a Keyword Clustering issue surfaces.

Check `ROADMAP.md` for the canonical state.
