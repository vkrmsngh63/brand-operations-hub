/**
 * Tests for the central versioned prompt registry: Lessons-marker hook, shared
 * rulebook-context injection, composed task/version/CLR header, and the flat-
 * payload guarantee (a prompt never takes the tree).
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/variant-b/prompts.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  LESSONS_MARKER,
  lessonsBlock,
  renderRulebookContext,
  composePrompt,
  PROMPTS,
  intentEnumerationTemplate,
  topicTitleTemplate,
} from './prompts.ts';
import { assembleRulebook } from './rulebook-assembly.ts';
import { INTENT_ENUMERATION_PROMPT_VERSION } from './intent-enumeration.ts';
import type { CarrierCluster } from './types.ts';

const RB = assembleRulebook([], {});

const carrier: CarrierCluster = {
  id: 'c1',
  representative: 'knee pain relief',
  members: [{ keyword: 'knee pain relief', volume: 500 }],
  summedVolume: 500,
  normalizedKey: 'knee pain relief',
};

// ---- lessons marker ----

test('lessonsBlock always carries the reserved marker line', () => {
  const empty = lessonsBlock();
  assert.ok(empty.includes(LESSONS_MARKER));
  assert.ok(empty.includes('(none yet)'));

  const withLessons = lessonsBlock(['prefer searcher voice', 'keep severity separate']);
  assert.ok(withLessons.includes('- prefer searcher voice'));
  assert.ok(withLessons.includes('- keep severity separate'));
});

// ---- shared context ----

test('renderRulebookContext injects the descriptor menu and the funnel zones', () => {
  const ctx = renderRulebookContext(RB);
  assert.ok(ctx.includes('subject_type'), 'descriptor menu present');
  assert.ok(ctx.includes('awareness'), 'funnel zones present');
  assert.ok(ctx.includes(`RULEBOOK v${RB.clrVersion}`), 'pinned CLR version present');
});

// ---- compose ----

test('composePrompt stamps a task/version/CLR header and appends the Lessons block', () => {
  const r = composePrompt('demo', 7, RB, 'BODY-TEXT');
  assert.ok(r.prompt.startsWith(`[task=demo v7 clr=${RB.clrVersion}]`));
  assert.ok(r.prompt.includes('BODY-TEXT'));
  assert.ok(r.prompt.includes(LESSONS_MARKER));
  assert.equal(r.payloadSize, r.prompt.length);
  assert.equal(r.clrVersion, RB.clrVersion);
});

// ---- registry templates ----

test('intent-enumeration template wraps the builder and carries version + CLR + Lessons', () => {
  const r = intentEnumerationTemplate.render(RB, { carrier });
  assert.equal(r.task, 'intent-enumeration');
  assert.equal(r.version, INTENT_ENUMERATION_PROMPT_VERSION);
  assert.equal(r.clrVersion, RB.clrVersion);
  assert.ok(r.prompt.includes('knee pain relief'), 'the analysed keyword is present');
  assert.ok(r.prompt.includes('subject_type'), 'descriptor menu injected');
  assert.ok(r.prompt.includes(LESSONS_MARKER), 'Lessons hook present');
});

test('topic-title template injects rulebook context + the profile and asks for voice', () => {
  const r = topicTitleTemplate.render(RB, { profile: { subject_type: 'symptom', summary: 's' } });
  assert.equal(r.task, 'topic-title');
  assert.ok(r.prompt.includes('"subject_type":"symptom"'));
  assert.ok(/searcher voice/i.test(r.prompt));
  assert.ok(r.prompt.includes('FUNNEL ZONES'));
});

test('the registry exposes both task templates', () => {
  assert.equal(PROMPTS['intent-enumeration'].task, 'intent-enumeration');
  assert.equal(PROMPTS['topic-title'].task, 'topic-title');
});

// ---- flat payload + determinism ----

test('prompt rendering is deterministic and takes no tree parameter (flat payload)', () => {
  const a = intentEnumerationTemplate.render(RB, { carrier });
  const b = intentEnumerationTemplate.render(RB, { carrier });
  assert.equal(a.prompt, b.prompt);
  // injected lessons grow the payload; nothing else can (no topics/tree arg exists).
  const one = intentEnumerationTemplate.render(RB, { carrier }, ['lesson one']);
  const two = intentEnumerationTemplate.render(RB, { carrier }, ['lesson one', 'lesson two']);
  assert.ok(one.prompt.includes('- lesson one'));
  assert.ok(two.payloadSize > one.payloadSize, 'payload scales with the number of lessons only');
});
