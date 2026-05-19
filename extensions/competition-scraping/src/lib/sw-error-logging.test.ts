// Tests for the SW global-error logging helpers (P-16).
//
// Run via the workspace's existing `npm test` invocation:
//   npx node --test --experimental-strip-types src/lib/sw-error-logging.test.ts

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGlobalErrorPayload,
  logGlobalError,
  type GlobalErrorPayload,
} from './sw-error-logging.ts';

describe('buildGlobalErrorPayload', () => {
  it('extracts name/message/stack from a real Error instance', () => {
    const err = new TypeError('Failed to fetch');
    const payload = buildGlobalErrorPayload(err, 'sw-unhandledrejection');
    assert.equal(payload.context, 'sw-unhandledrejection');
    assert.equal(payload.name, 'TypeError');
    assert.equal(payload.message, 'Failed to fetch');
    assert.ok(typeof payload.stack === 'string' && payload.stack.length > 0);
    assert.ok(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(payload.timestamp));
  });

  it('handles a thrown non-Error string', () => {
    const payload = buildGlobalErrorPayload('plain string thrown', 'sw-error');
    assert.equal(payload.name, 'NonErrorString');
    assert.equal(payload.message, 'plain string thrown');
    assert.equal(payload.stack, null);
    assert.equal(payload.context, 'sw-error');
  });

  it('handles null and undefined inputs without throwing', () => {
    const nullPayload = buildGlobalErrorPayload(null, 'sw-error');
    assert.equal(nullPayload.name, 'NonErrorNullish');
    assert.equal(nullPayload.message, 'null');
    assert.equal(nullPayload.stack, null);

    const undefPayload = buildGlobalErrorPayload(undefined, 'sw-error');
    assert.equal(undefPayload.name, 'NonErrorNullish');
    assert.equal(undefPayload.message, 'undefined');
    assert.equal(undefPayload.stack, null);
  });

  it('extracts fields from a plain object with name/message/stack', () => {
    const fakeRejection = {
      name: 'AuthRetryableFetchError',
      message: 'Network request failed',
      stack: 'AuthRetryableFetchError: Network request failed\n  at refresh',
    };
    const payload = buildGlobalErrorPayload(fakeRejection, 'sw-unhandledrejection');
    assert.equal(payload.name, 'AuthRetryableFetchError');
    assert.equal(payload.message, 'Network request failed');
    assert.equal(
      payload.stack,
      'AuthRetryableFetchError: Network request failed\n  at refresh',
    );
  });

  it('falls back to JSON serialization for an object without a message', () => {
    const payload = buildGlobalErrorPayload({ code: 503, detail: 'upstream' }, 'sw-error');
    assert.equal(payload.name, 'NonErrorObject');
    assert.equal(payload.message, '{"code":503,"detail":"upstream"}');
    assert.equal(payload.stack, null);
  });
});

describe('logGlobalError', () => {
  it('passes the built payload through the injected logger', () => {
    const calls: GlobalErrorPayload[] = [];
    const err = new Error('boom');
    logGlobalError(err, 'sw-unhandledrejection', (payload) => {
      calls.push(payload);
    });
    assert.equal(calls.length, 1);
    const only = calls[0];
    assert.ok(only !== undefined);
    assert.equal(only.context, 'sw-unhandledrejection');
    assert.equal(only.message, 'boom');
  });
});
