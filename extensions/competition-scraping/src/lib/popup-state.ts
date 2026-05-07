// chrome.storage.local-backed state for the popup setup screen.
//
// Three concerns persist here:
//   - selectedProjectId  — the Project the user is currently capturing for
//   - selectedPlatform   — the source platform the user is currently capturing from
//   - highlightTerms:<projectId>  — per-Project term + color list
//
// Switching projects clears the platform selection (you're starting a new
// context); see setSelectedProject() below.
//
// Pure logic for the term list lives in highlight-terms.ts and color-palette.ts;
// this module is the I/O wrapper. The chrome.storage.local guard mirrors the
// pattern in supabase.ts so importing this module from a non-extension runtime
// (e.g. wxt prepare's type-generation pass) does not crash.

import type { HighlightTerm } from './highlight-terms.ts';

const KEY_SELECTED_PROJECT = 'selectedProjectId';
const KEY_SELECTED_PLATFORM = 'selectedPlatform';
const HIGHLIGHT_TERMS_PREFIX = 'highlightTerms:';

function getStorage(): chrome.storage.LocalStorageArea | null {
  return typeof chrome !== 'undefined' && chrome.storage?.local
    ? chrome.storage.local
    : null;
}

function highlightTermsKey(projectId: string): string {
  return `${HIGHLIGHT_TERMS_PREFIX}${projectId}`;
}

// ─── selected project ─────────────────────────────────────────────────────

export async function getSelectedProjectId(): Promise<string | null> {
  const storage = getStorage();
  if (!storage) return null;
  const result = await storage.get(KEY_SELECTED_PROJECT);
  const value = result[KEY_SELECTED_PROJECT];
  return typeof value === 'string' ? value : null;
}

/**
 * Persists the selected projectId. Switching to a DIFFERENT projectId clears
 * the persisted platform selection (you're starting a new context). Setting
 * to null clears both.
 */
export async function setSelectedProject(
  projectId: string | null,
): Promise<void> {
  const storage = getStorage();
  if (!storage) return;
  const prior = await getSelectedProjectId();
  if (projectId === null) {
    await storage.remove([KEY_SELECTED_PROJECT, KEY_SELECTED_PLATFORM]);
    return;
  }
  if (prior !== projectId) {
    // Project changed — drop the platform; user re-picks for new context.
    await storage.remove(KEY_SELECTED_PLATFORM);
  }
  await storage.set({ [KEY_SELECTED_PROJECT]: projectId });
}

// ─── selected platform ────────────────────────────────────────────────────

export async function getSelectedPlatform(): Promise<string | null> {
  const storage = getStorage();
  if (!storage) return null;
  const result = await storage.get(KEY_SELECTED_PLATFORM);
  const value = result[KEY_SELECTED_PLATFORM];
  return typeof value === 'string' ? value : null;
}

export async function setSelectedPlatform(
  platform: string | null,
): Promise<void> {
  const storage = getStorage();
  if (!storage) return;
  if (platform === null) {
    await storage.remove(KEY_SELECTED_PLATFORM);
    return;
  }
  await storage.set({ [KEY_SELECTED_PLATFORM]: platform });
}

// ─── highlight terms (per project) ────────────────────────────────────────

export async function getHighlightTerms(
  projectId: string,
): Promise<HighlightTerm[]> {
  const storage = getStorage();
  if (!storage) return [];
  const key = highlightTermsKey(projectId);
  const result = await storage.get(key);
  const value = result[key];
  if (!Array.isArray(value)) return [];
  // Defensive shape check — drop any entry that doesn't look like HighlightTerm
  return value.filter(
    (v): v is HighlightTerm =>
      typeof v === 'object' &&
      v !== null &&
      typeof (v as HighlightTerm).term === 'string' &&
      typeof (v as HighlightTerm).color === 'string',
  );
}

export async function setHighlightTerms(
  projectId: string,
  terms: readonly HighlightTerm[],
): Promise<void> {
  const storage = getStorage();
  if (!storage) return;
  await storage.set({
    [highlightTermsKey(projectId)]: terms.map((t) => ({
      term: t.term,
      color: t.color,
    })),
  });
}
