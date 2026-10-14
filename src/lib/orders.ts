import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { api, ApiError } from './api';
import { isActive } from './delivery';
import { ownerApi } from './ownerSession';
import type { NewOrder, Order } from './types';

export { DELIVERY_STEPS, deliveryStep, isActive, isDelivered } from './delivery';

// Orders live on the server. Pages that show order status check for changes regularly,
// but only while the page is visible.

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Runs `task` now, every `ms`, and whenever the page becomes visible again. Returns a stop function. */
function poll(task: () => void, ms: number) {
  const tick = () => {
    if (!document.hidden) task();
  };
  tick();
  const timer = window.setInterval(tick, ms);
  document.addEventListener('visibilitychange', tick);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener('visibilitychange', tick);
  };
}

/** A poll shared by every component that uses it; for useEffect(poller, []). */
function sharedPoller(task: () => void, ms: number) {
  let users = 0;
  let stop = () => {};
  return () => {
    if (users++ === 0) stop = poll(task, ms);
    return () => {
      if (--users === 0) stop();
    };
  };
}

// ---------- Customer ----------

// This browser only remembers the ids of the orders placed in it; the details come from the shop.
const MINE_KEY = 'shop.my-orders';

function readMine(): string[] {
  try {
    const ids: unknown = JSON.parse(localStorage.getItem(MINE_KEY) ?? '[]');
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string').slice(0, 30) : [];
  } catch {
    return [];
  }
}

interface CustomerState {
  /** Ids of the orders placed in this browser, newest first. */
  mine: string[];
  mineLoaded: boolean;
  orders: Map<string, Order>;
}

let customer: CustomerState = { mine: readMine(), mineLoaded: false, orders: new Map() };

function updateCustomer(changes: Partial<CustomerState>, fetched: Order[] = []) {
  const orders = new Map(customer.orders);
  fetched.forEach((order) => orders.set(order.id, order));
  customer = { ...customer, ...changes, orders };
  emit();
}

// The first check loads every order; after that only the ones still on their way.
async function refreshMine() {
  const ids = customer.mineLoaded
    ? customer.mine.filter((id) => {
        const order = customer.orders.get(id);
        return !order || isActive(order);
      })
    : customer.mine;
  if (ids.length === 0) {
    if (!customer.mineLoaded) updateCustomer({ mineLoaded: true });
    return;
  }
  try {
    const { orders } = await api<{ orders: Order[] }>('orders/lookup', { body: { ids } });
    updateCustomer({ mineLoaded: true }, orders);
  } catch {
    // Keep what is shown; the next check tries again.
  }
}

const myOrdersPoller = sharedPoller(() => void refreshMine(), 30_000);

/** Orders placed in this browser, newest first (My Orders and the "Track" pill). */
export function useMyOrders(): { orders: Order[]; loaded: boolean } {
  useEffect(myOrdersPoller, []);
  const state = useSyncExternalStore(subscribe, () => customer);
  const orders = useMemo(() => state.mine.flatMap((id) => state.orders.get(id) ?? []), [state]);
  return { orders, loaded: state.mineLoaded };
}

export type TrackStatus = 'loading' | 'ready' | 'missing' | 'error';

/** One order for its tracking page, checked every 15 seconds until it is delivered or cancelled. */
export function useTrackedOrder(id: string): { order?: Order; status: TrackStatus } {
  const order = useSyncExternalStore(subscribe, () => customer.orders.get(id));
  const [status, setStatus] = useState<TrackStatus>('loading');

  useEffect(() => {
    let stopped = false;
    const stop = poll(async () => {
      const current = customer.orders.get(id);
      if (current && !isActive(current)) return; // finished: nothing more will change
      try {
        const fresh = await api<Order>(`orders/${encodeURIComponent(id)}`);
        if (!stopped) updateCustomer({}, [fresh]);
      } catch (error) {
        if (!stopped && !customer.orders.has(id)) setStatus(error instanceof ApiError && error.status === 404 ? 'missing' : 'error');
      }
    }, 15_000);
    return () => {
      stopped = true;
      stop();
    };
  }, [id]);

  return { order, status: order ? 'ready' : status };
}

/** Customer checkout. The shop works out the prices and total itself. */
export async function placeOrder(input: NewOrder): Promise<Order> {
  const order = await api<Order>('orders', { body: input });
  const mine = [order.id, ...customer.mine.filter((id) => id !== order.id)].slice(0, 30);
  try {
    localStorage.setItem(MINE_KEY, JSON.stringify(mine));
  } catch {
    // Still listed for this visit if storage is unavailable.
  }
  updateCustomer({ mine }, [order]);
  return order;
}

// ---------- Owner ----------

interface OwnerOrders {
  /** Every order still to deliver plus the latest finished ones, newest first. */
  orders: Order[];
  status: 'loading' | 'ready' | 'error';
}

let owner: OwnerOrders = { orders: [], status: 'loading' };
/** Server time of the last check; the next check asks only for orders changed since. */
let cursor = 0;

function mergeOwnerOrders(changed: Order[]) {
  const byId = new Map(owner.orders.map((order) => [order.id, order]));
  changed.forEach((order) => byId.set(order.id, order));
  owner = { orders: [...byId.values()].sort((a, b) => b.createdAt - a.createdAt), status: 'ready' };
  emit();
}

async function refreshOwnerOrders() {
  try {
    const result = await ownerApi<{ orders: Order[]; cursor: number }>(cursor ? `admin/orders?since=${cursor}` : 'admin/orders');
    cursor = result.cursor;
    if (result.orders.length > 0 || owner.status !== 'ready') mergeOwnerOrders(result.orders);
  } catch {
    if (owner.status === 'loading') {
      owner = { ...owner, status: 'error' };
      emit();
    }
  }
}

const ownerOrdersPoller = sharedPoller(() => void refreshOwnerOrders(), 10_000);

/** Owner: all orders, checked for new orders and changes every 10 seconds. */
export function useOwnerOrders(): OwnerOrders {
  useEffect(ownerOrdersPoller, []);
  return useSyncExternalStore(subscribe, () => owner);
}

/** Owner: moves an order to a delivery step. Moving back (to fix a mistake) clears the later steps. */
export async function setOrderStep(orderId: string, step: number) {
  mergeOwnerOrders([await ownerApi<Order>(`admin/orders/${orderId}`, { method: 'PATCH', body: { step } })]);
}

/** Owner: cancels an order, or restores a cancelled one. */
export async function setOrderCancelled(orderId: string, cancelled: boolean) {
  mergeOwnerOrders([await ownerApi<Order>(`admin/orders/${orderId}`, { method: 'PATCH', body: { cancelled } })]);
}
