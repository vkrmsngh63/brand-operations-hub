// The 7 platforms a user can capture URLs from per
// COMPETITION_SCRAPING_DESIGN.md §A.7 Module 1.
//
// `value` matches the CompetitorUrl.platform enum the API expects;
// `label` is the user-facing label for the popup picker.

export interface PlatformOption {
  value: string;
  label: string;
}

export const PLATFORMS: readonly PlatformOption[] = [
  { value: 'amazon', label: 'Amazon.com' },
  { value: 'ebay', label: 'Ebay.com' },
  { value: 'etsy', label: 'Etsy.com' },
  { value: 'walmart', label: 'Walmart.com' },
  { value: 'google-shopping', label: 'Google Shopping' },
  { value: 'google-ads', label: 'Google Ads' },
  { value: 'independent-website', label: 'Independent Website' },
] as const;

export function getPlatformLabel(value: string | null): string | null {
  if (value === null) return null;
  return PLATFORMS.find((p) => p.value === value)?.label ?? null;
}
