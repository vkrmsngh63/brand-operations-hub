'use client';

import type { ReactNode } from 'react';
import type { UserRole } from './types';

// DeliverablesArea — bordered region of the workflow page where files
// relevant to this workflow live. Per design doc §3.4 + §4.1 it has two
// optional sub-sections:
//
//   Resources           — files attached to the workflow itself, not to
//                         any specific Project. PLATFORM_REQUIREMENTS §12.6
//                         pattern #1 (always-visible deliverables). Same
//                         files for every Project running this workflow.
//                         Examples: companion download, user guides,
//                         template Excel sheets.
//
//   Project deliverables — files generated, uploaded, or produced
//                         specifically for THIS Project's run of this
//                         workflow. Different per Project.
//
// Workflows declare which sub-sections they use (one, the other, or both).
// If neither is declared (both props absent), the component renders nothing.
//
// Phase 1 scope: the Resources sub-section is implemented as a slot —
// workflows pass children (typically <CompanionDownload>, custom rows for
// user guides, etc.). The Project-deliverables sub-section is implemented
// as a slot too — the actual upload/download wiring is a workflow concern
// in Phase 1; the component just provides the chrome around it. Phase 2
// may promote upload/download into the component itself once a real
// workflow surfaces concrete file-handling needs (per
// feedback_avoid_over_prescribing.md).

export interface DeliverablesAreaProps {
  // Workflow-supplied content for the Resources sub-section. Pass
  // <CompanionDownload>, custom rows, etc. Omit if the workflow has no
  // always-visible files.
  resources?: ReactNode;

  // Workflow-supplied content for the Project-deliverables sub-section.
  // Phase 1: workflows render their own upload/download UI here. Phase 2
  // may move that into the component. Omit if the workflow has no
  // Project-specific files.
  projectDeliverables?: ReactNode;

  // Current user's role — used by sub-sections to gate admin-only
  // controls. Workflows pass this through; the slots themselves can read
  // it via the data they receive from useWorkflowContext().
  // Reserved for future use; currently unused at the wrapper level (the
  // sub-section content already knows the role from the context). Kept on
  // the interface so prop-drilling at the workflow page stays consistent.
  userRole?: UserRole;
}

export function DeliverablesArea({
  resources,
  projectDeliverables,
}: DeliverablesAreaProps) {
  // If neither sub-section is declared, render nothing.
  if (!resources && !projectDeliverables) return null;

  return (
    <div
      style={{
        margin: '20px 0',
        padding: '20px',
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '12px',
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      {resources && (
        <section style={{ marginBottom: projectDeliverables ? '24px' : 0 }}>
          <h3
            style={{
              margin: 0,
              marginBottom: '12px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#8b949e',
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
            }}
          >
            Resources
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {resources}
          </div>
        </section>
      )}

      {projectDeliverables && (
        <section>
          <h3
            style={{
              margin: 0,
              marginBottom: '12px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#8b949e',
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
            }}
          >
            Project deliverables
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {projectDeliverables}
          </div>
        </section>
      )}
    </div>
  );
}
