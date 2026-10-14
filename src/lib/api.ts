/** An error from the shop API. `message` is safe to show to the person using the site. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly data: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

const OFFLINE = 'We can’t reach the shop right now. Please check your connection and try again.';

interface Options {
  method?: string;
  /** Sent as JSON. */
  body?: unknown;
  /** Sent as-is, e.g. an image. */
  file?: Blob;
}

/** Calls the shop API (worker/), e.g. api('menu') → GET /api/menu. */
export async function api<T>(path: string, { method, body, file }: Options = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/${path}`, {
      method: method ?? (body === undefined && !file ? 'GET' : 'POST'),
      headers: file ? { 'Content-Type': file.type } : body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: file ?? (body !== undefined ? JSON.stringify(body) : undefined),
      credentials: 'same-origin',
    });
  } catch {
    throw new ApiError(OFFLINE, 0);
  }
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) throw new ApiError(typeof data.error === 'string' ? data.error : OFFLINE, response.status, data);
  return data as T;
}

export const errorMessage = (error: unknown) => (error instanceof ApiError ? error.message : 'Something went wrong. Please try again.');
