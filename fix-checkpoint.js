const fs = require('fs');
const path = '/workspaces/brand-operations-hub/src/app/keyword-clustering/components/AutoAnalyze.tsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const checkpointCode = `
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
      const completed = cp.batches.filter((b) => b.status === 'complete').length;
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
    setBatches(cp.batches); batchesRef.current = cp.batches;
    setCurrentIdx(cp.currentIdx); currentIdxRef.current = cp.currentIdx;
    setTotalSpent(cp.totalSpent); totalSpentRef.current = cp.totalSpent;
    setDeltaMode(cp.deltaMode); deltaModeRef.current = cp.deltaMode;
    setBatchTier(cp.batchTier); batchTierRef.current = cp.batchTier;
    setLogEntries(cp.logEntries || []);
    setElapsed(cp.elapsed || 0);
    abortRef.current = false;
    startTimeRef.current = Date.now() - (cp.elapsed || 0) * 1000;
    aaLog('Resumed from checkpoint (' + cp.batches.filter((b) => b.status === 'complete').length + '/' + cp.batches.length + ' batches done)', 'ok');
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
  }`;

// Insert after line 223 (0-indexed: 222)
lines.splice(223, 0, checkpointCode);

fs.writeFileSync(path, lines.join('\n'));
console.log('Checkpoint functions inserted after line 223');
