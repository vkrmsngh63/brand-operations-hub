// P-57 (2026-06-02-g) — category-vocabulary delete helpers.
//
// Categories on the W#2 competitor detail page are NOT per-item entities;
// they are a project-level shared VocabularyEntry pool (vocabularyType ∈
// {content-category, image-category, video-category}) whose string `value`
// is stored on each capture row's category column (CapturedText.contentCategory
// / CapturedImage.imageCategory / CapturedVideo.videoCategory).
//
// P-57's director-chosen behavior (Rule 14f, 2026-06-02-g) is "delete items
// too": deleting a category label deletes the VocabularyEntry AND every
// capture row in the project tagged with it. This module is the DOM-free /
// Prisma-free mapping + message formatting so the cascade route + the confirm
// UI agree on which model/column each category type targets — and so it is
// unit-testable without a DB.

import type { VocabularyType } from '@/lib/shared-types/competition-scraping';

// The three vocabulary types the directive names. Non-category vocab
// (competition-category / product-name / brand-name / custom-field-name-*) is
// intentionally OUT of scope for category deletion.
export const CATEGORY_VOCABULARY_TYPES = [
  'content-category',
  'image-category',
  'video-category',
] as const;

export type CategoryVocabularyType = (typeof CATEGORY_VOCABULARY_TYPES)[number];

export function isCategoryVocabularyType(
  value: unknown
): value is CategoryVocabularyType {
  return (
    typeof value === 'string' &&
    (CATEGORY_VOCABULARY_TYPES as readonly string[]).includes(value)
  );
}

export type CategoryCaptureModel =
  | 'capturedText'
  | 'capturedImage'
  | 'capturedVideo';

export type CategoryColumn =
  | 'contentCategory'
  | 'imageCategory'
  | 'videoCategory';

export interface CategoryFieldMapping {
  // The Prisma model that carries this category column.
  model: CategoryCaptureModel;
  // The string column on that model holding the category value.
  column: CategoryColumn;
  // Human noun for the captured items, used in the confirm message.
  noun: string;
  pluralNoun: string;
  // image/video rows own storage objects that need best-effort cleanup on
  // delete; text rows do not.
  hasStorage: boolean;
}

const MAPPING: Record<CategoryVocabularyType, CategoryFieldMapping> = {
  'content-category': {
    model: 'capturedText',
    column: 'contentCategory',
    noun: 'captured text',
    pluralNoun: 'captured texts',
    hasStorage: false,
  },
  'image-category': {
    model: 'capturedImage',
    column: 'imageCategory',
    noun: 'captured image',
    pluralNoun: 'captured images',
    hasStorage: true,
  },
  'video-category': {
    model: 'capturedVideo',
    column: 'videoCategory',
    noun: 'captured video',
    pluralNoun: 'captured videos',
    hasStorage: true,
  },
};

// Returns the model/column/noun mapping for a category vocabulary type, or
// null for any non-category type (so callers can reject Product Name etc.).
export function categoryFieldMapping(
  type: VocabularyType | string | null | undefined
): CategoryFieldMapping | null {
  return isCategoryVocabularyType(type) ? MAPPING[type] : null;
}

function pluralize(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

// The confirm-dialog disclosure line. Made explicit + project-wide + count-
// bearing on purpose: the delete is destructive and fires from an inline
// dropdown, so the user must see exactly how much data goes before confirming.
export function categoryDeletionMessage(
  mapping: CategoryFieldMapping,
  value: string,
  count: number
): string {
  const label = value.trim() === '' ? 'this category' : `“${value.trim()}”`;
  if (count === 0) {
    return `No ${mapping.pluralNoun} are tagged ${label}. Deleting it removes the category from this project. This cannot be undone.`;
  }
  return `This permanently deletes ${label} AND ${pluralize(
    count,
    mapping.noun,
    mapping.pluralNoun
  )} tagged with it across this entire project. This cannot be undone.`;
}
