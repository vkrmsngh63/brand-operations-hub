# Per-Project competitive landscape AI summary on `/comprehensive-analysis` — full spec

**Polish-item ID:** P-51 (slotted between P-49 and P-50 per director's 2026-05-28 directive)
**Created:** 2026-05-28
**Session that captured §1:** `session_2026-05-28_p49-w5-session-4-scope-misread-rollback-and-corrective-planning`
**Status:** SPEC LOCKED at §1 level. §2/§3 are placeholder skeleton — director's directive is that detailed Q&A + planning happens AT THE START of the P-51 build session, NOT now. This doc is a CAPTURE-ONLY artifact until that session opens.

---

## §1 — Original director instructions (VERBATIM, append-only)

**2026-05-28 — director's original directive (captured earlier in the same session as the Category + Type page specs, when director added P-51 to the roadmap):**

> I want to add a new item between 'W#2 Reviews Phase 2' and 'NEW Condition Pathology card'. This item will be the setup of the AI summarization for the /comprehensive-analysis page that is already setup. Essentially, just the way we have been taking multiple reviews from urls and summarizing them using AI, we will be taking all the reviews and creating a very comprehensive competitive landscape analysis that will be pasted into the text box editor on the /comprehensive-analysis page that is already setup. You should ask me for detailed instructions for that item and then plan out how that item functionality should be executed and ask me questions for clarification and then pose options and then execute the approved plan.

**2026-05-28 — director's process clarification (same session, immediately after):**

> I don't want the questions-answer session to happen now. I want it to happen in the beginning of that session.

---

## §2 — Joint-discussion adjustments (append-only, chronological)

**2026-05-28 (session_2026-05-28_p49-w5-session-4-scope-misread-rollback-and-corrective-planning):**

- **Process directive locked:** detailed Q&A + planning + options + approval are ALL deferred to the start of the P-51 build session itself. THIS doc is a skeleton placeholder; do NOT pre-resolve the design at planning time.
- **Slot in roadmap:** between P-49 (W#2 Reviews Phase 2) and P-50 (Condition Pathology card) per director's 2026-05-28 directive. ROADMAP entry inserted at line 290 of `docs/ROADMAP.md` via build commit `5fa1f53` AND survived the `958ccf8` revert (the ROADMAP P-51 entry was bundled with the build commit and removed by the revert too — needs to be RE-INSERTED in the next deploy session as part of the corrective doc batch).
- **Cross-reference flagged:** the original §A.10 design in `docs/REVIEWS_PHASE_2_DESIGN.md` proposed this as a separate read-only section with a staleness badge. Director's NEW twist (per §1 above) routes the AI output INTO the existing user-editable TipTap document, NOT a separate read-only section. This commingle-with-user-edits pattern is the key design novelty for P-51 vs the original §A.10 spec.

---

## §3 — Current consolidated spec (rolled-up source-of-truth)

**SKELETON ONLY — do NOT pre-resolve design at planning time.**

Per director's explicit 2026-05-28 directive *"I want the question-answer session to happen in the beginning of that session"*, this §3 will only be filled out at the start of the dedicated P-51 build session. Until then:

- High-level intent: extend the P-49 W5 AI-summarization arc with the FIFTH and FINAL aggregation level — cross-everything Per-Project competitive landscape pooled across all reviews in the project.
- Output destination: the EXISTING TipTap editor on `/projects/[projectId]/competition-scraping/comprehensive-analysis` (NOT a separate read-only banner). Output commingles with user-authored notes in the same persisted `CompetitorUrl`-or-equivalent JSON blob.
- Schema already provisioned: `prisma/schema.prisma` has `ReviewAnalysisLevel.PER_PROJECT` enum value with the inline comment *"reserved for future cross-Project competitive landscape analysis (no flow ships against it in W5 Sessions 2/3/4)"* — no `prisma db push` expected unless director extends scope at Q&A.

### Areas the session-start Q&A will need to cover (recorded as a checklist for future-me, NOT pre-answered)

1. **Input scope:** raw reviews across all URLs in project / cascade from already-cached per-flow summaries (Per-Review / Per-Competitor / Per-Category / Per-Type) / hybrid?
2. **Editor interaction semantics:** replace existing contents / append at bottom / insert at cursor / stage-as-preview-then-accept?
3. **Prompt shape:** opportunity-mapping / critique-emergent / competitive-positioning / other?
4. **Trigger UI placement + label:** toolbar button / floating button / above-editor banner / AI menu entry?
5. **Cost cap + cache key behavior:** reuse Per-Competitor's PATCH-cached pattern with `reviewsHash + modelVersion`?
6. **Modal pattern:** reuse Per-Competitor's modal scaffold (View prompts + progress + cost tally + completion banner) or one-shot inline spinner?
7. **Sequencing relative to remaining P-49 W5 sessions:** run after Category-page Sessions 1-3 close / after Type-page Sessions 4-5 close / out-of-band on `main`?

---

## §4 — Open questions (still under discussion)

ALL design questions DEFERRED to the start of the P-51 build session per director directive. See §3 checklist for the questions to surface then.

---

## §5 — Cross-references

- **ROADMAP entry:** P-51 (was inserted at line 290 of `docs/ROADMAP.md` via the now-reverted build commit `5fa1f53`; the entry must be RE-INSERTED in the next deploy session as part of the corrective doc batch — losing it would mean losing the slot between P-49 and P-50). The ROADMAP entry MUST cross-reference this spec doc path: `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md`.
- **Related polish-item specs:**
  - `docs/polish-item-specs/P-49-W5-S4-category-page.md` — Per-Category (one level below P-51 in aggregation hierarchy).
  - `docs/polish-item-specs/P-49-W5-S5-type-page.md` — Per-Type (sibling of Per-Category in aggregation hierarchy).
- **Design doc §B entries:**
  - `docs/REVIEWS_PHASE_2_DESIGN.md` §A.7 + §A.10 + §A.13 (ORIGINAL spec — pre-supersedence — proposed this as the cross-everything competitive landscape level with $5-15/run estimated cost + read-only-banner UI; SUPERSEDED on the UI dimension by director's 2026-05-28 twist that routes output into the editable TipTap doc).
  - §B 2026-05-27 (W5 Session 1.5 design lock that DEFERRED PER_PROJECT from the 7-flow scope).
- **Schema slot:** `prisma/schema.prisma` `ReviewAnalysisLevel.PER_PROJECT` enum value (already provisioned).
- **Target editor:** `src/app/projects/[projectId]/competition-scraping/comprehensive-analysis/page.tsx` + `AnalysisEditor.tsx` (TipTap-based; persisted as JSON via `src/lib/competition-scraping/handlers/comprehensive-analysis.ts` PUT endpoint).
