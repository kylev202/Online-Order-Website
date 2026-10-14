import type { Category, Product } from '../src/lib/types';
import type { Env } from './env';
import { HttpError, json, readJson } from './http';
import { deleteImages } from './images';
import { catalogueId, imagePath, integer, tagList, text } from './validate';

interface ProductRow {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tags: string;
}

const toProduct = (row: ProductRow): Product => ({
  id: row.id,
  categoryId: row.category_id,
  name: row.name,
  description: row.description,
  price: row.price,
  image: row.image,
  tags: JSON.parse(row.tags) as string[],
});

const PRODUCT_COLUMNS = 'id, category_id, name, description, price, image, tags';

/** The whole catalogue in display order (customers' store and the owner's Menu page). */
export async function getMenu(_request: Request, env: Env) {
  const [categories, products] = await env.DB.batch([
    env.DB.prepare('SELECT id, name FROM categories ORDER BY position, id'),
    env.DB.prepare(`SELECT ${PRODUCT_COLUMNS} FROM products ORDER BY position, id`),
  ]);
  return json({ categories: categories.results as Category[], products: (products.results as ProductRow[]).map(toProduct) });
}

/** Adds a category at the end of the menu, or renames it. */
export async function saveCategory(request: Request, env: Env, _ctx: ExecutionContext, [rawId]: string[]) {
  const id = catalogueId(rawId, 'c');
  const name = text((await readJson(request)).name, 'a category name', 40);
  await env.DB.prepare(
    `INSERT INTO categories (id, name, position) VALUES (?1, ?2, (SELECT COALESCE(MAX(position), 0) + 1 FROM categories))
     ON CONFLICT (id) DO UPDATE SET name = excluded.name`,
  )
    .bind(id, name)
    .run();
  return json({ id, name } satisfies Category);
}

/** Deletes a category together with its products (and their uploaded photos). */
export async function deleteCategory(_request: Request, env: Env, ctx: ExecutionContext, [rawId]: string[]) {
  const id = catalogueId(rawId, 'c');
  const { results } = await env.DB.prepare('SELECT image FROM products WHERE category_id = ?').bind(id).all<{ image: string }>();
  await env.DB.batch([
    env.DB.prepare('DELETE FROM products WHERE category_id = ?').bind(id),
    env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id),
  ]);
  ctx.waitUntil(deleteImages(env, results.map((r) => r.image)));
  return json({ ok: true });
}

/** Adds or updates a product. New products, and products moved to another category, go last in their category. */
export async function saveProduct(request: Request, env: Env, ctx: ExecutionContext, [rawId]: string[]) {
  const body = await readJson(request);
  const product: Product = {
    id: catalogueId(rawId, 'p'),
    categoryId: catalogueId(body.categoryId, 'c'),
    name: text(body.name, 'a product name', 80),
    description: text(body.description, 'a description', 300, false),
    price: integer(body.price, 0, 10_000_000, 'Please enter a price, e.g. 12.50'),
    image: imagePath(body.image ?? ''),
    tags: tagList(body.tags),
  };

  const category = await env.DB.prepare('SELECT 1 FROM categories WHERE id = ?').bind(product.categoryId).first();
  if (!category) throw new HttpError(400, 'That category no longer exists. Please choose another one.');
  const old = await env.DB.prepare('SELECT category_id, image FROM products WHERE id = ?')
    .bind(product.id)
    .first<{ category_id: string; image: string }>();

  const values = [product.categoryId, product.name, product.description, product.price, product.image, JSON.stringify(product.tags)];
  const lastPosition = '(SELECT COALESCE(MAX(position), 0) + 1 FROM products WHERE category_id = ?2)';
  if (!old) {
    await env.DB.prepare(
      `INSERT INTO products (id, category_id, name, description, price, image, tags, position) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ${lastPosition})`,
    )
      .bind(product.id, ...values)
      .run();
  } else {
    const position = old.category_id === product.categoryId ? 'position' : lastPosition;
    await env.DB.prepare(
      `UPDATE products SET category_id = ?2, name = ?3, description = ?4, price = ?5, image = ?6, tags = ?7, position = ${position} WHERE id = ?1`,
    )
      .bind(product.id, ...values)
      .run();
    if (old.image !== product.image) ctx.waitUntil(deleteImages(env, [old.image]));
  }
  return json(product);
}

export async function deleteProduct(_request: Request, env: Env, ctx: ExecutionContext, [rawId]: string[]) {
  const id = catalogueId(rawId, 'p');
  const old = await env.DB.prepare('DELETE FROM products WHERE id = ? RETURNING image').bind(id).first<{ image: string }>();
  if (old) ctx.waitUntil(deleteImages(env, [old.image]));
  return json({ ok: true });
}
