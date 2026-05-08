// Pure-logic tests for the live-page highlight-terms regex + color map.
// DOM-touching functions (applyHighlightsTo, removeAllHighlights,
// startLiveHighlighting) are verified end-to-end in-browser during the
// Waypoint #1 attempt #4 re-verify pass.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildColorMap,
  buildHighlightRegex,
} from './highlight-terms.ts';
import type { HighlightTerm } from '../highlight-terms.ts';

const term = (t: string, color = '#FFEB3B'): HighlightTerm => ({
  term: t,
  color,
});

describe('buildHighlightRegex', () => {
  it('returns null for empty list', () => {
    assert.equal(buildHighlightRegex([]), null);
  });

  it('returns null when all terms are blank or whitespace', () => {
    assert.equal(buildHighlightRegex([term(''), term('   ')]), null);
  });

  it('returns null for null/undefined safely', () => {
    // @ts-expect-error testing runtime guard
    assert.equal(buildHighlightRegex(null), null);
    // @ts-expect-error testing runtime guard
    assert.equal(buildHighlightRegex(undefined), null);
  });

  it('matches a single word case-insensitively', () => {
    const re = buildHighlightRegex([term('therapy')])!;
    // Reset between assertions — global flag makes test() stateful.
    re.lastIndex = 0;
    assert.ok(re.test('Therapy is good'));
    re.lastIndex = 0;
    assert.ok(re.test('THERAPY'));
    re.lastIndex = 0;
    assert.ok(re.test('use therapy daily'));
  });

  it('respects word boundaries — does NOT match inside a longer word', () => {
    const re = buildHighlightRegex([term('cat')])!;
    assert.equal(re.test('category'), false);
    assert.equal(re.test('concatenate'), false);
    re.lastIndex = 0;
    assert.equal(re.test('the cat sat'), true);
  });

  it('matches a multi-word phrase', () => {
    const re = buildHighlightRegex([term('red light therapy')])!;
    assert.ok(re.test('Red Light Therapy device'));
    re.lastIndex = 0;
    assert.equal(re.test('red therapy'), false);
  });

  it('multi-word phrase tolerates whitespace variations', () => {
    const re = buildHighlightRegex([term('red light therapy')])!;
    // Multiple spaces
    assert.ok(re.test('red  light   therapy device'));
    re.lastIndex = 0;
    // Non-breaking space
    assert.ok(re.test('red light therapy device'));
    re.lastIndex = 0;
    // Newline (HTML inline rendering can produce these)
    assert.ok(re.test('red\nlight\ntherapy'));
  });

  it('longest term wins on overlapping alternation', () => {
    // With both "red" and "red light therapy" registered, the multi-word
    // term should match the full phrase rather than just "red". Pull all
    // matches from the same input and verify the first one is the longest.
    const re = buildHighlightRegex([
      term('red'),
      term('red light therapy'),
    ])!;
    const matches = Array.from('I bought a red light therapy lamp'.matchAll(re));
    assert.equal(matches.length, 1);
    assert.equal(matches[0]![0], 'red light therapy');
  });

  it('escapes regex metacharacters in user-supplied terms', () => {
    // A term with regex special characters must match literally, not as a regex.
    const re = buildHighlightRegex([term('100% off')])!;
    assert.ok(re.test('Sale: 100% off today'));
    re.lastIndex = 0;
    // The escaped form should NOT match arbitrary characters where % was.
    assert.equal(re.test('100x off'), false);
  });

  it('matches multiple distinct terms in one pass', () => {
    const re = buildHighlightRegex([
      term('lamp', '#FFEB3B'),
      term('therapy', '#1976D2'),
    ])!;
    const matches = Array.from(
      'red light therapy lamp from a therapy company'.matchAll(re),
    );
    assert.equal(matches.length, 3); // therapy, lamp, therapy
    assert.equal(matches[0]![0].toLowerCase(), 'therapy');
    assert.equal(matches[1]![0].toLowerCase(), 'lamp');
    assert.equal(matches[2]![0].toLowerCase(), 'therapy');
  });

  it('hyphenated term matches as a whole unit', () => {
    const re = buildHighlightRegex([term('near-infrared')])!;
    assert.ok(re.test('Near-Infrared light therapy'));
  });

  it('skips blank terms but keeps non-blank siblings', () => {
    const re = buildHighlightRegex([
      term(''),
      term('therapy'),
      term('   '),
    ])!;
    assert.ok(re.test('therapy works'));
  });
});

describe('buildColorMap', () => {
  it('maps lowercased term to color', () => {
    const map = buildColorMap([term('Red Light', '#FFEB3B')]);
    assert.equal(map.get('red light'), '#FFEB3B');
  });

  it('skips blank/empty terms', () => {
    const map = buildColorMap([term(''), term('   '), term('lamp', '#1976D2')]);
    assert.equal(map.size, 1);
    assert.equal(map.get('lamp'), '#1976D2');
  });

  it('case-collision: later entry wins', () => {
    const map = buildColorMap([
      term('Lamp', '#FFEB3B'),
      term('LAMP', '#1976D2'),
    ]);
    assert.equal(map.size, 1);
    assert.equal(map.get('lamp'), '#1976D2');
  });

  it('returns empty map for empty input', () => {
    assert.equal(buildColorMap([]).size, 0);
  });

  it('handles null/undefined entries safely', () => {
    const map = buildColorMap([
      // @ts-expect-error testing runtime guard
      null,
      term('therapy', '#388E3C'),
    ]);
    assert.equal(map.get('therapy'), '#388E3C');
  });
});
