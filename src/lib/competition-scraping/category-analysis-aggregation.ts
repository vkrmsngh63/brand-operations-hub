// W#2 P-49 Workstream 5 Category page Session 2 (2026-05-30-b) — pure helpers
// backing the two per-CATEGORY AI flows + the NEW "Source Reviews" column.
//
// The per-category bulleted flow dedups the per-competitor BULLETED summaries
// of every competitor in a category. To power the Source Reviews column
// (director addendum 2026-05-30-b), each resulting category bullet must trace
// back to the individual reviews behind it. The chain:
//
//   individual review ─(per-competitor bullet's reviewIds)→ competitor bullet
//   competitor bullet ─(the model cites which it merged, by B-label)────────→
//   category bullet   ─(union of the cited competitor bullets' reviewIds)───→
//   the category bullet's source reviews
//
// collectCategoryInputBullets flattens every competitor's stored structured
// analysis into one B-labeled list (the model's input + the resolver's map).
// buildCategoryStructuredAnalysis turns the model's bulletRef-citing output
// into the SAME stored shape the per-competitor flow uses (categories →
// bullets → reviewIds), except reviewIds is the cross-competitor union.
//
// Framework-free + side-effect-free so the aggregation logic is node:test
// covered independent of the handler, prisma, and the Anthropic client.

import { parseTraceabilityAnalysis } from './reviews-traceability.ts';
import {
  categoryBulletRefLabel,
  resolveCategoryBulletRefs,
  type CategoryInputBullet,
  type PerCategoryModelOutput,
} from './review-analysis/prompts.ts';
import type { PerCompetitorStructuredAnalysis } from './review-analysis/prompts.ts';

// One competitor's contribution to a category: its product name (shown in the
// Source Reviews cell to disambiguate which product a review belongs to) + its
// stored per-competitor PER_PRODUCT analysisJson (the bulleted structured
// shape { categories: [{ name, bullets: [{ text, reviewIds }] }] }).
export interface CategoryCompetitorAnalysis {
  urlId: string;
  productName: string;
  analysisJson: unknown;
}

export interface CollectedCategoryInputBullets {
  inputBullets: CategoryInputBullet[];
  bulletsByLabel: Map<string, CategoryInputBullet>;
}

// Flatten every competitor's bulleted analysis into one B-labeled list, in
// competitor order then bullet order. Competitors whose analysisJson has no
// usable structured categories (e.g. only a legacy free-text summary, or no
// per-competitor bulleted run yet) contribute nothing. Labels are assigned
// across ALL competitors continuously (B1, B2, … never reset per competitor)
// so each label is globally unique within the category prompt.
export function collectCategoryInputBullets(
  competitors: ReadonlyArray<CategoryCompetitorAnalysis>
): CollectedCategoryInputBullets {
  const inputBullets: CategoryInputBullet[] = [];
  const bulletsByLabel = new Map<string, CategoryInputBullet>();
  let i = 0;
  for (const comp of competitors) {
    const parsed = parseTraceabilityAnalysis(comp.analysisJson);
    if (!parsed) continue;
    for (const cat of parsed.categories) {
      for (const bullet of cat.bullets) {
        const label = categoryBulletRefLabel(i);
        i += 1;
        const ib: CategoryInputBullet = {
          label,
          productName: comp.productName,
          theme: cat.name,
          text: bullet.text,
          reviewIds: bullet.reviewIds,
        };
        inputBullets.push(ib);
        bulletsByLabel.set(label, ib);
      }
    }
  }
  return { inputBullets, bulletsByLabel };
}

// Turn the model's bulletRef-citing output into the stored structured shape
// (the SAME shape the per-competitor flow persists), resolving each category
// bullet's cited B-labels into the union of the supporting reviewIds. Drops
// category bullets that resolve to ZERO reviews ONLY when the model cited no
// resolvable labels at all — but keeps the bullet text either way so a
// genuinely category-wide insight is never silently lost; an empty reviewIds
// list simply renders no source reviews for that bullet.
export function buildCategoryStructuredAnalysis(
  modelOutput: PerCategoryModelOutput,
  bulletsByLabel: ReadonlyMap<string, CategoryInputBullet>
): PerCompetitorStructuredAnalysis {
  return {
    categories: modelOutput.categories.map((cat) => ({
      name: cat.name,
      bullets: cat.bullets.map((b) => ({
        text: b.text,
        reviewIds: resolveCategoryBulletRefs(b.bulletRefs, bulletsByLabel),
      })),
    })),
  };
}

// A stable canonical string for the cache key of a per-category bulleted run:
// the input bullets' text + their sorted reviewIds, in input order. Two runs
// over the same competitor summaries (same texts + same supporting reviews)
// hash identically regardless of label assignment, so re-running a category
// whose inputs haven't changed hits cache. Product name + theme are
// intentionally excluded — they don't change the critique content the model
// dedups.
export function canonicalizeCategoryInputBullets(
  inputBullets: ReadonlyArray<CategoryInputBullet>
): string {
  return inputBullets
    .map((b) => `${b.text}${[...b.reviewIds].sort().join(',')}`)
    .join('');
}
