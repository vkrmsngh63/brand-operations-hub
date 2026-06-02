# P-61 — W#2 extension: server-side DEFAULT categories per platform per content-type

**Status:** 🔴 OPEN — captured 2026-06-02-d (`session_2026-06-02-d`). NOT started. W#2 (Competition Scraping) extension + server. Design WITH the director before coding (storage shape + overlay UX) per `feedback_plan_output_shape_before_building`.

**Severity:** MEDIUM-HIGH — removes recurring per-capture friction (re-typing/re-picking the same categories every time on a given platform).

---

## §1 — Original director instructions (VERBATIM, append-only)

> **2026-06-02-d:** "In the Workflow #2 extension, when the user creates a new content category, image category or video category, there should be an option right there to make that new added category a default category for that platform and for that specific type of content being added (text, image, video) and when the user tries to add new text, image or video the next time, those default categories list should show up in the extension overlay, which the user can choose to add that content under. The user should also be able to remove default categories from the list if they want. These default categories should be stored server-side."

---

## §2 — Joint-discussion adjustments (append-only, chronological)

- _(none yet — to be filled WITH the director at the build session: storage model, overlay placement, and how "make default" + "remove default" surface in the capture forms.)_

---

## §3 — Current consolidated spec (rolled-up source-of-truth)

**Behavior:**
1. In each capture overlay (text / image / video), when the user **creates a NEW category**, show an inline option to **"make this a default category"** — scoped to **(a) the current platform** AND **(b) the content type being added** (text vs image vs video).
2. **Next time** the user adds content of that type on that platform, the **default categories for that (platform, content-type) show up in the overlay** as a pickable list; the user can choose to file the new content under one of them.
3. The user can **remove** a category from the defaults list.
4. **Defaults are stored server-side** (so they sync across devices / persist) — keyed by Project + platform + content-type.

**Likely surface:**
- Extension overlays: `extensions/competition-scraping/src/lib/content-script/{text,image,video}-capture-form.ts` (the "+ Add new category" inline upsert already exists; add the "make default" affordance + render the defaults list).
- Server: a NEW per-Project store keyed by `(platform, contentType)` → default category labels; a new/extended endpoint to read/write/remove. Additive schema → run the Rule 23 Change Impact Audit + Rule 9 authorization before any `prisma db push`.
- Possibly reuse/extend the existing `UserExtensionState` / `extension-state` sync path (P-3) or the vocabulary/category endpoints — audit first (Rule 3).

**Rule 24:** genuinely NEW — no `defaultCategor*` prior treatment found in code or docs. The existing per-capture "+ Add new category" upsert is the nearest precedent (it creates categories but has no default/persistence-per-platform concept).

---

## §4 — Open questions
- Storage shape: a new model vs. a JSON field on an existing per-Project record? (Decide via Rule 23 audit at build.)
- Are defaults per-Project (shared) or per-user? (Director said "server-side" → likely per-Project; confirm.)
- Overlay UX: how "make default" + the defaults list + "remove default" are presented without cluttering the capture form.
- Does "default" auto-select the category, or just surface it as a quick pick? (Director said "those default categories list should show up … which the user can choose to add that content under" → surface as pickable, not forced.)

## §5 — Cross-references
- `docs/ROADMAP.md` → W#2 polish backlog (P-61).
- P-3 (`UserExtensionState` / `/api/extension-state` sync) — the existing extension server-state precedent.
- `docs/COMPETITION_SCRAPING_PRIMER.md` — W#2 continuity primer.
