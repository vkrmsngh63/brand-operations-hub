// 20-color Highlight Terms palette per COMPETITION_SCRAPING_STACK_DECISIONS.md §6.
//
// 10 light swatches (auto-text = black) + 10 dark swatches (auto-text = white),
// WCAG AA contrast (4.5:1) on the auto-flipped foreground/background pair.
// First 5 entries are the default-rotation order for the first 5 user-added
// terms (banana, royal blue, mint, crimson, peach) per §6 — implemented via
// DEFAULT_ROTATION_INDICES below.

export interface PaletteColor {
  hex: string;
  name: string;
  isLight: boolean;
}

export const COLOR_PALETTE: readonly PaletteColor[] = [
  // Light swatches (text = #000000)
  { hex: '#FFEB3B', name: 'Banana yellow', isLight: true },
  { hex: '#F8BBD0', name: 'Rose pink', isLight: true },
  { hex: '#B2EBF2', name: 'Sky cyan', isLight: true },
  { hex: '#C8E6C9', name: 'Mint green', isLight: true },
  { hex: '#E1BEE7', name: 'Lilac', isLight: true },
  { hex: '#FFCCBC', name: 'Peach', isLight: true },
  { hex: '#DCEDC8', name: 'Lime', isLight: true },
  { hex: '#FFAB91', name: 'Coral', isLight: true },
  { hex: '#B2DFDB', name: 'Sage', isLight: true },
  { hex: '#C5CAE9', name: 'Periwinkle', isLight: true },
  // Dark swatches (text = #FFFFFF)
  { hex: '#1976D2', name: 'Royal blue', isLight: false },
  { hex: '#388E3C', name: 'Forest green', isLight: false },
  { hex: '#C2185B', name: 'Crimson', isLight: false },
  { hex: '#303F9F', name: 'Navy', isLight: false },
  { hex: '#E64A19', name: 'Burnt orange', isLight: false },
  { hex: '#00796B', name: 'Teal', isLight: false },
  { hex: '#512DA8', name: 'Indigo', isLight: false },
  { hex: '#AD1457', name: 'Magenta', isLight: false },
  { hex: '#7B1FA2', name: 'Burgundy', isLight: false },
  { hex: '#455A64', name: 'Slate', isLight: false },
] as const;

// Default-rotation order per §6: banana, royal blue, mint, crimson, peach,
// then continues through the rest of the palette (lights then darks) so the
// 6th-onward terms also receive a sensible spread. Wraps modulo 20 for any
// 21st-and-beyond terms.
export const DEFAULT_ROTATION_INDICES: readonly number[] = [
  0,  // Banana yellow
  10, // Royal blue
  3,  // Mint green
  12, // Crimson
  5,  // Peach
  // Remaining lights (in palette order, skipping already-used 0/3/5)
  1,  // Rose pink
  2,  // Sky cyan
  4,  // Lilac
  6,  // Lime
  7,  // Coral
  8,  // Sage
  9,  // Periwinkle
  // Remaining darks (skipping already-used 10/12)
  11, // Forest green
  13, // Navy
  14, // Burnt orange
  15, // Teal
  16, // Indigo
  17, // Magenta
  18, // Burgundy
  19, // Slate
] as const;

/**
 * Returns the default highlight color for the (zero-indexed) Nth user-added
 * term. Wraps modulo the palette length for any term beyond the 20th.
 */
export function getDefaultColorForIndex(termIndex: number): string {
  if (!Number.isFinite(termIndex) || termIndex < 0) {
    return COLOR_PALETTE[DEFAULT_ROTATION_INDICES[0]!]!.hex;
  }
  const rotationLen = DEFAULT_ROTATION_INDICES.length;
  const paletteIndex = DEFAULT_ROTATION_INDICES[termIndex % rotationLen]!;
  return COLOR_PALETTE[paletteIndex]!.hex;
}

/**
 * Returns '#000000' if the supplied hex is one of the light swatches in the
 * palette, '#FFFFFF' if it's a dark swatch. For any hex outside the palette
 * (defensive — should not happen in normal flow), falls back to luminance-
 * based selection: the WCAG relative luminance threshold of 0.5 picks dark
 * text on light backgrounds and vice versa.
 */
export function getContrastTextColor(hex: string): '#000000' | '#FFFFFF' {
  const normalized = hex.trim().toUpperCase();
  const match = COLOR_PALETTE.find((c) => c.hex === normalized);
  if (match) {
    return match.isLight ? '#000000' : '#FFFFFF';
  }
  // Defensive luminance fallback
  return relativeLuminance(normalized) > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * WCAG relative luminance for an `#RRGGBB` hex string. Returns 0–1; ill-formed
 * inputs return 0.5 (forces a deterministic fallback in getContrastTextColor).
 */
export function relativeLuminance(hex: string): number {
  const m = /^#([0-9A-F]{6})$/i.exec(hex.trim());
  if (!m) return 0.5;
  const rgb = m[1]!;
  const r = parseInt(rgb.slice(0, 2), 16) / 255;
  const g = parseInt(rgb.slice(2, 4), 16) / 255;
  const b = parseInt(rgb.slice(4, 6), 16) / 255;
  const [R, G, B] = [r, g, b].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * R! + 0.7152 * G! + 0.0722 * B!;
}

/**
 * Returns the palette entry for a given hex (case-insensitive), or undefined.
 */
export function findPaletteColor(hex: string): PaletteColor | undefined {
  const normalized = hex.trim().toUpperCase();
  return COLOR_PALETTE.find((c) => c.hex === normalized);
}
