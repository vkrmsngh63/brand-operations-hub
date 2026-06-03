# P-61 — W#2 extension: server-side DEFAULT categories per platform per content-type

**Status:** ✅ **DEPLOYED-AND-VERIFIED 2026-06-03 (`session_2026-06-03_p61-extension-default-categories`)** — shipped end-to-end on real Chrome via `workflow-2-competition-scraping` → `main`; director verbatim verdict "Pass". **P-61 is CLOSED — the LAST substantive W#2 polish item, so W#2 graduation is now fully clear.** W#2 (Competition Scraping) extension + server. The design was settled WITH the director before coding (4 Rule 14f pickers, §2) per `feedback_plan_output_shape_before_building`. (Spec captured 2026-06-02-d in the `session_2026-06-02-d` batch; READ + updated this session per Rule 31, NOT re-created.)

**Severity:** MEDIUM-HIGH — removes recurring per-capture friction (re-typing/re-picking the same categories every time on a given platform).

---

## §1 — Original director instructions (VERBATIM, append-only)

> **2026-06-02-d:** "In the Workflow #2 extension, when the user creates a new content category, image category or video category, there should be an option right there to make that new added category a default category for that platform and for that specific type of content being added (text, image, video) and when the user tries to add new text, image or video the next time, those default categories list should show up in the extension overlay, which the user can choose to add that content under. The user should also be able to remove default categories from the list if they want. These default categories should be stored server-side."

---

## §2 — Joint-discussion adjustments (append-only, chronological)

- **2026-06-02-j — Rule 3 code-truth audit (via Explore agent), before design:**
  - Categories live in ONE `VocabularyEntry` model (`prisma/schema.prisma`) keyed `@@unique([projectId, vocabularyType, value])` — **project-scoped, shared across ALL platforms, NO platform discriminator, NO "default" flag.** `vocabularyType ∈ {content-category, image-category, video-category, …}`.
  - The three capture forms (`{text,image,video}-capture-form.ts`) each fetch the full vocab list for their type (`listVocabularyEntries(projectId, type)` → GET `/api/projects/[id]/vocabulary?type=`) and render a native `<select>` with every value + a `+ Add new…` sentinel (`createVocabularyEntry` upserts before save). Forms already have `projectId` + `platform` in scope.
  - `UserExtensionState` (P-3) is user-scoped (last project + platform only) — NOT a fit for per-(platform, content-type) defaults.
  - No existing "default"/per-platform concept anywhere — confirmed genuinely new.
- **2026-06-02-j — design LOCKED WITH the director (4 Rule 14f pickers):**
  - **Q1 Sharing = per-Project (shared)** [recommended]. Defaults are shared by everyone on the Project (a team convention), not per-user.
  - **Q2 Show-defaults UX = a "★ Defaults" optgroup pinned at the top of the existing native dropdown** [director OVERRIDE of my recommended quick-pick-chips], then a separator/"all categories", then `+ Add new…`.
  - **Q3 Make/remove = inline ★ + checkbox-on-add** [recommended] — reconciled in Q4 because native `<option>` rows can't host a tappable star.
  - **Q4 Reconciliation = a contextual "★ Make default for [platform] · [type]" checkbox BELOW the dropdown** [recommended] that reflects the currently-selected (or newly-typed) category: checked = it's a default; toggling adds/removes it. One control covers make-on-add AND remove-any-time; keeps the native picker (low-risk).
  - **Scope/keying confirmed:** defaults are keyed by `(projectId, platform, vocabularyType, value)` — a category can be default for Amazon·text but not Etsy·text. **Surfaced as pickable, never force-auto-selected** (per the directive wording).
- **2026-06-02-j — Change Impact Audit (Rule 23): Additive.** NEW model + NEW route + NEW shared types + extension reads/writes; no change to existing `VocabularyEntry` rows or capture-row category storage. Schema-change-in-flight flips NO→YES for the build, back to NO at the deploy push.

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

## §3b — AS-SHIPPED (2026-06-03, `session_2026-06-03_p61-extension-default-categories`, builds `fdedaa5` + `60f9455`)

✅ **DEPLOYED-AND-VERIFIED on real Chrome — director "Pass". P-61 CLOSED.** TWO build commits (`fdedaa5` the P-61 feature + `60f9455` the P-58 served-artifact refresh); `main` went `8e71cda → fdedaa5 → 60f9455`. ONE Rule 9 deploy gate (director "Deploy + run db push" — authorized BOTH the deploy AND the additive `prisma db push`).

**Storage (server-side, additive):** NEW Prisma model `CategoryDefault`, keyed `@@unique([projectId, platform, vocabularyType, value])` — so a category can be a default for Amazon·text but not Etsy·text; defaults are per-Project (shared, a team convention — Q1). Shipped to prod via `prisma db push` (1.29s, additive, zero data loss); Schema-change-in-flight flipped NO→YES for the build, YES→NO at the deploy push.

**Endpoint:** NEW route `src/app/api/projects/[projectId]/competition-scraping/category-defaults/route.ts` — GET (list defaults for a `(platform, contentType)`), POST (add a default), DELETE (remove a default). Route count 73 → **74**.

**Pure helper (PLOS-side, tested):** `src/lib/competition-scraping/category-defaults.ts` — `buildCategoryPickerOptions` assembles the picker shape (the "★ Defaults" optgroup at the top + the all-categories list + the "+ Add new…" sentinel), and `isDefaultCategory` resolves the contextual checkbox state for the currently-selected/typed category. +6 node:test.

**Extension plumbing:** the api-client + api-bridge + 3 background handlers + the messaging union/validation carry the GET/POST/DELETE of defaults across the extension; a NEW shared content-script DOM helper `extensions/competition-scraping/src/lib/content-script/category-defaults-picker.ts` renders the optgroup + the contextual "★ Make default for [platform] · [type]" checkbox, wired into the text / image / video capture forms (`{text,image,video}-capture-form.ts`).

**Overlay UX (Q2/Q3/Q4 reconciled):** the defaults appear as a "★ Defaults" optgroup pinned at the top of the existing NATIVE `<select>` (Q2 — director OVERRIDE of the recommended quick-pick chips), and because a native `<option>` row cannot host a tappable star (Q4), the make/remove control is a contextual "★ Make default for [platform] · [type]" checkbox BELOW the dropdown that reflects the currently-selected (or newly-typed) category — ONE control covers make-on-add AND remove-any-time while keeping the low-risk native picker. Defaults are surfaced as pickable, never force-auto-selected (per the directive).

**Verification:** fresh sideload zip `plos-extension-2026-06-02-w2-p61-default-categories.zip` (219 KB) — the director sideloaded + real-Chrome verified this exact artifact ("Pass"). Scoreboard: extension `npm test` = 915/915 UNCHANGED (plumbing covered by tsc; no messaging.test to extend) / src/lib `node:test` = 1369/1369 (+6) / `npm run build` = 74 routes (+1); Check 6 Playwright SKIPPED per Rule 27.

**Cross-references:** `docs/CORRECTIONS_LOG.md` §Entry 2026-06-03 (the DATE-BOUNDARY crossing + the reconcile-conflicting-design-picks PATTERN) + `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-06-03 + `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` Deploy session #43 + `docs/ROADMAP.md` the P-61 polish-backlog entry (flipped CLOSED).

---

## §4 — Open questions (RESOLVED 2026-06-03)

> All four resolved this session via the §2 Rule 14f pickers + the §3b as-shipped — kept here for traceability.
- Storage shape: a new model vs. a JSON field on an existing per-Project record? (Decide via Rule 23 audit at build.)
- Are defaults per-Project (shared) or per-user? (Director said "server-side" → likely per-Project; confirm.)
- Overlay UX: how "make default" + the defaults list + "remove default" are presented without cluttering the capture form.
- Does "default" auto-select the category, or just surface it as a quick pick? (Director said "those default categories list should show up … which the user can choose to add that content under" → surface as pickable, not forced.)

## §5 — Cross-references
- `docs/ROADMAP.md` → W#2 polish backlog (P-61).
- P-3 (`UserExtensionState` / `/api/extension-state` sync) — the existing extension server-state precedent.
- `docs/COMPETITION_SCRAPING_PRIMER.md` — W#2 continuity primer.
