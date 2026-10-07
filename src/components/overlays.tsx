import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeftIcon, ChevronLeftIcon, CloseIcon } from './icons';

// Open overlays, newest last: Escape closes only the top one,
// and page scrolling stays locked while any overlay is open.
const openOverlays: Array<() => void> = [];

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') openOverlays[openOverlays.length - 1]?.();
}

function useOverlay(onClose: () => void) {
  const closeRef = useRef(onClose);
  useLayoutEffect(() => {
    closeRef.current = onClose;
  });
  useEffect(() => {
    const close = () => closeRef.current();
    openOverlays.push(close);
    if (openOverlays.length === 1) {
      document.addEventListener('keydown', onKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      openOverlays.splice(openOverlays.indexOf(close), 1);
      if (openOverlays.length === 0) {
        document.removeEventListener('keydown', onKeyDown);
        document.body.style.overflow = '';
      }
    };
  }, []);
}

interface ModalProps {
  onClose: () => void;
  className: string;
  /** 'top' sits 100px from the top (info popups); 'center' centres vertically. */
  align?: 'top' | 'center';
  children: ReactNode;
}

export function Modal({ onClose, className, align = 'top', children }: ModalProps) {
  useOverlay(onClose);
  return createPortal(
    <div
      className={`mask mask--${align}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`modal ${className}`} role="dialog" aria-modal="true">
        {children}
      </div>
    </div>,
    document.body,
  );
}

interface DrawerProps {
  onClose: () => void;
  side: 'left' | 'right';
  className: string;
  label: string;
  children: ReactNode;
}

export function Drawer({ onClose, side, className, label, children }: DrawerProps) {
  useOverlay(onClose);
  return createPortal(
    <div
      className="mask"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside className={`drawer drawer--${side} ${className}`} role="dialog" aria-modal="true" aria-label={label}>
        {children}
      </aside>
    </div>,
    document.body,
  );
}

interface BottomSheetProps {
  title: string;
  onClose: () => void;
  /** Shows a back arrow before the title. */
  onBack?: () => void;
  /** Full-width black bar at the bottom (e.g. "Continue"). */
  action: ReactNode;
  children: ReactNode;
}

/** Checkout panel that slides up from the bottom and covers most of the screen. */
export function BottomSheet({ title, onClose, onBack, action, children }: BottomSheetProps) {
  useOverlay(onClose);
  return createPortal(
    <div
      className="mask"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <header className="sheet-head">
          {onBack && (
            <button className="sheet-back" onClick={onBack} aria-label="Back">
              <ChevronLeftIcon />
            </button>
          )}
          <h2 className="sheet-title">{title}</h2>
          <button className="sheet-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </header>
        <div className="sheet-body">{children}</div>
        {action}
      </section>
    </div>,
    document.body,
  );
}

interface PageShellProps {
  title: string;
  onClose: () => void;
  showBack?: boolean;
  footer?: ReactNode;
  columnClassName?: string;
  children: ReactNode;
}

/** Full-screen page: black title bar and a centred 600px column (notice, login, checkout...). */
export function PageShell({ title, onClose, showBack = true, footer, columnClassName = '', children }: PageShellProps) {
  useOverlay(onClose);
  return (
    <div className="page">
      <header className="page-header">
        {showBack && (
          <button className="page-back" onClick={onClose} aria-label="Back">
            <ArrowLeftIcon />
          </button>
        )}
        <h1 className="page-title">{title}</h1>
      </header>
      <div className={`page-column ${columnClassName}`}>
        <div className="page-body">{children}</div>
        {footer && <div className="page-footer">{footer}</div>}
      </div>
    </div>
  );
}

interface DialogProps {
  title: string;
  children: ReactNode;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
  onOk: () => void;
  onCancel?: () => void;
}

/** Small message / confirm box with a title bar and OK button. */
export function Dialog({ title, children, okText = 'OK', cancelText, danger, onOk, onCancel }: DialogProps) {
  return (
    <Modal onClose={onCancel ?? onOk} className="dialog">
      <div className="dialog-head">{title}</div>
      <div className="dialog-body">{children}</div>
      <div className="dialog-foot">
        {cancelText && (
          <button className="btn-sm" onClick={onCancel}>
            {cancelText}
          </button>
        )}
        <button className={`btn-sm ${danger ? 'btn-sm--danger' : 'btn-sm--black'}`} onClick={onOk} autoFocus>
          {okText}
        </button>
      </div>
    </Modal>
  );
}
