// P-19 fix 2026-05-18-d: unit tests for the muteMutationObserver wiring
// on the "already saved" overlay's destroy paths.
//
// The bug class: when the overlay banner is removed from the DOM (auto-
// dismiss at 5s OR close-button click OR replacement-by-new-overlay),
// the orchestrator's MutationObserver fires → debounced highlighter
// refresh → strip-and-reapply <mark> elements → user's active text
// selection collapses. The fix wraps banner.remove() in the caller's
// optional muteMutationObserver wrapper, symmetric with the P-14 fix
// for startLiveHighlighting.
//
// These tests verify the wrapper is invoked on every destroy path
// without exercising real DOM teardown (which would require jsdom).
// Same hand-built-stub pattern as find-underlying-image.test.ts and
// api-bridge.test.ts elsewhere in this directory.

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  hideAlreadySavedOverlay,
  showAlreadySavedOverlay,
} from './already-saved-overlay.ts';

interface FakeElement {
  tagName: string;
  className: string;
  type: string;
  textContent: string;
  style: Record<string, string>;
  removed: boolean;
  attributes: Record<string, string>;
  children: FakeElement[];
  listeners: Record<string, Array<() => void>>;
  appendChild(child: FakeElement): void;
  remove(): void;
  setAttribute(name: string, value: string): void;
  addEventListener(event: string, fn: () => void): void;
}

function makeFakeElement(): FakeElement {
  const el: FakeElement = {
    tagName: 'DIV',
    className: '',
    type: '',
    textContent: '',
    style: {},
    removed: false,
    attributes: {},
    children: [],
    listeners: {},
    appendChild(child) {
      this.children.push(child);
    },
    remove() {
      this.removed = true;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    addEventListener(event, fn) {
      (this.listeners[event] ??= []).push(fn);
    },
  };
  return el;
}

interface FakeDocument {
  body: FakeElement;
  createdElements: FakeElement[];
  createElement(_tag: string): FakeElement;
}

function makeFakeDocument(): FakeDocument {
  const created: FakeElement[] = [];
  return {
    body: makeFakeElement(),
    createdElements: created,
    createElement(_tag) {
      const el = makeFakeElement();
      created.push(el);
      return el;
    },
  };
}

let originalDocument: unknown;
let fakeDoc: FakeDocument;

function installDocumentStub(): void {
  originalDocument = (globalThis as { document?: unknown }).document;
  fakeDoc = makeFakeDocument();
  (globalThis as { document: unknown }).document = fakeDoc;
}

function restoreDocument(): void {
  (globalThis as { document?: unknown }).document = originalDocument;
}

/** Mute-wrapper spy: counts invocations and forwards to work(). */
function makeMuteSpy(): {
  fn: <T>(work: () => Promise<T>) => Promise<T>;
  callCount: () => number;
} {
  let count = 0;
  return {
    fn: async <T>(work: () => Promise<T>): Promise<T> => {
      count++;
      return work();
    },
    callCount: () => count,
  };
}

describe('showAlreadySavedOverlay (P-19 mute discipline)', () => {
  beforeEach(() => {
    installDocumentStub();
  });

  afterEach(() => {
    // Make sure no overlay leaks between tests (each destroy goes through
    // the caller's mute wrapper, but the module-level activeOverlay state
    // is shared across tests).
    hideAlreadySavedOverlay();
    restoreDocument();
  });

  it('explicit handle.destroy() invokes the muteMutationObserver wrapper exactly once', async () => {
    const spy = makeMuteSpy();
    const handle = showAlreadySavedOverlay('Acme', {
      muteMutationObserver: spy.fn,
    });
    assert.equal(spy.callCount(), 0, 'wrapper not yet invoked at show time');

    handle.destroy();
    // The destroy() implementation invokes the wrapper synchronously
    // (the call is `void muteMutationObserver(async () => { ... })`).
    // The wrapped work() body runs on the microtask queue but the
    // wrapper-invocation count increments immediately.
    assert.equal(spy.callCount(), 1, 'wrapper invoked exactly once on destroy');
  });

  it('hideAlreadySavedOverlay() routes through destroy() and invokes the wrapper', async () => {
    const spy = makeMuteSpy();
    showAlreadySavedOverlay('Acme', { muteMutationObserver: spy.fn });
    assert.equal(spy.callCount(), 0);

    hideAlreadySavedOverlay();
    assert.equal(
      spy.callCount(),
      1,
      'wrapper invoked when hideAlreadySavedOverlay() tears down the active overlay',
    );
  });

  it('replacement-destroy (showing a new overlay while one is active) invokes the prior overlay’s wrapper', async () => {
    const firstSpy = makeMuteSpy();
    const secondSpy = makeMuteSpy();

    showAlreadySavedOverlay('First', { muteMutationObserver: firstSpy.fn });
    assert.equal(firstSpy.callCount(), 0);

    // Showing a second overlay while the first is still active should
    // destroy the first — and that destroy() must go through the first
    // overlay's mute wrapper, not the second's (the first overlay's
    // teardown is what mutates the DOM; the second is a fresh insert).
    showAlreadySavedOverlay('Second', { muteMutationObserver: secondSpy.fn });
    assert.equal(
      firstSpy.callCount(),
      1,
      'first overlay’s wrapper invoked when replaced',
    );
    assert.equal(
      secondSpy.callCount(),
      0,
      'second overlay’s wrapper not invoked at show time',
    );

    // Cleanup: tear down the second overlay so the next test starts clean.
    hideAlreadySavedOverlay();
    assert.equal(secondSpy.callCount(), 1, 'second overlay’s wrapper invoked on cleanup');
  });

  it('works without a muteMutationObserver option (default no-op wrapper)', async () => {
    // No wrapper passed → default no-op wrapper. Should not throw, and
    // the overlay should still tear down cleanly.
    const handle = showAlreadySavedOverlay('Acme');
    handle.destroy();
    // Re-show and hide via the public helper — second sanity check.
    showAlreadySavedOverlay(null);
    hideAlreadySavedOverlay();
    // No assertion needed beyond "no throw"; explicit ok() to mark the
    // success path.
    assert.ok(true);
  });
});
