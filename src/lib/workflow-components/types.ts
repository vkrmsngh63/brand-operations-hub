// Shared types for the Workflow Components Library.
//
// Per docs/WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md §A — structural decisions
// are frozen here; specific field shapes remain provisional and will firm up
// as concrete workflow needs surface (per project memory
// feedback_avoid_over_prescribing.md).

// Phase 1 ever sees only the first three. The last two are wired into the
// type system from day one so Phase 2 turn-on does not require a per-tool
// rewrite (per PLATFORM_REQUIREMENTS.md §4.6).
export type WorkflowStatus =
  | 'inactive'
  | 'active'
  | 'completed'
  | 'submitted-for-review'
  | 'revision-requested';

// Phase 1 = always 'admin' (admin-solo). Phase 2 introduces 'worker'.
export type UserRole = 'admin' | 'worker';

// Project summary returned by GET /api/projects/[projectId]. The hook only
// surfaces the fields workflows actually consume; additional fields stay on
// the API response and can be added here additively if a workflow surfaces
// concrete need.
export interface WorkflowContextProject {
  id: string;
  name: string;
}

// Phase-2-only assignment shape. Provisional — finalized at the Phase 2
// build session per design doc §8.
export interface WorkflowAssignment {
  id: string;
  userId: string;
  workflow: string;
  projectId: string;
}

// What useWorkflowContext() returns once it's done loading. While loading,
// `loading: true` and most fields are null/empty. The page component uses
// the loading + error fields to render its own loading/error UI; the hook
// stays unopinionated about how that UI looks.
export interface WorkflowContextValue {
  // Loading + error surface — the page decides what to show while these are
  // settling. `error` is a plain user-facing message (not a stack trace).
  loading: boolean;
  error: string | null;

  // Current authenticated user. Null until the auth check resolves; if it
  // resolves to "not signed in" the hook redirects to '/' before settling
  // (so consuming pages see loading: true → loading: false with userId set).
  userId: string | null;

  // Phase 1 = always 'admin'. Phase 2 will derive from a Phase-2-only API.
  userRole: UserRole;

  // Project summary for the route's projectId param. Null while loading or
  // on load failure (the consuming page reads `error` to render the failure
  // state).
  project: WorkflowContextProject | null;

  // The workflow this page is for. Passed in to the hook; surfaced here for
  // child components that need it (e.g., the reset dialog's copy).
  workflowSlug: string;

  // The five-state status. Null while the status row is loading.
  workflowStatus: WorkflowStatus | null;

  // Phase 2 only. Always null in Phase 1 (admin-solo, no assignments).
  workflowAssignment: WorkflowAssignment | null;

  // Whether the workflow's upstream-readiness rule (per PLATFORM_REQUIREMENTS
  // §6) is satisfied for this Project. Workflows with no upstream
  // dependencies pass `readinessRule: () => true` (or omit it; default is
  // always-ready).
  readyToStart: boolean;

  // Flips workflow status server-side and updates local state. Phase 1
  // accepts 'active' or 'completed' (matching the existing PATCH
  // /api/project-workflows/[projectId]/[workflow] contract). Phase 2 will
  // additionally accept 'submitted-for-review' / 'revision-requested'.
  requestStatusChange: (next: 'active' | 'completed') => Promise<void>;

  // Phase 2 only — opt-in per workflow per PLATFORM_REQUIREMENTS.md §5.
  // Phase 1 returns a no-op so consuming code can call without guarding.
  // Structural decision frozen; helper signature provisional (see design
  // doc §3.10).
  emitAuditEvent: (eventType: string, payload: object) => Promise<void>;
}
