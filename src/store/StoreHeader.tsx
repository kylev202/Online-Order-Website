import { ChevronDownIcon } from '../components/icons';
import { store } from '../config/store';

export function StoreHeader({ onOpenFulfillment }: { onOpenFulfillment: () => void }) {
  return (
    <section className="store-head">
      <div className="cover">
        <picture>
          <source srcSet={store.cover.mobile} media="(max-width: 600px)" />
          <img className="cover-img" src={store.cover.desktop} alt="" />
        </picture>
        <div className="cover-shade" />
        <div className="logo-ring">
          <img className="logo" src={store.logo} alt={`${store.name} logo`} />
        </div>
      </div>

      <div className="store-info">
        <button className="fulfil-pill mobile-only" onClick={onOpenFulfillment}>
          Delivery
          <ChevronDownIcon />
        </button>
        <h1 className="store-name">{store.name}</h1>
        {store.description ? (
          <div className="desc-card">{store.description}</div>
        ) : (
          <div className="desc-card desc-card--placeholder">
            <strong>[shop description]</strong>
            <span>A short introduction to the shop will be added here.</span>
          </div>
        )}
      </div>
    </section>
  );
}
