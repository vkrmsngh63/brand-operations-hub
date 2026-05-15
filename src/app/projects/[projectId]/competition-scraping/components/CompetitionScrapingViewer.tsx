'use client';

// W#2 Competition Scraping & Deep Analysis — content-area viewer.
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
// As of slice (a.4), the platform selection AND the per-column filter set
// AND the free-text search query all serialize into the URL query — so a
// refresh, browser back/forward, or a deep-link copy/paste all preserve
// the user's exact view. Filter state lives in URL; the search box uses a
// debounced URL write so each keystroke doesn't trigger a routing flush.
//
// Slice (a.1) wires click-row to navigate to /url/[urlId]; the prior
// open-in-new-tab behavior is preserved via an explicit "Open original
// URL ↗" button on the detail page itself.
//
// Deferred to follow-up slices:
//   - filtering on Seller Stars / # Seller Reviews / Results Page Rank
//     (currently not surfaced as visible columns)
//   - filtering on customFields (JSON column; needs its own design pass)
//   - saved filter combinations / saved views
//   - server-side filtering (Phase 3 scale concern, revisit at scale)

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
import {
  EMPTY_COLUMN_FILTERS,
  readFiltersFromQuery,
  writeFiltersToQuery,
  type ColumnFiltersState,
} from './ColumnFilters';

interface Props {
  projectId: string;
}

const SEARCH_DEBOUNCE_MS = 250;

export function CompetitionScrapingViewer({ projectId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read selected platform from the URL query — survives a refresh and
  // makes a deep link like ?platform=amazon land on the right view.
  const platformParam = searchParams?.get('platform') ?? null;
  const selectedPlatform: ScopeFilter =
    platformParam && isPlatform(platformParam) ? platformParam : 'all';

  // Filter state lives in the URL. Re-derive on every render so the back/
  // forward buttons and deep links work without extra wiring.
  const filters: ColumnFiltersState = useMemo(
    () =>
      searchParams
        ? readFiltersFromQuery(new URLSearchParams(searchParams.toString()))
        : EMPTY_COLUMN_FILTERS,
    [searchParams]
  );

  // Free-text search query lives in `?q=` in the URL (writable with a 250ms
  // debounce so each keystroke doesn't trigger a routing flush). The
  // `draftSearch` mirror lets the input update instantly while the URL
  // catches up asynchronously.
  const urlSearch = searchParams?.get('q') ?? '';
  const [draftSearch, setDraftSearch] = useState<string>(urlSearch);

  // When the URL changes from an external source (back/forward, deep link),
  // re-sync the draft so the input box reflects the URL.
  useEffect(() => {
    setDraftSearch(urlSearch);
  }, [urlSearch]);

  // After the user pauses typing, write the draft to the URL.
  useEffect(() => {
    if (draftSearch === urlSearch) return;
    const id = setTimeout(() => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      if (draftSearch === '') {
        params.delete('q');
      } else {
        params.set('q', draftSearch);
      }
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : '?');
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [draftSearch, urlSearch, router, searchParams]);

  const [urls, setUrls] = useState<CompetitorUrl[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // Platform-scoped rows — fed to UrlTable as `scopeRows` so its multi-
  // select dropdowns can derive their option lists from the platform-scoped
  // set instead of the search-and-column-filter-narrowed set.
  const scopeRows = useMemo(() => {
    if (!urls) return [];
    return urls.filter((u) => {
      if (selectedPlatform !== 'all' && u.platform !== selectedPlatform) {
        return false;
      }
      return true;
    });
  }, [urls, selectedPlatform]);

  // Apply the free-text search on top of the platform scope. Column filters
  // are applied inside UrlTable so the table can reason about them
  // alongside its sort.
  const visibleUrls = useMemo(() => {
    const search = draftSearch.trim().toLowerCase();
    if (!search) return scopeRows;
    return scopeRows.filter((u) => {
      const blob = `${u.url} ${u.productName ?? ''} ${u.brandName ?? ''}`.toLowerCase();
      return blob.includes(search);
    });
  }, [scopeRows, draftSearch]);

  const handleSelectPlatform = (next: ScopeFilter): void => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (next === 'all') params.delete('platform');
    else params.set('platform', next);
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '?');
  };

  const handleFiltersChange = (next: ColumnFiltersState): void => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    writeFiltersToQuery(params, next);
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '?');
  };

  // Click-row → navigate to per-URL detail page. router.push preserves the
  // history stack so the browser Back button returns to this list view
  // (with platform + search + filter state survived via the URL bar).
  const handleRowOpen = (urlId: string): void => {
    router.push(`/projects/${projectId}/competition-scraping/url/${urlId}`);
  };

  // P-29 Slice #1 — manual-add modal calls this with the newly-created row
  // so the table updates without a refetch round-trip. POST is idempotent
  // on (workflow, platform, url) so a duplicate-create returns the existing
  // row; we dedup here to avoid double-listing.
  const handleUrlAdded = (row: CompetitorUrl): void => {
    setUrls((prev) => {
      if (!prev) return [row];
      const existing = prev.findIndex((u) => u.id === row.id);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = row;
        return next;
      }
      return [row, ...prev];
    });
  };

  const scopedTotal = counts === null ? 0 : counts[selectedPlatform];

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
            scopeRows={scopeRows}
            searchText={draftSearch}
            onSearchChange={setDraftSearch}
            scopedTotal={scopedTotal}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onRowOpen={handleRowOpen}
            projectId={projectId}
            onUrlAdded={handleUrlAdded}
            selectedPlatform={selectedPlatform}
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
