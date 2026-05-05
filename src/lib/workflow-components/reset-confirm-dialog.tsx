'use client';

import { useState } from 'react';
import { projectNameMatches } from './reset-confirm-helpers';

// ResetConfirmDialog — the "type the project name to confirm" dialog for
// admin reset per PLATFORM_REQUIREMENTS.md §7. Standardized across all
// workflows that use it (consistency on a destructive operation is
// high-value chrome). The dialog calls back to the workflow's own
// `resetWorkflowData(projectId)` function — actual data deletion is
// per-workflow per §7.3; the confirmation UX is shared.
//
// See design doc §3.6.
//
// Internal-state freshness: the wrapper renders nothing when open=false;
// the body is a separate component that only mounts when open=true. That
// gives us "fresh state every open" (each open is a new mount, so initial
// useState values fire) without resorting to setState-in-effect (which
// trips the react-hooks/set-state-in-effect lint rule).
//
// Pure-logic split: the match function lives in reset-confirm-helpers.ts
// so it can be unit-tested via node --test (which can't strip-types from
// .tsx files).

export interface ResetConfirmDialogProps {
  // Whether the dialog is open. Pass true from the workflow page when the
  // admin clicks ResetWorkflowButton; the dialog's own Cancel button calls
  // onClose to flip back to false.
  open: boolean;

  // The Project's display name — what the admin must type to confirm.
  projectName: string;

  // Plain-language workflow name — used in the dialog copy ("delete all
  // <workflowName> data for <projectName>").
  workflowName: string;

  // Callback fired when the admin clicks "Reset" with the matching project
  // name typed. Should perform the actual data deletion + flip status to
  // 'inactive'. The dialog awaits this; while it's awaiting, the buttons
  // disable and the dialog shows "Resetting…".
  onConfirm: () => Promise<void>;

  // Callback fired when the admin clicks Cancel or after a successful
  // onConfirm completes. The page typically uses this to flip its `open`
  // state back to false.
  onClose: () => void;
}

export function ResetConfirmDialog(props: ResetConfirmDialogProps) {
  if (!props.open) return null;
  return <ResetConfirmDialogBody {...props} />;
}

// Internal — renders the actual dialog UI. Lives as its own component so
// it mounts/unmounts with the `open` prop, giving fresh useState defaults
// every time the dialog opens without setState-in-effect.
function ResetConfirmDialogBody({
  projectName,
  workflowName,
  onConfirm,
  onClose,
}: Omit<ResetConfirmDialogProps, 'open'>) {
  const [typed, setTyped] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const matches = projectNameMatches(typed, projectName);

  async function handleConfirm() {
    if (!matches || resetting) return;
    setResetting(true);
    setResetError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Reset failed:', err);
      setResetError(
        'Reset failed — nothing was changed. Try again, or close and retry later.'
      );
      setResetting(false);
    }
  }

  function handleCancel() {
    if (resetting) return; // Don't allow cancel mid-reset.
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-dialog-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          margin: '24px',
          padding: '28px',
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '12px',
          color: '#e6edf3',
        }}
      >
        <h2
          id="reset-dialog-title"
          style={{
            margin: 0,
            marginBottom: '12px',
            fontSize: '18px',
            fontWeight: 700,
            color: '#f85149',
          }}
        >
          Reset {workflowName} for this Project?
        </h2>
        <p
          style={{
            margin: 0,
            marginBottom: '16px',
            fontSize: '13px',
            color: '#8b949e',
            lineHeight: 1.6,
          }}
        >
          This permanently deletes all {workflowName} data for{' '}
          <strong style={{ color: '#e6edf3' }}>{projectName}</strong>. Other
          workflows on this Project are not affected. This cannot be undone.
        </p>
        <p
          style={{
            margin: 0,
            marginBottom: '8px',
            fontSize: '12px',
            color: '#8b949e',
          }}
        >
          Type the Project name to confirm:{' '}
          <code
            style={{
              padding: '1px 6px',
              background: '#0d1117',
              border: '1px solid #30363d',
              borderRadius: '4px',
              color: '#e6edf3',
              fontSize: '12px',
            }}
          >
            {projectName}
          </code>
        </p>
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          disabled={resetting}
          placeholder="Type the Project name…"
          style={{
            width: '100%',
            padding: '10px 12px',
            background: '#0d1117',
            border: `1px solid ${matches ? '#3fb950' : '#30363d'}`,
            borderRadius: '6px',
            color: '#e6edf3',
            fontSize: '13px',
            fontFamily: "'IBM Plex Sans', sans-serif",
            marginBottom: '16px',
            boxSizing: 'border-box',
          }}
          autoFocus
        />
        {resetError && (
          <p
            role="alert"
            style={{
              margin: 0,
              marginBottom: '12px',
              padding: '8px 12px',
              background: 'rgba(248, 81, 73, 0.1)',
              border: '1px solid rgba(248, 81, 73, 0.4)',
              borderRadius: '6px',
              color: '#f85149',
              fontSize: '12px',
            }}
          >
            {resetError}
          </p>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={handleCancel}
            disabled={resetting}
            style={{
              padding: '8px 14px',
              background: 'transparent',
              border: '1px solid #30363d',
              borderRadius: '6px',
              color: '#e6edf3',
              fontSize: '13px',
              fontWeight: 500,
              cursor: resetting ? 'not-allowed' : 'pointer',
              fontFamily: "'IBM Plex Sans', sans-serif",
              opacity: resetting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!matches || resetting}
            style={{
              padding: '8px 14px',
              background: matches ? '#da3633' : '#30363d',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: !matches || resetting ? 'not-allowed' : 'pointer',
              fontFamily: "'IBM Plex Sans', sans-serif",
              opacity: !matches || resetting ? 0.5 : 1,
            }}
          >
            {resetting ? 'Resetting…' : `Reset ${workflowName}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// Re-export for convenience — callers can pull the helper from either
// module.
export { projectNameMatches } from './reset-confirm-helpers';
