// Typed message protocol between background service worker and content
// scripts. Content scripts receive messages via chrome.runtime.onMessage;
// the background sends via chrome.tabs.sendMessage.
//
// Only one message kind today — `open-url-add-form` — fired when the user
// invokes the right-click context-menu fallback per §5 guardrail #6. The
// message carries the right-clicked link's URL.

export interface OpenUrlAddFormMessage {
  kind: 'open-url-add-form';
  href: string;
}

export type ContentScriptMessage = OpenUrlAddFormMessage;

export function isContentScriptMessage(
  value: unknown,
): value is ContentScriptMessage {
  if (typeof value !== 'object' || value === null) return false;
  const msg = value as { kind?: unknown; href?: unknown };
  if (msg.kind === 'open-url-add-form') {
    return typeof msg.href === 'string';
  }
  return false;
}
