import { useState } from 'react';
import { CheckIcon, CloseIcon } from '../components/icons';
import { Dialog } from '../components/overlays';
import { store } from '../config/store';
import { errorMessage } from '../lib/api';
import { formatDateTime, formatPrice } from '../lib/format';
import { DELIVERY_STEPS, deliveryStep, isActive, isDelivered, setOrderCancelled, setOrderStep, useOwnerOrders } from '../lib/orders';
import type { Order } from '../lib/types';

const FILTERS = [
  { id: 'active', label: 'To Deliver', matches: isActive, empty: 'No orders waiting. New orders show up here automatically.' },
  { id: 'delivered', label: 'Delivered', matches: (o: Order) => o.cancelledAt === null && isDelivered(o), empty: 'No delivered orders yet.' },
  { id: 'all', label: 'All', matches: () => true, empty: 'No orders yet.' },
];

/** Owner: every order, with its delivery details and a status the customer sees on their tracking page. */
export function OrdersManager() {
  const { orders, status } = useOwnerOrders();
  const [filterId, setFilterId] = useState('active');
  const [error, setError] = useState('');
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

      {error && (
        <div className="admin-alert" role="alert">
          <span>{error}</span>
          <button className="icon-btn" aria-label="Dismiss" onClick={() => setError('')}>
            <CloseIcon size={18} />
          </button>
        </div>
      )}

      <div className="chips chips--sm admin-filters" role="group" aria-label="Show orders">
        {FILTERS.map((f) => (
          <button key={f.id} className={`chip${f.id === filterId ? ' chip--on' : ''}`} aria-pressed={f.id === filterId} onClick={() => setFilterId(f.id)}>
            {f.label} ({orders.filter(f.matches).length})
          </button>
        ))}
      </div>

      {status === 'loading' ? (
        <div className="admin-cat admin-empty">Loading orders…</div>
      ) : status === 'error' ? (
        <div className="admin-cat admin-empty">We can’t load the orders right now. Trying again automatically…</div>
      ) : shown.length === 0 ? (
        <div className="admin-cat admin-empty">{filter.empty}</div>
      ) : (
        shown.map((order) => <OrderCard key={order.id} order={order} onError={setError} />)
      )}

      <p className="admin-sub admin-note">This page checks for new orders every few seconds. Older delivered orders are not listed.</p>
    </main>
  );
}

function OrderCard({ order, onError }: { order: Order; onError: (message: string) => void }) {
  const step = deliveryStep(order);
  const cancelled = order.cancelledAt !== null;
  const { customer, address } = order;
  const [busy, setBusy] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const run = async (change: () => Promise<void>) => {
    setBusy(true);
    try {
      await change();
      onError('');
    } catch (err) {
      onError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className={`admin-cat order-card${cancelled ? ' order-card--cancelled' : isDelivered(order) ? ' order-card--done' : ''}`} aria-busy={busy}>
      <div className="admin-cat-head">
        <h3>Order #{order.number}</h3>
        <span className="admin-count">{formatDateTime(order.createdAt)}</span>
        <span className="order-card-when">
          {cancelled ? 'Cancelled' : `Deliver ${order.deliveryTime === 'ASAP' ? 'ASAP' : `at ${order.deliveryTime}`}`}
        </span>
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
          <p className="co-muted">Check photo ID on delivery ({store.minimumAge}+).</p>
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
          <p className="co-muted">Payment: {order.payment}</p>
        </section>
      </div>

      {cancelled ? (
        <div className="order-card-foot">
          <span className="co-muted">Cancelled {formatDateTime(order.cancelledAt!)}. The customer sees this on their tracking page.</span>
          <button className="btn-sm" disabled={busy} onClick={() => run(() => setOrderCancelled(order.id, false))}>
            Restore Order
          </button>
        </div>
      ) : (
        <>
          <div className="order-steps" role="group" aria-label={`Delivery status for order ${order.number}`}>
            {DELIVERY_STEPS.map((s, i) => (
              <button
                key={s.label}
                className={`order-step${i < step ? ' order-step--done' : ''}${i === step ? ' order-step--current' : ''}`}
                aria-pressed={i === step}
                disabled={busy}
                onClick={() => run(() => setOrderStep(order.id, i))}
              >
                <span className="order-step-dot">{i <= step ? <CheckIcon /> : i + 1}</span>
                {s.label}
              </button>
            ))}
          </div>
          {!isDelivered(order) && (
            <div className="order-card-foot order-card-foot--end">
              <button className="link-btn link-btn--danger" disabled={busy} onClick={() => setConfirmingCancel(true)}>
                Cancel order
              </button>
            </div>
          )}
        </>
      )}

      {confirmingCancel && (
        <Dialog
          title="Cancel order"
          okText="Cancel Order"
          cancelText="Keep Order"
          danger
          onOk={() => {
            setConfirmingCancel(false);
            run(() => setOrderCancelled(order.id, true));
          }}
          onCancel={() => setConfirmingCancel(false)}
        >
          Cancel order #{order.number}? The customer will see it as cancelled. You can restore it later.
        </Dialog>
      )}
    </article>
  );
}
