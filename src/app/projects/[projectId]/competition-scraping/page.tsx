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

  // Reset wiring — calls the admin reset endpoint and then refreshes. The
  // endpoint itself is deferred to a follow-up session per the stack
  // decisions doc §11; this is the call-site placeholder per the page's
  // composition spec.
  const handleResetConfirm = async () => {
    // Placeholder — real wiring lands when POST /api/projects/[projectId]/
    // competition-scraping/reset ships per COMPETITION_SCRAPING_STACK_DECISIONS.md
    // §11.1. Today the button is wired so the components library composition
    // is verifiable; the call below intentionally throws to make any wrong-
    // session use loud.
    throw new Error(
      'W#2 admin reset endpoint not yet implemented — deferred to a follow-up session per COMPETITION_SCRAPING_STACK_DECISIONS.md §11.'
    );
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

        {/* Content area — placeholder. The custom multi-table viewer
            (platforms → URLs → captured rows + sort/filter + image expand)
            is the workflow's own concern per
            PLATFORM_REQUIREMENTS.md §12.6 shared component pattern #2 and
            is deferred to a follow-up session along with the API routes
            per COMPETITION_SCRAPING_STACK_DECISIONS.md §11. */}
        <section
          style={{
            marginTop: '32px',
            padding: '32px',
            background: '#161b22',
            border: '1px dashed #30363d',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#8b949e',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#e6edf3' }}>
            Captured competition data will appear here
          </div>
          <div style={{ fontSize: '13px', lineHeight: 1.6, maxWidth: '640px', margin: '0 auto' }}>
            Once the API routes and the multi-table viewer ship in a follow-up
            session, this area will show the platforms → URLs → captured-rows
            navigation with sort, filter, and image expand. The schema
            (CompetitorUrl, CompetitorSize, CapturedText, CapturedImage,
            VocabularyEntry) is in place as of today.
          </div>
        </section>
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
