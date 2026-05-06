'use client';

// W#2 Competition Scraping & Deep Analysis — PLOS-side page.
//
// First vertical slice. Composes the Shared Workflow Components Library
// per docs/COMPETITION_SCRAPING_DESIGN.md §A.14 (reframed 2026-05-05) and
// docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §10. The custom multi-table
// viewer for the content area (platforms → URLs → captured rows) is the
// workflow's own concern per PLATFORM_REQUIREMENTS.md §12.6 shared
// component pattern #2 and is deferred to a follow-up session along with
// the API routes per §11.
//
// Library components imported here:
//   - useWorkflowContext()     — auth + project + role + workflow-status
//   - <WorkflowTopbar>          — title + back-to-Project breadcrumb +
//                                 admin-only reset button slot
//   - <StatusBadge>             — five-state badge (Phase 1 sees first 3)
//   - <DeliverablesArea>        — Resources sub-section
//   - <CompanionDownload>       — Chrome extension download (placeholder)
//   - <ResetWorkflowButton>     — admin-only reset entry point
//   - <ResetConfirmDialog>      — type-the-project-name destructive confirm
//   - <WorkerCompletionButton>  — Phase-1 button-driven completion
//
// Skipped per W#2's design:
//   - <NotReadyBanner>          — W#2 declared "always ready" (§A.6)
//   - <AdminReviewControls>     — W#2 declared reviewCycle: 'skip' (§A.9)

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { authFetch } from '@/lib/authFetch';
import {
  CompanionDownload,
  DeliverablesArea,
  ResetConfirmDialog,
  ResetWorkflowButton,
  StatusBadge,
  STATUS_BADGE_LOADING_LABEL,
  STATUS_BADGE_LOADING_PALETTE,
  useWorkflowContext,
  WorkerCompletionButton,
  WorkflowTopbar,
} from '@/lib/workflow-components';
import { CompetitionScrapingViewer } from './components/CompetitionScrapingViewer';

const WORKFLOW_SLUG = 'competition-scraping';
const WORKFLOW_NAME = 'Competition Scraping & Deep Analysis';
const WORKFLOW_ICON = '🔍';

export default function CompetitionScrapingPage() {
  const params = useParams();
  const projectId = (params?.projectId as string) ?? null;

  const ctx = useWorkflowContext({
    projectId,
    workflowSlug: WORKFLOW_SLUG,
    // W#2 is "always ready" per COMPETITION_SCRAPING_DESIGN.md §A.6 — no
    // upstream dependency on W#1 or any other workflow. Default ready.
  });

  const [resetOpen, setResetOpen] = useState(false);

  if (ctx.loading || !ctx.project) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0d1117',
          color: '#e6edf3',
          fontFamily: "'IBM Plex Sans', sans-serif",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {ctx.error ? (
          <div style={{ textAlign: 'center', maxWidth: '480px' }}>
            <div style={{ fontSize: '14px', color: '#f85149', marginBottom: '12px' }}>
              Couldn&rsquo;t load this Project
            </div>
            <div style={{ fontSize: '13px', color: '#8b949e' }}>{ctx.error}</div>
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: '#8b949e' }}>Loading…</div>
        )}
      </div>
    );
  }

  // Reset wiring — calls the admin reset endpoint and reloads the page on
  // success so useWorkflowContext re-mounts from a clean slate (status
  // flips back to "inactive", deliverables area refreshes).
  //
  // The dialog already validated the typed name client-side. The endpoint
  // re-validates server-side via { confirmProjectName } in the body,
  // defense-in-depth; we send ctx.project.name (the canonical name the
  // user just confirmed they typed). Server compares against
  // prisma.project.findUnique to catch race-edit cases.
  //
  // Errors propagate to the dialog body's catch block, which surfaces a
  // "Reset failed — try again" banner.
  const handleResetConfirm = async () => {
    if (!ctx.project) {
      throw new Error('No Project loaded — reset cannot proceed.');
    }
    const res = await authFetch(
      `/api/projects/${ctx.project.id}/competition-scraping/reset`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmProjectName: ctx.project.name }),
      }
    );
    if (!res.ok) {
      const body = (await res
        .json()
        .catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? `Reset failed (HTTP ${res.status})`);
    }
    // Force a full reload so workflow context, deliverables, and any
    // future content-area state are all re-fetched from a clean DB.
    window.location.reload();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0d1117',
        color: '#e6edf3',
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <WorkflowTopbar
        title={WORKFLOW_NAME}
        projectName={ctx.project.name}
        projectId={ctx.project.id}
        icon={WORKFLOW_ICON}
        rightSlot={
          <ResetWorkflowButton
            userRole={ctx.userRole}
            onClick={() => setResetOpen(true)}
          />
        }
      />

      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '24px 32px 64px' }}>
        {/* Status row — badge + worker-completion button. */}
        <section
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#8b949e' }}>Status:</span>
            {ctx.workflowStatus ? (
              <StatusBadge status={ctx.workflowStatus} />
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  background: STATUS_BADGE_LOADING_PALETTE.bg,
                  color: STATUS_BADGE_LOADING_PALETTE.color,
                  border: `1px solid ${STATUS_BADGE_LOADING_PALETTE.border}`,
                }}
              >
                {STATUS_BADGE_LOADING_LABEL}
              </span>
            )}
          </div>

          <WorkerCompletionButton
            reviewCycle="skip"
            workflowStatus={ctx.workflowStatus}
            readyToStart={ctx.readyToStart}
            onComplete={() => ctx.requestStatusChange('completed')}
          />
        </section>

        {/* Deliverables — Resources sub-section with the Chrome extension
            companion download. Real download URL + Detailed User Guide
            content authoring deferred to a follow-up session per
            COMPETITION_SCRAPING_STACK_DECISIONS.md §13.1. */}
        <DeliverablesArea
          resources={
            <CompanionDownload
              label="Download Extension (zip)"
              url="#download-extension-pending"
              description="Chrome extension for capturing competitor URLs, text, and images. Install instructions and full workflow walkthrough land in the Detailed User Guide in a follow-up session."
            />
          }
        />

        {/* Content area — the W#2 custom multi-table viewer. First slice
            ships the platforms-→-URLs nav + URL list with sort + free-text
            search per docs/COMPETITION_SCRAPING_DESIGN.md §A.7 + §A.14 and
            PLATFORM_REQUIREMENTS.md §12.6 shared component pattern #2 (the
            content area is the workflow's own concern, not imposed by the
            library). Follow-up slices add the /url/[urlId] detail page,
            inline editing, captured-text + image rows, and the image
            expand viewer. */}
        <CompetitionScrapingViewer projectId={ctx.project.id} />
      </main>

      <ResetConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        projectName={ctx.project.name}
        workflowName={WORKFLOW_NAME}
        onConfirm={handleResetConfirm}
      />
    </div>
  );
}
