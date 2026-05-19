// Unit tests for captured-text-selector.ts — P-25 selector serialize +
// deserialize. node:test has no DOM, so we hand-build SelectorElement +
// SelectorText nodes that satisfy the helper's minimal interface (same
// pattern as find-underlying-image.test.ts).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  collectTextNodes,
  computeXPath,
  decodeSelector,
  deepestCommonElementAncestor,
  encodeSelector,
  flattenedOffsetWithin,
  formatXPath,
  isElement,
  nodeAtFlattenedOffset,
  parseXPath,
  resolveXPath,
  type SelectorElement,
  type SelectorNode,
  type SelectorText,
} from './captured-text-selector.ts';

// ─── Test DOM builders ──────────────────────────────────────────────────

function mkText(data: string): SelectorText {
  return { nodeType: 3, data, parentNode: null };
}

function mkEl(
  tagName: string,
  children: SelectorNode[] = []
): SelectorElement {
  const el: SelectorElement = {
    nodeType: 1,
    tagName,
    childNodes: children,
    parentNode: null,
  };
  for (const child of children) {
    if (isElement(child)) {
      child.parentNode = el;
    } else if (child.nodeType === 3) {
      (child as SelectorText).parentNode = el;
    }
  }
  return el;
}

// ─── encode / decode JSON wrapper ───────────────────────────────────────

describe('encodeSelector / decodeSelector', () => {
  it('round-trips a typical selector', () => {
    const sel = { xpath: '/DIV[1]/P[2]', startOffset: 3, endOffset: 42 };
    const round = decodeSelector(encodeSelector(sel));
    assert.deepEqual(round, sel);
  });

  it('encodes with stable field order', () => {
    const sel = { xpath: '/SPAN[1]', startOffset: 0, endOffset: 5 };
    assert.equal(
      encodeSelector(sel),
      '{"xpath":"/SPAN[1]","startOffset":0,"endOffset":5}'
    );
  });

  it('decodeSelector returns null on malformed JSON', () => {
    assert.equal(decodeSelector('not json'), null);
  });

  it('decodeSelector returns null when keys are missing', () => {
    assert.equal(
      decodeSelector('{"xpath":"/DIV[1]","startOffset":0}'),
      null
    );
  });

  it('decodeSelector returns null when types are wrong', () => {
    assert.equal(
      decodeSelector(
        '{"xpath":"/DIV[1]","startOffset":"3","endOffset":5}'
      ),
      null
    );
  });

  it('decodeSelector returns null when offsets are negative', () => {
    assert.equal(
      decodeSelector('{"xpath":"/DIV[1]","startOffset":-1,"endOffset":5}'),
      null
    );
  });

  it('decodeSelector returns null when end < start', () => {
    assert.equal(
      decodeSelector('{"xpath":"/DIV[1]","startOffset":10,"endOffset":5}'),
      null
    );
  });

  it('decodeSelector accepts equal start and end (zero-width range)', () => {
    const round = decodeSelector(
      '{"xpath":"/DIV[1]","startOffset":4,"endOffset":4}'
    );
    assert.deepEqual(round, {
      xpath: '/DIV[1]',
      startOffset: 4,
      endOffset: 4,
    });
  });
});

// ─── parseXPath / formatXPath ────────────────────────────────────────────

describe('parseXPath / formatXPath', () => {
  it('parses an empty path as the root', () => {
    assert.deepEqual(parseXPath(''), []);
    assert.deepEqual(parseXPath('/'), []);
  });

  it('parses a single-segment path with default index 1', () => {
    assert.deepEqual(parseXPath('/DIV'), [{ tagName: 'DIV', index: 1 }]);
  });

  it('parses multi-segment paths with explicit indexes', () => {
    assert.deepEqual(parseXPath('/DIV[2]/P[3]/SPAN[1]'), [
      { tagName: 'DIV', index: 2 },
      { tagName: 'P', index: 3 },
      { tagName: 'SPAN', index: 1 },
    ]);
  });

  it('returns null on a path that does not start with /', () => {
    assert.equal(parseXPath('DIV[1]'), null);
  });

  it('returns null on empty path segment', () => {
    assert.equal(parseXPath('/DIV[1]//P[1]'), null);
  });

  it('returns null on lowercase tag names', () => {
    assert.equal(parseXPath('/div[1]'), null);
  });

  it('returns null on zero or negative indexes', () => {
    assert.equal(parseXPath('/DIV[0]'), null);
  });

  it('formats steps back to canonical form', () => {
    assert.equal(
      formatXPath([
        { tagName: 'DIV', index: 2 },
        { tagName: 'P', index: 3 },
      ]),
      '/DIV[2]/P[3]'
    );
  });

  it('format of empty steps yields empty string', () => {
    assert.equal(formatXPath([]), '');
  });
});

// ─── XPath resolve / compute ─────────────────────────────────────────────

describe('resolveXPath / computeXPath', () => {
  // Build a small DOM:
  //   <BODY>
  //     <DIV>          (1st)
  //       <P>hello</P> (1st)
  //     </DIV>
  //     <DIV>          (2nd)
  //       <P>foo</P>   (1st)
  //       <P>bar</P>   (2nd)
  //     </DIV>
  //   </BODY>
  const p_hello = mkEl('P', [mkText('hello')]);
  const div1 = mkEl('DIV', [p_hello]);
  const p_foo = mkEl('P', [mkText('foo')]);
  const p_bar = mkEl('P', [mkText('bar')]);
  const div2 = mkEl('DIV', [p_foo, p_bar]);
  const body = mkEl('BODY', [div1, div2]);

  it('resolves the root (empty path) to root itself', () => {
    assert.equal(resolveXPath(body, []), body);
  });

  it('resolves /DIV[1] to the first DIV', () => {
    assert.equal(resolveXPath(body, parseXPath('/DIV[1]')!), div1);
  });

  it('resolves /DIV[2]/P[2] to the second P inside the second DIV', () => {
    assert.equal(resolveXPath(body, parseXPath('/DIV[2]/P[2]')!), p_bar);
  });

  it('returns null when an index past the last sibling is requested', () => {
    assert.equal(resolveXPath(body, parseXPath('/DIV[3]')!), null);
  });

  it('returns null when a step tag does not match any child', () => {
    assert.equal(resolveXPath(body, parseXPath('/SPAN[1]')!), null);
  });

  it('round-trips: computeXPath(resolveXPath(steps)) === path', () => {
    const path = '/DIV[2]/P[2]';
    const resolved = resolveXPath(body, parseXPath(path)!)!;
    assert.equal(computeXPath(body, resolved), path);
  });

  it('computeXPath(body, body) returns the empty path', () => {
    assert.equal(computeXPath(body, body), '');
  });
});

// ─── collectTextNodes + offset helpers ───────────────────────────────────

describe('collectTextNodes / flattenedOffsetWithin / nodeAtFlattenedOffset', () => {
  // <DIV>
  //   <SPAN>Premium </SPAN>
  //   <SPAN>quality </SPAN>
  //   <B>protein</B>
  // </DIV>
  // Flattened text: "Premium quality protein" (lengths 8 + 8 + 7 = 23)
  const t_premium = mkText('Premium ');
  const t_quality = mkText('quality ');
  const t_protein = mkText('protein');
  const span_premium = mkEl('SPAN', [t_premium]);
  const span_quality = mkEl('SPAN', [t_quality]);
  const b_protein = mkEl('B', [t_protein]);
  const div = mkEl('DIV', [span_premium, span_quality, b_protein]);

  it('collectTextNodes walks descendants in document order', () => {
    const texts = collectTextNodes(div);
    assert.equal(texts.length, 3);
    assert.equal(texts[0], t_premium);
    assert.equal(texts[1], t_quality);
    assert.equal(texts[2], t_protein);
  });

  it('flattenedOffsetWithin: offset 0 in first text node is 0', () => {
    assert.equal(flattenedOffsetWithin(div, t_premium, 0), 0);
  });

  it('flattenedOffsetWithin: offset 3 in second text node is 11', () => {
    // "Premium " (8) + first 3 chars of "quality " = 11.
    assert.equal(flattenedOffsetWithin(div, t_quality, 3), 11);
  });

  it('flattenedOffsetWithin: end of last text node is total length', () => {
    assert.equal(flattenedOffsetWithin(div, t_protein, 7), 23);
  });

  it('nodeAtFlattenedOffset: 0 lands at start of first text node', () => {
    const got = nodeAtFlattenedOffset(div, 0);
    assert.deepEqual(got, { node: t_premium, offsetInNode: 0 });
  });

  it('nodeAtFlattenedOffset: 11 lands inside second text node', () => {
    const got = nodeAtFlattenedOffset(div, 11);
    assert.deepEqual(got, { node: t_quality, offsetInNode: 3 });
  });

  it('nodeAtFlattenedOffset: total length lands at end of last text node', () => {
    const got = nodeAtFlattenedOffset(div, 23);
    assert.deepEqual(got, { node: t_protein, offsetInNode: 7 });
  });

  it('nodeAtFlattenedOffset returns null past end (DOM shrunk)', () => {
    assert.equal(nodeAtFlattenedOffset(div, 100), null);
  });

  it('nodeAtFlattenedOffset returns null on negative input', () => {
    assert.equal(nodeAtFlattenedOffset(div, -1), null);
  });
});

// ─── deepestCommonElementAncestor ───────────────────────────────────────

describe('deepestCommonElementAncestor', () => {
  it('returns the closest shared parent when nodes are siblings', () => {
    const t1 = mkText('a');
    const t2 = mkText('b');
    const span = mkEl('SPAN', [t1, t2]);
    assert.equal(deepestCommonElementAncestor(t1, t2), span);
  });

  it('returns null when nodes have no shared ancestor', () => {
    const t1 = mkText('a');
    const t2 = mkText('b');
    mkEl('DIV', [t1]);
    mkEl('DIV', [t2]);
    assert.equal(deepestCommonElementAncestor(t1, t2), null);
  });

  it('returns the deeper of the two when one is ancestor of the other', () => {
    // text inside SPAN inside DIV — common ancestor of (DIV, text) is DIV.
    const t = mkText('x');
    const span = mkEl('SPAN', [t]);
    const div = mkEl('DIV', [span]);
    assert.equal(deepestCommonElementAncestor(div, t), div);
  });
});
