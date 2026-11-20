import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, IndianRupee, ListOrdered, RefreshCw, ShoppingBag, TrendingUp, UtensilsCrossed } from 'lucide-react';
import { Spinner } from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import { fetchStats } from '../services/adminService';
import { getErrorMessage } from '../services/api';
import { formatDateTime, formatPrice } from '../utils/helpers';

const dayLabel = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short' });

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true); setError('');
    fetchStats()
      .then(setStats)
      .catch((e) => { const m = getErrorMessage(e); if (m) setError(m); })
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  if (loading && !stats) return <Spinner label="Loading dashboard..." />;
  if (error && !stats) return <ErrorMessage message={error} onRetry={load} />;
  if (!stats) return null;

  const cards = [
    { label: 'Total orders', value: stats.totalOrders, icon: ListOrdered, tone: 'brown' },
    { label: "Today's orders", value: stats.todayOrders, icon: ShoppingBag, tone: 'orange' },
    { label: 'Pending orders', value: stats.pendingOrders, icon: Clock, tone: 'amber' },
    { label: 'Completed orders', value: stats.completedOrders, icon: CheckCircle2, tone: 'green' },
    { label: "Today's revenue", value: formatPrice(stats.todayRevenue), icon: IndianRupee, tone: 'orange' },
    { label: 'Total sales', value: formatPrice(stats.totalSales), icon: TrendingUp, tone: 'green' },
    { label: 'Menu items', value: stats.totalMenuItems, icon: UtensilsCrossed, tone: 'brown' },
  ];
  const maxRevenue = Math.max(...stats.last7Days.map((d) => d.revenue), 1);
  const totalStatus = Math.max(Object.values(stats.statusBreakdown).reduce((a, b) => a + b, 0), 1);

  return (
    <>
      <div className="admin-head">
        <div><h1>Dashboard</h1><p className="muted">Revenue counts completed orders only.</p></div>
        <button className="btn btn--outline btn--sm" onClick={load} disabled={loading}><RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh</button>
      </div>

      <div className="stat-grid">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="stat">
            <span className={`stat__icon stat__icon--${tone}`}><Icon size={22} /></span>
            <div><strong>{value}</strong><span>{label}</span></div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <section className="card">
          <h3>Last 7 days · revenue</h3>
          <div className="bars" role="img" aria-label="Revenue for the last 7 days">
            {stats.last7Days.map((d) => (
              <div key={d.date} className="bars__col" title={`${d.date}: ${formatPrice(d.revenue)} · ${d.orders} orders`}>
                <span className="bars__val">{d.revenue ? formatPrice(d.revenue) : ''}</span>
                <div className="bars__bar" style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, d.revenue ? 4 : 1)}%` }} />
                <span className="bars__label">{dayLabel(d.date)}</span>
                <span className="bars__sub">{d.orders} ord</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h3>Order status overview</h3>
          <ul className="status-list">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => (
              <li key={status}>
                <div className="status-list__row"><StatusBadge status={status} /><strong>{count}</strong></div>
                <div className="progress"><div className={`progress__bar progress__bar--${status.toLowerCase()}`} style={{ width: `${(count / totalStatus) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card">
        <div className="card__head"><h3>Recent orders</h3><Link to="/admin/orders" className="link-arrow">View all →</Link></div>
        {stats.recentOrders.length === 0 ? <p className="muted">No orders yet.</p> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Order</th><th>Customer</th><th>Table</th><th>Total</th><th>Status</th><th>Placed</th></tr></thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td data-label="Order"><strong>{o.orderId}</strong></td>
                    <td data-label="Customer">{o.customerName}</td>
                    <td data-label="Table">{o.tableNumber}</td>
                    <td data-label="Total">{formatPrice(o.totalAmount)}</td>
                    <td data-label="Status"><StatusBadge status={o.orderStatus} /></td>
                    <td data-label="Placed">{formatDateTime(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
