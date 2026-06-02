# P-56 — Amazon highlight-terms still flicker on the real site, blocking text selection for capture

**Status:** 🔴 OPEN — captured 2026-06-02-d (`session_2026-06-02-d`). NOT started. W#2 (Competition Scraping) extension bug. Links to the prior P-14 + P-20 work (see §5).

**Severity:** HIGH — breaks the core text-capture flow on Amazon (the highest-value platform): the user cannot select a sentence containing a highlighted term to save it as captured text under that URL.

---

## §1 — Original director instructions (VERBATIM, append-only)

> **2026-06-02-d:** "Also, add one more thing to the roadmap for Workflow #2. The workflow #2 extension needs to be fixed because on Amazon, the highlight words are still flickering and that means the sentences containing the highlight words cannot be selected for adding them as text under that url."

### Plain restatement (for traceability — NOT a substitute for §1)

On real Amazon pages, the extension's keyword **Highlight Terms** overlay (the `<mark>`-wrapping of matched words) **still flickers** despite the earlier P-14 + P-20 fixes. The flicker (continuous strip-and-reapply as Amazon's page mutates) **disrupts/cancels an in-progress text selection**, so the user cannot select a sentence that contains a highlighted word in order to save it as **captured text** under that competitor URL.

---

## §2 — Joint-discussion adjustments (append-only, chronological)

- **2026-06-02-d — Rule 24 pre-capture search (done before capture):** PRIOR TREATMENT FOUND — **P-14** (2026-05-12, "mute the MutationObserver during strip-and-reapply") + **P-20** (2026-05-14, "fingerprint short-circuit so an unchanged set of pending matches skips the re-apply"). P-20 passed unit + 4-platform Playwright external-mutation specs, **but its real-Amazon browser verification was explicitly DEFERRED** (to W#2 deploy session #12 / (a.26)) and was never confirmed clean here. Director chose (AskUserQuestion) to log this as a **NEW item P-56 cross-referencing P-20** rather than reopen P-20 — keeps the shipped P-14/P-20 work intact while flagging this as unfinished/regressed on the real site, and records the NEW concrete symptom (selection is blocked).

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

---

## §4 — Open questions

- Does the P-20 fingerprint short-circuit engage on real Amazon today, or is it being defeated (fingerprint legitimately changing / marks destroyed)? (First diagnostic — reuse `docs/p-20-trace-script.js` MutationObserver trace on a real Amazon PDP.)
- Is the selection-blocking caused by the re-apply churn, by a `user-select`/`pointer-events` rule on `<mark>`, or both?
- Acceptable trade-off between highlight responsiveness and flicker suppression on Amazon (e.g. defer-while-selecting vs. longer debounce).

---

## §5 — Cross-references

- **P-14** (2026-05-12) — mute the orchestrator MutationObserver during strip-and-reapply (first flicker fix).
- **P-20** (2026-05-14) — fingerprint short-circuit; `docs/p-20-trace-script.js` (the reusable real-Amazon mutation-rate trace tool); real-Amazon verification was DEFERRED and is effectively what P-56 resumes.
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B — the P-20 fingerprint design decision entry.
- `docs/CORRECTIONS_LOG.md` — P-14 / P-20 pattern lessons (mute-discipline + fingerprint).
- `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — the deploy-session verification history (P-20 deferred real-Amazon check).
- `docs/COMPETITION_SCRAPING_PRIMER.md` — W#2 continuity primer (points here under §5 open items).
