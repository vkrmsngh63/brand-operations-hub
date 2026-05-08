// Stylesheet for the content-script UI components.
//
// Injected once into the host page's <head> when the orchestrator decides
// to run on this page. All selectors are scoped to the `plos-cs-` class
// prefix (PLOS Content Script) so we do not conflict with the host page's
// styles. Critical layout properties use `!important` to defend against
// host-page CSS resetters or universal selectors that might override us.

export const CONTENT_SCRIPT_CSS = `
.plos-cs-add-button {
  position: fixed !important;
  width: 24px !important;
  height: 24px !important;
  padding: 0 !important;
  margin: 0 !important;
  background: #1976d2 !important;
  color: #fff !important;
  font-size: 16px !important;
  line-height: 24px !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif !important;
  font-weight: 700 !important;
  text-align: center !important;
  border: 2px solid #fff !important;
  border-radius: 50% !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2) !important;
  cursor: pointer !important;
  z-index: 2147483647 !important;
  opacity: 0.85 !important;
  transition: opacity 120ms ease, transform 120ms ease !important;
  user-select: none !important;
}

.plos-cs-add-button:hover {
  opacity: 1 !important;
  transform: scale(1.1) !important;
}

.plos-cs-add-button-dismiss {
  position: fixed !important;
  width: 14px !important;
  height: 14px !important;
  padding: 0 !important;
  margin: 0 !important;
  background: #c2185b !important;
  color: #fff !important;
  font-size: 11px !important;
  line-height: 14px !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif !important;
  font-weight: 700 !important;
  text-align: center !important;
  border: 1px solid #fff !important;
  border-radius: 50% !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
  cursor: pointer !important;
  z-index: 2147483647 !important;
  user-select: none !important;
}

.plos-cs-saved-icon {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 28px !important;
  height: 28px !important;
  margin-right: 6px !important;
  background: #16a34a !important;
  color: #fff !important;
  font-size: 18px !important;
  line-height: 1 !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif !important;
  font-weight: 900 !important;
  text-align: center !important;
  border: 3px solid #fff !important;
  border-radius: 50% !important;
  box-shadow: 0 0 0 2px #16a34a, 0 3px 8px rgba(0, 0, 0, 0.4) !important;
  vertical-align: middle !important;
  user-select: none !important;
  flex-shrink: 0 !important;
  position: relative !important;
  z-index: 2147483647 !important;
}

.plos-cs-overlay-banner {
  position: fixed !important;
  top: 12px !important;
  right: 12px !important;
  padding: 10px 14px !important;
  background: #388e3c !important;
  color: #fff !important;
  font-size: 13px !important;
  line-height: 1.3 !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif !important;
  font-weight: 500 !important;
  border-radius: 6px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18) !important;
  z-index: 2147483647 !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  max-width: 320px !important;
  user-select: none !important;
}

.plos-cs-overlay-banner-close {
  background: transparent !important;
  color: #fff !important;
  border: none !important;
  font-size: 16px !important;
  line-height: 1 !important;
  cursor: pointer !important;
  padding: 0 !important;
  margin: 0 !important;
  opacity: 0.85 !important;
}

.plos-cs-overlay-banner-close:hover {
  opacity: 1 !important;
}

.plos-cs-form-backdrop {
  position: fixed !important;
  inset: 0 !important;
  background: rgba(0, 0, 0, 0.45) !important;
  z-index: 2147483646 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 16px !important;
}

.plos-cs-form {
  width: 100% !important;
  max-width: 480px !important;
  max-height: calc(100vh - 32px) !important;
  overflow-y: auto !important;
  background: #fff !important;
  color: #222 !important;
  font-size: 14px !important;
  line-height: 1.4 !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif !important;
  border-radius: 8px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25) !important;
  padding: 20px !important;
  z-index: 2147483647 !important;
}

.plos-cs-form-title {
  font-size: 16px !important;
  font-weight: 600 !important;
  margin: 0 0 12px 0 !important;
  color: #222 !important;
}

.plos-cs-form-context {
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
  font-size: 12px !important;
  color: #555 !important;
  margin-bottom: 12px !important;
  padding: 8px 10px !important;
  background: #f5f5f5 !important;
  border-radius: 4px !important;
}

.plos-cs-form-context strong {
  color: #222 !important;
}

.plos-cs-form-field {
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
  margin-bottom: 10px !important;
}

.plos-cs-form-label {
  font-size: 12px !important;
  font-weight: 500 !important;
  color: #555 !important;
}

.plos-cs-form-input,
.plos-cs-form-textarea {
  font-family: inherit !important;
  font-size: 14px !important;
  color: #222 !important;
  background: #fff !important;
  padding: 8px 10px !important;
  border: 1px solid #ccc !important;
  border-radius: 4px !important;
  outline: none !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.plos-cs-form-input:focus,
.plos-cs-form-textarea:focus {
  border-color: #1976d2 !important;
}

.plos-cs-form-actions {
  display: flex !important;
  gap: 8px !important;
  justify-content: flex-end !important;
  margin-top: 16px !important;
}

.plos-cs-form-button {
  font-family: inherit !important;
  font-size: 14px !important;
  padding: 8px 14px !important;
  border-radius: 4px !important;
  cursor: pointer !important;
  border: 1px solid transparent !important;
}

.plos-cs-form-button-primary {
  background: #1976d2 !important;
  color: #fff !important;
}

.plos-cs-form-button-primary:disabled {
  background: #90caf9 !important;
  cursor: not-allowed !important;
}

.plos-cs-form-button-secondary {
  background: #fff !important;
  color: #555 !important;
  border-color: #ccc !important;
}

.plos-cs-form-error {
  margin-top: 8px !important;
  padding: 8px 10px !important;
  background: #ffebee !important;
  color: #c2185b !important;
  font-size: 13px !important;
  border-radius: 4px !important;
}
`;

const STYLE_ELEMENT_ID = 'plos-cs-styles';

/**
 * Injects the content-script stylesheet into the host page <head> on first
 * call; later calls are no-ops. Idempotent — surviving page navigations
 * (the orchestrator's MutationObserver loop may rescan after the host page
 * mutates the head, but document.getElementById will still find our style
 * tag if it survived).
 */
export function ensureStylesInjected(): void {
  if (document.getElementById(STYLE_ELEMENT_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.textContent = CONTENT_SCRIPT_CSS;
  document.head.appendChild(style);
}
