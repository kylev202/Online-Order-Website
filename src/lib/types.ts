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

export interface OrderLine {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  number: number;
  createdAt: number;
  lines: OrderLine[];
  total: number;
  deliveryTime: string;
  customer: { name: string; phone: string };
  address: { street: string; suburb: string; postcode: string; instructions: string };
  /** How the customer pays, e.g. "Pay on delivery". */
  payment: string;
  /** When each delivery step was reached (index = DELIVERY_STEPS index); the last one is the current step. */
  statusTimes: number[];
  /** Set while the owner has cancelled the order. */
  cancelledAt: number | null;
}

/** What the checkout sends; the server looks up names and prices itself. */
export interface NewOrder {
  lines: Array<{ productId: string; qty: number }>;
  deliveryTime: string;
  customer: Order['customer'];
  address: Order['address'];
  /** The customer confirmed they are old enough to buy (store.minimumAge). */
  ageConfirmed: boolean;
}

export interface DayHours {
  day: string;
  /** "HH:MM"; leave open/close out for a closed day. */
  open?: string;
  close?: string;
}
