// Shadow DOM-mounted progress indicator for the per-platform review
// extraction scrapes shipped under P-49 Workstream 2 (2026-05-26).
//
// Per docs/REVIEWS_PHASE_2_DESIGN.md §A.3 ("in-page Shadow DOM progress
// indicator") + §A.15 ("conservative everywhere"), this indicator:
//   • Mounts inside an open Shadow DOM root attached to a fixed-positioned
//     host <div> in document.body (reuses the P-47 2026-05-24-d pattern from
//     video-capture-form.ts so events fired inside the shadow root don't
//     bubble to page-level handlers — Amazon's reviews page can't steal
//     focus or swallow the Cancel button click).
//   • Renders a small corner-anchored box (top-right by default) showing
//     "Scraping page N — X reviews captured" with a Cancel button always
//     visible.
//   • Auto-dismisses 3 seconds after a 'completed' event.
//   • Persists with a director-facing error message on 'aborted' events
//     classified as 'captcha' or 'rate-limit' (per §A.15 anti-escalation
//     posture); director closes via the always-visible × button.
//   • Auto-dismisses on 'user-cancel' aborts (no error to surface).
//
// Subscribes to ScrapeProgress events from scrape-pagination.ts via the
// `update(event)` method; the platform module (e.g., amazon-review-extractor)
// is the publisher.

import type { ScrapeProgress } from './scrape-pagination.ts';

export interface ScrapeProgressIndicatorOptions {
  /**
   * Human-readable label describing what's being scraped (e.g., "Amazon
   * reviews for Product X"). Rendered in the indicator's header.
   */
  scopeLabel: string;
  /**
   * Called when director clicks the Cancel button. The platform module
   * should call .abort() on its AbortController in this callback so the
   * scrape loop in scrape-pagination.ts unwinds cleanly.
   */
  onCancel(): void;
}

export interface ScrapeProgressIndicator {
  /** Process a ScrapeProgress event — updates the rendered state. */
  update(event: ScrapeProgress): void;
  /** Remove from DOM. Idempotent. */
  destroy(): void;
}

// Singleton — only one indicator visible at a time. A second open call
// destroys the prior indicator.
let activeIndicator: ScrapeProgressIndicator | null = null;

/**
 * CSS injected inside the Shadow DOM root. Defines the corner-anchored box
 * + progress text + Cancel/Close buttons. Self-contained (no dependency on
 * the host page's <head> styles). Z-index inside the shadow doesn't compete
 * with the host page; the host <div>'s z-index (999998) is what matters.
 */
export const PROGRESS_INDICATOR_CSS = `
.plos-cs-scrape-indicator {
  position: fixed !important;
  top: 16px !important;
  right: 16px !important;
  min-width: 280px !important;
  max-width: 360px !important;
  background: #fff !important;
  color: #222 !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif !important;
  font-size: 13px !important;
  line-height: 1.4 !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18) !important;
  padding: 12px 14px !important;
  z-index: 999998 !important;
  border: 1px solid #e0e0e0 !important;
}

.plos-cs-scrape-indicator-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  margin-bottom: 6px !important;
}

.plos-cs-scrape-indicator-title {
  font-weight: 600 !important;
  font-size: 13px !important;
  color: #222 !important;
}

.plos-cs-scrape-indicator-close {
  background: none !important;
  border: none !important;
  color: #888 !important;
  font-size: 18px !important;
  line-height: 1 !important;
  cursor: pointer !important;
  padding: 0 4px !important;
}

.plos-cs-scrape-indicator-close:hover {
  color: #222 !important;
}

.plos-cs-scrape-indicator-status {
  color: #555 !important;
  margin-bottom: 6px !important;
}

.plos-cs-scrape-indicator-status.plos-cs-scrape-indicator-error {
  color: #c2185b !important;
  background: #ffebee !important;
  padding: 6px 8px !important;
  border-radius: 4px !important;
  margin-top: 4px !important;
}

.plos-cs-scrape-indicator-count {
  font-weight: 600 !important;
  color: #1976d2 !important;
  font-size: 16px !important;
  margin-bottom: 8px !important;
}

.plos-cs-scrape-indicator-breakdown {
  font-size: 12px !important;
  color: #555 !important;
  margin-bottom: 6px !important;
  letter-spacing: 0.2px !important;
}

.plos-cs-scrape-indicator-actions {
  display: flex !important;
  gap: 6px !important;
  justify-content: flex-end !important;
}

.plos-cs-scrape-indicator-button {
  font-family: inherit !important;
  font-size: 12px !important;
  padding: 6px 12px !important;
  border-radius: 4px !important;
  cursor: pointer !important;
  border: 1px solid #ccc !important;
  background: #fff !important;
  color: #555 !important;
}

.plos-cs-scrape-indicator-button:hover {
  background: #f5f5f5 !important;
}

.plos-cs-scrape-indicator-button-primary {
  background: #c62828 !important;
  border-color: #c62828 !important;
  color: #fff !important;
}

.plos-cs-scrape-indicator-button-primary:hover {
  background: #b71c1c !important;
}
`;

const AUTO_DISMISS_AFTER_COMPLETE_MS = 3000;

export function openScrapeProgressIndicator(
  opts: ScrapeProgressIndicatorOptions,
): ScrapeProgressIndicator {
  if (activeIndicator) {
    activeIndicator.destroy();
    activeIndicator = null;
  }

  const host = document.createElement('div');
  host.setAttribute('data-plos-cs-host', 'scrape-progress-indicator');
  // Host wrapper — positions the shadow content via its inset:0 + the inner
  // .plos-cs-scrape-indicator's top/right offsets. Keeps the click-target
  // confined to the visible box rather than the full viewport.
  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.right = '0';
  host.style.pointerEvents = 'none';
  host.style.zIndex = '999998';

  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = PROGRESS_INDICATOR_CSS;
  shadow.appendChild(style);

  const box = document.createElement('div');
  box.className = 'plos-cs-scrape-indicator';
  box.style.pointerEvents = 'auto'; // re-enable inside the box

  const header = document.createElement('div');
  header.className = 'plos-cs-scrape-indicator-header';
  const titleEl = document.createElement('div');
  titleEl.className = 'plos-cs-scrape-indicator-title';
  titleEl.textContent = opts.scopeLabel;
  header.appendChild(titleEl);
  const closeBtn = document.createElement('button');
  closeBtn.className = 'plos-cs-scrape-indicator-close';
  closeBtn.setAttribute('aria-label', 'Close progress indicator');
  closeBtn.textContent = '×'; // ×
  header.appendChild(closeBtn);
  box.appendChild(header);

  const countEl = document.createElement('div');
  countEl.className = 'plos-cs-scrape-indicator-count';
  countEl.textContent = 'Starting…';
  box.appendChild(countEl);

  // Fix-forward #3 2026-05-28: per-star breakdown line. Hidden until the first
  // 'star-started' event fires. Updates as each star completes; the in-progress
  // star renders as "3★: …" (ellipsis) until 'star-completed' replaces it.
  const breakdownEl = document.createElement('div');
  breakdownEl.className = 'plos-cs-scrape-indicator-breakdown';
  breakdownEl.style.display = 'none';
  box.appendChild(breakdownEl);

  const statusEl = document.createElement('div');
  statusEl.className = 'plos-cs-scrape-indicator-status';
  statusEl.textContent = '';
  box.appendChild(statusEl);

  const actions = document.createElement('div');
  actions.className = 'plos-cs-scrape-indicator-actions';
  const cancelBtn = document.createElement('button');
  cancelBtn.className =
    'plos-cs-scrape-indicator-button plos-cs-scrape-indicator-button-primary';
  cancelBtn.textContent = 'Cancel';
  actions.appendChild(cancelBtn);
  box.appendChild(actions);

  shadow.appendChild(box);
  document.body.appendChild(host);

  let destroyed = false;
  let autoDismissTimer: ReturnType<typeof setTimeout> | null = null;
  let cancelHandled = false;

  // Fix-forward #3 2026-05-28: per-star breakdown state. Map<starRating, rowsForStar | null>
  // where null means in-progress (renders as ellipsis). Order preserved per insertion.
  const perStarCounts = new Map<number, number | null>();
  let currentStar: number | null = null;

  function renderBreakdown(): void {
    if (perStarCounts.size === 0) {
      breakdownEl.style.display = 'none';
      return;
    }
    const parts: string[] = [];
    for (const [rating, rows] of perStarCounts) {
      if (rows === null) {
        parts.push(`${String(rating)}★: …`);
      } else {
        parts.push(`${String(rating)}★: ${String(rows)}`);
      }
    }
    breakdownEl.textContent = parts.join('  ·  ');
    breakdownEl.style.display = 'block';
  }

  function destroy(): void {
    if (destroyed) return;
    destroyed = true;
    if (autoDismissTimer !== null) {
      clearTimeout(autoDismissTimer);
      autoDismissTimer = null;
    }
    if (host.parentNode) {
      host.parentNode.removeChild(host);
    }
    if (activeIndicator === indicator) {
      activeIndicator = null;
    }
  }

  function triggerCancel(): void {
    if (cancelHandled) return;
    cancelHandled = true;
    try {
      opts.onCancel();
    } catch (err) {
      // Surface in console for debugging; never throw out of a handler.
      console.error('[plos] scrape progress indicator onCancel threw:', err);
    }
    // Update the visible state immediately so director sees the cancel
    // landed — the actual scrape loop tear-down happens async.
    statusEl.textContent = 'Cancelling…';
    cancelBtn.setAttribute('disabled', 'true');
    cancelBtn.style.opacity = '0.6';
  }

  closeBtn.addEventListener('click', () => {
    triggerCancel();
    destroy();
  });
  cancelBtn.addEventListener('click', () => {
    triggerCancel();
  });

  function update(event: ScrapeProgress): void {
    if (destroyed) return;
    switch (event.kind) {
      case 'starting':
        countEl.textContent = 'Starting…';
        statusEl.textContent = '';
        break;
      case 'page-loading': {
        // Fix-forward #3 2026-05-28: prepend starContext when present so director
        // sees per-star progression ("3★ — Loading page 2…") rather than a bare
        // "Loading page 2…" that could be from any of 5 star filters.
        const prefix = event.starContext ? `${event.starContext} — ` : '';
        statusEl.textContent = `${prefix}Loading page ${String(event.pageIndex + 1)}…`;
        break;
      }
      case 'page-loaded': {
        const prefix = event.starContext ? `${event.starContext} — ` : '';
        statusEl.textContent = `${prefix}Page ${String(event.pageIndex + 1)} — ${String(
          event.rowsOnPage,
        )} reviews on this page`;
        countEl.textContent = `${String(event.totalRowsCaptured)} reviews captured`;
        break;
      }
      case 'row-saved':
        countEl.textContent = `${String(event.totalRowsCaptured)} reviews captured`;
        break;
      case 'star-started':
        // Fix-forward #3 2026-05-28: mark this star as in-progress in the
        // breakdown. The breakdown line becomes visible on the first star.
        currentStar = event.starRating;
        perStarCounts.set(event.starRating, null);
        renderBreakdown();
        break;
      case 'star-completed':
        // Fix-forward #3 2026-05-28: replace the ellipsis with the final count
        // for this star. Cumulative total also updates here.
        perStarCounts.set(event.starRating, event.rowsForStar);
        if (currentStar === event.starRating) currentStar = null;
        countEl.textContent = `${String(event.totalRowsCaptured)} reviews captured`;
        renderBreakdown();
        break;
      case 'completed':
        countEl.textContent = `${String(event.totalRowsCaptured)} reviews captured`;
        statusEl.textContent = 'Done.';
        statusEl.classList.remove('plos-cs-scrape-indicator-error');
        cancelBtn.textContent = 'Close';
        cancelBtn.removeAttribute('disabled');
        cancelBtn.style.opacity = '1';
        autoDismissTimer = setTimeout(() => {
          destroy();
        }, AUTO_DISMISS_AFTER_COMPLETE_MS);
        break;
      case 'aborted':
        countEl.textContent = `${String(event.totalRowsCaptured)} reviews captured`;
        if (event.reason === 'user-cancel') {
          statusEl.textContent = 'Cancelled.';
          statusEl.classList.remove('plos-cs-scrape-indicator-error');
          autoDismissTimer = setTimeout(() => {
            destroy();
          }, AUTO_DISMISS_AFTER_COMPLETE_MS);
        } else {
          statusEl.textContent =
            event.message ?? describeAbortReason(event.reason);
          statusEl.classList.add('plos-cs-scrape-indicator-error');
          cancelBtn.textContent = 'Close';
          cancelBtn.removeAttribute('disabled');
          cancelBtn.style.opacity = '1';
          // No auto-dismiss on captcha/rate-limit/error so director sees the
          // message until they explicitly close.
        }
        break;
    }
  }

  const indicator: ScrapeProgressIndicator = { update, destroy };
  activeIndicator = indicator;
  return indicator;
}

function describeAbortReason(reason: string): string {
  switch (reason) {
    case 'captcha':
      return 'Captcha detected. Finish it in the tab and re-run the scrape.';
    case 'rate-limit':
      return 'The site is rate-limiting requests. Wait a few minutes and try again.';
    case 'error':
      return 'Something went wrong during the scrape.';
    default:
      return `Stopped (${reason}).`;
  }
}
