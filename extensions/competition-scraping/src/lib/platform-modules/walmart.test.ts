import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { walmart } from './walmart.ts';

describe('walmart module — metadata', () => {
  it('platform value matches CompetitorUrl.platform enum', () => {
    assert.equal(walmart.platform, 'walmart');
  });

  it('hostnames covers walmart.com', () => {
    assert.deepEqual(walmart.hostnames, ['walmart.com']);
  });
});

describe('walmart.matchesProduct', () => {
  it('matches /ip/Title-Slug/{id}', () => {
    assert.equal(
      walmart.matchesProduct(
        'https://www.walmart.com/ip/Red-Light-Therapy-Device/12345678',
      ),
      true,
    );
  });

  it('matches /ip/{id} slug-less form', () => {
    assert.equal(
      walmart.matchesProduct('https://www.walmart.com/ip/12345678'),
      true,
    );
  });

  it('matches with query string', () => {
    assert.equal(
      walmart.matchesProduct(
        'https://www.walmart.com/ip/Red-Light/12345678?from=feed',
      ),
      true,
    );
  });

  it('does NOT match category pages', () => {
    assert.equal(
      walmart.matchesProduct(
        'https://www.walmart.com/cp/health-and-medicine/123',
      ),
      false,
    );
  });

  it('does NOT match search results', () => {
    assert.equal(
      walmart.matchesProduct(
        'https://www.walmart.com/search?q=red+light+therapy',
      ),
      false,
    );
  });

  it('does NOT match non-numeric IDs', () => {
    assert.equal(
      walmart.matchesProduct('https://www.walmart.com/ip/Title-Slug/abc'),
      false,
    );
  });
});

describe('walmart.canonicalProductUrl', () => {
  it('produces canonical /ip/{id} from slug-prefixed URL', () => {
    assert.equal(
      walmart.canonicalProductUrl(
        'https://www.walmart.com/ip/Red-Light-Therapy/12345678',
      ),
      'https://www.walmart.com/ip/12345678',
    );
  });

  it('produces canonical /ip/{id} from slug-less URL', () => {
    assert.equal(
      walmart.canonicalProductUrl('https://www.walmart.com/ip/12345678'),
      'https://www.walmart.com/ip/12345678',
    );
  });

  it('strips slug + query in one shot', () => {
    assert.equal(
      walmart.canonicalProductUrl(
        'https://www.walmart.com/ip/Some-Title/12345678?from=cp',
      ),
      'https://www.walmart.com/ip/12345678',
    );
  });

  it('returns null for non-product URLs', () => {
    assert.equal(
      walmart.canonicalProductUrl('https://www.walmart.com/search?q=x'),
      null,
    );
  });

  it('returns null for non-string / empty', () => {
    // @ts-expect-error testing runtime guard
    assert.equal(walmart.canonicalProductUrl(null), null);
    assert.equal(walmart.canonicalProductUrl(''), null);
  });
});
