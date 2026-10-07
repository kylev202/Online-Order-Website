import { store } from '../config/store';

export function formatPrice(cents: number) {
  return `${store.currency}${(cents / 100).toFixed(2)}`;
}

/** e.g. "7 Oct, 09:50 pm" in the viewer's locale. */
export function formatDateTime(ms: number) {
  return new Date(ms).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/** Parses "12.5" or "$12.50" into cents; returns null for anything else. */
export function parsePrice(input: string): number | null {
  const text = input.trim().replace(store.currency, '');
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  return Math.round(Number(text) * 100);
}
