// P-30 stub-page mount: W#2 P-29 Slice #3 captured-image modal.
// See p29-url-modal.mount.tsx for the rig pattern.

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CapturedImageAddModal } from '@/app/projects/[projectId]/competition-scraping/components/CapturedImageAddModal';
import { authFetch } from '@/lib/authFetch';
import type { CapturedImage } from '@/lib/shared-types/competition-scraping';

declare global {
  interface Window {
    __testImage: {
      openModal: () => void;
      closeModal: () => void;
      getRows: () => CapturedImage[];
      getSuccessCount: () => number;
      getRefreshCallCount: () => number;
    };
    __testImageParams?: {
      projectId?: string;
      urlId?: string;
      seedRows?: CapturedImage[];
    };
  }
}

const STATE = {
  setOpen: null as ((v: boolean) => void) | null,
  setRows: null as ((updater: (prev: CapturedImage[]) => CapturedImage[]) => void) | null,
  rows: [] as CapturedImage[],
  successCount: 0,
  refreshCallCount: 0,
};

function Wrapper() {
  const params = window.__testImageParams ?? {};
  const projectId = params.projectId ?? 'test-project-id';
  const urlId = params.urlId ?? 'test-url-id';
  const seedRows = params.seedRows ?? [];

  const [isOpen, setIsOpen] = useState(false);
  const [rows, setRows] = useState<CapturedImage[]>(seedRows);
  STATE.setOpen = setIsOpen;
  STATE.setRows = setRows;
  STATE.rows = rows;

  // Mirrors UrlDetailContent.refreshImages — re-fetches the gallery list
  // after a successful save so server-minted signed URLs land in state.
  const refreshImages = async () => {
    STATE.refreshCallCount += 1;
    try {
      const res = await authFetch(
        `/api/projects/${projectId}/competition-scraping/urls/${urlId}/images`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as CapturedImage[];
      setRows(data);
    } catch {
      // Intentional swallow — refresh is best-effort.
    }
  };

  const handleSuccess = (row: CapturedImage) => {
    STATE.successCount += 1;
    setRows((prev) => [row, ...prev]);
    // Fire refresh in the next tick to match UrlDetailContent's ordering.
    void refreshImages();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Captured Images ({rows.length})</h2>
        <button
          type="button"
          data-testid="manual-add-captured-image-button"
          onClick={() => setIsOpen(true)}
        >
          + Manually add captured image
        </button>
      </div>
      <ul data-testid="captured-image-list">
        {rows.map((r) => (
          <li
            key={r.id}
            data-testid="captured-image-row"
            data-client-id={r.clientId}
          >
            {r.id}
          </li>
        ))}
      </ul>
      <CapturedImageAddModal
        projectId={projectId}
        urlId={urlId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

window.__testImage = {
  openModal: () => STATE.setOpen?.(true),
  closeModal: () => STATE.setOpen?.(false),
  getRows: () => STATE.rows,
  getSuccessCount: () => STATE.successCount,
  getRefreshCallCount: () => STATE.refreshCallCount,
};

const mountEl = document.getElementById('mount');
if (mountEl) {
  createRoot(mountEl).render(
    <StrictMode>
      <Wrapper />
    </StrictMode>,
  );
}
