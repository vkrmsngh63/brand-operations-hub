import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ebay } from './ebay.ts';

describe('ebay module — metadata', () => {
  it('platform value matches CompetitorUrl.platform enum', () => {
    assert.equal(ebay.platform, 'ebay');
  });

  it('hostnames covers ebay.com', () => {
    assert.deepEqual(ebay.hostnames, ['ebay.com']);
  });
});

describe('ebay.matchesProduct', () => {
  it('matches bare /itm/{listing-id}', () => {
    assert.equal(
      ebay.matchesProduct('https://www.ebay.com/itm/123456789012'),
      true,
    );
  });

  it('matches slug-prefixed /itm/Title-Slug/{listing-id}', () => {
    assert.equal(
      ebay.matchesProduct(
        'https://www.ebay.com/itm/Red-Light-Therapy-Device/123456789012',
      ),
      true,
    );
  });

  it('matches with query string', () => {
    assert.equal(
      ebay.matchesProduct(
        'https://www.ebay.com/itm/123456789012?hash=item123&epid=456',
      ),
      true,
    );
  });

  it('matches with trailing slash', () => {
    assert.equal(
      ebay.matchesProduct('https://www.ebay.com/itm/123456789012/'),
      true,
    );
  });

  it('does NOT match too-short listing IDs (< 8 digits)', () => {
    assert.equal(
      ebay.matchesProduct('https://www.ebay.com/itm/1234567'),
      false,
    );
  });

  it('does NOT match search-results URLs', () => {
    assert.equal(
      ebay.matchesProduct('https://www.ebay.com/sch/i.html?_nkw=red+light'),
      false,
    );
  });

  it('does NOT match seller / store URLs', () => {
    assert.equal(
      ebay.matchesProduct('https://www.ebay.com/usr/some-seller'),
      false,
    );
  });

  it('does NOT match alphanumeric listing-id placeholder', () => {
    assert.equal(
      ebay.matchesProduct('https://www.ebay.com/itm/abc123'),
      false,
    );
  });

  it('returns false for non-string / empty', () => {
    // @ts-expect-error testing runtime guard
    assert.equal(ebay.matchesProduct(null), false);
    assert.equal(ebay.matchesProduct(''), false);
  });
});

describe('ebay.canonicalProductUrl', () => {
  it('produces canonical /itm/{id} from a bare URL', () => {
    assert.equal(
      ebay.canonicalProductUrl('https://www.ebay.com/itm/123456789012'),
      'https://www.ebay.com/itm/123456789012',
    );
  });

  it('strips title slug to canonical form', () => {
    assert.equal(
      ebay.canonicalProductUrl(
        'https://www.ebay.com/itm/Red-Light-Therapy-Device/123456789012',
      ),
      'https://www.ebay.com/itm/123456789012',
    );
  });

  it('strips slug + query', () => {
    assert.equal(
      ebay.canonicalProductUrl(
        'https://www.ebay.com/itm/Some-Title/123456789012?hash=item123',
      ),
      'https://www.ebay.com/itm/123456789012',
    );
  });

  it('returns null for non-product URLs', () => {
    assert.equal(
      ebay.canonicalProductUrl('https://www.ebay.com/sch/i.html?_nkw=x'),
      null,
    );
  });

  it('returns null for non-string / empty', () => {
    // @ts-expect-error testing runtime guard
    assert.equal(ebay.canonicalProductUrl(null), null);
    assert.equal(ebay.canonicalProductUrl(''), null);
  });
});
