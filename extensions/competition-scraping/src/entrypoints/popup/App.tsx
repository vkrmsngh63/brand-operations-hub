import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase.ts';
import { signIn, signOut } from '../../lib/auth.ts';
import {
  getHighlightTerms,
  getSelectedPlatform,
  getSelectedProjectId,
  setHighlightTerms,
  setSelectedPlatform,
  setSelectedProject,
} from '../../lib/popup-state.ts';
import type { HighlightTerm } from '../../lib/highlight-terms.ts';
import { getPlatformLabel } from '../../lib/platforms.ts';
import { ProjectPicker } from './components/ProjectPicker.tsx';
import { PlatformPicker } from './components/PlatformPicker.tsx';
import { HighlightTermsManager } from './components/HighlightTermsManager.tsx';

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
  const [busy, setBusy] = useState(false);

  // Hydrate persisted state on mount.
  useEffect(() => {
    let cancelled = false;
    Promise.all([getSelectedProjectId(), getSelectedPlatform()]).then(
      async ([pid, plat]) => {
        if (cancelled) return;
        setProjectId(pid);
        setPlatform(plat);
        if (pid) {
          const ts = await getHighlightTerms(pid);
          if (!cancelled) setTerms(ts);
        }
        if (!cancelled) setHydrated(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleProjectChange(next: string | null) {
    setProjectId(next);
    // Switching projects clears the platform (per popup-state.ts contract).
    if (next !== projectId) {
      setPlatform(null);
    }
    await setSelectedProject(next);
    if (next === null) {
      setTerms([]);
    } else {
      const ts = await getHighlightTerms(next);
      setTerms(ts);
    }
  }

  async function handlePlatformChange(next: string | null) {
    setPlatform(next);
    await setSelectedPlatform(next);
  }

  async function handleTermsChange(next: HighlightTerm[]) {
    setTerms(next);
    if (projectId !== null) {
      await setHighlightTerms(projectId, next);
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
              <HighlightTermsManager
                terms={terms}
                onChange={handleTermsChange}
              />
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
