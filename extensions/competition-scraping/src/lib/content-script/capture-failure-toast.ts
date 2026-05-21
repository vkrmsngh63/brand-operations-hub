// Build #8 (2026-05-23) — defensive UX for the captured-videos right-click
// gesture. When the user picks "Add to PLOS — Captured Video" but the
// orchestrator's findUnderlyingVideoEmbed walker returns 'none' (no
// reachable <video> AND no recognized embed iframe — even after the
// stacked-elements fallback), the prior code path silently called
// `sendResponse({ok:false})` and the user saw nothing on the page. The
// 2026-05-22-b director real-Chrome verification on Build #7 captured the
// silent-fail symptom as Bug #9 + #13 + #14a: "no form, no toast, no
// error." This helper closes that visibility gap by surfacing a small
// auto-dismissing message anchored to the bottom-right of the viewport so
// the user knows the gesture was registered AND learns the corrective
// action ("right-click directly on the video player").
//
// Scope: small + non-blocking + auto-dismissing (4s). The toast does not
// block subsequent right-clicks; each call replaces the prior toast so
// rapid right-clicks don't stack.

const TOAST_ELEMENT_ID = 'plos-cs-capture-failure-toast';
const AUTO_DISMISS_MS = 4000;

let dismissTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Renders a small bottom-right toast with `message` and auto-dismisses
 * after AUTO_DISMISS_MS. Calling again replaces the prior toast in-place;
 * the timer resets. Idempotent on repeat calls; safe to invoke from any
 * content-script handler (no chrome.* dependencies).
 */
export function showCaptureFailureToast(message: string): void {
  if (typeof document === 'undefined' || !document.body) return;

  let toast = document.getElementById(TOAST_ELEMENT_ID);
  if (!toast) {
    toast = document.createElement('div');
    toast.id = TOAST_ELEMENT_ID;
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      maxWidth: '320px',
      padding: '12px 16px',
      background: '#1f2937',
      color: '#f9fafb',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '14px',
      lineHeight: '1.4',
      borderRadius: '6px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
      zIndex: '999991',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 150ms ease-out',
    } as Partial<CSSStyleDeclaration>);
    document.body.appendChild(toast);
    // Force layout then bump opacity so the transition fires.
    void toast.offsetHeight;
    toast.style.opacity = '1';
  }
  toast.textContent = message;

  if (dismissTimer !== null) clearTimeout(dismissTimer);
  dismissTimer = setTimeout(() => {
    const el = document.getElementById(TOAST_ELEMENT_ID);
    if (!el) return;
    el.style.opacity = '0';
    setTimeout(() => {
      el.remove();
    }, 200);
    dismissTimer = null;
  }, AUTO_DISMISS_MS);
}

/**
 * Test-only seam: forcibly removes the toast + clears any pending dismiss
 * timer. Useful for unit tests that exercise sequential toast calls.
 */
export function _resetCaptureFailureToastForTests(): void {
  if (dismissTimer !== null) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }
  if (typeof document !== 'undefined') {
    document.getElementById(TOAST_ELEMENT_ID)?.remove();
  }
}
