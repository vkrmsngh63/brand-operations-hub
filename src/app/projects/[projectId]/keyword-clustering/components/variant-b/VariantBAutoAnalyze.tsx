'use client';

/**
 * Variant B ("AI 2") — Step 3: the client run-loop overlay.
 *
 * Patterned on the AI 1 `AutoAnalyze.tsx` panel (same overlay + minimize bar +
 * activity log + spend-cap + checkpoint shape, reusing its `aa-*` styles so the
 * two run screens feel identical — director decision 2026-06-19-d "Mirror AI 1").
 *
 * What's DIFFERENT from AI 1: the per-batch AI work is intent ENUMERATION — one
 * flat call per carrier cluster (never the growing tree, plan §6 non-negotiable
 * #5). The deterministic pipeline that folds those intents into the funnel tree
 * lives in the PURE, node:tested `src/lib/variant-b/run-engine.ts`; this
 * component only injects the network + UI + run-control effects around it.
 *
 * Director decisions wired here (2026-06-19-d, all reversible):
 *   • Mirror AI 1's panel.
 *   • Spending limit OFF by default (`noCap` starts true); editable mid-run.
 *   • Cost shown as a per-step + total breakdown before Start.
 *   • "Pause after each batch" is chosen at launch AND flippable mid-run.
 *
 * NOTE: Step 3 produces the in-memory funnel + the run UX. Wiring it to a launch
 * point (the three-way toggle, Step 4) and persisting the tree to the canvas
 * (materialize, Step 5) are the next gated steps — `onComplete` is the seam.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { authFetch } from '@/lib/authFetch';
import { useModelsForMenu } from '@/lib/ai-models/useModelsForMenu';
import {
  ExecutionModeSelect,
} from '@/lib/workflow-components/execution-mode-select';
import {
  isExecutionMode,
  type ExecutionMode,
} from '@/lib/workflow-components/execution-mode';
import {
  assembleRulebook,
  rbCarrierDedupConfig,
  type AssembledRulebook,
} from '@/lib/variant-b/rulebook-assembly';
import { carrierDedup } from '@/lib/variant-b/carrier-dedup';
import {
  buildIntentEnumerationPrompt,
  intentPromptPayloadSize,
} from '@/lib/variant-b/intent-enumeration';
import type {
  CarrierCluster,
  IntentInstance,
  KeywordRow,
} from '@/lib/variant-b/types';
import {
  buildCarrierBatches,
  carrierToCandidates,
  foldIntentsToTree,
  planSweeps,
  DEFAULT_BATCH_SIZE,
  DEFAULT_CONCURRENCY,
  type AssembledFunnel,
} from '@/lib/variant-b/run-engine';
import {
  ForensicLog,
  buildForensicDownload,
  type ForensicPhase,
} from '@/lib/forensic-log';
import {
  projectRunCost,
  evaluateSpendCap,
  classifyAnthropicError,
} from '@/lib/cost-estimator';
import '../auto-analyze.css';

const DEFAULT_REORG_CADENCE = 75;
const VB_MAX_TOKENS = 4096;
const EST_OUTPUT_TOKENS_PER_CARRIER = 350;

type VBState =
  | 'IDLE'
  | 'RUNNING'
  | 'PAUSED'
  | 'BATCH_REVIEW'
  | 'API_ERROR'
  | 'ALL_COMPLETE';

interface VBBatch {
  batchNum: number;
  carrierCount: number;
  status: 'queued' | 'in_progress' | 'complete' | 'failed';
  intentCount: number;
  cost: number;
  inputTokens: number;
  outputTokens: number;
  failures: number;
}

interface LogEntry {
  ts: string;
  msg: string;
  type: 'info' | 'ok' | 'warn' | 'error';
}

export interface VariantBKeyword {
  id: string;
  keyword: string;
  volume: number | string;
}

export interface VariantBAutoAnalyzeProps {
  open: boolean;
  onClose: () => void;
  allKeywords: VariantBKeyword[];
  projectId: string;
  /** the project's niche slug (null/undefined ⇒ universal rulebook only). */
  nicheSlug?: string | null;
  /** the niche condition term to strip during carrier-dedup, if known. */
  conditionTerm?: string;
  /** called once when a run reaches ALL_COMPLETE with the assembled funnel.
   *  Step 5 (materialize → canvas rebuild) hooks in here. */
  onComplete?: (funnel: AssembledFunnel) => void;
}

interface StreamUsage {
  input: number;
  output: number;
}

function fmtTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m + ':' + String(s).padStart(2, '0');
}

export default function VariantBAutoAnalyze({
  open,
  onClose,
  allKeywords,
  projectId,
  nicheSlug,
  conditionTerm,
  onComplete,
}: VariantBAutoAnalyzeProps) {
  const models = useModelsForMenu('keyword-clustering');

  // ── config (locked while running, except the editable-mid-run knobs) ──
  const [apiMode, setApiMode] = useState<ExecutionMode>('server');
  const [apiKey, setApiKey] = useState('');
  const [modelId, setModelId] = useState('');
  const [batchSize, setBatchSize] = useState(DEFAULT_BATCH_SIZE);
  const [concurrency, setConcurrency] = useState(DEFAULT_CONCURRENCY);
  const [reorgCadence, setReorgCadence] = useState(DEFAULT_REORG_CADENCE);
  // Director decision: spending limit OFF by default.
  const [noCap, setNoCap] = useState(true);
  const [spendCapUsd, setSpendCapUsd] = useState(25);
  // Director decision: chosen at launch AND flippable mid-run.
  const [reviewMode, setReviewMode] = useState(false);

  // default the model to the first available once the registry loads
  useEffect(() => {
    if (!modelId && models.length > 0) setModelId(models[0].modelId);
  }, [models, modelId]);
  const record = useMemo(
    () => models.find((m) => m.modelId === modelId),
    [models, modelId],
  );

  // ── run state ──
  const [vbState, setVbState] = useState<VBState>('IDLE');
  const [batches, setBatches] = useState<VBBatch[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [minimized, setMinimized] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [funnel, setFunnel] = useState<AssembledFunnel | null>(null);
  const [forensicCount, setForensicCount] = useState(0);
  const [hasSavedCheckpoint, setHasSavedCheckpoint] = useState(false);

  // ── refs (the async loop reads these so it never sees stale React state) ──
  const runningRef = useRef(false);
  const abortRef = useRef(false);
  const creditHaltRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);

  const batchesRef = useRef<VBBatch[]>([]);
  const currentIdxRef = useRef(0);
  const totalSpentRef = useRef(0);
  const intentsRef = useRef<IntentInstance[]>([]);
  const batchCostsRef = useRef<number[]>([]);
  const carrierBatchesRef = useRef<CarrierCluster[][]>([]);
  const sweepPointsRef = useRef<Set<number>>(new Set());
  const funnelRef = useRef<AssembledFunnel | null>(null);
  const forensicLogRef = useRef<ForensicLog>(new ForensicLog());
  const sessionIdRef = useRef('');

  // editable-mid-run + locked config mirrored to refs for the async loop
  const reviewModeRef = useRef(reviewMode);
  const noCapRef = useRef(noCap);
  const spendCapRef = useRef(spendCapUsd);
  const concurrencyRef = useRef(concurrency);
  const reorgCadenceRef = useRef(reorgCadence);
  const apiModeRef = useRef(apiMode);
  const apiKeyRef = useRef(apiKey);
  const rbRef = useRef<AssembledRulebook | null>(null);
  const recordPricingRef = useRef<{ input: number; output: number } | null>(null);

  const rb = useMemo(
    () => assembleRulebook([], { nicheSlug: nicheSlug ?? null, conditionTerm }),
    [nicheSlug, conditionTerm],
  );

  useEffect(() => { reviewModeRef.current = reviewMode; }, [reviewMode]);
  useEffect(() => { noCapRef.current = noCap; }, [noCap]);
  useEffect(() => { spendCapRef.current = spendCapUsd; }, [spendCapUsd]);
  useEffect(() => { concurrencyRef.current = concurrency; }, [concurrency]);
  useEffect(() => { reorgCadenceRef.current = reorgCadence; }, [reorgCadence]);
  useEffect(() => { apiModeRef.current = apiMode; }, [apiMode]);
  useEffect(() => { apiKeyRef.current = apiKey; }, [apiKey]);
  useEffect(() => { rbRef.current = rb; }, [rb]);
  useEffect(() => {
    recordPricingRef.current = record
      ? { input: record.pricing.inputPerMillion, output: record.pricing.outputPerMillion }
      : null;
  }, [record]);

  const cpKey = 'vb_checkpoint_' + projectId;

  // detect a saved checkpoint whenever the panel opens at rest
  useEffect(() => {
    if (open && vbState === 'IDLE') {
      try {
        setHasSavedCheckpoint(!!localStorage.getItem(cpKey));
      } catch {
        setHasSavedCheckpoint(false);
      }
    }
  }, [open, vbState, cpKey]);

  const vbLog = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
    const ts = new Date().toLocaleTimeString();
    setLogEntries((prev) => [...prev, { ts, msg, type }]);
    setTimeout(() => logRef.current?.scrollTo(0, logRef.current.scrollHeight), 50);
  }, []);

  const emitForensic = useCallback(
    (
      phase: ForensicPhase,
      batchNum: number,
      extra: {
        canvasNodeCount?: number;
        tsvInputTokens?: number;
        tsvOutputTokens?: number;
        costThisBatch?: number;
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
        canvas_keyword_count: intentsRef.current.length,
        tsv_input_tokens: extra.tsvInputTokens,
        tsv_output_tokens: extra.tsvOutputTokens,
        model: modelId,
        cost_this_batch: extra.costThisBatch,
        errors: extra.errors,
      });
      setForensicCount(forensicLogRef.current.count());
    },
    [projectId, modelId],
  );

  // ── cost estimate (per-step + total breakdown, director decision) ──
  const estimate = useMemo(() => {
    const rows: KeywordRow[] = allKeywords.map((k) => ({
      id: k.id,
      keyword: k.keyword,
      volume: Number(k.volume) || 0,
    }));
    const carriers = carrierDedup(rows, rbCarrierDedupConfig(rb, conditionTerm));
    const nCarriers = carriers.length;
    const size = Math.max(1, batchSize);
    const nBatches = Math.ceil(nCarriers / size);
    const sampleChars = nCarriers > 0 ? intentPromptPayloadSize(carriers[0], rb) : 0;
    const inTok = Math.round(sampleChars / 4);
    const pr = record?.pricing;
    const perCarrier = pr
      ? (inTok / 1e6) * pr.inputPerMillion +
        (EST_OUTPUT_TOKENS_PER_CARRIER / 1e6) * pr.outputPerMillion
      : 0;
    return {
      nCarriers,
      nBatches,
      perCarrier,
      perBatch: perCarrier * size,
      total: perCarrier * nCarriers,
    };
  }, [allKeywords, rb, batchSize, conditionTerm, record]);

  // ── live cost projection ──
  const completedBatchCosts = batches
    .filter((b) => b.status === 'complete' && b.cost > 0)
    .map((b) => b.cost);
  const batchesRemainingForEst = batches.filter(
    (b) => b.status === 'queued' || b.status === 'in_progress',
  ).length;
  const costProjection = projectRunCost({
    spent: totalSpent,
    batchCosts: completedBatchCosts,
    batchesRemaining: batchesRemainingForEst,
    consolidationCosts: [],
    consolidationsRemaining: 0,
    fallbackBatchCost: estimate.perBatch,
    fallbackConsolidationCost: 0,
  });
  const effectiveCap = noCap ? 0 : spendCapUsd;
  const spendCapStatus = evaluateSpendCap(totalSpent, costProjection.estTotal, effectiveCap);
  const spendCapColor =
    spendCapStatus === 'over' ? '#fca5a5' : spendCapStatus === 'warn' ? '#fbbf24' : '#94a3b8';

  const completedCount = batches.filter((b) => b.status === 'complete').length;
  const showForecast = vbState === 'RUNNING' || vbState === 'PAUSED' || vbState === 'BATCH_REVIEW';

  // ── the AI call: one flat intent-enumeration per carrier (SSE, both modes) ──
  const callEnumerationStream = useCallback(
    async (carrier: CarrierCluster, signal: AbortSignal): Promise<{ text: string; usage: StreamUsage }> => {
      const activeRb = rbRef.current!;
      const prompt = buildIntentEnumerationPrompt(carrier, activeRb);
      const requestBody = {
        model: modelId,
        max_tokens: VB_MAX_TOKENS,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      };
      const isDirect = apiModeRef.current === 'direct';
      const url = isDirect ? 'https://api.anthropic.com/v1/messages' : '/api/ai/analyze';
      const headers: Record<string, string> = { 'content-type': 'application/json' };
      if (isDirect) {
        headers['x-api-key'] = apiKeyRef.current;
        headers['anthropic-version'] = '2023-06-01';
        headers['anthropic-dangerous-direct-browser-access'] = 'true';
      }
      const res = await (isDirect ? fetch : authFetch)(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal,
      });
      if (!res.ok) {
        const errText = await res.text();
        let msg = 'HTTP ' + res.status;
        try {
          const j = JSON.parse(errText);
          msg += ': ' + (j.error?.message || errText.slice(0, 200));
        } catch {
          msg += ': ' + errText.slice(0, 200);
        }
        throw new Error(msg);
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let text = '';
      const usage: StreamUsage = { input: 0, output: 0 };
      let evtType = '';
      let evtData = '';
      const dispatch = (type: string, data: string) => {
        try {
          const parsed = JSON.parse(data);
          switch (type) {
            case 'message_start':
              if (parsed.message?.usage) usage.input = parsed.message.usage.input_tokens || 0;
              break;
            case 'content_block_delta':
              if (parsed.delta?.type === 'text_delta') text += parsed.delta.text || '';
              break;
            case 'message_delta':
              if (parsed.usage?.output_tokens) usage.output = parsed.usage.output_tokens;
              break;
          }
        } catch {
          /* skip unparseable SSE frame */
        }
      };
      for (;;) {
        const chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop()!;
        for (const line of lines) {
          if (line.startsWith('event: ')) evtType = line.slice(7).trim();
          else if (line.startsWith('data: ')) evtData += (evtData ? '\n' : '') + line.slice(6);
          else if (line.trim() === '') {
            if (evtType && evtData) dispatch(evtType, evtData);
            evtType = '';
            evtData = '';
          }
        }
      }
      if (evtType && evtData) dispatch(evtType, evtData);
      return { text, usage };
    },
    [modelId],
  );

  const costOf = (usage: StreamUsage): number => {
    const pr = recordPricingRef.current;
    if (!pr) return 0;
    return (usage.input / 1e6) * pr.input + (usage.output / 1e6) * pr.output;
  };

  // ── one batch: enumerate its carriers with bounded concurrency ──
  const runBatchEnumerations = useCallback(
    async (batchCarriers: CarrierCluster[]) => {
      let idx = 0;
      const intents: IntentInstance[] = [];
      let cost = 0;
      let inTok = 0;
      let outTok = 0;
      let failures = 0;
      const signal = abortControllerRef.current!.signal;

      const worker = async () => {
        while (!abortRef.current && !creditHaltRef.current) {
          const my = idx++;
          if (my >= batchCarriers.length) return;
          const carrier = batchCarriers[my];
          try {
            const { text, usage } = await callEnumerationStream(carrier, signal);
            const cc = carrierToCandidates(text, carrier, rbRef.current!);
            intents.push(...cc.intents);
            cost += costOf(usage);
            inTok += usage.input;
            outTok += usage.output;
            if (!cc.ok) {
              failures += 1;
              vbLog('Carrier "' + carrier.representative + '" returned an unreadable result.', 'warn');
            } else if (cc.flags.length > 0) {
              vbLog(
                'Carrier "' + carrier.representative + '": ' + cc.flags.length + ' validator note(s) for review.',
                'info',
              );
            }
          } catch (err: unknown) {
            if (err instanceof DOMException && err.name === 'AbortError') return;
            const msg = err instanceof Error ? err.message : String(err);
            if (classifyAnthropicError(msg) === 'credit') {
              creditHaltRef.current = true;
              vbLog('⛔ Anthropic credit balance too low — run will pause. Top up, then Resume.', 'error');
              return;
            }
            failures += 1;
            vbLog('Carrier "' + carrier.representative + '" failed: ' + msg, 'error');
          }
        }
      };

      const poolSize = Math.max(1, Math.min(concurrencyRef.current, batchCarriers.length));
      await Promise.all(Array.from({ length: poolSize }, () => worker()));
      return { intents, cost, inTok, outTok, failures };
    },
    [callEnumerationStream, vbLog],
  );

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  const saveCheckpoint = useCallback(() => {
    try {
      const cp = {
        ts: Date.now(),
        config: { apiMode, modelId, batchSize, concurrency, reorgCadence, conditionTerm: conditionTerm ?? null, nicheSlug: nicheSlug ?? null },
        batches: batchesRef.current,
        currentIdx: currentIdxRef.current,
        totalSpent: totalSpentRef.current,
        elapsed,
        logEntries,
        intents: intentsRef.current,
      };
      localStorage.setItem(cpKey, JSON.stringify(cp));
    } catch (e) {
      console.warn('VB checkpoint save failed', e);
    }
  }, [apiMode, modelId, batchSize, concurrency, reorgCadence, conditionTerm, nicheSlug, elapsed, logEntries, cpKey]);

  const clearCheckpoint = useCallback(() => {
    try {
      localStorage.removeItem(cpKey);
    } catch {
      /* ignore */
    }
    setHasSavedCheckpoint(false);
  }, [cpKey]);

  // ── the run loop ──
  const runLoop = useCallback(async () => {
    const total = carrierBatchesRef.current.length;
    while (runningRef.current && !abortRef.current && currentIdxRef.current < total) {
      const i = currentIdxRef.current;

      if (!noCapRef.current && spendCapRef.current > 0 && totalSpentRef.current >= spendCapRef.current) {
        vbLog('Spending limit reached — run paused. Raise or clear the limit, then Resume.', 'warn');
        setVbState('API_ERROR');
        runningRef.current = false;
        saveCheckpoint();
        return;
      }

      const batchCarriers = carrierBatchesRef.current[i];
      const setStatus = (status: VBBatch['status'], patch: Partial<VBBatch> = {}) => {
        batchesRef.current = batchesRef.current.map((b, bi) =>
          bi === i ? { ...b, status, ...patch } : b,
        );
        setBatches(batchesRef.current);
      };

      setStatus('in_progress');
      emitForensic('pre_api_call', i + 1, { canvasNodeCount: funnelRef.current?.topics.length ?? 0 });

      const r = await runBatchEnumerations(batchCarriers);
      if (abortRef.current) return;

      intentsRef.current.push(...r.intents);
      totalSpentRef.current += r.cost;
      setTotalSpent(totalSpentRef.current);
      batchCostsRef.current.push(r.cost);
      emitForensic('post_api_call', i + 1, {
        tsvInputTokens: r.inTok,
        tsvOutputTokens: r.outTok,
        costThisBatch: r.cost,
      });

      const processed = carrierBatchesRef.current
        .slice(0, i + 1)
        .reduce((acc, b) => acc + b.length, 0);
      const isLast = i + 1 >= total;
      const runSweep = isLast || sweepPointsRef.current.has(processed);
      const folded = foldIntentsToTree(intentsRef.current, rbRef.current!, {
        runSweep,
        reorg: { cadence: reorgCadenceRef.current },
      });
      funnelRef.current = folded;
      setFunnel(folded);
      emitForensic('post_apply', i + 1, { canvasNodeCount: folded.topics.length });

      setStatus('complete', {
        intentCount: r.intents.length,
        cost: r.cost,
        inputTokens: r.inTok,
        outputTokens: r.outTok,
        failures: r.failures,
      });
      vbLog(
        'Batch ' + (i + 1) + '/' + total + ' done — ' + r.intents.length +
          ' intents · ' + folded.topics.length + ' topics so far · $' + r.cost.toFixed(3) +
          (runSweep ? ' · reorg sweep' : ''),
        'ok',
      );

      currentIdxRef.current = i + 1;
      setCurrentIdx(i + 1);
      saveCheckpoint();

      if (creditHaltRef.current) {
        setVbState('API_ERROR');
        runningRef.current = false;
        return;
      }
      if (reviewModeRef.current && !isLast) {
        setVbState('BATCH_REVIEW');
        runningRef.current = false;
        vbLog('Paused for batch review. Review the topics, then Continue (or untick "Pause after each batch" and Resume).', 'info');
        return;
      }
    }

    if (!abortRef.current && currentIdxRef.current >= total && total > 0) {
      setVbState('ALL_COMPLETE');
      runningRef.current = false;
      stopTimer();
      const f = funnelRef.current;
      vbLog(
        'All batches complete — ' + (f?.topics.length ?? 0) + ' topics, ' +
          intentsRef.current.length + ' intents, $' + totalSpentRef.current.toFixed(2),
        'ok',
      );
      clearCheckpoint();
      if (f && onComplete) onComplete(f);
    }
  }, [emitForensic, runBatchEnumerations, saveCheckpoint, clearCheckpoint, vbLog, onComplete]);

  // ── build the carrier batch queue from the keyword list ──
  const buildQueue = useCallback((): VBBatch[] => {
    const rows: KeywordRow[] = allKeywords.map((k) => ({
      id: k.id,
      keyword: k.keyword,
      volume: Number(k.volume) || 0,
    }));
    const carriers = carrierDedup(rows, rbCarrierDedupConfig(rb, conditionTerm));
    const carrierBatches = buildCarrierBatches(carriers, batchSize);
    carrierBatchesRef.current = carrierBatches;
    sweepPointsRef.current = new Set(planSweeps(carriers.length, { cadence: reorgCadence }));
    return carrierBatches.map((b, i) => ({
      batchNum: i + 1,
      carrierCount: b.length,
      status: 'queued' as const,
      intentCount: 0,
      cost: 0,
      inputTokens: 0,
      outputTokens: 0,
      failures: 0,
    }));
  }, [allKeywords, rb, conditionTerm, batchSize, reorgCadence]);

  // ── controls ──
  const handleStart = () => {
    if (!record) {
      vbLog('Pick a model first.', 'error');
      return;
    }
    if (apiMode === 'direct' && !apiKey.trim()) {
      vbLog('Direct mode needs your Anthropic API key.', 'error');
      return;
    }
    const queue = buildQueue();
    if (queue.length === 0) {
      vbLog('No keywords to process.', 'warn');
      return;
    }
    abortRef.current = false;
    creditHaltRef.current = false;
    abortControllerRef.current = new AbortController();
    intentsRef.current = [];
    batchCostsRef.current = [];
    funnelRef.current = null;
    setFunnel(null);
    forensicLogRef.current.clear();
    setForensicCount(0);
    sessionIdRef.current = 'vb-' + projectId + '-' + Date.now();
    batchesRef.current = queue;
    setBatches(queue);
    currentIdxRef.current = 0;
    setCurrentIdx(0);
    totalSpentRef.current = 0;
    setTotalSpent(0);
    setLogEntries([]);
    setElapsed(0);
    startTimeRef.current = Date.now();
    startTimer();
    setVbState('RUNNING');
    runningRef.current = true;
    vbLog('Run started — ' + queue.length + ' batches (' + estimate.nCarriers + ' carrier groups).', 'info');
    void runLoop();
  };

  const handlePause = () => {
    vbLog('Paused.', 'warn');
    setVbState('PAUSED');
    runningRef.current = false;
    saveCheckpoint();
  };
  const handleResume = () => {
    vbLog('Resumed.', 'info');
    creditHaltRef.current = false;
    abortRef.current = false;
    if (!abortControllerRef.current) abortControllerRef.current = new AbortController();
    setVbState('RUNNING');
    runningRef.current = true;
    if (!startTimeRef.current) startTimeRef.current = Date.now() - elapsed * 1000;
    startTimer();
    void runLoop();
  };
  const handleContinueReview = () => {
    setVbState('RUNNING');
    runningRef.current = true;
    void runLoop();
  };
  const handleCancel = () => {
    if (!confirm('Cancel this AI 2 run? Progress is saved as a checkpoint you can resume.')) return;
    vbLog('Cancelled.', 'warn');
    abortRef.current = true;
    runningRef.current = false;
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch {
        /* ignore */
      }
      abortControllerRef.current = null;
    }
    stopTimer();
    setVbState('IDLE');
  };

  const handleResumeCheckpoint = () => {
    let cp: ReturnType<typeof JSON.parse>;
    try {
      const raw = localStorage.getItem(cpKey);
      if (!raw) {
        setHasSavedCheckpoint(false);
        return;
      }
      cp = JSON.parse(raw);
    } catch {
      setHasSavedCheckpoint(false);
      return;
    }
    const c = cp.config ?? {};
    if (c.apiMode && isExecutionMode(c.apiMode)) setApiMode(c.apiMode);
    if (typeof c.modelId === 'string' && c.modelId) setModelId(c.modelId);
    if (typeof c.batchSize === 'number' && c.batchSize > 0) setBatchSize(c.batchSize);
    if (typeof c.concurrency === 'number' && c.concurrency > 0) setConcurrency(c.concurrency);
    if (typeof c.reorgCadence === 'number' && c.reorgCadence > 0) setReorgCadence(c.reorgCadence);

    // rebuild the (deterministic) carrier batches from the same keywords + config
    const restoredBatchSize = typeof c.batchSize === 'number' && c.batchSize > 0 ? c.batchSize : batchSize;
    const restoredCadence = typeof c.reorgCadence === 'number' && c.reorgCadence > 0 ? c.reorgCadence : reorgCadence;
    const rows: KeywordRow[] = allKeywords.map((k) => ({ id: k.id, keyword: k.keyword, volume: Number(k.volume) || 0 }));
    const carriers = carrierDedup(rows, rbCarrierDedupConfig(rb, conditionTerm));
    carrierBatchesRef.current = buildCarrierBatches(carriers, restoredBatchSize);
    sweepPointsRef.current = new Set(planSweeps(carriers.length, { cadence: restoredCadence }));

    intentsRef.current = Array.isArray(cp.intents) ? cp.intents : [];
    batchesRef.current = Array.isArray(cp.batches) ? cp.batches : [];
    setBatches(batchesRef.current);
    currentIdxRef.current = typeof cp.currentIdx === 'number' ? cp.currentIdx : 0;
    setCurrentIdx(currentIdxRef.current);
    totalSpentRef.current = typeof cp.totalSpent === 'number' ? cp.totalSpent : 0;
    setTotalSpent(totalSpentRef.current);
    setLogEntries(Array.isArray(cp.logEntries) ? cp.logEntries : []);
    setElapsed(typeof cp.elapsed === 'number' ? cp.elapsed : 0);

    // re-fold whatever was already enumerated so the panel shows the tree
    if (intentsRef.current.length > 0) {
      const folded = foldIntentsToTree(intentsRef.current, rb, { runSweep: true, reorg: { cadence: restoredCadence } });
      funnelRef.current = folded;
      setFunnel(folded);
    }

    sessionIdRef.current = 'vb-' + projectId + '-resume-' + Date.now();
    abortRef.current = false;
    creditHaltRef.current = false;
    abortControllerRef.current = new AbortController();
    startTimeRef.current = Date.now() - (typeof cp.elapsed === 'number' ? cp.elapsed : 0) * 1000;
    startTimer();
    vbLog('Resumed from checkpoint (' + currentIdxRef.current + '/' + carrierBatchesRef.current.length + ' batches done).', 'ok');
    setVbState('RUNNING');
    runningRef.current = true;
    setHasSavedCheckpoint(false);
    void runLoop();
  };

  const handleDownloadLog = () => {
    const { content, filename, mimeType } = buildForensicDownload(forensicLogRef.current, sessionIdRef.current);
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/^aa-/, 'vb-');
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    if ((vbState === 'RUNNING' || vbState === 'BATCH_REVIEW') && !confirm('A run is in progress. Close the panel? (The run keeps going; reopen to watch it.)')) {
      return;
    }
    setMinimized(false);
    onClose();
  };

  // clean up the timer on unmount
  useEffect(() => () => stopTimer(), []);

  if (!open) return null;

  const total = batches.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const running = vbState === 'RUNNING';
  const configDisabled = vbState !== 'IDLE';

  return (
    <div
      className={`aa-overlay open${minimized ? ' aa-minimized' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget && vbState === 'IDLE') handleClose();
      }}
    >
      <div className="aa-minibar" onClick={() => setMinimized(false)}>
        <span className="aa-minibar-status">
          {running ? '⚡ Running (AI 2)' : vbState === 'PAUSED' ? '⏸ Paused' : vbState === 'BATCH_REVIEW' ? '⏸ Review' : vbState}
        </span>
        <span className="aa-minibar-progress">
          {completedCount}/{total} batches · ${totalSpent.toFixed(2)}
          {showForecast ? ' / ~$' + costProjection.estTotal.toFixed(0) : ''} · {fmtTime(elapsed)}
        </span>
      </div>

      <div className="aa-panel">
        <div className="aa-header">
          <h3>⚡ AI 2 — Keyword Clustering (Variant B)</h3>
          <div className="aa-header-btns">
            {(running || vbState === 'PAUSED' || vbState === 'BATCH_REVIEW') && (
              <button onClick={() => setMinimized(true)}>▾ Minimize</button>
            )}
            <button onClick={handleClose}>✕ Close</button>
          </div>
        </div>

        <div className="aa-body">
          {/* ── config ── */}
          <div className="aa-section">
            <div className="aa-section-title">Settings</div>

            <div className="aa-row">
              <span className="aa-label">How it runs</span>
              <ExecutionModeSelect
                className="aa-input"
                value={apiMode}
                onChange={setApiMode}
                disabled={configDisabled}
              />
            </div>

            {apiMode === 'direct' && (
              <div className="aa-row">
                <span className="aa-label">API key</span>
                <input
                  className="aa-input"
                  type="password"
                  placeholder="sk-ant-…"
                  value={apiKey}
                  disabled={configDisabled}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
            )}

            <div className="aa-row">
              <span className="aa-label">Model</span>
              <select
                className="aa-input"
                value={modelId}
                disabled={configDisabled}
                onChange={(e) => setModelId(e.target.value)}
              >
                {models.map((m) => (
                  <option key={m.id} value={m.modelId}>
                    {m.displayLabel}
                  </option>
                ))}
              </select>
            </div>

            <div className="aa-row">
              <span className="aa-label">Keyword groups per batch</span>
              <input
                className="aa-input aa-input-sm"
                type="number"
                min={1}
                value={batchSize}
                disabled={configDisabled}
                onChange={(e) => setBatchSize(Math.max(1, Number(e.target.value) || DEFAULT_BATCH_SIZE))}
              />
              <span className="aa-label" style={{ marginLeft: 16 }}>At once</span>
              <input
                className="aa-input aa-input-sm"
                type="number"
                min={1}
                value={concurrency}
                disabled={configDisabled}
                onChange={(e) => setConcurrency(Math.max(1, Number(e.target.value) || DEFAULT_CONCURRENCY))}
              />
              <span className="aa-label" style={{ marginLeft: 16 }}>Tidy-up every</span>
              <input
                className="aa-input aa-input-sm"
                type="number"
                min={1}
                value={reorgCadence}
                disabled={configDisabled}
                onChange={(e) => setReorgCadence(Math.max(1, Number(e.target.value) || DEFAULT_REORG_CADENCE))}
              />
            </div>

            {/* Pause-after-each-batch — editable at launch AND mid-run */}
            <div className="aa-row">
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#cbd5e1' }}>
                <input
                  type="checkbox"
                  checked={reviewMode}
                  onChange={(e) => setReviewMode(e.target.checked)}
                />
                Pause after each batch (review topics before continuing)
              </label>
            </div>
          </div>

          {/* ── cost estimate (per-step + total breakdown) ── */}
          {vbState === 'IDLE' && (
            <div className="aa-section">
              <div className="aa-section-title">Estimated cost</div>
              <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.7 }}>
                <div>Keyword groups: <strong>{estimate.nCarriers}</strong> · Batches: <strong>{estimate.nBatches}</strong></div>
                <div>Per keyword group: <strong>~${estimate.perCarrier.toFixed(4)}</strong></div>
                <div>Per batch (~{batchSize} groups): <strong>~${estimate.perBatch.toFixed(3)}</strong></div>
                <div>Estimated total: <strong>~${estimate.total.toFixed(2)}</strong></div>
                <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>
                  An estimate — the real cost is shown live as the run progresses.
                </div>
              </div>
            </div>
          )}

          {/* ── spend cap ── */}
          <div className="aa-section">
            <div className="aa-row">
              <span className="aa-label">Spending limit (USD)</span>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#cbd5e1', marginRight: 10 }}>
                <input type="checkbox" checked={noCap} onChange={(e) => setNoCap(e.target.checked)} /> No limit
              </label>
              <input
                className="aa-input aa-input-sm"
                type="number"
                min={0}
                step={1}
                value={spendCapUsd || ''}
                placeholder="e.g. 25"
                disabled={noCap}
                onChange={(e) => setSpendCapUsd(Math.max(0, Number(e.target.value) || 0))}
              />
              {!noCap && spendCapUsd > 0 && (
                <span style={{ fontSize: 10, color: spendCapColor, marginLeft: 8 }}>
                  {spendCapStatus === 'over'
                    ? 'limit reached — run pauses'
                    : spendCapStatus === 'warn'
                      ? 'nearing limit'
                      : 'pauses at $' + spendCapUsd.toFixed(0)}
                </span>
              )}
            </div>
          </div>

          {/* ── saved checkpoint ── */}
          {hasSavedCheckpoint && vbState === 'IDLE' && (
            <div className="aa-section" style={{ background: 'rgba(59,130,246,0.12)', borderRadius: 6, padding: 8 }}>
              <div style={{ fontSize: 12, color: '#bfdbfe', marginBottom: 6 }}>A saved run is waiting to be resumed.</div>
              <button className="aa-btn" onClick={handleResumeCheckpoint}>▶ Resume saved run</button>
              <button className="aa-btn" onClick={clearCheckpoint} style={{ marginLeft: 8 }}>✕ Discard</button>
            </div>
          )}

          {/* ── progress ── */}
          {total > 0 && (
            <div className="aa-section">
              <div className="aa-section-title">Progress</div>
              <div style={{ background: '#1e293b', borderRadius: 4, height: 10, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ width: pct + '%', height: '100%', background: '#22c55e', transition: 'width .3s' }} />
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                {completedCount}/{total} batches · ${totalSpent.toFixed(2)} spent
                {showForecast ? ' · est. total ~$' + costProjection.estTotal.toFixed(2) : ''} · {fmtTime(elapsed)}
              </div>
              {funnel && (
                <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 6, lineHeight: 1.7 }}>
                  Topics: <strong>{funnel.stats.topicCount}</strong> · Max depth: <strong>{funnel.stats.maxDepth}</strong> ·
                  Placed: <strong>{funnel.stats.placedCount}</strong> · Needs review: <strong>{funnel.stats.unplacedCount}</strong>
                  {funnel.stats.multiTopicKeywordCount > 0 && (
                    <> · In multiple topics: <strong>{funnel.stats.multiTopicKeywordCount}</strong></>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── activity log ── */}
          {logEntries.length > 0 && (
            <div className="aa-section">
              <div className="aa-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Activity Log
                <button
                  className="aa-btn aa-btn-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(logEntries.map((e) => e.ts + ' ' + e.msg).join('\n'));
                    vbLog('Activity log copied to clipboard', 'ok');
                  }}
                >
                  📋 Copy Log
                </button>
              </div>
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

        {/* ── controls ── */}
        <div className="aa-controls">
          {vbState === 'IDLE' && (
            <button className="aa-btn aa-btn-primary" onClick={handleStart} disabled={models.length === 0}>
              ▶ Start AI 2 run
            </button>
          )}
          {running && (
            <button className="aa-btn" onClick={handlePause}>⏸ Pause</button>
          )}
          {(vbState === 'PAUSED' || vbState === 'API_ERROR') && (
            <button className="aa-btn aa-btn-primary" onClick={handleResume}>▶ Resume</button>
          )}
          {vbState === 'BATCH_REVIEW' && (
            <button className="aa-btn aa-btn-primary" onClick={handleContinueReview}>▶ Continue</button>
          )}
          {(running || vbState === 'PAUSED' || vbState === 'BATCH_REVIEW' || vbState === 'API_ERROR') && (
            <button className="aa-btn" onClick={handleCancel}>✕ Cancel</button>
          )}
          <button
            className="aa-btn"
            onClick={handleDownloadLog}
            disabled={forensicCount === 0}
            title="Download a per-batch log (NDJSON) of payload sizes, token counts, and cost — for the A/B comparison and bug reports."
          >
            📥 Download log{forensicCount > 0 ? ' (' + forensicCount + ')' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
