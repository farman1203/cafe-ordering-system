// Spinner + skeleton grid used while data is loading
export function Spinner({ label = 'Loading...' }) {
  return (
    <div className="center-box" role="status" aria-live="polite">
      <div className="spinner" />
      <p className="muted">{label}</p>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="menu-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="menu-card skeleton-card" key={i}>
          <div className="skeleton skeleton-img" />
          <div className="menu-card__body">
            <div className="skeleton skeleton-line w60" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line w40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Spinner;
