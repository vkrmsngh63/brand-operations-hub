import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PLATFORM_MODULES,
  getModuleByHostname,
  getModuleByPlatform,
} from './registry.ts';

describe('PLATFORM_MODULES registry', () => {
  it('contains exactly 4 modules today (amazon, ebay, etsy, walmart)', () => {
    assert.equal(PLATFORM_MODULES.length, 4);
    const platforms = PLATFORM_MODULES.map((m) => m.platform).sort();
    assert.deepEqual(platforms, ['amazon', 'ebay', 'etsy', 'walmart']);
  });

  it('every module has a non-empty platform string + at least one hostname', () => {
    for (const m of PLATFORM_MODULES) {
      assert.ok(typeof m.platform === 'string' && m.platform.length > 0);
      assert.ok(Array.isArray(m.hostnames) && m.hostnames.length > 0);
      assert.ok(typeof m.matchesProduct === 'function');
      assert.ok(typeof m.canonicalProductUrl === 'function');
    }
  });

  it('every module has unique platform value', () => {
    const platforms = new Set(PLATFORM_MODULES.map((m) => m.platform));
    assert.equal(platforms.size, PLATFORM_MODULES.length);
  });
});

describe('getModuleByPlatform', () => {
  it('returns the right module for each known platform', () => {
    assert.equal(getModuleByPlatform('amazon')?.platform, 'amazon');
    assert.equal(getModuleByPlatform('ebay')?.platform, 'ebay');
    assert.equal(getModuleByPlatform('etsy')?.platform, 'etsy');
    assert.equal(getModuleByPlatform('walmart')?.platform, 'walmart');
  });

  it('returns null for platforms not yet supported (deferred to future sessions)', () => {
    assert.equal(getModuleByPlatform('google-shopping'), null);
    assert.equal(getModuleByPlatform('google-ads'), null);
    assert.equal(getModuleByPlatform('independent-website'), null);
  });

  it('returns null for null / undefined / empty / non-string', () => {
    assert.equal(getModuleByPlatform(null), null);
    assert.equal(getModuleByPlatform(undefined), null);
    assert.equal(getModuleByPlatform(''), null);
    // @ts-expect-error testing runtime guard
    assert.equal(getModuleByPlatform(42), null);
  });
});

describe('getModuleByHostname', () => {
  it('matches exact hostname', () => {
    assert.equal(getModuleByHostname('amazon.com')?.platform, 'amazon');
    assert.equal(getModuleByHostname('ebay.com')?.platform, 'ebay');
    assert.equal(getModuleByHostname('etsy.com')?.platform, 'etsy');
    assert.equal(getModuleByHostname('walmart.com')?.platform, 'walmart');
  });

  it('suffix-matches www.* subdomain', () => {
    assert.equal(getModuleByHostname('www.amazon.com')?.platform, 'amazon');
    assert.equal(getModuleByHostname('www.ebay.com')?.platform, 'ebay');
    assert.equal(getModuleByHostname('www.etsy.com')?.platform, 'etsy');
    assert.equal(getModuleByHostname('www.walmart.com')?.platform, 'walmart');
  });

  it('suffix-matches deeper subdomains (smile.amazon.com)', () => {
    assert.equal(getModuleByHostname('smile.amazon.com')?.platform, 'amazon');
  });

  it('is case-insensitive on hostname', () => {
    assert.equal(getModuleByHostname('WWW.AMAZON.COM')?.platform, 'amazon');
  });

  it('does NOT match international TLDs today (amazon.co.uk, amazon.de)', () => {
    // International expansion is additive — separate host_permissions entry
    // + separate module instance in a future session.
    assert.equal(getModuleByHostname('amazon.co.uk'), null);
    assert.equal(getModuleByHostname('amazon.de'), null);
  });

  it('returns null for unrelated hostnames', () => {
    assert.equal(getModuleByHostname('google.com'), null);
    assert.equal(getModuleByHostname('vklf.com'), null);
  });

  it('returns null for null / empty / non-string', () => {
    assert.equal(getModuleByHostname(null), null);
    assert.equal(getModuleByHostname(undefined), null);
    assert.equal(getModuleByHostname(''), null);
    // @ts-expect-error testing runtime guard
    assert.equal(getModuleByHostname(42), null);
  });

  it('does NOT match a host that only contains the platform name (e.g., notamazon.com)', () => {
    // Suffix match requires `.amazon.com` boundary, not arbitrary substring.
    assert.equal(getModuleByHostname('notamazon.com'), null);
  });
});
