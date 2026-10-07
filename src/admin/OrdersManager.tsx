import { useState } from 'react';
import { CheckIcon } from '../components/icons';
import { formatDateTime, formatPrice } from '../lib/format';
import { DELIVERY_STEPS, deliveryStep, isDelivered, setOrderStep, useOrders, type Order } from '../lib/orders';

const FILTERS = [
  { id: 'active', label: 'To Deliver', matches: (o: Order) => !isDelivered(o), empty: 'No orders waiting. New orders will show up here.' },
  { id: 'delivered', label: 'Delivered', matches: isDelivered, empty: 'No delivered orders yet.' },
  { id: 'all', label: 'All', matches: () => true, empty: 'No orders yet.' },
];

/** Owner: every order, with its delivery details and a status the customer sees on their tracking page. */
export function OrdersManager() {
  const orders = useOrders();
  const [filterId, setFilterId] = useState('active');
  const filter = FILTERS.find((f) => f.id === filterId) ?? FILTERS[0];
  const shown = orders.filter(filter.matches);

  return (
    <main className="admin-main">
      <div className="admin-toolbar">
        <div>
          <h2 className="admin-title">Orders</h2>
          <p className="admin-sub">Tap a status to update an order. The customer sees it on their tracking page straight away.</p>
        </div>
      </div>

      <div className="chips chips--sm admin-filters" role="group" aria-label="Show orders">
        {FILTERS.map((f) => (
          <button key={f.id} className={`chip${f.id === filterId ? ' chip--on' : ''}`} aria-pressed={f.id === filterId} onClick={() => setFilterId(f.id)}>
            {f.label} ({orders.filter(f.matches).length})
          </button>
        ))}
      </div>

      {shown.length === 0 ? <div className="admin-cat admin-empty">{filter.empty}</div> : shown.map((order) => <OrderCard key={order.id} order={order} />)}

      <p className="admin-sub admin-note">Demo: this page shows the orders placed in this browser. The live site will collect every customer’s orders here.</p>
    </main>
  );
}

function OrderCard({ order }: { order: Order }) {
  const step = deliveryStep(order);
  const { customer, address } = order;

  return (
    <article className={`admin-cat order-card${isDelivered(order) ? ' order-card--done' : ''}`}>
      <div className="admin-cat-head">
        <h3>Order #{order.number}</h3>
        <span className="admin-count">{formatDateTime(order.createdAt)}</span>
        <span className="order-card-when">Deliver {order.deliveryTime === 'ASAP' ? 'ASAP' : `at ${order.deliveryTime}`}</span>
      </div>

      <div className="order-card-body">
        <section>
          <h4 className="order-card-label">Customer</h4>
          <p className="co-strong">{customer.name}</p>
          <p>
            <a className="order-card-phone" href={`tel:${customer.phone.replace(/\s/g, '')}`}>
              {customer.phone}
            </a>
          </p>
          <p>
            {address.street}, {address.suburb} {address.postcode}
          </p>
          {address.instructions && <p className="order-card-note">Note: {address.instructions}</p>}
        </section>
        <section>
          <h4 className="order-card-label">Items</h4>
          {order.lines.map((line) => (
            <div key={line.productId} className="co-sum-row">
              <span>
                {line.qty} × {line.name}
              </span>
              <span>{formatPrice(line.price * line.qty)}</span>
            </div>
          ))}
          <div className="co-sum-row co-sum-total">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
          <p className="co-muted">Paid with {order.payment}</p>
        </section>
      </div>

      <div className="order-steps" role="group" aria-label={`Delivery status for order ${order.number}`}>
        {DELIVERY_STEPS.map((s, i) => (
          <button
            key={s.label}
            className={`order-step${i < step ? ' order-step--done' : ''}${i === step ? ' order-step--current' : ''}`}
            aria-pressed={i === step}
            onClick={() => setOrderStep(order.id, i)}
          >
            <span className="order-step-dot">{i <= step ? <CheckIcon /> : i + 1}</span>
            {s.label}
          </button>
        ))}
      </div>
    </article>
  );
}
