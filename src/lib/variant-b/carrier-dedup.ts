/**
 * Variant B — Step 2: Carrier dedup (rulebook §6, spec §3 Step 2). FULL.
 *
 * Folds word-for-word-equivalent phrases into one carrier BEFORE any AI work.
 * Cheap, mechanical, conservative. Pure function — no DB, no AI, no React.
 *
 * Algorithm (spec §3 Step 2 / rulebook §6), per keyword:
 *   1. lowercase + trim, map niche aliases → canonical condition term;
 *   2. remove the condition term and the CLOSED ignorable stopword set
 *      (default {"for","the","a"} ONLY — never prepositions/qualifiers);
 *   3. lemmatize plurals;
 *   4. normalize word order (sort the remaining tokens);
 *   5. group keywords with identical normalized keys; elect the
 *      highest-volume member as representative; sum volumes.
 *
 * Conservatism note: normalization is intentionally shallow. The rulebook biases
 * to over-split — a missed fold is recoverable downstream; a wrong fold collapses
 * a real distinction. Plural lemmatization stays minimal for the same reason.
 */

import type {
  KeywordRow,
  CarrierCluster,
  CarrierDedupConfig,
} from './types.ts';

/** rulebook §6: closed default — {"for","the","a"} ONLY. */
export const DEFAULT_IGNORABLE_STOPWORDS: readonly string[] = ['for', 'the', 'a'];

const PUNCT_RE = /[^\p{L}\p{N}\s]/gu;
const WS_RE = /\s+/u;

/** Synthetic keys for degenerate inputs so they don't silently co-mingle. */
const CONDITION_ONLY_KEY = '__condition_or_stopwords_only__';
const BLANK_KEY_PREFIX = '__blank__';

/**
 * Minimal, conservative English plural → singular. Only the common, safe rules;
 * leaves anything ambiguous untouched (over-split is the accepted direction).
 */
export function lemmatizePlural(token: string): string {
  if (token.length <= 3) return token; // too short to safely de-pluralize
  if (token.endsWith('ies')) return token.slice(0, -3) + 'y'; // remedies → remedy
  if (/(ses|xes|zes|ches|shes)$/.test(token)) return token.slice(0, -2); // boxes → box
  if (token.endsWith('ss')) return token; // abscess stays abscess
  if (token.endsWith('s')) return token.slice(0, -1); // symptoms → symptom
  return token;
}

/**
 * Compute the normalized dedup key for a single phrase. Exported for testing and
 * reuse (the same normalization underpins Step 5 candidate generation).
 * Returns '' when the phrase reduces to nothing (only condition/stopwords).
 */
export function normalizeCarrierKey(
  rawKeyword: string,
  config: CarrierDedupConfig = {},
): string {
  const stopwords = new Set(
    (config.ignorableStopwords ?? DEFAULT_IGNORABLE_STOPWORDS).map((w) =>
      w.toLowerCase(),
    ),
  );

  let text = rawKeyword.toLowerCase().trim();
  if (text === '') return '';

  // (1) alias → canonical condition term (phrase-level, longest alias first so
  // overlapping aliases resolve deterministically).
  if (config.aliases) {
    const aliasEntries = Object.entries(config.aliases).sort(
      (x, y) => y[0].length - x[0].length,
    );
    for (const [alias, canonical] of aliasEntries) {
      const a = alias.toLowerCase().trim();
      if (a && text.includes(a)) {
        text = text.split(a).join(` ${canonical.toLowerCase()} `);
      }
    }
  }

  // strip punctuation, collapse whitespace
  text = text.replace(PUNCT_RE, ' ').replace(WS_RE, ' ').trim();
  if (text === '') return '';

  // condition term tokens to drop (after alias normalization).
  const conditionTokens = new Set(
    (config.conditionTerm ?? '')
      .toLowerCase()
      .replace(PUNCT_RE, ' ')
      .split(WS_RE)
      .filter(Boolean),
  );

  const tokens = text
    .split(WS_RE)
    .filter(Boolean)
    // (2) remove condition term + ignorable stopwords
    .filter((t) => !conditionTokens.has(t) && !stopwords.has(t))
    // (3) lemmatize plurals
    .map(lemmatizePlural);

  if (tokens.length === 0) return '';

  // (4) normalize word order
  tokens.sort();
  return tokens.join(' ');
}

/**
 * Carrier dedup over a set of keyword rows.
 *
 * - Identical normalized keys group together; representative = highest volume
 *   (ties broken alphabetically for determinism); volumes summed.
 * - A blank input keyword becomes its own flagged singleton (spec §3 Step 2).
 * - Phrases that reduce to only the condition term / stopwords group under a
 *   single flagged cluster (e.g. "bursitis", "the bursitis").
 *
 * Deterministic: clusters are returned sorted by descending summedVolume, then
 * by representative, so output is stable regardless of input order.
 */
export function carrierDedup(
  rows: KeywordRow[],
  config: CarrierDedupConfig = {},
): CarrierCluster[] {
  const groups = new Map<
    string,
    { members: { keyword: string; volume: number }[]; flagged: boolean }
  >();

  for (const row of rows) {
    const raw = (row.keyword ?? '').trim();
    let key: string;
    let flagged = false;

    if (raw === '') {
      // blank → its own flagged singleton (cannot meaningfully group)
      key = `${BLANK_KEY_PREFIX}${row.id}`;
      flagged = true;
    } else {
      const normalized = normalizeCarrierKey(raw, config);
      if (normalized === '') {
        key = CONDITION_ONLY_KEY;
        flagged = true;
      } else {
        key = normalized;
      }
    }

    const bucket = groups.get(key);
    const volume = Number.isFinite(row.volume) ? row.volume : 0;
    if (bucket) {
      bucket.members.push({ keyword: raw, volume });
      bucket.flagged = bucket.flagged || flagged;
    } else {
      groups.set(key, { members: [{ keyword: raw, volume }], flagged });
    }
  }

  const clusters: CarrierCluster[] = [];
  for (const [normalizedKey, bucket] of groups) {
    // representative = highest volume, ties → alphabetical (determinism)
    const representative = [...bucket.members].sort(
      (a, b) => b.volume - a.volume || a.keyword.localeCompare(b.keyword),
    )[0].keyword;
    const summedVolume = bucket.members.reduce((s, m) => s + m.volume, 0);
    const isSynthetic =
      normalizedKey.startsWith(BLANK_KEY_PREFIX) ||
      normalizedKey === CONDITION_ONLY_KEY;
    clusters.push({
      id: `cc-${clusters.length + 1}`,
      representative,
      members: bucket.members,
      summedVolume,
      normalizedKey: isSynthetic ? '' : normalizedKey,
      ...(bucket.flagged ? { flagged: true } : {}),
    });
  }

  clusters.sort(
    (a, b) =>
      b.summedVolume - a.summedVolume ||
      a.representative.localeCompare(b.representative),
  );
  // re-id after the stable sort so ids reflect final order
  clusters.forEach((c, i) => {
    c.id = `cc-${i + 1}`;
  });
  return clusters;
}
