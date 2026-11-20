import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search for coffee, pizza, desserts...' }) {
  return (
    <div className="search">
      <Search size={18} />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label="Search menu" />
      {value && <button onClick={() => onChange('')} aria-label="Clear search"><X size={16} /></button>}
    </div>
  );
}
