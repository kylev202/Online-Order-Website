import { store } from '../config/store';
import { formatPrice } from '../lib/format';
import type { Product } from '../lib/types';
import { CartControl } from './CartControl';

export function ProductCard({ product, qty, onOpen }: { product: Product; qty: number; onOpen: () => void }) {
  return (
    <div className="product-card">
      {/* Covers the whole card: clicking anywhere except the cart control opens the details. */}
      <button className="product-open" onClick={onOpen} aria-label={`View ${product.name}`} />
      <img className="product-img" src={product.image || store.productPlaceholder} alt="" loading="lazy" />
      <div className="product-des">
        <div className="product-text">
          <span className="product-name">{product.name}</span>
          <span className="product-sub">{product.description}</span>
        </div>
        <div className="product-line">
          <span className="product-price">{formatPrice(product.price)}</span>
          <div className="product-cart">
            <CartControl product={product} qty={qty} />
          </div>
        </div>
      </div>
    </div>
  );
}
