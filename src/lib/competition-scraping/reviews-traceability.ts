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
  // Index of this bullet's category + the bullet within it, so the editable
  // table (FU-1 / Q11) can target an edit/delete back at the structured shape.
  categoryIndex: number;
  bulletIndex: number;
  categoryName: string | null;
  categoryRowSpan: number;
  bulletText: string;
  sources: TraceabilitySource[];
}

// Defensively validate + normalize a raw `categories` value into the
// structured shape. Drops malformed categories/bullets (blank name, bullets
// not an array, blank text) and filters non-string reviewIds. Returns null
// ONLY when the input isn't an array at all; an array that yields zero usable
// categories returns `[]` (legal for FU-1 edits — deleting every entry leaves
// an empty analysis, which renders the "no critiques" summary). Shared by
// parseTraceabilityAnalysis (render path) + the FU-1 PATCH validator (server).
export function validateCategoriesInput(
  raw: unknown
): TraceabilityCategory[] | null {
  if (!Array.isArray(raw)) return null;
  const categories: TraceabilityCategory[] = [];
  for (const rawCat of raw) {
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
  return categories;
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
  const categories = validateCategoriesInput(obj.categories);
  if (!categories || categories.length === 0) return null;
  return { categories };
}

// ─── Which PER_PRODUCT row feeds the traceability table ───────────────────
// A competitor URL can have TWO PER_PRODUCT ReviewAnalysis rows: the BULLETED
// flow (structured { categories: [...] } — the bullet→source-review shape this
// table renders) and the NON-BULLETED prose flow (a second PER_PRODUCT row
// discriminated by analysisJson.flow === 'per-competitor-nonbulleted', storing
// only prose). The traceability table can ONLY render the bulleted row.
//
// The URL detail page used to feed it "the latest PER_PRODUCT row of either
// flow", so generating the non-bulleted prose summary AFTER the bulleted one
// silently shadowed the bulleted row and blanked the table. This helper picks
// the LATEST PER_PRODUCT row for the URL that is NOT the non-bulleted prose
// row — restoring the bulleted summary as the table's source regardless of
// which flow ran most recently. Rows are expected in ascending runAt order
// (the GET /review-analysis route's order), so the last eligible match wins.
export interface PerProductAnalysisRow {
  id: string;
  level: string;
  urlId: string | null;
  analysisJson: unknown;
}

export function selectBulletedAnalysisRow(
  rows: ReadonlyArray<PerProductAnalysisRow>,
  urlId: string
): { id: string; analysisJson: unknown } | null {
  let picked: { id: string; analysisJson: unknown } | null = null;
  for (const row of rows) {
    if (row.level !== 'PER_PRODUCT' || row.urlId !== urlId) continue;
    const flow =
      row.analysisJson && typeof row.analysisJson === 'object'
        ? (row.analysisJson as { flow?: unknown }).flow
        : undefined;
    if (flow === 'per-competitor-nonbulleted') continue;
    picked = { id: row.id, analysisJson: row.analysisJson };
  }
  return picked;
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
  analysis.categories.forEach((category, categoryIndex) => {
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
        categoryIndex,
        bulletIndex: bulletIdx,
        categoryName: bulletIdx === 0 ? category.name : null,
        categoryRowSpan: bulletIdx === 0 ? category.bullets.length : 0,
        bulletText: bullet.text,
        sources,
      });
    });
  });
  return rows;
}

// ─── FU-1 / Q11 (a.110) — edit + delete mutations ─────────────────────────
// Pure, immutable transforms over the structured analysis. The editable
// table calls these, then persists the result's `categories` back to the
// per-competitor PER_PRODUCT ReviewAnalysis row via PATCH. NONE of these
// touch the underlying CapturedReviews — only the analysis-derived entries.
// Categories left with zero bullets are dropped (a complaint-less category
// would render nothing anyway per parseTraceabilityAnalysis).

export interface BulletTarget {
  categoryIndex: number;
  bulletIndex: number;
}

function dropEmptyCategories(
  categories: TraceabilityCategory[]
): TraceabilityCategory[] {
  return categories.filter((c) => c.bullets.length > 0);
}

// Rename a category (Column 1). A blank name is ignored (no-op) — renaming to
// empty is meaningless; the category is removed via deleteCategory instead.
export function editCategoryName(
  analysis: TraceabilityAnalysis,
  categoryIndex: number,
  name: string
): TraceabilityAnalysis {
  const trimmed = name.trim();
  if (!trimmed) return analysis;
  return {
    categories: analysis.categories.map((cat, i) =>
      i === categoryIndex ? { ...cat, name: trimmed } : cat
    ),
  };
}

// Edit a complaint's wording (Column 2). A blank text is ignored (no-op) —
// emptying a complaint is a delete, handled via deleteBullets.
export function editBulletText(
  analysis: TraceabilityAnalysis,
  categoryIndex: number,
  bulletIndex: number,
  text: string
): TraceabilityAnalysis {
  const trimmed = text.trim();
  if (!trimmed) return analysis;
  return {
    categories: analysis.categories.map((cat, i) =>
      i === categoryIndex
        ? {
            ...cat,
            bullets: cat.bullets.map((b, j) =>
              j === bulletIndex ? { ...b, text: trimmed } : b
            ),
          }
        : cat
    ),
  };
}

// Delete a whole category group (and all its complaints).
export function deleteCategory(
  analysis: TraceabilityAnalysis,
  categoryIndex: number
): TraceabilityAnalysis {
  return {
    categories: analysis.categories.filter((_, i) => i !== categoryIndex),
  };
}

// Delete one or many complaint rows (single-delete = a one-element target
// list). A category that loses its last complaint is dropped.
export function deleteBullets(
  analysis: TraceabilityAnalysis,
  targets: ReadonlyArray<BulletTarget>
): TraceabilityAnalysis {
  const toDelete = new Set(
    targets.map((t) => `${t.categoryIndex}:${t.bulletIndex}`)
  );
  const categories = analysis.categories.map((cat, i) => ({
    ...cat,
    bullets: cat.bullets.filter((_, j) => !toDelete.has(`${i}:${j}`)),
  }));
  return { categories: dropEmptyCategories(categories) };
}

// ─── Category page "Source Reviews" column (a.117 / 2026-05-30-c) ─────────
// The detail-page table above is single-competitor: its source reviews all
// belong to one product, so it never needs a product name. The Category page's
// NEW "Source Reviews" column shows, for each bulleted CATEGORY complaint, the
// individual reviews that traced up to it ACROSS every competitor in the
// category — so each source MUST carry which product it came from, plus the
// urlId so the cell can link to that review's detail page.
//
// The persisted PER_CATEGORY analysisJson reuses the SAME structured shape
// ({ categories: [{ name, bullets: [{ text, reviewIds }] }] }) the per-
// competitor flow uses (the category bulleted flow unions the cited bullets'
// reviewIds onto each category bullet). So this resolver mirrors
// buildTraceabilityRows, but it resolves against a richer review map (product
// name + urlId) and groups by theme→bullet→sources for the cell renderer
// instead of flat rowspan rows.

// The per-review fields the Source Reviews cell needs: stars + merged text
// (as before) PLUS the product name + urlId for the cross-competitor display
// and the jump-to-detail link.
export interface CategorySourceReviewMeta {
  starRating: number;
  title: string | null;
  body: string;
  productName: string;
  urlId: string;
}

export interface CategorySourceReview {
  reviewId: string;
  urlId: string | null;
  productName: string;
  starRating: number | null;
  text: string;
  missing: boolean;
}
export interface CategorySourceBullet {
  text: string;
  sources: CategorySourceReview[];
}
export interface CategorySourceTheme {
  name: string;
  bullets: CategorySourceBullet[];
}

// Resolve a category's structured bullets into theme→bullet→source-review
// groups for the Source Reviews cell. Each cited reviewId that no longer
// resolves renders as a `missing` placeholder so the cited-review count stays
// honest (same contract as buildTraceabilityRows). Themes/bullets are kept in
// their stored order; a bullet with zero reviewIds renders an empty source
// list (a genuinely category-wide insight is never dropped).
export function buildCategorySourceReviewRows(
  categories: ReadonlyArray<TraceabilityCategory>,
  reviewsById: ReadonlyMap<string, CategorySourceReviewMeta>
): CategorySourceTheme[] {
  return categories.map((category) => ({
    name: category.name,
    bullets: category.bullets.map((bullet) => ({
      text: bullet.text,
      sources: bullet.reviewIds.map((reviewId): CategorySourceReview => {
        const review = reviewsById.get(reviewId);
        if (!review) {
          return {
            reviewId,
            urlId: null,
            productName: '(unknown product)',
            starRating: null,
            text: '(this review is no longer available)',
            missing: true,
          };
        }
        return {
          reviewId,
          urlId: review.urlId,
          productName: review.productName,
          starRating: review.starRating,
          text: mergeReviewTitleBody(review.title, review.body),
          missing: false,
        };
      }),
    })),
  }));
}

// Detach a single source review from one complaint (Column 3). The complaint
// stays; it simply re-renders with fewer (or no) source reviews behind it.
export function deleteSourceReview(
  analysis: TraceabilityAnalysis,
  categoryIndex: number,
  bulletIndex: number,
  reviewId: string
): TraceabilityAnalysis {
  return {
    categories: analysis.categories.map((cat, i) =>
      i === categoryIndex
        ? {
            ...cat,
            bullets: cat.bullets.map((b, j) =>
              j === bulletIndex
                ? { ...b, reviewIds: b.reviewIds.filter((id) => id !== reviewId) }
                : b
            ),
          }
        : cat
    ),
  };
}
