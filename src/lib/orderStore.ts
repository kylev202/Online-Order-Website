import { useSyncExternalStore } from 'react';
import type { Menu, Product } from './types';

export interface CartLine {
  productId: string;
  qty: number;
}

interface OrderState {
  lines: CartLine[];
  /** '' until the customer picks one, then 'ASAP' or 'HH:MM'. Not saved across visits. */
  deliveryTime: string;
}

// The cart is kept in localStorage so it survives a page refresh.
const KEY = 'ordering-demo.cart.v2';
const listeners = new Set<() => void>();

function readLines(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as CartLine[];
  } catch {
    // Ignore: start with an empty cart.
  }
  return [];
}

let state: OrderState = { lines: readLines(), deliveryTime: '' };

function commit(next: OrderState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next.lines));
  } catch {
    // The cart still works for this visit if storage is unavailable.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useOrder(): OrderState {
  return useSyncExternalStore(subscribe, () => state);
}

/** Sets a product's quantity; 0 removes it from the cart. */
export function setQty(productId: string, qty: number) {
  const exists = state.lines.some((l) => l.productId === productId);
  let lines: CartLine[];
  if (qty <= 0) lines = state.lines.filter((l) => l.productId !== productId);
  else if (exists) lines = state.lines.map((l) => (l.productId === productId ? { productId, qty } : l));
  else lines = [...state.lines, { productId, qty }];
  commit({ ...state, lines });
}

export function addToCart(productId: string, qty: number) {
  const current = state.lines.find((l) => l.productId === productId)?.qty ?? 0;
  setQty(productId, current + qty);
}

export function clearCart() {
  commit({ ...state, lines: [] });
}

export function setDeliveryTime(deliveryTime: string) {
  commit({ ...state, deliveryTime });
}

/** Cart lines joined with their products; lines for deleted products are dropped. */
export function cartItems(menu: Menu, lines: CartLine[]): Array<{ product: Product; qty: number }> {
  return lines.flatMap((line) => {
    const product = menu.products.find((p) => p.id === line.productId);
    return product ? [{ product, qty: line.qty }] : [];
  });
}
