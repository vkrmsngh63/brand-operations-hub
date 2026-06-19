/**
 * Variant B ("AI 2") — Step 4: topic labeling (spec §3 Step 4).
 *
 * Pure + deterministic. No AI, no DB, no React. Turns one enumerated
 * `IntentInstance` into a `TopicLabel`:
 *   - a canonical descriptor profile (normalized values),
 *   - a deterministic `fingerprint` (the merge-bucket key + the value stored in
 *     `CanvasNode.intentFingerprint`) — same profile ⇒ same fingerprint,
 *   - a searcher-centric neutral `title`,
 *   - `specificityMarkers` (the laddered/situational axes that make this intent
 *     specific — consumed by hierarchy nesting in Step 6),
 *   - a contrastive `boundary` (what the topic belongs-to vs the sibling values
 *     it excludes), so adjacent topics are distinguishable.
 *
 * Determinism matters: conservative-merge (Step 5) buckets by `fingerprint` and
 * then merges iff two canonical profiles are identical, so labeling must be a
 * stable function of the profile alone.
 */

import type { AssembledRulebook } from './rulebook-assembly.ts';
import type { DescriptorProfile, IntentInstance } from './types.ts';
import { DESCRIPTORS } from './rulebook.ts';

/** Descriptor keys that are part of the matchable profile (everything except the
 *  free-text meta `summary`), in canonical (DESCRIPTORS-declared) order. */
const PROFILE_KEYS: string[] = DESCRIPTORS.filter((d) => d.group !== 'meta').map((d) => d.key);

/** Axes that make an intent more specific than its parent (Step 6 nesting). The
 *  laddered descriptors first, then the situational qualifiers. */
const SPECIFICITY_AXES: string[] = [
  'named_entity', 'body_location', 'approach',
  'severity', 'onset_duration', 'demographic_context', 'trigger_context',
];

export interface SpecificityMarker {
  descriptorKey: string;
  value: string;
  /** true for the general→specific laddered descriptors (rulebook §4). */
  laddered: boolean;
}

export interface TopicLabel {
  /** deterministic canonical signature; merge-bucket key + intentFingerprint. */
  fingerprint: string;
  /** searcher-centric neutral title (→ CanvasNode.title). */
  title: string;
  /** normalized profile (the basis for strict merge equality). */
  canonicalProfile: DescriptorProfile;
  specificityMarkers: SpecificityMarker[];
  /** contrastive boundary: defining axes vs sibling values it excludes. */
  boundary: { belongs: string[]; excludes: string[] };
}

/** Normalize a single value: trim, collapse whitespace, lowercase. */
function norm(v: unknown): string {
  return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').toLowerCase() : '';
}

/**
 * Canonicalize a profile: normalized values for every present non-empty axis,
 * plus a normalized summary. Open-vocab values get whitespace/case normalization;
 * controlled values are already from the menu but normalized for safety.
 */
export function canonicalizeProfile(profile: DescriptorProfile): DescriptorProfile {
  const out: DescriptorProfile = { summary: norm(profile.summary) };
  for (const key of PROFILE_KEYS) {
    const v = norm((profile as unknown as Record<string, unknown>)[key]);
    if (v) (out as unknown as Record<string, unknown>)[key] = v;
  }
  return out;
}

/** The meaningful (present, non-empty) profile axes in canonical order. */
function meaningfulAxes(canonical: DescriptorProfile): Array<{ key: string; value: string }> {
  const axes: Array<{ key: string; value: string }> = [];
  for (const key of PROFILE_KEYS) {
    const v = (canonical as unknown as Record<string, unknown>)[key];
    if (typeof v === 'string' && v) axes.push({ key, value: v });
  }
  return axes;
}

/**
 * Deterministic canonical fingerprint from the profile. Order-stable (sorted by
 * the descriptor declaration order), so identical profiles always collide and
 * different profiles (almost always) don't. Excludes the free-text summary.
 */
export function computeFingerprint(profile: DescriptorProfile): string {
  const canonical = canonicalizeProfile(profile);
  const axes = meaningfulAxes(canonical);
  if (axes.length === 0) return 'unspecified';
  return axes.map((a) => `${a.key}=${a.value}`).join(';');
}

/** A readable, neutral, searcher-centric title derived from the profile. Falls
 *  back to the summary, then to the fingerprint, so it is never empty. */
export function buildSearcherTitle(profile: DescriptorProfile): string {
  const c = canonicalizeProfile(profile);
  const entity = c.named_entity || c.body_location;
  const subject = c.subject_type;
  const action = c.primary_action;

  const parts: string[] = [];
  if (action) parts.push(action.replace(/[-/]/g, ' '));
  if (subject && subject !== action) parts.push(subject.replace(/[-/]/g, ' '));
  if (entity) parts.push(`(${entity})`);

  const title = parts.join(' ').trim();
  if (title) return title;
  if (c.summary) return c.summary;
  return computeFingerprint(profile);
}

/** The specificity axes present on this intent (drives Step-6 nesting). */
export function deriveSpecificityMarkers(profile: DescriptorProfile): SpecificityMarker[] {
  const c = canonicalizeProfile(profile);
  const ladderedKeys = new Set(DESCRIPTORS.filter((d) => d.laddered).map((d) => d.key));
  const markers: SpecificityMarker[] = [];
  for (const key of SPECIFICITY_AXES) {
    const v = (c as unknown as Record<string, unknown>)[key];
    if (typeof v === 'string' && v) markers.push({ descriptorKey: key, value: v, laddered: ladderedKeys.has(key) });
  }
  return markers;
}

/**
 * Contrastive boundary: `belongs` is the defining axis=value set; `excludes` is
 * the sibling controlled-vocab values on the topic's most specific controlled
 * axis (so "this topic is mild, not moderate/severe/…"). Open-vocab and missing
 * axes yield an empty `excludes`.
 */
export function deriveBoundary(profile: DescriptorProfile): { belongs: string[]; excludes: string[] } {
  const c = canonicalizeProfile(profile);
  const axes = meaningfulAxes(c);
  const belongs = axes.map((a) => `${a.key}=${a.value}`);

  // pick the most specific controlled-vocab axis present for the contrast
  const boundaryOrder = ['severity', 'onset_duration', 'approach', 'subject_type', 'primary_action'];
  let excludes: string[] = [];
  for (const key of boundaryOrder) {
    const def = DESCRIPTORS.find((d) => d.key === key);
    const chosen = (c as unknown as Record<string, unknown>)[key];
    if (def && def.valueMenu !== 'open' && typeof chosen === 'string' && chosen) {
      excludes = (def.valueMenu as string[]).map((v) => v.toLowerCase()).filter((v) => v !== chosen);
      break;
    }
  }
  return { belongs, excludes };
}

/** Compose the full Step-4 label for one intent. */
export function labelIntent(intent: IntentInstance, _rb?: AssembledRulebook): TopicLabel {
  const canonicalProfile = canonicalizeProfile(intent.profile);
  return {
    fingerprint: computeFingerprint(intent.profile),
    title: buildSearcherTitle(intent.profile),
    canonicalProfile,
    specificityMarkers: deriveSpecificityMarkers(intent.profile),
    boundary: deriveBoundary(intent.profile),
  };
}

/** Strict merge equality (Step 5 gate): two intents merge iff their canonical
 *  profiles are identical (same fingerprint AND same summary-independent axes). */
export function profilesIdenticalForMerge(a: DescriptorProfile, b: DescriptorProfile): boolean {
  return computeFingerprint(a) === computeFingerprint(b);
}
