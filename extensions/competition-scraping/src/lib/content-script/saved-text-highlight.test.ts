// Unit tests for saved-text-highlight.ts — P-25 attach/detach lifecycle.
// The CSS Custom Highlight API isn't present in node:test, so we inject a
// fake registry + Highlight class via the module's __setTestRegistry hook.

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  __resetForTest,
  __setTestRegistry,
  attachSavedTextHaze,
  detachAllSavedTextHazes,
  detachSavedTextHaze,
  getSavedTextHazeCount,
  isSavedTextHazeAvailable,
} from './saved-text-highlight.ts';

// ─── Fake Highlight registry ─────────────────────────────────────────────

class FakeHighlight {
  ranges = new Set<AbstractRange>();
  constructor(...initial: AbstractRange[]) {
    for (const r of initial) this.ranges.add(r);
  }
  add(range: AbstractRange): void {
    this.ranges.add(range);
  }
  delete(range: AbstractRange): boolean {
    return this.ranges.delete(range);
  }
  clear(): void {
    this.ranges.clear();
  }
  has(range: AbstractRange): boolean {
    return this.ranges.has(range);
  }
  get size(): number {
    return this.ranges.size;
  }
  *[Symbol.iterator](): IterableIterator<AbstractRange> {
    yield* this.ranges;
  }
}

class FakeRegistry {
  private map = new Map<string, FakeHighlight>();
  set(name: string, highlight: FakeHighlight): void {
    this.map.set(name, highlight);
  }
  delete(name: string): boolean {
    return this.map.delete(name);
  }
  has(name: string): boolean {
    return this.map.has(name);
  }
  get(name: string): FakeHighlight | undefined {
    return this.map.get(name);
  }
}

let teardown: (() => void) | null = null;
let registry: FakeRegistry;

beforeEach(() => {
  __resetForTest();
  registry = new FakeRegistry();
  teardown = __setTestRegistry(
    registry as unknown as Parameters<typeof __setTestRegistry>[0],
    FakeHighlight as unknown as Parameters<typeof __setTestRegistry>[1],
  );
});

afterEach(() => {
  teardown?.();
  teardown = null;
});

function mkRange(): Range {
  // Test ranges are opaque tokens — the helper treats them as keys, never
  // calls Range-specific methods. So a plain object cast satisfies the
  // interface for these tests.
  return { __tag: 'fake-range', __id: Math.random() } as unknown as Range;
}

// ─── Availability ────────────────────────────────────────────────────────

describe('isSavedTextHazeAvailable', () => {
  it('reports true when CSS.highlights is injected', () => {
    assert.equal(isSavedTextHazeAvailable(), true);
  });

  it('reports false after teardown removes the registry', () => {
    teardown?.();
    teardown = null;
    assert.equal(isSavedTextHazeAvailable(), false);
  });
});

// ─── attachSavedTextHaze ─────────────────────────────────────────────────

describe('attachSavedTextHaze', () => {
  it('creates the highlight registry entry on first attach', () => {
    const range = mkRange();
    const ok = attachSavedTextHaze(range, 'txt-1');
    assert.equal(ok, true);
    const hl = registry.get('plos-cs-saved-text');
    assert.notEqual(hl, undefined);
    assert.equal(hl!.size, 1);
    assert.equal(hl!.has(range), true);
  });

  it('reuses the same highlight registry entry on subsequent attaches', () => {
    attachSavedTextHaze(mkRange(), 'txt-1');
    attachSavedTextHaze(mkRange(), 'txt-2');
    assert.equal(getSavedTextHazeCount(), 2);
    const hl = registry.get('plos-cs-saved-text');
    assert.equal(hl!.size, 2);
  });

  it('replaces the prior range on re-attach with the same id (idempotent)', () => {
    const r1 = mkRange();
    const r2 = mkRange();
    attachSavedTextHaze(r1, 'txt-1');
    attachSavedTextHaze(r2, 'txt-1');
    const hl = registry.get('plos-cs-saved-text');
    assert.equal(hl!.size, 1);
    assert.equal(hl!.has(r1), false);
    assert.equal(hl!.has(r2), true);
  });

  it('returns false when CSS.highlights is unavailable', () => {
    teardown?.();
    teardown = null;
    assert.equal(attachSavedTextHaze(mkRange(), 'txt-1'), false);
    assert.equal(getSavedTextHazeCount(), 0);
  });
});

// ─── detachSavedTextHaze ─────────────────────────────────────────────────

describe('detachSavedTextHaze', () => {
  it('removes the range for a known id', () => {
    const range = mkRange();
    attachSavedTextHaze(range, 'txt-1');
    detachSavedTextHaze('txt-1');
    assert.equal(getSavedTextHazeCount(), 0);
    const hl = registry.get('plos-cs-saved-text');
    assert.equal(hl!.size, 0);
  });

  it('is a no-op for an unknown id', () => {
    attachSavedTextHaze(mkRange(), 'txt-1');
    detachSavedTextHaze('txt-missing');
    assert.equal(getSavedTextHazeCount(), 1);
  });

  it('does not throw when CSS.highlights is unavailable', () => {
    teardown?.();
    teardown = null;
    assert.doesNotThrow(() => detachSavedTextHaze('txt-1'));
  });
});

// ─── detachAllSavedTextHazes ─────────────────────────────────────────────

describe('detachAllSavedTextHazes', () => {
  it('clears every registered range', () => {
    attachSavedTextHaze(mkRange(), 'txt-1');
    attachSavedTextHaze(mkRange(), 'txt-2');
    attachSavedTextHaze(mkRange(), 'txt-3');
    detachAllSavedTextHazes();
    assert.equal(getSavedTextHazeCount(), 0);
    const hl = registry.get('plos-cs-saved-text');
    assert.equal(hl!.size, 0);
  });

  it('is safe to call when there are no attached ranges', () => {
    assert.doesNotThrow(() => detachAllSavedTextHazes());
    assert.equal(getSavedTextHazeCount(), 0);
  });

  it('does not throw when CSS.highlights is unavailable', () => {
    attachSavedTextHaze(mkRange(), 'txt-1');
    teardown?.();
    teardown = null;
    // The module-scope rangesById still holds the entry from before teardown.
    // After teardown, detachAll should still clear rangesById gracefully.
    assert.doesNotThrow(() => detachAllSavedTextHazes());
    assert.equal(getSavedTextHazeCount(), 0);
  });
});
