import type { Env } from './env';
import { clientIp, HttpError, json, readJson } from './http';
import { checkLimit, recordEvent } from './rateLimit';

// The owner signs in with one password (the ADMIN_PASSWORD secret) and gets a session cookie.
// Only a hash of the cookie token is stored, and changing the password signs out every device.

const COOKIE = 'owner_session';
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;
const LOGIN_LIMIT = { max: 10, windowMs: 15 * 60 * 1000, message: 'Too many wrong passwords. Please wait 15 minutes and try again.' };

const encoder = new TextEncoder();

async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function ownerPassword(env: Env) {
  const password = env.ADMIN_PASSWORD ?? '';
  if (password.length < 8) throw new HttpError(503, 'Owner login is not set up yet: the ADMIN_PASSWORD secret is missing or shorter than 8 characters.');
  return password;
}

const passwordTag = async (password: string) => (await sha256Hex(`password-tag:${password}`)).slice(0, 16);

async function passwordMatches(given: string, expected: string) {
  // Compare fixed-length digests in constant time, so timing reveals nothing about the password.
  const [a, b] = await Promise.all([crypto.subtle.digest('SHA-256', encoder.encode(given)), crypto.subtle.digest('SHA-256', encoder.encode(expected))]);
  return crypto.subtle.timingSafeEqual(a, b);
}

function readCookie(request: Request, name: string) {
  for (const part of (request.headers.get('Cookie') ?? '').split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=');
  }
  return '';
}

const sessionCookie = (token: string, maxAgeSeconds: number) =>
  `${COOKIE}=${token}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAgeSeconds}`;

export async function login(request: Request, env: Env) {
  const password = ownerPassword(env);
  const limitKey = `login:${clientIp(request)}`;
  await checkLimit(env, limitKey, LOGIN_LIMIT);
  const body = await readJson(request);
  if (!(await passwordMatches(typeof body.password === 'string' ? body.password : '', password))) {
    await recordEvent(env, limitKey);
    throw new HttpError(401, 'Wrong password, please try again.');
  }

  const token = [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, '0')).join('');
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now),
    env.DB.prepare('INSERT INTO sessions (token_hash, password_tag, expires_at) VALUES (?, ?, ?)').bind(
      await sha256Hex(token),
      await passwordTag(password),
      now + SESSION_MS,
    ),
  ]);
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(token, SESSION_MS / 1000) });
}

export async function logout(request: Request, env: Env) {
  const token = readCookie(request, COOKIE);
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256Hex(token)).run();
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie('', 0) });
}

/** The admin page's first check: is this device signed in? (Answers rather than failing with 401.) */
export async function sessionStatus(request: Request, env: Env) {
  try {
    await requireOwner(request, env);
    return json({ signedIn: true });
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) return json({ signedIn: false });
    throw error;
  }
}

/** Throws 401 unless the request carries a valid owner session. */
export async function requireOwner(request: Request, env: Env) {
  const token = readCookie(request, COOKIE);
  if (!token) throw new HttpError(401, 'Please log in.');
  const password = ownerPassword(env);
  const session = await env.DB.prepare('SELECT password_tag, expires_at FROM sessions WHERE token_hash = ?')
    .bind(await sha256Hex(token))
    .first<{ password_tag: string; expires_at: number }>();
  if (!session || session.expires_at < Date.now() || session.password_tag !== (await passwordTag(password))) {
    throw new HttpError(401, 'Your login has expired. Please log in again.');
  }
}
