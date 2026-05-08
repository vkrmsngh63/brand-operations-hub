// Tests for api-bridge.ts — the content-script → background messaging
// proxy that works around vklf.com's CORS allowlist (chrome-extension://*
// only). Content scripts run in the host page's origin and would fail
// preflight; the bridge sends typed messages to the background which
// performs the actual fetch from the extension origin.
//
// We mock globalThis.chrome.runtime.sendMessage with an injectable spy so
// the tests can verify the request shape and exercise success / error /
// network-error / malformed-response paths without touching real Chrome
// APIs.

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  PlosApiError,
  createCompetitorUrl,
  listCompetitorUrls,
  listProjects,
} from './api-bridge.ts';
import type { BackgroundResponse } from './messaging.ts';

type SendMessageFn = (msg: unknown) => Promise<unknown>;

// Tiny chrome.runtime mock. Each test installs its own sendMessage spy
// via setSendMessage(), then asserts the captured request and the
// returned/thrown value from the wrapper.
let lastRequest: unknown = undefined;
let nextResponse: unknown = undefined;
let nextThrows: Error | null = null;

function setSendMessage(_fn: SendMessageFn): void {
  // (kept as a hook for future tests that want to install a richer spy;
  // the default mock below already covers the cases we use.)
  void _fn;
}
void setSendMessage;

const fakeSendMessage: SendMessageFn = async (msg) => {
  lastRequest = msg;
  if (nextThrows !== null) throw nextThrows;
  return nextResponse;
};

beforeEach(() => {
  lastRequest = undefined;
  nextResponse = undefined;
  nextThrows = null;
  (globalThis as unknown as { chrome: unknown }).chrome = {
    runtime: { sendMessage: fakeSendMessage },
  };
});

afterEach(() => {
  delete (globalThis as unknown as { chrome?: unknown }).chrome;
});

// ─── listProjects ────────────────────────────────────────────────────────

describe('listProjects', () => {
  it('sends a list-projects message and returns the data envelope', async () => {
    const projects = [
      {
        id: 'p1',
        name: 'Bursitis Test',
        description: null,
        lastActivityAt: '2026-05-08T00:00:00.000Z',
      },
    ];
    nextResponse = { ok: true, data: projects } satisfies BackgroundResponse<
      typeof projects
    >;
    const result = await listProjects();
    assert.deepEqual(lastRequest, { kind: 'list-projects' });
    assert.deepEqual(result, projects);
  });

  it('throws PlosApiError when the envelope reports failure', async () => {
    nextResponse = {
      ok: false,
      error: { status: 401, message: 'Invalid or expired token' },
    } satisfies BackgroundResponse<never>;
    await assert.rejects(
      listProjects(),
      (err: unknown) => {
        assert.ok(err instanceof PlosApiError);
        assert.equal((err as PlosApiError).status, 401);
        assert.match((err as PlosApiError).message, /Invalid or expired/);
        return true;
      },
    );
  });

  it('throws PlosApiError(0, ...) when sendMessage rejects', async () => {
    nextThrows = new Error('No receiving end');
    await assert.rejects(
      listProjects(),
      (err: unknown) => {
        assert.ok(err instanceof PlosApiError);
        assert.equal((err as PlosApiError).status, 0);
        assert.match((err as PlosApiError).message, /background unavailable/i);
        return true;
      },
    );
  });

  it('throws PlosApiError(0, ...) when the envelope is malformed', async () => {
    nextResponse = 'not-an-envelope';
    await assert.rejects(
      listProjects(),
      (err: unknown) => {
        assert.ok(err instanceof PlosApiError);
        assert.equal((err as PlosApiError).status, 0);
        assert.match((err as PlosApiError).message, /malformed/i);
        return true;
      },
    );
  });

  it('throws PlosApiError(0, ...) when the envelope is null', async () => {
    nextResponse = null;
    await assert.rejects(listProjects(), PlosApiError);
  });
});

// ─── listCompetitorUrls ──────────────────────────────────────────────────

describe('listCompetitorUrls', () => {
  it('passes projectId + platform in the request', async () => {
    nextResponse = { ok: true, data: [] };
    await listCompetitorUrls('proj-abc', 'amazon');
    assert.deepEqual(lastRequest, {
      kind: 'list-competitor-urls',
      projectId: 'proj-abc',
      platform: 'amazon',
    });
  });

  it('passes platform=null when omitting the filter', async () => {
    nextResponse = { ok: true, data: [] };
    await listCompetitorUrls('proj-xyz', null);
    assert.deepEqual(lastRequest, {
      kind: 'list-competitor-urls',
      projectId: 'proj-xyz',
      platform: null,
    });
  });

  it('returns the data array on success', async () => {
    const rows = [
      {
        id: 'u1',
        url: 'https://www.amazon.com/dp/B07XJ8C8F5',
        platform: 'amazon',
      },
    ];
    nextResponse = { ok: true, data: rows };
    const result = await listCompetitorUrls('proj-1', 'amazon');
    assert.deepEqual(result, rows);
  });

  it('surfaces a 500 envelope error as PlosApiError', async () => {
    nextResponse = {
      ok: false,
      error: { status: 500, message: 'Failed to fetch competitor URLs' },
    };
    await assert.rejects(
      listCompetitorUrls('proj-1', 'amazon'),
      (err: unknown) => {
        assert.ok(err instanceof PlosApiError);
        assert.equal((err as PlosApiError).status, 500);
        return true;
      },
    );
  });
});

// ─── createCompetitorUrl ─────────────────────────────────────────────────

describe('createCompetitorUrl', () => {
  it('passes projectId + body in the request', async () => {
    nextResponse = {
      ok: true,
      data: {
        id: 'new-1',
        url: 'https://www.amazon.com/dp/X',
        platform: 'amazon',
      },
    };
    await createCompetitorUrl('proj-7', {
      platform: 'amazon',
      url: 'https://www.amazon.com/dp/X',
      productName: 'Thing',
    });
    assert.deepEqual(lastRequest, {
      kind: 'create-competitor-url',
      projectId: 'proj-7',
      body: {
        platform: 'amazon',
        url: 'https://www.amazon.com/dp/X',
        productName: 'Thing',
      },
    });
  });

  it('returns the row on success', async () => {
    const row = {
      id: 'u-99',
      url: 'https://www.ebay.com/itm/12345',
      platform: 'ebay',
    };
    nextResponse = { ok: true, data: row };
    const result = await createCompetitorUrl('proj-7', {
      platform: 'ebay',
      url: 'https://www.ebay.com/itm/12345',
    });
    assert.deepEqual(result, row);
  });

  it('throws PlosApiError on non-2xx envelope', async () => {
    nextResponse = {
      ok: false,
      error: { status: 400, message: 'platform is required' },
    };
    await assert.rejects(
      createCompetitorUrl('proj-7', {
        platform: 'amazon' as never,
        url: '',
      }),
      (err: unknown) => {
        assert.ok(err instanceof PlosApiError);
        assert.equal((err as PlosApiError).status, 400);
        assert.match((err as PlosApiError).message, /platform is required/);
        return true;
      },
    );
  });

  it('preserves the error message verbatim from the envelope', async () => {
    nextResponse = {
      ok: false,
      error: { status: 401, message: 'Not signed in' },
    };
    await assert.rejects(
      createCompetitorUrl('proj-x', {
        platform: 'amazon',
        url: 'https://www.amazon.com/dp/Y',
      }),
      (err: unknown) =>
        err instanceof PlosApiError && err.message === 'Not signed in',
    );
  });
});
