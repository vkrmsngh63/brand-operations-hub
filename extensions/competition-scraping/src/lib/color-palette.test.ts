import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  COLOR_PALETTE,
  DEFAULT_ROTATION_INDICES,
  findPaletteColor,
  getContrastTextColor,
  getDefaultColorForIndex,
  relativeLuminance,
} from './color-palette.ts';

describe('COLOR_PALETTE structure', () => {
  it('has exactly 20 entries', () => {
    assert.equal(COLOR_PALETTE.length, 20);
  });

  it('has 10 light + 10 dark', () => {
    const lights = COLOR_PALETTE.filter((c) => c.isLight).length;
    const darks = COLOR_PALETTE.filter((c) => !c.isLight).length;
    assert.equal(lights, 10);
    assert.equal(darks, 10);
  });

  it('has unique hex values across the whole palette', () => {
    const hexes = COLOR_PALETTE.map((c) => c.hex);
    assert.equal(new Set(hexes).size, hexes.length);
  });

  it('has unique color names across the whole palette', () => {
    const names = COLOR_PALETTE.map((c) => c.name);
    assert.equal(new Set(names).size, names.length);
  });

  it('uses uppercase 7-char hex strings', () => {
    for (const c of COLOR_PALETTE) {
      assert.match(c.hex, /^#[0-9A-F]{6}$/);
    }
  });
});

describe('DEFAULT_ROTATION_INDICES', () => {
  it('opens with banana → royal blue → mint → crimson → peach per §6', () => {
    assert.equal(COLOR_PALETTE[DEFAULT_ROTATION_INDICES[0]!]!.name, 'Banana yellow');
    assert.equal(COLOR_PALETTE[DEFAULT_ROTATION_INDICES[1]!]!.name, 'Royal blue');
    assert.equal(COLOR_PALETTE[DEFAULT_ROTATION_INDICES[2]!]!.name, 'Mint green');
    assert.equal(COLOR_PALETTE[DEFAULT_ROTATION_INDICES[3]!]!.name, 'Crimson');
    assert.equal(COLOR_PALETTE[DEFAULT_ROTATION_INDICES[4]!]!.name, 'Peach');
  });

  it('covers every palette index exactly once', () => {
    const sorted = [...DEFAULT_ROTATION_INDICES].sort((a, b) => a - b);
    assert.deepEqual(sorted, Array.from({ length: 20 }, (_, i) => i));
  });
});

describe('getDefaultColorForIndex', () => {
  it('returns banana yellow for term index 0', () => {
    assert.equal(getDefaultColorForIndex(0), '#FFEB3B');
  });

  it('returns royal blue for term index 1', () => {
    assert.equal(getDefaultColorForIndex(1), '#1976D2');
  });

  it('returns peach for term index 4', () => {
    assert.equal(getDefaultColorForIndex(4), '#FFCCBC');
  });

  it('wraps modulo palette length for indices ≥ 20', () => {
    assert.equal(getDefaultColorForIndex(20), getDefaultColorForIndex(0));
    assert.equal(getDefaultColorForIndex(21), getDefaultColorForIndex(1));
    assert.equal(getDefaultColorForIndex(40), getDefaultColorForIndex(0));
  });

  it('falls back to the first rotation slot for invalid indices', () => {
    const banana = '#FFEB3B';
    assert.equal(getDefaultColorForIndex(-1), banana);
    assert.equal(getDefaultColorForIndex(NaN), banana);
    assert.equal(getDefaultColorForIndex(Infinity), banana);
  });
});

describe('getContrastTextColor', () => {
  it('returns black on every light swatch', () => {
    for (const c of COLOR_PALETTE.filter((c) => c.isLight)) {
      assert.equal(getContrastTextColor(c.hex), '#000000', `light: ${c.name}`);
    }
  });

  it('returns white on every dark swatch', () => {
    for (const c of COLOR_PALETTE.filter((c) => !c.isLight)) {
      assert.equal(getContrastTextColor(c.hex), '#FFFFFF', `dark: ${c.name}`);
    }
  });

  it('handles lowercase hex input from the palette', () => {
    assert.equal(getContrastTextColor('#ffeb3b'), '#000000');
    assert.equal(getContrastTextColor('#1976d2'), '#FFFFFF');
  });

  it('falls back to luminance for off-palette hex (white background)', () => {
    assert.equal(getContrastTextColor('#FFFFFF'), '#000000');
  });

  it('falls back to luminance for off-palette hex (black background)', () => {
    assert.equal(getContrastTextColor('#000000'), '#FFFFFF');
  });
});

describe('relativeLuminance', () => {
  it('returns 1 for pure white', () => {
    assert.ok(Math.abs(relativeLuminance('#FFFFFF') - 1) < 0.001);
  });

  it('returns 0 for pure black', () => {
    assert.equal(relativeLuminance('#000000'), 0);
  });

  it('returns 0.5 for ill-formed input (deterministic fallback)', () => {
    assert.equal(relativeLuminance('not-a-hex'), 0.5);
    assert.equal(relativeLuminance('#GGG'), 0.5);
    assert.equal(relativeLuminance(''), 0.5);
  });
});

describe('findPaletteColor', () => {
  it('finds a palette entry by hex (uppercase match)', () => {
    const c = findPaletteColor('#FFEB3B');
    assert.equal(c?.name, 'Banana yellow');
  });

  it('finds a palette entry by hex (lowercase input)', () => {
    const c = findPaletteColor('#ffeb3b');
    assert.equal(c?.name, 'Banana yellow');
  });

  it('returns undefined for off-palette hex', () => {
    assert.equal(findPaletteColor('#123456'), undefined);
  });
});
