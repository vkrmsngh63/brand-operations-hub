// Shared Workflow Components Library — Phase 1 build.
//
// Per docs/WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md §A. Bottom-up library of
// reusable React components and hooks that PLOS workflow tools (workflow #2
// through workflow #14) import to handle shared chrome concerns. The
// library does NOT impose a layout — workflows compose their own pages by
// importing the components they need.
//
// Phase 1 components (this barrel exports):
//   - useWorkflowContext()        — auth + project + role + workflow-status
//   - <StatusBadge>               — five-state status display
//   - <NotReadyBanner>            — upstream-readiness banner
//   - <ResetWorkflowButton>       — admin-only reset entry point
//   - <ResetConfirmDialog>        — type-the-project-name destructive confirm
//   - <WorkflowTopbar>            — title + breadcrumb + admin slot
//   - <DeliverablesArea>          — Resources + Project deliverables sub-sections
//   - <CompanionDownload>         — external-client companion download
//   - <WorkerCompletionButton>    — Phase 1 + Phase 2 button-driven completion
//
// Phase 2 components NOT yet built (added in Phase 2 build session):
//   - <AdminReviewControls>       — Accept / Request revisions
//   - useEmitAuditEvent()         — opt-in audit event emission
//
// See docs/PLATFORM_REQUIREMENTS.md §12 for the architectural commitment.

export { useWorkflowContext } from './use-workflow-context';
export type {
  UseWorkflowContextArgs,
} from './use-workflow-context';

export { StatusBadge } from './status-badge';
export type { StatusBadgeProps } from './status-badge';
export {
  STATUS_BADGE_PALETTE,
  STATUS_BADGE_LOADING_PALETTE,
  STATUS_BADGE_LOADING_LABEL,
} from './status-badge-palette';
export type { StatusBadgePaletteEntry } from './status-badge-palette';

export { NotReadyBanner } from './not-ready-banner';
export type {
  NotReadyBannerProps,
  MissingDependency,
} from './not-ready-banner';

export { ResetConfirmDialog } from './reset-confirm-dialog';
export type { ResetConfirmDialogProps } from './reset-confirm-dialog';
export { projectNameMatches } from './reset-confirm-helpers';

export { ResetWorkflowButton } from './reset-workflow-button';
export type { ResetWorkflowButtonProps } from './reset-workflow-button';

export { WorkflowTopbar } from './workflow-topbar';
export type { WorkflowTopbarProps } from './workflow-topbar';

export { DeliverablesArea } from './deliverables-area';
export type { DeliverablesAreaProps } from './deliverables-area';

export { CompanionDownload } from './companion-download';
export type { CompanionDownloadProps } from './companion-download';

export { WorkerCompletionButton } from './worker-completion-button';
export type { WorkerCompletionButtonProps } from './worker-completion-button';

export type {
  WorkflowStatus,
  UserRole,
  WorkflowContextProject,
  WorkflowAssignment,
  WorkflowContextValue,
} from './types';
