import { useCallback, useEffect, useMemo, useState } from 'react';
import { Flame, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import FoodImage from '../components/FoodImage';
import SearchBar from '../components/SearchBar';
import MenuFormModal from '../components/MenuFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { Spinner } from '../components/Loading';
import { createMenuItem, deleteMenuItem, fetchMenu, updateMenuItem } from '../services/menuService';
import { getErrorMessage } from '../services/api';
import { CATEGORIES } from '../utils/constants';
import { formatPrice } from '../utils/helpers';

export default function ManageMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [availability, setAvailability] = useState('All');
  const [editing, setEditing] = useState(null);      // null | 'new' | item
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true); setError('');
    fetchMenu({ sort: 'name' })
      .then(setItems)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const filtered = useMemo(() => items.filter((i) =>
    (category === 'All' || i.category === category) &&
    (availability === 'All' || (availability === 'Available') === i.isAvailable) &&
    i.name.toLowerCase().includes(search.trim().toLowerCase())
  ), [items, search, category, availability]);

  const replaceItem = (updated) => setItems((list) => list.map((i) => (i._id === updated._id ? updated : i)));

  const save = async (payload) => {
    setSaving(true);
    try {
      if (editing === 'new') {
        const created = await createMenuItem(payload);
        setItems((list) => [created, ...list]);
        toast.success('Menu item added');
      } else {
        replaceItem(await updateMenuItem(editing._id, payload));
        toast.success('Menu item updated');
      }
      setEditing(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // quick toggles (availability / bestseller) straight from the table
  const toggle = async (item, field) => {
    try {
      replaceItem(await updateMenuItem(item._id, { [field]: !item[field] }));
      toast.success(`${item.name} updated`, { autoClose: 1200 });
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteMenuItem(toDelete._id);
      setItems((list) => list.filter((i) => i._id !== toDelete._id));
      toast.success(`"${toDelete.name}" deleted`);
      setToDelete(null);
    } catch (err) { toast.error(getErrorMessage(err)); } finally { setDeleting(false); }
  };

  return (
    <>
      <div className="admin-head">
        <div><h1>Menu management</h1><p className="muted">{items.length} items in total</p></div>
        <button className="btn btn--primary" onClick={() => setEditing('new')}><Plus size={17} /> Add item</button>
      </div>

      <div className="filters">
        <SearchBar value={search} onChange={setSearch} placeholder="Search menu items..." />
        <select className="input-select" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
          <option value="All">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="input-select" value={availability} onChange={(e) => setAvailability(e.target.value)} aria-label="Filter by availability">
          <option>All</option><option>Available</option><option>Unavailable</option>
        </select>
      </div>

      {loading ? <Spinner /> : error ? <ErrorMessage message={error} onRetry={load} /> : filtered.length === 0 ? (
        <EmptyState title="No menu items match" text="Try changing the filters or add a new item." />
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Available</th><th>Bestseller</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item._id}>
                  <td data-label="Item">
                    <div className="item-cell">
                      <FoodImage src={item.image} alt={item.name} className="item-cell__img" />
                      <div><strong>{item.name}</strong><small className="muted">{item.foodType}</small></div>
                    </div>
                  </td>
                  <td data-label="Category">{item.category}</td>
                  <td data-label="Price">{formatPrice(item.price)}</td>
                  <td data-label="Available">
                    <button className={`switch ${item.isAvailable ? 'is-on' : ''}`} role="switch" aria-checked={item.isAvailable} aria-label={`Toggle availability of ${item.name}`} onClick={() => toggle(item, 'isAvailable')}><i /></button>
                  </td>
                  <td data-label="Bestseller">
                    <button className={`icon-btn ${item.isBestseller ? 'icon-btn--hot' : ''}`} aria-pressed={item.isBestseller} aria-label={`Toggle bestseller for ${item.name}`} onClick={() => toggle(item, 'isBestseller')}><Flame size={18} /></button>
                  </td>
                  <td data-label="Actions">
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => setEditing(item)} aria-label={`Edit ${item.name}`}><Pencil size={17} /></button>
                      <button className="icon-btn icon-btn--danger" onClick={() => setToDelete(item)} aria-label={`Delete ${item.name}`}><Trash2 size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <MenuFormModal item={editing === 'new' ? null : editing} saving={saving} onSave={save} onClose={() => !saving && setEditing(null)} />}
      {toDelete && (
        <ConfirmDialog title="Delete this item?" message={`"${toDelete.name}" will be removed from the menu permanently. Past orders keep their saved details.`}
          confirmText="Yes, delete" loading={deleting} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
      )}
    </>
  );
}
