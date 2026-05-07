import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { signIn, signOut } from '../../lib/auth';
import { listProjects, PlosApiError } from '../../lib/api-client';

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
      {state === 'signed-in' && session && (
        <SignedInScreen session={session} />
      )}
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

function SignedInScreen({ session }: { session: Session }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    setBusy(true);
    setResult(null);
    setError(null);
    try {
      const data = await listProjects();
      const count = countProjects(data);
      setResult(
        count === null
          ? 'Connected — got a response from vklf.com.'
          : `Connected — ${count} ${count === 1 ? 'project' : 'projects'} visible on vklf.com.`,
      );
    } catch (e) {
      if (e instanceof PlosApiError) {
        setError(`PLOS API error (${e.status}): ${e.message}`);
      } else if (e instanceof Error) {
        setError(`Network error: ${e.message}`);
      } else {
        setError('Unknown error contacting vklf.com');
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    setBusy(true);
    await signOut();
    // App.useEffect's onAuthStateChange flips us back to signed-out.
  }

  return (
    <>
      <p className="user-line">
        Signed in as <strong>{session.user.email ?? session.user.id}</strong>
      </p>
      <button onClick={handleVerify} disabled={busy}>
        {busy ? 'Checking…' : 'Verify connection'}
      </button>
      {result && <div className="notice">{result}</div>}
      {error && <div className="error">{error}</div>}
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

function countProjects(data: unknown): number | null {
  if (Array.isArray(data)) return data.length;
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.projects)) return obj.projects.length;
    if (Array.isArray(obj.data)) return obj.data.length;
  }
  return null;
}
