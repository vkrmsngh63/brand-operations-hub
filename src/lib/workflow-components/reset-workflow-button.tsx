'use client';

import type { UserRole } from './types';

// ResetWorkflowButton — admin-only button that opens the reset confirmation
// dialog. Renders nothing for non-admins. Per design doc §3.6 +
// PLATFORM_REQUIREMENTS.md §7 (admin-only destructive action).
//
// Typically rendered inside <WorkflowTopbar> via its onReset prop, but
// workflows can place it anywhere. Pair with <ResetConfirmDialog> — this
// component just opens the dialog; the dialog handles the type-to-confirm
// flow + onConfirm callback.

export interface ResetWorkflowButtonProps {
  // Click handler — typically `() => setResetDialogOpen(true)` in the page.
  onClick: () => void;

  // The current user's role. Workers don't see the reset button.
  userRole: UserRole;

  // Optional override — defaults to "Reset workflow".
  label?: string;
}

export function ResetWorkflowButton({
  onClick,
  userRole,
  label,
}: ResetWorkflowButtonProps) {
  if (userRole !== 'admin') return null;

  return (
    <button
      type="button"
      onClick={onClick}
      title="Permanently delete this workflow's data for this Project (admin only)"
      style={{
        padding: '6px 12px',
        background: 'transparent',
        border: '1px solid rgba(248, 81, 73, 0.4)',
        borderRadius: '6px',
        color: '#f85149',
        fontSize: '12px',
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      ⚠ {label ?? 'Reset workflow'}
    </button>
  );
}
