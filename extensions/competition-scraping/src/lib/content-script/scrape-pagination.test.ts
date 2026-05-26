// Tests for the shared pagination helper shipped under P-49 Workstream 2
// (2026-05-26) per docs/REVIEWS_PHASE_2_DESIGN.md §A.15.
//
// Covers the happy-path loop, cap enforcement, captcha detection, rate-limit
// classification, user-cancel via AbortSignal, and the progress event stream.
// Uses hand-rolled stubs in the same style as already-saved-overlay.test.ts
// + find-underlying-image.test.ts — no jsdom dependency.

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  detectCaptcha,
  isRateLimitStatus,
  paginate,
  randomPaginationDelay,
  type ScrapeProgress,
} from './scrape-pagination.ts';

// Tiny DOM stub — only document.querySelector is exercised by detectCaptcha.
function installFakeDocument(matchingSelectors: Set<string>): () => void {
  const fakeDoc = {
    querySelector(sel: string): unknown {
      return matchingSelectors.has(sel) ? { tagName: 'FORM' } : null;
    },
  };
  const prev = (globalThis as { document?: unknown }).document;
  (globalThis as { document?: unknown }).document = fakeDoc;
  return () => {
    (globalThis as { document?: unknown }).document = prev;
  };
}

describe('isRateLimitStatus', () => {
  it('returns true for 429', () => {
    assert.equal(isRateLimitStatus(429), true);
  });
  it('returns true for 503', () => {
    assert.equal(isRateLimitStatus(503), true);
  });
  it('returns false for 200', () => {
    assert.equal(isRateLimitStatus(200), false);
  });
  it('returns false for 400', () => {
    assert.equal(isRateLimitStatus(400), false);
  });
  it('returns false for 500', () => {
    assert.equal(isRateLimitStatus(500), false);
  });
});

describe('detectCaptcha', () => {
  let cleanup: (() => void) | null = null;
  afterEach(() => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  });

  it('returns true when a selector matches an element', () => {
    cleanup = installFakeDocument(new Set(['#captchacharacters']));
    assert.equal(detectCaptcha(['#captchacharacters']), true);
  });

  it('returns false when no selector matches', () => {
    cleanup = installFakeDocument(new Set());
    assert.equal(detectCaptcha(['#captchacharacters']), false);
  });

  it('tries every selector and returns true on first match', () => {
    cleanup = installFakeDocument(new Set(['form[action*="validateCaptcha"]']));
    assert.equal(
      detectCaptcha(['#captchacharacters', 'form[action*="validateCaptcha"]']),
      true,
    );
  });

  it('returns false on empty selector list', () => {
    cleanup = installFakeDocument(new Set(['#captchacharacters']));
    assert.equal(detectCaptcha([]), false);
  });
});

describe('randomPaginationDelay', () => {
  it('resolves after at least minMs', async () => {
    const start = Date.now();
    await randomPaginationDelay({ minMs: 20, maxMs: 30 });
    const elapsed = Date.now() - start;
    // Allow generous slack for slow CI machines.
    assert.ok(elapsed >= 18, `elapsed=${String(elapsed)}ms`);
  });

  it('rejects with AbortError when signal fires mid-sleep', async () => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5);
    await assert.rejects(
      () =>
        randomPaginationDelay({
          minMs: 200,
          maxMs: 300,
          abortSignal: controller.signal,
        }),
      (err: unknown) =>
        typeof err === 'object' &&
        err !== null &&
        'name' in err &&
        (err as { name: unknown }).name === 'AbortError',
    );
  });

  it('rejects immediately when signal already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(
      () =>
        randomPaginationDelay({
          minMs: 1000,
          maxMs: 2000,
          abortSignal: controller.signal,
        }),
    );
  });
});

describe('paginate', () => {
  let cleanup: (() => void) | null = null;
  beforeEach(() => {
    cleanup = installFakeDocument(new Set());
  });
  afterEach(() => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  });

  it('walks one page and reports completed when no next page', async () => {
    const events: ScrapeProgress[] = [];
    const saved: number[] = [];
    const result = await paginate<number>({
      onProgress: (e) => events.push(e),
      abortSignal: new AbortController().signal,
      extractCurrentPageRows: () => [1, 2, 3],
      advanceToNextPage: async () => false,
      saveRow: async (row) => {
        saved.push(row);
      },
      captchaSelectors: [],
      capRows: 100,
      delayMinMs: 0,
      delayMaxMs: 1,
    });
    assert.equal(result.totalRowsCaptured, 3);
    assert.equal(result.abortReason, undefined);
    assert.deepEqual(saved, [1, 2, 3]);
    const kinds = events.map((e) => e.kind);
    assert.ok(kinds.includes('starting'));
    assert.ok(kinds.includes('page-loading'));
    assert.ok(kinds.includes('page-loaded'));
    assert.ok(kinds.includes('completed'));
  });

  it('stops at capRows even if more pages are available', async () => {
    const saved: number[] = [];
    let pageCalls = 0;
    const result = await paginate<number>({
      onProgress: () => {},
      abortSignal: new AbortController().signal,
      extractCurrentPageRows: () => [1, 2, 3, 4, 5],
      advanceToNextPage: async () => {
        pageCalls += 1;
        return true;
      },
      saveRow: async (row) => {
        saved.push(row);
      },
      captchaSelectors: [],
      capRows: 3,
      delayMinMs: 0,
      delayMaxMs: 1,
    });
    assert.equal(result.totalRowsCaptured, 3);
    assert.deepEqual(saved, [1, 2, 3]);
    // No pagination should occur after cap is met.
    assert.equal(pageCalls, 0);
  });

  it('walks two pages then completes', async () => {
    const saved: number[] = [];
    let pageIndex = 0;
    const pages = [[1, 2], [3, 4]];
    const result = await paginate<number>({
      onProgress: () => {},
      abortSignal: new AbortController().signal,
      extractCurrentPageRows: () => pages[pageIndex] ?? [],
      advanceToNextPage: async () => {
        pageIndex += 1;
        return pageIndex < pages.length;
      },
      saveRow: async (row) => {
        saved.push(row);
      },
      captchaSelectors: [],
      capRows: 100,
      delayMinMs: 0,
      delayMaxMs: 1,
    });
    assert.equal(result.totalRowsCaptured, 4);
    assert.deepEqual(saved, [1, 2, 3, 4]);
  });

  it('aborts on captcha detection', async () => {
    cleanup?.();
    cleanup = installFakeDocument(new Set(['#captchacharacters']));
    const events: ScrapeProgress[] = [];
    const result = await paginate<number>({
      onProgress: (e) => events.push(e),
      abortSignal: new AbortController().signal,
      extractCurrentPageRows: () => [1, 2],
      advanceToNextPage: async () => false,
      saveRow: async () => {},
      captchaSelectors: ['#captchacharacters'],
      capRows: 100,
      delayMinMs: 0,
      delayMaxMs: 1,
    });
    assert.equal(result.abortReason, 'captcha');
    assert.equal(result.totalRowsCaptured, 0);
    const aborted = events.find((e) => e.kind === 'aborted');
    assert.ok(aborted);
    if (aborted && aborted.kind === 'aborted') {
      assert.equal(aborted.reason, 'captcha');
    }
  });

  it('classifies HTTP 429 from saveRow as rate-limit', async () => {
    const result = await paginate<number>({
      onProgress: () => {},
      abortSignal: new AbortController().signal,
      extractCurrentPageRows: () => [1, 2],
      advanceToNextPage: async () => false,
      saveRow: async () => {
        const err = new Error('Too many requests') as Error & { status: number };
        err.status = 429;
        throw err;
      },
      captchaSelectors: [],
      capRows: 100,
      delayMinMs: 0,
      delayMaxMs: 1,
    });
    assert.equal(result.abortReason, 'rate-limit');
    assert.equal(result.totalRowsCaptured, 0);
  });

  it('classifies non-429 errors as generic error', async () => {
    const result = await paginate<number>({
      onProgress: () => {},
      abortSignal: new AbortController().signal,
      extractCurrentPageRows: () => [1, 2],
      advanceToNextPage: async () => false,
      saveRow: async () => {
        const err = new Error('boom') as Error & { status: number };
        err.status = 500;
        throw err;
      },
      captchaSelectors: [],
      capRows: 100,
      delayMinMs: 0,
      delayMaxMs: 1,
    });
    assert.equal(result.abortReason, 'error');
  });

  it('honors user-cancel via AbortSignal between pages', async () => {
    const controller = new AbortController();
    const saved: number[] = [];
    const result = await paginate<number>({
      onProgress: () => {},
      abortSignal: controller.signal,
      extractCurrentPageRows: () => [1, 2, 3],
      advanceToNextPage: async () => {
        controller.abort();
        return true;
      },
      saveRow: async (row) => {
        saved.push(row);
      },
      captchaSelectors: [],
      capRows: 100,
      delayMinMs: 0,
      delayMaxMs: 1,
    });
    assert.equal(result.abortReason, 'user-cancel');
    // First page's 3 rows saved before cancel; pagination cancel arrives before
    // page 2 walks.
    assert.equal(result.totalRowsCaptured, 3);
    assert.deepEqual(saved, [1, 2, 3]);
  });

  it('emits row-saved event per saved row', async () => {
    const events: ScrapeProgress[] = [];
    await paginate<number>({
      onProgress: (e) => events.push(e),
      abortSignal: new AbortController().signal,
      extractCurrentPageRows: () => [1, 2, 3],
      advanceToNextPage: async () => false,
      saveRow: async () => {},
      captchaSelectors: [],
      capRows: 100,
      delayMinMs: 0,
      delayMaxMs: 1,
    });
    const rowSaveCount = events.filter((e) => e.kind === 'row-saved').length;
    assert.equal(rowSaveCount, 3);
  });
});
