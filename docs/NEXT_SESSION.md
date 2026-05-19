# Next session

**Written:** 2026-05-19-d — `session_2026-05-19-d_w2-main-deploy-session-25-p16-sw-mv3-crash-diagnostics-DEPLOYED` (Claude Code; dual-branch — pre-deploy on `workflow-2-competition-scraping`, ff-merge + deploy on `main`, ping-pong sync after main push).

**For:** the next Claude Code session.

**Status of today's W#2 → main deploy session #25:** P-16 service worker MV3 crash diagnostics SHIPPED + DEPLOYED + REAL-CHROME WIRING-VERIFIED on vklf.com. Single-commit build-and-deploy session — pure defensive diagnostic instrumentation in `background.ts` + new `sw-error-logging.ts` pure helper + new `sw-error-logging.test.ts`. Build commit `07416d3` (3 files +199/-0); fast-forwarded clean onto main (`3132899..07416d3`); Vercel auto-redeploy web no-op. Doc-vs-code drift caught at session-start (ROADMAP P-16 said "wrap onMessage in try/catch" but the code already had that pattern; scope reframed BEFORE coding to the actually-load-bearing fix: global `self.addEventListener('unhandledrejection'/'error', ...)` listeners). Director real-Chrome wiring test PASS — SW DevTools console executed `Promise.reject(new Error('manual P-16 wiring test'))` → observed `[plos-cs-sw]` structured-payload line as expected. Pre-deploy + post-merge scoreboards both GREEN with extension `npm test` 358/358 (was 352; +6 new sw-error-logging cases). Fresh zip `plos-extension-2026-05-19-w2-deploy-25.zip` at repo root.

**Closes (a.46) RECOMMENDED-NEXT.** **HEADLINE: W#2 polish backlog is functionally complete on real Chrome.** P-16 was the last open W#2 polish item with concrete code-level work.

**(a.47) RECOMMENDED-NEXT = W#2 Tool Graduation per HANDOFF_PROTOCOL §4 Step 2 Scenario B on `main`** via §4 Step 1c forced-picker. Rationale per `feedback_recommendation_style.md` (most thorough/reliable): doc weight of W#2's polish backlog (`COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` is now ~3400 lines) blocks session-start reads for any cross-workflow work; the Data Contract is the artifact downstream W#3-#14 workflows will consume to know what W#2 produces; graduating now means future W#2 visits use lightweight Rule 22 graduated-tool re-entry instead of heavy doc-load.

---

## Branch

**`main`** — graduated tools live on main; the Tool Graduation Ritual produces the canonical doc set downstream tools will reference, so main is the right branch. The `./resume` script will switch you from `workflow-2-competition-scraping` (where today's deploy session ended) → `main`. Verify with `git branch --show-current` immediately after `./resume`; should be on `main`, not `workflow-2-competition-scraping`. If you're still on the workflow-2 branch after `./resume`, STOP and surface to director.

Expected branch state on entry: `main` exactly even with `origin/main` AND exactly even with `origin/workflow-2-competition-scraping`. Both branches at the same SHA after today's deploy-#25 main push + ping-pong sync + the end-of-session doc-batch push.

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**Run the W#2 Tool Graduation Ritual per HANDOFF_PROTOCOL §4 Step 2 Scenario B on `main`** (ROADMAP Active Tools (a.47) RECOMMENDED-NEXT). Goal: complete the outgoing-tool graduation deliverables for W#2 (Competition Scraping & Deep Analysis) — heavy multi-step ritual (~90-120 min). Closes (a.47) RECOMMENDED-NEXT.

Branch is `main`. Verify branch state with `git branch --show-current` before any doc reads — should be `main`. If you're still on `workflow-2-competition-scraping`, STOP and surface to director.

**Outgoing tool's graduation deliverables (steps 1-8 per HANDOFF_PROTOCOL §4 Step 2 Scenario B):**

1. **Split `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (+ `COMPETITION_SCRAPING_DESIGN.md` § B refinements) into:**
   - `COMPETITION_SCRAPING_ARCHIVE.md` — full history; loaded only if revisiting via Rule 22 graduated-tool re-entry. Contains all deploy-session #1 through #25 narratives + all session-by-session §B refinements + Waypoint #1 verification history + the original Workflow Requirements Interview §A from the design doc. Heavy doc (~3400+ lines from current backlog + design body). Header: link forward to Data Contract for downstream-consumer needs.
   - NEW `COMPETITION_SCRAPING_DATA_CONTRACT.md` — small, stable, **<200 lines target**. Contains: what downstream W#3-#14 workflows need to know to consume W#2 output. Sections: §1 Tables W#2 owns (CompetitorUrl / CapturedText / CapturedImage / CapturedSize — canonical column shapes, R/W flags, Human Reference Language for each field — to be finalized in step 3 below); §2 Chrome extension's BackgroundRequest envelope shape (for any future workflow that wants to consume from the extension); §3 Vocabulary table reuse pattern (W#2's vocabulary types — content-category, image-category, composition, embedded-text-style, tags — and how downstream tools can/should reuse vs. extend); §4 Known invariants (e.g., `source` enum values, slug-variant URL canonicalization, `clientId` idempotency contract); §5 Resume Prompt (the Rule 22 canonical re-entry launch prompt — filled in per Rule 22 template).

2. **Add §Resume Prompt section to the Data Contract** per Rule 22 canonical template — fills in the workflow-specific Step 1 (branch checkout `main` + pull) + Step 3 (launch prompt naming the specific revisit reason). The Resume Prompt is what future Claude Code sessions paste when returning to W#2 via Rule 22 (graduated-tool re-entry); it tells the next Claude to load the Data Contract + DESIGN + Archive TOC + Polish Backlog rather than the full Active doc.

3. **Conduct Data Capture Interview with director (Doc Architecture §5) — finalize Human Reference Language for every W#2 data item.** Per Rule 18 reciprocal output declaration: every data item W#2 captures should have a finalized HRL (what the director would naturally call it) + technical name. Examples: HRL "competitor product URL" vs. technical `CompetitorUrl.url`; HRL "what category of product this is (paid ad vs. organic)" vs. technical `CompetitorUrl.competitionCategory`; HRL "the product's name as displayed on the page" vs. technical `CompetitorUrl.productName`; etc. Cluster the interview in 3-5 question batches per Rule 18. The Data Contract §1 (Tables) gets these HRL fields filled in inline.

4. **Update `DATA_CATALOG.md`** — entries for W#2 data items move from "PROVISIONAL" to finalized HRL + Data Contract pointer. Each W#2 data item gets a finalized entry in DATA_CATALOG.md §6.W#2 (or wherever W#2's section lives).

5. **Update Cross-Tool Data Flow Map in `DATA_CATALOG.md` §7** — W#2's row gets fully filled in: data items produced (per step 3), R/W flags (W = W#2 writes; downstream W#3-#14 reads), downstream consumers identified or "TBD" if not yet declared. Any downstream workflow that has already declared a reciprocal output dependency on W#2 (per Rule 18 from their interview) gets the linkage made explicit.

6. **Move outstanding W#2 polish items into NEW `COMPETITION_SCRAPING_POLISH_BACKLOG.md` sidecar** — thin sidecar so the polish list doesn't lock W#2 in active state. Move ALL remaining open polish items (P-18 devcontainer Chromium libs ergonomic / P-22 Playwright cross-platform slices 2-4 / P-23 saved-URL dropdown side-by-side / P-24 saved-image indicator / P-25 captured-text haze indicator / P-26 below-fold full-page-scroll capture / any others currently OPEN in the verification backlog). The Active doc (`COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md`) is no longer needed and can be deleted from `/docs/` (its full history is preserved in `COMPETITION_SCRAPING_ARCHIVE.md`).

7. **Update `ROADMAP.md`** — W#2 row moves to ✅ COMPLETE in the Current Active Tools table; the polish-backlog sidecar is referenced. (a.47) flips to ✅ DONE; new (a.48) RECOMMENDED-NEXT opens (likely W#3 Therapeutic Strategy first session per Rule 18 — separate session — settled via §4 Step 1c forced-picker at end-of-session).

8. **Update `DOCUMENT_MANIFEST.md`** — Active doc archived (`COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` removed from Group B inventory); Data Contract + Archive + Polish Backlog added to Group B inventory; §Resume Prompt location documented.

**Incoming tool's setup deliverables (steps 9-16 per HANDOFF_PROTOCOL §4 Step 2 Scenario B) — DEFER to a separate session.** Per Rule 18 the Workflow Requirements Interview for the next workflow (likely W#3 Therapeutic Strategy) is heavy in its own right (~90-150 min); don't combine with W#2 graduation. End today's session at step 8 (W#2 ✅ COMPLETE on main); §4 Step 1c forced-picker at end-of-session picks the next session's focus (most likely W#3 Therapeutic Strategy first session, but director picks).

**Pre-build read list (in addition to mandatory start-of-session sequence):**

- `docs/HANDOFF_PROTOCOL.md` §4 Step 2 Scenario B — full Tool Graduation Ritual spec.
- `docs/HANDOFF_PROTOCOL.md` Rule 22 — Graduated-Tool Re-Entry Protocol + Resume Prompt template (step 2 above uses this).
- `docs/HANDOFF_PROTOCOL.md` Rule 18 — Workflow Requirements Interview (informs step 3's interview shape + reciprocal output declarations).
- `docs/HANDOFF_PROTOCOL.md` Rule 23 — Change Impact Audit (applies to any post-graduation revisits; reference for Data Contract design).
- `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — full read; will be split.
- `docs/COMPETITION_SCRAPING_DESIGN.md` — full read; §B refinements may merge into Archive; §A initial requirements informs Data Contract §1.
- `docs/COMPETITION_SCRAPING_STACK_DECISIONS.md` — confirm key invariants (e.g., per-platform host_permissions, `source` enum, two-phase upload contract) land in Data Contract §4.
- `docs/DATA_CATALOG.md` — current state of W#2 entries (where they go from PROVISIONAL → finalized in step 4).
- `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` — REFERENCE SHAPE for what a Data Contract looks like (W#1 graduated; its Data Contract is the canonical template).
- `docs/KEYWORD_CLUSTERING_ARCHIVE.md` — REFERENCE SHAPE for the Archive doc.
- `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` — REFERENCE SHAPE for the Polish Backlog sidecar.

**Per Rule 23 Change Impact Audit (pre-classify before code):** N/A — Tool Graduation is doc-organization work + Data Catalog updates + the Data Capture Interview, NOT code work. Zero `src/` / `extensions/` / `prisma/` / `tests/` changes expected.

**Verification scoreboard at end-of-session (sanity baseline since no code changes):**

- `npx tsc --noEmit` clean
- `npm run build` clean — 53 routes (unchanged)
- `src/lib` node:test 527/527 (unchanged)
- Extension `npm test` 358/358 (unchanged)
- Playwright 75/75 (unchanged)

**Deploy mechanics (cheat-sheet d — platform-wide doc-only):** single-branch on `main`; pull-rebase at session start; end-of-session doc-batch commit + Rule 9-gated push to `origin/main` (Vercel re-build is harmless no-op since no `src/` changes).

**Group A docs to update at end-of-session (PROJECTED — actual list depends on Data Capture Interview outcomes):** ROADMAP (header + (a.47) flipped ✅ DONE + new (a.48) RECOMMENDED-NEXT + W#2 row flipped to ✅ COMPLETE in Active Tools table); CHAT_REGISTRY; DOCUMENT_MANIFEST (Active doc out of Group B; Data Contract + Archive + Polish Backlog into Group B; §Resume Prompt location documented); CORRECTIONS_LOG (header bump + any new entries if process slips); DATA_CATALOG (W#2 PROVISIONAL → finalized entries + Cross-Tool Data Flow Map row); NEXT_SESSION (rewritten for next session — likely W#3 first session per Rule 18, settled via §4 Step 1c picker).

**Group B docs created at end-of-session:** NEW `COMPETITION_SCRAPING_DATA_CONTRACT.md` + NEW `COMPETITION_SCRAPING_ARCHIVE.md` + NEW `COMPETITION_SCRAPING_POLISH_BACKLOG.md`.

**Group B docs deleted at end-of-session:** `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (content moved into Archive); `COMPETITION_SCRAPING_DESIGN.md` (§A → Data Contract §1; §B → Archive). Old `COMPETITION_SCRAPING_STACK_DECISIONS.md` → likely retained as separate Group B doc OR rolled into Data Contract §4 invariants (director picks at session start).

**Schema-change-in-flight flag:** stays "No" for this entire session (doc reorganization only).

Start by running the mandatory start-of-session sequence.

## Pre-session notes (optional, offline steps to do between sessions)

Nothing to do offline. The Tool Graduation Ritual is fully in-Codespace + in-session. The Data Capture Interview (step 3) needs your input on Human Reference Language for each W#2 data item — Claude will cluster the interview in 3-5 question batches per Rule 18 so you can think through it incrementally; no preparation needed beyond being available to answer questions about how you'd naturally describe each W#2 data item.

## Why this pointer was written this way (debug aid)

Today's session was straightforward end-to-end. Originally scoped to ship P-16 (SW MV3 crash diagnostics) on `workflow-2-competition-scraping`. Drift caught at session start: ROADMAP P-16 narrative said "wrap onMessage async paths in try/catch" but `background.ts:191-211` already had that pattern. Scope reframed cleanly BEFORE coding to the actually-load-bearing fix: global `self.addEventListener('unhandledrejection'/'error', ...)` listeners that catch Supabase auto-refresh failures and any other top-level promise rejection. Director real-Chrome wiring test PASS via Hybrid Option C. Deploy session #25 single-commit ff-merge to main; ping-pong sync. **HEADLINE: P-16 was the LAST open W#2 polish item with concrete code-level work.** With it shipped + deployed + wiring-confirmed, W#2 (Competition Scraping) is functionally complete on the polish side. The natural next step is W#2 Tool Graduation — the heavy multi-step ritual that produces the canonical doc set (Data Contract + Archive + Polish Backlog sidecar) downstream workflows will consume.

**Alternate next-session candidates if director shifts priorities at session start:**

- W#3 Therapeutic Strategy first session per Rule 18 (Workflow Requirements Interview). Heavy lift (~90-150 min) but advances platform arc onto the next workflow. Bypasses W#2 graduation — that would land in a later session. Trade-off: every cross-workflow session until then carries the heavy W#2 doc-load.
- W#1 Keyword Clustering graduated-tool re-entry per Rule 22 — only if a Keyword Clustering issue surfaces from natural use. Light session if it's just exploration; heavier if it's a real fix or schema change.

Check `ROADMAP.md` for the canonical state.
