import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldCloneFromAi1, keywordsMissingFromVb } from './keyword-sync.ts';

test('shouldCloneFromAi1: clone only when AI 2 empty and AI 1 has keywords', () => {
  assert.equal(shouldCloneFromAi1(0, 5), true);
  assert.equal(shouldCloneFromAi1(0, 0), false); // AI 1 empty — nothing to copy
  assert.equal(shouldCloneFromAi1(3, 5), false); // AI 2 already has its own set
  assert.equal(shouldCloneFromAi1(3, 0), false);
});

test('keywordsMissingFromVb: returns AI 1 keywords absent from AI 2', () => {
  const ai1 = [
    { keyword: 'knee pain', volume: 100 },
    { keyword: 'knee brace', volume: 50 },
    { keyword: 'knee surgery', volume: 10 },
  ];
  const vb = [{ keyword: 'knee pain', volume: 100 }];
  const missing = keywordsMissingFromVb(ai1, vb);
  assert.deepEqual(missing.map(k => k.keyword), ['knee brace', 'knee surgery']);
});

test('keywordsMissingFromVb: empty when AI 2 already has everything', () => {
  const ai1 = [{ keyword: 'a', volume: 1 }, { keyword: 'b', volume: 2 }];
  const vb = [{ keyword: 'a', volume: 1 }, { keyword: 'b', volume: 2 }];
  assert.deepEqual(keywordsMissingFromVb(ai1, vb), []);
});

test('keywordsMissingFromVb: never removes — AI 2 extras are ignored', () => {
  const ai1 = [{ keyword: 'a', volume: 1 }];
  const vb = [{ keyword: 'a', volume: 1 }, { keyword: 'vb-only', volume: 9 }];
  assert.deepEqual(keywordsMissingFromVb(ai1, vb), []);
});

test('keywordsMissingFromVb: duplicate AI 1 keywords collapse to one', () => {
  const ai1 = [
    { keyword: 'dup', volume: 1 },
    { keyword: 'dup', volume: 1 },
    { keyword: 'new', volume: 2 },
  ];
  const vb: { keyword: string; volume: number }[] = [];
  assert.deepEqual(keywordsMissingFromVb(ai1, vb).map(k => k.keyword), ['dup', 'new']);
});
