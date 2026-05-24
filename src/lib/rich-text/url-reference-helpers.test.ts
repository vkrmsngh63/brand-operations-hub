// W#2 P-46 Workstream 4 Session 2 (2026-05-25) — node:test cases for the
// pure helpers backing the UrlReferenceExtension + LinkToUrlPicker.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  URL_REFERENCE_HREF_PREFIX,
  buildInternalUrlHref,
  buildInternalUrlPath,
  defaultLinkLabelForUrl,
  extractUrlIdFromHref,
  filterUrlsByQuery,
  type UrlPickerEntry,
} from './url-reference-helpers.ts';

// ─── extractUrlIdFromHref ───────────────────────────────────────────────

test('extractUrlIdFromHref returns the urlId for valid shorthand', () => {
  assert.equal(extractUrlIdFromHref('#url/abc-123'), 'abc-123');
  assert.equal(extractUrlIdFromHref('#url/01H9VQ8X2K9Y3'), '01H9VQ8X2K9Y3');
  assert.equal(
    extractUrlIdFromHref('#url/a1b2c3d4-e5f6-7890-1234-567890abcdef'),
    'a1b2c3d4-e5f6-7890-1234-567890abcdef'
  );
});

test('extractUrlIdFromHref rejects external hrefs', () => {
  assert.equal(extractUrlIdFromHref('https://example.com'), null);
  assert.equal(extractUrlIdFromHref('http://amazon.com/dp/abc'), null);
  assert.equal(extractUrlIdFromHref('mailto:foo@bar.com'), null);
});

test('extractUrlIdFromHref rejects empty shorthand', () => {
  assert.equal(extractUrlIdFromHref('#url/'), null);
});

test('extractUrlIdFromHref rejects shorthand with embedded path separators', () => {
  // Reject `#url/abc/def` so a typo doesn't accidentally encode a nested
  // path that bypasses validation. The router builder uses the extracted
  // urlId as a single path segment; multi-segment values would generate
  // malformed routes.
  assert.equal(extractUrlIdFromHref('#url/abc/def'), null);
  assert.equal(extractUrlIdFromHref('#url/abc def'), null);
  assert.equal(extractUrlIdFromHref('#url/abc?query=1'), null);
  assert.equal(extractUrlIdFromHref('#url/abc#frag'), null);
});

test('extractUrlIdFromHref rejects unrelated hash fragments', () => {
  assert.equal(extractUrlIdFromHref('#section-1'), null);
  assert.equal(extractUrlIdFromHref('#'), null);
  assert.equal(extractUrlIdFromHref('#urlnotaref'), null);
});

test('extractUrlIdFromHref tolerates non-string inputs', () => {
  assert.equal(extractUrlIdFromHref(null), null);
  assert.equal(extractUrlIdFromHref(undefined), null);
  assert.equal(extractUrlIdFromHref(123), null);
  assert.equal(extractUrlIdFromHref({ href: '#url/abc' }), null);
});

// ─── buildInternalUrlPath ───────────────────────────────────────────────

test('buildInternalUrlPath constructs the canonical Next.js path', () => {
  assert.equal(
    buildInternalUrlPath('proj-1', 'url-1'),
    '/projects/proj-1/competition-scraping/url/url-1'
  );
});

// ─── buildInternalUrlHref + URL_REFERENCE_HREF_PREFIX ───────────────────

test('buildInternalUrlHref is the inverse of extractUrlIdFromHref', () => {
  const urlId = 'abc-123';
  const href = buildInternalUrlHref(urlId);
  assert.equal(href, '#url/abc-123');
  assert.equal(extractUrlIdFromHref(href), urlId);
});

test('URL_REFERENCE_HREF_PREFIX is the public shorthand', () => {
  assert.equal(URL_REFERENCE_HREF_PREFIX, '#url/');
});

// ─── filterUrlsByQuery ──────────────────────────────────────────────────

const SAMPLE: UrlPickerEntry[] = [
  { id: '1', url: 'https://amazon.com/dp/A1', productName: 'Coffee Beans', brandName: 'BeanCo' },
  { id: '2', url: 'https://ebay.com/itm/B2', productName: 'Tea Leaves', brandName: 'LeafCo' },
  { id: '3', url: 'https://amazon.com/dp/A3', productName: null, brandName: 'BeanCo' },
  { id: '4', url: 'https://walmart.com/ip/W4', productName: 'Cocoa Powder', brandName: null },
];

test('filterUrlsByQuery with empty query returns full list', () => {
  assert.deepEqual(filterUrlsByQuery(SAMPLE, ''), SAMPLE);
  assert.deepEqual(filterUrlsByQuery(SAMPLE, '   '), SAMPLE);
});

test('filterUrlsByQuery matches case-insensitively across productName', () => {
  const result = filterUrlsByQuery(SAMPLE, 'COFFEE');
  assert.equal(result.length, 1);
  assert.equal(result[0]!.id, '1');
});

test('filterUrlsByQuery matches across brandName', () => {
  const result = filterUrlsByQuery(SAMPLE, 'beanco');
  assert.equal(result.length, 2);
  assert.deepEqual(
    result.map((r) => r.id),
    ['1', '3']
  );
});

test('filterUrlsByQuery matches across url substring', () => {
  const result = filterUrlsByQuery(SAMPLE, 'walmart');
  assert.equal(result.length, 1);
  assert.equal(result[0]!.id, '4');
});

test('filterUrlsByQuery returns empty array on no match', () => {
  assert.deepEqual(filterUrlsByQuery(SAMPLE, 'zzzz'), []);
});

test('filterUrlsByQuery tolerates non-string query input', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assert.deepEqual(filterUrlsByQuery(SAMPLE, undefined as any), SAMPLE);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assert.deepEqual(filterUrlsByQuery(SAMPLE, null as any), SAMPLE);
});

// ─── defaultLinkLabelForUrl ─────────────────────────────────────────────

test('defaultLinkLabelForUrl prefers productName when set', () => {
  assert.equal(defaultLinkLabelForUrl(SAMPLE[0]!), 'Coffee Beans');
});

test('defaultLinkLabelForUrl falls back to brandName when productName missing', () => {
  assert.equal(defaultLinkLabelForUrl(SAMPLE[2]!), 'BeanCo');
});

test('defaultLinkLabelForUrl falls back to url when both name fields missing', () => {
  const entry: UrlPickerEntry = {
    id: '5',
    url: 'https://etsy.com/listing/E5',
    productName: null,
    brandName: null,
  };
  assert.equal(defaultLinkLabelForUrl(entry), 'https://etsy.com/listing/E5');
});

test('defaultLinkLabelForUrl ignores whitespace-only name fields', () => {
  const entry: UrlPickerEntry = {
    id: '6',
    url: 'https://test.com/x',
    productName: '   ',
    brandName: '',
  };
  assert.equal(defaultLinkLabelForUrl(entry), 'https://test.com/x');
});
