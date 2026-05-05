'use client';

import { useState } from 'react';

// WorkerCompletionButton — the button the user clicks to advance the
// workflow status forward. Per design doc §3.8 + Decision 3B completion is
// always button-driven (no data-driven completion at the library level).
//
// Phase 1: button always flips status active → completed (admin-solo;
// review cycle infrastructure not yet built per PLATFORM_REQUIREMENTS §4.4).
//
// Phase 2 with reviewCycle === 'standard': button label defaults to
// "I'm done — please review" and click flips status to
// 'submitted-for-review'. The Phase 2 build session enables this path.
//
// Phase 2 with reviewCycle === 'skip': same as Phase 1 — button flips
// straight to 'completed'. Workflows that don't want a review cycle declare
// this so adopting Phase 2 doesn't accidentally change their flow.
//
// Disabled state: when readyToStart is false the button renders disabled.
// The NotReadyBanner separately explains why; the disabled button is
// visual reinforcement.

import type { WorkflowStatus } from './types';

export interface WorkerCompletionButtonProps {
  // Workflow's review-cycle declaration, made at design time per
  // HANDOFF_PROTOCOL Rule 18 Q9. 'skip' = Phase 1 + 2 always flip to
  // 'completed'; 'standard' = Phase 2 flips to 'submitted-for-review'
  // (Phase 1 still flips to 'completed' since the review cycle isn't built
  // yet per PLATFORM_REQUIREMENTS §4.4).
  reviewCycle: 'standard' | 'skip';

  // Current workflow status — drives whether the button shows or hides.
  // Renders only when status is 'active' (or 'revision-requested' in
  // Phase 2). Hidden for inactive (no work to complete yet) and completed
  // (already done — admin uses ReopenWorkflowButton to undo).
  workflowStatus: WorkflowStatus | null;

  // True when the workflow's upstream-readiness rule is satisfied. False
  // disables the button (paired with NotReadyBanner explaining why).
  readyToStart: boolean;

  // Callback invoked on click. Typically wired to ctx.requestStatusChange.
  // The component awaits this; while awaiting, the button is disabled and
  // shows "Submitting…".
  //
  // Phase 1: pass `() => ctx.requestStatusChange('completed')`.
  // Phase 2 'standard': pass a callback that hits the Phase 2 status API.
  onComplete: () => Promise<void>;

  // Optional override — workflows can use workflow-specific phrasing.
  // Defaults: 'standard' → "I'm done — please review"; 'skip' → "Mark
  // complete".
  label?: string;
}

export function WorkerCompletionButton({
  reviewCycle,
  workflowStatus,
  readyToStart,
  onComplete,
  label,
}: WorkerCompletionButtonProps) {
  const [submitting, setSubmitting] = useState(false);

  // Hide the button outside states where completion is meaningful.
  if (
    workflowStatus !== 'active' &&
    workflowStatus !== 'revision-requested'
  ) {
    return null;
  }

  const defaultLabel =
    reviewCycle === 'standard' ? "I'm done — please review" : 'Mark complete';
  const buttonLabel = label ?? defaultLabel;

  const disabled = !readyToStart || submitting;

  async function handleClick() {
    if (disabled) return;
    setSubmitting(true);
    try {
      await onComplete();
    } catch (err) {
      console.error('WorkerCompletionButton onComplete failed:', err);
      // Fall through; the consuming page is responsible for surfacing the
      // error to the user (e.g., via the loadError state pattern). The
      // button just resets so the user can retry.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={
        !readyToStart
          ? 'Upstream workflow needs to finish first'
          : undefined
      }
      style={{
        padding: '10px 18px',
        background: disabled ? '#30363d' : '#238636',
        border: 'none',
        borderRadius: '6px',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'IBM Plex Sans', sans-serif",
        opacity: disabled && !submitting ? 0.6 : 1,
      }}
    >
      {submitting ? 'Submitting…' : `✓ ${buttonLabel}`}
    </button>
  );
}
