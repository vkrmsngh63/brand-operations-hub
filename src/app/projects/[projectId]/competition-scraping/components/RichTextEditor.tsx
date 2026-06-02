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
import { useRouter } from 'next/navigation';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';

import { normalizeTipTapInput } from '@/lib/rich-text/tiptap-helpers';
import {
  URL_REFERENCE_HREF_PREFIX,
  buildInternalUrlPath,
} from '@/lib/rich-text/url-reference-helpers';
import { UrlReferenceExtension } from '../comprehensive-analysis/components/UrlReferenceExtension';
import { LinkToUrlPicker } from '../comprehensive-analysis/components/LinkToUrlPicker';

export interface RichTextEditorProps {
  initialContent: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
  readOnly?: boolean;
  placeholder?: string;
  variant?: 'minimal' | 'full';
  debounceMs?: number;
  testId?: string;
  projectId?: string;

  // Editor body font size in px. Defaults to 14. When `onFontSizeChange`
  // is also provided AND variant === 'full', the toolbar surfaces a
  // − / Npt / + stepper (clamped 10-24).
  fontSize?: number;
  onFontSizeChange?: (next: number) => void;

  // Called once with the live editor instance when it becomes ready (and
  // again if it is recreated). Lets a consumer drive imperative commands —
  // e.g. the "Insert primer" button inserts content at the cursor.
  onEditorReady?: (editor: Editor) => void;
}

const DEFAULT_DEBOUNCE_MS = 500;
const DEFAULT_FONT_SIZE_PX = 14;
const MIN_FONT_SIZE_PX = 10;
const MAX_FONT_SIZE_PX = 24;

export function RichTextEditor({
  initialContent,
  onChange,
  readOnly = false,
  placeholder,
  variant = 'minimal',
  debounceMs = DEFAULT_DEBOUNCE_MS,
  testId,
  projectId,
  fontSize = DEFAULT_FONT_SIZE_PX,
  onFontSizeChange,
  onEditorReady,
}: RichTextEditorProps) {
  const router = useRouter();
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

  // Latest projectId + router refs so the UrlReferenceExtension's click
  // handler always sees current values without rebuilding the editor.
  const projectIdRef = useRef(projectId ?? null);
  const routerRef = useRef(router);
  useEffect(() => {
    projectIdRef.current = projectId ?? null;
    routerRef.current = router;
  }, [projectId, router]);

  const handleInternalLinkClick = useCallback((urlId: string) => {
    const pid = projectIdRef.current;
    if (!pid) return;
    routerRef.current.push(buildInternalUrlPath(pid, urlId));
  }, []);

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
        // Allow the internal-hyperlink shorthand `#url/<urlId>` to pass
        // Link validation. Without this override, the Link extension's
        // default isAllowedUri would reject the non-http href and strip
        // the mark on insert. External links continue to defer to the
        // built-in validate path.
        isAllowedUri: (url, ctx) =>
          url.startsWith(URL_REFERENCE_HREF_PREFIX) ||
          ctx.defaultValidate(url),
      }),
      // Underline is its own extension (not bundled in StarterKit). Loaded
      // for both variants — the minimal variant's toolbar just doesn't
      // surface a button for it. Full variant exposes it via Toolbar.
      Underline,
      // P-46 W4 S2 — internal-hyperlink click interceptor. Registered for
      // both variants when projectId is provided so a `#url/<urlId>` link
      // works wherever it's written, but only the 'full' toolbar surfaces
      // the picker affordance.
      UrlReferenceExtension.configure({
        onInternalLinkClick: projectId ? handleInternalLinkClick : null,
      }),
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

  // Flush any pending debounced content on unmount so a parent toggling
  // out of edit mode (e.g., Done → read mode) doesn't drop the in-flight
  // typing. Without this, the 500 ms debounce window after the last
  // keystroke gets cancelled by cleanup and the content is lost.
  useEffect(() => {
    return () => {
      if (pendingTimer.current !== null) {
        clearTimeout(pendingTimer.current);
        pendingTimer.current = null;
      }
      if (pendingContent.current !== null) {
        const content = pendingContent.current;
        pendingContent.current = null;
        onChangeRef.current(content);
      }
    };
  }, []);

  // When read-only toggles after mount (e.g., consumer flips edit-mode in
  // a future session), reflect that on the editor instance.
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  // Hand the live editor instance up so a consumer can run imperative
  // commands (e.g. the "Insert primer" button). Kept in a ref so passing a
  // fresh callback doesn't refire the effect each render.
  const onEditorReadyRef = useRef(onEditorReady);
  useEffect(() => {
    onEditorReadyRef.current = onEditorReady;
  }, [onEditorReady]);
  useEffect(() => {
    if (editor && onEditorReadyRef.current) onEditorReadyRef.current(editor);
  }, [editor]);

  if (!editor) {
    return (
      <div
        data-testid={testId}
        style={{
          minHeight: '88px',
          background: '#ffffff',
          border: '1px solid #d0d7de',
          borderRadius: '6px',
          padding: '8px 10px',
          color: '#656d76',
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
      className="plos-rt-editor"
      style={{
        background: '#ffffff',
        border: '1px solid #d0d7de',
        borderRadius: '6px',
        overflow: 'hidden',
      }}
    >
      <EditorStyles />
      {!readOnly && (
        <Toolbar
          editor={editor}
          variant={variant}
          projectId={projectId}
          fontSize={fontSize}
          onFontSizeChange={onFontSizeChange}
        />
      )}
      <div
        style={{
          padding: '10px 12px',
          minHeight: '60px',
          fontSize: `${fontSize}px`,
          color: '#1f2328',
          background: '#ffffff',
          caretColor: '#1f2328',
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

// Editor-body element styling. Browser/Tailwind resets strip default
// list bullets and may flatten heading sizes, so the editor wrapper owns
// the typography rules. Scoped to `.plos-rt-editor` so they don't leak
// to other content on the page.
function EditorStyles() {
  return (
    <style>{`
      .plos-rt-editor .ProseMirror {
        outline: none;
        min-height: 60px;
      }
      .plos-rt-editor .ProseMirror p { margin: 0 0 0.5em 0; }
      .plos-rt-editor .ProseMirror p:last-child { margin-bottom: 0; }
      .plos-rt-editor .ProseMirror h1 {
        font-size: 1.6em;
        font-weight: 700;
        margin: 0.5em 0 0.4em 0;
        line-height: 1.25;
      }
      .plos-rt-editor .ProseMirror h2 {
        font-size: 1.35em;
        font-weight: 700;
        margin: 0.5em 0 0.35em 0;
        line-height: 1.25;
      }
      .plos-rt-editor .ProseMirror h3 {
        font-size: 1.15em;
        font-weight: 600;
        margin: 0.45em 0 0.3em 0;
        line-height: 1.25;
      }
      .plos-rt-editor .ProseMirror ul {
        list-style: disc outside;
        padding-left: 1.5em;
        margin: 0.3em 0;
      }
      .plos-rt-editor .ProseMirror ol {
        list-style: decimal outside;
        padding-left: 1.5em;
        margin: 0.3em 0;
      }
      .plos-rt-editor .ProseMirror li { margin: 0.15em 0; }
      .plos-rt-editor .ProseMirror li > p { margin: 0; }
      .plos-rt-editor .ProseMirror a {
        color: #0969da;
        text-decoration: underline;
      }
      .plos-rt-editor .ProseMirror a:hover { color: #1f7fd6; }
      .plos-rt-editor .ProseMirror a[href^="#url/"]::before {
        content: "🔗 ";
        font-size: 0.85em;
        opacity: 0.85;
      }
      .plos-rt-editor .ProseMirror pre {
        background: #f6f8fa;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        padding: 10px 12px;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.92em;
        overflow-x: auto;
        margin: 0.5em 0;
      }
      .plos-rt-editor .ProseMirror code {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        background: #f6f8fa;
        padding: 0.1em 0.3em;
        border-radius: 3px;
        font-size: 0.92em;
      }
      .plos-rt-editor .ProseMirror pre code {
        background: transparent;
        padding: 0;
      }
      .plos-rt-editor .ProseMirror blockquote {
        border-left: 3px solid #d0d7de;
        padding-left: 12px;
        margin: 0.5em 0;
        color: #656d76;
      }
      .plos-rt-editor .ProseMirror strong { font-weight: 700; }
      .plos-rt-editor .ProseMirror em { font-style: italic; }
      .plos-rt-editor .ProseMirror u { text-decoration: underline; }
    `}</style>
  );
}

function Toolbar({
  editor,
  variant,
  projectId,
  fontSize,
  onFontSizeChange,
}: {
  editor: Editor;
  variant: 'minimal' | 'full';
  projectId?: string;
  fontSize: number;
  onFontSizeChange?: (next: number) => void;
}) {
  const isFull = variant === 'full';
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 8px',
        borderBottom: '1px solid #d0d7de',
        background: '#f6f8fa',
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
      {isFull && projectId && (
        <>
          <ToolbarSeparator />
          <LinkToUrlPicker editor={editor} projectId={projectId} />
        </>
      )}
      {isFull && onFontSizeChange && (
        <>
          <span style={{ flex: 1 }} aria-hidden />
          <FontSizeStepper
            value={fontSize}
            onChange={onFontSizeChange}
          />
        </>
      )}
    </div>
  );
}

function FontSizeStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  const clamp = (n: number) =>
    Math.max(MIN_FONT_SIZE_PX, Math.min(MAX_FONT_SIZE_PX, n));
  const dec = () => onChange(clamp(value - 1));
  const inc = () => onChange(clamp(value + 1));
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        marginLeft: '6px',
      }}
      title="Editor font size"
    >
      <ToolbarButton
        label="−"
        active={false}
        onClick={dec}
        title={`Decrease font size (min ${MIN_FONT_SIZE_PX}pt)`}
      />
      <span
        style={{
          fontSize: '12px',
          color: '#1f2328',
          minWidth: '32px',
          textAlign: 'center',
          userSelect: 'none',
        }}
      >
        {value}pt
      </span>
      <ToolbarButton
        label="+"
        active={false}
        onClick={inc}
        title={`Increase font size (max ${MAX_FONT_SIZE_PX}pt)`}
      />
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
        background: active ? '#dbeafe' : 'transparent',
        color: active ? '#0969da' : '#1f2328',
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
        alignSelf: 'stretch',
        background: '#d0d7de',
        margin: '2px 2px',
      }}
    />
  );
}
