// Unit tests for find-underlying-image.ts — the P-23 element-walk helper
// that resolves an underlying <img> from a non-image right-click target on
// Amazon's overlay-wrapped product listings.
//
// The helper only touches a tiny slice of the Element interface: tagName,
// parentElement, querySelector('img'), and on HTMLImageElement the
// currentSrc + src properties. So we test with hand-built plain-object
// stubs cast through Element/HTMLImageElement instead of pulling in jsdom.
// The node --test runner doesn't have a DOM by default; same shape as the
// other content-script pure-logic tests in this directory.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { findUnderlyingImage } from './find-underlying-image.ts';

interface FakeElement {
  tagName: string;
  parentElement: FakeElement | null;
  /** Returned for any querySelector('img') call. null = no descendant img. */
  descendantImg: FakeImg | null;
  /** Implements Element#querySelector enough for the helper. */
  querySelector(selector: string): FakeImg | null;
}

interface FakeImg extends FakeElement {
  tagName: 'IMG';
  currentSrc: string;
  src: string;
}

function makeEl(opts: {
  tagName: string;
  parentElement?: FakeElement | null;
  descendantImg?: FakeImg | null;
}): FakeElement {
  const el: FakeElement = {
    tagName: opts.tagName,
    parentElement: opts.parentElement ?? null,
    descendantImg: opts.descendantImg ?? null,
    querySelector(selector: string): FakeImg | null {
      if (selector === 'img') return this.descendantImg;
      return null;
    },
  };
  return el;
}

function makeImg(opts: {
  currentSrc?: string;
  src?: string;
  parentElement?: FakeElement | null;
}): FakeImg {
  return {
    tagName: 'IMG',
    currentSrc: opts.currentSrc ?? '',
    src: opts.src ?? '',
    parentElement: opts.parentElement ?? null,
    descendantImg: null,
    querySelector(_selector: string): FakeImg | null {
      return null;
    },
  };
}

describe('findUnderlyingImage', () => {
  it('returns null when target is null', () => {
    assert.equal(findUnderlyingImage(null), null);
  });

  it('returns the src when target is itself a usable <img>', () => {
    const img = makeImg({
      currentSrc: 'https://m.media-amazon.com/images/I/hero.jpg',
      src: 'https://m.media-amazon.com/images/I/hero.jpg',
    });
    assert.equal(
      findUnderlyingImage(img as unknown as Element),
      'https://m.media-amazon.com/images/I/hero.jpg',
    );
  });

  it('prefers currentSrc over src on the img element', () => {
    const img = makeImg({
      currentSrc: 'https://cdn/picked-by-srcset.jpg',
      src: 'https://cdn/raw-attribute.jpg',
    });
    assert.equal(
      findUnderlyingImage(img as unknown as Element),
      'https://cdn/picked-by-srcset.jpg',
    );
  });

  it('falls back to src when currentSrc is empty', () => {
    const img = makeImg({
      currentSrc: '',
      src: 'https://cdn/raw.jpg',
    });
    assert.equal(
      findUnderlyingImage(img as unknown as Element),
      'https://cdn/raw.jpg',
    );
  });

  it('returns null for an <img> with both src and currentSrc empty', () => {
    const img = makeImg({ currentSrc: '', src: '' });
    assert.equal(findUnderlyingImage(img as unknown as Element), null);
  });

  it('walks up to find an <img> ancestor', () => {
    // <a><img></a> shape — right-click landed on the <a> wrapper.
    const img = makeImg({ src: 'https://cdn/wrapped.jpg' });
    const anchor = makeEl({
      tagName: 'A',
      descendantImg: img,
    });
    assert.equal(
      findUnderlyingImage(anchor as unknown as Element),
      'https://cdn/wrapped.jpg',
    );
  });

  it('finds an <img> sibling via the ancestor descendant-scan (Amazon overlay pattern)', () => {
    // <div class="zoom-container">
    //   <div id="overlay-shield"></div>   ← right-click landed here
    //   <img id="hero" src="...">         ← sibling, not ancestor
    // </div>
    const img = makeImg({ src: 'https://m.media-amazon.com/images/I/hero.jpg' });
    const zoomContainer = makeEl({
      tagName: 'DIV',
      descendantImg: img,
    });
    const overlayShield = makeEl({
      tagName: 'DIV',
      parentElement: zoomContainer,
      // overlay-shield itself has no descendants
      descendantImg: null,
    });
    assert.equal(
      findUnderlyingImage(overlayShield as unknown as Element),
      'https://m.media-amazon.com/images/I/hero.jpg',
    );
  });

  it('returns null when no <img> is reachable within the walk depth', () => {
    // Deep tree with no images anywhere.
    let current: FakeElement = makeEl({ tagName: 'DIV', descendantImg: null });
    for (let i = 0; i < 5; i++) {
      current = makeEl({
        tagName: 'DIV',
        parentElement: current,
        descendantImg: null,
      });
    }
    assert.equal(findUnderlyingImage(current as unknown as Element), null);
  });

  it('stops at MAX_ANCESTOR_DEPTH (does not climb past 10 levels)', () => {
    // Build a chain of 15 ancestors with the <img> at the very top.
    // The helper should NOT find it (climb is bounded at 10).
    const img = makeImg({ src: 'https://cdn/way-up-the-tree.jpg' });
    const farAncestor = makeEl({
      tagName: 'BODY',
      descendantImg: img,
    });
    let current: FakeElement = farAncestor;
    for (let i = 0; i < 15; i++) {
      // Build descendant chain BENEATH farAncestor (so the helper climbs UP
      // through 15 levels before reaching farAncestor's descendant-scan).
      const child: FakeElement = makeEl({
        tagName: 'DIV',
        parentElement: current,
        descendantImg: null,
      });
      current = child;
    }
    // `current` is now 15 levels below farAncestor; walking up from `current`
    // hits MAX_ANCESTOR_DEPTH (10) before reaching farAncestor.
    assert.equal(findUnderlyingImage(current as unknown as Element), null);
  });

  it('non-element non-img targets with no parent return null', () => {
    const div = makeEl({ tagName: 'DIV', descendantImg: null });
    assert.equal(findUnderlyingImage(div as unknown as Element), null);
  });

  it('preserves Walmart/eBay/Etsy direct-image behavior — img target unchanged', () => {
    // Sanity regression: the non-Amazon platforms today right-click the
    // <img> directly. Helper returns the same src as Chrome would put in
    // info.srcUrl, so the orchestrator handler's cache (when consulted) is
    // a no-op fallback path.
    const directImg = makeImg({
      currentSrc: 'https://i5.walmartimages.com/asr/hero.jpg',
      src: 'https://i5.walmartimages.com/asr/hero.jpg',
    });
    assert.equal(
      findUnderlyingImage(directImg as unknown as Element),
      'https://i5.walmartimages.com/asr/hero.jpg',
    );
  });
});
