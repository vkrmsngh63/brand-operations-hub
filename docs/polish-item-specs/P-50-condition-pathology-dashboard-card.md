# P-50 — Add a new "Condition Pathology" card to the PLOS dashboard

**Status:** 🟢 BUILT 2026-06-03-e (`session_2026-06-03-e_p50-condition-pathology-card`) — code edited on `workflow-2-competition-scraping`, pending `/scoreboard` → Rule 9 deploy gate → director real-Chrome verification. _(Originally captured 2026-05-25 as NEW/UNSCHEDULED alongside the Reviews Phase 2 scope-expansion session.)_

**Severity:** LOW — cosmetic UI; placeholder card; ~2 LOC across 2 files; trivially reversible. No schema change, no route, no workflow renumbering.

---

## §1 — Original director instructions (VERBATIM, append-only)

> **2026-05-25:** "Between the 'Competition Scraping & Deep Analysis' card and the 'Therapeutic Strategy & Product Family Design' card in PLOS, please add a new card with the text 'Condition Pathology'."

### Plain restatement (for traceability — NOT a substitute for §1)

Add a new dashboard workflow card titled **"Condition Pathology"** at position 3 — immediately after **Competition Scraping & Deep Analysis** and immediately before **Therapeutic Strategy & Product Family Design** — on the PLOS dashboard card grid. Placeholder only (not yet a clickable/active workflow).

---

## §2 — Joint-discussion adjustments (append-only, chronological)

- **2026-05-25 — Rule 14f forced-picker (scope):** director picked **"just a card with that text (placeholder; workflow design comes later)"** over "full Workflow #3 + renumber all downstream workflows" and over "defer scope decision." Implication: **no doc-wide W# renumbering** (Therapeutic Strategy stays "W#3" by convention even though it slides to card-position 4); **Prisma schema unchanged** (the `workflow` field is already free-form `String`; no enum); docs that reference workflow counts (`PROJECT_CONTEXT.md §2` "14 PLOS workflows") stay accurate at the WORKFLOW level (this is a placeholder card, not a numbered workflow yet).
- **2026-06-03-e — Rule 3 code-truth audit (Explore agent):** found the dashboard card array `WORKFLOW_DEFS` lives in **exactly two files** (not three). The "keep in sync with /plos page" comment is **historical** — `src/app/plos/page.tsx` is now a 5-line `redirect("/projects")`, with no card list. Both arrays are byte-identical in shape (15 entries each); the only per-file difference is the `competition-scraping` entry's `active`/`route` (the per-project landing page makes it clickable). Competition Scraping is currently position 2, Therapeutic Strategy position 3 → the new card slots in at **position 3**, pushing Therapeutic Strategy to 4.
- **2026-06-03-e — Rule 14f forced-picker (icon):** director picked **🩺 Stethoscope** (the ROADMAP's suggested default; reads as medical/clinical condition; distinct from the neighboring 🔍 and the 🧬 already used by Therapeutic Strategy). Alternates offered: 🦠 microbe / 🧪 test tube / 🩹 bandage.

---

## §3 — Current consolidated spec (rolled-up source-of-truth)

**The change:** insert one entry at position 3 of the `WORKFLOW_DEFS` array in BOTH dashboard card files, keeping them in sync:

```ts
{ id: "condition-pathology", icon: "🩺", title: "Condition Pathology", active: false, route: null },
```

`active: false` + `route: null` → the card renders but is a non-clickable "coming soon" placeholder (matches every other inactive card in the grid).

**Files (verified 2026-06-03-e — Rule 3):**
- `src/app/projects/page.tsx` — the project-list dashboard. `WORKFLOW_DEFS` at line ~147; here `competition-scraping` is `active: false`. New entry inserted after it (was line 149/150).
- `src/app/projects/[projectId]/page.tsx` — the per-project landing dashboard. `WORKFLOW_DEFS` at line ~13; here `competition-scraping` is `active: true, route: "competition-scraping"`. New entry inserted after it.

Both arrays grow 15 → 16 entries.

**Verification:** director real-Chrome cross-walk — open vklf.com → any project landing page → confirm 🩺 **Condition Pathology** card appears at position 3 (between Competition Scraping and Therapeutic Strategy, non-clickable) → open `/projects` list page → confirm the same card in the same position. Playwright not required (static card-array edit; `npm run build` route count unchanged).

---

## §4 — Open questions

- None. Scope (card-only placeholder) and icon (🩺) both director-decided. If Condition Pathology is ever promoted to a full numbered workflow, `PROJECT_CONTEXT.md §2` may need an addendum at that time — a follow-up decision when the workflow's real design lands.

---

## §5 — Cross-references

- `docs/ROADMAP.md` — the P-50 backlog entry (NEW 2026-05-25; this spec is the verbatim-ask + as-built record per Rule 31).
- `docs/MULTI_WORKFLOW_PROTOCOL.md` §11 — branch model (P-50 is platform-wide dashboard infra; lands on `main`).
- `docs/COMPETITION_SCRAPING_PRIMER.md` §5 — W#2 residue table (lists P-50 as LOW residue).
