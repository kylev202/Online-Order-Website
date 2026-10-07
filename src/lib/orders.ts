import { useSyncExternalStore } from 'react';

export interface OrderLine {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  number: string;
  createdAt: number;
  lines: OrderLine[];
  total: number;
  deliveryTime: string;
  customer: { name: string; phone: string };
  address: { street: string; suburb: string; postcode: string; instructions: string };
  /** e.g. "Card •••• 4242". Card details themselves are never stored. */
  payment: string;
  /** When each delivery step was reached (index = DELIVERY_STEPS index); the last one is the current step. */
  statusTimes: number[];
}

// Demo: orders are kept in this browser's localStorage (the live site will use a server).
// v2: delivery status is set by the owner, and delivery is free.
const KEY = 'ordering-demo.orders.v2';
const listeners = new Set<() => void>();

function readSaved(): Order[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Order[];
  } catch {
    // Ignore: start with no order history.
  }
  return [];
}

let orders = readSaved();

function emit() {
  listeners.forEach((listener) => listener());
}

function commit(next: Order[]) {
  orders = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(orders));
  } catch {
    // Still shown for this visit if storage is unavailable.
  }
  emit();
}

// Keep other open tabs in sync, e.g. the owner's Orders page and the customer's tracking page.
window.addEventListener('storage', (event) => {
  if (event.key === KEY) {
    orders = readSaved();
    emit();
  }
});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** All orders, newest first. */
export function useOrders(): Order[] {
  return useSyncExternalStore(subscribe, () => orders);
}

export function saveOrder(order: Order) {
  commit([order, ...orders]);
}

/** Owner: moves an order to a delivery step. Moving back (to fix a mistake) clears the later steps. */
export function setOrderStep(orderId: string, step: number) {
  commit(
    orders.map((order) => {
      if (order.id !== orderId) return order;
      const statusTimes = order.statusTimes.slice(0, step + 1);
      while (statusTimes.length <= step) statusTimes.push(Date.now());
      return { ...order, statusTimes };
    }),
  );
}

// Delivery progress shown to the customer and updated by the owner on the Orders page.
export const DELIVERY_STEPS = [
  { label: 'Order Confirmed', detail: 'Payment received. Your order is confirmed.' },
  { label: 'Packing', detail: 'Your items are being packed.' },
  { label: 'Out for Delivery', detail: 'Your order is on its way to you.' },
  { label: 'Delivered', detail: 'Your order has been delivered.' },
];

/** Index into DELIVERY_STEPS. */
export function deliveryStep(order: Order) {
  return order.statusTimes.length - 1;
}

export function isDelivered(order: Order) {
  return deliveryStep(order) === DELIVERY_STEPS.length - 1;
}
