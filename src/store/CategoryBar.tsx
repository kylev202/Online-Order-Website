import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons';
import type { Category } from '../lib/types';

interface Props {
  categories: Category[];
  active: string;
  /** Items in the cart per category id. */
  badges: Map<string, number>;
  onSelect: (id: string) => void;
}

export function CategoryBar({ categories, active, badges, onSelect }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const updateEdges = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    setEdges({ left: el.scrollLeft > 1, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1 });
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener('resize', updateEdges);
    return () => window.removeEventListener('resize', updateEdges);
  }, [updateEdges, categories]);

  // Keep the active category in view inside the horizontally scrolling bar.
  useEffect(() => {
    const el = contentRef.current;
    const chip = el?.querySelector<HTMLElement>(`[data-id="${CSS.escape(active)}"]`);
    if (!el || !chip) return;
    el.scrollTo({ left: chip.offsetLeft - (el.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' });
  }, [active]);

  const scrollByPage = (direction: 1 | -1) => {
    const el = contentRef.current;
    el?.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <nav className="catbar" aria-label="Menu categories">
      {edges.left && (
        <button className="catbar-arrow pc-only" aria-label="Scroll categories left" onClick={() => scrollByPage(-1)}>
          <ChevronLeftIcon />
        </button>
      )}
      <div className="catbar-content" ref={contentRef} onScroll={updateEdges}>
        {categories.map((c) => {
          const count = badges.get(c.id) ?? 0;
          return (
            <button key={c.id} className="cat-item" data-id={c.id} onClick={() => onSelect(c.id)} aria-current={c.id === active}>
              <span className={`cat-chip${c.id === active ? ' cat-chip--active' : ''}`}>{c.name}</span>
              {count > 0 && <span className="badge cat-badge">{count}</span>}
            </button>
          );
        })}
      </div>
      {edges.right && (
        <button className="catbar-arrow pc-only" aria-label="Scroll categories right" onClick={() => scrollByPage(1)}>
          <ChevronRightIcon />
        </button>
      )}
    </nav>
  );
}
