import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeftIcon, CloseIcon } from '../components/icons';
import { Dialog, Modal, PageShell } from '../components/overlays';
import { store } from '../config/store';
import { errorMessage } from '../lib/api';
import { formatPrice } from '../lib/format';
import { deleteCategory, deleteProduct, loadMenu, newId, saveCategory, saveProduct, useMenu, useMenuStatus } from '../lib/menuStore';
import { isActive, useOwnerOrders } from '../lib/orders';
import { checkOwnerSession, signIn, signOut, useOwnerSession } from '../lib/ownerSession';
import { navigate, useRoute } from '../lib/router';
import type { Category, Product } from '../lib/types';
import { OrdersManager } from './OrdersManager';
import { ProductForm } from './ProductForm';

export function AdminPage() {
  const session = useOwnerSession();

  useEffect(() => {
    if (session === 'checking') checkOwnerSession();
  }, [session]);

  if (session === 'checking') {
    return (
      <div className="admin-loading" role="status" aria-label="Loading">
        <span className="spinner" />
      </div>
    );
  }
  return session === 'signed-in' ? <AdminShell /> : <AdminGate />;
}

// #/admin shows Orders (the owner's day-to-day page); #/admin/menu shows the menu editor.
function AdminShell() {
  const onMenu = useRoute() === '/admin/menu';
  const activeOrders = useOwnerOrders().orders.filter(isActive).length;

  return (
    <div className="admin">
      <header className="admin-header">
        <button className="admin-header-btn" onClick={() => navigate('/')}>
          <ArrowLeftIcon size={20} />
          View Store
        </button>
        <h1>Shop Admin</h1>
        <button className="admin-header-btn" onClick={() => signOut()}>
          Log Out
        </button>
      </header>
      <nav className="admin-tabs" aria-label="Admin sections">
        <button className="admin-tab" aria-current={!onMenu} onClick={() => navigate('/admin')}>
          Orders
          {activeOrders > 0 && <span className="badge">{activeOrders}</span>}
        </button>
        <button className="admin-tab" aria-current={onMenu} onClick={() => navigate('/admin/menu')}>
          Menu
        </button>
      </nav>
      {onMenu ? <MenuManager /> : <OrdersManager />}
    </div>
  );
}

/** Owner login. The password is checked by the server, which then keeps the owner signed in on this device. */
function AdminGate() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) return setError('Please enter the owner password.');
    setBusy(true);
    try {
      await signIn(password);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <PageShell
      title="Owner Login"
      onClose={() => navigate('/')}
      footer={
        <button className="btn-block btn-black btn-bold" type="submit" form="owner-login" disabled={busy}>
          {busy ? 'Logging in…' : 'Log In'}
        </button>
      }
    >
      <form id="owner-login" className="auth" onSubmit={submit}>
        <h2 className="auth-title">Manage your shop</h2>
        <p className="auth-required">Enter the owner password to manage orders and products.</p>
        <input
          className={`text-field auth-password${error ? ' text-field--error' : ''}`}
          type="password"
          placeholder="* Password"
          aria-label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          autoFocus
        />
        {error && <span className="field-error">{error}</span>}
      </form>
    </PageShell>
  );
}

type Confirm = { title: string; message: string; okText: string; onOk: () => void };

function MenuManager() {
  const menu = useMenu();
  const menuStatus = useMenuStatus();
  const [editing, setEditing] = useState<{ product: Product; isNew: boolean } | null>(null);
  const [category, setCategory] = useState<{ category: Category; isNew: boolean } | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [error, setError] = useState('');

  // Runs a change confirmed in a dialog; shows what went wrong if the server refuses it.
  const attempt = async (change: () => Promise<void>) => {
    try {
      await change();
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const addProduct = (categoryId = menu.categories[0]?.id ?? '') =>
    setEditing({
      isNew: true,
      product: { id: newId('p'), categoryId, name: '', description: '', price: 0, image: '', tags: [] },
    });

  const askDeleteProduct = (p: Product) =>
    setConfirm({
      title: 'Delete product',
      message: `Delete “${p.name}”? This cannot be undone.`,
      okText: 'Delete',
      onOk: () => attempt(() => deleteProduct(p.id)),
    });

  const askDeleteCategory = (c: Category, productCount: number) =>
    setConfirm({
      title: 'Delete category',
      message: productCount
        ? `Delete “${c.name}” and the ${productCount} product${productCount === 1 ? '' : 's'} in it? This cannot be undone.`
        : `Delete “${c.name}”?`,
      okText: 'Delete',
      onOk: () => attempt(() => deleteCategory(c.id)),
    });

  return (
    <>
      <main className="admin-main">
        <div className="admin-toolbar">
          <div>
            <h2 className="admin-title">Products</h2>
            <p className="admin-sub">
              {menu.products.length} products in {menu.categories.length} categories · Changes show in the shop straight away.
            </p>
          </div>
          <div className="admin-actions">
            <button className="top-btn" onClick={() => setCategory({ isNew: true, category: { id: newId('c'), name: '' } })}>
              + Add Category
            </button>
            <button className="top-btn top-btn--black" onClick={() => addProduct()} disabled={menu.categories.length === 0}>
              + Add Product
            </button>
          </div>
        </div>

        {error && (
          <div className="admin-alert" role="alert">
            <span>{error}</span>
            <button className="icon-btn" aria-label="Dismiss" onClick={() => setError('')}>
              <CloseIcon size={18} />
            </button>
          </div>
        )}

        {menuStatus === 'loading' && <div className="admin-cat admin-empty">Loading products…</div>}
        {menuStatus === 'error' && (
          <div className="admin-cat admin-empty">
            We can’t load the products right now.{' '}
            <button className="link-btn" onClick={() => loadMenu()}>
              Try again
            </button>
          </div>
        )}
        {menuStatus === 'ready' && menu.categories.length === 0 && (
          <div className="admin-cat admin-empty">No categories yet. Add a category first, then add products to it.</div>
        )}

        {menu.categories.map((c) => {
          const products = menu.products.filter((p) => p.categoryId === c.id);
          return (
            <section key={c.id} className="admin-cat">
              <div className="admin-cat-head">
                <h3>{c.name}</h3>
                <span className="admin-count">
                  {products.length} item{products.length === 1 ? '' : 's'}
                </span>
                <div className="admin-cat-actions">
                  <button className="link-btn" onClick={() => addProduct(c.id)}>
                    + Product
                  </button>
                  <button className="link-btn" onClick={() => setCategory({ isNew: false, category: c })}>
                    Rename
                  </button>
                  <button className="link-btn link-btn--danger" onClick={() => askDeleteCategory(c, products.length)}>
                    Delete
                  </button>
                </div>
              </div>
              {products.length === 0 ? (
                <div className="admin-empty">No products in this category yet. Empty categories are hidden on the store.</div>
              ) : (
                products.map((p) => (
                  <div key={p.id} className="admin-row">
                    <img className="admin-thumb" src={p.image || store.productPlaceholder} alt="" loading="lazy" />
                    <div className="admin-row-main">
                      <div className="admin-row-name">{p.name}</div>
                      {p.description && <div className="admin-row-desc">{p.description}</div>}
                      {p.tags.length > 0 && (
                        <div className="admin-row-tags">
                          {p.tags.map((t) => (
                            <span key={t} className="tag-mini">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="admin-row-price">{formatPrice(p.price)}</div>
                    <div className="admin-row-actions">
                      <button className="btn-sm" onClick={() => setEditing({ isNew: false, product: p })}>
                        Edit
                      </button>
                      <button className="btn-sm btn-sm--danger-outline" onClick={() => askDeleteProduct(p)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </section>
          );
        })}
      </main>

      {editing && (
        <ProductForm
          product={editing.product}
          isNew={editing.isNew}
          categories={menu.categories}
          onSave={saveProduct}
          onClose={() => setEditing(null)}
        />
      )}
      {category && (
        <CategoryForm category={category.category} isNew={category.isNew} onSave={saveCategory} onClose={() => setCategory(null)} />
      )}
      {confirm && (
        <Dialog
          title={confirm.title}
          okText={confirm.okText}
          cancelText="Cancel"
          danger
          onOk={() => {
            confirm.onOk();
            setConfirm(null);
          }}
          onCancel={() => setConfirm(null)}
        >
          {confirm.message}
        </Dialog>
      )}
    </>
  );
}

interface CategoryFormProps {
  category: Category;
  isNew: boolean;
  /** Rejects with a message to show if the server refuses the change. */
  onSave: (category: Category) => Promise<void>;
  onClose: () => void;
}

function CategoryForm({ category, isNew, onSave, onClose }: CategoryFormProps) {
  const [name, setName] = useState(category.name);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter a category name.');
    setSaving(true);
    try {
      await onSave({ ...category, name: name.trim() });
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} className="form-modal form-modal--sm">
      <form onSubmit={submit} noValidate>
        <div className="form-head">
          <h2>{isNew ? 'Add Category' : 'Rename Category'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="form-body">
          <label className="field">
            <span className="field-label">Category name *</span>
            <input
              className={`input${error ? ' input--error' : ''}`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g. LIGHTERS"
              maxLength={40}
              autoFocus
            />
            {error && <span className="field-error">{error}</span>}
          </label>
        </div>
        <div className="form-foot">
          <button type="button" className="btn-md" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-md btn-md--black" disabled={saving}>
            {saving ? 'Saving…' : isNew ? 'Add Category' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
