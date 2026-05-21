// P-27 Build #4 — popup paste-into-extension flow for captured videos.
//
// Mirrors CapturedTextPasteForm.tsx in shape; uses the EMBED branch of the
// shared captured-video-validation helper (pasted URLs are always EMBED —
// DIRECT_BYTES means the user right-clicked a <video> on a competitor
// page, which lives in the content-script video-capture-form, not here).
//
// On Save: validate via validateCapturedVideoDraft → optionally upsert the
// new video-category via createVocabularyEntry → POST finalizeVideoUpload
// directly (extension-origin fetch — no api-bridge round-trip needed).
//
// The form is rendered inside SetupScreen and only when Project + Platform
// are both picked (gated by the parent, mirroring CapturedTextPasteForm).

import { useEffect, useState } from 'react';
import {
  createVocabularyEntry,
  finalizeVideoUpload,
  listCompetitorUrls,
  listVocabularyEntries,
  PlosApiError,
} from '../../../lib/api-client.ts';
import {
  defaultMintClientId,
  validateCapturedVideoDraft,
  type CapturedVideoValidationReason,
} from '../../../lib/captured-video-validation.ts';
import { buildSavedUrlOptionLabel } from '../../../lib/saved-url-option-label.ts';
import { getModuleByPlatform } from '../../../lib/platform-modules/registry.ts';
import { pickInitialUrl } from '../../../lib/captured-text-validation.ts';
import type {
  CompetitorUrl,
  Platform,
  VocabularyEntry,
} from '../../../../../../src/lib/shared-types/competition-scraping.ts';
import { getPlatformLabel } from '../../../lib/platforms.ts';

const ADD_NEW_VIDEO_CATEGORY_VALUE = '__plos_add_new_video_category__';

interface Props {
  projectId: string;
  platform: Platform;
}

type LoadState = 'loading' | 'loaded' | 'load-failed';

export function CapturedVideoPasteForm(props: Props) {
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string>('');
  const [urls, setUrls] = useState<CompetitorUrl[]>([]);
  const [categories, setCategories] = useState<VocabularyEntry[]>([]);

  const [videoUrl, setVideoUrl] = useState('');
  const [selectedUrlId, setSelectedUrlId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [composition, setComposition] = useState('');
  const [embeddedText, setEmbeddedText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Load URLs + categories + active tab URL whenever projectId / platform
  // changes. Mirrors the captured-text paste form: when the active tab's
  // URL matches a saved row, pre-select that row.
  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');
    setLoadError('');
    Promise.all([
      listCompetitorUrls(props.projectId, props.platform),
      listVocabularyEntries(props.projectId, 'video-category'),
      chrome.tabs.query({ active: true, currentWindow: true }),
    ])
      .then(([urlRows, vocab, tabs]) => {
        if (cancelled) return;
        setUrls(urlRows);
        const activeTabUrl = tabs[0]?.url;
        if (activeTabUrl) {
          const platformModule = getModuleByPlatform(props.platform);
          const matched = pickInitialUrl(
            activeTabUrl,
            urlRows,
            platformModule
              ? (href) => platformModule.canonicalProductUrl(href)
              : undefined,
          );
          if (matched) {
            setSelectedUrlId(matched.id);
          }
        }
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
              : "Couldn't load saved URLs or video categories";
        setLoadError(message);
        setLoadState('load-failed');
      });
    return () => {
      cancelled = true;
    };
  }, [props.projectId, props.platform]);

  function addTagFromInput(): void {
    if (!tagInput.trim()) return;
    setTags((prior) => {
      const seen = new Set(prior.map((t) => t.toLowerCase()));
      const next = [...prior];
      for (const piece of tagInput.split(',')) {
        const trimmed = piece.trim();
        if (!trimmed) continue;
        const key = trimmed.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        next.push(trimmed);
      }
      return next;
    });
    setTagInput('');
  }

  function removeTag(t: string): void {
    setTags((prior) => prior.filter((x) => x !== t));
  }

  function resetForm(): void {
    setVideoUrl('');
    setSelectedUrlId('');
    setSelectedCategory('');
    setNewCategoryInput('');
    setComposition('');
    setEmbeddedText('');
    setTags([]);
    setTagInput('');
  }

  function messageForReason(reason: CapturedVideoValidationReason): string {
    switch (reason) {
      case 'url-required':
        return 'Pick the saved URL this video belongs to.';
      case 'embed-url-required':
        return 'Paste a video URL (YouTube, Vimeo, etc.).';
      case 'embed-url-unrecognized':
        return "That doesn't look like a supported video URL (YouTube, Vimeo, Wistia, Brightcove, Dailymotion, or Loom).";
      case 'category-required':
        return 'Pick a video category, or add a new one via "+ Add new…".';
      // The DIRECT_BYTES + source-type-invalid reasons can't fire on the
      // popup paste path (the form always submits sourceType='EMBED'),
      // but switching exhaustively keeps the type-checker happy.
      case 'source-type-invalid':
        return 'Internal error — unrecognized video source type.';
      case 'bytes-required':
      case 'video-mime-rejected':
      case 'video-too-large':
        return 'Internal error — direct-bytes validation fired on a paste form.';
    }
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError('');
    setSuccess('');

    const effectiveCategory =
      selectedCategory === ADD_NEW_VIDEO_CATEGORY_VALUE
        ? newCategoryInput
        : selectedCategory;

    const validation = validateCapturedVideoDraft({
      competitorUrlId: selectedUrlId,
      sourceType: 'EMBED',
      originalSrcUrl: videoUrl,
      mimeType: '',
      fileSize: 0,
      videoCategory: effectiveCategory,
      composition,
      embeddedText,
      tags,
    });
    if (!validation.ok) {
      setError(messageForReason(validation.reason));
      return;
    }

    setSubmitting(true);
    try {
      if (selectedCategory === ADD_NEW_VIDEO_CATEGORY_VALUE) {
        const created = await createVocabularyEntry(props.projectId, {
          vocabularyType: 'video-category',
          value: validation.payload.videoCategory,
        });
        setCategories((prior) => {
          if (prior.some((p) => p.value === created.value)) return prior;
          return [...prior, created];
        });
      }
      await finalizeVideoUpload(props.projectId, selectedUrlId, {
        clientId: validation.payload.clientId,
        sourceType: 'EMBED',
        originalSrcUrl: validation.payload.originalSrcUrl,
        videoCategory: validation.payload.videoCategory,
        composition: validation.payload.composition ?? undefined,
        embeddedText: validation.payload.embeddedText ?? undefined,
        tags: validation.payload.tags,
        source: 'extension',
      });
      setSuccess('Captured.');
      resetForm();
    } catch (err) {
      const message =
        err instanceof PlosApiError
          ? `${err.message} (status ${err.status || 'network'})`
          : err instanceof Error
            ? err.message
            : 'Save failed';
      setError(`Couldn't save: ${message}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (loadState === 'loading') {
    return (
      <section className="captured-video-paste">
        <h2>Paste captured video</h2>
        <p className="muted">Loading your saved URLs and video categories…</p>
      </section>
    );
  }

  if (loadState === 'load-failed') {
    return (
      <section className="captured-video-paste">
        <h2>Paste captured video</h2>
        <div className="error" role="alert">
          {loadError}
        </div>
      </section>
    );
  }

  return (
    <section className="captured-video-paste">
      <h2>Paste captured video</h2>
      {urls.length === 0 ? (
        <p className="muted muted-help">
          No saved {getPlatformLabel(props.platform) ?? props.platform} URLs
          yet — capture one via the “+ Add” button on a competitor page first.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="video-paste-url">Video URL</label>
          <input
            id="video-paste-url"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Paste a YouTube / Vimeo / Wistia / etc. share URL"
            disabled={submitting}
          />

          <label htmlFor="video-paste-attach-url">
            Attach to which saved URL?
          </label>
          <select
            id="video-paste-attach-url"
            value={selectedUrlId}
            onChange={(e) => setSelectedUrlId(e.target.value)}
            disabled={submitting}
          >
            <option value="">Pick a saved URL…</option>
            {urls.map((row) => (
              <option key={row.id} value={row.id}>
                {buildSavedUrlOptionLabel(row)}
              </option>
            ))}
          </select>

          <label htmlFor="video-paste-category">Video category</label>
          <select
            id="video-paste-category"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              if (e.target.value !== ADD_NEW_VIDEO_CATEGORY_VALUE) {
                setNewCategoryInput('');
              }
            }}
            disabled={submitting}
          >
            <option value="">Pick a video category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.value}>
                {c.value}
              </option>
            ))}
            <option value={ADD_NEW_VIDEO_CATEGORY_VALUE}>+ Add new…</option>
          </select>
          {selectedCategory === ADD_NEW_VIDEO_CATEGORY_VALUE && (
            <input
              type="text"
              autoFocus
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              placeholder="Type new video-category name"
              disabled={submitting}
              style={{ marginTop: 6 }}
            />
          )}

          <label htmlFor="video-paste-composition">
            Composition (optional)
          </label>
          <textarea
            id="video-paste-composition"
            rows={2}
            value={composition}
            onChange={(e) => setComposition(e.target.value)}
            placeholder="Describe what's in the video."
            disabled={submitting}
          />

          <label htmlFor="video-paste-embedded">
            Embedded text (optional)
          </label>
          <textarea
            id="video-paste-embedded"
            rows={2}
            value={embeddedText}
            onChange={(e) => setEmbeddedText(e.target.value)}
            placeholder="Text that appears IN the video (overlay headlines, captions)."
            disabled={submitting}
          />

          <label htmlFor="video-paste-tags">Tags (optional)</label>
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
            id="video-paste-tags"
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
            {submitting ? 'Saving…' : 'Save captured video'}
          </button>
        </form>
      )}
    </section>
  );
}

// Re-exported for tests that want to mint clientIds deterministically.
export { defaultMintClientId };
