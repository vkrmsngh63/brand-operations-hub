# Next session

**Written:** 2026-05-15 — session_2026-05-15_w2-p29-design-session (Claude Code, on `workflow-2-competition-scraping`).

**For:** the next Claude Code session.

**Status of P-29 design pass:** ✅ **COMPLETE.** All 5 open design questions settled via Rule 14f forced-pickers + 1 Rule 27 verification picker. Single consolidated §B entry written in `COMPETITION_SCRAPING_DESIGN.md` covering Q3 / Q4 / Q5 / Q1 / Q2-reframing / Rule 27. Code-vs-doc drift caught on the yesterday-captured Q2 framing (`independent-website` was already a supported platform value end-to-end — schema String, shared types, extension picker — so no schema-add for "Other" handling) — captured to CORRECTIONS_LOG. No code changed today; this was a pure design session per launch prompt.

**The 5 decisions (one-line each):**
1. **Q3:** Add `source: 'extension' | 'manual'` column to all 3 W#2 tables (CompetitorUrl + CapturedText + CapturedImage). One `prisma db push` migration in Slice #1.
2. **Q4:** Symmetric permission model — modal's "+ Manually add" button visible to anyone with project-workflow access (admin-only by virtue of admin-solo in Phase 1; workers see it in Phase 2).
3. **Q5:** Modal popup pattern for all three sub-features (URL modal on UrlTable; text + image modals on URL-detail page).
4. **Q1:** All three image input modalities (drag-and-drop + paste-from-clipboard + URL-of-image with server-side SSRF allowlist + content-type + size guardrails).
5. **Q2-reframing:** `independent-website` already supported — no schema change for "Other." Modal labels this value "Independent Website" matching extension.
6. **Rule 27:** Hybrid verification — Playwright covers mechanical regression-prone parts; director manual covers visual-judgment + real-independent-website end-to-end smoke.

**Build sequencing (three slices, three sessions):**
- **Slice #1 (this next session)** = manual-add URL modal + one-shot `source` schema migration covering all 3 W#2 tables.
- **Slice #2** = manual-add captured-text modal.
- **Slice #3** = manual-add captured-image modal with all three input modalities + new server-side URL-fetch endpoint with guardrails.

---

## Branch
workflow-2-competition-scraping

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**W#2 P-29 Slice #1 build session — manual-add URL modal on `UrlTable.tsx` + one-shot `source` schema migration covering all 3 W#2 tables.** Closes (a.30) RECOMMENDED-NEXT.

This is a **BUILD session** — the design pass settled all 5 design decisions in the previous session and they are now FROZEN in `COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-15 entry. Read the §B entry at session start for full context; do NOT re-litigate any of the 5 decisions unless director surfaces a specific reason.

**SCHEMA-CHANGE-IN-FLIGHT FLAG.** This session lands a `prisma db push` migration. At session start, flip the W#2 row's "Schema-change in flight?" column in `ROADMAP.md` Current Active Tools table to "**Yes**". Flag stays "Yes" until this session ships + pushes. Per MULTI_WORKFLOW_PROTOCOL Rule 4 schema-change handshake.

**Slice #1 scope:**

1. **Schema migration** (`prisma/schema.prisma`):
   - Add `source String @default("extension")` column to `CompetitorUrl` (line ~254).
   - Add `source String @default("extension")` column to `CapturedText` (line ~300).
   - Add `source String @default("extension")` column to `CapturedImage` (line ~319).
   - Run `npx prisma db push` (NOT `migrate dev` per HANDOFF_PROTOCOL Rule 5). Verify in Prisma Studio that existing rows have `source='extension'` after migration.

2. **Shared types update** (`src/lib/shared-types/competition-scraping.ts`):
   - Add `source: 'extension' | 'manual'` field to URL/text/image DTOs (request + response shapes).
   - Bump no version (it's a backward-compatible additive change; existing rows have the default value).

3. **API route update** (`src/app/api/projects/[projectId]/competition-scraping/urls/route.ts`):
   - POST handler accepts optional `source` field in request body; defaults to `'extension'` if absent (preserves extension's existing behavior).
   - vklf.com's manual-add modal will POST with `source: 'manual'` explicitly.

4. **UI: `UrlAddModal.tsx`** (new component):
   - Location: `src/app/projects/[projectId]/competition-scraping/components/UrlAddModal.tsx`.
   - Triggered by a new "+ Manually add URL" button on `UrlTable.tsx`.
   - Form fields matching the extension's URL-add form shape: URL + Platform (dropdown with 7 values including "Independent Website") + optional Brand + Product + Category + Star ratings + Page rank + custom fields.
   - On submit: POST `/api/projects/[projectId]/competition-scraping/urls` with `source: 'manual'`. Modal closes on success; new row appears in the underlying URL table behind.
   - Cancel/dismiss UX: X button + click-outside + Cancel button.

5. **Playwright spec** (Rule 27 Hybrid — mechanical parts):
   - New file: `tests/playwright/p29-manual-add-url-modal.spec.ts`.
   - Asserts: click "+ Manually add URL" button → modal renders → fill required fields → submit → modal closes → new URL row visible in table → row has `source='manual'` (verify via DB).
   - Negative cases: unauthenticated submit returns 401; missing URL field shows validation error.

6. **Director manual walkthrough** (Rule 27 Hybrid — judgment parts):
   - Visual judgment: does the modal layout feel right? Is the platform dropdown's "Independent Website" option clearly labeled?
   - End-to-end smoke: pick a real independent website (e.g., a competitor's own website not on Amazon/eBay/Etsy/Walmart), open the modal, fill, submit, verify row appears.

**Pre-build checklist at session start:**
- `git branch --show-current` confirms `workflow-2-competition-scraping`.
- `git log origin/main..workflow-2-competition-scraping` expects 0 commits (clean state post-design-session-push).
- `git log workflow-2-competition-scraping..origin/main` expects 0 commits.
- Read `COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-15 entry for full design context.
- Read `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` P-29 NEW POLISH ITEM section (lines 1814-1853) — note the design questions are now closed; the section may be updated to reflect that.
- Read `prisma/schema.prisma` lines 254-343 (CompetitorUrl + CapturedText + CapturedImage models) to refresh context before the migration.

**Per HANDOFF_PROTOCOL Rule 5 schema safety:**
- Back up `prisma/schema.prisma` to `prisma/schema.prisma.bak` before edit.
- Run `npx prisma db push` (NOT `migrate dev`; not `--force-reset`).
- Verify in Prisma Studio that existing rows have `source='extension'` after migration.
- Take a count snapshot of CompetitorUrl + CapturedText + CapturedImage before migration; verify counts unchanged after.

**Rule 23 Change Impact Audit (W#1 is graduated — but the schema change here touches only W#2 tables; W#1 is unaffected):**
- Affected fields: new `source` column on 3 W#2 tables.
- Downstream consumers per `DATA_CATALOG.md` §7: TBD per each future consumer's design interview. The column is additive — existing reads ignore it; new reads opt in.
- Classification: **Additive (safe).** No coordinated update required.
- Recommendation: proceed.

## Pre-session notes (optional, offline steps to do between sessions)

Nothing strictly required. If you (the director) want to do offline reading before the build session: scan `COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-15 entry for the design rationale behind each decision. The full picture is captured there so the next session doesn't need to re-litigate.

## Why this pointer was written this way (debug aid)

Today's session (P-29 design) settled all 5 open design questions via Rule 14f forced-pickers + 1 Rule 27 verification picker. The director picked the most-thorough option in every case per the standing `feedback_recommendation_style.md` preference. The Q2 question collapsed after a Rule-3 code-truth check exposed that `independent-website` is already supported end-to-end (captured to CORRECTIONS_LOG). Design pass complete in a single session per launch prompt's framing.

Slice #1 is the natural next step — smallest scope, validates the modal pattern against production, lands the schema migration that subsequent slices reuse. The director picked Path A (wrap design session, start fresh) per session-management lucidity preference (`feedback_session_management.md`).

If the director revises intent for the next session, check `ROADMAP.md` W#2 row Current Active Tools for the actual current state and ask which task to work on instead. The candidate list at end-of-this-session: Slice #1 (picked — manual-add URL) / Slice #2 (manual-add captured-text) / Slice #3 (manual-add captured-image, biggest) / P-28 (delete URLs with cascade) / P-27 (delete captured texts/images) / P-21 (pickInitialUrl asymmetric canonicalize, MEDIUM) / P-19 (green-overlay-dismiss → one-time selection collapse, LOW-MEDIUM) / P-13 (autofocus on "+ Add new…" inline category input, LOW).
