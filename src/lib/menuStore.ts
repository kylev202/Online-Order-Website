import { useSyncExternalStore } from 'react';
import { seedMenu } from '../data/seedMenu';
import type { Category, Menu, Product } from './types';

// Demo persistence: the menu lives in this browser's localStorage.
// Swap these functions for API calls when the backend is built.
const KEY = 'ordering-demo.menu.v2';
const listeners = new Set<() => void>();

function readSaved(): Menu {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Menu;
  } catch {
    // Unreadable or blocked storage: fall back to the sample menu.
  }
  return seedMenu;
}

let menu = readSaved();

function emit() {
  listeners.forEach((listener) => listener());
}

// Saves before updating memory, so the page never shows changes that were not saved.
// Throws when the browser's storage is full (e.g. too many large images).
function commit(next: Menu) {
  localStorage.setItem(KEY, JSON.stringify(next));
  menu = next;
  emit();
}

// Keep other open tabs (e.g. storefront + admin) in sync.
window.addEventListener('storage', (event) => {
  if (event.key === KEY) {
    menu = readSaved();
    emit();
  }
});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMenu(): Menu {
  return useSyncExternalStore(subscribe, () => menu);
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function upsert<T extends { id: string }>(list: T[], item: T) {
  return list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item];
}

export function saveProduct(product: Product) {
  commit({ ...menu, products: upsert(menu.products, product) });
}

export function deleteProduct(id: string) {
  commit({ ...menu, products: menu.products.filter((p) => p.id !== id) });
}

export function saveCategory(category: Category) {
  commit({ ...menu, categories: upsert(menu.categories, category) });
}

// Deleting a category also deletes the products in it.
export function deleteCategory(id: string) {
  commit({
    categories: menu.categories.filter((c) => c.id !== id),
    products: menu.products.filter((p) => p.categoryId !== id),
  });
}

export function resetMenu() {
  localStorage.removeItem(KEY);
  menu = seedMenu;
  emit();
}
