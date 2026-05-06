'use client';

// Components-library smoke-test page — Phase 1 build deliverable.
//
// Per docs/WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md §9 Session 1: "One
// end-to-end smoke check using a stub workflow page before W#2 PLOS build
// begins."
//
// This page renders every Phase-1 component in the library with FAKE
// PROPS (no useWorkflowContext call, no real API, no DB writes). The
// purpose is purely visual verification — the director can navigate to
// /components-smoke-test on dev or production and see every component
// rendered together. The hook itself is verified by tsc + build (no real
// page imports it yet — W#2's PLOS build is the first consumer).
//
// Path is at the app root at /components-smoke-test (NOT under
// /projects/[projectId]) so the smoke test does not require a Project to
// exist; components rendered here use fake values for everything
// project-scoped. The path is internal-only — no nav links to it;
// director types it directly to view. (Earlier draft used
// /__components-smoke-test; renamed to drop leading-underscore because
// Next.js App Router treats `_foo` folders as private and opts them out
// of routing.)
//
// Removal: this page can be deleted at any time after W#2 has its own
// real page composing the library; W#2's page replaces this as the
// authoritative composition reference.

import { useState } from 'react';
import {
  CompanionDownload,
  DeliverablesArea,
  NotReadyBanner,
  ResetConfirmDialog,
  ResetWorkflowButton,
  StatusBadge,
  WorkerCompletionButton,
  WorkflowTopbar,
  type WorkflowStatus,
} from '@/lib/workflow-components';

export default function ComponentsSmokeTestPage() {
  // Fake state to exercise components — director can flip dropdowns to see
  // each visual variant.
  const [status, setStatus] = useState<WorkflowStatus>('active');
  const [readyToStart, setReadyToStart] = useState(true);
  const [resetOpen, setResetOpen] = useState(false);
  const [completionLog, setCompletionLog] = useState<string[]>([]);

  const fakeProjectId = '00000000-0000-0000-0000-000000000000';
  const fakeProjectName = 'Smoke Test Project';
  const fakeWorkflowName = 'Smoke Test Workflow';

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
        title={fakeWorkflowName}
        projectName={fakeProjectName}
        projectId={fakeProjectId}
        icon="🧪"
        rightSlot={
          <ResetWorkflowButton
            userRole="admin"
            onClick={() => setResetOpen(true)}
          />
        }
      />

      {!readyToStart && (
        <NotReadyBanner
          missingDependency={{
            workflowName: 'Keyword Clustering',
            status: 'not started',
            linkUrl: '#',
          }}
        />
      )}

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, marginBottom: '8px' }}>
          🧪 Components-library smoke test
        </h1>
        <p style={{ color: '#8b949e', margin: 0, marginBottom: '32px' }}>
          Visual verification of every Phase-1 component. Fake props — no API
          calls, no DB writes. Removable once W#2 has its real composition.
        </p>

        {/* Controls */}
        <section
          style={{
            display: 'flex',
            gap: '20px',
            padding: '16px 20px',
            marginBottom: '24px',
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '8px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
            }}
          >
            <span style={{ color: '#8b949e' }}>Workflow status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as WorkflowStatus)}
              style={{
                padding: '4px 8px',
                background: '#0d1117',
                color: '#e6edf3',
                border: '1px solid #30363d',
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              <option value="inactive">inactive</option>
              <option value="active">active</option>
              <option value="completed">completed</option>
              <option value="submitted-for-review">submitted-for-review</option>
              <option value="revision-requested">revision-requested</option>
            </select>
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
            }}
          >
            <input
              type="checkbox"
              checked={readyToStart}
              onChange={(e) => setReadyToStart(e.target.checked)}
            />
            <span style={{ color: '#8b949e' }}>readyToStart</span>
          </label>
        </section>

        {/* StatusBadge variants */}
        <section style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#8b949e',
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            StatusBadge — all five states + loading
          </h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <StatusBadge status="inactive" />
            <StatusBadge status="active" />
            <StatusBadge status="completed" />
            <StatusBadge status="submitted-for-review" />
            <StatusBadge status="revision-requested" />
            <StatusBadge status={null} />
          </div>
          <p style={{ marginTop: '12px', fontSize: '12px', color: '#8b949e' }}>
            Currently selected: <StatusBadge status={status} />
          </p>
        </section>

        {/* DeliverablesArea with both sub-sections */}
        <DeliverablesArea
          resources={
            <>
              <CompanionDownload
                label="Download Chrome Extension"
                url="#fake-extension-zip"
                description="Captures competitor product pages as you browse. Install once; runs alongside this app."
              />
              <div
                style={{
                  padding: '12px 14px',
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#8b949e',
                }}
              >
                📄 User guide PDF (placeholder)
              </div>
            </>
          }
          projectDeliverables={
            <div
              style={{
                padding: '14px 16px',
                background: '#0d1117',
                border: '1px dashed #30363d',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#8b949e',
                textAlign: 'center',
              }}
            >
              Project-deliverables slot — workflow renders its own
              upload/download UI here in Phase 1.
            </div>
          }
          userRole="admin"
        />

        {/* WorkerCompletionButton */}
        <section style={{ marginTop: '24px', marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#8b949e',
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            WorkerCompletionButton — visible only when status is `active` or
            `revision-requested`
          </h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <WorkerCompletionButton
              reviewCycle="skip"
              workflowStatus={status}
              readyToStart={readyToStart}
              onComplete={async () => {
                setCompletionLog((prev) => [
                  `[${new Date().toLocaleTimeString()}] skip → completed (Phase 1 path)`,
                  ...prev,
                ]);
              }}
            />
            <WorkerCompletionButton
              reviewCycle="standard"
              workflowStatus={status}
              readyToStart={readyToStart}
              onComplete={async () => {
                setCompletionLog((prev) => [
                  `[${new Date().toLocaleTimeString()}] standard → submitted-for-review (Phase 2 path; Phase 1 still flips to completed)`,
                  ...prev,
                ]);
              }}
            />
          </div>
          {completionLog.length > 0 && (
            <ul
              style={{
                marginTop: '12px',
                padding: '10px 14px',
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#8b949e',
                listStyle: 'none',
                fontFamily: 'monospace',
              }}
            >
              {completionLog.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <ResetConfirmDialog
        open={resetOpen}
        projectName={fakeProjectName}
        workflowName={fakeWorkflowName}
        onConfirm={async () => {
          // Smoke test — pretend reset takes a moment.
          await new Promise((r) => setTimeout(r, 600));
        }}
        onClose={() => setResetOpen(false)}
      />
    </div>
  );
}
