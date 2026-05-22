// Unit tests for recording-indicator-overlay.ts — P-45 Build #1b
// (2026-05-22). Same fake-DOM pattern as video-region-record-overlay.test.ts.

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatElapsed,
  openRecordingIndicatorOverlay,
} from './recording-indicator-overlay.ts';

// ─── Fake DOM ─────────────────────────────────────────────────────────────

interface FakeElement {
  tagName: string;
  className: string;
  type: string;
  textContent: string;
  style: Record<string, string>;
  children: FakeElement[];
  removed: boolean;
  listeners: Map<string, Array<() => void>>;
  appendChild(child: FakeElement): void;
  remove(): void;
  addEventListener(event: string, fn: () => void): void;
  fire(event: string): void;
}

function makeFakeElement(tag = 'DIV'): FakeElement {
  const listeners = new Map<string, Array<() => void>>();
  const el: FakeElement = {
    tagName: tag.toUpperCase(),
    className: '',
    type: '',
    textContent: '',
    style: {},
    children: [],
    removed: false,
    listeners,
    appendChild(child) {
      el.children.push(child);
    },
    remove() {
      el.removed = true;
    },
    addEventListener(event, fn) {
      const arr = listeners.get(event) ?? [];
      arr.push(fn);
      listeners.set(event, arr);
    },
    fire(event) {
      const arr = listeners.get(event) ?? [];
      for (const h of arr) h();
    },
  };
  return el;
}

interface FakeDocument {
  body: FakeElement;
  createElement(tag: string): FakeElement;
}

function makeFakeDocument(): FakeDocument {
  const body = makeFakeElement('BODY');
  return {
    body,
    createElement(tag) {
      return makeFakeElement(tag);
    },
  };
}

let originalDocument: unknown;
let doc: FakeDocument;

function installStubs(): void {
  originalDocument = (globalThis as { document?: unknown }).document;
  doc = makeFakeDocument();
  (globalThis as { document: unknown }).document = doc;
}

function restoreStubs(): void {
  (globalThis as { document?: unknown }).document = originalDocument;
}

// ─── Tests ─────────────────────────────────────────────────────────────

void describe('formatElapsed', () => {
  void it('formats 0 → "0:00"', () => {
    assert.strictEqual(formatElapsed(0), '0:00');
  });
  void it('formats 8 → "0:08"', () => {
    assert.strictEqual(formatElapsed(8), '0:08');
  });
  void it('formats 65 → "1:05"', () => {
    assert.strictEqual(formatElapsed(65), '1:05');
  });
  void it('formats 180 → "3:00"', () => {
    assert.strictEqual(formatElapsed(180), '3:00');
  });
  void it('clamps negative input to 0', () => {
    assert.strictEqual(formatElapsed(-5), '0:00');
  });
});

void describe('openRecordingIndicatorOverlay', () => {
  beforeEach(installStubs);
  afterEach(restoreStubs);

  void it('initial state shows PREPARING badge + no REC dot + max-cap countdown', () => {
    openRecordingIndicatorOverlay({
      region: { x: 100, y: 100, width: 400, height: 300 },
      onStopClicked() {},
      onCancelClicked() {},
    });
    // body has 2 children — region + toolbar
    assert.strictEqual(doc.body.children.length, 2);
    const toolbar = doc.body.children[1]!;
    const badge = toolbar.children[0]!;
    const countdown = toolbar.children[1]!;
    assert.strictEqual(badge.textContent, 'PREPARING…');
    assert.match(badge.className, /preparing/);
    assert.strictEqual(countdown.textContent, '0:00 / 3:00');
  });

  void it('setRecording() switches badge to REC + drops the preparing class', () => {
    const overlay = openRecordingIndicatorOverlay({
      region: { x: 0, y: 0, width: 200, height: 200 },
      onStopClicked() {},
      onCancelClicked() {},
    });
    const region = doc.body.children[0]!;
    const toolbar = doc.body.children[1]!;
    const badge = toolbar.children[0]!;
    overlay.setRecording();
    assert.strictEqual(badge.textContent, 'REC ●');
    assert.doesNotMatch(badge.className, /preparing/);
    assert.match(region.className, /recording/);
    assert.doesNotMatch(region.className, /preparing/);
  });

  void it('setElapsed updates the countdown text', () => {
    const overlay = openRecordingIndicatorOverlay({
      region: { x: 0, y: 0, width: 200, height: 200 },
      onStopClicked() {},
      onCancelClicked() {},
      maxDurationSeconds: 180,
    });
    const countdown = doc.body.children[1]!.children[1]!;
    overlay.setElapsed(8);
    assert.strictEqual(countdown.textContent, '0:08 / 3:00');
    overlay.setElapsed(125);
    assert.strictEqual(countdown.textContent, '2:05 / 3:00');
  });

  void it('Stop button click fires onStopClicked', () => {
    let stopFired = 0;
    openRecordingIndicatorOverlay({
      region: { x: 0, y: 0, width: 200, height: 200 },
      onStopClicked() {
        stopFired += 1;
      },
      onCancelClicked() {},
    });
    const toolbar = doc.body.children[1]!;
    const stopBtn = toolbar.children[2]!;
    stopBtn.fire('click');
    assert.strictEqual(stopFired, 1);
  });

  void it('Cancel button click fires onCancelClicked', () => {
    let cancelFired = 0;
    openRecordingIndicatorOverlay({
      region: { x: 0, y: 0, width: 200, height: 200 },
      onStopClicked() {},
      onCancelClicked() {
        cancelFired += 1;
      },
    });
    const toolbar = doc.body.children[1]!;
    const cancelBtn = toolbar.children[3]!;
    cancelBtn.fire('click');
    assert.strictEqual(cancelFired, 1);
  });

  void it('destroy() removes both DOM elements + is idempotent', () => {
    const overlay = openRecordingIndicatorOverlay({
      region: { x: 0, y: 0, width: 200, height: 200 },
      onStopClicked() {},
      onCancelClicked() {},
    });
    const region = doc.body.children[0]!;
    const toolbar = doc.body.children[1]!;
    overlay.destroy();
    assert.strictEqual(region.removed, true);
    assert.strictEqual(toolbar.removed, true);
    // Idempotent — second destroy() is a no-op (no throw).
    overlay.destroy();
  });

  void it('setRecording / setElapsed after destroy() are no-ops', () => {
    const overlay = openRecordingIndicatorOverlay({
      region: { x: 0, y: 0, width: 200, height: 200 },
      onStopClicked() {},
      onCancelClicked() {},
    });
    overlay.destroy();
    // These calls should not throw.
    overlay.setRecording();
    overlay.setElapsed(10);
  });

  void it('opening a second indicator tears down the first', () => {
    const a = openRecordingIndicatorOverlay({
      region: { x: 0, y: 0, width: 200, height: 200 },
      onStopClicked() {},
      onCancelClicked() {},
    });
    void a;
    const aRegion = doc.body.children[0]!;
    const aToolbar = doc.body.children[1]!;
    openRecordingIndicatorOverlay({
      region: { x: 50, y: 50, width: 300, height: 200 },
      onStopClicked() {},
      onCancelClicked() {},
    });
    assert.strictEqual(aRegion.removed, true);
    assert.strictEqual(aToolbar.removed, true);
  });
});
