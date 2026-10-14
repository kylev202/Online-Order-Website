/** An error whose message is safe to show to the person using the site. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly extra: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  });
}

/** Browsers send Origin with writes; refuse writes that come from another site. */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get('Origin');
  return !origin || origin === new URL(request.url).origin;
}

/** Refuses a body that says it is bigger than `maxBytes`, before reading it. */
export function checkLength(request: Request, maxBytes: number, message: string) {
  if (Number(request.headers.get('Content-Length') ?? 0) > maxBytes) throw new HttpError(413, message);
}

export async function readJson(request: Request, maxLength = 20_000): Promise<Record<string, unknown>> {
  checkLength(request, maxLength, 'That request is too large.');
  const text = await request.text();
  if (text.length > maxLength) throw new HttpError(413, 'That request is too large.');
  try {
    const data: unknown = JSON.parse(text);
    if (data && typeof data === 'object' && !Array.isArray(data)) return data as Record<string, unknown>;
  } catch {
    // Fall through to the error below.
  }
  throw new HttpError(400, 'That request could not be read.');
}

export const clientIp = (request: Request) => request.headers.get('CF-Connecting-IP') ?? 'unknown';
