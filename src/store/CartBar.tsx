import { CartIcon } from '../components/icons';
import { formatPrice } from '../lib/format';

/** Bottom "Place Order" bar. Always shown on mobile; on desktop only once the cart has items. */
export function CartBar({ count, total, onOpen }: { count: number; total: number; onOpen: () => void }) {
  return (
    <div className={`cartbar${count === 0 ? ' cartbar--empty' : ''}`}>
      <button className="cartbar-inner" onClick={onOpen}>
        <span className="cartbar-icon">
          <CartIcon size="100%" />
          {count > 0 && <span className="badge cartbar-badge">{count}</span>}
        </span>
        <span className="cartbar-text">Place Order</span>
        <span className="cartbar-text">{formatPrice(total)}</span>
      </button>
    </div>
  );
}
