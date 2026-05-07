// Platform module registry.
//
// Maps the popup's selectedPlatform value (and the current page's hostname)
// to the right per-platform DOM-pattern module. The orchestrator
// (entrypoints/content.ts) uses this to:
//
//   1. Decide whether to run on the current page (does the page's hostname
//      match any module's `hostnames` AND match the popup's selectedPlatform?).
//   2. Look up the module's `matchesProduct` + `canonicalProductUrl` for
//      every anchor in the page DOM.
//
// Today's surface: 4 platforms (amazon, ebay, etsy, walmart). Adding more
// platforms (google-shopping, google-ads, independent-website per
// STACK_DECISIONS §5) is purely additive — append the new module here.

import type { PlatformModule } from './types.ts';
import { amazon } from './amazon.ts';
import { ebay } from './ebay.ts';
import { etsy } from './etsy.ts';
import { walmart } from './walmart.ts';

export const PLATFORM_MODULES: readonly PlatformModule[] = [
  amazon,
  ebay,
  etsy,
  walmart,
] as const;

/**
 * Returns the module for the popup's selectedPlatform value, or null when
 * no module covers that platform value (e.g. user picked `google-shopping`
 * which is deferred to a future build session).
 */
export function getModuleByPlatform(
  platformValue: string | null | undefined,
): PlatformModule | null {
  if (typeof platformValue !== 'string' || platformValue.length === 0) {
    return null;
  }
  return (
    PLATFORM_MODULES.find((m) => m.platform === platformValue) ?? null
  );
}

/**
 * Returns the module whose `hostnames` cover the given hostname (suffix
 * match — e.g. `www.amazon.com` matches `amazon.com`). Returns null when
 * the hostname doesn't belong to any registered platform.
 */
export function getModuleByHostname(
  hostname: string | null | undefined,
): PlatformModule | null {
  if (typeof hostname !== 'string' || hostname.length === 0) return null;
  const lower = hostname.toLowerCase();
  return (
    PLATFORM_MODULES.find((m) =>
      m.hostnames.some((h) => lower === h || lower.endsWith(`.${h}`)),
    ) ?? null
  );
}
