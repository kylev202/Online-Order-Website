import { useSyncExternalStore } from 'react';
import { api } from './api';
import { ownerApi } from './ownerSession';
import type { Category, Menu, Product } from './types';

// The catalogue lives on the server. Owner edits are saved there first, then the menu is reloaded,
// so the page always shows what customers see.
export type MenuStatus = 'loading' | 'ready' | 'error';

let menu: Menu = { categories: [], products: [] };
let status: MenuStatus = 'loading';
let latestRequest = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMenu(): Menu {
  return useSyncExternalStore(subscribe, () => menu);
}

export function useMenuStatus(): MenuStatus {
  return useSyncExternalStore(subscribe, () => status);
}

/** Loads the menu from the server. If a reload fails, the menu already shown stays. */
export async function loadMenu() {
  const request = ++latestRequest;
  if (status === 'error') {
    status = 'loading';
    emit();
  }
  try {
    const next = await api<Menu>('menu');
    if (request !== latestRequest) return; // a newer reload has started
    menu = next;
    status = 'ready';
  } catch {
    if (request !== latestRequest || status === 'ready') return;
    status = 'error';
  }
  emit();
}

loadMenu();

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function dataUrlToBlob(dataUrl: string) {
  const [header, base64] = dataUrl.split(',');
  const type = /^data:([^;]+)/.exec(header)?.[1] ?? 'image/jpeg';
  return new Blob([Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))], { type });
}

/** Owner: adds or updates a product. A newly chosen photo (data URL) is uploaded first. */
export async function saveProduct(product: Product) {
  let { image } = product;
  if (image.startsWith('data:')) image = (await ownerApi<{ url: string }>('admin/images', { file: dataUrlToBlob(image) })).url;
  await ownerApi(`admin/products/${product.id}`, { method: 'PUT', body: { ...product, image } });
  await loadMenu();
}

export async function deleteProduct(id: string) {
  await ownerApi(`admin/products/${id}`, { method: 'DELETE' });
  await loadMenu();
}

export async function saveCategory(category: Category) {
  await ownerApi(`admin/categories/${category.id}`, { method: 'PUT', body: { name: category.name } });
  await loadMenu();
}

/** Deleting a category also deletes the products in it. */
export async function deleteCategory(id: string) {
  await ownerApi(`admin/categories/${id}`, { method: 'DELETE' });
  await loadMenu();
}
