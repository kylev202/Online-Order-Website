import type { Env } from './env';
import { checkLength, HttpError, json } from './http';

// Product photos the owner uploads are stored in R2 and served at /images/products/<uuid>.<ext>.
// The admin shrinks photos in the browser first, so uploads are small.

const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX_BYTES = 5 * 1024 * 1024;
const KEY = /^products\/[0-9a-f-]{36}\.(jpg|png|webp)$/;
const PREFIX = '/images/';

export async function uploadImage(request: Request, env: Env) {
  const type = (request.headers.get('Content-Type') ?? '').split(';')[0].trim().toLowerCase();
  const ext = TYPES[type];
  if (!ext) throw new HttpError(415, 'Please upload a JPG, PNG or WebP image.');
  checkLength(request, MAX_BYTES, 'That image is too large (5 MB at most).');
  const body = await request.arrayBuffer();
  if (body.byteLength === 0) throw new HttpError(400, 'That image is empty.');
  if (body.byteLength > MAX_BYTES) throw new HttpError(413, 'That image is too large (5 MB at most).');

  const key = `products/${crypto.randomUUID()}.${ext}`;
  await env.IMAGES.put(key, body, { httpMetadata: { contentType: type } });
  return json({ url: PREFIX + key }, 201);
}

export async function serveImage(request: Request, env: Env, key: string) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
  const object = KEY.test(key) ? await env.IMAGES.get(key) : null;
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('ETag', object.httpEtag);
  // Keys are never reused (a new upload gets a new key), so browsers can keep them forever.
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('X-Content-Type-Options', 'nosniff');
  return new Response(request.method === 'HEAD' ? null : object.body, { headers });
}

/** Deletes uploaded photos that are no longer used. Bundled catalogue photos are left alone. */
export async function deleteImages(env: Env, images: string[]) {
  const keys = images.filter((image) => image.startsWith(PREFIX)).map((image) => image.slice(PREFIX.length));
  if (keys.length > 0) await env.IMAGES.delete(keys);
}
