/**
 * Tests for Step 3 intent enumeration (prompt builder + parser + validators).
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/variant-b/intent-enumeration.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { assembleRulebook } from './rulebook-assembly.ts';
import {
  buildIntentEnumerationPrompt,
  intentPromptPayloadSize,
  parseIntentEnumeration,
} from './intent-enumeration.ts';
import type { CarrierCluster } from './types.ts';

const RB = assembleRulebook([]); // universal floor
const RB_NICHE = assembleRulebook(
  [{ type: 'value', scope: 'niche:knee', status: 'active', version: 2, payload: { kind: 'condition-term', term: 'bursitis' } }],
  { nicheSlug: 'knee' },
);

function carrier(over: Partial<CarrierCluster> = {}): CarrierCluster {
  return {
    id: 'c1',
    representative: 'knee swelling',
    members: [{ keyword: 'knee swelling', volume: 1200 }],
    summedVolume: 1200,
    normalizedKey: 'knee swelling',
    ...over,
  };
}

// ---- prompt builder ----

test('prompt is deterministic and includes the keyword, volume, and descriptor menu', () => {
  const p1 = buildIntentEnumerationPrompt(carrier(), RB);
  const p2 = buildIntentEnumerationPrompt(carrier(), RB);
  assert.equal(p1, p2);
  assert.match(p1, /knee swelling/);
  assert.match(p1, /1200/);
  assert.match(p1, /subject_type/);
  assert.match(p1, /primary_action/);
  assert.match(p1, /strict JSON/i);
});

test('prompt instructs high-recall enumeration (over-listing fine, missed intent unrecoverable)', () => {
  const p = buildIntentEnumerationPrompt(carrier(), RB);
  assert.match(p, /EVERY plausible/);
  assert.match(p, /cannot be recovered/i);
});

test('payload flatness: prompt size depends only on the menu + one keyword, not on other carriers', () => {
  // two carriers with same-length keywords ⇒ near-constant size; crucially the
  // prompt never references any carrier other than the one passed in.
  const a = buildIntentEnumerationPrompt(carrier({ id: 'a', representative: 'knee swelling' }), RB);
  const b = buildIntentEnumerationPrompt(carrier({ id: 'b', representative: 'shin swelling' }), RB); // same length
  assert.equal(a.length, b.length, 'equal-length keywords ⇒ equal prompt size: nothing else varies');
  assert.ok(!a.includes('shin'), 'prompt for carrier a must not mention carrier b');
  assert.equal(intentPromptPayloadSize(carrier(), RB), a.length); // size helper agrees with the built prompt
});

test('niche prompt mentions the niche and notes the condition term was stripped', () => {
  const p = buildIntentEnumerationPrompt(carrier(), RB_NICHE);
  assert.match(p, /niche is "knee"/);
  assert.match(p, /bursitis/);
});

// ---- parser ----

test('parses valid JSON and computes searchVolume (full reach) + multiplicity', () => {
  const raw = JSON.stringify({
    intents: [
      { profile: { subject_type: 'symptom', primary_action: 'identify-symptom', summary: 'is this swelling normal' }, clarity: 0.9, confidence: 0.8 },
      { profile: { subject_type: 'cause/trigger', primary_action: 'find-cause', summary: 'why is my knee swollen' }, clarity: 0.7, confidence: 0.7 },
    ],
  });
  const res = parseIntentEnumeration(raw, carrier(), RB);
  assert.ok(res.ok);
  assert.equal(res.intents.length, 2);
  assert.equal(res.flags.length, 0);
  assert.equal(res.intents[0].searchVolume, 1200, 'full carrier reach attributed to each intent');
  assert.equal(res.intents[0].multiplicity, 2);
  assert.equal(res.intents[1].multiplicity, 2);
  assert.equal(res.intents[0].id, 'c1-i0');
});

test('strips markdown code fences before parsing', () => {
  const raw = '```json\n{"intents":[{"profile":{"subject_type":"symptom","summary":"x"}}]}\n```';
  const res = parseIntentEnumeration(raw, carrier(), RB);
  assert.ok(res.ok);
  assert.equal(res.intents.length, 1);
});

test('invalid JSON ⇒ ok=false with an invalid-json flag, no intents', () => {
  const res = parseIntentEnumeration('not json at all', carrier(), RB);
  assert.equal(res.ok, false);
  assert.equal(res.intents.length, 0);
  assert.equal(res.flags[0].kind, 'invalid-json');
});

test('missing intents array ⇒ schema-violation', () => {
  const res = parseIntentEnumeration('{"foo":1}', carrier(), RB);
  assert.equal(res.ok, false);
  assert.equal(res.flags[0].kind, 'schema-violation');
});

test('out-of-vocab value is FLAGGED but the intent is KEPT (over-enumeration never deleted)', () => {
  const raw = JSON.stringify({ intents: [{ profile: { subject_type: 'made-up-value', summary: 'x' } }] });
  const res = parseIntentEnumeration(raw, carrier(), RB);
  assert.ok(res.ok);
  assert.equal(res.intents.length, 1, 'intent retained despite bad vocab');
  assert.ok(res.flags.some((f) => f.kind === 'out-of-vocab-value' && f.descriptorKey === 'subject_type'));
});

test('unknown descriptor key is flagged but intent kept', () => {
  const raw = JSON.stringify({ intents: [{ profile: { not_a_descriptor: 'z', summary: 'x' } }] });
  const res = parseIntentEnumeration(raw, carrier(), RB);
  assert.equal(res.intents.length, 1);
  assert.ok(res.flags.some((f) => f.kind === 'unknown-descriptor'));
});

test('missing summary is flagged', () => {
  const raw = JSON.stringify({ intents: [{ profile: { subject_type: 'symptom' } }] });
  const res = parseIntentEnumeration(raw, carrier(), RB);
  assert.ok(res.flags.some((f) => f.kind === 'missing-summary'));
});

test('open-vocab descriptors accept free text without an out-of-vocab flag', () => {
  const raw = JSON.stringify({ intents: [{ profile: { body_location: 'left knee', named_entity: 'ibuprofen', summary: 'x' } }] });
  const res = parseIntentEnumeration(raw, carrier(), RB);
  assert.ok(!res.flags.some((f) => f.kind === 'out-of-vocab-value'));
});

test('under-enumeration flagged for a non-degenerate carrier with zero intents; not for a flagged carrier', () => {
  const empty = JSON.stringify({ intents: [] });
  const normal = parseIntentEnumeration(empty, carrier(), RB);
  assert.ok(normal.flags.some((f) => f.kind === 'under-enumeration'));

  const degenerate = parseIntentEnumeration(empty, carrier({ flagged: true }), RB);
  assert.ok(!degenerate.flags.some((f) => f.kind === 'under-enumeration'));
});

test('clarity/confidence are clamped to 0..1 and undefined when non-numeric', () => {
  const raw = JSON.stringify({ intents: [{ profile: { subject_type: 'symptom', summary: 'x' }, clarity: 1.7, confidence: 'high' }] });
  const res = parseIntentEnumeration(raw, carrier(), RB);
  assert.equal(res.intents[0].clarity, 1);
  assert.equal(res.intents[0].confidence, undefined);
});
