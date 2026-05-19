import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildSavedUrlOptionLabel } from './saved-url-option-label.ts';

const EM = '—';
const ELLIPSIS = '…';

// ─── productName present (after trim) — side-by-side with URL ────────────

test('productName present + short URL → "Name — URL" with em-dash', () => {
  const label = buildSavedUrlOptionLabel({
    productName: 'Acme Widget Pro',
    url: 'https://acme.com/widget-pro',
  });
  assert.equal(label, `Acme Widget Pro ${EM} https://acme.com/widget-pro`);
});

test('productName with surrounding whitespace gets trimmed before render', () => {
  const label = buildSavedUrlOptionLabel({
    productName: '  Acme Widget Pro  ',
    url: 'https://acme.com/widget-pro',
  });
  assert.equal(label, `Acme Widget Pro ${EM} https://acme.com/widget-pro`);
});

test('productName present + URL exactly 60 chars renders unchanged', () => {
  const sixtyCharUrl =
    'https://example.com/products/' + 'x'.repeat(60 - 'https://example.com/products/'.length);
  assert.equal(sixtyCharUrl.length, 60);
  const label = buildSavedUrlOptionLabel({
    productName: 'Widget',
    url: sixtyCharUrl,
  });
  assert.equal(label, `Widget ${EM} ${sixtyCharUrl}`);
});

test('productName present + URL 61 chars gets truncated to 57 + ellipsis', () => {
  const url = 'https://example.com/very/long/product/path/' + 'a'.repeat(20);
  assert.equal(url.length > 60, true);
  const label = buildSavedUrlOptionLabel({
    productName: 'Widget',
    url,
  });
  assert.equal(label, `Widget ${EM} ${url.slice(0, 57)}${ELLIPSIS}`);
  const prefix = `Widget ${EM} `;
  const truncatedPart = label.slice(prefix.length);
  assert.equal(truncatedPart.length, 58); // 57 chars + 1 ellipsis char
});

test('productName present + very long URL truncates to 57 chars + ellipsis', () => {
  const url = 'https://acme.com/products/widget-pro-2026-blue-large-special-edition-version-3';
  const label = buildSavedUrlOptionLabel({
    productName: 'Widget Pro 2026',
    url,
  });
  const prefix = `Widget Pro 2026 ${EM} `;
  assert.equal(label.startsWith(prefix), true);
  const urlPart = label.slice(prefix.length);
  assert.equal(urlPart.endsWith(ELLIPSIS), true);
  assert.equal(urlPart.length, 58);
});

// ─── productName absent (null / undefined / empty / whitespace) — URL only

test('productName null → URL only (no em-dash)', () => {
  const label = buildSavedUrlOptionLabel({
    productName: null,
    url: 'https://acme.com/widget',
  });
  assert.equal(label, 'https://acme.com/widget');
  assert.equal(label.includes(EM), false);
});

test('productName undefined → URL only', () => {
  const label = buildSavedUrlOptionLabel({
    url: 'https://acme.com/widget',
  });
  assert.equal(label, 'https://acme.com/widget');
  assert.equal(label.includes(EM), false);
});

test('productName empty string → URL only', () => {
  const label = buildSavedUrlOptionLabel({
    productName: '',
    url: 'https://acme.com/widget',
  });
  assert.equal(label, 'https://acme.com/widget');
  assert.equal(label.includes(EM), false);
});

test('productName all-whitespace → URL only (not the whitespace)', () => {
  const label = buildSavedUrlOptionLabel({
    productName: '   \t  \n  ',
    url: 'https://acme.com/widget',
  });
  assert.equal(label, 'https://acme.com/widget');
  assert.equal(label.includes(EM), false);
});

test('productName absent + URL exactly 80 chars renders unchanged', () => {
  const eightyCharUrl =
    'https://example.com/products/' + 'y'.repeat(80 - 'https://example.com/products/'.length);
  assert.equal(eightyCharUrl.length, 80);
  const label = buildSavedUrlOptionLabel({
    productName: null,
    url: eightyCharUrl,
  });
  assert.equal(label, eightyCharUrl);
});

test('productName absent + URL 81 chars gets truncated to 77 + ellipsis', () => {
  const url =
    'https://example.com/products/' + 'z'.repeat(81 - 'https://example.com/products/'.length);
  assert.equal(url.length, 81);
  const label = buildSavedUrlOptionLabel({
    productName: null,
    url,
  });
  assert.equal(label, url.slice(0, 77) + ELLIPSIS);
  assert.equal(label.length, 78);
});

// ─── Regression: pre-P-23 behavior is exactly preserved when productName
//     is absent (no behavior drift for the URL-only path).

test('regression: URL-only path matches pre-P-23 80/77 truncation', () => {
  const exactly80 = 'a'.repeat(80);
  const exactly81 = 'a'.repeat(81);
  const short = 'https://x.io';
  assert.equal(
    buildSavedUrlOptionLabel({ productName: null, url: exactly80 }),
    exactly80,
  );
  assert.equal(
    buildSavedUrlOptionLabel({ productName: null, url: exactly81 }),
    exactly81.slice(0, 77) + ELLIPSIS,
  );
  assert.equal(buildSavedUrlOptionLabel({ productName: null, url: short }), short);
});
