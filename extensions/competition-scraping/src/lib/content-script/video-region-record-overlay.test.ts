// Unit tests for video-region-record-overlay.ts — P-45 Build #1b (2026-05-22).
//
// Coverage strategy per CAPTURED_VIDEOS_DESIGN.md §C.18: the overlay file
// is DOM-coupled (matches the source pattern of region-screenshot-overlay.ts).
// Tests stub `globalThis.document` + `globalThis.window` so we can exercise
// the public behaviors without JSDOM:
//   - exported BANNER_COPY content
//   - openVideoRegionRecordOverlay creates + appends a single overlay div
//   - second call tears down the first (activeOverlay singleton)
//   - destroy() removes the overlay element + is idempotent
//   - Esc key fires onCancel('escape')
//   - mouseup on a too-small rect fires onCancel('rect-too-small')
//   - mouseup on a valid rect fires onRegionPicked(rect)
//
// Pure rect math (rectFromDrag, clampRectToViewport, isRectTooSmall) is
// covered by region-screenshot.test.ts; those tests are not duplicated here.

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  BANNER_COPY,
  openVideoRegionRecordOverlay,
  type VideoRegionRecordCancelReason,
} from './video-region-record-overlay.ts';
import type { Rect } from '../region-screenshot.ts';

// ─── Fake DOM ─────────────────────────────────────────────────────────────

interface FakeElement {
  tagName: string;
  className: string;
  textContent: string;
  style: Record<string, string>;
  attributes: Record<string, string>;
  children: FakeElement[];
  removed: boolean;
  listeners: Map<string, Array<(event: unknown) => void>>;
  appendChild(child: FakeElement): void;
  remove(): void;
  setAttribute(name: string, value: string): void;
  addEventListener(event: string, fn: (event: unknown) => void): void;
  removeEventListener(event: string, fn: (event: unknown) => void): void;
  fire(event: string, payload: unknown): void;
}

function makeFakeElement(tag = 'DIV'): FakeElement {
  const listeners = new Map<string, Array<(event: unknown) => void>>();
  const el: FakeElement = {
    tagName: tag.toUpperCase(),
    className: '',
    textContent: '',
    style: {},
    attributes: {},
    children: [],
    removed: false,
    listeners,
    appendChild(child) {
      el.children.push(child);
    },
    remove() {
      el.removed = true;
    },
    setAttribute(name, value) {
      el.attributes[name] = value;
    },
    addEventListener(event, fn) {
      const arr = listeners.get(event) ?? [];
      arr.push(fn);
      listeners.set(event, arr);
    },
    removeEventListener(event, fn) {
      const arr = listeners.get(event) ?? [];
      const idx = arr.indexOf(fn);
      if (idx !== -1) arr.splice(idx, 1);
      listeners.set(event, arr);
    },
    fire(event, payload) {
      const arr = listeners.get(event) ?? [];
      for (const h of arr) h(payload);
    },
  };
  return el;
}

interface FakeDocument {
  body: FakeElement;
  createdElements: FakeElement[];
  createElement(tag: string): FakeElement;
  createTextNode(text: string): { textContent: string };
}

function makeFakeDocument(): FakeDocument {
  const created: FakeElement[] = [];
  const body = makeFakeElement('BODY');
  return {
    body,
    createdElements: created,
    createElement(tag) {
      const el = makeFakeElement(tag);
      created.push(el);
      return el;
    },
    createTextNode(text) {
      return { textContent: text };
    },
  };
}

interface FakeWindow {
  innerWidth: number;
  innerHeight: number;
  listeners: Map<string, Array<(event: unknown) => void>>;
  addEventListener(event: string, fn: (event: unknown) => void): void;
  removeEventListener(event: string, fn: (event: unknown) => void): void;
  fire(event: string, payload: unknown): void;
}

function makeFakeWindow(innerWidth = 1280, innerHeight = 800): FakeWindow {
  const listeners = new Map<string, Array<(event: unknown) => void>>();
  return {
    innerWidth,
    innerHeight,
    listeners,
    addEventListener(event, fn) {
      const arr = listeners.get(event) ?? [];
      arr.push(fn);
      listeners.set(event, arr);
    },
    removeEventListener(event, fn) {
      const arr = listeners.get(event) ?? [];
      const idx = arr.indexOf(fn);
      if (idx !== -1) arr.splice(idx, 1);
      listeners.set(event, arr);
    },
    fire(event, payload) {
      const arr = listeners.get(event) ?? [];
      for (const h of arr) h(payload);
    },
  };
}

let originalDocument: unknown;
let originalWindow: unknown;
let doc: FakeDocument;
let win: FakeWindow;

function installStubs(): void {
  originalDocument = (globalThis as { document?: unknown }).document;
  originalWindow = (globalThis as { window?: unknown }).window;
  doc = makeFakeDocument();
  win = makeFakeWindow();
  (globalThis as { document: unknown }).document = doc;
  (globalThis as { window: unknown }).window = win;
}

function restoreStubs(): void {
  (globalThis as { document?: unknown }).document = originalDocument;
  (globalThis as { window?: unknown }).window = originalWindow;
}

// ─── Tests ─────────────────────────────────────────────────────────────

void describe('video-region-record-overlay', () => {
  beforeEach(installStubs);
  afterEach(restoreStubs);

  void it('BANNER_COPY announces recording semantics + 3-min cap', () => {
    assert.match(BANNER_COPY, /record/i);
    assert.match(BANNER_COPY, /3 minutes/i);
    assert.match(BANNER_COPY, /Audio \+ video/i);
  });

  void it('openVideoRegionRecordOverlay appends an overlay element to document.body', () => {
    openVideoRegionRecordOverlay({
      onRegionPicked() {},
      onCancel() {},
    });
    assert.strictEqual(doc.body.children.length, 1);
    assert.strictEqual(
      doc.body.children[0]!.className,
      'plos-cs-video-region-record-overlay',
    );
  });

  void it('opening a second overlay tears down the first', () => {
    const a = openVideoRegionRecordOverlay({
      onRegionPicked() {},
      onCancel() {},
    });
    const aOverlay = doc.body.children[0]!;
    void a;
    openVideoRegionRecordOverlay({
      onRegionPicked() {},
      onCancel() {},
    });
    assert.strictEqual(aOverlay.removed, true, 'first overlay removed');
    // Second overlay is now in the body.
    assert.ok(doc.body.children.length >= 1);
  });

  void it('destroy() removes the overlay element + is idempotent', () => {
    const handle = openVideoRegionRecordOverlay({
      onRegionPicked() {},
      onCancel() {},
    });
    const overlayEl = doc.body.children[0]!;
    handle.destroy();
    assert.strictEqual(overlayEl.removed, true);
    // Second call should be a no-op (idempotent).
    handle.destroy();
    assert.strictEqual(overlayEl.removed, true);
  });

  void it('Esc keypress on window fires onCancel("escape")', () => {
    let received: VideoRegionRecordCancelReason | null = null;
    openVideoRegionRecordOverlay({
      onRegionPicked() {},
      onCancel(reason) {
        received = reason;
      },
    });
    win.fire('keydown', { key: 'Escape', preventDefault() {} });
    assert.strictEqual(received, 'escape');
  });

  void it('mousedown + mouseup on a too-small rect fires onCancel("rect-too-small")', () => {
    let received: VideoRegionRecordCancelReason | null = null;
    openVideoRegionRecordOverlay({
      onRegionPicked() {},
      onCancel(reason) {
        received = reason;
      },
    });
    const overlayEl = doc.body.children[0]!;
    // Drag a 2×2 rect — well under the 8×8 minimum.
    overlayEl.fire('mousedown', {
      button: 0,
      clientX: 100,
      clientY: 100,
      preventDefault() {},
    });
    overlayEl.fire('mouseup', {
      button: 0,
      clientX: 102,
      clientY: 102,
      preventDefault() {},
    });
    assert.strictEqual(received, 'rect-too-small');
  });

  void it('mousedown + mouseup on a valid rect fires onRegionPicked', () => {
    let pickedRect: Rect | null = null;
    openVideoRegionRecordOverlay({
      onRegionPicked(rect) {
        pickedRect = rect;
      },
      onCancel() {},
    });
    const overlayEl = doc.body.children[0]!;
    overlayEl.fire('mousedown', {
      button: 0,
      clientX: 200,
      clientY: 200,
      preventDefault() {},
    });
    overlayEl.fire('mouseup', {
      button: 0,
      clientX: 600,
      clientY: 500,
      preventDefault() {},
    });
    assert.ok(pickedRect !== null, 'onRegionPicked fired');
    const r = pickedRect as unknown as Rect;
    assert.strictEqual(r.x, 200);
    assert.strictEqual(r.y, 200);
    assert.strictEqual(r.width, 400);
    assert.strictEqual(r.height, 300);
  });

  void it('mousedown on right-button (button=2) is ignored', () => {
    let pickedRect: Rect | null = null;
    let cancelReason: VideoRegionRecordCancelReason | null = null;
    openVideoRegionRecordOverlay({
      onRegionPicked(rect) {
        pickedRect = rect;
      },
      onCancel(reason) {
        cancelReason = reason;
      },
    });
    const overlayEl = doc.body.children[0]!;
    overlayEl.fire('mousedown', {
      button: 2,
      clientX: 200,
      clientY: 200,
      preventDefault() {},
    });
    overlayEl.fire('mouseup', {
      button: 2,
      clientX: 600,
      clientY: 500,
      preventDefault() {},
    });
    // Right-click should not trigger either path — the overlay preserves
    // the user's native right-click menu.
    assert.strictEqual(pickedRect, null);
    assert.strictEqual(cancelReason, null);
  });
});
