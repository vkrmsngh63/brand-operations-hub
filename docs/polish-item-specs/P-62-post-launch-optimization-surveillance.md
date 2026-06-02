# P-62 — "Post Launch Optimization & Surveillance" card + the Continued Competitive Surveillance page

**Status:** 🔴 OPEN — captured 2026-06-02-d (`session_2026-06-02-d`). Belongs to **Workflow 11 — Post-Launch Optimization** (❌ NOT STARTED); recorded now so it is not lost. NOT to be built until Workflow 11 begins (or the director directs otherwise).

---

## §1 — Original director instructions (VERBATIM, append-only)

> **2026-06-02-d:** "Change the text on the 'Post Launch Optimization' card to 'Post Launch Optimization & Surveillance'. When the 'Post Launch Optimization' card is clicked, please have it go to a page with the following text:
>
> In the header of all the pages mentioned should be a button that stands out with the text 'Continued Competitive Surveillance'. When this button is clicked, it should go to the 'Continued Competitive Surveillance' page. On this page, please put the following text:
>
> Continued Competitive Surveillance:
>
> - Are there new competitors in existing platforms?
> - Do existing competitors have new content?
> - Do existing competitors have new complaints (critical reviews)?
> - Does our existing approach address these new competitors and/or existing competitor changes?
> - What can we do to respond?
>
> Please add this item (Continued Competitive Surveillance) to our overall roadmap under the 'Post Launch Optimization' workflow so that we are reminded of this note."

---

## §2 — Joint-discussion adjustments (append-only, chronological)

- **2026-06-02-d — the landing-page-text gap (AskUserQuestion):** the verbatim message said "go to a page with the following text:" but no landing-page text followed. Director clarified: **the 'Post Launch Optimization' landing page is a HUB — it has no body text of its own; its notable feature is the standout 'Continued Competitive Surveillance' button in the header.** (So nothing is missing — the surveillance content lives on the second page.)
- **2026-06-02-d — button placement (AskUserQuestion):** the standout 'Continued Competitive Surveillance' button appears **only on the Post Launch Optimization page header** (not on every workflow page).

---

## §3 — Current consolidated spec (rolled-up source-of-truth)

1. **Rename the card** "Post-Launch Optimization" → **"Post Launch Optimization & Surveillance"** (the card array in `src/app/projects/page.tsx` + `src/app/projects/[projectId]/page.tsx`; today `{ id: "post-launch-optimization", title: "Post-Launch Optimization", active: false, route: null }`).
2. **Activate + route the card** to a new **Post Launch Optimization landing (hub) page**. The hub page has no body text yet; its header carries a **standout "Continued Competitive Surveillance" button**.
3. **The button → a "Continued Competitive Surveillance" page** whose content is exactly:

   > **Continued Competitive Surveillance:**
   > - Are there new competitors in existing platforms?
   > - Do existing competitors have new content?
   > - Do existing competitors have new complaints (critical reviews)?
   > - Does our existing approach address these new competitors and/or existing competitor changes?
   > - What can we do to respond?

4. Scope of the standout button: **the Post Launch Optimization page header only.**

---

## §4 — Open questions
- Visual treatment of the "standout" button (color/size) — decide at build with the director.
- Whether the Continued Competitive Surveillance checklist later becomes interactive (data-driven from W#2 capture) vs. a static prompt — out of scope for the initial capture; revisit when Workflow 11 starts.

## §5 — Cross-references
- `docs/ROADMAP.md` → Workflow 11 — Post-Launch Optimization (P-62 entry).
- Conceptually downstream of W#2 (Competition Scraping) — the surveillance checklist asks the W#2 questions on an ongoing basis.
