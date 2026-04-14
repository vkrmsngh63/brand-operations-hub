'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { authFetch } from '@/lib/authFetch';
import KeywordWorkspace from './components/KeywordWorkspace';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Project {
  id: string;
  name: string;
  updatedAt: string;
  _count: { keywords: number; canvasNodes: number };
}

export default function KeywordClusteringPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [aiMode, setAiMode] = useState(false);

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

  // Load projects once we have userId
  useEffect(() => {
    if (!userId) return;
    fetchProjects();
  }, [userId]);

  async function fetchProjects() {
    try {
      const res = await authFetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createProject() {
    if (!newName.trim()) return;
    try {
      const res = await authFetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), workflow: 'keyword-clustering' }),
      });
      if (res.ok) {
        setNewName('');
        setShowNewForm(false);
        fetchProjects();
      }
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  }

  async function deleteProject(id: string) {
    if (!confirm('Delete this project and all its data?')) return;
    try {
      await authFetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (activeProjectId === id) setActiveProjectId(null);
      fetchProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-2xl hover:opacity-80 transition-opacity"
            title="Back to Hub"
          >
            🏠
          </button>
          <h1 className="text-xl font-semibold">
            🔑 Keyword Clustering <span className="text-gray-500 text-sm font-normal">· v1.0</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Mode toggle — Manual / AI */}
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            <button
              className={`px-4 py-1.5 text-sm transition-colors ${!aiMode ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
              onClick={() => setAiMode(false)}
            >
              Manual
            </button>
            <button
              className={`px-4 py-1.5 text-sm transition-colors ${aiMode ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
              onClick={() => setAiMode(true)}
            >
              AI
            </button>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {loading ? (
          <p className="text-gray-400 p-6">Loading projects…</p>
        ) : !activeProjectId ? (
          /* ── Project Selector ── */
          <div className="max-w-2xl mx-auto mt-12 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium">Your Projects</h2>
              <button
                onClick={() => setShowNewForm(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
              >
                + New Project
              </button>
            </div>

            {/* New project form */}
            {showNewForm && (
              <div className="flex gap-3 mb-6 p-4 rounded-lg bg-gray-800/60 border border-gray-700">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createProject()}
                  placeholder="Project name…"
                  className="flex-1 px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <button
                  onClick={createProject}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-md transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => { setShowNewForm(false); setNewName(''); }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Project list */}
            {projects.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-4xl mb-4">📁</p>
                <p>No projects yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-800/40 border border-gray-700/60 hover:border-blue-500/40 transition-colors cursor-pointer group"
                    onClick={() => setActiveProjectId(p.id)}
                  >
                    <div>
                      <h3 className="font-medium group-hover:text-blue-400 transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {p._count.keywords} keywords · {p._count.canvasNodes} topics · Updated{' '}
                        {new Date(p.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                      className="text-gray-600 hover:text-red-400 text-sm transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── Active Project Workspace ── */
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-800">
              <button
                onClick={() => setActiveProjectId(null)}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                ← Back to projects
              </button>
              <span className="text-gray-600">|</span>
              <span className="font-medium">
                {projects.find((p) => p.id === activeProjectId)?.name}
              </span>
            </div>
            <KeywordWorkspace projectId={activeProjectId} userId={userId!} aiMode={aiMode} />
          </div>
        )}
      </div>
    </div>
  );
}
