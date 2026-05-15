// P-30 stub-page mount: W#2 P-29 Slice #1 URL modal.
//
// This file is bundled by tests/playwright/build-bundle.mjs into
// tests/playwright/dist/p29-url-modal.bundle.js and loaded by the
// static HTML page tests/playwright/pages/p29-url-modal.html.
//
// The wrapper renders the trigger button + the real production
// UrlAddModal so Playwright can drive opening / closing / submit.
// Network calls go through authFetch → real window.fetch, so each
// test installs a page.route() interceptor to capture POST bodies
// and shape the response.
//
// Window test hooks installed:
//   - window.__test.openModal()      — opens the modal programmatically
//   - window.__test.closeModal()     — closes it
//   - window.__test.getLastRow()     — returns the last onSuccess row
//   - window.__test.getSuccessCount()— number of onSuccess invocations

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { UrlAddModal } from '@/app/projects/[projectId]/competition-scraping/components/UrlAddModal';
import type {
  CompetitorUrl,
  Platform,
} from '@/lib/shared-types/competition-scraping';

declare global {
  interface Window {
    __test: {
      openModal: () => void;
      closeModal: () => void;
      getLastRow: () => CompetitorUrl | null;
      getSuccessCount: () => number;
    };
    __testParams?: {
      projectId?: string;
      defaultPlatform?: Platform;
    };
  }
}

const STATE = {
  setOpen: null as ((v: boolean) => void) | null,
  lastRow: null as CompetitorUrl | null,
  successCount: 0,
};

function Wrapper() {
  const [isOpen, setIsOpen] = useState(false);
  STATE.setOpen = setIsOpen;

  const params = window.__testParams ?? {};
  const projectId = params.projectId ?? 'test-project-id';
  const defaultPlatform = params.defaultPlatform;

  return (
    <div>
      <button
        type="button"
        data-testid="manual-add-url-button"
        onClick={() => setIsOpen(true)}
      >
        + Manually add URL
      </button>
      <UrlAddModal
        projectId={projectId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={(row) => {
          STATE.lastRow = row;
          STATE.successCount += 1;
        }}
        defaultPlatform={defaultPlatform}
      />
    </div>
  );
}

window.__test = {
  openModal: () => STATE.setOpen?.(true),
  closeModal: () => STATE.setOpen?.(false),
  getLastRow: () => STATE.lastRow,
  getSuccessCount: () => STATE.successCount,
};

const mountEl = document.getElementById('mount');
if (mountEl) {
  createRoot(mountEl).render(
    <StrictMode>
      <Wrapper />
    </StrictMode>,
  );
}
