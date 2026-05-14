// P-20 mutation-rate trace script.
// Author: Claude Code, 2026-05-15 P-20 design session.
// Purpose: gather real-Amazon DOM mutation-rate evidence to inform
// the P-20 fix-shape pick.
//
// HOW TO USE (director):
//   1. Open a Chrome INCOGNITO window (Ctrl+Shift+N on Windows/Linux,
//      Cmd+Shift+N on Mac). Incognito disables sideloaded extensions
//      by default, so the PLOS extension won't pollute the trace.
//   2. Navigate to any typical Amazon product detail page (PDP) —
//      e.g., a regular consumer product like a kitchen gadget or pet
//      product (NOT a Prime Video page, NOT a sponsored ad slot).
//   3. Wait for the page to fully load (5-10 seconds — image gallery
//      visible, price visible, reviews section visible).
//   4. Open DevTools — press F12, or right-click anywhere on the
//      page and pick "Inspect", then click the "Console" tab at the
//      top of the DevTools panel.
//   5. Copy the ENTIRE BLOCK BELOW (the IIFE — everything between the
//      "// ====== SCRIPT BEGINS ======" and "// ====== SCRIPT ENDS ======"
//      markers), paste it at the Console prompt, press Enter.
//   6. For 30 seconds, scroll the page normally + hover over a few
//      images + read the page (simulate normal browsing behavior).
//      The script logs "[PLOS P-20 trace] Running 30 seconds..." when
//      it starts and prints the results when it finishes.
//   7. When the result block appears, type `copy(window.__plosTraceResult)`
//      at the Console prompt and press Enter — this copies the full
//      result text to your clipboard. Paste it back in this chat.
//
// What the script measures (the metrics this design pass needs):
//   - Total MutationRecord batches (raw MO firing rate).
//   - Nodes added per second (the input rate to the orchestrator's MO).
//   - Text content added in chars (how much new text per second —
//     directly tells us how often Amazon adds new HIGHLIGHTABLE content
//     vs. just decoration / scripts / attributes).
//   - "Would-be refresh() rescans per second" using the orchestrator's
//     exact 250ms trailing-edge throttle logic — this is the actual
//     flash rate the user sees. The single most important number.
//   - Top added element tag types — tells us WHAT kind of mutations
//     Amazon is making (DIV/SCRIPT/IMG/etc.) so we can reason about
//     whether per-platform scoping (fix shape c) could exclude them.

// ====== SCRIPT BEGINS ======
(() => {
  const counts = {
      totalBatches: 0,
          totalAddedNodes: 0,
              totalRemovedNodes: 0,
                  addedTextChars: 0,
                      rescanCount: 0,
                          addedTagCounts: {},
                            };
                              let throttleTimer = null;
                                const obs = new MutationObserver((records) => {
                                    counts.totalBatches += records.length;
                                        for (const r of records) {
                                              for (const n of r.addedNodes) {
                                                      counts.totalAddedNodes++;
                                                              if (n.nodeType === Node.TEXT_NODE) {
                                                                        counts.addedTextChars += (n.nodeValue || '').length;
                                                                                } else if (n.nodeType === Node.ELEMENT_NODE) {
                                                                                          const t = n.tagName;
                                                                                                    counts.addedTagCounts[t] = (counts.addedTagCounts[t] || 0) + 1;
                                                                                                              counts.addedTextChars += (n.textContent || '').length;
                                                                                                                      }
                                                                                                                            }
                                                                                                                                  counts.totalRemovedNodes += r.removedNodes.length;
                                                                                                                                      }
                                                                                                                                          if (throttleTimer === null) {
                                                                                                                                                throttleTimer = setTimeout(() => {
                                                                                                                                                        throttleTimer = null;
                                                                                                                                                                counts.rescanCount++;
                                                                                                                                                                      }, 250);
                                                                                                                                                                          }
                                                                                                                                                                            });
                                                                                                                                                                              obs.observe(document.body, { childList: true, subtree: true });

                                                                                                                                                                                const startMs = performance.now();
                                                                                                                                                                                  console.log(
                                                                                                                                                                                      '[PLOS P-20 trace] Running 30 seconds... scroll & interact normally with the page; results will print here when done.',
                                                                                                                                                                                        );

                                                                                                                                                                                          setTimeout(() => {
                                                                                                                                                                                              obs.disconnect();
                                                                                                                                                                                                  if (throttleTimer !== null) clearTimeout(throttleTimer);
                                                                                                                                                                                                      const elapsedSec = (performance.now() - startMs) / 1000;
                                                                                                                                                                                                          const topTags = Object.entries(counts.addedTagCounts)
                                                                                                                                                                                                                .sort((a, b) => b[1] - a[1])
                                                                                                                                                                                                                      .slice(0, 8);
                                                                                                                                                                                                                          const result = [
                                                                                                                                                                                                                                '===== PLOS P-20 trace RESULTS =====',
                                                                                                                                                                                                                                      `Page URL: ${location.href}`,
                                                                                                                                                                                                                                            `Elapsed: ${elapsedSec.toFixed(1)}s`,
                                                                                                                                                                                                                                                  `Total MutationRecord batches: ${counts.totalBatches}`,
                                                                                                                                                                                                                                                        `Nodes added:   ${counts.totalAddedNodes}  (${(counts.totalAddedNodes / elapsedSec).toFixed(1)}/sec)`,
                                                                                                                                                                                                                                                              `Nodes removed: ${counts.totalRemovedNodes}  (${(counts.totalRemovedNodes / elapsedSec).toFixed(1)}/sec)`,
                                                                                                                                                                                                                                                                    `Text content added: ${counts.addedTextChars} chars  (${(counts.addedTextChars / elapsedSec).toFixed(0)} chars/sec)`,
                                                                                                                                                                                                                                                                          `Would-be refresh() rescans (250ms throttle, matches orchestrator.ts): ${counts.rescanCount}  (${(counts.rescanCount / elapsedSec).toFixed(2)}/sec)`,
                                                                                                                                                                                                                                                                                `Top added element tags:`,
                                                                                                                                                                                                                                                                                      ...topTags.map(([t, c]) => `  ${t}: ${c}`),
                                                                                                                                                                                                                                                                                            '===== copy this back to Claude (or type copy(window.__plosTraceResult) to copy to clipboard) =====',
                                                                                                                                                                                                                                                                                                ].join('\n');
                                                                                                                                                                                                                                                                                                    console.log(result);
                                                                                                                                                                                                                                                                                                        window.__plosTraceResult = result;
                                                                                                                                                                                                                                                                                                          }, 30_000);
                                                                                                                                                                                                                                                                                                          })();
                                                                                                                                                                                                                                                                                                          // ====== SCRIPT ENDS ======
                                                                                                                                                                                                                                                                                                          