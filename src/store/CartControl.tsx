import { Stepper } from '../components/controls';
import { CartIcon } from '../components/icons';
import { addToCart, setQty } from '../lib/orderStore';
import type { Product } from '../lib/types';

/**
 * Cart shortcut on a product. The cart button adds one; it then turns into a − qty + stepper,
 * and goes back to the cart button when the quantity reaches 0.
 */
export function CartControl({ product, qty }: { product: Product; qty: number }) {
  if (qty === 0) {
    return (
      <button className="cart-shortcut" aria-label={`Add ${product.name} to cart`} onClick={() => addToCart(product.id, 1)}>
        <CartIcon />
      </button>
    );
  }
  return <Stepper value={qty} onChange={(value) => setQty(product.id, value)} label={`${product.name} quantity`} />;
}
