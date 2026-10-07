import { CloseIcon } from '../components/icons';
import { Modal } from '../components/overlays';
import { store } from '../config/store';
import { formatPrice } from '../lib/format';
import type { Product } from '../lib/types';
import { CartControl } from './CartControl';

/** Product details (bigger photo, full description). Adding uses the same cart shortcut as the card. */
export function ProductModal({ product, qty, onClose }: { product: Product; qty: number; onClose: () => void }) {
  return (
    <Modal onClose={onClose} className="product-modal" align="center">
      <button className="pm-close" onClick={onClose} aria-label="Close">
        <CloseIcon />
      </button>
      <div className="pm-scroll">
        <img className="pm-img" src={product.image || store.productPlaceholder} alt={product.name} />
        <div className="pm-body">
          <h2 className="pm-name">{product.name}</h2>
          {product.description && <p className="pm-desc">{product.description}</p>}
          {product.tags.length > 0 && (
            <div className="pm-tags">
              {product.tags.map((tag) => (
                <span key={tag} className="tag-mini">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="pm-foot">
        <span className="pm-price">{formatPrice(product.price)}</span>
        <CartControl product={product} qty={qty} />
      </div>
    </Modal>
  );
}
