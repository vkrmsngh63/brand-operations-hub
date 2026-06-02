# P-58 — The "Download Extension (zip)" box should serve the LATEST extension build

**Status:** 🟡 IN-PROGRESS 2026-06-02-f (`session_2026-06-02-f_p58-download-extension-zip-latest-build`) — spec created as the session's first artifact per Rule 31. W#2 Competition Scraping; in-app extension-download surface. NO schema change anticipated. _(Captured 2026-06-02-d as ROADMAP entry P-58; this spec doc created 2026-06-02-f — it did not exist before.)_

**Severity:** MEDIUM — today the in-app download button serves **nothing** (a dead placeholder anchor); workers cannot get the extension from the app at all, and any future "latest build" must not go stale.

---

## §1 — Original director instructions (VERBATIM, append-only)

> **2026-06-02-d:** "The download button in the 'Download Extension (zip)' box should update the files to the latest extension files."

### Plain restatement (for traceability — NOT a substitute for §1)

The in-app **"Download Extension (zip)"** box (rendered inside `<DeliverablesArea>` on the Competition Scraping workflow page) must let a user download the **newest** built Chrome extension — including the P-56 Amazon flicker fix and every future build — without anyone hand-building and hand-distributing a sideload zip each time.

---

## §2 — Joint-discussion adjustments (append-only, chronological)

- **2026-06-02-f — Rule 3 code-truth audit (done before any design):**
  - The box lives in `src/app/projects/[projectId]/competition-scraping/page.tsx` (~L209) as a `<CompanionDownload label="Download Extension (zip)" url="#download-extension-pending" description="…" />`. **The `url` is a dead placeholder (`#download-extension-pending`) — today the button downloads nothing.** (The original capture assumed a "stale committed artifact"; the truth is it was never wired at all.)
  - `CompanionDownload` (`src/lib/workflow-components/companion-download.tsx`) is a frozen 3-prop component (`label` / `url` / `description`) that renders an `<a href={url} target="_blank">↓ Download</a>`. It is presentational only — it says nothing about how the artifact is produced. Wiring P-58 means giving it a real `url` that resolves to the freshest build; the component itself needs no change.
  - The extension is built + zipped via `cd extensions/competition-scraping && npm run zip` → `extensions/competition-scraping/scripts/wxt-zip.mjs` (programmatic wxt `zip()` wrapper; P-44 force-exit) → output `extensions/competition-scraping/.output/competition-scraping-extension-0.1.0-chrome.zip` (~218 KB).
  - The deploy flow (`/deploy` Step 8) currently `rm -rf .output && npm run zip` then `cp …/.output/…-chrome.zip plos-extension-<date>-w2-deploy-<N>.zip` at **repo root**, and the director downloads that from the Codespaces file tree + sideloads by hand. **P-58 should redirect that same fresh-zip step to a web-served location and wire the button to it.**
  - Next.js serves static files from `public/` (e.g. `public/competition-scraping/guide-screenshots/`). A file at `public/competition-scraping/<name>.zip` is reachable on vklf.com at `/competition-scraping/<name>.zip`.
  - **Why Vercel can't build the extension at web-build time:** the extension is a separate toolchain (wxt 0.20.x + Vite 8 + Rolldown) with its own `node_modules` under `extensions/competition-scraping/`; `npm run build` (the Next.js/Vercel build) does NOT build the extension. So "always latest" must come from a deploy-time committed artifact, NOT from the Vercel build running wxt. _(See §4 Q1 design fork.)_

---

## §3 — Current consolidated spec (rolled-up source-of-truth)

**Goal:** the in-app "Download Extension (zip)" button always serves the newest built extension, refreshed as part of the normal deploy flow, with no per-build re-wiring.

**Likely shape (pending the §4 Q1 design decision WITH the director):**
1. **Stable served artifact** — the freshest extension zip lives at a STABLE web path (proposed `public/competition-scraping/plos-extension-latest.zip`) so the button URL never has to change build-to-build.
2. **Wire the button** — `page.tsx` `CompanionDownload url` → `/competition-scraping/plos-extension-latest.zip` (a real download, `download` semantics). The `#download-extension-pending` placeholder is removed.
3. **Refresh-on-deploy** — the `/deploy` Step 8 fresh-zip step copies the built `.output` zip to `public/competition-scraping/plos-extension-latest.zip` and that file is committed with the build commit so Vercel serves the new bytes on the next deploy. The existing repo-root `plos-extension-<date>-w2-deploy-<N>.zip` sideload artifact MAY be kept (for the director's manual sideload) or replaced by the in-app download.
4. **(Optional nicety, design-dependent)** surface the build version/date next to the button so the user can see how fresh it is.

**No schema change. No AI-model code. Likely NO new route** (static `public/` asset). If the director prefers a dynamic serving route (Q1 Option C), a new `+1` route is added.

**Verification:** director downloads the zip from the app on vklf.com → confirms it is the newest build (e.g. contains the P-56 flicker fix). Check 6 Playwright SKIPPED per Rule 27 (file-download + visual judgment).

---

## §4 — Open questions (resolve BEFORE / DURING code; Rule 14f where a real fork)

- **Q1 (THE design fork) — where does "the latest build" live + how does the download stay current?**
  - **Option A (RECOMMENDED) — committed `public/` artifact refreshed at deploy:** the `/deploy` fresh-zip step writes the built zip to `public/competition-scraping/plos-extension-latest.zip`, committed with the build commit; the button points at the stable path. MOST RELIABLE: always matches the deployed build, no Vercel cross-toolchain build, reuses the existing deploy step, stable URL = no re-wiring. Cost: ~218 KB binary added to git history per extension deploy.
  - **Option B — Vercel builds the extension at web-build time:** add an extension `build → zip → copy into public/` step to the Next.js/Vercel build. Avoids git binary bloat. RISK: runs the separate wxt/Vite/Rolldown toolchain inside Vercel's build (extra install + the P-44 hang class); fragile + slower builds. NOT recommended.
  - **Option C — dynamic download route:** an API route streams the latest zip on request. Overkill; Vercel serverless cannot run wxt; needs the bytes to already exist somewhere → collapses back to A. NOT recommended.
- **Q2 — keep the dated repo-root sideload zip too?** Whether to ALSO keep producing `plos-extension-<date>-w2-deploy-<N>.zip` at repo root (director's current manual sideload path) once the in-app download is live, or retire it. (Lean: keep it short-term; the in-app download is additive.)
- **Q3 — show the build version/date by the button?** Nice-to-have surfacing of freshness; defer unless the director wants it now.

---

## §5 — Cross-references

- `src/app/projects/[projectId]/competition-scraping/page.tsx` — the box render site (placeholder URL to wire).
- `src/lib/workflow-components/companion-download.tsx` — the frozen 3-prop `CompanionDownload` component (PLATFORM_REQUIREMENTS.md §12.6 pattern #3).
- `extensions/competition-scraping/scripts/wxt-zip.mjs` + `wxt.config.ts` — the build/zip toolchain producing `.output/competition-scraping-extension-0.1.0-chrome.zip`.
- `.claude/commands/deploy.md` Step 8 — the existing fresh-zip step to redirect.
- `docs/COMPETITION_SCRAPING_DESIGN.md` — extension build/distribution design.
- `docs/ROADMAP.md` P-58 — the captured directive.
