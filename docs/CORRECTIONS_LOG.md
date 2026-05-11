# CORRECTIONS LOG
## Append-only record of mistakes made during chats and lessons learned

**Started:** April 16, 2026
**Last updated:** May 12, 2026-b (W#2 → main deploy session #6 — **smooth session, zero new CORRECTIONS_LOG entries.** Completes the rebase + ff-merge that today's earlier verification session left aborted at its end-of-session per the established pattern. Rebase-then-ff per CORRECTIONS_LOG 2026-05-10-c entry #4 cheat-sheet (b) executed cleanly: 4 expected doc-header conflicts on `b8423ab` replay (CHAT_REGISTRY + CORRECTIONS_LOG + DOCUMENT_MANIFEST + ROADMAP) resolved mechanically via Option-A reconciliation (2026-05-11-b session 4 ext build content stays "Last updated"; 2026-05-11 session #5 demoted to "Previously updated"); `0c56381` + `480e7a2` applied cleanly; force-push to W#2 with `--force-with-lease` safety; ff-only merge to main + push origin/main; Vercel auto-redeploy green; browser-verify on vklf.com ALL PASS (today's earlier hotfix `08f10e5` from the verification session still live; no regression). Director feedback at verification time registered two platform-UI fixes for next session captured as W#2 row (a.12) RECOMMENDED-NEXT on `main`. Three operational lessons reinforced from prior sessions (no re-capture needed): (a) Option-A reconciliation pattern for header-chain conflicts works mechanically — same as 2026-05-10-c session #2 + 2026-05-10-d session #3; (b) `--force-with-lease` adds zero-cost safety vs. plain `--force`; (c) Rule 24 pre-capture search caught prior treatment for the W#2 card item (CORRECTIONS_LOG line 1552 Ckpt 9.5 + PLATFORM_ARCHITECTURE line 191) + confirmed fresh territory for the landing-page item. Cross-references: ROADMAP W#2 row Last Session entry for deploy session #6 + new (a.12); CHAT_REGISTRY new top row.)

**Previously updated:** May 12, 2026 (Seventy-sixth Claude Code session — **W#2 verification session + vklf.com production hotfix**. Launch-prompt task was the deferred verification queue (P3B-1..P3B-11 cross-device sign-in test; P1V-1..P1V-3 silent token refresh; S4-A + S4-B + S4-C Module 2 text-capture walkthroughs). At S4-A-4 first save attempt, director observed `Failed to execute 'fetch' on 'Window': Illegal invocation` on vklf.com (BLOCKING all authenticated page loads in production) + 401 burst on extension popup startup. **TWO problems surfaced simultaneously — diagnosis pivoted session from pure verification to HIGH-severity production hotfix.** **Problem A — vklf.com Illegal invocation = real production regression.** Root cause: `src/lib/authFetch.ts:82` passed `fetch` bare as the production `fetchFn` dependency; browsers detach `fetch` from its window receiver when invoked via a detached reference and throw `TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation` on every call. Bug shipped 2026-05-10-f with the P-1 silent token refresh (commit `d715cde`) + deployed via session #4 + #5 (commits `daa4ca8` + `9a1aacd`) — invisible since both deploys ended within the 1-hour access-token freshness window so director didn't return to vklf.com long enough to hit any authenticated fetch under the buggy code path. **Test gap that allowed bug to ship:** all 7 P-1 unit tests in `authFetch.test.ts` inject a fake `fetchFn` via `makeAuthFetch({ fetchFn: <fake> })`; none exercise the production export's `fetchFn: fetch` bare-reference wiring. The production export is the line that has the bug; the production export is the line never tested. Node's fetch is more lenient than browser fetch, so even an integration test in node wouldn't catch this — would need a browser-context test (jsdom or Playwright). **Fix (commit `08f10e5` on main, deployed to vklf.com same-session):** wrap `fetch` in an arrow that preserves the window receiver — `fetchFn: (u, i) => fetch(u, i)`. 7-line diff (3-line comment + 4-line formatting). 7/7 existing tests still pass; tsc clean; build clean (51 routes baseline parity). Director verified vklf.com loads cleanly post-deploy. P1V-2 + P1V-3 (which depend on the silent refresh path being reachable) both passed end-to-end on vklf.com after the hotfix — confirming the fix works as intended. **Problem B — extension 401 burst on popup startup** — separate code path; extension uses its own api-client.ts authedFetch without P-1's silent-refresh wrapper. Burst self-resolved on popup re-open (likely Supabase client auto-refresh OR transient backend rejection). Captured as polish item P-12 (extension 401-retry / silent-refresh analog to P-1) — extension popup shouldn't surface transient 401s as broken-popup state. **Verification queue results after hotfix:** S4-A 12/12 PASS; S4-B 12/12 PASS with workarounds (highlight-flashing + pre-fill canonicalization captured as polish items); S4-C-1 PASS, S4-C-2 SKIPPED (optional manual curl); P1V-2 PASS (3-request sequence 401→refresh→retry observed exactly as designed); P1V-3 PASS (failure path forces auto-signout + login redirect — different mechanism than verification doc described "red error" but functionally correct and arguably better UX); P3B-1..P3B-10 PASS (canonical cross-device proof: laptop 2's chrome.storage.local was empty on install; sign-in showed both Project + Platform pre-selected from laptop 1's picks via server fetch); P3B-11 N/A (no migration scenario applicable). **Six DEFERRED polish items captured this session per Rule 26** — destinations all named in ROADMAP W#2 polish backlog this end-of-session doc-batch: P-12 extension 401-retry; P-13 autofocus on "+ Add new…" inline input (popup + overlay); P-14 highlight-terms applicator + MutationObserver self-feedback loop causes flashing (pre-existing 2026-05-08-d P-5 architecture issue, surfaced only via S4-B's selection gesture); P-15 pickInitialUrl missing `canonicalProductUrl` step on slug-variant URLs (session 4 bug — overlay fails to pre-select current page's URL when path has Amazon-style product slug); P-16 extension service worker "went to a bad state unexpectedly" surfaced on laptop 2 chrome://extensions (MV3 SW crashed at unknown time; auto-restarted by Chrome; future diagnosis needs SW's own DevTools); P-17 real-fetch integration test for `authFetch.ts` production export (test-coverage gap that allowed today's Illegal invocation to ship). **Two doc drifts captured:** (1) S4-A-2 verification doc expected "Save button disabled until URL + category + non-empty text" — code shows Save button only disabled on `submitting`; validation surfaces via `validateCapturedTextDraft` on submit click. (2) P1V-3 verification doc expected red error in UI on refresh failure — actual behavior is Supabase client fires SIGNED_OUT → app routes to login screen. Both functionally correct; verification doc text needs update next session. **Multi-workflow per Rule 25:** session pivoted mid-stream from W#2 (verification) to main (hotfix) and back. Hotfix shipped on main (commit `08f10e5`) per cheat-sheet (b) — code that deploys lives on main. Verification work continued on W#2 branch per cheat-sheet (c). W#2 branch's authFetch.ts remains pre-hotfix locally; next W#2 → main deploy session must merge main into W#2 before adding new commits (per CORRECTIONS_LOG 2026-05-10-c entry #1 PROCESS-quality finding). **End-of-session attempt to rebase W#2 onto origin/main** hit conflicts in 4 doc headers (CHAT_REGISTRY, CORRECTIONS_LOG, DOCUMENT_MANIFEST, ROADMAP) — aborted; next deploy session handles the merge cleanly. **Lesson — production wiring of injected-dependency factories needs at least one integration test:** when a factory exposes a DI seam for tests AND the production export wires in a global like `fetch` / `crypto` / `localStorage`, the unit tests' fake-injection coverage doesn't catch bugs in the production wiring line itself. Either add a browser-context integration test that exercises the production export OR write the production wiring in a way that's intrinsically safe (e.g., `fetch.bind(globalThis)` instead of bare `fetch`). Logged as ROADMAP polish item P-17 for future implementation. **Lesson — deploy verification scope should include "return after >1 hour idle":** this is the second occurrence (2026-05-08-b was the first, captured at the time as P-1's motivation). The 1-hour access-token TTL means same-window-fresh-sign-in verification doesn't exercise the silent-refresh path; a regression in that path is invisible until natural use surfaces it. Mitigation: deploy sessions should explicitly verify "come back >1 hour later" if the deploy touched auth-adjacent code. **Cross-references:** `src/lib/authFetch.ts:81-88` (the fixed production export); `src/lib/authFetch.test.ts` (the 7-test suite that doesn't cover production wiring); commit `08f10e5` (the hotfix); deployment ID 4650327672 (Vercel "success" state confirmed via gh api); ROADMAP W#2 polish backlog new items P-12..P-17; this session's COMPETITION_SCRAPING_DESIGN §B 2026-05-12 entry; COMPETITION_SCRAPING_VERIFICATION_BACKLOG outcome block.)

**Previously updated:** May 11, 2026-b (W#2 Extension build — session 4 Module 2 text-capture — ONE entry, LOW severity: **MISTAKE — Claude recommended P-6 (Sponsored Ad checkbox) as the next-coding item without verifying its actual ship status; P-6 had shipped 2026-05-09-b.** Symptom: at session start, after director asked "what should I code first?" Claude answered "the known open W#2 polish item is P-6." Director accepted with "Yes, let's code that first." Before writing code, Claude ran a sanity grep on the schema + the extension `url-add-form.ts` for the P-6-affected surfaces, and both came back showing `isSponsoredAd` + the checkbox UI + the SSPA auto-pre-check were ALREADY shipped — P-6 was complete + browser-verified per DESIGN §B 2026-05-09-b. Claude immediately surfaced the mistake to director, corrected the recommendation, presented the actual open coding fronts (Extension session 4 Module 2 text-capture; Extension session 5 image-capture; new polish item from director). Director picked session 4. **Diagnosis:** the original drift-check skipped reading the full W#2 polish backlog section in ROADMAP.md (P-1..P-10 status lines) because the file is enormously dense (~40k tokens for 20 lines around the backlog header). Claude synthesized "P-6 is the canonical next" from a stale grep hit on the 2026-05-08-c P-6-capture text — that grep hit was the CAPTURE moment, not the SHIP moment. The ship status (`✅ SHIPPED ✅ DEPLOYED ✅ BROWSER-VERIFIED 2026-05-09-b`) was in a different section of the ROADMAP that Claude didn't read. **Same root cause as Rule 24 origin entry (2026-04-27):** Claude synthesized from working memory + a partial grep instead of doing the structured verification BEFORE recommending. The fact that ROADMAP.md is too dense for a single Read call doesn't excuse the failure — the correct response would have been to grep for the specific status markers (`P-6 ✅ SHIPPED` / `bc6816c` commit hash) OR check the schema directly (the field would exist if P-6 had landed). **Cost:** minimal — Claude caught the mistake before any code was written (the schema grep that revealed P-6 was already done was the very first action after the director's "Yes, let's code that first"). Director did not have to do anything to recover; the corrected recommendation came in the same message. **Lesson — single-grep verify before recommending a polish item:** when proposing to ship any polish item, FIRST grep the repo for the item's expected surface (schema field, function name, file path) to confirm it's actually open. The verification grep is cheap (~30 seconds total); the wrong-recommendation cost is high if it gets past the verification step into actual code work. **Process update — added to operational discipline:** before recommending ANY specific polish item (P-N) at session start, Claude runs a targeted grep for the item's most-load-bearing artifact (schema field for schema items; file path or function name for code items). Treat a recommendation as a Rule 24-class write that requires the structured search. **Cross-references:** `prisma/schema.prisma:267` (isSponsoredAd field — already there); `extensions/competition-scraping/src/lib/content-script/url-add-form.ts:45-50,205-220,305-308` (defaultIsSponsoredAd + checkbox UI + payload — already there); `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-09-b entry (P-6 ship record with all browser-verifications); commit `bc6816c` (the P-6 implementation) + `8115138` (post-deploy popover-clipping fix); ROADMAP.md W#2 polish backlog P-6 entry; this CORRECTIONS_LOG entry.)

**Previously updated:** May 11, 2026 (W#2 → main deploy session #5 — P-1 silent token refresh deployed to vklf.com. **Smooth session — zero new CORRECTIONS_LOG entries.** ff-only merge of W#2 commits `d715cde` + `daa4ca8` onto main clean (zero ahead). Vercel auto-redeployed green. P3B-1..P3B-11 cross-device verification of P-3 broader scope DEFERRED a second time at director's call mid-session; rescheduled to ROADMAP Active Tools W#2 row (a.11) RECOMMENDED-NEXT on `workflow-2-competition-scraping`. P-1 verification passive. Three operational lessons reinforced from prior sessions (no re-capture needed): (a) branch-rule cheat sheet from 2026-05-10-c entry #4 — deploy session is on `main` ✅, verification-only session on W#k feature branch (today's deploy correctly on `main`; (a.11) next session correctly recommends `workflow-2-competition-scraping`); (b) wxt build pipe-blocking from 2026-05-10-f — used the `2>&1 | tail -30` pattern again today; produced empty output (same root cause) but the build artifacts were verified present + complete via filesystem inspection without ~9 min of watcher confusion (lesson is internalized); (c) fetch-first habit from 2026-05-10-c entry #1 — ran `git fetch origin && git log main..origin/workflow-2-competition-scraping --oneline` first to confirm exact commits before merge (no surprise; clean ff-only). Cross-references: ROADMAP W#2 row (a.10) flipped to DEPLOY DONE + VERIFICATION DEFERRED + new (a.11) RECOMMENDED-NEXT; `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` Polish session #10 section status updated.)

**Previously updated:** May 10, 2026-f (W#2 → main deploy session #4 + P-1 ship — ONE INFORMATIONAL entry, LOW severity: **OPERATIONAL slip — extension `npm run build` (`wxt build`) ran for ~9 minutes during the deploy phase before being killed; force-kill produced the same artifacts as a clean exit would have.** Symptom: kicked off `cd extensions/competition-scraping && npm run build` to produce a fresh extension bundle for the director to sideload after the W#2 → main ff-merge. Build wrote all expected output files (`background.js` 200K, `chunks/popup-DLEZzAlj.js` 400K, `content-scripts/content.js` 36K, `assets/popup-D_aALNcA.css` 8K, `manifest.json`, `popup.html`) within ~10 seconds of starting (file mtimes confirmed via `find -printf '%T@ %p\n' | sort -n | tail -5`). Sizes matched session #10's verification doc's expected ~641 kB total. But the parent `wxt build` node process never exited — it remained alive at 0.5% CPU and STAT=Sl (sleeping) for ~9 minutes. Two background watchers couldn't detect the artifacts-done state because: (1) the `npm run build | tail -30` pipe doesn't emit anything until the parent exits; (2) the first `pgrep -f "wxt build"` watcher matched its own command line (since the shell command string contained "wxt build"). Fixed via second watcher with `pgrep -f "node.*\.bin/wxt"` (matches only the actual wxt node binary). Once Claude noticed the wxt process was sleeping with complete artifacts already written, called `pkill -9 -f "node.*\.bin/wxt"` and proceeded with `zip -r plos-extension-2026-05-10-e-w2-deploy-4.zip .` from inside `.output/chrome-mv3/`. The 174 KB zip extracted cleanly + matched expected file inventory. **NOT a critical mistake** — output artifacts were correct + verifiable; force-kill wasn't destructive (no partial writes). Cost was ~9 minutes of session time on the watcher confusion + ~1 minute on figuring out the self-matching `pgrep` pattern. **Operational lesson 1 — `pgrep` self-match:** when waiting for a long-running subprocess via `until ! pgrep -f "<pattern>"; do sleep N; done`, the watcher's own shell command line typically contains the pattern, causing pgrep to always match. Fix: use a more specific pattern that includes the actual binary path (e.g., `node.*\.bin/wxt` instead of `wxt build`). **Operational lesson 2 — `npm run build | tail -30` pipe blocks:** piping to `tail` waits for input EOF, which only happens when the producer exits. For long builds, the watcher can't see the build output in real-time; switch to redirecting via `> log.txt &` + tailing the file separately. **Operational lesson 3 — when subprocesses hang post-completion:** if file artifacts are written + correct + complete, force-killing the parent is safe. Don't wait indefinitely for a clean exit when you can verify the work is done. **Mitigation pattern for future extension-build sessions:** measure file-mtime of the largest expected artifact (`background.js` or `chunks/popup-*.js`) at start of build; loop checking until mtime stops advancing for ~3 seconds; then proceed with packaging. This avoids both the watcher self-match issue AND the pipe-blocking issue. Cross-references: `extensions/competition-scraping/.output/chrome-mv3/` (the artifacts produced); `plos-extension-2026-05-10-e-w2-deploy-4.zip` (the packaged zip in repo root); `extensions/competition-scraping/package.json` line 7 (the build script: just `wxt build`).)

**Previously updated:** May 10, 2026-c (W#2 → main deploy session #2 — FOUR INFORMATIONAL entries: (1) **PROCESS-quality finding — W#2 polish session #8 (2026-05-10-b on `workflow-2-competition-scraping`) didn't pull main's `21d717b` deploy doc-batch into W#2 before adding new W#2 commits → caused today's main↔W#2 divergence.** Symptom: today's deploy session expected to do `git merge --ff-only workflow-2-competition-scraping` per launch prompt but ff-only was blocked because both branches had advanced past their merge base (main: `21d717b` deploy doc-batch from earlier 2026-05-10-b session; W#2: `9d9cfea` + `6cd9949` from later 2026-05-10-b polish session #8). Resolution required rebase + force-push to W#2 + ff-only merge to main. The ~30 min spent on rebase + conflict resolution + force-push could have been ~3 min of `git pull origin main` at the start of polish session #8. **Root cause:** `MULTI_WORKFLOW_PROTOCOL.md §4` "Pull-rebase before commit (mandatory)" says to pull-rebase the CURRENT branch before commit — but doesn't address the case where main has advanced (e.g., after a deploy session that brought your branch's prior work onto main). **Proposed structural fix:** extend `MULTI_WORKFLOW_PROTOCOL.md §4` with a new sub-rule: "If your current branch is not main AND main has advanced past your branch's last point of fork from main (check via `git log --oneline main..origin/<your-branch>` AND `git log --oneline origin/<your-branch>..main`), run `git pull origin main` (or `git rebase main`) to absorb main's recent changes BEFORE adding new commits to your branch. Without this, your next branch-to-main merge will require divergence reconciliation." Also extend the start-of-session sequence in `CLAUDE_CODE_STARTER.md` Step 6 to include this main-vs-feature-branch check. **Today's protocol update is OUT OF SCOPE** — captured here for next protocol-design session to implement. **Operational lesson:** after any session that successfully merges a feature branch to main, the NEXT session on that feature branch should pull main into the feature branch BEFORE adding new commits. Cross-references: `MULTI_WORKFLOW_PROTOCOL.md §4` (the rule that needs extension); commit `21d717b` (main's deploy doc-batch from 2026-05-10-b that polish session #8 didn't absorb); commits `9d9cfea` + `6cd9949` (polish session #8's commits that were authored without absorbing main's `21d717b`); rebased commits `d2e2115` + `cc843a7` (today's reconciled state on main). (2) **SPEC-DESIGN finding — P-2 verification spec from polish session #8 conflated supabase-auth fetch with `authedFetch` fetch path → today exercised the wrong layer.** Symptom: today's P-2 browser re-verify followed polish session #8's spec ("sign out → WiFi off → sign in") and observed P2-4 still showed "Failed to fetch" in the popup's red error box instead of the expected friendly "Network unreachable — check your connection.". **Diagnosis (verified via code-read of `extensions/competition-scraping/src/lib/auth.ts:17-23` + `api-client.ts:62`):** P-2's fix wraps `authedFetch` only. Supabase's `signInWithPassword` has its own internal fetch path that's NOT wrapped by `mapFetchTransportError`. The original spec's sequence hits supabase auth's path BEFORE `authedFetch` ever runs — supabase returns "Failed to fetch" verbatim. **NOT a code bug — a spec gap.** **Corrected test sequence captured for next session** in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` "Polish session #8" P-2 sub-table + ROADMAP polish backlog P-2 entry: (1) sign in normally with WiFi ON; (2) turn OFF WiFi (stay signed in); (3) close popup, then re-open it; popup's `ProjectPicker` re-fetches via `authedFetch` on mount → P-2 converts the `TypeError` to `PlosApiError(0, 'Network unreachable — check your connection.')` → expected red error box reads approximately "Couldn't load your projects (0): Network unreachable — check your connection." DEFERRED as TaskCreate task #6 per Rule 26. **Lesson 1 — verification-spec authoring discipline:** when writing a verification spec for a fix that wraps a SPECIFIC layer (e.g., `authedFetch` not supabase auth), the spec MUST exercise THAT layer specifically. Following user-mental-model paths ("sign out + sign in") may bypass the layer being tested. **Lesson 2 — code-read at verification-time pays off:** the diagnostic code-read of `auth.ts` + `api-client.ts` + `ProjectPicker.tsx` took ~3 min and revealed the spec design issue immediately; otherwise we'd have concluded P-2 had a real code bug. Cross-references: `extensions/competition-scraping/src/lib/api-client.ts:62` (`mapFetchTransportError` — the layer P-2 wraps); `extensions/competition-scraping/src/lib/auth.ts:17-23` (supabase signIn — NOT wrapped by P-2); `extensions/competition-scraping/src/entrypoints/popup/components/ProjectPicker.tsx:31-35` (the layer that prepends "Couldn't load your projects" to the error message). (3) **SPEC-DESIGN finding — Polish session #8 P-9/P-10 verification spec didn't call out refresh-after-platform-switch requirement → director hit silent gate-check rejection on first Walmart attempt.** Symptom: director switched popup from Amazon to Walmart, navigated to Walmart, observed neither Highlight Terms nor floating "+" icon appeared (chrome://extensions Errors panel showed zero errors — silent bail-out). **Diagnosis (verified via code-read of `orchestrator.ts:78-81` + `:102-107`):** orchestrator reads `selectedPlatform` from popup-state ONCE on page load. If user switches the popup's platform AFTER the page is already loaded, the running content script doesn't re-read; orchestrator's gate-check at line 102-107 (verify hostname matches selected-platform's module) silently bails out. **By design** (avoids mid-session platform-mismatch chaos) — but the verification spec said "switch the popup to the right platform before each navigation" without explicitly calling out "AND refresh the page after switching the popup's platform if you have a page already open." Director refreshed Walmart → both features appeared immediately → all P-9 + P-10 Walmart steps passed. **NOT a code bug — a spec gap.** **Mitigation captured this session:** `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` "Polish session #8" P-9 + P-10 pre-test setups now have a CRITICAL note: "if you switch the popup's platform AFTER a page is already loaded, refresh the page before testing." Future polish-spec doc-update sessions should generalize this note across other platform-switch test scenarios. **Lesson — verification-spec authoring discipline #2:** when writing a verification spec, every step that depends on shared state (e.g., popup-platform selection, chrome.storage.local hydration) needs to call out the propagation rules — what's read once, what's reactive. The spec-writer can't assume the test-runner remembers content-script architecture details. Cross-references: `extensions/competition-scraping/src/lib/content-script/orchestrator.ts:78-81` (one-shot read of selectedPlatform); `:102-107` (silent bail-out gate-check); `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` "Polish session #8" P-9 P9-4 row (now annotated with the refresh-required outcome). (4) **PROCESS-quality finding — Claude's original 2026-05-10-c handoff recommended `main` as the branch for the next-session P-2 retest, contradicting `MULTI_WORKFLOW_PROTOCOL.md §11` Step 1's branch table.** Symptom: in the personalized handoff at end-of-session, the "NEXT-SESSION INSTRUCTIONS" section had a launch prompt that said *"this is W#2 polish-spec-followup work tightly coupled to the deployed code on `main` so it belongs on `main`"* — instructing the director to start the next session on `main`. Director caught the inconsistency by asking *"What was the purpose of returning the branch to main when the previous sessions recommended working on the other branch and worked on the other branch for many sessions"*. **Diagnosis:** `MULTI_WORKFLOW_PROTOCOL.md §11` Step 1's branch table is unambiguous — "Work on W#k for k ≥ 2 (specific named workflow)" → `workflow-N-<slug>`. The protocol is correct; Claude misapplied it. Misreading: Claude treated "verification of deployed code" as belonging to the "Cross-workflow / platform-wide infrastructure" row (which goes to `main`) when it actually belongs to the "Work on W#k" row (which goes to the W#k feature branch). Past pattern confirms — Waypoint #1 verification ATTEMPTS #2-#5 were all on `workflow-2-competition-scraping`. **Today's session WAS correctly on `main`** because it was a DEPLOY session (the W#2 → main merge mechanically requires being on main). But the NEXT session is verification-only, no deploy, so it belongs on the W#2 feature branch. **Corrected next-session instructions captured in two places this addendum commit:** (i) ROADMAP.md W#2 row Next Session cell, new (a.7) RECOMMENDED-NEXT item with branch-checkout commands + corrected launch prompt embedded; (ii) this CORRECTIONS_LOG entry. **Operational lesson:** the protocol's branch table is correct as-is — no protocol change needed. The structural fix is this CORRECTIONS_LOG entry which a future session reading recent CORRECTIONS_LOG entries will see + use as a reminder of the rule. **Specifically — branch-rule cheat sheet for W#k (k ≥ 2) work:** (a) writing/changing W#k code → W#k feature branch; (b) deploying W#k code to vklf.com (merging W#k into main + pushing main) → `main`; (c) browser-verifying deployed W#k code → W#k feature branch (verification doc updates flow to main at next deploy session); (d) cross-workflow infrastructure (e.g., shared components library, platform-wide refactors) → `main`. Cross-references: `MULTI_WORKFLOW_PROTOCOL.md §11` Step 1 (the branch table that's correct); ROADMAP.md W#2 row Next Session (a.7) item (the corrected next-session instructions captured persistently).)

**Previously updated:** May 10, 2026-b (W#2 → main deploy session + P-3 browser-verify — TWO INFORMATIONAL entries: (1) **OPERATIONAL slip — Codespace folder-zip download served what looked like a stale build despite director's full redo of delete + redownload + extract + load.** Symptom: after director's full extension-rebuild flow, DevTools Network showed only `popup.html` / `popup-CMo7bk1g.js` / `popup-D_aALNcA.css` / failed `projects` request — NO `highlight-terms` request fired at all, and the popup chunk filename `popup-CMo7bk1g.js` did not match the freshly-built `popup-CWenFIaG.js`. Fix was to bypass the Codespace folder-zip mechanism via server-side `zip -r .output/plos-extension-2026-05-10-p3.zip .` (single file, unique filename); director downloaded that one file directly and the `highlight-terms` request appeared in the next reload. Lesson: prefer the single-file unique-name zip path for extension transfers when a code-version mismatch is suspected. (2) **PROCESS slip — Claude's first diagnostic was over-engineered.** When the chunk-filename mismatch surfaced, Claude initially proposed a multi-step path-tracing diagnostic (open popup.html in text editor, list chunks subfolder contents, etc.) before director redirected with `"This is unnecessarily complex. Think of a different fix."` Claude switched to the simpler bypass-via-server-side-zip approach. Lesson: when a download-mechanism is the suspected source of staleness, prefer to bypass the suspect mechanism with a different one rather than chasing diagnostic depth into the suspect mechanism.)

**Previously updated:** May 9, 2026-b (W#2 polish session #6 P-6 build + deploy — ONE INFORMATIONAL entry, LOW severity: **OPERATIONAL slip — Step 3 `prisma db push` STOP-gate framed the target as "the dev DB only" when PLOS uses one shared Supabase database for both dev and prod.** During Step 3 of the P-6 plan (the schema-change-confirmation gate), Claude's plain-language description said *"This is the **dev database** (the Supabase project Codespaces is connected to). It is the same database W#2 PLOS-side viewer + extension already use for everything you've tested through Waypoint #1."* That second sentence already hinted at the truth (one shared DB) but the framing as "dev database" was wrong. Director said "Yes — run it" and the push landed `isSponsoredAd Boolean @default(false)` in the **production** Supabase database, before any of the new code that reads/writes the field had been deployed to vklf.com. Safe in this case (additive boolean with `@default(false)`; no data loss; new column simply held the default until vklf.com later got the new code at the same session's two main pushes). Acknowledged + correctly framed mid-session at the dev-vs-prod boundary discussion (Step 14, after director hit the "extension save with checkbox checked doesn't show as sponsored" symptom). **Operational lesson:** PLOS uses one shared Supabase project for code paths labeled "dev" + code paths labeled "prod" — the connection string is the same. `prisma db push` from any Codespaces session targets the shared DB. The "dev" vs "prod" distinction applies to CODE deployment (localhost dev server vs vklf.com Vercel deploy) but NOT to the underlying database. Future schema-change sessions need to factor this in: a `prisma db push` IS a production schema change, even when described as "dev push" in the session script. The right framing for the STOP-gate question: *"This will add the new column to the shared Supabase database that powers both your dev server AND vklf.com prod. The change is additive (new optional boolean with default false) so no existing rows or production behavior break, but the column starts existing in prod immediately — even before the new code that uses it is deployed."* Mitigation pattern for future schema-change sessions: at Step 1 (intent-declaration), explicitly note the one-shared-DB constraint + describe what production-DB state the push will produce + describe how that state interacts with un-deployed code. NOT a critical mistake — the change was additive + safe; no rollback was needed; the production code arrived via main push later in the same session. Captured here so future sessions inherit the awareness. Cross-references: `prisma/schema.prisma` (the column added); the two main pushes in this session (`bc6816c` + `8115138`); `COMPETITION_SCRAPING_DESIGN.md §B` 2026-05-09-b entry (the architectural-decision capture).)
**Previously updated:** May 8, 2026-c (W#2 Waypoint #1 verification attempt #3 — ONE INFORMATIONAL entry: **ARCHITECTURAL finding — content-script CORS architecture lesson surfaced + fixed during attempt #3.** Extension session 3 (shipped 2026-05-07-h) introduced direct-fetch calls from content-script context (`extensions/competition-scraping/src/lib/content-script/orchestrator.ts:107` calling `listCompetitorUrls` for the recognition cache; `url-add-form.ts:221` calling `createCompetitorUrl` for the Save flow). Both calls failed with `TypeError: Failed to fetch` during attempt #3's S3-1 step because **content scripts run in the host page's origin (amazon.com / ebay.com / etc.) — NOT the extension's `chrome-extension://*` origin** — and vklf.com's CORS allowlist (`src/lib/cors.ts:isAllowedOrigin`) only accepts `chrome-extension://*`. Result: every cross-origin fetch from a content script preflight-rejects before the request body is sent. The session-3 build (npm test 246/246, lint clean, tsc clean, build clean) didn't catch this because unit tests mock `api-client.ts` — the CORS layer is a real-Chrome-runtime concern that mocks bypass. The architectural fix (commit `f4226ca`) introduces a messaging proxy (`extensions/competition-scraping/src/lib/content-script/api-bridge.ts`) that routes content-script PLOS API calls through `chrome.runtime.sendMessage` → background service worker (which runs in extension origin where CORS passes) → fetch → typed envelope back to content script. **Bonus side effect:** content.js bundle dropped ~219 KB → ~21 KB because the content script no longer transitively pulls in `auth.ts → supabase` — it now uses a tiny messaging-proxy module instead, with supabase isolated to the popup + background contexts where it's actually needed. **Lesson 1 — Chrome MV3 content-script CORS architecture:** content scripts CANNOT directly fetch cross-origin endpoints that gate on extension origin. Any extension making cross-origin API calls from content scripts MUST route those calls through the background service worker (which runs in extension origin). This is a Chrome MV3 fundamental that wasn't called out in the W#2 design doc up-front. Session-3 shipped the direct-fetch architecture without flagging this constraint; surfaced as a real bug only at verification time. **Lesson 2 — unit-test mocking can hide real-runtime CORS failures:** `api-client.ts`'s `authedFetch` was tested against mocks; in production it ran in content-script context where the `fetch()` call hit a real CORS preflight. Mock-based tests can't catch this; only live-Chrome verification can. **Mitigation pattern for future Chrome extension build sessions:** at session start, identify which contexts (popup / background / content script) each new code path runs in. For cross-origin API calls, ensure ALL non-popup non-background contexts route through messaging. Capture the architectural constraint in `COMPETITION_SCRAPING_DESIGN.md §B` BEFORE building the path. **NOT a critical mistake** — caught at the verification waypoint which is BY DESIGN the catch-net for these gaps; fixed inline same session; production never exposed to the broken path because vklf.com runs `main` and the broken extension code never reached an end user (extension is not yet on Chrome Web Store; only loaded as unpacked by the director for verification). Cross-references: `extensions/competition-scraping/src/lib/content-script/api-bridge.ts` (the messaging proxy); `extensions/competition-scraping/src/entrypoints/background.ts` (the message listener at the end of `defineBackground`); `src/lib/cors.ts:isAllowedOrigin` (the CORS allowlist that rejected page-origin calls); `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` Waypoint #1 attempt #3 row (where the bug surfaced); `docs/COMPETITION_SCRAPING_DESIGN.md §B` 2026-05-08-c entry (post-implementation architectural clarification).)
**Previously updated:** May 8, 2026-b (W#2 Waypoint #1 verification attempt #2 — ONE INFORMATIONAL entry: **PROCESS-quality finding — 2026-05-08 W#2 → main deploy session declared 'W#1 visual verification PASSED' + 'W#2 PLOS-side visual verification PASSED' without exercising two verification-relevant code paths that surface only under specific conditions; both gaps surfaced during 2026-05-08-b Waypoint #1 attempt #2.** **Finding 1 — apex→www CORS redirect blocker (extension-preflight gap):** Vercel domain config 308-redirects `vklf.com` (apex) → `www.vklf.com` at the edge BEFORE the route handler runs. Transparent for normal page navigation (which is what the deploy session tested) but fatal for CORS preflight (only the extension hits this path). Director re-attempted Step 8 sign-in → project-list load and got `Access to fetch at 'https://www.vklf.com/api/projects' (redirected from 'https://vklf.com/api/projects') from origin 'chrome-extension://...' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.` Different cause than 2026-05-07-i blocker (which was the CORS handler not being on main at all). The OPTIONS handler in `route.ts` (commit `5b4a3e8`, deployed in `e4232ec`) is correct — it just never gets reached. Fix: extension `PLOS_API_BASE_URL` + `host_permissions` changed from `vklf.com` to canonical `www.vklf.com`. Commit `5472d26` on `workflow-2-competition-scraping`. Lesson: deploy verification scope should explicitly include the extension's `listProjects()` round-trip (the CORS-preflighted API call), not just page-render checks, when the deploy contains extension-facing API surface. **Finding 2 — token-refresh-on-stale-session UX gap (web app polish gap):** Director returned to vklf.com hours after the deploy session and got `Could not load Projects (401): {"error":"Invalid or expired token"}` on the projects list. Root cause: Supabase access token (1-hour TTL) had expired during the gap; refresh-token attempt didn't fire silently because no vklf.com tab was active to run the auto-refresh. The web app surfaces the 401 directly instead of catching it, attempting a refresh, and retrying. The deploy session's verification didn't catch this because the verification window itself was inside the actively-signed-in 1-hour window — token expiry only manifests with elapsed time. Lesson: deploy verification scope should include 'come back N hours later and re-test' for sessions that depend on JWT freshness, OR the auth path should be polished to silent-refresh-and-retry so this gap doesn't surface to users. Both findings together unify under the theme 'deploy verification scope was incomplete for code paths that only surface under specific conditions (CORS preflight; token-refresh after elapsed time).' **Operational lesson for future deploy sessions:** when the deploy contains code surface that only surfaces under specific conditions (extension preflight that exercises full CORS chain; auth flows that depend on JWT freshness over hours), the verification scope MUST exercise those conditions explicitly — visual page-render checks against same-window-fresh-sign-in WILL miss them. Mitigation pattern: every deploy session's pre-verification checklist should ask 'what code paths in this deploy have specific surfacing conditions, and have I exercised each?' before declaring PASSED. NOT a critical mistake — neither finding blocked W#1 production traffic; both surfaced in the next session's verification window which is by design the catch-net for these gaps. Cross-references: `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` Waypoint #1 attempt #2 row (the attempt that surfaced both findings); `docs/ROADMAP.md` NEW W#2 polish backlog (P-1 silent token refresh + P-2 extension offline handling); fix commit `5472d26` (CORS resolution); the polish gap for token-refresh + the polish gap for extension offline handling both captured as ROADMAP Phase-1 items rather than fixed inline.)
**Last updated in session:** session_2026-05-10-c_w2-main-deploy-and-p9-p10-browser-verify-and-p2-deferred (Claude Code, on `main` branch — Reconciled main↔W#2 divergence via rebase + force-push to W#2 + ff-only merge to main + push origin/main → Vercel auto-redeploy; new commits on main `d2e2115` ext code + `cc843a7` resolved-conflict doc-batch; P-9 + P-10 ALL STEPS PASSED on vklf.com; P-2 deferred with corrected test sequence — DEFERRED task #6; THREE INFORMATIONAL entries captured this session: (1) divergence root cause + structural fix proposal; (2) P-2 spec-design gap conflated supabase-auth + authedFetch paths; (3) verification-spec gap on refresh-after-platform-switch)
**Previously updated in session:** session_2026-05-10-b_w2-main-deploy-and-p-3-browser-verify (Claude Code, on `main` branch — W#2 → main fast-forward merge of W#2 commits 16d4351 + 8a6e3b5 per MULTI_WORKFLOW_PROTOCOL §11.1; pushed to origin/main; Vercel auto-redeployed; P-3 browser-verified ALL THREE PATHS on vklf.com; mid-session two slips captured)
**Previously updated in session:** session_2026-05-09-b_w2-polish-session-6-p-6-sponsored-ad-build-and-deploy (Claude Code, on `main` branch — code authored on `workflow-2-competition-scraping` then deployed via fast-forward merge to `main`; doc-batch commit lands on `main` directly)
**Previously updated in session:** session_2026-05-08-c_w2-waypoint-1-verification-attempt-3-extension-session-3 (Claude Code, on `workflow-2-competition-scraping` branch)
**Previously updated in session:** session_2026-05-08-b_w2-waypoint-1-verification-pass-1-attempt-2 (Claude Code, on `workflow-2-competition-scraping` branch)
**Previously updated:** May 7, 2026 (W#2 PLOS-side viewer slice (a.1) — ONE INFORMATIONAL entry: **PROCESS-quality finding — ROADMAP wording asserted GET read paths existed when only POST/PATCH/DELETE were shipped.** The W#2 ROADMAP "Current Active Tools" row's Next Session item (a.1) said *"Builds against session-2's `GET .../urls/[urlId]/text` + `GET .../urls/[urlId]/images` (or whichever read paths apply)."* On reading the actual session-2 commit (`26df900`) and session-3 commit (`82810a2`) at the start of slice (a.1), Claude found that NO GET handlers had shipped on `urls/[urlId]`, `urls/[urlId]/text`, `urls/[urlId]/sizes`, or `urls/[urlId]/images` — only POST/PATCH/DELETE handlers. The "or whichever read paths apply" parenthetical was load-bearing in retrospect but easy to miss; the primary clause asserted GETs existed. Slice (a.1) added the four GET handlers in the same session as the detail page — additive, mechanical, no scope expansion beyond what the slice already needed; surfaced upfront in the start-of-session drift check. **NOT a critical mistake** — caught at session start during code-reading, not at production time; no rework. **Operational lesson for future end-of-session ROADMAP authoring:** when listing "what the next slice builds against," distinguish (a) endpoints/types that DO exist today + are tested vs. (b) endpoints/types that the next slice ITSELF will need to add. Mixing the two with parenthetical hedges produces optimistic wording that subsequent sessions inherit. Mitigation pattern: phrase next-session items as "**adds** GET .../urls/[urlId]/text + **uses** existing GET .../urls" rather than "builds against GET .../urls/[urlId]/text (or whichever read paths apply)." Cross-references: `docs/ROADMAP.md` 2026-05-07 W#2 row Next Session item (a.1) (updated this session to reflect actual scope); the four new GET handlers shipped this session in code commit `439a240`.)
**Last updated in session:** session_2026-05-07_w2-plos-side-viewer-detail-page-slice (Claude Code, on `workflow-2-competition-scraping` branch)
**Previously updated:** May 8, 2026 (W#2 API-routes session-3 — ONE INFORMATIONAL entry: **PROCESS-quality finding — small drift between session-2's reported test-count baseline and the actual baseline on the W#2 branch; minor wording squint about "existing `vercel.json` cron pattern."** During session-3's verification scoreboard, running `node --test --experimental-strip-types src/lib/*.test.ts` against the pre-edit working tree (via `git stash`) reported `tests 369` — but session-2's ROADMAP entry + DOCUMENT_MANIFEST entry had said "382/382 src/lib tests pass (was 360; +22 new from competition-storage-helpers.test.ts)." The 13-test discrepancy doesn't change any conclusions (all tests pass; 11 new tests added cleanly; full suite ends at 380/380); but it surfaces that the prior session's test-count claim was off, possibly counted suite-level entries or includes test files outside `src/lib/*.test.ts`. **Operational lesson:** the canonical "X/X src/lib tests pass" number reported in session-end docs should come directly from the `node --test` output's `ℹ tests N` line at the time of running against the pre-edit working tree, not from a derived calculation. Future sessions can sanity-check the number by running the same command in a clean stash before touching code, mirroring what session-3 did to surface this drift. Separately, the W#2 ROADMAP "Next Session" item (a) said "wires the existing `vercel.json` cron pattern (new file)" — the parenthetical "(new file)" correctly flagged this would be a new file, but the word "existing" was imprecise since no `vercel.json` existed in the repo before today. Caught at session start during the drift check; acknowledged in the start-of-session drift summary; no action needed beyond noting it here. NOT critical mistakes — neither blocked work; both flagged here so future sessions inherit the awareness. Cross-references: `docs/ROADMAP.md` 2026-05-07 W#2 row + `docs/DOCUMENT_MANIFEST.md` session-2 entry (the "382" claim); `vercel.json` (the new file landed today).)
**Last updated in session:** session_2026-05-08_w2-api-routes-session-3 (Claude Code, on `workflow-2-competition-scraping` branch)
**Previously updated:** May 7, 2026 (W#2 API-routes session-2 — ONE INFORMATIONAL entry: **PROCESS-quality finding — `COMPETITION_SCRAPING_STACK_DECISIONS.md §11.1` had two implementability gaps that surfaced during code-write time, not at the design-session freeze.** The §11.1 route table specified the image RPC pair as `POST .../urls/[urlId]/images:requestUpload` and `POST .../urls/[urlId]/images:finalize` using Google AIP-136 colon-suffix RPC convention. At code-write time, AGENTS.md's "verify Next.js conventions before writing any code" rule prompted a check of the App Router routing docs (`node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`); the docs document no support for `:` in folder names. Compounding concern: the existing repo uses slash-based sub-resources throughout (`canvas/sister-links`, `canvas/pathways`, `removed-keywords/[id]/restore`); zero precedent for colon-RPC paths. Pivoted to `images/requestUpload` and `images/finalize` per Rule 15 (autonomous decision, no user-visible difference; flagged via deferred TaskList for end-of-session §11.1 doc batch update). Separately, the §11.1 finalize body shape `{ clientId, capturedImageId, composition?, embeddedText?, tags? }` was insufficient for server-side row creation: the schema's required `mimeType` + `sourceType` columns and the storagePath re-derivation step both need values that aren't stateless between `:requestUpload` and `:finalize`. Extended the finalize body with `mimeType` + `sourceType` (required) + `fileSize` + `imageCategory` (optional) — all echoed from the extension's WAL; same Rule 15 disposition + same end-of-session §11.1 batch update. Both deviations are additive (no contracts removed) and the extension hasn't been built yet so route-rename cost is still cheap per §11.3. **NOT a critical mistake** — caught immediately at code-write time; corrected before any commit landed; spec doc updated end-of-session in the same batch. **Operational lesson for future Workflow Stack-and-Architecture sessions (W#3 onward):** the `§11.1 Route table` author should (a) cross-check route shapes against Next.js App Router folder conventions + repo precedent before freezing; (b) cross-check finalize-body shapes against the schema's required columns to confirm the server can derive everything it needs at finalize time without keeping intermediate state between phases of multi-step flows. Both checks are 30-second diff-against-existing-code passes that catch this class of gap before it surfaces at the build session. Cross-references: `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/images/requestUpload/route.ts` + `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/images/finalize/route.ts` (the routes that surfaced the gaps); `docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §11.1` (updated end-of-session); shared types at `src/lib/shared-types/competition-scraping.ts` (updated in lockstep).)
**Last updated in session:** session_2026-05-07_w2-api-routes-session-2 (Claude Code, on `workflow-2-competition-scraping` branch)
**Previously updated:** May 7, 2026 (W#2 API-routes session-1 — ONE INFORMATIONAL entry: **OPERATIONAL slip — `next/server` import in a `src/lib/*.ts` helper broke the node:test runner.** The CORS helper (`src/lib/cors.ts`) was initially written as a single file containing both pure functions (`isAllowedOrigin`, `corsHeaders`) AND Next-aware factories (`corsPreflightResponse`, `withCors`) sharing a top-level `import { NextRequest, NextResponse } from 'next/server'`. The companion test file `src/lib/cors.test.ts` only imported the pure functions, but `node --test --experimental-strip-types` evaluated the entire module — including the `next/server` import — at load time. Node ESM resolved the bare specifier `'next/server'` differently than the Next.js bundler does and threw `ERR_MODULE_NOT_FOUND` ("Cannot find module 'next/server'. Did you mean to import 'next/server.js'?"). Tests failed at file-level before any test ran. The fix was a one-minute split: keep the pure logic in `cors.ts` (no `next/server` import → unit-testable in isolation) + put the `NextResponse`-using factories in a sibling `cors-response.ts`. Both files re-export cleanly to route handlers; the test file re-ran with all 11 tests passing. **Operational lesson for future Claude Code sessions writing `src/lib/*.ts` helpers intended to be unit-tested via node:test:** any top-level `import` from `next/server`, `next/navigation`, `next/headers`, or another Next-only package will blow up the test runner at module-eval time, even if the test file only imports pure functions from the module. Mitigation: keep pure logic in test-friendly modules (no Next-only imports); put Next-aware factories in sibling modules that wrap the pure helpers. The split adds one file per concern but is structurally aligned with how the rest of `src/lib/` is organized — `prisma-retry.ts` (pure, no Next imports) is unit-tested via `prisma-retry.test.ts`; `flake-counter.ts` (pure) via `flake-counter.test.ts`; etc. NOT a critical mistake — caught immediately on first test run; ~3 minutes lost on the refactor; no user-facing impact. Cross-references: `src/lib/cors.ts` + `src/lib/cors-response.ts` (the split); `src/lib/cors.test.ts` (passes after split); existing `src/lib/prisma-retry.ts` + `src/lib/flake-counter.ts` as the canonical pure-helper pattern.)
**Last updated in session:** session_2026-05-07_w2-api-routes-session-1 (Claude Code, on `workflow-2-competition-scraping` branch)
**Previously updated:** May 6, 2026 (W#2 PLOS-side build first slice session — ONE INFORMATIONAL entry: in-session typecheck-driven prop-shape adjustments. The new W#2 page draft used (a) `STATUS_BADGE_LOADING_PALETTE.background` when the actual field name is `bg` (per `src/lib/workflow-components/status-badge-palette.ts`); (b) WorkerCompletionButton prop set assumed `userRole` / `workflowName` / `currentStatus` / `onComplete` — actual props per `src/lib/workflow-components/worker-completion-button.tsx` are `reviewCycle` / `workflowStatus` / `readyToStart` / `onComplete` (no `userRole` or `workflowName`). Both errors caught immediately by tsc; corrected in seconds via Edit. **Operational lesson:** when consuming a fresh component library for the first time, read the component's source file (or its TypeScript prop interface) BEFORE writing the consumer page — don't infer the prop shape from the smoke-test page alone, which used a slightly different prop combination. The components library at `src/lib/workflow-components/` is the canonical source. NOT a critical mistake — caught at build time, not runtime; user never saw broken UI; ~30s lost re-editing two prop blocks.)
**Last updated in session:** session_2026-05-06_w2-plos-side-build-first-slice (Claude Code, on `workflow-2-competition-scraping` branch)
**Previously updated:** May 5, 2026-d (D3 RESUME COMPLETED + Auto-Analyze defaults deployed + Option A invisibility VERIFIED LIVE AT SCALE session — THREE new INFORMATIONAL entries: (1) **PROCESS-level slip — batch-vs-keyword miscount in mid-session projection.** During D3 resume launch, Claude said "batch 1 of ~26" when the correct count was "batch 1 of ~204." Conflated keywords with batches in the math (8 keywords/batch × ~205 batches ≈ 1632 keywords, NOT 1640 keywords ÷ 8 = 26 batches). Director caught implicitly by sharing pre-flight output showing 1632 in-scope keywords. Operational lesson: when projecting batch counts, do unit conversion explicitly (keywords ÷ batch_size = batches) rather than pattern-matching to a recalled number. (2) **PROCESS-level slip recurrence — re-asking director to verify settings that persist via UserPreference.** Across multiple sessions, Claude has asked director to "verify Thinking settings before each run" or similar. Settings persist per-project via the UserPreference DB table (per ROADMAP item #8 B1 settings persistence shipped 2026-04-24). Re-asking is unnecessary friction — adjacent to Rule 14g (trust director's setup confirmation). Operational lesson: at session start, Claude should read persisted settings (or just confirm correct in prior successful run per STATE block) and not re-ask. The right structural fix is to make pre-flight + activity-log surface canonical settings on every run (captured in ROADMAP pre-flight visibility entry extension) — once shipped, Claude can point director to visible activity log line instead of asking. (3) **OPERATIONAL finding (NEW failure mode) — Anthropic API credit exhaustion mid-run halted D3 resume for ~36 min.** Batch 85 failed three retries at 8:06:52 PM with `HTTP 400: Your credit balance is too low.` Run halted until director topped up at 8:42:28 PM; resumed cleanly. **No proactive warning before failure.** This is a NEW failure mode not previously documented — long unattended runs can be silently halted by API-credit exhaustion. Director was available to top up; another time they might not be. Captured as ROADMAP NEW MEDIUM "Auto-Analyze cost forecasting + credit-balance check" with sliding-window estimator algorithm spec covering pre-flight check + in-run heartbeat + abort threshold. Operational lesson at the platform-discipline level: long unattended runs need a credit-budget gate at launch + in-flight heartbeat warning; estimating run cost vs. credit balance before launching is a structural-defense pattern that generalizes beyond Auto-Analyze to any future long-running AI workflow.)
**Last updated in session:** session_2026-05-05-d_d3-resume-completed-and-defaults-deployed (Claude Code)
**Previously updated:** May 5, 2026-c (Shared Workflow Components Library Phase-1 build session — ONE INFORMATIONAL entry: OPERATIONAL slip — **Next.js App Router private-folder convention surprised initial smoke-test page placement.** When the Phase-1 components library smoke-test page was first written, Claude placed it at `src/app/__components-smoke-test/page.tsx` thinking the leading double-underscore would visually flag the path as "internal use only." The build succeeded but the route did not appear in the route list — Next.js App Router treats folders prefixed with `_` (single OR double underscore) as **private folders** that opt out of routing entirely. Captured in `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md` as one of the routing conventions; Claude had not read this file before writing the page. The fix was a one-command rename to `src/app/components-smoke-test/page.tsx` — route registered correctly on the next build. **Operational lesson for future Claude Code sessions touching App Router routing:** when adding a new route, verify the folder name doesn't start with `_` (private folder), `(` (route group — folder name in parens is excluded from URL path), or `@` (parallel route slot). The CLAUDE_CODE_STARTER's mandate to "Read the relevant guide in `node_modules/next/dist/docs/` before writing any code" applies particularly to folder-naming decisions in `src/app/`. NOT a critical mistake — the slip was caught immediately when the build output didn't show the new route, then fixed in under a minute. Cross-references: AGENTS.md ("This is NOT the Next.js you know"), `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`. ONE new INFORMATIONAL entry only.)
**Last updated in session:** session_2026-05-05-c_components-library-phase-1-build (Claude Code)
**Previously updated:** May 5, 2026-b (Sister-link consolidation drift cleanup session — ONE new entry: PROCESS-level slip — **defense-in-depth-as-default-pattern over-prescription, caught mid-session by director's "don't think about pink elephants" architectural challenge.** When Claude began the cleanup, the original framing was the standard defense-in-depth pattern this codebase uses elsewhere (the 2026-05-03-c regular-batch sister-link deferral did this; the 2026-05-01 ADD_TOPIC + ADD_KEYWORD lock did this) — explicit prompt forbiddance + applier-side rejection + tests. Claude executed the pattern: prompt edits enumerated `ADD_SISTER_LINK` and `REMOVE_SISTER_LINK` in multiple FORBIDDEN-OPERATIONS sections with explicit deferral-rationale prose; applier `consolidationMode` was tightened to reject the four ops; tests were added. After the Read-It-Back of the deferral framing, director surfaced the architectural concern: *"Why are we mentioning sister-links at all in any prompts? Wouldn't that further confuse the model? I want you to think about whether it is better to simply not mention sister links at all in the prompt so that sister links are not even a part of the thinking process in the Auto Analyze."* The challenge surfaced two separate failure modes: (a) **explicit forbiddance is a "pink elephants" priming pattern** — telling a model "do NOT emit X" still makes the model think about X; combined with the visible Sister Nodes column in TSV input AND prior V4 prompts having included sister-link ops in training-context conversations, the prompt's explicit-forbiddance language was the worst combination (cognitive load + visible signal that primes prohibited operations); (b) Claude had defaulted to the established defense-in-depth pattern without questioning whether the underlying scenario warranted it. Pivoted mid-session to Option A — make sister links truly invisible to the consolidation model (Sister Nodes column dropped from TSV input; sister-link op names never enumerated in prompt; applier rejection retained as silent backstop). Original prompt edits reverted; final implementation is structurally cleaner. **Operational lessons:** (1) before applying an established codebase pattern, ask whether the underlying problem actually fits the pattern's failure-mode profile — defense-in-depth assumes the model benefits from being told what's forbidden, but for AI-as-component scenarios where the model has prior-pattern training, explicit forbiddance may be net-negative; (2) when a Read-It-Back surfaces "why are we doing X at all" rather than "rephrase X" feedback, treat it as an architectural challenge that may warrant scope expansion, not a wording revision; (3) mid-session pivots to "most thorough and reliable" (per `feedback_recommendation_style.md`) are correct even when they expand original LOC estimate — original ~10-20 LOC scope grew to ~115 LOC across 5 files; worth it for the structural correctness gain; (4) the `omitSisterNodesColumn` flag pattern (default-false, additive option on existing serializer) is reusable for future analogous "make this data invisible to a specific call site" scenarios. NOT a critical mistake — the original implementation passed tests and was technically correct against the literal Task #12 spec from the prior STATE block ("drop ADD_SISTER_LINK + REMOVE_SISTER_LINK from consolidation prompt vocabulary listing; tighten consolidationMode in applier"); the director's question reframed the underlying intent more thoroughly than the original deferral capture had. Cross-references: prior session's CORRECTIONS_LOG entry on the original drift surfacing (2026-05-05); `feedback_recommendation_style.md` (most-thorough-and-reliable preference); `feedback_avoid_over_prescribing.md` (similar architectural over-prescription pattern, 2026-05-04 session, three recurrences in one session). Doc updates this session: `AUTO_ANALYZE_CONSOLIDATION_PROMPT_V4.md` Option A rewrite; `KEYWORD_CLUSTERING_ACTIVE.md` new STATE block; `ROADMAP.md` Active Tools row + drift-entry resolution; `CORRECTIONS_LOG.md` (this entry); `CHAT_REGISTRY.md` new top row; `DOCUMENT_MANIFEST.md` timestamps. Code: 5 files modified, +9 net new tests, 336/336 src/lib pass, baseline parity on tsc + build + lint.)
**Last updated in session:** session_2026-05-05-b_sister-link-consolidation-drift-cleanup (Claude Code)
**Previously updated (on `workflow-2-competition-scraping` feature branch):** May 5, 2026 (W#2 doc-reframe session — ONE new entry: INFORMATIONAL — Rule 26 cross-branch TaskList persistence gap. At session start on `workflow-2-competition-scraping`, `TaskList` came back EMPTY despite Tasks #8 + #9 having been registered via `TaskCreate` during `session_2026-05-04_workflow-tool-scaffold-design` on `main` per Rule 26's deferred-items registry pattern. The TaskList state did not persist across the main → workflow-2 branch boundary — TaskList is per-session-scoped, not git-tracked, so registering a task on branch X for execution on branch Y leaves the registry invisible from branch Y. Work was NOT blocked because the director's launch prompt fully specified Tasks #8 + #9's content verbatim; but this exposes a real robustness gap in Rule 26's "TaskList is the canonical externally-observable deferred-items registry" framing when the deferring session's branch and the executing session's branch differ. Operational mitigation (already followed today implicitly): when a deferring session sets up future work on a different branch, the destination-doc-and-section name MUST be embedded in the launch prompt instruction itself per Rule 14e — the deferring session cannot rely on cross-branch TaskList visibility. This was already partially encoded in the `dffd4d9` commit message which named the three docs explicitly + said "must run as the FIRST item of [the next W#2] session" — that prose successfully carried the intent across the branch boundary even though the TaskList didn't. Future architectural improvement option (deferred decision): if cross-branch defer-registry visibility is required, TaskCreate state could be promoted to a git-tracked doc — but that's a methodology-design decision, not a today-fix. Captured here as INFORMATIONAL because (a) work was not blocked, (b) the existing instructions already covered the case via Rule 14e's destination-naming-in-same-sentence, (c) the implicit operational pattern (launch prompt names destinations) is a viable mitigation. NOT a critical failure — just an architectural gap in Rule 26 that future sessions should be aware of when deferring across branches.)
**Previously updated in session:** session_2026-05-05_w2-doc-reframe (Claude Code, on `workflow-2-competition-scraping` branch)
**Previously updated (on `workflow-2-competition-scraping` feature branch):** May 4, 2026 (W#2 Stack-and-Architecture session — ONE new entry: INFORMATIONAL — `COMPETITION_SCRAPING_DESIGN.md §A.17` Q2 (auth pattern) framing missed the direct-credentials option. The §A.17 question listed only "long-lived API tokens vs OAuth 2.0 device flow," but the director's free-form brief at §A.15 explicitly says *"there should be a way for the user to enter their credentials to log into the extension"* — pointing to a third option (direct `signInWithPassword`) that wasn't in the question's option set. Surfaced this session by Claude during Cluster 1 review of Q2 — re-reading the brief with fresh eyes flagged the omission. Director chose the previously-missing direct-credentials option (Option A in this session). NOT a bug; not user-caught — process-quality slip in the prior W#2 Workflow Requirements Interview session. Operational lesson: when authoring a "deferred implementation questions" section for a workflow, Claude should explicitly cross-check the option set against the director's free-form brief (if one was provided) before freezing the section. The brief is high-context primary source; the structured Q&A is a derived artifact that can mis-condense. Future Workflow Requirements Interviews (W#3 onward) should add this cross-check as a step before freezing §A.17 (or its equivalent). Captured in `COMPETITION_SCRAPING_DESIGN.md §B` 2026-05-04 entry. NO impact on the prior session's deliverables — the right option was eventually picked; the cost was one round-trip of explaining the missed option to the director mid-Cluster-1.)
**Previously updated in session:** session_2026-05-04_w2-stack-and-architecture (Claude Code, on `workflow-2-competition-scraping` branch)
**Previously updated:** May 4, 2026 (Workflow-Tool Scaffold → Components Library design pivot session, third doc-only commit — ONE additional INFORMATIONAL entry on top of the over-prescribing entry: PROCESS-level slip — **incomplete grep-sweep when retiring an architectural vocabulary term.** When this session retired the "Shared Workflow-Tool Scaffold" framing in favor of "Shared Workflow Components Library," the first two commits updated the obvious top-level architectural references (`PLATFORM_REQUIREMENTS.md §12`, `HANDOFF_PROTOCOL.md` Rule 20 + 22 + 25 + §4 Step 4b, `PLATFORM_ARCHITECTURE.md` line 477, the `MULTI_WORKFLOW_PROTOCOL.md` reframes, the `CLAUDE_CODE_STARTER.md` updates) but missed the additional in-context references at: `ROADMAP.md` lines 1895/1897/1900/1908/1922/1956/1961/2045 (W#2/3/5 prereqs + Phase 1α section + blocker entry), `KEYWORD_CLUSTERING_ACTIVE.md` lines 3852/4221 (audit-helper + scale-gap references), `PROJECT_CONTEXT.md` line 349 (Workflow Requirements Interview list), `DOCUMENTATION_ARCHITECTURE.md` lines 350/367-371 (interview Q14 + §14.5 section). Director caught the gap by asking "Did you update the main branch to-do items in the roadmap and instructions for Workflow #1?" — a `grep -i scaffold docs/` sweep would have surfaced these in 2 seconds. **Operational lesson:** when an architectural pivot retires a vocabulary term, a comprehensive `grep -i <term> docs/` sweep across all docs is mandatory cleanup BEFORE the doc-only batch commits. The sweep distinguishes architectural references (need updating) from figurative uses (e.g., "narrative scaffolding" — leave alone). All stale architectural refs cleaned up in the third doc-only commit this session. NOT a critical mistake — the canonical docs were correctly updated in commits 1+2; the stale wording in lower-priority docs would have produced confusion in future sessions but not broken anything. ONE new INFORMATIONAL entry on top of the over-prescribing entry below.)
**Last updated in session:** session_2026-05-04_workflow-tool-scaffold-design (Claude Code; third doc-only commit)
**Previously updated:** May 4, 2026 (Workflow-Tool Scaffold → Components Library design pivot session, first + second doc-only commits — ONE INFORMATIONAL entry: PROCESS-level recurring failure mode — **over-prescribing blanket rules without concrete user need.** Caught THREE times in a single session (a notable recurrence pattern): (1) Cluster 2 — Claude framed standard form-based content area as default with custom React component as the swap-in; director's correction "don't over-apply the design from W#2 to other workflows because most workflows will have a unique setup and UI after the user clicks into it." (2) Cluster 3 Decision 3C — Claude prescribed a specific helper signature + AuditEvent schema for a Phase-2 audit feature where no workflow has yet declared concrete audit requirements; director's correction "I feel like you are applying a blanket rule where one might not need to exist." (3) Architectural pivot question after Cluster 4 — director questioned the entire scaffold-as-shell premise ("why are you even building a scaffold..."), surfacing that `PLATFORM_REQUIREMENTS.md §12.1`'s "most remaining workflows are genuinely simpler" framing was inaccurate vs the lived reality that most workflows are unique-once-clicked-into. THREE memory entries codified the operational lessons: `project_future_workflows_custom_ui.md` (custom-is-norm posture — scaffold gives consistent chrome, NOT a UI template); `feedback_avoid_over_prescribing.md` (structural decisions frozen, signature details provisional when no concrete workflow demand exists); `project_scaffold_pivot_to_components_library.md` (the architectural pivot itself). **Operational lessons:** (a) when designing scaffold-level / platform-level architecture, classify each decision into "structural" (worth specifying now) vs "signature details" (defer until concrete requirements surface); (b) never assume one workflow's UI shape generalizes to all workflows — Claude's training disposition to find unifying patterns is a genuine bias to actively counter when designing cross-workflow infrastructure; (c) periodically question the load-bearing assumptions of the architectural framing inherited from earlier docs — `§12.1`'s "most remaining workflows are simpler" framing was inherited without challenge through clusters 1-4 of today's session before director's question 3 surfaced it; the questioning should have happened at cluster 0 (drift check) rather than after cluster 4. NOT a bug-related mistake — the pivot improved the design substantively. Doc updates this session: PLATFORM_REQUIREMENTS §12 rewrite, HANDOFF_PROTOCOL Rule 20 reframe, PLATFORM_ARCHITECTURE line 477 update, new WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md (renamed from WORKFLOW_SCAFFOLD_DESIGN.md mid-session). Two W#2-branch deferred tasks captured per Rule 26.)
**Last updated in session:** session_2026-05-04_workflow-tool-scaffold-design (Claude Code)
**Previously updated:** May 5, 2026 (Atomic-batch fold-in shipped + verified live session — ONE new entry: MEDIUM-severity plan↔code drift — sister-link ops still allowed in consolidation pass despite director's standing plan that sister links should NOT be in any Auto-Analyze pass (they belong in a separate second-pass functionality). The 2026-05-03-c recency-stickiness fix correctly deferred ADD_SISTER_LINK + REMOVE_SISTER_LINK out of regular batches via the `regularBatchMode` applier flag, but did NOT extend the deferral to consolidation. Current shipped state: `docs/AUTO_ANALYZE_CONSOLIDATION_PROMPT_V4.md` lines ~190-195 still list both ops in the consolidation vocabulary; `src/lib/operation-applier.ts` `consolidationMode` only rejects ADD_TOPIC + ADD_KEYWORD. Surfaced mid-D3 by director after consolidation #1 emitted 3 sister-link ops at 10:47 AM. Drift this session: +3 sister links (consolidation #1); consolidations #2, #3, #4, #5 all emitted 0 sister-link ops despite the prompt allowing them. Cleanup deferred to next session (Task #12 in TaskList): drop both ops from consolidation prompt vocabulary + tighten consolidationMode in applier to reject them as defense-in-depth (mirrors regularBatchMode pattern); ~10-20 LOC. Operational lesson: when a fix solves problem-A by restricting some op set in code-path-A, audit code-path-B (and code-path-C, etc.) for the same restriction even when path-B was nominally out-of-scope of the original problem statement. The 2026-05-03-c fix correctly named "sister-link op deferral to consolidation-only" in its own STATE block — the framing was technically aligned with the plan as it then stood, but the director's underlying intent was "no sister links in Auto-Analyze at all" and that intent didn't make it into a destination doc until tonight. Surfacing principle: future "we'll defer X to a later phase / future feature" decisions should be captured in a doc + cross-referenced from any related fix, so future fixes targeting adjacent code paths can verify alignment.)
**Last updated in session:** session_2026-05-05_atomic-batch-fold-in-shipped-and-verified (Claude Code)
**Previously updated:** May 4, 2026-d (Pool-tune small-batch test — INSUFFICIENT session — TWO new entries: (1) MEDIUM-severity Rule 14e mid-session slip — Claude said "I'll capture this as a sanity-check item in the deferred sweep too" without naming the destination doc + section in the same sentence, violating Rule 14e even as worded today. Caught + corrected via TaskCreate registry pattern + triggered codification of HANDOFF_PROTOCOL.md Rule 26 (NEW) — real-time deferred-items registry. (2) MEDIUM-severity recurring slip — Claude has repeatedly told the director the Auto-Analyze Resume button surfaces P1-P12 pre-flight check results visibly to the director when in fact it does NOT. Caught + corrected mid-session by director's explicit correction; new ROADMAP polish item to surface the pre-flight; operational lesson: default to "tell me what you see" before describing UI flow when there's any prior history of UI-flow uncertainty.)
**Last updated in session:** session_2026-05-04-d_pool-tune-small-batch-test-insufficient (Claude Code)
**Previously updated:** May 3, 2026 (cold-start render-layer fix session — ONE new entry: INFORMATIONAL — React `react-hooks/purity` rule traces through same-file `useCallback` boundaries to flag synchronous setState inside the called function when invoked from a `useEffect`, even when the setState fires after an `await`. Caught mid-session as a 3-error lint regression on `KeywordWorkspace.tsx`; fixed by (a) dropping the synchronous pre-await `setFetchStatus(..., 'loading')` calls (the banner doesn't need that state — only 'retrying' and 'exhausted' which both fire post-await) AND (b) wrapping the useEffect call in an IIFE so the linter's same-file useCallback tracing terminates at the IIFE rather than reaching the post-await setState. Reporting-precision lesson — NOT a mistake; the rule's tracing scope wasn't apparent until the lint output showed it. Operational lesson: any future useEffect that calls a same-file useCallback containing setState should pre-emptively wrap the call in an IIFE. Lint went baseline 16e/41w → 19e/41w → back to 16e/41w after both fixes.)
**Previously updated:** May 2, 2026-d (HTTP 500 retry regression investigation — fourth session of 2026-05-02. ONE new entry: INFORMATIONAL — morning-vs-afternoon retry-rate evidence reframe. Re-reading the morning's `2026-05-02` POST-state evidence vs afternoon's `2026-05-02-c` retry trajectory showed `df09611` did NOT regress — it correctly halved state-fetch failures; the underlying ~25% rate at scale was always there, masked in morning's session by small-sample (9 fetch opportunities) / small-canvas (≤43 topics). Reporting-precision lesson — NOT a mistake; the morning session's "VERIFIED" closure of the original 30%-storm-rate concern was technically premature given sample size, but the fix DID work as designed. Today's code fix addresses the partial-apply state recovery problem at the recovery layer.)
**Last updated in session:** session_2026-05-02-d_http-500-retry-regression-investigation (Claude Code)
**Previously updated in session:** session_2026-05-02-c_devtools-profiling-pass (Claude Code)
**Previously updated:** May 2, 2026 (HTTP 500 fix verification + auto-fire trip observation session — first of 2026-05-02. TWO new entries: (1) PROCESS-level slip — recommendation-style placement: Claude omitted the `(recommended)` marker from picker labels at the start of session, despite the rule existing in `feedback_recommendation_style.md`; director caught + reinforced ("the recommendation should be one that is the most thorough and... make absolutely sure every next session understands this as well"); memory file strengthened with explicit "marker must live INSIDE picker label" requirement; HANDOFF_PROTOCOL.md Rule 14f content-#4 + CLAUDE_CODE_STARTER.md Rule 3 codified. (2) PROCESS-level slip recurrence — setup-confirmation re-asking: Claude asked the director to re-confirm consolidation prompts were pasted (because pre-flight didn't show their char counts) despite director having already affirmed "all set as requested" — this was a clean repeat of the same slip from `2026-05-01-c`; director caught + clarified ("you asked this same question in the last session as well even though I pasted all 4 prompts — the tool does not recognize that all 4 prompts were added; this issue needs to be fixed"); pre-flight runner extended this session with P11 + P12 checks closing the structural cause; HANDOFF_PROTOCOL.md Rule 14g (NEW) + CLAUDE_CODE_STARTER.md Rule 7 codified the trust-director-affirmation principle for any future analogous case. NO bug-related mistakes this session — the live run validated both objectives cleanly.)
**Last updated in session:** session_2026-05-02_http-500-fix-verification-and-auto-fire-trip-observation (Claude Code)
**Previously updated in session:** session_2026-05-01-c_consolidation-auto-fire-followup (Claude Code)
**Previously updated in session:** session_2026-05-01-b_scale-session-e-d3-validation (Claude Code)
**Previously updated in session:** session_2026-04-30-c_scale-session-d-build (Claude Code)
**Previously updated in session:** session_2026-04-30_scale-session-b-build (Claude Code)
**Previously updated in session:** session_2026-04-28_canvas-blanking-and-closure-staleness-fix (Claude Code)
**Previously updated in session:** session_2026-04-28_deeper-analysis-and-fix-design (Claude Code)
**Previously updated in session:** session_2026-04-27_v3-prompt-small-batch-test-and-context-scaling-concern (Claude Code)
**Previously updated in session:** session_2026-04-26_phase1-polish-bundle (Claude Code)
**Previously updated in session (earlier):** session_2026-04-25_phase1g-test-followup-part3-pivot-session-D (Claude Code)
**Previously updated in session (earlier):** session_2026-04-25_phase1g-test-followup-part3-pivot-session-B (Claude Code)
**Previously updated in session:** session_2026-04-25_phase1g-test-followup-part3-pivot-session-A (Claude Code)
**Previously updated in session (earlier):** session_2026-04-25_phase1g-test-followup-part3-session3b-verify (Claude Code)
**Previously updated in session (earlier):** session_2026-04-25_phase1g-test-followup-part3-session3b (Claude Code)
**Previously updated in session (earlier):** session_2026-04-24_phase1g-test-followup-part3-session3a (Claude Code)
**Previously updated in session (earlier):** session_2026-04-24_phase1g-test-followup-part3-session2b (Claude Code)
**Previously updated in session (earlier):** session_2026-04-24_phase1g-test-followup-part3-session2 (Claude Code)
**Previously updated in session (earlier):** session_2026-04-20_phase1g-test-followup-part3 (Claude Code)
**Previously updated in session (earlier):** session_2026-04-19_phase1g-test-followup-part2 (Claude Code)
**Previously updated (claude.ai era):** https://claude.ai/chat/75cc8985-b70a-49f4-8b64-444c34ef541f

**Purpose:** Every mistake made in any chat — whether Claude or user catches it — gets appended. Future Claudes read this to avoid repeating. This is how institutional memory survives Claude's lack of memory.

**Rules:**
- APPEND-ONLY. Never edit or delete past entries.
- Every mistake gets an entry regardless of severity.
- Each entry identifies root cause, not just symptom.
- Each entry includes Prevention describing what was added to prevent recurrence.

---

## Entry format

```
### [YYYY-MM-DD] — [Short mistake description]
**Chat URL:** https://claude.ai/chat/[uuid]
**Tool/Phase affected:** [Name]
**Severity:** Low / Medium / High / Critical

**What happened:** [Description]
**Root cause:** [Why it happened]
**How caught:** [User / Claude / Downstream problem]
**Correction:** [What was changed to fix]
**Prevention:** [What was added to prevent recurrence]
```

---

## Entries

### 2026-05-10-b — Codespace folder-zip download served stale extension build despite director's full delete-redownload-extract-load redo

**Session:** session_2026-05-10-b_w2-main-deploy-and-p-3-browser-verify (Claude Code)
**Tool/Phase affected:** W#2 Chrome extension rebuild + reload during P-3 browser verification
**Severity:** Low — INFORMATIONAL (process improvement; recoverable in this instance via server-side zip workaround; does not block future sessions but does add ~30 min friction if hit again without the workaround)

**The slip:** During P-3 browser verification, the director followed Claude's Phase B + C instructions exactly: deleted old folders + removed old extension + downloaded the `chrome-mv3` zip from the Codespaces file-explorer "Download…" UI + extracted locally + loaded into Chrome. After Phase D (sign in + add a fresh `p3-server-test` term, which appeared with no errors) and Phase E (toggle DevTools Network → Offline + reload popup), DevTools Network showed only `popup.html` / `popup-CMo7bk1g.js` / `popup-D_aALNcA.css` / a failed `projects` request — **NO `highlight-terms` request fired at all**, and the popup chunk filename `popup-CMo7bk1g.js` did not match the freshly-built `popup-CWenFIaG.js` (verified via `grep` against `.output/chrome-mv3/chunks/`). This was the symptom that the director was running OLD extension code despite their full redo.

**Most likely root cause:** the Codespaces browser-tab "Download folder" UI generates a zip on the fly when right-clicking a folder. That generation appears to have served a stale or cached zip from a prior session's `.output/` state — the resulting zip's contents did not match the current state of the Codespace's `.output/chrome-mv3/`. Possible mechanisms: browser HTTP cache on the download URL; Codespaces server-side file-listing cache; the file-explorer UI representing a stale view of the directory tree that was used for the on-the-fly zip generation. Not definitively diagnosed; the workaround was simpler than diagnosis.

**Workaround (worked first try):** Claude bypassed the standard folder-zip mechanism by running `zip -r .output/plos-extension-2026-05-10-p3.zip .` from inside `.output/chrome-mv3/`, producing a single 177 KB zip file with a unique filename. Director downloaded that single file directly via the file explorer's "Download…" right-click on the file (not the folder), extracted, loaded as unpacked extension. The `highlight-terms` request appeared in DevTools Network on the next reload — confirming the new code was finally loaded. Cross-device sign-in test then verified server-side persistence end-to-end (the canonical proof of P-3).

**Lesson for future extension-rebuild sessions:** when an extension code-version mismatch is suspected after a director-side rebuild + reload, prefer the single-file unique-name zip path over the standard Codespace folder-zip download. The mechanical recipe: (i) build extension server-side via `npm run build`; (ii) `cd .output/chrome-mv3 && zip -r ../plos-extension-<unique-id>.zip .`; (iii) director downloads that single file via right-click → Download…; (iv) director extracts + loads. The unique filename per build prevents any browser-side cache hit; the single-file mechanism bypasses whatever caching layer the folder-zip-on-the-fly mechanism uses.

**Cross-references:** `extensions/competition-scraping/.output/plos-extension-2026-05-10-p3.zip` (the workaround artifact, gitignored); `COMPETITION_SCRAPING_DESIGN.md §B` 2026-05-10-b entry (full session record); ROADMAP Active Tools W#2 row Last Session entry.

---

### 2026-05-10-b — Claude's first diagnostic for the chunk-filename mismatch was over-engineered; director called it `"unnecessarily complex"`

**Session:** session_2026-05-10-b_w2-main-deploy-and-p-3-browser-verify (Claude Code)
**Tool/Phase affected:** Process — debugging-style guidance during browser-verification mid-session
**Severity:** Low — INFORMATIONAL (debugging-style-process slip; director-corrected mid-session; no permanent damage; lesson captured for future debugging sessions)

**The slip:** When the chunk-filename mismatch surfaced (popup chunk DevTools showed `popup-CMo7bk1g.js` but Claude's built `.output/chrome-mv3/chunks/` had only `popup-CWenFIaG.js`), Claude's first response was a multi-step path-tracing diagnostic — asking the director to (i) open the locally-extracted `chrome-mv3` folder on their laptop in the file explorer, (ii) open `popup.html` with a text editor (Notepad / TextEdit / VS Code) to read raw HTML, (iii) note the filename in the `<script src="...">` attribute, (iv) list the contents of the `chunks` subfolder. The proposed flow walked through three places where the file could be wrong, with branching outcomes for each. The director's response: *"This is unnecessarily complex. Think of a different fix."*

**Why it was over-engineered:** the mismatch confirmed that Chrome was loading something other than what Claude had just built. Whether the local extracted folder OR Chrome's source path OR the download mechanism was at fault, the path forward — bypass whatever might be caching/staling — would be the same. Diagnostic depth was wasted before the simpler bypass was attempted. The pattern: when a mechanism is suspected to be the source of staleness (the Codespace folder-zip download), going *deeper* into that mechanism (text-editor-inspecting the artifacts it produced) is rarely the fastest fix. *Stepping around* the mechanism with a different one (server-side zip + single-file download) is the canonical move.

**Director feedback verbatim:** *"This is unnecessarily complex. Think of a different fix."*

**Claude's correction in-session:** acknowledged the over-engineering, switched to the server-side zip workaround (described in the entry above). The workaround worked first try.

**Lesson for future debugging sessions:** when a download-mechanism (or any other transport / caching layer) is the suspected source of staleness, the first instinct should be to *bypass* the suspect mechanism with a different one, not to *interrogate* the suspect mechanism with diagnostic-depth questions to the director. Diagnostic depth is appropriate when the bug surface is intrinsic to a known-good transport. When the transport itself is suspect, swap transports.

**Cross-references:** entry above (the workaround that worked); `COMPETITION_SCRAPING_DESIGN.md §B` 2026-05-10-b entry (full session record); operational memory `feedback_recommendation_style.md` (general principle of recommending the most thorough/reliable path — but in this case the most thorough/reliable diagnosis was *not* the deepest one, it was the one that bypassed the suspect layer).

---

### 2026-05-05-d — Anthropic API credit exhaustion mid-run halted D3 resume for ~36 min — NEW operational failure mode

**Session:** session_2026-05-05-d_d3-resume-completed-and-defaults-deployed (Claude Code)
**Tool/Phase affected:** Workflow #1 Keyword Clustering — Auto-Analyze run launch + in-run safety
**Severity:** Medium — INFORMATIONAL (new failure mode captured + structural fix specified; recoverable in this instance because director was available to top up)

**What happened:** During the 2026-05-05-d D3 resume run on production vklf.com, batch 85 failed all three retry attempts at 8:06:52 PM with `HTTP 400: Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.` The Auto-Analyze run halted on a `Batch 85 FAILED` activity log entry with no further automatic retries. Director's run state was paused for approximately 36 minutes (8:06:52 PM → 8:42:28 PM "Resumed.") until they topped up Anthropic credits and resumed the run. Batch 85 attempt 4 succeeded post-resume; the run continued through batch 86 + consolidation #8 before director cancelled around the volume-100 floor.

**Root cause analysis:** No structural defense exists today against API-credit exhaustion mid-run. The pre-flight runner does NOT check the Anthropic API credit balance against the estimated run cost before launching. The Auto-Analyze overlay shows running cumulative cost but no estimated remaining or estimated total — making it hard for the director to predict when credits will run out. When credits are exhausted mid-run, the next API call fails with a 400 error and the run halts; there's no proactive warning earlier in the cost trajectory.

**How caught:** Director observed the failure in the activity log when checking on the run; topped up credits manually; the run auto-resumed when the next API call succeeded. Director surfaced the pattern at end-of-session as a structural concern: long unattended runs can be silently halted by credit-exhaustion, and the next operator might not be available to top up promptly (e.g., a 12-hour overnight run that hits the wall at 2 AM would sit dead until morning).

**Correction (immediate):** None — the run continued and completed at director's discretion. This was a structural finding captured for follow-up.

**Prevention (codified):** New ROADMAP MEDIUM entry "Auto-Analyze cost forecasting + credit-balance check" with sliding-window estimator algorithm spec covering: (a) **pre-flight check** at run start querying Anthropic balance and warning yellow if `estimated_remaining > available × 0.5`, abort threshold if `> available × 1.0`; (b) **in-run heartbeat** every 10 batches re-querying balance and re-projecting remaining cost using a sliding 10-batch window for avg per-batch cost (auto-adapts as canvas grows); (c) **overlay display** of "Spent: $X | Est. remaining: $Y | Est. total: $Z | Available credits: $A" updating after each batch. Sliding-window matters because per-batch cost grew $0.46 → $0.63 across the D3 resume run as canvas grew 195 → 242; a fixed-average estimator would have under-projected by ~30% by run end.

**Operational lesson at the platform level:** long unattended AI runs need a credit-budget gate at launch + in-flight heartbeat warning. Estimating run cost vs. credit balance before launching is a structural-defense pattern that generalizes beyond Auto-Analyze to any future long-running AI workflow (W#3 Therapeutic Strategy, W#5 Conversion Funnel, etc., per their respective design interviews).

**Cross-references:** ROADMAP NEW MEDIUM "Auto-Analyze cost forecasting + credit-balance check" (added this session); `KEYWORD_CLUSTERING_ACTIVE.md` POST-2026-05-05-D STATE block "🚨 New findings surfaced this session" #1.

---

### 2026-05-05-d — Recurring slip: Re-asking director to verify settings that persist via UserPreference

**Session:** session_2026-05-05-d_d3-resume-completed-and-defaults-deployed (Claude Code)
**Tool/Phase affected:** Workflow #1 Keyword Clustering — Auto-Analyze run launch protocol
**Severity:** Low — INFORMATIONAL (recurring slip pattern; not user-data-affecting; burns small amount of director time + subtly erodes Rule 14g trust principle)

**What happened:** Across multiple sessions (including session_2026-05-05-d D3 resume launch), Claude has asked director to "verify Thinking settings before each run" or "re-confirm pasted prompts" or similar. Many of these settings are persistent — they live in the UserPreference DB table per-project (settings persistence shipped per ROADMAP item #8 B1 2026-04-24). The pasted prompts persist via UI state per-project. Re-asking the director to verify state that persists is unnecessary friction.

**Root cause analysis:** Two contributing factors. (1) Pre-flight runner has incomplete coverage — it doesn't surface canonical settings (Thinking Mode + Thinking Budget + Processing Mode + Batch Size) in its visible output, so Claude can't confirm them by reading the activity log. (2) Claude's training disposition is to verify by asking, even when the data is structurally guaranteed by persistence. The asking pattern is a Rule 14g-adjacent pattern — Rule 14g specifically covers "trust director affirmation about setup state"; this slip is the analogous pattern of "trust the persistence layer + just confirm it from prior STATE block."

**How caught:** Director surfaced at end of session_2026-05-05-d as part of the broader feedback on operational discipline. Specifically: Claude has previously asked the director to verify Thinking settings before launching D3 resume, when in fact the settings were correctly persisted from the prior 2026-05-05 session's run.

**Correction (immediate):** Operational note for future sessions — at session start, Claude should read the persisted settings (or just confirm they were correct in the prior successful run per the STATE block) and not re-ask. If genuinely uncertain, frame as informational ("the prior STATE block records settings as X — confirming this is still accurate") rather than as a "please verify" question.

**Prevention (codified):** The structural fix is the pre-flight visibility entry extension shipped this session as a ROADMAP polish item — once pre-flight surfaces canonical settings (Thinking Mode + Thinking Budget + Processing Mode + Batch Size + ...) in its visible output, Claude can point director to the visible activity log line instead of asking. Until that ships, the operational discipline is: trust the STATE block + persisted state + Rule 14g principles; don't re-ask without specific reason to doubt.

**Operational lesson:** Rule 14g (trust director's setup confirmation) extends naturally to "trust the persistence layer." When state is structurally guaranteed by the database (per a docs-captured shipped feature), Claude doesn't need to re-verify by asking the director.

**Cross-references:** HANDOFF_PROTOCOL.md Rule 14g (trust director's setup confirmation); ROADMAP "🔍 NEW MEDIUM (2026-05-04-d) — Pre-flight check results not visible to director on Resume click" (settings-completeness gap sub-section added this session); operational memory `feedback_trust_director_setup_confirmation.md`.

---

### 2026-05-05-d — Mid-session math slip: batch-vs-keyword miscount in projection ("batch 1 of ~26" when correct was "batch 1 of ~204")

**Session:** session_2026-05-05-d_d3-resume-completed-and-defaults-deployed (Claude Code)
**Tool/Phase affected:** Workflow #1 Keyword Clustering — D3 resume launch projection
**Severity:** Low — INFORMATIONAL (caught implicitly within minutes; no downstream effect on the run; directional projection slip rather than computational use of the wrong number)

**What happened:** During session_2026-05-05-d D3 resume launch, Claude projected the new run as "batch 1 of ~26" when the correct number was "batch 1 of ~204." The pre-flight output showed 1632 in-scope keywords. With batch size 8, the correct projection is 1632 / 8 = ~204 batches. Claude conflated keywords-with-batches in the math, pattern-matching to a recalled "26" number (likely an artifact from a different prior calculation or doc reference) instead of doing the explicit unit conversion.

**Root cause analysis:** Pattern-matching to a recalled number instead of doing the explicit conversion. The arithmetic is trivial (1632 ÷ 8 = 204) but Claude shortcut to "26" without showing work. When working with two related quantities (keywords vs. batches; tokens vs. characters; batches vs. consolidations) at different scales, Claude needs to do the explicit conversion every time, not assume which scale a recalled number was at.

**How caught:** Director caught implicitly by sharing the pre-flight output that showed 1632 in-scope keywords; the discrepancy with Claude's "26 batches" projection was visible within minutes.

**Correction (immediate):** Claude redid the math explicitly (1632 ÷ 8 = 204) and corrected the projection in the same response. The director's actual batch-projection planning was never affected.

**Prevention (codified):** Operational discipline — when projecting batch counts, ALWAYS do the unit conversion explicitly (keywords ÷ batch_size = batches; never pattern-match to a recalled number without checking the unit). Same discipline applies to: tokens vs. characters (4 chars ≈ 1 token rule of thumb); per-batch vs. cumulative cost; per-batch vs. cumulative time. State the conversion in the response so the director can spot-check.

**Operational lesson:** projections are cheap to do correctly when shown explicitly + costly to do wrong silently. Always show the work in the response, even for trivial arithmetic.

**Cross-references:** None (small isolated slip; no downstream effect).

---

### 2026-05-04-d — Rule 14e mid-session slip: deferred an item without naming destination in the same sentence ("I'll capture this in the deferred sweep too" — Rule 14e violation)

**Session:** session_2026-05-04-d_pool-tune-small-batch-test-insufficient (Claude Code)
**Tool/Phase affected:** HANDOFF_PROTOCOL — operational discipline; affects all sessions
**Severity:** Medium (caught + corrected within the same session; triggered the codification of HANDOFF_PROTOCOL.md Rule 26 NEW)

**What happened:** Mid-session 2026-05-04-d, after director reported the auto-fire toggle was missing from the Auto-Analyze overlay (they had observed this in prior sessions too), Claude responded with: *"That said: the toggle being missing from the overlay is unusual — it WAS visible in 2026-05-04-c. Could be it's now hidden behind a sub-tab or expandable section, or the UI changed between sessions. **I'll capture this as a sanity-check item in the deferred sweep too** — not blocking tonight, but worth confirming in a future session."* That last sentence violated Rule 14e — the rule requires naming the destination doc + section in the same sentence as the defer ("Never leave a deferred issue unanchored" + "the same sentence must state where it will be documented"). "I'll capture in the deferred sweep" is an example of the unanchored phrasing the rule was written to prohibit.

**Root cause analysis:** Claude was speaking from a vague "we'll handle it later" framing rather than from Rule 14e's destination-naming discipline. Two contributing factors: (1) the destination decision sometimes feels naturally end-of-session — i.e., "I'll figure out which doc this goes in once I see the full set of items deferred this session" — but Rule 14e was written specifically because that "figure out later" mindset is the failure mode. (2) End-of-session sweeps relied on Claude's memory of what was deferred during the session, a brittle dependency.

**How caught:** Director caught it directly: *"Please make sure the missing auto-fire toggle issue is noted but also make sure our working methodology always avoids such things from falling through the cracks. We have a lot of sessions and our overall roadmap is long. Even small things being dropped like this can prove catastrophic. There should be a method to ensure nothing necessary gets ignored."*

**Correction (immediate):** Claude acknowledged the slip per Rule 10, captured both the auto-fire toggle absence + the canvas-size visibility + (later in the session) the pre-flight visibility issue with explicit destination naming and via TaskCreate. Methodology improvement proposed mid-session (see Prevention).

**Prevention (codified):** **HANDOFF_PROTOCOL.md Rule 26 NEW (2026-05-04-d)** — Real-time deferred-items registry via TaskCreate. Whenever Claude defers an item per Rule 14e, in addition to stating destination in the same sentence, Claude MUST register the item via `TaskCreate` with `DEFERRED:` prefix in the subject. End-of-session sweep then reviews `TaskList` (not memory) as the canonical source. Each task closed via `TaskUpdate → completed` only after the doc entry is written. Open `DEFERRED:` tasks at end-of-session = automatic CORRECTIONS_LOG entry. Director-approved at session mid-point. Plus operational memory: `feedback_deferred_items_registry.md`. Plus cross-references in `CLAUDE_CODE_STARTER.md` Session Management section.

**Cross-references:** `HANDOFF_PROTOCOL.md` Rule 26 (NEW); `CLAUDE_CODE_STARTER.md` Rule 15 area (cross-reference); `feedback_deferred_items_registry.md` (memory); `KEYWORD_CLUSTERING_ACTIVE.md` POST-2026-05-04-D STATE block "Methodology improvements" section.

---

### 2026-05-04-d — Recurring slip: Claude has repeatedly told director the Resume button surfaces P1-P12 pre-flight check results visibly when in fact it does NOT

**Session:** session_2026-05-04-d_pool-tune-small-batch-test-insufficient (Claude Code)
**Tool/Phase affected:** Workflow #1 Keyword Clustering — Auto-Analyze overlay UX descriptions
**Severity:** Medium (recurring across multiple sessions per director's flag; not user-data-affecting; burns director time + erodes trust in Claude's UI-step descriptions)

**What happened:** During the small-batch test setup 2026-05-04-d, Claude told the director: *"Phase 1 — Pre-flight check (10-30 seconds, no cost): The overlay should display 12 pre-flight checks running (P1 through P12). Each should show ✓ or ✗ next to it."* Director responded that the Resume button does NOT show pre-flight check results visibly, AND noted Claude has made the same wrong claim in previous sessions too: *"Clicking Resume does not show any pre flight data. I said this in previous sessions as well. You need to make a note of this and if you want Resume to show preflight data then you should add it to the roadmap as a todo item."*

**Root cause analysis:** Claude was speaking from inferred state-block-summary phrasing ("pre-flight passed all 12 checks" — written in `KEYWORD_CLUSTERING_ACTIVE.md` 2026-05-04-c STATE block + similar in prior sessions) rather than from verified UI behavior. The state-block phrasing was a post-hoc summary — meaning "pre-flight ran somewhere and passed" — but Claude conflated "ran somewhere" with "displayed visibly to the director at click time." This is a Rule 14a violation (Read-It-Back test) — Claude should have asked the director "what do you see when you click Resume?" instead of describing what the user should see based on docs alone.

**How caught:** Director caught it directly + flagged that the same wrong claim has happened in previous sessions.

**Correction (immediate):** Claude acknowledged the slip per Rule 10. Captured (a) ROADMAP feature item — make pre-flight visible on Resume click (NEW MEDIUM 2026-05-04-d entry); (b) this CORRECTIONS_LOG entry as the recurring slip pattern. Adjusted "what to watch for" guidance for the rest of the session — defaulted to "tell me what you see" rather than "this is what should happen."

**Prevention (codified):** Operational principle: **Claude must default to "tell me what you see" before describing what the user should see when there's any prior history of UI-flow uncertainty, especially for tools where Claude has no direct UI access.** Once the ROADMAP feature item ships (Resume surfaces pre-flight visibly), this slip becomes self-correcting — Claude can describe the actual UI flow because it'll match doc claims. Until then, Claude must catch the urge to describe pre-flight visibility and ask instead.

**Cross-references:** `ROADMAP.md` "NEW MEDIUM (2026-05-04-d) — Pre-flight check results not visible to director on Resume click" entry; `KEYWORD_CLUSTERING_ACTIVE.md` POST-2026-05-04-D STATE block standing instruction (d).

---

### 2026-05-04-c — Stale-doc trust slip: Claude built the entire 2026-05-04-c STATE block + ROADMAP entries + handoff on the assumption that Supabase Pro upgrade was still pending, when in fact director had already upgraded at end of 2026-05-04-b (PROCESS LESSON — should have asked director at session start to confirm status of recent director-action items rather than trusting stale doc claims)

**Session:** session_2026-05-04-c_d3-retry-partial-pool-exhaustion-finding (Claude Code)
**Tool/Phase affected:** Workflow #1 Keyword Clustering — W#1 PRODUCTION-READINESS GATE prerequisite #4 framing
**Severity:** Informational (operational-process lesson; caught + corrected within the same session via a follow-up commit)

**What happened:** The 2026-05-04-b STATE block recorded "director confirmed 2026-05-04-b end-of-session: NOT currently on Pro." Claude trusted this claim at 2026-05-04-c start without re-asking. When tonight's pool-exhaustion event fired and director chose Path B (pause D3 + prioritize Pro upgrade), Claude built the entire end-of-session doc batch — KEYWORD_CLUSTERING_ACTIVE STATE block, ROADMAP prerequisite #4 + HIGH-severity entry, PLATFORM_ARCHITECTURE §10 entry, CHAT_REGISTRY row, handoff message — on the framing "director needs to upgrade to Pro between sessions; D3 retry follows after." Commit `ad8d68f` pushed to origin/main with this framing. Director then clarified at end-of-session: "I had upgraded Supabase to Pro already in the last session's end." All the framing was wrong — Pro was already in place; tonight's failure was on Pro, not Free; the next-session task is pool-config tuning + possible code-fix, not the Pro upgrade.

**Root cause analysis:** Two-level error. Level 1 (the original 2026-05-04-b doc claim): the 2026-05-04-b STATE block captured director-confirmation that director was NOT on Pro at end of that session — a snapshot-in-time fact that became stale when director upgraded later that same evening (post-session-end). The doc didn't update to reflect the upgrade. Level 2 (this session's slip): Claude trusted the stale doc claim instead of asking director at session start "did you complete the Pro upgrade between sessions?". The "trust the docs" pattern is the right default for stable platform facts (architecture, schema, settled decisions), but it's the WRONG default for recent-director-action items in a known-pending state — those should be re-confirmed at the start of any session that depends on them. Cursor on this kind of fact: the STATE block flagged "director's upgrade timing TBD" — that "TBD" should have triggered a re-ask at session start.

**Why this is INFORMATIONAL not a hard mistake:** caught + corrected within the same session via a follow-up commit. Both commits land on origin/main; no production code is affected; the handoff message hadn't been finalized when director clarified. Net cost: ~15-20 min of doc rework + a slightly more complex post-correction documentation trail.

**Process update:** at the start of any session where a prior session's STATE block records a "TBD" or "pending director-action" item that's gate-blocking for today's task, Claude MUST explicitly re-ask the director at session start: "doc X says <action item> was pending at end of <prior session>; can you confirm current status before we start?" Specifically applies to: offline upgrades (Supabase Pro, Vercel plan, etc.), credential rotations, account changes, payment-related changes — anything the director would have done in an external system between sessions. Adding to the start-of-session sequence as a soft check during the drift-check step.

**Cross-references:** `KEYWORD_CLUSTERING_ACTIVE.md` POST-2026-05-04-C STATE block "🚨 CRITICAL CORRECTION post-original-commit" paragraph; `ROADMAP.md` W#1 PRODUCTION-READINESS GATE prerequisite #4 (DONE) + #5 (NEW investigation) + HIGH-severity Pool exhaustion entry "Fix layers REVISED post-correction"; `PLATFORM_ARCHITECTURE.md §10` Pool exhaustion entry's "REVISED post-correction" paragraph; commit `ad8d68f` (original framing) + this session's correction commit (TBD hash).

---

### 2026-05-04-c — Rate-fix scope at the time of design (2026-05-04-b) didn't anticipate pool exhaustion as a separate failure mode (INFORMATIONAL, NOT a mistake; process lesson on "fix without measurement first" trade-offs)
**Session:** session_2026-05-04-c_d3-retry-partial-pool-exhaustion-finding (Claude Code)
**Tool/Phase affected:** Workflow #1 Keyword Clustering — W#1 PRODUCTION-READINESS GATE prerequisite #3 (underlying flake-rate fix)
**Severity:** Informational

**What happened:** The 2026-05-04 underlying-flake-rate investigation session audited the codebase for `withRetry` parity and identified ~4% coverage of endpoint-method combinations (only 2 of ~50). The 2026-05-04-b rate-fix shipped option (c) "withRetry parity extension" — wrapping silent auth helpers (`lib/auth.ts`, `lib/workflow-status.ts`) + apply-pipeline writes. Director chose Option B at 2026-05-04-b's start-of-session fork: ship the rate-fix grounded only on inspection findings rather than waiting for live `[FLAKE]` data (Option A would have waited 1-3 days for natural data accumulation). The 2026-05-04-c D3 retry's batch 1 surfaced `FATAL: Max client connections reached` errors — a SEPARATE failure mode that the rate-fix doesn't address. The withRetry helper retries transient codes (P1001/P1002/P1008/P2034). Pool exhaustion has NO Prisma code; just the FATAL message embedded in `error.message`. Retrying it makes pool pressure worse (each retry adds connection pressure). The rate-fix is structurally bounded to transient flakes.

**Root cause analysis:** "Fix without measurement first" works when the failure mode is well-understood from inspection. It missed pool exhaustion specifically because pool exhaustion looks identical to transient flakes from inspection alone — both surface as HTTP 500 to the client; both involve the database connection layer; both happen sporadically. **Only LIVE TELEMETRY distinguishes them:** transient flakes carry a Prisma error code; pool exhaustion carries no code, just the FATAL message. The 2026-05-04 instrumentation pass actually anticipated this distinction — `[FLAKE]` lines log the Prisma code so transient-vs-other can be distinguished from log volume. Had Option A been chosen 2026-05-04-b (wait for data first), the rate-fix would likely have been scoped differently from the start — possibly bundled with a Pro upgrade discussion, possibly not shipped at all if the data showed transient flakes were a minority of the failure population.

**Why this is INFORMATIONAL not a mistake:** Director's Option B choice 2026-05-04-b was made deliberately with the trade-off explicit ("ship sooner; risk discovering scope issues later vs. wait for data; ship more accurately"). The 2026-05-04-c discovery validates the trade-off — it surfaced a scope boundary that data-first would have surfaced earlier and possibly cheaper. Neither path was wrong; they trade speed for precision in different ways.

**Process update for future fix sessions:** for any future fix that bundles "ship without measurement first," explicitly enumerate (a) the failure modes the fix targets AND (b) the failure modes it would NOT cover; (c) add a deferred "after-fix verification" item that grades the bound on the fix's scope from live data. The `[FLAKE]` visibility investigation captured as 2026-05-04-c next-session item (b) is exactly this kind of follow-up — it answers "is the telemetry actually capturing the data we'd need to grade the rate-fix's effectiveness empirically?". No code change from this lesson; it's a process refinement applied to future fix sessions.

**Cross-references:** `KEYWORD_CLUSTERING_ACTIVE.md` POST-2026-05-04-C STATE block (full session narrative); `ROADMAP.md` HIGH-severity "Pool exhaustion under apply-pipeline burst" entry (the discovered failure mode) + W#1 PRODUCTION-READINESS GATE prerequisite #3 (rate-fix; reframed) + #4 (NEW Supabase Pro upgrade); `PLATFORM_ARCHITECTURE.md §10` "🚨 Connection pool exhaustion" entry.

---

### 2026-05-03 — React `react-hooks/purity` rule traces through same-file `useCallback` to flag setState inside the called function (INFORMATIONAL, not a mistake; reporting-precision lesson on the rule's tracing scope)
**Session:** session_2026-05-03_cold-start-render-layer-fix (Claude Code)
**Tool/Phase affected:** Workflow #1 Keyword Clustering — KeywordWorkspace cold-start retry wiring
**Severity:** Informational

**What happened:** During the cold-start render-layer fix wiring, I added three retry-wrapped `useCallback`s (`loadCanvasWithRetry`, `loadKeywordsWithRetry`, `loadRemovedKeywordsWithRetry`) — each starting with a synchronous `setFetchStatus(key, 'loading')` BEFORE the first `await runColdStartFetchWithRetry(...)`. Three `useEffect`s called these callbacks at mount. Lint flagged 3 new errors of rule `react-hooks/purity` ("Avoid calling setState() directly within an effect — Calling setState synchronously within an effect can trigger cascading renders") at the useEffect call sites. Lint count went baseline 16e/41w → 19e/41w.

**Root cause:** The `react-hooks/purity` rule traces through SAME-FILE `useCallback` boundaries to look for setState calls in the function body. It does NOT distinguish setState fired synchronously (before any await) from setState fired post-await; ANY setState reachable from the called function is enough to trigger the rule when that function is invoked from a useEffect. By contrast, the rule does NOT trace through cross-file imports (the existing `useEffect(() => { fetchKeywords(); }, [fetchKeywords]);` was always fine in baseline despite `fetchKeywords` calling `setLoading(true)` synchronously inside `useKeywords.ts` — different file, no trace).

**How caught:** Claude — `npm run lint` after wiring; clean before-vs-after diff via `git stash` confirmed all 3 new errors were mine.

**Correction:** Two-pass fix. (1) Removed the pre-await `setFetchStatus(key, 'loading')` calls — the banner only renders for `retrying` and `exhausted`, never for `loading`, so the synchronous setState was unnecessary. The `idle → retrying` flip happens via the `onAttemptFailed` callback (post-await). (2) Wrapped the useEffect call in an IIFE: `useEffect(() => { void (async () => { await loadX(); })(); }, [loadX]);`. The linter sees an IIFE in the effect body and stops its tracing there rather than reaching the useCallback. Lint returned to baseline 16e/41w with both changes in place. State machine in the doc-block was simplified to 3 states (`idle | retrying | exhausted`) instead of 4.

**Prevention:** Operational lesson recorded for future sessions: any future `useEffect` that calls a same-file `useCallback` containing setState should pre-emptively wrap the call in an IIFE — even when all setState calls fire post-await — to avoid the `react-hooks/purity` rule tripping. Same-file useCallback ↔ setState ↔ useEffect is a triangle the rule has zero tolerance for. The IIFE wrapper is the canonical workaround. (Cross-file boundaries already terminate the trace; no IIFE needed when the called function lives in another file.)

---

### 2026-05-02-d — Reframe of morning-vs-afternoon HTTP 500 retry-rate evidence (INFORMATIONAL, not a mistake; reporting-precision lesson on small-sample / small-canvas verification claims)

**Session:** session_2026-05-02-d_http-500-retry-regression-investigation (Claude Code)

**Tool/Phase affected:** ROADMAP.md "🚨 NEW HIGH-severity REGRESSION 2026-05-02-c — HTTP 500 fetchCanvas retry pattern" entry (now flipped to "🟡 CODE FIX SHIPPED 2026-05-02-d — pending live verification" with reframe note); KEYWORD_CLUSTERING_ACTIVE.md POST-2026-05-02 "VERIFIED" closure of the original 30%-storm-rate concern (now noted as technically premature given sample size).

**Severity:** INFORMATIONAL — explicitly NOT a mistake-classified entry. The morning session's "verified" framing was reasonable from the data the session had at the time; today's re-read just strengthens the precision of the framing.

**What the reframe says:** the 2026-05-02-c session called the observed retry pattern a "HIGH-severity regression of `df09611`'s asymmetric fix" because the morning's `2026-05-02` session had reported "Zero HTTP 500 retry storms across 6 batches + 2 consolidation passes + ~7 atomic canvas rebuilds" while the afternoon's profiling pass observed 8+ retries across 31 batches. Today's evidence re-read says that framing is partially right and partially wrong:

- **Right:** the underlying retry rate at scale is ~23–27% — high enough to be a real correctness concern.
- **Wrong:** `df09611` did NOT regress. The endpoint asymmetry SHIFTED:
  - Yesterday (`2026-05-01-c`): state 5 hits, nodes 1 hit (state-heavy 5:1)
  - Today (`2026-05-02-c`): state 2 hits, nodes 5 hits (nodes-heavy 1:2.5)
  - State-fetch failures dropped from 5 → 2 in roughly comparable load — **exactly what the asymmetric-defense-in-depth design predicted.**
  - Nodes-fetch failures grew from 1 → 5 because the atomic rebuild transaction holds pgbouncer connections proportionally longer at larger canvas sizes (per the `aa.rebuildHTTP` 2.8s → 4.6s linear scaling finding from 2026-05-02-c). Total observed rate stayed flat at ~25%.

**Why the morning session's "VERIFIED clean" claim wasn't a regression that got reversed:** at a true rate of ~25%, P(0 hits in 9 trials) is ~7.5% — low but not anomalous. AND the rate is plausibly canvas-size-correlated (rebuild transaction time grows linearly with canvas; longer transactions = more pool pressure = more flakes), so morning's small-canvas (≤43 topics) likely had a lower base rate than afternoon's 55–108 topic regime. Either way, "0 storms across 9 small-canvas opportunities" was a legitimate observation but **could not statistically distinguish "rate dropped to ~0%" from "rate was always ~25% at scale and we got lucky / didn't reach the regime where it surfaces."**

**Root cause of the reporting precision gap:** the morning session's verification methodology counted "retry storms" — multi-retry sequences before success — without counting single-retry-then-success cases. The afternoon's "retry pattern fired 8+ times" tally counted any retry event. These are different metrics; the morning's "0 storms" and the afternoon's "8+ retries" can both be true even on the same underlying rate, depending on what counts as a "storm." The framing in 2026-05-02-c's STATE block treated them as directly comparable, which produced the "regression" narrative.

**Why this matters going forward:**
- Future "VERIFIED clean" claims on stochastic phenomena should explicitly state the sample size, the sampled regime (canvas size, load profile), and the metric being counted. A claim of "0 retry storms across 6 batches at canvas ≤43" is meaningfully different from "0 retry events across 30 batches at canvas 100+."
- A code fix can be working as designed AND still leave a ~25% underlying rate that needs separate attention. The 2026-05-02 closure of the original 30%-storm-rate concern was technically premature; the asymmetric fix in `df09611` halved state-fetch failures (which IS the win the fix promised), but the residual rate from the parallel nodes endpoint remained.
- Today's code fix (`src/lib/post-rebuild-fetch-retry.ts`) addresses the residual at the **recovery layer** (eliminating the partial-apply state corruption mode) rather than the **rate layer**. Lowering the underlying rate would be a separate future concern (e.g., longer pgbouncer pool, more aggressive server-side retry timing).

**No mistake to undo:** the morning session's framing was reasonable for the data it had. Today's re-read just clarifies the framing now that more data is in. ROADMAP entry's status flip and the new reframe note in the entry capture this for future sessions.

**Prevention:**
1. **When verifying a stochastic concern (retry rates, flake rates, sampling-derived properties), explicitly bound the claim to (sample size, regime, metric).** "Verified clean across 6 batches at canvas ≤43" is a precise claim. "Verified" alone is not.
2. **When comparing across sessions, compare the same metric.** "Retry storms" (multi-retry sequences) and "retry events" (any retry) are different metrics; conflating them produces apparent regressions that don't exist.
3. **A defense-in-depth fix can be working AND still leave residuals on parallel paths.** Audit sister endpoints / sister mechanisms before declaring a concern closed (this is the same lesson as `2026-05-01-c`'s asymmetric-fix entry, applied at the verification step rather than the design step).

**Cross-references:**
- `src/lib/post-rebuild-fetch-retry.ts` (today's code fix; full rationale in module-level header).
- `ROADMAP.md` HIGH-severity HTTP 500 retry regression entry (status flipped to "🟡 CODE FIX SHIPPED" with reframe note).
- `KEYWORD_CLUSTERING_ACTIVE.md` POST-2026-05-02-d STATE block (in-context narrative).
- `BROWSER_FREEZE_FIX_DESIGN.md §9.5.1` (Hypothesis A; structurally defended by today's fix; freeze-causation question still pending live verification).

---

### 2026-05-02-c — Code-reading-based diagnosis empirically rejected by DevTools profiling pass (PROCESS, no production impact; profile-before-implement protocol worked exactly as designed)

**Session:** session_2026-05-02-c_devtools-profiling-pass (Claude Code)

**Tool/Phase affected:** `BROWSER_FREEZE_FIX_DESIGN.md` design (Group B doc); the design's §1 diagnosis pinpointing `runLayoutPass` Sub-step 3 as the dominant bottleneck at 105+ topics; the design's §4 fix-approach picker (A/B/C); the design's §5 implementation plans; W#1 Keyword Clustering's planned next-session direction.

**Severity:** PROCESS (no production code impact; no implementation budget spent on the wrong fix; profile-before-implement protocol explicitly built into the design doc as §3 was followed before §5 implementation began; lesson is methodological — about how to handle "high confidence from static analysis" framing).

**What happened:** In `session_2026-05-02-b_browser-freeze-fix-design`, Claude designed a 555-line Group B doc (`BROWSER_FREEZE_FIX_DESIGN.md`) capturing a code-reading-based diagnosis of the 2026-05-01-c browser freeze. The diagnosis pinpointed `runLayoutPass` Sub-step 3 (60-pass overlap-resolution loop at `src/lib/canvas-layout.ts:269-292`) as the dominant bottleneck via O(60 × n²) complexity with O(n × depth) inner cost from `ancestorCollapsed`'s `nodes.find()` calls. Confidence stated as ~90% from the math, with profiling explicitly called out as the empirical-confirmation step. Three fix approaches were designed in detail (A=algorithmic / B=requestAnimationFrame chunking / C=Web Worker offload) with Approach A recommended per Rule 14f.

In today's session (`2026-05-02-c`), the director executed the §3 protocol on production Bursitis Test 2; pushed canvas through 108 topics across 31 apply batches; collected complete timing data via DevTools console snippet. **The diagnosis was empirically rejected.** runLayoutPass stayed at 1.0–3.2 ms across the entire 55→108 topic range, with `passes=1` every single batch — including AT and ABOVE the 105-topic threshold from last week's freeze. Sub-step 3's overlap loop early-exited in 1 pass every time because Sub-step 2's tree-walk placed nodes cleanly enough that no overlaps existed. None of Approaches A/B/C address a real bottleneck on this canvas.

**Root cause of the diagnosis being wrong:** the code-reading-based prediction assumed cascading overlaps would force Sub-step 3's loop to do many passes. In practice, the tree-walk in Sub-step 2 places nodes in a way that prevents overlaps from forming on this canvas's shape, so Sub-step 3 is effectively a no-op. The prediction's conditional nature ("IF overlaps cascade, THEN loop is expensive") was correct logically but the antecedent ("overlaps cascade") was not empirically grounded. Code reading cannot tell you whether overlaps cascade in practice — only profiling can.

A secondary contributing factor: the empirical evidence cited in `BROWSER_FREEZE_FIX_DESIGN.md §1.4` (the "Layout pass complete" log absence in 2026-05-01-c) was misinterpreted. The log absence pinned the freeze block to "calcNodeHeight × n + runLayoutPass" between AutoAnalyze.tsx lines 996-1027, BUT that line range also includes the `setNodes(layoutNodes)` call at line ~1018 which triggers React reconciliation + SVG paint — code paths that the instrumentation does NOT cover. The §1.4 reasoning treated "freeze in this range" as evidence for "freeze in runLayoutPass specifically," which conflated two distinct claims.

**How caught:** the profile-before-implement protocol explicitly built into the design doc as §3 caught the diagnosis cleanly. Director ran the protocol; data came back; data didn't match prediction; Claude analyzed and acknowledged the rejection in the same session. No prior implementation work to undo.

**Correction:**
- New §9 added to `BROWSER_FREEZE_FIX_DESIGN.md` (~280 lines) capturing: full data table (31 batches), diagnosis-rejection analysis, three remaining hypotheses for what actually caused last week's freeze (Hypothesis A = HTTP 500 retry storm + cascade — leading; Hypothesis B = uninstrumented React reconciliation / SVG paint; Hypothesis C = one-time edge case), revised path forward (recommended next-session = HTTP 500 retry regression investigation), methodology note, instrumentation status (kept in production).
- Supersession notice added at top of `BROWSER_FREEZE_FIX_DESIGN.md` directing readers to §9 first.
- §0.1 status table updated: profiling pass marked complete; fix-approach decision marked moot.
- HIGH-severity browser-freeze entry in `ROADMAP.md` flipped from "🔄 DESIGN COMPLETE — implementation pending profiling" to "⛔ DIAGNOSIS REJECTED — investigation continues per design doc §9."
- Two NEW ROADMAP entries added: HTTP 500 retry regression (HIGH, leading freeze suspect, separate independent regression of `df09611`'s "VERIFIED" status); rebuildHTTP linear scaling (MEDIUM, Phase 3 concern).

**Prevention:** the protocol that caught this is the prevention. Going forward:

1. **Code-reading-based diagnoses framed as "~90% confidence from static analysis" should preserve the same humility.** The framing is a deliberate caution to NOT skip empirical confirmation. Future Claude sessions should treat such confidence statements as "this is what code reading predicts, AND this is the explicit ask to profile before implementing." The profile-before-implement protocol explicitly built into a design doc as §3 (or equivalent) is the right pattern; preserve it.

2. **When code reading predicts a complexity blow-up CONDITIONAL on a runtime condition (e.g., "IF overlaps cascade, THEN..."), treat the antecedent as a data-collection target, not as an established fact.** Today's antecedent — "overlaps cascade at scale on this canvas" — was assumed in the §1 reasoning but was empirically false on Bursitis Test 2.

3. **When citing empirical evidence (like a log-line absence or stack trace) as supporting a code-reading-based diagnosis, audit which alternative explanations the evidence is also consistent with.** Today's "Layout pass complete log absence" pinned the freeze to a code range that covers BOTH the instrumented layout pass AND the unmeasured React reconciliation + SVG paint. The §1.4 reasoning treated it as evidence for the former alone; it was equally evidence for the latter.

4. **Cost-saved framing matters.** This session's "rejection" saved 2–3 sessions of misdirected implementation budget. Future sessions should NOT view profiling as a cost-on-top of design work — it's a cheap insurance policy whose expected value is highest exactly when the design feels confident.

**Methodology lesson captured for future sessions:** "If you're 90% confident from code reading that you've found the bottleneck, the right next move is profiling, not implementation. Today's session demonstrated profiling at 90% confidence saved 2-3 sessions; profiling at 99% confidence would still be cheap insurance. The threshold for 'profile first' is approximately always."

**Cross-references:**
- `BROWSER_FREEZE_FIX_DESIGN.md §9` (full empirical findings + revised path forward).
- `KEYWORD_CLUSTERING_ACTIVE.md` POST-2026-05-02-c STATE block (in-context narrative).
- `ROADMAP.md` HIGH-severity browser-freeze entry (status flipped).
- `ROADMAP.md` NEW HTTP 500 retry regression entry (Hypothesis A from §9.5.1).

---

### 2026-05-02 — Recommendation-style placement slip: omitted `(recommended)` marker from picker labels at start of session despite rule existing (PROCESS, no production impact)

**Session:** session_2026-05-02_http-500-fix-verification-and-auto-fire-trip-observation (Claude Code)

**Tool/Phase affected:** Claude's communication behavior; recommendation-presentation pattern (HANDOFF_PROTOCOL Rule 14b/14f).

**Severity:** PROCESS (no production code impact; behavioral pattern that adds friction to director workflow if not corrected; rule already existed in operational memory but was not being applied uniformly).

**What happened:** At the start of the session, in the drift-check phase, Claude correctly stated "My recommendation: Option (a)" in the prose ABOVE the multi-option picker but then the picker itself (A/B/C/D) had no recommendation marker on option A's label. Director's framing: *"I had mentioned in previous sessions to remember to make recommendations among offered choices and the recommendation should be one that is the most thorough. Please follow this from here on and make absolutely sure every next session understands this as well."*

**Root cause:** The operational memory `feedback_recommendation_style.md` (created `2026-05-01-c`) said "Every multi-option question must have a clear, prominent recommendation that is the most thorough and reliable path" but did NOT explicitly require the recommendation to live INSIDE the picker label. Claude interpreted "prominent recommendation" loosely — putting it in surrounding prose (which is invisible if Claude Code renders the question as a forced-picker UI that hides the prose). The rule had a gap; Claude exploited the gap implicitly; director surfaced both the gap and the principle.

**How caught:** Director caught in real-time on the second message of the session.

**Correction:**
- Strengthened `feedback_recommendation_style.md` operational memory with explicit "the recommendation must live INSIDE the picker labels themselves, not only in surrounding prose. Each option label that's the recommended one carries an explicit marker — `(recommended)` or `— RECOMMENDED` at the end of the option's headline." Mechanical test: scan option labels; exactly one must be marked.
- Codified into `docs/HANDOFF_PROTOCOL.md` Rule 14f as content requirement #4 (was 1-3): "An explicit recommendation marker on the most-thorough-and-reliable option — `(recommended)` or `— RECOMMENDED` at the end of that one option's headline. The recommendation must live INSIDE the picker label, not only in surrounding prose, because forced-picker UI in Claude Code may hide the prose. Mark exactly one option as recommended; never zero. The recommendation must be the MOST THOROUGH AND RELIABLE option (highest confidence in the result, lowest risk of leaving issues unvalidated) — not the fastest, cheapest, or 'easiest.'"
- Mechanical test in Rule 14f extended with new step #4: "Is exactly ONE option marked `(recommended)` (or near-equivalent marker) inside its label, with the marker reflecting 'most thorough and reliable' — not 'fastest' or 'cheapest'? If no, add the marker."
- Cross-referenced into `docs/CLAUDE_CODE_STARTER.md` Rule 3 with the strengthened wording.
- Re-posed the original picker with the marker properly embedded; director picked option A and proceeded.

**Prevention:** Three independent mechanisms now enforce the rule for future sessions: (1) the operational memory file (auto-loaded on same-codespace continuity); (2) HANDOFF_PROTOCOL.md Rule 14f content-#4 + mechanical test #4 (read at every session start by Claude Code per `CLAUDE_CODE_STARTER.md` Step 2); (3) `CLAUDE_CODE_STARTER.md` Rule 3 (the very first thing Claude reads at session start).

---

### 2026-05-02 — Setup-confirmation re-asking slip recurrence: asked director to re-confirm consolidation prompts were pasted despite explicit affirmation; this was a clean repeat of the same slip from `2026-05-01-c` (PROCESS, no production impact, but resolved with structural fix)

**Session:** session_2026-05-02_http-500-fix-verification-and-auto-fire-trip-observation (Claude Code)

**Tool/Phase affected:** Claude's verification behavior at run-start; pre-flight runner coverage gap (`src/lib/preflight.ts`).

**Severity:** PROCESS (no production code impact from the slip itself; closed in same session by extending the runner with P11 + P12 checks — the canonical structural fix).

**What happened:** At Auto-Analyze run-start, Claude observed that the pre-flight runner's output showed Initial Prompt + Primer Prompt char counts but NOT the Consolidation Initial Prompt + Consolidation Primer char counts. Despite director having explicitly confirmed "All set as requested" earlier in the session, Claude asked the director to re-eyeball-verify the Consolidation slots had content. Director's framing #1: *"You asked this same question in the last session as well even though I pasted all 4 prompts. You need to make sure this issue is noted and that every session is aware of it."*

Claude initially misinterpreted the framing as "trust the director harder" and created a memory file `feedback_trust_director_setup_confirmation.md` capturing that principle, but director immediately clarified: *"No, I meant the tool does not recognize that all 4 prompts were added. This issue needs to be fixed."* — pointing at the runner's coverage gap as the actual root cause, not Claude's verification behavior. Two intent-misreads in two consecutive turns.

**Root cause:** `src/lib/preflight.ts` had checks `P3` (Initial Prompt) and `P4` (Primer Prompt) but no parallel checks for the consolidation pair. The runner's incomplete coverage meant Claude saw an ambiguous signal in the pre-flight output (4 prompts pasted; only 2 char counts shown) and chose to re-ask rather than note the runner's limitation neutrally. The deeper root cause was that the consolidation prompt slot existed in `AutoAnalyze.tsx` (pasted into `consolidationInitialPrompt` + `consolidationPrimerPrompt` state) but was never wired into the pre-flight runner's `PreflightContext` — a wiring oversight from Scale Session E (2026-05-01) when the consolidation slots were added but the pre-flight extension was deferred.

**How caught:** Director caught in real-time, twice — once on the redundant verification question, once on Claude's misread of the corrective framing.

**Correction:**
- **Structural fix shipped this session:** extended `src/lib/preflight.ts` with `checkP11ConsolidationInitialPrompt(ctx)` and `checkP12ConsolidationPrimerPrompt(ctx)` paralleling `P3` + `P4`. P11 enforces ≥100 char threshold matching the runtime gate at `AutoAnalyze.tsx:1474`. P12 mirrors P4's empty=pass-as-optional / 1-29=fail-as-half-paste / ≥30=pass pattern. Both gate behind `consolidationCadence === 0` (auto-fire disabled = consolidation prompts not required). PreflightContext interface extended with three new fields (`consolidationInitialPrompt`, `consolidationPrimerPrompt`, `consolidationCadence`). PreflightCheckResult id union extended with `'P11' | 'P12'`. Runner sequence inserts P11+P12 after P4 so all four prompt checks render adjacent in the UI list (stable ids preserved per director directive — no renumbering of P5..P10). 8 new tests (4 each for P11 + P12); 46/46 preflight tests pass; tsc clean; build clean; lint at exact baseline parity.
- **Operational memory:** created `feedback_trust_director_setup_confirmation.md` capturing the canonical reasoning, the slip history (now twice), AND the canonical structural fix (extend the runner). Memory file points at the runner extension as the canonical fix; the "trust director" principle remains as the operational backup behavior for any future analogous case.
- **Codified into HANDOFF_PROTOCOL.md Rule 14g (NEW):** "When the director explicitly confirms a setup item is in place ('all 4 prompts pasted,' 'all set as requested,' 'configured,' 'done,' 'ready'), trust that confirmation. Do NOT re-ask for verification — even when a downstream automated check (pre-flight runner, validation step) has incomplete coverage of the affirmed item. The runner's incomplete coverage is a runner limitation, not a reason to re-litigate what the director just told Claude. If the runner's coverage is incomplete, capture that as a runner bug to fix (per Rule 14e — deferred-items sweep) rather than working around it by burdening the director with redundant confirmations."
- **Cross-referenced into CLAUDE_CODE_STARTER.md Rule 7** with a one-sentence pointer to Rule 14g.

**Prevention:** Four independent mechanisms now prevent recurrence: (1) the runner now structurally covers all four prompt slots (P11 + P12 added) so the question doesn't even arise; (2) the operational memory file captures the principle; (3) HANDOFF_PROTOCOL.md Rule 14g codifies the principle; (4) CLAUDE_CODE_STARTER.md Rule 7 cross-references it. The structural fix (1) is the canonical preventive mechanism; (2)-(4) handle any future analogous case where Claude is tempted to re-ask despite director affirmation in a different domain.

**Adjacent process learning:** when a director gives corrective feedback, do not assume the corrective intent — ask explicitly if uncertain. Claude misread "this issue needs to be noted and that every session is aware of it" as "trust the director, don't re-ask" when the director's actual concern was "fix the tool that produced this confusion." The two corrective frames are very different (behavioral fix vs. structural fix). When the framing is ambiguous, ask one clarifying question rather than picking a frame and acting on it.

---

### 2026-05-01-c — Browser freeze on atomic canvas rebuild at ~105-node canvas — blocked auto-fire trip observation (HIGH severity, NEW SCALABILITY CONCERN)

**Session:** session_2026-05-01-c_consolidation-auto-fire-followup (Claude Code)

**Tool/Phase affected:** Workflow #1 Keyword Clustering / Auto-Analyze panel UI / canvas rendering pipeline

**Severity:** HIGH (no production damage — checkpoint preserved, canvas state in DB intact, no data loss; but the freeze blocked completion of a planned validation pass and indicates a real scalability bug that will block Phase 2 multi-user work if unfixed)

**What happened:** During Path A auto-fire validation tonight, the browser froze immediately after Batch 28 attempt 2 passed validation and entered the apply phase. Sequence: model returned response → "passed validation" log fired → "Applied X operations → 105 topics" log fired (likely from inside doApplyV3 BEFORE the post-apply re-fetch) → "page unresponsive" popup appeared → popup dismissed itself → activity log stopped streaming → 60-second wait did not recover → refresh required.

Post-refresh state: checkpoint shows "26/291 batches done, 14 min ago" — meaning the last successful saveCheckpoint was at 8:04:06 PM after Batch 27's "applied." log; Batch 28's apply was rolled back when the freeze interrupted the apply pipeline. Pre-freeze totalSpent was $10.82 confirming Batch 28 attempt 2's API call DID complete and was charged (~$0.30) but its result never persisted.

**Root cause (probable, pending profiling):** the layout pass for atomic canvas rebuild appears to run synchronously on the main JS thread. At 105 nodes with 21 ops applied, the layout calculation holds the event loop long enough to trigger Chrome's "page unresponsive" heuristic (typically 5+ seconds of unresponsive main thread). The atomic-rebuild API call subsequently sends a full canvas snapshot which may compound the main-thread pressure.

This is asymptotically dangerous. PLOS targets 500+ topic canvases in Phase 3 (per `PLATFORM_REQUIREMENTS.md §1`). If 105 topics already triggers a freeze, 500 topics would be unusable. The freeze blocks Phase 2 multi-user work since other workers can't be onboarded onto a UI that freezes.

**How caught:** Director observed page-unresponsive popup mid-Batch-28-apply during Path A auto-fire validation; reported to Claude; Claude diagnosed the symptom (apply-phase freeze, not API freeze, evidenced by Batch 28's API call completing and getting charged before the freeze).

**Correction:** No fix this session — the diagnostic and design work for the layout-pass refactor is beyond a doc-batch session. Captured to ROADMAP as a HIGH-severity infrastructure-TODO under Phase 1 polish. Probable fix approaches to evaluate in a future design session: (a) chunk the layout work into requestAnimationFrame batches; (b) move layout to a Web Worker; (c) optimize the layout algorithm itself if it has O(n²) hotspots; (d) defer the atomic-rebuild snapshot to a background task. Future session should profile the layout pass first to confirm it's the actual bottleneck before designing the fix.

**Prevention:** Capture as ROADMAP architectural-concern entry. Don't run further Path A auto-fire validation on canvases ≥ ~100 topics until the freeze fix ships — instead, validate auto-fire on smaller-canvas runs (cadence + min-canvas-size both lowered to e.g., 5 + 50) where the freeze risk is below the trigger threshold. This is a temporary mitigation; the real fix is the layout-pass refactor.

---

### 2026-05-01-c — Asymmetric defense-in-depth: /canvas GET missing withRetry wrapper that /canvas/nodes GET has — diagnosed and FIXED (MEDIUM severity)

**Session:** session_2026-05-01-c_consolidation-auto-fire-followup (Claude Code)

**Tool/Phase affected:** Workflow #1 Keyword Clustering / canvas state-fetch route handler (`src/app/api/projects/[projectId]/canvas/route.ts`)

**Severity:** MEDIUM (cost overhead from unnecessary retries — ~$0.20-0.30 per affected batch, ~$1.50 today; and intermittent run-pause user-disruption when retries ultimately fail — though that didn't fire today)

**What happened:** Today's session ran 22 batches against the Bursitis Test project. 6 batches (15, 17, 19, 21, 27, 28) hit "fetchCanvas failed: HTTP 500 — retrying" errors mid-run. Of those 6, 5 were "state fetch HTTP 500" and 1 was "nodes fetch HTTP 500." That's a 5:1 asymmetry. Random pgbouncer flakiness would predict roughly 1:1 — both endpoints are queried in parallel by `useCanvas.fetchCanvas` and hit the same Supabase backend.

**Root cause:** The 2026-04-28 canvas-blanking session shipped the G2 fix (per `DEFENSE_IN_DEPTH_AUDIT_DESIGN.md §5.3`) which wraps the `/canvas/nodes` GET handler's Prisma query in `withRetry()` — handling transient pgbouncer flakes (P1001/P1002/P1008/P2034) by retrying 100ms then 500ms before surfacing as HTTP 500. This shipped at `src/app/api/projects/[projectId]/canvas/nodes/route.ts:28-33`.

But the parallel `/canvas` GET handler — which fetches `canvasState` + `pathway` + `sisterLink` rows in three Prisma calls — was NEVER retrofitted with the same wrapper. So transient flakes on this endpoint surfaced directly as HTTP 500 to the client. The asymmetry was hidden by yesterday's smaller sample size (16 batches → 1 storm = looked like normal noise) and only became statistically obvious tonight.

The 5:1 ratio is the empirical signal. State-fetch endpoint surfaces ~5× more 500s than nodes-fetch endpoint because nodes-fetch silently retries while state-fetch doesn't.

**How caught:** Director asked Claude to "find a solution to the HTTP 500 retry storm" during end-of-session prep tonight. Claude grep'd the relevant code, traced the asymmetry, and diagnosed the missing wrapper.

**Correction:** Surgical 3-line fix shipped this session. Each Prisma query in `src/app/api/projects/[projectId]/canvas/route.ts` GET handler now wrapped:

```ts
const [canvasState, pathways, sisterLinks] = await Promise.all([
  withRetry(() => prisma.canvasState.findUnique({ where: { projectWorkflowId } })),
  withRetry(() => prisma.pathway.findMany({ where: { projectWorkflowId } })),
  withRetry(() => prisma.sisterLink.findMany({ where: { projectWorkflowId } })),
]);
```

Plus an import line and a module-level comment documenting the asymmetric-fix history so future sessions don't have to re-derive the rationale. All checks green: tsc clean; build clean; lint at exact baseline parity (16e/41w; zero new); withRetry test suite 17/17 pass.

**Prevention:** Once deployed, expected effect is "state fetch HTTP 500" rate drops back to near-zero on transient flakes (matching the rate `/nodes` has had since 2026-04-28). Persistent failures (multi-attempt) will still surface — but transient single-flakes will silently retry and succeed. Verification deferred to next session: re-run the Auto-Analyze on Bursitis Test post-deploy and confirm the storm rate drops.

**Process learning:** when shipping a defense-in-depth fix to one endpoint of a paired set (where multiple endpoints hit the same backend in parallel), audit the sister endpoints in the same session for the same vulnerability. The G2 fix from 2026-04-28 was scoped narrowly to the endpoint that triggered the canvas-blanking bug, not the broader pattern. Adding "audit sister endpoints" as a step in the post-fix review would have caught this asymmetry then. Capturing as a process improvement for future defense-in-depth fixes.

---

### 2026-05-01-c — Recommendation style: presenting options neutrally with implicit "pick the cheap one" framing instead of clear most-thorough recommendation (PROCESS, MEDIUM severity)

**Session:** session_2026-05-01-c_consolidation-auto-fire-followup (Claude Code)

**Tool/Phase affected:** Claude's recommendation style across all decision-framing per HANDOFF_PROTOCOL.md Rule 14b / Rule 14f

**Severity:** MEDIUM (no production damage — ongoing communication-style slip that costs the director time-to-decision; but a recurring pattern that needed mechanical correction)

**What happened:** Mid-session, when presenting Path A auto-fire validation options (A1 lower-cadence shortcut at ~$1.20 / 10-15 min, A2 skip the live test entirely, A3 production-realistic full validation at ~$3-4 / 25-35 min), Claude flagged A1 as "Recommended" but the framing made the choice feel like "here are three options, pick whichever fits your mood" rather than a clear directive recommendation. Claude's reasoning emphasized the cost/time savings of A1 over the validation thoroughness of A3.

Director called out the slip directly: *"Instead of always giving me multiple choices without any recommendations, you need to always make the recommendation that is the most thorough and reliable way to fix issues. Make a note of this for future sessions as well and the rest of this session and for the current options you provided."*

**Root cause:** Claude's default recommendation framing was implicitly optimizing for speed/cost trade-offs (presenting cheaper options as "the recommendation" because they minimize friction). The director's actual standing preference is to invest in thorough validation — they're the budget-holder, they've already decided thoroughness is worth the cost, Claude doesn't need to protect them from spending. The pattern was: present options with cost/time differences highlighted, and recommend the cheapest "reasonable" option as if it were the best. That's wrong — the recommendation should always name the most thorough and reliable path, with reasoning focused on confidence/coverage/risk-reduction.

**How caught:** Director caught it in real-time and gave explicit feedback.

**Correction:** Created permanent memory file `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/feedback_recommendation_style.md` capturing the rule, the rationale, and the mechanical application. Also revised the in-session Path A recommendation to A3 (most thorough and reliable). Memory file is auto-loaded in every future session via `MEMORY.md` index entry.

**Prevention:** The memory file's "How to apply" section gives the mechanical test: every multi-option question's recommendation must name the most thorough and reliable option with reasoning that focuses on confidence/coverage/risk-reduction — not on speed or cost savings. Cheaper alternatives can be mentioned as factors but explicitly framed as "leaves Z unvalidated" not "recommended." Lucidity caveats remain valid but don't override the thoroughness preference.

This is also operationally adjacent to HANDOFF_PROTOCOL.md Rule 14 (expert-consultant persona) which states: *"Claude gives a clear recommendation with reasoning ('I recommend X because Y') rather than laying out options neutrally and asking the user to pick."* Rule 14 was already on the books; this entry strengthens it with the specific failure mode (optimizing for speed/cost) and the specific corrective rule (optimize for thoroughness/reliability).

---

### 2026-05-01 — `decideTier` dormant-stability force-pin design-implementation mismatch — surfaced mid-D3-run (HIGH severity)

**Session:** session_2026-05-01-b_scale-session-e-d3-validation (Claude Code)

**Tool/Phase affected:** Workflow #1 Keyword Clustering / Auto-Analyze tier mode (`src/lib/auto-analyze-v3.ts` `decideTier` function)

**Severity:** HIGH (no production damage — the run was paused mid-flight before the wall would have hit; one wasted partial run plus the spend already accumulated; the patch shipped cleanly and the run resumed under patched code; but the class-of-failure is "Claude operating on partial information at session start" which is what Rule 24 was designed to prevent — and the rule didn't fire here because Rule 24 is scoped to ROADMAP captures, not algorithmic claims)

**What happened:** During D3's full-Bursitis validation run, batches 1-4 produced unexpectedly small Tier 1 / Tier 2 sections. Investigation revealed every newly-created topic was force-pinned to Tier 0 by `decideTier:987` — `if (stabilityScore < STABILITY_TIER_THRESHOLD) return 0`. Verified in code:

1. **Schema** (`prisma/schema.prisma:119`): `stabilityScore Float @default(0.0)` — every newly-created topic starts at stability 0.0
2. **Applier** (`operation-applier.ts:457` + `:656`): hardcodes `stabilityScore: 0.0` on `ADD_TOPIC` + `SPLIT_TOPIC` `into[]`
3. **V4 prompt** (line 540): "New topics created in this batch are implicitly at 0.0 and the tool tracks them; you do not emit a stability_score field on any operation."
4. **Tier decider** (`auto-analyze-v3.ts:987`): force-pinned every topic with stability < 7.0 to Tier 0 — including topics with the schema default 0.0 (i.e., literally every topic in the run)

Net effect: tier mode compression dormant in practice; input growth tracked V3 exactly; design's "recency does demotion work while stability is dormant" intent (`INPUT_CONTEXT_SCALING_DESIGN.md` §2.3) was unrealized.

**Mismatch:** `INPUT_CONTEXT_SCALING_DESIGN.md` §2.3 "Dormant in first ship" stated *"Until [stability] ships, the recency signal does all the demotion work"* — but the Session C implementation (line 987) force-pinned on stability before the recency-not-touched signal could let any topic fall to Tier 1. Design intent and Session C implementation diverged at the decider's third force-condition. **Both pieces of doc + code were in my context at session start (read during the mandatory start-of-session sequence), but I did not synthesize them.** Specifically: I read §2.3's "recency does the demotion work" claim and accepted it without verifying that the tier decider's actual code preserved that property.

**Root cause:** Rule 24 (pre-capture search before adding any ROADMAP item or proposing new architectural concern) is scoped to ROADMAP captures. It does NOT require Claude to verify the implementation against the design's claims at session start when the session is *running* the design (vs. *capturing new architectural items*). I trusted §2.3's claim transitively — "the design says recency does demotion work, so when D3 runs, the system will behave that way." This is the same failure mode Rule 24 was created to prevent (operating on partial information without verification), just at a different moment in the workflow.

This is also adjacent to Rule 1 (Verify Before You Write) and Rule 3 (Code is the ultimate source of truth) — both rules establish "verify before act" as a principle. Neither was specifically wired to fire at the start of a validation run that depends on a load-bearing algorithmic property.

**How caught:** Director observed batch-1-through-4 input-token growth pattern matched V3 baseline rather than the expected reduction; flagged that "input is growing — is tier mode actually compressing?" Claude then read the decider implementation, identified the force-pin at line 987, traced the dormant-zero default through schema + applier + prompt, and surfaced the design-implementation mismatch.

**Correction:** Two-line surgical patch in `src/lib/auto-analyze-v3.ts`:

- Line 987: `if (stabilityScore < STABILITY_TIER_THRESHOLD) return 0;` → `if (stabilityScore > 0 && stabilityScore < STABILITY_TIER_THRESHOLD) return 0;`. Treats `stabilityScore === 0` as "unscored / dormant default — let recency decide" instead of "deliberately scored low." Forward-compatible with Scale Session F's stability scoring (the gate fires for genuinely scored low values 0.1-6.9).
- Line 992: `if (deeplyStale) return 2;` → `if (deeplyStale && stabilityScore >= STABILITY_TIER_THRESHOLD) return 2;`. Makes the §2.4 Tier 2 AND-rule explicit at the Tier 2 decision point.

Plus 4 new tests in `auto-analyze-v3.test.ts` covering the dormant-stability truth table. 252 src/lib tests pass; tsc clean; build clean; lint at exact baseline parity. Committed as `2209f08`; pushed to `origin/main`; Vercel auto-deployed. Run resumed from pre-pause checkpoint after director hard-refreshed browser — pause-resume across browser refresh + new code load proven to work.

The patch ALSO surfaced a deeper design issue: **the dormant-zero convention is forward-incompatible with Scale Session F**. When stability scoring ships and starts populating values 0.0-10.0, a topic with the literal value 0.0 (deliberately scored at the bottom) will be indistinguishable from an unscored topic. Captured to `INPUT_CONTEXT_SCALING_DESIGN.md` §7 Open questions as "dormant-zero ambiguity" with the cleaner alternative (explicit `stabilityScored: Boolean` flag) noted for Session F to revisit.

The patch did NOT fully solve the wall question — D3 measurement showed ~30% per-topic input reduction (vs design's hoped-for order-of-magnitude). Investigation during the run identified **recency-stickiness** as the deeper bottleneck: cross-cutting ops (sister links, moves, merges) touch many topics per batch, keeping all of them in the recency window of 5. Two follow-up design items captured to ROADMAP: sister-link op deferral to consolidation-only + Q5 → B touch-semantics refinement. **The mistake here is specifically the line 987 force-pin; the recency-stickiness is a separate finding (real but distinct) that the patch unblocked the discovery of.**

**Prevention proposed (for future sessions; not a rule update yet — pending director discussion):**

The right rule generalization is something like: *"When a session's purpose is to validate a load-bearing algorithmic property, verify the implementation against the design's claims about that property as part of the drift check — read the relevant function(s), not just the design doc that asserts the property."*

Concretely for D3, the drift check should have included reading `decideTier` (`auto-analyze-v3.ts:982-994`) and verifying that the force-Tier-0 conditions matched §2.3's "recency does demotion work" claim. That verification would have caught the line 987 mismatch immediately.

This is a generalization of Rule 24 from "before adding to forward plan" to "before validating an existing claim." A formal rule update should wait until either (a) the pattern recurs in a future session and we capture the second instance, or (b) the director endorses the generalization. For now, this entry serves as a precedent for future Claude sessions to find via grep.

**Cross-references:**
- `INPUT_CONTEXT_SCALING_DESIGN.md` §6 Scale Session E "D3 mid-run patch — dormant-stability fix" subsection (the canonical patch story)
- `INPUT_CONTEXT_SCALING_DESIGN.md` §6 Scale Session E "D3 partial validation outcome" subsection (the broader run findings)
- `INPUT_CONTEXT_SCALING_DESIGN.md` §7 Open questions "Dormant-zero ambiguity in `stabilityScore`" row
- Commit `2209f08` (the patch)
- `KEYWORD_CLUSTERING_ACTIVE.md` POST-2026-05-01-SCALE-SESSION-E-D3 STATE block (this session's full record)
- `HANDOFF_PROTOCOL.md` Rule 24 (the closest-related rule; this entry argues for generalizing it)

**Why "HIGH" not "Critical":** no production data lost; no cascading downstream impact; the patch shipped cleanly + the run resumed under patched code + the validation still produced useful data (the ~30% reduction measurement is real even with the partial fix). Class-of-failure (Claude operating on partial information about the system's algorithmic properties) is severe enough to warrant an entry future sessions will find on grep.

**Cost impact:** ~$2-3 of the run's first 4 batches was effectively wasted (the run would have hit V3 baseline behavior; useful only for catching the bug). After the patch landed, the remaining 12 batches genuinely measured the patch's effect (~$3). Net "validation-related" cost: ~$3-4 of the ~$7 total spend was on real D3 measurement; the rest was retries / pause / discovery overhead.

---

### 2026-05-01 — Supabase HTTP 500 errors on fetchCanvas during batch 17 retry storm (INFORMATIONAL — backend hiccup, not a Claude mistake)

**Session:** session_2026-05-01-b_scale-session-e-d3-validation (Claude Code)

**Tool/Phase affected:** Workflow #1 Keyword Clustering / Auto-Analyze runtime / production vklf.com Supabase backend

**Severity:** INFORMATIONAL (no production damage; one batch (batch 17) failed cleanly after 3 attempts; canvas state not corrupted; ~$0.78 wasted on the 3 failed attempts; director paused the run shortly after the third failure)

**What happened:** During D3's full-Bursitis validation run, batches 15 and 17 hit `HTTP 500 — fetchCanvas failed` errors after the API call + canvas-rebuild completed successfully. Specifically:

- **Batch 15:** completed apply at 5:13:24 PM → `fetchCanvas failed: nodes fetch HTTP 500 — retrying in 5s`. Retry (attempt 2) cleared on second try; total cost $0.521 across both attempts.
- **Batch 17:** completed apply at 5:19:59 PM → `fetchCanvas failed: state fetch HTTP 500 — retrying in 5s`. Attempt 2 (5:21:46 PM): apply succeeded → `fetchCanvas failed: nodes fetch HTTP 500 — retrying in 15s`. Attempt 3 (5:22:08 PM): API call completed → `Validation failed: Missing 1 batch keywords (trochanteric bursitis stretching)`; batch 17 fully FAILED. Total cost across 3 attempts: $0.779.

The error is in the post-apply `fetchCanvas` call from `useCanvas.ts` — the run-loop applies operations atomically, then re-fetches the canvas state to verify the rebuild. The fetch is hitting Supabase's REST API and getting HTTP 500. Two endpoints affected: `nodes` and `state`. Pattern: intermittent (some batches fine; some fail).

**Root cause (likely):** Supabase backend hiccup. The endpoints are simple Prisma reads — no complex query logic, no migration in flight, no schema drift. Most likely: brief Supabase Postgres connection-pool exhaustion or an upstream Supabase infrastructure blip. Has happened before sporadically; the existing retry logic (`useCanvas.ts` retries with exponential backoff) was added precisely to absorb this kind of transient failure.

**How caught:** Director observed the retry messages in the activity log and paused the run shortly after.

**Correction:** None this session — director paused the run, ending the retry storm naturally. Pattern preservation, not a Claude mistake.

**Prevention (existing, not new):** The `useCanvas.ts` retry logic already absorbs single-attempt failures; this session's pattern was 3 consecutive failures on batch 17 which suggests the backend hiccup was longer than the retry budget. If this recurs:

1. Consider extending the retry budget for `fetchCanvas` calls (currently 3 attempts; 5 might be more appropriate during long-running batched workloads)
2. Consider exponential-backoff with jitter on retry delays (currently fixed 5s / 15s; might be improved)
3. Consider a circuit breaker that pauses the run-loop if HTTP 500 rate exceeds a threshold (e.g., 3 in last 5 batches)

Not promoted to ROADMAP yet — single occurrence; pattern preservation is enough for now.

**Cost impact:** ~$1.30 across batches 15 + 17 retries (would have been ~$0.50 if all succeeded first attempt). Minor compared to the run's ~$7 total.

**Cross-references:**
- `useCanvas.ts` (the retry logic that absorbs these failures)
- Run activity log captured in `KEYWORD_CLUSTERING_ACTIVE.md` POST-2026-05-01-SCALE-SESSION-E-D3 STATE block

---

### 2026-04-30 — V4 first-batch adaptive-thinking runaway on small canvas (INFORMATIONAL — pattern preservation, not a Claude mistake)

**Session:** session_2026-04-30-c_scale-session-d-build (Claude Code)

**Tool/Phase affected:** Workflow #1 Keyword Clustering / Auto-Analyze panel — Scale Session D V4 prompt activation

**Severity:** INFORMATIONAL (no production damage, no data loss; one wasted API call costing ~$0.30–$1 in adaptive-thinking tokens. The pattern itself is well-known — adaptive thinking on a complex prompt can spiral — but the threshold at which the existing in-panel hint fires (canvas ≥50 topics) didn't trip on a 37-topic canvas, even though V4's heavier prompt + new reasoning load made it fire there).

**What happened:** During Scale Session D's small-batch validation on Bursitis Test (37 topics), the first attempt at batch 1 with `Thinking = Adaptive` stalled in the thinking phase for ~10 minutes with no per-second visible log activity in the panel after the initial `thinking phase started…` line. The stream's stall-detection timer (90 seconds default) did not fire because some SSE traffic was apparently still arriving (silent thinking deltas) — so from the harness's perspective the call was making progress, even though no operations had been emitted. Director cancelled the run after the 10-minute mark; the second attempt (with Thinking still on Adaptive — the change wasn't strictly necessary, the runaway just happened to clear) completed cleanly in ~2 minutes (1m 51s thinking phase + ~13s output streaming).

**Root cause:** Adaptive Thinking has no internal budget cap. On a complex prompt — V4 is ~2k characters heavier than V3 (~88k char total system text) and asks the model for more per-op reasoning (intent fingerprints add a generation step on every ADD_TOPIC / UPDATE_TOPIC_TITLE / SPLIT_TOPIC into[] / MERGE_TOPICS), plus the tier mode means the model is now reading the input as three sections instead of one — the model can spiral on a first-call cold cache. Anthropic's prompt cache fills on this first call (cache_creation_input_tokens), so subsequent batches see massive cache hits and don't trigger the same runaway (batch 2 had `Cache hit: 20,578 tokens`).

**What the existing panel hint catches:** the panel already surfaces a yellow warning recommending `Thinking = Enabled` with `Budget 12000+` when canvas size ≥50 topics. That warning was added 2026-04-18 after observing the same pattern on V2 prompts. We hit the pattern at canvas size 37 on V4 because V4's higher complexity load makes the threshold for runaway risk lower than V3's.

**How caught:** Director monitored the panel log directly and flagged that "It's been 10 minutes and no outputs have been generated."

**Correction:** Director cancelled the stuck batch via the panel's Cancel button. Re-clicked Start. Second attempt completed cleanly. No code change made this session — the wiring was working correctly; the issue was a model-runtime characteristic, not a wiring bug.

**Prevention (proposed for next session, not implemented this session):**

1. **Lower the panel hint's canvas-size threshold for V4 prompts.** The existing `nodes.length >= 50` gate for showing the Adaptive Thinking warning should drop to `nodes.length >= 30` OR be stripped entirely on V4 (always show the warning). Captured as a Phase-1 polish item in `KEYWORD_CLUSTERING_ACTIVE.md` POST-2026-04-30-SCALE-SESSION-D STATE block, option (b) UI polish bundle.

2. **Document the workaround in the V4 prompt's introduction or a panel tooltip:** "If you see the run stuck at `thinking phase started…` for >3 minutes on the first batch, click Cancel and switch Thinking to `Enabled` with Budget 12000+ before retrying. The first-batch cache-cold path can spiral on Adaptive Thinking with V4." (Optional — Phase-1 polish item if the pattern recurs).

3. **Consider an in-panel stall warning for thinking-only stalls.** The current 90-second stall timer fires only when no SSE traffic at all arrives. A "thinking-phase exceeds N minutes with no operations emitted" warning could surface earlier and let the user decide. Open question for next session — captured here, not promoted to ROADMAP yet.

**Why captured here as INFORMATIONAL not as a Claude mistake:** Claude correctly flagged the pattern at the 4-minute mark, correctly explained the silent-thinking-deltas-don't-trigger-stall reasoning, correctly recommended bounded thinking (`Enabled + Budget 12000+`) at the 10-minute mark, and correctly stayed calm when the second attempt cleared without the recommended change. The mistake-failure mode would have been Claude either (a) silently waiting indefinitely without surfacing the stall to the director, or (b) jumping to "the wiring is broken" instead of correctly diagnosing it as an adaptive-thinking characteristic. Neither happened. Capturing the pattern here gives future Claude code sessions the diagnostic playbook for this exact failure mode on V4.

**Cost impact:** ~$0.30–$1 in thinking tokens on the cancelled first attempt (Anthropic charges thinking tokens at output rates; the exact amount depends on how deep the model got before cancellation). Not catastrophic for a small-batch validation, but worth knowing.

**Cross-references:**
- Existing panel hint at `AutoAnalyze.tsx` ~line 1722 (`thinkingMode === 'adaptive' && nodes.length >= 50`) — this is what we'd lower the threshold of.
- V4 prompts at `docs/AUTO_ANALYZE_PROMPT_V4.md` (~88k char total, ~2k more than V3).
- Original 2026-04-18 V2-era observation that drove the existing hint — captured in `KEYWORD_CLUSTERING_ACTIVE.md` Phase-1g-test history (the hint references it inline).

---

### 2026-04-30 — `.env.local` missing newline breaks `--env-file` for ANTHROPIC_API_KEY (LOW — pre-existing config artifact, not a Claude mistake)

**Session:** session_2026-04-30_scale-session-b-build (Claude Code)

**What happened:** While running the new `scripts/backfill-intent-fingerprints.ts` for Scale Session B Step 2, `node --env-file=.env.local` failed with `ANTHROPIC_API_KEY environment variable is required`. Investigation revealed `.env.local` has no newline between the `DIRECT_URL="..."` line's closing quote and the next `ANTHROPIC_API_KEY=` line — they're concatenated as a single line, so the dotenv parser treats the API key as part of `DIRECT_URL`'s value. Visible via `grep "ANTHROPIC" .env.local` showing the entire concatenated line, vs. `cut -d= -f1 .env.local` not listing `ANTHROPIC_API_KEY` as a key.

**Workaround used this session:**
```
export ANTHROPIC_API_KEY=$(grep -oP 'ANTHROPIC_API_KEY=\K[^[:space:]"]+' .env.local)
node --env-file=.env --experimental-strip-types scripts/backfill-intent-fingerprints.ts ...
```

**Permanent fix (for the director to do when convenient):** edit `.env.local` and insert a newline before `ANTHROPIC_API_KEY=`. The exact byte sequence today is `..."ANTHROPIC_API_KEY=sk-ant-...` — should be `..."\nANTHROPIC_API_KEY=sk-ant-...`.

**Why captured here:** future sessions that try to run a Node script needing `ANTHROPIC_API_KEY` from `.env.local` will hit the same wall. Capturing the workaround + the fix prevents re-discovery overhead.

**Not a Claude mistake:** pre-existing artifact in the user's local config. Auto-Analyze on the dev server reads the key via the proxy route `/api/ai/analyze` which goes through Next's env loading (which apparently tolerates the missing newline — or reads it via a different path). Direct script invocation is the only place the missing newline bites.

---

### 2026-04-29 — Directive-driven scope expansion handled correctly (INFORMATIONAL — pattern preservation, not a mistake)

**Session:** session_2026-04-28_canvas-blanking-and-closure-staleness-fix (Claude Code)

**What happened:** Director gave a meta-directive mid-session — *"I want you to employ an approach that fixes the fundamental problem long term. The same goes for testing the fixes. They should test the tool in a sturdy way."* — while Claude was already in flight on the surgical Bug 1 fix (defensive `useCanvas.fetchCanvas` only, no other hardening). The original locked design in `ROADMAP.md` and the prior session's fix-design block specified the SURGICAL fix only. Director's directive expanded scope without naming what was newly in/out of scope.

**What Claude did right:** Paused work mid-task. Acknowledged the directive. Re-surveyed Bug 1 + Bug 2 + tests at the new scope ("fundamental long-term" = prevent the bug class structurally, not just patch the bug instance; "sturdy testing" = exhaustive test tables covering every failure mode + the regression scenario contrast test). Wrote a plain-language preview describing what was changing vs. the original locked plan: (a) Bug 1 expansion to harden ALL `useCanvas` methods uniformly, not just `fetchCanvas`; (b) Bug 2 expansion to the function-entry shadow pattern that prevents the bug class everywhere in `doApplyV3`, not just the line-830 fix; (c) testing expansion to exhaustive truth-table coverage + regression-scenario reproduction. Listed what was being deferred to the future Defense-in-Depth Audit session (ESLint custom rule, runtime invariants, server-side guards). Asked the director to push back if any of the expansion was wrong before writing more code. Director did not push back; proceeded.

**The pattern this preserves for future sessions:** when a director gives a meta-directive (something framed at the architectural / quality bar level rather than at the specific-bug level), Claude should NOT silently absorb it into the existing plan. The right move:

1. Pause the in-flight task at a clean checkpoint.
2. Re-survey the scope at the new bar.
3. Write a plain-language preview that says explicitly: "here's what changes vs. the original plan, here's what stays out, here's what gets deferred."
4. Surface scope-expansion items that should be deferred (per Rule 14e) — naming where they'll live (ROADMAP item, CORRECTIONS_LOG entry, etc.).
5. Get acknowledgment (or push-back) before writing more code.

**Why this is INFORMATIONAL not a mistake:** the failure mode of NOT doing this — silently absorbing the directive — is the actual mistake to watch for. This session avoided that mistake. Capturing the positive pattern here gives future Claudes a model for what "right" looks like when the dynamic recurs.

**Related:** The session ALSO had a second meta-directive later — *"Our main priority is fixing the fundamental issues and not saving the data in the current project. Guide me with this in mind."* — that replaced the original surgical-cleanup plan (delete 17 orphan nodes + Reconcile Now on 316 status-drift keywords) with a wholesale Bursitis canvas wipe. Same pattern applied: paused, re-surveyed, presented the new wipe plan with full pre-write counts in a Rule 8 confirmation dialogue, got explicit director YES, then executed.

**No mitigation needed:** the pattern is the mitigation.

---

### 2026-04-28 — Omitted 5 of 8 director feedback items from initial fix-recommendations response (MEDIUM severity)
**Session:** session_2026-04-28_deeper-analysis-and-fix-design (Claude Code)
**Tool/Phase affected:** Cross-session communication discipline / handoff completeness / W#1 Keyword Clustering deeper-analysis-session output

**Severity:** MEDIUM (no production damage, no data loss, no wrong code shipped — but a coverage failure that left the director feeling 5 of 8 items they raised in the prior session weren't being addressed; required them to call it out explicitly and re-request handoff updates that include all 8 items; risk if uncaught: those items quietly drift in priority and the director loses confidence that their feedback is being tracked).

**What happened:** During the 2026-04-28 deeper-analysis session, after producing the bug report and quality-issue catalog, I produced a "Fix Recommendations" laydown covering 7 issues (A canvas-blanking, B closure-staleness, C orphan-roots cleanup, D body-part ladder, E status-drift, F empty leaves, plus an architectural cost/quality discussion). The fix laydown was structured around the issues I had freshly diagnosed in this session — bugs and bug-residuals — and did NOT cycle back to the director's earlier 8-item feedback list captured in the POST-2026-04-28-SCALE-SESSION-0-OUTCOME-C STATE block of `KEYWORD_CLUSTERING_ACTIVE.md` (lines 60-69 at session start). My fix recommendations directly addressed only items #1, #2, and #7 from that list; touched item #6 glancingly; and OMITTED items #3 (Skeleton View polish), #4 (AST split-view alignment polish), #5 (Topics table row numbers polish), and #8 (Intelligent cost/quality strategy).

Director's response: *"You also did not mentioned all my feedback issues and I want your handoff updates to include addressing those specific issues as well."* — flagged the coverage gap and corrected the deliverable scope.

**Root cause:** scope-discipline failure adjacent to but distinct from the 2026-04-27 Rule-24 mistake. The 2026-04-27 mistake was about not searching prior treatment before adding a new ROADMAP item. This mistake is about not cycling back to a director's existing list of items when producing a session deliverable that was implicitly expected to track ALL of them. The mental shortcut: "items #3, #4, #5 are already captured in ROADMAP as polish — mentioning them again in fix-recommendations would be redundant." That shortcut was wrong. The director needed:

(a) Explicit acknowledgment that I read all 8 items, not just the bug-flavored ones.
(b) A status reading per item — done, deferred, captured-where, planned-when — so they can sequence work and feel the feedback is being tracked.
(c) Surface visibility of items already in ROADMAP, even if I'm not advancing them this session, because the director is using the deliverable as their working summary of the project's open list.

In short: when the director gives a multi-item list, every item gets a status row in every subsequent deliverable that addresses any item from that list. "Already captured" is a status, not a reason to omit.

**How caught:** Director directly flagged: *"You also did not mentioned all my feedback issues and I want your handoff updates to include addressing those specific issues as well."*

**Correction:** Produced a complete 8-item feedback table (`#`, director's words, status from this session, where captured, plan), included it in the new POST-2026-04-28-DEEPER-ANALYSIS STATE block of `KEYWORD_CLUSTERING_ACTIVE.md` AND in the personalized handoff message at session end. Each item gets a row regardless of whether THIS session advanced it — "already captured as Phase-1 polish, scheduled with the next UI session" is a complete status row.

**Prevention:** New procedural pattern for cross-session deliverable production:

1. **At the start of any deliverable that responds to director-raised feedback, re-read the director's feedback list verbatim from the source doc** (the prior STATE block, the chat where they raised it, etc.). Don't rely on working memory of "what I think they raised."
2. **For every item on that list, produce a status row in the deliverable** — done, deferred, captured-where, planned-when, dispositioned. "Already in ROADMAP" is a status, not an omission license.
3. **If 5+ items, produce a status table not just prose** — the director scans tables faster and the format makes coverage gaps immediately visible to me too.
4. **Cycle the table through every deliverable in the session that touches any item** — the bug-report deliverable AND the fix-recommendations deliverable AND the handoff message. Repetition isn't redundancy when the director is using these as working summaries.

This rule generalizes beyond Auto-Analyze deliverables: any session that responds to a multi-item director ask (a list of bugs to triage, a list of features to scope, a list of polish items to prioritize, a list of design questions to answer) gets a status table that covers every item.

Relationship to existing rules:
- Adjacent to HANDOFF_PROTOCOL Rule 24 (pre-capture search before ROADMAP entries) — both are about verifying coverage before claiming to have addressed something.
- Adjacent to Rule 14e (capture-what-you-defer) — Rule 14e is about not letting flagged items leave the session uncaptured; this rule is about not letting director's items disappear from VISIBLE STATUS in the session deliverable.
- Possibly should become a HANDOFF_PROTOCOL rule in a future session if the pattern recurs. For now, captured here for next-session awareness.

---

### 2026-04-27 — Failed to synthesize prior treatment when proposing context-scaling ROADMAP item — operating on partial information despite having relevant docs in context (HIGH severity)
**Session:** session_2026-04-27_v3-prompt-small-batch-test-and-context-scaling-concern (Claude Code)
**Tool/Phase affected:** Cross-session methodology / ROADMAP item capture / Auto-Analyze architectural concern framing
**Severity:** HIGH (no production damage, no data loss, no wasted code commits — but a class-of-failures mistake that the director explicitly flagged as critical, requiring an instruction-set update; if not caught, would have produced a ROADMAP entry that misrepresented the system's design history and risked a future session re-implementing V2 Mode A→B without knowing it had been considered and deleted)

**What happened:** During the 2026-04-27 V3 small-batch test session, after the V3-refined prompt validation passed qualitatively, the director asked: "based on the data provided, when (if at all) do you expect our tool to run into a context wall or another issue since there are so many keywords in our keywords list. Is our system designed to handle those issues or should we figure out fixes for those anticipated issues."

Claude responded with an analysis projecting that the run would hit a 200k context wall somewhere between 600-1,000 topics (based on per-topic TSV cost of 150-300 tokens × Sonnet 4.6's standard 200k window). Claude framed this as: *"The system was not explicitly designed to handle it."* Claude then proposed adding the context-wall as a new ROADMAP item under "Phase-1 polish."

Director responded: *"Didn't we have some adaptive feature that was supposed to prevent the context wall issue (for example, only passing delta rather than the entire TSV? I might be mistaken?). Can you study all the keyword sorting tool documents deeply and tell me if this still needs fixing? Be thorough in your analysis and answer. If you did miss this, I want you to understand that this was a critical mistake on your end and I want you to update the instructions set to absolutely and always prevent this kind of issue again where you are operating on partial information because it will add things to the roadmap that we already issued."*

Upon doing the deep study (greps across `PIVOT_DESIGN.md`, `AUTO_ANALYZE_PROMPT_V3.md`, `AUTO_ANALYZE_PROMPT_V2.md`, `KEYWORD_CLUSTERING_ACTIVE.md`, `ROADMAP.md`, `PLATFORM_ARCHITECTURE.md`, plus reading the actual code in `src/lib/auto-analyze-v3.ts` and `src/app/.../AutoAnalyze.tsx`), Claude found:

1. **`ROADMAP.md` line 162** explicitly credited the V2 Mode A→B auto-switch with **"avoiding the projected 200k context wall"** during the 2026-04-20 51-batch Bursitis run. So a relevant adaptive feature DID exist in V2.
2. **`PIVOT_DESIGN.md` line 205 + 246** explicitly acknowledged the input-scaling trade-off in V3: *"the canvas TSV input grows per batch and isn't cached"* and *"the cost-stops-scaling-with-canvas claim is partly true — the input TSV grows linearly with canvas size."* So the issue WAS considered during V3 design, just not solved.
3. **Pivot Session E (2026-04-25)** deleted Mode A→B entirely on the rationale that V3's operations-output makes output-side mitigation unnecessary. V3's deletion was correct for output-side concerns but inadvertently left input-side context-scaling without any mitigation in the V3 architecture.
4. **Code verification** confirmed `buildOperationsInputTsv` (auto-analyze-v3.ts line 98) takes the FULL canvas every batch — zero filtering, truncation, subset, or summarization. There is NO input-side adaptive mechanism in V3.

So Claude's proposed ROADMAP item was NOT a duplicate (V3 has no mitigation; capturing the concern as a new item is correct), but Claude's framing was sloppy in two ways: (a) said "not explicitly designed to handle it" when it was acknowledged but not solved; (b) didn't surface that V2 had a deleted mechanism (Mode A→B) that addressed a related concern, which means a future session reading the new ROADMAP entry could rebuild Mode A→B without knowing the team had already evaluated and deleted it.

**Root cause:** Claude had READ the relevant content earlier in the same session (during the start-of-session document reading: `ROADMAP.md` line 162 was visible in the Read output; `PIVOT_DESIGN.md` was not fully read at that point but `KEYWORD_CLUSTERING_ACTIVE.md` referenced the historical context). The information was available in Claude's working memory. Claude failed to SYNTHESIZE it when writing the context-wall analysis — going from "V3 fixed the cost/wall-clock issues" to "therefore input scaling wasn't considered" without going back to verify against what the docs actually said.

This is exactly the failure mode `HANDOFF_PROTOCOL.md` Rule 3 ("code is source of truth"), Rule 1 ("verify before you write"), and Rule 14a ("read it back") exist to prevent. The rules were in place; Claude didn't apply them at the moment of writing the new ROADMAP item. Claude proposed a new ROADMAP entry without first searching existing docs for prior treatment of the same concern.

**How caught:** Director directly asked the disambiguation question ("didn't we have some adaptive feature... can you study all the keyword sorting tool documents deeply"), pushing Claude to actually verify before answering definitively.

**Correction:** Refined the proposed ROADMAP entry with corrected framing — explicitly references the V2 Mode A→B lineage, the V3 PIVOT_DESIGN acknowledgment of the trade-off, and the Pivot Session E deletion. Also added input-scaling retroactively to PIVOT_DESIGN.md §5 (Open questions / deferred items) — that section should have included it since 2026-04-25.

**Prevention:**

1. **NEW HANDOFF_PROTOCOL.md Rule 24 — Pre-capture search before adding any ROADMAP item or proposing new architectural concern.** Before reading back any proposed ROADMAP entry to the director, Claude MUST perform a structured search of existing docs (ROADMAP, PIVOT_DESIGN, KEYWORD_CLUSTERING_ACTIVE / relevant tool ACTIVE doc, PLATFORM_ARCHITECTURE, CORRECTIONS_LOG, tool-specific design docs) for prior treatment of the same concern. The search must include: direct keyword grep with synonyms; read-through of "Known limitations" / "Open questions / deferred items" / "Infrastructure TODOs" sections; CORRECTIONS_LOG entries from the last 5-10 sessions; verification against actual code when the concern relates to specific behavior. If prior treatment is found, surface it explicitly to the director BEFORE the read-back: *"I found this was already discussed in [doc] [section] on [date]. Compared to my current proposal: [diff]."* If not found, surface the search performed: *"I checked [list of locations] and found no prior treatment."*

2. **Corresponding entry added to `CLAUDE_CODE_STARTER.md` non-negotiable rules** so the search requirement is loaded at the start of every session.

3. **Pattern recognition:** this failure is in the same family as the 2026-04-26 "diagnostic-without-screenshot" mistake (Claude formed a hypothesis from indirect signals rather than direct verification) and the 2026-04-25 Pivot-Session-B Rule-13 zoom-out miss (Claude shipped Step 3's NOT NULL push before noticing two pre-existing production routes would now fail at runtime). All three share a common shape: Claude has the information needed to verify but doesn't actually do the verification step before acting. The new Rule 24 addresses ROADMAP-capture specifically; the broader principle (verify before you write/commit/propose) is already covered by Rules 1 + 3 + 14a but apparently needs operational scaffolding to actually fire at the moment of writing.

4. **Director-stated severity framing — "critical mistake."** This rating is recorded as the director's framing, not an attempt to grade severity Claude's way. The director's threshold for what counts as critical for instruction-set-update purposes is the binding standard.

---

### 2026-04-26 — Shipped a UI-fix attempt based on a guess about the cause without asking for a screenshot first (low-medium severity)
**Session:** session_2026-04-26_phase1-polish-bundle (Claude Code)
**Tool/Phase affected:** Keyword Clustering / CanvasPanel rendering / Phase-1 polish bundle
**Severity:** Low-Medium (no production damage, no data loss; one wasted commit + push + Vercel deploy + director hard-refresh round-trip; ~10 min lost; the second attempt succeeded after diagnosis-with-screenshot)

**What happened:** Director reported the `+x more` keyword-count indicator on canvas topic boxes was "cut off horizontally within the topics box by some kind of padding... I think it is because the next line shows the xkw ych in the lower right." Claude inspected the rendering code (`CanvasPanel.tsx` lines 889-915, `canvas-panel.css` `.cvs-kw-list` + `.cvs-kw-more` blocks) and the SVG/foreignObject geometry, then formed a hypothesis: "+x more" was getting word-broken (text content "+5 more" splitting into "+5 mo" on the visible row and "re" wrapping below into the clipped overflow region). Shipped CSS fix in commit `950e4b5`: added `white-space: nowrap; flex-shrink: 0; margin-right: 4px` to `.cvs-kw-more`. Pushed to main, Vercel redeployed, asked director to hard-refresh and verify. Director: "still broken." Then director uploaded a screenshot to `docs/cutoff.png` (since deleted) showing the actual failure mode: "+3 more" was rendered as one whole unit (not word-broken — meaning Claude's CSS fix did make the text stay whole), but the bottom half of the letterforms was sliced off by a horizontal cut line — vertical clipping from the kw-preview foreignObject's `KW_PREVIEW_H=36` overflow boundary. The "+x more" wraps to a third row that extends past the foreignObject's bottom edge; `.cvs-node-kw-preview` has `overflow: hidden`; bottom of letters gets clipped. Claude's first fix addressed the wrong failure mode entirely. Second fix (commit `c891c36`): removed the standalone `+x more` element; folded the hidden-count info into the expand button label (button now reads `▼ N (+M)` instead of `▼ N`). Director-confirmed fixed.

**Root cause:** Claude formed a hypothesis about the cause of a UI bug from the verbal description alone, without seeing the rendered output. The director's wording — "cut off horizontally" — was ambiguous between two distinct failure modes:
- **Mode A — "cut off in the horizontal direction"** = right side of text missing (Claude's read; would be addressed by `white-space: nowrap`).
- **Mode B — "cut along a horizontal line through the middle"** = top or bottom half of text missing (director's actual meaning; would NOT be addressed by `white-space: nowrap` because the text rendering itself is fine — the foreignObject overflow is the cause).
Claude picked Mode A and shipped without verifying. The fix made the text stay whole horizontally (which it would have done anyway) but did not address the vertical clipping.

**How caught:** Director's "still broken" reply followed by the uploaded screenshot, which immediately disambiguated which failure mode was real.

**Correction:** Second attempt (`c891c36`) addressed the actual cause structurally — by removing the third-row content entirely. The hidden-count info moved into the button label, which is on a row that always has space (the chip row, not the wrapped overflow row). No more clipping risk regardless of foreignObject height.

**Prevention:**

1. **When fixing a UI bug without ability to see the rendered output, ask for a screenshot OR for verbal disambiguation BEFORE coding the fix.** Specifically: if the user's bug description contains an ambiguous spatial term (cut off horizontally, looks weird, doesn't fit, overlaps), pose two or three concrete alternative interpretations back to the user and ask which one matches before picking a fix mechanism. Example: *"When you say 'cut off horizontally,' do you mean (a) the right side of the text is missing, like '+5 mo' instead of '+5 more,' OR (b) the bottom of the letters is sliced off along a horizontal line so the top half of the characters is visible but the bottom is gone?"* — that single question would have caught the misinterpretation in 30 seconds without a wasted commit.

2. **Generalizable rule for any visual bug Claude can't see:** the cost of asking for a screenshot or a verbal-disambiguation question is one round-trip (~30 sec). The cost of guessing wrong and shipping is one round-trip + commit + push + Vercel deploy + hard-refresh (~10 min). Always ask first.

3. **Pattern recognition:** this is the second instance in the project where Claude shipped a fix based on hypothesis-from-symptoms rather than direct observation. The earlier instance was the V2 Mode-A→B reactive switch design assumption (later corrected during 2026-04-20 follow-up). Both were addressed in retrospect; both could have been caught by ask-first-before-coding.

---

### 2026-04-25 — Five mid-session V3 wiring bugs surfaced by live testing (medium severity consolidated; all caught + fixed in-session via flag-then-fix-then-test cycles)
**Session:** session_2026-04-25_phase1g-test-followup-part3-pivot-session-D (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Pivot Session D / V3 wiring layer + production routes
**Severity:** Medium (live testing surfaced real production bugs in code we had just shipped; all 5 corrected in-session before any user-facing failure beyond the test runs themselves; ~$1.20 in API spend lost to test runs that hit each bug; structural keyword-preservation property of the V3 design held throughout)

**What happened:** Pivot Session D's main wiring commit (`ac4de31`) shipped a new `src/lib/auto-analyze-v3.ts` module + integrated it into `AutoAnalyze.tsx` with a V3/V2 toggle. Build passed; 71 unit tests passed. Director then ran live tests on Bursitis. Five distinct bugs surfaced in succession; each was caught from the Activity Log, diagnosed, fixed, re-tested, and the fix shipped. All 5 fit a single pattern: the new code was correct in isolation but exposed pre-existing latent issues OR drifted from contract assumptions made elsewhere.

The five bugs in order (with the fix commit hash):

1. **Applier rejected ADD_TOPIC root topics with `relationship: null`** (`c3d2a80`). Test 1 first batch failed atomically with `op #0 ADD_TOPIC: relationship must be "linear" or "nested"`. PIVOT_DESIGN.md §1.1 + AUTO_ANALYZE_PROMPT_V3.md said relationship is "ignored for root" but `applyAddTopic` validated unconditionally before checking parent. The applier already nulled the field for root topics at apply time; the upfront validation was just wrong. Fix: skip validation when `parent === null`; widened `AddTopicOp.relationship` type to `Relationship | null`; parser passes through whatever the model emitted. Three regression tests added.

2. **Prisma 6 P2025 "Record not found" on every `prisma.canvasNode.upsert`** (`6b70913`). Test 2 hit this on every batch's atomic rebuild. The route used `where: { id, projectWorkflowId }` — a loose shape Prisma 6 no longer accepts as a `WhereUniqueInput` because `(id, projectWorkflowId)` is not a registered unique key. CanvasNode's only registered uniques are `id @id` (global) and `@@unique([projectWorkflowId, stableId])` (per-project, added by Pivot Session B). Switched the upsert's where to `projectWorkflowId_stableId`. Backward-compatible — V2 callers don't send stableId; route falls back to `t-${n.id}` convention.

3. **Global-PK collision: `CanvasNode.id` is `Int @id` (one integer space across all projects) but app treats it as project-scoped via per-project `nextNodeId` counter** (`43f773f`). The previous fix surfaced the deeper issue: "Unique constraint failed on the fields: (`id`)". Test project's stored `nextNodeId=1` → V3 issued ids 1–8 → collision with Bursitis's id 1–104. The `/canvas` GET autoheal previously consulted only the per-project max id, unaware that other projects had taken those ids. Switched the autoheal aggregates from per-project to global so the returned counter is past every existing id in the DB. Latent bug remains in `/canvas/nodes` POST (reads `nextNodeId` from DB directly, bypassing GET autoheal); deferred to ROADMAP — proper fix is schema migration to composite PK or autoincrement.

4. **Synthesized-CanvasState defaults missing for projects with no `CanvasState` row** (`d485cf9`). The previous fix only kicked in when the row existed. Test project never had Auto-Analyze run on it before → no row → autoheal returned `canvasState: null` → client fell back to `nextNodeId=1` → re-collision. Synthesize a minimal CanvasState with global-max-aware counters when the row doesn't exist (in-memory only; no DB write added).

5. **BATCH_REVIEW screen always showed "Topics: None" for V3** (`d624556`). Cosmetic but real — when reviewMode is on, the user can't make an informed apply/skip decision without seeing what's about to land. `processBatchV3` returned `newTopics: []` regardless. Populate from parsed ADD_TOPIC operations after validation succeeds.

**Root cause (general):** New code shipping into a complex system surfaces pre-existing latent issues. The unit tests for `auto-analyze-v3.ts` covered the wiring layer in isolation (TSV serialization, JSONL parsing, applier-state translation, materializer integer-id assignment) and 71 tests passed before the first commit. But three classes of real-world failure were invisible to the unit suite:

- **Contract drift between layers** (bug #1) — the applier and the V3 prompt both came from PIVOT_DESIGN.md but were written in different sessions; the relationship-validation discrepancy was not caught because the applier's tests always supplied a non-null relationship and the prompt says one thing while the applier expected another.
- **Prisma 6 behavior change** (bug #2) — pre-existing route code worked under earlier Prisma versions but P2025s under 6's stricter WhereUniqueInput handling. This was invisible until the rebuild route was actually called by V3 against a real project (the V2 path on Bursitis happened to not trigger this code path frequently because most V2 batches updated existing-by-title nodes whose ids already existed, so the upsert behaved like a pure update).
- **Pre-existing schema design issue** (bugs #3 + #4) — `CanvasNode.id` being `Int @id` (global) was a long-standing bug that didn't bite until a project with no canvas history tried to issue new ids that collided with another project's range. V2 worked on Bursitis because Bursitis itself owns the highest existing id range, so its `nextNodeId` is always past every other project's ids by accident.

**How caught:** All 5 caught from the Activity Log during live director testing on Bursitis. The diagnostic enrichment commit (`1c44238`) — adding the underlying Prisma error message to the rebuild route's 500 response as a `detail` field — was critical for catching #2/#3/#4 since the director can't read Vercel server logs.

**Correction:** Five sequential commits over the session, each fixing one bug + adding regression tests where applicable; combined with the diagnostic enrichment commit, total 6 fix commits + the main wiring commit = 7 commits pushed in-session. Build clean throughout. Tests grew from 71 to 74 (3 regression tests added for bug #1).

**Prevention:**

1. **Audit cross-layer contracts before shipping new wiring**, not just within a single layer's unit tests. When two layers share a contract (the applier's vocabulary + the V3 prompt's vocabulary, both from PIVOT_DESIGN.md), build at least one E2E test that goes prompt → parse → apply, exercising every operation type with realistic AI-emitted shapes (including the edge case where the model emits a field as null because the prompt says it's "ignored").

2. **For new code that calls into pre-existing routes that haven't been exercised by the new code path before**, add a diagnostic enrichment to those routes BEFORE shipping, not after the first failure. The diagnostic enrichment commit (`1c44238`) saved hours of guessing on bugs #3 + #4. Generalizing: any new caller of an existing route that does work in production should bring an "if 500, return the underlying error in `detail`" patch with it as a one-line safety net.

3. **For pre-existing latent design issues like global-PK collisions**, surfacing them via a band-aid (the global autoheal) is appropriate to unblock the immediate session, but the proper fix (schema migration) must be captured as a TODO with an explicit destination. Captured in ROADMAP Infrastructure TODOs as part of this session's Rule-14e sweep.

**Architectural pattern named (procedural, generalizable):** "new code surfaces old bugs — diagnostic enrichment is cheap insurance." Whenever new code wires into pre-existing routes that the new code path will exercise differently, ship the diagnostic enrichment alongside the new code, not after the first failure. The cost of a 500-response detail field is one extra commit and zero runtime impact; the benefit is converting hours of remote-debugging guessing into minutes of "here's the actual error."

**Rule compliance during the surfacing:**
- Rule 7 (acknowledge slips openly, don't minimize) — all 5 framed as "real bugs we shipped, here's what's wrong, here's the fix" rather than minimized as edge cases.
- Rule 8 (destructive op gate) — N/A; no DB schema changes were involved in the fixes (the global autoheal is a read-only behaviour change).
- Rule 9 (deploy gate) — observed for every push (7 explicit Rule-9 approvals in-session).
- Rule 14a/14b (plain language + per-option context + recommendation) on every option presented.
- Rule 14e (deferred items captured) — 3 cosmetic/architectural follow-up items captured in ROADMAP Infrastructure TODOs (label drift, global-PK design, cancel-state cleanup).
- Rule 16 (context degradation) — Claude proactively flagged at ~2.5 hours into session and recommended end-of-session over more batches; director picked end-of-session.

### 2026-04-25 — Shipped a NOT NULL DB constraint to production before checking existing callers (medium severity, Rule-16 zoom-out miss; corrected mid-session via in-session patch)
**Session:** session_2026-04-25_phase1g-test-followup-part3-pivot-session-B (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Pivot Session B / live database schema
**Severity:** Medium (live production exposure introduced and held for under 5 minutes; corrected in the same session before any user-facing failure)

**What happened:** Pivot Session B's 3-step migration plan called for Step 3 to tighten `stableId` from nullable to NOT NULL + add a unique index. Claude proposed the Step 3 push to the director with a Rule-8 STOP gate as designed. Director approved. After the push succeeded, Claude ran `npx tsc --noEmit` and discovered that two pre-existing production routes (`src/app/api/projects/[projectId]/canvas/nodes/route.ts` POST + `src/app/api/projects/[projectId]/canvas/rebuild/route.ts` upsert's create branch) call `prisma.canvasNode.create({ data: {...} })` without supplying `stableId`. With the NOT NULL constraint live, the next manual canvas-node creation OR the next Auto-Analyze run would fail at runtime with `null value in column "stableId" violates not-null constraint`. Production exposure was real even though no user-facing failure was triggered (no one happened to be using the site between the push and the patch).

**Root cause:** Claude treated Step 3's "tighten the constraint" plan as a self-contained step whose risk model was "is the data clean enough to add the constraint?" The pre-flight verification (104 rows / 0 nulls / 0 duplicates) answered that question correctly, and Step 3 shipped. But the migration plan's blast radius wasn't just the *current* data — it was *every future write*. Existing production callers that didn't supply `stableId` would hit the constraint, and Pivot Session D's design assumed those callers would be updated alongside the wiring. Claude failed to ask, before Step 3, *"who else writes to this column today and will they all keep working with this constraint?"* That's a Rule-16 zoom-out question — not a Rule-8 destructive-op question.

**How caught:** Claude itself, immediately after the Step 3 push, when running `npx tsc --noEmit` to verify the new operation-applier file. TypeScript flagged the missing-stableId errors on the two existing production routes. Claude surfaced the issue to the director within the same response that ran the type-check, including: (a) the explicit acknowledgment that "this is on me — I shipped the Step 3 NOT NULL constraint before the production code was wired," (b) the concrete two-route patch proposal (Option A — add `stableId: \`t-${id}\`` to each create call, ~3 lines per file), (c) the alternative rollback option (Option B — restore the constraint to nullable until Pivot Session D wires properly), (d) plain-language framing of the runtime exposure ("the live site is currently fine — but the next time anyone creates a node OR Auto-Analyze runs, the database will reject it"). Director picked Option A; patch shipped in the same session before the end-of-session push approval gate; production safety restored.

**Correction:** Two route patches landed in the same commit:
- `src/app/api/projects/[projectId]/canvas/nodes/route.ts` line 60 area: added `stableId: \`t-${nodeId}\`` adjacent to the existing `id: nodeId` field.
- `src/app/api/projects/[projectId]/canvas/rebuild/route.ts` line 113 area: added `stableId: \`t-${n.id}\`` adjacent to the existing `id: n.id` field.

Both patches use the exact same convention as the backfill script — `stableId = "t-" + id` — so all rows (existing + future) follow one rule. `npm run build` clean post-patch (17/17 pages, zero TypeScript errors).

**Prevention:** When proposing any DB constraint change that *narrows* what's accepted (NOT NULL, unique, foreign key, check), run the explicit Rule-16 zoom-out before the push gate: *"Who else writes to this column today and will they all keep working under the narrower constraint? List the call sites; verify each one supplies a value compatible with the constraint."* If any caller doesn't, the choice is (a) patch the callers in the same session before tightening, OR (b) defer tightening until those callers are wired by their respective sessions, OR (c) explicitly accept the in-session-patch path as a planned scope-expansion. The mistake to avoid is shipping the constraint *first* and discovering caller breakage *after*.

This is a generalization of the existing Rule 8 (STOP before destructive ops) — adding one row to its mental checklist: **"a constraint-narrowing migration is destructive in the future tense — it doesn't lose existing data but it can break future writes from any pre-existing caller. Audit the writers before pushing."**

**Architectural pattern named (procedural, generalizable):** "schema constraints have callers, not just data — audit both before tightening." Applies to any future DB migration that narrows what writes are accepted. The current data passing pre-flight verification is *necessary* but not *sufficient* for safety; existing call sites must also be checked.

**Rule compliance during the surfacing:**
- Rule 7 (acknowledge slips openly, don't minimize) — Claude's text opened with *"I need to flag a Rule 13/16 zoom-out concern"* and *"This is on me. I shipped the Step 3 NOT NULL constraint before the production code was wired to supply stableId. I considered this an in-scope risk but didn't proactively flag it before the push. That's a Rule 16 zoom-out miss."* No deflection.
- Rule 8 (destructive-op confirmation) — observed for both Step-1 and Step-3 pushes via explicit "what this command will do / reversibility / your options" framing.
- Rule 14a + 14b (plain language + per-option context + recommendation) — the issue framing distinguished "currently fine" from "next time anyone creates a node would fail," and presented two options (A patch / B rollback) with reasoning and reversibility for each, plus the escape-hatch option.
- Rule 16 (zoom in / zoom out) — the *miss* is the whole entry; the *correction path* honored the rule by proactively flagging before the next destructive step (would have been the end-of-session push).

### 2026-04-25 — Jumped into pivot vocabulary mechanics without anchoring to root-cause failures (low severity, communication slip)
**Session:** session_2026-04-25_phase1g-test-followup-part3-pivot-session-A (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Pivot Session A
**Severity:** Low (process / communication; corrected mid-session; no production impact)

**What happened:** Pivot Session A's purpose is to lock the design that fixes four named root-cause failures (keywords drop during batch application; keywords correctly placed in earlier batches get silently removed; cost per batch has skyrocketed; time per batch has gone up significantly). When Claude presented Q1-Q4 design choices for the operation vocabulary (vocabulary completeness; atomic batch apply; ARCHIVE_KEYWORD vs Irrelevant Keywords floating topic; JUSTIFY_RESTRUCTURE timing), Claude framed each as a mechanics-with-recommendation question — explained the trade-offs and gave a recommendation — but did NOT anchor each choice back to which specific failure mode it prevents. Director correctly pushed back: *"Also, you didn't even address the reasons for the pivot... The goal now is to address the fundamental flaws in our approach and fix them."*

**Root cause:** Treated the design questions as discrete mechanics decisions rather than as the answers-to-the-failure-modes that the entire pivot exists to deliver. The result was that the director's product judgment was invited at the level of "do you prefer this or that" rather than at the level of "does this design choice actually fix the failure mode it claims to address." Lower-resolution decision input.

**How caught:** Director, mid-session, after seeing Q1-Q4 framing land without failure-mode anchoring.

**Correction:** Claude redid the analysis with explicit failure-mode mapping: Q1 vocabulary completeness → keyword drop class + silent overwrite class; Q2 atomic apply → ghost-state-from-half-applied-batches class; Q3 ARCHIVE_KEYWORD → homograph-keyword-drop class (Turkish-Bursa); Q4 JUSTIFY_RESTRUCTURE → silent-overwrite-of-correctly-placed-work class. Cost/time impact made concrete: $1.89 / 26 minutes for the Bursitis verification batch → expected $0.03–0.10 / under 1 minute under the operations-only output contract; cost stops scaling with canvas size. Director then accepted Q1-Q4 (with Q4 sharper than Claude's recommendation — Q4 carries from day one, not deferred). Subsequent question clusters (Q5-Q11 on stable-ID format and DB migration) were less load-bearing on root-cause framing, so the same correction was carried forward implicitly without re-stating.

**Prevention:** When locking architectural decisions, lead with the failure-mode-to-design-mechanism mapping, not bury it after-the-fact. For every design choice in an architectural-pivot session, the question to the director should be shaped as *"Failure F is one of the things this pivot exists to fix. Design choice X addresses F by mechanism M. Does mechanism M look right to you?"* — not as *"here's a design choice; here are options A/B/C; my recommendation is A; what do you pick?"* The latter framing is correct for low-stakes implementation choices where mechanics genuinely is the question; the former is correct for architectural-decision sessions where the WHY of every design choice is load-bearing.

**Architectural pattern named (procedural, generalisable):** "Lead with the failure-mode-to-mechanism mapping in architectural-decision sessions." Distinguish architectural-decision sessions (where every choice should map to the named failure modes) from implementation-decision sessions (where mechanics framing is fine). The marker for an architectural-decision session is a high-severity insight in `CORRECTIONS_LOG.md` that motivates the session, plus an explicit list of failure modes the work is supposed to address. When those exist, framing matters more than usual.

**Rule compliance during the surfacing:**
- Rule 7 (acknowledge slips openly, don't minimize) — Claude opened the next response with *"You're right — that was a slip and I'll own it."* and then re-did the analysis. No deflection.
- Rule 16 (zoom in / zoom out on every significant decision) — director's pushback was the zoom-out signal. Going forward: in architectural-decision sessions, the failure-mode-to-mechanism mapping IS the zoom-out — it's not optional decoration.

### 2026-04-25 — Architectural insight (high severity): AI being used as state-rebuilder when it should be state-mutator; recent fixes are band-aids not root-cause work; recommended pivot supersedes Sessions 4-6
**Session:** session_2026-04-25_phase1g-test-followup-part3-session3b-verify (Claude Code) — surfaced post-verification during wrap-up
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze — full Phase 1g-test follow-up trajectory
**Severity:** High (architectural; affects roadmap planning across multiple sessions)

**What happened:** During end-of-session wrap-up, after completing the Session 3b verification with its $1.890-per-batch cost data point and 26-minute wall-clock for a 4-keyword batch, the director pushed back on the trajectory: *"Something doesn't make sense. Why did the cost and time sky rocket like this compared to how the system was setup previously. We have been progressively fixing things and they are getting worse. I want you to think about what is fundamentally wrong here. Why are keywords being removed from topics that they belong in? Why are responses using so many tokens and increasing cost? Why is it taking so long to process a small batch?"* This forced an honest re-examination of the architecture that prior sessions had been progressively patching without naming the root cause.

**Root cause (single architectural mismatch — surfaced this session, not introduced this session):** The Auto-Analyze prompts ask the AI to **rebuild and re-emit the entire topics layout table** on every batch, not to issue change operations against an existing table. Specifically: the Initial Prompt instructs the AI to *"provide the complete updated Integrated Topics Layout Table as your final output for this batch"* with all existing rows preserved plus any new rows. The Primer Prompt's RULES AND CONSTRAINTS rule 3 reinforces this: *"Never delete existing topics or keywords — only add new ones or add keywords to existing topics."* The AI is being used as a **state-rebuilder** (input: full state; output: complete new state) rather than a **state-mutator** (input: full state; output: list of operations to apply to the state).

**The mismatch is the root cause of all three observed symptoms:**

1. **Keywords get removed from topics they belong in.** The AI isn't actively "removing" keywords. It's failing to *re-emit* them as it rewrites the table from scratch. When asked to type out a 100+-row TSV with rich descriptions while also analyzing 4 new keywords AND running the reevaluation pass, attention dilutes. Pre-existing rows get omitted; keyword strings get slightly altered (whitespace, case, smart quotes) and fail post-hoc text matching; topics get renamed in ways the diff detector reads as "new topic + missing old topic." The 74 Reshuffled keywords on the Session 3b verification batch are exactly this failure mode. Bursitis P3-F7's 58/74 split is the observable shadow of this single root cause.

2. **Output tokens (and therefore cost) scale with the canvas size, not with the batch size.** Verification batch numbers: 110,245 output tokens for 4 new keywords = ~27,500 output tokens per new keyword. The bulk of those tokens is redundant re-emission of the existing 95-node table (rich descriptions + alternate titles + keyword lists + topic descriptions). The 4 actually-new keywords contribute only ~3-5k tokens of genuinely new content; the other ~105k tokens are restated context that the AI has been re-typing every batch since the canvas was small. **Cost-per-batch grows linearly with canvas size, not with batch size.** A 4-keyword batch on a fresh canvas would cost cents. A 4-keyword batch on a 95-node canvas costs $1.89. A 4-keyword batch on a 200-node canvas would cost ~$4. A batch on a 500-node canvas eventually hits the model's max output token limit and the run breaks entirely.

3. **Wall-clock time is bottlenecked by output token generation rate.** Sonnet 4.6 generates output at ~50-80 tokens/sec. 110,245 tokens / 60 tokens/sec ≈ 30 minutes (verified: 26 min for the verification batch). The API isn't slow; we're asking for a huge output. If the output were 1,000 tokens (operations only), the same batch would finish in 20-30 seconds. Same model, same input.

**Why this wasn't visible earlier in the project's life:** Smaller canvases (early Bursitis batches, the original HTML-tool runs) had small re-emitted tables, so the per-batch cost/time was tolerable and the keyword-loss rate was low enough that ghosts weren't conspicuous. The architecture has had this scaling property since the beginning — it's now visible because (a) the canvas has grown over 51+ batches across multiple sessions to 95+ nodes; (b) Session 3a's cost-tracker fix made cost numbers honest by including failed-attempt costs; (c) Session 3b's reconciliation pass made keyword loss visible by surfacing ghosts as "Reshuffled" status instead of leaving them silently broken. **The fixes weren't regressions — they were x-rays. The scaling problem was there all along.**

**Why recent fixes are band-aids on this root cause, not solutions:**

- **Reconciliation pass + Reshuffled status (Session 3b)** — exists because the AI's full-table-rewrite output contract permits keyword loss. The pass surfaces losses for review; it does not prevent them.
- **Salvage-ignored-keywords mechanism (Session 3b)** — exists because validation can detect missing batch keywords post-response and we want to retry without redoing the whole batch. It's a recovery path; the underlying loss is the architecture's fault.
- **Mode A → Mode B reactive switch (Phase 1g-test follow-up)** — exists because Mode A's full-table re-emission becomes unstable at scale. It's a fallback to a less-comprehensive mode that introduces its own quality regressions.
- **HC4 / HC5 / proposed HC6 validation checks** — exist to detect output corruption. They detect; they don't prevent.
- **Stable topic IDs (Session 5 as currently planned)** — exists because rename detection in a full-table-rewrite is a string-matching mess. Operation-based output makes RENAME explicit; the string-matching layer becomes unnecessary.
- **Changes Ledger (Session 4 as currently planned)** — exists because it's hard to audit what the AI changed when the output is a full table rewrite. Operation-based output IS a Changes Ledger; the AI's response is the audit log.

Each band-aid adds maintenance burden and code complexity without addressing the root cause. The complexity stack is itself a signal of architectural mismatch.

**Recommended architectural pivot — the actual fix:** Change the AI's output contract from "complete updated TSV table" to "list of operations against the existing table." Operation vocabulary (initial draft, expandable):

- `ADD_TOPIC id=<new-stable-id> title=... parent=<id> relationship=linear|nested depth=<N> description=...`
- `RENAME_TOPIC id=<id> from=<old-title> to=<new-title>`
- `MOVE_TOPIC id=<id> new_parent=<id> new_relationship=...`
- `MERGE_TOPICS source_id=<id> target_id=<id> reconciled_description=...`
- `SPLIT_TOPIC source_id=<id> into=[<new-id-1>, <new-id-2>] keyword_assignments={...}`
- `DELETE_TOPIC id=<id> reason=... reassign_keywords_to=<id>`
- `ADD_KEYWORD topic=<id> keyword=<exact-text> placement=primary|secondary`
- `MOVE_KEYWORD keyword=<exact-text> from=<id> to=<id> placement=primary|secondary`
- `REMOVE_KEYWORD keyword=<exact-text> from=<id>` *(only valid if keyword has another placement; otherwise must use DELETE_TOPIC reassign_keywords_to)*
- `ADD_SISTER_LINK topic_a=<id> topic_b=<id>` / `REMOVE_SISTER_LINK ...`

The tool — deterministic code, not the AI — applies these operations to the existing canvas. Validation runs on the **applied result**, not on the AI's output (since the output is just a list of intentions).

**Direct consequences of the pivot:**

- Output drops from 100,000+ tokens to under 1,000 for a small batch. Cost drops 99%+. Wall-clock drops to well under a minute. (The big input — the existing canvas as context — stays similar; prompt caching can amortize that further.)
- Keywords cannot silently disappear. The AI literally cannot drop a keyword without explicit `MOVE_KEYWORD`, `DELETE_TOPIC`, or `REMOVE_KEYWORD` operations. Anything not mentioned in the operation list stays exactly where it was.
- Reconciliation pass / Reshuffled status / salvage mechanism become vestigial. They keep working but their failure-mode-coverage drops near zero in normal operation. Long-term they can be deprecated.
- Stable topic IDs become a hard prerequisite (operations need to refer to topics by stable identifier, not title-string match). Session 5's stable-ID work is promoted into the pivot, not deferred behind it.
- Changes Ledger (Session 4) becomes ~80% subsumed — the operation list IS a Changes Ledger entry. Session 4 narrows to "Changes Ledger UI: filter, sort, admin actions on operations the AI already structured for us."
- Validation rewrites: instead of "diff the AI's emitted table against the existing one," it becomes "validate the operation set is internally consistent (no orphan moves, no duplicate adds, all referenced IDs exist) and the post-application state passes invariants (no unlinked keywords, all topics have valid parents, etc.)."
- Reevaluation pass becomes the AI's prerogative to issue MERGE / SPLIT / RENAME / MOVE_TOPIC operations — same architectural primitives as additions, just for restructuring.
- Mode A / Mode B distinction simplifies — the input still differs but the output contract is now uniformly "operations only." Mode B's delta-format becomes Mode A's format.
- The Initial Prompt and Primer Prompt both need substantial rewrites. The reevaluation triggers and topic-naming guidance survive; the table-emission instructions and the never-delete rule get replaced with operation-emission instructions and explicit deletion-via-DELETE_TOPIC rules.

**Estimated cost of the pivot:** Multi-session work — design (~1 session) + stable-ID migration (~1 session) + applier code + prompt rewrite + validation rewrite + Changes Ledger UI rescope. Net duration probably 4-6 sessions across 2-3 weeks of effort, vs. Sessions 4-6 + Phase-1 polish items as currently scoped which would be ~6-9 sessions of patching.

**Decision direction:** Director chose Option 2 — capture the insight AND restructure the ROADMAP — at end of Session 3b verification. ROADMAP gets a new top-priority "Architectural pivot" section; Sessions 4-6 get re-scoped with notes that they're contingent on the pivot. Decision on whether to actually start the pivot vs. continue with the existing roadmap is reserved for next session — the director may want to think on it overnight.

**How caught:** Director, at end of session, comparing Session 3b verification's cost/time numbers against memory of how the system performed earlier and observing that progressive "fixes" hadn't yielded better results. Direct quote: *"We have been progressively fixing things and they are getting worse."* This is exactly the kind of zoom-out check that Rule 16 demands.

**What was previously surfaced but not connected to this root cause:**

- Session 1 (Phase 1g-test follow-up Part 3, 2026-04-20) noted "Mode B can modify topics Mode A created, masking Mode A's quality" (P3-F1) and "Mode A quietly reshuffling topics under the hood" (P3-F2). Both are downstream symptoms of the AI re-emitting the full table.
- Session 2 (2026-04-24) diagnosed P3-F7 as TWO-WAY sync drift between `Keyword.sortingStatus` and `CanvasNode.linkedKwIds`. The drift is real, but the deeper question — "why is the AI dropping prior placements at all?" — wasn't traced back to the architecture.
- Session 3b end-of-session captured a new ROADMAP item "P3-F7 root-cause audit" listing four sub-items (HC5 audit, canvas-rebuild text-match audit, HC6 no-keyword-unlinks check, Bursitis 49-ghost spot-audit). Each of those sub-items would be partial mitigation; none of them address the architectural mismatch. With the pivot, three of the four become unnecessary (the spot-audit retains historical value as forensic data on what the legacy ghost set contained).

**Architectural pattern named:** "AI as state-mutator (operations) vs. AI as state-rebuilder (full re-emission)." Generalizable. Any LLM-driven workflow where the LLM is asked to maintain state across iterations should default to operation-based output. Re-emission scales O(state) not O(change); operations scale O(change). The latter is correct for long-lived state. This pattern applies to any future PLOS workflow where AI maintains a structured artifact across batches (Workflow 2 Competition Scraping likely; Workflow 3 Therapeutic Strategy probably; many others).

**Correction:** ROADMAP restructured with new top-priority "Architectural pivot" section ahead of Sessions 4-6. Sessions 4-6 re-scoped with contingency notes. KEYWORD_CLUSTERING_ACTIVE.md POST-VERIFICATION block extended with the architectural-insight subsection. Decision to actually execute the pivot is reserved for next session.

**Prevention:** Going forward, when adding any new mitigation/safety-net/recovery code to a tool, run a Rule-16 zoom-out check explicitly: *"Is this code making symptoms visible OR preventing the failure mode? If only making visible, what is the architectural change that would prevent the failure mode? Have we considered the architectural change?"* If the answer to the third question is "no" or "we keep deferring it," that's a flag to surface it to the director rather than ship the next band-aid. The reflex *"let me just add one more safety net"* is a warning sign about accumulated architectural debt.

**Rule compliance during the surfacing:**
- Rule 7 (acknowledge slips openly) — Claude acknowledged that recent docs hadn't named this root cause despite the symptoms being clear.
- Rule 14 (expert-consultant persona, plain-language recommendations with reasoning + reversibility) — analysis was framed in plain language, with concrete operation vocabulary, with the trade-offs (multi-session pivot vs. continued patching).
- Rule 16 (zoom in / zoom out on every significant decision) — director's pushback was the zoom-out signal that triggered the entire re-examination. Going forward: treat the director's "this doesn't make sense, what's fundamentally wrong" as the highest-priority zoom-out trigger to honor immediately, not after the band-aid ships.
- Rule 13 (proactive context-degradation warning) — wrap-up was already in progress when the question landed; Claude proposed two options (just capture vs. capture + restructure) rather than unilaterally pushing into restructure work at end-of-session. Director chose restructure; Claude is honoring lucidity by writing carefully but not over-engineering.

### 2026-04-25 — Session 3b verification: code deployed + reconciliation pass reproduced exact P3-F7 ghost set on first live batch (informational, MAJOR finding) + planning miss on visual-verification-on-populated-canvas (low severity)
**Session:** session_2026-04-25_phase1g-test-followup-part3-session3b-verify (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Phase 1g-test follow-up Part 3 verification
**Severity:** Informational (verification finding) + Low (planning miss)

**What happened — verification finding:** Director approved Rule-9 deploy gate; pushed three commits (`8afcb9f` Session-3a doc updates + `6c09e50` Session-3b code + `aa7eb4b` Session-3b doc updates) to origin/main; Vercel redeployed; vklf.com confirmed live. Tier-1 verification (5 quick UI checks) all passed: Opus 4.7 in dropdown, "Unsorted + Reshuffled" scope label, settings persistence across panel close/reopen and hard refresh, Removed Terms "Source" column, manual remove → soft-archive with "Manual" badge. Tier-2 engine verification: ran one Sonnet 4.6 classic-mode batch on Bursitis (95 existing nodes, batch size 4, ~67k input tokens, ~110k output tokens, 26 minutes wall-clock, $1.890 cost). On apply, the activity log confirmed: `Layout pass complete (104 nodes positioned)`, `Canvas rebuilt atomically (104 nodes, 0 removed)`, then 74 individual `↻ Reconcile: "<keyword>" was AI-Sorted, no longer on canvas → Reshuffled` lines, then `↻ Reconciliation: 58 on-canvas → AI-Sorted, 74 off-canvas → Reshuffled`. **The 58/74 split is identical to Session 2's direct-DB-query diagnosis** of Bursitis P3-F7 (58 silent placements + 74 ghost AI-Sorted). The reconciliation pass surfaced the entire pre-existing ghost set on its very first run.

**Why this finding matters:**
- Validates Session 3b code is working correctly (not a coincidence — exact-match numbers).
- Validates the Session 2 architectural diagnosis was correct (those ghosts genuinely existed in the DB before Session 3b shipped).
- Provides forensic data for the Session 3b–captured "P3-F7 root-cause audit" ROADMAP item: the 74 keyword texts + UUIDs in the activity log are the exact set the audit will work through. Many are foundational ("hip bursitis", "bursitis pain", "what is hip bursitis", "trochanteric bursitis", "is bursitis curable", "hip pain bursitis", "tendonitis vs bursitis", etc.) — confirming P3-F1/P3-F2 fingerprint that classic mode silently reshuffles significant prior work.

**What happened — planning miss (low severity):** Recommended classic-mode batch on Bursitis's 95-node canvas as the primary engine-verification path WITHOUT preemptively flagging that visual verification of canvas-layout output would be ambiguous on a heavily-populated canvas. Director caught it post-cancel: *"The canvas already had a lot of information before and I can't tell if anything is broken. Maybe we should have or should do a test on a blank canvas next time."*

**Root cause of planning miss:** Optimized for "test the engine on real data" without zooming out to ask "what would the test result look like, and how would I tell pass-from-fail visually?" Pass-fail criteria for the canvas-layout engine include "nodes don't overlap," "descriptions fit inside boxes," "child nodes type-aware-positioned" — all of which require a clean baseline to measure against. A populated 95-node canvas already has visual artifacts from prior runs that would mask any new engine output, good or bad.

**Correction:** Captured the missed verification as a new Phase-1 polish ROADMAP item: **"Blank-canvas visual verification of canvas-layout engine"** — create a small test Project, paste 8-12 keywords in, run one Direct-mode batch, look at the result with eyes. Schedules with Session 4 or as standalone. Not blocking.

**How caught:** Director, post-cancel, after seeing the canvas wasn't visually distinguishable from the pre-batch state.

**Prevention:** Going forward, before recommending any visual verification of a layout/rendering change, mentally pre-execute the test and ask: "Could I distinguish a working engine from a broken engine in the result I'd see?" If no, choose a setup (blank canvas, known small case) where pass-fail would be visible. Zoom-out check (Rule 16) extended: not only "does this work for the immediate task" but also "would the verification result actually demonstrate the property I'm checking?"

**Architectural pattern named (informational, generalizable):** "verification-baseline matters as much as verification-target." A deployed feature can be verified two ways: (a) by observing it produces the expected diff from a known baseline (clean canvas → run batch → see what new state engine produces), OR (b) by observing structured logs/metrics that prove the feature *fired* (activity log shows `Layout pass complete` + `Canvas rebuilt atomically`). Path (a) is stronger for visual/UX features; path (b) is stronger for invariant-checking features (like the reconciliation pass, where the structured aaLog output IS the verification — it's machine-checkable and the 58/74 numbers can be cross-referenced against DB ground truth). When recommending a verification path, pick consciously based on what evidence would be diagnostic for the specific feature.

**Cost data point (informational):** Sonnet 4.6 classic mode on Bursitis-sized projects (95 nodes, batch size 4) is **$1.89 per batch** with attempt-1 success. At the original 523-batch run scope, projected total was ~$985 (or ~$1,100-1,250 with typical retry rates). Reinforces Mode A→B safety net design rationale + stable topic IDs / Changes Ledger / stability scoring as cost-amortization mechanisms.

**Rule compliance:**
- Rule 9 deploy gate honored — described what would go live in plain English with reversibility notes; got explicit "Yes - Push" before running `git push`.
- Rule 10 visual verification handed to director — Claude described what to check; director reported pass/fail at each step.
- Rule 13 pause-and-resume warning surfaced when wrap-up approached; director confirmed wrap-up.
- Rule 14e deferred items captured — blank-canvas visual verification, salvage live verification, 74-Reshuffled forensic audit, test-keyword restore housekeeping, handoff-write-to-doc improvement.
- Rule 14f question framing — push approval used the standard yes/no/clarify/free-text pattern.

### 2026-04-25 — Session 3b code shipped (3 of 3 deferred Session 3 items; informational; reconciliation-as-visible-alarm framing locked in by director; two new Phase-1 polish items added to ROADMAP)
**Session:** session_2026-04-25_phase1g-test-followup-part3-session3b (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / ASTTable / CanvasPanel / Phase 1g-test follow-up Part 3 — Session 3b
**Severity:** Informational (clean code session, zero mistakes; logging design decisions + new architectural pattern + ROADMAP additions for future reference)

**What happened:** Session 3b shipped the three items deferred from Session 3a — P3-F7 post-batch reconciliation pass (#1), salvage-ignored-keywords mechanism (#2), and the four-function P3-F8 canvas-layout port (#4). Single commit `6c09e50`. Build clean (22.5s, 17/17 pages, zero TypeScript errors). NOT YET PUSHED — awaiting director approval per Rule 9 deploy gate.

**Director-locked design decisions during drift-check (per Rule 14b/14f question framing — every multi-option question included per-option context + recommendation + escape-hatch + free-text invitation):**

1. **Reconciliation off-canvas-AI-Sorted flip target = `'Reshuffled'` (Option B), NOT `'Unsorted'` (Option A).** Director's framing: any reconciliation flip means EITHER (a) HC5 leaked, (b) the rebuild silently dropped a keyword, or (c) legacy data — all three deserve admin visibility, not silent healing. Option B introduces a yellow `.ast-pill-r` badge in the AST table so admin can spot the alarm at a glance. AutoAnalyze's default scope picks them up automatically so no admin action is required for re-placement.
2. **Salvage trigger = HC3-only validation failure (Option A), NOT post-doApply unplaced > 0 (Option B).** The reconciliation pass already heals post-doApply text-mismatch leftovers by flipping their status to Reshuffled (picked up next run, zero extra API cost). Adding salvage at Moment 2 would risk paying for retries that fail the same way (text mismatch keeps failing the same way regardless of how many times the AI is asked).

**Director-raised root-cause concern (NEW Phase-1 polish ROADMAP item):** During drift-check, director correctly raised the meta-question: *"Why would AI bump a keyword off the canvas when that is strictly forbidden by our prompts? ... If it is our tool triggering this, then shouldn't we be preventing this from happening rather than trying to figure out what the status of the bumped keyword should be?"* Honest answer: yes — the reconciliation pass is the BACKUP per Session-2 framing; the root-cause work is separate. Captured as new ROADMAP item "P3-F7 root-cause audit" with four sub-items (HC5 text-matching audit; canvas-rebuild text-match audit; new HC6 "no keyword unlinks" check; one-time spot-audit of Bursitis's 49 ghosts to determine legacy-vs-active-bug breakdown). Schedules with Session 4 or 5.

**Director-raised NEW feature (NEW Phase-1 polish ROADMAP item):** Defense-in-depth "Keyword accounting + ghost detection panel." System maintains a permanent record of every keyword ever added to a project's AST; reconciliation check compares against (AST ∪ RemovedTerms); anything in history not in either is a "ghost" surfaced in a new admin Ghost Keywords panel with Restore + Archive bulk actions. Captured to ROADMAP. Schedules with Session 4 or as its own session.

**One architectural pattern named (fourth in this Part-3 series):**

5. **"Reconciliation-as-visible-alarm vs reconciliation-as-silent-heal."** When a reconciliation pass detects state drift, the choice is between (a) silently healing the drift (cheap; preserves UI ergonomics; hides the existence of the bug from the admin) and (b) surfacing the drift via a distinct user-visible status/badge (slightly more code; admin can monitor whether drift is rare-and-shrinking or persistent-and-hiding-a-bug). Option (b) is the right default whenever the underlying drift is a symptom of an unsolved root-cause bug — the alarm IS the diagnostic signal. If after a few sessions the alarm-badge is consistently empty, downgrading to silent-heal becomes a cheap follow-up. If the alarm badge keeps filling up, that's evidence to schedule the root-cause work. Recorded for future tools that build similar reconciliation passes.

**How caught:** Planned Session-3b scope. No mistake.

**Prevention:** Not applicable.

**Lessons captured for future sessions:**
1. The reconciliation-as-visible-alarm pattern (above) generalizes — any tool building a state-reconciliation pass should default to surfacing detected drift in the UI, not silently healing it.
2. Drift-check is the right moment to surface root-cause concerns. Director's "why does this happen at all" question during drift-check produced two new high-value ROADMAP items that wouldn't have been captured otherwise. Future Claudes: when the user pushes back on a "patch the symptom" framing, treat that as a roadmap-input opportunity.
3. The Q1/Q2 forced-pick framing per Rule 14f gave the director clean letter answers AND a follow-on root-cause concern that wouldn't fit either option. The escape-hatch worked — director didn't pick A or B mechanically, asked the meta-question first, then made an informed pick.

**Meta-procedural note (positive):** No Rule 13 fatigue triggers fired. Single session ~75 min of active work. No Rule 14 plain-language slips. Rule 9 deploy gate honored — code committed but not pushed; awaiting director approval. Rule 11 Option A clean-split honored — only today's 9 files in the commit, no leftover untracked or .bak files swept in.

---

### 2026-04-24c — Session 3a code shipped (5 of 9 Session 3 items, informational, autonomous design calls noted for director review)
**Session:** session_2026-04-24_phase1g-test-followup-part3-session3a (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / ASTTable / Canvas / Phase 1g-test follow-up Part 3 — Session 3a
**Severity:** Informational (clean code session, zero mistakes; logging design calls + patterns for future reference)

**What happened:** Director approved a Session 3a / Session 3b split at session start. Session 3a shipped 5 smaller items — model dropdown (#6), nextNodeId stale-counter fix (#5), cost-tracker failed-attempt fix (#7), B1 settings persistence (#8), RemovedKeyword soft-archive flow (#3). Session 3b deferred for fresh-mind focus on the bigger items: P3-F7 reconciliation pass (#1), salvage mechanism (#2), and the four-function P3-F8 canvas-layout port (#4). Single commit `25811c3`; pushed and deployed to vklf.com.

**DB migration applied to production Supabase:** added one new table `RemovedKeyword` (FK to `ProjectWorkflow`, indexed on `projectWorkflowId`). Pure additive — no existing data touched. Director gave explicit approval before `npx prisma db push` per Rule 8.

**Two autonomous design calls (per Rule 15) flagged here for director review:**

1. **Self-heal-on-read for `CanvasState.nextNodeId`.** Rather than diagnosing the exact write path that left Bursitis at `nextNodeId=5` vs `max(CanvasNode.id)=104`, the canvas GET endpoint now returns `max(stored_nextNodeId, max(CanvasNode.id) + 1)` and the same for pathways. Single source of truth at read time, immune to future stale writes, no migration required. **Why this design over hunt-the-bug:** the bug surfaces at most as ID collisions during new-node create, which only fires manually or during Auto-Analyze rebuild — both consume the GET output. Healing on read covers all callers in one place. Director can override by asking for a write-side fix later if a collision still surfaces.

2. **`apiKey` stays in browser localStorage; all other Auto-Analyze settings sync via UserPreference DB.** Director asked for "settings persist across refresh." Two ways to do that: store everything in DB (simpler, syncs cross-device, exposes Anthropic API key in plain-text Postgres) OR split (apiKey local-only, others DB-synced). Picked the split because the cross-device benefit is small for a Phase-1 admin-solo project and the security exposure of a long-lived API key in plain-text DB is real. Director can override by asking for the merge-everything version — adding apiKey to the DB blob is one extra line. Documented at Director's review surface in handoff so override stays cheap.

**One architectural pattern named (third in this Part-3 series):**

3. **"Self-heal on read" for stale persistent counters.** When a counter value is written from many code paths and any one of them might leave it stale, fixing all the writers is fragile and incomplete. Computing the effective value at read time from the underlying data (`max(stored, observed_max + 1)`) is one place to fix and immune to future regressions. Generalizable to any monotonic counter the system has independent ground truth for. Recorded for future tools that build similar "next-id" counters.

4. **"Split-secret-from-shared-prefs" for sensitive UserPreference fields.** When a user-preference key holds a long-lived secret (API key, OAuth refresh token), keeping it browser-local-only while other prefs sync to DB gives refresh-survival without DB-plaintext exposure. The pattern: one DB key for the structural prefs JSON; one localStorage key for the secret; same load-on-mount and debounced-save flow for both. Recorded for future AI-using tools that need user-supplied API keys.

**How caught:** Planned Session-3a scope. No mistake.

**Prevention:** Not applicable.

**Lessons captured for future sessions:**
1. The self-heal-on-read pattern (above) generalizes — should be the default approach when adding any counter that multiple code paths write to.
2. The split-secret-from-shared-prefs pattern (above) becomes more important as more AI-using tools land — every new tool that takes a user API key should follow this.
3. Session 3a / Session 3b split worked well. Both halves stayed within Rule 16 fatigue budgets. Recommend continuing the "split when in doubt" heuristic for any session with both DB schema work AND substantial code rewrites.

**Meta-procedural note (positive):** Director approved the proposed split + the autonomous design calls without escalation, suggesting the pre-work framing (option-with-recommendation per Rule 14b, then "make recommendations comprehensive" override) worked as intended.

---

### 2026-04-24b — P3-F8 canvas-layout diagnosed + Task 5 prompt-review refinements locked in (informational, Session 2b findings)
**Session:** session_2026-04-24_phase1g-test-followup-part3-session2b (Claude Code)
**Tool/Phase affected:** Keyword Clustering / CanvasPanel / Auto-Analyze prompts / Phase 1g-test follow-up Part 3 — Session 2b
**Severity:** Informational (diagnostic findings + prompt-engineering review outcomes, not a mistake)

**What happened:** Session 2b finished the two items Session 2 rolled forward — P3-F8 canvas-layout regression diagnostic and Task 5 proposed-prompt-changes review. Docs-only commit, no code.

**P3-F8 findings — single architectural root, three user-visible regressions.** Compared `keyword_sorting_tool_v18.html` (17,725 lines — director's upload to repo root, previously untracked, committed this session per Option A clean-split timing) to React `CanvasPanel.tsx` layout surface. Grepped for layout-related function names in both. **Root cause:** the React port migrated canvas *rendering* (SVG node cards, connectors, drag, zoom, single-node overlap nudge via `resolveOverlap` at line 397) but did NOT port the HTML tool's four-job *layout engine*. The four missing jobs:

1. **`cvsNodeH(node)` (HTML line 11965)** — content-driven node height using canvas `CanvasRenderingContext2D.measureText` for accurate text wrapping of title + altTitles + description at the node's current width, plus kw-row accounting and detail-view state. Called from 20+ callsites on content edit, resize, detail toggle, load. **React equivalent: NONE.** `NODE_H = 160` hardcoded constant; `h` loaded from DB and never recomputed. Direct cause of regression 2 (descriptions overflowing node boxes).

2. **`cvsPushDownOverlaps()` (HTML line 14152)** — holistic 4-step pass: reset disconnected roots to baseY → tree-walk from roots via `layoutChildren` (type-aware nested vs linear placement) → 60-pass overlap resolution across all nodes sorted by y → pathway separation. Called after every structural change (node add/delete, parent-child link, content edit, resize, detail-view toggle). **React equivalent: NONE** — only the single-node `resolveOverlap(nodeId)` exists, fires on drag/resize only, does NOT fire after Auto-Analyze canvas rebuild. Direct cause of regression 1 (overlapping nodes after Auto-Analyze adds 80+ nodes per batch).

3. **`cvsAutoLayoutChild(childNode, parentNode, relType)` (HTML line 14321)** — type-aware auto-positioning when a parent-child relationship is formed: linear = align child-left with parent-left, place below all peer descendants; nested = align child-left with parent-center-plus-indent, place below nested siblings only. **React equivalent: NONE.** Direct cause of regression 3 (wrong linear-vs-nested placement, wrong order).

4. **`cvsSeparatePathways()` (HTML line 14251)** — horizontal push-apart for overlapping pathway borders. **React equivalent: NONE.**

Bonus gap #5: **`baseY`/`y` separation** — HTML tracks user-set baseY distinct from current pushed y, so collapse/expand restores user-arranged positions cleanly. React has only `y`.

**Director's Q1/Q2/Q3 resolutions for Session 3 P3-F8 port:**
- Q1 (layout-pass frequency after Auto-Analyze) → **after every batch** (not just run-end). Keeps canvas clean during live human-in-loop review.
- Q2 (include pathway separation in Session 3 scope, or defer) → **don't defer** (include). Bursitis is single-pathway but multi-pathway Projects will need it.
- Q3 (one-shot port of all four functions together vs incremental) → **one-shot**. The four functions are interdependent (height feeds layout-pass; auto-layout-child feeds layout-pass); testing isolated would require shim code.

Item #5 (`baseY`/`y`) defers to a follow-up session — Q2 was narrowly about pathway separation.

**Task 5 findings — all 7 proposed changes' line references verified zero-drift against current `AUTO_ANALYZE_PROMPT_V2.md`** (last committed 2026-04-18 at `27eb180`). Every insertion point still accurate. Refinements applied to the proposed-changes doc:

- **Change 3 — meaningful fix.** Original Step 4b Comprehensiveness Verification text had a math/definition bug: question (i) asked "how many facets" without disambiguating whether the core intent counts as a facet; the worked example then self-caught the confusion mid-logic with literal "Wait — 3 < 4, one facet skipped. Adjust:". Redrafted with (i) "qualifying facets = demographic/situational/temporal/severity/contextual modifiers ONLY, NOT the core intent"; (iii) correct total = 1 + N(facets) stated explicitly; COMPREHENSIVENESS CHECK BLOCK adds a dedicated "Core intent (primary placement topic title)" row separate from "Qualifying facets identified"; worked example rewritten to arithmetic-match.
- **Change 2 Location 2 — grammar fix.** "within the same facet that their combined volume meets or exceeds" → "within the same facet, where their combined volume meets or exceeds".
- **Change 4 — JUSTIFY_RESTRUCTURE payload expanded.** Original proposed 4 fields (prior state, new state, reason, expected improvement) → full 6 fields per `MODEL_QUALITY_SCORING.md §4` (Topic affected, Prior state, New state, Score, Reason, Expected quality improvement).
- **Change 5 — example labels polished.** "(symptom focus)"/"(demographic focus)"/"(age-demographic focus)" had two overlapping demographic labels → "(symptom focus)"/"(gender facet)"/"(age-group facet)".
- **Changes 1, 6, 7 — no changes needed.**

**Three design questions resolved:**
- **Q4 — Change 2 × Change 4 interaction.** When Step 6(b) cross-canvas cluster promotion or Trigger (7) reassigns a keyword out of a prior-canvas topic whose `stability_score >= 7.0`, the reassignment requires a JUSTIFY_RESTRUCTURE payload in the Reevaluation Report. Prevents high-confidence topics being silently gutted of keywords. Captured as sentence additions to both Change 2 Location 1 and Location 2.
- **Q5 — What does the tool do with IRRELEVANT_KEYWORDS flags from Change 6's salvage template?** Tool code writes flagged keywords to the Session-3 `RemovedKeyword` table with `removedSource='auto-ai-detected-irrelevant'` and `aiReasoning` populated from the model's reason. Admin can review or restore any time. **This is distinct from the deferred "Auto-Remove Irrelevant Terms button"** (proactive full-canvas scan UI — director's "don't program without specifics" instruction still applies to THAT button). Salvage's per-batch model-initiated auto-archive is NOT blocked. Change 6 template text updated: "Admin will review and decide whether to move it to the Removed Terms table" → "The tool will auto-archive these keywords to the Removed Terms table with source tag 'auto-ai-detected-irrelevant' and your reasoning preserved; admin can review or restore at any time."
- **Q6 — How does `stability_score` metadata reach the model?** Add `Stability Score` as 10th column to the Topics Layout Table TSV schema. Primer Section 2 updated with: column definition, parsing rule 12 (float default 0.0 clamped [0.0, 10.0]), constraint rule 16 (preserve existing verbatim, emit 0.0 for new, structural changes to ≥7.0 require JUSTIFY_RESTRUCTURE), OUTPUT FORMAT header updated to 10 columns, output rule for one-decimal-place float. Ships in Session 5 (scoring implementation) + Session 6 (prompt merge) together.

**How caught:** Planned investigation + review. No mistake involved.

**Prevention:** Not applicable (not a mistake).

**Lessons captured for future sessions:**

1. **Architectural pattern named: "React migrations can port rendering without porting the layout/interaction engine."** The HTML tool's layout engine (20+ call-sites of `cvsNodeH` + `cvsPushDownOverlaps` triggered from every structural change) is not drawing code — it's geometry code triggered from many places. Mechanical component-by-component React ports preserve drawing faithfully (node card, connector) but silently omit this kind of cross-cutting behavioral logic because it doesn't live in any single component. Design guidance for future port work: before starting, grep the source for all callsites of each layout/interaction function; enumerate the triggering events; confirm each has a React equivalent. Don't assume "rendering parity" = "behavioral parity." Recorded in ROADMAP P3-F8 UPDATE block for reference.

2. **Line-reference drift in prompt-change docs is a real risk + cheap to verify.** The proposed-changes doc was drafted 2026-04-20 against commit `27eb180`; Session 2b verified all 7 references still match the current canonical doc in seconds via `Read` + grep. Cheap insurance. Future prompt-change docs should include the base commit hash in their header so verification is deterministic.

3. **Math bugs in model-prompts are high-leverage to catch pre-merge.** The original Change 3 text had a self-contradictory worked example ("3 < 4, one facet skipped. Wait — adjust:") that the model would replicate live in every batch. Catching it pre-merge is cheap; catching it post-merge requires debugging why the model self-corrects mid-response. Reviewer's job in prompt-change merges is arithmetic-level proofreading, not just wording polish.

**Meta-procedural note (positive):** Session 2b's Q1/Q2/Q3 framing for P3-F8 + Q4/Q5/Q6 framing for Task 5 — every multi-option question included per-option context + "I have a question first that I need clarified" escape hatch + free-text invitation close, per Rule 20. No Pattern 14 recurrence. Director's responses were crisp letter/answer picks ("a" / "A. However..." / "Accept the diagnosis. However, here are my answers") suggesting the forced-pick UX with escape-hatch worked as intended.

---

### 2026-04-24 — P3-F7 + Removed Terms root causes diagnosed via hybrid DB-query + code-read analysis (informational, Session 2 findings)
**Session:** session_2026-04-24_phase1g-test-followup-part3-session2 (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / ASTTable / Phase 1g-test follow-up Part 3 — Session 2
**Severity:** Informational (diagnostic findings, not a mistake)

**What happened:** First Claude Code session to engage direct DB queries as standard practice. Ran 4 read-only Prisma-client queries against live Bursitis data in Supabase: project list → baseline counts → full canvas tree walk → P3-F7 diagnostic (sum linked keywords vs AI-Sorted DB count + cross-reference). Then read `AutoAnalyze.tsx` (batching + `doApply` steps 3/9/11 + `buildQueue`), `ASTTable.tsx` (state init + `handleRemove`/`handleRestore`), `api/.../keywords/route.ts` (DELETE endpoint behavior), `api/.../canvas/rebuild/route.ts` (atomic rebuild transaction) in detail.

**P3-F7 findings:** Two distinct bugs share a shared architectural root — two independent sources of truth for "keyword is placed" (`Keyword.sortingStatus` updated by `doApply` step 11; `CanvasNode.linkedKwIds`/`kwPlacements` updated by step 3) with unidirectional updates (status only gets ADDED as AI-Sorted, never REMOVED). No reconciliation pass. Drift accumulates batch-by-batch.
- **Bug 1 — 58 "silent placements":** all on canvas as [p] primary but `sortingStatus='Unsorted'`. Root cause: `doApply` step 11 at line 1179 iterates only `batch.keywordIds` when marking AI-Sorted. Step 9 at lines 1147–1165 updates `Keyword.topic` for every keyword matching any text in the AI's response regardless of batch. Mode A's full-table view regularly places prior-batch keywords as [p] primary in later batches' responses → step 9 fires → step 11 doesn't (cross-batch keyword not in `batch.keywordIds`) → silent placement.
- **Bug 2 — 74 "ghost AI-Sorted":** `sortingStatus='AI-Sorted'` but not on canvas. Two sub-groups:
  - **Sub-group 1 (49 kw, non-empty topic + canvasLoc):** reshuffle casualties. Correctly placed in earlier batch (step 11 marked AI-Sorted). Later batch's canvas rebuild removed keyword from canvas. Step 11 only ADDS to AI-Sorted, never REMOVES. Stale status persists. Topic/canvasLoc strings survive because step 9 only appends.
  - **Sub-group 2 (25 kw, empty topic + empty canvasLoc):** linkedKwIds carryover via the `existing?.linkedKwIds || []` fallback at `doApply` line 1003. When AI response has empty `kwRaw` for a node, the node inherits linkedKwIds from pre-existing state. Inherited kws flow into `allLinkedIds` at step 11 → marked AI-Sorted if in `batch.keywordIds` → step 9 never touched them (not in parsed response text).

**Removed Terms findings:** `ASTTable.tsx` line 116 initializes `removedTerms` as `useState<RemovedKeyword[]>([])` — no localStorage load, no DB fetch. `handleRemove` (line 252) calls `onBulkDelete` / `onDeleteKeyword` which HARD-DELETE Keyword rows via `prisma.keyword.deleteMany` at `/api/projects/[projectId]/keywords` DELETE endpoint. Archive entry written only to in-memory state → lost on page refresh; hard-deleted Keyword row gone forever. Director's prior-session remove action did NOT actually delete anything (DB shows 2,328 kw = original import count; zero orphan canvas refs) — action evidently didn't fire. But the wiring IS capable of permanent deletion, so future remove clicks would silently lose data.

**Sub-finding (additional):** `CanvasState.nextNodeId = 5` despite max `CanvasNode.id = 104`. Stale counter. New-node creation via this counter would collide. Flagged for Session 3 investigation.

**Director's fix directions (2026-04-24):**
- **P3-F7 — two-part fix.** Primary = root-cause stack via Sessions 3-6 plan already in place (salvage-ignored-keywords mechanism + prompt changes [tie-breaker, comprehensiveness verification, multi-placement reinforcement] + stable topic IDs + stability scoring friction gradient + Changes Ledger admin visibility). Backup = post-batch reconciliation pass (new Session 3 item) that walks canvas after every batch and reconciles `Keyword.sortingStatus` against canvas reality. Per director: *"Whatever fix we apply here should be a backup to that primary fix."*
- **Removed Terms — Option B.** New `RemovedKeyword` table scoped to `ProjectWorkflow`. Remove = transaction copying Keyword row to `RemovedKeyword` + deleting Keyword. Restore = reverse. `removedSource` field distinguishes manual vs future auto-AI removal; `aiReasoning` holds model rationale when auto.

**How caught:** Planned investigation + code reading. No mistake involved.

**Prevention:** Not applicable (not a mistake).

**Lessons captured for future sessions:**
1. **Direct DB queries surface drift that code-reading alone can't.** The P3-F7 two-sub-group split of ghosts was only visible from the DB cross-reference (49 with topic + 25 without) — pointed directly to two distinct mechanisms. Hybrid analysis (DB + code) is more powerful than either alone. Validates the 2026-04-20 decision to make direct-DB-querying standard practice.
2. **Architectural pattern named: "multi-mode write paths to a single logical concept always drift without reconciliation."** `Keyword.sortingStatus` vs `CanvasNode.linkedKwIds` is one instance. This pattern will recur in: (a) Phase 2 worker-concurrency work on shared canvas state; (b) any future multi-mode AI tool (e.g., Mode A + Mode B + Human-in-Loop mode all writing to the same canvas — the Session 1 2026-04-20 "Mode B can silently overwrite Mode A" finding is exactly this pattern). Design guidance: either single source of truth, or explicit reconciliation pass, or per-action provenance that makes drift visible + recoverable. Recorded in `KEYWORD_CLUSTERING_ACTIVE.md` POST-SESSION-2 STATE block for future reference.
3. **Director's root-cause-first + reconciliation-as-backup philosophy** is now standing guidance for multi-source-of-truth bugs. Don't patch the symptom alone — fix the root cause (the WHY) AND add reconciliation as a safety net for anything that slips through.

**Meta-procedural note:** Claude's first framing of the follow-up questions (asking director to "react to" diagnoses without concrete pickable options) was too vague — director asked "What are you asking me?" Claude reframed with proper Rule 20 per-option context + escape hatch + free-text invitation. Correction was inline + conversational, not escalated — noting here for future sessions to apply Rule 20 to reaction-solicitation moments, not just decision points.

---

### 2026-04-20 — 51-batch Bursitis run narration + analysis: reactive switch fired at batch 40, Mode B carried batches 40-51 cleanly, batch 52 Mode B "Lost 6" core keywords including "bursa" (informational)
**Session:** session_2026-04-20_phase1g-test-followup-part3 (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Phase 1g-test
**Severity:** Informational (run analysis + qualitative findings)

**What happened:** The Bursitis Auto-Analyze run left processing in browser tab at end of 2026-04-19 session was cancelled by director at 11:40:22 PM after batch 52 failed validation. Run duration ~10h 37min. Outcome was variant (a) from prior session's prediction set: reactive Mode A→B switch fired at **batch 40 (10:27:02 PM, canvas of 95 nodes)** on a narrow trigger ("Deleted 1 topics: Wrist bursitis; Lost 1 keywords: wrist bursitis"). Mode A never hit the projected 200k context wall — input peaked at ~53k billed + ~66k output ≈ 119k at batch 17. 39 Mode A batches: canvas 22→95 nodes, "0 removed" every batch, all keywords verified every batch; "Unusually high: N new topics" warnings grew from 27 (batch 6) to 82 (batches 34-39). 12 Mode B batches (40-51): canvas 95→105, delta rows 7-12, cost dropped ~2× ($0.36-$0.47 vs. $0.80 avg), batch time dropped ~2.5× (5-6 min vs. 14 min). Batch 52 attempt 1 failed validation: "Missing 2 batch keywords: bursa city, bursa iş ilanları; Lost 6 keywords: bursa, bursa sac, what is a bursa, what is bursa, omental bursa." Director cancelled during retry 2. Total keywords placed: 408 of 2,304 = 17.7%. Estimated final cost if completed at Mode B pace: ~$90-100 over ~33 hours.

**Key qualitative findings (from director + log + code review):**
- **Mode A was qualitatively SUPERIOR to Mode B structurally** (director's direct assessment) — but there's no current way to quantify the difference. See also: Mode-B-can-silently-overwrite-Mode-A entry below.
- **Silent topic reshuffling in Mode A:** canvas oscillated 80→81→80→82→81→80... while "0 removed" fired every batch. Validation only catches by-name-disappearance; renames/merges/splits look like "no topics removed" even when structure changes substantially.
- **"N new topics" count is misleading:** the code compares response-row names to pre-existing names; renames count as "new." With 80+ row responses, this produces alarming noise (e.g. 82 "new topics" when net canvas growth is +3).
- **Director's bursa/Turkey-city homograph insight:** "bursa" = fluid sac AND Turkish city. "bursa iş ilanları" = "Bursa job listings." Forcing the model to place every batch keyword creates pressure to invent awkward topics, drop keywords, or silently mis-place. This is probably contributing to topic-structure corruption across runs.
- **Model not comprehensive in topic-chain creation:** for keyword like "bursitis pain in older women" (3 facets: pain, gender, age), model should produce 1 primary + 2 secondary with full upstream chains. Currently producing partial coverage under output-length pressure.
- **Keywords being left out of batches (director's AST Table observation):** some keywords show "Unsorted" status interspersed with "AI Sorted" after runs, and are absent from Topics/Analysis tables. Investigation deferred to Session 2.
- **Canvas layout regressions** from the HTML tool (node overlap, description overflow, wrong ordering) observed by director. `resolveOverlap` exists in React code (per `PLATFORM_ARCHITECTURE.md §388`) but appears insufficient. Diagnostic deferred to Session 2 after director uploads `keyword_sorting_tool_v18.html` to repo root.

**Correction (to prior session's roadmap):** The 2026-04-19 roadmap entry framing the proactive Mode A→B switch as a "functional prerequisite" was based on a projection that this run did not fully validate (context wall never hit). Downgraded to "cost-optimization option, pending qualitative comparison." See separate entry below on Claude's Q4 framing error.

**Prevention:** Future run-narration sessions must explicitly incorporate the director's qualitative observations, not just the log-based quantitative data. Log analysis alone is insufficient — the model's output quality (topic hierarchy structural integrity, searcher-centric language quality, conversion-funnel stage placement, comprehensive facet extraction) can only be assessed by eye on the canvas. Added to Session 2's scope: direct DB query on the Bursitis canvas for joint qualitative analysis.

**Lesson:** Safety checks that look clean are not evidence of quality. Batch-level "all keywords verified" + "0 removed" + "no errors" can co-exist with silent structural degradation. Qualitative review is not optional.

---

### 2026-04-20 — Claude's Q4 quantitative-framing error: treated Mode A time/money as "wasted" relative to Mode B without justifying quality parity
**Session:** session_2026-04-20_phase1g-test-followup-part3 (Claude Code)
**Tool/Phase affected:** Methodology / analysis-framing / roadmap-prioritization
**Severity:** High (would have driven wrong-direction roadmap decisions; caught by director)

**What happened:** During the Q4 portion of analyzing the 51-batch Bursitis run, Claude stated Mode A's 9 hours and ~$31 was "wasted" relative to Mode B, and recommended a proactive Mode A→B switch to eliminate the "waste." This framing assumed quality parity between Mode A and Mode B — an assumption Claude never justified. Director correctly pushed back: "But why do you consider Mode A time and money wasted relative to Mode B if the quality of Mode A could have been far superior to Mode B — something we have yet to discuss? ... The goal is to create an accurate topics hierarchy that serves our overall purposes of successfully launching a product... simply looking at the output in a quantitative manner devoid of a qualitative analysis will lead us down the wrong path with poor overall outcomes."

**Root cause:** Claude defaulted to a quantitative analysis lens (tokens, dollars, batch time) because those are the log-extractable metrics. The qualitative lens (tree structure, narrative flow, searcher-centric language quality, conversion-funnel integrity) requires canvas inspection and product-domain judgment — both of which Claude didn't have access to in that turn. Instead of flagging the gap ("I don't know Mode A quality vs. Mode B quality from the log alone"), Claude assumed parity and built a "wasted cost" argument on top. This is a Pattern-7-adjacent failure mode: defaulting to available evidence without flagging missing evidence.

**How caught:** Director directly, immediately, with a clear prescriptive explanation of why qualitative matters more than quantitative for this platform's purposes.

**Correction (applied this session):**
- Claude openly acknowledged the error mid-session, no minimizing (per Rule 7 in CLAUDE_CODE_STARTER).
- Revised recommendation: DON'T implement proactive Mode A→B switch as a default; instead, do qualitative A/B comparison FIRST. If Mode A wins on quality (as director later confirmed), keep Mode A as default with multi-trigger safety nets, accept higher cost as quality tax.
- Downgraded ROADMAP entry for "Proactive Mode A→B switch" from "functional prerequisite" to "cost-optimization option, pending qualitative comparison."
- Added Mode-B-can-silently-overwrite-Mode-A problem (next entry) as a first-order concern that the purely-quantitative framing completely missed.

**Prevention:**
- **New meta-rule for future run-narration sessions:** when log-extractable metrics point in one direction, explicitly flag the metrics Claude does NOT have access to and what conclusion they might support differently. "Based on the log alone, Mode A costs more; from the canvas alone, the quality comparison might be opposite. To decide, we need the canvas."
- **Apply Rule 16 (zoom in AND zoom out) more rigorously when analysis involves tradeoffs:** cost/time is the zoom-in; product-launch effectiveness is the zoom-out. Both must be named before any recommendation.
- **Default assumption to flip:** when two modes produce different cost/time profiles, ASSUME the lower-cost one may have lower quality and require the director to confirm quality parity before recommending it as the default.

**Lesson:** For a non-programmer director building a product-launch platform, "faster + cheaper" is NEVER automatically better than "slower + more expensive" — the qualitative product outcome dominates. Quantitative analysis without qualitative grounding is worse than no analysis, because it produces confident-sounding wrong answers.

---

### 2026-04-20 — "Double-classification" terminology clarification (informational)
**Session:** session_2026-04-20_phase1g-test-followup-part3 (Claude Code)
**Tool/Phase affected:** Methodology / communication / Keyword Clustering semantics
**Severity:** Low (terminology clarification, no user-facing impact)

**What happened:** Claude used the phrase "double-classification" in a negative context during Q1 analysis (listing it as one of the "messy workarounds" the model engages in when it can't delete topics). Director correctly flagged that many keywords SHOULD appear in multiple topics because their intent genuinely spans multiple facets — example: "bursitis pain in older women" legitimately belongs under "bursitis pain", "bursitis in women", and "bursitis in older people" simultaneously.

**Root cause:** Claude conflated two distinct concepts:
- **Intentional multi-placement** (GOOD, platform feature) — keyword genuinely spans topics; primary [p] + one or more secondary [s] placements represent the full intent.
- **Workaround duplication** (BAD, failure mode) — model can't decide between two topics and places in both out of indecision, not intent.

Using "double-classification" without qualifier made it sound like all multi-placement is problematic, which contradicts the prompt's explicit secondary-placement design.

**How caught:** Director directly.

**Correction:**
- Claude clarified the distinction in-session.
- Added the distinction to `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` Change 5 (multi-placement reinforcement) with explicit "MULTI-PLACEMENT IS A FEATURE, NOT A COMPROMISE" framing + "IS / IS NOT" contrast.
- Recorded here for future sessions.

**Prevention:** Future sessions should use precise terminology: "intentional multi-placement" for the feature, "workaround duplication" only for the specific failure where the model hedges without justification. Flag any appearance of ambiguous terms like "double-classification" or "redundant placement" and ask for clarification before recommending fixes.

**Director's guidance to preserve:** "many keywords should be put into multiple topic nodes because the focus of those individual topics could be equally applicable to that keyword." This is the intended behavior.

---

### 2026-04-20 — "Lost" vs "Missing" keyword-validation error messages: code-verified distinct semantics (informational)
**Session:** session_2026-04-20_phase1g-test-followup-part3 (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / batch validation
**Severity:** Informational (factual clarification, directly referenced by prompt/code-design decisions this session)

**What happened:** Director asked whether the "Lost N keywords" vs "Missing N batch keywords" error messages represent different failure modes. Claude verified in `AutoAnalyze.tsx`:
- **Line 822:** `const missing = batch.keywords.filter(kw => !allKwsInTable.has(kw.toLowerCase()));` — "Missing N batch keywords" = this batch's keywords that didn't make it into the AI's output.
- **Line 865:** `errors.push('Lost ' + lost.length + ' keywords: ' + lost.slice(0, 5).join(', '));` — "Lost N keywords" = previously-placed keywords that disappeared from the AI's response.

Confirmed semantics: **"Missing" = same-batch non-placements (this batch's work wasn't finished). "Lost" = previously-applied work erased (prior work destroyed).** "Lost" is the more serious failure mode because it represents data destruction, not just incomplete work.

**Relevance to batch 52 failure in the 51-batch run:** Batch 52 error was BOTH: "Missing 2 batch keywords: bursa city, bursa iş ilanları" (consistent with the Turkey-city homograph insight — model couldn't place these unrelated keywords) AND "Lost 6 keywords: bursa, bursa sac, what is a bursa, what is bursa, omental bursa" (six previously-placed foundational keywords erased — structural failure). The "Lost 6" is the larger concern.

**Design implication (captured in `AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.md` Change 6):** The salvage-ignored-keywords mechanism applies to "Missing" (can do a targeted follow-up placement). For "Lost", targeted follow-up is insufficient — structurally broken response; use full-batch retry instead.

**Prevention:** Terminology in future discussions should clearly distinguish "Missing" vs "Lost" per the code's actual semantics. Documentation and prompt copy should use the same terms consistently.

---

### 2026-04-20 — Mode B can silently overwrite Mode A's higher-quality work — identified as a first-order problem not addressed in prior design
**Session:** session_2026-04-20_phase1g-test-followup-part3 (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Mode A vs Mode B architecture
**Severity:** High (identified this session; design fix proposed; not yet implemented)

**What happened:** Director raised this critical issue during Q3 discussion: "Since Mode B can overwrite the work done by Mode A, when admin finally reviews the Auto-Analysis's final output, the results could be drastically skewed by Mode B with Mode B masking the better results of Mode A." In the 51-batch Bursitis run, Mode A produced qualitatively superior structural work over 39 batches (director's direct assessment). Then Mode B took over at batch 40 and modified topics Mode A had created, producing 12 more batches of work in its own style. Admin's final-review canvas is a blend of Mode A work and Mode B modifications, with no way to distinguish which mode produced which part — so Mode A's quality can be diluted or lost without admin knowing.

**Root cause:** The current architecture treats Mode A and Mode B as interchangeable fallback modes. The reactive switch assumes Mode B can continue Mode A's work. No per-action provenance tracking. No mechanism to protect Mode A's admin-approved work from Mode B modifications. No quality scoring per mode. No side-by-side comparison view. All of these are first-order design gaps the previous sessions missed because they were optimizing for "does the run finish?" rather than "does the run produce quality output?"

**How caught:** Director directly during Q3 discussion.

**Correction (design captured this session, implementation pending across multi-session plan):**
- **Changes Ledger with per-action provenance** (mode/model/batch/settings/stability-score-at-time-of-action) — admin can filter to "show only Mode A actions" to see Mode A's contribution isolated. Session 4 scope.
- **Admin quality scoring per action (1-5 scale)** rolled up per-mode — after a run admin sees "Mode A avg 4.3 / Mode B avg 2.8" and the quality difference becomes measurable. Session 7-9 (Human-in-Loop) scope.
- **Mode A "protected" status on admin-approved actions** — Mode B cannot modify a Mode A topic that admin has marked as good. Uses the stability-scoring friction gradient (score ≥ 7.0 requires JUSTIFY_RESTRUCTURE). Session 5 scope.
- **Final review "mode difference" view** — diff of what each mode changed, with ability to revert Mode B changes that damaged Mode A quality. Session 7-9 scope.

**Prevention:**
- **New architectural principle:** when two (or more) AI processing modes operate on shared state, there MUST be per-action provenance tracking from the start. Admin must always be able to answer "which mode produced this result?" without guesswork.
- **Applies platform-wide:** any future tool with multi-mode AI processing must build this in from day one. Added as a requirement to `AI_TOOL_FEEDBACK_PROTOCOL.md` §2.
- **This entry also exposes a gap in Claude's Q4 framing error (entry above):** not only was quality comparison missing, but the interaction between modes (Mode B's ability to silently erode Mode A's quality) was invisible in the quantitative framing. Qualitative analysis must consider cross-mode interactions, not just per-mode outputs.

**Lesson:** When architecting multi-mode AI systems, the single most important question is not "how does each mode perform?" but "how do the modes interact, and does their interaction preserve or degrade quality?"

---

### 2026-04-19 — Stale-closure fix validated live across 7 clean batches on Bursitis run (informational, not a mistake)
**Session:** session_2026-04-19_phase1g-test-followup-part2 (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Phase 1g-test
**Severity:** Informational (success record)

**What happened:** Commit `a6b3b19` shipped the two fixes from yesterday's stale-closure entry: (A) `buildCurrentTsv` now reads from `nodesRef.current` / `keywordsRef.current` / a new `sisterLinksRef.current` instead of the render-time closure; (B) `handleApplyBatch` is now async and `await`s `doApply(...)` before running the next `runLoop()` iteration. `handleSkipBatch` was audited — no change needed (it doesn't call `doApply`). Build clean in 36s; pushed to origin/main; Vercel deployed in ~2 min.

User then launched a fresh Bursitis Auto-Analyze run (288 batches, 2,304 keywords, API Mode=Direct, Thinking=Enabled, Budget=12000, Review-each-batch=ON) leaving the 22 pre-existing canvas nodes from the prior aborted run in place. Over the first 7 completed batches:

- **"0 removed" on every single batch** (HC4 validation: no topics ever deleted)
- **"All N keywords verified on canvas" on every batch** (HC5 validation: no keywords ever lost)
- Canvas grew monotonically: 22 → 27 → 33 → 36 → 39 → 41 → 49 → 53 nodes
- Input token count grew batch-over-batch in proportion to canvas size (21,347 → 23,246 → 26,331 → 28,020 → 29,870 → 31,586 → 36,839 → 39,781) — this is the live fingerprint that `buildCurrentTsv` is reading post-apply state via the refs, not the frozen closure. If the stale-closure bug were still present, this number would be flat.

One stream stall on batch 2 (Anthropic API went quiet mid-generation for ~90s) triggered the tool's built-in stall-retry correctly — stall retry counter used separately from the 3-attempt API retry budget, as designed. Not related to the fix.

Batch 6 and 7 emitted "⚠ Unusually high: N new topics" soft warnings (27 and 31 respectively, threshold 25) — the AI is producing more new-topic *signals* than net canvas growth, consistent with Mode A doing speculative topic restructuring. Not a correctness failure (validation always passed), but a signal Mode A is starting to think-out-loud as the table grows.

**Prevention:** Not applicable (not a mistake). But worth noting as evidence that the stale-closure fix is robust: 7 consecutive clean batches, validated across two different processing patterns (normal 2–6-new-topic batches AND batch-6's 8-new-topic spike with the warning). Also worth noting: the comment added near the refs block (`"runLoop-reachable code must read nodes/allKeywords/sisterLinks via *Ref.current, not raw props"`) now documents the invariant so future developers don't re-introduce the bug.

---

### 2026-04-19 — Mode-A-alone cannot complete a 2,304-keyword Bursitis run before the 200k context wall
**Session:** session_2026-04-19_phase1g-test-followup-part2 (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Phase 1-polish
**Severity:** Informational (new quantitative finding that reframes the roadmap)

**What happened:** After 7 clean Bursitis batches validated the stale-closure fix, I produced a trajectory projection based on the observed data (input ~750 tokens per canvas node; output ~600–700 tokens per node in Mode A, spiking to ~950 in reshuffle batches). Projection: at the current ~3–4 net-new-topics-per-batch pace, Mode A in pure form hits the **200k context-window wall at roughly 120–140 canvas nodes**, which equals only **240–600 of the 2,304 keywords placed (10–26% of the dataset)**, depending on whether adaptive batch tiering kicks in to grow batch size from 8 → 12 → 18. Either way: Mode A alone cannot finish this dataset.

**The implication:** completing a full Bursitis (or similarly-sized) clustering run **requires** the Mode A → Mode B switch to fire at some point. Two paths exist:
- **Reactive switch (shipped)** — fires on HC4/HC5 validation failure or output truncation. Relies on Mode A starting to drop topics *before* the context wall hits. Race condition.
- **Proactive switch (roadmap item, NOT shipped)** — would fire after batch 1 (or at a node-count threshold) regardless of Mode A quality. Removes the race.

The reactive switch by itself is insufficient for full-dataset runs because Mode A may stay "clean" past the point where switching is still safe (once input + output tokens exceed ~180k, Mode B's smaller delta output can't rescue it either — the input alone is the problem).

**Why this wasn't obvious before this session:** prior Bursitis attempts never got past ~batch 3, so the trajectory data didn't exist. The stale-closure fix was the prerequisite to generating this data.

**Correction:** Not a fix — a re-prioritization of existing roadmap item. The "Proactive Mode A → Mode B switch after batch 1" Phase 1-polish item is promoted from "nice-to-have" to **functional prerequisite for any full-dataset clustering run**. Captured in `ROADMAP.md` Phase 1-polish section and `KEYWORD_CLUSTERING_ACTIVE.md` §6.5.

**Prevention — for future LLM projections:** when making trajectory estimates from limited batch data, explicitly project the context-window math out to dataset completion, not just the next few batches. The gap between "this batch works" and "the full run can complete" needs to be stated, not assumed. Adding this as a checklist item for future Auto-Analyze run narration.

**Lesson — useful pattern for run-narration more generally:** once 5–7 batches of data exist, do the full-dataset projection arithmetic explicitly. The arithmetic is cheap; the insights it surfaces (context wall, cost ceiling, time-to-completion) change the decision space (continue vs. pause to implement a missing feature). Per `HANDOFF_PROTOCOL.md` Rule 16 zoom-out requirement.

---

### 2026-04-18 — Stale-closure bug in buildCurrentTsv contaminates Mode A diagnosis; exposed during live Phase 1g-test follow-up run
**Session:** session_2026-04-18_phase1g-test-followup (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Phase 1g-test
**Severity:** High (load-bearing bug blocking all Auto-Analyze runs past batch 2; also reshapes the prior session's diagnosis of the Mode A "dropped topics" failure mode)

**What happened:** During the Bursitis Auto-Analyze run attempted this session (2,320 keywords, Direct mode, Enabled-12k thinking, model claude-sonnet-4-6, Review each batch ON), Task 2's new Mode A → Mode B auto-switch fired correctly on batch 2 when Mode A's response dropped 1 topic ("Pes anserine bursitis") and 8 keywords. Batch 2 Mode B succeeded and applied 22 nodes to the canvas. But then batch 3 Mode B failed validation with "Deleted 11 topics; Lost 8 keywords." Investigation revealed the merge function had operated on 10 rows, not 22:

- Pre-batch-3 canvas had **22 nodes**
- Batch 3 delta response: **8 ADD + 2 UPDATE rows**
- Expected merged total: 22 + 8 = **30 rows**
- Actual merged total reported by the tool: **"18 total rows"**
- Math: 18 − 8 adds = **10 rows baseline** — exactly the canvas state after batch 1's apply, not batch 2's

**Root cause:** Two compounding bugs:

**Bug A — Stale-closure on `nodes` in `buildCurrentTsv`** (`src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` lines 359–408). The function reads `nodes`, `allKeywords`, and `sisterLinks` directly from the component's render-time closure. The `runLoop` async function persists across renders and invokes `buildCurrentTsv` (via `mergeDelta` at line 629 and `assemblePrompt` at line 421) using the closure from when `runLoop` was defined. The correct pattern — already in use by `validateResult` (line 823, 841) and `doApply` (line 895) — is `nodesRef.current` / `keywordsRef.current`, which are always-fresh refs updated via `useEffect` at lines 214–215. Someone added the refs but missed `buildCurrentTsv`.

**Bug B — Missing `await` on `doApply` in `handleApplyBatch`** (line 1387). `doApply` is `async` and contains `await onRefreshCanvas()` + `await onRefreshKeywords()` at lines 1160–1161 that update parent state. But `handleApplyBatch` fires `doApply` without awaiting, then immediately calls `runLoop()`. The new runLoop captures its closure before the refresh completes, so even fresh-closure-aware code would see pre-apply state. Bug A is the load-bearing one; Bug B compounds it.

**How caught:** Arithmetic on the batch 3 log output revealed the inconsistency (18 merged rows from a 22-row starting state). Code inspection confirmed the stale-closure pattern. Canvas state was not corrupted because validation caught the mismatch and rejected the merged TSV before `doApply` ran.

**Meta-reframing — this contaminates the prior session's Mode A diagnosis.** The prior session (2026-04-18 Phase 1g-test partial) observed Mode A dropping 4-6 topics across 3 retries of batch 2 and attributed this to "LLM attention dilution over long outputs." That theory isn't wrong in general — attention dilution IS real in LLMs emitting 30k+ token structured responses — but the specific failures observed there were at least partially due to Bug A: the AI was being given a stale (smaller) view of the current table via `buildCurrentTsv`, so "dropped" topics may have been topics the AI never saw in its input. Future LLM-behavior theorizing about Auto-Analyze runs should verify the input the AI actually received before diagnosing model behavior.

**Task 2's fix (commit `84062f5`, this session) still works as a safety net.** It correctly catches HC4/HC5 failures in Mode A and flips to Mode B. What it catches is a symptom of Bug A + B, not the original "LLM attention dilution" root cause I thought existed. It remains valuable — the switch to Mode B reduces output size and is structurally safer regardless of the input-freshness question — but isn't a complete fix.

**Correction:** Deferred to next session — two focused code edits:
- (A) Rewrite `buildCurrentTsv` (lines 359–408) to use `nodesRef.current`, `keywordsRef.current`, and a new `sisterLinksRef.current`. Add the sister-links ref + useEffect alongside existing refs at lines 205–215.
- (B) Make `handleApplyBatch` (lines 1384–1398) `async` and `await doApply(batch, pendingResult)` before the subsequent `batch.status = 'complete'` / `runLoop()` calls. Also audit `handleSkipBatch` (lines 1400–1413) for the same pattern — it calls `runLoop()` but doesn't invoke `doApply`, so it may not need the same fix; verify during the next session.
- After (A) + (B) are pushed and deployed, restart the Bursitis Auto-Analyze run to validate end-to-end completion.

**Prevention:** New procedural rule for future Auto-Analyze code additions: any function called inside `runLoop` (directly or transitively through `processBatch`, `mergeDelta`, etc.) that needs to read `nodes`, `allKeywords`, `sisterLinks`, or other props must use the `*Ref.current` pattern. Treat the render-time closure as frozen for the runLoop's lifetime. Adding a code comment near the refs' `useEffect` block saying "All `runLoop`-reachable reads of these must use the refs, not the raw props" would make the invariant discoverable by future sessions.

**Lesson — observations during long runs need math-verification, not just "looks right."** Batch 2 Mode B appeared to succeed (delta merged to 22 rows, validation passed). But the 22-row result was coincidental given a 10-row baseline + 12 adds + 4 updates (and a stale `nodes` that happened to match the real state's first 10 rows). If Claude had done the arithmetic check after every batch — "pre-batch row count + deltas = post-batch row count?" — Bug A would have surfaced earlier. Adding to the "how to review Auto-Analyze runs" mental checklist.

**Meta-lesson — Pattern 7 adjacent.** Docs claimed something existed/worked and reality diverged; in this case, the "docs" were my Mode A diagnosis in the prior session. Cheap verifications (arithmetic on log output) catch it; expensive ones (full code read) confirm. This is a recurring class of issue — when a diagnosis feels "clean," spending 30 seconds checking the numbers can save hours of accumulated-wrong-theory.

---

### 2026-04-18 — Task 2 and Task 3 fixes validated in production (informational, not a mistake)
**Session:** session_2026-04-18_phase1g-test-followup (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Phase 1g-test
**Severity:** Informational (success record — this is NOT a mistake; entry exists to document live-production validation of both fixes)

**What happened (Task 2 validation):** The Mode A → Mode B auto-switch expansion committed in this session (`84062f5`) fired correctly during batch 2 of the live Bursitis run. When the AI's Mode A response at 1:44:46 dropped "Pes anserine bursitis" (HC4) and 8 keywords (HC5), the `isLostDataError` check at the new validation-failure branch matched, `⚡ AUTO-SWITCH: … — switching to DELTA mode (Mode B)` logged, `setDeltaMode(true)` fired, `batch.attempts--` decremented the retry counter so the Mode B retry started as "attempt 1" preserving the full 3-attempt budget. Mode B retry succeeded. Behavior exactly as designed.

**What happened (Task 3 validation):** The Budget input UX fix committed in this session (`b9dc8b9`) was verified live by the user during pre-launch smoke-test on vklf.com after Vercel rolled the deploy. User confirmed: field can be cleared to blank mid-edit without snapping back to 10000, typing a new value works naturally, tabbing away from an empty field snaps to the default. Same pattern applied to Batch size / Stall / Vol threshold inputs also holds by construction (identical code pattern).

**Significance:** First production validation of a Claude-Code-authored code fix for the PLOS platform. Both Tasks 2 and 3 went from "code committed" to "live-verified" within a single session. Contrast with prior claude.ai sessions where fixes often deployed without immediate live verification and surfaced as later-session bug discoveries (e.g., the missing `/projects/[projectId]/page.tsx` that slipped through Ckpts 6–8).

**Prevention:** Not applicable (not a mistake). But worth noting as evidence that the Claude-Code-direct-execution methodology shortens the verification loop substantially.

---

### 2026-04-18 — IMMEDIATE same-session Pattern 14 violation: Claude violated the newly-written rule in the next major decision
**Session:** session_2026-04-18_phase1g-test-kickoff (Claude Code) — caught by user after Pattern 14 had been committed as `b782a53`
**Tool/Phase affected:** Methodology / decision-framing / Pattern 14 enforcement
**Severity:** High (proof that documentation alone does not prevent Pattern 14 slips — even the Claude that authored the rule failed it in the next major decision)

**What happened:** During end-of-session wrap-up, Claude presented a push-to-GitHub decision with three options:
- "push" — I run git push origin main
- "don't push yet" — I produce the handoff noting the commit is local-only, and you can push later yourself when ready
- "show me what changed first" — I show you a summary of the diff before you decide

Each option had a one-line label but lacked:
- Per-option consequence context (what does "local-only" mean in practice for the user? How would they push later — what exact command?)
- Per-option reversibility framing ("pause is fully reversible" / "this is one-way" etc.)
- The required free-text invitation ("Or ask me a question about any option first")

This was committed and pushed as part of the ordinary session flow. The user accepted "push" without complaint. Only AFTER Claude committed Pattern 14 itself (`b782a53`) did the user reread the session and flag: *"you did it again. You gave me a multiple choice to pick from and provided no context for the choices. For example, what did you mean by don't ask for git - again."*

**Root cause:** This is Pattern 14 itself, committed just moments before. The Claude that authored Rule 20 / Rule 14f / Pattern 14 did not have the newly-written rule in sufficient foreground attention during the NEXT major decision it made (push vs. don't push). The rule was written and committed, but the Claude's own behavior didn't yet reflect it. This is the exact visibility-under-load failure mode Pattern 11 describes, recurring for Pattern 14.

**How caught:** User directly, reading back through the session after the commit.

**Correction (applied this entry):**
- Claude acknowledged the slip openly in-session (no minimizing, per Rule 7 in CLAUDE_CODE_STARTER)
- Provided the per-option context retroactively in plain language
- Added this entry to CORRECTIONS_LOG.md as proof that Pattern 14 requires more than documentation

**Prevention (strengthens Pattern 14):**
- Future sessions reading CLAUDE_CODE_STARTER.md at start will see Rule 20, but this entry's existence in CORRECTIONS_LOG — flagged for 2026-04-18 same-session violation — should reinforce that the mechanical test (scan each option for context; confirm free-text invitation) must be run on EVERY multi-option question, not just the important-feeling ones.
- The scan-each-option test from Rule 20 / Rule 14f must become reflexive before sending any response that includes bulleted letter-options or "reply with one of" framing.
- **Related: the "reply with one of: A / B / C" phrasing pattern itself is a red flag.** It implies forced choice without escape. Claude should avoid that phrasing in favor of "A does X (consequence), B does Y (consequence), C does Z (consequence). What sounds right? — or ask me anything about any of these first."

**Lesson:** Pattern 11's recurrence across chats taught us that "rules in docs" aren't sufficient to prevent LLM attention drift. Pattern 14 is an immediate case study in the same failure mode — the rule was authored and immediately not followed. This confirms that mechanical tests must be internalized as habits, not just read-at-start of session.

**Meta-lesson for future sessions reading this entry:** if Claude ever catches itself writing "reply with one of" or a similar forced-choice closer on an options question, STOP and rewrite. The rewrite template: context per option + explicit free-text invitation. Every time.

---

### 2026-04-18 — Multi-option questions without context or free-text escape hatch trapped user into picking letters
**Session:** session_2026-04-18_phase1g-test-kickoff (Claude Code) — feedback raised at end-of-session, post-handoff
**Tool/Phase affected:** Methodology / decision-framing
**Severity:** High (usability pattern that impacts every future session's interaction model)

**What happened:** Throughout the session, Claude presented several multi-option decisions (Option A/B/C for things like: how to handle the leftover script, keyword data starting point, test-plan tuning picks, etc.). In several cases the options had enough context for an informed pick; in others Claude gave terse labels and expected the user to pick by letter. The user raised this directly at end-of-session:

> *"At several points during our session, you posed options to me where rather than type my response, I could only pick from 1,2,3 etc. The problem is, in many instances, I had questions about an option and couldn't type it in. So I want you to do the following next time. Either provide context for my choices so that I know what I'm choosing or let me type my responses so that I can include questions, clarifications about my choices."*

The user is explicitly saying they felt the format was forced: "pick a letter" rather than "pick a letter OR ask me anything first." This is a structural interaction pattern, not a one-off slip.

**Root cause:** Claude's option-framing habit leans toward "make a clean multiple choice" which is good for clarity but bad for a non-programmer who may need to poke at an option before committing. The existing rules (14a–14e in HANDOFF_PROTOCOL) covered "plain language" and "required structure of decision questions" but did NOT explicitly require (a) per-option consequence context OR (b) an explicit free-text invitation. So Claude followed the letter of the rules while missing the spirit of the user's non-programmer needs.

**How caught:** User directly, at end-of-session, with a clear prescriptive ask: "integrate the solutions into our documents so that this issue doesn't happen again."

**Correction (applied this session, second commit):**
- Added Rule 20 to `CLAUDE_CODE_STARTER.md` — "Option questions must include per-option context AND always invite free-text responses" — with mandatory free-text invitation wording and a mechanical test.
- Added Rule 14f to `HANDOFF_PROTOCOL.md` — same requirement, integrated with the existing Rules 14a–14e family.
- This new entry + new Pattern 14 (below) in `CORRECTIONS_LOG.md`.

**Prevention:** Pattern 14 below formalizes the mechanical rule for future Claude sessions.

**Meta-lesson:** "Options + recommendation + reversibility" (Rule 3 in CLAUDE_CODE_STARTER) is insufficient on its own because it doesn't explicitly require per-option consequence context or an escape hatch. The user needs BOTH the information to decide AND the freedom to ask questions. A well-framed multiple-choice should feel like a menu with descriptions, not a fill-in-the-circle form.

---

### 2026-04-18 — Pattern 11 recurrence #5: session-boundary step-by-step instructions needed by non-programmer user (now a standing protocol requirement)
**Session:** session_2026-04-18_phase1g-test-kickoff (Claude Code)
**Tool/Phase affected:** Methodology / end-of-session protocol
**Severity:** High (5th recurrence of a class of issue that documentation alone has not solved)

**What happened:** At the end-of-session doc update phase, the user stated: *"please also tell me exactly what to do to end this session, how to begin the next session, exactly what to type, etc. Please also make sure the next session and every subsequent session is provided this information as well so that I am given step by step instructions on what to do next when I am at the end of sessions and in-between sessions about to start a new session."*

This is a direct reinforcement of the non-programmer rule, applied specifically to **session-boundary moments** — which the existing Pattern 11 / Rule 14a / Rule 9 framework had not sufficiently covered. The prior rules covered mid-session imperatives ("paste this file") but not end-of-session handholding (how to close, how to resume).

**Root cause:** The existing end-of-chat Personalized Handoff template in `HANDOFF_PROTOCOL.md §4 Step 4` was written for the claude.ai era (upload/download workflow). When the project migrated to Claude Code, the template wasn't updated to reflect the new workflow — and the non-programmer handholding requirement wasn't made explicit for Claude Code's session-boundary moments (close + reopen with exact terminal commands).

**How caught:** User directly, at end-of-session.

**Correction (applied this session):**
- Added a new **Step 4b — Claude Code variant of the handoff** to `HANDOFF_PROTOCOL.md §4`, with a mandatory template requiring 🚪 END-OF-SESSION INSTRUCTIONS and 🚪 NEXT-SESSION INSTRUCTIONS sections. The sections must contain exact terminal commands and exact copy-paste-ready first-message text.
- Extended Rule 15 in `CLAUDE_CODE_STARTER.md` with explicit sub-bullets requiring: "what we did," "files changed," "deferred items," "🚪 END-OF-SESSION INSTRUCTIONS," "🚪 NEXT-SESSION INSTRUCTIONS," "open questions."
- Every future Claude Code session reads `CLAUDE_CODE_STARTER.md` at start — so the requirement propagates automatically.

**Prevention — new Pattern 13 below.**

**Lesson:** Session bookends (end + next start) are exactly when a non-programmer user is at highest risk of being lost. The same mechanical rigor demanded mid-session applies at the boundaries, and the protocol must enforce this template-ly, not as a case-by-case courtesy.

**Meta-lesson (reinforces Pattern 11):** When the user has to restate a class of rule for the Nth time, document containment has failed and **mechanical enforcement at the protocol level** is required. A textual rule that Claude "should follow" is insufficient — the rule must be embedded in a REQUIRED TEMPLATE that Claude cannot produce an end-of-session handoff without filling in.

---

### 2026-04-18 — Phase 1g-test bugs: Adaptive Thinking runaway, Mode A omission failure, Vercel 5-min timeout risk
**Session:** session_2026-04-18_phase1g-test-kickoff (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Phase 1g-test
**Severity:** Medium (bugs in the tool, surfaced by the test exactly as designed; not mistakes by Claude or user)

**What happened:** First live test of Auto-Analyze against a real dataset (Bursitis Project, 2,328 keywords, model `claude-sonnet-4-6`, Server mode). Surfaced:

1. **Adaptive Thinking → 0 output tokens.** With Thinking=Adaptive and a 51k-character combined prompt, the model consumed its entire `max_tokens=128000` allocation during the silent thinking phase on all 3 attempts, emitting zero output text. Same signature each time: "Stream complete. Input: 183, Output: 0 tokens" after ~5 min wall time. Workaround: switch to Thinking=Enabled with Budget=12000; confirmed working on batch 1.

2. **Mode A (full-table) drops pre-existing topics as the table grows.** Batch 2 attempts 1 and 3 produced valid-looking responses but omitted 4–6 topics from the prior state and lost 2–8 keywords. HC5 validation caught the omissions correctly. The tool's Mode A → Mode B auto-switch did NOT trigger because that condition only fires on truncation, not on omission failures. Tool's 3-attempt retry with correction context exhausted without success; batch 2 marked FAILED, tool moved on to batch 3.

3. **Vercel 5-min timeout ceiling is close.** Batch 2 attempt 2 took 4:59 wall time and returned 0 output tokens — within 1 second of Vercel's serverless function timeout. May have been Vercel killing the stream, not the model misbehaving.

**Root cause (per-bug):**
- Bug 1: Adaptive Thinking is unbounded by design; large prompts make the model "want to think a lot"; combined with `max_tokens=128000` cap, thinking can fill the whole allocation.
- Bug 2: Full-table Mode A asks the model to re-transcribe the entire current state. As state grows, model attention degrades and rows get dropped. Known long-context generation pattern.
- Bug 3: Server-mode requests are Vercel serverless functions with a 5-min hard kill. Each batch's thinking + output needs to fit under that ceiling, and batches get slower as prompts grow.

**How caught:** Live narration by user during the test. Exactly what Phase 1g-test was designed to surface.

**Corrections applied (this session):**
- Full findings captured in `KEYWORD_CLUSTERING_ACTIVE.md` §6.5 with fix recommendations per bug
- Phase 1g-test follow-up added as top priority for next session in `ROADMAP.md`
- Phase 1-polish list expanded with: overlay resize/move, Budget input UX fix, persist AA settings to UserPreference, UI warning for Adaptive+large-prompt combo

**Prevention:** These are product bugs, not process mistakes. They're prevented in future runs by tuning defaults (Thinking=Enabled-12k as default), broadening the Mode A→B trigger, and surfacing UI hints. All logged.

---

### 2026-04-18 — Documentation drift: `kst_aa_*` localStorage keys claimed to exist, actually don't
**Session:** session_2026-04-18_phase1g-test-kickoff (Claude Code)
**Tool/Phase affected:** Documentation accuracy / Auto-Analyze
**Severity:** Medium (mid-session time loss; user blocker on what was assumed to be a recoverable prompt)

**What happened:** At start of Phase 1g-test, the user opened the Auto-Analyze panel and the Initial Prompt textarea was empty. Prior docs (`DATA_CATALOG.md` §5.8 + `KEYWORD_CLUSTERING_ACTIVE.md` §4) claimed the prompts persist in localStorage under keys `kst_aa_initial_prompt` and `kst_aa_primer_prompt`. Claude grepped the codebase and confirmed those keys **do not exist anywhere in `/src/`** (zero matches). The only AA-related localStorage key is `aa_checkpoint_{Project.id}` (and note: uses `Project.id`, not `ProjectWorkflow.id` as the docs also claimed). Settings (including prompts) live only in React component state before a run starts, and are bundled into the checkpoint only after `saveCheckpoint()` fires.

**Root cause:** Likely origin — the original legacy KST HTML (pre-Phase 0) may have used those key names. When the tool was ported to the Next.js app, the localStorage logic was simplified to only checkpoint-based persistence. The handoff docs were written with the original key names in mind and never got a Pattern-3 (code is source of truth) verification pass.

**How caught:** Claude's start-of-session grep when the empty prompt was encountered. User had assumed (based on docs) that the prompts would be auto-loaded. They had to paste both prompts manually from their own saved text files.

**Correction (applied this session):**
- `DATA_CATALOG.md` §5.8 rewritten to reflect actual behavior + explicit note that the old key names don't exist
- `DATA_CATALOG.md` §5.9 corrected to `Project.id` (was `projectWorkflowId`)
- `KEYWORD_CLUSTERING_ACTIVE.md` §4 rewritten with correction + practical UX implication
- New follow-up task: commit canonical `docs/AUTO_ANALYZE_PROMPT_V2.md` so the prompts live in the repo (not scattered across user's laptop)

**Prevention:** Pattern 3 (code is source of truth) applies. When docs assert "localStorage key X exists" or "data persists at location Y," any session that depends on that claim should verify with a grep before acting. Adding a general corollary to Pattern 7: **claims about runtime state and persistence are doc-drift risks; verify against code.**

**Meta-lesson:** Prompts (and similar artifacts required for tool operation) should live in the **repo**, not in browser localStorage that "might persist." Commit-it-or-it-didn't-happen applies to required operational content just as it does to code.

---

### 2026-04-17 — Pattern 7 recurrence: `/projects/[projectId]/page.tsx` claimed built in Ckpt 6 but never existed — discovered post-production-deploy
**Chat URL:** https://claude.ai/chat/75cc8985-b70a-49f4-8b64-444c34ef541f
**Tool/Phase affected:** Phase M / Ckpts 6, 7, 8, 9 (all silently complicit)
**Severity:** High (shipped a broken happy-path route to production; recovered same-chat with Ckpt 9.5)

**What happened:** During Ckpt 9's visual verification on vklf.com post-deploy, clicking a Project's title on `/projects` went to a 404. Diagnostic `ls` confirmed `src/app/projects/[projectId]/page.tsx` did not exist on disk. **No one had ever built it.** Despite Ckpt 6's `CHAT_REGISTRY.md` entry claiming "Two new files created: `src/app/projects/page.tsx` (~1,493 lines) and `src/app/projects/[projectId]/page.tsx` (~372 lines)" — and despite `ROADMAP.md`, `PLATFORM_ARCHITECTURE.md` §3, and `NAVIGATION_MAP.md` all asserting the file existed as a live route — the file was not in the repo at any point from Ckpt 6 onward.

This chat's Task 0 build output gave an explicit warning: `/projects/[projectId]` did NOT appear as a standalone route in the build table, only `/projects/[projectId]/keyword-clustering` did. **Claude flagged this anomaly during Task 0** and wrote: *"If you want me to verify right now that `/projects/[projectId]/page.tsx` exists on disk, I can — but it's not necessary to proceed."* The decision to defer that verification to Task 6 (post-deploy visual check) was a direct failure of Rule 3 (code is source of truth) and Pattern 7 (plan drift verification). The one-line `ls` check would have cost ~5 seconds and caught the bug pre-deploy.

**Root cause (a chain of compounding failures):**
1. **Ckpt 6 chat** (chat `7a745b12-...`) most likely wrote this file to its sandbox `/mnt/user-data/outputs/` and either (a) never told the user to place it in the repo, or (b) wrote a command referencing a sandbox-only path, or (c) the `present_files` link was missed. Whatever happened, the file never landed in the user's Codespaces.
2. **End-of-Ckpt-6 handoff docs** confidently reported the file as built — Claude couldn't verify because of the Codespaces PORTS glitch (no local visual testing possible) and didn't run `ls` to verify file existence.
3. **Ckpts 7 and 8** didn't notice — neither chat had reason to touch the detail page, and its absence was silent (Next.js routing tolerates missing `page.tsx` in a folder that has subfolder routes — it just doesn't produce a route at that level).
4. **Ckpt 9's Task 0** had the diagnostic signal (`/projects/[projectId]` missing from route table) but Claude treated it as "implicit in the nested route" and deferred investigation.
5. **Visual verification post-deploy** finally caught it, but only because the user hit the 404 directly.

**How caught:** User's visual verification on vklf.com — specifically the "clicking project title → 404" and "KC page's Back to Project → 404" reports in Task 6.

**Correction:** Fix 3 of Ckpt 9.5 — built `src/app/projects/[projectId]/page.tsx` (487 lines) from scratch this chat. Matches the pattern of the existing `keyword-clustering/page.tsx` for URL-param reading + auth + fetch + error states. Pulls Project info via `GET /api/projects/[projectId]` and workflow statuses via `GET /api/project-workflows/[projectId]` in parallel. Renders 15-card workflow grid; clicking Keyword Analysis navigates into KC; clicking others shows a coming-soon toast. Error handling: 404 = "This Project no longer exists", 403 = "You do not have access to this Project", other errors = "Could not load this Project." Committed as `fcf2373`; deployed; verified working.

**Prevention — Pattern 7 mitigation strengthened (see below).**

**Key lesson:** When build output contradicts docs, investigate immediately. Do not defer "that's interesting but probably fine" observations about build output — treat them as Pattern 3 (silent fallback to tool knowledge) triggers. The cost of a 5-second `ls` is trivial; the cost of shipping a broken happy-path to production is substantial (requires visual verification to catch, requires follow-up fix deploy, erodes user trust in doc claims).

**Meta-lesson:** The handoff doc system's greatest weakness is that it trusts what prior chats reported. When four consecutive chats all say "it's built," it feels pedantic to doubt them. But "built" has to mean "verifiable on disk," not "was written to sandbox and claimed to be installed." Any chat working on files that originated in a prior chat's `/mnt/user-data/outputs/` should verify existence with `find` or `ls` as a first step. This is a corollary to Rule 3 and Pattern 7 that deserves its own naming — perhaps a future refinement to Pattern 7's wording in a subsequent chat.

---

### 2026-04-17 — `sed | tr` quoting pattern failed on first `git rm` batch; switched to `xargs -d '\n'`
**Chat URL:** https://claude.ai/chat/75cc8985-b70a-49f4-8b64-444c34ef541f
**Tool/Phase affected:** Methodology / Ckpt 9 cleanup
**Severity:** Low (caught immediately via error output; trivial retry)

**What happened:** During Ckpt 9 Task 3A (deleting 40 committed `.bak` files via `git rm`), Claude's command wrapped file paths in literal double-quotes via `sed 's/.*/"&"/'` and joined with `tr '\n' ' '`, then fed them to `git rm` through `$(...)`. The intent was to safely escape paths containing `[projectId]` brackets. But bash's word-splitting passed each quoted string as an argument WITH the quote characters still present as literals. git saw `"src/app/api/admin-notes/[noteId]/route.ts.bak"` (quote-as-character) as a pathspec, which doesn't match any file. Error: `fatal: pathspec '"src/app/...route.ts.bak"' did not match any files`.

**Root cause:** Overthought the quoting. `git rm` doesn't need brackets quoted — git's pathspec parser handles `[` and `]` as literals. The `sed` wrap added poisonous literal quotes. Should have tested the pattern in Claude's sandbox before giving it to the user.

**How caught:** Claude's own shell chain `&&` stopped execution after the error; user saw the error immediately in the output and reported it without damage.

**Correction:** Retried with `git ls-files | grep '\.bak' | xargs -d '\n' git rm`. The `xargs -d '\n'` reads one path per line and passes each as a clean argument — no quoting needed. Worked first try. All 40 files removed cleanly.

**Prevention — rule update:**
- **For passing file lists to git commands (or any command), default to `xargs -d '\n'`** rather than inventing shell-quoting schemes.
- **Test complex shell one-liners in Claude's sandbox before giving them to the user.** Claude has `bash_tool` access in the sandbox — use it for dry-runs of quoting-heavy patterns before shipping the command to the user's terminal.

**Meta-lesson:** The "clever one-liner" reflex in shell scripting is the enemy. Boring, well-trodden idioms (`xargs -d '\n'`, `read` loops) are more reliable than bespoke `sed` pipelines, even when they look more verbose.

---

### 2026-04-17 — /docs/ folder had 3 empty subfolders from April 6 that weren't in any Group A doc
**Chat URL:** https://claude.ai/chat/75cc8985-b70a-49f4-8b64-444c34ef541f
**Tool/Phase affected:** Repo state / Ckpt 9 `/docs/` setup
**Severity:** Low (inspection caught it, handled cleanly, no damage)

**What happened:** When Ckpt 9's Task 2 ran its initial repo-state inspection, `ls docs/` returned three empty subfolders: `docs/legacy/`, `docs/primers/`, `docs/workflows/` — existing since April 6 (before Phase D documentation overhaul), never populated, never tracked in git (git doesn't track empty folders). No Group A doc mentioned their existence. Ckpt 9's briefing assumed `/docs/` didn't exist and would be created fresh.

**How caught:** Claude's `ls docs/` during the drift check. Immediately flagged as a discrepancy, investigated via follow-up inspection command, confirmed empty, proposed clean deletion, user approved.

**Correction:** All three subfolders deleted by Ckpt 9's setup script. `/docs/` is now cleanly populated with 15 handoff docs, zero stale subfolders.

**Prevention:** Start-of-chat drift check in HANDOFF_PROTOCOL §2 already covers "verify code/repo state against doc claims" — this is a specific instance. No rule change needed, but worth logging as a reminder that **repo state can contain silent leftovers that aren't in any doc** — empty folders, dangling configs, old CI files, etc. The reflex to ignore "empty" things is wrong; empty is still state.

**Meta-lesson:** When the drift check surfaces an unexplained repo artifact, chase it to a known answer rather than defaulting to "probably nothing." The cost is a single `find` or `ls` command.

---

**Chat URL:** https://claude.ai/chat/fc8025bf-551a-4b3c-8483-ec6d8ed9e33c
**Tool/Phase affected:** Methodology / Entire project execution going forward
**Severity:** Informational (not a mistake — a strategic decision captured in the log so future Claudes understand the lineage)

**What happened:** After Phase M Ckpt 8 complete, the user asked whether the claude.ai copy-paste round-trip cost could be automated. Claude explained Claude Code (Anthropic's CLI tool that runs inside Codespaces, reads files directly, executes commands itself) as the answer. User confirmed cost is not a constraint and asked for the best methodology. Claude recommended migration to Claude Code for Phase 1g-test and all subsequent work.

User decided:
- **Timing:** Finish Phase M Ckpt 9 in claude.ai (safer — the highest-stakes deploy step stays in the known-good tool), THEN migrate to Claude Code for Phase 1g-test kickoff.
- **Scope:** TOP PRIORITY post-Ckpt-9 roadmap item.
- **Docs location:** `/docs/` at repo root (Option X) — gives Ckpt 9's legacy-location cleanup a proper home AND sets up Claude Code's filesystem access.

**Root cause (why the switch is happening):** Two drivers:
1. **Round-trip cost.** Every command in claude.ai requires user paste-in → output paste-back. Ckpt 8 had 20+ such round-trips. This fatigues the user and multiplies the chance of transcription errors.
2. **Pattern 11 recurrence.** The non-programmer rule has had to be re-stated by the user manually in 4 consecutive chats despite documentation escalation. The architectural cause — Claude in claude.ai cannot run commands itself, so is constantly asking the user to do things — partially disappears in Claude Code where Claude has direct execution.

**How caught:** Not a "catch" — proactive question from the user during end-of-chat wrap-up.

**Correction:** New Group A doc `CLAUDE_CODE_MIGRATION.md` (#13) produced this chat. New starter-prompt file `CLAUDE_CODE_STARTER.md` produced this chat. Updates made to: `ROADMAP.md` (Ckpt 9 scope expanded to include `/docs/` setup; migration added as top-priority post-Ckpt-9 item), `HANDOFF_PROTOCOL.md` (new §9 on Claude Code vs. claude.ai applicability), `DOCUMENTATION_ARCHITECTURE.md` (new §15 on doc system evolution), `NEW_CHAT_PROMPT.md` (Ckpt 9 objective includes /docs/ setup; post-Ckpt-9 section flags migration readiness), `DOCUMENT_MANIFEST.md` (Group A count → 13).

**Prevention:** N/A — this isn't a failure pattern. But the decision is logged here so:
- Future Claude Code sessions can reference this entry to understand WHY the project switched tools
- If the switch causes unforeseen issues, the rollback criteria are captured (see `CLAUDE_CODE_MIGRATION.md` §8)
- If the switch succeeds (expected), this entry becomes historical context

**Lesson for future methodology changes:** Don't switch tools and take on high-stakes work simultaneously. Phase M Ckpt 9 (deploy) stays in the known-good tool; the switch happens at a natural boundary (start of Phase 1g-test). Low-risk transition.

**Meta-lesson:** User's proactive question about automation was GOOD — exactly the kind of zoom-out the doc system has been encouraging. Rewarded with a strategic improvement.

---

### 2026-04-17 — Asked user to "paste the file" without a concrete command — Pattern 11 recurrence mid-chat (FOURTH consecutive chat)
**Chat URL:** https://claude.ai/chat/fc8025bf-551a-4b3c-8483-ec6d8ed9e33c
**Tool/Phase affected:** Methodology / Phase M Checkpoint 8 execution
**Severity:** High (Pattern 11 recurrence — now FOURTH consecutive chat where user had to manually enforce the non-programmer rule despite heavy documentation)

**What happened:** After the user answered the card-click design question and Option A was locked in, Claude needed to read two files from the user's repo (`src/app/dashboard/page.tsx` and `src/app/plos/page.tsx`) to draft the edit plan. Claude asked: *"Could you paste the contents of each, or if they're long, just paste them and I'll read through carefully?"* and *"You don't need to upload them as files — just paste the contents in your next message."*

The user (correctly) called this out: *"Please note that I am a complete novice and will need you to either give me terminal commands or walk me step by step through everything you want me to do. This problem seems to keep lingering despite having not only instructed you so in every chat we've had but also asking you to make increasingly stringent rules..."*

The mistake: "paste the file" treats "opening a file and copying its contents" as a trivial action — which for a programmer, it is (Cmd-click, select-all, copy, paste). For a non-programmer it's ambiguous: which editor? How do I select all? What if it's a huge file? Claude's mental model silently assumed the user would know the mechanics, even though Pattern 11 explicitly calls out this class of slip as a structural problem with LLM attention.

**Root cause:** This is the Pattern 11 meta-pattern in action AGAIN. The rules exist (HANDOFF_PROTOCOL Rules 14a–14e, the big NEW_CHAT_PROMPT banner, this log's Pattern 11 entry). Claude read them at start-of-chat, ran the Read-It-Back test on the decision question about card-click behavior (that one passed), then let the test slip for a subsequent "paste the file" request because it felt too banal to run the test on. The Read-It-Back test was being applied to **questions framed as decisions**, not to **instructions framed as tasks**. That's the gap.

Every instruction Claude gives — whether a decision question or a "please do X" request — must pass the same non-programmer-readable test. "Paste the file" fails. "Paste this command into your terminal and send me the output" passes.

**How caught:** User directly, at turn ~8 in the chat, with explicit reference to the recurring nature of the problem.

**Correction:**
- Acknowledged the recurrence openly, including acknowledging that Pattern 11 was already logged and documentation had been amped up in the prior chat — the slip happened anyway
- Gave the user a concrete terminal command (`cat src/app/pms/notes/page.tsx && head -60 src/components/AdminNotes.tsx`) that solved the original need
- Explicitly committed in-chat: *"Going forward in this chat, I'll hold myself to that. If I slip again, call it out."*
- No further slips occurred in the remaining steps (heredoc-based Python edit scripts were all delivered as ready-to-paste commands with verification output blocks)

**Prevention:**
- **Extended Rule 14a scope.** The Read-It-Back test isn't just for "decision questions" — it's for **every instruction Claude gives the user, including data-gathering requests, build commands, and "please share X" requests**. Any ask that would require the user to do something with a file, a keyboard, a browser, or a mouse must come with an exact terminal command or a numbered click-path. "Paste the contents" / "share the file" / "upload your code" / "show me your config" are all forms of the same slip.
- **New rule in spirit:** the phrase "paste it in" is a forbidden instruction unless it's followed immediately by "by running this command" or "by doing these clicks in this order."
- **Mechanical test addition:** Before sending any message that asks the user to do something, Claude scans the message for any imperative verb ("paste," "share," "upload," "show me," "send me," "give me," "look up") and confirms each one is paired with a concrete method (a terminal command, a click-sequence, an ask_user_input_v0 tool call). If any imperative verb is orphaned, rewrite.
- **Pattern 11 update:** The recurrence count is now FOUR chats. The fact that documentation was substantially escalated between Ckpt 7 and this chat — and the slip happened anyway — confirms the Pattern 11 diagnosis that this is a visibility-under-load issue that documentation alone cannot fully solve. The fix is mechanical habit reinforcement every single instruction, not just "more emphasis in docs." See updated Pattern 11 below.

**Lesson:** The Read-It-Back test is easy to run on obvious questions and easy to skip on banal requests. The slip happens in the small requests, not the big ones. Mechanical tests must cover the whole surface, not just the decision questions.

**Meta-lesson for future Claudes:** When the user's cognitive cost of completing your request exceeds the cognitive cost of you figuring out the command to pre-empt their work, you've failed the non-programmer rule. Always pre-empt.

---

### 2026-04-17 — Pre-existing .bak/untracked files in git status handled via Option A clean split (procedural pattern — NOT a mistake, but a pattern future chats need to apply)
**Chat URL:** https://claude.ai/chat/fc8025bf-551a-4b3c-8483-ec6d8ed9e33c
**Tool/Phase affected:** Methodology / Phase M commit hygiene
**Severity:** Informational (not a mistake — a procedural pattern being formalized)

**What happened:** During Ckpt 8's commit step, Claude ran `git add -A` expecting to stage only the 7 files from this chat's work. Instead, `git status` showed 20 staged files — the 7 from this chat plus 13 pre-existing files from prior Phase M chats (Ckpts 1–5):
- `prisma/schema.prisma.bak` (from Ckpts 1–4 schema refactor)
- Nine `.bak` files in `src/app/api/projects/[projectId]/` (from Ckpt 5 API route rewrite)
- `src/lib/auth.ts.bak` (from Ckpt 5)
- `src/app/HANDOFF.md` and `src/app/ROADMAP.md` (legacy in-repo docs, modified at some point but never committed; slated for relocation/deletion in Ckpt 9)

These 13 files had been sitting untracked/unstaged in the user's repo across Ckpts 5, 6, and 7 — each prior chat had correctly committed only its own work and left them. Claude's `git add -A` swept them in accidentally.

**Root cause:** `git add -A` is a broad brush. It correctly stages everything in the working tree, including pre-existing untracked/modified files the current chat did not touch. A more surgical approach — `git add <specific paths>` — would have avoided the issue but adds per-chat ceremony.

**How caught:** Claude noticed the mismatch on its own before committing (the staged file list did not match the expected 7-file list from the plan) and surfaced the issue to the user. User chose **Option A (clean split)** from 3 offered options, unstaged the 13 leftovers, and committed only the 7 chat-specific files.

**Correction:** Unstaged 13 files via `git reset HEAD <paths>`. Committed only the 7 chat-specific files as `ac62a3a "Phase M Ckpt 8: ..."`. Branch is now 4 commits ahead of origin/main (was 3 before).

**Prevention — PROCEDURAL PATTERN (read this, future chats):**

**Every Phase M chat until Ckpt 9 MUST follow this procedure when committing work:**

1. After making its own file changes, Claude runs `git status` and explicitly lists which files the current chat touched vs. which are pre-existing leftovers.
2. The staged set (`git add`) MUST contain ONLY the current chat's files. Use specific paths, not `git add -A`.
3. If `git add -A` is used by mistake (or the user suggests it), Claude must run `git status` afterwards, identify leftovers, and unstage them with `git reset HEAD <paths>` before committing.
4. Leftovers are **not deleted** — they stay in the working tree for Ckpt 9 to handle properly.

**The canonical inventory of pre-existing leftovers (as of end of Ckpt 8):**

```
prisma/schema.prisma.bak
src/app/HANDOFF.md                                                    (modified, not committed)
src/app/ROADMAP.md                                                    (modified, not committed)
src/app/api/projects/route.ts.bak
src/app/api/projects/[projectId]/route.ts.bak
src/app/api/projects/[projectId]/canvas/route.ts.bak
src/app/api/projects/[projectId]/canvas/nodes/route.ts.bak
src/app/api/projects/[projectId]/canvas/pathways/route.ts.bak
src/app/api/projects/[projectId]/canvas/rebuild/route.ts.bak
src/app/api/projects/[projectId]/canvas/sister-links/route.ts.bak
src/app/api/projects/[projectId]/keywords/route.ts.bak
src/app/api/projects/[projectId]/keywords/[keywordId]/route.ts.bak
src/lib/auth.ts.bak
```

**13 total. Plus whatever `.bak` files arise from subsequent chats (e.g., `src/app/dashboard/page.tsx.bak` and `src/app/plos/page.tsx.bak` are now committed as of Ckpt 8; future chats may add more alongside their own edits).**

**Ckpt 9's cleanup scope includes all of the above** — per ROADMAP.md Ckpt 9 section and PLATFORM_ARCHITECTURE.md §10 Known Technical Debt.

**Lesson:** A clean commit stack is load-bearing for future legibility. `git log` must read as "Ckpt 5 did X, Ckpt 6 did Y, Ckpt 7 did Z, Ckpt 8 did W" — not "Ckpt 8 did W and also swept up a bunch of leftovers from three chats ago." The one-time cost of the Option A unstaging dance is worth the clarity.

---


**Chat URL:** https://claude.ai/chat/7e0b8456-b925-4460-a583-d348d1c965bf
**Tool/Phase affected:** Methodology / Phase M Checkpoint 7 execution
**Severity:** Low (caught immediately, no damage)

**What happened:** During Step 4 of the Checkpoint 7 execution, Claude told the user to run the command `mv /mnt/user-data/outputs/page.tsx "src/app/projects/[projectId]/keyword-clustering/page.tsx"` to install the new page file. The path `/mnt/user-data/outputs/` only exists inside Claude's own sandbox environment — not in the user's GitHub Codespaces. The `mv` command failed with "cannot stat: No such file or directory."

The user responded constructively with "Please tell me where exactly I need to add this file..." rather than trying to debug the broken command. Claude immediately pivoted to two clear alternatives (Codespaces file-explorer vs. terminal heredoc) and the problem was resolved in the next turn.

**Root cause:** Claude used the `create_file` tool to write the file to `/home/claude/page.tsx`, then used `present_files` to copy it to `/mnt/user-data/outputs/page.tsx` (Claude's output directory). Claude then constructed a `mv` command using the `/mnt/user-data/outputs/` path — which is Claude's environment's download origin, NOT a path visible to the user's terminal. Classic "sandbox path leak" — confusing Claude's environment paths with the user's environment paths.

The user's Codespaces terminal has no knowledge of `/mnt/user-data/outputs/`. It only sees the repo at `/workspaces/brand-operations-hub/`. For the user, a file created on Claude's side needs to be either (a) pasted into Codespaces' file explorer, or (b) created in the user's terminal via heredoc (`cat > ... << EOF`), or (c) downloaded by the user from the chat interface and then manually moved.

**How caught:** User — immediately, within one turn, without debugging time wasted.

**Correction:**
- Acknowledged the mistake openly in the next message
- Offered two clear alternatives: Codespaces file-explorer (Option A) and terminal heredoc (Option B)
- When Option A's shortcut (`../page.tsx` trick) didn't work in the user's version of Codespaces, pivoted smoothly to Option B
- File was installed successfully via `cat > ... << 'CLAUDE_EOF_MARKER'` heredoc pattern
- Line count verification (164 lines) confirmed nothing was lost in the copy-paste

**Prevention:**
- **Mental rule for future Claudes:** When generating a terminal command for the user, NEVER reference any path starting with `/mnt/`, `/home/claude/`, or any other Claude-sandbox path. The user's terminal operates only inside `/workspaces/brand-operations-hub/`.
- **Default method for delivering file content to the user's repo:** For small-to-medium files (under ~200 lines), use the heredoc `cat > "path" << 'MARKER' ... MARKER` pattern — the file content is embedded directly in the command, so no cross-environment path issue. For larger files, paste the content into a code block and have the user paste it into Codespaces' file-explorer New File flow.
- **If Claude has used `present_files` to produce a downloadable file:** That file is for the user's download button in the chat UI, not for terminal `mv`. Claude should not mention the `/mnt/user-data/outputs/` path to the user.
- **Pattern 12 added below** to capture the general rule.

**Lesson:** Claude has two environments (its own sandbox + the user's Codespaces) with different filesystems. Every command Claude gives the user must use ONLY paths that exist in the user's environment. Claude's own paths are internal plumbing and must not appear in user-facing commands.

---

### 2026-04-17 — Gave user a terminal command with a sandbox-only path
**Chat URL:** https://claude.ai/chat/7e0b8456-b925-4460-a583-d348d1c965bf
**Tool/Phase affected:** Methodology / Phase M Checkpoint 7 execution
**Severity:** Low (caught immediately, no damage)

**What happened:** During Step 4 of the Checkpoint 7 execution, Claude told the user to run the command `mv /mnt/user-data/outputs/page.tsx "src/app/projects/[projectId]/keyword-clustering/page.tsx"` to install the new page file. The path `/mnt/user-data/outputs/` only exists inside Claude's own sandbox environment — not in the user's GitHub Codespaces. The `mv` command failed with "cannot stat: No such file or directory."

The user responded constructively with "Please tell me where exactly I need to add this file..." rather than trying to debug the broken command. Claude immediately pivoted to two clear alternatives (Codespaces file-explorer vs. terminal heredoc) and the problem was resolved in the next turn.

**Root cause:** Claude used the `create_file` tool to write the file to `/home/claude/page.tsx`, then used `present_files` to copy it to `/mnt/user-data/outputs/page.tsx` (Claude's output directory). Claude then constructed a `mv` command using the `/mnt/user-data/outputs/` path — which is Claude's environment's download origin, NOT a path visible to the user's terminal. Classic "sandbox path leak" — confusing Claude's environment paths with the user's environment paths.

The user's Codespaces terminal has no knowledge of `/mnt/user-data/outputs/`. It only sees the repo at `/workspaces/brand-operations-hub/`. For the user, a file created on Claude's side needs to be either (a) pasted into Codespaces' file explorer, or (b) created in the user's terminal via heredoc (`cat > ... << EOF`), or (c) downloaded by the user from the chat interface and then manually moved.

**How caught:** User — immediately, within one turn, without debugging time wasted.

**Correction:**
- Acknowledged the mistake openly in the next message
- Offered two clear alternatives: Codespaces file-explorer (Option A) and terminal heredoc (Option B)
- When Option A's shortcut (`../page.tsx` trick) didn't work in the user's version of Codespaces, pivoted smoothly to Option B
- File was installed successfully via `cat > ... << 'CLAUDE_EOF_MARKER'` heredoc pattern
- Line count verification (164 lines) confirmed nothing was lost in the copy-paste

**Prevention:**
- **Mental rule for future Claudes:** When generating a terminal command for the user, NEVER reference any path starting with `/mnt/`, `/home/claude/`, or any other Claude-sandbox path. The user's terminal operates only inside `/workspaces/brand-operations-hub/`.
- **Default method for delivering file content to the user's repo:** For small-to-medium files (under ~200 lines), use the heredoc `cat > "path" << 'MARKER' ... MARKER` pattern — the file content is embedded directly in the command, so no cross-environment path issue. For larger files, paste the content into a code block and have the user paste it into Codespaces' file-explorer New File flow.
- **If Claude has used `present_files` to produce a downloadable file:** That file is for the user's download button in the chat UI, not for terminal `mv`. Claude should not mention the `/mnt/user-data/outputs/` path to the user.
- **Pattern 12 added below** to capture the general rule.

**Lesson:** Claude has two environments (its own sandbox + the user's Codespaces) with different filesystems. Every command Claude gives the user must use ONLY paths that exist in the user's environment. Claude's own paths are internal plumbing and must not appear in user-facing commands.

---

### 2026-04-17 — User had to repeat "I'm a non-programmer, use plain language" — THIRD consecutive chat
**Chat URL:** https://claude.ai/chat/7a745b12-efdf-4adf-a2b4-bf11716f971b
**Tool/Phase affected:** Methodology / Start-of-chat protocol
**Severity:** High (recurring — same class of issue repeatedly caught by user)

**What happened:** On the user's second message of the chat, the user had to explicitly state: "I am a complete novice and not a programmer so you will have to refrain from using technical language. [...] this was explicitly mentioned to you in many past chats but I've had to repeat this in every chat despite asking you to include a note to this effect in the handoff instructions you provide at the end of the chat so that this issue does not reappear in any future chats."

The user was not reacting to a specific jargon incident in this chat — they were pre-empting, because experience across multiple prior chats had taught them that future Claudes would need this reminder regardless of what was in the docs. The reminder itself has been documented in: `HANDOFF_PROTOCOL.md` Rules 14–14e, `PROJECT_CONTEXT.md` §13, `NEW_CHAT_PROMPT.md` opening paragraphs, and `CORRECTIONS_LOG.md` Pattern 8.

**Root cause:** This is a META-pattern — the rules exist, they're prominent, but Claudes still slip mid-chat under cognitive load. The rules live in documents that Claude reads at start-of-chat, but by turn 15+, the most recent turns dominate attention and the plain-language discipline slowly degrades. The "Read It Back" mechanical test (Rule 14a) only helps if Claude runs it on every question; under load, it gets skipped.

Additionally: past end-of-chat handoffs have presumably included some version of "please be careful about technical language" in the next-chat instructions, but clearly not prominently enough, because the user has had to repeat the instruction by hand in each new chat.

**How caught:** User caught directly at turn 2 — pre-emptively.

**Correction:**
- Acknowledged the recurrence openly to the user rather than minimizing or promising to "try harder"
- Explained honestly WHY the slip keeps happening (recent-turn dominance, mechanical test skipping under load)
- Committed to three concrete fixes for the next chat: (1) add a prominent top-of-file communication banner to `NEW_CHAT_PROMPT.md` so it's the FIRST thing Claude reads, not buried in paragraph 4; (2) log this recurrence as a meta-pattern in CORRECTIONS_LOG (this entry); (3) add a mandatory bullet to the Personalized Handoff Message template flagging the recurrence

**Prevention:**
- **New: Top-of-`NEW_CHAT_PROMPT.md` banner** with loud, visual formatting stating the user has had to repeat this instruction in multiple chats and that mechanical discipline (Rules 14a–14e) is non-negotiable. See the updated `NEW_CHAT_PROMPT.md` for the exact wording.
- **Pattern 11 (below)** formalizes this as a meta-pattern: when an instruction has to be repeated by the user for ≥3 chats, the documentation containment is insufficient and the instruction needs to be escalated in visibility (moved higher in the docs, repeated in more places, given mechanical enforcement).
- **Claude's internal discipline check:** before sending any question to the user, read it back looking for any word that would require domain/programming knowledge. If found, rewrite. This has been Rule 14a since mid-April; compliance has been uneven.

**Lesson:** Documentation is necessary but insufficient for preventing communication-discipline slips. The slip is partially a product of how LLMs work (recent attention > distant attention), which means no amount of rule-writing fully solves it. What helps: (1) putting the reminder in the MOST attention-grabbing position in the most-read doc, (2) making the reminder visually impossible to miss, (3) repeating it in more than one doc, (4) having the user call it out early so mid-chat attention weighting keeps it fresh.

**Meta-lesson:** When the same instruction has been necessary in multiple chats AND was already in the docs — the problem is not that Claude doesn't know it. The problem is visibility-under-load. Fix that, not the knowledge.

---

### 2026-04-17 — Buried the search-box feature in a one-liner at the bottom of the recap
**Chat URL:** https://claude.ai/chat/7a745b12-efdf-4adf-a2b4-bf11716f971b
**Tool/Phase affected:** `/projects` page design (Phase M Ckpt 6)
**Severity:** Low (caught immediately by user asking for the already-planned feature)

**What happened:** After the 4 product decisions were locked in, Claude produced a "Recap — the full `/projects` page design" section. The 4 decisions + the 2 previously-locked decisions from the prior chat were in a clear numbered table. The 3 scale-aware features (search bar, filter controls, sort controls) were appended below the table as a 3-bullet list with no framing.

The user responded by submitting a feature request: "can you add a search box at the top." The search box was already in the plan — literally one of the three bullets — but the user hadn't seen it because it was positioned as supporting info rather than part of the design.

**Root cause:** When summarizing design decisions, Claude gave prominent visual weight to the things the user had just decided (the 4 decisions + 2 prior ones) and less weight to things that Claude had already incorporated autonomously (search, filter, sort). From Claude's perspective these were "obvious" additions to a scale-aware list page. From the user's perspective, everything in the design needed equal visibility since they couldn't be expected to remember what Claude planned to build automatically.

**How caught:** User directly, via the feature request (which Claude correctly identified as already-in-scope).

**Correction:** Pointed user to the bullet, confirmed search was already included, proceeded with build.

**Prevention:** Added new bullet to `NEW_CHAT_PROMPT.md` critical-communication-rules: "Equal visual weight in design recaps — when summarizing a design, features Claude added autonomously get the SAME prominent framing as features the user explicitly decided." Future design recaps should treat all features equally in visual weight — no demotion of autonomous additions to "supporting info" status.

**Lesson:** The user can't distinguish between "things I decided" and "things Claude added automatically" unless Claude structures the recap to show them with equal weight. Recaps are for the user, not for Claude's own bookkeeping.

---

### 2026-04-17 — Did not proactively flag the local-storage-vs-database distinction for Dashboard card edits
**Chat URL:** https://claude.ai/chat/7a745b12-efdf-4adf-a2b4-bf11716f971b
**Tool/Phase affected:** Dashboard card edit pencils / data persistence design
**Severity:** Medium (missed an important product-decision moment)

**What happened:** User asked how to remove the edit pencils from the Dashboard system cards. Claude answered literally and gave instructions for removing them. The user had to re-engage with a follow-up asking why the edits needed to be removed — which forced Claude to surface the real underlying problem: edits were saving only to the user's own browser (localStorage), not to the database. In a multi-user future (Phase 2+), this means every worker would see a different name for the "PLOS" card depending on which browser they happened to be using, and would never see admin's edits.

**Root cause:** Claude treated the "remove edit pencils" request as a UI decision when it was actually a data-persistence decision. Claude should have recognized that the user's concern about "do I even want to edit these" was downstream of a concern that wasn't yet explicit: the edits don't actually do what they appear to do in a multi-user setting.

**How caught:** User, by asking "why are we removing them?" when Claude proposed removal.

**Correction:** Surfaced the real issue, presented three options (keep as-is, remove, migrate to DB), user chose to defer to Phase 2 rather than band-aid now. Added roadmap item: "Migrate card-label edits (3 system cards + 14 workflow cards) from local storage to database."

**Prevention:** Added to `NEW_CHAT_PROMPT.md` critical-communication-rules: "Persistence decisions need explicit framing — when data will save to local storage vs. database, explain in plain terms what that means for the user (syncs across devices? visible to workers? survives cache clears?). Never bury this as a parenthetical."

**Lesson:** Data persistence is a product decision, not an implementation detail. The difference between localStorage and database is user-visible (per-device vs. shared, transient vs. durable). Every persistence choice should be surfaced to the user at design time, not assumed.

---

### 2026-04-17 — Initially acted as if Claude had direct repo access when it didn't
**Chat URL:** https://claude.ai/chat/7a745b12-efdf-4adf-a2b4-bf11716f971b
**Tool/Phase affected:** `/projects` page build (Phase M Ckpt 6) — step "read existing pages to understand visual vocabulary"
**Severity:** Low (caught immediately)

**What happened:** When Claude wanted to examine `/dashboard` and `/plos` to match visual style, it initially spoke as if it could look at the files directly — "let me pull up the Dashboard file..." — instead of asking the user to share the relevant code.

**Root cause:** Conflation between Claude's own file-viewing tools (which access Claude's sandbox, not the user's repo) and the user's repo (which Claude cannot access without user mediation).

**How caught:** Claude self-corrected within one message.

**Correction:** Asked user to paste the relevant sections. (Same class of mistake as the sandbox-path leak 2026-04-17 above.)

**Prevention:** **Pattern 12 below** formalizes this as a general rule.

---

### 2026-04-17 — Platform architectural reveal forced mid-chat pivot (Ckpt 6 → PLATFORM_REQUIREMENTS creation)
**Chat URL:** https://claude.ai/chat/cc15409c-5000-4f4f-a5ce-a42784b5a94f
**Tool/Phase affected:** Platform / Entire handoff system
**Severity:** High (prevented rework; would have been Critical if caught later)

**What happened:** During Ckpt 6's Decision 2 (card at-rest content), Claude asked a scale-context question — "thinking ahead, roughly how many Projects do you imagine being in-flight simultaneously once this is fully in use?" The user's answer — "500 Projects per week, ramping to 5,000 — with 50 concurrent workers" — revealed that Claude had been designing the platform for a fundamentally different scale (one-admin-one-dashboard) than the actual target (multi-worker production floor). Ckpt 6 design was mid-flight and would have shipped as small-scale UX. Chat pivoted: paused Ckpt 6, conducted platform-wide interview, created `PLATFORM_REQUIREMENTS.md`, updated multiple Group A docs.

**Root cause:** Claude never asked about operational scale until mid-build. The existing handoff docs did not capture scale targets, user model, concurrency, review cycle, or audit — all of which are platform-level facts that shape every workflow design. The Ckpt 6 design was proceeding on an implicit assumption (small-Project-count admin UI) that was never validated.

**How caught:** Claude's own scale-context question during decision-framing (a Rule 16 zoom-out instinct, deployed too late to be fully preventive but early enough to avoid rework).

**Correction:** Paused Ckpt 6. Conducted 5-cluster platform interview. Created PLATFORM_REQUIREMENTS.md. Updated PROJECT_CONTEXT, PLATFORM_ARCHITECTURE, DATA_CATALOG, ROADMAP, DOCUMENTATION_ARCHITECTURE, HANDOFF_PROTOCOL.

**Prevention:**
- **New Rule 18 in HANDOFF_PROTOCOL** — mandatory Workflow Requirements Interview before any new workflow build
- **New Rule 19 in HANDOFF_PROTOCOL** — Platform-Truths Audit at end of every interview
- **Pattern 9 below** — platform-level requirements need their own dedicated doc
- Going forward, Phase 1 work happens under known scale context. Phase 2 scaffold design happens with the interview pattern locked in.

**Meta-lesson:** Scale context is a platform-level truth that should be asked about in chat #1 of every new phase. It's not a workflow-specific detail.

---

### 2026-04-17 — Generalized from N=1 when discussing workflow architecture
**Chat URL:** https://claude.ai/chat/cc15409c-5000-4f4f-a5ce-a42784b5a94f
**Tool/Phase affected:** Methodology / Workflow Requirements Interview design
**Severity:** Medium (caught by user, would have led to over-engineering)

**What happened:** During the interview, Claude began speculating about what "most of the 13 upcoming workflows" would need based on patterns inferred from Keyword Clustering's complexity. User gently corrected: Keyword Clustering is an outlier, not a template — most of the other 13 workflows are closer to "structured form + file upload + review" than to a canvas application.

**Root cause:** Claude had one reference point (Keyword Clustering) and extrapolated from it. Classic N=1 generalization.

**How caught:** User directly.

**Correction:** Rethought the Shared Workflow-Tool Scaffold concept from scratch — not "what KC needs minus its canvas" but "what a simple form-and-review workflow needs, with KC being a special case that gets grandfathered in."

**Prevention:**
- **Pattern 10 below** — when designing shared infrastructure from one reference point, actively search for the inverse case rather than extrapolating
- Workflow Requirements Interview's Question 14 (scaffold fit) asks directly whether the workflow is a standard case or a special case
- The scaffold will be designed BEFORE workflow #2, not during it, so it's not biased by whichever workflow happens to be built second

---

### 2026-04-17 — Initial read of uploaded docs was too shallow
**Chat URL:** https://claude.ai/chat/cc15409c-5000-4f4f-a5ce-a42784b5a94f
**Tool/Phase affected:** Start-of-chat protocol
**Severity:** Low (caught before any work based on the skim)

**What happened:** When the chat started, the Pre-Flight Drift Check summary was based on header/section scanning of several long docs (particularly PROJECT_CONTEXT, PLATFORM_ARCHITECTURE) rather than end-to-end reading. Claude would have started design work with an incomplete picture if the scale reveal hadn't happened.

**Root cause:** Skipping parts of long docs ("I've got the gist") is tempting when the doc appears well-organized. It's false economy — the details missed often contain the constraints that shape the whole design.

**How caught:** Unclear if Claude self-corrected or user prompted more thorough reading.

**Correction:** Fully re-read all Group A docs before proceeding with platform interview.

**Prevention:** Added to `NEW_CHAT_PROMPT.md` MANDATORY START-OF-CHAT SEQUENCE Step 1: "End-to-end, not by section samples. Any doc with `< truncated lines N-M >` markers must be fully viewed with explicit range calls." Future chats: when a doc has truncation markers, explicitly view the truncated range.

---

_[Earlier entries preserved from prior chats — see file history for entries from 2026-04-16, etc.]_

---

## Patterns (meta-level rules extracted from multiple entries)

### Pattern 1 — Documentation gaps at shared state
Described in 2026-04-16 entries: when data crosses tool boundaries, the sharing contract must be documented in both places.

### Pattern 2 — Navigation assumptions
Described in 2026-04-16 entry: never invent a click path; always verify with code or user.

### Pattern 3 — Silent fallback to tool knowledge
Described in 2026-04-16 entry: when Claude's docs knowledge conflicts with code, trust the code.

### Pattern 4 — Incomplete verification before claiming done
Described in prior entries: "tests pass" means running tests, not inferring their outcome.

### Pattern 5 — Deploy without visual check
Described in prior entries: deploys are not confirmed until the user sees the live site.

### Pattern 6 — Schema drift across docs
Described in 2026-04-16 entry: when schema changes, every doc that references the old shape must be updated in the same chat.

### Pattern 7 — Plan drift between chats (UPDATED 2026-04-17 — serious recurrence in Ckpt 9)
Described originally in 2026-04-17 (Ckpt 5) entry and reinforced in 2026-04-17 (Ckpt 9) entry "Pattern 7 recurrence: `/projects/[projectId]/page.tsx` claimed built in Ckpt 6 but never existed — discovered post-production-deploy."

Plans are a snapshot; actual file listings may differ by the time the next chat runs the plan. **Originally-stated mitigation:** "Always verify file lists with `find`/`ls` before executing multi-file plans."

**Post-Ckpt-9 update (critical):** The original mitigation is insufficient. In Ckpt 9, a file that 4 consecutive prior chats claimed to have built (`/projects/[projectId]/page.tsx`) was never actually on disk. The file was probably written to a prior Claude's sandbox and claimed-as-installed but never landed in the user's Codespaces. Four chats' worth of handoff docs confidently asserted its existence. Only production-deploy visual verification caught it.

**Strengthened mitigation (applies to every future chat):**

1. **Any file that originated in a prior chat's `/mnt/user-data/outputs/` must be verified-present in the user's repo at the start of any chat that depends on it.** A single `ls` or `find` command is sufficient. This is NOT optional — it's the corollary to Rule 3 (code is source of truth) that catches the "was-written-to-sandbox-but-never-installed" class of failure.

2. **Build-output anomalies must be investigated immediately, not deferred.** If `npm run build` output shows something unexpected (missing route, unexpected warning, route-count mismatch), do `ls`/`find`/`grep` investigation BEFORE proceeding to any next step. "We'll confirm during visual verification" is the wrong response — visual verification may only happen post-deploy, and some anomalies only become bugs visible in specific user paths.

3. **When the doc system says "X was built in Ckpt N," treat that as a claim to verify, not a fact.** The phrase-pattern to look for: any doc sentence asserting file existence or route existence written by a prior chat. If a current task depends on the asserted fact, verify.

**Trigger condition:** Build output anomaly OR doc claim of "X exists" that's material to current work → immediate verification via `ls`/`find`/`grep`.

**Recurrence count as of Ckpt 9:** 2 (first Ckpt 5, then Ckpt 9). Each recurrence has been substantially more expensive (Ckpt 5's was caught in-chat; Ckpt 9's shipped to production before being caught).

### Pattern 8 — Communication level slips under complexity
Described in 2026-04-16 entry: technical jargon creeps back in when Claude is mid-explanation of a complex technical decision. Mitigation: before asking any question that invokes a technical decision, mentally read the question back as if one were a non-programmer, and rewrite if any word requires domain knowledge.

### Pattern 9 — Non-functional / platform-level requirements need a dedicated doc (NEW 2026-04-17)
Described in the 2026-04-17 "Platform architectural reveal" entry. When a platform has scale, user-model, concurrency, review-cycle, audit, and infrastructure requirements that cut across all tools — those live in their own doc (`PLATFORM_REQUIREMENTS.md`), not embedded in tool-specific or project-context docs. Embedding them in the wrong place leads to them being forgotten during workflow-specific design work, which leads to workflows shipping at the wrong scale.

### Pattern 10 — Don't generalize from N=1 (NEW 2026-04-17)
Described in the 2026-04-17 "Generalized from N=1" entry. When designing shared infrastructure (like the Shared Workflow-Tool Scaffold), avoid projecting from one instance. Actively seek the inverse case: "What would this look like for the SIMPLEST workflow? What would it look like for the MOST COMPLEX?" Build the shared infrastructure for the typical case, accommodate the outliers as special cases.

### Pattern 11 — When an instruction needs to be repeated for ≥3 chats, visibility containment has failed (UPDATED 2026-04-17 — now FOUR consecutive chats)
Described originally in the 2026-04-17 "User had to repeat non-programmer" entry (third-chat recurrence) and reinforced in the 2026-04-17 "Asked user to paste the file" entry (fourth-chat recurrence — after documentation had been substantially escalated between chats).

If the user has to restate the same instruction at the start of multiple successive chats DESPITE it being in the docs, the documentation containment is insufficient. The fix is not "reiterate more forcefully in docs" (that's more of the same) — the fix is to (a) move the instruction to the MOST attention-grabbing position in the MOST-read doc, (b) make it visually impossible to miss, (c) repeat it in multiple docs, (d) give it mechanical enforcement (read-it-back test on every message), (e) record the recurrence as a meta-pattern so future Claudes understand this is a structural issue with how LLM attention works, not a simple oversight.

**Post-Ckpt-8 update (critical):** Steps (a)–(e) above are necessary but not sufficient. The Ckpt 7 → Ckpt 8 transition added a loud NEW_CHAT_PROMPT banner; the slip happened anyway in Ckpt 8 (on a "paste the file" ask). The diagnosis: the Read-It-Back test (Rule 14a) was only being applied to **decision questions**, not to **instructions framed as tasks or data-gathering requests**. "Paste the file" felt too banal to test.

**Revised Pattern 11 mitigation (applies to every future chat):**

The Read-It-Back test extends to **every imperative instruction Claude gives the user, including:**
- "Paste / share / upload / show me / send me / give me X"
- "Look up / check / find X"
- Any "can you do Y" request
- Build/run/test commands
- Navigation or UI click requests

For each such instruction, Claude must pair it with a concrete method (terminal command OR numbered click-path OR `ask_user_input_v0` tool call). Instructions lacking a concrete method fail Rule 14a and must be rewritten.

**Trigger condition:** When a user says (or implies) "I've told you this before in other chats" — Pattern 11 is engaged. Claude acknowledges openly, escalates documentation visibility, and logs the recurrence. Count is tracked — every recurrence strengthens the diagnosis that documentation alone is insufficient and mechanical habit is the binding constraint.

**Recurrence count as of Ckpt 8:** 4. Each recurrence has been caught by the user, not by Claude's own mechanical test.

### Pattern 12 — Sandbox-path leak in user-facing commands (NEW 2026-04-17)
Described in the 2026-04-17 "Gave user a sandbox-only path" entry. Claude operates in a sandbox environment with filesystem paths like `/home/claude/`, `/mnt/user-data/uploads/`, `/mnt/user-data/outputs/`, `/mnt/skills/`. The user's terminal operates in `/workspaces/brand-operations-hub/` (or wherever their repo is) and has NO access to Claude's sandbox. Any command Claude gives the user to run must reference only paths in the user's environment.

**Rule:** Before sending a terminal command to the user, scan it for these path prefixes: `/home/claude/`, `/mnt/user-data/`, `/mnt/skills/`. If any appear, rewrite.

**Default approach for delivering new file content to the user's repo:**
- **Small-to-medium files (< 200 lines):** Heredoc pattern — `cat > "path/in/user/repo" << 'MARKER' ... MARKER`. The content is embedded in the command. Reliable.
- **Large files (> 200 lines):** Paste content in a code block, have user right-click in Codespaces file-explorer → New File → name it → paste → save.
- **`present_files` produces a download link in the chat UI** — that's for the user to manually download if they want a copy, NOT for `mv` from a path in Claude's sandbox.

### Pattern 14 — Multi-option questions must include per-option context, an escape-hatch "question first" option, AND a free-text invitation (NEW 2026-04-18; refined same-session with the escape-hatch requirement)
Described in the 2026-04-18 "Multi-option questions without context or free-text escape hatch trapped user into picking letters" entry, and further refined in the same session after the user observed that Claude Code's forced-picker UI physically hides the input box, making a text-level free-text invitation inaccessible mid-picker. User's refinement: *"Let's add a new rule. Always give me an additional choice to all the choices you're offering that says 'I have a question first that I need clarified'. This way, I select from a forced options list and still get to type my response."*

**The rule (three-part — all three required on every multi-option question):**

1. **Per-option content:**
   - Plain-language description of what the option actually does — not just a label
   - Consequence / reversibility note — "if you pick A, X happens; reversible by Y" vs. "if you pick B, it's one-way"
   - Enough context that a non-programmer can evaluate without further questions — OR explicit acknowledgment that there's a subtlety worth asking about

2. **An explicit escape-hatch option as the LAST option**, worded:
   > *"I have a question first that I need clarified"*
   (or near-equivalent phrasing the user will recognize). Non-negotiable regardless of how clear the other options seem. This option works INSIDE Claude Code's forced-picker UI — when the input box is hidden and the user can only arrow-key/number-select, the escape-hatch is selectable. Picking it returns the user to normal chat mode where they can type their question.

3. **A closing free-text invitation** in the prose after the option list, e.g.:
   > *"Or if you have a question about any option before picking, just ask — a clarification-first response is always valid."*
   Covers the case where Claude's message renders as plain text (input box already visible).

**Mechanical test — scan every multi-option question before sending:**
1. For each option: "can a non-programmer evaluate this without further questions?" If no, add context.
2. Is the "I have a question first that I need clarified" escape-hatch option present as the final option?
3. Is the free-text invitation present at the close?

If any check fails, rewrite.

**Scope exception:** simple yes/no/not-sure don't need elaborate per-option context, but STILL must include the escape-hatch option and free-text invitation. "Yes / No / I have a question first / Not sure" is the right shape for a simple binary — never just "yes / no."

**Why this pattern exists (both halves):**
- The first version of Pattern 14 ("Options + recommendation + reversibility" as in Rule 3, plus a free-text invitation) was insufficient because the invitation lives in prose, and Claude Code's forced-picker UI hides the input box — so the user couldn't act on the invitation mid-picker.
- Adding the "question first" option WITHIN the picker gives the user a selectable escape hatch that works regardless of whether Claude's message is rendered as plain text OR as an interactive picker.
- Both halves are needed: the free-text invitation for plain-text rendering, the escape-hatch option for picker rendering. Rule 14f captures this defensively — always include both.

**Enforcement:** Baked into `CLAUDE_CODE_STARTER.md` Rule 20 (read at start of every Claude Code session) and `HANDOFF_PROTOCOL.md` Rule 14f. Propagates automatically.

**Related patterns:** Pattern 11 (non-programmer visibility under load), Pattern 13 (session-boundary step-by-step), Rule 14a (Read-It-Back test for questions). Pattern 14 sits alongside these as a family of "mechanical discipline for non-programmer communication."

**Trigger condition:** Every multi-option question Claude presents. Not conditional.

---

### Pattern 13 — Session-boundary instructions must be step-by-step concrete (NEW 2026-04-18)
Described in the 2026-04-18 "Pattern 11 recurrence #5" entry.

**The rule:** Every Claude Code session's end-of-session handoff MUST include two explicit sections with copy-paste-ready commands — not general guidance:

1. **🚪 END-OF-SESSION INSTRUCTIONS** — what the user types/clicks RIGHT NOW to close the current session (e.g., `exit`, close tab behavior, whether to leave terminal open). Concrete. No "when you're ready, end the session" — that's not a method.

2. **🚪 NEXT-SESSION INSTRUCTIONS** — what the user types when they return:
   - Exact terminal command to launch (`cd /workspaces/brand-operations-hub && claude`)
   - Exact first-message text (copy-paste-ready)
   - Any offline-between-sessions steps

**Why this pattern exists:** The user is a non-programmer. Session bookends are high-confusion moments ("what do I type? which terminal? what message do I paste?"). Without explicit copy-paste-ready instructions, the user has to guess. Pattern 11 rules apply to mid-session imperatives; Pattern 13 extends the same discipline to session bookends.

**Enforcement:** Baked into `HANDOFF_PROTOCOL.md §4 Step 4b` (the Claude Code variant of the handoff template) and `CLAUDE_CODE_STARTER.md` Rule 15's mandatory content list. Every session reads `CLAUDE_CODE_STARTER.md` at start, so the requirement propagates.

**Trigger condition:** Pattern 13 is engaged every end-of-session in Claude Code. Not conditional.

**Related patterns:** Pattern 11 (visibility-under-load for non-programmer users), Rule 14a / Rule 9 (Read-It-Back test for imperatives), Pattern 12 (sandbox-path leaks).

---

END OF DOCUMENT
