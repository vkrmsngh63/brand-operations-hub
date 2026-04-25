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
  // Pivot Session D: stash parsed operations on the batch when reviewMode
  // pauses for human approval, so handleApplyBatch can call doApplyV3.
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

const AA_DELIMITERS = {
  topicsStart: '===BEGIN_INTEGRATED_TOPICS_LAYOUT_TABLE===',
  topicsEnd:   '===END_INTEGRATED_TOPICS_LAYOUT_TABLE===',
  deltaStart:  '===BEGIN_TOPICS_LAYOUT_TABLE_DELTA===',
  deltaEnd:    '===END_TOPICS_LAYOUT_TABLE_DELTA===',
  katStart:    '===BEGIN_KEYWORDS_ANALYSIS_TABLE===',
  katEnd:      '===END_KEYWORDS_ANALYSIS_TABLE===',
  reevalStart: '===BEGIN_REEVALUATION_REPORT===',
  reevalEnd:   '===END_REEVALUATION_REPORT===',
  // Salvage follow-up blocks (Change 6 in AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES).
  // Tool-generated prompt; not stored in canonical V2.
  salvageDeltaStart:    '=== DELTA ROWS FOR PLACEMENTS ===',
  salvageDeltaEnd:      '=== END DELTA ROWS ===',
  salvageIrrStart:      '=== IRRELEVANT_KEYWORDS ===',
  salvageIrrEnd:        '=== END IRRELEVANT_KEYWORDS ===',
  salvageReevalStart:   '=== REEVALUATION REPORT ===',
  salvageReevalEnd:     '=== END REEVALUATION REPORT ===',
};

const AA_OUTPUT_INSTRUCTIONS = `

OUTPUT FORMAT FOR AUTOMATED PROCESSING:
You must wrap each deliverable in exact delimiter markers as shown below.
These markers must appear EXACTLY as shown — they are parsed programmatically.
Do not place any extra text between the opening marker and the header row,
or between the last data row and the closing marker.
Do not use code fences or markdown formatting within the delimited blocks.

For the Keywords Analysis Table:
===BEGIN_KEYWORDS_ANALYSIS_TABLE===
Keyword\tMain Topic\tMain Topic Title\tMain Topic Description\tMain Topic Location\tUpstream Topic\tUT Title\tUT Description\tUT Location
[data rows, tab-separated]
===END_KEYWORDS_ANALYSIS_TABLE===

TWO OUTPUT MODES FOR THE TOPICS LAYOUT TABLE:
The user message will specify which mode to use for this batch.

MODE A — FULL TABLE (complete, cumulative, depth-first tree-walk order):
===BEGIN_INTEGRATED_TOPICS_LAYOUT_TABLE===
Depth\tTopic\tAlternate Titles\tRelationship\tParent Topic\tConversion Path\tSister Nodes\tKeywords\tTopic Description
[ALL data rows, tab-separated — every existing and new topic]
===END_INTEGRATED_TOPICS_LAYOUT_TABLE===

MODE B — DELTA (ONLY new and modified rows — NOT the full table):
===BEGIN_TOPICS_LAYOUT_TABLE_DELTA===
Action\tDepth\tTopic\tAlternate Titles\tRelationship\tParent Topic\tConversion Path\tSister Nodes\tKeywords\tTopic Description
[ONLY changed data rows, tab-separated]
===END_TOPICS_LAYOUT_TABLE_DELTA===

The Action column MUST be the first column in DELTA mode. Allowed values:
- ADD — a brand-new topic row that does not exist in the current table.
- UPDATE — an existing topic row where any field has changed.

CRITICAL DELTA RULES (apply only when using Mode B):
- Do NOT include unchanged rows.
- For UPDATE rows, the Topic title must EXACTLY match the existing topic title.
- For UPDATE rows, include the COMPLETE current state of ALL fields — especially the FULL keywords list.
- ADD rows must appear in depth-first tree-walk order relative to each other.
- If a new topic needs parent topics that don't exist yet, those parents must also appear as ADD rows BEFORE their children.
- When reevaluation moves a keyword, BOTH topics must appear as UPDATE rows.

For the Reevaluation Report:
===BEGIN_REEVALUATION_REPORT===
[your reevaluation report text — state "No structural changes warranted" if none]
===END_REEVALUATION_REPORT===

CRITICAL RULES:
- ALL THREE delimited blocks must appear in every response.
- Never delete existing topics or remove existing keywords — only add or reassign.
- Do not produce files or artifacts — only the delimited text blocks above.
- Do not ask for the next batch — the system handles sequencing automatically.
`;

/* ── Props ──────────────────────────────────────────────────── */
interface AutoAnalyzeProps {
  open: boolean;
  onClose: () => void;
  allKeywords: Keyword[];
  nodes: CanvasNode[];
  pathways: { id: number; projectId: string }[];
  sisterLinks: { id: string; nodeA: number; nodeB: number }[];
  onUpdateNodes: (updates: Partial<CanvasNode>[]) => Promise<void>;
  onAddNode: (data: Partial<CanvasNode>) => Promise<CanvasNode | null>;
  onDeleteNode: (id: number) => Promise<void> | void;
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
  // Pivot Session D: output contract switch. V3 (default) uses the operation-based
  // prompts in docs/AUTO_ANALYZE_PROMPT_V3.md and persists via the operation-applier.
  // V2 (legacy) uses the full-table TSV / Mode A/B contract; kept selectable as
  // defense-in-depth while V3 ramps up.
  const [outputContract, setOutputContract] = useState<'v3-operations' | 'v2-tsv'>('v3-operations');

  /* ── Runtime state ─────────────────────────────────────────── */
  const [aaState, setAaState] = useState<AAState>('IDLE');
  const [batches, setBatches] = useState<BatchObj[]>([]);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [totalSpent, setTotalSpent] = useState(0);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [deltaMode, setDeltaMode] = useState(false);
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
  const deltaModeRef = useRef(deltaMode);
  const batchTierRef = useRef(batchTier);
  const totalSpentRef = useRef(totalSpent);
  const nodesRef = useRef(nodes);
  const keywordsRef = useRef(allKeywords);
  const sisterLinksRef = useRef(sisterLinks);
  const outputContractRef = useRef(outputContract);

  // Keep refs in sync.
  // runLoop-reachable code must read nodes/allKeywords/sisterLinks via *Ref.current, not raw props — the async runLoop closure freezes props. See CORRECTIONS_LOG 2026-04-18.
  useEffect(() => { batchesRef.current = batches; }, [batches]);
  useEffect(() => { currentIdxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { deltaModeRef.current = deltaMode; }, [deltaMode]);
  useEffect(() => { batchTierRef.current = batchTier; }, [batchTier]);
  useEffect(() => { totalSpentRef.current = totalSpent; }, [totalSpent]);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { keywordsRef.current = allKeywords; }, [allKeywords]);
  useEffect(() => { sisterLinksRef.current = sisterLinks; }, [sisterLinks]);
  useEffect(() => { outputContractRef.current = outputContract; }, [outputContract]);

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
        if (s.outputContract === 'v3-operations' || s.outputContract === 'v2-tsv') {
          setOutputContract(s.outputContract);
        }
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
        stallTimeout, reviewMode, initialPrompt, primerPrompt, outputContract,
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
      stallTimeout, reviewMode, initialPrompt, primerPrompt, outputContract]);

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
        config: { apiMode, apiKey, model, seedWords, volumeThreshold, batchSize, processingMode, thinkingMode, thinkingBudget, keywordScope, stallTimeout, reviewMode, initialPrompt, primerPrompt, outputContract },
        batches: batchesRef.current,
        currentIdx: currentIdxRef.current,
        totalSpent: totalSpentRef.current,
        deltaMode: deltaModeRef.current,
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
    if (c.outputContract === 'v3-operations' || c.outputContract === 'v2-tsv') {
      setOutputContract(c.outputContract);
      outputContractRef.current = c.outputContract;
    }
    setBatches(cp.batches); batchesRef.current = cp.batches;
    setCurrentIdx(cp.currentIdx); currentIdxRef.current = cp.currentIdx;
    setTotalSpent(cp.totalSpent); totalSpentRef.current = cp.totalSpent;
    setDeltaMode(cp.deltaMode); deltaModeRef.current = cp.deltaMode;
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

  /* ── Build the current Topics Layout Table TSV from nodes ──── */
  function buildCurrentTsv(): string {
    // Read via refs — runLoop's async closure would otherwise freeze these to pre-run state.
    const nodesNow = nodesRef.current;
    const keywordsNow = keywordsRef.current;
    const sisterLinksNow = sisterLinksRef.current;

    // Depth-first tree walk
    const childMap = new Map<number | null, CanvasNode[]>();
    for (const n of nodesNow) {
      const pid = n.parentId ?? null;
      if (!childMap.has(pid)) childMap.set(pid, []);
      childMap.get(pid)!.push(n);
    }
    // Sort children by y position
    for (const children of childMap.values()) {
      children.sort((a, b) => a.y - b.y);
    }
    const rows: string[] = [];
    rows.push('Depth\tTopic\tAlternate Titles\tRelationship\tParent Topic\tConversion Path\tSister Nodes\tKeywords\tTopic Description');

    function walk(parentId: number | null, depth: number) {
      const children = childMap.get(parentId) || [];
      for (const node of children) {
        const parentNode = parentId !== null ? nodesNow.find(n => n.id === parentId) : null;
        const parentTitle = parentNode?.title || '';
        const altTitles = (node.altTitles || []).join(', ');
        const rel = node.relationshipType || '';
        // Build keywords with [p]/[s] annotations
        const kwParts: string[] = [];
        for (const kwId of (node.linkedKwIds || [])) {
          const kw = keywordsNow.find(k => k.id === kwId);
          if (kw) {
            const placement = (node.kwPlacements || {})[kwId] || 'p';
            kwParts.push(kw.keyword + ' [' + placement + ']');
          }
        }
        // Sister nodes
        const sisters: string[] = [];
        for (const sl of sisterLinksNow) {
          if (sl.nodeA === node.id) {
            const sn = nodesNow.find(n => n.id === sl.nodeB);
            if (sn) sisters.push(sn.title);
          } else if (sl.nodeB === node.id) {
            const sn = nodesNow.find(n => n.id === sl.nodeA);
            if (sn) sisters.push(sn.title);
          }
        }
        const convPath = ''; // Not stored separately
        rows.push([depth, node.title, altTitles, rel, parentTitle, convPath, sisters.join(', '), kwParts.join(', '), node.description || ''].join('\t'));
        walk(node.id, depth + 1);
      }
    }
    walk(null, 0);
    return rows.join('\n');
  }

  /* ── Assemble prompt for a batch ───────────────────────────── */
  function assemblePrompt(batch: BatchObj): { systemText: string; userContent: string } {
    let systemText = initialPrompt;
    systemText = systemText.replace(/\[bursitis\]/gi, '[' + seedWords + ']');
    systemText = systemText.replace(/\[PRIMARY_SEED_WORDS\]/g, seedWords);
    systemText = systemText.replace(/\[VOLUME_THRESHOLD\]/g, String(volumeThreshold));
    if (primerPrompt) {
      systemText += '\n\n--- TOPICS LAYOUT TABLE PRIMER ---\n\n' + primerPrompt;
    }
    systemText += AA_OUTPUT_INSTRUCTIONS;

    const currentTsv = buildCurrentTsv();
    const hasTopics = currentTsv.split('\n').length > 1;

    let kwTable = 'Keyword\tVolume\n';
    for (const id of batch.keywordIds) {
      const kw = allKeywords.find(k => k.id === id);
      if (kw) kwTable += kw.keyword + '\t' + (Number(kw.volume) || '') + '\n';
    }

    let userContent = '';
    if (hasTopics) {
      if (deltaModeRef.current) {
        userContent += 'Here is the current Topics Layout Table (TSV format). This is the cumulative funnel for reference — do NOT repeat unchanged rows in your output:\n\n';
        userContent += currentTsv + '\n\n';
        userContent += 'OUTPUT MODE: Use MODE B (DELTA format). Only include ADD rows (new topics) and UPDATE rows (existing topics whose fields changed). Do NOT include unchanged rows.\n\n';
        userContent += 'REEVALUATION IS STILL MANDATORY: After placing the batch keywords, run the full reevaluation pass across the ENTIRE existing table. The delta format reduces output size, NOT analysis depth.\n\n';
      } else {
        userContent += 'Here is the current Topics Layout Table (TSV format). This is the cumulative funnel — preserve all existing data:\n\n';
        userContent += currentTsv + '\n\n';
        userContent += 'OUTPUT MODE: Use MODE A (FULL TABLE format). The output must include ALL existing topics plus any new ones, in depth-first tree-walk order.\n\n';
      }
    } else {
      userContent += 'The Topics Layout Table is currently empty. You will create the initial structure.\n\n';
      userContent += deltaModeRef.current ? 'OUTPUT MODE: Use MODE B (DELTA format). All rows will be ADD rows.\n\n' : 'OUTPUT MODE: Use MODE A (FULL TABLE format).\n\n';
    }

    userContent += 'Here are the ' + batch.keywords.length + ' keywords to analyze for this batch:\n\n';
    userContent += kwTable;
    userContent += '\nPrimary seed word(s): ' + seedWords;
    userContent += '\nVolume threshold for dedicated topic creation: ' + volumeThreshold + '\n';
    userContent += '\nPlease analyze each keyword, place them into appropriate topics (marking primary [p] and secondary [s] placements), perform the reevaluation pass, and provide all three delimited output blocks.';
    if (deltaModeRef.current) {
      userContent += ' Remember: use MODE B DELTA format — only ADD and UPDATE rows.';
    }
    if (batch._correctionContext) {
      userContent += '\n\nCORRECTION REQUIRED — PREVIOUS RESPONSE FAILED VALIDATION:\n' + batch._correctionContext + '\nPlease regenerate the outputs correcting the above issues.';
    }

    return { systemText, userContent };
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

  /* ── Extract delimited block ───────────────────────────────── */
  function extractBlock(text: string, startMarker: string, endMarker: string): string | null {
    const startIdx = text.indexOf(startMarker);
    if (startIdx === -1) return null;
    const contentStart = startIdx + startMarker.length;
    const endIdx = text.indexOf(endMarker, contentStart);
    if (endIdx === -1) return null;
    return text.substring(contentStart, endIdx).trim();
  }

  /* ── Merge delta TSV into current full table ───────────────── */
  // baseTsv is optional. Default = current canvas state via buildCurrentTsv()
  // (the normal Mode B flow). Pass an explicit baseTsv to merge into a
  // different snapshot — used by runSalvage to merge salvage delta rows
  // into the original Mode A response without touching the live canvas.
  function mergeDelta(deltaTsv: string, baseTsv?: string): string {
    const currentTsv = baseTsv ?? buildCurrentTsv();
    const currentLines = currentTsv.split('\n');
    const header = currentLines[0];
    const resultRows = currentLines.slice(1).filter(l => l.trim());

    const deltaLines = deltaTsv.split('\n');
    if (deltaLines.length < 2) return currentTsv;
    const deltaHdr = deltaLines[0].split('\t').map(h => h.trim().toLowerCase());
    const aIdx = deltaHdr.indexOf('action');

    let addCount = 0, updateCount = 0;

    // Parse delta rows
    const deltaRows: { action: string; title: string; parentTitle: string; depth: number; tsvLine: string }[] = [];
    for (let i = 1; i < deltaLines.length; i++) {
      const line = deltaLines[i].trim();
      if (!line) continue;
      const cols = line.split('\t');
      const action = aIdx >= 0 ? (cols[aIdx] || '').trim().toUpperCase() : 'ADD';
      const stdCols = cols.filter((_, ci) => ci !== aIdx);
      const title = stdCols[1] ? stdCols[1].trim() : '';
      const parentTitle = stdCols[4] ? stdCols[4].trim() : '';
      const depth = parseInt(stdCols[0]) || 0;
      if (!title) continue;
      deltaRows.push({ action, title, parentTitle, depth, tsvLine: stdCols.join('\t') });
    }

    function findByTitle(t: string) {
      for (let i = 0; i < resultRows.length; i++) {
        const c = resultRows[i].split('\t');
        if ((c[1] || '').trim() === t) return i;
      }
      return -1;
    }

    // Pass 1: UPDATE
    for (const dr of deltaRows) {
      if (dr.action !== 'UPDATE') continue;
      const idx = findByTitle(dr.title);
      if (idx >= 0) { resultRows[idx] = dr.tsvLine; updateCount++; }
      else dr.action = 'ADD'; // reclassify
    }

    // Pass 2: ADD
    for (const dr of deltaRows) {
      if (dr.action !== 'ADD') continue;
      const existIdx = findByTitle(dr.title);
      if (existIdx >= 0) { resultRows[existIdx] = dr.tsvLine; updateCount++; continue; }
      let insertIdx = resultRows.length;
      if (dr.parentTitle) {
        const parentIdx = findByTitle(dr.parentTitle);
        if (parentIdx >= 0) {
          const parentDepth = parseInt(resultRows[parentIdx].split('\t')[0]) || 0;
          let lastDescIdx = parentIdx;
          for (let j = parentIdx + 1; j < resultRows.length; j++) {
            if ((parseInt(resultRows[j].split('\t')[0]) || 0) > parentDepth) lastDescIdx = j;
            else break;
          }
          insertIdx = lastDescIdx + 1;
        }
      }
      resultRows.splice(insertIdx, 0, dr.tsvLine);
      addCount++;
    }

    aaLog('  Delta merge: ' + addCount + ' added, ' + updateCount + ' updated, ' + resultRows.length + ' total rows', 'info');
    return header + '\n' + resultRows.join('\n');
  }

  /* ── Parse KAT mapping ────────────────────────────────────── */
  function parseKatMapping(katTsv: string | null): Record<string, string[]> {
    const map: Record<string, string[]> = {};
    if (!katTsv) return map;
    const lines = katTsv.split('\n');
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split('\t');
      if (cols.length < 2) continue;
      const kw = cols[0].trim();
      const topic = cols[1].trim();
      if (kw && topic) {
        if (!map[kw]) map[kw] = [];
        if (!map[kw].includes(topic)) map[kw].push(topic);
      }
    }
    return map;
  }

  /* ── Process a single batch ────────────────────────────────── */
  async function processBatch(batch: BatchObj): Promise<BatchResult> {
    const { systemText, userContent } = assemblePrompt(batch);
    const estTokens = Math.ceil((systemText.length + userContent.length) / 4);
    aaLog('Batch ' + batch.batchNum + ' — sending ~' + estTokens.toLocaleString() + ' input tokens…', 'info');

    const requestBody = buildRequestBody(systemText, userContent);
    const apiResponse = await callApi(requestBody, batch.batchNum);

    const textContent = apiResponse.content.filter(b => b.type === 'text').map(b => b.text || '').join('\n');
    if (!textContent.trim()) throw new Error('API returned empty text content');

    const tokensUsed = {
      input: (apiResponse.usage.input_tokens || 0) + (apiResponse.usage.cache_creation_input_tokens || 0) + (apiResponse.usage.cache_read_input_tokens || 0),
      output: apiResponse.usage.output_tokens || 0,
    };

    if (apiResponse.usage.cache_read_input_tokens > 0) aaLog('  Cache hit: ' + apiResponse.usage.cache_read_input_tokens + ' tokens', 'info');

    // Check for truncation
    if (apiResponse.stop_reason === 'max_tokens') aaLog('  ⚠ Response truncated (max_tokens)', 'warn');

    // Parse delimited blocks
    let topicsTableTsv: string | null = null;
    const deltaTsv = extractBlock(textContent, AA_DELIMITERS.deltaStart, AA_DELIMITERS.deltaEnd);
    if (deltaTsv) {
      const dataLines = deltaTsv.split('\n').filter(l => l.trim()).length - 1;
      aaLog('  Delta response: ' + dataLines + ' rows — merging…', 'info');
      topicsTableTsv = mergeDelta(deltaTsv);
    } else {
      topicsTableTsv = extractBlock(textContent, AA_DELIMITERS.topicsStart, AA_DELIMITERS.topicsEnd);
      if (topicsTableTsv) aaLog('  Full-table response received.', 'info');
    }

    const kwAnalysisTable = extractBlock(textContent, AA_DELIMITERS.katStart, AA_DELIMITERS.katEnd);
    const reevalReport = extractBlock(textContent, AA_DELIMITERS.reevalStart, AA_DELIMITERS.reevalEnd);

    // Handle truncation with no topics table
    if (apiResponse.stop_reason === 'max_tokens' && !topicsTableTsv) {
      if (!deltaModeRef.current && processingMode === 'adaptive') {
        setDeltaMode(true);
        deltaModeRef.current = true;
        const err = new Error('Response truncated — switching to DELTA mode');
        (err as Error & { _deltaSwitch?: boolean })._deltaSwitch = true;
        throw err;
      } else {
        const err = new Error('Response truncated even in DELTA mode');
        (err as Error & { _noRetry?: boolean })._noRetry = true;
        throw err;
      }
    }

    const kwTopicMap = parseKatMapping(kwAnalysisTable);
    const currentTitles = new Set(nodes.map(n => n.title));
    const newTopics: string[] = [];
    if (topicsTableTsv) {
      topicsTableTsv.split('\n').slice(1).forEach(line => {
        const cols = line.split('\t');
        if (cols.length >= 2 && cols[1].trim() && !currentTitles.has(cols[1].trim())) newTopics.push(cols[1].trim());
      });
    }

    return {
      topicsTableTsv: topicsTableTsv || '',
      kwAnalysisTable: kwAnalysisTable || '',
      reevalReport: reevalReport || '',
      newTopics,
      kwTopicMap,
      tokensUsed,
      rawResponse: textContent,
    };
  }

  /* ── Salvage round ─────────────────────────────────────────── */
  // When validateResult fires HC3 ("Missing N batch keywords") and HC3 is
  // the ONLY error, runSalvage spawns a targeted follow-up prompt instead
  // of a full-batch retry. Per Change 6 in AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES
  // (Session-2b refined wording, Q5 resolution): for each missing keyword
  // the model returns either a placement (delta row) OR an irrelevance flag
  // (auto-archived to RemovedKeyword with removedSource='auto-ai-detected-irrelevant'
  // and aiReasoning populated from the model's reason).
  //
  // Returns { mergedTsv, archivedKeywordIds, error }.
  // - mergedTsv: original Mode-A response with salvage delta rows merged in;
  //   null if salvage produced no placements OR errored.
  // - archivedKeywordIds: Keyword.id values that were soft-archived this round.
  // - error: non-null on API failure (caller falls through to full retry).
  async function runSalvage(
    batch: BatchObj,
    missingKeywords: string[],
    originalResult: BatchResult
  ): Promise<{ mergedTsv: string | null; archivedKeywordIds: string[]; error: string | null }> {
    aaLog('  Running salvage round for ' + missingKeywords.length + ' missing keyword(s)…', 'info');

    // Build follow-up user prompt per Change 6 template.
    const seed = seedWords;
    const userContent =
      'FOLLOW-UP REQUEST — MISSING KEYWORDS IN PRIOR BATCH RESPONSE\n\n' +
      'In your previous response for batch ' + batch.batchNum + ', the following ' +
      missingKeywords.length + ' keywords from the input batch were not placed in the Topics Layout Table:\n\n' +
      missingKeywords.map(kw => '- ' + kw).join('\n') + '\n\n' +
      'The rest of the batch was placed successfully. Do NOT re-analyze or reorganize anything else — ' +
      'all other keywords in the batch have been processed correctly and applied to the canvas.\n\n' +
      'For each missing keyword, respond with EXACTLY ONE of:\n\n' +
      '(A) Placement — If the keyword is topically relevant to ' + seed + ', apply Steps 1-5 of the ' +
      'Initial Prompt to place it, including all required secondary placements and upstream chains. ' +
      'Output the placements in delta format (only new rows or modified rows).\n\n' +
      '(B) Irrelevance flag — If the keyword is NOT topically relevant to ' + seed + ' (e.g., it is a ' +
      'homograph, geographic reference unrelated to the niche, or noise), flag it for removal by ' +
      'listing it in a dedicated IRRELEVANT_KEYWORDS block along with your reasoning. The tool will ' +
      "auto-archive these keywords to the Removed Terms table with source tag " +
      "'auto-ai-detected-irrelevant' and your reasoning preserved; admin can review or restore at any time.\n\n" +
      'Output format:\n\n' +
      AA_DELIMITERS.salvageDeltaStart + '\n' +
      '<Depth>\\t<Topic>\\t<Alternate Titles>\\t<Relationship>\\t<Parent Topic>\\t<Conversion Path>\\t<Sister Nodes>\\t<Keywords>\\t<Topic Description>\n' +
      '...\n' +
      AA_DELIMITERS.salvageDeltaEnd + '\n\n' +
      AA_DELIMITERS.salvageIrrStart + '\n' +
      '<keyword_1>\\t<reason-why-not-relevant>\n' +
      '<keyword_2>\\t<reason-why-not-relevant>\n' +
      AA_DELIMITERS.salvageIrrEnd + '\n\n' +
      AA_DELIMITERS.salvageReevalStart + '\n' +
      '(Report only on the missing-keyword placements; do not re-report on the rest of the batch.)\n' +
      AA_DELIMITERS.salvageReevalEnd + '\n\n' +
      'IMPORTANT: Do NOT output the full Topics Layout Table. Only the three delimited blocks above.';

    // Reuse the same system prompt (initial + primer) so prompt cache stays warm.
    let systemText = initialPrompt;
    systemText = systemText.replace(/\[bursitis\]/gi, '[' + seed + ']');
    systemText = systemText.replace(/\[PRIMARY_SEED_WORDS\]/g, seed);
    systemText = systemText.replace(/\[VOLUME_THRESHOLD\]/g, String(volumeThreshold));
    if (primerPrompt) {
      systemText += '\n\n--- TOPICS LAYOUT TABLE PRIMER ---\n\n' + primerPrompt;
    }
    systemText += AA_OUTPUT_INSTRUCTIONS;

    const requestBody = buildRequestBody(systemText, userContent);

    let apiResponse: { content: { type: string; text?: string }[]; usage: { input_tokens: number; output_tokens: number; cache_creation_input_tokens: number; cache_read_input_tokens: number }; stop_reason: string | null };
    try {
      apiResponse = await callApi(requestBody, batch.batchNum);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      aaLog('  ⚠ Salvage API call failed: ' + msg + ' — falling back to full retry', 'warn');
      return { mergedTsv: null, archivedKeywordIds: [], error: msg };
    }

    const text = apiResponse.content.filter(b => b.type === 'text').map(b => b.text || '').join('\n');

    // Cost: salvage attempts always charge tokens. batch.cost accumulates.
    const tokensUsed = {
      input: (apiResponse.usage.input_tokens || 0) + (apiResponse.usage.cache_creation_input_tokens || 0) + (apiResponse.usage.cache_read_input_tokens || 0),
      output: apiResponse.usage.output_tokens || 0,
    };
    const salvageCost = calcCost(tokensUsed);
    batch.cost += salvageCost;
    setTotalSpent(prev => prev + salvageCost);
    totalSpentRef.current += salvageCost;
    aaLog('  Salvage API call complete. Cost: $' + salvageCost.toFixed(3), 'info');

    // Parse the three salvage blocks.
    const deltaTsv = extractBlock(text, AA_DELIMITERS.salvageDeltaStart, AA_DELIMITERS.salvageDeltaEnd);
    const irrTsv = extractBlock(text, AA_DELIMITERS.salvageIrrStart, AA_DELIMITERS.salvageIrrEnd);

    // Auto-archive irrelevants. POST per-keyword to preserve individual reasoning.
    const archivedKeywordIds: string[] = [];
    if (irrTsv) {
      const irrItems: { keyword: string; reason: string }[] = irrTsv.split('\n')
        .map(l => l.trim())
        .filter(Boolean)
        .map(l => {
          const parts = l.split('\t');
          return { keyword: (parts[0] || '').trim(), reason: (parts[1] || '').trim() };
        })
        .filter(x => x.keyword);

      for (const item of irrItems) {
        const kwObj = allKeywords.find(k => k.keyword.toLowerCase() === item.keyword.toLowerCase());
        if (!kwObj) {
          aaLog('  ⚠ Salvage flagged "' + item.keyword + '" as irrelevant but no matching AST keyword found — skipping', 'warn');
          continue;
        }
        try {
          const res = await authFetch('/api/projects/' + projectId + '/removed-keywords', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              keywordIds: [kwObj.id],
              removedSource: 'auto-ai-detected-irrelevant',
              aiReasoning: item.reason || null,
            }),
          });
          if (res.ok) {
            archivedKeywordIds.push(kwObj.id);
            aaLog('  ↻ Salvage auto-archived "' + item.keyword + '"' + (item.reason ? ' — ' + item.reason : ''), 'info');
          } else {
            aaLog('  ⚠ Salvage auto-archive failed for "' + item.keyword + '" (status ' + res.status + ')', 'warn');
          }
        } catch (e) {
          aaLog('  ⚠ Salvage auto-archive error for "' + item.keyword + '": ' + (e instanceof Error ? e.message : ''), 'warn');
        }
      }
      if (archivedKeywordIds.length > 0) {
        // Refresh parent state so HC3 re-validation sees the archived keywords as gone.
        await onRefreshKeywords();
      }
    }

    // Merge delta rows into the original Mode-A response (NOT the live canvas —
    // the canvas hasn't been touched yet because validation failed).
    let mergedTsv: string | null = null;
    if (deltaTsv) {
      // The salvage prompt asks for headerless data rows. Synthesize a
      // header so mergeDelta can parse them; aIdx will be -1 (no 'action'
      // column) so mergeDelta defaults each row to 'ADD'/upgrade-to-UPDATE
      // when a title match is found.
      const fakeHeader = 'Depth\tTopic\tAlternate Titles\tRelationship\tParent Topic\tConversion Path\tSister Nodes\tKeywords\tTopic Description';
      const augmented = fakeHeader + '\n' + deltaTsv;
      mergedTsv = mergeDelta(augmented, originalResult.topicsTableTsv);
    }

    return { mergedTsv, archivedKeywordIds, error: null };
  }

  /* ── Validate result ───────────────────────────────────────── */
  function validateResult(result: BatchResult, batch: BatchObj): { ok: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // HC1: result exists
    if (!result) { errors.push('No result'); return { ok: false, errors, warnings }; }

    // HC2: Topics table present
    if (!result.topicsTableTsv) {
      errors.push('Topics Layout Table not found in response');
    } else {
      const lines = result.topicsTableTsv.split('\n').filter(l => l.trim());
      if (lines.length < 2) errors.push('Topics table has no data rows');
    }

    // HC3: All batch keywords placed
    if (result.topicsTableTsv) {
      const allKwsInTable = new Set<string>();
      result.topicsTableTsv.split('\n').slice(1).forEach(line => {
        const cols = line.split('\t');
        if (cols.length > 7 && cols[7]) {
          cols[7].split(',').map(k => k.trim().replace(/\s*\[(p|s)\]\s*$/i, '').toLowerCase()).forEach(k => { if (k) allKwsInTable.add(k); });
        }
      });
      const missing = batch.keywords.filter(kw => !allKwsInTable.has(kw.toLowerCase()));
      if (missing.length > 0) {
        errors.push('Missing ' + missing.length + ' batch keywords: ' + missing.slice(0, 5).join(', '));
        batch._correctionContext = 'Missing keywords: ' + missing.join(', ') + '. Please place them in appropriate topics.';
      }
    }

    // HC4: No topic deletions
    if (result.topicsTableTsv) {
      const existing = new Set(nodesRef.current.map(n => n.title));
      if (existing.size > 0) {
        const newTitles = new Set<string>();
        result.topicsTableTsv.split('\n').slice(1).forEach(line => {
          const cols = line.split('\t');
          if (cols.length >= 2 && cols[1].trim()) newTitles.add(cols[1].trim());
        });
        const deleted = [...existing].filter(t => !newTitles.has(t));
        if (deleted.length > 0) {
          errors.push('Deleted ' + deleted.length + ' topics: ' + deleted.slice(0, 5).join(', '));
          batch._correctionContext = 'Deleted topics: ' + deleted.join(', ') + '. Never delete existing topics.';
        }
      }
    }

    // HC5: No keyword losses
    if (result.topicsTableTsv) {
      const existingKws = new Set<string>();
      nodesRef.current.forEach(n => {
        (n.linkedKwIds || []).forEach(id => {
          const kw = keywordsRef.current.find(k => k.id === id);
          if (kw) existingKws.add(kw.keyword.toLowerCase());
        });
      });
      if (existingKws.size > 0) {
        const newKws = new Set<string>();
        result.topicsTableTsv.split('\n').slice(1).forEach(line => {
          const cols = line.split('\t');
          if (cols.length > 7 && cols[7]) {
            cols[7].split(',').map(k => k.trim().replace(/\s*\[(p|s)\]\s*$/i, '').toLowerCase()).forEach(k => { if (k) newKws.add(k); });
          }
        });
        const lost = [...existingKws].filter(k => !newKws.has(k));
        if (lost.length > 0) {
          errors.push('Lost ' + lost.length + ' keywords: ' + lost.slice(0, 5).join(', '));
          batch._correctionContext = 'Lost keywords: ' + lost.join(', ') + '. Keywords must not disappear.';
        }
      }
    }

    // Soft checks
    if (result.newTopics.length > 25) warnings.push('Unusually high: ' + result.newTopics.length + ' new topics');
    warnings.forEach(w => aaLog('  ⚠ ' + w, 'warn'));
    return { ok: errors.length === 0, errors, warnings };
  }

  /* ── Apply result to canvas (diff-based atomic rebuild) ────── */
  async function doApply(batch: BatchObj, result: BatchResult) {
    if (!result.topicsTableTsv) return;

    // 1. Parse TSV
    const lines = result.topicsTableTsv.split('\n').filter(l => l.trim());
    if (lines.length < 2) return;

    const parsed: { depth: number; title: string; altTitles: string[]; rel: string; parentTitle: string; convPath: string; sisters: string; kwRaw: string; desc: string }[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split('\t');
      parsed.push({
        depth: parseInt(cols[0]) || 0,
        title: (cols[1] || '').trim(),
        altTitles: (cols[2] || '').split(',').map(s => s.trim()).filter(Boolean),
        rel: (cols[3] || '').trim().toLowerCase(),
        parentTitle: (cols[4] || '').trim(),
        convPath: (cols[5] || '').trim(),
        sisters: (cols[6] || '').trim(),
        kwRaw: (cols[7] || '').trim(),
        desc: (cols[8] || '').trim(),
      });
    }

    // 2. Diff: match AI titles against existing nodes
    const existingByTitle = new Map<string, CanvasNode>();
    for (const n of nodesRef.current) {
      existingByTitle.set(n.title, n);
    }
    const aiTitles = new Set(parsed.filter(r => r.title).map(r => r.title));

    // Nodes to delete: existing nodes whose title is NOT in the AI output
    const deleteNodeIds = nodesRef.current
      .filter(n => !aiTitles.has(n.title))
      .map(n => n.id);

    // 3. Build node objects — reuse existing ID/position when title matches
    const NODE_W = 220;
    const NODE_H = 160;
    const H_GAP = 60;
    const V_GAP = 40;

    // Get next available node ID
    const canvasStateRes = await authFetch('/api/projects/' + projectId + '/canvas');
    const canvasStateData = await canvasStateRes.json();
    let nextNodeId = canvasStateData.canvasState?.nextNodeId ?? 1;

    const titleToBuilt = new Map<string, { id: number; x: number; y: number; w: number; h: number; isNew: boolean }>();
    const rebuildNodes: Record<string, unknown>[] = [];
    const depthXOffset = new Map<number, number>();

    for (const row of parsed) {
      if (!row.title) continue;

      const existing = existingByTitle.get(row.title);
      let id: number;
      let x: number;
      let y: number;
      let w: number;
      let h: number;
      let isNew = false;

      if (existing) {
        // Reuse existing node — preserve user position/size customizations
        id = existing.id;
        x = existing.x;
        y = existing.y;
        w = existing.w;
        h = existing.h;
      } else {
        // New node — auto-layout
        id = nextNodeId++;
        isNew = true;
        w = NODE_W;
        h = NODE_H;

        if (row.parentTitle && titleToBuilt.has(row.parentTitle)) {
          const parent = titleToBuilt.get(row.parentTitle)!;
          x = parent.x + H_GAP;
          let maxChildY = parent.y;
          for (const [, n] of titleToBuilt) {
            if (n.x >= x && n.y > maxChildY) maxChildY = n.y;
          }
          y = maxChildY + NODE_H + V_GAP;
        } else {
          if (!depthXOffset.has(0)) depthXOffset.set(0, 0);
          x = depthXOffset.get(0)!;
          let maxY = -NODE_H - V_GAP;
          for (const [, n] of titleToBuilt) {
            if (Math.abs(n.x - x) < NODE_W && n.y > maxY) maxY = n.y;
          }
          y = maxY + NODE_H + V_GAP;
          if (y > 2000) {
            depthXOffset.set(0, x + NODE_W + H_GAP * 3);
            x = depthXOffset.get(0)!;
            y = 0;
          }
        }
      }

      titleToBuilt.set(row.title, { id, x, y, w, h, isNew });

      // Parse keywords for this node
      const linkedIds: string[] = [];
      const placements: Record<string, string> = {};
      if (row.kwRaw) {
        const entries = row.kwRaw.split(',').map(s => s.trim()).filter(Boolean);
        for (const entry of entries) {
          const m = entry.match(/^(.+?)\s*\[([ps])\]\s*$/i);
          const kwText = m ? m[1].trim() : entry.replace(/\s*\[[ps]\]\s*$/i, '').trim();
          const placement = m ? m[2].toLowerCase() : 'p';
          const kwObj = allKeywords.find(k => k.keyword.toLowerCase() === kwText.toLowerCase());
          if (kwObj) {
            linkedIds.push(kwObj.id);
            placements[kwObj.id] = placement;
          }
        }
      }

      rebuildNodes.push({
        id,
        title: row.title,
        description: existing ? (row.desc || existing.description) : (row.desc || ''),
        altTitles: row.altTitles.length > 0 ? row.altTitles : (existing?.altTitles || []),
        x, y, w, h,
        relationshipType: row.rel === 'linear' || row.rel === 'nested' ? row.rel : (existing?.relationshipType || ''),
        linkedKwIds: linkedIds.length > 0 ? linkedIds : (existing?.linkedKwIds || []),
        kwPlacements: Object.keys(placements).length > 0 ? placements : (existing?.kwPlacements || {}),
        narrativeBridge: existing?.narrativeBridge || '',
        collapsedLinear: existing?.collapsedLinear || false,
        collapsedNested: existing?.collapsedNested || false,
        userMinH: existing?.userMinH || null,
        connCP: existing?.connCP || null,
        connOutOff: existing?.connOutOff || null,
        connInOff: existing?.connInOff || null,
        sortOrder: rebuildNodes.length,
      });
    }

    // 4. Set parent relationships on the built nodes
    for (const row of parsed) {
      if (!row.title) continue;
      const built = rebuildNodes.find(n => n.title === row.title);
      if (!built) continue;

      if (row.parentTitle && titleToBuilt.has(row.parentTitle)) {
        built.parentId = titleToBuilt.get(row.parentTitle)!.id;
        if (!built.relationshipType) built.relationshipType = 'nested';
      } else {
        built.parentId = null;
      }
    }

    // 4b. Chain depth-0 nodes linearly
    const depth0Rows = parsed.filter(r => r.depth === 0 && r.title && titleToBuilt.has(r.title));
    for (let i = 1; i < depth0Rows.length; i++) {
      const prev = titleToBuilt.get(depth0Rows[i - 1].title);
      const curr = titleToBuilt.get(depth0Rows[i].title);
      if (prev && curr) {
        const node = rebuildNodes.find(n => n.id === curr.id);
        if (node) {
          node.parentId = prev.id;
          node.relationshipType = 'linear';
        }
      }
    }

    // 5. Build pathways for depth-0 nodes
    const existingPathwayIds = new Set(pathways.map(p => p.id));
    let nextPathwayId = canvasStateData.canvasState?.nextPathwayId ?? 1;
    const newPathways: { id: number }[] = [];

    for (const row of depth0Rows) {
      const built = titleToBuilt.get(row.title);
      if (!built) continue;
      const existingNode = existingByTitle.get(row.title);

      // If node already had a pathway, keep it
      if (existingNode?.pathwayId && existingPathwayIds.has(existingNode.pathwayId)) {
        const nodeObj = rebuildNodes.find(n => n.id === built.id);
        if (nodeObj) nodeObj.pathwayId = existingNode.pathwayId;
        // Assign same pathway to descendants
        function assignExistingPw(title: string, pwId: number) {
          for (const r of parsed) {
            if (r.parentTitle === title && titleToBuilt.has(r.title)) {
              const desc = rebuildNodes.find(n => n.id === titleToBuilt.get(r.title)!.id);
              if (desc) desc.pathwayId = pwId;
              assignExistingPw(r.title, pwId);
            }
          }
        }
        assignExistingPw(row.title, existingNode.pathwayId);
      } else {
        // New pathway needed
        const pwId = nextPathwayId++;
        newPathways.push({ id: pwId });
        const nodeObj = rebuildNodes.find(n => n.id === built.id);
        if (nodeObj) nodeObj.pathwayId = pwId;
        function assignNewPw(title: string, pwId: number) {
          for (const r of parsed) {
            if (r.parentTitle === title && titleToBuilt.has(r.title)) {
              const desc = rebuildNodes.find(n => n.id === titleToBuilt.get(r.title)!.id);
              if (desc) desc.pathwayId = pwId;
              assignNewPw(r.title, pwId);
            }
          }
        }
        assignNewPw(row.title, pwId);
      }
    }

    // 6. Build sister links
    const existingSisterKeys = new Set(sisterLinks.map(sl => [sl.nodeA, sl.nodeB].sort().join('-')));
    const newSisterLinks: { nodeA: number; nodeB: number }[] = [];
    for (const row of parsed) {
      if (!row.sisters || !row.title) continue;
      const built = titleToBuilt.get(row.title);
      if (!built) continue;
      const sisterNames = row.sisters.split(',').map(s => s.trim()).filter(Boolean);
      for (const sName of sisterNames) {
        const sBuilt = titleToBuilt.get(sName);
        if (!sBuilt || sBuilt.id === built.id) continue;
        const key = [built.id, sBuilt.id].sort().join('-');
        if (existingSisterKeys.has(key)) continue;
        existingSisterKeys.add(key);
        newSisterLinks.push({ nodeA: built.id, nodeB: sBuilt.id });
      }
    }

    // 7. Delete pathways for removed depth-0 nodes
    const keptPathwayIds = new Set<number>();
    for (const n of rebuildNodes) {
      if (n.pathwayId) keptPathwayIds.add(n.pathwayId as number);
    }
    const deletePathwayIds = pathways
      .filter(p => !keptPathwayIds.has(p.id))
      .map(p => p.id);

    // Delete sister links involving deleted nodes
    const deleteNodeIdSet = new Set(deleteNodeIds);
    const deleteSisterLinkIds = sisterLinks
      .filter(sl => deleteNodeIdSet.has(sl.nodeA) || deleteNodeIdSet.has(sl.nodeB))
      .map(sl => sl.id);

    // 7.5. P3-F8 layout pass. Recompute each node's content-driven height
    //     via calcNodeHeight, then run the holistic 4-step push-down pass
    //     (reset roots → tree-walk type-aware placement → 60-pass overlap
    //     resolution → pathway separation). Mutates rebuildNodes' x/y/h
    //     in place so the rebuild call below persists the laid-out
    //     positions in a single transaction. Q1 answer: runs after every
    //     batch apply (not just run-end).
    const layoutNodes: LayoutNode[] = rebuildNodes.map(n => ({
      id: n.id as number,
      title: (n.title as string) || '',
      description: (n.description as string) || '',
      altTitles: (n.altTitles as string[]) || [],
      x: n.x as number,
      y: n.y as number,
      w: n.w as number,
      h: n.h as number,
      baseY: (n.baseY as number | undefined) ?? (n.y as number),
      parentId: (n.parentId as number | null) ?? null,
      pathwayId: (n.pathwayId as number | null) ?? null,
      relationshipType: (n.relationshipType as string) || '',
      linkedKwIds: (n.linkedKwIds as string[]) || [],
      userMinH: (n.userMinH as number | null) ?? null,
    }));
    for (const ln of layoutNodes) {
      ln.h = calcNodeHeight(ln);
    }
    runLayoutPass(layoutNodes, [...pathways, ...newPathways]);
    // Mirror computed positions/heights back onto rebuildNodes for the
    // rebuild API call.
    const byId = new Map<number, LayoutNode>();
    for (const ln of layoutNodes) byId.set(ln.id, ln);
    for (const rn of rebuildNodes) {
      const ln = byId.get(rn.id as number);
      if (!ln) continue;
      rn.x = ln.x;
      rn.y = ln.y;
      rn.h = ln.h;
      rn.baseY = ln.baseY ?? ln.y;
    }
    aaLog('  Layout pass complete (' + rebuildNodes.length + ' nodes positioned)', 'info');

    // 8. ATOMIC REBUILD — single transaction
    aaLog('  Applying to canvas (atomic rebuild)...', 'info');
    try {
      const res = await authFetch('/api/projects/' + projectId + '/canvas/rebuild', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: rebuildNodes,
          pathways: newPathways,
          sisterLinks: newSisterLinks,
          canvasState: { nextNodeId, nextPathwayId },
          deleteNodeIds,
          deletePathwayIds,
          deleteSisterLinkIds,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error('Canvas rebuild failed: ' + errText);
      }
      aaLog('  ✓ Canvas rebuilt atomically (' + rebuildNodes.length + ' nodes, ' + deleteNodeIds.length + ' removed)', 'ok');
    } catch (e) {
      aaLog('  ✗ Canvas rebuild FAILED — all changes rolled back. ' + (e instanceof Error ? e.message : ''), 'error');
      return;
    }

    // 9. Update keyword records with topic names and canvasLoc
    const kwTopicUpdates: { id: string; [key: string]: unknown }[] = [];
    for (const row of parsed) {
      if (!row.kwRaw || !row.title) continue;
      const entries = row.kwRaw.split(',').map(s => s.trim()).filter(Boolean);
      for (const entry of entries) {
        const m = entry.match(/^(.+?)\s*\[([ps])\]\s*$/i);
        const kwText = m ? m[1].trim() : entry.replace(/\s*\[[ps]\]\s*$/i, '').trim();
        const kwObj = allKeywords.find(k => k.keyword.toLowerCase() === kwText.toLowerCase());
        if (kwObj) {
          const existingTopics = (kwObj.topic || '').split('|').map(s => s.trim()).filter(Boolean);
          if (!existingTopics.includes(row.title)) existingTopics.push(row.title);
          const existingLoc = (typeof kwObj.canvasLoc === 'object' && kwObj.canvasLoc) ? { ...kwObj.canvasLoc } : {};
          if (row.desc) (existingLoc as Record<string, string>)[row.title] = row.desc;
          kwTopicUpdates.push({ id: kwObj.id, topic: existingTopics.join(' | '), canvasLoc: existingLoc });
        }
      }
    }
    if (kwTopicUpdates.length > 0) onBatchUpdateKeywords(kwTopicUpdates);

    // 10. Refresh UI
    await onRefreshCanvas();
    await onRefreshKeywords();

    // 11. Identify which batch keywords landed on the canvas (input to
    //     salvage detection in step 12 below).
    const allLinkedIds = new Set<string>();
    for (const n of rebuildNodes) {
      if (Array.isArray(n.linkedKwIds)) (n.linkedKwIds as string[]).forEach(id => allLinkedIds.add(id));
    }

    const unplaced: string[] = [];
    for (const id of batch.keywordIds) {
      if (!allLinkedIds.has(id)) {
        const kw = allKeywords.find(k => k.id === id);
        if (kw) unplaced.push(kw.keyword);
      }
    }

    if (unplaced.length > 0) {
      aaLog('  ⚠ ' + unplaced.length + ' keyword(s) NOT placed: ' + unplaced.join(', '), 'warn');
      batch._unplacedKws = unplaced;
    } else {
      aaLog('  ✓ All ' + batch.keywordIds.length + ' keywords verified on canvas.', 'ok');
    }

    // 12. P3-F7 backup reconciliation pass. Heals status-vs-canvas drift
    //     across the ENTIRE AST table (not just this batch's keywords).
    //     Two flips, both logged with structured info that's
    //     forward-compatible with the future ai_feedback_records schema
    //     per AI_TOOL_FEEDBACK_PROTOCOL §2.3.
    //
    //     (a) keyword IS on canvas but status is 'Unsorted' or 'Reshuffled'
    //         → flip to 'AI-Sorted'. Catches Bug 1 silent placements
    //         (Mode A re-mentions of prior-batch keywords) AND any
    //         Reshuffled keyword the AI just re-placed.
    //
    //     (b) keyword is NOT on canvas but status is 'AI-Sorted'
    //         → flip to 'Reshuffled'. Catches Bug 2 sub-group 1 reshuffle
    //         casualties. Reshuffled keywords appear with a yellow badge
    //         in the AST (visible alarm) and are re-eligible for placement
    //         under the default Auto-Analyze scope.
    const reconcileUpdates: { id: string; sortingStatus: string }[] = [];
    let flippedToAiSorted = 0;
    let flippedToReshuffled = 0;
    for (const kw of allKeywords) {
      const onCanvas = allLinkedIds.has(kw.id);
      if (onCanvas && (kw.sortingStatus === 'Unsorted' || kw.sortingStatus === 'Reshuffled')) {
        reconcileUpdates.push({ id: kw.id, sortingStatus: 'AI-Sorted' });
        flippedToAiSorted++;
      } else if (!onCanvas && kw.sortingStatus === 'AI-Sorted') {
        reconcileUpdates.push({ id: kw.id, sortingStatus: 'Reshuffled' });
        aaLog(
          '  ↻ Reconcile: "' + kw.keyword + '" (id ' + kw.id + ') was AI-Sorted, no longer on canvas → Reshuffled',
          'warn'
        );
        flippedToReshuffled++;
      }
    }
    if (reconcileUpdates.length > 0) {
      onBatchUpdateKeywords(reconcileUpdates);
      aaLog(
        '  ↻ Reconciliation: ' + flippedToAiSorted + ' on-canvas → AI-Sorted, ' +
        flippedToReshuffled + ' off-canvas → Reshuffled',
        flippedToReshuffled > 0 ? 'warn' : 'ok'
      );
    }
  }

  /* ════════════════════════════════════════════════════════════
     Pivot Session D — V3 operation-based path (default)
     The functions below run when outputContract === 'v3-operations'.
     They replace processBatch + doApply for V3 mode. The V2 code
     above is preserved as defense-in-depth and runs when the user
     selects the v2-tsv contract in the config picker.
     ════════════════════════════════════════════════════════════ */

  /* ── V3: assemble prompt ───────────────────────────────────── */
  function assemblePromptV3(batch: BatchObj): { systemText: string; userContent: string } {
    let systemText = initialPrompt;
    systemText = systemText.replace(/\[PRIMARY_SEED_WORDS\]/g, seedWords);
    systemText = systemText.replace(/\[VOLUME_THRESHOLD\]/g, String(volumeThreshold));
    if (primerPrompt) {
      systemText += '\n\n--- TOPICS LAYOUT TABLE PRIMER ---\n\n' + primerPrompt;
    }
    // V3 prompts already contain the operations-block instructions; do NOT
    // append AA_OUTPUT_INSTRUCTIONS (which is the V2 Mode A/B contract).

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
    // We pass the largest plausible nextNodeId — the actual one is fetched in
    // doApplyV3. For dry-run validation we just need a counter that is at
    // least one greater than the highest existing stableId integer.
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
    // Fetch canonical nextNodeId / nextPathwayId so issued stableIds and new
    // pathway ids cannot collide with anything that may have changed since
    // page load (e.g., admin manually added a node in another tab).
    const canvasStateRes = await authFetch('/api/projects/' + projectId + '/canvas');
    const canvasStateData = await canvasStateRes.json();
    const nextNodeId = canvasStateData.canvasState?.nextNodeId ?? 1;
    const nextPathwayId = canvasStateData.canvasState?.nextPathwayId ?? 1;

    const originalNodes = nodesRef.current;
    const originalSisterLinks = sisterLinksRef.current;

    const state = buildCanvasStateForApplier(originalNodes, originalSisterLinks, nextNodeId);
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
      nextPathwayId,
    });

    // Layout pass over the materialized nodes (P3-F8 same as V2 doApply).
    const layoutNodes: LayoutNode[] = payload.nodes.map(n => ({
      id: n.id as number,
      title: (n.title as string) || '',
      description: (n.description as string) || '',
      altTitles: (n.altTitles as string[]) || [],
      x: n.x as number,
      y: n.y as number,
      w: n.w as number,
      h: n.h as number,
      baseY: ((n.baseY as number | undefined) ?? (n.y as number)) || 0,
      parentId: (n.parentId as number | null) ?? null,
      pathwayId: (n.pathwayId as number | null) ?? null,
      relationshipType: (n.relationshipType as string) || '',
      linkedKwIds: (n.linkedKwIds as string[]) || [],
      userMinH: (n.userMinH as number | null) ?? null,
    }));
    for (const ln of layoutNodes) ln.h = calcNodeHeight(ln);
    runLayoutPass(layoutNodes, [...pathways, ...payload.pathways]);
    const byId = new Map<number, LayoutNode>();
    for (const ln of layoutNodes) byId.set(ln.id, ln);
    for (const rn of payload.nodes) {
      const ln = byId.get(rn.id as number);
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

    // Status reconciliation across the full keyword table — same as V2's
    // step 12 (P3-F7). Catches any keyword whose status drifted from its
    // canvas presence.
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
        // ── V3 dispatch (Pivot Session D) ──────────────────────
        if (outputContractRef.current === 'v3-operations') {
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

          // Populate the BatchResult's newTopics with the titles from each
          // ADD_TOPIC op so the BATCH_REVIEW screen can display them. Without
          // this the review screen shows "Topics: None" even when V3 is about
          // to create new topics.
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
        }

        // ── V2 (legacy full-table) path ────────────────────────
        const result = await processBatch(batch);
        if (abortRef.current) break;

        // Record cost for this attempt as soon as the API call returns. Anthropic
        // bills for tokens regardless of whether our validation passes downstream,
        // so failed-validation retries and Mode A→B auto-switches must still
        // accumulate cost. batch.cost accumulates across attempts; batch.tokensUsed
        // reflects the most recent attempt.
        const attemptCost = calcCost(result.tokensUsed);
        batch.tokensUsed = result.tokensUsed;
        batch.cost += attemptCost;
        setTotalSpent(prev => prev + attemptCost);
        totalSpentRef.current += attemptCost;
        aaLog('  Batch ' + batch.batchNum + ' attempt ' + batch.attempts + ' — API call complete. Cost: $' + attemptCost.toFixed(3), 'info');

        let validation = validateResult(result, batch);
        if (!validation.ok) {
          // HC4/HC5 signal Mode A dropped pre-existing data; Mode B (delta) recovers faster than retrying Mode A.
          const isLostDataError = validation.errors.some(e =>
            e.startsWith('Deleted ') || e.startsWith('Lost ')
          );
          if (isLostDataError && !deltaModeRef.current && processingMode === 'adaptive') {
            setDeltaMode(true);
            deltaModeRef.current = true;
            aaLog('⚡ AUTO-SWITCH: ' + validation.errors.join('; ') + ' — switching to DELTA mode (Mode B)', 'warn');
            batch.attempts--;
            batch.status = 'queued';
            continue;
          }

          // Salvage path. Fires when HC3 ("Missing N batch keywords") is the
          // only failure mode and no HC4/HC5 lost-data errors are present.
          // Targeted follow-up prompt re-asks the model for just the missing
          // keywords (place them OR flag irrelevant); cheaper than a full
          // batch retry. See Change 6 in AUTO_ANALYZE_PROMPT_V2_PROPOSED_CHANGES.
          const isMissingOnlyFailure = !isLostDataError &&
            validation.errors.length > 0 &&
            validation.errors.every(e => e.startsWith('Missing '));
          if (isMissingOnlyFailure && batch._correctionContext) {
            const m = batch._correctionContext.match(/^Missing keywords:\s*(.+?)\.\s*Please/);
            const missingKws = m ? m[1].split(',').map(s => s.trim()).filter(Boolean) : [];
            if (missingKws.length > 0) {
              const salvage = await runSalvage(batch, missingKws, result);
              if (salvage.error) {
                // Salvage failed at API level — fall through to standard retry.
              } else {
                // Replace result.topicsTableTsv with the merged version (if any
                // placements came back) and drop archived keywords from the
                // batch's responsibility set so HC3 re-validation passes.
                if (salvage.mergedTsv) result.topicsTableTsv = salvage.mergedTsv;
                if (salvage.archivedKeywordIds.length > 0) {
                  const archivedSet = new Set(salvage.archivedKeywordIds);
                  batch.keywordIds = batch.keywordIds.filter(id => !archivedSet.has(id));
                  // batch.keywords mirrors keywordIds; drop the same texts.
                  batch.keywords = batch.keywords.filter(_kwText => {
                    const kwObj = allKeywords.find(k => k.keyword === _kwText);
                    return !(kwObj && archivedSet.has(kwObj.id));
                  });
                }
                batch._correctionContext = '';
                validation = validateResult(result, batch);
                if (validation.ok) {
                  aaLog('  ✓ Salvage round resolved all missing keywords.', 'ok');
                } else {
                  aaLog('  ⚠ Salvage round did not fully resolve: ' + validation.errors.join('; '), 'warn');
                  // Fall through to standard retry below.
                }
              }
            }
          }

          if (!validation.ok) {
            if (batch.attempts < batch.maxAttempts) {
              aaLog('Batch ' + batch.batchNum + ' validation failed: ' + validation.errors.join('; ') + ' — retrying…', 'warn');
              batch.status = 'queued';
              continue;
            } else {
              batch.status = 'failed';
              batch.error = 'Validation failed: ' + validation.errors.join('; ');
              batch.completedAt = Date.now();
              aaLog('Batch ' + batch.batchNum + ' FAILED: ' + batch.error, 'error');
              setCurrentIdx(prev => prev + 1);
              currentIdxRef.current++;
              setBatches([...batchesRef.current]);
              continue;
            }
          }
        }

        batch.result = result;
        batch.reevalReport = result.reevalReport;
        batch.newTopicCount = result.newTopics.length;

        aaLog('Batch ' + batch.batchNum + ' — passed validation. Total cost (all attempts): $' + batch.cost.toFixed(3), 'ok');

        if (reviewMode) {
          setPendingResult(result);
          batch.status = 'reviewing';
          setAaState('BATCH_REVIEW');
          setBatches([...batchesRef.current]);
          return; // exit — user will apply/skip
        } else {
          await doApply(batch, result);
          batch.status = 'complete';
          batch.completedAt = Date.now();
          aaLog('Batch ' + batch.batchNum + ' — applied.', 'ok');
          saveCheckpoint();
          setCurrentIdx(prev => prev + 1);
          currentIdxRef.current++;
          setBatches([...batchesRef.current]);
        }

      } catch (err: unknown) {
        if (abortRef.current) break;
        const errObj = err as Error & { _deltaSwitch?: boolean; _isStall?: boolean; _noRetry?: boolean };
        const errMsg = errObj.message || String(err);

        if (errObj._deltaSwitch) {
          batch.attempts--;
          aaLog('⚡ AUTO-SWITCH: ' + errMsg, 'warn');
          batch.status = 'queued';
          continue;
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
    setDeltaMode(false);
    deltaModeRef.current = false;
    setBatchTier(0);
    batchTierRef.current = 0;
    abortRef.current = false;
    startTimeRef.current = Date.now();

    aaLog('Auto-Analyze started. ' + queue.length + ' batches, ' + unsorted.length + ' keywords.', 'info');
    aaLog('Model: ' + model + ' | Mode: ' + processingMode + ' | Scope: ' + keywordScope, 'info');

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
    setAaState('IDLE');
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  async function handleApplyBatch() {
    if (aaState !== 'BATCH_REVIEW' || !pendingResult) return;
    const batch = batchesRef.current[currentIdxRef.current];
    if (outputContractRef.current === 'v3-operations' && batch._v3Ops) {
      await doApplyV3(batch, batch._v3Ops);
      batch._v3Ops = undefined;
    } else {
      await doApply(batch, pendingResult);
    }
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
            <div className="aa-row">
              <span className="aa-label">Output contract<span className="aa-help">ⓘ<span className="aa-tip">V3 (operations) is the new default — the AI emits a list of change operations, the tool applies them deterministically, keywords cannot silently disappear, cost stops scaling with canvas size. V2 (full table) is the legacy contract kept selectable as a fallback.</span></span></span>
              <select className="aa-select" value={outputContract} onChange={e => setOutputContract(e.target.value as typeof outputContract)} disabled={aaState !== 'IDLE'}>
                <option value="v3-operations">V3 — operations (default)</option>
                <option value="v2-tsv">V2 — full table (legacy)</option>
              </select>
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
