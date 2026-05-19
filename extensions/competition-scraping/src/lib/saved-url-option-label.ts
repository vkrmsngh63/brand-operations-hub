// Saved-URL dropdown <option> label builder — P-23 ship 2026-05-19-g.
//
// Three callers in the extension render a "Pick a saved URL…" dropdown
// against the list of CompetitorUrl rows for the current Project + Platform:
//
//   • content-script/text-capture-form.ts (on-page right-click form for
//     capturing text against a saved URL)
//   • content-script/image-capture-form.ts (on-page right-click form for
//     capturing images against a saved URL)
//   • entrypoints/popup/components/CapturedTextPasteForm.tsx (popup-side
//     paste form for attaching pasted text to a saved URL)
//
// Pre-P-23 behavior: each caller built the option label as
//   row.productName?.trim() || (row.url long? truncate : row.url)
// — i.e. when productName was set, the URL disappeared entirely, leaving
// the director unable to confirm WHICH saved URL they were about to
// attach a capture to when multiple saved URLs shared the same product
// name (e.g. a brand's variant SKUs).
//
// P-23 behavior: when productName is non-empty (after trim), render BOTH
// productName and url side-by-side separated by an em-dash. URL gets a
// tighter 60-char truncation budget when productName is also showing so
// the total option text stays scannable in real-Chrome native <select>
// rendering. When productName is null/empty/whitespace, fall back to
// URL-only with the original 80-char truncation (no behavior change for
// the URL-only path).
//
// Truncation rule (refined per director Rule 14f forced-picker
// 2026-05-19-g, em-dash separator chosen + 60/80 truncation budgets):
//   productName present  → url truncates at 60 chars (slice to 57 + '…')
//   productName absent   → url truncates at 80 chars (slice to 77 + '…')

const EM_DASH = '—'; // —

const URL_LIMIT_WITH_NAME = 60;
const URL_SLICE_WITH_NAME = 57; // 60 minus the '…' character

const URL_LIMIT_NO_NAME = 80;
const URL_SLICE_NO_NAME = 77; // 80 minus the '…' character

export interface SavedUrlOptionLabelInput {
  productName?: string | null;
  url: string;
}

/**
 * Build the visible <option> text for a saved CompetitorUrl row in the
 * "Pick a saved URL…" dropdowns rendered by the three extension callers
 * listed above. See module header for the pre/post-P-23 contract.
 */
export function buildSavedUrlOptionLabel(
  row: SavedUrlOptionLabelInput,
): string {
  const trimmedName =
    typeof row.productName === 'string' ? row.productName.trim() : '';
  if (trimmedName.length > 0) {
    const truncatedUrl = truncate(row.url, URL_LIMIT_WITH_NAME, URL_SLICE_WITH_NAME);
    return `${trimmedName} ${EM_DASH} ${truncatedUrl}`;
  }
  return truncate(row.url, URL_LIMIT_NO_NAME, URL_SLICE_NO_NAME);
}

function truncate(url: string, limit: number, sliceTo: number): string {
  return url.length > limit ? url.slice(0, sliceTo) + '…' : url;
}
