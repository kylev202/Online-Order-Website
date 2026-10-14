// End-to-end test of the shop API against the LOCAL dev server (`npm run dev`).
// It creates test orders, so it refuses to run against anything but localhost.
//
//   npm run test:api                       (uses http://127.0.0.1:5173 and ADMIN_PASSWORD from .dev.vars)
//   npm run test:api -- http://127.0.0.1:5173
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';

const BASE = (process.argv[2] ?? 'http://127.0.0.1:5173').replace(/\/$/, '');
if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(BASE)) {
  console.error(`Refusing to run against ${BASE}: this test creates orders. Use the local dev server.`);
  process.exit(1);
}
const PASSWORD = process.env.ADMIN_PASSWORD ?? /^ADMIN_PASSWORD=(.*)$/m.exec(readFileSync('.dev.vars', 'utf8'))?.[1]?.trim();
// Each run pretends to come from fresh visitor addresses, so the rate limits of earlier runs don't interfere.
const ip = () => `10.${[1, 2, 3].map(() => Math.floor(Math.random() * 250)).join('.')}`;
const VISITOR = ip();

let passed = 0;
const failures = [];

async function test(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ok  ${name}`);
  } catch (error) {
    failures.push(name);
    console.log(`  FAIL ${name}\n       ${error.message}`);
  }
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

async function call(path, { method = 'GET', body, file, type, cookie, origin, from = VISITOR } = {}) {
  const headers = { 'CF-Connecting-IP': from };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (file) headers['Content-Type'] = type;
  if (cookie) headers.Cookie = cookie;
  if (origin) headers.Origin = origin;
  else if (method !== 'GET') headers.Origin = BASE; // what a browser sends from the shop's own pages
  const res = await fetch(BASE + path, { method, headers, body: file ?? (body !== undefined ? JSON.stringify(body) : undefined) });
  const text = await res.text();
  let data = {};
  try {
    data = JSON.parse(text);
  } catch {
    // not JSON (e.g. an image)
  }
  return { status: res.status, headers: res.headers, data, size: text.length };
}

const orderBody = (lines, extra = {}) => ({
  lines,
  deliveryTime: 'ASAP',
  customer: { name: 'Test Customer', phone: '0412 345 678' },
  address: { street: '1 Test Street', suburb: 'Testville', postcode: '1234', instructions: 'Ring twice' },
  ageConfirmed: true,
  ...extra,
});

console.log(`Testing ${BASE}\n`);
const run = randomUUID().slice(0, 8);
const categoryId = `c-test-${run}`;
const productId = `p-test-${run}`;
let cookie = '';
let uploaded = '';
let order;

console.log('Catalogue');
await test('menu lists 21 categories in the agreed order and 127 products', async () => {
  const { status, data } = await call('/api/menu');
  expect(status === 200, `status ${status}`);
  const names = data.categories.map((c) => c.name);
  expect(names[0] === 'CIGARETTES' && names[1] === 'IGET' && names[2] === 'ALIBARBAR', `starts ${names.slice(0, 3)}`);
  expect(names.at(-1) === 'CONDOMS' || names.includes('CONDOMS'), 'has CONDOMS');
  expect(names.filter((n) => !n.startsWith('TEST')).length === 21, `${names.length} categories`);
  expect(data.products.filter((p) => !p.id.startsWith('p-test-')).length === 127, `${data.products.length} products`);
});
await test('prices come from folder and file names', async () => {
  const { data } = await call('/api/menu');
  const price = (id) => data.products.find((p) => p.id === id)?.price;
  expect(price('p-manchester-sapphire-blue') === 1700, 'cigarettes $17');
  expect(price('p-xtreme-whip-cream-chargers') === 900 && price('p-skywhip-pro-max') === 4500 && price('p-party-balloons') === 500, 'cream charger prices');
  expect(price('p-mini-torch-lighter') === 1500 && price('p-tiko-table-torch-lighter') === 3500, 'jet lighter prices');
  expect(price('p-raw-black-rolling-tray') === 400, 'RAW papers $4');
});
await test('catalogue photos are served', async () => {
  const res = await fetch(`${BASE}/products/manchester-sapphire-blue.webp`);
  expect(res.status === 200 && res.headers.get('content-type')?.includes('image/webp'), `status ${res.status} ${res.headers.get('content-type')}`);
});

console.log('\nOwner login');
await test('owner pages need a login', async () => {
  const session = await call('/api/admin/session');
  expect(session.status === 200 && session.data.signedIn === false, 'session check says signed out');
  expect((await call(`/api/admin/products/${productId}`, { method: 'PUT', body: {} })).status === 401, 'save without cookie');
  expect((await call('/api/admin/orders')).status === 401, 'orders without cookie');
});
await test('wrong password is refused', async () => {
  const { status, data } = await call('/api/admin/login', { method: 'POST', body: { password: 'nope-nope' }, from: ip() });
  expect(status === 401 && /wrong password/i.test(data.error), `${status} ${data.error}`);
});
await test('writes from another website are blocked', async () => {
  const { status } = await call('/api/admin/login', { method: 'POST', body: { password: PASSWORD }, origin: 'https://evil.example' });
  expect(status === 403, `status ${status}`);
});
await test('too many wrong passwords lock that visitor out for a while', async () => {
  const attacker = ip();
  for (let i = 0; i < 10; i += 1) await call('/api/admin/login', { method: 'POST', body: { password: `guess-${i}` }, from: attacker });
  const blocked = await call('/api/admin/login', { method: 'POST', body: { password: PASSWORD }, from: attacker });
  expect(blocked.status === 429, `11th attempt status ${blocked.status}`);
});
await test('correct password signs in with a secure cookie', async () => {
  const res = await call('/api/admin/login', { method: 'POST', body: { password: PASSWORD }, from: ip() });
  const setCookie = res.headers.get('set-cookie') ?? '';
  expect(res.status === 200, `status ${res.status} ${res.data.error ?? ''}`);
  for (const part of ['HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/api']) expect(setCookie.includes(part), `cookie missing ${part}`);
  cookie = setCookie.split(';')[0];
  expect((await call('/api/admin/session', { cookie })).data.signedIn === true, 'session check says signed in');
});

console.log('\nMenu editing');
await test('add a category, then rename it', async () => {
  expect((await call(`/api/admin/categories/${categoryId}`, { method: 'PUT', body: { name: 'TEST CATEGORY' }, cookie })).status === 200, 'add');
  expect((await call(`/api/admin/categories/${categoryId}`, { method: 'PUT', body: { name: 'TEST RENAMED' }, cookie })).status === 200, 'rename');
  const { data } = await call('/api/menu');
  expect(data.categories.at(-1).id === categoryId && data.categories.at(-1).name === 'TEST RENAMED', 'new category is last and renamed');
});
await test('upload a product photo', async () => {
  const photo = readFileSync('public/products/bic-lighter.webp');
  const { status, data } = await call('/api/admin/images', { method: 'POST', file: photo, type: 'image/webp', cookie });
  expect(status === 201 && /^\/images\/products\/[0-9a-f-]{36}\.webp$/.test(data.url), `${status} ${JSON.stringify(data)}`);
  uploaded = data.url;
  const res = await fetch(BASE + uploaded);
  expect(res.status === 200 && res.headers.get('cache-control')?.includes('immutable'), `serve ${res.status}`);
});
await test('photo upload refuses non-images', async () => {
  const { status } = await call('/api/admin/images', { method: 'POST', file: Buffer.from('hello'), type: 'text/plain', cookie });
  expect(status === 415, `status ${status}`);
});
await test('add a product with the uploaded photo', async () => {
  const body = { categoryId, name: 'Test Lighter', description: 'Made by the API test', price: 1234, image: uploaded, tags: ['New'] };
  const { status, data } = await call(`/api/admin/products/${productId}`, { method: 'PUT', body, cookie });
  expect(status === 200 && data.price === 1234, `${status} ${JSON.stringify(data)}`);
  const menu = await call('/api/menu');
  const saved = menu.data.products.find((p) => p.id === productId);
  expect(saved && saved.image === uploaded && saved.tags[0] === 'New', 'product in menu');
});
await test('product checks: outside images, unknown category and bad prices are refused', async () => {
  const base = { categoryId, name: 'X', description: '', price: 100, image: '', tags: [] };
  for (const [change, label] of [
    [{ image: 'https://evil.example/x.png' }, 'outside image'],
    [{ image: 'javascript:alert(1)' }, 'script image'],
    [{ categoryId: 'c-does-not-exist' }, 'unknown category'],
    [{ price: -5 }, 'negative price'],
    [{ price: 12.5 }, 'fractional cents'],
    [{ name: '' }, 'empty name'],
  ]) {
    const { status } = await call(`/api/admin/products/p-check-${run}`, { method: 'PUT', body: { ...base, ...change }, cookie });
    expect(status === 400, `${label}: status ${status}`);
  }
});
await test('replacing a photo deletes the old upload', async () => {
  const photo = readFileSync('public/products/bic-lighter.webp');
  const second = (await call('/api/admin/images', { method: 'POST', file: photo, type: 'image/webp', cookie })).data.url;
  const body = { categoryId, name: 'Test Lighter', description: 'Made by the API test', price: 1234, image: second, tags: [] };
  expect((await call(`/api/admin/products/${productId}`, { method: 'PUT', body, cookie })).status === 200, 'save');
  await new Promise((r) => setTimeout(r, 300));
  expect((await fetch(BASE + uploaded)).status === 404, 'old photo still served');
  uploaded = second;
});

console.log('\nOrdering');
await test('order total is worked out by the shop, not the browser', async () => {
  const lines = [
    { productId, qty: 2, price: 1 },
    { productId: 'p-manchester-sapphire-blue', qty: 1, name: 'Free stuff' },
  ];
  const { status, data } = await call('/api/orders', { method: 'POST', body: orderBody(lines, { total: 1 }) });
  expect(status === 201, `status ${status} ${data.error ?? ''}`);
  expect(data.total === 1234 * 2 + 1700, `total ${data.total}`);
  expect(data.lines.find((l) => l.productId === 'p-manchester-sapphire-blue').name === 'Manchester Sapphire Blue', 'name from database');
  expect(data.number > 1000 && data.statusTimes.length === 1 && data.cancelledAt === null && data.payment === 'Pay on delivery', 'new order fields');
  order = data;
});
await test('order checks: age, missing items, phone, time, empty cart, other websites', async () => {
  const one = [{ productId, qty: 1 }];
  expect((await call('/api/orders', { method: 'POST', body: orderBody(one, { ageConfirmed: false }) })).status === 400, 'age not confirmed');
  const missing = await call('/api/orders', { method: 'POST', body: orderBody([{ productId: 'p-gone-forever', qty: 1 }]) });
  expect(missing.status === 409 && missing.data.missing?.[0] === 'p-gone-forever', `missing product ${missing.status}`);
  expect((await call('/api/orders', { method: 'POST', body: orderBody(one, { customer: { name: 'A', phone: '12' } }) })).status === 400, 'short phone');
  expect((await call('/api/orders', { method: 'POST', body: orderBody(one, { deliveryTime: '25:00' }) })).status === 400, 'bad time');
  expect((await call('/api/orders', { method: 'POST', body: orderBody([]) })).status === 400, 'empty cart');
  expect((await call('/api/orders', { method: 'POST', body: orderBody(one), origin: 'https://evil.example' })).status === 403, 'other website');
});
await test('customer can track the order by its link', async () => {
  const { status, data } = await call(`/api/orders/${order.id}`);
  expect(status === 200 && data.number === order.number, `status ${status}`);
  expect((await call('/api/orders/not-an-id')).status === 404, 'bad id');
  expect((await call(`/api/orders/${randomUUID()}`)).status === 404, 'unknown id');
});
await test('"My Orders" lookup ignores ids it does not know', async () => {
  const { status, data } = await call('/api/orders/lookup', { method: 'POST', body: { ids: [order.id, 'junk', randomUUID()] } });
  expect(status === 200 && data.orders.length === 1 && data.orders[0].id === order.id, `${status} ${data.orders?.length}`);
});

console.log('\nOwner orders');
let cursor = 0;
await test('new order shows on the owner Orders page', async () => {
  const { status, data } = await call('/api/admin/orders', { cookie });
  expect(status === 200 && data.orders.some((o) => o.id === order.id) && typeof data.cursor === 'number', `status ${status}`);
  cursor = data.cursor;
});
await test('status updates reach the customer, and moving back clears later steps', async () => {
  const forward = await call(`/api/admin/orders/${order.id}`, { method: 'PATCH', body: { step: 2 }, cookie });
  expect(forward.status === 200 && forward.data.statusTimes.length === 3, `forward ${forward.status}`);
  expect((await call(`/api/orders/${order.id}`)).data.statusTimes.length === 3, 'customer sees Out for Delivery');
  const back = await call(`/api/admin/orders/${order.id}`, { method: 'PATCH', body: { step: 0 }, cookie });
  expect(back.data.statusTimes.length === 1, 'back to Order Confirmed');
  expect((await call(`/api/admin/orders/${order.id}`, { method: 'PATCH', body: { step: 9 }, cookie })).status === 400, 'unknown step');
});
await test('changes since the last check are picked up', async () => {
  const { data } = await call(`/api/admin/orders?since=${cursor}`, { cookie });
  expect(data.orders.some((o) => o.id === order.id), 'updated order returned');
});
await test('cancel and restore an order', async () => {
  const cancelled = await call(`/api/admin/orders/${order.id}`, { method: 'PATCH', body: { cancelled: true }, cookie });
  expect(cancelled.status === 200 && cancelled.data.cancelledAt !== null, 'cancelled');
  expect((await call(`/api/orders/${order.id}`)).data.cancelledAt !== null, 'customer sees cancelled');
  expect((await call(`/api/admin/orders/${order.id}`, { method: 'PATCH', body: { step: 1 }, cookie })).status === 409, 'no status change while cancelled');
  const restored = await call(`/api/admin/orders/${order.id}`, { method: 'PATCH', body: { cancelled: false }, cookie });
  expect(restored.data.cancelledAt === null, 'restored');
});
await test('mark delivered', async () => {
  const { data } = await call(`/api/admin/orders/${order.id}`, { method: 'PATCH', body: { step: 3 }, cookie });
  expect(data.statusTimes.length === 4, `steps ${data.statusTimes.length}`);
});
await test('one visitor can only place 10 orders in 10 minutes', async () => {
  const visitor = ip();
  const statuses = [];
  for (let i = 0; i < 11; i += 1) statuses.push((await call('/api/orders', { method: 'POST', body: orderBody([{ productId, qty: 1 }]), from: visitor })).status);
  expect(statuses.slice(0, 10).every((s) => s === 201) && statuses[10] === 429, statuses.join(','));
});

console.log('\nClean up');
await test('delete the test product (its photo goes too)', async () => {
  expect((await call(`/api/admin/products/${productId}`, { method: 'DELETE', cookie })).status === 200, 'delete');
  await new Promise((r) => setTimeout(r, 300));
  expect((await fetch(BASE + uploaded)).status === 404, 'photo deleted');
  expect(!(await call('/api/menu')).data.products.some((p) => p.id === productId), 'gone from menu');
});
await test('deleting a category deletes its products', async () => {
  await call(`/api/admin/products/p-cascade-${run}`, { method: 'PUT', body: { categoryId, name: 'Cascade', description: '', price: 1, image: '', tags: [] }, cookie });
  expect((await call(`/api/admin/categories/${categoryId}`, { method: 'DELETE', cookie })).status === 200, 'delete');
  const { data } = await call('/api/menu');
  expect(!data.categories.some((c) => c.id === categoryId) && !data.products.some((p) => p.id === `p-cascade-${run}`), 'category and product gone');
});
await test('unknown routes and methods', async () => {
  expect((await call('/api/nothing-here')).status === 404, '404');
  expect((await call('/api/menu', { method: 'DELETE' })).status === 405, '405');
});
await test('log out ends the session', async () => {
  const res = await call('/api/admin/logout', { method: 'POST', cookie });
  expect(res.status === 200 && (res.headers.get('set-cookie') ?? '').includes('Max-Age=0'), 'cookie cleared');
  expect((await call('/api/admin/session', { cookie })).data.signedIn === false, 'old cookie no longer signed in');
  expect((await call('/api/admin/orders', { cookie })).status === 401, 'old cookie refused');
});

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length > 0) process.exit(1);
