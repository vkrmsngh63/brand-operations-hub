// Unit tests for find-underlying-video-embed.ts — the P-27 (2026-05-22)
// element-walk helper that resolves an underlying <video> OR a recognized
// video-embed <iframe> from a right-click target.
//
// Same fake-element pattern as find-underlying-image.test.ts: the helper
// only touches a tiny slice of the Element interface (tagName,
// parentElement, querySelector('video'), querySelectorAll('iframe'),
// querySelectorAll('source')), plus the HTMLVideoElement currentSrc + src
// properties and the HTMLIFrameElement src + HTMLSourceElement
// getAttribute('type'). We test with hand-built plain-object stubs cast
// through Element / HTMLVideoElement / HTMLIFrameElement / HTMLSourceElement
// instead of pulling in jsdom — the node --test runner has no DOM by
// default and the rest of this directory follows the same pattern.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { findUnderlyingVideoEmbed } from './find-underlying-video-embed.ts';

interface FakeElement {
  tagName: string;
  parentElement: FakeElement | null;
  /** Returned for querySelector('video') — first descendant <video> or null. */
  descendantVideo: FakeVideo | null;
  /** Returned for querySelectorAll('iframe') — descendant <iframe>s or []. */
  descendantIframes: FakeIframe[];
  /** Implements Element#querySelector enough for the helper. */
  querySelector(selector: string): FakeVideo | null;
  /** Implements Element#querySelectorAll enough for the helper. */
  querySelectorAll(selector: string): readonly FakeElement[];
}

interface FakeSource extends FakeElement {
  tagName: 'SOURCE';
  type: string | null;
  getAttribute(name: string): string | null;
}

interface FakeVideo extends FakeElement {
  tagName: 'VIDEO';
  currentSrc: string;
  src: string;
  sources: FakeSource[];
}

interface FakeIframe extends FakeElement {
  tagName: 'IFRAME';
  src: string;
}

function makeEl(opts: {
  tagName: string;
  parentElement?: FakeElement | null;
  descendantVideo?: FakeVideo | null;
  descendantIframes?: FakeIframe[];
}): FakeElement {
  const el: FakeElement = {
    tagName: opts.tagName,
    parentElement: opts.parentElement ?? null,
    descendantVideo: opts.descendantVideo ?? null,
    descendantIframes: opts.descendantIframes ?? [],
    querySelector(selector: string): FakeVideo | null {
      if (selector === 'video') return this.descendantVideo;
      return null;
    },
    querySelectorAll(selector: string): readonly FakeElement[] {
      if (selector === 'iframe') return this.descendantIframes;
      if (selector === 'source') return [];
      return [];
    },
  };
  return el;
}

function makeSource(type: string | null): FakeSource {
  return {
    tagName: 'SOURCE',
    parentElement: null,
    descendantVideo: null,
    descendantIframes: [],
    type,
    querySelector(_selector: string): FakeVideo | null {
      return null;
    },
    querySelectorAll(_selector: string): readonly FakeElement[] {
      return [];
    },
    getAttribute(name: string): string | null {
      if (name === 'type') return this.type;
      return null;
    },
  };
}

function makeVideo(opts: {
  currentSrc?: string;
  src?: string;
  parentElement?: FakeElement | null;
  sources?: FakeSource[];
}): FakeVideo {
  const sources = opts.sources ?? [];
  const video: FakeVideo = {
    tagName: 'VIDEO',
    currentSrc: opts.currentSrc ?? '',
    src: opts.src ?? '',
    parentElement: opts.parentElement ?? null,
    descendantVideo: null,
    descendantIframes: [],
    sources,
    querySelector(_selector: string): FakeVideo | null {
      return null;
    },
    querySelectorAll(selector: string): readonly FakeElement[] {
      if (selector === 'source') return sources;
      if (selector === 'iframe') return [];
      return [];
    },
  };
  return video;
}

function makeIframe(opts: {
  src?: string;
  parentElement?: FakeElement | null;
}): FakeIframe {
  return {
    tagName: 'IFRAME',
    src: opts.src ?? '',
    parentElement: opts.parentElement ?? null,
    descendantVideo: null,
    descendantIframes: [],
    querySelector(_selector: string): FakeVideo | null {
      return null;
    },
    querySelectorAll(_selector: string): readonly FakeElement[] {
      return [];
    },
  };
}

describe('findUnderlyingVideoEmbed', () => {
  it('returns kind=none when target is null', () => {
    assert.deepEqual(findUnderlyingVideoEmbed(null), { kind: 'none' });
  });

  it('returns kind=direct when target is itself a usable <video>', () => {
    const video = makeVideo({
      currentSrc: 'https://m.media-amazon.com/video/sample.mp4',
      src: 'https://m.media-amazon.com/video/sample.mp4',
    });
    const r = findUnderlyingVideoEmbed(video as unknown as Element);
    assert.equal(r.kind, 'direct');
    if (r.kind !== 'direct') return;
    assert.equal(r.src, 'https://m.media-amazon.com/video/sample.mp4');
    assert.equal(r.mimeType, null);
    assert.strictEqual(r.element, video as unknown as HTMLVideoElement);
  });

  it('prefers currentSrc over src on the <video> element', () => {
    const video = makeVideo({
      currentSrc: 'https://cdn/picked-by-browser.mp4',
      src: 'https://cdn/raw-attribute.mp4',
    });
    const r = findUnderlyingVideoEmbed(video as unknown as Element);
    if (r.kind !== 'direct') {
      assert.fail(`expected direct kind, got ${r.kind}`);
    }
    assert.equal(r.src, 'https://cdn/picked-by-browser.mp4');
  });

  it('reads the first <source type="..."> attribute as mimeType hint', () => {
    const video = makeVideo({
      currentSrc: 'https://cdn/demo.webm',
      src: 'https://cdn/demo.webm',
      sources: [
        makeSource('video/webm'),
        makeSource('video/mp4'),
      ],
    });
    const r = findUnderlyingVideoEmbed(video as unknown as Element);
    if (r.kind !== 'direct') assert.fail();
    assert.equal(r.mimeType, 'video/webm');
  });

  it('lowercases + trims the <source type> attribute', () => {
    const video = makeVideo({
      src: 'https://cdn/demo.mp4',
      sources: [makeSource('  Video/MP4 ')],
    });
    const r = findUnderlyingVideoEmbed(video as unknown as Element);
    if (r.kind !== 'direct') assert.fail();
    assert.equal(r.mimeType, 'video/mp4');
  });

  it('skips empty + null <source type> values and falls through to the next', () => {
    const video = makeVideo({
      src: 'https://cdn/demo.mp4',
      sources: [
        makeSource(null),
        makeSource(''),
        makeSource('video/quicktime'),
      ],
    });
    const r = findUnderlyingVideoEmbed(video as unknown as Element);
    if (r.kind !== 'direct') assert.fail();
    assert.equal(r.mimeType, 'video/quicktime');
  });

  it('returns mimeType=null when no <source> element provides a type', () => {
    const video = makeVideo({
      src: 'https://cdn/demo.mp4',
      sources: [makeSource(null), makeSource('')],
    });
    const r = findUnderlyingVideoEmbed(video as unknown as Element);
    if (r.kind !== 'direct') assert.fail();
    assert.equal(r.mimeType, null);
  });

  it('returns kind=none for a <video> with both src and currentSrc empty', () => {
    const video = makeVideo({ currentSrc: '', src: '' });
    assert.deepEqual(findUnderlyingVideoEmbed(video as unknown as Element), {
      kind: 'none',
    });
  });

  it('walks up to find a <video> ancestor (overlay-wrapped pattern)', () => {
    // <div class="video-wrap"><div id="overlay"></div><video></video></div>
    // right-click landed on #overlay; the helper finds the sibling video
    // via the parent wrap's descendant-scan.
    const video = makeVideo({ src: 'https://cdn/wrapped.mp4' });
    const wrap = makeEl({
      tagName: 'DIV',
      descendantVideo: video,
    });
    const overlay = makeEl({
      tagName: 'DIV',
      parentElement: wrap,
      descendantVideo: null,
    });
    const r = findUnderlyingVideoEmbed(overlay as unknown as Element);
    if (r.kind !== 'direct') assert.fail();
    assert.equal(r.src, 'https://cdn/wrapped.mp4');
  });

  it('returns kind=embed for a YouTube iframe target', () => {
    const iframe = makeIframe({
      src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    });
    const r = findUnderlyingVideoEmbed(iframe as unknown as Element);
    assert.equal(r.kind, 'embed');
    if (r.kind !== 'embed') return;
    assert.equal(r.platform, 'youtube');
    assert.equal(r.src, 'https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('returns kind=embed for a Vimeo player iframe target', () => {
    const iframe = makeIframe({
      src: 'https://player.vimeo.com/video/12345678',
    });
    const r = findUnderlyingVideoEmbed(iframe as unknown as Element);
    if (r.kind !== 'embed') assert.fail();
    assert.equal(r.platform, 'vimeo');
  });

  it('returns kind=embed for a Wistia iframe target', () => {
    const iframe = makeIframe({
      src: 'https://fast.wistia.net/embed/iframe/abcd1234',
    });
    const r = findUnderlyingVideoEmbed(iframe as unknown as Element);
    if (r.kind !== 'embed') assert.fail();
    assert.equal(r.platform, 'wistia');
  });

  it('ignores iframes whose src does not match a known video-embed pattern', () => {
    // Generic 3rd-party iframe (ads, analytics, chatbots) should NOT count
    // as a video embed even though it's an <iframe>.
    const iframe = makeIframe({
      src: 'https://ads.example.com/banner?id=42',
    });
    const r = findUnderlyingVideoEmbed(iframe as unknown as Element);
    assert.deepEqual(r, { kind: 'none' });
  });

  it('finds an embed iframe via the ancestor descendant-scan', () => {
    // <div class="video-card"><span class="play-button">▶</span><iframe src="yt..."/></div>
    // Right-click on the play-button overlay; helper finds the sibling
    // iframe via the parent's querySelectorAll('iframe') scan.
    const iframe = makeIframe({
      src: 'https://www.youtube.com/embed/abc12345678',
    });
    const card = makeEl({
      tagName: 'DIV',
      descendantIframes: [iframe],
    });
    const playButton = makeEl({
      tagName: 'SPAN',
      parentElement: card,
      descendantIframes: [],
    });
    const r = findUnderlyingVideoEmbed(playButton as unknown as Element);
    if (r.kind !== 'embed') assert.fail();
    assert.equal(r.platform, 'youtube');
    assert.equal(r.src, 'https://www.youtube.com/embed/abc12345678');
  });

  it('prefers direct <video> over embed <iframe> at the same ancestor level', () => {
    // A pathological page that has BOTH a real <video> and an embed iframe
    // as siblings under the same wrapper. DIRECT_BYTES wins because it
    // gives us actual bytes (the design's preferred capture).
    const video = makeVideo({ src: 'https://cdn/direct.mp4' });
    const iframe = makeIframe({
      src: 'https://www.youtube.com/embed/zzzzzzzzzzz',
    });
    const wrap = makeEl({
      tagName: 'DIV',
      descendantVideo: video,
      descendantIframes: [iframe],
    });
    const target = makeEl({
      tagName: 'SPAN',
      parentElement: wrap,
    });
    const r = findUnderlyingVideoEmbed(target as unknown as Element);
    if (r.kind !== 'direct') {
      assert.fail(`expected direct kind, got ${r.kind}`);
    }
    assert.equal(r.src, 'https://cdn/direct.mp4');
  });

  it('returns kind=none when no <video> or recognized embed is reachable', () => {
    let current: FakeElement = makeEl({
      tagName: 'DIV',
      descendantVideo: null,
    });
    for (let i = 0; i < 5; i++) {
      current = makeEl({
        tagName: 'DIV',
        parentElement: current,
        descendantVideo: null,
      });
    }
    assert.deepEqual(findUnderlyingVideoEmbed(current as unknown as Element), {
      kind: 'none',
    });
  });

  it('stops at MAX_ANCESTOR_DEPTH (does not climb past 10 levels)', () => {
    // <video> sits at the top of a 15-level chain; helper bails at depth 10.
    const video = makeVideo({ src: 'https://cdn/way-up.mp4' });
    const farAncestor = makeEl({
      tagName: 'BODY',
      descendantVideo: video,
    });
    let current: FakeElement = farAncestor;
    for (let i = 0; i < 15; i++) {
      current = makeEl({
        tagName: 'DIV',
        parentElement: current,
        descendantVideo: null,
      });
    }
    assert.deepEqual(findUnderlyingVideoEmbed(current as unknown as Element), {
      kind: 'none',
    });
  });

  it('returns kind=none for an iframe with empty src', () => {
    const iframe = makeIframe({ src: '' });
    assert.deepEqual(findUnderlyingVideoEmbed(iframe as unknown as Element), {
      kind: 'none',
    });
  });

  it('youtu.be short URLs are recognized as youtube embeds', () => {
    const iframe = makeIframe({
      src: 'https://youtu.be/dQw4w9WgXcQ',
    });
    const r = findUnderlyingVideoEmbed(iframe as unknown as Element);
    if (r.kind !== 'embed') assert.fail();
    assert.equal(r.platform, 'youtube');
  });

  it('loom share URLs are recognized as loom embeds', () => {
    const iframe = makeIframe({
      src: 'https://www.loom.com/share/abc123def456',
    });
    const r = findUnderlyingVideoEmbed(iframe as unknown as Element);
    if (r.kind !== 'embed') assert.fail();
    assert.equal(r.platform, 'loom');
  });
});
