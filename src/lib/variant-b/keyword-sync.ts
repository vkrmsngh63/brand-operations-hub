// Pure helpers for the AI 2 (Variant B) keyword clone + re-sync logic.
// Extracted from KeywordWorkspace so the only non-trivial decisions — "should
// we clone?" and "which keywords are missing?" — are node:test-covered while the
// component stays a thin wiring layer over the keyword API.

export interface KwLike {
  keyword: string;
  volume: number | string;
}

/**
 * AI 2 clones AI 1's keywords on first activation, but ONLY when AI 2 has none
 * of its own yet (idempotent — there is no DB uniqueness to lean on, see
 * A-CLONE-IDEMP) and AI 1 actually has keywords to copy.
 */
export function shouldCloneFromAi1(vbCount: number, ai1Count: number): boolean {
  return vbCount === 0 && ai1Count > 0;
}

/**
 * Add-only set difference by keyword text: the AI 1 keywords that AI 2 does not
 * already have. Drives the "Re-sync from AI 1" action — it never removes,
 * and duplicates within AI 1 collapse to one.
 */
export function keywordsMissingFromVb<T extends KwLike>(
  ai1: T[],
  vb: KwLike[]
): T[] {
  const have = new Set(vb.map(k => k.keyword));
  const seen = new Set<string>();
  const out: T[] = [];
  for (const k of ai1) {
    if (have.has(k.keyword) || seen.has(k.keyword)) continue;
    seen.add(k.keyword);
    out.push(k);
  }
  return out;
}
