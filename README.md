This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Running the Playwright regression tests

The repo has two Playwright projects, each at its own directory under `tests/playwright/`:

- **`chromium`** (the P-17 authFetch suite, added 2026-05-14). Specs at `tests/playwright/*.spec.ts`. Loads the production `authFetch` wiring into a real Chromium browser and asserts the wrapper does not throw `TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation` — the regression class fixed by commit `08f10e5`.
- **`extension`** (the P-14 highlight-flashing harness, added 2026-05-12). Specs at `tests/playwright/extension/*.spec.ts`. Uses `chromium.launchPersistentContext` + `--load-extension` to load the freshly-built competition-scraping Chrome extension into a real Chromium browser, then route-intercepts `*.amazon.com` to serve a local mock product page. The smoke test verifies harness mechanics; the regression test observes `<mark>` element churn after the initial highlight paint and is currently `test.fail`-annotated because P-14 itself is still OPEN — when the P-14 fix lands, the now-passing regression test will trigger Playwright's "Expected to fail, but passed" signal, telling the next developer to remove the annotation.

```bash
# Run the original chromium project (authFetch P-17)
npm run test:e2e

# Run the extension project (P-14 harness — requires a fresh
# extension build at extensions/competition-scraping/.output/chrome-mv3/)
npm run test:e2e:ext

# Run both projects sequentially
npm run test:e2e:all
```

**Building the extension before running `test:e2e:ext`.** The harness loads whatever bundle is at `extensions/competition-scraping/.output/chrome-mv3/`. Build it via:

```bash
cd extensions/competition-scraping && npx wxt build
```

Note: per `docs/CORRECTIONS_LOG.md` 2026-05-10-f, `wxt build` may hang the parent shell after artifacts are written. The build is complete once `.output/chrome-mv3/manifest.json` + `assets/` + `chunks/` all exist; you can kill the hung process safely with `pkill -f "wxt build"` after that.

**First-time setup on a fresh Codespace.** The default Codespaces Ubuntu 24.04 image ships without the GTK/X11 system libraries Chromium needs at runtime. Playwright's normal `npx playwright install --with-deps chromium` fails because `/etc/apt/sources.list.d/yarn.list` has an unverifiable GPG signature blocking `apt update`. Workaround:

```bash
# 1. Install the Chromium browser binary into ~/.cache/ms-playwright/
npm run test:e2e:install

# 2. Temporarily move yarn.list aside so apt can update
sudo mv /etc/apt/sources.list.d/yarn.list /etc/apt/sources.list.d/yarn.list.disabled

# 3. Install the system libs Chromium needs
sudo apt-get update
sudo apt-get install -y libnss3 libatk1.0-0t64 libatk-bridge2.0-0t64 libcups2t64 \
  libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libpango-1.0-0 \
  libcairo2 libasound2t64 libatspi2.0-0t64 libxfixes3 libxshmfence1 libxss1 \
  libxtst6 libnspr4 libdrm2 libwayland-client0 libwayland-egl1 libwayland-cursor0 \
  libgdk-pixbuf-2.0-0 libnotify4 libdbus-1-3 libexpat1

# 4. Restore yarn.list
sudo mv /etc/apt/sources.list.d/yarn.list.disabled /etc/apt/sources.list.d/yarn.list

# 5. Now the tests run cleanly
npm run test:e2e
```

Codespaces system-package state does not persist across rebuilds, so the lib install needs repeating each fresh Codespace. A permanent fix via `.devcontainer/devcontainer.json` `postCreateCommand` is tracked as ROADMAP polish item P-18.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
