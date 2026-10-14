import { HttpError } from './http';

/** Trimmed text with a length limit. `label` completes "Please enter ..." for empty values. */
export function text(value: unknown, label: string, max: number, required = true): string {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (required && !trimmed) throw new HttpError(400, `Please enter ${label}.`);
  if (trimmed.length > max) throw new HttpError(400, `That ${label.replace(/^(a|an|your) /, '')} is too long (${max} characters at most).`);
  return trimmed;
}

/** Category ('c-…') and product ('p-…') ids, from the seed catalogue or newId() in the admin. */
export function catalogueId(value: unknown, prefix: 'c' | 'p'): string {
  if (typeof value === 'string' && new RegExp(`^${prefix}-[a-z0-9-]{1,80}$`).test(value)) return value;
  throw new HttpError(400, prefix === 'c' ? 'Please choose a category.' : 'Unknown product.');
}

export const isOrderId = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);

export function orderId(value: unknown): string {
  if (isOrderId(value)) return value;
  throw new HttpError(404, 'We couldn’t find this order.');
}

export function integer(value: unknown, min: number, max: number, message: string): number {
  if (typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max) return value;
  throw new HttpError(400, message);
}

// Bundled catalogue photo, uploaded photo, or none (placeholder).
const IMAGE = /^(products\/[a-z0-9-]+\.(webp|jpg|png)|\/images\/products\/[0-9a-f-]{36}\.(jpg|png|webp))?$/;

export function imagePath(value: unknown): string {
  if (typeof value === 'string' && IMAGE.test(value)) return value;
  throw new HttpError(400, 'That image could not be used. Please upload it again.');
}

export function tagList(value: unknown): string[] {
  if (value === undefined) return [];
  if (Array.isArray(value) && value.length <= 20 && value.every((t) => typeof t === 'string' && t.length > 0 && t.length <= 30)) {
    return [...new Set(value as string[])];
  }
  throw new HttpError(400, 'Invalid tags.');
}
