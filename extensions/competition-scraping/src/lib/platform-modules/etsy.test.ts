import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { etsy } from './etsy.ts';

describe('etsy module — metadata', () => {
  it('platform value matches CompetitorUrl.platform enum', () => {
    assert.equal(etsy.platform, 'etsy');
  });

  it('hostnames covers etsy.com', () => {
    assert.deepEqual(etsy.hostnames, ['etsy.com']);
  });
});

describe('etsy.matchesProduct', () => {
  it('matches /listing/{id} bare', () => {
    assert.equal(
      etsy.matchesProduct('https://www.etsy.com/listing/123456789'),
      true,
    );
  });

  it('matches /listing/{id}/title-slug', () => {
    assert.equal(
      etsy.matchesProduct(
        'https://www.etsy.com/listing/123456789/handmade-soap-bar',
      ),
      true,
    );
  });

  it('matches with query string', () => {
    assert.equal(
      etsy.matchesProduct(
        'https://www.etsy.com/listing/123456789/handmade-soap?ref=hp_rv',
      ),
      true,
    );
  });

  it('matches locale-prefixed paths (etsy.com/dk-en/listing/...)', () => {
    assert.equal(
      etsy.matchesProduct(
        'https://www.etsy.com/dk-en/listing/123456789/handmade-soap',
      ),
      true,
    );
  });

  it('does NOT match search results /search?q=...', () => {
    assert.equal(
      etsy.matchesProduct('https://www.etsy.com/search?q=handmade+soap'),
      false,
    );
  });

  it('does NOT match shop pages', () => {
    assert.equal(
      etsy.matchesProduct('https://www.etsy.com/shop/SomeShopName'),
      false,
    );
  });

  it('does NOT match non-numeric listing-id placeholders', () => {
    assert.equal(
      etsy.matchesProduct('https://www.etsy.com/listing/abc/handmade-soap'),
      false,
    );
  });
});

describe('etsy.canonicalProductUrl', () => {
  it('produces canonical /listing/{id} from a bare URL', () => {
    assert.equal(
      etsy.canonicalProductUrl('https://www.etsy.com/listing/123456789'),
      'https://www.etsy.com/listing/123456789',
    );
  });

  it('strips title-slug suffix', () => {
    assert.equal(
      etsy.canonicalProductUrl(
        'https://www.etsy.com/listing/123456789/handmade-soap-bar',
      ),
      'https://www.etsy.com/listing/123456789',
    );
  });

  it('preserves locale prefix when present', () => {
    assert.equal(
      etsy.canonicalProductUrl(
        'https://www.etsy.com/dk-en/listing/123456789/handmade-soap',
      ),
      'https://www.etsy.com/dk-en/listing/123456789',
    );
  });

  it('strips slug + query in one shot', () => {
    assert.equal(
      etsy.canonicalProductUrl(
        'https://www.etsy.com/listing/123456789/handmade-soap?ref=hp_rv',
      ),
      'https://www.etsy.com/listing/123456789',
    );
  });

  it('returns null for non-product URLs', () => {
    assert.equal(
      etsy.canonicalProductUrl('https://www.etsy.com/search?q=x'),
      null,
    );
  });

  it('returns null for non-string / empty', () => {
    // @ts-expect-error testing runtime guard
    assert.equal(etsy.canonicalProductUrl(null), null);
    assert.equal(etsy.canonicalProductUrl(''), null);
  });
});
