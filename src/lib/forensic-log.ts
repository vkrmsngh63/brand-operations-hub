/**
 * Forensic NDJSON ring buffer for the Auto-Analyze pipeline.
 *
 * Why this exists (per `DEFENSE_IN_DEPTH_AUDIT_DESIGN §4`):
 *   The 2026-04-28 canvas-blanking bug fired at batches 70 and 134. The
 *   diagnostic data — canvas node counts before vs. after each batch's
 *   apply, token counts, reconciliation flips — had to be reconstructed
 *   line-by-line from the human-readable activity log after the fact.
 *   For the next bug (one we don't yet know exists), we want the data
 *   already captured at every batch boundary so the first time the bug
 *   fires we already have what we need to diagnose it.
 *
 * Shape:
 *   - One NDJSON record per batch boundary (4 phases per batch:
 *     pre_api_call, post_api_call, pre_apply, post_apply).
 *   - Records accumulate in an in-memory ring buffer, capped at
 *     `maxRecords` (default 1000 ≈ ~250 KB at typical record size).
 *     Older records evicted FIFO when the cap is reached.
 *   - Download button in the Auto-Analyze panel serializes the buffer
 *     to a `.ndjson` file the director can attach to a bug report.
 *
 * Scope (per director Q4 = Option A from §8): client-side only for v1.
 * No server persistence; no third-party telemetry. Phase 2 multi-user
 * may promote this to per-run server-side logging — out of scope here.
 *
 * Phase semantics:
 *   - pre_api_call: just before sending the request to Claude. Captures
 *     canvas size + keyword count to characterize the input the model
 *     is about to see. Tokens/cost not yet known.
 *   - post_api_call: just after the API response returns. Adds tokens
 *     used + cost computed. Canvas state still reflects pre-apply.
 *   - pre_apply: just before doApplyV3 mutates state. Same canvas
 *     counts as post_api_call but logged separately so a phase that
 *     changes state (the apply) has clear before/after pairs.
 *   - post_apply: after operations apply + canvas rebuild + reconciliation.
 *     Captures the new canvas counts, reconciliation flips, and any
 *     errors collected from the batch.
 *
 * Errors:
 *   When a batch throws, the catch path emits a record with the relevant
 *   phase + the error message in `errors`. The pre/post pairs may be
 *   incomplete in that case — that's diagnostic signal, not a bug.
 */

export type ForensicPhase =
  | 'pre_api_call'
  | 'post_api_call'
  | 'pre_apply'
  | 'post_apply';

export interface ForensicReconciliation {
  to_ai_sorted: number;
  to_reshuffled: number;
}

export interface ForensicRecord {
  ts: string;
  session_id: string;
  project_id: string;
  batch_num: number;
  phase: ForensicPhase;
  // All fields below are optional — a phase may legitimately not know
  // some of them (e.g., tsv_input_tokens isn't known until post_api_call).
  canvas_node_count?: number;
  canvas_keyword_count?: number;
  tsv_input_tokens?: number;
  tsv_output_tokens?: number;
  model?: string;
  cost_this_batch?: number;
  reconciliation?: ForensicReconciliation;
  errors?: string[];
}

export const FORENSIC_DEFAULT_MAX_RECORDS = 1000;

export class ForensicLog {
  private records: ForensicRecord[] = [];
  private readonly maxRecords: number;

  constructor(maxRecords: number = FORENSIC_DEFAULT_MAX_RECORDS) {
    if (maxRecords <= 0) {
      throw new Error('ForensicLog: maxRecords must be > 0');
    }
    this.maxRecords = maxRecords;
  }

  /** Append a record. Evicts oldest record FIFO if capacity exceeded. */
  emit(record: ForensicRecord): void {
    this.records.push(record);
    if (this.records.length > this.maxRecords) {
      this.records.shift();
    }
  }

  /** Number of records currently held. */
  count(): number {
    return this.records.length;
  }

  /** Capacity ceiling. */
  capacity(): number {
    return this.maxRecords;
  }

  /** Defensive copy — callers can iterate without mutating the buffer. */
  getAll(): ForensicRecord[] {
    return this.records.slice();
  }

  /** Newline-delimited JSON, one record per line. Empty buffer → empty string. */
  toNdjson(): string {
    return this.records.map((r) => JSON.stringify(r)).join('\n');
  }

  /** Drop all records. Used at run start so a fresh run starts with a clean buffer. */
  clear(): void {
    this.records = [];
  }
}

/**
 * Helper for the download-log button: builds the NDJSON blob and a
 * filename suggestion. Pure — caller is responsible for the actual
 * `URL.createObjectURL` / anchor-click dance (those are browser-only
 * and can't be unit-tested without a DOM).
 */
export function buildForensicDownload(
  log: ForensicLog,
  sessionId: string,
): { content: string; filename: string; mimeType: string } {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  // Truncate session ID to keep filename reasonable; full ID is in the records.
  const shortSession = sessionId.slice(0, 8) || 'no-session';
  return {
    content: log.toNdjson(),
    filename: `aa-forensic-${shortSession}-${ts}.ndjson`,
    mimeType: 'application/x-ndjson',
  };
}
