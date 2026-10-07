export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  /** Second line under the name (short description or second-language name). */
  description: string;
  /** Price in cents, to keep totals exact. */
  price: number;
  /** Image URL or data URL; empty string shows the placeholder image. */
  image: string;
  tags: string[];
}

export interface Menu {
  categories: Category[];
  products: Product[];
}

export interface DayHours {
  day: string;
  /** "HH:MM"; leave open/close out for a closed day. */
  open?: string;
  close?: string;
}
