'use client';

import type { WorkflowStatus } from './types';
import {
  STATUS_BADGE_PALETTE,
  STATUS_BADGE_LOADING_PALETTE,
} from './status-badge-palette';

// StatusBadge — a small colored badge with a label for the workflow's
// current status. Used on workflow pages AND on Projects-page workflow
// cards (per PLATFORM_REQUIREMENTS.md §4.6 "centralized component that can
// expand to show more states later without per-tool rewrites").
//
// State set per docs/WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md §3.3 Decision 1B:
//
//   inactive              → gray   "Not started"          (Phase 1 + 2)
//   active                → yellow "In progress"          (Phase 1 + 2)
//   completed             → green  "Completed"            (Phase 1 + 2)
//   submitted-for-review  → blue   "Awaiting review"      (Phase 2 only)
//   revision-requested    → orange "Revisions requested"  (Phase 2 only)
//
// All five states are wired from day one; Phase 1 only ever transitions
// among the first three.
//
// Drift note: the existing inline <StatusBadge> in
// src/app/projects/[projectId]/page.tsx uses BLUE for `active` with label
// "Active". The shared-library version follows the design doc (yellow / "In
// progress"). The Projects page should swap to this shared component in a
// future polish pass for visual consistency. Captured as deferred Task #6
// at end of build session.
//
// Pure-logic split — the palette table lives in status-badge-palette.ts so
// it can be unit-tested via node --test (which can't strip-types from .tsx).

export interface StatusBadgeProps {
  // The current status. `null` renders a muted "Loading…" placeholder so
  // workflow pages can render the badge before useWorkflowContext() resolves
  // without a layout flash.
  status: WorkflowStatus | null;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const palette = status ? STATUS_BADGE_PALETTE[status] : STATUS_BADGE_LOADING_PALETTE;

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        background: palette.bg,
        color: palette.color,
        border: `1px solid ${palette.border}`,
        borderRadius: '10px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      {palette.label}
    </span>
  );
}

// Re-exports for convenience — callers who want the palette table without
// rendering can pull it from either this module or status-badge-palette.ts.
export { STATUS_BADGE_PALETTE, STATUS_BADGE_LOADING_LABEL } from './status-badge-palette';
