import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { TagGroups } from '../components/controls';
import { CloseIcon } from '../components/icons';
import { Modal } from '../components/overlays';
import { store } from '../config/store';
import { errorMessage } from '../lib/api';
import { parsePrice } from '../lib/format';
import { resizeImage } from '../lib/image';
import type { Category, Product } from '../lib/types';

interface Props {
  product: Product;
  isNew: boolean;
  categories: Category[];
  /** Rejects with a message to show if saving failed (the form then stays open). */
  onSave: (product: Product) => Promise<void>;
  onClose: () => void;
}

type Errors = Partial<Record<'name' | 'price' | 'category' | 'image', string>>;

export function ProductForm({ product, isNew, categories, onSave, onClose }: Props) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(isNew ? '' : (product.price / 100).toFixed(2));
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [tags, setTags] = useState(product.tags);
  const [image, setImage] = useState(product.image);
  const [errors, setErrors] = useState<Errors>({});
  const [loadingImage, setLoadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const toggleTag = (tag: string) => setTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]));
  const clearError = (field: keyof Errors) => setErrors((x) => ({ ...x, [field]: undefined }));

  const pickImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow choosing the same file again
    if (!file) return;
    setLoadingImage(true);
    try {
      setImage(await resizeImage(file));
      setErrors((x) => ({ ...x, image: undefined }));
    } catch {
      setErrors((x) => ({ ...x, image: 'That file could not be read as an image.' }));
    } finally {
      setLoadingImage(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const cents = parsePrice(price);
    const next: Errors = {
      name: name.trim() ? undefined : 'Please enter a product name.',
      price: cents === null ? 'Please enter a price, e.g. 12.50' : undefined,
      category: categoryId ? undefined : 'Please choose a category.',
    };
    setErrors(next);
    if (next.name || next.price || next.category || cents === null) return;
    setSaving(true);
    setSaveError('');
    try {
      await onSave({ ...product, name: name.trim(), description: description.trim(), price: cents, categoryId, tags, image });
      onClose();
    } catch (err) {
      setSaveError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} className="form-modal">
      <form onSubmit={submit} noValidate>
        <div className="form-head">
          <h2>{isNew ? 'Add Product' : 'Edit Product'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="form-body">
          <div className="field">
            <span className="field-label">Image</span>
            <div className="img-field">
              <img className="img-preview" src={image || store.productPlaceholder} alt="" />
              <div className="img-actions">
                <label className="btn-sm">
                  {loadingImage ? 'Processing…' : image ? 'Change image' : 'Upload image'}
                  <input type="file" accept="image/*" hidden onChange={pickImage} />
                </label>
                {image && (
                  <button type="button" className="link-btn link-btn--danger" onClick={() => setImage('')}>
                    Remove image
                  </button>
                )}
                <span className="field-hint">JPG or PNG. Square photos look best.</span>
                {errors.image && <span className="field-error">{errors.image}</span>}
              </div>
            </div>
          </div>

          <Field label="Name *" error={errors.name}>
            <input
              className={`input${errors.name ? ' input--error' : ''}`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearError('name');
              }}
              maxLength={80}
              autoFocus={isNew}
            />
          </Field>

          <Field label="Description" hint="Shown under the name, e.g. a short description or the dish name in another language.">
            <textarea className="input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} />
          </Field>

          <div className="field-row">
            <Field label="Price *" error={errors.price}>
              <div className={`input input-prefix${errors.price ? ' input--error' : ''}`}>
                <span>{store.currency}</span>
                <input
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    clearError('price');
                  }}
                  inputMode="decimal"
                  placeholder="0.00"
                  aria-label="Price"
                />
              </div>
            </Field>
            <Field label="Category *" error={errors.category}>
              <select
                className={`input${errors.category ? ' input--error' : ''}`}
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  clearError('category');
                }}
              >
                <option value="">Choose…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="field">
            <span className="field-label">Tags</span>
            <span className="field-hint">Customers can filter the menu by these.</span>
            <TagGroups selected={tags} onToggle={toggleTag} small />
          </div>
        </div>

        {saveError && (
          <p className="form-error" role="alert">
            {saveError}
          </p>
        )}
        <div className="form-foot">
          <button type="button" className="btn-md" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-md btn-md--black" disabled={loadingImage || saving}>
            {saving ? 'Saving…' : isNew ? 'Add Product' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
