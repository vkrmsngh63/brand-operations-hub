'use client';

// W#2 P-46 Workstream 2 (2026-05-25) — TipTap rich-text editor shared
// wrapper. First introduced for the per-item Analysis text box under each
// Captured Text row on the URL detail page (Session 1's wiring slice).
// Future Workstream 2 sessions consume the same wrapper for the per-item
// Analysis boxes under Captured Image / Video / Review rows + the per-
// category Overall Analysis boxes + the URL-level Overall Competitor
// Analysis box. Workstream 4 consumes the same wrapper for the
// Comprehensive Competitor Analysis page with `variant='full'`.
//
// Design source: docs/COMPETITION_DATA_V2_DESIGN.md §A.5 + §A.12.
//
// Wrapper boundary: the wrapper owns the editor instance + toolbar +
// debounced on-change wiring. It does NOT own persistence — the consumer
// (e.g., CapturedTextSubsection) handles the PATCH + rollback against the
// per-row API route. The wrapper just hands the consumer the latest
// TipTap document JSON via `onChange`.
//
// Variant: 'minimal' renders the per-item Analysis toolbar (bold / italic
// / bullet list / ordered list / link) per §A.5. 'full' is accepted as a
// forward-compatible value for Workstream 4's Comprehensive Analysis page;
// the toolbar implementation for 'full' lands in that workstream. Session
// 1 ships only the 'minimal' rendering.

import { useCallback, useEffect, useRef } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';

import { normalizeTipTapInput } from '@/lib/rich-text/tiptap-helpers';

export interface RichTextEditorProps {
  // Persisted TipTap doc JSON (the schema's `analysis Json` column reads
  // here straight from the wire). Schema default `{}` normalizes to the
  // canonical empty doc inside the wrapper.
  initialContent: Record<string, unknown>;

  // Called with the latest TipTap doc JSON after the user pauses typing.
  // Debounced internally (default 500 ms after last keystroke); also
  // flushes immediately on editor blur so a click-away saves promptly.
  onChange: (content: Record<string, unknown>) => void;

  // When true, the editor renders as read-only (no toolbar, no
  // contentEditable). Used by future read-mode views.
  readOnly?: boolean;

  // Optional placeholder text shown in the editor's empty state. Wired via
  // a CSS attribute on the editor's empty paragraph.
  placeholder?: string;

  // Toolbar shape. 'minimal' is the per-item Analysis toolbar (P-46 W#2);
  // 'full' is the Comprehensive Analysis toolbar (P-46 W#4 — currently
  // identical to 'minimal' until W#4 lands).
  variant?: 'minimal' | 'full';

  // Debounce window for onChange (ms). Default 500.
  debounceMs?: number;

  // Optional test hook. When provided, the wrapper attaches a data-testid
  // to the editor's outer DOM node so Playwright (W#2 future sessions)
  // can target the right instance among multiple editors on the page.
  testId?: string;
}

const DEFAULT_DEBOUNCE_MS = 500;

export function RichTextEditor({
  initialContent,
  onChange,
  readOnly = false,
  placeholder,
  variant = 'minimal',
  debounceMs = DEFAULT_DEBOUNCE_MS,
  testId,
}: RichTextEditorProps) {
  // Pending-debounce timer + latest-content ref so blur can flush without
  // re-creating the debounced callback on every render.
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingContent = useRef<Record<string, unknown> | null>(null);
  // Latest onChange ref so the editor's `onUpdate` closure always sees the
  // current callback without rebuilding the editor when the parent
  // re-renders.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const flush = useCallback(() => {
    if (pendingTimer.current !== null) {
      clearTimeout(pendingTimer.current);
      pendingTimer.current = null;
    }
    if (pendingContent.current !== null) {
      const content = pendingContent.current;
      pendingContent.current = null;
      onChangeRef.current(content);
    }
  }, []);

  const editor: Editor | null = useEditor({
    extensions: [
      StarterKit.configure({
        // Minimal variant disables heading (per-item Analysis boxes don't
        // need document-level headings); full variant for the Comprehensive
        // Analysis page enables h1/h2/h3 + code block (StarterKit ships
        // codeBlock by default — only the disable flag changes here).
        heading: variant === 'full' ? { levels: [1, 2, 3] } : false,
      }),
      Link.configure({
        openOnClick: false, // user clicks edit affordance to open links
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      // Underline is its own extension (not bundled in StarterKit). Loaded
      // for both variants — the minimal variant's toolbar just doesn't
      // surface a button for it. Full variant exposes it via Toolbar.
      Underline,
    ],
    content: normalizeTipTapInput(initialContent),
    editable: !readOnly,
    // Server-side render guard per TipTap React docs — render the editor
    // only on the client. Avoids "ProseMirror tried to access document"
    // during Next.js prerender.
    immediatelyRender: false,
    onUpdate({ editor }) {
      const json = editor.getJSON() as unknown as Record<string, unknown>;
      pendingContent.current = json;
      if (pendingTimer.current !== null) clearTimeout(pendingTimer.current);
      pendingTimer.current = setTimeout(() => {
        pendingTimer.current = null;
        if (pendingContent.current !== null) {
          const content = pendingContent.current;
          pendingContent.current = null;
          onChangeRef.current(content);
        }
      }, debounceMs);
    },
    onBlur() {
      flush();
    },
  });

  // Clean up the pending timer on unmount so a click-away during a save
  // doesn't leak a callback into a destroyed component.
  useEffect(() => {
    return () => {
      if (pendingTimer.current !== null) {
        clearTimeout(pendingTimer.current);
        pendingTimer.current = null;
      }
    };
  }, []);

  // When read-only toggles after mount (e.g., consumer flips edit-mode in
  // a future session), reflect that on the editor instance.
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  if (!editor) {
    // Render a skeleton during the SSR/pre-mount window so the layout
    // doesn't jump when the editor attaches.
    return (
      <div
        data-testid={testId}
        style={{
          minHeight: '88px',
          background: '#0d1117',
          border: '1px solid #30363d',
          borderRadius: '6px',
          padding: '8px 10px',
          color: '#8b949e',
          fontSize: '13px',
        }}
      >
        {placeholder ?? 'Loading editor…'}
      </div>
    );
  }

  return (
    <div
      data-testid={testId}
      style={{
        background: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: '6px',
      }}
    >
      {!readOnly && <Toolbar editor={editor} variant={variant} />}
      <div
        style={{
          padding: '8px 10px',
          minHeight: '60px',
          fontSize: '14px',
          color: '#e6edf3',
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function Toolbar({
  editor,
  variant,
}: {
  editor: Editor;
  variant: 'minimal' | 'full';
}) {
  const isFull = variant === 'full';
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        padding: '6px 8px',
        borderBottom: '1px solid #21262d',
        background: '#161b22',
        borderTopLeftRadius: '6px',
        borderTopRightRadius: '6px',
      }}
    >
      {isFull && (
        <>
          <ToolbarButton
            label="H1"
            active={editor.isActive('heading', { level: 1 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            title="Heading 1"
            style={{ fontWeight: 700 }}
          />
          <ToolbarButton
            label="H2"
            active={editor.isActive('heading', { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            title="Heading 2"
            style={{ fontWeight: 700 }}
          />
          <ToolbarButton
            label="H3"
            active={editor.isActive('heading', { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            title="Heading 3"
            style={{ fontWeight: 700 }}
          />
          <ToolbarSeparator />
        </>
      )}
      <ToolbarButton
        label="B"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (⌘B)"
        style={{ fontWeight: 700 }}
      />
      <ToolbarButton
        label="I"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (⌘I)"
        style={{ fontStyle: 'italic' }}
      />
      {isFull && (
        <ToolbarButton
          label="U"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline (⌘U)"
          style={{ textDecoration: 'underline' }}
        />
      )}
      <ToolbarSeparator />
      <ToolbarButton
        label="• List"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet list"
      />
      <ToolbarButton
        label="1. List"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered list"
      />
      <ToolbarSeparator />
      <ToolbarButton
        label="Link"
        active={editor.isActive('link')}
        onClick={() => {
          if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();
            return;
          }
          const prev = editor.getAttributes('link').href as string | undefined;
          const url = window.prompt('Link URL', prev ?? 'https://');
          if (url === null) return; // user cancelled
          if (url.trim() === '') {
            editor.chain().focus().unsetLink().run();
            return;
          }
          editor.chain().focus().setLink({ href: url.trim() }).run();
        }}
        title="Add or edit link"
      />
      {isFull && (
        <>
          <ToolbarSeparator />
          <ToolbarButton
            label="</>"
            active={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Code block"
            style={{ fontFamily: 'monospace' }}
          />
        </>
      )}
    </div>
  );
}

function ToolbarButton({
  label,
  active,
  onClick,
  title,
  style,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  title: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      style={{
        padding: '2px 8px',
        borderRadius: '4px',
        border: '1px solid transparent',
        background: active ? '#21262d' : 'transparent',
        color: active ? '#e6edf3' : '#8b949e',
        fontSize: '12px',
        cursor: 'pointer',
        minWidth: '24px',
        ...style,
      }}
    >
      {label}
    </button>
  );
}

function ToolbarSeparator() {
  return (
    <span
      aria-hidden
      style={{
        width: '1px',
        background: '#30363d',
        margin: '2px 2px',
      }}
    />
  );
}
