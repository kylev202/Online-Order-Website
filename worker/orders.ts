import { DELIVERY_STEPS } from '../src/lib/delivery';
import type { NewOrder, Order, OrderLine } from '../src/lib/types';
import type { Env } from './env';
import { clientIp, HttpError, json, readJson } from './http';
import { checkLimit, recordEvent } from './rateLimit';
import { catalogueId, integer, isOrderId, orderId, text } from './validate';

// Until an online payment provider is connected, customers pay the driver.
const PAYMENT = 'Pay on delivery';
const ORDER_LIMIT = { max: 10, windowMs: 10 * 60 * 1000, message: 'Too many orders from this device. Please wait a few minutes, or call the shop.' };
/** How many delivered or cancelled orders the owner's Orders page loads at first. */
const FINISHED_SHOWN = 100;

interface OrderRow {
  id: string;
  number: number;
  created_at: number;
  lines: string;
  total: number;
  delivery_time: string;
  customer: string;
  address: string;
  payment: string;
  status_times: string;
  cancelled_at: number | null;
}

const toOrder = (row: OrderRow): Order => ({
  id: row.id,
  number: row.number,
  createdAt: row.created_at,
  lines: JSON.parse(row.lines) as OrderLine[],
  total: row.total,
  deliveryTime: row.delivery_time,
  customer: JSON.parse(row.customer) as Order['customer'],
  address: JSON.parse(row.address) as Order['address'],
  payment: row.payment,
  statusTimes: JSON.parse(row.status_times) as number[],
  cancelledAt: row.cancelled_at,
});

const object = (value: unknown) => (value && typeof value === 'object' ? (value as Record<string, unknown>) : {});

function parseNewOrder(body: Record<string, unknown>): NewOrder {
  if (body.ageConfirmed !== true) throw new HttpError(400, 'Please confirm your age to place an order.');
  if (!Array.isArray(body.lines) || body.lines.length === 0) throw new HttpError(400, 'Your cart is empty.');
  if (body.lines.length > 50) throw new HttpError(400, 'Too many different items in one order.');

  // Merge repeated products into one line.
  const qtyById = new Map<string, number>();
  for (const raw of body.lines) {
    const line = object(raw);
    const productId = catalogueId(line.productId, 'p');
    const qty = integer(line.qty, 1, 99, 'Please choose a quantity between 1 and 99.');
    qtyById.set(productId, Math.min(99, (qtyById.get(productId) ?? 0) + qty));
  }

  const deliveryTime = body.deliveryTime;
  if (typeof deliveryTime !== 'string' || !/^(ASAP|([01]\d|2[0-3]):[0-5]\d)$/.test(deliveryTime)) {
    throw new HttpError(400, 'Please choose a delivery time.');
  }

  const customer = object(body.customer);
  const address = object(body.address);
  const phone = text(customer.phone, 'your mobile number', 30);
  if (phone.replace(/\D/g, '').length < 6) throw new HttpError(400, 'Please enter a valid mobile number.');

  return {
    lines: [...qtyById].map(([productId, qty]) => ({ productId, qty })),
    deliveryTime,
    customer: { name: text(customer.name, 'your name', 80), phone },
    address: {
      street: text(address.street, 'your street address', 120),
      suburb: text(address.suburb, 'your suburb', 60),
      postcode: text(address.postcode, 'your postcode', 12),
      instructions: text(address.instructions, 'delivery instructions', 300, false),
    },
    ageConfirmed: true,
  };
}

/** Customer checkout. Names and prices come from the database, never from the browser. */
export async function createOrder(request: Request, env: Env) {
  const limitKey = `order:${clientIp(request)}`;
  await checkLimit(env, limitKey, ORDER_LIMIT);
  const input = parseNewOrder(await readJson(request));

  const ids = input.lines.map((line) => line.productId);
  const { results } = await env.DB.prepare(`SELECT id, name, price FROM products WHERE id IN (${ids.map(() => '?').join(', ')})`)
    .bind(...ids)
    .all<{ id: string; name: string; price: number }>();
  const products = new Map(results.map((p) => [p.id, p]));
  const missing = ids.filter((id) => !products.has(id));
  if (missing.length > 0) throw new HttpError(409, 'Some items in your cart are no longer available.', { missing });

  const lines: OrderLine[] = input.lines.map(({ productId, qty }) => {
    const { name, price } = products.get(productId)!;
    return { productId, name, price, qty };
  });
  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const now = Date.now();
  const row = await env.DB.prepare(
    `INSERT INTO orders (id, number, created_at, updated_at, lines, total, delivery_time, customer, address, payment, status_times)
     VALUES (?1, (SELECT COALESCE(MAX(number), 1000) + 1 FROM orders), ?2, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
     RETURNING *`,
  )
    .bind(
      crypto.randomUUID(),
      now,
      JSON.stringify(lines),
      total,
      input.deliveryTime,
      JSON.stringify(input.customer),
      JSON.stringify(input.address),
      PAYMENT,
      JSON.stringify([now]),
    )
    .first<OrderRow>();
  await recordEvent(env, limitKey);
  return json(toOrder(row!), 201);
}

/** Customer tracking page. The id is unguessable, so the link itself is the key. */
export async function getOrder(_request: Request, env: Env, _ctx: ExecutionContext, [rawId]: string[]) {
  const row = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId(rawId)).first<OrderRow>();
  if (!row) throw new HttpError(404, 'We couldn’t find this order.');
  return json(toOrder(row));
}

/** Customer "My Orders": the orders whose ids this browser saved when they were placed. */
export async function lookupOrders(request: Request, env: Env) {
  const { ids } = await readJson(request);
  if (!Array.isArray(ids) || ids.length > 30) throw new HttpError(400, 'Invalid order list.');
  const valid = ids.filter(isOrderId);
  if (valid.length === 0) return json({ orders: [] });
  const { results } = await env.DB.prepare(`SELECT * FROM orders WHERE id IN (${valid.map(() => '?').join(', ')}) ORDER BY created_at DESC`)
    .bind(...valid)
    .all<OrderRow>();
  return json({ orders: results.map(toOrder) });
}

/**
 * Owner's Orders page. First load: every order still to deliver plus the latest finished ones.
 * After that the page passes back `cursor` and only gets orders that changed since.
 */
export async function listOrders(request: Request, env: Env) {
  const since = Number(new URL(request.url).searchParams.get('since'));
  // Overlap a few seconds so an update that was being saved during the last check is not missed.
  const cursor = Date.now() - 5000;
  const query =
    since > 0
      ? env.DB.prepare('SELECT * FROM orders WHERE updated_at > ? ORDER BY created_at DESC').bind(since)
      : env.DB.prepare(
          `SELECT * FROM orders WHERE cancelled_at IS NULL AND json_array_length(status_times) < ?1
           UNION ALL
           SELECT * FROM (
             SELECT * FROM orders WHERE cancelled_at IS NOT NULL OR json_array_length(status_times) >= ?1
             ORDER BY created_at DESC LIMIT ?2
           )
           ORDER BY created_at DESC`,
        ).bind(DELIVERY_STEPS.length, FINISHED_SHOWN);
  const { results } = await query.all<OrderRow>();
  return json({ orders: results.map(toOrder), cursor });
}

/** Owner: `{ step }` moves the order to a delivery step (moving back clears later steps); `{ cancelled }` cancels or restores it. */
export async function updateOrder(request: Request, env: Env, _ctx: ExecutionContext, [rawId]: string[]) {
  const id = orderId(rawId);
  const body = await readJson(request);
  const row = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first<OrderRow>();
  if (!row) throw new HttpError(404, 'We couldn’t find this order.');
  const order = toOrder(row);
  const now = Date.now();

  let { statusTimes, cancelledAt } = order;
  if (typeof body.cancelled === 'boolean') {
    cancelledAt = body.cancelled ? (cancelledAt ?? now) : null;
  } else {
    if (cancelledAt !== null) throw new HttpError(409, 'This order is cancelled. Restore it before changing its status.');
    const step = integer(body.step, 0, DELIVERY_STEPS.length - 1, 'Unknown delivery status.');
    statusTimes = statusTimes.slice(0, step + 1);
    while (statusTimes.length <= step) statusTimes.push(now);
  }

  const updated = await env.DB.prepare('UPDATE orders SET status_times = ?, cancelled_at = ?, updated_at = ? WHERE id = ? RETURNING *')
    .bind(JSON.stringify(statusTimes), cancelledAt, now, id)
    .first<OrderRow>();
  return json(toOrder(updated!));
}
