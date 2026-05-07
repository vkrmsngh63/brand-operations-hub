// "Already saved" detail-page overlay per COMPETITION_SCRAPING_DESIGN.md §B
// 2026-05-07-g end-of-session addendum item 2.
//
// When the user navigates TO a competitor URL whose normalized URL matches
// a saved CompetitorUrl for the current Project, this overlay renders as
// a top-right floating banner reading "✓ This URL is already in your
// project". Auto-dismisses after 5 seconds OR on click-to-X.
//
// Placement decision (Rule-15 autonomous, surfaced in §B addendum item 2):
// top-right floating banner. Reasoning: visible without obscuring the
// product image area (which is typically center/left on every platform),
// matches Chrome's own native notification placement, dismissible without
// interfering with the page's primary actions.

const AUTO_DISMISS_MS = 5000;

export interface AlreadySavedOverlay {
  destroy(): void;
}

let activeOverlay: AlreadySavedOverlay | null = null;

/**
 * Shows the "already saved" overlay. Subsequent calls before the prior
 * overlay self-dismisses replace the current overlay (e.g., if the user
 * navigates to a different saved URL via SPA routing). Returns the
 * overlay handle for explicit teardown if needed.
 */
export function showAlreadySavedOverlay(
  projectName: string | null,
): AlreadySavedOverlay {
  if (activeOverlay !== null) {
    activeOverlay.destroy();
    activeOverlay = null;
  }

  const banner = document.createElement('div');
  banner.className = 'plos-cs-overlay-banner';
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');

  const checkmark = document.createElement('span');
  checkmark.textContent = '✓';
  checkmark.style.fontWeight = '700';
  banner.appendChild(checkmark);

  const text = document.createElement('span');
  const projectSuffix = projectName ? ` · ${projectName}` : '';
  text.textContent = `This URL is already in your project${projectSuffix}`;
  banner.appendChild(text);

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'plos-cs-overlay-banner-close';
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.textContent = '×';
  banner.appendChild(closeButton);

  let timer: ReturnType<typeof setTimeout> | null = null;

  const handle: AlreadySavedOverlay = {
    destroy() {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      banner.remove();
      if (activeOverlay === handle) activeOverlay = null;
    },
  };

  closeButton.addEventListener('click', () => handle.destroy());

  document.body.appendChild(banner);
  timer = setTimeout(() => handle.destroy(), AUTO_DISMISS_MS);

  activeOverlay = handle;
  return handle;
}

/** Hides any currently-visible overlay. No-op if none is showing. */
export function hideAlreadySavedOverlay(): void {
  if (activeOverlay !== null) {
    activeOverlay.destroy();
    activeOverlay = null;
  }
}
