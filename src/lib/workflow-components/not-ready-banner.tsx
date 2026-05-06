'use client';

// NotReadyBanner — banner rendered at the top of a workflow page when the
// workflow's upstream-readiness rule (per PLATFORM_REQUIREMENTS.md §6) is
// NOT satisfied for the current Project. Explains what's missing and links
// to the upstream workflow.
//
// Per design doc §3.7 + PLATFORM_REQUIREMENTS.md §6.2 ("not an entry gate"):
// the banner does NOT block the page. Admin can still look around the
// workflow's layout while readiness is pending. "Start work" controls inside
// the workflow's content component should disable themselves when
// readyToStart === false (the WorkerCompletionButton does this automatically).
//
// Workflows include this conditionally:
//   {!ctx.readyToStart && <NotReadyBanner missingDependency={...} />}
//
// Phase 1 / W#1 + W#2 don't import this — they have no upstream dependencies.
// Future workflows (W#5+) will.

export interface MissingDependency {
  // Plain-language workflow name shown to the user — e.g., "Keyword
  // Clustering". Not the slug.
  workflowName: string;

  // Status the upstream workflow is currently in for THIS Project, in
  // user-visible language — e.g., "in progress" or "not started".
  status: string;

  // Where to send the user. Typically a link to the upstream workflow on
  // the same Project, e.g., `/projects/${projectId}/keyword-clustering`.
  linkUrl: string;
}

export interface NotReadyBannerProps {
  missingDependency: MissingDependency;

  // Optional override for the body copy. Default reads:
  //   "This workflow needs <workflowName> to finish first. It's currently
  //    <status>."
  customExplanation?: string;
}

export function NotReadyBanner({
  missingDependency,
  customExplanation,
}: NotReadyBannerProps) {
  const { workflowName, status, linkUrl } = missingDependency;

  const explanation =
    customExplanation ??
    `This workflow needs ${workflowName} to finish first. It's currently ${status}.`;

  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '12px 20px',
        margin: '0',
        background: 'rgba(219, 109, 40, 0.1)',
        border: '1px solid rgba(240, 136, 62, 0.4)',
        borderRadius: '0',
        color: '#f0883e',
        fontSize: '13px',
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '16px' }} aria-hidden>
          ⏳
        </span>
        <span>{explanation}</span>
      </span>
      <a
        href={linkUrl}
        style={{
          padding: '6px 12px',
          background: 'transparent',
          border: '1px solid rgba(240, 136, 62, 0.6)',
          borderRadius: '6px',
          color: '#f0883e',
          fontSize: '12px',
          fontWeight: 600,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Open {workflowName} →
      </a>
    </div>
  );
}
