// Tests for the region-screenshot pure-logic helpers (session 6 2026-05-13).
// Mirrors captured-image-validation.test.ts shape so the read-across is fast.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  MIN_REGION_DIMENSION_PX,
  clampRectToViewport,
  computeCropParams,
  isRectTooSmall,
  parseDataUrl,
  rectFromDrag,
  rectTouchesViewportEdge,
} from './region-screenshot.ts';

test('rectFromDrag — top-left to bottom-right produces positive rect', () => {
  const result = rectFromDrag({ x: 10, y: 20 }, { x: 110, y: 220 });
  assert.deepEqual(result, { x: 10, y: 20, width: 100, height: 200 });
});

test('rectFromDrag — bottom-right to top-left normalizes coords', () => {
  const result = rectFromDrag({ x: 110, y: 220 }, { x: 10, y: 20 });
  assert.deepEqual(result, { x: 10, y: 20, width: 100, height: 200 });
});

test('rectFromDrag — top-right to bottom-left normalizes coords', () => {
  const result = rectFromDrag({ x: 110, y: 20 }, { x: 10, y: 220 });
  assert.deepEqual(result, { x: 10, y: 20, width: 100, height: 200 });
});

test('rectFromDrag — same point produces zero-width-and-height rect', () => {
  const result = rectFromDrag({ x: 50, y: 50 }, { x: 50, y: 50 });
  assert.deepEqual(result, { x: 50, y: 50, width: 0, height: 0 });
});

test('clampRectToViewport — fully inside viewport passes through unchanged', () => {
  const result = clampRectToViewport(
    { x: 10, y: 20, width: 100, height: 200 },
    { width: 1024, height: 768 },
  );
  assert.deepEqual(result, { x: 10, y: 20, width: 100, height: 200 });
});

test('clampRectToViewport — extending past right + bottom clips to edge', () => {
  const result = clampRectToViewport(
    { x: 900, y: 700, width: 200, height: 200 },
    { width: 1024, height: 768 },
  );
  assert.deepEqual(result, { x: 900, y: 700, width: 124, height: 68 });
});

test('clampRectToViewport — starting in negative space clips to origin', () => {
  const result = clampRectToViewport(
    { x: -50, y: -100, width: 200, height: 300 },
    { width: 1024, height: 768 },
  );
  assert.deepEqual(result, { x: 0, y: 0, width: 150, height: 200 });
});

test('clampRectToViewport — entirely outside (right of viewport) returns null', () => {
  const result = clampRectToViewport(
    { x: 2000, y: 100, width: 50, height: 50 },
    { width: 1024, height: 768 },
  );
  assert.equal(result, null);
});

test('clampRectToViewport — entirely outside (above viewport) returns null', () => {
  const result = clampRectToViewport(
    { x: 100, y: -500, width: 50, height: 50 },
    { width: 1024, height: 768 },
  );
  assert.equal(result, null);
});

test('rectTouchesViewportEdge — fully inside rect does not touch', () => {
  const touches = rectTouchesViewportEdge(
    { x: 100, y: 100, width: 50, height: 50 },
    { width: 1024, height: 768 },
  );
  assert.equal(touches, false);
});

test('rectTouchesViewportEdge — rect at top-left corner touches', () => {
  const touches = rectTouchesViewportEdge(
    { x: 0, y: 0, width: 50, height: 50 },
    { width: 1024, height: 768 },
  );
  assert.equal(touches, true);
});

test('rectTouchesViewportEdge — rect at bottom-right corner touches', () => {
  const touches = rectTouchesViewportEdge(
    { x: 900, y: 700, width: 124, height: 68 },
    { width: 1024, height: 768 },
  );
  assert.equal(touches, true);
});

test('rectTouchesViewportEdge — within threshold counts as touching', () => {
  const touches = rectTouchesViewportEdge(
    { x: 1, y: 100, width: 50, height: 50 },
    { width: 1024, height: 768 },
    2,
  );
  assert.equal(touches, true);
});

test('isRectTooSmall — accidental click (0×0) is too small', () => {
  assert.equal(isRectTooSmall({ x: 50, y: 50, width: 0, height: 0 }), true);
});

test('isRectTooSmall — just below the threshold is too small', () => {
  assert.equal(
    isRectTooSmall({
      x: 50,
      y: 50,
      width: MIN_REGION_DIMENSION_PX - 1,
      height: MIN_REGION_DIMENSION_PX - 1,
    }),
    true,
  );
});

test('isRectTooSmall — exactly at the threshold is allowed', () => {
  assert.equal(
    isRectTooSmall({
      x: 50,
      y: 50,
      width: MIN_REGION_DIMENSION_PX,
      height: MIN_REGION_DIMENSION_PX,
    }),
    false,
  );
});

test('isRectTooSmall — narrow but tall is too small (width below threshold)', () => {
  assert.equal(
    isRectTooSmall({ x: 50, y: 50, width: 2, height: 500 }),
    true,
  );
});

test('computeCropParams — DPR=1 maps CSS rect 1:1 to device pixels', () => {
  const result = computeCropParams(
    { x: 100, y: 200, width: 300, height: 400 },
    1,
  );
  assert.deepEqual(result, {
    sourceX: 100,
    sourceY: 200,
    sourceWidth: 300,
    sourceHeight: 400,
    destWidth: 300,
    destHeight: 400,
  });
});

test('computeCropParams — DPR=2 (retina) doubles all coords', () => {
  const result = computeCropParams(
    { x: 100, y: 200, width: 300, height: 400 },
    2,
  );
  assert.deepEqual(result, {
    sourceX: 200,
    sourceY: 400,
    sourceWidth: 600,
    sourceHeight: 800,
    destWidth: 600,
    destHeight: 800,
  });
});

test('computeCropParams — fractional DPR rounds to integer pixels', () => {
  const result = computeCropParams(
    { x: 100, y: 200, width: 300, height: 400 },
    1.5,
  );
  assert.deepEqual(result, {
    sourceX: 150,
    sourceY: 300,
    sourceWidth: 450,
    sourceHeight: 600,
    destWidth: 450,
    destHeight: 600,
  });
});

test('computeCropParams — zero or negative DPR falls back to 1', () => {
  const result = computeCropParams(
    { x: 10, y: 20, width: 30, height: 40 },
    0,
  );
  assert.deepEqual(result.sourceX, 10);
  assert.deepEqual(result.sourceWidth, 30);
});

test('parseDataUrl — happy path PNG decodes correctly', () => {
  // 1x1 transparent PNG (smallest valid PNG fixture)
  const dataUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const result = parseDataUrl(dataUrl);
  assert.equal(result.mimeType, 'image/png');
  // Decoded byte length should be > 0 and contain PNG magic bytes — exact
  // length depends on the fixture but PNG magic header is the invariant.
  assert.ok(result.bytes.length > 8, 'decoded bytes should include at least the PNG header');
  // PNG magic bytes 0x89 0x50 0x4E 0x47
  assert.equal(result.bytes[0], 0x89);
  assert.equal(result.bytes[1], 0x50);
  assert.equal(result.bytes[2], 0x4e);
  assert.equal(result.bytes[3], 0x47);
});

test('parseDataUrl — JPEG MIME normalizes to lowercase', () => {
  const dataUrl = 'data:Image/JPEG;base64,/9j/4AAQ';
  const result = parseDataUrl(dataUrl);
  assert.equal(result.mimeType, 'image/jpeg');
});

test('parseDataUrl — not a data URL throws', () => {
  assert.throws(
    () => parseDataUrl('https://example.com/foo.png'),
    /not a base64-encoded data URL/,
  );
});

test('parseDataUrl — non-base64 data URL throws', () => {
  assert.throws(
    () => parseDataUrl('data:image/png,iVBORw'),
    /not a base64-encoded data URL/,
  );
});
