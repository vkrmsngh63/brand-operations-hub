// W#2 P-49 Workstream 5 Fix Session D (2026-05-31) — pure helpers backing
// the 3-column "Overall Analysis — Captured Reviews" traceability table on
// the URL detail page (Category / Complaint / source reviews + star count).
//
// Per director's 2026-05-30 §1 addendum, the per-competitor bulleted AI run
// now emits structured output { categories: [{ name, bullets: [{ text,
// reviewIds }] }] } (see prompts.ts v4). The detail page reads the latest
// PER_PRODUCT ReviewAnalysis row's analysisJson and renders it as a table.
//
// These helpers are framework-free + side-effect-free so the row-building +
// defensive parsing logic is node:test-covered independent of React.

// The structured shape we render. Mirrors prompts.ts's
// PerCompetitorStructuredAnalysis but redeclared here so the client bundle
// doesn't pull in the server-side prompt strings.
export interface TraceabilityBullet {
  text: string;
  reviewIds: string[];
}
export interface TraceabilityCategory {
  name: string;
  bullets: TraceabilityBullet[];
}
export interface TraceabilityAnalysis {
  categories: TraceabilityCategory[];
}

// Minimal review shape the source column needs (title+body merge + stars).
export interface TraceabilityReview {
  starRating: number;
  title: string | null;
  body: string;
}

// One resolved source-review cell entry. `missing` is true when a cited
// reviewId no longer resolves to a captured review (e.g. it was deleted
// after the AI run) — the table still renders a placeholder row so the
// count of cited reviews stays honest.
export interface TraceabilitySource {
  reviewId: string;
  starRating: number | null;
  text: string;
  missing: boolean;
}

// One rendered table row. The FIRST bullet of each category carries
// `categoryName` + `categoryRowSpan` (for a vertically-merged category
// cell); subsequent bullets in the same category carry `categoryName:
// null` so the renderer omits the category cell (covered by the rowspan).
export interface TraceabilityRow {
  categoryName: string | null;
  categoryRowSpan: number;
  bulletText: string;
  sources: TraceabilitySource[];
}

// Parse a stored analysisJson value into the structured traceability shape.
// Returns null when the row is the legacy free-text { summary } shape (pre-
// v4) or otherwise has no usable `categories` array — the caller then falls
// back to rendering the plain-text summary instead of a table.
export function parseTraceabilityAnalysis(
  analysisJson: unknown
): TraceabilityAnalysis | null {
  if (!analysisJson || typeof analysisJson !== 'object') return null;
  const obj = analysisJson as { categories?: unknown };
  if (!Array.isArray(obj.categories)) return null;

  const categories: TraceabilityCategory[] = [];
  for (const rawCat of obj.categories) {
    if (!rawCat || typeof rawCat !== 'object') continue;
    const cat = rawCat as { name?: unknown; bullets?: unknown };
    if (typeof cat.name !== 'string' || !cat.name.trim()) continue;
    if (!Array.isArray(cat.bullets)) continue;

    const bullets: TraceabilityBullet[] = [];
    for (const rawBullet of cat.bullets) {
      if (!rawBullet || typeof rawBullet !== 'object') continue;
      const b = rawBullet as { text?: unknown; reviewIds?: unknown };
      if (typeof b.text !== 'string' || !b.text.trim()) continue;
      const reviewIds: string[] = [];
      if (Array.isArray(b.reviewIds)) {
        for (const id of b.reviewIds) {
          if (typeof id === 'string' && id) reviewIds.push(id);
        }
      }
      bullets.push({ text: b.text.trim(), reviewIds });
    }
    if (bullets.length === 0) continue;
    categories.push({ name: cat.name.trim(), bullets });
  }
  if (categories.length === 0) return null;
  return { categories };
}

const SENTENCE_END_PUNCT = /[.!?]$/;

// Merge a review's title + body for the source column, matching the same
// "title. body" rule the main Reviews Analysis Table uses (mergeTitleAndBody
// in reviews-analysis-table-columns.ts) — kept local to avoid a cross-import
// into table-column code from the detail page.
export function mergeReviewTitleBody(
  title: string | null | undefined,
  body: string | null | undefined
): string {
  const t = (title ?? '').trim();
  const b = (body ?? '').trim();
  if (!t) return b;
  if (!b) return t;
  const headline = SENTENCE_END_PUNCT.test(t) ? t : `${t}.`;
  return `${headline} ${b}`;
}

// Flatten the structured analysis into rendered table rows, resolving each
// cited reviewId against the captured reviews. Every bullet renders one
// row; the first bullet of each category carries the rowspan'd category
// cell. Reviews that no longer resolve render as a `missing` placeholder so
// the cited-review count stays truthful.
export function buildTraceabilityRows(
  analysis: TraceabilityAnalysis,
  reviewsById: ReadonlyMap<string, TraceabilityReview>
): TraceabilityRow[] {
  const rows: TraceabilityRow[] = [];
  for (const category of analysis.categories) {
    category.bullets.forEach((bullet, bulletIdx) => {
      const sources: TraceabilitySource[] = bullet.reviewIds.map((reviewId) => {
        const review = reviewsById.get(reviewId);
        if (!review) {
          return {
            reviewId,
            starRating: null,
            text: '(this review is no longer available)',
            missing: true,
          };
        }
        return {
          reviewId,
          starRating: review.starRating,
          text: mergeReviewTitleBody(review.title, review.body),
          missing: false,
        };
      });
      rows.push({
        categoryName: bulletIdx === 0 ? category.name : null,
        categoryRowSpan: bulletIdx === 0 ? category.bullets.length : 0,
        bulletText: bullet.text,
        sources,
      });
    });
  }
  return rows;
}
