'use client';

// W#2 P-49 Workstream 5 Fix Session D (2026-05-31) — 3-column traceability
// table for the "Overall Analysis — Captured Reviews" box on the URL detail
// page. Per director's 2026-05-30 §1 addendum, the per-competitor bulleted AI
// output is rendered as Category / Complaint / source-reviews(+star count).
//
// FU-1 / Q11 (a.110) — the table is now EDIT + DELETE capable when an
// `onSave` handler + `analysisId` are supplied (the URL detail page does so);
// without them it stays READ-ONLY (back-compat). Director-locked design
// (4/4 Yes-to-Recommended):
//   - Delete at three levels: a single complaint row, a whole category, or a
//     single source review under a complaint.
//   - Click-to-edit on Category names + Complaint wording (source reviews are
//     the evidence and are removed, not retyped).
//   - Bulk delete via always-visible per-complaint checkboxes + Delete
//     selected + a confirm step.
//   - Edits/deletes only change the saved AI analysis (analysisJson.categories
//     on the per-competitor PER_PRODUCT row) — NEVER the captured reviews.
//
// Back-compat: pre-v4 PER_PRODUCT rows stored only { summary } (free text).
// parseTraceabilityAnalysis returns null for those; we fall back to rendering
// the flattened summary text. Editing is disabled in the legacy-text case.

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { CapturedReview } from '@/lib/shared-types/competition-scraping';
import {
  parseTraceabilityAnalysis,
  buildTraceabilityRows,
  deleteBullets,
  deleteCategory,
  deleteSourceReview,
  editBulletText,
  editCategoryName,
  type TraceabilityAnalysis,
  type TraceabilityReview,
} from '@/lib/competition-scraping/reviews-traceability';

export interface ReviewsTraceabilityTableProps {
  // Raw analysisJson from the latest PER_PRODUCT ReviewAnalysis row for this
  // URL (or null/undefined when no per-competitor run has happened yet).
  analysisJson: unknown;
  // The URL's captured reviews — used to resolve cited reviewIds to full
  // text + star counts for the source column.
  reviews: ReadonlyArray<CapturedReview>;
  testId?: string;
  // FU-1: when BOTH are supplied the table becomes editable + deletable.
  // `onSave` persists the next structured analysis (the URL detail page
  // PATCHes it + updates its local state); it must throw on failure so the
  // table can surface an error and leave the prior content rendered.
  analysisId?: string | null;
  onSave?: (next: TraceabilityAnalysis) => Promise<void>;
}

const bulletKey = (categoryIndex: number, bulletIndex: number) =>
  `${categoryIndex}:${bulletIndex}`;

export function ReviewsTraceabilityTable({
  analysisJson,
  reviews,
  testId,
  analysisId,
  onSave,
}: ReviewsTraceabilityTableProps) {
  const analysis = useMemo(
    () => parseTraceabilityAnalysis(analysisJson),
    [analysisJson]
  );

  const reviewsById = useMemo(() => {
    const m = new Map<string, TraceabilityReview>();
    for (const r of reviews) {
      m.set(r.id, { starRating: r.starRating, title: r.title, body: r.body });
    }
    return m;
  }, [reviews]);

  const rows = useMemo(
    () => (analysis ? buildTraceabilityRows(analysis, reviewsById) : []),
    [analysis, reviewsById]
  );

  // Legacy free-text fallback when there's no structured analysis.
  const legacySummary = useMemo(() => {
    if (analysis) return null;
    if (analysisJson && typeof analysisJson === 'object') {
      const s = (analysisJson as { summary?: unknown }).summary;
      if (typeof s === 'string' && s.trim()) return s;
    }
    return null;
  }, [analysis, analysisJson]);

  const editable = Boolean(onSave && analysisId);

  // ─── Edit/delete interaction state (only used when editable) ───────────
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [confirmCategory, setConfirmCategory] = useState<number | null>(null);
  // Inline cell editing: which cell is open + its working text.
  const [editingCell, setEditingCell] = useState<
    | { kind: 'category'; categoryIndex: number }
    | { kind: 'bullet'; categoryIndex: number; bulletIndex: number }
    | null
  >(null);
  const [editValue, setEditValue] = useState('');

  // Reset transient selection/edit state whenever the underlying analysis
  // changes (e.g. after a save re-renders, or an AI re-run replaces it).
  useEffect(() => {
    setSelected(new Set());
    setConfirmBulk(false);
    setConfirmCategory(null);
    setEditingCell(null);
  }, [analysisJson]);

  const persist = useCallback(
    async (next: TraceabilityAnalysis, onDone?: () => void) => {
      if (!onSave) return;
      setBusy(true);
      setError(null);
      try {
        await onSave(next);
        onDone?.();
      } catch (e) {
        setError(
          e instanceof Error ? e.message : 'Could not save your change.'
        );
      } finally {
        setBusy(false);
      }
    },
    [onSave]
  );

  const beginEdit = useCallback(
    (
      cell:
        | { kind: 'category'; categoryIndex: number }
        | { kind: 'bullet'; categoryIndex: number; bulletIndex: number },
      current: string
    ) => {
      if (!editable || busy) return;
      setEditingCell(cell);
      setEditValue(current);
    },
    [editable, busy]
  );

  const commitEdit = useCallback(() => {
    if (!analysis || !editingCell) return;
    const trimmed = editValue.trim();
    const cell = editingCell;
    setEditingCell(null);
    if (!trimmed) return; // blanking is a no-op; delete the row instead
    const next =
      cell.kind === 'category'
        ? editCategoryName(analysis, cell.categoryIndex, trimmed)
        : editBulletText(
            analysis,
            cell.categoryIndex,
            cell.bulletIndex,
            trimmed
          );
    void persist(next);
  }, [analysis, editingCell, editValue, persist]);

  const toggleSelected = useCallback((key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleDeleteBullet = useCallback(
    (categoryIndex: number, bulletIndex: number) => {
      if (!analysis) return;
      void persist(deleteBullets(analysis, [{ categoryIndex, bulletIndex }]));
    },
    [analysis, persist]
  );

  const handleDeleteCategory = useCallback(
    (categoryIndex: number) => {
      if (!analysis) return;
      void persist(deleteCategory(analysis, categoryIndex), () =>
        setConfirmCategory(null)
      );
    },
    [analysis, persist]
  );

  const handleDeleteSourceReview = useCallback(
    (categoryIndex: number, bulletIndex: number, reviewId: string) => {
      if (!analysis) return;
      void persist(
        deleteSourceReview(analysis, categoryIndex, bulletIndex, reviewId)
      );
    },
    [analysis, persist]
  );

  const handleBulkDelete = useCallback(() => {
    if (!analysis || selected.size === 0) return;
    const targets = Array.from(selected).map((key) => {
      const [c, b] = key.split(':');
      return { categoryIndex: Number(c), bulletIndex: Number(b) };
    });
    void persist(deleteBullets(analysis, targets), () => {
      setSelected(new Set());
      setConfirmBulk(false);
    });
  }, [analysis, selected, persist]);

  if (!analysis && !legacySummary) return null;

  return (
    <div style={boxStyle} data-testid={testId}>
      <div style={headerRowStyle}>
        <span style={headerStyle}>Overall Analysis — Captured Reviews</span>
        {editable && analysis ? (
          <span style={hintStyle}>
            Click a Category or Complaint to edit · ✕ to delete · tick rows for
            bulk delete
          </span>
        ) : null}
      </div>

      {error ? (
        <div style={errorStyle} data-testid="reviews-traceability-error">
          {error}
        </div>
      ) : null}

      {editable && analysis && selected.size > 0 ? (
        <div style={bulkBarStyle} data-testid="reviews-traceability-bulk-bar">
          <span>{selected.size} selected</span>
          {confirmBulk ? (
            <>
              <span style={{ color: '#f0883e' }}>
                Delete {selected.size} complaint
                {selected.size === 1 ? '' : 's'} from the table?
              </span>
              <button
                type="button"
                style={dangerBtnStyle}
                disabled={busy}
                onClick={handleBulkDelete}
                data-testid="reviews-traceability-bulk-confirm"
              >
                Delete
              </button>
              <button
                type="button"
                style={ghostBtnStyle}
                disabled={busy}
                onClick={() => setConfirmBulk(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              style={dangerBtnStyle}
              disabled={busy}
              onClick={() => setConfirmBulk(true)}
              data-testid="reviews-traceability-bulk-delete"
            >
              Delete selected
            </button>
          )}
        </div>
      ) : null}

      {analysis ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                {editable ? <th style={{ ...thStyle, width: '4%' }} /> : null}
                <th style={{ ...thStyle, width: editable ? '18%' : '18%' }}>
                  Category
                </th>
                <th style={{ ...thStyle, width: '34%' }}>Complaint</th>
                <th style={{ ...thStyle, width: editable ? '44%' : '48%' }}>
                  Source reviews (with star count)
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const key = bulletKey(row.categoryIndex, row.bulletIndex);
                const isEditingCategory =
                  editingCell?.kind === 'category' &&
                  editingCell.categoryIndex === row.categoryIndex;
                const isEditingBullet =
                  editingCell?.kind === 'bullet' &&
                  editingCell.categoryIndex === row.categoryIndex &&
                  editingCell.bulletIndex === row.bulletIndex;
                return (
                  <tr key={key}>
                    {editable ? (
                      <td style={checkboxCellStyle}>
                        <input
                          type="checkbox"
                          checked={selected.has(key)}
                          disabled={busy}
                          onChange={() => toggleSelected(key)}
                          aria-label="Select complaint for bulk delete"
                          data-testid={`reviews-traceability-select-${key}`}
                        />
                      </td>
                    ) : null}

                    {row.categoryName !== null && (
                      <td style={categoryCellStyle} rowSpan={row.categoryRowSpan}>
                        {isEditingCategory ? (
                          <input
                            autoFocus
                            style={editInputStyle}
                            value={editValue}
                            disabled={busy}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEdit();
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                            data-testid="reviews-traceability-edit-category"
                          />
                        ) : (
                          <div style={cellInnerStyle}>
                            <span
                              style={editable ? editableTextStyle : undefined}
                              onClick={
                                editable
                                  ? () =>
                                      beginEdit(
                                        {
                                          kind: 'category',
                                          categoryIndex: row.categoryIndex,
                                        },
                                        row.categoryName ?? ''
                                      )
                                  : undefined
                              }
                              title={editable ? 'Click to edit category' : undefined}
                            >
                              {row.categoryName}
                            </span>
                            {editable ? (
                              confirmCategory === row.categoryIndex ? (
                                <span style={inlineConfirmStyle}>
                                  Delete whole category?
                                  <button
                                    type="button"
                                    style={dangerMiniBtnStyle}
                                    disabled={busy}
                                    onClick={() =>
                                      handleDeleteCategory(row.categoryIndex)
                                    }
                                    data-testid="reviews-traceability-category-confirm"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    style={ghostMiniBtnStyle}
                                    disabled={busy}
                                    onClick={() => setConfirmCategory(null)}
                                  >
                                    No
                                  </button>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  style={deleteMiniBtnStyle}
                                  disabled={busy}
                                  onClick={() =>
                                    setConfirmCategory(row.categoryIndex)
                                  }
                                  title="Delete whole category"
                                  data-testid="reviews-traceability-delete-category"
                                >
                                  ✕ category
                                </button>
                              )
                            ) : null}
                          </div>
                        )}
                      </td>
                    )}

                    <td style={complaintCellStyle}>
                      {isEditingBullet ? (
                        <textarea
                          autoFocus
                          style={editTextareaStyle}
                          value={editValue}
                          disabled={busy}
                          rows={3}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey))
                              commitEdit();
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                          data-testid="reviews-traceability-edit-bullet"
                        />
                      ) : (
                        <div style={cellInnerStyle}>
                          <span
                            style={editable ? editableTextStyle : undefined}
                            onClick={
                              editable
                                ? () =>
                                    beginEdit(
                                      {
                                        kind: 'bullet',
                                        categoryIndex: row.categoryIndex,
                                        bulletIndex: row.bulletIndex,
                                      },
                                      row.bulletText
                                    )
                                : undefined
                            }
                            title={editable ? 'Click to edit complaint' : undefined}
                          >
                            {row.bulletText}
                          </span>
                          {editable ? (
                            <button
                              type="button"
                              style={deleteMiniBtnStyle}
                              disabled={busy}
                              onClick={() =>
                                handleDeleteBullet(
                                  row.categoryIndex,
                                  row.bulletIndex
                                )
                              }
                              title="Delete this complaint"
                              data-testid={`reviews-traceability-delete-bullet-${key}`}
                            >
                              ✕
                            </button>
                          ) : null}
                        </div>
                      )}
                    </td>

                    <td style={sourceCellStyle}>
                      {row.sources.length === 0 ? (
                        <span style={mutedStyle}>—</span>
                      ) : (
                        <ul style={sourceListStyle}>
                          {row.sources.map((s, j) => (
                            <li key={j} style={sourceItemStyle}>
                              <span style={sourceTopStyle}>
                                <StarCount value={s.starRating} />
                                {editable ? (
                                  <button
                                    type="button"
                                    style={deleteMiniBtnStyle}
                                    disabled={busy}
                                    onClick={() =>
                                      handleDeleteSourceReview(
                                        row.categoryIndex,
                                        row.bulletIndex,
                                        s.reviewId
                                      )
                                    }
                                    title="Remove this review from the complaint"
                                    data-testid="reviews-traceability-delete-source"
                                  >
                                    ✕
                                  </button>
                                ) : null}
                              </span>
                              <span
                                style={s.missing ? mutedStyle : sourceTextStyle}
                              >
                                {s.text}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={legacyTextStyle}>{legacySummary}</div>
      )}
    </div>
  );
}

function StarCount({ value }: { value: number | null }) {
  if (value == null) {
    return <span style={{ ...starWrapStyle, color: '#6e7681' }}>☆☆☆☆☆</span>;
  }
  return (
    <span
      style={starWrapStyle}
      aria-label={`${value} of 5 stars`}
      title={`${value} of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= value ? '#f9c74f' : '#30363d' }}>
          {n <= value ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}

const boxStyle: React.CSSProperties = {
  marginTop: '16px',
  padding: '12px 14px',
  background: '#161b22',
  border: '1px solid #21262d',
  borderRadius: '8px',
};

const headerRowStyle: React.CSSProperties = {
  marginBottom: '10px',
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: '12px',
  flexWrap: 'wrap',
};

const headerStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#8b949e',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const hintStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#6e7681',
  fontStyle: 'italic',
};

const errorStyle: React.CSSProperties = {
  marginBottom: '10px',
  padding: '6px 10px',
  background: '#3d1d1d',
  border: '1px solid #f85149',
  borderRadius: '6px',
  color: '#ff7b72',
  fontSize: '12px',
};

const bulkBarStyle: React.CSSProperties = {
  marginBottom: '10px',
  padding: '6px 10px',
  background: '#1c2128',
  border: '1px solid #30363d',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '12px',
  color: '#c9d1d9',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '13px',
  color: '#c9d1d9',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  verticalAlign: 'top',
  padding: '8px 10px',
  borderBottom: '1px solid #30363d',
  color: '#8b949e',
  fontWeight: 600,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};

const checkboxCellStyle: React.CSSProperties = {
  verticalAlign: 'top',
  padding: '8px 6px',
  borderTop: '1px solid #21262d',
  textAlign: 'center',
};

const categoryCellStyle: React.CSSProperties = {
  verticalAlign: 'top',
  padding: '8px 10px',
  borderTop: '1px solid #30363d',
  borderRight: '1px solid #21262d',
  fontWeight: 600,
  color: '#e6edf3',
};

const complaintCellStyle: React.CSSProperties = {
  verticalAlign: 'top',
  padding: '8px 10px',
  borderTop: '1px solid #21262d',
  borderRight: '1px solid #21262d',
};

const sourceCellStyle: React.CSSProperties = {
  verticalAlign: 'top',
  padding: '8px 10px',
  borderTop: '1px solid #21262d',
};

const cellInnerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  alignItems: 'flex-start',
};

const editableTextStyle: React.CSSProperties = {
  cursor: 'text',
  whiteSpace: 'pre-wrap',
};

const editInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '4px 6px',
  background: '#0d1117',
  border: '1px solid #388bfd',
  borderRadius: '4px',
  color: '#e6edf3',
  fontSize: '13px',
};

const editTextareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '4px 6px',
  background: '#0d1117',
  border: '1px solid #388bfd',
  borderRadius: '4px',
  color: '#c9d1d9',
  fontSize: '13px',
  fontFamily: 'inherit',
  resize: 'vertical',
};

const sourceListStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: 0,
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const sourceItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
};

const sourceTopStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const sourceTextStyle: React.CSSProperties = {
  whiteSpace: 'pre-wrap',
  color: '#c9d1d9',
};

const starWrapStyle: React.CSSProperties = {
  display: 'inline-flex',
  gap: '1px',
  fontSize: '13px',
  lineHeight: 1.4,
};

const mutedStyle: React.CSSProperties = {
  color: '#6e7681',
  fontStyle: 'italic',
  whiteSpace: 'pre-wrap',
};

const legacyTextStyle: React.CSSProperties = {
  whiteSpace: 'pre-wrap',
  fontSize: '13px',
  color: '#c9d1d9',
};

const dangerBtnStyle: React.CSSProperties = {
  padding: '4px 10px',
  background: '#da3633',
  border: '1px solid #f85149',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '12px',
  cursor: 'pointer',
};

const ghostBtnStyle: React.CSSProperties = {
  padding: '4px 10px',
  background: 'transparent',
  border: '1px solid #30363d',
  borderRadius: '5px',
  color: '#c9d1d9',
  fontSize: '12px',
  cursor: 'pointer',
};

const deleteMiniBtnStyle: React.CSSProperties = {
  padding: '1px 6px',
  background: 'transparent',
  border: '1px solid #30363d',
  borderRadius: '4px',
  color: '#f85149',
  fontSize: '11px',
  cursor: 'pointer',
  lineHeight: 1.4,
};

const inlineConfirmStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '11px',
  color: '#f0883e',
  fontWeight: 400,
};

const dangerMiniBtnStyle: React.CSSProperties = {
  padding: '1px 8px',
  background: '#da3633',
  border: '1px solid #f85149',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '11px',
  cursor: 'pointer',
};

const ghostMiniBtnStyle: React.CSSProperties = {
  padding: '1px 8px',
  background: 'transparent',
  border: '1px solid #30363d',
  borderRadius: '4px',
  color: '#c9d1d9',
  fontSize: '11px',
  cursor: 'pointer',
};
