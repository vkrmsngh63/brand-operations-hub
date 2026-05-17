// P-28 stub-page mount: ConfirmDeleteDialog isolated regression.
//
// Bundled by tests/playwright/build-bundle.mjs into
// tests/playwright/dist/p28-confirm-delete-dialog.bundle.js and loaded
// by tests/playwright/pages/p28-confirm-delete-dialog.html.
//
// Renders an "Open dialog" trigger button + the real ConfirmDeleteDialog.
// Test hooks on window.__test let each spec drive the dialog's variant +
// cascade-count state + onConfirm resolution shape so the dialog's full
// behavior matrix (plain / cascade-loading / cascade-ready / cascade-error
// / confirm-error / dismiss) can be exercised in real Chromium.

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ConfirmDeleteDialog,
  type CascadeCounts,
} from '@/app/projects/[projectId]/competition-scraping/components/ConfirmDeleteDialog';

type Variant =
  | { kind: 'plain' }
  | {
      kind: 'cascade';
      counts: CascadeCounts | null;
      countsError: string | null;
    };

declare global {
  interface Window {
    __test: {
      openDialog: () => void;
      closeDialog: () => void;
      setVariant: (v: Variant) => void;
      setOnConfirmShape: (
        shape: 'success' | { error: string } | 'never-resolve'
      ) => void;
      getConfirmCount: () => number;
      getCloseCount: () => number;
    };
    __pageReady?: boolean;
  }
}

const STATE = {
  setOpen: null as ((v: boolean) => void) | null,
  setVariant: null as ((v: Variant) => void) | null,
  setShape: null as
    | ((s: 'success' | { error: string } | 'never-resolve') => void)
    | null,
  confirmCount: 0,
  closeCount: 0,
};

function Wrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const [variant, setVariant] = useState<Variant>({ kind: 'plain' });
  const [shape, setShape] = useState<
    'success' | { error: string } | 'never-resolve'
  >('success');
  STATE.setOpen = setIsOpen;
  STATE.setVariant = setVariant;
  STATE.setShape = setShape;

  return (
    <div>
      <button
        type="button"
        data-testid="open-dialog-button"
        onClick={() => setIsOpen(true)}
      >
        Open dialog
      </button>
      <ConfirmDeleteDialog
        isOpen={isOpen}
        title="Delete this thing?"
        message="This cannot be undone."
        confirmLabel="Delete thing"
        variant={variant}
        onClose={() => {
          STATE.closeCount += 1;
          setIsOpen(false);
        }}
        onConfirm={async () => {
          STATE.confirmCount += 1;
          if (shape === 'success') {
            // Parent typically calls onClose() after success — we close
            // here to mirror the production parent's behavior.
            setIsOpen(false);
            return;
          }
          if (shape === 'never-resolve') {
            await new Promise(() => {
              /* never resolves — simulates an in-flight request */
            });
            return;
          }
          throw new Error(shape.error);
        }}
      />
    </div>
  );
}

window.__test = {
  openDialog: () => STATE.setOpen?.(true),
  closeDialog: () => STATE.setOpen?.(false),
  setVariant: (v) => STATE.setVariant?.(v),
  setOnConfirmShape: (s) => STATE.setShape?.(s),
  getConfirmCount: () => STATE.confirmCount,
  getCloseCount: () => STATE.closeCount,
};

const mountEl = document.getElementById('mount');
if (mountEl) {
  createRoot(mountEl).render(
    <StrictMode>
      <Wrapper />
    </StrictMode>,
  );
}
