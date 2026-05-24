'use client';

// W#2 P-46 Workstream 4 Session 2 (2026-05-25) — toolbar dropdown that
// lets the director pick a CompetitorUrl from the current Project's URL
// list and insert a Markdown-style link with the `#url/<urlId>` shorthand
// at the editor cursor.
//
// Design source: docs/COMPETITION_DATA_V2_DESIGN.md §A.4 + §A.5 + §C.4
// Session 2.
//
// Composition: rendered inside the RichTextEditor wrapper's 'full'
// variant toolbar. Owns the dropdown open/close state, the cached URL
// list (loaded lazily on first open), the search filter input state, and
// the insert command that fires when a URL is picked.
//
// Insert behavior:
//   - If the editor has a non-empty selection, apply the Link mark with
//     href=#url/<urlId> to the current selection (same as the toolbar's
//     existing Link button).
//   - If the selection is empty (cursor only), insert the URL's display
//     label as new text, then apply the Link mark across that new range.
//   - Display label preference: productName ?? brandName ?? url
//     (see defaultLinkLabelForUrl in url-reference-helpers).

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';

import { authFetch } from '@/lib/authFetch';
import type { CompetitorUrl } from '@/lib/shared-types/competition-scraping';
import {
  buildInternalUrlHref,
  defaultLinkLabelForUrl,
  filterUrlsByQuery,
  type UrlPickerEntry,
} from '@/lib/rich-text/url-reference-helpers';

export interface LinkToUrlPickerProps {
  editor: Editor;
  projectId: string;
}

type LoadState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'loaded'; urls: UrlPickerEntry[] }
  | { kind: 'error'; message: string };

export function LinkToUrlPicker({ editor, projectId }: LinkToUrlPickerProps) {
  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState<LoadState>({ kind: 'idle' });
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Lazy-load the URL list on first open. Cache for the component
  // lifetime — director's URL list doesn't churn mid-session typically;
  // if it does, closing + reopening reloads.
  const ensureLoaded = useCallback(async () => {
    if (load.kind === 'loaded' || load.kind === 'loading') return;
    setLoad({ kind: 'loading' });
    try {
      const res = await authFetch(
        `/api/projects/${projectId}/competition-scraping/urls`
      );
      if (!res.ok) {
        setLoad({ kind: 'error', message: `HTTP ${res.status}` });
        return;
      }
      const body = (await res.json()) as CompetitorUrl[];
      const entries: UrlPickerEntry[] = body.map((u) => ({
        id: u.id,
        url: u.url,
        productName: u.productName,
        brandName: u.brandName,
      }));
      setLoad({ kind: 'loaded', urls: entries });
    } catch (err) {
      setLoad({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Network error',
      });
    }
  }, [load.kind, projectId]);

  // Close on outside click / Escape so the dropdown doesn't trap the
  // director if they accidentally open it.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const root = containerRef.current;
      if (!root) return;
      if (e.target instanceof Node && root.contains(e.target)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Focus the search field whenever the dropdown opens — director's
  // muscle-memory expects to start typing immediately.
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        // Fire ensureLoaded but don't await — UI shows Loading until done.
        void ensureLoaded();
      } else {
        setQuery('');
      }
      return next;
    });
  }, [ensureLoaded]);

  const handlePick = useCallback(
    (entry: UrlPickerEntry) => {
      const href = buildInternalUrlHref(entry.id);
      const label = defaultLinkLabelForUrl(entry);

      const { from, to, empty } = editor.state.selection;
      if (empty) {
        // No selection — insert the label text first, then apply the
        // Link mark across the just-inserted range.
        editor
          .chain()
          .focus()
          .insertContent(label)
          .setTextSelection({ from, to: from + label.length })
          .setLink({ href })
          .setTextSelection(from + label.length)
          .unsetMark('link')
          .run();
      } else {
        // Selection present — apply the Link mark to whatever's selected.
        editor
          .chain()
          .focus()
          .setTextSelection({ from, to })
          .setLink({ href })
          .run();
      }

      setOpen(false);
      setQuery('');
    },
    [editor]
  );

  const filtered =
    load.kind === 'loaded' ? filterUrlsByQuery(load.urls, query) : [];

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <button
        type="button"
        onClick={handleToggle}
        title="Link to a URL captured in this Project"
        aria-pressed={open}
        style={{
          padding: '2px 8px',
          borderRadius: '4px',
          border: '1px solid transparent',
          background: open ? '#dbeafe' : 'transparent',
          color: open ? '#0969da' : '#1f2328',
          fontSize: '12px',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <span aria-hidden style={{ fontSize: '11px' }}>🔗</span>
        <span>Link to URL</span>
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Pick a URL to link to"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            width: '340px',
            maxHeight: '320px',
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
            border: '1px solid #d0d7de',
            borderRadius: '6px',
            boxShadow: '0 8px 24px rgba(31, 35, 40, 0.15)',
            zIndex: 50,
          }}
        >
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search this Project's captured URLs…"
            style={{
              padding: '8px 10px',
              border: 'none',
              borderBottom: '1px solid #d0d7de',
              background: 'transparent',
              color: '#1f2328',
              fontSize: '13px',
              outline: 'none',
              borderTopLeftRadius: '6px',
              borderTopRightRadius: '6px',
            }}
          />
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {load.kind === 'loading' && (
              <div style={emptyRowStyle}>Loading captured URLs…</div>
            )}
            {load.kind === 'error' && (
              <div style={{ ...emptyRowStyle, color: '#cf222e' }}>
                Couldn’t load URLs: {load.message}
              </div>
            )}
            {load.kind === 'loaded' && load.urls.length === 0 && (
              <div style={emptyRowStyle}>
                No URLs captured in this Project yet.
              </div>
            )}
            {load.kind === 'loaded' &&
              load.urls.length > 0 &&
              filtered.length === 0 && (
                <div style={emptyRowStyle}>No matches.</div>
              )}
            {load.kind === 'loaded' &&
              filtered.map((entry) => (
                <button
                  type="button"
                  key={entry.id}
                  onClick={() => handlePick(entry)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #eaeef2',
                    color: '#1f2328',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      '#f6f8fa';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      'transparent';
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                    {defaultLinkLabelForUrl(entry)}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#656d76',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {entry.url}
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

const emptyRowStyle: React.CSSProperties = {
  padding: '12px 10px',
  color: '#656d76',
  fontSize: '12px',
  fontStyle: 'italic',
  textAlign: 'center',
};
