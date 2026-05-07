import { useState } from 'react';
import { getContrastTextColor } from '../../../lib/color-palette.ts';
import {
  mergeWithExisting,
  parseTermInput,
  removeTermAt,
  setColorAt,
  type HighlightTerm,
} from '../../../lib/highlight-terms.ts';
import { ColorSwatchPopover } from './ColorSwatchPopover.tsx';

interface Props {
  terms: readonly HighlightTerm[];
  onChange: (terms: HighlightTerm[]) => void;
}

export function HighlightTermsManager({ terms, onChange }: Props) {
  const [draft, setDraft] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  function handleBlur() {
    const incoming = parseTermInput(draft);
    if (incoming.length === 0) {
      setDraft('');
      return;
    }
    onChange(mergeWithExisting(terms, incoming));
    setDraft('');
  }

  function handleRemove(index: number) {
    onChange(removeTermAt(terms, index));
    if (editingIndex === index) setEditingIndex(null);
  }

  function handleClearAll() {
    onChange([]);
    setEditingIndex(null);
  }

  function handlePick(hex: string) {
    if (editingIndex === null) return;
    onChange(setColorAt(terms, editingIndex, hex));
    setEditingIndex(null);
  }

  return (
    <div className="field-block">
      <label htmlFor="highlight-terms-input">Highlight Terms</label>
      <textarea
        id="highlight-terms-input"
        rows={2}
        placeholder="Type one or more terms (separate with commas or new lines), then click outside this box."
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
      />
      {terms.length === 0 && (
        <p className="muted muted-help">
          You haven&apos;t added any highlight terms yet.
        </p>
      )}
      {terms.length > 0 && (
        <>
          <ul className="term-list" aria-label="Highlight terms">
            {terms.map((t, i) => (
              <li key={`${t.term}-${i}`} className="term-row">
                <span
                  className="term-chip"
                  style={{
                    backgroundColor: t.color,
                    color: getContrastTextColor(t.color),
                  }}
                >
                  {t.term}
                </span>
                <button
                  type="button"
                  className="swatch-trigger"
                  style={{ backgroundColor: t.color }}
                  aria-label={`Change color for ${t.term}`}
                  onClick={() =>
                    setEditingIndex(editingIndex === i ? null : i)
                  }
                />
                <button
                  type="button"
                  className="term-remove"
                  aria-label={`Remove ${t.term}`}
                  onClick={() => handleRemove(i)}
                >
                  ×
                </button>
                {editingIndex === i && (
                  <ColorSwatchPopover
                    selectedHex={t.color}
                    onPick={handlePick}
                    onClose={() => setEditingIndex(null)}
                  />
                )}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="link-button"
            onClick={handleClearAll}
          >
            Clear all highlight terms
          </button>
        </>
      )}
    </div>
  );
}
