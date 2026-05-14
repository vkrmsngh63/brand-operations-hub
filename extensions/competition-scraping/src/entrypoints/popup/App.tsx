import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase.ts';
import { signIn, signOut } from '../../lib/auth.ts';
import type { HighlightTerm } from '../../lib/highlight-terms.ts';
import {
  loadHighlightTerms,
  saveHighlightTerms,
} from '../../lib/highlight-terms-sync.ts';
import {
  loadExtensionState,
  saveExtensionState,
} from '../../lib/extension-state-sync.ts';
import { PlosApiError } from '../../lib/errors.ts';
import { getPlatformLabel } from '../../lib/platforms.ts';
import { ProjectPicker } from './components/ProjectPicker.tsx';
import { PlatformPicker } from './components/PlatformPicker.tsx';
import { HighlightTermsManager } from './components/HighlightTermsManager.tsx';
import { CapturedTextPasteForm } from './components/CapturedTextPasteForm.tsx';
import { RegionScreenshotModeButton } from './components/RegionScreenshotModeButton.tsx';
import type { Platform } from '../../../../../src/lib/shared-types/competition-scraping.ts';

type LoadState = 'loading' | 'signed-out' | 'signed-in';

export function App() {
  const [state, setState] = useState<LoadState>('loading');
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setState(data.session ? 'signed-in' : 'signed-out');
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setState(next ? 'signed-in' : 'signed-out');
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <main>
      <h1>PLOS Competition Scraping</h1>
      <p className="tagline">Workflow #2 — capture URLs, text, images.</p>
      {state === 'loading' && <p className="muted">Loading…</p>}
      {state === 'signed-out' && <SignInScreen />}
      {state === 'signed-in' && session && <SetupScreen session={session} />}
    </main>
  );
}

function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await signIn(email.trim(), password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? 'Sign-in failed');
    }
    // On success, supabase.auth.onAuthStateChange flips App into signed-in
    // automatically.
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">PLOS email</label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={busy}
        required
      />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={busy}
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={busy || !email || !password}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
      <p className="muted" style={{ marginTop: 12 }}>
        Use the same email and password you use at vklf.com.
      </p>
    </form>
  );
}

function SetupScreen({ session }: { session: Session }) {
  const [hydrated, setHydrated] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string | null>(null);
  const [terms, setTerms] = useState<HighlightTerm[]>([]);
  // syncWarning surfaces when the Highlight Terms server load falls back to
  // the chrome.storage.local cache. Empty when in sync.
  const [syncWarning, setSyncWarning] = useState<string>('');
  // saveError surfaces inline when a server PUT fails on a Highlight Terms
  // edit. Cleared on the next successful Highlight Terms save.
  const [saveError, setSaveError] = useState<string>('');
  // extStateSyncWarning surfaces when the extension-state server load (P-3
  // broader scope, 2026-05-10-e) falls back to cache. Empty when in sync.
  const [extStateSyncWarning, setExtStateSyncWarning] = useState<string>('');
  // extStateSaveError surfaces inline when a server PUT fails on a project
  // or platform pick. Cleared on the next successful pick save.
  const [extStateSaveError, setExtStateSaveError] = useState<string>('');
  const [busy, setBusy] = useState(false);

  // Hydrate persisted state on mount.
  useEffect(() => {
    let cancelled = false;
    loadExtensionState().then(async (extResult) => {
      if (cancelled) return;
      setProjectId(extResult.state.selectedProjectId);
      setPlatform(extResult.state.selectedPlatform);
      setExtStateSyncWarning(extResult.warning);
      if (extResult.state.selectedProjectId) {
        const htResult = await loadHighlightTerms(
          extResult.state.selectedProjectId,
        );
        if (!cancelled) {
          setTerms(htResult.terms);
          setSyncWarning(htResult.warning);
        }
      }
      if (!cancelled) setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleProjectChange(next: string | null) {
    const priorProjectId = projectId;
    const priorPlatform = platform;
    // Optimistic UI update for instant response.
    setProjectId(next);
    // Switching projects clears the platform (per popup-state.ts contract).
    if (next !== priorProjectId) {
      setPlatform(null);
    }
    setExtStateSaveError('');
    try {
      // Server enforces "switching project clears platform" too — the
      // request says null when switching; otherwise carry prior platform.
      await saveExtensionState({
        selectedProjectId: next,
        selectedPlatform: next !== priorProjectId ? null : priorPlatform,
      });
      // A successful write means the server is reachable — clear stale warning.
      setExtStateSyncWarning('');
    } catch (err) {
      // Rollback optimistic update; surface inline error.
      setProjectId(priorProjectId);
      setPlatform(priorPlatform);
      const message =
        err instanceof PlosApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Couldn't save";
      setExtStateSaveError(`Couldn't save your project pick: ${message}`);
      return;
    }
    // Now load highlight terms for the new project (or clear if cleared).
    if (next === null) {
      setTerms([]);
      setSyncWarning('');
    } else {
      const result = await loadHighlightTerms(next);
      setTerms(result.terms);
      setSyncWarning(result.warning);
    }
  }

  async function handlePlatformChange(next: string | null) {
    const priorPlatform = platform;
    // Optimistic UI update for instant response.
    setPlatform(next);
    setExtStateSaveError('');
    try {
      await saveExtensionState({
        selectedProjectId: projectId,
        selectedPlatform: next,
      });
      setExtStateSyncWarning('');
    } catch (err) {
      // Rollback optimistic update; surface inline error.
      setPlatform(priorPlatform);
      const message =
        err instanceof PlosApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Couldn't save";
      setExtStateSaveError(`Couldn't save your platform pick: ${message}`);
    }
  }

  async function handleTermsChange(next: HighlightTerm[]) {
    if (projectId === null) return;
    // Optimistic update — show the user's edit immediately.
    const prior = terms;
    setTerms(next);
    setSaveError('');
    try {
      const canonical = await saveHighlightTerms(projectId, next);
      // The server may normalize the list (e.g. trim whitespace). Use the
      // server's canonical view rather than the client's optimistic copy.
      setTerms(canonical);
      // A successful write means the server is reachable — clear any
      // stale offline warning from the load path.
      setSyncWarning('');
    } catch (err) {
      // Roll back the optimistic update; surface the error inline.
      setTerms(prior);
      const message =
        err instanceof PlosApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Couldn't save changes";
      setSaveError(`Couldn't save: ${message}`);
    }
  }

  async function handleSignOut() {
    setBusy(true);
    await signOut();
    // App.useEffect's onAuthStateChange flips us back to signed-out.
  }

  const showActiveSession = projectId !== null && platform !== null;
  const platformLabel = getPlatformLabel(platform);

  return (
    <>
      <p className="user-line">
        Signed in as <strong>{session.user.email ?? session.user.id}</strong>
      </p>

      {showActiveSession && (
        <div className="active-session" role="status">
          <span className="active-session-dot" aria-hidden="true" />
          Capturing for <strong>{platformLabel}</strong>
        </div>
      )}

      {!hydrated ? (
        <p className="muted">Loading your last session…</p>
      ) : (
        <>
          {extStateSyncWarning && (
            <p className="muted muted-help" role="status">
              {extStateSyncWarning}
            </p>
          )}
          {extStateSaveError && (
            <div className="error" role="alert">
              {extStateSaveError}
            </div>
          )}
          <ProjectPicker
            selectedProjectId={projectId}
            onChange={handleProjectChange}
          />
          {projectId !== null && (
            <>
              <PlatformPicker
                selectedPlatform={platform}
                onChange={handlePlatformChange}
              />
              {syncWarning && (
                <p className="muted muted-help" role="status">
                  {syncWarning}
                </p>
              )}
              <HighlightTermsManager
                terms={terms}
                onChange={handleTermsChange}
              />
              {saveError && (
                <div className="error" role="alert">
                  {saveError}
                </div>
              )}
              {platform !== null && (
                <>
                  <CapturedTextPasteForm
                    projectId={projectId}
                    platform={platform as Platform}
                  />
                  <RegionScreenshotModeButton />
                </>
              )}
            </>
          )}
        </>
      )}

      <hr className="divider" />
      <button
        type="button"
        className="secondary"
        onClick={handleSignOut}
        disabled={busy}
      >
        Sign out
      </button>
    </>
  );
}
