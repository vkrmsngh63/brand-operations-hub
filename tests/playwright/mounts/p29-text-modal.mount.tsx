// P-30 stub-page mount: W#2 P-29 Slice #2 captured-text modal.
// See p29-url-modal.mount.tsx for the rig pattern.

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CapturedTextAddModal } from '@/app/projects/[projectId]/competition-scraping/components/CapturedTextAddModal';
import type { CapturedText } from '@/lib/shared-types/competition-scraping';

declare global {
  interface Window {
    __testText: {
      openModal: () => void;
      closeModal: () => void;
      getRows: () => CapturedText[];
      getSuccessCount: () => number;
    };
    __testTextParams?: {
      projectId?: string;
      urlId?: string;
      seedRows?: CapturedText[];
    };
  }
}

const STATE = {
  setOpen: null as ((v: boolean) => void) | null,
  setRows: null as ((updater: (prev: CapturedText[]) => CapturedText[]) => void) | null,
  rows: [] as CapturedText[],
  successCount: 0,
};

function Wrapper() {
  const params = window.__testTextParams ?? {};
  const projectId = params.projectId ?? 'test-project-id';
  const urlId = params.urlId ?? 'test-url-id';
  const seedRows = params.seedRows ?? [];

  const [isOpen, setIsOpen] = useState(false);
  const [rows, setRows] = useState<CapturedText[]>(seedRows);
  STATE.setOpen = setIsOpen;
  STATE.setRows = setRows;
  STATE.rows = rows;

  // clientId-dedup prepend — mirrors UrlDetailContent.handleTextAdded.
  const handleSuccess = (row: CapturedText) => {
    setRows((prev) => {
      const existingIndex = prev.findIndex((r) => r.clientId === row.clientId);
      if (existingIndex >= 0) {
        const next = prev.slice();
        next[existingIndex] = row;
        return next;
      }
      return [row, ...prev];
    });
    STATE.successCount += 1;
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Captured Text ({rows.length})</h2>
        <button
          type="button"
          data-testid="manual-add-captured-text-button"
          onClick={() => setIsOpen(true)}
        >
          + Manually add captured text
        </button>
      </div>
      <ul data-testid="captured-text-list">
        {rows.map((r) => (
          <li
            key={r.id}
            data-testid="captured-text-row"
            data-client-id={r.clientId}
          >
            {r.text}
          </li>
        ))}
      </ul>
      <CapturedTextAddModal
        projectId={projectId}
        urlId={urlId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

window.__testText = {
  openModal: () => STATE.setOpen?.(true),
  closeModal: () => STATE.setOpen?.(false),
  getRows: () => STATE.rows,
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
