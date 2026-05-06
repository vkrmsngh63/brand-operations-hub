'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { authFetch } from '@/lib/authFetch';
import type {
  UserRole,
  WorkflowAssignment,
  WorkflowContextProject,
  WorkflowContextValue,
  WorkflowStatus,
} from './types';

// useWorkflowContext — auth + project + role + workflow-status load for any
// workflow page. Replaces the boilerplate currently inlined at the top of
// W#1's keyword-clustering page.tsx (Supabase session check + project load
// + own loading/error state) so workflows #2-#14 don't have to repeat it.
//
// See docs/WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md §3.1 for the design.
//
// Usage:
//   const ctx = useWorkflowContext({
//     projectId,                       // from useParams()
//     workflowSlug: 'keyword-clustering',
//     readinessRule: () => true,       // optional; default = always ready
//   });
//   if (ctx.loading) return <Loading />;
//   if (ctx.error) return <Error msg={ctx.error} />;
//   // ...use ctx.project, ctx.workflowStatus, ctx.requestStatusChange(...)

export interface UseWorkflowContextArgs {
  // The Project's UUID — usually pulled from useParams() in the page
  // component. Null/undefined disables the load.
  projectId: string | null | undefined;

  // The workflow's slug — matches the segment under
  // src/app/projects/[projectId]/<slug>/. Used as the second path segment
  // for the workflow-status API.
  workflowSlug: string;

  // Phase 1: workflows with no upstream dependencies pass `() => true` (or
  // omit). Phase 2 will pass a callback that inspects upstream Project state
  // (e.g., "Keyword Clustering's status === 'completed'"). Provisional —
  // signature finalized when the first workflow with concrete upstream
  // dependencies surfaces.
  readinessRule?: () => boolean;
}

export function useWorkflowContext(
  args: UseWorkflowContextArgs
): WorkflowContextValue {
  const { projectId, workflowSlug, readinessRule } = args;
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [project, setProject] = useState<WorkflowContextProject | null>(null);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Auth check ──────────────────────────────────────────────────
  // If no session, redirect to '/' (matches existing W#1 + Projects-page
  // behavior). The hook stays in loading: true until the redirect happens
  // OR userId resolves; consuming pages don't see a flash of unauthenticated
  // content.
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (!session) {
        router.push('/');
        return;
      }
      setUserId(session.user.id);
      setAuthResolved(true);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  // ── Project + workflow-status load ──────────────────────────────
  useEffect(() => {
    if (!authResolved || !userId || !projectId) return;

    let cancelled = false;

    async function loadAll() {
      try {
        const [projectRes, workflowRes] = await Promise.all([
          authFetch(`/api/projects/${projectId}`),
          authFetch(
            `/api/project-workflows/${projectId}/${workflowSlug}`
          ),
        ]);
        if (cancelled) return;

        // Project load: surface 404 / 403 with user-facing copy matching the
        // existing W#1 + Projects-page conventions.
        if (projectRes.status === 404) {
          setError('This Project no longer exists.');
          setLoading(false);
          return;
        }
        if (projectRes.status === 403) {
          setError('You do not have access to this Project.');
          setLoading(false);
          return;
        }
        if (!projectRes.ok) {
          setError('Could not load this Project.');
          setLoading(false);
          return;
        }

        const projectData = await projectRes.json();
        if (cancelled) return;
        setProject({ id: projectData.id, name: projectData.name });

        // Workflow status load: silent failure is acceptable here — the API
        // route auto-creates the row on first GET, so a failure means
        // transient infra rather than missing data. Components that need a
        // valid status read `workflowStatus === null` as "still loading or
        // failed" and degrade gracefully (e.g., StatusBadge can render a
        // muted placeholder).
        if (workflowRes.ok) {
          const wfData = await workflowRes.json();
          if (!cancelled) {
            setWorkflowStatus(
              (wfData.status as WorkflowStatus | undefined) ?? null
            );
          }
        }

        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error('useWorkflowContext load failed:', err);
        setError('Could not load this Project.');
        setLoading(false);
      }
    }

    loadAll();

    return () => {
      cancelled = true;
    };
  }, [authResolved, userId, projectId, workflowSlug]);

  // ── requestStatusChange ─────────────────────────────────────────
  // Wraps PATCH /api/project-workflows/[projectId]/[workflow]. Optimistically
  // updates local state and rolls back on failure (the consuming page sees
  // the rollback as a status flicker — acceptable in Phase 1 admin-solo).
  const requestStatusChange = useCallback(
    async (next: 'active' | 'completed') => {
      if (!projectId) {
        throw new Error('requestStatusChange called before projectId resolved');
      }

      const previous = workflowStatus;
      setWorkflowStatus(next);

      try {
        const res = await authFetch(
          `/api/project-workflows/${projectId}/${workflowSlug}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: next }),
          }
        );
        if (!res.ok) {
          setWorkflowStatus(previous);
          throw new Error(
            `Failed to update workflow status (HTTP ${res.status})`
          );
        }
        const updated = await res.json();
        setWorkflowStatus((updated.status as WorkflowStatus | undefined) ?? next);
      } catch (err) {
        setWorkflowStatus(previous);
        throw err;
      }
    },
    [projectId, workflowSlug, workflowStatus]
  );

  // ── emitAuditEvent (Phase 2 stub) ───────────────────────────────
  // Phase 1 returns a no-op so consuming code can call without guarding.
  // Phase 2 build session replaces this with the real emitter. Structural
  // decision (opt-in via hook import; per-workflow event vocabulary)
  // already frozen; signature is provisional per design doc §3.10.
  //
  // Param names are dropped (TypeScript contravariance lets the narrower
  // () => Promise<void> satisfy the wider (eventType, payload) =>
  // Promise<void> in WorkflowContextValue) so the no-op stub doesn't trip
  // the @typescript-eslint/no-unused-vars warning.
  const emitAuditEvent: (eventType: string, payload: object) => Promise<void> =
    useCallback(async () => {
      // No-op in Phase 1.
    }, []);

  // ── Phase 1 derived values ──────────────────────────────────────
  const userRole: UserRole = 'admin'; // Phase 1 admin-solo per PLATFORM_REQUIREMENTS §2.
  const workflowAssignment: WorkflowAssignment | null = null; // Phase 2 only.
  const readyToStart = useMemo(() => {
    if (readinessRule) return readinessRule();
    return true; // Default: workflows with no declared rule are always ready.
  }, [readinessRule]);

  return {
    loading,
    error,
    userId,
    userRole,
    project,
    workflowSlug,
    workflowStatus,
    workflowAssignment,
    readyToStart,
    requestStatusChange,
    emitAuditEvent,
  };
}
