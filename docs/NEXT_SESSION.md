# Next session

**Written:** 2026-05-20-b (`session_2026-05-20-b_p27-captured-videos-design-interview` — end-of-session handoff after the P-27 Captured-videos feature DESIGN session shipped the binding spec at `docs/CAPTURED_VIDEOS_DESIGN.md` (525 lines after corrections; §A.0–§A.18 frozen + §B empty per Rule 18 shape); 11 forced-picker outcomes logged in §A.0 audit trail; Rule 24 end-of-session catch corrected an asymmetry-claim slip in §A.3 / §A.8 / §A.18 BEFORE the doc-batch commit; ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry captures the slip + pattern strengthening. Closes (a.53) RECOMMENDED-NEXT = P-27 design session; opens **(a.54) RECOMMENDED-NEXT = P-27 implementation #1 (Build session — schema + bucket + helper) on `workflow-2-competition-scraping`** as the natural-continuation next session per design doc §A.2 implementation arc table).

**For:** the next Claude Code session — first P-27 Build session (Session #1 of estimated ~6-9 build sessions per the design doc §A.2 implementation arc table). Schema migration via `npx prisma db push` for new `CapturedVideo` table + new `VideoSourceType` enum + new `video-category` value added to the existing `VocabularyEntry` `type` column (verify at implementation time whether the existing `type` column is an enum or a string column — design doc §A.7 schema spec is the canonical source). New Supabase Storage bucket `competition-scraping-videos` creation via the Supabase dashboard (director offline step BEFORE Claude runs the `db push` — see Pre-session notes below). New `src/lib/competition-video-storage.ts` helper wrapper paralleling existing `src/lib/competition-storage.ts` (Phase-1 `requestVideoUploadUrl` / Phase-3 `finalizeVideoUpload` / `getVideoSignedUrl` / `getVideoThumbnailUrl` / `deleteVideo` / `wipeProjectVideos`). Per Rule 23 Change Impact Audit: Additive (safe) — new optional table + new enum value; no existing data affected; no downstream-consumer breakage since no consumers exist yet. **Schema-change-in-flight flag FLIPS to "Yes" at session start.**

---

## Status of today's session

**P-27 Captured-videos feature DESIGN SESSION shipped — DOC-ONLY (no code, no schema, no deploy).** One-hundred-and-twentieth Claude Code session. Full Workflow Requirements Interview per HANDOFF_PROTOCOL Rule 18 across 5 clusters / 14 questions resolved. NEW Group B design doc `docs/CAPTURED_VIDEOS_DESIGN.md` shipped (525 lines after corrections); §A frozen (sections A.0–A.18 covering interview meta + audit trail of 11 forced-picker outcomes + purpose + placement in W#2 graduation sequence + v1 scope + inputs + triggers + per-platform `<video>` detection + CapturedVideo schema + vocab inline-add UX + bucket + size cap + thumbnail extraction + embed save URL validation + size cap enforcement + thumbnail extraction failure fallback + test coverage approach + platform-truths audit + Living Questions + Cross-Tool Data Flow Map reciprocal output declaration + scaffold fit + deferred-items registry); §B empty append-only per Rule 18 convention.

**11 forced-pickers logged this session (full detail in design doc §A.0):** (1) Doc location pick = Option A — new top-level `docs/CAPTURED_VIDEOS_DESIGN.md`. (2) Q3 v1 scope = Option B (Symmetric v1). (3) Q6+Q7 per-platform detection = Option A (platform-agnostic DOM-walker + 10-entry video-embed-hostname allowlist). (4) Q8 schema = Option A (new `CapturedVideo` table + `sourceType` enum discriminator). (5) Q9 vocab UX = Option C (inline "+ Add new category" + 0 seeded entries). (6) Q10a size cap = 100 MB per-file. (7) Q10b thumbnail extraction = Option A (client-side `<canvas>` frame-grab). (8) Q11 embed validation = Option A (URL-pattern regex only). (9) Q12 size cap enforcement = Option A (two-layer client + server). (10) Q13 thumbnail failure fallback = Option A (NULL `thumbnailStoragePath` + ▶️ icon placeholder). (11) Q14 test coverage = Option A (Hybrid per Rule 27).

**Corrections-log informational entry captured for the Rule 24 end-of-session catch on the §A.8 asymmetry-claim** (design doc wrongly claimed text + image forms force admin-page-first vocab creation; per Rule 3 code-wins, inline "+ Add new category" UX already shipped to text + image + URL surfaces per ROADMAP P-13 entry; caught + corrected before commit; demonstrates the safety value of the Rule 24 end-of-session re-check).

**2 NEW permanent feedback memories saved** per director's 2026-05-20-b standing directives: `feedback_destructive_ops_confirmation.md` (every handoff audits this-session + next-session for Rule 8 / Rule 9 / Rule 29 triggers) + `feedback_remaining_roadmap_summary.md` (every handoff includes a "What's left in the total roadmap" summary). `MEMORY.md` index updated. The `.claude/hooks/backup-memory-dir.sh` PostToolUse hook (shipped 2026-05-20 prior session) auto-mirrored both files into `/workspaces/brand-operations-hub/.codespace-backup/memory/` — first real-world validation of the 4-layer memory-loss-prevention architecture's MECHANICAL layer.

**Schema-change-in-flight flag stayed "No"** the entire session. **Per Rule 23 Change Impact Audit:** Additive (safe) — design + docs + 2 new memories only.

---

## Branch

**`workflow-2-competition-scraping`** — Build sessions stay on the feature branch; ff-merge to main only at /deploy stages (Build #1 does NOT ship to main — only the schema + bucket + helper land on the feature branch; the full P-27 Build arc ships via a future deploy session per design doc §A.2). The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping`; `main` at SHA `a754aee` (unchanged since 2026-05-20 deploy + doc-batch); workflow-2 ONE COMMIT AHEAD of main (this session's end-of-session doc-batch push). No ping-pong sync was needed at end of this session because main didn't move.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. Today's task:

**W#2 polish P-27 implementation #1 — Build session (schema + bucket + helper) on `workflow-2-competition-scraping`.** Closes **(a.54) RECOMMENDED-NEXT** (partial close — Build #1 lands the schema + bucket + helper only; subsequent Build sessions add API routes / extension UI / Playwright spec / deploy / verify per `docs/CAPTURED_VIDEOS_DESIGN.md` §A.2 implementation arc table).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-27 polish-backlog entry (line ~157 — annotated 2026-05-20-b with "✅ Design session 1 complete; Next stage = Build #1" + all 11 forced-picker outcomes).
- `docs/CAPTURED_VIDEOS_DESIGN.md` fully (the Group B doc shipped 2026-05-20-b containing the binding spec for P-27 — §A.7 CapturedVideo schema spec is the canonical source for the `prisma db push` migration; §A.9 bucket + size cap + thumbnail extraction is the canonical source for the bucket configuration; §A.2 implementation arc table is the canonical source for the Build session sequencing).
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-20-b entry (the cross-reference pointer to CAPTURED_VIDEOS_DESIGN).
- `prisma/schema.prisma` `CapturedImage` model (the sibling table to mirror — read its shape to inform the `CapturedVideo` migration).
- `prisma/schema.prisma` `VocabularyEntry` model (to verify whether the `type` column is an enum or a string — affects how the new `video-category` value is added).
- `src/lib/competition-storage.ts` (the sibling helper to mirror — read its shape to inform the `competition-video-storage.ts` helper).
- `docs/STACK_DECISIONS.md` §3 (the existing image-bucket pattern; the video bucket follows the same private + signed-URLs pattern with a larger 100 MB cap).
- `docs/HANDOFF_PROTOCOL.md` Rule 23 (Change Impact Audit — classify the schema change BEFORE coding) + Rule 8 (Pre-flight audit for destructive operations — `prisma db push` IS a Rule 8 trigger).
- `docs/CORRECTIONS_LOG.md` 2026-05-20-b §Entry (the INFORMATIONAL entry on the Rule 24 end-of-session catch — informational read for context on the new operational discipline).

**Task shape (Build session #1):**

1. **Pre-flight audit per Rule 8 + Rule 23.** `npx prisma db push` IS a Rule 8 destructive-operation trigger (touches the live database schema). Classify per Rule 23: ADDITIVE (safe) — new optional table + new enum value; no existing data affected; no rename / drop / type-change. Surface the Rule 8 pre-flight summary to director via AskUserQuestion BEFORE running `db push`:
   - What changes: new `CapturedVideo` table + new `VideoSourceType` enum + new `video-category` value added to existing VocabularyEntry `type` column.
   - What stays: all existing tables + columns + data + constraints unchanged.
   - Reversibility: drop the new table + remove the new enum value = full rollback (no migration to undo).
   - Risk: ZERO data loss risk (additive only); ZERO existing-consumer breakage risk (no consumers exist yet for the new table).
   - Director's approval shape: AskUserQuestion picker — Option A "Proceed (Additive, safe per Rule 23)" / Option B "Hold — let me review the schema diff first" / Option C "Cancel — re-pick task".

2. **Schema migration.** After Rule 8 pre-flight approval, write the `CapturedVideo` model + `VideoSourceType` enum + `video-category` VocabularyEntry value into `prisma/schema.prisma` per design doc §A.7 spec. Run `npx prisma db push` to apply. Verify via `npx prisma studio` (or a small `node:test` round-trip) that the new table exists + accepts a row with the canonical field set.

3. **Bucket verification.** Director's offline step (see Pre-session notes below) creates the `competition-scraping-videos` bucket via the Supabase dashboard BEFORE this session starts. At session start, verify the bucket exists by reading from `process.env.NEXT_PUBLIC_SUPABASE_URL` + a small `supabase.storage.getBucket('competition-scraping-videos')` round-trip in a one-off script (or surface to director via AskUserQuestion if the bucket isn't found).

4. **Helper wrapper.** Write `src/lib/competition-video-storage.ts` paralleling `src/lib/competition-storage.ts`. Exports: `requestVideoUploadUrl(projectId, urlId, mimeType, sizeBytes)` (Phase 1 — returns signed upload URL + bucket path) / `finalizeVideoUpload(projectId, urlId, bucketPath, metadata)` (Phase 3 — persists the CapturedVideo row + binds it to the storage object) / `getVideoSignedUrl(bucketPath, expiresInSeconds)` / `getVideoThumbnailUrl(bucketPath, expiresInSeconds)` / `deleteVideo(bucketPath)` / `wipeProjectVideos(projectId)`. Mirror the existing image helper's error-handling + retry + signed-URL TTL conventions.

5. **Test coverage (Rule 27 Hybrid).** Add node:test cases for the pure-helper portions of `competition-video-storage.ts` (URL-pattern validation; size-cap enforcement; MIME-type allowlist check). No Playwright spec this session — Playwright extension-context coverage arrives at Build session #6 per design doc §A.2.

6. **Scoreboard:** verify `npx tsc --noEmit` clean + `cd extensions/competition-scraping && npx tsc --noEmit` clean + `npm run build` clean (likely **53 routes still** — no new route this session unless the helper module is auto-discovered as a route; check) + src/lib node:test passes with new cases (expect **~540/540** ish — depends on cases added) + extension `npm test` unchanged (**428/428** — no extension source change this session) + Playwright **91/91** unchanged.

7. **Build commit on workflow-2** (no main push this session — Build #1 stays on feature branch). End-of-session doc-batch covers ROADMAP (P-27 polish-backlog annotation extended with "Build #1 complete: schema + bucket + helper") + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG (likely zero new entries) + NEXT_SESSION (rewritten for Build #2) + CAPTURED_VIDEOS_DESIGN §B 2026-05-21 entry (capturing any mid-build directives + the Rule 23 audit outcome).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** for any mid-build forced-pickers (e.g., if the existing `VocabularyEntry.type` column turns out to be a string vs. enum and the design doc didn't specify which), surface 2-4 plausible options + the recommended option + the rationale; default to the recommendation if director defers.

**Schema-change-in-flight flag:** FLIPS to "Yes" at session start (the `prisma db push` IS a schema change in flight). Flips back to "No" at end-of-session AFTER the Build #1 commit lands + the schema is verified-applied + no rollback is needed.

---

## Pre-session notes (offline steps for director between sessions)

**ONE required offline step — Supabase bucket creation BEFORE next session.**

Create the new Supabase Storage bucket `competition-scraping-videos` via the Supabase dashboard BEFORE the next Claude session starts. Step-by-step click-by-click:

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab in the left sidebar.
3. **"New bucket"** button (top-right).
4. **Name:** `competition-scraping-videos` (exact spelling — hyphens not underscores; matches the design doc §A.9 canonical bucket name).
5. **Public bucket** toggle = **OFF** (leave private — signed URLs only per design doc §A.9; no public access).
6. **File size limit:** **100 MB** (104857600 bytes — matches design doc §A.9 / §A.10 per-file size cap pick).
7. **Allowed MIME types:** `video/mp4, video/webm, video/quicktime` (comma-separated; no spaces inside the type names — matches design doc §A.9).
8. **Create** button.

The next Claude session will read this bucket via the new `competition-video-storage.ts` helper code and won't need to create it. If the bucket isn't found at session start, the next Claude session will surface to director via AskUserQuestion (Option A "I'll create it now" / Option B "Skip the bucket step this session and pivot to a different polish item").

**Optional offline reading for director:** `docs/CAPTURED_VIDEOS_DESIGN.md` §A.7 (CapturedVideo schema spec) + §A.9 (bucket configuration) + §A.2 (implementation arc table) — ~5-minute skim before the next session if director wants the full context on what Build #1 will land.

---

## 🛡️ Destructive-operation safety check for next session

**`npx prisma db push` IS a Rule 8 destructive-operation trigger** (touches live DB schema). Per Rule 23 Change Impact Audit, the operation is **ADDITIVE (safe)** — new optional table + new enum value; no existing data affected; no rename / drop / type-change. Schema-change-in-flight flag flips to "Yes" at session start. Rule 8 pre-flight audit WILL fire at session start via AskUserQuestion BEFORE the `db push` runs.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact (the 2 NEW memory files saved 2026-05-20-b are in both places). Critical files safe.

**NO Rule 9 (main deploy) trigger planned** this session — Build #1 stays on workflow-2 feature branch; no main push; no Vercel redeploy; no ping-pong sync. The Build arc's first deploy lands at a future Build session per design doc §A.2.

---

## Why this pointer was written this way (debug aid)

Today's session ran the full Workflow Requirements Interview per HANDOFF_PROTOCOL Rule 18 for P-27 Captured-videos feature — design-only, no code, no schema, no deploy. The §4 Step 1c forced-picker was NOT fired as a separate decision because the design doc §A.2 implementation arc table itself encodes the next-session pick: Build #1 (schema + bucket + helper) follows the design session directly. This is the canonical pattern for design-then-build sessions on new features per Rule 18.

Build #1's launch prompt is shaped around (a) running the Rule 8 pre-flight audit BEFORE the `prisma db push`, (b) writing the schema migration per design doc §A.7 spec, (c) verifying the new Supabase bucket exists (director's offline step), and (d) writing the helper wrapper. No code beyond the helper + the schema landing on workflow-2 — API routes + extension UI + Playwright spec arrive at Build sessions #2 through #6.

The 2026-05-20-b director-confirmed picks (11 forced-picker outcomes in design doc §A.0) are binding inputs to Build #1; do NOT re-litigate. The design doc §A.7 schema spec is the canonical source for the migration; Build #1 should not extend or modify the schema spec beyond what §A.7 already documents.

**Alternate next-session candidates if director shifts priorities at session start (after the P-27 design session lands + before Build #1):**

- **🚨 P-42 backup-memory-dir.sh hook investigation + fix (HIGH severity — STRONGLY RECOMMENDED before Build #1).** Captured 2026-05-20-b as a HIGH-severity gap in Layer 1 (Mechanical) of the P-41 4-layer memory-loss-prevention architecture. The PostToolUse hook didn't auto-fire for this session's 3 memory writes; backup mirror went stale; manually mirrored at end-of-session. Until investigated + fixed, every future session that writes memory files (e.g., new feedback memories captured mid-session) risks creating stale-mirror gaps that defeat the architecture's safety guarantee. Estimated ~1 session; LOW LOC; HIGH operational importance because it protects the substrate ALL future Claude sessions depend on. **Recommended pre-task for next session:** spend the first 20-30 min on P-42 diagnosis (add debug log to the hook + trigger a test memory write + inspect) — if root cause is quick to fix (mis-configured matcher / env var / etc.), ship the fix + then pivot to P-27 Build #1; if diagnosis reveals deeper issue, ship a defense-in-depth mirror-staleness canary as the SessionStart hook + capture full investigation as its own session.
- **P-26 below-fold full-page-scroll capture** (LOW-severity deferred large lift — currently the only remaining pre-graduation polish item alongside P-27's full Build arc; current workaround works; ~600-1000 LOC code-only session, no design needed). Recommended *only* if director wants to wrap the smaller-scope polish item BEFORE the design-heavy P-27 Build arc. Estimated 1-2 sessions.
- **Investigate the wxt-zip parent-process hang behavior session-over-session.** Multiple recent sessions have observed the hang (2026-05-19-f + 2026-05-19-g + 2026-05-21) interspersed with clean runs (2026-05-20). Worth a dedicated investigation session if it keeps recurring across future deploys.
- **Manual-add modal originalSrcUrl tack-on** (DEFERRED from 2026-05-19-e — trivial 1-line; could fold into any P-NN session or be its own sub-1-hour session).

Check `ROADMAP.md` for the canonical state.
