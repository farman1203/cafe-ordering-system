import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PackageSearch, RefreshCw } from 'lucide-react';
import OrderDetails from '../components/OrderDetails';
import OrderStatusTracker from '../components/OrderStatusTracker';
import { Spinner } from '../components/Loading';
import { useSession } from '../context/SessionContext';
import useOrderPolling from '../utils/useOrderPolling';
import { isValidPhone, normalizePhone } from '../utils/helpers';

export default function OrderTracking() {
  const { orderId: paramId } = useParams();
  const { phone, lastOrder } = useSession();

  const [form, setForm] = useState({ orderId: paramId || lastOrder?.orderId || '', phone: phone || '' });
  const [errors, setErrors] = useState({});
  const [query, setQuery] = useState({ orderId: '', phone: '' }); // what we actually searched for
  const { order, loading, error, refresh } = useOrderPolling(query.orderId, query.phone);

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (form.orderId.trim().length < 6) errs.orderId = 'Enter your order ID (e.g. BB-241120-7K2Q)';
    if (!isValidPhone(form.phone)) errs.phone = 'Enter the 10-digit mobile number used for the order';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setQuery({ orderId: form.orderId.trim().toUpperCase(), phone: normalizePhone(form.phone) });
  };

  return (
    <div className="page container narrow">
      <div className="page__head"><h1>Track your order</h1><p className="muted">Enter your order ID and the phone number you ordered with.</p></div>
      <form className="card form-card" onSubmit={submit} noValidate>
        <label className="field"><span>Order ID</span>
          <input value={form.orderId} onChange={(e) => { setForm({ ...form, orderId: e.target.value.toUpperCase() }); setErrors({ ...errors, orderId: '' }); }} placeholder="BB-241120-7K2Q" maxLength={30} aria-invalid={!!errors.orderId} />
          {errors.orderId && <small className="field__error">{errors.orderId}</small>}
        </label>
        <label className="field"><span>Mobile number</span>
          <input type="tel" inputMode="numeric" value={form.phone} onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }} placeholder="98765 43210" maxLength={14} aria-invalid={!!errors.phone} />
          {errors.phone && <small className="field__error">{errors.phone}</small>}
        </label>
        <button className="btn btn--primary btn--block" type="submit" disabled={loading}>{loading ? 'Searching...' : 'Track order'}</button>
      </form>

      {loading && <Spinner label="Finding your order..." />}
      {error && !loading && (
        <div className="alert alert--error" role="alert"><PackageSearch size={18} /> {error}</div>
      )}
      {order && !loading && (
        <>
          <div className="card"><OrderStatusTracker status={order.orderStatus} /></div>
          <div className="card"><OrderDetails order={order} /></div>
          <div className="success__actions"><button className="btn btn--outline" onClick={refresh}><RefreshCw size={16} /> Refresh status</button></div>
        </>
      )}
    </div>
  );
}
