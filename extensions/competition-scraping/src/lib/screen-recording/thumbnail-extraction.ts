// First-frame thumbnail extraction for SCREEN_RECORDING webm Blobs —
// P-45 Build #1b (2026-05-22).
//
// Per CAPTURED_VIDEOS_DESIGN.md §A.12, the URL detail page renderer
// expects either a thumbnail JPEG or NULL (renderer falls back to the
// browser's native <video> play icon). This module produces the JPEG
// when extraction succeeds + returns null on any failure path — NEVER
// throws. Save flow is more important than thumbnail quality.
//
// Extraction shape:
//   1. createObjectURL(blob) to mint a blob: URL.
//   2. Attach to a hidden HTMLVideoElement; mute it (autoplay policy);
//      seek to t=0 + wait for 'seeked' event (cross-browser-reliable
//      "first frame is now decoded" signal — more reliable than
//      'loadeddata' which can fire before the frame is actually painted).
//   3. drawImage(<video>, 0, 0, width, height) onto an offscreen canvas.
//   4. canvas.toBlob('image/jpeg', 0.85) for the final Blob.
//   5. revokeObjectURL on completion (success OR failure path).
//
// Quality 0.85 matches the existing fast-fetch DIRECT_BYTES thumbnail
// pipeline (video-capture-form.ts canvas frame-grab) — visual fidelity
// near-lossless without ballooning the storage footprint.

const JPEG_QUALITY = 0.85;

/** Dependency-injection surface for the DOM APIs the extractor needs. */
export interface ThumbnailExtractionDeps {
  createObjectURL(blob: Blob): string;
  revokeObjectURL(url: string): void;
  createVideoElement(): HTMLVideoElement;
  createCanvas(width: number, height: number): HTMLCanvasElement;
}

export function createProductionDeps(): ThumbnailExtractionDeps {
  return {
    createObjectURL(blob) {
      return URL.createObjectURL(blob);
    },
    revokeObjectURL(url) {
      URL.revokeObjectURL(url);
    },
    createVideoElement() {
      return document.createElement('video');
    },
    createCanvas(width, height) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      return canvas;
    },
  };
}

export interface ExtractFirstFrameThumbnailInput {
  blob: Blob;
  width: number;
  height: number;
}

/**
 * Returns a JPEG Blob of the webm's first frame, or null if extraction
 * fails for any reason. Never throws — §A.12 NULL-thumbnail fallback.
 */
export async function extractFirstFrameThumbnail(
  input: ExtractFirstFrameThumbnailInput,
  deps: ThumbnailExtractionDeps = createProductionDeps(),
): Promise<Blob | null> {
  // Cheap reject for zero-byte / invalid blobs — saves ~200 ms of
  // <video>.error wait time in the common malformed case.
  if (input.blob.size === 0) return null;
  if (input.width <= 0 || input.height <= 0) return null;

  const url = deps.createObjectURL(input.blob);
  const video = deps.createVideoElement();
  // Mute + muted + playsInline are the trifecta needed to get a frame
  // painted without user-gesture autoplay policy interference. We never
  // play() — we just seek + draw.
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';

  try {
    return await new Promise<Blob | null>((resolve) => {
      let settled = false;
      function settle(result: Blob | null): void {
        if (settled) return;
        settled = true;
        deps.revokeObjectURL(url);
        resolve(result);
      }

      video.addEventListener('error', () => {
        settle(null);
      });
      video.addEventListener('seeked', () => {
        try {
          const canvas = deps.createCanvas(input.width, input.height);
          const ctx = canvas.getContext('2d');
          if (ctx === null) {
            settle(null);
            return;
          }
          ctx.drawImage(video, 0, 0, input.width, input.height);
          canvas.toBlob(
            (blob) => {
              settle(blob);
            },
            'image/jpeg',
            JPEG_QUALITY,
          );
        } catch {
          settle(null);
        }
      });
      video.addEventListener('loadedmetadata', () => {
        // Seek to t=0 to force a decoded first frame. 'seeked' is the
        // most reliable cross-browser "this exact frame is paintable"
        // signal — 'loadeddata' can fire before the frame is fully
        // painted on some Chrome versions.
        try {
          video.currentTime = 0;
        } catch {
          settle(null);
        }
      });

      video.src = url;
    });
  } catch {
    deps.revokeObjectURL(url);
    return null;
  }
}
