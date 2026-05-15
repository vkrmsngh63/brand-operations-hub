// SSRF guard test suite — security-class coverage for the pure-function
// IP classification + URL pre-resolve validation + DNS-side validation
// shipped in `src/lib/ssrf-guard.ts`.
//
// Per the W#2 P-29 Slice #3 launch prompt: this is the FIRST piece of
// server-side route logic in P-29 that has hard correctness requirements
// (security-class) — thorough coverage on the allowlist + IP-classification
// + DNS-rebind catches is non-negotiable even though the rest of the slice's
// regression coverage is structurally placeholder'd pending the P-30
// React-bundle rig.
//
// Run: `node --test src/lib/ssrf-guard.test.ts`

import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { LookupAddress, LookupAllOptions } from 'node:dns';

import {
  classifyAddress,
  resolveAndValidate,
  validateUrlPreResolve,
} from './ssrf-guard.ts';

// ─── IPv4 classification — block ranges ────────────────────────────────

test('classifyAddress blocks 0.0.0.0/8 (unspecified)', () => {
  const cases = ['0.0.0.0', '0.1.2.3', '0.255.255.255'];
  for (const addr of cases) {
    const r = classifyAddress(addr);
    assert.equal(r.allowed, false, `${addr} should be blocked`);
    if (!r.allowed) assert.equal(r.reason, 'unspecified-v4');
  }
});

test('classifyAddress blocks 127.0.0.0/8 (loopback)', () => {
  const cases = ['127.0.0.1', '127.255.255.255', '127.42.42.42'];
  for (const addr of cases) {
    const r = classifyAddress(addr);
    assert.equal(r.allowed, false, `${addr} should be blocked`);
    if (!r.allowed) assert.equal(r.reason, 'loopback-v4');
  }
});

test('classifyAddress blocks 10.0.0.0/8 (RFC 1918 private)', () => {
  const cases = ['10.0.0.0', '10.0.0.1', '10.255.255.255', '10.42.42.42'];
  for (const addr of cases) {
    const r = classifyAddress(addr);
    assert.equal(r.allowed, false, `${addr} should be blocked`);
    if (!r.allowed) assert.equal(r.reason, 'private-v4');
  }
});

test('classifyAddress blocks 172.16.0.0/12 (RFC 1918 private)', () => {
  const cases = ['172.16.0.0', '172.16.0.1', '172.31.255.255', '172.20.10.5'];
  for (const addr of cases) {
    const r = classifyAddress(addr);
    assert.equal(r.allowed, false, `${addr} should be blocked`);
    if (!r.allowed) assert.equal(r.reason, 'private-v4');
  }
  // 172.15.x.x and 172.32.x.x are PUBLIC (just outside /12).
  for (const addr of ['172.15.0.1', '172.32.0.1']) {
    const r = classifyAddress(addr);
    assert.equal(r.allowed, true, `${addr} should be allowed (outside 172.16/12)`);
  }
});

test('classifyAddress blocks 192.168.0.0/16 (RFC 1918 private)', () => {
  const cases = ['192.168.0.0', '192.168.0.1', '192.168.255.255', '192.168.1.1'];
  for (const addr of cases) {
    const r = classifyAddress(addr);
    assert.equal(r.allowed, false, `${addr} should be blocked`);
    if (!r.allowed) assert.equal(r.reason, 'private-v4');
  }
});

test('classifyAddress blocks 169.254.0.0/16 (link-local + cloud metadata)', () => {
  // 169.254.169.254 is the AWS/GCP/Azure metadata endpoint — the canonical
  // SSRF target. 169.254.170.2 is the AWS ECS task metadata endpoint.
  const cases = [
    '169.254.0.0',
    '169.254.169.254',
    '169.254.170.2',
    '169.254.169.253',
    '169.254.255.255',
  ];
  for (const addr of cases) {
    const r = classifyAddress(addr);
    assert.equal(r.allowed, false, `${addr} should be blocked`);
    if (!r.allowed) assert.equal(r.reason, 'link-local-v4');
  }
});

test('classifyAddress blocks 100.64.0.0/10 (carrier-grade NAT)', () => {
  const cases = ['100.64.0.0', '100.64.0.1', '100.127.255.255', '100.100.100.100'];
  for (const addr of cases) {
    const r = classifyAddress(addr);
    assert.equal(r.allowed, false, `${addr} should be blocked`);
    if (!r.allowed) assert.equal(r.reason, 'cgnat-v4');
  }
  // 100.63.x.x and 100.128.x.x are PUBLIC (just outside /10).
  for (const addr of ['100.63.0.1', '100.128.0.1']) {
    const r = classifyAddress(addr);
    assert.equal(r.allowed, true, `${addr} should be allowed (outside 100.64/10)`);
  }
});

test('classifyAddress blocks TEST-NET ranges (RFC 5737)', () => {
  const cases = ['192.0.2.1', '198.51.100.1', '203.0.113.1'];
  for (const addr of cases) {
    const r = classifyAddress(addr);
    assert.equal(r.allowed, false, `${addr} should be blocked`);
    if (!r.allowed) assert.equal(r.reason, 'reserved-v4');
  }
});

test('classifyAddress blocks 224.0.0.0/4 (multicast)', () => {
  const cases = ['224.0.0.0', '224.0.0.1', '239.255.255.255', '230.1.2.3'];
  for (const addr of cases) {
    const r = classifyAddress(addr);
    assert.equal(r.allowed, false, `${addr} should be blocked`);
    if (!r.allowed) assert.equal(r.reason, 'multicast-v4');
  }
});

test('classifyAddress blocks 255.255.255.255 (broadcast)', () => {
  const r = classifyAddress('255.255.255.255');
  assert.equal(r.allowed, false);
  if (!r.allowed) assert.equal(r.reason, 'broadcast-v4');
});

test('classifyAddress blocks 240.0.0.0/4 (reserved future)', () => {
  const cases = ['240.0.0.0', '240.0.0.1', '254.255.255.255'];
  for (const addr of cases) {
    const r = classifyAddress(addr);
    assert.equal(r.allowed, false, `${addr} should be blocked`);
    if (!r.allowed) assert.equal(r.reason, 'reserved-v4');
  }
});

// ─── IPv4 classification — allow ranges ────────────────────────────────

test('classifyAddress allows representative public IPv4 addresses', () => {
  const cases = [
    '1.1.1.1',       // Cloudflare
    '8.8.8.8',       // Google DNS
    '9.9.9.9',       // Quad9
    '20.81.111.85',  // azure example public
    '52.55.55.55',   // AWS example public
    '93.184.216.34', // example.com (historic)
    '142.250.80.46', // google.com
    '171.5.5.5',     // outside 172.16/12
    '172.32.0.1',    // outside 172.16/12
    '193.0.0.1',     // outside reserved
  ];
  for (const addr of cases) {
    const r = classifyAddress(addr);
    assert.equal(r.allowed, true, `${addr} should be allowed`);
  }
});

// ─── IPv4 validation — malformed input ─────────────────────────────────

test('classifyAddress rejects malformed IPv4 strings', () => {
  const cases = [
    '256.0.0.1',      // octet out of range
    '1.2.3',          // too few octets
    '1.2.3.4.5',      // too many octets
    '01.2.3.4',       // leading zero (octal ambiguity)
    '1.2.3.04',       // leading zero in last octet
    '1.2.3.4.',       // trailing dot
    '.1.2.3.4',       // leading dot
    '1.2.3.4 ',       // trailing whitespace
    '1.2.3.x',        // non-numeric
    '',               // empty
    'not.an.ip.address',
  ];
  for (const addr of cases) {
    const r = classifyAddress(addr);
    assert.equal(r.allowed, false, `${addr} should be rejected as invalid`);
    if (!r.allowed) {
      assert.equal(r.reason, 'invalid-address', `expected invalid-address for ${addr}, got ${r.reason}`);
    }
  }
});

// ─── IPv6 classification — block ranges ────────────────────────────────

test('classifyAddress blocks ::1 (IPv6 loopback)', () => {
  for (const addr of ['::1', '0:0:0:0:0:0:0:1']) {
    const r = classifyAddress(addr);
    assert.equal(r.allowed, false, `${addr} should be blocked`);
    if (!r.allowed) assert.equal(r.reason, 'loopback-v6');
  }
});

test('classifyAddress blocks :: (IPv6 unspecified)', () => {
  for (const addr of ['::', '0:0:0:0:0:0:0:0']) {
    const r = classifyAddress(addr);
    assert.equal(r.allowed, false, `${addr} should be blocked`);
    if (!r.allowed) assert.equal(r.reason, 'unspecified-v6');
  }
});

test('classifyAddress blocks fe80::/10 (IPv6 link-local)', () => {
  const cases = [
    'fe80::1',
    'fe80::cafe',
    'fe80::1234:5678:90ab:cdef',
    'febf::1', // upper edge of /10
  ];
  for (const addr of cases) {
    const r = classifyAddress(addr);
    assert.equal(r.allowed, false, `${addr} should be blocked`);
    if (!r.allowed) assert.equal(r.reason, 'link-local-v6');
  }
  // fec0:: is OUTSIDE fe80::/10 (boundary check).
  const r = classifyAddress('fec0::1');
  // fec0::/10 is the deprecated site-local range — we don't have a
  // specific rule for it, but it's the next /10 after link-local; it
  // should NOT be marked link-local-v6. (May fall through to allowed.)
  if (!r.allowed) {
    assert.notEqual(r.reason, 'link-local-v6', 'fec0::1 is not link-local');
  }
});

test('classifyAddress blocks fc00::/7 (IPv6 unique-local incl. fd00::/8)', () => {
  const cases = ['fc00::1', 'fd00::1', 'fdff::cafe', 'fc11::beef'];
  for (const addr of cases) {
    const r = classifyAddress(addr);
    assert.equal(r.allowed, false, `${addr} should be blocked`);
    if (!r.allowed) assert.equal(r.reason, 'unique-local-v6');
  }
});

test('classifyAddress blocks ff00::/8 (IPv6 multicast)', () => {
  const cases = ['ff00::1', 'ff02::1', 'ff05::beef', 'ffff::1'];
  for (const addr of cases) {
    const r = classifyAddress(addr);
    assert.equal(r.allowed, false, `${addr} should be blocked`);
    if (!r.allowed) assert.equal(r.reason, 'multicast-v6');
  }
});

test('classifyAddress blocks 2001:db8::/32 (IPv6 documentation)', () => {
  const cases = ['2001:db8::1', '2001:db8:cafe::beef'];
  for (const addr of cases) {
    const r = classifyAddress(addr);
    assert.equal(r.allowed, false, `${addr} should be blocked`);
    if (!r.allowed) assert.equal(r.reason, 'reserved-v6');
  }
});

// ─── IPv6 IPv4-mapped form — defer to v4 classification ────────────────

test('classifyAddress IPv4-mapped IPv6 ::ffff:a.b.c.d defers to v4 rules', () => {
  // ::ffff:127.0.0.1 — should be blocked as loopback-v4 (the underlying
  // address). This is the classic SSRF-bypass attempt: encode a private
  // v4 as a v6 to dodge a v4-only blocklist.
  const r1 = classifyAddress('::ffff:127.0.0.1');
  assert.equal(r1.allowed, false, '::ffff:127.0.0.1 should be blocked');
  if (!r1.allowed) assert.equal(r1.reason, 'loopback-v4');

  const r2 = classifyAddress('::ffff:10.0.0.1');
  assert.equal(r2.allowed, false, '::ffff:10.0.0.1 should be blocked');
  if (!r2.allowed) assert.equal(r2.reason, 'private-v4');

  const r3 = classifyAddress('::ffff:169.254.169.254');
  assert.equal(r3.allowed, false, '::ffff:169.254.169.254 should be blocked');
  if (!r3.allowed) assert.equal(r3.reason, 'link-local-v4');

  // Public v4 in the v4-mapped form should be allowed.
  const r4 = classifyAddress('::ffff:8.8.8.8');
  assert.equal(r4.allowed, true, '::ffff:8.8.8.8 should be allowed');
});

test('classifyAddress NAT64 64:ff9b::a.b.c.d defers to v4 rules', () => {
  const r1 = classifyAddress('64:ff9b::127.0.0.1');
  assert.equal(r1.allowed, false);
  if (!r1.allowed) assert.equal(r1.reason, 'loopback-v4');

  const r2 = classifyAddress('64:ff9b::8.8.8.8');
  assert.equal(r2.allowed, true);
});

// ─── IPv6 classification — allow ranges ────────────────────────────────

test('classifyAddress allows representative public IPv6 addresses', () => {
  const cases = [
    '2001:4860:4860::8888', // Google IPv6 DNS
    '2606:4700:4700::1111', // Cloudflare IPv6 DNS
    '2620:fe::fe',          // Quad9 IPv6
    '2001:0:0:0:0:0:0:1',   // outside reserved
  ];
  for (const addr of cases) {
    const r = classifyAddress(addr);
    assert.equal(r.allowed, true, `${addr} should be allowed`);
  }
});

// ─── validateUrlPreResolve — scheme rejection ──────────────────────────

test('validateUrlPreResolve rejects non-http/https schemes', () => {
  const cases = [
    'file:///etc/passwd',
    'data:image/png;base64,AAAA',
    'javascript:alert(1)',
    'ftp://example.com/img.png',
    'gopher://example.com/img.png',
    'ws://example.com/socket',
    'about:blank',
  ];
  for (const url of cases) {
    const r = validateUrlPreResolve(url);
    assert.equal(r.allowed, false, `${url} should be rejected`);
    if (!r.allowed) assert.equal(r.reason, 'invalid-scheme');
  }
});

test('validateUrlPreResolve accepts http: and https:', () => {
  const r1 = validateUrlPreResolve('https://example.com/img.png');
  assert.equal(r1.allowed, true);
  const r2 = validateUrlPreResolve('http://example.com/img.png');
  assert.equal(r2.allowed, true);
});

test('validateUrlPreResolve rejects malformed URLs', () => {
  const cases = [
    '',
    'not a url',
    'https://',
    '://example.com/img.png',
  ];
  for (const url of cases) {
    const r = validateUrlPreResolve(url);
    assert.equal(r.allowed, false, `${url} should be rejected`);
  }
});

// ─── validateUrlPreResolve — metadata hostnames ────────────────────────

test('validateUrlPreResolve rejects cloud-metadata hostnames pre-resolve', () => {
  const cases = [
    'http://metadata.google.internal/computeMetadata/v1/',
    'http://metadata.goog/',
    'http://metadata/',
    'http://169.254.169.254/latest/meta-data/',
    'http://169.254.169.253/',
    'http://169.254.170.2/v2/credentials',
  ];
  for (const url of cases) {
    const r = validateUrlPreResolve(url);
    assert.equal(r.allowed, false, `${url} should be rejected`);
    // Reason can be either metadata-hostname (for hostname matches) or
    // link-local-v4 (for literal IP matches).
    if (!r.allowed) {
      assert.ok(
        r.reason === 'metadata-hostname' || r.reason === 'link-local-v4',
        `${url} reason was ${r.reason}`
      );
    }
  }
});

// ─── validateUrlPreResolve — literal-IP hostnames ──────────────────────

test('validateUrlPreResolve rejects literal-IP hostnames in blocked ranges', () => {
  const cases: Array<[string, string]> = [
    ['http://127.0.0.1/', 'loopback-v4'],
    ['http://10.0.0.1/', 'private-v4'],
    ['http://192.168.1.1/', 'private-v4'],
    ['http://172.16.0.1/', 'private-v4'],
    ['https://[::1]/', 'loopback-v6'],
    ['https://[fc00::1]/', 'unique-local-v6'],
    ['https://[fe80::1]/', 'link-local-v6'],
  ];
  for (const [url, expectedReason] of cases) {
    const r = validateUrlPreResolve(url);
    assert.equal(r.allowed, false, `${url} should be rejected`);
    if (!r.allowed) {
      assert.equal(r.reason, expectedReason, `${url} got reason ${r.reason}, expected ${expectedReason}`);
    }
  }
});

test('validateUrlPreResolve accepts literal-IP hostnames in public ranges', () => {
  const cases = [
    'https://1.1.1.1/img.png',
    'https://8.8.8.8/img.png',
    'https://[2001:4860:4860::8888]/img.png',
  ];
  for (const url of cases) {
    const r = validateUrlPreResolve(url);
    assert.equal(r.allowed, true, `${url} should be allowed`);
  }
});

// ─── resolveAndValidate — uses injected DNS resolver ───────────────────

test('resolveAndValidate allows when all resolved IPs are public', async () => {
  const fakeLookup = async (
    _h: string,
    _opts: LookupAllOptions
  ): Promise<LookupAddress[]> => [
    { address: '93.184.216.34', family: 4 },
    { address: '2606:2800:220:1:248:1893:25c8:1946', family: 6 },
  ];
  const r = await resolveAndValidate('example.com', fakeLookup);
  assert.equal(r.allowed, true);
  if (r.allowed) {
    assert.equal(r.addresses.length, 2);
  }
});

test('resolveAndValidate rejects when ANY resolved IP is private (DNS-rebind catch)', async () => {
  // Classic DNS-rebind attack: hostname resolves to multiple A records,
  // one public + one private. The resolver hands the private one to the
  // socket; without this catch the connect would land on the LAN.
  const fakeLookup = async (
    _h: string,
    _opts: LookupAllOptions
  ): Promise<LookupAddress[]> => [
    { address: '93.184.216.34', family: 4 },
    { address: '10.0.0.5', family: 4 },
  ];
  const r = await resolveAndValidate('attacker.example.com', fakeLookup);
  assert.equal(r.allowed, false);
  if (!r.allowed) {
    assert.equal(r.reason, 'private-v4');
    assert.equal(r.address, '10.0.0.5');
  }
});

test('resolveAndValidate rejects when resolution fails', async () => {
  const fakeLookup = async (): Promise<LookupAddress[]> => {
    throw new Error('NXDOMAIN');
  };
  const r = await resolveAndValidate('no-such-host.example.invalid', fakeLookup);
  assert.equal(r.allowed, false);
  if (!r.allowed) assert.equal(r.reason, 'invalid-address');
});

test('resolveAndValidate rejects when resolver returns empty array', async () => {
  const fakeLookup = async (): Promise<LookupAddress[]> => [];
  const r = await resolveAndValidate('empty-resolver.example.invalid', fakeLookup);
  assert.equal(r.allowed, false);
  if (!r.allowed) assert.equal(r.reason, 'invalid-address');
});

// ─── classifyAddress — invalid input ───────────────────────────────────

test('classifyAddress rejects non-string and empty input', () => {
  // @ts-expect-error -- testing non-string runtime input
  const r1 = classifyAddress(null);
  assert.equal(r1.allowed, false);
  // @ts-expect-error -- testing non-string runtime input
  const r2 = classifyAddress(undefined);
  assert.equal(r2.allowed, false);
  const r3 = classifyAddress('');
  assert.equal(r3.allowed, false);
  // @ts-expect-error -- testing non-string runtime input
  const r4 = classifyAddress(42);
  assert.equal(r4.allowed, false);
});

// ─── Bracketed IPv6 in hostname-style input ────────────────────────────

test('classifyAddress handles bracketed [::1] form', () => {
  const r = classifyAddress('[::1]');
  assert.equal(r.allowed, false);
  if (!r.allowed) assert.equal(r.reason, 'loopback-v6');
});

// ─── Userinfo + port handling in URL ───────────────────────────────────

test('validateUrlPreResolve handles URLs with port + path + query', () => {
  const r = validateUrlPreResolve('https://example.com:8443/path/to/image.png?cache=bust');
  assert.equal(r.allowed, true);
});

test('validateUrlPreResolve handles URLs with userinfo (allowed; classifier ignores it)', () => {
  const r = validateUrlPreResolve('https://user:pass@example.com/img.png');
  assert.equal(r.allowed, true);
});

test('validateUrlPreResolve rejects URLs where hostname is uppercase metadata DNS name', () => {
  // Hostnames are canonically lowercased by the URL parser; verify our
  // metadata blocklist still catches the obvious case.
  const cases = [
    'http://METADATA.GOOGLE.INTERNAL/',
    'http://Metadata.Google.Internal/',
  ];
  for (const url of cases) {
    const r = validateUrlPreResolve(url);
    assert.equal(r.allowed, false, `${url} should be rejected`);
    if (!r.allowed) assert.equal(r.reason, 'metadata-hostname');
  }
});
