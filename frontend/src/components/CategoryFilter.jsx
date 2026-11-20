// Row of category chips. `categories` = [{name, count}]
export default function CategoryFilter({ categories, active, onChange }) {
  return (
    <div className="chips" role="tablist" aria-label="Categories">
      {['All', ...categories.map((c) => c.name)].map((name) => (
        <button key={name} role="tab" aria-selected={active === name} className={`chip ${active === name ? 'chip--active' : ''}`} onClick={() => onChange(name)}>
          {name}
        </button>
      ))}
    </div>
  );
}
