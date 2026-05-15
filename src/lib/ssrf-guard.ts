// SSRF (Server-Side Request Forgery) guard for outbound HTTP fetches.
//
// W#2 P-29 Slice #3 introduces a server-side image-fetch endpoint
// (`urls/[urlId]/images/fetch-by-url`) that takes a user-supplied URL and
// downloads bytes server-side. Without guardrails, a malicious URL could
// point at internal infrastructure (private network, cloud-metadata
// endpoint, loopback) — the server's privileged network position would
// then exfiltrate or pivot. This module is the security boundary.
//
// Design (Option A from session-start drift check — most defensive against
// DNS rebinding):
//
//   1. Parse the URL — must be http:/https:; reject every other scheme.
//   2. Reject obvious cloud-metadata hostnames pre-resolve (defense in
//      depth — an allowlist of internal-metadata DNS names that should
//      never resolve to anything public).
//   3. Resolve the hostname via `dns.lookup(hostname, { all: true })`
//      and validate EVERY returned address is public.
//   4. Connect TO THE VALIDATED IP directly (not by hostname). This
//      closes the DNS-rebind window entirely — the IP the TCP socket
//      talks to is the same IP we validated; no second resolution
//      happens. For vhosted HTTPS servers we override the Host header
//      and set TLS SNI to the original hostname so the server still
//      serves the right virtual host with the right certificate.
//
// The pure-function `classifyAddress` is what gets the heavy unit-test
// coverage; the high-level `safeFetch` is a thin shim that composes
// `classifyAddress` with Node's built-in https/http modules.
//
// Cross-references:
//   - docs/COMPETITION_SCRAPING_DESIGN.md §B 2026-05-15 Q1 outcome
//   - docs/CLAUDE_CODE_STARTER.md Rule 3 (recommendation style — pick the
//     most thorough and reliable option for security-class code)

import * as https from 'node:https';
import * as http from 'node:http';
import { lookup as dnsLookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import type { LookupAddress, LookupAllOptions } from 'node:dns';
import type { IncomingMessage } from 'node:http';

// ─── Public classifications ────────────────────────────────────────────

// Why an address might be blocked. Returned alongside the boolean so
// callers + tests can verify the right rule fired.
export type BlockReason =
  | 'private-v4'
  | 'loopback-v4'
  | 'link-local-v4'
  | 'unspecified-v4'
  | 'broadcast-v4'
  | 'multicast-v4'
  | 'reserved-v4'
  | 'cgnat-v4'
  | 'loopback-v6'
  | 'link-local-v6'
  | 'unique-local-v6'
  | 'unspecified-v6'
  | 'multicast-v6'
  | 'reserved-v6'
  | 'invalid-address'
  | 'invalid-scheme'
  | 'metadata-hostname';

export type AddressClassification =
  | { allowed: true }
  | { allowed: false; reason: BlockReason; address: string };

// ─── Cloud-metadata hostnames (defense-in-depth pre-resolve check) ─────
//
// These are well-known DNS names that resolve to link-local IPs (covered
// by the IP-side check) but a defense-in-depth hostname blocklist catches
// the obvious case before any resolution happens. Anyone deliberately
// reaching for these is almost certainly an attacker.
const METADATA_HOSTNAMES: ReadonlySet<string> = new Set([
  'metadata.google.internal',
  'metadata.goog',
  'metadata',
]);

// ─── IPv4 classification ───────────────────────────────────────────────
//
// Validates a string is a dotted-quad IPv4 address (1-3 digit octets,
// each 0-255) and returns the four octets. Returns null if invalid.
function parseIPv4Octets(address: string): readonly [number, number, number, number] | null {
  const parts = address.split('.');
  if (parts.length !== 4) return null;
  const out: number[] = [];
  for (const part of parts) {
    // Strict: no leading zeros allowed beyond "0" itself (prevents octal
    // ambiguity — "010.0.0.1" should NOT be treated as 8.0.0.1).
    if (part.length === 0 || part.length > 3) return null;
    if (part.length > 1 && part[0] === '0') return null;
    if (!/^[0-9]+$/.test(part)) return null;
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    out.push(n);
  }
  return [out[0], out[1], out[2], out[3]] as const;
}

// Classifies a parsed IPv4 address. Returns either { allowed: true } for
// a public address, or { allowed: false, reason } naming why it was
// rejected. Order of checks intentionally aligns with how the address
// space is sliced (loopback before private, broadcast before reserved,
// etc.) so the reason returned is the most specific applicable rule.
//
// References:
//   - RFC 1918 (private networks)
//   - RFC 3927 (link-local)
//   - RFC 5735 (special-use IPv4)
//   - RFC 6598 (carrier-grade NAT — 100.64.0.0/10)
function classifyIPv4(octets: readonly [number, number, number, number]): AddressClassification {
  const [a, b, c, d] = octets;
  const address = `${a}.${b}.${c}.${d}`;

  // 0.0.0.0/8 — "this network" — unspecified.
  if (a === 0) {
    return { allowed: false, reason: 'unspecified-v4', address };
  }
  // 127.0.0.0/8 — loopback.
  if (a === 127) {
    return { allowed: false, reason: 'loopback-v4', address };
  }
  // 10.0.0.0/8 — RFC 1918 private.
  if (a === 10) {
    return { allowed: false, reason: 'private-v4', address };
  }
  // 100.64.0.0/10 — RFC 6598 carrier-grade NAT.
  if (a === 100 && b >= 64 && b <= 127) {
    return { allowed: false, reason: 'cgnat-v4', address };
  }
  // 169.254.0.0/16 — RFC 3927 link-local + AWS/Azure/GCP metadata.
  if (a === 169 && b === 254) {
    return { allowed: false, reason: 'link-local-v4', address };
  }
  // 172.16.0.0/12 — RFC 1918 private.
  if (a === 172 && b >= 16 && b <= 31) {
    return { allowed: false, reason: 'private-v4', address };
  }
  // 192.0.0.0/24 — IANA special-use.
  if (a === 192 && b === 0 && c === 0) {
    return { allowed: false, reason: 'reserved-v4', address };
  }
  // 192.0.2.0/24 — TEST-NET-1 (RFC 5737).
  if (a === 192 && b === 0 && c === 2) {
    return { allowed: false, reason: 'reserved-v4', address };
  }
  // 192.168.0.0/16 — RFC 1918 private.
  if (a === 192 && b === 168) {
    return { allowed: false, reason: 'private-v4', address };
  }
  // 198.18.0.0/15 — RFC 2544 benchmarking.
  if (a === 198 && (b === 18 || b === 19)) {
    return { allowed: false, reason: 'reserved-v4', address };
  }
  // 198.51.100.0/24 — TEST-NET-2 (RFC 5737).
  if (a === 198 && b === 51 && c === 100) {
    return { allowed: false, reason: 'reserved-v4', address };
  }
  // 203.0.113.0/24 — TEST-NET-3 (RFC 5737).
  if (a === 203 && b === 0 && c === 113) {
    return { allowed: false, reason: 'reserved-v4', address };
  }
  // 224.0.0.0/4 — multicast.
  if (a >= 224 && a <= 239) {
    return { allowed: false, reason: 'multicast-v4', address };
  }
  // 240.0.0.0/4 — reserved for future use.
  if (a >= 240 && a <= 254) {
    return { allowed: false, reason: 'reserved-v4', address };
  }
  // 255.255.255.255 — limited broadcast.
  if (a === 255 && b === 255 && c === 255 && d === 255) {
    return { allowed: false, reason: 'broadcast-v4', address };
  }
  return { allowed: true };
}

// ─── IPv6 classification ───────────────────────────────────────────────
//
// IPv6 has many special-use ranges. We expand a parsed address into 8
// 16-bit groups and check against:
//   - :: (unspecified)
//   - ::1 (loopback)
//   - ::ffff:a.b.c.d (IPv4-mapped — defer to v4 classification)
//   - fe80::/10 (link-local)
//   - fc00::/7 (unique-local — RFC 4193, includes fd00::/8)
//   - ff00::/8 (multicast)
//   - 64:ff9b::/96 (NAT64) — treated as IPv4-mapped
//   - 2001:db8::/32 (documentation) — reserved
//
// We do NOT try to be exhaustive — anything not in a known-public range
// and not in a known-private range defaults to ALLOWED. That mirrors v4
// where 0-223 minus the reserved sub-ranges is "public."

// Parses an IPv6 string into 8 16-bit groups. Returns null if invalid.
function parseIPv6Groups(address: string): readonly number[] | null {
  // Quick reject for non-IPv6.
  if (isIP(address) !== 6) {
    // Maybe it's a bracketed form like [::1] — strip brackets and retry.
    if (address.startsWith('[') && address.endsWith(']')) {
      const inner = address.slice(1, -1);
      if (isIP(inner) !== 6) return null;
      return parseIPv6Groups(inner);
    }
    return null;
  }
  // Strip zone ID if present (e.g. fe80::1%eth0).
  const stripped = address.split('%')[0];

  // Normalize an embedded-IPv4 tail (e.g., ::ffff:1.2.3.4, 64:ff9b::1.2.3.4)
  // by converting the dotted-quad to two hex groups BEFORE the shorthand
  // expansion. The IPv4 part occupies the last 32 bits (= 2 hex groups).
  let normalized = stripped;
  const lastColon = stripped.lastIndexOf(':');
  const tail = lastColon >= 0 ? stripped.slice(lastColon + 1) : '';
  if (tail.includes('.')) {
    const v4 = parseIPv4Octets(tail);
    if (!v4) return null;
    const high = ((v4[0] << 8) | v4[1]).toString(16);
    const low = ((v4[2] << 8) | v4[3]).toString(16);
    normalized = stripped.slice(0, lastColon + 1) + high + ':' + low;
  }

  const hasShorthand = normalized.includes('::');
  let parts: string[];
  if (hasShorthand) {
    const [leftStr, rightStr] = normalized.split('::');
    const left = leftStr === '' ? [] : leftStr.split(':');
    const right = rightStr === '' ? [] : rightStr.split(':');
    const missing = 8 - left.length - right.length;
    if (missing < 0) return null;
    parts = [...left, ...new Array(missing).fill('0'), ...right];
  } else {
    parts = normalized.split(':');
  }
  if (parts.length !== 8) return null;
  const groups: number[] = [];
  for (const part of parts) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(part)) return null;
    groups.push(parseInt(part, 16));
  }
  return groups;
}

function classifyIPv6(address: string): AddressClassification {
  const groups = parseIPv6Groups(address);
  if (!groups) return { allowed: false, reason: 'invalid-address', address };

  const [g0, g1, g2, g3, g4, g5, g6, g7] = groups;

  // :: — unspecified.
  if (g0 === 0 && g1 === 0 && g2 === 0 && g3 === 0 && g4 === 0 && g5 === 0 && g6 === 0 && g7 === 0) {
    return { allowed: false, reason: 'unspecified-v6', address };
  }
  // ::1 — loopback.
  if (g0 === 0 && g1 === 0 && g2 === 0 && g3 === 0 && g4 === 0 && g5 === 0 && g6 === 0 && g7 === 1) {
    return { allowed: false, reason: 'loopback-v6', address };
  }
  // ::ffff:a.b.c.d — IPv4-mapped. Defer to v4 classification on the
  // embedded address.
  if (g0 === 0 && g1 === 0 && g2 === 0 && g3 === 0 && g4 === 0 && g5 === 0xffff) {
    const a = (g6 >> 8) & 0xff;
    const b = g6 & 0xff;
    const c = (g7 >> 8) & 0xff;
    const d = g7 & 0xff;
    return classifyIPv4([a, b, c, d] as const);
  }
  // 64:ff9b::/96 — NAT64 well-known prefix. Treat as IPv4-mapped.
  if (g0 === 0x64 && g1 === 0xff9b && g2 === 0 && g3 === 0 && g4 === 0 && g5 === 0) {
    const a = (g6 >> 8) & 0xff;
    const b = g6 & 0xff;
    const c = (g7 >> 8) & 0xff;
    const d = g7 & 0xff;
    return classifyIPv4([a, b, c, d] as const);
  }
  // fe80::/10 — link-local.
  if ((g0 & 0xffc0) === 0xfe80) {
    return { allowed: false, reason: 'link-local-v6', address };
  }
  // fc00::/7 — unique-local (RFC 4193).
  if ((g0 & 0xfe00) === 0xfc00) {
    return { allowed: false, reason: 'unique-local-v6', address };
  }
  // ff00::/8 — multicast.
  if ((g0 & 0xff00) === 0xff00) {
    return { allowed: false, reason: 'multicast-v6', address };
  }
  // 2001:db8::/32 — documentation (RFC 3849).
  if (g0 === 0x2001 && g1 === 0x0db8) {
    return { allowed: false, reason: 'reserved-v6', address };
  }
  return { allowed: true };
}

// ─── Public API ────────────────────────────────────────────────────────

// Classifies any IPv4 or IPv6 address string. Returns `{ allowed: true }`
// for public addresses; `{ allowed: false, reason, address }` for any
// address in a blocked range or invalid input.
export function classifyAddress(address: string): AddressClassification {
  if (typeof address !== 'string' || address.length === 0) {
    return { allowed: false, reason: 'invalid-address', address: String(address) };
  }
  const family = isIP(address);
  if (family === 4) {
    const octets = parseIPv4Octets(address);
    if (!octets) return { allowed: false, reason: 'invalid-address', address };
    return classifyIPv4(octets);
  }
  if (family === 6) {
    return classifyIPv6(address);
  }
  // Try bracketed v6.
  if (address.startsWith('[') && address.endsWith(']')) {
    const inner = address.slice(1, -1);
    if (isIP(inner) === 6) return classifyIPv6(inner);
  }
  return { allowed: false, reason: 'invalid-address', address };
}

// Validates that a URL is safe to issue an outbound HTTP fetch to BEFORE
// any DNS resolution. Returns:
//   - { allowed: true, parsedUrl } if the URL passes scheme + hostname
//     pre-resolve checks. The caller should pair this with `safeFetch`
//     which does the DNS-side validation.
//   - { allowed: false, reason } if the URL is structurally unsafe.
//
// Pre-resolve checks:
//   - scheme is http: or https: (rejects file:, data:, javascript:, etc.)
//   - hostname is not in METADATA_HOSTNAMES
//   - if hostname is a literal IP, it passes classifyAddress
export type UrlValidationResult =
  | { allowed: true; parsedUrl: URL }
  | { allowed: false; reason: BlockReason; address?: string };

export function validateUrlPreResolve(rawUrl: string): UrlValidationResult {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { allowed: false, reason: 'invalid-scheme' };
  }
  const scheme = parsed.protocol.toLowerCase();
  if (scheme !== 'http:' && scheme !== 'https:') {
    return { allowed: false, reason: 'invalid-scheme' };
  }
  // URL.hostname behavior varies by URL parser version: some return
  // bracketed IPv6 (`[::1]`), some return unbracketed (`::1`). Normalize
  // by stripping brackets before classifying.
  let hostname = parsed.hostname.toLowerCase();
  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    hostname = hostname.slice(1, -1);
  }
  if (METADATA_HOSTNAMES.has(hostname)) {
    return { allowed: false, reason: 'metadata-hostname', address: hostname };
  }
  // If the hostname is a literal IP, classify it now (no DNS needed).
  const family = isIP(hostname);
  if (family !== 0) {
    const result = classifyAddress(hostname);
    if (!result.allowed) return result;
  }
  return { allowed: true, parsedUrl: parsed };
}

// Resolves a hostname and rejects if ANY returned IP is in a blocked
// range. Returns the list of resolved addresses (all of which passed
// `classifyAddress`) on success, or the first blocked classification on
// failure. The list is non-empty on success.
//
// This is the pre-connect validation step. `safeFetch` then connects
// directly to one of these validated IPs (rather than re-resolving),
// which is what closes the DNS-rebind window.
export async function resolveAndValidate(
  hostname: string,
  lookupFn: (
    h: string,
    opts: LookupAllOptions
  ) => Promise<LookupAddress[]> = (h, opts) => dnsLookup(h, opts)
): Promise<
  | { allowed: true; addresses: LookupAddress[] }
  | { allowed: false; reason: BlockReason; address: string }
> {
  let addresses: LookupAddress[];
  try {
    addresses = await lookupFn(hostname, { all: true });
  } catch {
    return { allowed: false, reason: 'invalid-address', address: hostname };
  }
  if (addresses.length === 0) {
    return { allowed: false, reason: 'invalid-address', address: hostname };
  }
  for (const addr of addresses) {
    const result = classifyAddress(addr.address);
    if (!result.allowed) return result;
  }
  return { allowed: true, addresses };
}

// ─── safeFetch — the high-level shim ───────────────────────────────────

export interface SafeFetchOptions {
  // Hard timeout for the entire fetch (request + response). Default 10s.
  timeoutMs?: number;
  // Maximum number of bytes to read from the body. The fetch aborts as
  // soon as this threshold is exceeded. Default 5 MB.
  maxBytes?: number;
  // Custom Headers — caller-controlled. Defaults to a PLOS-identifying
  // User-Agent + Accept image/*.
  headers?: Record<string, string>;
  // Test-only: inject a custom DNS resolver. Production uses dns.lookup.
  lookupFn?: (h: string, opts: LookupAllOptions) => Promise<LookupAddress[]>;
}

export interface SafeFetchResult {
  ok: true;
  status: number;
  contentType: string | null;
  bytes: Uint8Array;
  finalUrl: string;
}

export interface SafeFetchError {
  ok: false;
  reason:
    | BlockReason
    | 'timeout'
    | 'body-too-large'
    | 'http-error'
    | 'network-error'
    | 'redirect-blocked';
  message: string;
  status?: number;
}

// Pick the IP family we'll connect to. Prefer IPv4 when available — the
// rest of the codebase + Vercel function dual-stack defaults to IPv4
// first. Returns null if no candidate is suitable.
function pickAddress(addresses: LookupAddress[]): LookupAddress | null {
  const v4 = addresses.find((a) => a.family === 4);
  if (v4) return v4;
  return addresses[0] ?? null;
}

// Fetches a URL with full SSRF protection + size cap + timeout. Returns
// the body bytes on success or a structured error on failure. Redirects
// are NOT followed automatically — each redirect would need its own SSRF
// validation; for the image-fetch use case we just reject 3xx outright.
//
// Implementation notes:
//   - We use Node's built-in https/http modules directly (no `fetch`,
//     no `undici`) so we can override the connect target without losing
//     the Host header / TLS SNI handshake for vhosted servers.
//   - We resolve once via `resolveAndValidate`, then connect to the
//     resulting IP (`options.host = <ip>` + `options.headers.host =
//     <hostname>` + `options.servername = <hostname>`). The DNS-rebind
//     attack window is eliminated entirely — the IP we validate is the
//     IP we talk to.
//   - We treat the request timeout as a hard ceiling on the whole
//     operation (connect + headers + body), via socket.setTimeout +
//     a wall-clock setTimeout that destroys the request.
export async function safeFetch(
  rawUrl: string,
  opts: SafeFetchOptions = {}
): Promise<SafeFetchResult | SafeFetchError> {
  const timeoutMs = opts.timeoutMs ?? 10_000;
  const maxBytes = opts.maxBytes ?? 5 * 1024 * 1024;

  const preCheck = validateUrlPreResolve(rawUrl);
  if (!preCheck.allowed) {
    return {
      ok: false,
      reason: preCheck.reason,
      message: `URL failed pre-resolve safety check (${preCheck.reason})`,
    };
  }
  const { parsedUrl } = preCheck;

  // Resolve hostname (if the host is already a literal IP, dns.lookup
  // returns it as-is, so this is safe in both literal-IP and DNS paths).
  const preResolve = await resolveAndValidate(parsedUrl.hostname, opts.lookupFn);
  if (!preResolve.allowed) {
    return {
      ok: false,
      reason: preResolve.reason,
      message: `Host ${parsedUrl.hostname} resolves to a blocked address (${preResolve.reason})`,
    };
  }

  const target = pickAddress(preResolve.addresses);
  if (!target) {
    return {
      ok: false,
      reason: 'invalid-address',
      message: `No usable IP address for ${parsedUrl.hostname}`,
    };
  }

  // Re-classify the target once more before connecting (defense in
  // depth — pickAddress should already only return validated IPs).
  const targetCheck = classifyAddress(target.address);
  if (!targetCheck.allowed) {
    return {
      ok: false,
      reason: targetCheck.reason,
      message: `Picked address ${target.address} failed re-validation (${targetCheck.reason})`,
    };
  }

  const port = parsedUrl.port
    ? Number(parsedUrl.port)
    : parsedUrl.protocol === 'https:'
      ? 443
      : 80;

  const headers: Record<string, string> = {
    // For vhosted servers — without this they'd see the bare IP and
    // serve the wrong host's content (or 400). Use the original
    // hostname:port.
    host: parsedUrl.host,
    'user-agent': 'PLOS-CompetitionScraping/1.0 (+image-fetch-by-url)',
    accept: 'image/jpeg, image/png, image/webp',
    ...(opts.headers ?? {}),
  };

  // Bracket IPv6 host for the request options' `host` field. Some Node
  // versions accept the bare form; bracketing is the safe form.
  const connectHost = target.family === 6 ? `[${target.address}]` : target.address;

  return await new Promise<SafeFetchResult | SafeFetchError>((resolveFn) => {
    let settled = false;
    const settle = (result: SafeFetchResult | SafeFetchError) => {
      if (settled) return;
      settled = true;
      resolveFn(result);
    };

    const wallTimeout = setTimeout(() => {
      try {
        req.destroy();
      } catch {
        // ignore
      }
      settle({
        ok: false,
        reason: 'timeout',
        message: `Fetch exceeded the ${timeoutMs}ms timeout`,
      });
    }, timeoutMs);

    const requestModule = parsedUrl.protocol === 'https:' ? https : http;

    const onResponse = (res: IncomingMessage) => {
      const status = res.statusCode ?? 0;
      if (status >= 300 && status < 400) {
        try {
          res.resume();
        } catch {
          // ignore
        }
        settle({
          ok: false,
          reason: 'redirect-blocked',
          message: `Refusing to follow redirect (HTTP ${status}). Provide the final image URL directly.`,
          status,
        });
        return;
      }
      if (status < 200 || status >= 300) {
        try {
          res.resume();
        } catch {
          // ignore
        }
        settle({
          ok: false,
          reason: 'http-error',
          message: `Upstream returned HTTP ${status}`,
          status,
        });
        return;
      }

      const contentTypeHeader = res.headers['content-type'];
      const contentType = Array.isArray(contentTypeHeader)
        ? contentTypeHeader[0]
        : contentTypeHeader ?? null;

      const chunks: Buffer[] = [];
      let total = 0;
      let aborted = false;

      res.on('data', (chunk: Buffer) => {
        if (aborted) return;
        total += chunk.byteLength;
        if (total > maxBytes) {
          aborted = true;
          try {
            res.destroy();
            req.destroy();
          } catch {
            // ignore
          }
          settle({
            ok: false,
            reason: 'body-too-large',
            message: `Image exceeds the ${maxBytes} byte cap`,
          });
          return;
        }
        chunks.push(chunk);
      });
      res.on('end', () => {
        if (aborted) return;
        const buf = Buffer.concat(chunks, total);
        const bytes = new Uint8Array(buf.byteLength);
        bytes.set(buf);
        settle({
          ok: true,
          status,
          contentType,
          bytes,
          finalUrl: parsedUrl.toString(),
        });
      });
      res.on('error', (err) => {
        if (aborted) return;
        settle({
          ok: false,
          reason: 'network-error',
          message: err.message,
        });
      });
    };

    // Connect by IP (target.address). servername / SNI is the original
    // hostname so TLS handshake succeeds against vhosted certs. host
    // header (set above) covers the Host: header for HTTP-level vhost
    // routing.
    const req = requestModule.request(
      {
        host: connectHost,
        port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers,
        // For https.request — SNI server_name.
        servername: parsedUrl.hostname,
        // Disable Node's own DNS resolution for the connect host —
        // family matches the picked address's family (so Node doesn't
        // try resolving an IP literal as a hostname).
        family: target.family,
        // Pin lookup to a stub that returns the validated IP. This
        // closes the rebind window for any code path that still tries
        // to resolve.
        lookup: ((
          _hostname: string,
          _options: LookupAllOptions,
          callback: (err: Error | null, address: string, family: number) => void
        ) => {
          callback(null, target.address, target.family);
        }) as unknown as typeof dnsLookup,
      },
      onResponse
    );

    req.on('error', (err: Error) => {
      clearTimeout(wallTimeout);
      settle({
        ok: false,
        reason: 'network-error',
        message: err.message,
      });
    });
    req.on('close', () => {
      clearTimeout(wallTimeout);
    });

    req.setTimeout(timeoutMs, () => {
      try {
        req.destroy();
      } catch {
        // ignore
      }
      settle({
        ok: false,
        reason: 'timeout',
        message: `Socket inactive for ${timeoutMs}ms`,
      });
    });

    req.end();
  });
}
