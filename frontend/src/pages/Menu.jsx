import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Leaf, PackageSearch, SlidersHorizontal } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import MenuCard from '../components/MenuCard';
import WelcomeModal from '../components/WelcomeModal';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { SkeletonGrid } from '../components/Loading';
import { fetchCategories, fetchMenu } from '../services/menuService';
import { getErrorMessage } from '../services/api';
import { useSession } from '../context/SessionContext';
import useDebounce from '../utils/useDebounce';
import { toast } from 'react-toastify';

const WELCOME_DISMISSED = 'bb_welcome_dismissed';

export default function Menu() {
  const [searchParams] = useSearchParams();
  const { isQr, table, phone, setPhone } = useSession();

  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [welcomeDismissed, setWelcomeDismissed] = useState(!!sessionStorage.getItem(WELCOME_DISMISSED));

  const debouncedSearch = useDebounce(search);

  // categories: once
  useEffect(() => { fetchCategories().then(setCategories).catch(() => {}); }, []);

  // menu: re-fetched from the backend whenever a filter changes
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true); setError('');
    fetchMenu({ search: debouncedSearch.trim(), category, sort, foodType: vegOnly ? 'Veg' : '' }, ctrl.signal)
      .then(setItems)
      .catch((e) => { const msg = getErrorMessage(e); if (msg) setError(msg); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, [debouncedSearch, category, sort, vegOnly, reloadKey]);

  const showWelcome = isQr && !phone && !welcomeDismissed;
  const closeWelcome = () => { sessionStorage.setItem(WELCOME_DISMISSED, '1'); setWelcomeDismissed(true); };
  const resetFilters = () => { setSearch(''); setCategory('All'); setSort(''); setVegOnly(false); };
  const filtersActive = search || category !== 'All' || sort || vegOnly;

  return (
    <div className="page container">
      <div className="page__head">
        <span className="eyebrow">{table ? `Ordering for Table ${table}` : 'Our menu'}</span>
        <h1>What are you craving?</h1>
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} />
        <div className="toolbar__row">
          <label className="select"><SlidersHorizontal size={16} />
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by price">
              <option value="">Sort: Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </label>
          <button className={`chip chip--toggle ${vegOnly ? 'chip--active' : ''}`} onClick={() => setVegOnly((v) => !v)} aria-pressed={vegOnly}><Leaf size={15} /> Veg only</button>
        </div>
      </div>

      <CategoryFilter categories={categories} active={category} onChange={setCategory} />

      <div className="menu-results" aria-live="polite">
        {loading ? <SkeletonGrid count={8} />
          : error ? <ErrorMessage message={error} onRetry={() => setReloadKey((k) => k + 1)} />
          : items.length === 0 ? (
            <EmptyState icon={PackageSearch} title="No items found" text="Try a different search or category."
              action={filtersActive && <button className="btn btn--outline" onClick={resetFilters}>Clear filters</button>} />
          ) : (
            <>
              <p className="muted results-count">{items.length} item{items.length !== 1 && 's'}</p>
              <div className="menu-grid">{items.map((i) => <MenuCard key={i._id} item={i} />)}</div>
            </>
          )}
      </div>

      {showWelcome && (
        <WelcomeModal table={table}
          onSubmit={(p) => { setPhone(p); toast.success('Welcome! Happy ordering ☕'); }}
          onSkip={closeWelcome} />
      )}
    </div>
  );
}
