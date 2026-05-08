// Typed message protocol between background service worker and content
// scripts.
//
// TWO directions:
//   - Background → Content (one-way push): ContentScriptMessage. Today only
//     `open-url-add-form`, fired when the user invokes the right-click
//     context-menu fallback per §5 guardrail #6. Carries the right-clicked
//     link's URL.
//   - Content → Background (request/response): BackgroundRequest +
//     BackgroundResponse envelope. Added 2026-05-08-c — content scripts
//     cannot reach vklf.com directly because their fetch originates from
//     the host page's origin (amazon.com / ebay.com / etc.), which is NOT
//     in vklf.com's CORS allowlist (chrome-extension://* only). The
//     background runs in the extension origin, so its fetch passes the
//     preflight. Content scripts route their PLOS API calls through this
//     proxy. See docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md
//     Waypoint #1 attempt #3 row for the discovery context.

import type {
  CompetitorUrl,
  CreateCompetitorUrlRequest,
  ListCompetitorUrlsResponse,
  Platform,
} from '../../../../../src/lib/shared-types/competition-scraping.ts';
import type { ExtensionProject } from '../api-client.ts';

// ─── Background → Content (one-way push) ─────────────────────────────────

export interface OpenUrlAddFormMessage {
  kind: 'open-url-add-form';
  href: string;
}

export type ContentScriptMessage = OpenUrlAddFormMessage;

export function isContentScriptMessage(
  value: unknown,
): value is ContentScriptMessage {
  if (typeof value !== 'object' || value === null) return false;
  const msg = value as { kind?: unknown; href?: unknown };
  if (msg.kind === 'open-url-add-form') {
    return typeof msg.href === 'string';
  }
  return false;
}

// ─── Content → Background (request/response) ─────────────────────────────

export interface ListProjectsRequest {
  kind: 'list-projects';
}

export interface ListCompetitorUrlsRequest {
  kind: 'list-competitor-urls';
  projectId: string;
  platform: Platform | null;
}

export interface CreateCompetitorUrlRequestMessage {
  kind: 'create-competitor-url';
  projectId: string;
  body: CreateCompetitorUrlRequest;
}

export type BackgroundRequest =
  | ListProjectsRequest
  | ListCompetitorUrlsRequest
  | CreateCompetitorUrlRequestMessage;

// Response envelope. Encodes both success + structured error so the
// content-script wrapper can re-throw PlosApiError with the right status
// and message — preserving the existing api-client.ts error contract that
// callers (notably url-add-form's setError) already handle.
export type BackgroundResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { status: number; message: string } };

export type ListProjectsResponseEnvelope = BackgroundResponse<
  ExtensionProject[]
>;
export type ListCompetitorUrlsResponseEnvelope = BackgroundResponse<
  ListCompetitorUrlsResponse
>;
export type CreateCompetitorUrlResponseEnvelope = BackgroundResponse<
  CompetitorUrl
>;

export function isBackgroundRequest(
  value: unknown,
): value is BackgroundRequest {
  if (typeof value !== 'object' || value === null) return false;
  const msg = value as {
    kind?: unknown;
    projectId?: unknown;
    body?: unknown;
  };
  if (msg.kind === 'list-projects') return true;
  if (msg.kind === 'list-competitor-urls') {
    return typeof msg.projectId === 'string';
  }
  if (msg.kind === 'create-competitor-url') {
    return (
      typeof msg.projectId === 'string' &&
      typeof msg.body === 'object' &&
      msg.body !== null
    );
  }
  return false;
}
