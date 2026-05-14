// Module 2 region-screenshot — popup-side trigger button (session 6,
// 2026-05-13).
//
// Per COMPETITION_SCRAPING_DESIGN.md §A.7 Module 2 the region-screenshot
// gesture is the second of two image-capture gestures (the first being
// session 5's regular-image right-click). The popup hosts the trigger
// because the gesture has no natural in-page affordance — the user is
// arming a viewport overlay, not clicking on something specific.
//
// Click flow:
//   1. Resolve the active tab via chrome.tabs.query.
//   2. Send an `enter-region-screenshot-mode` ContentScriptMessage carrying
//      the tab's URL (so the overlay's downstream image-capture-form can
//      pre-select the matching saved CompetitorUrl).
//   3. Close the popup (window.close()) — the user's next interaction is
//      with the in-page overlay, not the popup.
//
// If the active tab isn't a supported platform site (no content script
// injected), the sendMessage rejects and the component surfaces a friendly
// inline error explaining the user must navigate to amazon / ebay / etsy /
// walmart first.

import { useState } from 'react';
import type { ContentScriptMessage } from '../../../lib/content-script/messaging.ts';

export function RegionScreenshotModeButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>('');

  async function handleClick() {
    setBusy(true);
    setError('');
    try {
      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!activeTab || typeof activeTab.id !== 'number') {
        setError(
          "Couldn't find the active browser tab. Make sure a regular page is focused (not the new-tab page or a Chrome settings page).",
        );
        setBusy(false);
        return;
      }
      const pageUrl = typeof activeTab.url === 'string' ? activeTab.url : '';
      const message: ContentScriptMessage = {
        kind: 'enter-region-screenshot-mode',
        pageUrl,
      };
      try {
        await chrome.tabs.sendMessage(activeTab.id, message);
      } catch (sendErr) {
        // Content script not injected on this tab — typically a non-
        // supported domain (Google, Chrome internal page, etc.). Friendly
        // inline error.
        void sendErr;
        setError(
          'Region-screenshot mode is only available on Amazon, Ebay, Etsy, or Walmart product pages. Open one of those in this tab first, then click this button.',
        );
        setBusy(false);
        return;
      }
      // Success — close the popup so the user's next interaction is with
      // the in-page overlay.
      window.close();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Couldn't start region-screenshot mode: ${message}`);
      setBusy(false);
    }
  }

  return (
    <div className="region-screenshot-trigger">
      <button
        type="button"
        className="secondary"
        onClick={handleClick}
        disabled={busy}
      >
        {busy ? 'Starting…' : 'Region-screenshot mode'}
      </button>
      <p className="muted muted-help">
        Drag a rectangle around an A+ Content Module or any image-plus-text
        block. The cropped image saves like a regular product image.
      </p>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
