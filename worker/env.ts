/** Bindings from wrangler.jsonc, plus the owner password secret. */
export interface Env {
  DB: D1Database;
  /** Product photos uploaded by the owner. */
  IMAGES: R2Bucket;
  ASSETS: Fetcher;
  /** Set with `wrangler secret put ADMIN_PASSWORD` (locally in .dev.vars). */
  ADMIN_PASSWORD?: string;
}

export type Handler = (request: Request, env: Env, ctx: ExecutionContext, params: string[]) => Promise<Response>;
