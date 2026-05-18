import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  getStickyPreselectedUrlId,
  makeStickyUrlPreselectKey,
  type UrlForStickyPreselect,
} from './sticky-url-preselect.ts';

function url(id: string): UrlForStickyPreselect {
  return { id };
}

describe('getStickyPreselectedUrlId', () => {
  describe('storedPref matches an existing url (Priority 1)', () => {
    it('returns the matched id in a multi-URL list', () => {
      const urls = [url('a'), url('b'), url('c')];
      assert.equal(getStickyPreselectedUrlId(urls, 'b'), 'b');
    });

    it('returns the matched id in a 1-URL list (sanity — would also pass via length===1 rule)', () => {
      const urls = [url('only')];
      assert.equal(getStickyPreselectedUrlId(urls, 'only'), 'only');
    });
  });

  describe('storedPref does not match any existing url (URL was deleted, etc.)', () => {
    it('falls back to length===1 rule when only 1 URL exists', () => {
      const urls = [url('a')];
      assert.equal(getStickyPreselectedUrlId(urls, 'deleted-id'), 'a');
    });

    it('falls back to placeholder when 2+ URLs exist', () => {
      const urls = [url('a'), url('b')];
      assert.equal(getStickyPreselectedUrlId(urls, 'deleted-id'), '');
    });

    it('falls back to placeholder when urls list is empty (defensive)', () => {
      assert.equal(getStickyPreselectedUrlId([], 'some-id'), '');
    });
  });

  describe('no stored preference (storedPref undefined)', () => {
    it('falls back to length===1 rule (P-38 trivial case)', () => {
      const urls = [url('only')];
      assert.equal(getStickyPreselectedUrlId(urls, undefined), 'only');
    });

    it('returns placeholder when 2+ URLs and no stored preference', () => {
      const urls = [url('a'), url('b'), url('c')];
      assert.equal(getStickyPreselectedUrlId(urls, undefined), '');
    });

    it('returns placeholder when urls list is empty', () => {
      assert.equal(getStickyPreselectedUrlId([], undefined), '');
    });
  });

  describe('storedPref empty string treated as no preference', () => {
    it("empty string doesn't crash the lookup; falls back to length===1 / placeholder ladder", () => {
      const urls = [url('a'), url('b')];
      assert.equal(getStickyPreselectedUrlId(urls, ''), '');
    });

    it("empty string + 1-URL list falls back to length===1", () => {
      const urls = [url('only')];
      assert.equal(getStickyPreselectedUrlId(urls, ''), 'only');
    });
  });
});

describe('makeStickyUrlPreselectKey', () => {
  it('composes the canonical key shape with projectId + platform', () => {
    assert.equal(
      makeStickyUrlPreselectKey('proj-abc-123', 'amazon'),
      'plos-cs-popup-url-pref-proj-abc-123-amazon',
    );
  });

  it('keys for different platforms within same project are distinct', () => {
    const projectId = 'proj-xyz';
    assert.notEqual(
      makeStickyUrlPreselectKey(projectId, 'amazon'),
      makeStickyUrlPreselectKey(projectId, 'walmart'),
    );
  });

  it('keys for different projects within same platform are distinct', () => {
    const platform = 'etsy';
    assert.notEqual(
      makeStickyUrlPreselectKey('proj-1', platform),
      makeStickyUrlPreselectKey('proj-2', platform),
    );
  });
});
