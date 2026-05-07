import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { amazon } from './amazon.ts';

describe('amazon module — metadata', () => {
  it('platform value matches CompetitorUrl.platform enum', () => {
    assert.equal(amazon.platform, 'amazon');
  });

  it('hostnames covers amazon.com', () => {
    assert.deepEqual(amazon.hostnames, ['amazon.com']);
  });
});

describe('amazon.matchesProduct', () => {
  it('matches /dp/{ASIN} bare URL', () => {
    assert.equal(
      amazon.matchesProduct('https://www.amazon.com/dp/B07XJ8C8F5'),
      true,
    );
  });

  it('matches /dp/{ASIN}/ trailing slash', () => {
    assert.equal(
      amazon.matchesProduct('https://www.amazon.com/dp/B07XJ8C8F5/'),
      true,
    );
  });

  it('matches /dp/{ASIN}/ref=...', () => {
    assert.equal(
      amazon.matchesProduct(
        'https://www.amazon.com/dp/B07XJ8C8F5/ref=sr_1_3',
      ),
      true,
    );
  });

  it('matches /dp/{ASIN}?... with query string', () => {
    assert.equal(
      amazon.matchesProduct('https://www.amazon.com/dp/B07XJ8C8F5?tag=plos-20'),
      true,
    );
  });

  it('matches /gp/product/{ASIN}', () => {
    assert.equal(
      amazon.matchesProduct('https://www.amazon.com/gp/product/B07XJ8C8F5'),
      true,
    );
  });

  it('matches /gp/product/{ASIN}/?... with query', () => {
    assert.equal(
      amazon.matchesProduct(
        'https://www.amazon.com/gp/product/B07XJ8C8F5/?ref=cm_sw_r',
      ),
      true,
    );
  });

  it('matches /Title-Slug/dp/{ASIN}', () => {
    // Real-world Amazon product URLs often have the title slug between
    // the host and /dp/. The regex anchors on /dp/ specifically, not on
    // the path start, so this should still match.
    assert.equal(
      amazon.matchesProduct(
        'https://www.amazon.com/Red-Light-Therapy-Device/dp/B07XJ8C8F5',
      ),
      true,
    );
  });

  it('does NOT match search-results URL', () => {
    assert.equal(
      amazon.matchesProduct('https://www.amazon.com/s?k=red+light+therapy'),
      false,
    );
  });

  it('does NOT match category page', () => {
    assert.equal(
      amazon.matchesProduct(
        'https://www.amazon.com/Best-Sellers/zgbs/health-personal-care',
      ),
      false,
    );
  });

  it('does NOT match an 11-character path segment after /dp/ (ASINs are exactly 10)', () => {
    assert.equal(
      amazon.matchesProduct('https://www.amazon.com/dp/B07XJ8C8F5X'),
      false,
    );
  });

  it('does NOT match a 9-character path segment after /dp/', () => {
    assert.equal(
      amazon.matchesProduct('https://www.amazon.com/dp/B07XJ8C8'),
      false,
    );
  });

  it('does NOT match /dp/ followed by non-alphanumeric chars', () => {
    assert.equal(
      amazon.matchesProduct('https://www.amazon.com/dp/B07XJ8C-F5'),
      false,
    );
  });

  it('does NOT match lowercase ASIN (Amazon ASINs are uppercase + digits)', () => {
    assert.equal(
      amazon.matchesProduct('https://www.amazon.com/dp/b07xj8c8f5'),
      false,
    );
  });

  it('returns false for non-string / empty / null', () => {
    // @ts-expect-error testing runtime guard
    assert.equal(amazon.matchesProduct(null), false);
    // @ts-expect-error testing runtime guard
    assert.equal(amazon.matchesProduct(undefined), false);
    assert.equal(amazon.matchesProduct(''), false);
    // @ts-expect-error testing runtime guard
    assert.equal(amazon.matchesProduct(42), false);
  });
});

describe('amazon.canonicalProductUrl', () => {
  it('produces canonical /dp/{ASIN} from a /dp/ URL', () => {
    assert.equal(
      amazon.canonicalProductUrl('https://www.amazon.com/dp/B07XJ8C8F5'),
      'https://www.amazon.com/dp/B07XJ8C8F5',
    );
  });

  it('strips /ref=... path-suffix noise', () => {
    assert.equal(
      amazon.canonicalProductUrl(
        'https://www.amazon.com/dp/B07XJ8C8F5/ref=sr_1_3',
      ),
      'https://www.amazon.com/dp/B07XJ8C8F5',
    );
  });

  it('strips title-slug + ref + query in one shot', () => {
    assert.equal(
      amazon.canonicalProductUrl(
        'https://www.amazon.com/Red-Light-Therapy/dp/B07XJ8C8F5/ref=sr_1_3?keywords=foo',
      ),
      'https://www.amazon.com/dp/B07XJ8C8F5',
    );
  });

  it('normalizes /gp/product/ form to /dp/ canonical form', () => {
    assert.equal(
      amazon.canonicalProductUrl(
        'https://www.amazon.com/gp/product/B07XJ8C8F5/?tag=plos-20',
      ),
      'https://www.amazon.com/dp/B07XJ8C8F5',
    );
  });

  it('preserves the host (amazon.com vs www.amazon.com stay distinct)', () => {
    assert.equal(
      amazon.canonicalProductUrl('https://amazon.com/dp/B07XJ8C8F5'),
      'https://amazon.com/dp/B07XJ8C8F5',
    );
    assert.equal(
      amazon.canonicalProductUrl('https://www.amazon.com/dp/B07XJ8C8F5'),
      'https://www.amazon.com/dp/B07XJ8C8F5',
    );
  });

  it('returns null for non-product URLs', () => {
    assert.equal(
      amazon.canonicalProductUrl('https://www.amazon.com/s?k=red+light'),
      null,
    );
  });

  it('returns null for malformed URL strings', () => {
    assert.equal(amazon.canonicalProductUrl('not a url'), null);
  });

  it('returns null for non-string / empty', () => {
    // @ts-expect-error testing runtime guard
    assert.equal(amazon.canonicalProductUrl(null), null);
    assert.equal(amazon.canonicalProductUrl(''), null);
  });
});
