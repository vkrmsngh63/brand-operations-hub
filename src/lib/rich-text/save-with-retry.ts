// W#2 P-49 Workstream 5 Fix Session D FF1 (2026-05-29) — shared autosave
// retry helper for the rich-text analysis boxes (PerItemAnalysisBox +
// OverallAnalysisBox).
//
// Why: those boxes PATCH on every (debounced) edit. Each request runs
// through verifyProjectWorkflowAuth, which does a projectWorkflow.upsert —
// a DB write. During/after a heavy AI summarization run the Supabase
// connection pool transiently saturates, so the upsert occasionally fails
// and the route returns HTTP 500 "Failed to resolve project workflow". The
// box then showed "Save failed — Type more to retry" and only recovered on
// a page refresh. Director report 2026-05-29: "Simply doing a page refresh
// fixes the issue. Please fix the issue so that this doesn't happen again."
//
// Fix: transparently retry the save a few times with exponential backoff on
// TRANSIENT failures (network errors + HTTP 5xx) before surfacing an error.
// 4xx (genuine client/validation errors) are NOT retried — they won't fix
// themselves. A generation-cancel hook lets a newer keystroke supersede an
// in-flight retry loop so we never resurrect stale content.

// Minimal Response shape the helper needs — the real fetch Response (and
// authFetch's return) satisfies it.
export interface SaveResponseLike {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export interface SaveOutcome {
  ok: boolean;
  // HTTP status of the final attempt, or null when the final attempt was a
  // network-level throw (no response).
  status: number | null;
  // Human-readable failure detail (the route's { error } string when present,
  // else "HTTP <status>" / the network error message). null on success.
  detail: string | null;
  // Total attempts actually made (1 = succeeded/failed first try).
  attempts: number;
  // True when a newer save superseded this one mid-flight (caller ignores).
  cancelled: boolean;
}

// 5xx = server/infra trouble (incl. the transient DB-auth 500). Retriable.
// 4xx = client/validation error → retrying won't help.
export function isRetriableStatus(status: number): boolean {
  return status >= 500 && status <= 599;
}

// Exponential backoff: 500ms, 1000ms, 2000ms, … keyed by 0-based retry index.
export function computeRetryDelayMs(retryIndex: number, baseMs = 500): number {
  return baseMs * 2 ** retryIndex;
}

async function readErrorDetail(res: SaveResponseLike): Promise<string> {
  let detail = `HTTP ${res.status}`;
  try {
    const body = (await res.json()) as { error?: unknown };
    if (body && typeof body.error === 'string' && body.error) {
      detail = body.error;
    }
  } catch {
    // Non-JSON body — keep the generic HTTP detail.
  }
  return detail;
}

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Run a save with transparent retry on transient failures. `doFetch`
// performs one PATCH attempt; it is called once per attempt. `isCancelled`
// (optional) is checked before each attempt + before each backoff sleep so a
// newer edit aborts the loop. `sleep` + `baseDelayMs` + `maxAttempts` are
// injectable for tests.
export async function saveWithRetry(params: {
  doFetch: () => Promise<SaveResponseLike>;
  maxAttempts?: number;
  baseDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
  isCancelled?: () => boolean;
}): Promise<SaveOutcome> {
  const {
    doFetch,
    maxAttempts = 4,
    baseDelayMs = 500,
    sleep = defaultSleep,
    isCancelled,
  } = params;

  let lastStatus: number | null = null;
  let lastDetail: string | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (isCancelled?.()) {
      return { ok: false, status: lastStatus, detail: lastDetail, attempts: attempt, cancelled: true };
    }

    try {
      const res = await doFetch();
      if (res.ok) {
        return { ok: true, status: res.status, detail: null, attempts: attempt + 1, cancelled: false };
      }
      lastStatus = res.status;
      lastDetail = await readErrorDetail(res);
      if (!isRetriableStatus(res.status)) {
        // Genuine client error — surface immediately, no retry.
        return { ok: false, status: res.status, detail: lastDetail, attempts: attempt + 1, cancelled: false };
      }
    } catch (err) {
      // Network-level failure (fetch threw) — transient, retriable.
      lastStatus = null;
      lastDetail = err instanceof Error ? err.message : 'Network error';
    }

    // Transient failure. Back off before the next attempt unless this was
    // the last one (or a newer save superseded us mid-wait).
    if (attempt < maxAttempts - 1) {
      if (isCancelled?.()) {
        return { ok: false, status: lastStatus, detail: lastDetail, attempts: attempt + 1, cancelled: true };
      }
      await sleep(computeRetryDelayMs(attempt, baseDelayMs));
    }
  }

  return { ok: false, status: lastStatus, detail: lastDetail, attempts: maxAttempts, cancelled: false };
}
