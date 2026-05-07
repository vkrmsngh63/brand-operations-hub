'use client';

// W#2 Competition Scraping — per-URL detail page (slice a.1).
//
// Route: /projects/[projectId]/competition-scraping/url/[urlId]
// Address fixed by docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §10.
// Deep-linkable: pasting this URL into Slack/email lands the recipient
// directly on the right per-URL detail page (subject to their access).
//
// Slice scope (Option B picked at session start):
//   - Page chrome via the Shared Workflow Components Library (topbar +
//     status badge style consistent with the workflow root page).
//   - Sub-breadcrumb: Competition Scraping › [Platform] › [URL].
//   - Read-only metadata card (URL, platform, product/brand/category,
//     ratings, review counts, added-on, customFields).
//   - Read-only Sizes / Options sub-section.
//   - Sortable captured-text rows table.
//   - Image-count placeholder ("N images captured — viewer ships in
//     slice a.2").
//   - "Open original URL in new tab" button preserved on the detail page
//     so the prior click-row-to-open behavior is one click away.
//
// Deferred to follow-up slices:
//   - Image rendering + image-expand modal (slice a.2).
//   - Inline editing of any field (slice a.3).
//   - Per-column filter dropdowns on the captured-text table (slice a.4).

import { useParams } from 'next/navigation';
import { useWorkflowContext } from '@/lib/workflow-components';
import { UrlDetailContent } from './components/UrlDetailContent';

const WORKFLOW_SLUG = 'competition-scraping';

export default function CompetitionScrapingUrlDetailPage() {
  const params = useParams();
  const projectId = (params?.projectId as string) ?? null;
  const urlId = (params?.urlId as string) ?? null;

  const ctx = useWorkflowContext({
    projectId,
    workflowSlug: WORKFLOW_SLUG,
    // W#2 is "always ready" per COMPETITION_SCRAPING_DESIGN.md §A.6 — same
    // as the workflow root page.
  });

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

  if (!urlId) {
    // The Next.js dynamic-segment hydration gives us a string; the null
    // guard is defense against a future refactor that broke the contract.
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
        <div style={{ fontSize: '13px', color: '#f85149' }}>
          Missing URL identifier in the page address.
        </div>
      </div>
    );
  }

  return <UrlDetailContent project={ctx.project} userRole={ctx.userRole} urlId={urlId} />;
}
