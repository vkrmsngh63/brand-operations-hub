#!/usr/bin/env bash
# install-playwright-deps.sh — invoked by .devcontainer/devcontainer.json's
# postCreateCommand on fresh Codespace creation. Installs the system libraries
# Chromium needs at runtime so that `npm run test:e2e:all` runs zero-touch
# on a brand-new Codespace.
#
# Mirrors the manual workaround documented in README.md §"Running the Playwright
# regression tests". Idempotent — safe to re-run by hand from any Codespace as
# a recovery tool if the postCreateCommand didn't fire for any reason.
#
# Why this script exists: the default Codespaces Ubuntu 24.04 image ships
# without Chromium's GTK/X11 system libraries. Playwright's official
# `--with-deps` shortcut doesn't work in this Codespace because
# /etc/apt/sources.list.d/yarn.list has an unverifiable GPG signature that
# blocks `apt update`. This script disables yarn.list during the install
# and restores it after — including on failure, via the EXIT trap below.
#
# Captured as ROADMAP polish item P-18; shipped 2026-05-21.

set -euo pipefail

YARN_LIST="/etc/apt/sources.list.d/yarn.list"
YARN_LIST_DISABLED="${YARN_LIST}.disabled"

# Always restore yarn.list on exit (success or failure). Protects against
# leaving the Codespace's apt source list in a half-disabled state if the
# apt-get steps below are interrupted.
restore_yarn_list() {
  if [ -f "${YARN_LIST_DISABLED}" ]; then
    sudo mv "${YARN_LIST_DISABLED}" "${YARN_LIST}"
    echo "[install-playwright-deps] Restored ${YARN_LIST}"
  fi
}
trap restore_yarn_list EXIT

echo "[install-playwright-deps] Step 1/3 — Downloading Chromium browser binary into ~/.cache/ms-playwright/..."
npm run test:e2e:install

echo "[install-playwright-deps] Step 2/3 — Disabling yarn.list to bypass GPG block on apt update..."
if [ -f "${YARN_LIST}" ]; then
  sudo mv "${YARN_LIST}" "${YARN_LIST_DISABLED}"
fi

echo "[install-playwright-deps] Step 3/3 — Installing Chromium system libraries..."
sudo apt-get update
sudo apt-get install -y \
  libnss3 libatk1.0-0t64 libatk-bridge2.0-0t64 libcups2t64 \
  libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 \
  libpango-1.0-0 libcairo2 libasound2t64 libatspi2.0-0t64 \
  libxfixes3 libxshmfence1 libxss1 libxtst6 libnspr4 libdrm2 \
  libwayland-client0 libwayland-egl1 libwayland-cursor0 \
  libgdk-pixbuf-2.0-0 libnotify4 libdbus-1-3 libexpat1

echo "[install-playwright-deps] Done. Verify with: npm run test:e2e:all"
