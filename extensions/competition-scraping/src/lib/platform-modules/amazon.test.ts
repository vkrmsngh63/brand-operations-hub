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

// SSPA sponsored-ads coverage — P-4 fix 2026-05-08-d.
// Real URLs captured from amazon.com search results during Waypoint #1
// attempt #4. The /sspa/click?...&url=<encoded path> shape must be peeked
// into so the floating "+ Add" button appears on sponsored ads too.
describe('amazon SSPA sponsored-ads (P-4)', () => {
  // Real captured URL from a sponsored search-results card.
  const SSPA_URL_1 =
    'https://www.amazon.com/sspa/click?ie=UTF8&spc=MTo4NjgyODU5MzAxMzA4ODg3OjE3NzgyNzI2MDg6c3BfYXRmOjMwMTA0MTE5MDg2OTIwMjo6MDo6&url=%2FComfpack-Flexible-Replacement-Sciatica-Bursitis%2Fdp%2FB0DWJTLNYT%2Fref%3Dsr_1_2_sspa%3Fcrid%3D2AMUE62JYK11Z';

  // Real captured URL from a different sponsored placement (sp_mtf instead
  // of sp_atf); same SSPA shape, different ad-slot context.
  const SSPA_URL_2 =
    'https://www.amazon.com/sspa/click?ie=UTF8&spc=MTo4NjgyODU5MzAxMzA4ODg3OjE3NzgyNzI2MDg6c3BfbXRmOjIwMDA1MzIyMjc5OTQ5ODo6MDo6&url=%2FPack-Elbow-Support-Therapy-LotFancy%2Fdp%2FB0716F3NFG%2Fref%3Dsr_1_12_sspa%3Fcrid%3D2AMUE62JYK11Z';

  it('matchesProduct true for real sp_atf SSPA URL', () => {
    assert.equal(amazon.matchesProduct(SSPA_URL_1), true);
  });

  it('matchesProduct true for real sp_mtf SSPA URL', () => {
    assert.equal(amazon.matchesProduct(SSPA_URL_2), true);
  });

  it('canonicalProductUrl extracts ASIN from sp_atf SSPA URL', () => {
    assert.equal(
      amazon.canonicalProductUrl(SSPA_URL_1),
      'https://www.amazon.com/dp/B0DWJTLNYT',
    );
  });

  it('canonicalProductUrl extracts ASIN from sp_mtf SSPA URL', () => {
    assert.equal(
      amazon.canonicalProductUrl(SSPA_URL_2),
      'https://www.amazon.com/dp/B0716F3NFG',
    );
  });

  it('matchesProduct false when SSPA url= param has no /dp/ path', () => {
    // Hypothetical SSPA URL whose inner url= param doesn't contain a /dp/
    // segment (e.g., a sponsored brand carousel pointing at a brand store).
    const url =
      'https://www.amazon.com/sspa/click?ie=UTF8&spc=abc&url=%2Fstores%2FACME%2Fpage%2F12345';
    assert.equal(amazon.matchesProduct(url), false);
    assert.equal(amazon.canonicalProductUrl(url), null);
  });

  it('matchesProduct false when /sspa/click is missing the url= param', () => {
    const url = 'https://www.amazon.com/sspa/click?ie=UTF8&spc=abc';
    assert.equal(amazon.matchesProduct(url), false);
    assert.equal(amazon.canonicalProductUrl(url), null);
  });

  it('matchesProduct false when url= param is empty', () => {
    const url = 'https://www.amazon.com/sspa/click?ie=UTF8&spc=abc&url=';
    assert.equal(amazon.matchesProduct(url), false);
    assert.equal(amazon.canonicalProductUrl(url), null);
  });

  it('does NOT mistake a non-SSPA URL with a "url" query param for sponsored', () => {
    // Pathname differs from /sspa/click, so the SSPA branch is not taken.
    const url =
      'https://www.amazon.com/some-page?url=%2FBrand%2Fdp%2FB0DWJTLNYT';
    assert.equal(amazon.matchesProduct(url), false);
    assert.equal(amazon.canonicalProductUrl(url), null);
  });

  it('handles SSPA URL with /gp/product/ inside the url= param', () => {
    // Hypothetical — direct path uses /dp/, but if Amazon ever encodes
    // /gp/product/ inside SSPA, the same ASIN_RE matches both forms and
    // the canonical output is still /dp/{ASIN}.
    const url =
      'https://www.amazon.com/sspa/click?ie=UTF8&spc=abc&url=%2Fgp%2Fproduct%2FB07XJ8C8F5%2F';
    assert.equal(amazon.matchesProduct(url), true);
    assert.equal(
      amazon.canonicalProductUrl(url),
      'https://www.amazon.com/dp/B07XJ8C8F5',
    );
  });
});
