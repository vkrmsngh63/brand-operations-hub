// P-24 unit tests for already-saved-image-icon.ts.
//
// Hand-built fake DOM following the same pattern as
// already-saved-overlay.test.ts and find-underlying-image.test.ts. The
// helper module touches `document.createElement`, `document.body.appendChild`,
// `document.querySelector`, and per-element `getBoundingClientRect` /
// `getAttribute` / `setAttribute` — all of which we stub.

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  attachAlreadySavedImageIcon,
  detachAlreadySavedImageIcon,
  detachAllAlreadySavedImageIcons,
  reposition,
} from './already-saved-image-icon.ts';

interface FakeElement {
  tagName: string;
  className: string;
  textContent: string;
  title: string;
  style: Record<string, string>;
  removed: boolean;
  attributes: Record<string, string>;
  children: FakeElement[];
  parentNode: FakeElement | null;
  rect: { top: number; left: number; right: number; bottom: number; width: number; height: number };
  currentSrc: string;
  src: string;
  appendChild(child: FakeElement): void;
  remove(): void;
  setAttribute(name: string, value: string): void;
  getAttribute(name: string): string | null;
  removeAttribute(name: string): void;
  getBoundingClientRect(): { top: number; left: number; right: number; bottom: number; width: number; height: number };
}

function makeFakeElement(
  overrides: Partial<FakeElement> = {},
): FakeElement {
  const el: FakeElement = {
    tagName: overrides.tagName ?? 'DIV',
    className: '',
    textContent: '',
    title: '',
    style: {},
    removed: false,
    attributes: {},
    children: [],
    parentNode: null,
    rect: overrides.rect ?? {
      top: 100,
      left: 200,
      right: 320,
      bottom: 220,
      width: 120,
      height: 120,
    },
    currentSrc: overrides.currentSrc ?? '',
    src: overrides.src ?? '',
    appendChild(child) {
      this.children.push(child);
      child.parentNode = this;
    },
    remove() {
      this.removed = true;
      if (this.parentNode) {
        const idx = this.parentNode.children.indexOf(this);
        if (idx >= 0) this.parentNode.children.splice(idx, 1);
        this.parentNode = null;
      }
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    getAttribute(name) {
      return this.attributes[name] ?? null;
    },
    removeAttribute(name) {
      delete this.attributes[name];
    },
    getBoundingClientRect() {
      return this.rect;
    },
  };
  return el;
}

interface FakeDocument {
  body: FakeElement;
  createdElements: FakeElement[];
  createElement(tag: string): FakeElement;
  querySelector(selector: string): FakeElement | null;
  querySelectorAll(selector: string): FakeElement[];
}

function makeFakeDocument(): FakeDocument {
  const created: FakeElement[] = [];
  const body = makeFakeElement({ tagName: 'BODY' });
  function findInTree(
    root: FakeElement,
    pred: (el: FakeElement) => boolean,
  ): FakeElement[] {
    const out: FakeElement[] = [];
    function walk(el: FakeElement): void {
      if (el.removed) return;
      if (pred(el)) out.push(el);
      for (const c of el.children) walk(c);
    }
    walk(root);
    return out;
  }
  return {
    body,
    createdElements: created,
    createElement(tag) {
      const el = makeFakeElement({ tagName: tag.toUpperCase() });
      created.push(el);
      return el;
    },
    querySelector(selector) {
      const matches = matchSelector(body, selector, findInTree);
      return matches[0] ?? null;
    },
    querySelectorAll(selector) {
      return matchSelector(body, selector, findInTree);
    },
  };
}

function matchSelector(
  root: FakeElement,
  selector: string,
  findInTree: (
    root: FakeElement,
    pred: (el: FakeElement) => boolean,
  ) => FakeElement[],
): FakeElement[] {
  // Minimal selector parser sufficient for the queries the helper makes:
  //   - `.plos-cs-saved-image-icon`
  //   - `.plos-cs-saved-image-icon[data-plos-cs-image-icon-for="<value>"]`
  //   - `img[data-plos-cs-image-has-icon="<value>"]`
  //   - `[data-plos-cs-image-has-icon]`
  const classMatch = selector.match(/^\.([\w-]+)/);
  const tagMatch = selector.match(/^([a-z]+)\b/i);
  const attrMatch = selector.match(
    /\[([\w-]+)(?:="([^"]*)")?\]/,
  );
  const className = classMatch?.[1];
  const tagName = tagMatch?.[1];
  const attrName = attrMatch?.[1];
  const attrValue = attrMatch?.[2];
  return findInTree(root, (el) => {
    if (className !== undefined && el.className !== className) return false;
    if (tagName !== undefined && el.tagName.toLowerCase() !== tagName.toLowerCase())
      return false;
    if (attrName !== undefined) {
      if (attrValue !== undefined) {
        if (el.attributes[attrName] !== attrValue) return false;
      } else {
        if (!(attrName in el.attributes)) return false;
      }
    }
    return true;
  });
}

let originalDocument: unknown;
let originalCss: unknown;
let fakeDoc: FakeDocument;

function installDocumentStub(): void {
  originalDocument = (globalThis as { document?: unknown }).document;
  fakeDoc = makeFakeDocument();
  (globalThis as { document: unknown }).document = fakeDoc;
  // Stub CSS.escape; the helper has a fallback for when it's missing.
  originalCss = (globalThis as { CSS?: unknown }).CSS;
  (globalThis as { CSS: { escape: (s: string) => string } }).CSS = {
    escape: (s: string) => s.replace(/["\\]/g, '\\$&'),
  };
}

function restoreDocument(): void {
  (globalThis as { document?: unknown }).document = originalDocument;
  (globalThis as { CSS?: unknown }).CSS = originalCss;
}

describe('reposition', () => {
  it('writes top/left from getBoundingClientRect with proper offsets', () => {
    const icon = makeFakeElement();
    const img = makeFakeElement({
      tagName: 'IMG',
      rect: { top: 50, left: 100, right: 250, bottom: 200, width: 150, height: 150 },
    });
    reposition(icon as unknown as HTMLElement, img as unknown as HTMLImageElement);
    // top = max(2, 50 - 6) = 44; left = max(2, 250 - 22) = 228
    assert.equal(icon.style.top, '44px');
    assert.equal(icon.style.left, '228px');
    assert.equal(icon.style.display, 'inline-flex');
  });

  it('hides icon when img has zero geometry (lazy-load not yet rendered)', () => {
    const icon = makeFakeElement();
    icon.style.display = 'inline-flex';
    const img = makeFakeElement({
      tagName: 'IMG',
      rect: { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 },
    });
    reposition(icon as unknown as HTMLElement, img as unknown as HTMLImageElement);
    assert.equal(icon.style.display, 'none');
  });

  it('clamps negative top/left to a 2px minimum (image scrolled off-screen)', () => {
    const icon = makeFakeElement();
    const img = makeFakeElement({
      tagName: 'IMG',
      rect: { top: -100, left: -50, right: 10, bottom: -50, width: 60, height: 50 },
    });
    reposition(icon as unknown as HTMLElement, img as unknown as HTMLImageElement);
    // top = max(2, -100 - 6) = 2; left = max(2, 10 - 22) = 2
    assert.equal(icon.style.top, '2px');
    assert.equal(icon.style.left, '2px');
  });
});

describe('attachAlreadySavedImageIcon', () => {
  beforeEach(() => {
    installDocumentStub();
  });
  afterEach(() => {
    restoreDocument();
  });

  it('returns null when the image has zero geometry (skips attach until rendered)', () => {
    const img = makeFakeElement({
      tagName: 'IMG',
      rect: { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 },
    });
    const result = attachAlreadySavedImageIcon(
      img as unknown as HTMLImageElement,
      'row-1',
    );
    assert.equal(result, null);
    assert.equal(fakeDoc.body.children.length, 0);
  });

  it('creates an icon with correct class, attributes, and ✓ text when image has geometry', () => {
    const img = makeFakeElement({ tagName: 'IMG' });
    const result = attachAlreadySavedImageIcon(
      img as unknown as HTMLImageElement,
      'row-1',
    );
    assert.ok(result, 'returned an attached-icon record');
    assert.equal(fakeDoc.createdElements.length, 1);
    const icon = fakeDoc.createdElements[0]!;
    assert.equal(icon.className, 'plos-cs-saved-image-icon');
    assert.equal(icon.textContent, '✓');
    assert.equal(icon.attributes['data-plos-cs-image-icon-for'], 'row-1');
    assert.equal(icon.title, 'Already saved to PLOS');
    // Image gets the recognition flag so subsequent rescans can skip.
    assert.equal(img.attributes['data-plos-cs-image-has-icon'], 'row-1');
    // Icon is appended to body, not to the image's parent.
    assert.equal(fakeDoc.body.children.length, 1);
    assert.equal(fakeDoc.body.children[0], icon);
  });

  it('is idempotent — re-attaching the same (img, savedImageId) does not double-create', () => {
    const img = makeFakeElement({ tagName: 'IMG' });
    attachAlreadySavedImageIcon(img as unknown as HTMLImageElement, 'row-1');
    const beforeCount = fakeDoc.createdElements.length;
    attachAlreadySavedImageIcon(img as unknown as HTMLImageElement, 'row-1');
    assert.equal(fakeDoc.createdElements.length, beforeCount);
  });

  it('positions icon top/left based on img.getBoundingClientRect()', () => {
    const img = makeFakeElement({
      tagName: 'IMG',
      rect: { top: 200, left: 300, right: 460, bottom: 360, width: 160, height: 160 },
    });
    attachAlreadySavedImageIcon(img as unknown as HTMLImageElement, 'row-1');
    const icon = fakeDoc.createdElements[0]!;
    // top = max(2, 200 - 6) = 194; left = max(2, 460 - 22) = 438
    assert.equal(icon.style.top, '194px');
    assert.equal(icon.style.left, '438px');
  });
});

describe('detachAlreadySavedImageIcon', () => {
  beforeEach(() => {
    installDocumentStub();
  });
  afterEach(() => {
    restoreDocument();
  });

  it('removes the icon for the named savedImageId', () => {
    const img = makeFakeElement({ tagName: 'IMG' });
    // querySelectorAll('img[…]') walks the body tree, so the img has to
    // live in it for the flag-clearing pass to reach it.
    fakeDoc.body.appendChild(img);
    attachAlreadySavedImageIcon(img as unknown as HTMLImageElement, 'row-1');
    assert.equal(fakeDoc.body.children.length, 2); // img + icon
    detachAlreadySavedImageIcon('row-1');
    // Icon removed; img remains.
    assert.equal(fakeDoc.body.children.length, 1);
    assert.equal(fakeDoc.body.children[0]?.tagName, 'IMG');
    assert.equal(img.attributes['data-plos-cs-image-has-icon'], undefined);
  });

  it('is a no-op when no icon exists for the id', () => {
    detachAlreadySavedImageIcon('does-not-exist');
    assert.equal(fakeDoc.body.children.length, 0);
  });
});

describe('detachAllAlreadySavedImageIcons', () => {
  beforeEach(() => {
    installDocumentStub();
  });
  afterEach(() => {
    restoreDocument();
  });

  it('clears every icon and recognition flag in one pass', () => {
    const img1 = makeFakeElement({ tagName: 'IMG' });
    const img2 = makeFakeElement({ tagName: 'IMG' });
    fakeDoc.body.appendChild(img1);
    fakeDoc.body.appendChild(img2);
    attachAlreadySavedImageIcon(img1 as unknown as HTMLImageElement, 'row-1');
    attachAlreadySavedImageIcon(img2 as unknown as HTMLImageElement, 'row-2');
    // body now has [img1, img2, icon1, icon2]
    assert.equal(fakeDoc.body.children.length, 4);
    detachAllAlreadySavedImageIcons();
    // Both icons removed; imgs remain.
    const remaining = fakeDoc.body.children.map((c) => c.tagName);
    assert.deepEqual(remaining, ['IMG', 'IMG']);
    assert.equal(img1.attributes['data-plos-cs-image-has-icon'], undefined);
    assert.equal(img2.attributes['data-plos-cs-image-has-icon'], undefined);
  });
});
