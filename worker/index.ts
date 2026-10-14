import { login, logout, requireOwner, sessionStatus } from './auth';
import type { Env, Handler } from './env';
import { HttpError, isSameOrigin, json } from './http';
import { serveImage, uploadImage } from './images';
import { deleteCategory, deleteProduct, getMenu, saveCategory, saveProduct } from './menu';
import { createOrder, getOrder, listOrders, lookupOrders, updateOrder } from './orders';

// API for the shop. Everything that isn't /api/* or /images/* is the website itself (static files).

/** Only for the signed-in owner. */
const owner =
  (handler: Handler): Handler =>
  async (request, env, ctx, params) => {
    await requireOwner(request, env);
    return handler(request, env, ctx, params);
  };

const ROUTES: Array<[method: string, path: RegExp, handler: Handler]> = [
  ['GET', /^\/api\/menu$/, getMenu],
  ['POST', /^\/api\/orders$/, createOrder],
  ['POST', /^\/api\/orders\/lookup$/, lookupOrders],
  ['GET', /^\/api\/orders\/([\w-]+)$/, getOrder],

  ['POST', /^\/api\/admin\/login$/, login],
  ['POST', /^\/api\/admin\/logout$/, logout],
  ['GET', /^\/api\/admin\/session$/, sessionStatus],
  ['PUT', /^\/api\/admin\/categories\/([\w-]+)$/, owner(saveCategory)],
  ['DELETE', /^\/api\/admin\/categories\/([\w-]+)$/, owner(deleteCategory)],
  ['PUT', /^\/api\/admin\/products\/([\w-]+)$/, owner(saveProduct)],
  ['DELETE', /^\/api\/admin\/products\/([\w-]+)$/, owner(deleteProduct)],
  ['POST', /^\/api\/admin\/images$/, owner(uploadImage)],
  ['GET', /^\/api\/admin\/orders$/, owner(listOrders)],
  ['PATCH', /^\/api\/admin\/orders\/([\w-]+)$/, owner(updateOrder)],
];

async function route(request: Request, env: Env, ctx: ExecutionContext, path: string) {
  try {
    if (request.method !== 'GET' && !isSameOrigin(request)) throw new HttpError(403, 'This request was blocked.');
    let pathMatched = false;
    for (const [method, pattern, handler] of ROUTES) {
      const match = pattern.exec(path);
      if (!match) continue;
      if (method === request.method) return await handler(request, env, ctx, match.slice(1));
      pathMatched = true;
    }
    throw new HttpError(pathMatched ? 405 : 404, pathMatched ? 'Method not allowed.' : 'Not found.');
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message, ...error.extra }, error.status);
    console.error('Unhandled API error', request.method, path, error);
    return json({ error: 'Something went wrong on our side. Please try again.' }, 500);
  }
}

async function handleApi(request: Request, env: Env, ctx: ExecutionContext, path: string) {
  const response = await route(request, env, ctx, path);
  // A request refused before its body was read (e.g. 401 on an upload): read the rest of the body, so the
  // connection can carry the next request. Without this the local dev server fails the next request.
  if (request.body && !request.bodyUsed && Number(request.headers.get('Content-Length') ?? 0) <= 6 * 1024 * 1024) {
    await request.arrayBuffer().catch(() => {});
  }
  return response;
}

export default {
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname;
    if (path.startsWith('/api/')) return handleApi(request, env, ctx, path);
    if (path.startsWith('/images/')) return serveImage(request, env, path.slice('/images/'.length));
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
