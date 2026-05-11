// Module 2 text-capture — popup paste-into-extension flow (session 4,
// 2026-05-11).
//
// Per COMPETITION_SCRAPING_DESIGN.md §A.7 Module 2 the paste flow is the
// second of two ways to capture text:
//
//   1. Highlight-and-add gesture (content-script form) — right-click on a
//      text selection inside a recognized platform page.
//   2. Paste-into-extension (this component) — user pastes raw text into
//      the popup + picks one of the project's saved URLs + a content
//      category + optional tags, then saves.
//
// Component lives inside SetupScreen and only renders when the user has
// both Project + Platform picked (gated by the parent). Runs in the
// extension origin (chrome-extension://...) so it calls api-client.ts
// directly — no api-bridge round-trip needed.

import { useEffect, useState } from 'react';
import {
  createCapturedText,
  createVocabularyEntry,
  listCompetitorUrls,
  listVocabularyEntries,
  PlosApiError,
} from '../../../lib/api-client.ts';
import {
  normalizeTags,
  validateCapturedTextDraft,
} from '../../../lib/captured-text-validation.ts';
import type {
  CompetitorUrl,
  Platform,
  VocabularyEntry,
} from '../../../../../../src/lib/shared-types/competition-scraping.ts';
import { getPlatformLabel } from '../../../lib/platforms.ts';

const ADD_NEW_CATEGORY_VALUE = '__plos_add_new_category__';

interface Props {
  projectId: string;
  platform: Platform;
}

type LoadState = 'loading' | 'loaded' | 'load-failed';

export function CapturedTextPasteForm(props: Props) {
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string>('');
  const [urls, setUrls] = useState<CompetitorUrl[]>([]);
  const [categories, setCategories] = useState<VocabularyEntry[]>([]);

  // Form draft state.
  const [text, setText] = useState('');
  const [selectedUrlId, setSelectedUrlId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Submit state.
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Load URLs + categories whenever projectId / platform changes.
  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');
    setLoadError('');
    Promise.all([
      listCompetitorUrls(props.projectId, props.platform),
      listVocabularyEntries(props.projectId, 'content-category'),
    ])
      .then(([urlRows, vocab]) => {
        if (cancelled) return;
        setUrls(urlRows);
        setCategories(vocab);
        setLoadState('loaded');
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err instanceof PlosApiError
            ? `${err.message} (status ${err.status || 'network'})`
            : err instanceof Error
              ? err.message
              : "Couldn't load saved URLs or categories";
        setLoadError(message);
        setLoadState('load-failed');
      });
    return () => {
      cancelled = true;
    };
  }, [props.projectId, props.platform]);

  function addTagFromInput(): void {
    if (!tagInput.trim()) return;
    setTags((prior) => normalizeTags([...prior, ...tagInput.split(',')]));
    setTagInput('');
  }

  function removeTag(t: string): void {
    setTags((prior) => prior.filter((x) => x !== t));
  }

  function resetForm(): void {
    setText('');
    setSelectedUrlId('');
    setSelectedCategory('');
    setNewCategoryInput('');
    setTags([]);
    setTagInput('');
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Resolve the effective category — sentinel value means "use the
    // free-text input below the picker".
    const effectiveCategory =
      selectedCategory === ADD_NEW_CATEGORY_VALUE
        ? newCategoryInput
        : selectedCategory;

    const validation = validateCapturedTextDraft({
      competitorUrlId: selectedUrlId,
      text,
      contentCategory: effectiveCategory,
      tags,
    });
    if (!validation.ok) {
      const messages: Record<typeof validation.reason, string> = {
        'url-required': 'Pick the saved URL this text belongs to.',
        'text-required': 'The captured text can’t be empty.',
        'category-required':
          'Pick a content category, or add a new one via "+ Add new…".',
      };
      setError(messages[validation.reason]);
      return;
    }

    setSubmitting(true);
    try {
      if (selectedCategory === ADD_NEW_CATEGORY_VALUE) {
        // Upsert the new vocab entry first. Server's §11.1 semantics return
        // the existing row if the value already exists; safe to call
        // unconditionally.
        const created = await createVocabularyEntry(props.projectId, {
          vocabularyType: 'content-category',
          value: validation.payload.contentCategory ?? '',
        });
        // Update the local categories list so the dropdown reflects the
        // new entry immediately (without a second listVocabularyEntries
        // round-trip).
        setCategories((prior) => {
          if (prior.some((p) => p.value === created.value)) return prior;
          return [...prior, created];
        });
      }
      await createCapturedText(
        props.projectId,
        selectedUrlId,
        validation.payload,
      );
      setSuccess('Captured.');
      resetForm();
    } catch (err) {
      const message =
        err instanceof PlosApiError
          ? `${err.message} (status ${err.status || 'network'})`
          : err instanceof Error
            ? err.message
            : 'Save failed';
      setError(`Couldn’t save: ${message}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (loadState === 'loading') {
    return (
      <section className="captured-text-paste">
        <h2>Paste captured text</h2>
        <p className="muted">Loading your saved URLs and categories…</p>
      </section>
    );
  }

  if (loadState === 'load-failed') {
    return (
      <section className="captured-text-paste">
        <h2>Paste captured text</h2>
        <div className="error" role="alert">
          {loadError}
        </div>
      </section>
    );
  }

  return (
    <section className="captured-text-paste">
      <h2>Paste captured text</h2>
      {urls.length === 0 ? (
        <p className="muted muted-help">
          No saved {getPlatformLabel(props.platform) ?? props.platform} URLs
          yet — capture one via the “+ Add” button on a competitor page first.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="paste-text">Captured text</label>
          <textarea
            id="paste-text"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the text you want to save against a saved URL."
            disabled={submitting}
          />

          <label htmlFor="paste-url">Attach to which saved URL?</label>
          <select
            id="paste-url"
            value={selectedUrlId}
            onChange={(e) => setSelectedUrlId(e.target.value)}
            disabled={submitting}
          >
            <option value="">Pick a saved URL…</option>
            {urls.map((row) => (
              <option key={row.id} value={row.id}>
                {row.productName?.trim() ||
                  (row.url.length > 60
                    ? row.url.slice(0, 57) + '…'
                    : row.url)}
              </option>
            ))}
          </select>

          <label htmlFor="paste-category">Content category</label>
          <select
            id="paste-category"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              if (e.target.value !== ADD_NEW_CATEGORY_VALUE) {
                setNewCategoryInput('');
              }
            }}
            disabled={submitting}
          >
            <option value="">Pick a content category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.value}>
                {c.value}
              </option>
            ))}
            <option value={ADD_NEW_CATEGORY_VALUE}>+ Add new…</option>
          </select>
          {selectedCategory === ADD_NEW_CATEGORY_VALUE && (
            <input
              type="text"
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              placeholder="Type new category name"
              disabled={submitting}
              style={{ marginTop: 6 }}
            />
          )}

          <label htmlFor="paste-tags">Tags (optional)</label>
          <div className="chip-row">
            {tags.map((t) => (
              <span key={t} className="chip">
                {t}
                <button
                  type="button"
                  className="chip-remove"
                  onClick={() => removeTag(t)}
                  aria-label={`Remove tag ${t}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            id="paste-tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addTagFromInput();
              }
            }}
            onBlur={addTagFromInput}
            placeholder="Type a tag and press Enter"
            disabled={submitting}
          />

          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
          {success && (
            <p className="muted" role="status">
              {success}
            </p>
          )}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save captured text'}
          </button>
        </form>
      )}
    </section>
  );
}
