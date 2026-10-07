import { useEffect, useRef, useState } from 'react';
import { CloseCircleIcon, GlobeIcon, MenuCircleIcon, SearchIcon, SlidersIcon, UserIcon, UserSolidIcon } from '../components/icons';
import { navigate } from '../lib/router';

interface Props {
  /** Solid black bar with search, shown once the menu is scrolled to the top. */
  solid: boolean;
  query: string;
  onQuery: (query: string) => void;
  onSearchFocus: (focused: boolean) => void;
  deliveryLabel: string;
  onOpenMenu: () => void;
  onOpenFilters: () => void;
  onOpenFulfillment: () => void;
}

export function TopNav({ solid, query, onQuery, onSearchFocus, deliveryLabel, onOpenMenu, onOpenFilters, onOpenFulfillment }: Props) {
  return (
    <header className={`nav${solid ? ' nav--solid' : ''}`}>
      <div className="nav-left">
        <button className="nav-icon" aria-label="Open menu" onClick={onOpenMenu}>
          <MenuCircleIcon size="100%" />
        </button>
      </div>

      {solid && (
        <div className="nav-center">
          <label className="search">
            <SearchIcon className="search-icon" />
            <input
              value={query}
              placeholder="Search dishes..."
              aria-label="Search dishes"
              onChange={(e) => onQuery(e.target.value)}
              onFocus={() => onSearchFocus(true)}
              onBlur={() => onSearchFocus(false)}
            />
            {query && (
              <button className="search-clear" aria-label="Clear search" onClick={() => onQuery('')}>
                <CloseCircleIcon size={12} />
              </button>
            )}
          </label>
          <button className="top-btn pc-only" onClick={onOpenFilters}>
            <SlidersIcon className="top-btn-icon" />
            <span className="ml-8">Filters</span>
          </button>
          <button className="round-icon mobile-only" aria-label="Filters" onClick={onOpenFilters}>
            <SlidersIcon size={16} />
          </button>
        </div>
      )}

      <div className="nav-right">
        <button className="top-btn pc-only mr-16" onClick={onOpenFulfillment}>
          Delivery・{deliveryLabel}
        </button>
        <button className="top-btn pc-only" onClick={() => navigate('/login')}>
          <UserSolidIcon className="top-btn-icon" />
          <span className="ml-8">Login</span>
        </button>
        <button className="top-btn pc-only mx-16" onClick={() => navigate('/signup')}>
          Sign Up
        </button>
        <button className="round-icon mobile-only" aria-label="Account" onClick={() => navigate('/login')}>
          <UserIcon size={18} />
        </button>
        {/* The language button sits in the black bar on desktop, and on the cover on mobile. */}
        {solid ? <LanguageMenu className="pc-only" light /> : <LanguageMenu className="mobile-only ml-16" />}
      </div>
    </header>
  );
}

const LANGUAGES = ['English', '简体中文'];

function LanguageMenu({ className, light }: { className: string; light?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [open]);

  return (
    <div className={`lang ${className}`} ref={ref}>
      <button
        className={light ? 'nav-icon' : 'round-icon'}
        aria-label="Language"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <GlobeIcon size={light ? '100%' : 19} />
      </button>
      {open && (
        <ul className="dropdown" role="menu">
          {LANGUAGES.map((language) => (
            <li key={language}>
              <button role="menuitem" onClick={() => setOpen(false)}>
                {language}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
