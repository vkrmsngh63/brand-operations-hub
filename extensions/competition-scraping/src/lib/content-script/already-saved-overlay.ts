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

export interface ShowAlreadySavedOverlayOptions {
  /**
   * P-19 fix 2026-05-18-d: optional wrapper invoked around the banner-remove
   * DOM mutation in destroy(). The orchestrator passes a wrapper that
   * disconnects + reconnects its own MutationObserver around the work, so
   * the overlay teardown's DOM mutation doesn't feed back into that MO and
   * trigger a highlight-terms refresh — whose strip-and-reapply pass would
   * collapse the user's active text selection. Symmetric with the same
   * option on startLiveHighlighting (P-14 fix 2026-05-12-e). No-op default
   * keeps standalone use (tests, future non-orchestrator callers) working.
   */
  muteMutationObserver?: <T>(work: () => Promise<T>) => Promise<T>;
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
  options: ShowAlreadySavedOverlayOptions = {},
): AlreadySavedOverlay {
  const muteMutationObserver =
    options.muteMutationObserver ?? (async (work) => work());

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
      // P-19 fix 2026-05-18-d: wrap banner.remove() in the caller's mute
      // wrapper so the DOM removal doesn't trigger the orchestrator's
      // MutationObserver — whose follow-on highlight-terms refresh would
      // strip-and-reapply <mark> elements and collapse the user's active
      // text selection. Both dismiss paths (auto-dismiss timer + close-
      // button click) flow through this single destroy() function and
      // therefore both inherit the mute discipline.
      void muteMutationObserver(async () => {
        banner.remove();
      });
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
