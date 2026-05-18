# Next session

**Written:** 2026-05-19 — `session_2026-05-19_p17-verify-and-close` (Claude Code, single-branch on `main`; doc-batch-only session — no code changes).

**For:** the next Claude Code session.

**Status of 2026-05-19 verify-and-close session:** ✅ **P-17 already shipped 2026-05-14 (commit `422c658`) — verified still working today (Playwright 2/2 + node-test 7/7 + tsc clean).** Closes (a.42) RECOMMENDED-NEXT as ✅ DONE-as-already-shipped-and-re-verified. Doc-drift caught at start-of-session per Rule 3 (yesterday's NEXT_SESSION.md misframed P-17 as still pending despite ROADMAP line 113 already marking it ✅ SHIPPED). One INFORMATIONAL CORRECTIONS_LOG entry captures the root cause + prevention rule (future §4 Step 1c forced-picker writes must grep ROADMAP for each named candidate's status BEFORE writing the launch prompt around it). Zero code changes; zero production behavior change; the P-17 regression belt is confirmed still catching the bug class on today's main. **§4 Step 1c forced-picker fired** at end-of-session (verify-and-close wrapped cleanly; no inherent continuation). Director picked **(a.43) RECOMMENDED-NEXT = W#2 polish P-19 overlay-dismiss → selection-collapse fix on `workflow-2-competition-scraping`** — LOW-MEDIUM cross-platform UX papercut; fix shape ~5-10 LOC re-using the existing P-14 `muteMutationObserver` helper.

---

## Branch

**`workflow-2-competition-scraping`** — W#2 polish work, NOT platform-wide. The `./resume` script will switch you from `main` (where today's verify-and-close session ended) → `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`, not `main`. If you're still on `main` after `./resume`, STOP and surface to director — `./resume` may have failed silently and director needs to run the ESCAPE HATCH 3-step path manually.

Expected branch state on entry: `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` AND exactly even with `origin/main` (the 2026-05-18-c deploy push + ping-pong sync left both branches at the same SHA `c3e69af`; today's 2026-05-19 doc-batch on main adds one commit ahead of workflow-2 — pull-rebase at session start will fast-forward workflow-2 to pick it up).

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**Ship P-19 — green status overlay auto-dismiss → one-time selection collapse fix** on `workflow-2-competition-scraping` (ROADMAP W#2 polish backlog P-19; new ROADMAP Active Tools (a.43) RECOMMENDED-NEXT). Goal: close the cross-platform UX papercut that director surfaced 2026-05-12-g during deploy session #9 verification — *"in the platforms where the highlighted words don't keep flickering, the selected text is unselected one time if the text is selected soon after the page loads. I think this happens when the green overlay goes away on its own."* Closes (a.43) RECOMMENDED-NEXT.

Branch is `workflow-2-competition-scraping` (W#2 polish — NOT platform-wide on main). Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director (the `./resume` switch may have failed; recover via the ESCAPE HATCH).

**Fix shape (recommended Option (a) per ROADMAP W#2 polish backlog P-19 entry, line 117 — symmetric with P-14's mute discipline):** ~5-10 LOC. Detach the green status overlay element via the existing `muteMutationObserver` helper that P-14 shipped — clean re-use of established infrastructure. Same strip-and-reapply mechanism as P-14 (orchestrator's MutationObserver observes `document.body` with `childList: true, subtree: true`; sees the green overlay's element removal → 250ms debounce → `highlighter.refresh()` → strip-and-reapply → any active selection on a stripped `<mark>` is cleared) but a different trigger (overlay-dismiss is NOT inside the muted refresh window). Wrapping the overlay's removal in `muteMutationObserver` should close the trigger without affecting any other refresh path. Per Rule 23 Change Impact Audit (pre-classify before code): ADDITIVE — purely DOM-mutation-event-handling fix; zero schema; zero API; zero shared-types; zero behavior change in happy path.

Schema-change-in-flight flag stays "No" for this entire session (P-19 is content-script polish — no schema change, no API change, no shared-types change).

Start by running the mandatory start-of-session sequence.

**Pre-build read list (in addition to mandatory start-of-session sequence):**

- `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` — MutationObserver setup at lines ~332-352 + locate where the green status overlay's element gets attached/detached. Per ROADMAP P-19 entry: the overlay element may live in `styles.ts` or `floating-add-button.ts` — grep for "overlay" / "status" / "green" / `data-plos-status` style attributes if any.
- `extensions/competition-scraping/src/lib/content-script/highlight-terms.ts` — the `refresh()` function that strips + reapplies highlights (the destination of every MutationObserver trigger after 250ms debounce).
- The P-14 fix that shipped 2026-05-12-e — search for `muteMutationObserver` definition + usage to understand the helper's signature before re-using it for the overlay-detach path. The P-14 fix commit is `45c9a15` per ROADMAP "(a.17)" lineage; ROADMAP W#2 polish backlog P-14 entry at line ~105 has the full fix-shape narrative.
- ROADMAP W#2 polish backlog P-19 entry (line 117) — the full root-cause + fix-shape narrative captured 2026-05-12-g.
- `tests/playwright/extension/` — find existing extension Playwright fixtures (e.g., `highlight-flashing.spec.ts`) that exercise the overlay → selection-collapse trigger. The new P-19 regression case(s) likely extend an existing spec or add a new one; check what's already wired.

**P-19 scope + design pattern:**

- Goal: closes the cross-platform UX papercut on all 4 platforms (Walmart/eBay/Etsy/Amazon).
- Bug class: green overlay auto-dismiss triggers MutationObserver → 250ms debounce → highlight refresh → strip-and-reapply → active text selection on a `<mark>` gets cleared. Director observed this 2026-05-12-g; root cause confirmed by in-session code reading at that time.
- Fix surface: wrap the overlay-removal action in `muteMutationObserver` (or whatever the P-14 helper's exact signature is — confirm via grep at session start).
- Estimated ~30-45 min code session: find overlay element (~5 min grep + read) + apply muteMutationObserver wrap (~5 LOC change) + add 2-3 regression cases against the bug class (~30-50 LOC test) + standard scoreboard.
- Per Rule 23 Change Impact Audit: ADDITIVE — zero production code path change outside the overlay-removal moment.

**Pre-deploy verification scoreboard targets (expected baselines from today's 2026-05-19 post-state):**

- `npx tsc --noEmit` clean
- `cd extensions/competition-scraping && npx tsc --noEmit` clean
- `npm run build` clean — **53 routes** (unchanged; no new routes)
- `src/lib` node:test: **527/527** unchanged (P-19 is content-script extension work, not src/lib)
- Extension `npm test`: **348/348 → ~350-351** depending on how many regression cases added
- Playwright: **75/75 → ~76-78** depending on how many extension-context cases added

**Deploy mechanics (cheat-sheet b — standard W#2 → main deploy):**

1. Pre-deploy scoreboard on `workflow-2-competition-scraping` (all 6 checks above).
2. Rebase / ff-merge workflow-2 onto `main` via the standard sequence (rebase no-op expected if no parallel main activity; otherwise rebase first then ff-merge).
3. Post-merge scoreboard re-run on `main` (full Playwright re-run per `feedback_recommendation_style.md` for thoroughness).
4. Rule 9 deploy gate via AskUserQuestion with the standard 4-option picker (Deploy now / Hold / Hold + reason / Question first). Recommend "Deploy now (Rule 9-approved)."
5. `git push origin main` → Vercel auto-redeploys (~1-2 min).
6. Ping-pong sync: `git push origin workflow-2-competition-scraping` (fast-forward) per Rule 25.
7. Fresh extension build via `rm -rf .output && npx wxt build` → zip into `plos-extension-2026-05-19-w2-deploy-NN.zip` at repo root.

**Director re-verify on real Independent Website URL (brief — observation-style):**

After sideloading the fresh extension build, navigate to ANY recognized platform page (Walmart/eBay/Etsy/Amazon — any one is sufficient; P-19 root cause is cross-platform). Wait for green status overlay to appear. Within ~1-3 sec of page load (BEFORE the overlay auto-dismisses), select a piece of text that includes a highlighted `<mark>`. Hold the selection. Observe whether the selection survives the overlay's auto-dismiss. **Expected (post-fix):** selection survives. **Pre-fix behavior** (the bug class P-19 closes): selection visibly collapses to caret at the moment the overlay disappears.

Per Rule 27, this could go either way (manual observation = director's eye is the test; Playwright extension fixture = automated regression). Recommend running the Rule 27 forced-picker at session start with all four options. Per `feedback_recommendation_style.md` (most thorough/reliable), Option C Hybrid is likely the right pick — Playwright regression case for the mechanical "overlay dismiss within debounce window doesn't fire refresh" assertion + director one-off manual observation for the visual selection-survival judgment.

**Per Rule 23 Change Impact Audit (pre-classify before code):** ADDITIVE — DOM-mutation-event-handling fix only; zero production behavior change outside the overlay-dismiss moment.

**Group A docs to update at end-of-session:** ROADMAP (header + W#2 row Last Session prepended + (a.43) flipped ✅ SHIPPED-AT-CODE-LEVEL or ✅ DONE depending on whether deploy fits in same session + new (a.44) RECOMMENDED-NEXT pick); CHAT_REGISTRY (new top entry); DOCUMENT_MANIFEST (per-doc flag timestamps); CORRECTIONS_LOG (header bump + any new entries); NEXT_SESSION (rewritten for the next pick — likely another W#2 polish item P-13 or new W#3 start OR W#2 → main deploy session #20 if P-19 ships at code level only).

**Group B docs to update at end-of-session:** COMPETITION_SCRAPING_DESIGN (new §B 2026-05-NN entry covering P-19 fix outcome); COMPETITION_SCRAPING_VERIFICATION_BACKLOG (P-19 entry flipped ⏳ OPEN → ✅ SHIPPED).

## Pre-session notes (optional, offline steps to do between sessions)

None. P-19 is an all-Claude-Code session — no offline preparation needed. Director's role during this session: pick the verification approach via Rule 27 forced-picker at session start (Playwright / manual / hybrid); pick "Deploy now" via Rule 9 AskUserQuestion gate at the deploy step (if ship-and-deploy fits in one session); pick next session's task via §4 Step 1c interview at end (or, if ship-at-code-level only, the next session is the standard W#2 → main deploy session #20).

## Why this pointer was written this way (debug aid)

Today's 2026-05-19 session was a verify-and-close meta-session — P-17 had already shipped 2026-05-14 but yesterday's pointer misframed it. The §4 Step 1c forced-picker at end-of-session fired because today wrapped cleanly with no inherent continuation. Director picked P-19 from a 4-option picker (P-19 overlay-dismiss recommended / P-13 autofocus / W#3 first session / escape hatch). P-19 is the most-thorough/reliable W#2 polish backlog pick per `feedback_recommendation_style.md` — closes a known live papercut on the recently-completed admin data-management surface using existing P-14 regression infrastructure + low risk; higher-priority than P-13 (LOW autofocus polish) and faster turnaround than W#3 first session (which would have been 90-150 min of Workflow Requirements Interview work).

**Alternate next-session candidates if director shifts priorities at session start:**

- W#2 polish P-13 (LOW autofocus on "+ Add new…" inline category input — ~2 LOC × 2 files; smaller scope than P-19).
- Start W#3 Therapeutic Strategy first session (full Workflow Requirements Interview per Rule 18; new branch `workflow-3-therapeutic-strategy` from main; big lift but advances platform arc forward).
- W#1 graduated-tool re-entry per Rule 22 (only if Keyword Clustering issue surfaces from natural use).
- Fresh natural-use surface (anything director discovered since 2026-05-19 doc-batch push).

Check `ROADMAP.md` for the canonical state. **After P-19 ships:** next session likely starts W#2 → main deploy session #20 to bring P-19 to vklf.com (cheat-sheet (b) standard pattern) OR picks the next W#2 polish item (P-13) OR pivots to W#3 first session.
