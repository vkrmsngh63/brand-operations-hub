// One-off: create the `competition-scraping-videos` Supabase Storage bucket
// per docs/CAPTURED_VIDEOS_DESIGN.md §A.9. Idempotent — checks for existence
// first; creates only if missing; re-verifies after creation.
//
// Usage: `node scripts/create-competition-scraping-videos-bucket.mjs`
// Requires env: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
//
// Bucket config (canonical, from design doc §A.9):
// - name: competition-scraping-videos
// - public: false (signed-URL access only)
// - allowed MIME types: video/mp4, video/webm, video/quicktime
// - file size limit: enforced at the application layer per §A.11
//   (client-side pre-upload check + server-side requestVideoUploadUrl 413).
//   Bucket-level fileSizeLimit was attempted at 100 MB but the project's
//   default Global File Size Limit blocked it; defense-in-depth bucket-level
//   cap can be added later via the dashboard after raising the project limit.

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
config({ path: resolve(repoRoot, '.env') });
config({ path: resolve(repoRoot, '.env.local'), override: true });

const BUCKET_NAME = 'competition-scraping-videos';
const ALLOWED_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const existing = await supabase.storage.getBucket(BUCKET_NAME);
if (existing.data) {
  console.log(`Bucket ${BUCKET_NAME} already exists:`);
  console.log(JSON.stringify(existing.data, null, 2));
  process.exit(0);
}

console.log(`Bucket ${BUCKET_NAME} not found — creating...`);
const created = await supabase.storage.createBucket(BUCKET_NAME, {
  public: false,
  allowedMimeTypes: ALLOWED_MIME_TYPES,
});
if (created.error) {
  console.error(`Create failed: ${created.error.message}`);
  process.exit(2);
}

const verified = await supabase.storage.getBucket(BUCKET_NAME);
if (verified.error || !verified.data) {
  console.error(`Post-create verify failed: ${verified.error?.message ?? 'no data'}`);
  process.exit(3);
}

console.log(`Bucket ${BUCKET_NAME} created + verified:`);
console.log(JSON.stringify(verified.data, null, 2));
