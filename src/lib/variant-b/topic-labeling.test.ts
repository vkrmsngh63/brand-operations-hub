/**
 * Tests for Step 4 topic labeling (deterministic fingerprint, title, markers,
 * contrastive boundary).
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/variant-b/topic-labeling.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  canonicalizeProfile,
  computeFingerprint,
  buildSearcherTitle,
  deriveSpecificityMarkers,
  deriveBoundary,
  labelIntent,
  profilesIdenticalForMerge,
} from './topic-labeling.ts';
import type { DescriptorProfile, IntentInstance } from './types.ts';

function profile(over: Partial<DescriptorProfile> = {}): DescriptorProfile {
  return { summary: 'a summary', ...over };
}

function intent(p: DescriptorProfile): IntentInstance {
  return { id: 'c1-i0', carrierId: 'c1', sourceKeyword: 'k', profile: p, searchVolume: 100, multiplicity: 1 };
}

// ---- fingerprint ----

test('fingerprint is deterministic and independent of object key insertion order', () => {
  const a: DescriptorProfile = { primary_action: 'find-cause', subject_type: 'cause/trigger', summary: 's' };
  const b: DescriptorProfile = { summary: 's', subject_type: 'cause/trigger', primary_action: 'find-cause' };
  assert.equal(computeFingerprint(a), computeFingerprint(b));
});

test('fingerprint ignores the free-text summary', () => {
  const a = profile({ subject_type: 'symptom', summary: 'one' });
  const b = profile({ subject_type: 'symptom', summary: 'totally different summary' });
  assert.equal(computeFingerprint(a), computeFingerprint(b));
});

test('different profiles produce different fingerprints', () => {
  assert.notEqual(
    computeFingerprint(profile({ subject_type: 'symptom' })),
    computeFingerprint(profile({ subject_type: 'cause/trigger' })),
  );
});

test('a profile with no descriptor axes fingerprints as "unspecified"', () => {
  assert.equal(computeFingerprint(profile()), 'unspecified');
});

test('fingerprint axes are ordered by descriptor declaration order, not input order', () => {
  // subject_type is declared before primary_action ⇒ appears first regardless
  const fp = computeFingerprint({ primary_action: 'find-cause', subject_type: 'cause/trigger', summary: 's' });
  assert.match(fp, /^subject_type=cause\/trigger;primary_action=find-cause$/);
});

// ---- canonicalization ----

test('canonicalizeProfile normalizes case + whitespace and drops empty axes', () => {
  const c = canonicalizeProfile({ subject_type: '  SYMPTOM  ', body_location: 'Left   Knee', primary_action: '', summary: '  Hi ' });
  assert.equal(c.subject_type, 'symptom');
  assert.equal(c.body_location, 'left knee');
  assert.equal(c.primary_action, undefined);
  assert.equal(c.summary, 'hi');
});

// ---- title ----

test('title is human-readable and non-empty for a normal profile', () => {
  const t = buildSearcherTitle(profile({ primary_action: 'find-cause', subject_type: 'cause/trigger', body_location: 'knee' }));
  assert.match(t, /find cause/);
  assert.match(t, /\(knee\)/);
});

test('title falls back to summary when no descriptors, then to fingerprint', () => {
  assert.equal(buildSearcherTitle(profile({ summary: 'just a summary' })), 'just a summary');
  assert.equal(buildSearcherTitle({ summary: '' }), 'unspecified');
});

// ---- specificity markers ----

test('specificity markers flag laddered axes and include situational qualifiers', () => {
  const markers = deriveSpecificityMarkers(profile({ named_entity: 'ibuprofen', severity: 'mild', subject_type: 'treatment' }));
  const entity = markers.find((m) => m.descriptorKey === 'named_entity');
  const sev = markers.find((m) => m.descriptorKey === 'severity');
  assert.ok(entity?.laddered, 'named_entity is laddered');
  assert.ok(sev && !sev.laddered, 'severity is a situational (non-laddered) qualifier');
  // subject_type is not a specificity axis ⇒ not a marker
  assert.ok(!markers.some((m) => m.descriptorKey === 'subject_type'));
});

// ---- boundary ----

test('boundary belongs lists defining axes; excludes the sibling severity values', () => {
  const { belongs, excludes } = deriveBoundary(profile({ severity: 'mild', subject_type: 'symptom' }));
  assert.ok(belongs.includes('severity=mild'));
  assert.ok(belongs.includes('subject_type=symptom'));
  assert.ok(excludes.includes('moderate'));
  assert.ok(excludes.includes('severe'));
  assert.ok(!excludes.includes('mild'), 'the chosen value is not in excludes');
});

test('boundary excludes is empty when no controlled boundary axis is present', () => {
  const { excludes } = deriveBoundary(profile({ body_location: 'knee' })); // open vocab only
  assert.deepEqual(excludes, []);
});

// ---- compose + merge equality ----

test('labelIntent composes fingerprint, title, canonical profile, markers, boundary', () => {
  const label = labelIntent(intent(profile({ subject_type: 'symptom', severity: 'mild' })));
  assert.ok(label.fingerprint.length > 0);
  assert.ok(label.title.length > 0);
  assert.equal(label.canonicalProfile.subject_type, 'symptom');
  assert.ok(label.specificityMarkers.some((m) => m.descriptorKey === 'severity'));
  assert.ok(label.boundary.belongs.length > 0);
});

test('profilesIdenticalForMerge: same axes merge, differing axes do not, summary is ignored', () => {
  const a = profile({ subject_type: 'symptom', summary: 'x' });
  const b = profile({ subject_type: 'symptom', summary: 'y' });
  const c = profile({ subject_type: 'cause/trigger', summary: 'x' });
  assert.ok(profilesIdenticalForMerge(a, b));
  assert.ok(!profilesIdenticalForMerge(a, c));
});
