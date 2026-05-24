'use client';

// W#2 P-46 Workstream 4 (2026-05-24) — read-mode view of the per-Project
// Comprehensive Competitor Analysis doc. Renders the TipTap document JSON
// via RichTextEditor with readOnly=true so we get identical typography to
// edit mode without rolling a separate JSON-to-HTML renderer.
//
// Reasoning for reusing the same editor instead of generateHTML: the
// editor instance already renders the TipTap doc with all configured
// extensions (StarterKit + Link + Underline) at the correct typography.
// Standing up a separate static renderer would duplicate the same render
// path with risk of style drift. The editor's overhead is one ProseMirror
// instance per mount; for a single per-Project doc this is negligible.
//
// Empty-state handling: when initialContent has no actual text content
// (server returned 404 → page passed empty doc), we render a placeholder
// row above the read view so the page isn't visually empty.

import { RichTextEditor } from '../../components/RichTextEditor';
import { isEmptyTipTapDoc } from '@/lib/rich-text/tiptap-helpers';

export interface AnalysisReadViewProps {
  contentJson: Record<string, unknown>;
  testId?: string;
}

export function AnalysisReadView({
  contentJson,
  testId,
}: AnalysisReadViewProps) {
  const empty = isEmptyTipTapDoc(contentJson);

  return (
    <div>
      <div
        style={{
          fontSize: '12px',
          color: '#8b949e',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '8px',
        }}
      >
        Read Mode
      </div>
      {empty && (
        <div
          style={{
            padding: '16px',
            marginBottom: '8px',
            background: '#0d1117',
            border: '1px dashed #30363d',
            borderRadius: '6px',
            color: '#8b949e',
            fontSize: '13px',
            fontStyle: 'italic',
          }}
          data-testid={testId ? `${testId}-empty-state` : undefined}
        >
          No analysis written yet. Click <strong>Edit</strong> above to
          start composing your comprehensive competitor analysis.
        </div>
      )}
      <RichTextEditor
        initialContent={contentJson}
        onChange={() => {
          /* no-op in read mode */
        }}
        readOnly
        variant="full"
        testId={testId}
      />
    </div>
  );
}
