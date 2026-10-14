import type { Env } from './env';
import { HttpError } from './http';

export interface Limit {
  max: number;
  windowMs: number;
  message: string;
}

const DAY = 24 * 60 * 60 * 1000;

/** Throws 429 when `key` (e.g. "login:<ip>") already has `max` events inside the window. */
export async function checkLimit(env: Env, key: string, limit: Limit) {
  const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM rate_events WHERE key = ? AND at > ?')
    .bind(key, Date.now() - limit.windowMs)
    .first<{ n: number }>();
  if ((row?.n ?? 0) >= limit.max) throw new HttpError(429, limit.message);
}

/** Records one event for `key` and clears out events older than a day. */
export async function recordEvent(env: Env, key: string) {
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare('INSERT INTO rate_events (key, at) VALUES (?, ?)').bind(key, now),
    env.DB.prepare('DELETE FROM rate_events WHERE at < ?').bind(now - DAY),
  ]);
}
