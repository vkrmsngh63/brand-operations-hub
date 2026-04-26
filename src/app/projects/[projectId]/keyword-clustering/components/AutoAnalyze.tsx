'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { authFetch } from '@/lib/authFetch';
import type { CanvasNode } from '@/hooks/useCanvas';
import { calcNodeHeight, runLayoutPass, type LayoutNode } from '@/lib/canvas-layout';
import {
  applyOperations,
  buildCanvasStateForApplier,
  buildOperationsInputTsv,
  materializeRebuildPayload,
  parseOperationsJsonl,
} from '@/lib/auto-analyze-v3';
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
  onBatchUpdateKeywords: (updates: { id: string; [key: string]: unknown }[]) => void;
  projectId: string;
  onRefreshCanvas: () => Promise<void>;
  onRefreshKeywords: () => Promise<void>;
}

/* ── Component ─────────────────────────────────────────────── */
export default function AutoAnalyze({
  open, onClose, allKeywords, nodes, pathways, sisterLinks,
  onUpdateNodes, onAddNode, onDeleteNode, onBatchUpdateKeywords, projectId, onRefreshCanvas, onRefreshKeywords,
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

  // runLoop-reachable code must read nodes/allKeywords/sisterLinks via *Ref.current, not raw props — the async runLoop closure freezes props. See CORRECTIONS_LOG 2026-04-18.
  useEffect(() => { batchesRef.current = batches; }, [batches]);
  useEffect(() => { currentIdxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { batchTierRef.current = batchTier; }, [batchTier]);
  useEffect(() => { totalSpentRef.current = totalSpent; }, [totalSpent]);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { keywordsRef.current = allKeywords; }, [allKeywords]);
  useEffect(() => { sisterLinksRef.current = sisterLinks; }, [sisterLinks]);

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
        stallTimeout, reviewMode, initialPrompt, primerPrompt,
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
      stallTimeout, reviewMode, initialPrompt, primerPrompt]);

  const logRef = useRef<HTMLDivElement>(null);

  /* ── Log helper ────────────────────────────────────────────── */
  const aaLog = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
    const ts = new Date().toLocaleTimeString();
    setLogEntries(prev => [...prev, { ts, msg, type }]);
    setTimeout(() => logRef.current?.scrollTo(0, logRef.current.scrollHeight), 50);
  }, []);

  /* ── Checkpoint persistence ─────────────────────────────────── */
  const cpKey = 'aa_checkpoint_' + projectId;
  function saveCheckpoint() {
    try {
      const cp = {
        ts: Date.now(),
        config: { apiMode, apiKey, model, seedWords, volumeThreshold, batchSize, processingMode, thinkingMode, thinkingBudget, keywordScope, stallTimeout, reviewMode, initialPrompt, primerPrompt },
        batches: batchesRef.current,
        currentIdx: currentIdxRef.current,
        totalSpent: totalSpentRef.current,
        batchTier: batchTierRef.current,
        elapsed,
        logEntries,
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

    const inputTsv = buildOperationsInputTsv(
      nodesRef.current,
      sisterLinksRef.current,
      keywordsRef.current,
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
  async function processBatchV3(batch: BatchObj): Promise<BatchResult> {
    const { systemText, userContent } = assemblePromptV3(batch);
    const estTokens = Math.ceil((systemText.length + userContent.length) / 4);
    aaLog('Batch ' + batch.batchNum + ' (V3) — sending ~' + estTokens.toLocaleString() + ' input tokens…', 'info');

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
    const applyResult = applyOperations(state, parsed.operations);
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
  async function doApplyV3(
    batch: BatchObj,
    ops: ReturnType<typeof parseOperationsJsonl>['operations'],
  ) {
    // Fetch canonical nextStableIdN so issued stableIds cannot collide with
    // anything that may have changed since page load (e.g., admin manually
    // added a node in another tab).
    const canvasStateRes = await authFetch('/api/projects/' + projectId + '/canvas');
    const canvasStateData = await canvasStateRes.json();
    const nextStableIdN = canvasStateData.canvasState?.nextStableIdN ?? 1;

    const originalNodes = nodesRef.current;
    const originalSisterLinks = sisterLinksRef.current;

    const state = buildCanvasStateForApplier(originalNodes, originalSisterLinks, nextStableIdN);
    const applyResult = applyOperations(state, ops);
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
    for (const ln of layoutNodes) ln.h = calcNodeHeight(ln);
    runLayoutPass(layoutNodes, [...pathways, ...payload.pathways]);
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
    aaLog('  Layout pass complete (' + payload.nodes.length + ' nodes positioned)', 'info');

    // Atomic rebuild.
    aaLog('  Applying to canvas (atomic rebuild)…', 'info');
    try {
      const res = await authFetch('/api/projects/' + projectId + '/canvas/rebuild', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error('Canvas rebuild failed: ' + errText);
      }
      aaLog(
        '  ✓ Canvas rebuilt (' + payload.nodes.length + ' nodes, ' +
        payload.deleteNodeIds.length + ' removed, ' +
        payload.sisterLinks.length + ' new sister links)',
        'ok',
      );
    } catch (e) {
      aaLog('  ✗ Canvas rebuild FAILED — all changes rolled back. ' + (e instanceof Error ? e.message : ''), 'error');
      throw e;
    }

    // Archive keyword POSTs (one per intent — preserves individual reasoning).
    for (const a of applyResult.archivedKeywords) {
      try {
        const res = await authFetch('/api/projects/' + projectId + '/removed-keywords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keywordIds: [a.keywordId],
            removedSource: 'auto-ai-detected-irrelevant',
            aiReasoning: a.reason || null,
          }),
        });
        if (res.ok) {
          aaLog('  ↻ Archived keyword ' + a.keywordId + (a.reason ? ' — ' + a.reason : ''), 'info');
        } else {
          aaLog('  ⚠ Archive failed for ' + a.keywordId + ' (status ' + res.status + ')', 'warn');
        }
      } catch (e) {
        aaLog('  ⚠ Archive error for ' + a.keywordId + ': ' + (e instanceof Error ? e.message : ''), 'warn');
      }
    }

    // Update keyword.topic + keyword.canvasLoc to mirror the new placements.
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
    const kwTopicUpdates: { id: string; [key: string]: unknown }[] = [];
    for (const [kwId, placements] of placementsByKeyword) {
      const topics = placements.map(p => titleByStableId.get(p.stableId) ?? '').filter(Boolean);
      const canvasLoc: Record<string, string> = {};
      for (const p of placements) {
        const t = titleByStableId.get(p.stableId);
        const d = descByStableId.get(p.stableId) ?? '';
        if (t) canvasLoc[t] = d;
      }
      kwTopicUpdates.push({
        id: kwId,
        topic: topics.join(' | '),
        canvasLoc,
      });
    }
    if (kwTopicUpdates.length > 0) onBatchUpdateKeywords(kwTopicUpdates);

    // Refresh UI.
    await onRefreshCanvas();
    await onRefreshKeywords();

    // P3-F7 status reconciliation: heal any keyword whose status drifted from
    // its canvas presence (on-canvas but Unsorted/Reshuffled → AI-Sorted;
    // off-canvas but AI-Sorted → Reshuffled).
    const placedSet = new Set(placementsByKeyword.keys());
    const archivedSet = new Set(applyResult.archivedKeywords.map(a => a.keywordId));
    const reconcileUpdates: { id: string; sortingStatus: string }[] = [];
    let flippedToAiSorted = 0;
    let flippedToReshuffled = 0;
    for (const kw of allKeywords) {
      if (archivedSet.has(kw.id)) continue; // archived keywords are handled by /removed-keywords
      const onCanvas = placedSet.has(kw.id);
      if (onCanvas && (kw.sortingStatus === 'Unsorted' || kw.sortingStatus === 'Reshuffled')) {
        reconcileUpdates.push({ id: kw.id, sortingStatus: 'AI-Sorted' });
        flippedToAiSorted++;
      } else if (!onCanvas && kw.sortingStatus === 'AI-Sorted') {
        reconcileUpdates.push({ id: kw.id, sortingStatus: 'Reshuffled' });
        flippedToReshuffled++;
      }
    }
    if (reconcileUpdates.length > 0) {
      onBatchUpdateKeywords(reconcileUpdates);
      aaLog(
        '  ↻ Reconciliation: ' + flippedToAiSorted + ' on-canvas → AI-Sorted, ' +
        flippedToReshuffled + ' off-canvas → Reshuffled',
        flippedToReshuffled > 0 ? 'warn' : 'ok',
      );
    }

    // Mark batch keywords as ✓.
    const verified = batch.keywordIds.filter(id => placedSet.has(id) || archivedSet.has(id));
    if (verified.length === batch.keywordIds.length) {
      aaLog('  ✓ All ' + batch.keywordIds.length + ' keywords verified (placed or archived).', 'ok');
    } else {
      const unplacedIds = batch.keywordIds.filter(id => !placedSet.has(id) && !archivedSet.has(id));
      aaLog('  ⚠ ' + unplacedIds.length + ' batch keyword(s) unplaced after apply: ' + unplacedIds.join(', '), 'warn');
      batch._unplacedKws = unplacedIds.map(id => {
        const k = allKeywords.find(x => x.id === id);
        return k ? k.keyword : id;
      });
    }
  }

  /* ── Main run loop ─────────────────────────────────────────── */
  async function runLoop() {
    while (runningRef.current && !abortRef.current && currentIdxRef.current < batchesRef.current.length) {
      const idx = currentIdxRef.current;
      const batch = batchesRef.current[idx];

      if (batch.status === 'complete' || batch.status === 'skipped') {
        setCurrentIdx(prev => prev + 1);
        currentIdxRef.current++;
        continue;
      }

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
          await doApplyV3(batch, v3Validation.ops);
          batch.status = 'complete';
          batch.completedAt = Date.now();
          aaLog('Batch ' + batch.batchNum + ' — applied.', 'ok');
          saveCheckpoint();
          setCurrentIdx(prev => prev + 1);
          currentIdxRef.current++;
          setBatches([...batchesRef.current]);
          continue;
        }

      } catch (err: unknown) {
        if (abortRef.current) break;
        const errObj = err as Error & { _isStall?: boolean; _noRetry?: boolean };
        const errMsg = errObj.message || String(err);

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
  function handleStart() {
    if (apiMode === 'direct' && !apiKey.trim()) { alert('Please enter your Anthropic API key.'); return; }
    if (!seedWords.trim()) { alert('Please enter seed words.'); return; }
    if (!initialPrompt || initialPrompt.length < 100) { alert('Please paste your AI Analysis Prompt (expand the prompt section).'); setPromptExpanded(true); return; }
    const unsorted = getUnsortedKws();
    if (!unsorted.length) { alert('No keywords matching scope.'); return; }

    const queue = buildQueue();
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

    aaLog('Auto-Analyze started. ' + queue.length + ' batches, ' + unsorted.length + ' keywords.', 'info');
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
    await doApplyV3(batch, batch._v3Ops);
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
              <div className="aa-toggle" onClick={() => { if (aaState === 'IDLE') setReviewMode(!reviewMode); }}>
                <div className={`aa-toggle-track${reviewMode ? ' on' : ''}`}><div className="aa-toggle-thumb" /></div>
                <span>Review each batch</span>
              </div>
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
          {aaState === 'IDLE' && <button className="aa-btn aa-btn-start" onClick={handleStart}>▶ Start</button>}
          {aaState === 'RUNNING' && <button className="aa-btn aa-btn-pause" onClick={handlePause}>⏸ Pause</button>}
          {(aaState === 'PAUSED' || aaState === 'API_ERROR' || aaState === 'VALIDATION_ERROR') && <button className="aa-btn aa-btn-resume" onClick={handleResume}>▶ Resume</button>}
          {aaState !== 'IDLE' && aaState !== 'ALL_COMPLETE' && <button className="aa-btn aa-btn-cancel" onClick={handleCancel}>✕ Cancel</button>}
          <button className="aa-btn aa-btn-close" onClick={handleClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
