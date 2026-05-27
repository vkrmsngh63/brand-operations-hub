// W#2 P-49 Workstream 5 — node:test cases for token-counter.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { AnthropicClientLike } from './client.ts';
import {
  approximateTokensFromString,
  countMessageTokens,
} from './token-counter.ts';

function makeStubClient(returnTokens: number): {
  client: AnthropicClientLike;
  calls: Array<unknown>;
} {
  const calls: Array<unknown> = [];
  const client: AnthropicClientLike = {
    messages: {
      // Cast through unknown — the stub mirrors the field we care about.
      countTokens: (async (input: unknown) => {
        calls.push(input);
        return { input_tokens: returnTokens };
      }) as unknown as AnthropicClientLike['messages']['countTokens'],
      // Not used by token-counter; provide a throwing stub so a wrong
      // path is caught loudly.
      create: (async () => {
        throw new Error('countMessageTokens must not call messages.create');
      }) as unknown as AnthropicClientLike['messages']['create'],
    },
  };
  return { client, calls };
}

test('countMessageTokens returns input_tokens from the SDK call', async () => {
  const { client, calls } = makeStubClient(1234);
  const tokens = await countMessageTokens({
    client,
    model: 'claude-opus-4-7',
    system: 'You are a helper.',
    messages: [{ role: 'user', content: 'Hi.' }],
  });
  assert.equal(tokens, 1234);
  assert.equal(calls.length, 1);
});

test('countMessageTokens passes through the model + system + messages', async () => {
  const { client, calls } = makeStubClient(100);
  await countMessageTokens({
    client,
    model: 'claude-opus-4-6',
    system: 'sys',
    messages: [
      { role: 'user', content: 'a' },
      { role: 'assistant', content: 'b' },
    ],
  });
  const arg = calls[0] as {
    model: string;
    system: string;
    messages: Array<{ role: string; content: string }>;
  };
  assert.equal(arg.model, 'claude-opus-4-6');
  assert.equal(arg.system, 'sys');
  assert.equal(arg.messages.length, 2);
  assert.equal(arg.messages[0].role, 'user');
  assert.equal(arg.messages[1].role, 'assistant');
});

test('countMessageTokens works without a system prompt', async () => {
  const { client } = makeStubClient(42);
  const tokens = await countMessageTokens({
    client,
    model: 'claude-opus-4-7',
    messages: [{ role: 'user', content: 'Hi.' }],
  });
  assert.equal(tokens, 42);
});

test('approximateTokensFromString uses ~3.6 chars/token heuristic', () => {
  // 36 chars / 3.6 = 10 tokens
  assert.equal(approximateTokensFromString('x'.repeat(36)), 10);
  // 1 char rounds up to 1
  assert.equal(approximateTokensFromString('x'), 1);
  // empty rounds to 0
  assert.equal(approximateTokensFromString(''), 0);
});
