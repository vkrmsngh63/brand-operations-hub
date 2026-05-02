/**
 * Run-start pre-flight self-test for the Auto-Analyze pipeline.
 *
 * Why this exists (per `DEFENSE_IN_DEPTH_AUDIT_DESIGN §6`):
 *   A typical Auto-Analyze run on Bursitis costs $70-150 and takes 2-4
 *   hours. The cost of a doomed run is non-trivial: if the prompts
 *   didn't load, or refs are out of sync with the DB, or the API key
 *   is invalid, the run should fail at second 1, not minute 47.
 *
 *   `handleStart` in `AutoAnalyze.tsx` already had three implicit
 *   checks (API key set, seed words present, prompt > 100 chars).
 *   This module promotes them to explicit P1-P3 and adds P4-P10 for
 *   coverage of the failure modes the original three didn't catch:
 *   ref/server drift (P5/P6), pathway-ref consistency (P7), no-op
 *   runs (P8), API key/model dead at run start (P9), and broken
 *   localStorage (P10).
 *
 * Design choices locked in 2026-04-29-c session:
 *   - P9 enabled per director Q3 = Option A: cost ≈ $0.001 per Start
 *     to verify API key + model availability before committing to a
 *     run that would cost $50+.
 *   - All checks are sequenced; the first ✗ aborts the chain. This
 *     gives the user a clear "fix THIS before running" signal rather
 *     than a wall of failures.
 *   - The runner is a pure function that takes a context object and
 *     returns a Promise<PreflightResult>. Network calls go through
 *     an injectable fetcher (`PreflightContext.fetcher`) so tests
 *     can mock the network.
 *
 * What this module does NOT do:
 *   - It does not run the Auto-Analyze pipeline. After the runner
 *     returns `{ passed: true }`, the caller proceeds to runLoop().
 *     If `passed: false`, the caller surfaces the failures and aborts.
 *   - It does not memoize results. Each invocation is fresh — the
 *     state of the world (refs, server, API key) may have changed
 *     since the last call.
 */

export type PreflightStatus = 'pending' | 'pass' | 'fail';

export interface PreflightCheckResult {
  /** Stable identifier — use to render UI rows by id. */
  id: 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | 'P8' | 'P9' | 'P10' | 'P11' | 'P12';
  /** Short label shown in the UI panel ("API key", "Canvas refs match server"). */
  label: string;
  status: PreflightStatus;
  /** Human-readable explanation. On pass, summary stat ("12 words"); on fail, what's wrong. */
  message: string;
}

export interface PreflightResult {
  /** True only if every check returned 'pass'. */
  passed: boolean;
  /** Every check, in P1..P10 order, with its final status + message. */
  checks: PreflightCheckResult[];
  /** Index of the first failed check (-1 if all passed). UI uses this for "stop chain at first ✗". */
  firstFailIndex: number;
}

export interface PreflightContext {
  // ── Static config (read from React state at handleStart time) ─────────
  apiMode: 'direct' | 'server';
  apiKey: string;
  model: string;
  seedWords: string;
  initialPrompt: string;
  primerPrompt: string;
  /**
   * Consolidation prompts + cadence — added 2026-05-02 to close the
   * pre-flight coverage gap surfaced during the HTTP 500 fix verification
   * session. P11 + P12 below validate these. If consolidationCadence === 0
   * (auto-fire disabled) the prompts are not required and P11/P12 pass
   * with an "auto-fire disabled" message.
   */
  consolidationInitialPrompt: string;
  consolidationPrimerPrompt: string;
  consolidationCadence: number;
  projectId: string;
  // ── Live state snapshots (taken at handleStart from *Ref.current) ─────
  nodes: Array<{ stableId: string; pathwayId?: string | null }>;
  keywords: Array<{ id: string }>;
  pathways: Array<{ id: string }>;
  unsortedKeywordCount: number;
  // ── Injectable dependencies (real impls in AutoAnalyze; mocked in tests) ─
  /** Authenticated fetch for same-origin API routes. Returns a Response-like. */
  fetcher: (url: string, init?: RequestInit) => Promise<Response>;
  /** Direct fetch for cross-origin Anthropic call. Defaults to global fetch in browsers. */
  rawFetcher?: (url: string, init?: RequestInit) => Promise<Response>;
  /** localStorage probe — pass `globalThis.localStorage` in browsers, mock in tests. */
  storage: {
    setItem: (k: string, v: string) => void;
    getItem: (k: string) => string | null;
    removeItem: (k: string) => void;
  };
}

/* ── Individual checks ─────────────────────────────────────────────── */

export function checkP1ApiKey(ctx: PreflightContext): PreflightCheckResult {
  // Server proxy mode uses the server's ANTHROPIC_API_KEY env var, not the
  // user-supplied one — apiKey may legitimately be empty in that mode.
  if (ctx.apiMode === 'server') {
    return { id: 'P1', label: 'API key', status: 'pass', message: 'server proxy mode (uses server-side key)' };
  }
  if (!ctx.apiKey || !ctx.apiKey.trim()) {
    return {
      id: 'P1',
      label: 'API key',
      status: 'fail',
      message: 'No Anthropic API key entered. Paste your key in the API Key field.',
    };
  }
  return { id: 'P1', label: 'API key', status: 'pass', message: 'set (' + ctx.apiKey.length + ' chars)' };
}

export function checkP2SeedWords(ctx: PreflightContext): PreflightCheckResult {
  const trimmed = (ctx.seedWords || '').trim();
  if (!trimmed) {
    return {
      id: 'P2',
      label: 'Seed words',
      status: 'fail',
      message: 'No seed words. Enter at least one core niche term in Seed words.',
    };
  }
  // Count words by splitting on whitespace + commas (the field accepts both).
  const words = trimmed.split(/[\s,]+/).filter(Boolean);
  return { id: 'P2', label: 'Seed words', status: 'pass', message: words.length + ' word(s)' };
}

export function checkP3InitialPrompt(ctx: PreflightContext): PreflightCheckResult {
  const len = (ctx.initialPrompt || '').length;
  if (len < 100) {
    return {
      id: 'P3',
      label: 'Initial Prompt',
      status: 'fail',
      message:
        'Initial Prompt is ' +
        len +
        ' chars (need ≥100). Expand the AI Analysis Prompt section and paste your prompt.',
    };
  }
  return { id: 'P3', label: 'Initial Prompt', status: 'pass', message: len.toLocaleString() + ' chars' };
}

export function checkP4PrimerPrompt(ctx: PreflightContext): PreflightCheckResult {
  // Primer is OPTIONAL per the existing UI. Treat absent as pass-with-info,
  // present-but-trivial as fail (catches a half-paste), present-and-substantial
  // as pass.
  const trimmed = (ctx.primerPrompt || '').trim();
  if (trimmed.length === 0) {
    return { id: 'P4', label: 'Primer Prompt', status: 'pass', message: 'not used (optional)' };
  }
  if (trimmed.length < 30) {
    return {
      id: 'P4',
      label: 'Primer Prompt',
      status: 'fail',
      message:
        'Primer Prompt is only ' +
        trimmed.length +
        ' chars — looks like a partial paste. Either fill it in fully or clear it (it is optional).',
    };
  }
  return { id: 'P4', label: 'Primer Prompt', status: 'pass', message: trimmed.length.toLocaleString() + ' chars' };
}

export function checkP11ConsolidationInitialPrompt(ctx: PreflightContext): PreflightCheckResult {
  // When auto-fire is disabled (cadence === 0), the consolidation prompts
  // are not required — admin "Consolidate Now" still works regardless,
  // and the runtime gate at AutoAnalyze.tsx blocks the admin path with
  // a separate alert if needed. So pre-flight passes here.
  if (ctx.consolidationCadence === 0) {
    return {
      id: 'P11',
      label: 'Consolidation Initial Prompt',
      status: 'pass',
      message: 'auto-fire disabled (cadence=0)',
    };
  }
  // With auto-fire enabled, the runtime checks length >= 100 at trip time
  // (AutoAnalyze.tsx:1474). Match that threshold here so the gate is
  // enforced at run-start instead of one batch later.
  const len = (ctx.consolidationInitialPrompt || '').length;
  if (len < 100) {
    return {
      id: 'P11',
      label: 'Consolidation Initial Prompt',
      status: 'fail',
      message:
        'Consolidation Initial Prompt is ' +
        len +
        ' chars (need ≥100). With Consolidation Cadence = ' +
        ctx.consolidationCadence +
        ' (>0), auto-fire is enabled and the consolidation slot must be filled. Paste the prompt or set Consolidation Cadence to 0 to disable auto-fire.',
    };
  }
  return {
    id: 'P11',
    label: 'Consolidation Initial Prompt',
    status: 'pass',
    message: len.toLocaleString() + ' chars (auto-fire cadence=' + ctx.consolidationCadence + ')',
  };
}

export function checkP12ConsolidationPrimerPrompt(ctx: PreflightContext): PreflightCheckResult {
  // Same auto-fire gate as P11 — disabled means not required.
  if (ctx.consolidationCadence === 0) {
    return {
      id: 'P12',
      label: 'Consolidation Primer Prompt',
      status: 'pass',
      message: 'auto-fire disabled (cadence=0)',
    };
  }
  // Auto-fire enabled → mirror P4's logic: empty is allowed (primer is
  // optional), but a partial-paste (1-29 chars) is a fail catching the
  // common half-paste mistake.
  const trimmed = (ctx.consolidationPrimerPrompt || '').trim();
  if (trimmed.length === 0) {
    return { id: 'P12', label: 'Consolidation Primer Prompt', status: 'pass', message: 'not used (optional)' };
  }
  if (trimmed.length < 30) {
    return {
      id: 'P12',
      label: 'Consolidation Primer Prompt',
      status: 'fail',
      message:
        'Consolidation Primer Prompt is only ' +
        trimmed.length +
        ' chars — looks like a partial paste. Either fill it in fully or clear it (it is optional).',
    };
  }
  return {
    id: 'P12',
    label: 'Consolidation Primer Prompt',
    status: 'pass',
    message: trimmed.length.toLocaleString() + ' chars',
  };
}

export async function checkP5NodesRefMatchesServer(ctx: PreflightContext): Promise<PreflightCheckResult> {
  try {
    const res = await ctx.fetcher('/api/projects/' + ctx.projectId + '/canvas/nodes');
    if (!res.ok) {
      return {
        id: 'P5',
        label: 'Canvas refs match server',
        status: 'fail',
        message: 'Server returned HTTP ' + res.status + ' fetching /canvas/nodes — try again.',
      };
    }
    const fresh = (await res.json()) as Array<{ stableId: string }>;
    if (!Array.isArray(fresh)) {
      return {
        id: 'P5',
        label: 'Canvas refs match server',
        status: 'fail',
        message: 'Server returned non-array body for /canvas/nodes (got ' + typeof fresh + ').',
      };
    }
    if (fresh.length !== ctx.nodes.length) {
      return {
        id: 'P5',
        label: 'Canvas refs match server',
        status: 'fail',
        message:
          'Local canvas has ' +
          ctx.nodes.length +
          ' nodes but server has ' +
          fresh.length +
          '. Close + reopen Auto-Analyze (or refresh the page) to resync.',
      };
    }
    // Sample IDs for a deeper-than-count check — first 5 stableIds in
    // sort order.
    const localIds = ctx.nodes
      .map((n) => n.stableId)
      .sort()
      .slice(0, 5);
    const serverIds = fresh
      .map((n) => n.stableId)
      .sort()
      .slice(0, 5);
    for (let i = 0; i < localIds.length; i++) {
      if (localIds[i] !== serverIds[i]) {
        return {
          id: 'P5',
          label: 'Canvas refs match server',
          status: 'fail',
          message:
            'Counts match (' +
            ctx.nodes.length +
            ') but stableIds differ — sample mismatch at position ' +
            i +
            ' (local=' +
            localIds[i] +
            ', server=' +
            serverIds[i] +
            '). Refresh the page to resync.',
        };
      }
    }
    return {
      id: 'P5',
      label: 'Canvas refs match server',
      status: 'pass',
      message: ctx.nodes.length + ' nodes (sample IDs match)',
    };
  } catch (e) {
    return {
      id: 'P5',
      label: 'Canvas refs match server',
      status: 'fail',
      message: 'Network error fetching /canvas/nodes: ' + (e instanceof Error ? e.message : String(e)),
    };
  }
}

export async function checkP6KeywordsRefMatchesServer(ctx: PreflightContext): Promise<PreflightCheckResult> {
  try {
    const res = await ctx.fetcher('/api/projects/' + ctx.projectId + '/keywords');
    if (!res.ok) {
      return {
        id: 'P6',
        label: 'Keyword refs match server',
        status: 'fail',
        message: 'Server returned HTTP ' + res.status + ' fetching /keywords — try again.',
      };
    }
    const fresh = (await res.json()) as Array<{ id: string }>;
    if (!Array.isArray(fresh)) {
      return {
        id: 'P6',
        label: 'Keyword refs match server',
        status: 'fail',
        message: 'Server returned non-array body for /keywords (got ' + typeof fresh + ').',
      };
    }
    if (fresh.length !== ctx.keywords.length) {
      return {
        id: 'P6',
        label: 'Keyword refs match server',
        status: 'fail',
        message:
          'Local has ' +
          ctx.keywords.length +
          ' keywords but server has ' +
          fresh.length +
          '. Refresh the page to resync.',
      };
    }
    // Sample 5 IDs in sort order, like P5.
    const localIds = ctx.keywords
      .map((k) => k.id)
      .sort()
      .slice(0, 5);
    const serverIds = fresh
      .map((k) => k.id)
      .sort()
      .slice(0, 5);
    for (let i = 0; i < localIds.length; i++) {
      if (localIds[i] !== serverIds[i]) {
        return {
          id: 'P6',
          label: 'Keyword refs match server',
          status: 'fail',
          message:
            'Counts match (' +
            ctx.keywords.length +
            ') but IDs differ — sample mismatch at position ' +
            i +
            '. Refresh the page to resync.',
        };
      }
    }
    return {
      id: 'P6',
      label: 'Keyword refs match server',
      status: 'pass',
      message: ctx.keywords.length + ' keywords (sample IDs match)',
    };
  } catch (e) {
    return {
      id: 'P6',
      label: 'Keyword refs match server',
      status: 'fail',
      message: 'Network error fetching /keywords: ' + (e instanceof Error ? e.message : String(e)),
    };
  }
}

export function checkP7PathwayConsistency(ctx: PreflightContext): PreflightCheckResult {
  // Collect distinct non-null pathway IDs referenced by nodes.
  const referenced = new Set<string>();
  for (const n of ctx.nodes) {
    if (n.pathwayId) referenced.add(n.pathwayId);
  }
  if (referenced.size > 0 && ctx.pathways.length === 0) {
    return {
      id: 'P7',
      label: 'Pathway refs',
      status: 'fail',
      message:
        'Canvas references ' +
        referenced.size +
        ' pathway(s) but pathwaysRef is empty. Refresh the page so pathways load.',
    };
  }
  return {
    id: 'P7',
    label: 'Pathway refs',
    status: 'pass',
    message: referenced.size + ' referenced, ' + ctx.pathways.length + ' loaded',
  };
}

export function checkP8KeywordScope(ctx: PreflightContext): PreflightCheckResult {
  if (ctx.unsortedKeywordCount <= 0) {
    return {
      id: 'P8',
      label: 'Keyword scope',
      status: 'fail',
      message: 'No keywords match the selected scope. Change Scope or add Unsorted keywords first.',
    };
  }
  return { id: 'P8', label: 'Keyword scope', status: 'pass', message: ctx.unsortedKeywordCount + ' in scope' };
}

export async function checkP9TestApiCall(ctx: PreflightContext): Promise<PreflightCheckResult> {
  // Cheapest possible probe: 10 max_tokens, no thinking, trivial prompt.
  // Cost ≈ $0.0001 per Start. Per design Q3 = Option A.
  const requestBody = {
    model: ctx.model,
    max_tokens: 10,
    messages: [{ role: 'user', content: 'Reply with the single word OK.' }],
    stream: false,
  };

  const isDirect = ctx.apiMode === 'direct';
  const url = isDirect ? 'https://api.anthropic.com/v1/messages' : '/api/ai/analyze';
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (isDirect) {
    headers['x-api-key'] = ctx.apiKey;
    headers['anthropic-version'] = '2023-06-01';
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
  }

  // Direct mode goes raw fetch (cross-origin, no Supabase JWT needed); server
  // proxy goes authenticated.
  const fetchFn = isDirect ? ctx.rawFetcher ?? globalThis.fetch.bind(globalThis) : ctx.fetcher;

  try {
    const res = await fetchFn(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });
    if (!res.ok) {
      let detail = 'HTTP ' + res.status;
      try {
        const text = await res.text();
        if (text) {
          try {
            const j = JSON.parse(text);
            detail += ': ' + (j.error?.message || text.slice(0, 200));
          } catch {
            detail += ': ' + text.slice(0, 200);
          }
        }
      } catch {
        /* response body unreadable */
      }
      return {
        id: 'P9',
        label: 'Test API call',
        status: 'fail',
        message: detail,
      };
    }
    return { id: 'P9', label: 'Test API call', status: 'pass', message: 'OK (~$0.001)' };
  } catch (e) {
    return {
      id: 'P9',
      label: 'Test API call',
      status: 'fail',
      message: 'Network error: ' + (e instanceof Error ? e.message : String(e)),
    };
  }
}

export function checkP10LocalStorage(ctx: PreflightContext): PreflightCheckResult {
  // Probe write+read+delete. Catches: privacy mode, quota exceeded,
  // localStorage entirely disabled. Settings persistence + checkpoint
  // resume both depend on this; better to fail loudly at start than
  // silently mid-run.
  const probeKey = '__aa_preflight_probe__';
  const probeValue = 'p' + Date.now();
  try {
    ctx.storage.setItem(probeKey, probeValue);
    const read = ctx.storage.getItem(probeKey);
    ctx.storage.removeItem(probeKey);
    if (read !== probeValue) {
      return {
        id: 'P10',
        label: 'localStorage',
        status: 'fail',
        message: 'Write succeeded but read returned a different value (got ' + JSON.stringify(read) + ').',
      };
    }
    return { id: 'P10', label: 'localStorage', status: 'pass', message: 'writable' };
  } catch (e) {
    return {
      id: 'P10',
      label: 'localStorage',
      status: 'fail',
      message:
        'localStorage unavailable: ' +
        (e instanceof Error ? e.message : String(e)) +
        '. Disable Private Browsing or grant storage permission.',
    };
  }
}

/* ── Runner ────────────────────────────────────────────────────────── */

/**
 * Runs P1..P10 sequentially. Stops at the first failure (subsequent checks
 * are not executed and not included in `checks`). Returns a summary.
 *
 * Sequencing rationale: P1-P4 are local config checks (instant); P5-P7 hit
 * server endpoints; P8 is local; P9 is the API call; P10 is local. Order
 * matches design §6.2 — fast/local checks first so a misconfigured run
 * fails before we spend a network round-trip.
 */
export async function runPreflight(ctx: PreflightContext): Promise<PreflightResult> {
  const checks: PreflightCheckResult[] = [];
  let firstFailIndex = -1;

  const sequence: Array<() => Promise<PreflightCheckResult> | PreflightCheckResult> = [
    () => checkP1ApiKey(ctx),
    () => checkP2SeedWords(ctx),
    () => checkP3InitialPrompt(ctx),
    () => checkP4PrimerPrompt(ctx),
    // P11 + P12 inserted here (NOT renumbered — stable ids preserved per
    // 2026-05-02 director directive) so the four prompt slots' checks
    // appear adjacent in the UI list.
    () => checkP11ConsolidationInitialPrompt(ctx),
    () => checkP12ConsolidationPrimerPrompt(ctx),
    () => checkP5NodesRefMatchesServer(ctx),
    () => checkP6KeywordsRefMatchesServer(ctx),
    () => checkP7PathwayConsistency(ctx),
    () => checkP8KeywordScope(ctx),
    () => checkP9TestApiCall(ctx),
    () => checkP10LocalStorage(ctx),
  ];

  for (let i = 0; i < sequence.length; i++) {
    const result = await sequence[i]();
    checks.push(result);
    if (result.status === 'fail') {
      firstFailIndex = i;
      break;
    }
  }

  return {
    passed: firstFailIndex === -1,
    checks,
    firstFailIndex,
  };
}
