// Unit tests for thumbnail-extraction.ts — P-45 Build #1b (2026-05-22).
//
// Coverage strategy per CAPTURED_VIDEOS_DESIGN.md §C.18: the DOM
// dependencies (createObjectURL, <video>, canvas, toBlob) are injected
// via ThumbnailExtractionDeps. Tests pass a fake <video> that simulates
// 'loadedmetadata' + 'seeked' + 'error' events; the canvas fake returns
// a Blob synchronously to deterministically exercise the toBlob callback.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  extractFirstFrameThumbnail,
  type ThumbnailExtractionDeps,
} from './thumbnail-extraction.ts';

// ─── Fakes ─────────────────────────────────────────────────────────────

interface FakeVideo {
  listeners: Map<string, Array<() => void>>;
  muted: boolean;
  playsInline: boolean;
  preload: string;
  _src: string;
  currentTime: number;
  addEventListener(event: string, handler: () => void): void;
  set src(value: string);
  fire(event: string): void;
}

function makeFakeVideo(): FakeVideo {
  const listeners = new Map<string, Array<() => void>>();
  const v: FakeVideo = {
    listeners,
    muted: false,
    playsInline: false,
    preload: '',
    _src: '',
    currentTime: 0,
    addEventListener(event, handler) {
      const arr = listeners.get(event) ?? [];
      arr.push(handler);
      listeners.set(event, arr);
    },
    set src(value: string) {
      v._src = value;
    },
    fire(event) {
      const arr = listeners.get(event) ?? [];
      for (const h of arr) h();
    },
  };
  return v;
}

interface FakeCanvas {
  width: number;
  height: number;
  contextRequested: string;
  drawImageCalls: Array<{ x: number; y: number; w: number; h: number }>;
  toBlobMimeType: string;
  toBlobQuality: number | undefined;
  blobToReturn: Blob | null;
  getContext(type: string): CanvasRenderingContext2D | null;
  toBlob(cb: (blob: Blob | null) => void, mime: string, q?: number): void;
}

function makeFakeCanvas(blobToReturn: Blob | null = new Blob(['fake-jpeg'], {
  type: 'image/jpeg',
})): FakeCanvas {
  const drawImageCalls: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
  }> = [];
  const canvas: FakeCanvas = {
    width: 0,
    height: 0,
    contextRequested: '',
    drawImageCalls,
    toBlobMimeType: '',
    toBlobQuality: undefined,
    blobToReturn,
    getContext(type) {
      canvas.contextRequested = type;
      return {
        drawImage(
          _img: unknown,
          x: number,
          y: number,
          w: number,
          h: number,
        ) {
          drawImageCalls.push({ x, y, w, h });
        },
      } as unknown as CanvasRenderingContext2D;
    },
    toBlob(cb, mime, q) {
      canvas.toBlobMimeType = mime;
      canvas.toBlobQuality = q;
      // Fire async to mirror the real canvas.toBlob contract.
      queueMicrotask(() => {
        cb(canvas.blobToReturn);
      });
    },
  };
  return canvas;
}

interface FakeState {
  createdUrls: string[];
  revokedUrls: string[];
  video: FakeVideo;
  canvas: FakeCanvas;
}

function makeDeps(opts: {
  blobToReturn?: Blob | null;
  contextNull?: boolean;
} = {}): { deps: ThumbnailExtractionDeps; state: FakeState } {
  const video = makeFakeVideo();
  const canvas = makeFakeCanvas(opts.blobToReturn);
  if (opts.contextNull) {
    canvas.getContext = () => null;
  }
  const state: FakeState = {
    createdUrls: [],
    revokedUrls: [],
    video,
    canvas,
  };
  const deps: ThumbnailExtractionDeps = {
    createObjectURL(_blob) {
      const url = `blob:fake://${String(state.createdUrls.length)}`;
      state.createdUrls.push(url);
      return url;
    },
    revokeObjectURL(url) {
      state.revokedUrls.push(url);
    },
    createVideoElement() {
      return video as unknown as HTMLVideoElement;
    },
    createCanvas(width, height) {
      canvas.width = width;
      canvas.height = height;
      return canvas as unknown as HTMLCanvasElement;
    },
  };
  return { deps, state };
}

function blob(content = 'fake-webm', type = 'video/webm'): Blob {
  return new Blob([content], { type });
}

// ─── Tests ─────────────────────────────────────────────────────────────

void test('extractFirstFrameThumbnail — happy path returns a JPEG Blob', async () => {
  const { deps, state } = makeDeps();
  const p = extractFirstFrameThumbnail(
    { blob: blob(), width: 640, height: 480 },
    deps,
  );
  // Drive the fake event sequence: loadedmetadata → seeked.
  state.video.fire('loadedmetadata');
  state.video.fire('seeked');
  const result = await p;
  assert.ok(result instanceof Blob, 'returns a Blob');
  assert.strictEqual(result?.type, 'image/jpeg');
});

void test('extractFirstFrameThumbnail — toBlob is called with quality 0.85', async () => {
  const { deps, state } = makeDeps();
  const p = extractFirstFrameThumbnail(
    { blob: blob(), width: 640, height: 480 },
    deps,
  );
  state.video.fire('loadedmetadata');
  state.video.fire('seeked');
  await p;
  assert.strictEqual(state.canvas.toBlobMimeType, 'image/jpeg');
  assert.strictEqual(state.canvas.toBlobQuality, 0.85);
});

void test('extractFirstFrameThumbnail — canvas dimensions match input width/height', async () => {
  const { deps, state } = makeDeps();
  const p = extractFirstFrameThumbnail(
    { blob: blob(), width: 1024, height: 768 },
    deps,
  );
  state.video.fire('loadedmetadata');
  state.video.fire('seeked');
  await p;
  assert.strictEqual(state.canvas.width, 1024);
  assert.strictEqual(state.canvas.height, 768);
  assert.deepStrictEqual(state.canvas.drawImageCalls, [
    { x: 0, y: 0, w: 1024, h: 768 },
  ]);
});

void test('extractFirstFrameThumbnail — zero-byte Blob returns null synchronously', async () => {
  const { deps } = makeDeps();
  const emptyBlob = new Blob([], { type: 'video/webm' });
  const result = await extractFirstFrameThumbnail(
    { blob: emptyBlob, width: 640, height: 480 },
    deps,
  );
  assert.strictEqual(result, null);
});

void test('extractFirstFrameThumbnail — zero dimensions return null without touching DOM', async () => {
  const { deps, state } = makeDeps();
  const result = await extractFirstFrameThumbnail(
    { blob: blob(), width: 0, height: 480 },
    deps,
  );
  assert.strictEqual(result, null);
  assert.strictEqual(state.createdUrls.length, 0);
});

void test('extractFirstFrameThumbnail — video.error event returns null', async () => {
  const { deps, state } = makeDeps();
  const p = extractFirstFrameThumbnail(
    { blob: blob(), width: 640, height: 480 },
    deps,
  );
  state.video.fire('error');
  const result = await p;
  assert.strictEqual(result, null);
  // URL was minted but also revoked.
  assert.strictEqual(state.createdUrls.length, 1);
  assert.deepStrictEqual(state.revokedUrls, state.createdUrls);
});

void test('extractFirstFrameThumbnail — null 2D context returns null', async () => {
  const { deps, state } = makeDeps({ contextNull: true });
  const p = extractFirstFrameThumbnail(
    { blob: blob(), width: 640, height: 480 },
    deps,
  );
  state.video.fire('loadedmetadata');
  state.video.fire('seeked');
  const result = await p;
  assert.strictEqual(result, null);
});

void test('extractFirstFrameThumbnail — revokes object URL after success', async () => {
  const { deps, state } = makeDeps();
  const p = extractFirstFrameThumbnail(
    { blob: blob(), width: 640, height: 480 },
    deps,
  );
  state.video.fire('loadedmetadata');
  state.video.fire('seeked');
  await p;
  assert.deepStrictEqual(state.revokedUrls, state.createdUrls);
});
