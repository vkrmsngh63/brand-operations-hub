# P-56 — Amazon highlight-terms still flicker on the real site, blocking text selection for capture

**Status:** ✅ DEPLOYED-AND-VERIFIED 2026-06-02-e (`session_2026-06-02-e_p56-amazon-highlight-flicker-pause-while-selecting`) — **P-56 CLOSED.** Build `802224f`; `main` went `71645bc → 802224f`; director real-Amazon (real-Chrome) verdict "pass". The director-picked "Pause while selecting" fix (Option 1) defers the Highlight-Terms strip-and-reapply while a text selection is active (see §2 + §3). EXTENSION-ONLY; NO schema change; NO new route; extension `npm test` 910 → 915. Residual reading-time flicker deliberately left as an Option-2 follow-up. _(Originally captured 2026-06-02-d as 🔴 OPEN; W#2 Competition Scraping extension bug; links to the prior P-14 + P-20 work — see §5.)_

**Severity:** HIGH — breaks the core text-capture flow on Amazon (the highest-value platform): the user cannot select a sentence containing a highlighted term to save it as captured text under that URL.

---

## §1 — Original director instructions (VERBATIM, append-only)

> **2026-06-02-d:** "Also, add one more thing to the roadmap for Workflow #2. The workflow #2 extension needs to be fixed because on Amazon, the highlight words are still flickering and that means the sentences containing the highlight words cannot be selected for adding them as text under that url."

### Plain restatement (for traceability — NOT a substitute for §1)

On real Amazon pages, the extension's keyword **Highlight Terms** overlay (the `<mark>`-wrapping of matched words) **still flickers** despite the earlier P-14 + P-20 fixes. The flicker (continuous strip-and-reapply as Amazon's page mutates) **disrupts/cancels an in-progress text selection**, so the user cannot select a sentence that contains a highlighted word in order to save it as **captured text** under that competitor URL.

---

## §2 — Joint-discussion adjustments (append-only, chronological)

- **2026-06-02-d — Rule 24 pre-capture search (done before capture):** PRIOR TREATMENT FOUND — **P-14** (2026-05-12, "mute the MutationObserver during strip-and-reapply") + **P-20** (2026-05-14, "fingerprint short-circuit so an unchanged set of pending matches skips the re-apply"). P-20 passed unit + 4-platform Playwright external-mutation specs, **but its real-Amazon browser verification was explicitly DEFERRED** (to W#2 deploy session #12 / (a.26)) and was never confirmed clean here. Director chose (AskUserQuestion) to log this as a **NEW item P-56 cross-referencing P-20** rather than reopen P-20 — keeps the shipped P-14/P-20 work intact while flagging this as unfinished/regressed on the real site, and records the NEW concrete symptom (selection is blocked).
- **2026-06-02-e — the deferred P-20 real-Amazon diagnostic trace was RUN (FIRST action), and it DISPROVED the assumed root cause:** the director ran `docs/p-20-trace-script.js` on a real Amazon PDP (product B07V57NDNC, a pain-relief cream). Trace results over a 30.0s window: ~145 MutationRecord batches; 134 nodes added (4.5/sec); 100 removed (3.3/sec); **~137,358 chars of new text added (~4,576 chars/sec)**; **~14 would-be `refresh()` rescans at the 250ms throttle (~0.47/sec — one every ~2s)**; top added tags LI:43, DIV:34. **Interpretation:** the P-20 fingerprint short-circuit is NOT broken — it works as designed. Amazon legitimately adds matchable text roughly every 2 seconds, so a *correct* full-page strip-and-reapply of the `<mark>` overlay fires mid-drag and collapses the user's in-progress text selection across a highlighted word (the exact P-56 symptom). Strengthening/widening the fingerprint can't help because the re-applies are legitimate. This redirected the fix away from "widen the P-20 short-circuit" toward "protect the active selection."
- **2026-06-02-e — fix shape chosen WITH the director via a Rule 14f AskUserQuestion picker = Option 1 "Pause while selecting"** (over Option 2 "kill the idle flash too / redraw only changed text"). The chosen Option 1 protects the in-progress selection (the user-blocking symptom) and explicitly accepts a residual faint flicker while merely READING; Option 2 (the more-thorough "redraw only changed text") is recorded as the available follow-up if the director wants the idle flash gone too.

---

## §3 — Current consolidated spec (rolled-up source-of-truth)

**The bug (two coupled symptoms on real Amazon):**
1. **Flicker** — the Highlight Terms `<mark>` overlay visibly strips-and-reapplies repeatedly as Amazon's continuously-mutating DOM fires the orchestrator's MutationObserver, despite P-14 (MO mute) + P-20 (fingerprint short-circuit).
2. **Selection blocked** — that re-apply churn collapses/cancels an active text selection (re-wrapping nodes the user is selecting across), so the user cannot highlight a sentence containing a highlighted word to feed the "Add to PLOS — Captured Text" flow.

**Likely code surface (verify against source first — Rule 3):**
- `extensions/competition-scraping/src/lib/content-script/highlight-terms.ts` — the live applicator (`refresh()` / strip-and-reapply, the fingerprint short-circuit from P-20, the `muteMutationObserver` hook from P-14).
- The orchestrator's MutationObserver tick that calls `.refresh()` (the re-fire cadence on heavy-SPA / Amazon pages).
- `extensions/competition-scraping/src/lib/content-script/styles.ts` — `user-select` / `pointer-events` rules around the `<mark>` and overlay elements (selection-interception candidate).

**Candidate directions (to be designed WITH the director per `feedback_plan_output_shape_before_building` — NOT yet decided):**
- Confirm the P-20 fingerprint short-circuit actually engages on real Amazon (the deferred verification) — it may not be short-circuiting because Amazon's mutations DO change the matchable fingerprint, or marks are being destroyed by Amazon and legitimately re-applied.
- Suppress re-apply WHILE a selection is active (`document.getSelection()` non-collapsed → defer `refresh()` until selection clears) so an in-progress selection is never disrupted.
- Ensure `<mark>` wrappers don't intercept selection (`user-select: inherit` / not introducing selection boundaries that browsers won't cross).
- Possibly a longer/idle-gated re-apply specifically on Amazon, balanced against highlight responsiveness.

**Verification:** this is a real-Amazon, visual + interaction bug → director real-Chrome verification is mandatory (Playwright simulates mutations but the real Amazon DOM is the ultimate test; this is exactly the verification that was deferred for P-20). A fresh extension sideload zip will be needed (extension code change).

### ✅ AS-SHIPPED RESOLUTION (2026-06-02-e, build `802224f`) — "Pause while selecting"

**Diagnosis confirmed by the trace (see §2):** the P-20 fingerprint short-circuit WORKS AS DESIGNED; it is NOT being defeated. The flicker + selection-break are caused by *legitimate* re-applies — Amazon adds matchable text ~every 2s (~4,576 chars/sec measured), so a correct full-page strip-and-reapply of the `<mark>` overlay fires mid-drag and collapses the in-progress selection. The selection-blocking is caused by the **re-apply churn**, NOT by a `user-select`/`pointer-events` rule on `<mark>` (candidate direction #2 + question #2 ruled out by the trace).

**The fix** (`extensions/competition-scraping/src/lib/content-script/highlight-terms.ts`): `refresh()` now defers the strip-and-reapply whenever `window.getSelection()` reports a non-collapsed, non-empty text selection; a document `'selectionchange'` listener re-runs the deferred refresh the moment the selection clears. `lastFingerprint` is intentionally left UNTOUCHED while deferred, so the pending highlight work is preserved and the deferred refresh still does the right thing when it finally runs. NEW exported pure helper `isActiveTextSelection` (DOM-free — takes a Selection-shaped snapshot `{ isCollapsed, type, rangeCount, toString() }` so it is unit-testable without a DOM) — +5 extension unit tests (`highlight-terms.test.ts`). The P-20 fingerprint short-circuit + the P-14 MutationObserver mute are both KEPT intact (the new defer is layered on top, not a replacement).

**Trade-off (recorded):** residual faint flicker remains when the user is merely READING (not selecting) — deliberately accepted per the chosen Option 1. The more-thorough Option 2 ("kill the idle flash too" = redraw only the changed text instead of a full strip-and-reapply) is the available follow-up if the director wants the idle flash gone too.

**Scoreboard:** extension `npm test` 910 → **915** (+5) / src/lib `node:test` **1353 UNCHANGED** (extension-side work) / `npm run build` **72 routes UNCHANGED**; Check 6 Playwright SKIPPED per Rule 27 (real-Amazon DOM-timing = director real-Chrome verification). Fresh sideload zip `plos-extension-2026-06-02-w2-p56-amazon-flicker-1.zip` (218 KB), director real-Amazon verified ("pass").

---

## §4 — Open questions — ✅ ALL RESOLVED 2026-06-02-e

- ~~Does the P-20 fingerprint short-circuit engage on real Amazon today, or is it being defeated (fingerprint legitimately changing / marks destroyed)?~~ **RESOLVED:** the short-circuit ENGAGES and works as designed — it is NOT defeated. The diagnostic trace (`docs/p-20-trace-script.js` on a real Amazon PDP) showed Amazon legitimately changes the matchable fingerprint roughly every 2 seconds, so the ~14 rescans over 30s are *correct* re-applies, not short-circuit failures.
- ~~Is the selection-blocking caused by the re-apply churn, by a `user-select`/`pointer-events` rule on `<mark>`, or both?~~ **RESOLVED:** caused by the re-apply CHURN — the full-page strip-and-reapply destroys/re-creates the nodes the user is selecting across, collapsing the selection. NOT a `user-select`/`pointer-events` rule on `<mark>` (no CSS change was needed).
- ~~Acceptable trade-off between highlight responsiveness and flicker suppression on Amazon (e.g. defer-while-selecting vs. longer debounce).~~ **RESOLVED:** the director chose **defer-while-selecting** (Option 1) — pause the re-apply while a selection is active, resume on `selectionchange`. Residual idle flicker is accepted; the "redraw only changed text" Option 2 is the available follow-up.

---

## §5 — Cross-references

- **P-14** (2026-05-12) — mute the orchestrator MutationObserver during strip-and-reapply (first flicker fix).
- **P-20** (2026-05-14) — fingerprint short-circuit; `docs/p-20-trace-script.js` (the reusable real-Amazon mutation-rate trace tool); real-Amazon verification was DEFERRED and is effectively what P-56 resumes.
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B — the P-20 fingerprint design decision entry.
- `docs/CORRECTIONS_LOG.md` — P-14 / P-20 pattern lessons (mute-discipline + fingerprint).
- `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — the deploy-session verification history (P-20 deferred real-Amazon check).
- `docs/COMPETITION_SCRAPING_PRIMER.md` — W#2 continuity primer (points here under §5 open items).
