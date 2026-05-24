// W#2 P-46 Workstream 4 Session 2 (2026-05-25) — custom TipTap extension
// that resolves `#url/<urlId>` shorthand href on Link marks into
// same-tab Next.js navigation to the corresponding CompetitorUrl detail
// page.
//
// Design source: docs/COMPETITION_DATA_V2_DESIGN.md §A.4 + §A.5 + §C.4
// Session 2 spec.
//
// Wire shape: the editor doc's Link marks store `href: "#url/<urlId>"`
// (the shorthand). At click time this extension intercepts the click,
// extracts the urlId via the pure helper, and invokes the consumer-
// supplied `onInternalLinkClick(urlId)` callback — which uses Next.js
// `useRouter` to navigate same-tab to `/projects/<projectId>/competition-
// scraping/url/<urlId>`.
//
// Renders for both editable and read-only modes: the underlying
// ProseMirror `handleClick` prop fires regardless of editable state, so
// the user can click an internal hyperlink while viewing read-mode and
// jump to the URL detail page directly. The shorthand is the persisted
// value; the resolved path is never written to storage.
//
// Visual styling: CSS rules in the consumer (RichTextEditor wrapper)
// target `a[href^="#url/"]` to add the URL-icon prefix (the "Distinct
// styling" picker outcome from session-start). The extension itself
// emits no decorations — only click interception.

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

import { extractUrlIdFromHref } from '@/lib/rich-text/url-reference-helpers';

export interface UrlReferenceExtensionOptions {
  // Consumer-supplied callback invoked when an internal hyperlink is
  // clicked. Receives the urlId extracted from the shorthand href. The
  // consumer is responsible for the actual navigation (typically
  // `router.push(buildInternalUrlPath(projectId, urlId))`).
  onInternalLinkClick: ((urlId: string) => void) | null;
}

const PLUGIN_KEY = new PluginKey('plos-url-reference-click');

export const UrlReferenceExtension = Extension.create<UrlReferenceExtensionOptions>({
  name: 'urlReference',

  addOptions() {
    return {
      onInternalLinkClick: null,
    };
  },

  addProseMirrorPlugins() {
    const optionsRef = this.options;
    return [
      new Plugin({
        key: PLUGIN_KEY,
        props: {
          handleClick(view, _pos, event) {
            // Only intercept left-clicks; let ctrl/cmd-click (open-in-new-
            // tab gesture) fall through to the browser so power users can
            // open a URL detail page in a new tab if they want to.
            if (event.button !== 0) return false;
            if (event.metaKey || event.ctrlKey) return false;

            // Find the nearest enclosing <a> from the click target. Limit
            // the lookup to inside the editor's own DOM so clicks on the
            // chrome around the editor (toolbar, etc.) are ignored.
            const target = event.target as HTMLElement | null;
            if (!target) return false;
            const root = view.dom;
            const anchor = target.closest('a');
            if (!anchor || !root.contains(anchor)) return false;

            // `getAttribute('href')` returns the raw stored value
            // (`#url/<urlId>`) rather than the browser-resolved absolute
            // URL — that's what we want to detect the shorthand.
            const rawHref = anchor.getAttribute('href');
            const urlId = extractUrlIdFromHref(rawHref);
            if (urlId === null) return false;

            // Suppress the default click behavior so the browser does NOT
            // append the shorthand to the current page URL as a hash. The
            // consumer's callback handles the navigation.
            event.preventDefault();
            event.stopPropagation();

            if (optionsRef.onInternalLinkClick) {
              optionsRef.onInternalLinkClick(urlId);
            }

            return true;
          },
        },
      }),
    ];
  },
});

// Re-export the pure helpers consumers may need when wiring the
// extension's callback (so callsites don't need a second import line).
export {
  buildInternalUrlHref,
  buildInternalUrlPath,
  extractUrlIdFromHref,
  URL_REFERENCE_HREF_PREFIX,
} from '@/lib/rich-text/url-reference-helpers';
