import type { Order } from './types';

// Delivery progress shown to the customer and updated by the owner on the Orders page.
// Shared with the server (worker/), so keep this file free of browser code.
export const DELIVERY_STEPS = [
  { label: 'Order Confirmed', detail: 'Thanks! We have received your order.' },
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

/** Still waiting to be delivered (not delivered and not cancelled). */
export function isActive(order: Order) {
  return order.cancelledAt === null && !isDelivered(order);
}
