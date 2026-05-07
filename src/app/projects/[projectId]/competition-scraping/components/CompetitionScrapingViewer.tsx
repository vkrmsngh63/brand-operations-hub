'use client';

// W#2 Competition Scraping & Deep Analysis — content-area viewer (first slice).
//
// Implements the platforms-→-URLs navigation + URL list with sort + free-text
// search per docs/COMPETITION_SCRAPING_DESIGN.md §A.7 + §A.14 and the
// PLATFORM_REQUIREMENTS.md §12.6 shared component pattern #2 ("the content
// area is the workflow's own concern, not imposed by the library"). W#2 is
// the first workflow to author such a custom content component.
//
// Reads from GET /api/projects/[projectId]/competition-scraping/urls (shipped
// in API-routes session-1; spec at COMPETITION_SCRAPING_STACK_DECISIONS.md
// §11.1). Pulls every URL for the Project in one request — counts per
// platform (sidebar) and the active platform's table are derived
// client-side. At Phase 3 throughput (~30 URLs/platform/Project) client-side
// sort + filter stays snappy without pagination; revisit if a future scale
// pass shows otherwise.
//
// Slice (a.1) wires click-row to navigate to /url/[urlId]; the prior
// open-in-new-tab behavior is preserved via an explicit "Open original
// URL ↗" button on the detail page itself.
//
// Deferred to follow-up slices:
//   - inline editing of any URL field (a.3)
//   - per-column filter dropdowns (a.4)
//   - image expand viewer (a.2)
//   - Phase-2 admin assignments view

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authFetch } from '@/lib/authFetch';
import {
  isPlatform,
  type CompetitorUrl,
  type ListCompetitorUrlsResponse,
  type Platform,
} from '@/lib/shared-types/competition-scraping';
import { PlatformSidebar, type ScopeFilter } from './PlatformSidebar';
import { UrlTable } from './UrlTable';

interface Props {
  projectId: string;
}

export function CompetitionScrapingViewer({ projectId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read selected platform from the URL query — survives a refresh and
  // makes a deep link like ?platform=amazon land on the right view.
  const platformParam = searchParams?.get('platform') ?? null;
  const initialPlatform: ScopeFilter =
    platformParam && isPlatform(platformParam) ? platformParam : 'all';

  const [selectedPlatform, setSelectedPlatform] =
    useState<ScopeFilter>(initialPlatform);
  const [urls, setUrls] = useState<CompetitorUrl[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setUrls(null);
    (async () => {
      try {
        const res = await authFetch(
          `/api/projects/${projectId}/competition-scraping/urls`
        );
        if (!res.ok) {
          throw new Error(`Could not load URLs (HTTP ${res.status}).`);
        }
        const data = (await res.json()) as ListCompetitorUrlsResponse;
        if (!cancelled) setUrls(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load URLs.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // Per-platform counts for the sidebar. Memoized so a sort or filter
  // change doesn't recompute them.
  const counts = useMemo(() => {
    if (!urls) return null;
    const c: Record<ScopeFilter, number> = {
      all: urls.length,
      amazon: 0,
      ebay: 0,
      etsy: 0,
      walmart: 0,
      'google-shopping': 0,
      'google-ads': 0,
      'independent-website': 0,
    };
    for (const u of urls) {
      c[u.platform as Platform]++;
    }
    return c;
  }, [urls]);

  // Apply the selected-platform scope and the free-text search to produce
  // the table's rows. UrlTable handles its own sort.
  const visibleUrls = useMemo(() => {
    if (!urls) return [];
    const search = searchText.trim().toLowerCase();
    return urls.filter((u) => {
      if (selectedPlatform !== 'all' && u.platform !== selectedPlatform) {
        return false;
      }
      if (!search) return true;
      const blob = `${u.url} ${u.productName ?? ''} ${u.brandName ?? ''}`.toLowerCase();
      return blob.includes(search);
    });
  }, [urls, selectedPlatform, searchText]);

  const handleSelectPlatform = (next: ScopeFilter) => {
    setSelectedPlatform(next);
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (next === 'all') params.delete('platform');
    else params.set('platform', next);
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '?');
  };

  // Click-row → navigate to per-URL detail page. router.push preserves the
  // history stack so the browser Back button returns to this list view
  // (with platform + search state survived via the URL bar).
  const handleRowOpen = (urlId: string) => {
    router.push(`/projects/${projectId}/competition-scraping/url/${urlId}`);
  };

  const scopedTotal =
    counts === null ? 0 : counts[selectedPlatform];

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        gap: '16px',
        marginTop: '32px',
      }}
    >
      <PlatformSidebar
        selected={selectedPlatform}
        counts={counts}
        loading={urls === null && !error}
        onSelect={handleSelectPlatform}
      />

      <div
        style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '8px',
          padding: '16px',
          minHeight: '320px',
        }}
      >
        {error ? (
          <EmptyState title="Couldn’t load URLs" body={error} tone="error" />
        ) : urls === null ? (
          <EmptyState title="Loading competitor URLs…" />
        ) : urls.length === 0 ? (
          <EmptyState
            title="No competitor URLs captured yet"
            body="Install the Chrome extension above to start capturing competitor URLs from Amazon, Ebay, Etsy, Walmart, Google Shopping, Google Ads, and independent product websites. Captured URLs appear here in real time."
          />
        ) : (
          <UrlTable
            rows={visibleUrls}
            searchText={searchText}
            onSearchChange={setSearchText}
            scopedTotal={scopedTotal}
            onRowOpen={handleRowOpen}
          />
        )}
      </div>
    </section>
  );
}

function EmptyState({
  title,
  body,
  tone,
}: {
  title: string;
  body?: string;
  tone?: 'error';
}) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '48px 16px',
        color: '#8b949e',
      }}
    >
      <div
        style={{
          fontSize: '14px',
          fontWeight: 500,
          marginBottom: body ? '8px' : 0,
          color: tone === 'error' ? '#f85149' : '#e6edf3',
        }}
      >
        {title}
      </div>
      {body ? (
        <div
          style={{
            fontSize: '13px',
            lineHeight: 1.6,
            maxWidth: '520px',
            margin: '0 auto',
          }}
        >
          {body}
        </div>
      ) : null}
    </div>
  );
}
