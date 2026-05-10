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
// HISTORICAL NOTE — Highlight Terms (W#2 P-3 narrowed, 2026-05-10).
// `highlightTerms:<projectId>` was once the authoritative store. After P-3
// narrowed shipped, PLOS DB became authoritative; this storage key is now
// a per-installation MIRROR CACHE managed by `highlight-terms-sync.ts`.
// The mirror exists for two reasons:
//   1. Offline fallback — the popup can show last-known terms when the
//      server is unreachable.
//   2. Live-page sync — the content script's live-page highlight-terms
//      module reads via `getHighlightTerms` and listens for
//      `chrome.storage.onChanged`; keeping the mirror in sync after every
//      successful PUT lets the live-page highlights update without
//      requiring the content script to talk to the server itself
//      (content scripts can't reach vklf.com directly per the CORS
//      allowlist; the api-bridge is reserved for URL-recognition flows).
//
// HISTORICAL NOTE — selectedProjectId + selectedPlatform (W#2 P-3 broader
// scope, 2026-05-10-e). These two scalars were once the authoritative
// store. After P-3 broader shipped, PLOS DB became authoritative; both
// keys are now per-installation MIRROR CACHE entries managed by
// `extension-state-sync.ts`. The mirror exists so the content-script
// orchestrator (which can't reach vklf.com directly per the CORS
// allowlist) keeps reading cheap chrome.storage.local on every page
// load. The `setExtensionStateCache` writer below is the canonical
// mirror-write path used by the sync helper after every successful PUT.
// `setSelectedProject` / `setSelectedPlatform` remain available for the
// popup's optimistic-update path (instant UI response) but the canonical
// write that survives across devices is via `extension-state-sync.ts`.
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

// ─── extension-state mirror cache (W#2 P-3 broader, 2026-05-10-e) ─────
//
// The two functions below are the canonical mirror-cache I/O used by
// `extension-state-sync.ts` after every successful server load/save.
// They write the keys directly without re-applying the project-switch-
// clears-platform invariant — the server already applied it, and the
// inputs to `setExtensionStateCache` are always the canonical post-
// invariant state returned by the server.

export interface ExtensionStateCache {
  selectedProjectId: string | null;
  selectedPlatform: string | null;
}

export async function getExtensionStateCache(): Promise<ExtensionStateCache> {
  const storage = getStorage();
  if (!storage) return { selectedProjectId: null, selectedPlatform: null };
  const result = await storage.get([
    KEY_SELECTED_PROJECT,
    KEY_SELECTED_PLATFORM,
  ]);
  const projectId = result[KEY_SELECTED_PROJECT];
  const platform = result[KEY_SELECTED_PLATFORM];
  return {
    selectedProjectId: typeof projectId === 'string' ? projectId : null,
    selectedPlatform: typeof platform === 'string' ? platform : null,
  };
}

export async function setExtensionStateCache(
  state: ExtensionStateCache,
): Promise<void> {
  const storage = getStorage();
  if (!storage) return;
  // Write both keys atomically. null → remove the key entirely (so a
  // subsequent get returns null rather than the literal string "null").
  const toRemove: string[] = [];
  const toSet: Record<string, string> = {};
  if (state.selectedProjectId === null) {
    toRemove.push(KEY_SELECTED_PROJECT);
  } else {
    toSet[KEY_SELECTED_PROJECT] = state.selectedProjectId;
  }
  if (state.selectedPlatform === null) {
    toRemove.push(KEY_SELECTED_PLATFORM);
  } else {
    toSet[KEY_SELECTED_PLATFORM] = state.selectedPlatform;
  }
  if (toRemove.length > 0) {
    await storage.remove(toRemove);
  }
  if (Object.keys(toSet).length > 0) {
    await storage.set(toSet);
  }
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
