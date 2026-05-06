'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

// WorkflowTopbar — horizontal band at the top of a workflow page. Per
// design doc §3.2 it has three regions left-to-right:
//
//   left:   workflow title + breadcrumb (clickable back-to-Project link)
//   center: empty slot (reserved for future workflow-specific quick-action)
//   right:  admin-only reset button + any other workflow-supplied controls
//
// The status badge intentionally does NOT live inside the topbar. Per
// Cluster 1 Decision 1A the workflow's page composition renders <StatusBadge>
// separately — Phase 2's review-cycle states need visual room without
// redesigning the topbar.
//
// Workflows with unusual chrome (e.g., W#1's full-screen canvas mode) may
// skip <WorkflowTopbar> and render their own.

export interface WorkflowTopbarProps {
  // Workflow title — e.g., "Keyword Clustering" or "Competition Scraping".
  // Plain text shown in the topbar's left region.
  title: string;

  // Project's display name — used for the breadcrumb back-link. Typically
  // passed from useWorkflowContext().project?.name.
  projectName: string | null;

  // The Project's UUID — for the back-link href.
  projectId: string;

  // Optional emoji/icon shown before the title — matches the per-workflow
  // icons used on Projects-page workflow cards.
  icon?: string;

  // Slot for admin controls on the right — typically <ResetWorkflowButton>,
  // optionally other workflow-specific admin chrome. Workflows pass their
  // own composition; the topbar makes no assumption about what's here.
  rightSlot?: ReactNode;

  // Slot for workflow-specific quick-action controls in the middle region.
  // Workflows that don't need it omit; the slot collapses to empty space.
  centerSlot?: ReactNode;
}

export function WorkflowTopbar({
  title,
  projectName,
  projectId,
  icon,
  rightSlot,
  centerSlot,
}: WorkflowTopbarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        padding: '16px 32px',
        borderBottom: '1px solid #21262d',
        background: 'rgba(13, 17, 23, 0.6)',
        backdropFilter: 'blur(8px)',
        fontFamily: "'IBM Plex Sans', sans-serif",
        color: '#e6edf3',
      }}
    >
      {/* Left — back link + title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          minWidth: 0,
        }}
      >
        <Link
          href={`/projects/${projectId}`}
          style={{
            padding: '6px 12px',
            background: 'transparent',
            border: '1px solid #30363d',
            borderRadius: '6px',
            color: '#e6edf3',
            fontSize: '12px',
            fontWeight: 500,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
          title={projectName ? `Back to ${projectName}` : 'Back to Project'}
        >
          ← Back to Project
        </Link>
        <span style={{ color: '#30363d' }}>|</span>
        <h1
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: 0,
          }}
        >
          {icon && <span aria-hidden>{icon}</span>}
          <span style={{ whiteSpace: 'nowrap' }}>{title}</span>
        </h1>
        {projectName && (
          <>
            <span style={{ color: '#30363d' }}>|</span>
            <span
              style={{
                fontSize: '14px',
                color: '#8b949e',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minWidth: 0,
              }}
              title={projectName}
            >
              {projectName}
            </span>
          </>
        )}
      </div>

      {/* Center — workflow-supplied quick-action slot */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        {centerSlot}
      </div>

      {/* Right — admin controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {rightSlot}
      </div>
    </div>
  );
}
