// Pure-logic tests for the live-page highlight-terms regex + color map.
// DOM-touching functions (applyHighlightsTo, removeAllHighlights,
// startLiveHighlighting) are verified end-to-end in-browser during the
// Waypoint #1 attempt #4 re-verify pass.
//
// P-9 fix 2026-05-10: added tests for processInChunks (the chunk-and-yield
// helper used by applyHighlightsTo). Tested in isolation via a synchronous
// stub yieldFn so we can verify chunk boundaries + cancellation without
// requiring browser idle-callback APIs.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildColorMap,
  buildHighlightRegex,
  hashFingerprintMatches,
  processInChunks,
  type CancellationSignal,
} from './highlight-terms.ts';
import type { HighlightTerm } from '../highlight-terms.ts';

const term = (t: string, color = '#FFEB3B'): HighlightTerm => ({
  term: t,
  color,
});

describe('buildHighlightRegex', () => {
  it('returns null for empty list', () => {
    assert.equal(buildHighlightRegex([]), null);
  });

  it('returns null when all terms are blank or whitespace', () => {
    assert.equal(buildHighlightRegex([term(''), term('   ')]), null);
  });

  it('returns null for null/undefined safely', () => {
    // @ts-expect-error testing runtime guard
    assert.equal(buildHighlightRegex(null), null);
    // @ts-expect-error testing runtime guard
    assert.equal(buildHighlightRegex(undefined), null);
  });

  it('matches a single word case-insensitively', () => {
    const re = buildHighlightRegex([term('therapy')])!;
    // Reset between assertions — global flag makes test() stateful.
    re.lastIndex = 0;
    assert.ok(re.test('Therapy is good'));
    re.lastIndex = 0;
    assert.ok(re.test('THERAPY'));
    re.lastIndex = 0;
    assert.ok(re.test('use therapy daily'));
  });

  it('respects word boundaries — does NOT match inside a longer word', () => {
    const re = buildHighlightRegex([term('cat')])!;
    assert.equal(re.test('category'), false);
    assert.equal(re.test('concatenate'), false);
    re.lastIndex = 0;
    assert.equal(re.test('the cat sat'), true);
  });

  it('matches a multi-word phrase', () => {
    const re = buildHighlightRegex([term('red light therapy')])!;
    assert.ok(re.test('Red Light Therapy device'));
    re.lastIndex = 0;
    assert.equal(re.test('red therapy'), false);
  });

  it('multi-word phrase tolerates whitespace variations', () => {
    const re = buildHighlightRegex([term('red light therapy')])!;
    // Multiple spaces
    assert.ok(re.test('red  light   therapy device'));
    re.lastIndex = 0;
    // Non-breaking space
    assert.ok(re.test('red light therapy device'));
    re.lastIndex = 0;
    // Newline (HTML inline rendering can produce these)
    assert.ok(re.test('red\nlight\ntherapy'));
  });

  it('longest term wins on overlapping alternation', () => {
    // With both "red" and "red light therapy" registered, the multi-word
    // term should match the full phrase rather than just "red". Pull all
    // matches from the same input and verify the first one is the longest.
    const re = buildHighlightRegex([
      term('red'),
      term('red light therapy'),
    ])!;
    const matches = Array.from('I bought a red light therapy lamp'.matchAll(re));
    assert.equal(matches.length, 1);
    assert.equal(matches[0]![0], 'red light therapy');
  });

  it('escapes regex metacharacters in user-supplied terms', () => {
    // A term with regex special characters must match literally, not as a regex.
    const re = buildHighlightRegex([term('100% off')])!;
    assert.ok(re.test('Sale: 100% off today'));
    re.lastIndex = 0;
    // The escaped form should NOT match arbitrary characters where % was.
    assert.equal(re.test('100x off'), false);
  });

  it('matches multiple distinct terms in one pass', () => {
    const re = buildHighlightRegex([
      term('lamp', '#FFEB3B'),
      term('therapy', '#1976D2'),
    ])!;
    const matches = Array.from(
      'red light therapy lamp from a therapy company'.matchAll(re),
    );
    assert.equal(matches.length, 3); // therapy, lamp, therapy
    assert.equal(matches[0]![0].toLowerCase(), 'therapy');
    assert.equal(matches[1]![0].toLowerCase(), 'lamp');
    assert.equal(matches[2]![0].toLowerCase(), 'therapy');
  });

  it('hyphenated term matches as a whole unit', () => {
    const re = buildHighlightRegex([term('near-infrared')])!;
    assert.ok(re.test('Near-Infrared light therapy'));
  });

  it('skips blank terms but keeps non-blank siblings', () => {
    const re = buildHighlightRegex([
      term(''),
      term('therapy'),
      term('   '),
    ])!;
    assert.ok(re.test('therapy works'));
  });
});

describe('buildColorMap', () => {
  it('maps lowercased term to color', () => {
    const map = buildColorMap([term('Red Light', '#FFEB3B')]);
    assert.equal(map.get('red light'), '#FFEB3B');
  });

  it('skips blank/empty terms', () => {
    const map = buildColorMap([term(''), term('   '), term('lamp', '#1976D2')]);
    assert.equal(map.size, 1);
    assert.equal(map.get('lamp'), '#1976D2');
  });

  it('case-collision: later entry wins', () => {
    const map = buildColorMap([
      term('Lamp', '#FFEB3B'),
      term('LAMP', '#1976D2'),
    ]);
    assert.equal(map.size, 1);
    assert.equal(map.get('lamp'), '#1976D2');
  });

  it('returns empty map for empty input', () => {
    assert.equal(buildColorMap([]).size, 0);
  });

  it('handles null/undefined entries safely', () => {
    const map = buildColorMap([
      // @ts-expect-error testing runtime guard
      null,
      term('therapy', '#388E3C'),
    ]);
    assert.equal(map.get('therapy'), '#388E3C');
  });
});

describe('processInChunks (P-9 fix 2026-05-10)', () => {
  // Synchronous resolved-Promise yield. Lets us test chunk boundaries
  // deterministically without involving real timers or rIC.
  const noopYield = (): Promise<void> => Promise.resolve();

  it('processes every item in input order with no chunkSize boundary', async () => {
    const items = [10, 20, 30, 40, 50];
    const seen: number[] = [];
    await processInChunks(items, (n) => seen.push(n), {
      chunkSize: 1000,
      yieldFn: noopYield,
    });
    assert.deepEqual(seen, items);
  });

  it('processes empty input without calling yieldFn', async () => {
    let yieldCalls = 0;
    const recordingYield = (): Promise<void> => {
      yieldCalls++;
      return Promise.resolve();
    };
    const seen: number[] = [];
    await processInChunks([], (n: number) => seen.push(n), {
      chunkSize: 5,
      yieldFn: recordingYield,
    });
    assert.deepEqual(seen, []);
    assert.equal(yieldCalls, 0);
  });

  it('yields between chunks at chunkSize boundary', async () => {
    let yieldCalls = 0;
    const recordingYield = (): Promise<void> => {
      yieldCalls++;
      return Promise.resolve();
    };
    // 10 items, chunkSize 3 → yield after item 3, 6, 9 (3 yields).
    // No yield after item 10 (last item — no more work to do).
    const items = Array.from({ length: 10 }, (_, i) => i);
    await processInChunks(items, () => undefined, {
      chunkSize: 3,
      yieldFn: recordingYield,
    });
    assert.equal(yieldCalls, 3);
  });

  it('does not yield when item count is exactly one chunk', async () => {
    let yieldCalls = 0;
    const recordingYield = (): Promise<void> => {
      yieldCalls++;
      return Promise.resolve();
    };
    // 5 items, chunkSize 5 → would yield after item 5, but that's the
    // last item so the yield is skipped.
    const items = [1, 2, 3, 4, 5];
    await processInChunks(items, () => undefined, {
      chunkSize: 5,
      yieldFn: recordingYield,
    });
    assert.equal(yieldCalls, 0);
  });

  it('yields once when item count is exactly two chunks', async () => {
    let yieldCalls = 0;
    const recordingYield = (): Promise<void> => {
      yieldCalls++;
      return Promise.resolve();
    };
    // 10 items, chunkSize 5 → yield after item 5, no yield after item 10.
    const items = Array.from({ length: 10 }, (_, i) => i);
    await processInChunks(items, () => undefined, {
      chunkSize: 5,
      yieldFn: recordingYield,
    });
    assert.equal(yieldCalls, 1);
  });

  it('aborts at next chunk boundary when signal.cancelled becomes true', async () => {
    const signal: CancellationSignal = { cancelled: false };
    const seen: number[] = [];
    // After processing the first chunk (3 items), set cancelled = true
    // inside the yieldFn. The loop checks cancellation at the START of
    // the next iteration → won't process item 4.
    const cancellingYield = (): Promise<void> => {
      signal.cancelled = true;
      return Promise.resolve();
    };
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    await processInChunks(items, (n) => seen.push(n), {
      chunkSize: 3,
      signal,
      yieldFn: cancellingYield,
    });
    // First chunk processed (items 1-3), then yield → cancellation set,
    // then next iteration's signal check → return. seen: [1, 2, 3].
    assert.deepEqual(seen, [1, 2, 3]);
  });

  it('honors cancellation signal set BEFORE first item', async () => {
    const signal: CancellationSignal = { cancelled: true };
    const seen: number[] = [];
    await processInChunks([1, 2, 3], (n) => seen.push(n), {
      chunkSize: 1,
      signal,
      yieldFn: noopYield,
    });
    assert.deepEqual(seen, []);
  });

  it('uses default chunkSize when not specified', async () => {
    // Default APPLY_CHUNK_SIZE_DEFAULT is 500. With 100 items, no yield
    // should fire since we're well under one chunk.
    let yieldCalls = 0;
    const recordingYield = (): Promise<void> => {
      yieldCalls++;
      return Promise.resolve();
    };
    const items = Array.from({ length: 100 }, (_, i) => i);
    await processInChunks(items, () => undefined, {
      yieldFn: recordingYield,
    });
    assert.equal(yieldCalls, 0);
  });

  it('processes items with side effects in order before each yield', async () => {
    // Verifies the contract: items are fully processed BEFORE the yield
    // for that chunk. This is load-bearing for last-wins refresh
    // cancellation: a cancelled pass that has processed N items leaves
    // partial state at exactly N items, not N+k items mid-batch.
    const yieldedAfterCount: number[] = [];
    const seen: number[] = [];
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const recordingYield = (): Promise<void> => {
      yieldedAfterCount.push(seen.length);
      return Promise.resolve();
    };
    await processInChunks(items, (n) => seen.push(n), {
      chunkSize: 3,
      yieldFn: recordingYield,
    });
    // Yields fire AFTER items 3, 6, 9 are processed — never mid-chunk.
    assert.deepEqual(yieldedAfterCount, [3, 6, 9]);
    assert.deepEqual(seen, items);
  });
});

describe('hashFingerprintMatches (P-20 fix 2026-05-15)', () => {
  it('returns the canonical steady-state string for empty input', () => {
    // The pending-highlight-work walk produces zero matches in the
    // common steady state (page fully highlighted; nothing pending).
    // The refresh() short-circuit relies on this exact string being
    // stable across calls so post-apply state always compares equal
    // to the next steady-state pre-check.
    assert.equal(hashFingerprintMatches([]), '0:5381');
  });

  it('is deterministic across calls with the same input', () => {
    const matches = [
      { matched: 'cat', index: 12 },
      { matched: 'therapy', index: 27 },
      { matched: 'cat', index: 81 },
    ];
    assert.equal(
      hashFingerprintMatches(matches),
      hashFingerprintMatches(matches),
    );
  });

  it('encodes the match count as the prefix', () => {
    // The `${count}:${hash}` shape ensures that any state with N matches
    // can never collide with a state with M matches even if their hash
    // tails accidentally agree. The refresh short-circuit treats
    // count-changes as a guaranteed re-apply trigger.
    const oneMatch = hashFingerprintMatches([{ matched: 'cat', index: 0 }]);
    const twoMatches = hashFingerprintMatches([
      { matched: 'cat', index: 0 },
      { matched: 'dog', index: 5 },
    ]);
    assert.ok(oneMatch.startsWith('1:'));
    assert.ok(twoMatches.startsWith('2:'));
    assert.notEqual(oneMatch, twoMatches);
  });

  it('changes when a match string changes', () => {
    const a = hashFingerprintMatches([{ matched: 'cat', index: 0 }]);
    const b = hashFingerprintMatches([{ matched: 'dog', index: 0 }]);
    assert.notEqual(a, b);
  });

  it('changes when a match index changes within a text node', () => {
    // Catches the case where the same word moves position inside the
    // same text node (e.g., a piece of leading text was inserted
    // before it). The wrapping mark would need re-positioning, so
    // the fingerprint must register the change.
    const a = hashFingerprintMatches([{ matched: 'cat', index: 0 }]);
    const b = hashFingerprintMatches([{ matched: 'cat', index: 4 }]);
    assert.notEqual(a, b);
  });

  it('is order-sensitive — different sequences of the same matches produce different hashes', () => {
    // The TreeWalker visits text nodes in document order. If two pages
    // contain the same matches in different orders, the fingerprint
    // distinguishes them so a reordered carousel triggers re-apply
    // even when the multiset of matches is unchanged.
    const a = hashFingerprintMatches([
      { matched: 'cat', index: 0 },
      { matched: 'dog', index: 4 },
    ]);
    const b = hashFingerprintMatches([
      { matched: 'dog', index: 0 },
      { matched: 'cat', index: 4 },
    ]);
    assert.notEqual(a, b);
  });

  it('preserves equality when matches and order are identical', () => {
    // The core invariant: identical input → identical output. This is
    // the property the refresh() short-circuit depends on for
    // correctness — false positives (treating same state as different)
    // produce unnecessary re-applies; false negatives (treating
    // different state as same) skip a needed re-apply.
    const matches = [
      { matched: 'red light therapy', index: 7 },
      { matched: 'lamp', index: 38 },
    ];
    const copy = matches.map((m) => ({ matched: m.matched, index: m.index }));
    assert.equal(
      hashFingerprintMatches(matches),
      hashFingerprintMatches(copy),
    );
  });

  it('handles long matched strings without truncation collisions', () => {
    // djb2 over the full string ensures long matches contribute the
    // full sequence of character codes. A 200-char string differing
    // only at the tail must still produce a different hash.
    const longA = 'a'.repeat(199) + 'b';
    const longB = 'a'.repeat(199) + 'c';
    const a = hashFingerprintMatches([{ matched: longA, index: 0 }]);
    const b = hashFingerprintMatches([{ matched: longB, index: 0 }]);
    assert.notEqual(a, b);
  });

  it('handles large match counts within 32-bit truncation', () => {
    // The `| 0` truncation keeps the hash bounded to 32 bits. Verifies
    // that hashing 10k matches doesn't throw, doesn't produce NaN, and
    // produces a stable string shape.
    const many = Array.from({ length: 10_000 }, (_, i) => ({
      matched: 'cat',
      index: i,
    }));
    const fp = hashFingerprintMatches(many);
    assert.ok(fp.startsWith('10000:'));
    assert.ok(/^10000:-?\d+$/.test(fp), `fingerprint shape: ${fp}`);
  });
});
