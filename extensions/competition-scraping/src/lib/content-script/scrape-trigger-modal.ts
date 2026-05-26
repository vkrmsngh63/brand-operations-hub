// Shadow DOM-mounted trigger modal for the per-platform review extraction
// scrapes shipped under P-49 Workstream 2 Session 2 (2026-05-27) per
// docs/REVIEWS_PHASE_2_DESIGN.md §A.4 (per-trigger override of the per-URL
// reviewScrapeCap default).
//
// The modal fires once at the start of every scrape gesture, BEFORE the
// per-platform extractor begins fetching. Director sees:
//   • A title describing what's being scraped (e.g., "Amazon reviews —
//     Product X").
//   • A numeric input pre-filled with the saved per-URL `reviewScrapeCap`
//     value (defaulting to 200 if unset). Director can override for this
//     one scrape run without changing the saved per-URL value.
//   • A Start button (primary) and a Cancel button. Clicking outside the
//     modal OR pressing Escape also cancels — non-destructive by default.
//
// Reuses the P-47 Shadow DOM mount pattern (open shadow root on a fixed-
// positioned host <div> in document.body) so events fired inside the modal
// don't bubble to host-page handlers (no risk of Amazon's review-page
// listeners swallowing the Start button click).

const MIN_CAP = 1;
const MAX_CAP = 5000;

export interface ScrapeTriggerModalOptions {
  /** Human-readable label rendered in the modal header. */
  scopeLabel: string;
  /**
   * Default cap (per-star for Amazon; per-filter for future platforms).
   * Pre-fills the input field. Must be a positive integer; values outside
   * MIN_CAP..MAX_CAP get clamped on resolve.
   */
  defaultCapPerStar: number;
}

export interface ScrapeTriggerModalResult {
  /** Director's chosen cap, clamped to MIN_CAP..MAX_CAP. */
  capPerStar: number;
}

/**
 * Mounts the trigger modal + returns a Promise that resolves on Start with
 * the chosen cap, or to null on Cancel / Escape / backdrop-click. Idempotent
 * second open: a still-open modal destroys before the new one mounts.
 */
export function openScrapeTriggerModal(
  opts: ScrapeTriggerModalOptions,
): Promise<ScrapeTriggerModalResult | null> {
  // Tear down any prior modal so only one ever renders.
  destroyActiveTriggerModal();

  return new Promise<ScrapeTriggerModalResult | null>((resolve) => {
    const host = document.createElement('div');
    host.setAttribute('data-plos-cs-host', 'scrape-trigger-modal');
    host.style.position = 'fixed';
    host.style.inset = '0';
    host.style.zIndex = '999999';

    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = TRIGGER_MODAL_CSS;
    shadow.appendChild(style);

    // Backdrop fills the viewport; click-outside-modal cancels.
    const backdrop = document.createElement('div');
    backdrop.className = 'plos-cs-scrape-trigger-backdrop';

    const card = document.createElement('div');
    card.className = 'plos-cs-scrape-trigger-card';

    const header = document.createElement('div');
    header.className = 'plos-cs-scrape-trigger-header';
    const titleEl = document.createElement('div');
    titleEl.className = 'plos-cs-scrape-trigger-title';
    titleEl.textContent = opts.scopeLabel;
    header.appendChild(titleEl);
    card.appendChild(header);

    const sub = document.createElement('div');
    sub.className = 'plos-cs-scrape-trigger-sub';
    sub.textContent = 'Review scrape settings';
    card.appendChild(sub);

    const fieldLabel = document.createElement('label');
    fieldLabel.className = 'plos-cs-scrape-trigger-field-label';
    fieldLabel.textContent = 'Per-star cap (1 – 5000)';
    card.appendChild(fieldLabel);

    const input = document.createElement('input');
    input.className = 'plos-cs-scrape-trigger-input';
    input.type = 'number';
    input.min = String(MIN_CAP);
    input.max = String(MAX_CAP);
    input.step = '1';
    input.value = String(clampCap(opts.defaultCapPerStar));
    input.setAttribute('aria-label', 'Per-star cap');
    fieldLabel.appendChild(input);

    const hint = document.createElement('div');
    hint.className = 'plos-cs-scrape-trigger-hint';
    hint.textContent =
      'Visits each of 5 star filters (1– 5) and scrapes up to this many reviews per filter. Saved per-URL value pre-fills; override here for this one run only.';
    card.appendChild(hint);

    const actions = document.createElement('div');
    actions.className = 'plos-cs-scrape-trigger-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'plos-cs-scrape-trigger-button';
    cancelBtn.textContent = 'Cancel';

    const startBtn = document.createElement('button');
    startBtn.type = 'button';
    startBtn.className =
      'plos-cs-scrape-trigger-button plos-cs-scrape-trigger-button-primary';
    startBtn.textContent = 'Start scrape';

    actions.appendChild(cancelBtn);
    actions.appendChild(startBtn);
    card.appendChild(actions);

    backdrop.appendChild(card);
    shadow.appendChild(backdrop);
    document.body.appendChild(host);

    let resolved = false;
    function done(result: ScrapeTriggerModalResult | null): void {
      if (resolved) return;
      resolved = true;
      teardown();
      resolve(result);
    }

    function teardown(): void {
      if (host.parentNode) host.parentNode.removeChild(host);
      document.removeEventListener('keydown', onKeyDown, true);
      if (activeHost === host) activeHost = null;
    }

    function readCap(): number {
      const raw = parseInt(input.value, 10);
      if (!Number.isFinite(raw)) return clampCap(opts.defaultCapPerStar);
      return clampCap(raw);
    }

    function onStart(): void {
      done({ capPerStar: readCap() });
    }

    function onCancel(): void {
      done(null);
    }

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
        return;
      }
      // Enter inside the input submits — but only if the input is the focus.
      if (
        event.key === 'Enter' &&
        shadow.activeElement === input
      ) {
        event.preventDefault();
        onStart();
      }
    }

    // Backdrop click outside the card cancels. Clicks inside the card don't
    // propagate to backdrop's handler thanks to the early-return check.
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) onCancel();
    });

    startBtn.addEventListener('click', onStart);
    cancelBtn.addEventListener('click', onCancel);
    document.addEventListener('keydown', onKeyDown, true);

    // Track for the idempotent re-open path.
    activeHost = host;
    activeTeardown = teardown;

    // Focus the input + select its value so director can immediately type
    // a different number without first clicking. Wrapped in a 0-delay
    // setTimeout so the focus call lands after the DOM settles.
    setTimeout(() => {
      try {
        input.focus();
        input.select();
      } catch {
        // ignore — focus failure shouldn't break the modal flow
      }
    }, 0);
  });
}

let activeHost: HTMLElement | null = null;
let activeTeardown: (() => void) | null = null;

function destroyActiveTriggerModal(): void {
  if (activeTeardown) {
    activeTeardown();
    activeTeardown = null;
  }
  activeHost = null;
}

export function clampCap(value: number): number {
  if (!Number.isFinite(value)) return 200;
  const intVal = Math.floor(value);
  if (intVal < MIN_CAP) return MIN_CAP;
  if (intVal > MAX_CAP) return MAX_CAP;
  return intVal;
}

/** CSS injected inside the Shadow DOM root. Self-contained, no host-page deps. */
export const TRIGGER_MODAL_CSS = `
.plos-cs-scrape-trigger-backdrop {
  position: fixed !important;
  inset: 0 !important;
  background: rgba(0, 0, 0, 0.45) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.plos-cs-scrape-trigger-card {
  background: #fff !important;
  color: #222 !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif !important;
  font-size: 13px !important;
  line-height: 1.4 !important;
  border-radius: 10px !important;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28) !important;
  padding: 20px 22px !important;
  min-width: 340px !important;
  max-width: 420px !important;
  border: 1px solid #ddd !important;
}

.plos-cs-scrape-trigger-header {
  margin-bottom: 4px !important;
}

.plos-cs-scrape-trigger-title {
  font-weight: 600 !important;
  font-size: 15px !important;
  color: #222 !important;
}

.plos-cs-scrape-trigger-sub {
  color: #777 !important;
  font-size: 12px !important;
  margin-bottom: 14px !important;
}

.plos-cs-scrape-trigger-field-label {
  display: block !important;
  font-weight: 600 !important;
  font-size: 12px !important;
  color: #444 !important;
  margin-bottom: 12px !important;
}

.plos-cs-scrape-trigger-input {
  display: block !important;
  margin-top: 6px !important;
  width: 100% !important;
  padding: 8px 10px !important;
  font-family: inherit !important;
  font-size: 14px !important;
  border-radius: 6px !important;
  border: 1px solid #c2c2c2 !important;
  box-sizing: border-box !important;
}

.plos-cs-scrape-trigger-input:focus {
  outline: none !important;
  border-color: #1976d2 !important;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.18) !important;
}

.plos-cs-scrape-trigger-hint {
  font-size: 12px !important;
  color: #777 !important;
  margin-bottom: 16px !important;
}

.plos-cs-scrape-trigger-actions {
  display: flex !important;
  gap: 8px !important;
  justify-content: flex-end !important;
}

.plos-cs-scrape-trigger-button {
  font-family: inherit !important;
  font-size: 13px !important;
  padding: 8px 16px !important;
  border-radius: 6px !important;
  cursor: pointer !important;
  border: 1px solid #c2c2c2 !important;
  background: #fff !important;
  color: #444 !important;
}

.plos-cs-scrape-trigger-button:hover {
  background: #f5f5f5 !important;
}

.plos-cs-scrape-trigger-button-primary {
  background: #1976d2 !important;
  border-color: #1976d2 !important;
  color: #fff !important;
}

.plos-cs-scrape-trigger-button-primary:hover {
  background: #1565c0 !important;
}
`;
