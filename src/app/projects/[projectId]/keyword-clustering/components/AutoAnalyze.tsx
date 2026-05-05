'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { authFetch } from '@/lib/authFetch';
import type { CanvasNode } from '@/hooks/useCanvas';
import { calcNodeHeight, runLayoutPass, type LayoutNode } from '@/lib/canvas-layout';
import {
  applyOperations,
  buildCanvasStateForApplier,
  buildOperationsInputTsv,
  createTouchTracker,
  DEFAULT_RECENCY_WINDOW,
  deserializeTouchTracker,
  materializeRebuildPayload,
  parseOperationsJsonl,
  recordTouchesFromOps,
  serializeTouchTracker,
  type TouchTracker,
} from '@/lib/auto-analyze-v3';
import { computeReconciliationUpdates } from '@/lib/reconciliation';
import {
  ForensicLog,
  buildForensicDownload,
  type ForensicPhase,
  type ForensicReconciliation,
} from '@/lib/forensic-log';
import { runPreflight, type PreflightCheckResult } from '@/lib/preflight';
import { runRefreshWithRetry } from '@/lib/post-rebuild-fetch-retry';
import './auto-analyze.css';

/* ── Types ─────────────────────────────────────────────────── */
interface Keyword {
  id: string;
  keyword: string;
  volume: number | string;
  sortingStatus: string;
  tags: string;
  topic: string;
  canvasLoc: Record<string, string>;
  topicApproved: Record<string, boolean>;
  sortOrder: number;
}

interface BatchObj {
  batchNum: number;
  keywordIds: string[];
  keywords: string[];
  status: 'queued' | 'in_progress' | 'complete' | 'failed' | 'skipped' | 'reviewing';
  attempts: number;
  stallAttempts: number;
  maxAttempts: number;
  maxStallAttempts: number;
  result: BatchResult | null;
  error: string | null;
  startedAt: number | null;
  completedAt: number | null;
  reevalReport: string;
  kwTopicMap: Record<string, string[]> | null;
  tokensUsed: { input: number; output: number };
  cost: number;
  newTopicCount: number;
  _unplacedKws?: string[];
  _correctionContext?: string;
  // Stashed during reviewMode so handleApplyBatch can apply after user approval.
  _v3Ops?: import('@/lib/auto-analyze-v3').Operation[];
}

interface BatchResult {
  topicsTableTsv: string;
  kwAnalysisTable: string;
  reevalReport: string;
  newTopics: string[];
  kwTopicMap: Record<string, string[]>;
  tokensUsed: { input: number; output: number };
  rawResponse: string;
}

interface LogEntry {
  ts: string;
  msg: string;
  type: 'info' | 'ok' | 'warn' | 'error';
}

type AAState = 'IDLE' | 'CONFIGURING' | 'RUNNING' | 'PAUSED' | 'BATCH_REVIEW' | 'API_ERROR' | 'VALIDATION_ERROR' | 'ALL_COMPLETE';

/* ── Constants ─────────────────────────────────────────────── */
const AA_MAX_TOKENS = 128000;
const AA_CONTEXT_WINDOW = 200000;

const AA_BATCH_TIERS = [
  { size: 8,  name: 'Foundation', trigger: null as null },
  { size: 12, name: 'Expansion',  trigger: { windowSize: 3, maxAvgNewTopics: 2 } },
  { size: 18, name: 'Placement',  trigger: { windowSize: 5, maxAvgNewTopics: 1.5 } },
];

const AA_PRICING: Record<string, { inputPer1M: number; outputPer1M: number }> = {
  'claude-opus-4-7':   { inputPer1M: 5.00, outputPer1M: 25.00 },
  'claude-opus-4-6':   { inputPer1M: 5.00, outputPer1M: 25.00 },
  'claude-sonnet-4-6': { inputPer1M: 3.00, outputPer1M: 15.00 },
  'claude-opus-4-5':   { inputPer1M: 5.00, outputPer1M: 25.00 },
  'claude-haiku-4-5':  { inputPer1M: 1.00, outputPer1M: 5.00 },
};

/* ── Props ──────────────────────────────────────────────────── */
interface AutoAnalyzeProps {
  open: boolean;
  onClose: () => void;
  allKeywords: Keyword[];
  nodes: CanvasNode[];
  pathways: { id: string; projectId: string }[];
  sisterLinks: { id: string; nodeA: string; nodeB: string }[];
  onUpdateNodes: (updates: Partial<CanvasNode>[]) => Promise<void>;
  onAddNode: (data: Partial<CanvasNode>) => Promise<CanvasNode | null>;
  onDeleteNode: (id: string) => Promise<void> | void;
  projectId: string;
  onRefreshCanvas: () => Promise<void>;
  onRefreshKeywords: () => Promise<void>;
}

/* ── Component ─────────────────────────────────────────────── */
export default function AutoAnalyze({
  open, onClose, allKeywords, nodes, pathways, sisterLinks,
  onUpdateNodes, onAddNode, onDeleteNode, projectId, onRefreshCanvas, onRefreshKeywords,
}: AutoAnalyzeProps) {

  /* ── Config state ──────────────────────────────────────────── */
  const [apiMode, setApiMode] = useState<'direct' | 'server'>('direct');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('claude-sonnet-4-6');
  const [seedWords, setSeedWords] = useState('');
  const [volumeThreshold, setVolumeThreshold] = useState(1000);
  const [batchSize, setBatchSize] = useState(8);
  const [processingMode, setProcessingMode] = useState<'adaptive' | 'classic'>('adaptive');
  const [thinkingMode, setThinkingMode] = useState<'adaptive' | 'enabled' | 'disabled'>('adaptive');
  const [thinkingBudget, setThinkingBudget] = useState(10000);
  const [keywordScope, setKeywordScope] = useState<'unsorted-only' | 'non-ai-sorted' | 'all'>('unsorted-only');
  const [stallTimeout, setStallTimeout] = useState(90);
  const [reviewMode, setReviewMode] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState('');
  const [primerPrompt, setPrimerPrompt] = useState('');
  const [promptExpanded, setPromptExpanded] = useState(false);
  // Cluster 2 Q6 lock — recency window for the tier decider; persists per-project
  // via aa_settings_{projectId} alongside other settings. INPUT_CONTEXT_SCALING_DESIGN.md §2.2.
  const [recencyWindow, setRecencyWindow] = useState(DEFAULT_RECENCY_WINDOW);
  // Scale Session E — consolidation pass settings. Per INPUT_CONTEXT_SCALING_DESIGN.md
  // §4.1 (Cluster 4 Q13/Q14/Q15). Two paste-areas for the Consolidation Initial
  // Prompt + Consolidation Primer, mirroring the regular V4 prompt slots.
  // `consolidationCadence` = 0 disables auto-fire entirely; admin-triggered
  // "Consolidate Now" still works regardless. Default cadence = 10 batches +
  // gate to canvas size > 100 topics matches the design.
  const [consolidationInitialPrompt, setConsolidationInitialPrompt] = useState('');
  const [consolidationPrimerPrompt, setConsolidationPrimerPrompt] = useState('');
  const [consolidationCadence, setConsolidationCadence] = useState(10);
  const [consolidationMinCanvasSize, setConsolidationMinCanvasSize] = useState(100);

  /* ── Runtime state ─────────────────────────────────────────── */
  const [aaState, setAaState] = useState<AAState>('IDLE');
  const [batches, setBatches] = useState<BatchObj[]>([]);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [totalSpent, setTotalSpent] = useState(0);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [batchTier, setBatchTier] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [pendingResult, setPendingResult] = useState<BatchResult | null>(null);

  /* ── Refs for async loop ───────────────────────────────────── */
  const runningRef = useRef(false);
  const abortRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const batchesRef = useRef(batches);
  const currentIdxRef = useRef(currentIdx);
  const batchTierRef = useRef(batchTier);
  const totalSpentRef = useRef(totalSpent);
  const nodesRef = useRef(nodes);
  const keywordsRef = useRef(allKeywords);
  const sisterLinksRef = useRef(sisterLinks);
  const pathwaysRef = useRef(pathways);
  // Fail-fast pre-flight tracker for Bug 1 (canvas-blanking). Records the
  // canvas's node count at end of the previous batch's apply. -1 = not yet
  // observed. The runLoop's per-batch pre-flight pauses the run if the count
  // ever drops from >0 to 0 between batches — symptom of useCanvas.fetchCanvas
  // returning empty state on a transient server failure. Independent guard
  // from the defensive useCanvas contract; both must fail before a blanking
  // event can corrupt a run again. See ROADMAP §"🚨 Canvas-Blanking Intermittent Bug".
  const lastSeenNodesCountRef = useRef<number>(-1);

  // Forensic NDJSON ring buffer (DEFENSE_IN_DEPTH_AUDIT_DESIGN §4). One
  // record per batch boundary across 4 phases (pre_api_call, post_api_call,
  // pre_apply, post_apply). Capped at 1000 records ≈ 250 KB. Downloadable
  // from the panel footer (📥 Download log button). Cleared at handleStart
  // so each fresh run starts with an empty buffer; survives Pause/Resume.
  const forensicLogRef = useRef<ForensicLog>(new ForensicLog());
  const sessionIdRef = useRef<string>('');
  const [forensicCount, setForensicCount] = useState(0);

  // Touch tracker (Scale Session D — INPUT_CONTEXT_SCALING_DESIGN.md §2.1, Cluster 2 Q5).
  // Map<stableId, lastTouchedBatchNum>. Drives the recency signal for `decideTier` —
  // a topic touched within `recencyWindow` batches stays at Tier 0. Reset at
  // handleStart; serialized into aa_checkpoint_{projectId} via saveCheckpoint;
  // rehydrated by handleResumeCheckpoint. Stamped after each successful doApplyV3
  // using the applier's aliasResolutions so $newN aliases resolve to their freshly-
  // assigned t-N stableIds.
  const touchTrackerRef = useRef<TouchTracker>(createTouchTracker());
  // 1-indexed current batch number for the tier decider's batchesSinceTouch math.
  // Driven by `batch.batchNum` at the top of each iteration of runLoop.
  const currentBatchNumRef = useRef<number>(0);

  // Scale Session E — counter for the consolidation auto-fire gate. Increments
  // after each successful regular batch apply; reset to 0 immediately after a
  // consolidation pass (success OR failure — failure-reset prevents retry-storm).
  // Persisted in aa_checkpoint_{projectId} so Pause/Resume preserves the
  // consolidation cadence across the gap. INPUT_CONTEXT_SCALING_DESIGN.md §4.1
  // (Cluster 4 Q13).
  const batchesSinceConsolidationRef = useRef<number>(0);
  // Busy flag for the admin-triggered "Consolidate Now" button — prevents
  // double-click while a pass is in flight.
  const [consolidationBusy, setConsolidationBusy] = useState(false);

  // Run-start pre-flight (DEFENSE_IN_DEPTH_AUDIT_DESIGN §6). When the user
  // clicks Start, runPreflight() executes P1..P10 sequentially; the first
  // ✗ aborts the chain. UI displays per-check status. `skipPreflight` is
  // an opt-out checkbox (off by default) for power users / debugging.
  const [skipPreflight, setSkipPreflight] = useState(false);
  const [preflightRunning, setPreflightRunning] = useState(false);
  const [preflightChecks, setPreflightChecks] = useState<PreflightCheckResult[]>([]);
  const [preflightFailed, setPreflightFailed] = useState(false);

  // runLoop-reachable code MUST read nodes/allKeywords/sisterLinks/pathways
  // via *Ref.current, not raw props — the async runLoop closure freezes props
  // at component-render time. The 2026-04-18 stale-closure bug (Bug A) and
  // the 2026-04-28 reconciliation regression (Bug 2) were both caused by
  // direct prop reads inside async loop bodies. The current defense:
  // every run-loop-reachable async function (doApplyV3, runLoop, …) shadows
  // these props at function entry with the same name pointing at the ref —
  // so any code inside, current or future, reads fresh state by default.
  // See CORRECTIONS_LOG 2026-04-18 + ROADMAP §"🚨 Reconciliation-Pass Closure-Staleness Bug".
  useEffect(() => { batchesRef.current = batches; }, [batches]);
  useEffect(() => { currentIdxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { batchTierRef.current = batchTier; }, [batchTier]);
  useEffect(() => { totalSpentRef.current = totalSpent; }, [totalSpent]);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { keywordsRef.current = allKeywords; }, [allKeywords]);
  useEffect(() => { sisterLinksRef.current = sisterLinks; }, [sisterLinks]);
  useEffect(() => { pathwaysRef.current = pathways; }, [pathways]);

  /* ── Settings persistence ──────────────────────────────────────
     Load on mount, debounced auto-save on change. apiKey stays in
     browser localStorage so the user's secret never sits in our DB;
     all other settings sync per-user-per-project via UserPreference. */
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const settingsDbKey = 'aa_settings_' + projectId;
  const apiKeyLsKey = 'aa_apikey_' + projectId;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const storedApiKey = localStorage.getItem(apiKeyLsKey);
        if (storedApiKey && !cancelled) setApiKey(storedApiKey);
      } catch { /* localStorage unavailable */ }
      try {
        const res = await authFetch('/api/user-preferences/' + encodeURIComponent(settingsDbKey));
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!data.value) return;
        const s = JSON.parse(data.value);
        if (cancelled) return;
        if (s.apiMode !== undefined) setApiMode(s.apiMode);
        if (s.model !== undefined) setModel(s.model);
        if (s.seedWords !== undefined) setSeedWords(s.seedWords);
        if (s.volumeThreshold !== undefined) setVolumeThreshold(s.volumeThreshold);
        if (s.batchSize !== undefined) setBatchSize(s.batchSize);
        if (s.processingMode !== undefined) setProcessingMode(s.processingMode);
        if (s.thinkingMode !== undefined) setThinkingMode(s.thinkingMode);
        if (s.thinkingBudget !== undefined) setThinkingBudget(s.thinkingBudget);
        if (s.keywordScope !== undefined) setKeywordScope(s.keywordScope);
        if (s.stallTimeout !== undefined) setStallTimeout(s.stallTimeout);
        if (s.reviewMode !== undefined) setReviewMode(s.reviewMode);
        if (s.initialPrompt !== undefined) setInitialPrompt(s.initialPrompt);
        if (s.primerPrompt !== undefined) setPrimerPrompt(s.primerPrompt);
        if (typeof s.recencyWindow === 'number' && s.recencyWindow > 0) setRecencyWindow(s.recencyWindow);
        if (typeof s.consolidationInitialPrompt === 'string') setConsolidationInitialPrompt(s.consolidationInitialPrompt);
        if (typeof s.consolidationPrimerPrompt === 'string') setConsolidationPrimerPrompt(s.consolidationPrimerPrompt);
        if (typeof s.consolidationCadence === 'number' && s.consolidationCadence >= 0) setConsolidationCadence(s.consolidationCadence);
        if (typeof s.consolidationMinCanvasSize === 'number' && s.consolidationMinCanvasSize >= 0) setConsolidationMinCanvasSize(s.consolidationMinCanvasSize);
      } catch (e) {
        console.warn('Failed to load AA settings', e);
      } finally {
        if (!cancelled) setSettingsLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (!settingsLoaded) return;
    try { localStorage.setItem(apiKeyLsKey, apiKey); } catch { /* ignore */ }
  }, [apiKey, apiKeyLsKey, settingsLoaded]);

  useEffect(() => {
    if (!settingsLoaded) return;
    const timer = setTimeout(() => {
      const payload = {
        apiMode, model, seedWords, volumeThreshold, batchSize,
        processingMode, thinkingMode, thinkingBudget, keywordScope,
        stallTimeout, reviewMode, initialPrompt, primerPrompt, recencyWindow,
        consolidationInitialPrompt, consolidationPrimerPrompt,
        consolidationCadence, consolidationMinCanvasSize,
      };
      authFetch('/api/user-preferences/' + encodeURIComponent(settingsDbKey), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: JSON.stringify(payload) }),
      }).catch(e => console.warn('Failed to save AA settings', e));
    }, 800);
    return () => clearTimeout(timer);
  }, [settingsLoaded, settingsDbKey, apiMode, model, seedWords, volumeThreshold, batchSize,
      processingMode, thinkingMode, thinkingBudget, keywordScope,
      stallTimeout, reviewMode, initialPrompt, primerPrompt, recencyWindow,
      consolidationInitialPrompt, consolidationPrimerPrompt,
      consolidationCadence, consolidationMinCanvasSize]);

  const logRef = useRef<HTMLDivElement>(null);

  /* ── Log helper ────────────────────────────────────────────── */
  const aaLog = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
    const ts = new Date().toLocaleTimeString();
    setLogEntries(prev => [...prev, { ts, msg, type }]);
    setTimeout(() => logRef.current?.scrollTo(0, logRef.current.scrollHeight), 50);
  }, []);

  /* ── Forensic emit helper (DEFENSE_IN_DEPTH_AUDIT_DESIGN §4) ───
     Single entry point for every per-batch-boundary record. Pulls
     ts + session_id + project_id from the closure / refs so call
     sites only have to provide the phase + the phase-specific data.
     Updates `forensicCount` so the panel's record-count badge re-renders. */
  const emitForensic = useCallback(
    (
      phase: ForensicPhase,
      batchNum: number,
      extra: {
        canvasNodeCount?: number;
        canvasKeywordCount?: number;
        tsvInputTokens?: number;
        tsvOutputTokens?: number;
        costThisBatch?: number;
        reconciliation?: ForensicReconciliation;
        errors?: string[];
      } = {},
    ) => {
      forensicLogRef.current.emit({
        ts: new Date().toISOString(),
        session_id: sessionIdRef.current,
        project_id: projectId,
        batch_num: batchNum,
        phase,
        canvas_node_count: extra.canvasNodeCount,
        canvas_keyword_count: extra.canvasKeywordCount,
        tsv_input_tokens: extra.tsvInputTokens,
        tsv_output_tokens: extra.tsvOutputTokens,
        model,
        cost_this_batch: extra.costThisBatch,
        reconciliation: extra.reconciliation,
        errors: extra.errors,
      });
      setForensicCount(forensicLogRef.current.count());
    },
    [projectId, model],
  );

  /* ── Forensic download handler ────────────────────────────────
     Browser-only — `URL.createObjectURL` + anchor-click dance.
     Helper `buildForensicDownload` builds the content + filename;
     this function does the DOM glue. */
  function handleDownloadForensicLog() {
    const buf = forensicLogRef.current;
    if (buf.count() === 0) {
      aaLog('No forensic records yet. Start a run to populate the log.', 'warn');
      return;
    }
    const dl = buildForensicDownload(buf, sessionIdRef.current);
    try {
      const blob = new Blob([dl.content], { type: dl.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = dl.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      aaLog('📥 Forensic log downloaded (' + buf.count() + ' records)', 'ok');
    } catch (e) {
      aaLog('Download failed: ' + (e instanceof Error ? e.message : String(e)), 'error');
    }
  }

  /* ── Checkpoint persistence ─────────────────────────────────── */
  const cpKey = 'aa_checkpoint_' + projectId;
  function saveCheckpoint() {
    try {
      const cp = {
        ts: Date.now(),
        config: {
          apiMode, apiKey, model, seedWords, volumeThreshold, batchSize,
          processingMode, thinkingMode, thinkingBudget, keywordScope,
          stallTimeout, reviewMode, initialPrompt, primerPrompt, recencyWindow,
          consolidationInitialPrompt, consolidationPrimerPrompt,
          consolidationCadence, consolidationMinCanvasSize,
        },
        batches: batchesRef.current,
        currentIdx: currentIdxRef.current,
        totalSpent: totalSpentRef.current,
        batchTier: batchTierRef.current,
        elapsed,
        logEntries,
        // Scale Session D — touch tracker survives Pause/Resume so the recency
        // signal continues to identify recently-touched topics across the gap.
        // Plain object form (Map isn't JSON-serializable directly).
        touchTracker: serializeTouchTracker(touchTrackerRef.current),
        currentBatchNum: currentBatchNumRef.current,
        // Scale Session E — consolidation auto-fire counter survives Pause/Resume
        // so the cadence isn't reset to 0 across the gap (which would delay the
        // next consolidation pass by N batches).
        batchesSinceConsolidation: batchesSinceConsolidationRef.current,
      };
      localStorage.setItem(cpKey, JSON.stringify(cp));
    } catch (e) { console.warn('Checkpoint save failed', e); }
  }
  function loadCheckpoint() {
    try {
      const raw = localStorage.getItem(cpKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch { return null; }
  }
  function clearCheckpoint() {
    localStorage.removeItem(cpKey);
  }
  const [hasSavedCheckpoint, setHasSavedCheckpoint] = useState(false);
  const [savedCheckpointInfo, setSavedCheckpointInfo] = useState('');
  useEffect(() => {
    const cp = loadCheckpoint();
    if (cp && cp.batches && cp.batches.length > 0) {
      const completed = cp.batches.filter((b: BatchObj) => b.status === 'complete').length;
      const total = cp.batches.length;
      const age = Math.round((Date.now() - cp.ts) / 60000);
      setHasSavedCheckpoint(true);
      setSavedCheckpointInfo(completed + '/' + total + ' batches done, ' + age + ' min ago');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function handleResumeCheckpoint() {
    const cp = loadCheckpoint();
    if (!cp) { alert('No checkpoint found.'); setHasSavedCheckpoint(false); return; }
    const c = cp.config;
    setApiMode(c.apiMode); setApiKey(c.apiKey || ''); setModel(c.model);
    setSeedWords(c.seedWords); setVolumeThreshold(c.volumeThreshold);
    setBatchSize(c.batchSize); setProcessingMode(c.processingMode);
    setThinkingMode(c.thinkingMode); setThinkingBudget(c.thinkingBudget);
    setKeywordScope(c.keywordScope); setStallTimeout(c.stallTimeout);
    setReviewMode(c.reviewMode); setInitialPrompt(c.initialPrompt);
    setPrimerPrompt(c.primerPrompt || '');
    if (typeof c.recencyWindow === 'number' && c.recencyWindow > 0) setRecencyWindow(c.recencyWindow);
    if (typeof c.consolidationInitialPrompt === 'string') setConsolidationInitialPrompt(c.consolidationInitialPrompt);
    if (typeof c.consolidationPrimerPrompt === 'string') setConsolidationPrimerPrompt(c.consolidationPrimerPrompt);
    if (typeof c.consolidationCadence === 'number' && c.consolidationCadence >= 0) setConsolidationCadence(c.consolidationCadence);
    if (typeof c.consolidationMinCanvasSize === 'number' && c.consolidationMinCanvasSize >= 0) setConsolidationMinCanvasSize(c.consolidationMinCanvasSize);
    // Scale Session D — rehydrate the touch tracker so the recency signal
    // continues across the Pause/Resume gap. Pre-D checkpoints have no
    // touchTracker field; deserializeTouchTracker treats null/undefined as
    // "fresh empty tracker," so old checkpoints resume cleanly with a cold
    // tracker (degrades to "every topic looks not-recently-touched" — same as
    // a fresh run).
    touchTrackerRef.current = deserializeTouchTracker(cp.touchTracker);
    currentBatchNumRef.current = typeof cp.currentBatchNum === 'number' ? cp.currentBatchNum : 0;
    // Scale Session E — rehydrate the consolidation auto-fire counter. Pre-E
    // checkpoints have no field; default to 0 (consolidation will fire after
    // the next N successful batches, same as a fresh run — slight delay vs. a
    // checkpoint that had captured a non-zero counter, but no correctness issue).
    batchesSinceConsolidationRef.current = typeof cp.batchesSinceConsolidation === 'number'
      ? cp.batchesSinceConsolidation
      : 0;
    const restoredBatches = cp.batches.map((b: BatchObj) =>
      b.status === 'in_progress' ? { ...b, status: 'queued' as const } : b
    );
    setBatches(restoredBatches); batchesRef.current = restoredBatches;
    setCurrentIdx(cp.currentIdx); currentIdxRef.current = cp.currentIdx;
    setTotalSpent(cp.totalSpent); totalSpentRef.current = cp.totalSpent;
    setBatchTier(cp.batchTier); batchTierRef.current = cp.batchTier;
    setLogEntries(cp.logEntries || []);
    setElapsed(cp.elapsed || 0);
    abortRef.current = false;
    startTimeRef.current = Date.now() - (cp.elapsed || 0) * 1000;
    aaLog('Resumed from checkpoint (' + cp.batches.filter((b: BatchObj) => b.status === 'complete').length + '/' + cp.batches.length + ' batches done)', 'ok');
    setAaState('RUNNING');
    runningRef.current = true;
    setHasSavedCheckpoint(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    runLoop();
  }
  function handleDiscardCheckpoint() {
    clearCheckpoint();
    setHasSavedCheckpoint(false);
  }

  /* ── Get unsorted keywords ─────────────────────────────────── */
  function getUnsortedKws() {
    return allKeywords.filter(k => {
      if (keywordScope === 'all') return true;
      if (keywordScope === 'non-ai-sorted') return k.sortingStatus !== 'AI-Sorted';
      // Default scope: keywords needing AI placement.
      // 'Reshuffled' = keywords the AI previously placed that got bumped out
      // during a later batch's reshuffling (surfaced by the post-batch
      // reconciliation pass in doApply). They're re-eligible for placement
      // alongside fresh 'Unsorted' keywords.
      return k.sortingStatus === 'Unsorted' || k.sortingStatus === 'Reshuffled';
    });
  }

  /* ── Build batch queue ─────────────────────────────────────── */
  function buildQueue(): BatchObj[] {
    const size = processingMode === 'adaptive' ? AA_BATCH_TIERS[0].size : batchSize;
    const unsorted = getUnsortedKws();
    const queue: BatchObj[] = [];
    for (let i = 0; i < unsorted.length; i += size) {
      const slice = unsorted.slice(i, i + size);
      queue.push({
        batchNum: queue.length + 1,
        keywordIds: slice.map(k => k.id),
        keywords: slice.map(k => k.keyword),
        status: 'queued',
        attempts: 0,
        stallAttempts: 0,
        maxAttempts: 3,
        maxStallAttempts: 5,
        result: null,
        error: null,
        startedAt: null,
        completedAt: null,
        reevalReport: '',
        kwTopicMap: null,
        tokensUsed: { input: 0, output: 0 },
        cost: 0,
        newTopicCount: 0,
      });
    }
    return queue;
  }

  /* ── Cost helpers ──────────────────────────────────────────── */
  function calcCost(tokensUsed: { input: number; output: number }) {
    const p = AA_PRICING[model] || AA_PRICING['claude-sonnet-4-6'];
    return (tokensUsed.input / 1e6) * p.inputPer1M + (tokensUsed.output / 1e6) * p.outputPer1M;
  }

  function costEstimate() {
    const unsorted = getUnsortedKws();
    const size = processingMode === 'adaptive' ? AA_BATCH_TIERS[0].size : batchSize;
    const nBatches = Math.ceil(unsorted.length / size);
    const p = AA_PRICING[model] || AA_PRICING['claude-sonnet-4-6'];
    const estInputPerBatch = 8000;
    const estOutputPerBatch = 4000;
    const costPerBatch = (estInputPerBatch / 1e6) * p.inputPer1M + (estOutputPerBatch / 1e6) * p.outputPer1M;
    return { nBatches, nKeywords: unsorted.length, estCost: costPerBatch * nBatches };
  }

  /* ── Build API request body ────────────────────────────────── */
  function buildRequestBody(systemText: string, userContent: string) {
    const body: Record<string, unknown> = {
      model,
      max_tokens: AA_MAX_TOKENS,
      system: [{ type: 'text', text: systemText, cache_control: { type: 'ephemeral', ttl: '1h' } }],
      messages: [{ role: 'user', content: userContent }],
    };
    if (thinkingMode === 'adaptive') {
      body.thinking = { type: 'adaptive' };
      body.temperature = 1;
    } else if (thinkingMode === 'enabled') {
      body.thinking = { type: 'enabled', budget_tokens: Math.max(1024, thinkingBudget) };
      body.temperature = 1;
    } else {
      body.temperature = 0.3;
    }
    return body;
  }

  /* ── Call API via server proxy (streaming SSE) ─────────────── */
  async function callApi(requestBody: Record<string, unknown>, batchNum: number): Promise<{
    content: { type: string; text?: string; thinking?: string }[];
    usage: { input_tokens: number; output_tokens: number; cache_creation_input_tokens: number; cache_read_input_tokens: number };
    stop_reason: string | null;
  }> {
    if (abortControllerRef.current) {
      try { abortControllerRef.current.abort(); } catch (_) { /* */ }
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const stallMs = stallTimeout * 1000;
    let stallTimer: ReturnType<typeof setTimeout> | null = null;
    const resetStall = () => {
      if (stallTimer) clearTimeout(stallTimer);
      stallTimer = setTimeout(() => controller.abort(), stallMs);
    };

    let streamActive = false;

    try {
      resetStall();
      const isDirect = apiMode === 'direct';
      const fetchUrl = isDirect ? 'https://api.anthropic.com/v1/messages' : '/api/ai/analyze';
      const headers: Record<string, string> = { 'content-type': 'application/json' };
      if (isDirect) {
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
        headers['anthropic-dangerous-direct-browser-access'] = 'true';
      }
      const response = await (isDirect ? fetch : authFetch)(fetchUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...requestBody, stream: true }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = 'HTTP ' + response.status;
        try { const j = JSON.parse(errText); errMsg += ': ' + (j.error?.message || errText.substring(0, 200)); } catch (_) { errMsg += ': ' + errText.substring(0, 200); }
        throw new Error(errMsg);
      }

      streamActive = true;
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      const content: { type: string; text?: string; thinking?: string }[] = [];
      let currentBlockType: string | null = null;
      let currentBlockText = '';
      const usage = { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 };
      let stopReason: string | null = null;
      let sseEventType = '';
      let sseData = '';

      function dispatchSSE(evtType: string, data: string) {
        try {
          const parsed = JSON.parse(data);
          switch (evtType) {
            case 'message_start':
              if (parsed.message?.usage) {
                usage.input_tokens = parsed.message.usage.input_tokens || 0;
                usage.cache_creation_input_tokens = parsed.message.usage.cache_creation_input_tokens || 0;
                usage.cache_read_input_tokens = parsed.message.usage.cache_read_input_tokens || 0;
              }
              break;
            case 'content_block_start':
              currentBlockType = parsed.content_block?.type || 'text';
              currentBlockText = '';
              if (currentBlockType === 'thinking') aaLog('  Batch ' + batchNum + ' — thinking phase started…', 'info');
              else if (currentBlockType === 'text') aaLog('  Batch ' + batchNum + ' — generating output…', 'info');
              break;
            case 'content_block_delta':
              if (parsed.delta) {
                if (parsed.delta.type === 'thinking_delta') currentBlockText += parsed.delta.thinking || '';
                else if (parsed.delta.type === 'text_delta') currentBlockText += parsed.delta.text || '';
              }
              break;
            case 'content_block_stop':
              if (currentBlockType === 'thinking') content.push({ type: 'thinking', thinking: currentBlockText });
              else if (currentBlockType === 'text') content.push({ type: 'text', text: currentBlockText });
              currentBlockType = null;
              currentBlockText = '';
              break;
            case 'message_delta':
              if (parsed.delta?.stop_reason) stopReason = parsed.delta.stop_reason;
              if (parsed.usage?.output_tokens) usage.output_tokens = parsed.usage.output_tokens;
              break;
          }
        } catch (_) { /* skip unparseable */ }
      }

      while (true) {
        if (abortRef.current) { reader.cancel(); break; }
        const chunk = await reader.read();
        resetStall();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop()!;
        for (const line of lines) {
          if (line.startsWith('event: ')) sseEventType = line.substring(7).trim();
          else if (line.startsWith('data: ')) sseData += (sseData ? '\n' : '') + line.substring(6);
          else if (line.trim() === '') {
            if (sseEventType && sseData) dispatchSSE(sseEventType, sseData);
            sseEventType = '';
            sseData = '';
          }
        }
      }
      if (sseEventType && sseData) dispatchSSE(sseEventType, sseData);
      if (stallTimer) clearTimeout(stallTimer);
      abortControllerRef.current = null;

      aaLog('  Stream complete. Input: ' + usage.input_tokens.toLocaleString() + ', Output: ' + usage.output_tokens.toLocaleString() + ' tokens', 'info');
      return { content, usage, stop_reason: stopReason };

    } catch (err: unknown) {
      if (stallTimer) clearTimeout(stallTimer);
      abortControllerRef.current = null;
      if (err instanceof DOMException && err.name === 'AbortError') {
        if (abortRef.current) throw new Error('Cancelled by user');
        const stallErr = new Error('API stream stalled — no data for ' + stallTimeout + 's');
        (stallErr as Error & { _isStall?: boolean })._isStall = true;
        throw stallErr;
      }
      if (streamActive && err instanceof Error) {
        (err as Error & { _isStall?: boolean })._isStall = true;
      }
      throw err;
    }
  }

  /* ── Assemble prompt for a batch ───────────────────────────── */
  function assemblePromptV3(batch: BatchObj): { systemText: string; userContent: string } {
    let systemText = initialPrompt;
    systemText = systemText.replace(/\[PRIMARY_SEED_WORDS\]/g, seedWords);
    systemText = systemText.replace(/\[VOLUME_THRESHOLD\]/g, String(volumeThreshold));
    if (primerPrompt) {
      systemText += '\n\n--- TOPICS LAYOUT TABLE PRIMER ---\n\n' + primerPrompt;
    }

    // Scale Session D — tiered serialization. Builds the canvas TSV in three
    // sections (Tier 0 / 1 / 2) per INPUT_CONTEXT_SCALING_DESIGN.md §1. The
    // tier decider reads `recencyWindow` (Q6 lock; configurable from settings)
    // and the touch tracker; topics in this batch's relevant subtree, recently
    // touched, or low-stability stay at Tier 0; settled off-batch topics
    // compress to Tier 1; deeply stale + high-stability + off-batch topics
    // compress to Tier 2 (rare; gated by AND-rule + dormant-stability-scoring).
    const batchKeywords = batch.keywordIds
      .map((id) => keywordsRef.current.find((k) => k.id === id))
      .filter((k): k is Keyword => Boolean(k));
    const inputTsv = buildOperationsInputTsv(
      nodesRef.current,
      sisterLinksRef.current,
      keywordsRef.current,
      {
        serializationMode: 'tiered',
        tierContext: {
          batchKeywords,
          touchTracker: touchTrackerRef.current,
          currentBatchNum: batch.batchNum,
          recencyWindow,
        },
      },
    );

    let userContent = '';
    userContent += 'Here is the current Topics Layout Table (TSV input — read it; do not re-emit it):\n\n';
    userContent += inputTsv + '\n\n';
    userContent += 'Here are the ' + batch.keywords.length + ' keywords to analyze for this batch (UUID and text):\n\n';
    userContent += 'keyword_uuid\tkeyword\tvolume\n';
    for (const id of batch.keywordIds) {
      const kw = keywordsRef.current.find(k => k.id === id);
      if (kw) userContent += id + '\t' + kw.keyword + '\t' + (Number(kw.volume) || '') + '\n';
    }
    userContent += '\nPrimary seed word(s): ' + seedWords + '\n';
    userContent += 'Volume threshold for dedicated topic creation: ' + volumeThreshold + '\n\n';
    userContent += 'Emit your output as the operations block defined in the Primer. Operations only — no Topics Layout Table re-emission, no Reevaluation Report block.';
    if (batch._correctionContext) {
      userContent += '\n\nCORRECTION REQUIRED — PREVIOUS RESPONSE FAILED VALIDATION:\n' + batch._correctionContext + '\n\nPlease regenerate the operations correcting the above issues.';
    }
    return { systemText, userContent };
  }

  /* ── V3: process a batch ───────────────────────────────────── */
  /** @runloop-reachable */
  async function processBatchV3(batch: BatchObj): Promise<BatchResult> {
    const { systemText, userContent } = assemblePromptV3(batch);
    const estTokens = Math.ceil((systemText.length + userContent.length) / 4);
    aaLog('Batch ' + batch.batchNum + ' (V3) — sending ~' + estTokens.toLocaleString() + ' input tokens…', 'info');

    // Forensic emit: pre_api_call. Captures the canvas + keyword shape the
    // model is about to see; tokens/cost not yet known.
    emitForensic('pre_api_call', batch.batchNum, {
      canvasNodeCount: nodesRef.current.length,
      canvasKeywordCount: keywordsRef.current.length,
    });

    const requestBody = buildRequestBody(systemText, userContent);
    const apiResponse = await callApi(requestBody, batch.batchNum);

    const textContent = apiResponse.content.filter(b => b.type === 'text').map(b => b.text || '').join('\n');
    if (!textContent.trim()) throw new Error('API returned empty text content');

    const tokensUsed = {
      input: (apiResponse.usage.input_tokens || 0) + (apiResponse.usage.cache_creation_input_tokens || 0) + (apiResponse.usage.cache_read_input_tokens || 0),
      output: apiResponse.usage.output_tokens || 0,
    };
    if (apiResponse.usage.cache_read_input_tokens > 0) aaLog('  Cache hit: ' + apiResponse.usage.cache_read_input_tokens + ' tokens', 'info');
    if (apiResponse.stop_reason === 'max_tokens') aaLog('  ⚠ Response truncated (max_tokens)', 'warn');

    // Forensic emit: post_api_call. Tokens + cost now known; canvas state
    // unchanged from pre_api_call (apply happens later in doApplyV3).
    emitForensic('post_api_call', batch.batchNum, {
      canvasNodeCount: nodesRef.current.length,
      canvasKeywordCount: keywordsRef.current.length,
      tsvInputTokens: tokensUsed.input,
      tsvOutputTokens: tokensUsed.output,
      costThisBatch: calcCost(tokensUsed),
    });

    return {
      // V3 carries the raw operations text in the topicsTableTsv slot purely
      // so the BatchResult shape stays compatible with the existing UI/state.
      // It is parsed and applied via doApplyV3 — never displayed as TSV.
      topicsTableTsv: textContent,
      kwAnalysisTable: '',
      reevalReport: '',
      newTopics: [],
      kwTopicMap: {},
      tokensUsed,
      rawResponse: textContent,
    };
  }

  /* ── V3: validate result ───────────────────────────────────── */
  /** @runloop-reachable */
  function validateResultV3(
    result: BatchResult,
    batch: BatchObj,
  ): { ok: boolean; errors: string[]; ops: ReturnType<typeof parseOperationsJsonl>['operations']; archivedKeywordIds: Set<string> } {
    const errors: string[] = [];
    const archivedKeywordIds = new Set<string>();

    const parsed = parseOperationsJsonl(result.rawResponse);
    if (parsed.errors.length > 0) {
      errors.push(...parsed.errors);
      batch._correctionContext =
        'Operation-list parse errors:\n' + parsed.errors.map(e => '- ' + e).join('\n');
      return { ok: false, errors, ops: [], archivedKeywordIds };
    }

    // Dry-run apply against current canvas state to surface applier errors as
    // correction context. We re-run the same call in doApplyV3 against the
    // (possibly refreshed) canvas; the applier is a pure function so this is
    // safe and side-effect-free.
    const canvasStateRes = nodesRef.current;
    const sisterLinksNow = sisterLinksRef.current;
    // For dry-run validation, derive the stableId counter from the loaded
    // nodes — at least one greater than every existing stableId integer suffix.
    // doApplyV3 fetches the canonical value from /canvas before the real apply.
    let counter = 1;
    for (const n of canvasStateRes) {
      const m = /^t-(\d+)$/.exec(n.stableId);
      if (m) {
        const v = parseInt(m[1], 10);
        if (v >= counter) counter = v + 1;
      }
    }
    const state = buildCanvasStateForApplier(canvasStateRes, sisterLinksNow, counter);
    // validateResultV3 is only called from the regular per-batch runLoop path,
    // so the preview must mirror that path's regularBatchMode flag — otherwise
    // a stray ADD_SISTER_LINK / REMOVE_SISTER_LINK would pass validation and
    // then fail at apply time, which is exactly the asymmetric defense gap
    // defense-in-depth is meant to prevent. Consolidation passes call
    // applyOperations through doApplyV3 directly without going through this
    // function, so they are unaffected.
    const applyResult = applyOperations(state, parsed.operations, { regularBatchMode: true });
    if (!applyResult.ok) {
      const msgs = applyResult.errors.map(e => `op #${e.opIndex} ${e.opType}: ${e.message}`);
      errors.push(...msgs);
      batch._correctionContext =
        'Applier rejected the batch:\n' + msgs.map(m => '- ' + m).join('\n');
      return { ok: false, errors, ops: parsed.operations, archivedKeywordIds };
    }

    for (const a of applyResult.archivedKeywords) archivedKeywordIds.add(a.keywordId);

    // HC1 (V3): every batch keyword must be either placed somewhere on the
    // canvas after apply OR archived in this batch.
    const placedAfter = new Set<string>();
    for (const node of applyResult.newState.nodes) {
      for (const kwId of Object.keys(node.keywordPlacements)) placedAfter.add(kwId);
    }
    const missing: string[] = [];
    for (const kwId of batch.keywordIds) {
      if (!placedAfter.has(kwId) && !archivedKeywordIds.has(kwId)) missing.push(kwId);
    }
    if (missing.length > 0) {
      const missingTexts = missing.map(id => {
        const k = keywordsRef.current.find(x => x.id === id);
        return k ? `${id} (${k.keyword})` : id;
      });
      errors.push('Missing ' + missing.length + ' batch keywords: ' + missingTexts.slice(0, 5).join(', '));
      batch._correctionContext =
        'After applying your operations, these batch keywords were not placed and not archived. ' +
        'Each must end up either at a topic (via ADD_KEYWORD) or archived (via ARCHIVE_KEYWORD):\n' +
        missingTexts.map(t => '- ' + t).join('\n');
      return { ok: false, errors, ops: parsed.operations, archivedKeywordIds };
    }

    return { ok: true, errors, ops: parsed.operations, archivedKeywordIds };
  }

  /* ── V3: apply operations to canvas ────────────────────────── */
  /** @runloop-reachable */
  async function doApplyV3(
    batch: BatchObj,
    ops: ReturnType<typeof parseOperationsJsonl>['operations'],
    options?: { consolidationMode?: boolean; regularBatchMode?: boolean },
  ) {
    // Shadow the closure-frozen props that are read inside this function
    // (`allKeywords` at the reconciliation pass + the unplaced-log; `pathways`
    // at the rebuild payload) with their always-fresh refs. The local names
    // match the prop names, so the closure-frozen prop is unreachable for
    // every read inside this function — accidental reintroduction of the
    // 2026-04-28 closure-staleness regression at line 830 is structurally
    // prevented. `nodes` and `sisterLinks` already use `nodesRef.current` /
    // `sisterLinksRef.current` explicitly per the line-153 invariant and
    // therefore don't need a shadow.
    const allKeywords = keywordsRef.current;
    const pathways = pathwaysRef.current;

    // Forensic emit: pre_apply. Counts captured immediately before the
    // applier mutates state, so a pre/post pair characterizes what the
    // apply did to the canvas.
    emitForensic('pre_apply', batch.batchNum, {
      canvasNodeCount: nodesRef.current.length,
      canvasKeywordCount: keywordsRef.current.length,
    });

    // Fetch canonical nextStableIdN so issued stableIds cannot collide with
    // anything that may have changed since page load (e.g., admin manually
    // added a node in another tab).
    const canvasStateRes = await authFetch('/api/projects/' + projectId + '/canvas');
    const canvasStateData = await canvasStateRes.json();
    const nextStableIdN = canvasStateData.canvasState?.nextStableIdN ?? 1;

    const originalNodes = nodesRef.current;
    const originalSisterLinks = sisterLinksRef.current;

    const state = buildCanvasStateForApplier(originalNodes, originalSisterLinks, nextStableIdN);
    const applyResult = applyOperations(state, ops, {
      consolidationMode: options?.consolidationMode === true,
      regularBatchMode: options?.regularBatchMode === true,
    });
    if (!applyResult.ok) {
      // Should not happen because validateResultV3 ran the same call and
      // passed; safety net only.
      const msg = applyResult.errors.map(e => e.message).join('; ');
      aaLog('  ✗ Applier rejected operations: ' + msg, 'error');
      throw new Error('Apply failed: ' + msg);
    }

    aaLog(
      '  Applied ' + ops.length + ' operations → ' +
      applyResult.newState.nodes.length + ' topics, ' +
      applyResult.newState.sisterLinks.length + ' sister links, ' +
      applyResult.archivedKeywords.length + ' archived keywords',
      'info',
    );

    // Scale Session D — record touches now that the applier accepted the ops.
    // recordTouchesFromOps walks aliasResolutions so $newN aliases stamp their
    // newly-assigned t-N stableIds. Idempotent: a retry after a downstream
    // rebuild failure would stamp the same topics with the same batch num.
    // INPUT_CONTEXT_SCALING_DESIGN.md §2.1 (Cluster 2 Q5 — operation-references-touch).
    recordTouchesFromOps(
      touchTrackerRef.current,
      ops,
      batch.batchNum,
      applyResult.aliasResolutions,
    );

    // Materialize the rebuild payload.
    const payload = materializeRebuildPayload({
      originalNodes,
      originalSisterLinks,
      originalPathwayIds: pathways.map(p => p.id),
      applierNewState: applyResult.newState,
    });

    // P3-F8 layout pass over the materialized nodes.
    const layoutNodes: LayoutNode[] = payload.nodes.map(n => ({
      id: n.id as string,
      title: (n.title as string) || '',
      description: (n.description as string) || '',
      altTitles: (n.altTitles as string[]) || [],
      x: n.x as number,
      y: n.y as number,
      w: n.w as number,
      h: n.h as number,
      baseY: ((n.baseY as number | undefined) ?? (n.y as number)) || 0,
      parentId: (n.parentId as string | null) ?? null,
      pathwayId: (n.pathwayId as string | null) ?? null,
      relationshipType: (n.relationshipType as string) || '',
      linkedKwIds: (n.linkedKwIds as string[]) || [],
      userMinH: (n.userMinH as number | null) ?? null,
    }));

    // Profiling marks (added 2026-05-02-b for browser-freeze diagnosis;
    // see docs/BROWSER_FREEZE_FIX_DESIGN.md). Visible in DevTools Performance
    // > Timings track AND queryable via performance.getEntriesByType('measure').
    // Cost is sub-millisecond per mark; safe to leave in production.
    performance.mark('aa.calcHeights-start');
    for (const ln of layoutNodes) ln.h = calcNodeHeight(ln);
    performance.mark('aa.calcHeights-end');
    performance.measure('aa.calcHeights', 'aa.calcHeights-start', 'aa.calcHeights-end');

    performance.mark('aa.runLayoutPass-start');
    runLayoutPass(layoutNodes, [...pathways, ...payload.pathways]);
    performance.mark('aa.runLayoutPass-end');
    performance.measure('aa.runLayoutPass', 'aa.runLayoutPass-start', 'aa.runLayoutPass-end');

    const byId = new Map<string, LayoutNode>();
    for (const ln of layoutNodes) byId.set(ln.id, ln);
    for (const rn of payload.nodes) {
      const ln = byId.get(rn.id as string);
      if (!ln) continue;
      rn.x = ln.x;
      rn.y = ln.y;
      rn.h = ln.h;
      rn.baseY = ln.baseY ?? ln.y;
    }
    // Surface the two timings to the activity log as well, so the director
    // sees concrete numbers without opening DevTools each batch.
    const calcHeightsEntries = performance.getEntriesByName('aa.calcHeights', 'measure');
    const layoutPassEntries = performance.getEntriesByName('aa.runLayoutPass', 'measure');
    const calcHeightsMs = calcHeightsEntries.length ? calcHeightsEntries[calcHeightsEntries.length - 1].duration : 0;
    const layoutPassMs = layoutPassEntries.length ? layoutPassEntries[layoutPassEntries.length - 1].duration : 0;
    aaLog(
      '  Layout pass complete (' + payload.nodes.length + ' nodes positioned; ' +
      'heights=' + Math.round(calcHeightsMs) + 'ms, layout=' + Math.round(layoutPassMs) + 'ms)',
      'info',
    );

    // ── Pre-compute keyword updates + archive intents BEFORE the rebuild ─
    // POST so they can ride along in the same atomic transaction (per
    // KEYWORD_CLUSTERING_ACTIVE.md POST-2026-05-04-D STATE block item (a)
    // approach (iii) — director-approved 2026-05-05). This replaces what
    // used to be (post-rebuild):
    //   1. Sequential `for await` loop hitting POST /removed-keywords once
    //      per archived keyword.
    //   2. Fire-and-forget `onBatchUpdateKeywords(kwTopicUpdates)` that
    //      forEach-fanned out into ~N parallel PATCH /keywords/[id] calls
    //      (the burst that exhausted Supabase max_connections=60 at Nano).
    //   3. A second fire-and-forget for the reconciliation `onBatchUpdate
    //      Keywords(reconcile.updates)` after the post-rebuild refresh.
    // All three are now folded into the single /canvas/rebuild $transaction.

    const titleByStableId = new Map<string, string>();
    const descByStableId = new Map<string, string>();
    for (const n of applyResult.newState.nodes) {
      titleByStableId.set(n.stableId, n.title);
      descByStableId.set(n.stableId, n.description);
    }
    const placementsByKeyword = new Map<string, Array<{ stableId: string; placement: string }>>();
    for (const n of applyResult.newState.nodes) {
      for (const [kwId, placement] of Object.entries(n.keywordPlacements)) {
        if (!placementsByKeyword.has(kwId)) placementsByKeyword.set(kwId, []);
        placementsByKeyword.get(kwId)!.push({ stableId: n.stableId, placement });
      }
    }

    // Compute reconciliation updates pre-rebuild — they're derivable from
    // applyResult alone (placedSet + archivedSet are known from the applier
    // output, no server round trip needed). The post-rebuild refresh below
    // will then see the reconciled status without a second fan-out.
    const placedSet = new Set(placementsByKeyword.keys());
    const archivedSet = new Set(applyResult.archivedKeywords.map(a => a.keywordId));
    const reconcile = computeReconciliationUpdates(allKeywords, placedSet, archivedSet);

    // Merge placement-driven updates and reconciliation-driven updates by
    // keyword id. A single id can need BOTH a topic+canvasLoc refresh
    // (because it's still placed) AND a sortingStatus flip (because the
    // status drifted) — merge field-by-field so the server runs ONE
    // updateMany per id instead of two.
    const mergedKeywordUpdates = new Map<string, { id: string; [key: string]: unknown }>();
    for (const [kwId, placements] of placementsByKeyword) {
      const topics = placements.map(p => titleByStableId.get(p.stableId) ?? '').filter(Boolean);
      const canvasLoc: Record<string, string> = {};
      for (const p of placements) {
        const t = titleByStableId.get(p.stableId);
        const d = descByStableId.get(p.stableId) ?? '';
        if (t) canvasLoc[t] = d;
      }
      mergedKeywordUpdates.set(kwId, {
        id: kwId,
        topic: topics.join(' | '),
        canvasLoc,
      });
    }
    for (const r of reconcile.updates) {
      const existing = mergedKeywordUpdates.get(r.id);
      if (existing) {
        existing.sortingStatus = r.sortingStatus;
      } else {
        mergedKeywordUpdates.set(r.id, { id: r.id, sortingStatus: r.sortingStatus });
      }
    }
    const keywordUpdates = Array.from(mergedKeywordUpdates.values());

    const archiveKeywords = applyResult.archivedKeywords.map(a => ({
      keywordId: a.keywordId,
      reason: a.reason || '(no reason given)',
    }));

    // Augment the rebuild payload with the folded fan-out + archive payloads.
    // Server treats both fields as optional; Auto-Analyze always sends them
    // (possibly as empty arrays) so the contract is consistent.
    const augmentedPayload = {
      ...payload,
      keywordUpdates,
      archiveKeywords,
    };

    // Atomic rebuild + keyword updates + archives — all one transaction.
    aaLog('  Applying to canvas (atomic rebuild)…', 'info');
    try {
      performance.mark('aa.stringify-start');
      const rebuildBody = JSON.stringify(augmentedPayload);
      performance.mark('aa.stringify-end');
      performance.measure('aa.stringify', 'aa.stringify-start', 'aa.stringify-end');

      performance.mark('aa.rebuildHTTP-start');
      const res = await authFetch('/api/projects/' + projectId + '/canvas/rebuild', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: rebuildBody,
      });
      performance.mark('aa.rebuildHTTP-end');
      performance.measure('aa.rebuildHTTP', 'aa.rebuildHTTP-start', 'aa.rebuildHTTP-end');
      if (!res.ok) {
        const errText = await res.text();
        throw new Error('Canvas rebuild failed: ' + errText);
      }
      aaLog(
        '  ✓ Canvas rebuilt (' + payload.nodes.length + ' nodes, ' +
        payload.deleteNodeIds.length + ' removed, ' +
        payload.sisterLinks.length + ' new sister links, ' +
        keywordUpdates.length + ' keyword updates, ' +
        archiveKeywords.length + ' archived)',
        'ok',
      );
    } catch (e) {
      aaLog('  ✗ Canvas rebuild FAILED — all changes rolled back. ' + (e instanceof Error ? e.message : ''), 'error');
      throw e;
    }

    // Per-archive log lines (preserved for director visibility — same shape
    // as the prior per-archive POST loop, just emitted after the atomic
    // commit instead of after each individual POST).
    for (const a of applyResult.archivedKeywords) {
      aaLog('  ↻ Archived keyword ' + a.keywordId + (a.reason ? ' — ' + a.reason : ''), 'info');
    }

    // Reconciliation log line (same shape as before; no second fan-out).
    if (reconcile.updates.length > 0) {
      aaLog(
        '  ↻ Reconciliation: ' + reconcile.flippedToAiSorted + ' on-canvas → AI-Sorted, ' +
        reconcile.flippedToReshuffled + ' off-canvas → Reshuffled',
        reconcile.flippedToReshuffled > 0 ? 'warn' : 'ok',
      );
    }

    // Refresh UI. The hardened useCanvas contract throws on failure, so a
    // 5xx flake on /canvas/nodes (the 2026-04-28 canvas-blanking trigger)
    // now propagates here.
    //
    // Per src/lib/post-rebuild-fetch-retry.ts (and BROWSER_FREEZE_FIX_DESIGN
    // §9.5.1 + the 2026-05-02-c HTTP 500 retry regression entry in
    // ROADMAP.md): the atomic rebuild above succeeded, so the SERVER canvas
    // state is canonical post-apply. If the follow-up refresh now fails,
    // letting the throw propagate naively to runLoop's outer catch would
    // trigger a WHOLE-batch retry, and attempt 2 would feed the model the
    // STALE pre-apply client state (preserved by useCanvas's defensive
    // contract). Ops returned for the stale snapshot can collide with
    // attempt-1's already-applied state — visibly via cyclic stableId
    // references (applier rejects), or silently via stableId-collision
    // overwrites at the rebuild route's per-(projectWorkflowId, stableId)
    // upsert (no guard catches this).
    //
    // The helper retries just the refresh up to 3 times (2s, 5s waits).
    // On persistent failure it throws an error annotated with both
    // _noRetry: true (so runLoop skips its standard 5s-then-retry path)
    // and _postRebuildFetchFailed: true (so the runLoop catch below knows
    // to mark the batch complete on the server, advance the cursor, save
    // the checkpoint, and pause for a manual browser refresh + Resume).
    await runRefreshWithRetry(
      async () => {
        await onRefreshCanvas();
        await onRefreshKeywords();
      },
      {
        onAttemptFailed: (attempt, max, nextBackoffMs, e) => {
          const detail = e instanceof Error ? e.message : String(e);
          aaLog(
            '  ⚠ Post-rebuild canvas refresh failed (attempt ' + attempt +
              '/' + max + '): ' + detail + '. Server state is canonical; ' +
              'retrying refresh in ' + (nextBackoffMs / 1000) + 's…',
            'warn',
          );
        },
      },
    );

    // Bug 1 secondary guard: track canvas size for the runLoop fail-fast
    // pre-flight. If the next batch sees nodesRef.current.length === 0
    // with this counter > 0, runLoop pauses immediately. Independent of
    // useCanvas's defensive contract; both must fail before a blanking
    // event can corrupt a run again.
    lastSeenNodesCountRef.current = applyResult.newState.nodes.length;

    // (P3-F7 status reconciliation moved up — now folded into the same
    // /canvas/rebuild $transaction as the placement updates per the
    // 2026-05-05 atomic-batch fold-in. `placedSet` + `archivedSet` +
    // `reconcile` are computed pre-rebuild and used both to build the
    // payload AND to mark verified batch keywords below.)

    // Mark batch keywords as ✓.
    const verified = batch.keywordIds.filter(id => placedSet.has(id) || archivedSet.has(id));
    const unplacedAfterApply = batch.keywordIds.filter(id => !placedSet.has(id) && !archivedSet.has(id));
    if (verified.length === batch.keywordIds.length) {
      aaLog('  ✓ All ' + batch.keywordIds.length + ' keywords verified (placed or archived).', 'ok');
    } else {
      aaLog('  ⚠ ' + unplacedAfterApply.length + ' batch keyword(s) unplaced after apply: ' + unplacedAfterApply.join(', '), 'warn');
      batch._unplacedKws = unplacedAfterApply.map(id => {
        const k = allKeywords.find(x => x.id === id);
        return k ? k.keyword : id;
      });
    }

    // Forensic emit: post_apply. Captures the new canvas counts after the
    // rebuild, the reconciliation outcome, and any batch-level errors
    // (currently the unplaced-keyword warning surfaces here as a soft error).
    const postApplyErrors: string[] = [];
    if (unplacedAfterApply.length > 0) {
      postApplyErrors.push(
        unplacedAfterApply.length + ' batch keyword(s) unplaced after apply: ' + unplacedAfterApply.join(','),
      );
    }
    emitForensic('post_apply', batch.batchNum, {
      canvasNodeCount: applyResult.newState.nodes.length,
      canvasKeywordCount: keywordsRef.current.length,
      reconciliation: {
        to_ai_sorted: reconcile.flippedToAiSorted,
        to_reshuffled: reconcile.flippedToReshuffled,
      },
      errors: postApplyErrors.length > 0 ? postApplyErrors : undefined,
    });
  }

  /* ── Scale Session E — Consolidation pass assembler + runner ─
     Per INPUT_CONTEXT_SCALING_DESIGN.md §4.1 + §6 Scale Session E.
     Two trigger paths share `runConsolidationPass`:
       (1) auto-fire: runLoop calls it after every Nth successful regular
           batch when canvas size > min and cadence > 0;
       (2) admin: handleConsolidateNow calls it from the Consolidate Now button.
     The pass uses a separate prompt pair (Consolidation Initial + Primer)
     pasted into dedicated panel slots, sends the full canvas at Tier 0
     (no batch keywords), and applies the resulting ops with the applier's
     consolidationMode flag (forbids ADD_TOPIC + ADD_KEYWORD; allows
     everything else). Touches are recorded normally so consolidation-touched
     topics enter the recency window for the next 5 (default) regular batches. */
  function assembleConsolidationPrompt(): { systemText: string; userContent: string } {
    let systemText = consolidationInitialPrompt;
    systemText = systemText.replace(/\[PRIMARY_SEED_WORDS\]/g, seedWords);
    systemText = systemText.replace(/\[VOLUME_THRESHOLD\]/g, String(volumeThreshold));
    if (consolidationPrimerPrompt) {
      systemText += '\n\n--- TOPICS LAYOUT TABLE PRIMER (CONSOLIDATION) ---\n\n' + consolidationPrimerPrompt;
    }
    // Consolidation always uses the full Tier 0 view of the canvas — that's
    // the whole point of the pass per §4.1 (Reevaluation Pass coverage on
    // topics that per-batch tier-mode runs only saw at Tier 1 / Tier 2).
    // Sister Nodes column is omitted (2026-05-05 sister-link drift cleanup —
    // Option A): existing sister links on the canvas are invisible to the
    // consolidation model; sister links are deferred to a separate second-pass
    // functionality run; the applier rejects ADD/REMOVE_SISTER_LINK in
    // consolidation mode as a silent backstop in case the model invents them
    // from prior training.
    const inputTsv = buildOperationsInputTsv(
      nodesRef.current,
      sisterLinksRef.current,
      keywordsRef.current,
      { serializationMode: 'full', omitSisterNodesColumn: true },
    );
    let userContent = '';
    userContent += 'CONSOLIDATION PASS — full canvas at Tier 0 (every topic at full detail).\n\n';
    userContent += 'There are NO batch keywords for this pass. Your input is the canvas only.\n\n';
    userContent += 'Here is the current Topics Layout Table (TSV input — read it; do not re-emit it):\n\n';
    userContent += '=== TIER 0 ===\n' + inputTsv + '\n\n';
    userContent += 'Primary seed word(s): ' + seedWords + '\n';
    userContent += 'Volume threshold: ' + volumeThreshold + '\n\n';
    userContent +=
      'Scan the entire canvas for structural improvements per the Consolidation Reevaluation Pass section. ' +
      'Emit operations restricted to the consolidation vocabulary: MERGE_TOPICS, SPLIT_TOPIC, MOVE_TOPIC, ' +
      'DELETE_TOPIC, UPDATE_TOPIC_TITLE, UPDATE_TOPIC_DESCRIPTION, MOVE_KEYWORD, REMOVE_KEYWORD, ' +
      'ARCHIVE_KEYWORD. ADD_TOPIC and ADD_KEYWORD are FORBIDDEN — emitting either fails the entire batch ' +
      'atomically. An empty operation list is valid output if the canvas is structurally clean.\n\n';
    userContent += 'Emit your output as the operations block defined in the Primer.';
    return { systemText, userContent };
  }

  /**
   * Runs one consolidation pass against the current canvas.
   *
   * `triggerSource` is logged for traceability:
   *   - 'auto' = fired by runLoop's cadence gate
   *   - 'admin' = fired by the Consolidate Now button
   *
   * Returns true on success (operation list parsed + applied OR genuinely
   * empty), false on any failure. The auto-fire counter is reset to 0 in
   * either case (success-reset cycles cleanly; failure-reset prevents
   * retry-storm if consolidation keeps failing for some reason).
   *
   * `currentBatchNumRef` is read inside doApplyV3 → recordTouchesFromOps to
   * stamp the touch tracker. For admin-triggered consolidation at IDLE,
   * `currentBatchNumRef.current` is 0 and the next handleStart() resets the
   * tracker anyway, so admin-touch stamps don't influence subsequent runs.
   */
  async function runConsolidationPass(triggerSource: 'auto' | 'admin'): Promise<boolean> {
    const consolBatch: BatchObj = {
      // batchNum=currentBatchNumRef.current ties consolidation touches to the
      // most recent regular batch's frame of reference (so the next batch
      // sees consolidation-touched topics as 0-batches-ago — Tier 0 for the
      // next `recencyWindow` batches). For admin-triggered runs at IDLE, this
      // is 0, which is fine (touches are wiped at the next handleStart anyway).
      batchNum: currentBatchNumRef.current,
      keywordIds: [],
      keywords: [],
      status: 'in_progress',
      attempts: 1,
      stallAttempts: 0,
      maxAttempts: 1,
      maxStallAttempts: 3,
      result: null,
      error: null,
      startedAt: Date.now(),
      completedAt: null,
      reevalReport: '',
      kwTopicMap: null,
      tokensUsed: { input: 0, output: 0 },
      cost: 0,
      newTopicCount: 0,
    };
    aaLog(
      '═══ Consolidation pass (' + triggerSource + ', canvas=' + nodesRef.current.length + ' topics) ═══',
      'info',
    );
    try {
      const { systemText, userContent } = assembleConsolidationPrompt();
      const estTokens = Math.ceil((systemText.length + userContent.length) / 4);
      aaLog('Consolidation — sending ~' + estTokens.toLocaleString() + ' input tokens…', 'info');

      const requestBody = buildRequestBody(systemText, userContent);
      const apiResponse = await callApi(requestBody, consolBatch.batchNum);

      const textContent = apiResponse.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text || '')
        .join('\n');
      if (!textContent.trim()) throw new Error('Consolidation API returned empty text content');

      const tokensUsed = {
        input:
          (apiResponse.usage.input_tokens || 0) +
          (apiResponse.usage.cache_creation_input_tokens || 0) +
          (apiResponse.usage.cache_read_input_tokens || 0),
        output: apiResponse.usage.output_tokens || 0,
      };
      const consolCost = calcCost(tokensUsed);
      setTotalSpent((prev) => prev + consolCost);
      totalSpentRef.current += consolCost;
      if (apiResponse.usage.cache_read_input_tokens > 0) {
        aaLog('  Cache hit: ' + apiResponse.usage.cache_read_input_tokens + ' tokens', 'info');
      }
      aaLog(
        '  Consolidation API call complete. Input: ' + tokensUsed.input.toLocaleString() +
        ', Output: ' + tokensUsed.output.toLocaleString() + '. Cost: $' + consolCost.toFixed(3),
        'info',
      );

      const parsed = parseOperationsJsonl(textContent);
      if (parsed.errors.length > 0) {
        aaLog(
          '  ✗ Consolidation parse errors: ' + parsed.errors.slice(0, 3).join('; '),
          'error',
        );
        return false;
      }
      if (parsed.operations.length === 0) {
        aaLog(
          '  ✓ Consolidation: no structural changes warranted (canvas is structurally clean).',
          'ok',
        );
        return true;
      }
      // Apply with consolidationMode flag. Applier rejects ADD_TOPIC /
      // ADD_KEYWORD atomically. recordTouchesFromOps inside doApplyV3 stamps
      // the touched topics so the next regular batch sees them at Tier 0.
      await doApplyV3(consolBatch, parsed.operations, { consolidationMode: true });
      aaLog(
        '  ✓ Consolidation applied (' + parsed.operations.length + ' operations).',
        'ok',
      );
      return true;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      aaLog('  ✗ Consolidation FAILED: ' + errMsg, 'error');
      return false;
    } finally {
      // Reset cadence counter regardless of outcome — we don't want a failing
      // consolidation pass to retry-storm on every subsequent batch.
      batchesSinceConsolidationRef.current = 0;
    }
  }

  /**
   * Admin-triggered consolidation. Available when the panel is IDLE or
   * PAUSED. Does basic readiness checks (canvas not empty, prompts present,
   * API key present in direct mode) before kicking off the pass.
   */
  async function handleConsolidateNow() {
    if (consolidationBusy) return;
    if (aaState === 'RUNNING') {
      alert('Consolidate Now: pause or cancel the running run first.');
      return;
    }
    if (nodesRef.current.length < 2) {
      alert('Consolidate Now: canvas needs at least 2 topics to consolidate.');
      return;
    }
    if (!consolidationInitialPrompt || consolidationInitialPrompt.length < 100) {
      alert('Consolidate Now: paste the Consolidation Initial Prompt first (in the AI Analysis Prompt section).');
      setPromptExpanded(true);
      return;
    }
    if (apiMode === 'direct' && !apiKey.trim()) {
      alert('Consolidate Now: enter your Anthropic API key first.');
      return;
    }
    setConsolidationBusy(true);
    try {
      // doApplyV3 (called inside runConsolidationPass when ops are non-empty)
      // already calls onRefreshCanvas + onRefreshKeywords. The empty-ops
      // branch returns true without applying, so no refresh is needed there
      // either (canvas is unchanged).
      await runConsolidationPass('admin');
    } finally {
      setConsolidationBusy(false);
    }
  }

  /* ── Main run loop ─────────────────────────────────────────── */
  /** @runloop-reachable */
  async function runLoop() {
    // Initialise the canvas-size watermark on first entry to runLoop. The
    // pre-flight below uses this to detect a non-zero → zero transition
    // between batches — a signature of canvas-blanking. -1 sentinel means
    // "not yet observed."
    if (lastSeenNodesCountRef.current === -1) {
      lastSeenNodesCountRef.current = nodesRef.current.length;
    }

    while (runningRef.current && !abortRef.current && currentIdxRef.current < batchesRef.current.length) {
      // Bug 1 fail-fast pre-flight: if the canvas was non-empty after the
      // previous batch's apply but is empty NOW, something silently zeroed
      // client state between batches (the 2026-04-28 canvas-blanking
      // signature, or any future failure mode that produces the same
      // symptom from a different root cause). Pause immediately rather
      // than feeding empty TSV to the model and silently abandoning a
      // batch's keywords.
      if (lastSeenNodesCountRef.current > 0 && nodesRef.current.length === 0) {
        aaLog(
          '⚠ Canvas unexpectedly empty between batches (had ' +
          lastSeenNodesCountRef.current + ' topics, now 0). Pausing run — ' +
          'investigate before resuming. See ROADMAP "Canvas-Blanking Intermittent Bug".',
          'error',
        );
        setAaState('API_ERROR');
        runningRef.current = false;
        setBatches([...batchesRef.current]);
        return;
      }

      const idx = currentIdxRef.current;
      const batch = batchesRef.current[idx];

      if (batch.status === 'complete' || batch.status === 'skipped') {
        setCurrentIdx(prev => prev + 1);
        currentIdxRef.current++;
        continue;
      }

      // Scale Session D — stamp the current batch number for the tier
      // decider's recency math. saveCheckpoint persists this so Pause/Resume
      // doesn't drift the touch-tracker frame of reference.
      currentBatchNumRef.current = batch.batchNum;

      batch.status = 'in_progress';
      batch.startedAt = Date.now();
      batch.attempts++;
      setBatches([...batchesRef.current]);
      aaLog('Batch ' + batch.batchNum + ' — processing ' + batch.keywords.length + ' keywords (attempt ' + batch.attempts + ')…', 'info');

      try {
        const v3Result = await processBatchV3(batch);
        if (abortRef.current) break;

        const v3AttemptCost = calcCost(v3Result.tokensUsed);
        batch.tokensUsed = v3Result.tokensUsed;
        batch.cost += v3AttemptCost;
        setTotalSpent(prev => prev + v3AttemptCost);
        totalSpentRef.current += v3AttemptCost;
        aaLog('  Batch ' + batch.batchNum + ' attempt ' + batch.attempts + ' — API call complete. Cost: $' + v3AttemptCost.toFixed(3), 'info');

        const v3Validation = validateResultV3(v3Result, batch);
        if (!v3Validation.ok) {
          if (batch.attempts < batch.maxAttempts) {
            const headline = v3Validation.errors.slice(0, 3).join('; ');
            aaLog('Batch ' + batch.batchNum + ' validation failed: ' + headline + ' — retrying…', 'warn');
            batch.status = 'queued';
            continue;
          } else {
            batch.status = 'failed';
            batch.error = 'Validation failed: ' + v3Validation.errors.join('; ');
            batch.completedAt = Date.now();
            aaLog('Batch ' + batch.batchNum + ' FAILED: ' + batch.error, 'error');
            setCurrentIdx(prev => prev + 1);
            currentIdxRef.current++;
            setBatches([...batchesRef.current]);
            continue;
          }
        }

        // Populate newTopics from ADD_TOPIC ops so BATCH_REVIEW can display them.
        v3Result.newTopics = v3Validation.ops
          .filter((o): o is Extract<typeof v3Validation.ops[number], { type: 'ADD_TOPIC' }> => o.type === 'ADD_TOPIC')
          .map(o => o.title);
        batch.result = v3Result;
        batch.reevalReport = '';
        batch.newTopicCount = v3Result.newTopics.length;
        aaLog('Batch ' + batch.batchNum + ' — passed validation. Total cost (all attempts): $' + batch.cost.toFixed(3), 'ok');

        if (reviewMode) {
          setPendingResult(v3Result);
          batch._v3Ops = v3Validation.ops;
          batch.status = 'reviewing';
          setAaState('BATCH_REVIEW');
          setBatches([...batchesRef.current]);
          return;
        } else {
          // Regular per-batch apply — recency-stickiness fix:
          // INPUT_CONTEXT_SCALING_DESIGN.md §6 D3 partial validation outcome.
          // The applier rejects ADD_SISTER_LINK / REMOVE_SISTER_LINK in this
          // mode (sister links are full-canvas decisions handled by the
          // consolidation pass). Defense in depth — the V4 prompt also drops
          // these ops from the per-batch operation vocabulary.
          await doApplyV3(batch, v3Validation.ops, { regularBatchMode: true });
          batch.status = 'complete';
          batch.completedAt = Date.now();
          aaLog('Batch ' + batch.batchNum + ' — applied.', 'ok');
          saveCheckpoint();
          setCurrentIdx(prev => prev + 1);
          currentIdxRef.current++;
          setBatches([...batchesRef.current]);

          // Scale Session E — consolidation auto-fire gate.
          // Increment the counter after every successful regular batch apply;
          // when the counter hits the cadence AND the canvas is large enough
          // AND the consolidation prompt is loaded AND we're not aborted, fire
          // a consolidation pass before continuing to the next batch. The
          // pass resets the counter to 0 inside its finally block.
          // Cadence = 0 disables auto-fire entirely (admin Consolidate Now still works).
          batchesSinceConsolidationRef.current += 1;
          if (
            !abortRef.current &&
            consolidationCadence > 0 &&
            batchesSinceConsolidationRef.current >= consolidationCadence &&
            nodesRef.current.length >= consolidationMinCanvasSize &&
            consolidationInitialPrompt && consolidationInitialPrompt.length >= 100
          ) {
            await runConsolidationPass('auto');
            // Persist the post-consolidation state (counter reset + any canvas
            // changes propagated through doApplyV3 → onRefreshCanvas).
            saveCheckpoint();
          } else if (
            consolidationCadence > 0 &&
            batchesSinceConsolidationRef.current >= consolidationCadence &&
            nodesRef.current.length >= consolidationMinCanvasSize &&
            (!consolidationInitialPrompt || consolidationInitialPrompt.length < 100)
          ) {
            // Cadence + canvas-size both met but the prompt is missing — log
            // a one-time-per-cadence-cycle warning so the director knows why
            // auto-fire didn't run, then reset to silence this until the next
            // cycle would otherwise have triggered.
            aaLog(
              'Consolidation auto-fire skipped: cadence reached (' + consolidationCadence +
              ' batches) and canvas large enough, but Consolidation Initial Prompt is empty. ' +
              'Paste the prompt to enable auto-consolidation, or set cadence to 0 to disable.',
              'warn',
            );
            batchesSinceConsolidationRef.current = 0;
          }
          continue;
        }

      } catch (err: unknown) {
        if (abortRef.current) break;
        const errObj = err as Error & {
          _isStall?: boolean;
          _noRetry?: boolean;
          _postRebuildFetchFailed?: boolean;
        };
        const errMsg = errObj.message || String(err);

        // Forensic emit: batch error. Phase=post_api_call carries the
        // error message so the diagnostic record has clear "this batch
        // failed at the API stage with X" signal even when subsequent
        // pre/post_apply pairs never fire.
        emitForensic('post_api_call', batch.batchNum, {
          canvasNodeCount: nodesRef.current.length,
          canvasKeywordCount: keywordsRef.current.length,
          errors: [errMsg],
        });

        // Post-rebuild fetch failed despite the helper's retries: the
        // atomic rebuild succeeded, so the SERVER state is canonical
        // post-apply. Mark the batch complete (it IS done on the server),
        // advance the cursor, save the checkpoint, and pause the run so
        // the director can refresh the browser to resync UI before
        // resuming. Resume picks up at the NEXT batch against fresh
        // server state — eliminates the stale-client-retry corruption
        // path described in src/lib/post-rebuild-fetch-retry.ts.
        if (errObj._postRebuildFetchFailed) {
          batch.status = 'complete';
          batch.completedAt = Date.now();
          aaLog(
            'Batch ' + batch.batchNum + ' — applied server-side; UI refresh ' +
              'failed. Refresh the browser tab and click Resume; the run will ' +
              'continue at the next batch with fresh canvas state. ' +
              'Detail: ' + errMsg,
            'warn',
          );
          setCurrentIdx(prev => prev + 1);
          currentIdxRef.current++;
          saveCheckpoint();
          setAaState('API_ERROR');
          runningRef.current = false;
          setBatches([...batchesRef.current]);
          return;
        }

        if (errObj._isStall) {
          batch.attempts--;
          batch.stallAttempts++;
          if (batch.stallAttempts < batch.maxStallAttempts) {
            aaLog('Batch ' + batch.batchNum + ' stalled (retry ' + batch.stallAttempts + ') — reconnecting…', 'warn');
            batch.status = 'queued';
            continue;
          }
        }
        if (batch.attempts < batch.maxAttempts && !errObj._noRetry && !errObj._isStall) {
          const backoff = [5000, 15000, 45000][batch.attempts - 1] || 45000;
          aaLog('Batch ' + batch.batchNum + ' error: ' + errMsg + ' — retrying in ' + (backoff / 1000) + 's…', 'warn');
          batch.status = 'queued';
          await new Promise(r => setTimeout(r, backoff));
          continue;
        } else {
          batch.status = 'failed';
          batch.error = errMsg;
          batch.completedAt = Date.now();
          aaLog('Batch ' + batch.batchNum + ' FAILED: ' + errMsg, 'error');
          setAaState('API_ERROR');
          runningRef.current = false;
          setBatches([...batchesRef.current]);
          return;
        }
      }
    }

    // Loop finished
    if (!abortRef.current && currentIdxRef.current >= batchesRef.current.length) {
      setAaState('ALL_COMPLETE');
      runningRef.current = false;
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      const completed = batchesRef.current.filter(b => b.status === 'complete').length;
      const failed = batchesRef.current.filter(b => b.status === 'failed').length;
      clearCheckpoint();
      aaLog('═══ ALL BATCHES COMPLETE ═══', 'ok');
      aaLog('Completed: ' + completed + ' | Failed: ' + failed + ' | Cost: $' + totalSpentRef.current.toFixed(2), 'ok');
    }
  }

  /* ── Control functions ─────────────────────────────────────── */
  /**
   * Generates a fresh session id for forensic-log records. Uses
   * `crypto.randomUUID()` when available (modern browsers); falls back
   * to a timestamp+random concatenation if not. The id ties together
   * every record from one run; multiple Pause/Resume cycles share one
   * session id.
   */
  function newSessionId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'sess-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  /**
   * Wraps the existing `authFetch` for the preflight runner's fetcher
   * dependency. authFetch throws on missing JWT, which the preflight
   * checks correctly classify as P5/P6/P9 fail; no special handling.
   */
  async function preflightFetcher(url: string, init?: RequestInit): Promise<Response> {
    return authFetch(url, init);
  }

  /**
   * Cleared-state initialiser shared by handleStart's "actually start the
   * run" path. Was inlined inside handleStart pre-preflight; extracted so
   * the preflight gate can call it after the chain passes without
   * duplicating the body.
   */
  function startRunLoop(queue: BatchObj[], unsortedCount: number) {
    setBatches(queue);
    batchesRef.current = queue;
    setCurrentIdx(0);
    currentIdxRef.current = 0;
    setTotalSpent(0);
    totalSpentRef.current = 0;
    setLogEntries([]);
    setBatchTier(0);
    batchTierRef.current = 0;
    abortRef.current = false;
    startTimeRef.current = Date.now();

    // Fresh forensic session: clear the buffer + mint a new id. Any prior
    // run's records are gone after this — the user has had the chance to
    // download them via the panel button before clicking Start again.
    forensicLogRef.current.clear();
    sessionIdRef.current = newSessionId();
    setForensicCount(0);

    // Scale Session D — fresh run starts with an empty touch tracker. Without
    // this reset, a tracker carried over from a prior cancelled run would
    // misclassify topics from this run as "recently touched" relative to a
    // batch numbering that doesn't match.
    touchTrackerRef.current = createTouchTracker();
    currentBatchNumRef.current = 0;
    // Scale Session E — fresh run starts the consolidation cadence counter
    // at 0 so the first consolidation pass fires after `consolidationCadence`
    // successful batches.
    batchesSinceConsolidationRef.current = 0;

    aaLog('Auto-Analyze started. ' + queue.length + ' batches, ' + unsortedCount + ' keywords.', 'info');
    const scopeLabel =
      keywordScope === 'unsorted-only' ? 'Unsorted + Reshuffled'
      : keywordScope === 'non-ai-sorted' ? 'Non-AI-Sorted'
      : 'All keywords';
    aaLog('Model: ' + model + ' | Mode: ' + processingMode + ' | Scope: ' + scopeLabel, 'info');

    setAaState('RUNNING');
    runningRef.current = true;

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    runLoop();
  }

  async function handleStart() {
    // Fast guard: don't even attempt the start if obvious things are missing.
    // These are also caught by the preflight chain (P1, P2, P3, P8) but the
    // alert() gives an immediate signal at click time before we render the
    // preflight UI section.
    if (apiMode === 'direct' && !apiKey.trim()) { alert('Please enter your Anthropic API key.'); return; }
    if (!seedWords.trim()) { alert('Please enter seed words.'); return; }
    if (!initialPrompt || initialPrompt.length < 100) { alert('Please paste your AI Analysis Prompt (expand the prompt section).'); setPromptExpanded(true); return; }
    const unsorted = getUnsortedKws();
    if (!unsorted.length) { alert('No keywords matching scope.'); return; }

    const queue = buildQueue();

    // Pre-flight (per DEFENSE_IN_DEPTH_AUDIT_DESIGN §6 + director Q3=A
    // including P9 cheap test API call). Power-users can opt out via the
    // Skip checkbox, and the run starts immediately.
    if (!skipPreflight) {
      setPreflightRunning(true);
      setPreflightFailed(false);
      setPreflightChecks([]);
      aaLog('Running pre-flight checks (12 checks, ~2 seconds)…', 'info');
      try {
        const result = await runPreflight({
          apiMode,
          apiKey,
          model,
          seedWords,
          initialPrompt,
          primerPrompt,
          consolidationInitialPrompt,
          consolidationPrimerPrompt,
          consolidationCadence,
          projectId,
          nodes: nodesRef.current.map((n) => ({ stableId: n.stableId, pathwayId: n.pathwayId ?? null })),
          keywords: keywordsRef.current.map((k) => ({ id: k.id })),
          pathways: pathwaysRef.current.map((p) => ({ id: p.id })),
          unsortedKeywordCount: unsorted.length,
          fetcher: preflightFetcher,
          rawFetcher: globalThis.fetch.bind(globalThis),
          storage: globalThis.localStorage,
        });
        setPreflightChecks(result.checks);
        setPreflightRunning(false);

        if (!result.passed) {
          const failed = result.checks.find((c) => c.status === 'fail');
          setPreflightFailed(true);
          aaLog(
            'Pre-flight FAILED: ' + (failed?.label ?? '?') + ' — ' + (failed?.message ?? '?') + '. Fix and retry, or check "Skip pre-flight" to bypass.',
            'error',
          );
          return;
        }

        aaLog('Pre-flight passed (' + result.checks.length + ' checks).', 'ok');
      } catch (e) {
        setPreflightRunning(false);
        setPreflightFailed(true);
        aaLog('Pre-flight runner threw an error: ' + (e instanceof Error ? e.message : String(e)), 'error');
        return;
      }
    } else {
      // Skip mode — clear any stale check display.
      setPreflightChecks([]);
      setPreflightFailed(false);
      aaLog('Pre-flight SKIPPED by user (Skip pre-flight checkbox).', 'warn');
    }

    startRunLoop(queue, unsorted.length);
  }

  function handlePause() {
    aaLog('Paused.', 'warn');
    setAaState('PAUSED');
    runningRef.current = false;
  }

  function handleResume() {
    aaLog('Resumed.', 'info');
    setAaState('RUNNING');
    abortRef.current = false;
    runningRef.current = true;
    runLoop();
  }

  function handleCancel() {
    if (!confirm('Cancel auto-analyze?')) return;
    aaLog('Cancelled.', 'warn');
    abortRef.current = true;
    clearCheckpoint();
    runningRef.current = false;
    if (abortControllerRef.current) { abortControllerRef.current.abort(); abortControllerRef.current = null; }
    const cleared = batchesRef.current.map(b =>
      b.status === 'in_progress' ? { ...b, status: 'failed' as const } : b
    );
    batchesRef.current = cleared;
    setBatches(cleared);
    setAaState('IDLE');
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  async function handleApplyBatch() {
    if (aaState !== 'BATCH_REVIEW' || !pendingResult) return;
    const batch = batchesRef.current[currentIdxRef.current];
    if (!batch._v3Ops) {
      aaLog('Batch ' + batch.batchNum + ' — cannot apply: no parsed operations', 'error');
      return;
    }
    // Same regularBatchMode flag as the runLoop apply path above —
    // this is also a per-batch apply (just gated by manual review).
    await doApplyV3(batch, batch._v3Ops, { regularBatchMode: true });
    batch._v3Ops = undefined;
    batch.status = 'complete';
    batch.completedAt = Date.now();
    setPendingResult(null);
    aaLog('Batch ' + batch.batchNum + ' — applied after review.', 'ok');
    setCurrentIdx(prev => prev + 1);
    currentIdxRef.current++;
    setAaState('RUNNING');
    setBatches([...batchesRef.current]);
    runningRef.current = true;
    runLoop();
  }

  function handleSkipBatch() {
    if (aaState !== 'BATCH_REVIEW') return;
    const batch = batchesRef.current[currentIdxRef.current];
    batch.status = 'skipped';
    batch.completedAt = Date.now();
    setPendingResult(null);
    aaLog('Batch ' + batch.batchNum + ' — skipped.', 'warn');
    setCurrentIdx(prev => prev + 1);
    currentIdxRef.current++;
    setAaState('RUNNING');
    setBatches([...batchesRef.current]);
    runningRef.current = true;
    runLoop();
  }

  /**
   * Reconcile Now — admin-only one-shot drift healer. Walks the project's
   * full keyword list against the live canvas state (fetched fresh from the
   * server, not from any closure-frozen prop) and fires the same
   * `computeReconciliationUpdates` the per-batch reconciliation pass uses.
   * Doubles as a forensic tool: even when there's nothing to fix, the
   * counts shown confirm "everything is in sync." See ROADMAP §"🚨
   * Reconciliation-Pass Closure-Staleness Bug" → Post-fix cleanup option (a).
   */
  const [reconcileBusy, setReconcileBusy] = useState(false);
  async function handleReconcileNow() {
    if (reconcileBusy) return;
    if (aaState === 'RUNNING') {
      alert('Cannot reconcile while a run is in progress — pause or cancel first.');
      return;
    }
    setReconcileBusy(true);
    try {
      aaLog('Reconcile Now: fetching live state…', 'info');
      // Fetch all three sources in parallel. Fresh from server every time —
      // immune to any closure-frozen prop or stale cache.
      const [kwRes, nodesRes, removedRes] = await Promise.all([
        authFetch('/api/projects/' + projectId + '/keywords'),
        authFetch('/api/projects/' + projectId + '/canvas/nodes'),
        authFetch('/api/projects/' + projectId + '/removed-keywords'),
      ]);
      if (!kwRes.ok || !nodesRes.ok || !removedRes.ok) {
        aaLog('Reconcile Now: fetch failed (' + kwRes.status + '/' + nodesRes.status + '/' + removedRes.status + ')', 'error');
        return;
      }
      const keywords = await kwRes.json() as { id: string; sortingStatus: string }[];
      const nodesData = await nodesRes.json() as { linkedKwIds?: string[]; kwPlacements?: Record<string, unknown> }[];
      const removed = await removedRes.json() as { originalKeywordId?: string | null }[];

      // placedSet = every keyword id referenced by any canvas node, via either
      // legacy `linkedKwIds` array OR the canonical `kwPlacements` map.
      const placedSet = new Set<string>();
      for (const n of nodesData) {
        if (Array.isArray(n.linkedKwIds)) for (const id of n.linkedKwIds) placedSet.add(id);
        if (n.kwPlacements && typeof n.kwPlacements === 'object') {
          for (const id of Object.keys(n.kwPlacements)) placedSet.add(id);
        }
      }
      const archivedSet = new Set<string>(
        removed.map(r => r.originalKeywordId).filter((x): x is string => typeof x === 'string'),
      );

      const result = computeReconciliationUpdates(keywords, placedSet, archivedSet);
      if (result.updates.length === 0) {
        aaLog(
          '✓ Reconcile Now: nothing to fix — ' + keywords.length + ' keywords / ' +
          placedSet.size + ' on canvas / ' + archivedSet.size + ' archived all in sync.',
          'ok',
        );
        return;
      }

      const ok = confirm(
        'Reconcile Now found ' + result.updates.length + ' keyword(s) with status drift:\n\n' +
        '  • ' + result.flippedToAiSorted + ' on-canvas → flip to AI-Sorted\n' +
        '  • ' + result.flippedToReshuffled + ' off-canvas → flip to Reshuffled\n\n' +
        'Apply these fixes? (Status-only update, easily undoable by running this again.)',
      );
      if (!ok) {
        aaLog('Reconcile Now: cancelled by user (' + result.updates.length + ' updates not applied).', 'warn');
        return;
      }

      const patchRes = await authFetch('/api/projects/' + projectId + '/keywords', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: result.updates }),
      });
      if (!patchRes.ok) {
        aaLog('Reconcile Now: PATCH failed (HTTP ' + patchRes.status + ')', 'error');
        return;
      }
      aaLog(
        '✓ Reconcile Now: applied ' + result.updates.length + ' updates (' +
        result.flippedToAiSorted + ' → AI-Sorted, ' +
        result.flippedToReshuffled + ' → Reshuffled).',
        'ok',
      );

      // R2 invariant (per DEFENSE_IN_DEPTH_AUDIT_DESIGN §3.2.2): if the
      // PATCH succeeded but a follow-up diff against the same fresh
      // canvas/archive state is still non-empty, something stopped the
      // updates from landing as the diff predicted. Re-run the diff
      // in-memory by applying our update set and recomputing — cheap, no
      // extra I/O. A non-empty result is a soft warning (admin can re-run
      // the button), not a fatal error.
      const updatedById = new Map(result.updates.map(u => [u.id, u.sortingStatus] as const));
      const postPatchKeywords = keywords.map(k =>
        updatedById.has(k.id)
          ? { ...k, sortingStatus: updatedById.get(k.id) as string }
          : k,
      );
      const verify = computeReconciliationUpdates(postPatchKeywords, placedSet, archivedSet);
      if (verify.updates.length > 0) {
        aaLog(
          '⚠ Reconcile Now: post-PATCH self-check still shows ' +
          verify.updates.length + ' pending update(s). Either the server ' +
          'didn\'t apply all updates, or the canvas/archive state changed ' +
          'mid-operation. Click Reconcile Now again to verify.',
          'warn',
        );
      }

      await onRefreshKeywords();
    } catch (err) {
      aaLog('Reconcile Now: error — ' + (err instanceof Error ? err.message : String(err)), 'error');
    } finally {
      setReconcileBusy(false);
    }
  }

  function handleClose() {
    if (aaState === 'RUNNING') {
      if (!confirm('Auto-analyze is running. Close? (Will pause.)')) return;
      handlePause();
    }
    onClose();
  }

  /* ── Format elapsed time ───────────────────────────────────── */
  function fmtTime(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  /* ── Progress stats ────────────────────────────────────────── */
  const completedCount = batches.filter(b => b.status === 'complete').length;
  const failedCount = batches.filter(b => b.status === 'failed').length;
  const progressPct = batches.length > 0 ? Math.round(((completedCount + failedCount) / batches.length) * 100) : 0;
  const est = costEstimate();

  /* ── Render ────────────────────────────────────────────────── */
  if (!open) return null;

  return (
    <div className={`aa-overlay open${minimized ? ' aa-minimized' : ''}`} onClick={e => { if (e.target === e.currentTarget && aaState === 'IDLE') handleClose(); }}>
      {/* Minimized bar */}
      <div className="aa-minibar" onClick={() => setMinimized(false)}>
        <span className="aa-minibar-status">{aaState === 'RUNNING' ? '⚡ Running' : aaState === 'PAUSED' ? '⏸ Paused' : aaState}</span>
        <span className="aa-minibar-progress">{completedCount}/{batches.length} batches · ${totalSpent.toFixed(2)} · {fmtTime(elapsed)}</span>
      </div>

      {/* Main panel */}
      <div className="aa-panel">
        <div className="aa-header">
          <h3>⚡ Auto-Analyze</h3>
          <div className="aa-header-btns">
            {(aaState === 'RUNNING' || aaState === 'PAUSED' || aaState === 'BATCH_REVIEW') && (
              <button onClick={() => setMinimized(true)}>▾ Minimize</button>
            )}
            <button onClick={handleClose}>✕ Close</button>
          </div>
        </div>

        <div className="aa-body">
          {/* ── Config section ── */}
          <div className="aa-section">
            <div className="aa-section-title">Configuration</div>
            {hasSavedCheckpoint && aaState === 'IDLE' && (
              <div style={{background:'#1e3a5f',border:'1px solid #3b82f6',borderRadius:'6px',padding:'10px 14px',marginBottom:'10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{fontSize:'11px',color:'#93c5fd'}}>
                  <strong>Saved checkpoint:</strong> {savedCheckpointInfo}
                </div>
                <div style={{display:'flex',gap:'8px'}}>
                  <button className="aa-btn" onClick={handleResumeCheckpoint}>▶ Resume</button>
                  <button className="aa-btn" onClick={handleDiscardCheckpoint}>✕ Discard</button>
                </div>
              </div>
            )}
            <div className="aa-row">
              <span className="aa-label">API Mode<span className="aa-help">ⓘ<span className="aa-tip">Direct sends requests from your browser straight to Anthropic (no timeout). Server proxy routes through Vercel (5-min timeout limit).</span></span></span>
              <select className="aa-select" value={apiMode} onChange={e => setApiMode(e.target.value as 'direct' | 'server')} disabled={aaState !== 'IDLE'}>
                <option value="direct">Direct (browser → Anthropic)</option>
                <option value="server">Server proxy (browser → Vercel → Anthropic)</option>
              </select>
            </div>
            {/* Direct-mode hint: relevant only while we're on Vercel's 5-min serverless ceiling. After AWS migration (per ROADMAP Phase 2 server-side execution), server-side handles long-running jobs natively and this hint becomes obsolete — remove it then. */}
            {apiMode === 'server' && est.nKeywords >= 100 && (
              <div style={{ fontSize: '10px', color: '#92400e', background: '#fef3c7', padding: '6px 8px', borderRadius: '4px', margin: '0 0 6px 0', border: '1px solid #fde68a', lineHeight: 1.4 }}>
                ⚠ With {est.nKeywords} unsorted keywords (~{est.nBatches} batches), batches may exceed Vercel&rsquo;s 5-min server timeout and fail mid-flight. Switch API Mode to <strong>Direct (browser → Anthropic)</strong> to avoid this.
              </div>
            )}
            {apiMode === 'direct' && (
              <div className="aa-row">
                <span className="aa-label">API Key</span>
                <input className="aa-input aa-input-wide" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-ant-..." disabled={aaState !== 'IDLE'} />
              </div>
            )}
            <div className="aa-row">
              <span className="aa-label">Model<span className="aa-help">ⓘ<span className="aa-tip">Which Claude model to use. Opus is most capable but slower/costlier. Sonnet is a good balance. Haiku is fastest/cheapest.</span></span></span>
              <select className="aa-select" value={model} onChange={e => setModel(e.target.value)} disabled={aaState !== 'IDLE'}>
                <option value="claude-opus-4-7">Claude Opus 4.7</option>
                <option value="claude-opus-4-6">Claude Opus 4.6</option>
                <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
                <option value="claude-opus-4-5">Claude Opus 4.5</option>
                <option value="claude-haiku-4-5">Claude Haiku 4.5</option>
              </select>
              <span className="aa-label" style={{minWidth:"auto",marginLeft:"12px"}}>Scope<span className="aa-help">ⓘ<span className="aa-tip">Which keywords to include. "Unsorted + Reshuffled" picks up never-sorted keywords plus ones the AI bumped off the canvas during reshuffling. "All" re-analyzes everything.</span></span></span>
              <select className="aa-select" value={keywordScope} onChange={e => setKeywordScope(e.target.value as typeof keywordScope)} disabled={aaState !== 'IDLE'}>
                <option value="unsorted-only">Unsorted + Reshuffled</option>
                <option value="non-ai-sorted">Non-AI-Sorted</option>
                <option value="all">All keywords</option>
              </select>
            </div>
            <div className="aa-row">
              <span className="aa-label">Seed words<span className="aa-help">ⓘ<span className="aa-tip">Core niche terms that help the AI understand your market context (e.g. "bursitis", "joint pain").</span></span></span>
              <input className="aa-input aa-input-wide" value={seedWords} onChange={e => setSeedWords(e.target.value)} placeholder="e.g. bursitis" disabled={aaState !== 'IDLE'} />
            </div>
            <div className="aa-row">
              <span className="aa-label">Processing<span className="aa-help">ⓘ<span className="aa-tip">Adaptive auto-sizes batches (8→12→18) as the topic hierarchy grows. Classic uses a fixed batch size.</span></span></span>
              <select className="aa-select" value={processingMode} onChange={e => { setProcessingMode(e.target.value as 'adaptive' | 'classic'); if (e.target.value === 'adaptive') setBatchSize(AA_BATCH_TIERS[0].size); }} disabled={aaState !== 'IDLE'}>
                <option value="adaptive">Adaptive</option>
                <option value="classic">Classic</option>
              </select>
              <span className="aa-label" style={{minWidth:"auto",marginLeft:"12px"}}>Batch size<span className="aa-help">ⓘ<span className="aa-tip">Number of keywords per API call. Only editable in Classic mode. Larger batches are faster but risk truncation.</span></span></span>
              <input
                className="aa-input aa-input-sm"
                type="number"
                value={batchSize || ''}
                onChange={e => setBatchSize(parseInt(e.target.value) || 0)}
                onBlur={() => { if (!batchSize) setBatchSize(8); }}
                disabled={aaState !== 'IDLE' || processingMode === 'adaptive'}
              />
              {processingMode === 'adaptive' && <span style={{ fontSize: '9px', color: '#64748b' }}>Auto: 8→12→18</span>}
            </div>
            <div className="aa-row">
              <span className="aa-label">Thinking<span className="aa-help">ⓘ<span className="aa-tip">Extended thinking lets the AI reason before responding. Adaptive enables it automatically. Budget caps thinking tokens.</span></span></span>
              <select className="aa-select" value={thinkingMode} onChange={e => setThinkingMode(e.target.value as typeof thinkingMode)} disabled={aaState !== 'IDLE'}>
                <option value="adaptive">Adaptive</option>
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
              {thinkingMode === 'enabled' && (
                <>
                  <span className="aa-label" style={{marginLeft:'12px',minWidth:'auto'}}>Budget</span>
                  <input
                    className="aa-input aa-input-sm"
                    type="number"
                    value={thinkingBudget || ''}
                    onChange={e => setThinkingBudget(parseInt(e.target.value) || 0)}
                    onBlur={() => { if (!thinkingBudget) setThinkingBudget(10000); }}
                    disabled={aaState !== 'IDLE'}
                  />
                </>
              )}
              <span className="aa-label" style={{marginLeft:'12px',minWidth:'auto'}}>Stall (sec)<span className="aa-help">ⓘ<span className="aa-tip">Seconds of no data before retrying the stream connection. Lower = faster recovery but more retries.</span></span></span>
              <input
                className="aa-input aa-input-sm"
                type="number"
                value={stallTimeout || ''}
                onChange={e => setStallTimeout(parseInt(e.target.value) || 0)}
                onBlur={() => { if (!stallTimeout) setStallTimeout(90); }}
                disabled={aaState !== 'IDLE'}
              />
            </div>
            {/* Adaptive-Thinking 0-output-tokens hint: V2-era issue first observed in Phase 1g-test 2026-04-18 kickoff session — Adaptive Thinking on a large prompt occasionally produced 0 output tokens (wasted call). V3 outputs are smaller so this may no longer trigger; until we have V3 test data either way, keep this hint as defensive UI nudge for any non-trivial canvas. Revisit (and possibly remove) once a few V3 runs confirm the bug is gone. */}
            {thinkingMode === 'adaptive' && nodes.length >= 50 && (
              <div style={{ fontSize: '10px', color: '#92400e', background: '#fef3c7', padding: '6px 8px', borderRadius: '4px', margin: '0 0 6px 0', border: '1px solid #fde68a', lineHeight: 1.4 }}>
                ⚠ With {nodes.length} topics on the canvas, Adaptive Thinking can occasionally produce 0 output tokens (a fully wasted API call). If you see a batch fail with empty output, switch Thinking to <strong>Enabled</strong> with a Budget of <strong>12000+</strong>.
              </div>
            )}
            <div className="aa-row">
              <span className="aa-label">Vol threshold<span className="aa-help">ⓘ<span className="aa-tip">Keywords with volume above this are flagged for priority placement in the topic hierarchy.</span></span></span>
              <input
                className="aa-input aa-input-sm"
                type="number"
                value={volumeThreshold || ''}
                onChange={e => setVolumeThreshold(parseInt(e.target.value) || 0)}
                onBlur={() => { if (!volumeThreshold) setVolumeThreshold(1000); }}
                disabled={aaState !== 'IDLE'}
              />
              <span className="aa-label" style={{minWidth:'auto',marginLeft:'12px'}}>Recency window<span className="aa-help">ⓘ<span className="aa-tip">How many recent batches a topic stays at full detail (Tier 0) after being touched by an operation. Higher = more topics shown in full each batch (more cost, less compression). Default 5.</span></span></span>
              <input
                className="aa-input aa-input-sm"
                type="number"
                value={recencyWindow || ''}
                onChange={e => setRecencyWindow(parseInt(e.target.value) || 0)}
                onBlur={() => { if (!recencyWindow) setRecencyWindow(DEFAULT_RECENCY_WINDOW); }}
                disabled={aaState !== 'IDLE'}
              />
              <div className="aa-toggle" onClick={() => { if (aaState === 'IDLE') setReviewMode(!reviewMode); }}>
                <div className={`aa-toggle-track${reviewMode ? ' on' : ''}`}><div className="aa-toggle-thumb" /></div>
                <span>Review each batch</span>
              </div>
            </div>
            {/* Scale Session E — consolidation cadence + min canvas-size gates.
                Cadence = 0 disables auto-fire. Min canvas size gates auto-fire
                so small canvases don't waste API spend on consolidation passes. */}
            <div className="aa-row">
              <span className="aa-label">Consol. cadence<span className="aa-help">ⓘ<span className="aa-tip">Run a consolidation pass after every N successful batches. Consolidation scans the full canvas at Tier 0 for structural improvements (merges, splits, repositions). Set to 0 to disable auto-fire — admin Consolidate Now still works regardless. Default 10.</span></span></span>
              <input
                className="aa-input aa-input-sm"
                type="number"
                min="0"
                value={consolidationCadence}
                onChange={e => setConsolidationCadence(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={aaState !== 'IDLE'}
              />
              <span className="aa-label" style={{minWidth:'auto',marginLeft:'12px'}}>Min canvas (topics)<span className="aa-help">ⓘ<span className="aa-tip">Skip the consolidation auto-fire when the canvas is smaller than this — small canvases rarely benefit from consolidation. Default 100.</span></span></span>
              <input
                className="aa-input aa-input-sm"
                type="number"
                min="0"
                value={consolidationMinCanvasSize}
                onChange={e => setConsolidationMinCanvasSize(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={aaState !== 'IDLE'}
              />
              <span style={{ fontSize: '9px', color: '#64748b', marginLeft: '8px' }}>
                {consolidationCadence === 0
                  ? 'Auto-fire OFF'
                  : 'Auto-fire every ' + consolidationCadence + ' batch' + (consolidationCadence === 1 ? '' : 'es') + ' when canvas ≥ ' + consolidationMinCanvasSize}
              </span>
            </div>
          </div>

          {/* ── Prompt section ── */}
          <div className="aa-section">
            <div className="aa-prompt-header" onClick={() => setPromptExpanded(!promptExpanded)}>
              <span className="aa-section-title" style={{ marginBottom: 0 }}>{promptExpanded ? '▾' : '▸'} AI Analysis Prompt</span>
              <span className={`aa-prompt-badge${initialPrompt.length > 100 ? ' loaded' : ''}`}>
                {initialPrompt.length > 100 ? 'loaded ✓' : 'collapsed'}
              </span>
            </div>
            {promptExpanded && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>Initial Prompt (main analysis instructions): <span className="aa-help" style={{display:'inline-flex'}}>ⓘ<span className="aa-tip">The main instruction prompt sent to Claude. Defines how keywords should be analyzed, grouped into topics, and organized into a conversion funnel hierarchy.</span></span></div>
                <textarea className="aa-prompt-textarea" value={initialPrompt} onChange={e => setInitialPrompt(e.target.value)} placeholder="Paste your AI analysis prompt here…" />
                <div className="aa-prompt-chars">{initialPrompt.length.toLocaleString()} chars</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', marginTop: '8px' }}>Topics Layout Table Primer (optional): <span className="aa-help" style={{display:'inline-flex'}}>ⓘ<span className="aa-tip">Additional context about how the Topics Layout Table should be structured — funnel ordering rules, placement guidelines, and depth conventions. Appended to the system prompt.</span></span></div>
                <textarea className="aa-prompt-textarea" value={primerPrompt} onChange={e => setPrimerPrompt(e.target.value)} placeholder="Optional primer prompt…" style={{ minHeight: '50px' }} />
                <div className="aa-prompt-chars">{primerPrompt.length.toLocaleString()} chars</div>
                {/* Scale Session E — separate slots for consolidation prompts. The
                    consolidation pass uses these instead of the regular Initial
                    Prompt + Primer above. Paste docs/AUTO_ANALYZE_CONSOLIDATION_PROMPT_V4.md. */}
                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', marginTop: '14px', borderTop: '1px solid #334155', paddingTop: '10px' }}>Consolidation Initial Prompt: <span className="aa-help" style={{display:'inline-flex'}}>ⓘ<span className="aa-tip">Used by both auto-fire-every-N-batches consolidation passes and the admin Consolidate Now button. Paste docs/AUTO_ANALYZE_CONSOLIDATION_PROMPT_V4.md &ldquo;Consolidation Initial Prompt&rdquo; here. Restricts vocabulary to MERGE_TOPICS, SPLIT_TOPIC, MOVE_TOPIC, etc. — ADD_TOPIC and ADD_KEYWORD are forbidden in consolidation mode.</span></span></div>
                <textarea className="aa-prompt-textarea" value={consolidationInitialPrompt} onChange={e => setConsolidationInitialPrompt(e.target.value)} placeholder="Paste the Consolidation Initial Prompt here…" />
                <div className="aa-prompt-chars">{consolidationInitialPrompt.length.toLocaleString()} chars</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', marginTop: '8px' }}>Consolidation Primer (Topics Layout Table — restricted vocabulary): <span className="aa-help" style={{display:'inline-flex'}}>ⓘ<span className="aa-tip">Paste docs/AUTO_ANALYZE_CONSOLIDATION_PROMPT_V4.md &ldquo;Topics Layout Table Primer V4 (Consolidation)&rdquo; here. Documents the full Tier 0 input format for consolidation passes and the restricted operation vocabulary.</span></span></div>
                <textarea className="aa-prompt-textarea" value={consolidationPrimerPrompt} onChange={e => setConsolidationPrimerPrompt(e.target.value)} placeholder="Paste the Consolidation Primer here…" style={{ minHeight: '50px' }} />
                <div className="aa-prompt-chars">{consolidationPrimerPrompt.length.toLocaleString()} chars</div>
              </div>
            )}
          </div>

          {/* ── Estimate ── */}
          {aaState === 'IDLE' && (
            <div className="aa-stats">
              <span>Keywords: <span className="aa-stat-val">{est.nKeywords}</span></span>
              <span>Batches: <span className="aa-stat-val">{est.nBatches}</span></span>
              <span>Est. cost: <span className="aa-stat-val">${est.estCost.toFixed(2)}</span></span>
            </div>
          )}

          {/* ── Pre-flight self-test (DEFENSE_IN_DEPTH_AUDIT_DESIGN §6) ── */}
          {(preflightRunning || preflightChecks.length > 0) && (
            <div className="aa-section">
              <div className="aa-section-title">
                {preflightRunning ? '⏳ Pre-flight checks running…' : preflightFailed ? '✗ Pre-flight failed' : '✓ Pre-flight passed'}
              </div>
              <div style={{ fontSize: '11px', lineHeight: 1.6 }}>
                {preflightRunning && preflightChecks.length === 0 && (
                  <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>Running 10 checks (~2 seconds)…</div>
                )}
                {preflightChecks.map((c) => {
                  const icon = c.status === 'pass' ? '✓' : c.status === 'fail' ? '✗' : '⏳';
                  const color = c.status === 'pass' ? '#22c55e' : c.status === 'fail' ? '#ef4444' : '#94a3b8';
                  return (
                    <div key={c.id} style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                      <span style={{ color, fontWeight: 'bold', minWidth: '14px' }}>{icon}</span>
                      <span style={{ color: '#cbd5e1', minWidth: '180px' }}>{c.label}:</span>
                      <span style={{ color: c.status === 'fail' ? '#fca5a5' : '#94a3b8' }}>{c.message}</span>
                    </div>
                  );
                })}
                {preflightFailed && (
                  <div style={{ marginTop: '8px', fontSize: '10px', color: '#fca5a5' }}>
                    Fix the failing check above and click Start again — or check &ldquo;Skip pre-flight&rdquo; below to bypass (not recommended for paid runs).
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Progress ── */}
          {batches.length > 0 && (
            <div className="aa-section">
              <div className="aa-section-title">Progress</div>
              <div className="aa-progress">
                <div className="aa-progress-bar"><div className="aa-progress-fill" style={{ width: progressPct + '%' }} /></div>
                <div className="aa-progress-label">
                  <span>{completedCount}/{batches.length} batches ({failedCount > 0 ? failedCount + ' failed' : 'none failed'})</span>
                  <span>${totalSpent.toFixed(2)} · {fmtTime(elapsed)}</span>
                </div>
              </div>
              <div className="aa-batch-list" style={{ marginTop: '6px' }}>
                {batches.map(b => (
                  <div key={b.batchNum} className={`aa-batch-row ${b.status}`}>
                    <span className="aa-batch-num">#{b.batchNum}</span>
                    <span className="aa-batch-kws">{b.keywords.slice(0, 3).join(', ')}{b.keywords.length > 3 ? '…' : ''}</span>
                    <span className="aa-batch-status">{b.status.replace('_', ' ')}</span>
                    <span className="aa-batch-cost">{b.cost > 0 ? '$' + b.cost.toFixed(3) : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Review section ── */}
          {aaState === 'BATCH_REVIEW' && pendingResult && (
            <div className="aa-review">
              <div className="aa-review-header">Batch Review</div>
              <div className="aa-review-content">
                <div>New topics: {pendingResult.newTopics.length > 0 ? pendingResult.newTopics.join(', ') : 'None'}</div>
                {pendingResult.reevalReport && <div style={{ marginTop: '4px', whiteSpace: 'pre-wrap' }}>{pendingResult.reevalReport}</div>}
              </div>
              <div className="aa-review-btns">
                <button className="aa-btn aa-btn-start" onClick={handleApplyBatch}>✓ Apply</button>
                <button className="aa-btn aa-btn-cancel" onClick={handleSkipBatch}>Skip</button>
              </div>
            </div>
          )}

          {/* ── Activity log ── */}
          {logEntries.length > 0 && (
            <div className="aa-section">
              <div className="aa-section-title" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>Activity Log <button className="aa-btn aa-btn-sm" onClick={()=>{const txt=logEntries.map(e=>e.ts+' '+e.msg).join('\n');navigator.clipboard.writeText(txt);aaLog('Activity log copied to clipboard','ok')}}>📋 Copy Log</button></div>
              <div className="aa-log" ref={logRef}>
                {logEntries.map((e, i) => (
                  <div key={i} className="aa-log-entry">
                    <span className="aa-log-ts">{e.ts}</span>
                    <span className={`aa-log-msg ${e.type}`}>{e.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Control buttons ── */}
        <div className="aa-controls">
          {aaState === 'IDLE' && (
            <button
              className="aa-btn aa-btn-start"
              onClick={handleStart}
              disabled={preflightRunning}
              title={preflightRunning ? 'Pre-flight checks running…' : 'Start the Auto-Analyze run.'}
            >
              {preflightRunning ? '⏳ Pre-flight…' : '▶ Start'}
            </button>
          )}
          {aaState === 'RUNNING' && <button className="aa-btn aa-btn-pause" onClick={handlePause}>⏸ Pause</button>}
          {(aaState === 'PAUSED' || aaState === 'API_ERROR' || aaState === 'VALIDATION_ERROR') && <button className="aa-btn aa-btn-resume" onClick={handleResume}>▶ Resume</button>}
          {aaState !== 'IDLE' && aaState !== 'ALL_COMPLETE' && <button className="aa-btn aa-btn-cancel" onClick={handleCancel}>✕ Cancel</button>}
          {aaState === 'IDLE' && (
            <label
              style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#94a3b8', cursor: 'pointer' }}
              title="Skip the pre-flight self-test. Off by default — only enable for power-user debugging."
            >
              <input
                type="checkbox"
                checked={skipPreflight}
                onChange={(e) => setSkipPreflight(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              Skip pre-flight
            </label>
          )}
          <button
            className="aa-btn"
            onClick={handleReconcileNow}
            disabled={reconcileBusy || aaState === 'RUNNING'}
            title="Walk every keyword against the live canvas and fix any status drift. Safe to run any time the panel is not actively running."
          >
            {reconcileBusy ? '⏳ Reconciling…' : '↻ Reconcile Now'}
          </button>
          <button
            className="aa-btn"
            onClick={handleConsolidateNow}
            disabled={consolidationBusy || aaState === 'RUNNING' || aaState === 'BATCH_REVIEW'}
            title="Run a one-shot consolidation pass on the current canvas — scans every topic at full Tier 0 detail for structural improvements (merges, splits, repositions). Restricted vocabulary (no ADD_TOPIC, no ADD_KEYWORD). Costs ~$0.30–$2 per pass depending on canvas size. Requires Consolidation Initial Prompt to be pasted in the AI Analysis Prompt section."
          >
            {consolidationBusy ? '⏳ Consolidating…' : '⚙ Consolidate Now'}
          </button>
          <button
            className="aa-btn"
            onClick={handleDownloadForensicLog}
            disabled={forensicCount === 0}
            title="Download a structured per-batch log (NDJSON) capturing canvas size, token counts, cost, and reconciliation outcomes for every batch. Use to attach to a bug report."
          >
            📥 Download log{forensicCount > 0 ? ' (' + forensicCount + ')' : ''}
          </button>
          <button className="aa-btn aa-btn-close" onClick={handleClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
