import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PoweredBy } from '../components/controls';
import { TAG_GROUPS } from '../data/tags';
import { loadMenu, useMenu, useMenuStatus } from '../lib/menuStore';
import { cartItems, useOrder } from '../lib/orderStore';
import { navigate } from '../lib/router';
import type { Product } from '../lib/types';
import { CartBar } from './CartBar';
import { CategoryBar } from './CategoryBar';
import { CheckoutSheet } from './CheckoutSheet';
import { FilterDrawer } from './FilterDrawer';
import { FulfillmentModal } from './FulfillmentModal';
import { ActiveOrderPill } from './OrderPages';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';
import { SideMenu } from './SideMenu';
import { StoreHeader } from './StoreHeader';
import { TopNav } from './TopNav';

const BAR_HEIGHT = 64;
const navHeight = () => (window.matchMedia('(max-width: 600px)').matches ? 56 : 72);

// Within a tag group any picked tag may match; every group with a pick must match.
function matchesTags(product: Product, picked: string[]) {
  return TAG_GROUPS.every((group) => {
    const wanted = group.tags.filter((t) => picked.includes(t));
    return wanted.length === 0 || wanted.some((t) => product.tags.includes(t));
  });
}

type Overlay = 'menu' | 'filters' | 'fulfillment' | 'checkout' | null;

export function StorePage() {
  const menu = useMenu();
  const menuStatus = useMenuStatus();
  const order = useOrder();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [stuck, setStuck] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [active, setActive] = useState('');
  const barAnchorRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const spyPausedUntil = useRef(0);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const visible = (p: Product) =>
      (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) && matchesTags(p, filters);
    return menu.categories
      .map((category) => ({ category, products: menu.products.filter((p) => p.categoryId === category.id && visible(p)) }))
      .filter((section) => section.products.length > 0);
  }, [menu, query, filters]);

  const items = useMemo(() => cartItems(menu, order.lines), [menu, order.lines]);
  const count = items.reduce((n, item) => n + item.qty, 0);
  const total = items.reduce((sum, item) => sum + item.qty * item.product.price, 0);
  const qtyByProduct = useMemo(() => new Map(items.map(({ product, qty }) => [product.id, qty])), [items]);
  const qtyByCategory = useMemo(() => {
    const totals = new Map<string, number>();
    for (const { product, qty } of items) totals.set(product.categoryId, (totals.get(product.categoryId) ?? 0) + qty);
    return totals;
  }, [items]);

  // On scroll: switch the top bar to solid once the category bar sticks, and highlight
  // the category whose section is at the top of the screen.
  const sectionIds = sections.map((s) => s.category.id).join('|');
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const anchor = barAnchorRef.current;
      if (!anchor) return;
      const navH = navHeight();
      setStuck(anchor.getBoundingClientRect().top <= navH);
      if (Date.now() < spyPausedUntil.current) return;
      const ids = sectionIds ? sectionIds.split('|') : [];
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current = ids[0] ?? '';
      for (const id of ids) {
        const el = sectionRefs.current.get(id);
        if (el && el.getBoundingClientRect().top <= navH + BAR_HEIGHT + 1) current = id;
      }
      setActive(atBottom && ids.length ? ids[ids.length - 1] : current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sectionIds]);

  // After the results change, bring the top of the product list into view.
  const scrollToMenuTop = useCallback(() => {
    requestAnimationFrame(() => {
      const anchor = barAnchorRef.current;
      if (anchor) window.scrollTo({ top: anchor.getBoundingClientRect().top + window.scrollY - navHeight() });
    });
  }, []);

  const changeQuery = (q: string) => {
    setQuery(q);
    scrollToMenuTop();
  };

  const applyFilters = (tags: string[]) => {
    setFilters(tags);
    setOverlay(null);
    scrollToMenuTop();
  };

  const selectCategory = (id: string) => {
    const el = sectionRefs.current.get(id);
    if (!el) return;
    setActive(id);
    spyPausedUntil.current = Date.now() + 1000;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - navHeight() - BAR_HEIGHT, behavior: 'smooth' });
  };

  const closeOverlay = () => setOverlay(null);
  const product = productId ? menu.products.find((p) => p.id === productId) : undefined;

  return (
    <div className="store">
      <TopNav
        solid={stuck || searchFocused || query !== ''}
        query={query}
        onQuery={changeQuery}
        onSearchFocus={setSearchFocused}
        deliveryLabel={order.deliveryTime || 'Time'}
        onOpenMenu={() => setOverlay('menu')}
        onOpenFilters={() => setOverlay('filters')}
        onOpenFulfillment={() => setOverlay('fulfillment')}
      />
      <StoreHeader onOpenFulfillment={() => setOverlay('fulfillment')} />

      <div ref={barAnchorRef} />
      <CategoryBar categories={sections.map((s) => s.category)} active={active} badges={qtyByCategory} onSelect={selectCategory} />

      <main className={`menu-list${count > 0 ? ' menu-list--cart' : ''}`}>
        {sections.map(({ category, products }) => (
          <section
            key={category.id}
            aria-label={category.name}
            ref={(el) => {
              if (el) sectionRefs.current.set(category.id, el);
              else sectionRefs.current.delete(category.id);
            }}
          >
            <h2 className="menu-cat-title">{category.name}</h2>
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} qty={qtyByProduct.get(p.id) ?? 0} onOpen={() => setProductId(p.id)} />
              ))}
            </div>
          </section>
        ))}
        {menuStatus === 'loading' && (
          <p className="menu-empty" role="status">
            Loading products…
          </p>
        )}
        {menuStatus === 'error' && (
          <div className="menu-empty" role="alert">
            <p>We can’t load the products right now.</p>
            <button className="top-btn menu-retry" onClick={() => loadMenu()}>
              Try Again
            </button>
          </div>
        )}
        {menuStatus === 'ready' && sections.length === 0 && <p className="menu-empty">No products found.</p>}
        <PoweredBy className="powered" />
      </main>

      <ActiveOrderPill raised={count > 0} />
      <CartBar count={count} total={total} onOpen={() => setOverlay('checkout')} />

      {overlay === 'menu' && <SideMenu onClose={closeOverlay} />}
      {overlay === 'filters' && <FilterDrawer applied={filters} onApply={applyFilters} onClose={closeOverlay} />}
      {overlay === 'fulfillment' && <FulfillmentModal onClose={closeOverlay} />}
      {overlay === 'checkout' && (
        <CheckoutSheet
          onClose={closeOverlay}
          onPaid={(orderId) => {
            closeOverlay();
            navigate(`/order/${orderId}`);
          }}
        />
      )}
      {product && <ProductModal product={product} qty={qtyByProduct.get(product.id) ?? 0} onClose={() => setProductId(null)} />}
    </div>
  );
}
