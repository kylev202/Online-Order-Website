import catalogSql from '../../migrations/0002_catalog.sql?raw';
import { ApiError } from './api';
import type { Menu, NewOrder, Order, Product } from './types';

// GitHub Pages preview only (`npm run build:pages`). Pages can't run the API in worker/, so this stands
// in for it inside the browser: the menu starts from the catalogue migration, and orders, menu edits and
// the owner login are kept in this browser's localStorage. Nothing is shared between devices.

/** Owner password for the preview. */
export const DEMO_PASSWORD = 'demo1234';

const KEY = 'shop.demo.v1';

interface DemoState {
  menu: Menu;
  orders: Order[];
  signedIn: boolean;
}

/** The starting catalogue, read from the INSERT statements in migrations/0002_catalog.sql. */
function seedMenu(): Menu {
  const menu: Menu = { categories: [], products: [] };
  for (const [, table, values] of catalogSql.matchAll(/^INSERT INTO (\w+) \(.*?\) VALUES \((.*)\);$/gm)) {
    const v = [...values.matchAll(/'((?:[^']|'')*)'|(\d+)/g)].map(([, str, num]) => (str !== undefined ? str.replace(/''/g, "'") : num));
    if (table === 'categories') menu.categories.push({ id: v[0], name: v[1] });
    else menu.products.push({ id: v[0], categoryId: v[1], name: v[2], description: v[3], price: Number(v[4]), image: v[5], tags: JSON.parse(v[6]) });
  }
  return menu;
}

function load(): DemoState {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return JSON.parse(saved) as DemoState;
  } catch {
    // Start from the catalogue.
  }
  return { menu: seedMenu(), orders: [], signedIn: false };
}

function save(state: DemoState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    fail(507, 'This browser’s storage for the preview is full. Try a smaller photo.');
  }
}

function fail(status: number, message: string, data?: Record<string, unknown>): never {
  throw new ApiError(message, status, data);
}

const findOrder = (state: DemoState, id: string) => state.orders.find((o) => o.id === id) ?? fail(404, 'We couldn’t find this order.');

type Handler = (state: DemoState, id: string, input: Record<string, unknown>, file?: Blob) => unknown;

// Same routes and answers as worker/index.ts.
const ROUTES: Record<string, Handler> = {
  'GET menu': (s) => s.menu,

  'POST orders': (s, _id, input) => {
    const { lines, deliveryTime, customer, address } = input as unknown as NewOrder;
    if (!lines?.length) fail(400, 'Your cart is empty.');
    const missing = lines.filter((l) => !s.menu.products.some((p) => p.id === l.productId)).map((l) => l.productId);
    if (missing.length > 0) fail(409, 'Some items in your cart are no longer available.', { missing });
    const orderLines = lines.map(({ productId, qty }) => {
      const { name, price } = s.menu.products.find((p) => p.id === productId)!;
      return { productId, name, price, qty };
    });
    const now = Date.now();
    const order: Order = {
      id: crypto.randomUUID(),
      number: Math.max(1000, ...s.orders.map((o) => o.number)) + 1,
      createdAt: now,
      lines: orderLines,
      total: orderLines.reduce((sum, l) => sum + l.price * l.qty, 0),
      deliveryTime,
      customer,
      address,
      payment: 'Pay on delivery',
      statusTimes: [now],
      cancelledAt: null,
    };
    s.orders.unshift(order);
    return order;
  },
  'POST orders/lookup': (s, _id, input) => ({ orders: s.orders.filter((o) => (input.ids as string[]).includes(o.id)) }),
  'GET orders/:id': (s, id) => findOrder(s, id),

  'POST admin/login': (s, _id, input) => {
    if (input.password !== DEMO_PASSWORD) fail(401, 'Wrong password, please try again.');
    s.signedIn = true;
    return { ok: true };
  },
  'POST admin/logout': (s) => {
    s.signedIn = false;
    return { ok: true };
  },
  'GET admin/session': (s) => ({ signedIn: s.signedIn }),

  'PUT admin/categories/:id': (s, id, input) => {
    const category = { id, name: String(input.name).trim() };
    const index = s.menu.categories.findIndex((c) => c.id === id);
    if (index >= 0) s.menu.categories[index] = category;
    else s.menu.categories.push(category);
    return category;
  },
  'DELETE admin/categories/:id': (s, id) => {
    s.menu.categories = s.menu.categories.filter((c) => c.id !== id);
    s.menu.products = s.menu.products.filter((p) => p.categoryId !== id);
    return { ok: true };
  },
  'PUT admin/products/:id': (s, id, input) => {
    const product = { ...(input as unknown as Product), id };
    const index = s.menu.products.findIndex((p) => p.id === id);
    // New products, and products moved to another category, go last in their category.
    if (index >= 0 && s.menu.products[index].categoryId === product.categoryId) s.menu.products[index] = product;
    else {
      if (index >= 0) s.menu.products.splice(index, 1);
      s.menu.products.push(product);
    }
    return product;
  },
  'DELETE admin/products/:id': (s, id) => {
    s.menu.products = s.menu.products.filter((p) => p.id !== id);
    return { ok: true };
  },
  // Uploaded photos are kept in the product itself, as a data URL.
  'POST admin/images': (_s, _id, _input, file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result });
      reader.onerror = () => reject(new ApiError('That image could not be used. Please upload it again.', 400));
      reader.readAsDataURL(file!);
    }),
  'GET admin/orders': (s) => ({ orders: s.orders, cursor: Date.now() }),
  'PATCH admin/orders/:id': (s, id, input) => {
    const order = findOrder(s, id);
    const { step, cancelled } = input as { step?: number; cancelled?: boolean };
    if (typeof cancelled === 'boolean') order.cancelledAt = cancelled ? (order.cancelledAt ?? Date.now()) : null;
    else {
      if (order.cancelledAt !== null) fail(409, 'This order is cancelled. Restore it before changing its status.');
      order.statusTimes = order.statusTimes.slice(0, step! + 1);
      while (order.statusTimes.length <= step!) order.statusTimes.push(Date.now());
    }
    return order;
  },
};

const OPEN_ADMIN_ROUTES = ['admin/login', 'admin/logout', 'admin/session'];

/** Answers an api() call in the browser. State is read fresh each time, so open tabs stay in step. */
export async function demoApi<T>(path: string, method: string, body: unknown, file?: Blob): Promise<T> {
  const state = load();
  const route = path.split('?')[0];
  const handler = ROUTES[`${method} ${route.replace(/\/([cp]-[\w-]+|[0-9a-f-]{36})$/, '/:id')}`] ?? fail(404, 'Not found.');
  if (route.startsWith('admin/') && !OPEN_ADMIN_ROUTES.includes(route) && !state.signedIn) fail(401, 'Please log in.');
  const result = await handler(state, decodeURIComponent(route.split('/').at(-1)!), (body ?? {}) as Record<string, unknown>, file);
  if (method !== 'GET') save(state);
  return result as T;
}
