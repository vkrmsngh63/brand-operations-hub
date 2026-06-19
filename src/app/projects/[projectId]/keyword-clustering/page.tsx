'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { authFetch } from '@/lib/authFetch';
import KeywordWorkspace from './components/KeywordWorkspace';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ProjectSummary {
  id: string;
  name: string;
}

export default function ProjectKeywordClusteringPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Three-state workspace selector. 'manual' + 'ai1' share AI 1's data;
  // 'ai2' is Variant B's isolated workspace. Persisted per project per user
  // via the UserPreference key `kc_variant_{projectId}` (syncs across devices).
  const [mode, setMode] = useState<'manual' | 'ai1' | 'ai2'>('manual');

  // Switch mode and remember the choice on the user's account.
  const selectMode = useCallback(
    (m: 'manual' | 'ai1' | 'ai2') => {
      setMode(m);
      authFetch(`/api/user-preferences/kc_variant_${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: m }),
      }).catch(() => {
        /* best-effort: the choice still applies for this visit */
      });
    },
    [projectId]
  );

  // Check auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/');
      } else {
        setUserId(session.user.id);
      }
    });
  }, [router]);

  // Load the Project's name once we know who the user is
  useEffect(() => {
    if (!userId || !projectId) return;

    let cancelled = false;

    async function loadProject() {
      try {
        const res = await authFetch(`/api/projects/${projectId}`);
        if (cancelled) return;

        if (res.status === 404) {
          setLoadError('This Project no longer exists.');
          setLoading(false);
          return;
        }
        if (res.status === 403) {
          setLoadError('You do not have access to this Project.');
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setLoadError('Could not load this Project.');
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (cancelled) return;

        setProject({ id: data.id, name: data.name });
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load project:', err);
        setLoadError('Could not load this Project.');
        setLoading(false);
      }
    }

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [userId, projectId]);

  // Restore the remembered Manual / AI 1 / AI 2 choice for this project.
  useEffect(() => {
    if (!userId || !projectId) return;
    let cancelled = false;
    authFetch(`/api/user-preferences/kc_variant_${projectId}`)
      .then(res => (res.ok ? res.json() : { value: null }))
      .then(({ value }) => {
        if (cancelled) return;
        if (value === 'manual' || value === 'ai1' || value === 'ai2') {
          setMode(value);
        }
      })
      .catch(() => {
        /* best-effort: fall back to the default (Manual) */
      });
    return () => {
      cancelled = true;
    };
  }, [userId, projectId]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/projects/${projectId}`)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
            title="Back to Project"
          >
            ← Back to Project
          </button>
          <span className="text-gray-600">|</span>
          <h1 className="text-xl font-semibold">
            🔑 Keyword Clustering{' '}
            <span className="text-gray-500 text-sm font-normal">· v1.0</span>
          </h1>
          {project && (
            <>
              <span className="text-gray-600">|</span>
              <span className="font-medium text-gray-200">{project.name}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Mode toggle — Manual / AI 1 / AI 2 */}
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            <button
              title="Manual mode — sort keywords by hand"
              className={`px-4 py-1.5 text-sm transition-colors ${
                mode === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
              onClick={() => selectMode('manual')}
            >
              Manual
            </button>
            <button
              title="AI 1 — the original analysis engine"
              className={`px-4 py-1.5 text-sm transition-colors border-l border-gray-700 ${
                mode === 'ai1'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
              onClick={() => selectMode('ai1')}
            >
              AI 1
            </button>
            <button
              title="AI 2 — the new funnel engine (keeps its own copy of your keywords)"
              className={`px-4 py-1.5 text-sm transition-colors border-l border-gray-700 ${
                mode === 'ai2'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
              onClick={() => selectMode('ai2')}
            >
              AI 2
            </button>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {loading ? (
          <p className="text-gray-400 p-6">Loading Project…</p>
        ) : loadError ? (
          <div className="max-w-md mx-auto mt-24 p-6 text-center">
            <p className="text-4xl mb-4">⚠️</p>
            <p className="text-gray-300 mb-4">{loadError}</p>
            <button
              onClick={() => router.push('/projects')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
            >
              ← Back to Projects
            </button>
          </div>
        ) : project && userId ? (
          <KeywordWorkspace
            key={mode === 'ai2' ? 'vb' : 'main'}
            projectId={project.id}
            userId={userId}
            mode={mode}
          />
        ) : null}
      </div>
    </div>
  );
}
