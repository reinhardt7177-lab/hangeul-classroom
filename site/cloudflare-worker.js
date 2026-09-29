// Cloudflare Worker for holiday.mumuworld.com. Only /videos/* comes through here (run_worker_first
// in wrangler.jsonc); every other file is served straight from the static asset store.
//
// Why: the asset store ignores the Range header and always answers 200 with the whole file, and
// iPhone/iPad Safari will not play a <video> without 206 partial responses. Cloudflare's cache does
// answer Range requests from a stored full copy, so each video is put in the cache once per deploy
// and every request is served from there. The cache slices natively, so the Worker stays far below
// the free plan's CPU limit even for the 20 MB documentary.
export default {
  async fetch(request, env) {
    if (request.method !== 'GET') return env.ASSETS.fetch(request);
    const url = new URL(request.url);
    const plain = new Request(url.origin + url.pathname);
    // One cache entry per deploy, so a replaced video never outlives the version that shipped it.
    const key = `${plain.url}?v=${env.VERSION.id}`;
    const range = request.headers.get('Range');
    const lookup = new Request(key, range ? { headers: { Range: range } } : {});
    const hit = await caches.default.match(lookup);
    if (hit) return hit;
    const asset = await env.ASSETS.fetch(plain);
    if (asset.status !== 200) return asset;
    const full = new Response(asset.body, asset);
    full.headers.set('Accept-Ranges', 'bytes');
    full.headers.set('Cache-Control', 'public, max-age=604800');
    await caches.default.put(key, full);
    // If the cache refused the file, fall back to the plain 200 answer (desktop browsers still play it).
    return (await caches.default.match(lookup)) ?? env.ASSETS.fetch(plain);
  }
};
