import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRecognitionSet,
  normalizeUrlForRecognition,
  urlsMatchAfterNormalization,
} from './url-normalization.ts';

describe('normalizeUrlForRecognition', () => {
  it('returns the URL unchanged when there is no `?`', () => {
    assert.equal(
      normalizeUrlForRecognition('https://www.amazon.com/dp/B07XJ8C8F5'),
      'https://www.amazon.com/dp/B07XJ8C8F5',
    );
  });

  it('strips a single query parameter', () => {
    assert.equal(
      normalizeUrlForRecognition(
        'https://www.amazon.com/dp/B07XJ8C8F5?tag=plos-20',
      ),
      'https://www.amazon.com/dp/B07XJ8C8F5',
    );
  });

  it('strips multiple query parameters', () => {
    assert.equal(
      normalizeUrlForRecognition(
        'https://www.amazon.com/dp/B07XJ8C8F5?tag=plos-20&ref=sr_1_1&keywords=red+light',
      ),
      'https://www.amazon.com/dp/B07XJ8C8F5',
    );
  });

  it('strips a query string even when value is empty', () => {
    assert.equal(
      normalizeUrlForRecognition('https://www.ebay.com/itm/12345?'),
      'https://www.ebay.com/itm/12345',
    );
  });

  it('preserves the fragment when there is no query string', () => {
    // Per §B 2026-05-07-g: fragments are NOT stripped today. Director's
    // directive quoted verbatim referenced only `?`.
    assert.equal(
      normalizeUrlForRecognition('https://www.etsy.com/listing/123#reviews'),
      'https://www.etsy.com/listing/123#reviews',
    );
  });

  it('strips the query but preserves the fragment when both present', () => {
    // The `?` cuts everything to the right INCLUDING the fragment because
    // standard URL grammar puts the query before the fragment. The result
    // matches the storage-path semantics: a recognition lookup of
    // `…/listing/123` matches saved row `…/listing/123` regardless of
    // either tab having a fragment or query string.
    assert.equal(
      normalizeUrlForRecognition(
        'https://www.etsy.com/listing/123?utm_source=google#reviews',
      ),
      'https://www.etsy.com/listing/123',
    );
  });

  it('preserves trailing slash exactly', () => {
    assert.equal(
      normalizeUrlForRecognition('https://www.amazon.com/dp/B07XJ8C8F5/'),
      'https://www.amazon.com/dp/B07XJ8C8F5/',
    );
    assert.equal(
      normalizeUrlForRecognition(
        'https://www.amazon.com/dp/B07XJ8C8F5/?ref=foo',
      ),
      'https://www.amazon.com/dp/B07XJ8C8F5/',
    );
  });

  it('returns "" for non-string input', () => {
    assert.equal(normalizeUrlForRecognition(null), '');
    assert.equal(normalizeUrlForRecognition(undefined), '');
    assert.equal(normalizeUrlForRecognition(42), '');
    assert.equal(normalizeUrlForRecognition({}), '');
  });

  it('returns "" for empty string', () => {
    assert.equal(normalizeUrlForRecognition(''), '');
  });

  it('handles a URL that is just a path (no protocol/host)', () => {
    // Some host-page link.href reflections return path-only when the
    // `<a>` tag has a relative href — content scripts should still
    // normalize cleanly without crashing.
    assert.equal(normalizeUrlForRecognition('/dp/B07?ref=x'), '/dp/B07');
  });

  it('handles real-world Amazon search-result URL', () => {
    const real =
      'https://www.amazon.com/dp/B07XJ8C8F5/ref=sr_1_3?crid=ABC123&keywords=red+light+therapy&qid=1714857600&sprefix=red+light%2Caps%2C123&sr=8-3';
    assert.equal(
      normalizeUrlForRecognition(real),
      'https://www.amazon.com/dp/B07XJ8C8F5/ref=sr_1_3',
    );
  });
});

describe('urlsMatchAfterNormalization', () => {
  it('matches identical URLs', () => {
    assert.equal(
      urlsMatchAfterNormalization(
        'https://www.amazon.com/dp/B07',
        'https://www.amazon.com/dp/B07',
      ),
      true,
    );
  });

  it('matches when only one has a query string', () => {
    assert.equal(
      urlsMatchAfterNormalization(
        'https://www.amazon.com/dp/B07?tag=foo',
        'https://www.amazon.com/dp/B07',
      ),
      true,
    );
  });

  it('matches when both have different query strings', () => {
    assert.equal(
      urlsMatchAfterNormalization(
        'https://www.amazon.com/dp/B07?tag=foo',
        'https://www.amazon.com/dp/B07?tag=bar&ref=baz',
      ),
      true,
    );
  });

  it('does NOT match different paths', () => {
    assert.equal(
      urlsMatchAfterNormalization(
        'https://www.amazon.com/dp/B07',
        'https://www.amazon.com/dp/B08',
      ),
      false,
    );
  });

  it('is case-sensitive on path (ASIN-significant)', () => {
    // Amazon ASINs are case-significant — B07XJ8C8F5 is a different
    // product from b07xj8c8f5 (which is invalid).
    assert.equal(
      urlsMatchAfterNormalization(
        'https://www.amazon.com/dp/B07XJ8C8F5',
        'https://www.amazon.com/dp/b07xj8c8f5',
      ),
      false,
    );
  });

  it('returns false for empty / non-string inputs', () => {
    assert.equal(urlsMatchAfterNormalization('', ''), false);
    assert.equal(urlsMatchAfterNormalization(null, null), false);
    assert.equal(
      urlsMatchAfterNormalization('https://www.amazon.com/dp/B07', null),
      false,
    );
  });
});

describe('buildRecognitionSet', () => {
  it('returns empty Set for empty input', () => {
    const set = buildRecognitionSet([]);
    assert.equal(set.size, 0);
  });

  it('builds a Set of normalized URLs from row objects', () => {
    const set = buildRecognitionSet([
      { url: 'https://www.amazon.com/dp/B01?tag=foo' },
      { url: 'https://www.ebay.com/itm/123?ref=bar' },
      { url: 'https://www.etsy.com/listing/456' },
    ]);
    assert.equal(set.size, 3);
    assert.ok(set.has('https://www.amazon.com/dp/B01'));
    assert.ok(set.has('https://www.ebay.com/itm/123'));
    assert.ok(set.has('https://www.etsy.com/listing/456'));
  });

  it('dedupes after normalization (two saves of same product with different tags collapse)', () => {
    const set = buildRecognitionSet([
      { url: 'https://www.amazon.com/dp/B01?tag=a' },
      { url: 'https://www.amazon.com/dp/B01?tag=b' },
    ]);
    assert.equal(set.size, 1);
    assert.ok(set.has('https://www.amazon.com/dp/B01'));
  });

  it('drops rows without a string `url`', () => {
    const set = buildRecognitionSet([
      { url: 'https://www.amazon.com/dp/B01' },
      { url: null } as unknown as { url: string },
      { url: 42 } as unknown as { url: string },
      {} as unknown as { url: string },
    ]);
    assert.equal(set.size, 1);
  });

  it('handles missing/undefined input rows defensively', () => {
    // Server-side type drift would be rare but the content script should
    // never crash because of it.
    // @ts-expect-error testing runtime guard
    const set = buildRecognitionSet([null, undefined, { url: 'https://x.y/z' }]);
    assert.equal(set.size, 1);
  });
});
