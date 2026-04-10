'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import type { CanvasNode } from '@/hooks/useCanvas';
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

  // Keep refs in sync
  useEffect(() => { batchesRef.current = batches; }, [batches]);
  useEffect(() => { currentIdxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { deltaModeRef.current = deltaMode; }, [deltaMode]);
  useEffect(() => { batchTierRef.current = batchTier; }, [batchTier]);
  useEffect(() => { totalSpentRef.current = totalSpent; }, [totalSpent]);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { keywordsRef.current = allKeywords; }, [allKeywords]);

  const logRef = useRef<HTMLDivElement>(null);

  /* ── Log helper ────────────────────────────────────────────── */
  const aaLog = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
    const ts = new Date().toLocaleTimeString();
    setLogEntries(prev => [...prev, { ts, msg, type }]);
    setTimeout(() => logRef.current?.scrollTo(0, logRef.current.scrollHeight), 50);
  }, []);

  /* ── Get unsorted keywords ─────────────────────────────────── */
  function getUnsortedKws() {
    return allKeywords.filter(k => {
      if (keywordScope === 'all') return true;
      if (keywordScope === 'non-ai-sorted') return k.sortingStatus !== 'AI-Sorted';
      return k.sortingStatus === 'Unsorted';
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
    // Depth-first tree walk
    const childMap = new Map<number | null, CanvasNode[]>();
    for (const n of nodes) {
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
        const parentNode = parentId !== null ? nodes.find(n => n.id === parentId) : null;
        const parentTitle = parentNode?.title || '';
        const altTitles = (node.altTitles || []).join(', ');
        const rel = node.relationshipType || '';
        // Build keywords with [p]/[s] annotations
        const kwParts: string[] = [];
        for (const kwId of (node.linkedKwIds || [])) {
          const kw = allKeywords.find(k => k.id === kwId);
          if (kw) {
            const placement = (node.kwPlacements || {})[kwId] || 'p';
            kwParts.push(kw.keyword + ' [' + placement + ']');
          }
        }
        // Sister nodes
        const sisters: string[] = [];
        for (const sl of sisterLinks) {
          if (sl.nodeA === node.id) {
            const sn = nodes.find(n => n.id === sl.nodeB);
            if (sn) sisters.push(sn.title);
          } else if (sl.nodeB === node.id) {
            const sn = nodes.find(n => n.id === sl.nodeA);
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
      const response = await fetch(fetchUrl, {
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
  function mergeDelta(deltaTsv: string): string {
    const currentTsv = buildCurrentTsv();
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

  /* ── Apply result to canvas (overwrite + rebuild) ──────────── */
  async function doApply(batch: BatchObj, result: BatchResult) {
    if (!result.topicsTableTsv) return;

    // 1. Delete all existing nodes
    for (const n of nodesRef.current) {
      await onDeleteNode(n.id);
    }
    await new Promise(r => setTimeout(r, 100));

    // 2. Parse TSV and rebuild
    const lines = result.topicsTableTsv.split('\n').filter(l => l.trim());
    if (lines.length < 2) return;

    // Parse rows
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

    // 3. Create nodes with auto-layout based on tree structure
    const NODE_W = 220;
    const NODE_H = 120;
    const H_GAP = 60;
    const V_GAP = 40;

    const titleToNode = new Map<string, CanvasNode>();
    let nextX = 0;

    // Track depth-0 column for horizontal spread
    const depthXOffset = new Map<number, number>();

    for (const row of parsed) {
      if (!row.title) continue;

      let x = 0;
      let y = 0;

      if (row.parentTitle && titleToNode.has(row.parentTitle)) {
        const parent = titleToNode.get(row.parentTitle)!;
        // Place below parent, indented by depth
        x = parent.x + H_GAP;
        // Find the lowest existing child of this parent
        let maxChildY = parent.y;
        for (const [, n] of titleToNode) {
          if (n.x >= x && n.y > maxChildY) maxChildY = n.y;
        }
        y = maxChildY + NODE_H + V_GAP;
      } else {
        // Root node — place in next column
        if (!depthXOffset.has(0)) depthXOffset.set(0, 0);
        x = depthXOffset.get(0)!;
        // Find max y used in this x column
        let maxY = -NODE_H - V_GAP;
        for (const [, n] of titleToNode) {
          if (Math.abs(n.x - x) < NODE_W && n.y > maxY) maxY = n.y;
        }
        y = maxY + NODE_H + V_GAP;

        // If we've stacked too many vertically, start a new column
        if (y > 2000) {
          depthXOffset.set(0, x + NODE_W + H_GAP * 3);
          x = depthXOffset.get(0)!;
          y = 0;
        }
      }

      const newNode = await onAddNode({
        title: row.title,
        description: row.desc,
        altTitles: row.altTitles,
        x, y, w: NODE_W, h: NODE_H,
        relationshipType: row.rel === 'linear' || row.rel === 'nested' ? row.rel : '',
      });

      if (newNode) titleToNode.set(row.title, newNode);
    }

    // 3b. Create pathways for depth-0 nodes and assign pathwayId
    const depth0Nodes = parsed.filter(r => r.depth === 0 && r.title && titleToNode.has(r.title));
    const pathwayUpdates: Partial<CanvasNode>[] = [];
    for (const row of depth0Nodes) {
      try {
        const res = await fetch('/api/projects/' + projectId + '/canvas/pathways', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const pw = await res.json();
          const node = titleToNode.get(row.title);
          if (node) {
            pathwayUpdates.push({ id: node.id, pathwayId: pw.id });
            // Also assign same pathwayId to all descendants
            function assignPathway(title: string) {
              for (const r of parsed) {
                if (r.parentTitle === title && titleToNode.has(r.title)) {
                  pathwayUpdates.push({ id: titleToNode.get(r.title)!.id, pathwayId: pw.id });
                  assignPathway(r.title);
                }
              }
            }
            assignPathway(row.title);
          }
        }
      } catch (e) { console.error('Pathway creation error:', e); }
    }
    if (pathwayUpdates.length > 0) await onUpdateNodes(pathwayUpdates);

    // 4. Set parent relationships
    const parentUpdates: Partial<CanvasNode>[] = [];
    for (const row of parsed) {
      if (!row.parentTitle || !row.title) continue;
      const child = titleToNode.get(row.title);
      const parent = titleToNode.get(row.parentTitle);
      if (child && parent) {
        parentUpdates.push({
          id: child.id,
          parentId: parent.id,
          relationshipType: row.rel === 'linear' || row.rel === 'nested' ? row.rel : 'nested',
        });
      }
    }
    if (parentUpdates.length > 0) await onUpdateNodes(parentUpdates);

    // 4b. Chain depth-0 nodes with linear connections for conversion funnel flow
    const depth0Rows = parsed.filter(r => r.depth === 0 && r.title && titleToNode.has(r.title));
    const chainUpdates: Partial<CanvasNode>[] = [];
    for (let i = 1; i < depth0Rows.length; i++) {
      const prevNode = titleToNode.get(depth0Rows[i - 1].title);
      const currNode = titleToNode.get(depth0Rows[i].title);
      if (prevNode && currNode) {
        chainUpdates.push({
          id: currNode.id,
          parentId: prevNode.id,
          relationshipType: 'linear',
        });
      }
    }
    if (chainUpdates.length > 0) await onUpdateNodes(chainUpdates);

    // 5. Link keywords to nodes
    const kwUpdates: Partial<CanvasNode>[] = [];
    const kwStatusUpdates: { id: string; [key: string]: unknown }[] = [];

    for (const row of parsed) {
      if (!row.kwRaw || !row.title) continue;
      const node = titleToNode.get(row.title);
      if (!node) continue;

      const linkedIds: string[] = [];
      const placements: Record<string, string> = {};

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

      if (linkedIds.length > 0) {
        kwUpdates.push({ id: node.id, linkedKwIds: linkedIds, kwPlacements: placements });
      }
    }
    if (kwUpdates.length > 0) await onUpdateNodes(kwUpdates);

    // 5b. Update keyword records with topic names and canvasLoc descriptions
    const kwTopicUpdates: { id: string; [key: string]: unknown }[] = [];
    for (const row of parsed) {
      if (!row.kwRaw || !row.title) continue;
      const entries = row.kwRaw.split(',').map(s => s.trim()).filter(Boolean);
      for (const entry of entries) {
        const m = entry.match(/^(.+?)\s*\[([ps])\]\s*$/i);
        const kwText = m ? m[1].trim() : entry.replace(/\s*\[[ps]\]\s*$/i, '').trim();
        const kwObj = allKeywords.find(k => k.keyword.toLowerCase() === kwText.toLowerCase());
        if (kwObj) {
          // Build topic list (pipe-delimited)
          const existingTopics = (kwObj.topic || '').split('|').map(s => s.trim()).filter(Boolean);
          if (!existingTopics.includes(row.title)) {
            existingTopics.push(row.title);
          }
          // Build canvasLoc with description
          const existingLoc = (typeof kwObj.canvasLoc === 'object' && kwObj.canvasLoc) ? { ...kwObj.canvasLoc } : {};
          if (row.desc) {
            (existingLoc as Record<string, string>)[row.title] = row.desc;
          }
          kwTopicUpdates.push({
            id: kwObj.id,
            topic: existingTopics.join(' | '),
            canvasLoc: existingLoc,
          });
        }
      }
    }
    if (kwTopicUpdates.length > 0) onBatchUpdateKeywords(kwTopicUpdates);

    // Refresh canvas + keywords to sync UI
    await onRefreshCanvas();
    await onRefreshKeywords();

    // 6. Create sister links (TODO: implement via API when ready)

    // 7. Verify and mark keywords as AI-Sorted
    const allLinkedIds = new Set<string>();
    // Re-read nodes after updates
    for (const [, n] of titleToNode) {
      const upd = kwUpdates.find(u => u.id === n.id);
      if (upd?.linkedKwIds) (upd.linkedKwIds as string[]).forEach(id => allLinkedIds.add(id));
    }

    const unplaced: string[] = [];
    const placed: string[] = [];
    for (const id of batch.keywordIds) {
      if (allLinkedIds.has(id)) placed.push(id);
      else {
        const kw = allKeywords.find(k => k.id === id);
        if (kw) unplaced.push(kw.keyword);
      }
    }

    if (placed.length > 0) {
      onBatchUpdateKeywords(placed.map(id => ({ id, sortingStatus: 'AI-Sorted' })));
    }

    if (unplaced.length > 0) {
      aaLog('  ⚠ ' + unplaced.length + ' keyword(s) NOT placed: ' + unplaced.join(', '), 'warn');
      batch._unplacedKws = unplaced;
    } else {
      aaLog('  ✓ All ' + batch.keywordIds.length + ' keywords verified on canvas.', 'ok');
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
        const result = await processBatch(batch);
        if (abortRef.current) break;

        const validation = validateResult(result, batch);
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

        batch.result = result;
        batch.tokensUsed = result.tokensUsed;
        batch.cost = calcCost(result.tokensUsed);
        setTotalSpent(prev => prev + batch.cost);
        totalSpentRef.current += batch.cost;
        batch.reevalReport = result.reevalReport;
        batch.newTopicCount = result.newTopics.length;

        aaLog('Batch ' + batch.batchNum + ' — API OK. Cost: $' + batch.cost.toFixed(3), 'ok');

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
    runningRef.current = false;
    if (abortControllerRef.current) { abortControllerRef.current.abort(); abortControllerRef.current = null; }
    setAaState('IDLE');
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function handleApplyBatch() {
    if (aaState !== 'BATCH_REVIEW' || !pendingResult) return;
    const batch = batchesRef.current[currentIdxRef.current];
    doApply(batch, pendingResult);
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
            <div className="aa-row">
              <span className="aa-label">API Mode</span>
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
              <span className="aa-label">Model</span>
              <select className="aa-select" value={model} onChange={e => setModel(e.target.value)} disabled={aaState !== 'IDLE'}>
                <option value="claude-opus-4-6">Claude Opus 4.6</option>
                <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
                <option value="claude-opus-4-5">Claude Opus 4.5</option>
                <option value="claude-haiku-4-5">Claude Haiku 4.5</option>
              </select>
              <span className="aa-label">Scope</span>
              <select className="aa-select" value={keywordScope} onChange={e => setKeywordScope(e.target.value as typeof keywordScope)} disabled={aaState !== 'IDLE'}>
                <option value="unsorted-only">Unsorted only</option>
                <option value="non-ai-sorted">Non-AI-Sorted</option>
                <option value="all">All keywords</option>
              </select>
            </div>
            <div className="aa-row">
              <span className="aa-label">Seed words</span>
              <input className="aa-input aa-input-wide" value={seedWords} onChange={e => setSeedWords(e.target.value)} placeholder="e.g. bursitis" disabled={aaState !== 'IDLE'} />
            </div>
            <div className="aa-row">
              <span className="aa-label">Processing</span>
              <select className="aa-select" value={processingMode} onChange={e => { setProcessingMode(e.target.value as 'adaptive' | 'classic'); if (e.target.value === 'adaptive') setBatchSize(AA_BATCH_TIERS[0].size); }} disabled={aaState !== 'IDLE'}>
                <option value="adaptive">Adaptive</option>
                <option value="classic">Classic</option>
              </select>
              <span className="aa-label">Batch size</span>
              <input className="aa-input aa-input-sm" type="number" value={batchSize} onChange={e => setBatchSize(parseInt(e.target.value) || 8)} disabled={aaState !== 'IDLE' || processingMode === 'adaptive'} />
              {processingMode === 'adaptive' && <span style={{ fontSize: '9px', color: '#64748b' }}>Auto: 8→12→18</span>}
            </div>
            <div className="aa-row">
              <span className="aa-label">Thinking</span>
              <select className="aa-select" value={thinkingMode} onChange={e => setThinkingMode(e.target.value as typeof thinkingMode)} disabled={aaState !== 'IDLE'}>
                <option value="adaptive">Adaptive</option>
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
              {thinkingMode === 'enabled' && (
                <>
                  <span className="aa-label">Budget</span>
                  <input className="aa-input aa-input-sm" type="number" value={thinkingBudget} onChange={e => setThinkingBudget(parseInt(e.target.value) || 10000)} disabled={aaState !== 'IDLE'} />
                </>
              )}
              <span className="aa-label">Stall (sec)</span>
              <input className="aa-input aa-input-sm" type="number" value={stallTimeout} onChange={e => setStallTimeout(parseInt(e.target.value) || 90)} disabled={aaState !== 'IDLE'} />
            </div>
            <div className="aa-row">
              <span className="aa-label">Vol threshold</span>
              <input className="aa-input aa-input-sm" type="number" value={volumeThreshold} onChange={e => setVolumeThreshold(parseInt(e.target.value) || 1000)} disabled={aaState !== 'IDLE'} />
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
                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>Initial Prompt (main analysis instructions):</div>
                <textarea className="aa-prompt-textarea" value={initialPrompt} onChange={e => setInitialPrompt(e.target.value)} placeholder="Paste your AI analysis prompt here…" />
                <div className="aa-prompt-chars">{initialPrompt.length.toLocaleString()} chars</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', marginTop: '8px' }}>Topics Layout Table Primer (optional):</div>
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
