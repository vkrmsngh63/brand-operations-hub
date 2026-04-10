const fs = require('fs');
const path = '/workspaces/brand-operations-hub/src/app/keyword-clustering/components/AutoAnalyze.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add checkpoint functions after the aaLog helper
const logHelperEnd = `}, []);
  /* ── Get unsorted keywords`;
const checkpointFns = `}, []);

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
    // Restore config
    const c = cp.config;
    setApiMode(c.apiMode); setApiKey(c.apiKey || ''); setModel(c.model);
    setSeedWords(c.seedWords); setVolumeThreshold(c.volumeThreshold);
    setBatchSize(c.batchSize); setProcessingMode(c.processingMode);
    setThinkingMode(c.thinkingMode); setThinkingBudget(c.thinkingBudget);
    setKeywordScope(c.keywordScope); setStallTimeout(c.stallTimeout);
    setReviewMode(c.reviewMode); setInitialPrompt(c.initialPrompt);
    setPrimerPrompt(c.primerPrompt || '');
    // Restore runtime state
    setBatches(cp.batches); batchesRef.current = cp.batches;
    setCurrentIdx(cp.currentIdx); currentIdxRef.current = cp.currentIdx;
    setTotalSpent(cp.totalSpent); totalSpentRef.current = cp.totalSpent;
    setDeltaMode(cp.deltaMode); deltaModeRef.current = cp.deltaMode;
    setBatchTier(cp.batchTier); batchTierRef.current = cp.batchTier;
    setLogEntries(cp.logEntries || []);
    setElapsed(cp.elapsed || 0);
    // Start running from where we left off
    abortRef.current = false;
    startTimeRef.current = Date.now() - (cp.elapsed || 0) * 1000;
    aaLog('Resumed from checkpoint (' + savedCheckpointInfo + ')', 'ok');
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
    aaLog('Checkpoint discarded.', 'info');
  }

  /* ── Get unsorted keywords`;
code = code.replace(logHelperEnd, checkpointFns);

// 2. Add saveCheckpoint() call after batch completion in runLoop
// Find the "ALL BATCHES COMPLETE" log line and add clearCheckpoint before it
const allComplete = "aaLog('═══ ALL BATCHES COMPLETE ═══', 'ok');";
code = code.replace(allComplete, "clearCheckpoint();\n      " + allComplete);

// 3. Add saveCheckpoint() after each batch status update to 'complete'
const batchApplied = "aaLog('Batch ' + batch.batchNum + ' — applied.', 'ok');";
code = code.replace(batchApplied, batchApplied + "\n          saveCheckpoint();");

// 4. Add clearCheckpoint() in handleCancel
const cancelIdle = "setAaState('IDLE');";
// Only replace in handleCancel context - find the specific one after "Cancelled"
const cancelBlock = "aaLog('Cancelled.', 'warn');\n    abortRef.current = true;";
code = code.replace(cancelBlock, cancelBlock + "\n    clearCheckpoint();");

// 5. Add checkpoint resume banner in the UI - find the config section title
const configTitle = `<div className="aa-section-title">Configuration</div>`;
const resumeBanner = `<div className="aa-section-title">Configuration</div>
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
            )}`;
code = code.replace(configTitle, resumeBanner);

fs.writeFileSync(path, code);
console.log('Checkpoint persistence added successfully.');
