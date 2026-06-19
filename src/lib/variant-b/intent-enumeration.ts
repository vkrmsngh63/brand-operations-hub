/**
 * Variant B ("AI 2") — Step 3: intent enumeration (rulebook §1, spec §3 Step 3).
 *
 * Pure prompt-builder + strict-JSON parser + validators. No AI call, no DB, no
 * React — the client run-loop sends the built prompt and feeds the raw response
 * back to `parseIntentEnumeration`.
 *
 * NON-NEGOTIABLE payload flatness (plan §6): the prompt carries ONLY the pinned
 * assembled descriptor menu + the single carrier's representative keyword. The
 * accumulated tree NEVER enters this prompt, so per-batch payload stays in a
 * constant band as the tree grows. `intentPromptPayloadSize` exposes the size
 * for the flatness unit test.
 *
 * RECALL BIAS (plan locked-resolution #2): the prompt instructs the model to
 * enumerate EVERY plausible intent — over-enumeration is acceptable (spurious
 * low-volume intents are visible and pruned downstream); a missed intent is
 * unrecoverable. Validators FLAG under-enumeration (omission) and fabrication
 * (out-of-vocab values) for review; they NEVER penalize over-enumeration and
 * NEVER auto-delete an intent.
 */

import type { AssembledRulebook } from './rulebook-assembly.ts';
import type { CarrierCluster, DescriptorProfile, IntentInstance } from './types.ts';
import type { DescriptorDef } from './rulebook.ts';

export const INTENT_ENUMERATION_PROMPT_VERSION = 1;

// ============================================================
// Prompt builder
// ============================================================

/** Render the assembled descriptor menu as a compact, deterministic block. */
function renderDescriptorMenu(descriptors: DescriptorDef[]): string {
  return descriptors
    .map((d) => {
      const vocab = d.valueMenu === 'open' ? '<free text, normalized>' : (d.valueMenu as string[]).join(' | ');
      const ladder = d.laddered ? ' [laddered]' : '';
      return `- ${d.key} (${d.group})${ladder}: ${vocab}`;
    })
    .join('\n');
}

/**
 * Build the Step-3 enumeration prompt for one carrier cluster. Deterministic
 * (same inputs ⇒ same string) so it is unit-testable and cache-friendly.
 */
export function buildIntentEnumerationPrompt(carrier: CarrierCluster, rb: AssembledRulebook): string {
  const menu = renderDescriptorMenu(rb.descriptors);
  const nicheLine = rb.nicheSlug
    ? `The health niche is "${rb.nicheSlug}". The condition term${rb.conditionTerm ? ` is "${rb.conditionTerm}"` : ''} has already been stripped from the keyword during deduplication; reason about the searcher's intent, not the raw words.`
    : `Reason about the searcher's intent behind the keyword.`;

  return [
    `You are labeling SEARCH INTENT for keyword clustering. ${nicheLine}`,
    ``,
    `KEYWORD: "${carrier.representative}"  (monthly search volume: ${carrier.summedVolume})`,
    ``,
    `TASK: Enumerate EVERY plausible distinct search intent a person typing this keyword could have. A single keyword often carries more than one intent — list them all. Over-listing is fine; a missed intent cannot be recovered later, so err toward MORE intents, not fewer. Do not invent intents the keyword cannot plausibly support.`,
    ``,
    `For each intent, fill the descriptor profile using ONLY the controlled values below (use normalized free text only where a descriptor says "<free text>"). Always fill "summary" with a one-line plain-English statement of the intent. Leave a descriptor out if it does not apply.`,
    ``,
    `DESCRIPTOR MENU:`,
    menu,
    ``,
    `Also give, per intent: "clarity" (0..1 — how clearly the keyword expresses this intent) and "confidence" (0..1 — your confidence this intent is real).`,
    ``,
    `OUTPUT: strict JSON only, no prose, no markdown fences. Shape:`,
    `{"intents":[{"profile":{"subject_type":"...","primary_action":"...","summary":"..."},"clarity":0.0,"confidence":0.0}]}`,
  ].join('\n');
}

/** Size of the per-carrier prompt payload (chars). Used by the flatness test to
 *  assert the prompt does not grow with the accumulated tree. */
export function intentPromptPayloadSize(carrier: CarrierCluster, rb: AssembledRulebook): number {
  return buildIntentEnumerationPrompt(carrier, rb).length;
}

// ============================================================
// Parsing + validation
// ============================================================

export type IntentFlagKind =
  | 'invalid-json'
  | 'schema-violation'
  | 'missing-summary'
  | 'unknown-descriptor'
  | 'out-of-vocab-value'
  | 'under-enumeration';

export interface IntentFlag {
  kind: IntentFlagKind;
  message: string;
  /** index into the returned intents array, when intent-specific. */
  intentIndex?: number;
  descriptorKey?: string;
  value?: string;
}

export interface IntentEnumerationResult {
  /** parsed intents — NEVER auto-pruned (over-enumeration is kept). */
  intents: IntentInstance[];
  /** review signals; presence never blocks the pipeline. */
  flags: IntentFlag[];
  /** false ONLY when the response could not be parsed at all. */
  ok: boolean;
}

/** Strip optional markdown code fences the model may wrap JSON in. */
function stripFences(raw: string): string {
  const t = raw.trim();
  const fence = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return (fence ? fence[1] : t).trim();
}

const META_KEYS = new Set(['summary']);

/**
 * Parse + validate a Step-3 enumeration response for one carrier. Computes the
 * per-intent D-meta the model does NOT own: searchVolume (full carrier reach —
 * `volume_full`) and multiplicity (count of intents the keyword fanned to).
 */
export function parseIntentEnumeration(raw: string, carrier: CarrierCluster, rb: AssembledRulebook): IntentEnumerationResult {
  const flags: IntentFlag[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripFences(raw));
  } catch {
    return { intents: [], flags: [{ kind: 'invalid-json', message: 'response was not valid JSON' }], ok: false };
  }

  const rawIntents = (parsed as { intents?: unknown }).intents;
  if (!Array.isArray(rawIntents)) {
    return { intents: [], flags: [{ kind: 'schema-violation', message: 'missing "intents" array' }], ok: false };
  }

  const descriptorByKey = new Map(rb.descriptors.map((d) => [d.key, d]));
  const intents: IntentInstance[] = [];

  rawIntents.forEach((item, i) => {
    const profileRaw = (item as { profile?: unknown }).profile;
    if (!profileRaw || typeof profileRaw !== 'object') {
      flags.push({ kind: 'schema-violation', message: 'intent missing "profile" object', intentIndex: i });
      return;
    }
    const profileObj = profileRaw as Record<string, unknown>;

    // validate descriptor keys + controlled-vocab values (flag, never drop)
    for (const [key, value] of Object.entries(profileObj)) {
      if (META_KEYS.has(key)) continue;
      const def = descriptorByKey.get(key);
      if (!def) {
        flags.push({ kind: 'unknown-descriptor', message: `unknown descriptor "${key}"`, intentIndex: i, descriptorKey: key });
        continue;
      }
      if (def.valueMenu !== 'open' && typeof value === 'string' && !(def.valueMenu as string[]).includes(value)) {
        flags.push({
          kind: 'out-of-vocab-value',
          message: `value "${value}" not in the controlled vocabulary for "${key}"`,
          intentIndex: i,
          descriptorKey: key,
          value,
        });
      }
    }

    const summary = typeof profileObj.summary === 'string' ? profileObj.summary : '';
    if (!summary) flags.push({ kind: 'missing-summary', message: 'intent has no summary', intentIndex: i });

    intents.push({
      id: `${carrier.id}-i${i}`,
      carrierId: carrier.id,
      sourceKeyword: carrier.representative,
      profile: { ...(profileObj as object), summary } as DescriptorProfile,
      searchVolume: carrier.summedVolume, // volume_full: full reach to each intent
      clarity: clamp01((item as { clarity?: unknown }).clarity),
      confidence: clamp01((item as { confidence?: unknown }).confidence),
      multiplicity: 0, // backfilled below once the count is known
    });
  });

  // D4 multiplicity = number of intents this keyword fanned out to
  for (const intent of intents) intent.multiplicity = intents.length;

  // under-enumeration (omission) flag: a non-degenerate carrier that yielded no
  // intent is a definite omission. (Sampled blind-pass / round-trip scoring for
  // subtler omissions is layered on later — see plan §7.3.)
  if (intents.length === 0 && !carrier.flagged) {
    flags.push({ kind: 'under-enumeration', message: 'no intents enumerated for a non-degenerate keyword' });
  }

  return { intents, flags, ok: true };
}

function clamp01(v: unknown): number | undefined {
  if (typeof v !== 'number' || Number.isNaN(v)) return undefined;
  return Math.max(0, Math.min(1, v));
}
