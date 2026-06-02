# Workflow Graduation Continuity — design + methodology

**Status:** ✅ BUILT 2026-06-02-d (`session_2026-06-02-d`) — methodology shipped: HANDOFF_PROTOCOL Rule 33 + DOCUMENTATION_ARCHITECTURE §5 Steps 7-8 + `docs/templates/WORKFLOW_PRIMER_TEMPLATE.md` + `docs/COMPETITION_SCRAPING_PRIMER.md` (W#2 first instance) + `./catch-up-workflow`. §1 is the director's verbatim directive (append-only).

**One-line goal:** when a workflow graduates, leave behind a reliable, file-backed "continuity primer" + a single paste-able catch-up command, so a future session can seamlessly re-enter that workflow to fix or extend it — without relying on Claude's memory files.

---

## §1 — Original director instructions (VERBATIM, append-only)

> **2026-06-02 (during the P-55 Phase 3 part 2 deploy gate — director redirected to a graduation-methodology directive):**
>
> "Since this is the first workflow we are graduating, I want us to introduce a methodology where you create documents and a primer for the situations where we might want to come back to the workflow to fix or add something, there should be a simple command that will instruct your model to go read a primer which should not only tell you exactly what we have coded into the workflow but also point you to other documents that give you our full code documentation, full functionality documentation and what rules we followed, what mistakes we wanted to avoid, etc such that this methodology is essentially the equivalent of continuing the work on that specific workflow seamlessly from the point we left off. Don't just rely on your memory files because you had once mistakenly deleted them. Everything should be in backed up files so that we can reliably access them. Also add this new rule to a central document that tells you how to graduate workflows in such a way. What you should be providing me with is a command after each workflow graduation that I can just paste into the codespaces terminal which will catch you up and bring us exactly to the point of seamless continuity I described."

### Verbatim requirements extracted (for traceability — NOT a substitute for §1)

1. A **methodology** for workflow graduation that produces **documents + a primer** for when we return to the workflow to fix/add something.
2. A **simple command** that instructs Claude to **go read a primer**.
3. The primer must tell Claude **exactly what is coded into the workflow** AND **point to** other docs giving: full **code documentation**, full **functionality documentation**, the **rules** we followed, the **mistakes** we wanted to avoid, etc.
4. Net effect = **seamless continuation** of that workflow from where we left off.
5. **Do NOT rely on memory files** (they were once mistakenly deleted) — everything in **reliably-accessible, backed-up files**.
6. Add this as a **new rule in a central document** describing how to graduate workflows this way.
7. After **each** graduation, hand the director **one paste-able Codespaces terminal command** that catches Claude up to seamless continuity.

---

## §2 — Joint-discussion adjustments (append-only, chronological)

- **2026-06-02-d — Primer shape (director AskUserQuestion pick): "Map + pointers, kept in sync."** The primer states what's coded + POINTS to the always-current deep docs; it does NOT re-state them inline (duplication drifts; pointers don't). As part of graduation, ensure the pointed-to docs exist + are complete.
- **2026-06-02-d — Command form:** the director asked for "a command I can paste into the codespaces terminal," so the catch-up surface is a **repo script `./catch-up-workflow <N>`** (the graduated-workflow analogue of `./resume-workflow`), not a Claude slash-command. It reuses the proven single-use `.claude/active-workflow-prompt.md` + SessionStart-hook injection mechanism.
- **2026-06-02-d — Central-doc home:** the new rule is **HANDOFF_PROTOCOL.md Rule 33**, with the Tool Graduation Ritual in **DOCUMENTATION_ARCHITECTURE.md §5** extended (Steps 7 + 8).
- **2026-06-02-d — Backup reliability:** git-tracked `docs/` already lives under `/workspaces/` (survives container rebuilds, unlike the home-dir memory that was once wiped — Rule 29). So no separate `.codespace-backup/` mirror is needed for the primer/template/docs; git is the reliable backup. (This directly answers the director's "don't rely on memory files" concern.)
- **2026-06-02-d — First instance = W#2.** Built the methodology generically AND produced W#2's primer (`docs/COMPETITION_SCRAPING_PRIMER.md`) + registered `./catch-up-workflow 2` as the first real instance.

---

## §3 — Current consolidated spec (rolled-up source-of-truth)

**Deliverables (all shipped 2026-06-02-d):**
1. **Rule 33** in `docs/HANDOFF_PROTOCOL.md` — the methodology (the two artifacts + the at-graduation protocol).
2. **`docs/DOCUMENTATION_ARCHITECTURE.md` §5 Steps 7 + 8** — fold the primer + catch-up command into the Tool Graduation Ritual.
3. **`docs/templates/WORKFLOW_PRIMER_TEMPLATE.md`** — the reusable map+pointers template.
4. **`docs/COMPETITION_SCRAPING_PRIMER.md`** — W#2's filled-in primer (first instance).
5. **`./catch-up-workflow <N>`** — the paste-able re-entry command (W#2 registered).

**How re-entry works:** director pastes `./catch-up-workflow 2` → script checks out `workflow-2-competition-scraping`, pulls, writes a single-use launch prompt to `.claude/active-workflow-prompt.md`, and `exec claude`. The SessionStart hook injects the prompt; on the director's first keystroke the session reads `docs/COMPETITION_SCRAPING_PRIMER.md`, follows its pointers as the task needs, and produces a drift check + plain-terms state summary before the director names the specific fix/addition.

### Pre-existing machinery this builds on (do NOT duplicate)
- **DOCUMENTATION_ARCHITECTURE.md §5 — Tool Graduation Ritual** (split Active doc → `<TOOL>_ARCHIVE.md` + `<TOOL>_DATA_CONTRACT.md`; data-capture interview; next-tool setup).
- **HANDOFF_PROTOCOL.md Rule 22** — active-doc split on graduation.
- **MULTI_WORKFLOW_PROTOCOL.md** — branch strategy, `./resume`, the "Current Active Tools" table (✅ Graduated status), §7 new-workflow start, §11 session-start procedure.
- **The `./resume` / `./resume-workflow <N>` scripts** + `docs/NEXT_SESSION.md` pointer — the existing one-command session-start (for the CURRENTLY-active workflow). The new "catch-up" command is the GRADUATED-workflow re-entry analogue.
- **Rule 29 + `.codespace-backup/`** — the backup architecture that answers the "don't rely on memory" concern.

---

## §4 — Open questions

- **Q1 — Primer scope/depth — ✅ RESOLVED 2026-06-02-d:** map + pointers, kept in sync (director pick). See §2.
- **Q2 — Catch-up command shape — ✅ RESOLVED 2026-06-02-d:** repo script `./catch-up-workflow <N>` (paste-able terminal command). See §2.
- **Q3 — Central-doc home — ✅ RESOLVED 2026-06-02-d:** HANDOFF_PROTOCOL Rule 33 + DOCUMENTATION_ARCHITECTURE §5 Steps 7-8.
- **Q4 — Backup reliability — ✅ RESOLVED 2026-06-02-d:** git-tracked `docs/` under `/workspaces/` is the reliable backup (survives container rebuild); no `.codespace-backup/` mirror needed.
- **Q5 — Apply to W#2 now — ✅ RESOLVED 2026-06-02-d:** done — `docs/COMPETITION_SCRAPING_PRIMER.md` + `./catch-up-workflow 2`.
- **OPEN (low priority) — W#1 backfill:** optionally write `docs/KEYWORD_CLUSTERING_PRIMER.md` + register `./catch-up-workflow 1` to bring the already-graduated W#1 under Rule 33 (today W#1 re-entry uses Rule 22 + `KEYWORD_CLUSTERING_DATA_CONTRACT.md` §7 via `./resume-workflow 1`).
- **OPEN — formal W#2 graduation:** Rule 33's primer is in place, but the §5 Archive/Data-Contract split for W#2 (`COMPETITION_SCRAPING_DESIGN.md` → archive + a `COMPETITION_SCRAPING_DATA_CONTRACT.md`) is not yet done; do it when W#2 formally graduates. The primer already points at the current design docs in the meantime.

---

## §5 — Cross-references
- `docs/DOCUMENTATION_ARCHITECTURE.md` §5 · `docs/HANDOFF_PROTOCOL.md` Rule 22 + Rule 29 · `docs/MULTI_WORKFLOW_PROTOCOL.md` · `docs/ROADMAP.md` (W#2 graduation).
