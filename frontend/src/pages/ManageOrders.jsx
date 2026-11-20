import { useCallback, useEffect, useState } from 'react';
import { ClipboardList, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import OrderDetails from '../components/OrderDetails';
import OrderStatusTracker from '../components/OrderStatusTracker';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import SearchBar from '../components/SearchBar';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { Spinner } from '../components/Loading';
import { fetchOrders, updateOrderStatus } from '../services/orderService';
import { getErrorMessage } from '../services/api';
import { ORDER_STATUSES, STATUS_TRANSITIONS } from '../utils/constants';
import { formatDateTime, formatPrice } from '../utils/helpers';
import useDebounce from '../utils/useDebounce';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const debounced = useDebounce(search);

  const load = useCallback((silent = false) => {
    if (!silent) { setLoading(true); setError(''); }
    fetchOrders({ status, search: debounced.trim(), limit: 200 })
      .then(setOrders)
      .catch((e) => { const m = getErrorMessage(e); if (m && !silent) setError(m); })
      .finally(() => { if (!silent) setLoading(false); });
  }, [status, debounced]);

  useEffect(() => { load(false); }, [load]);
  // quietly pick up new orders every 30 seconds
  useEffect(() => {
    const t = setInterval(() => { if (!document.hidden) load(true); }, 30000);
    return () => clearInterval(t);
  }, [load]);

  const changeStatus = async (next) => {
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(selected._id, next);
      setOrders((list) => list.map((o) => (o._id === updated._id ? updated : o)));
      setSelected(updated);
      toast.success(`Order ${updated.orderId} → ${next}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdating(false); setConfirmCancel(false);
    }
  };

  const nextOptions = selected ? STATUS_TRANSITIONS[selected.orderStatus] : [];

  return (
    <>
      <div className="admin-head">
        <div><h1>Orders</h1><p className="muted">Updates automatically every 30 seconds.</p></div>
        <button className="btn btn--outline btn--sm" onClick={() => load(false)}><RefreshCw size={15} /> Refresh</button>
      </div>

      <div className="filters">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by order ID, phone, name or table..." />
        <select className="input-select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="All">All statuses</option>{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <Spinner /> : error ? <ErrorMessage message={error} onRetry={() => load(false)} /> : orders.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No orders found" text="Orders placed by customers will appear here." />
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Phone</th><th>Table</th><th>Total</th><th>Status</th><th>Placed</th><th /></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td data-label="Order ID"><strong>{o.orderId}</strong></td>
                  <td data-label="Customer">{o.customerName}</td>
                  <td data-label="Phone">{o.phone}</td>
                  <td data-label="Table">{o.tableNumber}</td>
                  <td data-label="Total">{formatPrice(o.totalAmount)}</td>
                  <td data-label="Status"><StatusBadge status={o.orderStatus} /></td>
                  <td data-label="Placed">{formatDateTime(o.createdAt)}</td>
                  <td><button className="btn btn--outline btn--sm" onClick={() => setSelected(o)}><Eye size={15} /> View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <Modal title="Order details" onClose={() => !updating && setSelected(null)} size="lg">
          <OrderStatusTracker status={selected.orderStatus} />
          <OrderDetails order={selected} />
          <div className="status-actions">
            {nextOptions.length === 0 ? (
              <p className="muted">This order is {selected.orderStatus.toLowerCase()} - no further changes possible.</p>
            ) : (
              <>
                <span className="muted">Move to:</span>
                {nextOptions.map((next) => (
                  <button key={next} disabled={updating}
                    className={`btn btn--sm ${next === 'Cancelled' ? 'btn--danger-outline' : 'btn--primary'}`}
                    onClick={() => (next === 'Cancelled' ? setConfirmCancel(true) : changeStatus(next))}>
                    {next}
                  </button>
                ))}
              </>
            )}
          </div>
        </Modal>
      )}
      {confirmCancel && (
        <ConfirmDialog title="Cancel this order?" message={`Order ${selected.orderId} will be cancelled. This cannot be undone.`}
          confirmText="Yes, cancel order" loading={updating} onConfirm={() => changeStatus('Cancelled')} onCancel={() => setConfirmCancel(false)} />
      )}
    </>
  );
}
