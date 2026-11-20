import { useState } from 'react';
import Modal from './Modal';
import { CATEGORIES } from '../utils/constants';

const EMPTY = { name: '', description: '', price: '', category: 'Coffee', image: '', foodType: 'Veg', isAvailable: true, isBestseller: false };

// Add / edit form for the admin. `item` = existing item when editing.
export default function MenuFormModal({ item, onSave, onClose, saving }) {
  const [form, setForm] = useState(item ? { ...EMPTY, ...item, price: String(item.price) } : EMPTY);
  const [errors, setErrors] = useState({});
  const set = (key, value) => { setForm((f) => ({ ...f, [key]: value })); setErrors((e) => ({ ...e, [key]: '' })); };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!(Number(form.price) >= 1)) e.price = 'Enter a price of at least 1';
    if (form.description.length > 300) e.description = 'Max 300 characters';
    if (form.image && !/^https?:\/\/\S+$/i.test(form.image.trim())) e.image = 'Image must be a valid http(s) link';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave({
      name: form.name.trim(), description: form.description.trim(), price: Number(form.price), category: form.category,
      image: form.image.trim(), foodType: form.foodType, isAvailable: form.isAvailable, isBestseller: form.isBestseller,
    });
  };

  return (
    <Modal title={item ? 'Edit menu item' : 'Add menu item'} onClose={onClose} size="md">
      <form onSubmit={submit} className="form-grid" noValidate>
        <label className="field field--full"><span>Name *</span>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={80} />
          {errors.name && <small className="field__error">{errors.name}</small>}
        </label>
        <label className="field"><span>Price (₹) *</span>
          <input type="number" min="1" step="1" value={form.price} onChange={(e) => set('price', e.target.value)} />
          {errors.price && <small className="field__error">{errors.price}</small>}
        </label>
        <label className="field"><span>Category *</span>
          <select value={form.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="field"><span>Food type</span>
          <select value={form.foodType} onChange={(e) => set('foodType', e.target.value)}>
            <option>Veg</option><option>Non-Veg</option>
          </select>
        </label>
        <label className="field"><span>Image URL</span>
          <input value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="https://..." />
          {errors.image && <small className="field__error">{errors.image}</small>}
        </label>
        <label className="field field--full"><span>Description</span>
          <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={300} />
          {errors.description && <small className="field__error">{errors.description}</small>}
        </label>
        <label className="check"><input type="checkbox" checked={form.isAvailable} onChange={(e) => set('isAvailable', e.target.checked)} /> Available to order</label>
        <label className="check"><input type="checkbox" checked={form.isBestseller} onChange={(e) => set('isBestseller', e.target.checked)} /> Mark as bestseller</label>
        <div className="form-actions field--full">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Saving...' : item ? 'Save changes' : 'Add item'}</button>
        </div>
      </form>
    </Modal>
  );
}
