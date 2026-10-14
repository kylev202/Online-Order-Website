import { CheckCircleIcon, CheckIcon, ChevronRightIcon, CloseCircleIcon, TruckIcon } from '../components/icons';
import { PageShell } from '../components/overlays';
import { store } from '../config/store';
import { formatDateTime, formatPrice } from '../lib/format';
import { navigate } from '../lib/router';
import { DELIVERY_STEPS, deliveryStep, isActive, isDelivered, useMyOrders, useTrackedOrder } from '../lib/orders';
import type { Order } from '../lib/types';

const timeOf = (ms: number) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const itemCount = (order: Order) => order.lines.reduce((n, line) => n + line.qty, 0);
const statusLabel = (order: Order) => (order.cancelledAt !== null ? 'Cancelled' : DELIVERY_STEPS[deliveryStep(order)].label);
const backToShop = () => navigate('/');

/** Delivery status for one order. */
export function OrderTrackingPage({ orderId }: { orderId: string }) {
  const { order, status } = useTrackedOrder(orderId);

  if (!order) {
    return (
      <PageShell title="Order" onClose={backToShop}>
        <div className="co-empty" role="status">
          {status === 'loading' ? (
            <>
              <span className="spinner" />
              <p>Loading your order…</p>
            </>
          ) : (
            <>
              <p>{status === 'missing' ? 'We couldn’t find this order.' : 'We can’t load this order right now. We’ll keep trying.'}</p>
              <button className="top-btn" onClick={() => navigate('/orders')}>
                My Orders
              </button>
            </>
          )}
        </div>
      </PageShell>
    );
  }

  const step = deliveryStep(order);
  const cancelled = order.cancelledAt !== null;
  const current = DELIVERY_STEPS[step];

  return (
    <PageShell
      title={`Order #${order.number}`}
      onClose={backToShop}
      footer={
        <button className="btn-block btn-black btn-bold" onClick={backToShop}>
          Back to Shop
        </button>
      }
    >
      <div className="track-hero" role="status">
        {cancelled ? (
          <>
            <CloseCircleIcon className="track-hero-icon track-hero-icon--cancelled" />
            <h2>Order Cancelled</h2>
            <p>This order has been cancelled. Questions? Call {store.phone}.</p>
          </>
        ) : (
          <>
            {isDelivered(order) ? <CheckCircleIcon className="track-hero-icon track-hero-icon--done" /> : <TruckIcon className="track-hero-icon" />}
            <h2>{current.label}</h2>
            <p>{current.detail}</p>
          </>
        )}
      </div>

      {!cancelled && (
        <ol className="track-steps">
          {DELIVERY_STEPS.map((s, i) => (
            <li key={s.label} className={`track-step${i < step ? ' track-step--done' : i === step ? ' track-step--current' : ''}`}>
              <span className="track-dot">{i <= step && <CheckIcon />}</span>
              <span className="track-label">{s.label}</span>
              {i <= step && <span className="track-time">{timeOf(order.statusTimes[i])}</span>}
            </li>
          ))}
        </ol>
      )}

      <section className="track-card">
        <h3>Delivery to</h3>
        <p>
          {order.customer.name} · {order.customer.phone}
        </p>
        <p>
          {order.address.street}, {order.address.suburb} {order.address.postcode}
        </p>
        {order.address.instructions && <p className="co-muted">Note: {order.address.instructions}</p>}
        <p className="co-muted">Delivery time: {order.deliveryTime}</p>
      </section>

      <section className="track-card">
        <h3>Order Summary</h3>
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

      <p className="co-demo">
        The shop updates this status as your order moves along. Have your photo ID ready ({store.minimumAge}+). Questions about your order? Call{' '}
        {store.phone}.
      </p>
    </PageShell>
  );
}

/** Orders placed in this browser. */
export function MyOrdersPage() {
  const { orders, loaded } = useMyOrders();

  return (
    <PageShell title="My Orders" onClose={backToShop}>
      {orders.length === 0 ? (
        <div className="co-empty" role="status">
          {loaded ? (
            <>
              <p>You haven’t placed any orders yet.</p>
              <button className="top-btn" onClick={backToShop}>
                Start Shopping
              </button>
            </>
          ) : (
            <>
              <span className="spinner" />
              <p>Loading your orders…</p>
            </>
          )}
        </div>
      ) : (
        orders.map((order) => (
          <button key={order.id} className="order-row" onClick={() => navigate(`/order/${order.id}`)}>
            <span className="co-grow">
              <span className="co-strong">Order #{order.number}</span>
              <span className="co-muted order-row-meta">
                {formatDateTime(order.createdAt)} · {itemCount(order)} items · {formatPrice(order.total)}
              </span>
            </span>
            <span
              className={`status-pill${order.cancelledAt !== null ? ' status-pill--cancelled' : isDelivered(order) ? ' status-pill--done' : ''}`}
            >
              {statusLabel(order)}
            </span>
            <ChevronRightIcon />
          </button>
        ))
      )}
    </PageShell>
  );
}

/** Floating "Order #1234 · Out for Delivery · Track" pill while an order is on its way. */
export function ActiveOrderPill({ raised }: { raised: boolean }) {
  const active = useMyOrders().orders.find(isActive);
  if (!active) return null;

  return (
    <button className={`order-pill${raised ? '' : ' order-pill--low'}`} onClick={() => navigate(`/order/${active.id}`)}>
      <TruckIcon />
      <span className="order-pill-text">
        Order #{active.number} · <strong>{statusLabel(active)}</strong>
      </span>
      <span className="order-pill-link">Track</span>
    </button>
  );
}
