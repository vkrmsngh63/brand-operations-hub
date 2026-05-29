# P-52 — AI model registry + central model-selection methodology + Opus 4.8 rollout

**Polish-item ID:** P-52 (cross-reference to ROADMAP entry P-52)
**Created:** 2026-05-29-b
**Session that captured §1:** session_2026-05-31-b (director's session-start "Issue 2"; deferred to its own `main`-track session) — verbatim text NOT preserved at capture time; see §1 note.
**Status:** §3 BUILT — registry doc + Rule 32 + Opus 4.8 rollout shipped at code level 2026-05-29-b (pending deploy decision).

## §1 — Original director instructions (VERBATIM, append-only)

> **Note (Rule 31 backfill):** Issue 2 was raised verbally at the start of session_2026-05-31-b and deferred to this session before the verbatim text was checked into a spec doc. The director's intent, as recorded in the ROADMAP P-52 entry and NEXT_SESSION.md at the time, was:
>
> *"You want a single place that lists every spot across both tools (Keyword Clustering and Competition Scraping) where someone picks an AI model, a rule that keeps that list up to date whenever we add a new model-picker, and the newest model (Opus 4.8) added everywhere — to every model dropdown and to the pricing tables that estimate cost."*
>
> (Reconstructed from the prior session's plain-terms summary; flagged as non-verbatim per Rule 31's append-only honesty requirement. If the director recalls the exact wording, append it here verbatim.)

## §2 — Joint-discussion adjustments (append-only, chronological)

- **2026-05-29-b (session_2026-05-29-b):** Phase 1 design picker — 4 questions, 4/4 Yes-to-Recommended:
  1. **Registry doc:** new dedicated `docs/AI_MODEL_REGISTRY.md` with a call-site table (vs. a section in an existing doc).
  2. **Methodology rule:** new HANDOFF_PROTOCOL rule (Rule 32) + a session-start auto-detect hook that flags unregistered model-list declaration sites (vs. manual checklist only / no rule).
  3. **W#1 scope:** add Opus 4.8 *inline only* to the live Keyword Clustering tool's three hardcoded spots this session; defer the shared-list refactor of W#1 (smaller, safer change to a live tool).
  4. **Default + pricing:** keep current defaults unchanged (W#2 → Opus 4.7, W#1 → Sonnet 4.6); add Opus 4.8 as a selectable option only; price it at the Opus-tier placeholder (same as 4.7/4.6) with a CONFIRM note, since official numbers weren't supplied.
- **2026-05-29-b:** baseline cleanup confirmed — the 3 W#2 summarize modals now import the central `SUPPORTED_MODEL_VERSIONS` from a new SDK-free `models.ts` instead of each keeping a local copy (removes the 3-way drift hazard).

## §3 — Current consolidated spec (rolled-up source-of-truth)

Three deliverables, all on the `main` track (platform-wide; spans W#1 + W#2):

1. **Central registry doc** — `docs/AI_MODEL_REGISTRY.md`: §1 declaration-site table (file path / workflow / models offered / default / pricing source), §2 consumers, §3 how-to-add-a-model checklist, §4 enforcement.
2. **Methodology rule** — HANDOFF_PROTOCOL **Rule 32** (mirrors Rule 31): any new/changed model-picker is registered in the registry doc the same session. Enforced by `.claude/hooks/check-model-registry-drift.sh` (SessionStart; non-blocking) which flags declaration sites not in the registry.
3. **Opus 4.8 rollout** — added (`claude-opus-4-8`) as a selectable option in:
   - W#2 `models.ts` `SUPPORTED_MODEL_VERSIONS` (default stays Opus 4.7)
   - W#2 `pricing.ts` `MODEL_PRICING` (Opus-tier placeholder pricing, CONFIRM note)
   - W#1 `AutoAnalyze.tsx` `AA_PRICING` + the model `<select>` (default stays Sonnet 4.6)
   - The 3 W#2 modals pick it up automatically via the central import.

**Schema-change-in-flight:** NO (model lists + pricing are code constants; no migration).

## §4 — Open questions (still under discussion)

- **Official Opus 4.8 pricing numbers** (input / output / cache-write-5m / cache-read per MTok). Currently a placeholder equal to Opus 4.7. Replace `pricing.ts` + `AA_PRICING` entries + remove the CONFIRM comments when supplied.
- **W#1 shared-list migration** (deferred): migrate `AutoAnalyze.tsx`'s three hardcoded spots to read from a shared constant, as the W#2 modals now do. Lower priority; tracked here.
- **Make Opus 4.8 the default?** Deferred — director kept current defaults this session; flip later if desired.

## §5 — Cross-references

- ROADMAP entry: **P-52**
- Registry doc: `docs/AI_MODEL_REGISTRY.md`
- Methodology rule: `docs/HANDOFF_PROTOCOL.md` Rule 32
- Enforcement hook: `.claude/hooks/check-model-registry-drift.sh`
- Design doc: `docs/REVIEWS_PHASE_2_DESIGN.md` §A.7 (W#2 Opus-only model policy)
- Canonical code references: `src/lib/competition-scraping/review-analysis/models.ts` (NEW central list) + `pricing.ts` + `client.ts` (re-export) + the 3 `…/competitor-reviews-analysis/components/*SummarizeModal.tsx` (consumers) + `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` (W#1 inline) + tests `models.test.ts` + `pricing.test.ts`.
