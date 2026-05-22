---
description: Run the canonical PLOS pre-deploy verification scoreboard. Reports tsc (root + extension) + npm run build route count + src/lib node:test + extension npm test + Playwright counts. Greens/reds with delta vs. baseline.
allowed-tools: Bash(npx:*), Bash(npm:*), Bash(node:*), Bash(cd:*), Bash(find:*), Bash(grep:*)
---

Run the canonical PLOS pre-deploy + post-merge verification scoreboard. This is the 6-check sequence every W#2 → main deploy session runs twice (once pre-deploy on workflow-N-slug, once post-merge on main).

## Run the 6 checks in parallel where independent, sequential where required

### Check 1: Root tsc

```bash
cd /workspaces/brand-operations-hub && npx tsc --noEmit 2>&1 | tail -5
```

Empty output = clean. Any error output = red.

### Check 2: Extension tsc

```bash
cd /workspaces/brand-operations-hub/extensions/competition-scraping && npx tsc --noEmit 2>&1 | tail -5
```

Empty output = clean. Any error output = red.

### Check 3: Extension node:test suite

```bash
cd /workspaces/brand-operations-hub/extensions/competition-scraping && npm test 2>&1 | tail -10
```

Look for the `ℹ tests N` + `ℹ pass N` lines. If `fail N` is non-zero, red.

### Check 4: src/lib node:test suite (server-side)

```bash
cd /workspaces/brand-operations-hub && node --test --experimental-strip-types $(find /workspaces/brand-operations-hub/src/lib -name '*.test.ts') 2>&1 | tail -10
```

Same shape as Check 3.

### Check 5: npm run build (Next.js)

```bash
cd /workspaces/brand-operations-hub && npm run build 2>&1 | tail -25
```

Look for `✓ Compiled successfully` line. Count visible routes via:

```bash
cd /workspaces/brand-operations-hub && npm run build 2>&1 | grep -E "^[├└─].*[ƒ○]" | wc -l
```

Expected: 57 routes (current baseline as of 2026-05-22-g). Drift up = new route added; drift down = route removed.

### Check 6: Playwright suite (chromium + extension projects)

```bash
cd /workspaces/brand-operations-hub && npm run test:e2e:all 2>&1 | tail -20
```

Reports per-spec results + final `N passed` count. Any `failed` line = red.

**NOTE on the extension Playwright suite:** the fixtures in `tests/playwright/extension/fixtures.ts` load the EXTENSION dist at `extensions/competition-scraping/.output/chrome-mv3/`. If you've edited extension source since the last build, you MUST rebuild the extension before running Playwright OR you'll exercise a stale build:

```bash
cd /workspaces/brand-operations-hub/extensions/competition-scraping && npm run build 2>&1 | tail -5
```

**KNOWN ISSUE:** `wxt build` writes the dist correctly at the ~5-second mark but the parent node process can hang indefinitely afterward. If the build process hangs >30 seconds AND the dist files are visible at `.output/chrome-mv3/manifest.json`, kill the process (`pkill -f "wxt build"`) — the dist artifact is valid. Captured to CORRECTIONS_LOG 2026-05-19-f + 2026-05-19-g.

## Report back to the user

After all 6 checks complete, present results in a table:

| Check | Result | vs. baseline |
|---|---|---|
| `npx tsc --noEmit` (root) | clean / N errors | unchanged / Δ |
| `npx tsc --noEmit` (extension) | clean / N errors | unchanged / Δ |
| `npm run build` (Next.js) | N routes, compiled successfully | unchanged / Δ |
| `src/lib` node:test | **N/N** | unchanged / +Δ / -Δ |
| extension `npm test` | **N/N** | unchanged / +Δ / -Δ |
| Playwright | **N/N** | unchanged / +Δ / -Δ |

Recent baselines (as of 2026-05-22-g):
- Root tsc: clean
- Extension tsc: clean
- npm run build: 57 routes
- src/lib node:test: 590/590
- extension `npm test`: 558/558
- Playwright: 94/94

Flag any red. Flag any unexpected delta (e.g., test count dropped — could indicate a deleted test).
