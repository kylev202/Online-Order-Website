import { useState, type FormEvent } from 'react';
import { ArrowLeftIcon, CloseIcon } from '../components/icons';
import { Dialog, Modal, PageShell } from '../components/overlays';
import { store } from '../config/store';
import { formatPrice } from '../lib/format';
import { deleteCategory, deleteProduct, newId, resetMenu, saveCategory, saveProduct, useMenu } from '../lib/menuStore';
import { isDelivered, useOrders } from '../lib/orders';
import { navigate, useRoute } from '../lib/router';
import type { Category, Product } from '../lib/types';
import { OrdersManager } from './OrdersManager';
import { ProductForm } from './ProductForm';

const UNLOCK_KEY = 'ordering-demo.admin-unlocked';

export function AdminPage() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(UNLOCK_KEY) === '1');

  if (!unlocked) {
    return (
      <AdminGate
        onUnlock={() => {
          sessionStorage.setItem(UNLOCK_KEY, '1');
          setUnlocked(true);
        }}
      />
    );
  }
  return (
    <AdminShell
      onLock={() => {
        sessionStorage.removeItem(UNLOCK_KEY);
        setUnlocked(false);
      }}
    />
  );
}

// #/admin shows Orders (the owner's day-to-day page); #/admin/menu shows the menu editor.
function AdminShell({ onLock }: { onLock: () => void }) {
  const onMenu = useRoute() === '/admin/menu';
  const activeOrders = useOrders().filter((o) => !isDelivered(o)).length;

  return (
    <div className="admin">
      <header className="admin-header">
        <button className="admin-header-btn" onClick={() => navigate('/')}>
          <ArrowLeftIcon size={20} />
          View Store
        </button>
        <h1>Shop Admin</h1>
        <button className="admin-header-btn" onClick={onLock}>
          Lock
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

// DEMO ONLY: a passcode checked in the browser is not real security.
function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (code === store.adminPasscode) onUnlock();
    else setError('Wrong passcode, please try again.');
  };

  return (
    <PageShell
      title="Owner Login"
      onClose={() => navigate('/')}
      footer={
        <button className="btn-block btn-black btn-bold" type="submit" form="owner-login">
          Unlock
        </button>
      }
    >
      <form id="owner-login" className="auth" onSubmit={submit}>
        <h2 className="auth-title">Manage your shop</h2>
        <p className="auth-required">Enter the owner passcode to manage orders and products.</p>
        <input
          className={`text-field auth-password${error ? ' text-field--error' : ''}`}
          type="password"
          placeholder="* Passcode"
          aria-label="Passcode"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
        />
        {error && <span className="field-error">{error}</span>}
        <p className="co-demo">Demo passcode: {store.adminPasscode}</p>
      </form>
    </PageShell>
  );
}

const STORAGE_FULL =
  'Could not save: this browser’s storage is full. Use smaller images or remove some products. (The real site will store the menu on a server.)';

type Confirm = { title: string; message: string; okText: string; onOk: () => void };

function MenuManager() {
  const menu = useMenu();
  const [editing, setEditing] = useState<{ product: Product; isNew: boolean } | null>(null);
  const [category, setCategory] = useState<{ category: Category; isNew: boolean } | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [error, setError] = useState('');

  // Runs a save; shows a message instead of crashing when storage is full.
  const attempt = (save: () => void) => {
    try {
      save();
      setError('');
      return true;
    } catch {
      setError(STORAGE_FULL);
      return false;
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

  const askReset = () =>
    setConfirm({
      title: 'Reset menu',
      message: 'Replace the whole menu with the sample placeholder menu? All your changes will be lost.',
      okText: 'Reset',
      onOk: () => attempt(resetMenu),
    });

  return (
    <>
      <main className="admin-main">
        <div className="admin-toolbar">
          <div>
            <h2 className="admin-title">Products</h2>
            <p className="admin-sub">
              {menu.products.length} products in {menu.categories.length} categories · Demo: changes are saved in this browser only.
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

        {menu.categories.length === 0 && <div className="admin-cat admin-empty">No categories yet. Add a category first, then add products to it.</div>}

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
                    <img className="admin-thumb" src={p.image || store.productPlaceholder} alt="" />
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

        <div className="admin-foot">
          <button className="link-btn" onClick={askReset}>
            Reset to sample menu
          </button>
        </div>
      </main>

      {editing && (
        <ProductForm
          product={editing.product}
          isNew={editing.isNew}
          categories={menu.categories}
          onSave={(p) => attempt(() => saveProduct(p))}
          onClose={() => setEditing(null)}
        />
      )}
      {category && (
        <CategoryForm
          category={category.category}
          isNew={category.isNew}
          onSave={(c) => attempt(() => saveCategory(c))}
          onClose={() => setCategory(null)}
        />
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
  onSave: (category: Category) => boolean;
  onClose: () => void;
}

function CategoryForm({ category, isNew, onSave, onClose }: CategoryFormProps) {
  const [name, setName] = useState(category.name);
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter a category name.');
    if (onSave({ ...category, name: name.trim() })) onClose();
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
            <input className={`input${error ? ' input--error' : ''}`} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. DRINKS" autoFocus />
            {error && <span className="field-error">{error}</span>}
          </label>
        </div>
        <div className="form-foot">
          <button type="button" className="btn-md" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-md btn-md--black">
            {isNew ? 'Add Category' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
