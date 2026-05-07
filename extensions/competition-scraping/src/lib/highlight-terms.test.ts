import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mergeWithExisting,
  parseTermInput,
  removeTermAt,
  setColorAt,
  type HighlightTerm,
} from './highlight-terms.ts';

describe('parseTermInput', () => {
  it('returns [] for empty / whitespace input', () => {
    assert.deepEqual(parseTermInput(''), []);
    assert.deepEqual(parseTermInput('   '), []);
    assert.deepEqual(parseTermInput('\n\n\n'), []);
    assert.deepEqual(parseTermInput(',,,'), []);
  });

  it('splits on commas', () => {
    assert.deepEqual(parseTermInput('alpha, beta,gamma'), [
      'alpha',
      'beta',
      'gamma',
    ]);
  });

  it('splits on newlines', () => {
    assert.deepEqual(parseTermInput('alpha\nbeta\ngamma'), [
      'alpha',
      'beta',
      'gamma',
    ]);
  });

  it('splits on a mix of commas and newlines', () => {
    assert.deepEqual(parseTermInput('alpha,\nbeta\n, gamma'), [
      'alpha',
      'beta',
      'gamma',
    ]);
  });

  it('trims whitespace around each term', () => {
    assert.deepEqual(parseTermInput('  alpha  ,  beta  '), ['alpha', 'beta']);
  });

  it('dedupes case-insensitively, preserving first-seen casing', () => {
    assert.deepEqual(parseTermInput('Alpha, alpha, ALPHA, Beta'), [
      'Alpha',
      'Beta',
    ]);
  });

  it('handles non-string input defensively', () => {
    // @ts-expect-error testing runtime guard
    assert.deepEqual(parseTermInput(null), []);
    // @ts-expect-error testing runtime guard
    assert.deepEqual(parseTermInput(undefined), []);
    // @ts-expect-error testing runtime guard
    assert.deepEqual(parseTermInput(42), []);
  });
});

describe('mergeWithExisting', () => {
  it('appends new terms with default colors continuing the rotation', () => {
    const out = mergeWithExisting([], ['alpha', 'beta', 'gamma']);
    assert.deepEqual(out, [
      { term: 'alpha', color: '#FFEB3B' }, // banana
      { term: 'beta', color: '#1976D2' }, // royal blue
      { term: 'gamma', color: '#C8E6C9' }, // mint
    ]);
  });

  it('continues color rotation from where the existing list left off', () => {
    const existing: HighlightTerm[] = [
      { term: 'alpha', color: '#FFEB3B' },
      { term: 'beta', color: '#1976D2' },
    ];
    const out = mergeWithExisting(existing, ['gamma']);
    // Existing length is 2 → next default color is rotation[2] = mint
    assert.equal(out.length, 3);
    assert.equal(out[2]!.color, '#C8E6C9');
  });

  it('skips incoming terms that already exist (case-insensitive)', () => {
    const existing: HighlightTerm[] = [{ term: 'Alpha', color: '#FFEB3B' }];
    const out = mergeWithExisting(existing, ['ALPHA', 'beta']);
    assert.equal(out.length, 2);
    assert.equal(out[0]!.term, 'Alpha'); // unchanged
    assert.equal(out[1]!.term, 'beta');
  });

  it('preserves existing color choices when the user has overridden one', () => {
    const existing: HighlightTerm[] = [
      { term: 'alpha', color: '#455A64' }, // user picked Slate manually
    ];
    const out = mergeWithExisting(existing, ['beta']);
    assert.equal(out[0]!.color, '#455A64');
    assert.equal(out[1]!.color, '#1976D2'); // royal blue (rotation[1])
  });

  it('returns a copy of existing when incoming is empty', () => {
    const existing: HighlightTerm[] = [{ term: 'alpha', color: '#FFEB3B' }];
    const out = mergeWithExisting(existing, []);
    assert.deepEqual(out, existing);
    assert.notEqual(out, existing); // not the same reference
  });
});

describe('removeTermAt', () => {
  const list: HighlightTerm[] = [
    { term: 'alpha', color: '#FFEB3B' },
    { term: 'beta', color: '#1976D2' },
    { term: 'gamma', color: '#C8E6C9' },
  ];

  it('removes the term at the given index', () => {
    const out = removeTermAt(list, 1);
    assert.deepEqual(
      out.map((t) => t.term),
      ['alpha', 'gamma'],
    );
  });

  it('returns a copy unchanged for out-of-bounds index', () => {
    const out = removeTermAt(list, 99);
    assert.deepEqual(out, list);
    assert.notEqual(out, list);
  });

  it('returns a copy unchanged for negative index', () => {
    const out = removeTermAt(list, -1);
    assert.deepEqual(out, list);
  });

  it('returns a copy unchanged for non-integer index', () => {
    const out = removeTermAt(list, 1.5);
    assert.deepEqual(out, list);
  });
});

describe('setColorAt', () => {
  const list: HighlightTerm[] = [
    { term: 'alpha', color: '#FFEB3B' },
    { term: 'beta', color: '#1976D2' },
  ];

  it('updates the color at the given index', () => {
    const out = setColorAt(list, 0, '#455A64');
    assert.equal(out[0]!.color, '#455A64');
    assert.equal(out[0]!.term, 'alpha'); // term unchanged
    assert.equal(out[1]!.color, '#1976D2'); // other unchanged
  });

  it('returns a copy unchanged for out-of-bounds index', () => {
    const out = setColorAt(list, 5, '#455A64');
    assert.deepEqual(out, list);
  });

  it('does not mutate the input list', () => {
    setColorAt(list, 0, '#455A64');
    assert.equal(list[0]!.color, '#FFEB3B');
  });
});
